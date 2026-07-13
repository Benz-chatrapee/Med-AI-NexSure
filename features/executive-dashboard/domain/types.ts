export type DashboardRole =
  | "executive"
  | "clinic_manager"
  | "auditor"
  | "claim_reviewer"
  | "admin";

export type QueueStatus =
  | "waiting"
  | "in_consultation"
  | "pending_evidence"
  | "claim_review"
  | "completed";

export type ClaimReadinessStatus = "ready" | "needs_review" | "not_ready";

export type EvidenceCategory =
  | "soap_note"
  | "diagnosis"
  | "icd"
  | "prescription"
  | "medical_certificate"
  | "attachments"
  | "payer_documents";

export type DashboardSeverity = "critical" | "high" | "medium" | "low";

export type DashboardRiskLevel = "low" | "medium" | "high" | "critical";

export type ActivityType =
  | "visit_completed"
  | "claim_readiness_updated"
  | "task_created"
  | "evidence_added"
  | "audit_event";

export type DashboardAuditAction =
  | "dashboard_viewed"
  | "filters_applied"
  | "export_requested"
  | "detail_viewed";

export type ExecutiveDashboardFilters = {
  organizationId: string;
  clinicId: string | "all";
  department: string | "all";
  payer: string | "all";
  riskLevel: DashboardRiskLevel | "all";
  claimStatus: ClaimReadinessStatus | "all";
  dateFrom: string;
  dateTo: string;
};

export type ExecutiveDashboardActor = {
  actorId: string;
  role: DashboardRole;
  organizationIds: string[];
  clinicIds: string[];
  permissions: ExecutiveDashboardPermission[];
};

export type ExecutiveDashboardPermission =
  | "executiveDashboard.view"
  | "executiveDashboard.export"
  | "executiveDashboard.detail.view";

export type ExecutiveKPI = {
  id: string;
  label: string;
  value: number;
  unit: "count" | "percent" | "currency";
  trend: "up" | "down" | "flat";
  summary: string;
};

export type QueueSnapshot = Record<QueueStatus, number>;

export type ClaimReadinessSummary = {
  ready: number;
  needsReview: number;
  notReady: number;
  score: number;
  trend: "improving" | "declining" | "stable";
};

export type MissingEvidenceBucket = {
  category: EvidenceCategory;
  severity: DashboardSeverity;
  count: number;
};

export type MissingEvidenceSummary = {
  total: number;
  byCategory: MissingEvidenceBucket[];
};

export type EconomicSummary = {
  estimatedClaimValue: number;
  averageCost: number;
  benchmarkCost: number;
  valueAtRisk: number;
  costOutlierCount: number;
  currency: "THB";
  disclaimer: string;
};

export type ComplianceAlert = {
  id: string;
  title: string;
  severity: DashboardSeverity;
  source: "compliance" | "audit" | "payer_policy" | "consent" | "claim_risk";
  summary: string;
  recommendedAction: string;
  requiresHumanReview: boolean;
};

export type RiskComplianceSummary = {
  complianceAlerts: number;
  auditAlerts: number;
  policyViolations: number;
  missingConsent: number;
  highRiskClaims: number;
  alerts: ComplianceAlert[];
};

export type AIRecommendation = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  recommendedAction: string;
  disclaimer: string;
  requiresHumanReview: boolean;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  summary: string;
  actorLabel: string;
  occurredAt: string;
  organizationId: string;
  clinicId: string;
};

export type CaseWorklistItem = {
  visitId: string;
  clinic: string;
  clinicId: string;
  organization: string;
  organizationId: string;
  payer: string;
  department: string;
  claimStatus: ClaimReadinessStatus;
  readinessScore: number;
  missingEvidence: number;
  riskLevel: DashboardRiskLevel;
  lastUpdated: string;
};

export type ExecutiveDashboardSummary = {
  filters: ExecutiveDashboardFilters;
  kpis: ExecutiveKPI[];
  queueSnapshot: QueueSnapshot;
  claimReadiness: ClaimReadinessSummary;
  missingEvidence: MissingEvidenceSummary;
  economic: EconomicSummary;
  riskCompliance: RiskComplianceSummary;
  aiRecommendations: AIRecommendation[];
  recentActivity: ActivityItem[];
  caseWorklist: CaseWorklistItem[];
  generatedAt: string;
  safety: {
    syntheticDataOnly: true;
    containsPhi: false;
    containsPii: false;
    decisionSupportOnly: true;
    disclaimer: string;
  };
};

export type DashboardValidationResult =
  | { ok: true; value: ExecutiveDashboardFilters }
  | { ok: false; error: string };

export type DashboardResponseEnvelope<T> =
  | {
      success: true;
      data: T;
      meta: { correlationId: string; generatedAt: string };
      error: null;
    }
  | {
      success: false;
      data: null;
      meta: { correlationId: string; generatedAt: string };
      error: { code: string; message: string };
    };
