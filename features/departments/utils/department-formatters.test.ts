import { describe, expect, it } from "vitest";
import { evidenceAgingLabel, readinessStatusFromScore } from "./department-formatters";

describe("department formatters", () => {
  it("maps Med AI NexSure readiness thresholds", () => {
    expect(readinessStatusFromScore(85)).toBe("ready");
    expect(readinessStatusFromScore(84)).toBe("needs_review");
    expect(readinessStatusFromScore(59)).toBe("not_ready");
  });

  it("labels evidence aging buckets", () => {
    expect(evidenceAgingLabel(12)).toBe("Under 24 Hours");
    expect(evidenceAgingLabel(72)).toBe("1-3 Days");
    expect(evidenceAgingLabel(73)).toBe("Over 3 Days");
  });
});
