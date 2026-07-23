import "server-only";

import type { Database } from "@/lib/database.types";
import type {
  CanonicalClaimDetail,
  CanonicalPatientClaim,
  ClaimDecisionStatus,
  ClaimPaymentStatus,
  ClaimRiskLevel,
  ClaimStatus,
  ClaimWorkflowStatus,
  PatientClaimsPatientContext,
  PatientClaimsSummary,
} from "../types/patient-claims.types";

type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

const workflowStates = new Set<ClaimWorkflowStatus>([
  "draft",
  "collecting_data",
  "validation_pending",
  "needs_review",
  "ready_to_submit",
  "submitted",
  "under_review",
  "appealed",
  "closed",
  "cancelled",
]);
const decisionStates = new Set<ClaimDecisionStatus>([
  "not_decided",
  "approved",
  "partially_approved",
  "rejected",
  "request_information",
  "voided",
]);
const paymentStates = new Set<ClaimPaymentStatus>([
  "not_paid",
  "payment_pending",
  "partially_paid",
  "paid",
  "payment_failed",
  "partially_refunded",
  "refunded",
  "reversed",
]);
const riskStates = new Set<ClaimRiskLevel>(["low", "medium", "high", "critical"]);

export function mapClaimRow(row: ClaimRow): CanonicalPatientClaim {
  const workflowStatus = isState(row.workflow_status, workflowStates) ? row.workflow_status : "unknown";
  const decisionStatus = isState(row.decision_status, decisionStates) ? row.decision_status : "unknown";
  const paymentStatus = isState(row.payment_status, paymentStates) ? row.payment_status : "unknown";
  const canonicalStateSupported = workflowStatus !== "unknown" && decisionStatus !== "unknown" && paymentStatus !== "unknown";

  return {
    id: row.id,
    organizationId: row.organization_id,
    clinicId: row.clinic_id,
    claimNumber: row.claim_number,
    patientId: row.patient_id,
    visitId: row.visit_id ?? "",
    visitNumber: row.visit_id ?? "Not linked",
    serviceDate: row.service_start_date,
    department: "Department unavailable",
    payerName: row.payer_reference ?? "Payer not recorded",
    planName: row.policy_reference ?? "Plan not recorded",
    diagnosisName: "Diagnosis unavailable",
    icdCode: "-",
    claimedAmount: row.total_claimed_amount,
    approvedAmount: row.total_approved_amount ?? undefined,
    readinessScore: mapReadinessScore(workflowStatus),
    claimStatus: canonicalStateSupported
      ? mapLegacyClaimStatus(workflowStatus, decisionStatus)
      : "needs_review",
    riskLevel: isState(row.risk_level, riskStates) ? row.risk_level : "medium",
    claimType: row.claim_type_code,
    economicStatus: row.total_eligible_amount == null ? "Not evaluated" : "Eligibility recorded",
    workflowStatus,
    decisionStatus,
    paymentStatus,
    version: row.version,
    stateUpdatedAt: row.state_updated_at,
    currentDecisionId: row.current_decision_id,
    totalEligibleAmount: row.total_eligible_amount,
    totalPaidAmount: row.total_paid_amount,
    currencyCode: row.currency_code,
    legacyStatus: row.status,
    canonicalStateSupported,
    authoritativeActionsEnabled: canonicalStateSupported,
  };
}

export function mapClaimDetail(row: ClaimRow): CanonicalClaimDetail {
  return {
    ...mapClaimRow(row),
    evidenceChecklist: [],
    aiRecommendation:
      "Canonical Claim state loaded. Review clinical evidence and payer rules before any authoritative action.",
  };
}

export function mapPatientRow(row: PatientRow, now = new Date()): PatientClaimsPatientContext {
  return {
    id: row.id,
    fullName: row.display_label,
    initials: initials(row.display_label),
    active: row.is_active,
    hn: row.patient_code,
    patientId: row.patient_code,
    dateOfBirth: row.date_of_birth ?? "",
    age: calculateAge(row.date_of_birth, now),
    gender: row.sex_at_birth ?? "Not recorded",
    primaryPayer: "Not recorded",
    policyNumber: "Not recorded",
    pdpaConsentStatus: mapConsent(row.consent_status),
    clinicalAlerts: [],
  };
}

export function summarizeClaims(claims: CanonicalPatientClaim[]): PatientClaimsSummary {
  return claims.reduce<PatientClaimsSummary>(
    (summary, claim) => {
      summary.totalClaims += 1;
      summary.totalClaimedAmount += claim.claimedAmount;
      summary.totalApprovedAmount += claim.approvedAmount ?? 0;
      if (claim.decisionStatus === "approved" || claim.decisionStatus === "partially_approved") summary.approvedClaims += 1;
      if (claim.workflowStatus === "submitted" || claim.workflowStatus === "under_review") summary.submittedClaims += 1;
      if (claim.claimStatus === "pending") summary.pendingClaims += 1;
      if (claim.claimStatus === "not_ready" || claim.claimStatus === "needs_review") summary.notReadyClaims += 1;
      return summary;
    },
    {
      totalClaims: 0,
      approvedClaims: 0,
      pendingClaims: 0,
      notReadyClaims: 0,
      submittedClaims: 0,
      totalClaimedAmount: 0,
      totalApprovedAmount: 0,
    },
  );
}

function isState<T extends string>(value: string | null, supported: Set<T>): value is T {
  return value !== null && supported.has(value as T);
}

function mapLegacyClaimStatus(workflow: ClaimWorkflowStatus, decision: ClaimDecisionStatus): ClaimStatus {
  if (decision === "approved" || decision === "partially_approved") return "approved";
  if (decision === "rejected" || decision === "voided") return "rejected";
  if (decision === "request_information") return "needs_review";
  if (workflow === "submitted") return "submitted";
  if (workflow === "under_review" || workflow === "appealed") return "pending";
  if (workflow === "ready_to_submit" || workflow === "needs_review" || workflow === "validation_pending") return "needs_review";
  if (workflow === "collecting_data") return "not_ready";
  return "draft";
}

function mapReadinessScore(workflow: ClaimWorkflowStatus | "unknown"): number {
  if (workflow === "ready_to_submit" || workflow === "submitted" || workflow === "under_review" || workflow === "appealed" || workflow === "closed") return 100;
  if (workflow === "validation_pending" || workflow === "needs_review") return 70;
  if (workflow === "collecting_data") return 40;
  if (workflow === "draft") return 20;
  return 0;
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function calculateAge(dateOfBirth: string | null, now: Date): number {
  if (!dateOfBirth) return 0;
  const birthday = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(birthday.getTime())) return 0;
  let age = now.getUTCFullYear() - birthday.getUTCFullYear();
  const month = now.getUTCMonth() - birthday.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birthday.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

function mapConsent(value: string): "active" | "expired" | "missing" {
  if (value === "active") return "active";
  if (value === "expired") return "expired";
  return "missing";
}
