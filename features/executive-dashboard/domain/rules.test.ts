import { describe, expect, it } from "vitest";
import { buildClaimReadinessSummary, buildExecutiveKpis } from "./rules";
import type { CaseWorklistItem, EconomicSummary, QueueSnapshot, RiskComplianceSummary } from "./types";

const cases: CaseWorklistItem[] = [
  caseItem("ready", 90),
  caseItem("needs_review", 70),
  caseItem("not_ready", 50),
];

describe("executive dashboard readiness rules", () => {
  it("preserves readiness totals after the naming cutover", () => {
    expect(buildClaimReadinessSummary(cases)).toMatchObject({
      ready: 1,
      needsReview: 1,
      notReady: 1,
      score: 70,
    });
  });

  it("builds Claim Ready KPI from readinessStatus only", () => {
    const queue: QueueSnapshot = { waiting: 0, in_consultation: 0, pending_evidence: 0, claim_review: 0, completed: 3 };
    const economic: EconomicSummary = { estimatedClaimValue: 0, averageCost: 0, benchmarkCost: 0, valueAtRisk: 0, costOutlierCount: 0, currency: "THB", disclaimer: "test" };
    const riskCompliance: RiskComplianceSummary = { complianceAlerts: 0, auditAlerts: 0, policyViolations: 0, missingConsent: 0, highRiskClaims: 0, alerts: [] };
    const claimReady = buildExecutiveKpis({ cases, queue, economic, riskCompliance }).find((item) => item.id === "claim-ready");
    expect(claimReady?.value).toBe(33);
  });
});

function caseItem(readinessStatus: CaseWorklistItem["readinessStatus"], readinessScore: number): CaseWorklistItem {
  return {
    visitId: `visit-${readinessStatus}`,
    clinic: "Clinic",
    clinicId: "clinic-bangkok-01",
    organization: "Med AI NexSure Demo",
    organizationId: "org-nexsure-demo",
    payer: "Aster Health",
    department: "Internal Medicine",
    readinessStatus,
    readinessScore,
    missingEvidence: 0,
    riskLevel: "low",
    lastUpdated: "2026-07-09T00:00:00.000Z",
  };
}
