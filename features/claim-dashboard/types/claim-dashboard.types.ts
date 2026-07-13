export type ClaimReadinessStatus = "READY" | "NEEDS_REVIEW" | "NOT_READY";
export type ClaimRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ClaimSlaStatus = "normal" | "warning" | "overdue";
export type ClaimWorkflowStatus =
  | "READY_TO_SUBMIT"
  | "IN_REVIEW"
  | "PENDING_EVIDENCE"
  | "READY_FOR_REVIEW"
  | "SUBMITTED"
  | "RETURNED";

export type ClaimRiskCategory = "Clinical" | "Coding" | "Coverage" | "Evidence" | "Cost" | "SLA";
export type ClaimType = "OPD" | "IPD" | "Accident";
export type ClaimKpiFilter = "all" | "ready" | "evidence" | "value" | "risk";

export interface ClaimWorklistItem {
  id: string;
  visitId: string;
  patientName: string;
  maskedHn: string;
  clinic: string;
  payer: string;
  claimType: ClaimType;
  icd10?: string;
  readinessScore: number;
  readiness: ClaimReadinessStatus;
  missingEvidenceCount: number;
  missingEvidence: string[];
  risk: ClaimRiskLevel;
  riskCategory: ClaimRiskCategory;
  claimAmount: number;
  assignee: string | null;
  slaLabel: string;
  slaStatus: ClaimSlaStatus;
  status: ClaimWorkflowStatus;
}

export interface ClaimDashboardFilters {
  organization: string;
  clinic: string;
  dateRange: "Today" | "Last 7 Days" | "Last 30 Days" | "This Month" | "Custom Range";
  payer: string;
  claimType: "" | ClaimType;
  reviewer: string;
  readiness: "" | ClaimReadinessStatus;
  risk: "" | ClaimRiskLevel;
  sla: "" | ClaimSlaStatus;
}

export interface ClaimDashboardState {
  filters: ClaimDashboardFilters;
  search: string;
  selectedKpi: ClaimKpiFilter;
  selectedHeatmapCell: {
    category: ClaimRiskCategory;
    severity: ClaimRiskLevel;
  } | null;
  selectedPayer: string;
  selectedEvidenceCategory: string;
}

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "high";

export interface StatusConfig {
  label: string;
  thaiLabel: string;
  className: string;
}
