import { createSupabaseBrowserClient } from "../../../lib/auth/supabase-browser";
import type { Database } from "../../../lib/database.types";
import type { ClinicUser, ClinicUserAuditEvent, ClinicUserRole } from "../../user-management/types/user-management.types";

type TableName = keyof Database["public"]["Tables"];
type RpcName = keyof Database["public"]["Functions"];

type QueryResult<T> = { data: T[] | null; error: CoreFoundationDbError | null };
type SingleResult<T> = { data: T | null; error: CoreFoundationDbError | null };

type SelectQuery<T> = PromiseLike<QueryResult<T>> & {
  order(column: string, options?: { ascending?: boolean }): SelectQuery<T>;
  limit(count: number): SelectQuery<T>;
  eq(column: string, value: string): SelectQuery<T>;
  single(): PromiseLike<SingleResult<T>>;
};

type QueryBuilder<T> = {
  select(columns?: string): SelectQuery<T>;
};

export type CoreFoundationClient = {
  from<T = unknown>(table: TableName | string): QueryBuilder<T>;
  rpc<T = unknown>(
    fn: RpcName | string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: T | null;
    error: CoreFoundationDbError | null;
  }>;
};

export type CoreFoundationDbError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export type CoreOrganization = {
  id: string;
  name: string;
  code: string | null;
  organizationType: string | null;
  lifecycleStatus: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type CoreClinic = {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  clinicType: string | null;
  lifecycleStatus: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type CoreRole = {
  id: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  isSystemRole: boolean;
};

export type CoreRoleAssignment = {
  id: string;
  organizationId: string;
  clinicId: string | null;
  userProfileId: string;
  roleId: string;
  status: string;
  reason: string | null;
  assignedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
};

export type CoreAuditEvent = {
  id: string;
  organizationId: string | null;
  clinicId: string | null;
  actorProfileId: string | null;
  eventType: string;
  resourceType: string;
  resourceId: string | null;
  reason: string | null;
  outcome: string | null;
  occurredAt: string;
  correlationId: string | null;
};

type ProfileRow = {
  id: string;
  organization_id: string;
  primary_clinic_id: string | null;
  display_name: string | null;
  email: string | null;
  job_title: string | null;
  department: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type ClinicRow = {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  clinic_type: string | null;
  lifecycle_status: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type OrganizationRow = {
  id: string;
  name: string;
  code: string | null;
  organization_type: string | null;
  lifecycle_status: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type RoleRow = {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  is_system_role: boolean | null;
};

type RoleAssignmentRow = {
  id: string;
  organization_id: string;
  clinic_id: string | null;
  user_profile_id: string;
  role_id: string;
  assignment_status: string | null;
  assignment_reason: string | null;
  assigned_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

type AuditRow = {
  id: string;
  organization_id?: string | null;
  clinic_id?: string | null;
  actor_profile_id: string | null;
  event_type: string;
  resource_type: string;
  resource_id: string | null;
  reason: string | null;
  outcome: string | null;
  occurred_at: string | null;
  correlation_id: string | null;
};

const ROLE_FALLBACK: ClinicUserRole = "clinic_staff";
const SUPPORTED_ROLES: ClinicUserRole[] = [
  "system_admin",
  "organization_admin",
  "clinic_admin",
  "clinic_manager",
  "doctor",
  "nurse",
  "pharmacist",
  "clinic_staff",
  "claim_reviewer",
  "auditor_compliance",
  "compliance_officer",
  "executive",
];

export function createCoreFoundationService(
  client: CoreFoundationClient | null =
    createSupabaseBrowserClient() as unknown as CoreFoundationClient | null,
) {
  return {
    async listOrganizations(): Promise<CoreOrganization[]> {
      const result = await ensureClient(client)
        .from<OrganizationRow>("organizations")
        .select("id,name,code,organization_type,lifecycle_status,is_active,updated_at")
        .order("name");
      return unwrap(result).map(mapOrganization);
    },

    async listClinics(): Promise<CoreClinic[]> {
      const result = await ensureClient(client)
        .from<ClinicRow>("clinics")
        .select("id,organization_id,name,code,clinic_type,lifecycle_status,is_active,updated_at")
        .order("name");
      return unwrap(result).map(mapClinic);
    },

    async listRoles(): Promise<CoreRole[]> {
      const result = await ensureClient(client).from<RoleRow>("roles").select("id,organization_id,name,description,is_system_role").order("name");
      return unwrap(result).map(mapRole);
    },

    async listRoleAssignments(): Promise<CoreRoleAssignment[]> {
      const result = await ensureClient(client)
        .from<RoleAssignmentRow>("user_role_assignments")
        .select("id,organization_id,clinic_id,user_profile_id,role_id,assignment_status,assignment_reason,assigned_at,expires_at,revoked_at")
        .order("assigned_at", { ascending: false });
      return unwrap(result).map(mapRoleAssignment);
    },

    async listAuditEvents(limit = 25): Promise<CoreAuditEvent[]> {
      const result = await ensureClient(client)
        .from<AuditRow>("audit_logs")
        .select("id,organization_id,clinic_id,actor_profile_id,event_type,resource_type,resource_id,reason,outcome,occurred_at,correlation_id")
        .order("occurred_at", { ascending: false })
        .limit(limit);
      return unwrap(result).map(mapAuditEvent);
    },

    async getAuditEventById(auditId: string): Promise<CoreAuditEvent | null> {
      const result = await ensureClient(client)
        .from<AuditRow>("audit_logs")
        .select("id,organization_id,clinic_id,actor_profile_id,event_type,resource_type,resource_id,reason,outcome,occurred_at,correlation_id")
        .eq("id", auditId)
        .single();
      if (result.error?.code === "PGRST116") return null;

      const row = unwrapSingle(result);

      if (!row) {
        return null;
      }

      return mapAuditEvent(row);
    },

    async listClinicUsers(): Promise<ClinicUser[]> {
      const [profiles, clinics, roles, assignments, audits] = await Promise.all([
        readRows<ProfileRow>(ensureClient(client), "user_profiles", "id,organization_id,primary_clinic_id,display_name,email,job_title,department,is_active,created_at,updated_at"),
        this.listClinics(),
        this.listRoles(),
        this.listRoleAssignments(),
        this.listAuditEvents(50),
      ]);
      return profiles.map((profile) => mapClinicUser(profile, clinics, roles, assignments, audits));
    },

    async getClinicUserById(userId: string): Promise<ClinicUser | null> {
      const users = await this.listClinicUsers();
      return users.find((user) => user.id === userId) ?? null;
    },

    async assignRole(input: { organizationId: string; clinicId: string; targetProfileId: string; roleId: string; reason: string; effectiveAt?: string; expiresAt?: string }): Promise<string> {
      if (!input.reason.trim()) throw new Error("Change reason is required.");
      const result = await ensureClient(client).rpc<string>("assign_role", {
        p_organization_id: input.organizationId,
        p_clinic_id: input.clinicId,
        p_target_profile_id: input.targetProfileId,
        p_role_id: input.roleId,
        p_reason: input.reason,
        ...(input.effectiveAt ? { p_effective_at: input.effectiveAt } : {}),
        ...(input.expiresAt ? { p_expires_at: input.expiresAt } : {}),
      });
      if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
      return result.data ?? "role-assignment-audit";
    },

    async revokeRoleAssignment(input: { assignmentId: string; reason: string }): Promise<string> {
      if (!input.reason.trim()) throw new Error("Change reason is required.");
      const result = await ensureClient(client).rpc<string>("revoke_role_assignment", { p_assignment_id: input.assignmentId, p_reason: input.reason });
      if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
      return result.data ?? "role-revocation-audit";
    },

    async transitionOrganizationLifecycle(input: { organizationId: string; targetStatus: string; reason: string }): Promise<string> {
      if (!input.reason.trim()) throw new Error("Change reason is required.");
      const result = await ensureClient(client).rpc<string>("transition_organization_lifecycle", {
        p_organization_id: input.organizationId,
        p_target_status: input.targetStatus,
        p_reason: input.reason,
      });
      if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
      return result.data ?? "organization-lifecycle-audit";
    },

    async transitionClinicLifecycle(input: { clinicId: string; targetStatus: string; reason: string }): Promise<string> {
      if (!input.reason.trim()) throw new Error("Change reason is required.");
      const result = await ensureClient(client).rpc<string>("transition_clinic_lifecycle", {
        p_clinic_id: input.clinicId,
        p_target_status: input.targetStatus,
        p_reason: input.reason,
      });
      if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
      return result.data ?? "clinic-lifecycle-audit";
    },
  };
}

export const coreFoundationService = createCoreFoundationService();

export function sanitizeCoreFoundationError(error: CoreFoundationDbError | null | undefined) {
  const code = error?.code ?? "";
  const message = error?.message ?? "Core Foundation request failed.";
  const lower = message.toLowerCase();
  if (code === "42501" || code === "401" || code === "403" || lower.includes("permission") || lower.includes("row-level security") || lower.includes("rls")) {
    return "You do not have permission for this Core Foundation action. กรุณาตรวจสอบสิทธิ์องค์กร/คลินิกของคุณ";
  }
  if (code === "PGRST116") return "Record not found or not visible in your current organization scope.";
  return message;
}

async function readRows<T>(client: CoreFoundationClient, table: TableName | string, columns: string): Promise<T[]> {
  const result = await client.from<T>(table).select(columns);
  return unwrap(result);
}

function ensureClient(client: CoreFoundationClient | null): CoreFoundationClient {
  if (!client) throw new Error("Local Supabase is not configured. กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return client;
}

function unwrap<T>(result: QueryResult<T>): T[] {
  if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
  return result.data ?? [];
}

function unwrapSingle<T>(result: SingleResult<T>): T | null {
  if (result.error) throw new Error(sanitizeCoreFoundationError(result.error));
  return result.data ?? null;
}

function mapOrganization(row: OrganizationRow): CoreOrganization {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    organizationType: row.organization_type,
    lifecycleStatus: row.lifecycle_status ?? "active",
    isActive: row.is_active ?? true,
    updatedAt: row.updated_at,
  };
}

function mapClinic(row: ClinicRow): CoreClinic {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    code: row.code,
    clinicType: row.clinic_type,
    lifecycleStatus: row.lifecycle_status ?? "active",
    isActive: row.is_active ?? true,
    updatedAt: row.updated_at,
  };
}

function mapRole(row: RoleRow): CoreRole {
  return { id: row.id, organizationId: row.organization_id, name: row.name, description: row.description, isSystemRole: row.is_system_role ?? false };
}

function mapRoleAssignment(row: RoleAssignmentRow): CoreRoleAssignment {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clinicId: row.clinic_id,
    userProfileId: row.user_profile_id,
    roleId: row.role_id,
    status: row.assignment_status ?? "active",
    reason: row.assignment_reason,
    assignedAt: row.assigned_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

function mapAuditEvent(row: AuditRow): CoreAuditEvent {
  return {
    id: row.id,
    organizationId: row.organization_id ?? null,
    clinicId: row.clinic_id ?? null,
    actorProfileId: row.actor_profile_id,
    eventType: row.event_type,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    reason: row.reason,
    outcome: row.outcome,
    occurredAt: row.occurred_at ?? new Date(0).toISOString(),
    correlationId: row.correlation_id,
  };
}

function mapClinicUser(profile: ProfileRow, clinics: CoreClinic[], roles: CoreRole[], assignments: CoreRoleAssignment[], audits: CoreAuditEvent[]): ClinicUser {
  const activeAssignments = assignments.filter((assignment) => assignment.userProfileId === profile.id && assignment.status === "active" && !assignment.revokedAt);
  const roleNames = activeAssignments.map((assignment) => normalizeRole(roles.find((role) => role.id === assignment.roleId)?.name)).filter((role): role is ClinicUserRole => Boolean(role));
  const primaryRole = roleNames[0] ?? ROLE_FALLBACK;
  const clinic = clinics.find((item) => item.id === profile.primary_clinic_id) ?? clinics.find((item) => item.organizationId === profile.organization_id);
  const userAudits = audits.filter((event) => event.actorProfileId === profile.id || event.resourceId === profile.id || activeAssignments.some((assignment) => assignment.id === event.resourceId));

  return {
    id: profile.id,
    fullName: profile.display_name ?? profile.email ?? "Unnamed User",
    initials: getInitials(profile.display_name ?? profile.email ?? "User"),
    employeeId: profile.id.slice(0, 8),
    email: profile.email ?? "email-not-visible@example.invalid",
    jobTitle: profile.job_title ?? undefined,
    primaryRole,
    additionalRoles: roleNames.filter((role, index) => index > 0 && role !== primaryRole),
    departmentId: profile.department ?? undefined,
    departmentName: profile.department ?? "Unassigned",
    clinicScopes: clinic
      ? [{ clinicId: clinic.id, clinicName: clinic.name, departmentIds: profile.department ? [profile.department] : [], dataAccessLevel: "assigned_clinic" }]
      : [],
    aiAccessStatus: "restricted",
    aiAccessLevel: "view_only",
    aiPermissions: {
      viewAiSummary: true,
      generateSoapDraft: false,
      viewIcdSuggestions: true,
      acceptAiRecommendation: false,
      overrideAiWarning: false,
    },
    status: profile.is_active === false ? "inactive" : "active",
    mfaEnabled: false,
    createdAt: profile.created_at ?? new Date(0).toISOString(),
    updatedAt: profile.updated_at ?? profile.created_at ?? new Date(0).toISOString(),
    security: {
      failedAttempts: 0,
      activeSessions: 0,
      currentSession: "Session details not exposed by Core Foundation",
      browserDevice: "Protected",
      location: "Protected",
      maskedIpAddress: "Masked",
      mfaVerified: false,
    },
    auditTrail: userAudits.map(mapUserAuditEvent),
  };
}

function mapUserAuditEvent(event: CoreAuditEvent): ClinicUserAuditEvent {
  return {
    id: event.id,
    event: event.eventType,
    actor: event.actorProfileId ?? "System",
    occurredAt: event.occurredAt,
    reason: event.reason ?? "No reason recorded",
    source: event.resourceType,
    result: event.outcome === "blocked" ? "blocked" : event.outcome === "warning" ? "warning" : "success",
  };
}

function normalizeRole(roleName?: string | null): ClinicUserRole | null {
  if (!roleName) return null;
  const normalized = roleName.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
  return SUPPORTED_ROLES.includes(normalized as ClinicUserRole) ? (normalized as ClinicUserRole) : null;
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "CU";
}