import { describe, expect, it } from "vitest";
import { doctorKpis, doctorWorklistVisits } from "../data/doctor-dashboard.mock";
import { manualOverrideSchema } from "../schemas/manual-override.schema";
import {
  canSendToClaimReview,
  filterWorklist,
  formatDuration,
  getKpiFilter,
  getPointsToReady,
  getReadinessStatus,
} from "./doctor-dashboard.utils";

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
});
