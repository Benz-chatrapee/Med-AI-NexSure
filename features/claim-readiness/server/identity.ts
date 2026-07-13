import type { ActorContext } from "../domain/types";

export async function getMockActor(): Promise<ActorContext> {
  return {
    actorId: "actor-clinical-001",
    organizationId: "org-nexsure-demo",
    clinicId: "clinic-bangkok-01",
    role: "doctor",
    capabilities: [
      "claimReadiness.view",
      "claimReadiness.review",
      "documentationTask.create",
      "documentationTask.update",
      "audit.view",
      "payerRule.view",
    ],
  };
}
