import { describe, expect, it } from "vitest";
import { DEFAULT_DASHBOARD_FILTERS, validateDashboardFilters } from "./validation";

describe("executive dashboard filter validation", () => {
  it("accepts readinessStatus as the readiness filter", () => {
    const result = validateDashboardFilters({
      ...DEFAULT_DASHBOARD_FILTERS,
      readinessStatus: "ready",
    });
    expect(result).toEqual({
      ok: true,
      value: { ...DEFAULT_DASHBOARD_FILTERS, readinessStatus: "ready" },
    });
  });

  it("rejects unsupported readiness values", () => {
    const result = validateDashboardFilters({
      ...DEFAULT_DASHBOARD_FILTERS,
      readinessStatus: "approved",
    });
    expect(result).toEqual({ ok: false, error: "Invalid readiness status filter." });
  });
});
