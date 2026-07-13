import "server-only";

import { validateDocumentationTask } from "../domain/rules";
import type { CreateDocumentationTaskInput } from "../domain/types";
import { appendAuditEvent } from "./audit";
import { requireCapability } from "./capabilities";
import { ClaimReadinessError } from "./errors";
import { getMockActor } from "./identity";
import {
  createDocumentationTask as createTaskInRepository,
  getEncounterReadiness as getEncounterFromRepository,
  getExecutiveDashboard as getExecutiveDashboardFromRepository,
  listEncounterReadiness as listEncountersFromRepository,
} from "./mock-repository";

export const claimReadinessService = {
  async getExecutiveDashboard() {
    const actor = await getMockActor();
    requireCapability(actor, "claimReadiness.view");
    requireCapability(actor, "payerRule.view");

    const dashboard = await getExecutiveDashboardFromRepository();

    await appendAuditEvent({
      organizationId: actor.organizationId,
      clinicId: actor.clinicId,
      actorId: actor.actorId,
      module: "claim_readiness",
      action: "view_dashboard",
      entityType: "encounter",
      entityId: "executive-dashboard-mvp1",
      metadata: {
        averageReadiness: dashboard.kpis.averageReadiness,
        evidencePackageCompleteness:
          dashboard.kpis.evidencePackageCompleteness,
        payerRulesActive: dashboard.kpis.payerRulesActive,
        payerRulesNeedReview: dashboard.kpis.payerRulesNeedReview,
      },
    });

    return dashboard;
  },

  async listEncounterReadiness(
    query: Parameters<typeof listEncountersFromRepository>[0],
  ) {
    const actor = await getMockActor();
    requireCapability(actor, "claimReadiness.view");

    await appendAuditEvent({
      organizationId: actor.organizationId,
      clinicId: actor.clinicId,
      actorId: actor.actorId,
      module: "claim_readiness",
      action: "view_queue",
      entityType: "encounter",
      entityId: "claim-readiness-queue",
      metadata: {
        q: query.q,
        risk: query.risk,
        payer: query.payer,
        department: query.department,
      },
    });

    return listEncountersFromRepository(query);
  },

  async getEncounterReadiness(encounterId: string) {
    const actor = await getMockActor();
    requireCapability(actor, "claimReadiness.view");

    const detail = await getEncounterFromRepository(encounterId);

    if (
      detail.organizationId !== actor.organizationId ||
      detail.clinicId !== actor.clinicId
    ) {
      throw new ClaimReadinessError(
        "tenant_scope_mismatch",
        "Encounter is outside the authorized organization or clinic scope.",
      );
    }

    await appendAuditEvent({
      organizationId: actor.organizationId,
      clinicId: actor.clinicId,
      actorId: actor.actorId,
      module: "claim_readiness",
      action: "view_detail",
      entityType: "encounter",
      entityId: encounterId,
      riskLevel: detail.riskLevel,
      metadata: {
        score: detail.readinessScore.total,
        gapCount: detail.gaps.length,
      },
    });

    return detail;
  },

  async createDocumentationTask(input: Partial<CreateDocumentationTaskInput>) {
    const actor = await getMockActor();
    requireCapability(actor, "documentationTask.create");

    const parsed = validateDocumentationTask(input);
    if (!parsed.ok) {
      throw new ClaimReadinessError("validation_error", parsed.error);
    }

    const before = await getEncounterFromRepository(parsed.value.encounterId);
    if (
      before.organizationId !== actor.organizationId ||
      before.clinicId !== actor.clinicId
    ) {
      throw new ClaimReadinessError(
        "tenant_scope_mismatch",
        "Encounter is outside the authorized organization or clinic scope.",
      );
    }

    const task = await createTaskInRepository(parsed.value, actor.actorId);

    await appendAuditEvent({
      organizationId: actor.organizationId,
      clinicId: actor.clinicId,
      actorId: actor.actorId,
      module: "claim_readiness",
      action: "create_documentation_task",
      entityType: "documentation_task",
      entityId: task.id,
      riskLevel: before.riskLevel,
      metadata: {
        encounterId: task.encounterId,
        gapId: task.gapId,
        category: task.category,
        priority: task.priority,
        beforeStatus: "open",
        afterStatus: task.status,
      },
    });

    return task;
  },
};
