import type { LucideIcon } from "lucide-react";

export type DepartmentType = "clinical" | "diagnostic" | "operational";
export type DepartmentStatus = "active" | "inactive" | "archived";
export type ClaimReadinessStatus = "ready" | "needs_review" | "not_ready";
export type CostStatus = "normal" | "cost_alert";
export type SlaStatus = "within_sla" | "approaching" | "breached";
export type QueueStatus = "completed" | "in_consultation" | "pending_evidence" | "waiting" | "pharmacy";
export type Severity = "critical" | "warning" | "info" | "success";

export interface DepartmentManager { id: string; name: string; role: string }
export interface Department {
  id: string; organizationId: string; clinicId: string; name: string; code: string; type: DepartmentType;
  manager: DepartmentManager | null; userCount: number; visitCount: number; claimReadyPercentage: number | null;
  averageReadinessScore: number | null; pendingEvidenceCount: number; overSlaCount: number; averageWaitMinutes: number | null;
  costAlertCount: number; status: DepartmentStatus; averageVisitCost: number; costBenchmark: number;
}
export interface DepartmentDashboardFilters {
  organizationId: string; clinicId: string; dateRange: "today" | "yesterday" | "last_7_days" | "last_30_days" | "this_month" | "custom";
  departmentType: DepartmentType | "all"; departmentId: string | "all"; comparisonPeriod: "previous_day" | "previous_period" | "previous_week" | "previous_month";
}
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number }
export interface DepartmentListParams {
  filters: DepartmentDashboardFilters; search?: string; status?: DepartmentStatus | "all"; type?: DepartmentType | "all";
  sortBy?: keyof Department; sortDirection?: "asc" | "desc"; page: number; pageSize: number;
}
export interface DepartmentCaseWorklistParams {
  filters: DepartmentDashboardFilters; search?: string; readiness?: ClaimReadinessStatus | "all"; queue?: QueueStatus | "all";
  costStatus?: CostStatus | "all"; evidenceIssue?: string | "all"; slaStatus?: SlaStatus | "all"; aiAssisted?: boolean | "all";
  costBucket?: string | "all"; page: number; pageSize: number;
}
export interface DepartmentCase {
  id: string; visitId: string; patientMasked: string; departmentId: string; departmentName: string; visitDate: string; provider: string;
  queueStatus: QueueStatus; aiAssisted: boolean; readinessScore: number; readinessStatus: ClaimReadinessStatus;
  claimStatus: "draft" | "needs_review" | "ready_for_submission" | "submitted"; missingEvidence: string[];
  evidenceAgingHours: number; costStatus: CostStatus; costBucket: string; slaStatus: SlaStatus; lastUpdated: string;
}
export interface DepartmentKpi {
  id: "active_departments" | "department_users" | "today_visits" | "claim_ready" | "ai_assisted" | "average_readiness";
  label: string; value: string; trend: string; progress?: number; helper: string; status: Severity; icon: LucideIcon;
}
export interface ReadinessDistribution { status: ClaimReadinessStatus; label: string; count: number; percentage: number }
export interface TrendPoint { label: string; actual: number; target: number; previousPeriod: number }
export interface QueueSnapshot { status: QueueStatus; label: string; thaiLabel: string; count: number; percentage: number; overSla: number; medianWaitMinutes: number | null }
export interface HeatmapCell { departmentId: string; departmentName: string; time: string; value: number; severity: "low" | "moderate" | "high" | "critical" }
export interface EvidenceCategory { category: string; owner: string; count: number; percentage: number; cumulativePercentage: number }
export interface EvidenceAgingRow { category: string; under24: number; oneToThreeDays: number; overThreeDays: number; primaryOwner: string }
export interface ActivityItem {
  id: string; type: "all" | "critical" | "access" | "export"; title: string; actor: string; role: string; source: string; correlationId?: string; severity: Severity; time: string;
}
export interface ActionPriority { id: string; title: string; supportingMetric: string; severity: Severity }
export interface DepartmentDashboardResponse {
  context: { organizationName: string; clinicName: string; lastUpdated: string; canCreateDepartment: boolean; canExport: boolean; dataScopeLabel: string };
  filters: DepartmentDashboardFilters; departments: Department[]; cases: DepartmentCase[]; kpis: DepartmentKpi[];
  readiness: { distribution: ReadinessDistribution[]; averageScore: number; targetScore: number; lowerScoreCases: number; trend: TrendPoint[] };
  queue: QueueSnapshot[]; heatmap: HeatmapCell[]; evidence: { pareto: EvidenceCategory[]; aging: EvidenceAgingRow[] };
  economic: { averageVisitCost: number; expectedCostRange: [number, number]; costAlertCases: number; estimatedClaimValue: number; distribution: { bucket: string; cases: number }[] };
  activities: ActivityItem[]; priorities: ActionPriority[];
}
export interface CreateDepartmentRequest {
  organizationId: string; clinicId: string; name: string; code: string; type: DepartmentType; managerId?: string | null; description?: string;
  phoneExtension?: string; email?: string; operatingHours?: string; costCenterCode?: string; aiClinicalAccess: boolean; status: "active" | "inactive";
}
