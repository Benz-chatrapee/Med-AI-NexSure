import "server-only";

import {
  resolveServerSessionContext,
  type AuthenticatedServerSessionContext,
  type ServerSessionContextResult,
} from "../../../lib/auth/server-session-context";

export type DoctorDashboardActor = Pick<
  AuthenticatedServerSessionContext,
  | "profileId"
  | "activeOrganizationId"
  | "authorizedOrganizationIds"
  | "activeClinicId"
  | "authorizedClinicIds"
  | "roles"
  | "permissions"
>;

export type DoctorDashboardActorResult =
  | { ok: true; value: DoctorDashboardActor; client: unknown }
  | { ok: false; code: "UNAUTHENTICATED" | "FORBIDDEN"; message: string };

export async function resolveDoctorDashboardActor(options?: {
  resolveSession?: () => Promise<ServerSessionContextResult>;
}): Promise<DoctorDashboardActorResult> {
  const session = await (options?.resolveSession ?? resolveServerSessionContext)();

  if (session.status === "unauthenticated" || session.status === "session_expired") {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Doctor dashboard requires an authenticated session.",
    };
  }

  if (session.status !== "authenticated") {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Doctor dashboard context could not be resolved safely.",
    };
  }

  return {
    ok: true,
    client: session.client,
    value: {
      profileId: session.context.profileId,
      activeOrganizationId: session.context.activeOrganizationId,
      authorizedOrganizationIds: session.context.authorizedOrganizationIds,
      activeClinicId: session.context.activeClinicId,
      authorizedClinicIds: session.context.authorizedClinicIds,
      roles: session.context.roles,
      permissions: session.context.permissions,
    },
  };
}
