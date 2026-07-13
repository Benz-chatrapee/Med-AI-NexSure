export type ClaimReadinessCapability =
  | "claimReadiness.view"
  | "claimReadiness.review"
  | "documentationTask.create"
  | "documentationTask.update"
  | "audit.view"
  | "payerRule.view";

export type ClaimRiskLevel = "ready" | "needs_review" | "at_risk" | "blocked";

export type ClaimDraftStatus =
  | "documentation_pending"
  | "ready_for_review"
  | "clinical_review"
  | "blocked";

export type ReadinessDimension =
  | "evidenceCompleteness"
  | "soapCompleteness"
  | "icdValidity"
  | "medicalNecessity"
  | "payerRejectionRisk";

export type GapCategory =
  | "evidence"
  | "soap"
  | "icd"
  | "medical_necessity"
  | "payer_rule"
  | "compliance";

export type GapSeverity = "critical" | "high" | "medium" | "low";

export type GapStatus = "open" | "task_created" | "reviewed" | "resolved";

export type DocumentationTaskStatus = "open" | "in_progress" | "resolved";

export type DocumentationTaskPriority = "urgent" | "high" | "normal";

export type EvidencePackageStatus =
  | "complete"
  | "needs_review"
  | "missing_required"
  | "blocked";

export type EvidenceItemStatus = "linked" | "missing" | "needs_review";

export type PayerRuleStatus = "active" | "draft" | "needs_review";

export type PayerRuleStrictness = "standard" | "enhanced";

export type SpecialistAgentName =
  | "Business Analyst Agent"
  | "Product Owner Agent"
  | "Solution Architect Agent"
  | "Frontend Agent"
  | "Backend Agent"
  | "Database Agent"
  | "QA Agent";

export type AssignedRole =
  | "doctor"
  | "clinical_team"
  | "coding_reviewer"
  | "claim_reviewer";

export type ReadinessScore = Record<ReadinessDimension, number> & {
  total: number;
};

export type TaskSummary = {
  open: number;
  inProgress: number;
  resolved: number;
};

export type ClaimReadinessEncounter = {
  id: string;
  organizationId: string;
  clinicId: string;
  encounterCode: string;
  patientLabel: string;
  department: string;
  primaryDoctorName: string;
  payerName: string;
  encounterDate: string;
  claimDraftStatus: ClaimDraftStatus;
  readinessScore: ReadinessScore;
  riskLevel: ClaimRiskLevel;
  missingEvidenceCount: number;
  topGapSummary: string;
  lastReviewedAt: string;
  taskSummary: TaskSummary;
};

export type EvidencePackageItem = {
  id: string;
  label: string;
  source: string;
  status: EvidenceItemStatus;
  required: boolean;
  lastCheckedAt: string;
};

export type EvidencePackage = {
  id: string;
  encounterId: string;
  status: EvidencePackageStatus;
  completeness: number;
  requiredItems: number;
  linkedItems: number;
  missingItems: number;
  reviewerNote: string;
  items: EvidencePackageItem[];
};

export type PayerRuleSetting = {
  id: string;
  payerName: string;
  ruleName: string;
  category: GapCategory;
  status: PayerRuleStatus;
  strictness: PayerRuleStrictness;
  requiredEvidence: string;
  humanReviewRequired: boolean;
  effectiveFrom: string;
  lastUpdatedAt: string;
};

export type SpecialistAgentOutput = {
  agent: SpecialistAgentName;
  summary: string;
  reasoning: string;
  confidence: number;
  deliverables: string[];
  risks: string[];
  recommendations: string[];
  nextAction: string;
};

export type OrchestratorAgentOutput = {
  summary: string;
  reasoning: string;
  confidence: number;
  deliverables: string[];
  risks: string[];
  recommendations: string[];
  nextAction: string;
  specialists: SpecialistAgentOutput[];
};

export type ReadinessGap = {
  id: string;
  encounterId: string;
  category: GapCategory;
  severity: GapSeverity;
  title: string;
  explanation: string;
  suggestedAction: string;
  source: string;
  relatedEvidence: string;
  status: GapStatus;
};

export type DocumentationTask = {
  id: string;
  organizationId: string;
  clinicId: string;
  encounterId: string;
  gapId: string;
  title: string;
  category: GapCategory;
  priority: DocumentationTaskPriority;
  assignedRole: AssignedRole;
  reason: string;
  status: DocumentationTaskStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type ClaimReadinessAuditEvent = {
  id: string;
  organizationId: string;
  clinicId: string;
  actorId: string;
  module: "claim_readiness";
  action:
    | "view_queue"
    | "view_dashboard"
    | "view_detail"
    | "create_documentation_task"
    | "task_creation_failed";
  entityType: "encounter" | "documentation_task";
  entityId: string;
  timestamp: string;
  riskLevel?: ClaimRiskLevel;
  metadata: Record<string, string | number | boolean | null>;
  correlationId: string;
};

export type ClaimReadinessDetail = ClaimReadinessEncounter & {
  gaps: ReadinessGap[];
  tasks: DocumentationTask[];
  evidencePackage: EvidencePackage;
};

export type ActorContext = {
  actorId: string;
  organizationId: string;
  clinicId: string;
  role: "doctor" | "clinical_team" | "compliance" | "admin";
  capabilities: ClaimReadinessCapability[];
};

export type ListQuery = {
  q: string;
  risk: ClaimRiskLevel | "all";
  payer: string;
  department: string;
  taskStatus: DocumentationTaskStatus | "all";
  page: number;
  pageSize: number;
  sort: "risk" | "score" | "date" | "missingEvidence";
  direction: "asc" | "desc";
};

export type PaginatedEncounters = {
  items: ClaimReadinessEncounter[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  filters: {
    payers: string[];
    departments: string[];
  };
  kpis: {
    averageReadiness: number;
    blockedEncounters: number;
    missingEvidence: number;
    tasksOpen: number;
  };
};

export type ExecutiveDashboardSummary = {
  kpis: PaginatedEncounters["kpis"] & {
    evidencePackageCompleteness: number;
    payerRulesActive: number;
    payerRulesNeedReview: number;
    humanReviewRequiredRules: number;
  };
  claimReadiness: {
    ready: number;
    needsReview: number;
    atRisk: number;
    blocked: number;
  };
  evidencePackages: EvidencePackage[];
  payerRules: PayerRuleSetting[];
  orchestrator: OrchestratorAgentOutput;
};

export type CreateDocumentationTaskInput = {
  encounterId: string;
  gapId: string;
  title: string;
  category: GapCategory;
  priority: DocumentationTaskPriority;
  assignedRole: AssignedRole;
  reason: string;
};
