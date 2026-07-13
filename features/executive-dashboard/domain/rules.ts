import type {
  ActivityItem,
  CaseWorklistItem,
  ClaimReadinessSummary,
  EconomicSummary,
  ExecutiveKPI,
  MissingEvidenceSummary,
  QueueSnapshot,
  RiskComplianceSummary,
} from "./types";

export function buildExecutiveKpis({
  cases,
  queue,
  economic,
  riskCompliance,
}: {
  cases: CaseWorklistItem[];
  queue: QueueSnapshot;
  economic: EconomicSummary;
  riskCompliance: RiskComplianceSummary;
}): ExecutiveKPI[] {
  const readyCount = cases.filter((item) => item.claimStatus === "ready").length;
  const claimReadyPercent =
    cases.length === 0 ? 0 : Math.round((readyCount / cases.length) * 100);
  const averageReadiness = average(cases.map((item) => item.readinessScore));

  return [
    metric("today-visits", "Today Visits", sumQueue(queue), "count", "flat"),
    metric("claim-ready", "Claim Ready", claimReadyPercent, "percent", "up"),
    metric("ai-assisted-cases", "AI Assisted Cases", cases.length, "count", "up"),
    metric(
      "average-readiness-score",
      "Average Readiness Score",
      averageReadiness,
      "percent",
      trendForReadiness(averageReadiness),
    ),
    metric(
      "missing-evidence",
      "Missing Evidence",
      cases.reduce((sum, item) => sum + item.missingEvidence, 0),
      "count",
      "down",
    ),
    metric(
      "high-risk-alerts",
      "High Risk Alerts",
      riskCompliance.highRiskClaims + riskCompliance.complianceAlerts,
      "count",
      "flat",
    ),
    metric("average-visit-cost", "Average Visit Cost", economic.averageCost, "currency", "flat"),
    metric("pending-tasks", "Pending Tasks", queue.pending_evidence + queue.claim_review, "count", "down"),
  ];
}

export function buildClaimReadinessSummary(
  cases: CaseWorklistItem[],
): ClaimReadinessSummary {
  const score = average(cases.map((item) => item.readinessScore));

  return {
    ready: cases.filter((item) => item.claimStatus === "ready").length,
    needsReview: cases.filter((item) => item.claimStatus === "needs_review").length,
    notReady: cases.filter((item) => item.claimStatus === "not_ready").length,
    score,
    trend: score >= 75 ? "improving" : score >= 60 ? "stable" : "declining",
  };
}

export function buildMissingEvidenceSummary(
  cases: CaseWorklistItem[],
): MissingEvidenceSummary {
  const total = cases.reduce((sum, item) => sum + item.missingEvidence, 0);
  return {
    total,
    byCategory: [
      { category: "soap_note", severity: total > 8 ? "high" : "medium", count: Math.ceil(total * 0.18) },
      { category: "diagnosis", severity: "medium", count: Math.ceil(total * 0.13) },
      { category: "icd", severity: "high", count: Math.ceil(total * 0.14) },
      { category: "prescription", severity: "low", count: Math.ceil(total * 0.08) },
      { category: "medical_certificate", severity: "medium", count: Math.ceil(total * 0.1) },
      { category: "attachments", severity: "high", count: Math.ceil(total * 0.18) },
      { category: "payer_documents", severity: "critical", count: Math.ceil(total * 0.19) },
    ],
  };
}

export function filterRecentActivity(
  activity: ActivityItem[],
  allowedClinicIds: string[],
) {
  return activity
    .filter((item) => allowedClinicIds.includes(item.clinicId))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 8);
}

function metric(
  id: string,
  label: string,
  value: number,
  unit: ExecutiveKPI["unit"],
  trend: ExecutiveKPI["trend"],
): ExecutiveKPI {
  return {
    id,
    label,
    value,
    unit,
    trend,
    summary: `${label} is scoped to authorized synthetic dashboard data.`,
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sumQueue(queue: QueueSnapshot) {
  return (
    queue.waiting +
    queue.in_consultation +
    queue.pending_evidence +
    queue.claim_review +
    queue.completed
  );
}

function trendForReadiness(value: number): ExecutiveKPI["trend"] {
  if (value >= 75) return "up";
  if (value < 60) return "down";
  return "flat";
}
