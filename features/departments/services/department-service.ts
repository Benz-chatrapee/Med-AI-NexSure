import { buildDepartmentDashboard, casesMock, departmentsMock } from "../data/department-dashboard.mock";
import type { CreateDepartmentRequest, Department, DepartmentCase, DepartmentCaseWorklistParams, DepartmentDashboardFilters, DepartmentDashboardResponse, DepartmentListParams, PaginatedResponse } from "../types/department.types";

let departments = [...departmentsMock];

export interface DepartmentService {
  getDashboard(filters: DepartmentDashboardFilters): Promise<DepartmentDashboardResponse>;
  getDepartments(params: DepartmentListParams): Promise<PaginatedResponse<Department>>;
  getCaseWorklist(params: DepartmentCaseWorklistParams): Promise<PaginatedResponse<DepartmentCase>>;
  createDepartment(payload: CreateDepartmentRequest): Promise<Department>;
  exportDepartments(filters: DepartmentDashboardFilters): Promise<Blob>;
}

export const departmentService: DepartmentService = {
  async getDashboard(filters) {
    await wait();
    return buildDepartmentDashboard(filters);
  },
  async getDepartments(params) {
    await wait();
    const search = params.search?.trim().toLowerCase() ?? "";
    const filtered = departments
      .filter((item) => item.organizationId === params.filters.organizationId && item.clinicId === params.filters.clinicId)
      .filter((item) => params.filters.departmentType === "all" || item.type === params.filters.departmentType)
      .filter((item) => params.filters.departmentId === "all" || item.id === params.filters.departmentId)
      .filter((item) => params.status === "all" || !params.status || item.status === params.status)
      .filter((item) => params.type === "all" || !params.type || item.type === params.type)
      .filter((item) => !search || `${item.name} ${item.code} ${item.type} ${item.manager?.name ?? ""}`.toLowerCase().includes(search));
    const sorted = [...filtered].sort((a, b) => compare(a[params.sortBy ?? "name"], b[params.sortBy ?? "name"], params.sortDirection ?? "asc"));
    return paginate(sorted, params.page, params.pageSize);
  },
  async getCaseWorklist(params) {
    await wait();
    const search = params.search?.trim().toLowerCase() ?? "";
    const filtered = casesMock
      .filter((item) => params.filters.departmentId === "all" || item.departmentId === params.filters.departmentId)
      .filter((item) => params.readiness === "all" || !params.readiness || item.readinessStatus === params.readiness)
      .filter((item) => params.queue === "all" || !params.queue || item.queueStatus === params.queue)
      .filter((item) => params.costStatus === "all" || !params.costStatus || item.costStatus === params.costStatus)
      .filter((item) => params.slaStatus === "all" || !params.slaStatus || item.slaStatus === params.slaStatus)
      .filter((item) => params.aiAssisted === "all" || params.aiAssisted === undefined || item.aiAssisted === params.aiAssisted)
      .filter((item) => params.evidenceIssue === "all" || !params.evidenceIssue || item.missingEvidence.includes(params.evidenceIssue))
      .filter((item) => params.costBucket === "all" || !params.costBucket || item.costBucket === params.costBucket)
      .filter((item) => !search || `${item.visitId} ${item.patientMasked} ${item.departmentName} ${item.provider}`.toLowerCase().includes(search));
    return paginate(filtered, params.page, params.pageSize);
  },
  async createDepartment(payload) {
    await wait();
    if (payload.organizationId !== "org-nexsure" || payload.clinicId !== "clinic-bangkok") throw new Error("Unauthorized Organization or Clinic scope.");
    if (departments.some((department) => department.code.toLowerCase() === payload.code.toLowerCase())) throw new Error("Duplicate Department Code.");
    const department: Department = {
      id: `dept-${payload.code.toLowerCase()}`,
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
      name: payload.name,
      code: payload.code,
      type: payload.type,
      manager: payload.managerId ? { id: payload.managerId, name: managerName(payload.managerId), role: "Department Manager" } : null,
      userCount: 0,
      visitCount: 0,
      claimReadyPercentage: null,
      averageReadinessScore: null,
      pendingEvidenceCount: 0,
      overSlaCount: 0,
      averageWaitMinutes: null,
      costAlertCount: 0,
      status: payload.status,
      averageVisitCost: 0,
      costBenchmark: 0,
    };
    departments = [department, ...departments];
    return department;
  },
  async exportDepartments(filters) {
    await wait();
    const rows = departments.filter((item) => item.organizationId === filters.organizationId && item.clinicId === filters.clinicId);
    return new Blob([["Department,Code,Status,Visits,Claim Ready", ...rows.map((item) => `${item.name},${item.code},${item.status},${item.visitCount},${item.claimReadyPercentage ?? ""}`)].join("\n")], { type: "text/csv" });
  },
};

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

function managerName(managerId: string) {
  const names: Record<string, string> = { "mgr-1": "Dr. Anan S.", "mgr-2": "Dr. Benjawan R.", "mgr-4": "Krit P.", "mgr-5": "Mayuree L." };
  return names[managerId] ?? "Assigned Manager";
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 180));
}
