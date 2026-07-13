import {
  buildClaimReadinessSummary,
  buildExecutiveKpis,
  buildMissingEvidenceSummary,
  filterRecentActivity,
} from "../domain/rules";
import type {
  ActivityItem,
  AIRecommendation,
  CaseWorklistItem,
  EconomicSummary,
  ExecutiveDashboardActor,
  ExecutiveDashboardFilters,
  ExecutiveDashboardSummary,
  QueueSnapshot,
  RiskComplianceSummary,
} from "../domain/types";
import { allowedClinicIds } from "./rbac";

const generatedAt = new Date("2026-07-09T05:00:00.000Z").toISOString();

const cases: CaseWorklistItem[] = [
  worklist("VIS-2026-1001", "Bangkok Central Clinic", "clinic-bangkok-01", "Med AI NexSure Demo", "org-nexsure-demo", "Aster Health", "Internal Medicine", "needs_review", 68, 3, "high", "2026-07-09T04:20:00.000Z"),
  worklist("VIS-2026-1002", "Bangkok Central Clinic", "clinic-bangkok-01", "Med AI NexSure Demo", "org-nexsure-demo", "BlueCare Plus", "Orthopedics", "not_ready", 49, 5, "critical", "2026-07-09T03:45:00.000Z"),
  worklist("VIS-2026-1003", "Bangkok Central Clinic", "clinic-bangkok-01", "Med AI NexSure Demo", "org-nexsure-demo", "Siam Shield", "Cardiology", "ready", 91, 0, "low", "2026-07-09T02:15:00.000Z"),
  worklist("VIS-2026-1004", "Chiang Mai Partner Clinic", "clinic-chiangmai-02", "Med AI NexSure Demo", "org-nexsure-demo", "Aster Health", "Neurology", "needs_review", 73, 2, "medium", "2026-07-08T11:35:00.000Z"),
  worklist("VIS-2026-1005", "Chiang Mai Partner Clinic", "clinic-chiangmai-02", "Med AI NexSure Demo", "org-nexsure-demo", "BlueCare Plus", "Internal Medicine", "not_ready", 55, 4, "high", "2026-07-08T10:05:00.000Z"),
];

const activity: ActivityItem[] = [
  activityItem("act-1001", "claim_readiness_updated", "Claim readiness updated", "Readiness score recalculated for a synthetic visit.", "Claim Reviewer", "2026-07-09T04:22:00.000Z", "clinic-bangkok-01"),
  activityItem("act-1002", "task_created", "Documentation task created", "Missing payer document follow-up task was created.", "Clinical Team", "2026-07-09T04:05:00.000Z", "clinic-bangkok-01"),
  activityItem("act-1003", "evidence_added", "Evidence added", "Referenced attachment was linked to the evidence package.", "Clinic Manager", "2026-07-09T03:10:00.000Z", "clinic-chiangmai-02"),
  activityItem("act-1004", "visit_completed", "Visit completed", "Synthetic visit moved to claim readiness review.", "Provider", "2026-07-09T02:30:00.000Z", "clinic-bangkok-01"),
  activityItem("act-1005", "audit_event", "Audit event recorded", "Dashboard-relevant audit event was recorded.", "Auditor", "2026-07-08T12:15:00.000Z", "clinic-chiangmai-02"),
];

const recommendations: AIRecommendation[] = [
  {
    id: "rec-evidence-focus",
    title: "Prioritize critical payer document gaps",
    summary:
      "Several not-ready synthetic cases have missing payer documents or attachments. This is an operational review signal only.",
    confidence: 0.79,
    recommendedAction:
      "Route cases with critical missing payer documents to a claim reviewer for human confirmation.",
    disclaimer:
      "Decision support only. This recommendation does not approve, deny, submit, diagnose, or prescribe.",
    requiresHumanReview: true,
  },
  {
    id: "rec-cost-outlier-review",
    title: "Review cost outliers with incomplete evidence",
    summary:
      "High-cost synthetic visits with incomplete evidence may create avoidable value-at-risk.",
    confidence: 0.72,
    recommendedAction:
      "Ask operations and claim reviewers to confirm whether supporting evidence is complete.",
    disclaimer:
      "Economic intelligence is estimated and must not be treated as a final financial decision.",
    requiresHumanReview: true,
  },
];

export async function getExecutiveDashboard(
  filters: ExecutiveDashboardFilters,
  actor: ExecutiveDashboardActor,
): Promise<ExecutiveDashboardSummary> {
  const allowedClinics = allowedClinicIds(actor, filters);
  const scopedCases = filterCases(filters, allowedClinics);
  const queueSnapshot = buildQueueSnapshot(scopedCases);
  const economic = buildEconomicSummary(scopedCases);
  const riskCompliance = buildRiskComplianceSummary(scopedCases);

  return {
    filters,
    kpis: buildExecutiveKpis({
      cases: scopedCases,
      queue: queueSnapshot,
      economic,
      riskCompliance,
    }),
    queueSnapshot,
    claimReadiness: buildClaimReadinessSummary(scopedCases),
    missingEvidence: buildMissingEvidenceSummary(scopedCases),
    economic,
    riskCompliance,
    aiRecommendations: recommendations,
    recentActivity: filterRecentActivity(activity, allowedClinics),
    caseWorklist: scopedCases,
    generatedAt,
    safety: {
      syntheticDataOnly: true,
      containsPhi: false,
      containsPii: false,
      decisionSupportOnly: true,
      disclaimer:
        "Executive Dashboard data is synthetic decision support only. It does not approve claims, diagnose, prescribe, or make final financial decisions.",
    },
  };
}

function filterCases(
  filters: ExecutiveDashboardFilters,
  allowedClinics: string[],
) {
  return cases.filter((item) => {
    const updated = item.lastUpdated.slice(0, 10);
    return (
      item.organizationId === filters.organizationId &&
      allowedClinics.includes(item.clinicId) &&
      (filters.department === "all" || item.department === filters.department) &&
      (filters.payer === "all" || item.payer === filters.payer) &&
      (filters.riskLevel === "all" || item.riskLevel === filters.riskLevel) &&
      (filters.claimStatus === "all" || item.claimStatus === filters.claimStatus) &&
      updated >= filters.dateFrom &&
      updated <= filters.dateTo
    );
  });
}

function buildQueueSnapshot(scopedCases: CaseWorklistItem[]): QueueSnapshot {
  return {
    waiting: Math.max(1, Math.floor(scopedCases.length * 0.2)),
    in_consultation: Math.max(1, Math.floor(scopedCases.length * 0.2)),
    pending_evidence: scopedCases.filter((item) => item.missingEvidence > 0).length,
    claim_review: scopedCases.filter((item) => item.claimStatus !== "ready").length,
    completed: scopedCases.filter((item) => item.claimStatus === "ready").length,
  };
}

function buildEconomicSummary(scopedCases: CaseWorklistItem[]): EconomicSummary {
  const baseValue = scopedCases.length * 18500;
  const valueAtRisk = scopedCases
    .filter((item) => item.riskLevel === "high" || item.riskLevel === "critical")
    .reduce((sum, item) => sum + 16000 + item.missingEvidence * 1200, 0);

  return {
    estimatedClaimValue: baseValue,
    averageCost: scopedCases.length === 0 ? 0 : Math.round(baseValue / scopedCases.length),
    benchmarkCost: 17200,
    valueAtRisk,
    costOutlierCount: scopedCases.filter((item) => item.missingEvidence >= 4).length,
    currency: "THB",
    disclaimer:
      "Economic intelligence is estimated from synthetic data and is not a final financial decision.",
  };
}

function buildRiskComplianceSummary(
  scopedCases: CaseWorklistItem[],
): RiskComplianceSummary {
  const highRiskClaims = scopedCases.filter(
    (item) => item.riskLevel === "high" || item.riskLevel === "critical",
  ).length;
  const missingConsent = scopedCases.filter((item) => item.missingEvidence >= 5).length;

  return {
    complianceAlerts: missingConsent + highRiskClaims,
    auditAlerts: scopedCases.filter((item) => item.claimStatus === "not_ready").length,
    policyViolations: scopedCases.filter((item) => item.payer === "BlueCare Plus").length,
    missingConsent,
    highRiskClaims,
    alerts: [
      {
        id: "alert-critical-evidence",
        title: "Critical evidence review required",
        severity: highRiskClaims > 0 ? "critical" : "low",
        source: "claim_risk",
        summary:
          "High-risk synthetic claims require reviewer confirmation before any claim workflow action.",
        recommendedAction:
          "Assign authorized claim reviewers to inspect missing evidence and payer document status.",
        requiresHumanReview: true,
      },
      {
        id: "alert-audit-scope",
        title: "Audit coverage check",
        severity: "medium",
        source: "audit",
        summary:
          "Dashboard view, filter, export, and detail access must produce audit events before production use.",
        recommendedAction:
          "Confirm durable audit persistence with the Audit and Database agents.",
        requiresHumanReview: true,
      },
    ],
  };
}

function worklist(
  visitId: string,
  clinic: string,
  clinicId: string,
  organization: string,
  organizationId: string,
  payer: string,
  department: string,
  claimStatus: CaseWorklistItem["claimStatus"],
  readinessScore: number,
  missingEvidence: number,
  riskLevel: CaseWorklistItem["riskLevel"],
  lastUpdated: string,
): CaseWorklistItem {
  return {
    visitId,
    clinic,
    clinicId,
    organization,
    organizationId,
    payer,
    department,
    claimStatus,
    readinessScore,
    missingEvidence,
    riskLevel,
    lastUpdated,
  };
}

function activityItem(
  id: string,
  type: ActivityItem["type"],
  title: string,
  summary: string,
  actorLabel: string,
  occurredAt: string,
  clinicId: string,
): ActivityItem {
  return {
    id,
    type,
    title,
    summary,
    actorLabel,
    occurredAt,
    organizationId: "org-nexsure-demo",
    clinicId,
  };
}
