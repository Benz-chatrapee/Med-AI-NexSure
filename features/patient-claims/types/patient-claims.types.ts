export type ClaimStatus = "draft" | "not_ready" | "needs_review" | "submitted" | "pending" | "approved" | "rejected";

export type ClaimRiskLevel = "low" | "medium" | "high" | "critical";

export type EvidenceStatus = "complete" | "missing" | "needs_review" | "not_applicable";

export type EvidenceSeverity = "low" | "medium" | "high" | "critical";

export type MissingEvidenceActionType = "upload" | "assign" | "review";

export type ReadinessCategory = "soap" | "diagnosis_icd" | "treatment" | "documents" | "payer_rules" | "economic_review";

export interface PatientClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  visitId: string;
  visitNumber: string;
  serviceDate: string;
  department: string;
  payerName: string;
  planName: string;
  diagnosisName: string;
  icdCode: string;
  claimedAmount: number;
  expectedAmountMin?: number;
  expectedAmountMax?: number;
  approvedAmount?: number;
  readinessScore: number;
  claimStatus: ClaimStatus;
  riskLevel: ClaimRiskLevel;
  tatDays?: number;
  tatTargetDays?: number;
  claimType?: string;
  economicStatus?: string;
}

export interface ClaimReadinessBreakdown {
  category: ReadinessCategory;
  label: string;
  score: number;
  maximumScore: number;
}

export interface ClaimReadinessOverview {
  score: number;
  status: "ready" | "needs_review" | "not_ready";
  lastCalculatedAt: string;
  source: string;
  breakdown: ClaimReadinessBreakdown[];
}

export interface MissingEvidenceItem {
  id: string;
  claimId?: string;
  visitId?: string;
  name: string;
  description: string;
  severity: EvidenceSeverity;
  dueAt?: string;
  actionType: MissingEvidenceActionType;
}

export interface PatientClaimsSummary {
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  notReadyClaims: number;
  submittedClaims: number;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
}

export interface PatientClaimsFilters {
  query: string;
  status: ClaimStatus | "all";
  payer: string | "all";
  risk: ClaimRiskLevel | "all";
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export interface PatientClaimsPagination {
  page: number;
  pageSize: number;
}

export interface PatientClaimsPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  rangeLabel: string;
}

export interface PatientClaimsPatientContext {
  id: string;
  fullName: string;
  initials: string;
  active: boolean;
  hn: string;
  patientId: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  primaryPayer: string;
  policyNumber: string;
  pdpaConsentStatus: "active" | "expired" | "missing";
  clinicalAlerts: string[];
}

export interface ClaimEvidenceChecklistItem {
  id: string;
  label: string;
  status: EvidenceStatus;
}

export interface ClaimDetail extends PatientClaim {
  evidenceChecklist: ClaimEvidenceChecklistItem[];
  aiRecommendation: string;
}

export interface ClaimActivity {
  id: string;
  eventType: string;
  title: string;
  actor: string;
  timestamp: string;
  relatedClaim?: string;
  relatedDocument?: string;
  aiConfidence?: number;
  auditHref?: string;
}

export interface PrimaryPayerRules {
  payerName: string;
  planName: string;
  policyNumber: string;
  policyActiveDate: string;
  requiredEvidenceCount: number;
  opdBenefitLimit: number;
  referralRequirement: string;
  autoSubmitThreshold: number;
  lastUpdatedAt: string;
}

export interface PatientClaimsDashboardData {
  patient: PatientClaimsPatientContext;
  claims: PatientClaim[];
  summary: PatientClaimsSummary;
  readiness: ClaimReadinessOverview;
  missingEvidence: MissingEvidenceItem[];
  activities: ClaimActivity[];
  payerRules: PrimaryPayerRules | null;
}

export interface RecalculateReadinessResult {
  readiness: ClaimReadinessOverview;
  auditEventId: string;
}
