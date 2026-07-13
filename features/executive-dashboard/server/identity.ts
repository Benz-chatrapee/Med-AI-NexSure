import type { ExecutiveDashboardActor } from "../domain/types";

export async function getExecutiveDashboardActor(): Promise<ExecutiveDashboardActor> {
  return {
    actorId: "actor-executive-001",
    role: "executive",
    organizationIds: ["org-nexsure-demo"],
    clinicIds: ["clinic-bangkok-01", "clinic-chiangmai-02"],
    permissions: [
      "executiveDashboard.view",
      "executiveDashboard.detail.view",
      "executiveDashboard.export",
    ],
  };
}
