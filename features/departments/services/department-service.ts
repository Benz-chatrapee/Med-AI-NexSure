import { buildDepartmentDashboard, casesMock } from "../data/department-dashboard.mock";
import type { CreateDepartmentRequest, Department, DepartmentCase, DepartmentCaseWorklistParams, DepartmentDashboardFilters, DepartmentDashboardResponse, DepartmentListParams, PaginatedResponse } from "../types/department.types";
import { coreFoundationService, type CoreClinic } from "../../core-foundation/services/core-foundation-service";

export interface DepartmentService {
  getDashboard(filters: DepartmentDashboardFilters): Promise<DepartmentDashboardResponse>;
  getDepartments(params: DepartmentListParams): Promise<PaginatedResponse<Department>>;
  getCaseWorklist(params: DepartmentCaseWorklistParams): Promise<PaginatedResponse<DepartmentCase>>;
  createDepartment(payload: CreateDepartmentRequest): Promise<Department>;
  transitionClinicLifecycle(input: { clinicId: string; targetStatus: "active" | "suspended" | "closed" | "archived"; reason: string }): Promise<{ auditId: string; message: string }>;
  exportDepartments(filters: DepartmentDashboardFilters): Promise<Blob>;
}

export const departmentService: DepartmentService = {
  async getDashboard(filters) {
    const [base, departments, organizations, clinics] = await Promise.all([
      Promise.resolve(buildDepartmentDashboard(filters)),
      getVisibleDepartments(),
      coreFoundationService.listOrganizations(),
      coreFoundationService.listClinics(),
    ]);
    const organization = organizations.find((item) => item.id === filters.organizationId) ?? organizations[0];
    const clinic = clinics.find((item) => item.id === filters.clinicId) ?? clinics[0];
    const visibleDepartments = departments.filter((item) => {
      const orgMatches = !filters.organizationId || filters.organizationId === "all" || item.organizationId === filters.organizationId;
      const clinicMatches = !filters.clinicId || filters.clinicId === "all" || item.clinicId === filters.clinicId;
      return orgMatches && clinicMatches;
    });

    return {
      ...base,
      context: {
        ...base.context,
        organizationName: organization?.name ?? "No visible organization",
        clinicName: clinic?.name ?? "No visible clinic",
        lastUpdated: new Date().toISOString(),
        canCreateDepartment: false,
        dataScopeLabel: "Core Foundation RLS scope",
      },
      departments: visibleDepartments,
      cases: [],
      kpis: base.kpis.map((kpi) => {
        if (kpi.id === "active_departments") return { ...kpi, label: "Visible Clinics", value: String(visibleDepartments.length), helper: "Clinics visible through Core Foundation RLS" };
        if (kpi.id === "department_users") return { ...kpi, value: "0", helper: "User counts require Phase 2 domain aggregation" };
        if (kpi.id === "today_visits") return { ...kpi, value: "0", helper: "Visits are outside Phase 1 Core Foundation" };
        return kpi;
      }),
      activities: (await coreFoundationService.listAuditEvents(10)).map((event) => ({
        id: event.id,
        type: event.eventType.includes("role") ? "access" : "all",
        title: event.eventType,
        actor: event.actorProfileId ?? "System",
        role: "Core Foundation",
        source: event.resourceType,
        correlationId: event.correlationId ?? undefined,
        severity: event.outcome === "blocked" ? "critical" : event.outcome === "warning" ? "warning" : "info",
        time: event.occurredAt,
      })),
    };
  },

  async getDepartments(params) {
    const departments = await getVisibleDepartments();
    const search = params.search?.trim().toLowerCase() ?? "";
    const filtered = departments
      .filter((item) => !params.filters.organizationId || params.filters.organizationId === "all" || item.organizationId === params.filters.organizationId)
      .filter((item) => !params.filters.clinicId || params.filters.clinicId === "all" || item.clinicId === params.filters.clinicId)
      .filter((item) => params.filters.departmentType === "all" || item.type === params.filters.departmentType)
      .filter((item) => params.filters.departmentId === "all" || item.id === params.filters.departmentId)
      .filter((item) => params.status === "all" || !params.status || item.status === params.status)
      .filter((item) => params.type === "all" || !params.type || item.type === params.type)
      .filter((item) => !search || `${item.name} ${item.code} ${item.type} ${item.manager?.name ?? ""}`.toLowerCase().includes(search));
    const sorted = [...filtered].sort((a, b) => compare(a[params.sortBy ?? "name"], b[params.sortBy ?? "name"], params.sortDirection ?? "asc"));
    return paginate(sorted, params.page, params.pageSize);
  },

  async getCaseWorklist(params) {
    const filtered = casesMock.filter((item) => params.filters.departmentId !== "all" && item.departmentId === params.filters.departmentId);
    return paginate(filtered, params.page, params.pageSize);
  },

  async createDepartment(_payload) {
    throw new Error("Department creation is not part of Phase 1 Core Foundation. Visible rows are clinics protected by RLS.");
  },

  async transitionClinicLifecycle(input) {
    const auditId = await coreFoundationService.transitionClinicLifecycle(input);
    return { auditId, message: `Clinic lifecycle changed to ${input.targetStatus}.` };
  },

  async exportDepartments(filters) {
    const rows = (await getVisibleDepartments()).filter((item) => item.organizationId === filters.organizationId || filters.organizationId === "all");
    return new Blob([["Clinic,Code,Status,Type", ...rows.map((item) => `${item.name},${item.code},${item.status},${item.type}`)].join("\n")], { type: "text/csv" });
  },
};

async function getVisibleDepartments(): Promise<Department[]> {
  return (await coreFoundationService.listClinics()).map(mapClinicToDepartment);
}

function mapClinicToDepartment(clinic: CoreClinic): Department {
  return {
    id: clinic.id,
    organizationId: clinic.organizationId,
    clinicId: clinic.id,
    name: clinic.name,
    code: clinic.code ?? clinic.id.slice(0, 8),
    type: mapClinicType(clinic.clinicType),
    manager: null,
    userCount: 0,
    visitCount: 0,
    claimReadyPercentage: null,
    averageReadinessScore: null,
    pendingEvidenceCount: 0,
    overSlaCount: 0,
    averageWaitMinutes: null,
    costAlertCount: 0,
    status: clinic.lifecycleStatus === "archived" ? "archived" : clinic.isActive ? "active" : "inactive",
    averageVisitCost: 0,
    costBenchmark: 0,
  };
}

function mapClinicType(value: string | null) {
  if (value === "diagnostic" || value === "operational") return value;
  return "clinical";
}

function paginate<T>(rows: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total: rows.length, page: safePage, pageSize, totalPages };
}

function compare(left: string | number | null | object, right: string | number | null | object, direction: "asc" | "desc") {
  const a = typeof left === "number" ? left : String(left ?? "");
  const b = typeof right === "number" ? right : String(right ?? "");
  const result = a > b ? 1 : a < b ? -1 : 0;
  return direction === "asc" ? result : -result;
}
