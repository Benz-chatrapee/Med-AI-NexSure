import type {
  ExecutiveDashboardActor,
  ExecutiveDashboardFilters,
  ExecutiveDashboardPermission,
} from "../domain/types";
import { ExecutiveDashboardError } from "./errors";

export function requireDashboardPermission(
  actor: ExecutiveDashboardActor,
  permission: ExecutiveDashboardPermission,
) {
  if (!actor.permissions.includes(permission)) {
    throw new ExecutiveDashboardError(
      "forbidden",
      "The current actor is not authorized for this dashboard action.",
    );
  }
}

export function requireDashboardScope(
  actor: ExecutiveDashboardActor,
  filters: ExecutiveDashboardFilters,
) {
  if (!actor.organizationIds.includes(filters.organizationId)) {
    throw new ExecutiveDashboardError(
      "tenant_scope_mismatch",
      "Organization is outside the authorized scope.",
    );
  }

  if (filters.clinicId !== "all" && !actor.clinicIds.includes(filters.clinicId)) {
    throw new ExecutiveDashboardError(
      "tenant_scope_mismatch",
      "Clinic is outside the authorized scope.",
    );
  }
}

export function allowedClinicIds(
  actor: ExecutiveDashboardActor,
  filters: ExecutiveDashboardFilters,
) {
  if (filters.clinicId === "all") return actor.clinicIds;
  return actor.clinicIds.includes(filters.clinicId) ? [filters.clinicId] : [];
}
