import { describe, expect, it } from "vitest";
import { matchesVisitReadiness, visitRecords } from "./data";

describe("visit list readiness naming", () => {
  it("filters visits by readinessStatus without implying claim approval", () => {
    const ready = visitRecords.filter((visit) => matchesVisitReadiness(visit, "Ready"));
    expect(ready.length).toBeGreaterThan(0);
    expect(ready.every((visit) => visit.readinessStatus === "Ready")).toBe(true);
  });

  it("preserves the Calculating presentation state when readinessScore is unavailable", () => {
    const calculating = visitRecords.find((visit) => visit.readinessStatus === "Calculating");
    expect(calculating?.readinessScore).toBeNull();
  });
});
