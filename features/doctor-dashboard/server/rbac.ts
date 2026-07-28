import type { DoctorDashboardActor } from "./identity";
import { DoctorDashboardError } from "./errors";

const readPermissions = ["doctorDashboard.view", "visit.view"] as const;
const claimReadPermissions = ["claim.view", "claim.read"] as const;

export function requireDoctorDashboardReadPermission(actor: DoctorDashboardActor) {
  const canReadVisits = readPermissions.some((permission) => actor.permissions.includes(permission));
  const canReadClaims = claimReadPermissions.some((permission) => actor.permissions.includes(permission));

  if (!canReadVisits || !canReadClaims) {
    throw new DoctorDashboardError(
      "FORBIDDEN",
      "The current actor is not authorized for Doctor Dashboard reads.",
    );
  }
}

export function requireDoctorDashboardScope(actor: DoctorDashboardActor, filters: { clinic: string }) {
  if (filters.clinic && !actor.authorizedClinicIds.includes(filters.clinic)) {
    throw new DoctorDashboardError(
      "TENANT_SCOPE_MISMATCH",
      "Clinic is outside the authorized Doctor Dashboard scope.",
    );
  }
}

export function allowedClinicIds(actor: DoctorDashboardActor, requestedClinicId: string) {
  if (requestedClinicId) return [requestedClinicId];
  if (actor.activeClinicId) return [actor.activeClinicId];
  return actor.authorizedClinicIds;
}
