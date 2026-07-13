import "server-only";

import { validateDashboardFilters } from "../domain/validation";
import type {
  DashboardResponseEnvelope,
  ExecutiveDashboardSummary,
} from "../domain/types";
import { appendDashboardAuditEvent } from "./audit";
import { ExecutiveDashboardError } from "./errors";
import { getExecutiveDashboardActor } from "./identity";
import { getExecutiveDashboard as getExecutiveDashboardFromRepository } from "./mock-repository";
import { requireDashboardPermission, requireDashboardScope } from "./rbac";

export const executiveDashboardService = {
  async getDashboard(
    input: Record<string, string | string[] | undefined>,
  ): Promise<DashboardResponseEnvelope<ExecutiveDashboardSummary>> {
    const correlationId = createCorrelationId();
    const generatedAt = new Date().toISOString();

    try {
      const parsed = validateDashboardFilters(input);
      if (!parsed.ok) {
        throw new ExecutiveDashboardError("validation_error", parsed.error);
      }

      const actor = await getExecutiveDashboardActor();
      requireDashboardPermission(actor, "executiveDashboard.view");
      requireDashboardScope(actor, parsed.value);

      await appendDashboardAuditEvent({
        action: "dashboard_viewed",
        actor,
        filters: parsed.value,
        reason: "Executive Dashboard MVP 1 viewed.",
        after: JSON.stringify({
          organizationId: parsed.value.organizationId,
          clinicId: parsed.value.clinicId,
          dateFrom: parsed.value.dateFrom,
          dateTo: parsed.value.dateTo,
        }),
      });

      if (hasAppliedFilters(input)) {
        await appendDashboardAuditEvent({
          action: "filters_applied",
          actor,
          filters: parsed.value,
          reason: "Executive Dashboard filters applied.",
          after: JSON.stringify(parsed.value),
        });
      }

      return {
        success: true,
        data: await getExecutiveDashboardFromRepository(parsed.value, actor),
        meta: { correlationId, generatedAt },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        meta: { correlationId, generatedAt },
        error: toSafeError(error),
      };
    }
  },
};

function hasAppliedFilters(input: Record<string, string | string[] | undefined>) {
  return Object.keys(input).some((key) =>
    [
      "organizationId",
      "clinicId",
      "department",
      "payer",
      "riskLevel",
      "claimStatus",
      "dateFrom",
      "dateTo",
    ].includes(key),
  );
}

function toSafeError(error: unknown) {
  if (error instanceof ExecutiveDashboardError) {
    return {
      code: error.code.toUpperCase(),
      message: error.message,
    };
  }

  return {
    code: "DASHBOARD_FAILED",
    message: "Executive dashboard data could not be loaded safely.",
  };
}

function createCorrelationId() {
  return `exec-dashboard-${Date.now()}`;
}
