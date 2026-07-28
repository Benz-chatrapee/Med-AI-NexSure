import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DoctorDashboardPage } from "../components/doctor-dashboard-page";
import { buildReadinessDetail, doctorDashboardMock, doctorKpis, doctorWorklistVisits } from "../data/doctor-dashboard.mock";
import { manualOverrideSchema } from "../schemas/manual-override.schema";
import {
  buildClaimRiskMatrix,
  buildCostVarianceBridge,
  buildEconomicAlerts,
  buildVisitCostTrend,
  buildVisitVolumeHeatmap,
  canSendToClaimReview,
  filterWorklist,
  formatDuration,
  getKpiFilter,
  getPointsToReady,
  getReadinessStatus,
  safePercent,
} from "./doctor-dashboard.utils";
import type { DoctorDashboardData, DoctorDashboardFilters, DoctorWorklistVisit } from "../types/doctor-dashboard.types";

vi.mock("@/components/ui/button", () => ({
  Button: "button",
}));

vi.mock("@/components/ui/input", () => ({
  Input: "input",
}));

const baseFilters = {
  dateRange: "today",
  clinic: "NexSure Rama 9 Clinic",
  department: "Internal Medicine",
  doctor: "Dr. Ananda",
  search: "",
  readinessStatus: "",
  riskLevel: "",
  visitStatus: "",
  priority: "",
  gapType: "",
} as const;

const canonicalVisit = {
  id: "DEMO-VIS-BATCH-E-001",
  patientName: "Canonical Patient",
  hn: "HN-CANON-001",
  gender: "Female",
  age: 42,
  encounterType: "OPD",
  visitStatus: "Waiting",
  readinessScore: 72,
  readinessStatus: "Needs Review",
  blockingGapCount: 1,
  riskLevel: "High",
  priority: "High",
  pendingMinutes: 45,
  payerName: "Canonical Payer",
  diagnosisCode: "J20.9",
  diagnosisLabel: "Acute bronchitis",
  nextAction: "Review canonical evidence",
  primaryGap: "Imaging Report",
  confidencePercent: 82,
  scoreChange: -3,
  doctor: "Dr. Canon",
  department: "Internal Medicine",
} satisfies DoctorWorklistVisit;

const dashboardActions = {
  refreshDashboard: async (filters: DoctorDashboardFilters) => {
    void filters;
    return doctorDashboardMock;
  },
  getVisitReadiness: async () => doctorDashboardMock.selectedVisit,
  exportSummary: async () => ({
    filename: "doctor-dashboard.csv",
    content: "header\n",
    mimeType: "text/csv" as const,
  }),
};

function renderDoctorDashboard(initialData: DoctorDashboardData) {
  return renderToStaticMarkup(createElement(DoctorDashboardPage, { initialData, actions: dashboardActions }));
}

describe("doctor dashboard utilities", () => {
  it("calculates readiness status from thresholds", () => {
    expect(getReadinessStatus(59)).toBe("Not Ready");
    expect(getReadinessStatus(60)).toBe("Needs Review");
    expect(getReadinessStatus(85)).toBe("Ready for Human Review");
  });

  it("calculates points to ready with clamped scores", () => {
    expect(getPointsToReady(78)).toBe(7);
    expect(getPointsToReady(120)).toBe(0);
    expect(getPointsToReady(Number.NaN)).toBe(85);
  });

  it("formats durations consistently", () => {
    expect(formatDuration(138)).toBe("2h 18m");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(-10)).toBe("0m");
  });

  it("filters and sorts the worklist by priority and pending time", () => {
    const rows = filterWorklist(doctorWorklistVisits, {
      ...baseFilters,
      riskLevel: "High",
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].priority).toBe("Critical");
  });

  it("blocks claim-review handoff when blocking gaps remain", () => {
    expect(canSendToClaimReview(doctorWorklistVisits[0])).toBe(false);
    expect(canSendToClaimReview(doctorWorklistVisits[1])).toBe(true);
  });

  it("maps KPI click filters", () => {
    const kpi = doctorKpis.find((item) => item.id === "ready-human-review");
    expect(kpi && getKpiFilter(kpi)).toEqual({
      readinessStatus: "Ready for Human Review",
    });
  });

  it("validates factual manual override input", () => {
    expect(
      manualOverrideSchema.safeParse({
        authorizedRole: "Doctor",
        overrideOutcome: "Request secondary clinical review",
        reason: "Source record is incomplete and needs a second clinical review.",
      }).success,
    ).toBe(true);

    expect(
      manualOverrideSchema.safeParse({
        authorizedRole: "Doctor",
        overrideOutcome: "Request secondary clinical review",
        reason: "AI approved guaranteed coverage.",
      }).success,
    ).toBe(false);
  });

  it("returns 0 percent for zero denominator without NaN or Infinity", () => {
    expect(safePercent(0, 0)).toBe(0);
    expect(safePercent(5, 0)).toBe(0);
    expect(Number.isFinite(safePercent(0, 0))).toBe(true);
  });

  it("does not fabricate visit volume when canonical workflow has zero visits", () => {
    const heatmap = buildVisitVolumeHeatmap([
      { status: "Waiting", count: 0 },
      { status: "In Consultation", count: 0 },
      { status: "Pharmacy", count: 0 },
      { status: "Pending Evidence", count: 0 },
      { status: "Ready for Human Review", count: 0 },
      { status: "Completed", count: 0 },
    ]);

    expect(heatmap).toHaveLength(42);
    expect(heatmap.every((cell) => cell.count === 0)).toBe(true);
  });

  it("keeps visit volume consistent with today's authorized visit scope", () => {
    const heatmap = buildVisitVolumeHeatmap([
      { status: "Waiting", count: 1 },
      { status: "In Consultation", count: 0 },
      { status: "Pharmacy", count: 0 },
      { status: "Pending Evidence", count: 0 },
      { status: "Ready for Human Review", count: 0 },
      { status: "Completed", count: 0 },
    ]);

    expect(heatmap.reduce((total, cell) => total + cell.count, 0)).toBe(1);
  });

  it("empties Batch E risk, cost, variance, and alert charts when authorized canonical visits are zero", () => {
    expect(buildClaimRiskMatrix([]).every((cell) => cell.cases === 0)).toBe(true);
    expect(buildVisitCostTrend([], [])).toEqual([]);
    expect(buildCostVarianceBridge([], [])).toEqual([]);
    expect(buildEconomicAlerts([])).toEqual([]);
  });

  it("derives Batch E risk and alert counts only from authorized canonical visits", () => {
    const riskMatrix = buildClaimRiskMatrix([canonicalVisit]);
    const alerts = buildEconomicAlerts([canonicalVisit]);

    expect(riskMatrix.reduce((total, cell) => total + cell.cases, 0)).toBe(1);
    expect(alerts).toEqual([
      { label: "High-cost imaging review", count: 1, impact: 0 },
    ]);
    expect(JSON.stringify({ riskMatrix, alerts })).not.toContain("182000");
    expect(JSON.stringify({ riskMatrix, alerts })).not.toContain("121000");
  });

  it("does not introduce cost chart data without canonical cost input even when authorized visits exist", () => {
    expect(buildVisitCostTrend([canonicalVisit], [
      { date: "27 Jul", minutes: 45, targetMinutes: 60 },
    ])).toEqual([]);
    expect(buildCostVarianceBridge([canonicalVisit], [])).toEqual([]);
  });

  it("keeps Batch E chart empty states stable after filters remove all authorized results", () => {
    const filteredVisits = filterWorklist([canonicalVisit], {
      ...baseFilters,
      riskLevel: "Critical",
    });

    expect(filteredVisits).toEqual([]);
    expect(buildClaimRiskMatrix(filteredVisits).every((cell) => cell.cases === 0)).toBe(true);
    expect(buildVisitCostTrend(filteredVisits, [])).toEqual([]);
    expect(buildCostVarianceBridge(filteredVisits, [])).toEqual([]);
    expect(buildEconomicAlerts(filteredVisits)).toEqual([]);
  });
});

describe("doctor dashboard narrative gating", () => {
  const zeroData: DoctorDashboardData = {
    ...doctorDashboardMock,
    visits: [],
    selectedVisit: null,
    workflow: doctorDashboardMock.workflow.map((item) => ({ ...item, count: 0 })),
    readinessMix: doctorDashboardMock.readinessMix.map((item) => ({ ...item, count: 0 })),
    readinessTrend: [],
    timeToReadiness: [],
    missingEvidence: [],
    heatmap: [],
    auditActivity: [],
  };

  it("renders neutral zero-data narratives instead of stale operational insight claims", () => {
    const html = renderDoctorDashboard(zeroData);

    expect(html).toContain("No authorized canonical data is available for this insight.");
    expect(html).toContain("No authorized canonical cases for claim risk analysis.");
    expect(html).toContain("No authorized visit selected");
    expect(html).not.toContain("Actual readiness is improving but still below the 85% target threshold.");
    expect(html).not.toContain("Top two gaps drive 54% of current readiness blockers.");
    expect(html).not.toMatch(/\b\d{1,3}% of current readiness blockers\b/);
    expect(html).not.toContain("Late morning demand is the likely staffing pressure window.");
    expect(html).not.toContain("below the 85% target");
  });

  it("labels static policy reference text as Reference instead of unsupported Insight when canonical visits are zero", () => {
    const html = renderDoctorDashboard(zeroData);
    const referenceText = "80/20 reference is static guidance only; measured gap ranking requires authorized canonical data.";
    const referenceIndex = html.indexOf(referenceText);

    expect(referenceIndex).toBeGreaterThan(-1);
    expect(html.slice(Math.max(0, referenceIndex - 400), referenceIndex)).toContain("Reference");
    expect(html.slice(Math.max(0, referenceIndex - 400), referenceIndex)).not.toContain("Insight");
  });

  it("describes current readiness against target without trend language when only one canonical readiness point exists", () => {
    const html = renderDoctorDashboard({
      ...doctorDashboardMock,
      readinessTrend: [{ date: "28 Jul", actual: 82, target: 85, previous: 82 }],
    });

    expect(html).toContain("Current readiness is 82%, below the 85% target threshold.");
    expect(html).not.toMatch(/\breadiness is (improving|declining|stable)\b/);
    expect(html).not.toContain("previous-period context");
  });

  it("allows mathematically supported readiness trend language when two or more canonical points exist", () => {
    const html = renderDoctorDashboard({
      ...doctorDashboardMock,
      readinessTrend: [
        { date: "27 Jul", actual: 78, target: 85, previous: 78 },
        { date: "28 Jul", actual: 82, target: 85, previous: 82 },
      ],
    });

    expect(html).toContain("Actual readiness is improving and below the 85% target threshold.");
  });

  it("keeps zero readiness points neutral", () => {
    const html = renderDoctorDashboard({
      ...doctorDashboardMock,
      readinessTrend: [],
    });

    expect(html).toContain("No authorized canonical data is available for this insight.");
    expect(html).not.toMatch(/\breadiness is (improving|declining|stable)\b/);
    expect(html).not.toContain("Current readiness is");
  });

  it("does not display evidence contribution percentages without canonical evidence distribution", () => {
    const html = renderDoctorDashboard({
      ...doctorDashboardMock,
      missingEvidence: [],
    });

    expect(html).toContain("Canonical evidence-gap distribution is unavailable.");
    expect(html).not.toMatch(/\b\d{1,3}% of current readiness blockers\b/);
    expect(html).not.toContain("Top two gaps drive");
  });

  it("displays evidence contribution text when canonical evidence distribution supports it", () => {
    const html = renderDoctorDashboard({
      ...doctorDashboardMock,
      missingEvidence: [
        { gapType: "SOAP Plan Rationale", count: 8, cumulativePercent: 31 },
        { gapType: "Imaging Report", count: 6, cumulativePercent: 54 },
      ],
    });

    expect(html).toContain("Top two gaps drive 54% of current readiness blockers.");
  });

  it("preserves data-derived narrative when authorized canonical data is available", () => {
    const html = renderDoctorDashboard(doctorDashboardMock);

    expect(html).toContain("Late morning demand is the likely staffing pressure window.");
    expect(html).toContain("Actual readiness is improving and below the 85% target threshold.");
    expect(html).toContain("Top two gaps drive 54% of current readiness blockers.");
    expect(html).not.toContain("No authorized canonical data is available for this insight.");
    expect(html).not.toContain("No authorized canonical cases for claim risk analysis.");
  });
});

describe("doctor dashboard selected visit filter consistency", () => {
  const canonicalSelectedVisit = buildReadinessDetail(canonicalVisit);
  const canonicalDashboardData: DoctorDashboardData = {
    ...doctorDashboardMock,
    visits: [canonicalVisit],
    selectedVisit: canonicalSelectedVisit,
  };

  it("keeps the canonical selected visit visible when search matches DEMO-VIS-BATCH-E-001", () => {
    const filteredVisits = filterWorklist([canonicalVisit], {
      ...baseFilters,
      search: "DEMO-VIS-BATCH-E-001",
    });
    const html = renderDoctorDashboard({
      ...canonicalDashboardData,
      visits: filteredVisits,
    });

    expect(filteredVisits).toHaveLength(1);
    expect(html).toContain("Showing 1 of 1 visits.");
    expect(html).toContain("Showing 1 of 1 · Last updated 10:24");
    expect(html).toContain("Visit DEMO-VIS-BATCH-E-001");
    expect(html).toContain("Canonical Patient");
    expect(html).not.toContain("No authorized visit selected");
  });

  it("renders zero filtered queues and safe empty detail state when search matches NO-SUCH-VISIT", () => {
    const filteredVisits = filterWorklist([canonicalVisit], {
      ...baseFilters,
      search: "NO-SUCH-VISIT",
    });
    const html = renderDoctorDashboard({
      ...canonicalDashboardData,
      visits: filteredVisits,
    });

    expect(filteredVisits).toEqual([]);
    expect(html).toContain("Showing 0 of 0 visits.");
    expect(html).toContain("Showing 0 of 0 · Last updated 10:24");
    expect(html).toContain("No visits match the current filters.");
    expect(html).toContain("No authorized visit selected");
    expect(html).not.toContain("Visit DEMO-VIS-BATCH-E-001");
    expect(html).not.toContain("Canonical Patient");
  });

  it("restores the canonical selected visit detail when search is cleared", () => {
    const filteredVisits = filterWorklist([canonicalVisit], {
      ...baseFilters,
      search: "",
    });
    const html = renderDoctorDashboard({
      ...canonicalDashboardData,
      visits: filteredVisits,
    });

    expect(filteredVisits).toHaveLength(1);
    expect(html).toContain("Showing 1 of 1 visits.");
    expect(html).toContain("Showing 1 of 1 · Last updated 10:24");
    expect(html).toContain("Visit DEMO-VIS-BATCH-E-001");
    expect(html).toContain("Canonical Patient");
    expect(html).not.toContain("No authorized visit selected");
  });

  it("does not auto-select another filtered visit when the current selected visit is excluded", () => {
    const alternateVisit = {
      ...doctorWorklistVisits[1],
      id: "DEMO-VIS-BATCH-E-ALT",
      patientName: "Alternate Filtered Patient",
    } satisfies DoctorWorklistVisit;
    const html = renderDoctorDashboard({
      ...canonicalDashboardData,
      visits: [alternateVisit],
    });

    expect(html).toContain("Showing 1 of 1 visits.");
    expect(html).toContain("DEMO-VIS-BATCH-E-ALT");
    expect(html).toContain("No authorized visit selected");
    expect(html).not.toContain("Visit DEMO-VIS-BATCH-E-001");
    expect(html).not.toContain("Alternate Filtered Patient</h2>");
  });
});
