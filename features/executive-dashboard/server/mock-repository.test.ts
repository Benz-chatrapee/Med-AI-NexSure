import { describe, expect, it } from "vitest";
import { DEFAULT_DASHBOARD_FILTERS } from "../domain/validation";
import { getExecutiveDashboard } from "./mock-repository";
import type { ExecutiveDashboardActor } from "../domain/types";

const actor: ExecutiveDashboardActor = {
  actorId: "actor-1",
  role: "executive",
  organizationIds: ["org-nexsure-demo"],
  clinicIds: ["clinic-bangkok-01", "clinic-chiangmai-02"],
  permissions: ["executiveDashboard.view"],
};

describe("executive dashboard mock repository", () => {
  it("filters the worklist by readinessStatus", async () => {
    const result = await getExecutiveDashboard(
      { ...DEFAULT_DASHBOARD_FILTERS, readinessStatus: "not_ready" },
      actor,
    );
    expect(result.caseWorklist.length).toBeGreaterThan(0);
    expect(result.caseWorklist.every((item) => item.readinessStatus === "not_ready")).toBe(true);
  });

  it("keeps queue and readiness summary behavior after the rename", async () => {
    const result = await getExecutiveDashboard(DEFAULT_DASHBOARD_FILTERS, actor);
    const total = result.claimReadiness.ready + result.claimReadiness.needsReview + result.claimReadiness.notReady;
    expect(total).toBe(result.caseWorklist.length);
  });
});
