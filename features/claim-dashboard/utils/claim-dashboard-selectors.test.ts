import { describe, expect, it } from "vitest";
import { claimWorklistMock, defaultClaimDashboardFilters } from "../data/claim-dashboard.mock";
import { filterClaimWorklist } from "./claim-dashboard-selectors";
import type { ClaimDashboardState } from "../types/claim-dashboard.types";

const baseState: ClaimDashboardState = {
  filters: defaultClaimDashboardFilters,
  search: "",
  selectedKpi: "all",
  selectedHeatmapCell: null,
  selectedPayer: "",
  selectedEvidenceCategory: "",
};

describe("filterClaimWorklist", () => {
  it("searches by claim, visit, patient, payer, and ICD-10", () => {
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, search: "VIS-88431" })).toHaveLength(1);
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, search: "somchai" })).toHaveLength(1);
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, search: "J06.9" })).toHaveLength(1);
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, search: "FWD" })).toHaveLength(2);
  });

  it("applies KPI and heatmap filters", () => {
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, selectedKpi: "ready" }).map((item) => item.readiness)).toEqual(["READY", "READY", "READY"]);
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, selectedKpi: "evidence" })).toHaveLength(5);
    expect(filterClaimWorklist(claimWorklistMock, { ...baseState, selectedHeatmapCell: { category: "Clinical", severity: "CRITICAL" } }).map((item) => item.id)).toEqual(["CLM-2026-01074", "CLM-2026-01061"]);
  });

  it("applies dropdown filters together", () => {
    const rows = filterClaimWorklist(claimWorklistMock, {
      ...baseState,
      filters: { ...defaultClaimDashboardFilters, payer: "Allianz Ayudhya", sla: "overdue" },
    });

    expect(rows.map((item) => item.id)).toEqual(["CLM-2026-01074", "CLM-2026-01044"]);
  });
});
