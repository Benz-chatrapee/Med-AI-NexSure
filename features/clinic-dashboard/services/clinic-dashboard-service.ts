import { clinicDashboardMock } from "../data/clinic-dashboard.mock";
import type { ClinicDashboardData, ClinicDashboardFilters } from "../types/clinic-dashboard.types";

export async function getClinicDashboard(filters?: Partial<ClinicDashboardFilters>): Promise<ClinicDashboardData> {
  return {
    ...clinicDashboardMock,
    filters: {
      ...clinicDashboardMock.filters,
      ...filters,
    },
  };
}

export function buildAlertAuditPayload(alertId: string, actor: string) {
  return {
    module: "clinic_dashboard",
    action: "alert_acknowledged",
    entityId: alertId,
    actor,
    reason: "Dashboard alert reviewed by authorized staff.",
    before: { acknowledged: false },
    after: { acknowledged: true },
    timestamp: new Date().toISOString(),
  };
}
