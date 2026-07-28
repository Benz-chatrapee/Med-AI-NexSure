import { describe, expect, it } from "vitest";
import { validateDoctorDashboardFilters } from "./validation";

describe("validateDoctorDashboardFilters", () => {
  it("normalizes empty input to canonical read defaults without demo values", () => {
    const result = validateDoctorDashboardFilters({});

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      dateRange: "today",
      clinic: "",
      department: "",
      doctor: "",
      search: "",
      readinessStatus: "",
      riskLevel: "",
      visitStatus: "",
      priority: "",
      gapType: "",
    });
  });

  it("rejects unsupported filter enum values before querying canonical data", () => {
    const result = validateDoctorDashboardFilters({
      dateRange: "forever",
      riskLevel: "Extreme",
    });

    expect(result).toEqual({
      ok: false,
      error: "Doctor dashboard filters are invalid.",
    });
  });
});
