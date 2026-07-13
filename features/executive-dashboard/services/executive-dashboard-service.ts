import { executiveCaseWorklist, executiveDashboardMock } from "../data/executive-dashboard-mock";
import type {
  CasePriority,
  CaseWorklistItem,
  CreateReviewTaskInput,
  CreateReviewTaskResponse,
  DashboardFilters,
  ExecutiveCaseRequest,
  ExecutiveDashboardResponse,
  PaginatedResponse,
  SortKey,
} from "../types/executive-dashboard.types";

const priorityRank: Record<CasePriority, number> = { critical: 0, high: 1, normal: 2 };

export async function getExecutiveDashboard(
  filters: DashboardFilters,
): Promise<ExecutiveDashboardResponse> {
  void filters;
  // TODO: Replace with backend API once the executive dashboard endpoint exposes all analytical sections.
  return executiveDashboardMock;
}

export async function getExecutiveCases(
  request: ExecutiveCaseRequest,
): Promise<PaginatedResponse<CaseWorklistItem>> {
  const filtered = filterCases(executiveCaseWorklist, request.filters, request.search);
  const sorted = sortCases(filtered, request.sortKey, request.sortDirection);
  const totalPages = Math.max(1, Math.ceil(sorted.length / request.pageSize));
  const page = Math.min(request.page, totalPages);
  const start = (page - 1) * request.pageSize;

  return {
    items: sorted.slice(start, start + request.pageSize),
    page,
    pageSize: request.pageSize,
    total: sorted.length,
    totalPages,
  };
}

export async function createReviewTask(
  input: CreateReviewTaskInput,
): Promise<CreateReviewTaskResponse> {
  void input;
  return {
    taskId: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
    auditEventId: `AUD-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  void alertId;
  return Promise.resolve();
}

export async function dismissRecommendation(recommendationId: string, reason: string): Promise<void> {
  void recommendationId;
  void reason;
  return Promise.resolve();
}

export function filterCases(
  cases: CaseWorklistItem[],
  filters: DashboardFilters,
  search: string,
) {
  const query = search.trim().toLowerCase();

  return cases.filter((item) => {
    const searchable = [
      item.visitId,
      item.clinicName,
      item.departmentName,
      item.payerName,
      item.ownerName,
      item.riskReason,
      item.missingEvidence.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!filters.clinicId || item.clinicId === filters.clinicId) &&
      (!filters.departmentId || item.departmentId === filters.departmentId) &&
      (!filters.payerId || item.payerId === filters.payerId) &&
      (!filters.claimStatus || item.readinessStatus === filters.claimStatus) &&
      (!filters.riskLevel || item.riskLevel === filters.riskLevel) &&
      (!filters.missingEvidenceCategory ||
        item.missingEvidence.includes(filters.missingEvidenceCategory))
    );
  });
}

export function sortCases(
  cases: CaseWorklistItem[],
  sortKey: SortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...cases].sort((a, b) => {
    const result = compareCaseValue(a, b, sortKey);
    return result * multiplier;
  });
}

export function createCaseExportCsv(cases: CaseWorklistItem[]) {
  const headers = [
    "Visit ID",
    "Priority",
    "Clinic",
    "Department",
    "Payer",
    "Claim Value",
    "Readiness Score",
    "Readiness Status",
    "Missing Evidence",
    "Risk",
    "SLA",
    "Owner",
    "Last Updated",
    "Recommended Action",
  ];

  const rows = cases.map((item) => [
    item.visitId,
    item.priority,
    item.clinicName,
    item.departmentName,
    item.payerName,
    String(item.claimValue),
    String(item.readinessScore),
    item.readinessStatus,
    item.missingEvidence.join("; "),
    item.riskLevel,
    item.slaLabel,
    item.ownerName,
    item.updatedAt,
    item.recommendedAction,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function compareCaseValue(a: CaseWorklistItem, b: CaseWorklistItem, sortKey: SortKey) {
  if (sortKey === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
  if (sortKey === "updatedAt") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  if (sortKey === "visitId") return a.visitId.localeCompare(b.visitId);
  return a[sortKey] - b[sortKey];
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
