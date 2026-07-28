import "server-only";

import { createSupabaseServerClient } from "./supabase-server";

type SessionUser = {
  id: string;
};

type SupabaseAuthUserResult = {
  data: {
    user: SessionUser | null;
  };
  error: { message?: string; status?: number } | null;
};

type QueryResult<T> = {
  data: T | null;
  error: { message?: string } | null;
};

type QueryListResult<T> = {
  data: T[] | null;
  error: { message?: string } | null;
};

type QueryBuilder<T> = {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: string | boolean): QueryBuilder<T>;
  is(column: string, value: null): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResult<T>>;
};

type QueryListBuilder<T> = {
  select(columns?: string): QueryListBuilder<T>;
  eq(column: string, value: string | boolean): QueryListBuilder<T>;
  is(column: string, value: null): QueryListBuilder<T>;
  in(column: string, values: string[]): QueryListBuilder<T>;
  or(filters: string): QueryListBuilder<T>;
  returns(): Promise<QueryListResult<T>>;
};

export type ServerSessionContextClient = {
  auth: {
    getUser(): Promise<SupabaseAuthUserResult>;
  };
  from(table: "user_profiles"): QueryBuilder<UserProfileRow>;
  from(table: "organization_memberships"): QueryListBuilder<OrganizationMembershipRow>;
  from(table: "clinic_memberships"): QueryListBuilder<ClinicMembershipRow>;
  from(table: "user_role_assignments"): QueryListBuilder<UserRoleAssignmentRow>;
};

type UserProfileRow = {
  id: string;
  organization_id: string;
  primary_clinic_id: string | null;
  is_active: boolean;
  deleted_at: string | null;
};

type OrganizationMembershipRow = {
  organization_id: string;
  is_active: boolean;
  membership_status: string;
  deleted_at: string | null;
};

type ClinicMembershipRow = {
  clinic_id: string;
  organization_id: string;
  is_active: boolean;
  membership_status: string;
  deleted_at: string | null;
};

type UserRoleAssignmentRow = {
  organization_id: string;
  clinic_id: string | null;
  is_active: boolean;
  assignment_status: string;
  revoked_at: string | null;
  expires_at: string | null;
  roles: {
    name: string;
    role_permissions:
      | {
          permissions: {
            permission_key: string;
          } | null;
        }[]
      | null;
  } | null;
};

export type RequestedServerSessionScope = {
  organizationId?: string;
  clinicId?: string;
  userId?: string;
  role?: string;
  permissions?: string[];
};

export type AuthenticatedServerSessionContext = {
  authUserId: string;
  profileId: string;
  activeOrganizationId: string;
  authorizedOrganizationIds: string[];
  activeClinicId: string | null;
  authorizedClinicIds: string[];
  roles: string[];
  permissions: string[];
  sessionState: "authenticated";
  sessionExpiresAt: string | null;
};

export type ServerSessionContextResult =
  | {
      status: "authenticated";
      context: AuthenticatedServerSessionContext;
      client: ServerSessionContextClient;
    }
  | {
      status:
        | "unauthenticated"
        | "session_expired"
        | "forbidden"
        | "configuration_error";
      reason: string;
    };

export async function resolveServerSessionContext(options?: {
  client?: ServerSessionContextClient;
  requestedScope?: RequestedServerSessionScope;
  now?: Date;
}): Promise<ServerSessionContextResult> {
  const clientResult = options?.client
    ? ({ status: "configured", client: options.client } as const)
    : await createSupabaseServerClient();

  if (clientResult.status !== "configured") {
    return { status: "configuration_error", reason: clientResult.reason };
  }

  const client = clientResult.client as ServerSessionContextClient;
  const userResult = await client.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return { status: "unauthenticated", reason: "missing_or_invalid_session" };
  }

  const authUserId = userResult.data.user.id;
  const profileResult = await client
    .from("user_profiles")
    .select("id, organization_id, primary_clinic_id, is_active, deleted_at")
    .eq("id", authUserId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return { status: "forbidden", reason: "missing_or_inactive_profile" };
  }

  const profile = profileResult.data;
  const organizationMembershipsResult = await client
    .from("organization_memberships")
    .select("organization_id, is_active, membership_status, deleted_at")
    .eq("user_profile_id", profile.id)
    .eq("is_active", true)
    .eq("membership_status", "active")
    .is("deleted_at", null)
    .returns();

  if (organizationMembershipsResult.error || !organizationMembershipsResult.data) {
    return { status: "forbidden", reason: "organization_membership_unavailable" };
  }

  const authorizedOrganizationIds = uniqueStrings(
    organizationMembershipsResult.data.map((membership) => membership.organization_id),
  );

  const requestedOrganizationId = options?.requestedScope?.organizationId;
  const activeOrganizationId = requestedOrganizationId ?? profile.organization_id;

  if (!authorizedOrganizationIds.includes(activeOrganizationId)) {
    return { status: "forbidden", reason: "unauthorized_organization" };
  }

  const clinicMembershipsResult = await client
    .from("clinic_memberships")
    .select("clinic_id, organization_id, is_active, membership_status, deleted_at")
    .eq("user_profile_id", profile.id)
    .eq("organization_id", activeOrganizationId)
    .eq("is_active", true)
    .eq("membership_status", "active")
    .is("deleted_at", null)
    .returns();

  if (clinicMembershipsResult.error || !clinicMembershipsResult.data) {
    return { status: "forbidden", reason: "clinic_membership_unavailable" };
  }

  const authorizedClinicIds = uniqueStrings(
    clinicMembershipsResult.data.map((membership) => membership.clinic_id),
  );
  const requestedClinicId = options?.requestedScope?.clinicId;
  const activeClinicId = requestedClinicId ?? profile.primary_clinic_id;

  if (activeClinicId && !authorizedClinicIds.includes(activeClinicId)) {
    return { status: "forbidden", reason: "unauthorized_clinic" };
  }

  const rolesResult = await client
    .from("user_role_assignments")
    .select("organization_id, clinic_id, is_active, assignment_status, revoked_at, expires_at, roles(name, role_permissions(permissions(permission_key)))")
    .eq("user_profile_id", profile.id)
    .eq("organization_id", activeOrganizationId)
    .eq("is_active", true)
    .eq("assignment_status", "active")
    .is("revoked_at", null)
    .or(`clinic_id.is.null,clinic_id.eq.${activeClinicId ?? ""}`)
    .returns();

  if (rolesResult.error || !rolesResult.data) {
    return { status: "forbidden", reason: "role_assignments_unavailable" };
  }

  const now = options?.now ?? new Date();
  const activeAssignments = rolesResult.data.filter((assignment) => {
    if (!assignment.expires_at) {
      return true;
    }

    return new Date(assignment.expires_at).getTime() > now.getTime();
  });

  if (activeAssignments.length !== rolesResult.data.length) {
    return { status: "session_expired", reason: "expired_role_assignment" };
  }

  const roles = uniqueStrings(
    activeAssignments
      .map((assignment) => assignment.roles?.name)
      .filter((role): role is string => Boolean(role)),
  );
  const permissions = uniqueStrings(
    activeAssignments.flatMap((assignment) =>
      (assignment.roles?.role_permissions ?? [])
        .map((rolePermission) => rolePermission.permissions?.permission_key)
        .filter((permission): permission is string => Boolean(permission)),
    ),
  );

  return {
    status: "authenticated",
    client,
    context: {
      authUserId,
      profileId: profile.id,
      activeOrganizationId,
      authorizedOrganizationIds,
      activeClinicId,
      authorizedClinicIds,
      roles,
      permissions,
      sessionState: "authenticated",
      sessionExpiresAt: null,
    },
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}
