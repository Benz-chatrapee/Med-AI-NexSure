import { DoctorDashboardPage } from "@/features/doctor-dashboard/components/doctor-dashboard-page";
import { emptyDoctorDashboardFilters } from "@/features/doctor-dashboard/domain/validation";
import { buildDoctorDashboardProjection, buildVisitReadinessDetail } from "@/features/doctor-dashboard/server/repository";
import { exportDoctorDashboard, getDoctorDashboard } from "@/features/doctor-dashboard/server/service";
import type { DoctorDashboardFilters } from "@/features/doctor-dashboard/types/doctor-dashboard.types";
import type { ExportResult } from "@/features/doctor-dashboard/types/doctor-dashboard.types";

export default async function Dashboard() {
  const result = await getDoctorDashboard({});
  const initialData = result.data ?? buildDoctorDashboardProjection({
    generatedAt: new Date(),
    actor: {
      displayName: "Authenticated Doctor",
      organizationName: "Unavailable",
      clinicName: "Unavailable",
    },
    visits: [],
  });

  async function refreshDashboard(filters: DoctorDashboardFilters) {
    "use server";
    const refreshed = await getDoctorDashboard(toDashboardInput(filters));
    if (!refreshed.success || !refreshed.data) {
      throw new Error(refreshed.error?.message ?? "Doctor dashboard data could not be loaded safely.");
    }
    return refreshed.data;
  }

  async function getVisitReadiness(visitId: string, filters: DoctorDashboardFilters) {
    "use server";
    const refreshed = await getDoctorDashboard(toDashboardInput(filters));
    if (!refreshed.success || !refreshed.data) {
      throw new Error(refreshed.error?.message ?? "Visit readiness could not be loaded safely.");
    }
    const detail = buildVisitReadinessDetail(refreshed.data, visitId);
    return detail;
  }

  async function exportSummary(filters: DoctorDashboardFilters) {
    "use server";
    const exported = await exportDoctorDashboard({ ...emptyDoctorDashboardFilters(), ...filters });
    if (!exported.success || !exported.data) {
      throw new Error(exported.error?.message ?? "Doctor dashboard export could not be generated safely.");
    }
    return exported.data as ExportResult;
  }

  return (
    <DoctorDashboardPage
      initialData={initialData}
      actions={{
        refreshDashboard,
        getVisitReadiness,
        exportSummary,
      }}
    />
  );
}

function toDashboardInput(filters: DoctorDashboardFilters): Record<string, string> {
  return {
    dateRange: filters.dateRange,
    clinic: filters.clinic,
    department: filters.department,
    doctor: filters.doctor,
    search: filters.search,
    readinessStatus: filters.readinessStatus,
    riskLevel: filters.riskLevel,
    visitStatus: filters.visitStatus,
    priority: filters.priority,
    gapType: filters.gapType,
  };
}
