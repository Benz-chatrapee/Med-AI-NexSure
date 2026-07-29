import "server-only";

import type {
  DoctorDashboardClaimMutationContext,
  DoctorDashboardData,
  DoctorDashboardFilters,
  DoctorDashboardMutationPrerequisiteInput,
  DoctorDashboardMutationPrerequisiteResult,
} from "../types/doctor-dashboard.types";
import {
  validateDoctorDashboardFilters,
  validateDoctorDashboardMutationPrerequisiteInput,
} from "../domain/validation";
import {
  appendDoctorDashboardAuditEvent,
  appendDoctorDashboardMutationPrerequisiteAuditEvent,
} from "./audit";
import { DoctorDashboardError } from "./errors";
import { resolveDoctorDashboardActor, type DoctorDashboardActor, type DoctorDashboardActorResult } from "./identity";
import {
  exportDoctorDashboardCsv,
  readDoctorDashboard,
  resolveDoctorDashboardClaimMutationContext,
} from "./repository";
import {
  requireDoctorDashboardClaimTenantPreflight,
  requireDoctorDashboardMutationPreflight,
  requireDoctorDashboardReadPermission,
  requireDoctorDashboardScope,
} from "./rbac";

export type DoctorDashboardResponseEnvelope<T> = {
  success: boolean;
  data: T | null;
  meta: {
    correlationId: string;
    generatedAt: string;
  };
  error: {
    code: string;
    message: string;
  } | null;
};

type ServiceDependencies = {
  resolveActor?: () => Promise<DoctorDashboardActorResult>;
  readDashboard?: (
    client: unknown,
    actor: DoctorDashboardActor,
    filters: DoctorDashboardFilters,
  ) => Promise<DoctorDashboardData>;
  resolveClaimContext?: (
    client: unknown,
    actor: DoctorDashboardActor,
    visitId: string,
  ) => Promise<DoctorDashboardClaimMutationContext>;
  appendMutationPrerequisiteAuditEvent?: typeof appendDoctorDashboardMutationPrerequisiteAuditEvent;
  executeMutation?: never;
};

export async function getDoctorDashboard(
  input: Record<string, string | string[] | undefined>,
  dependencies: ServiceDependencies = {},
): Promise<DoctorDashboardResponseEnvelope<DoctorDashboardData>> {
  const correlationId = createCorrelationId();
  const generatedAt = new Date().toISOString();

  try {
    const parsed = validateDoctorDashboardFilters(input);
    if (!parsed.ok) {
      throw new DoctorDashboardError("VALIDATION_ERROR", parsed.error);
    }

    const actorResult = await (dependencies.resolveActor ?? resolveDoctorDashboardActor)();
    if (!actorResult.ok) {
      throw new DoctorDashboardError(actorResult.code, actorResult.message);
    }

    requireDoctorDashboardReadPermission(actorResult.value);
    requireDoctorDashboardScope(actorResult.value, parsed.value);

    await appendDoctorDashboardAuditEvent();

    const dashboard = await (dependencies.readDashboard ?? readDoctorDashboard)(
      actorResult.client,
      actorResult.value,
      parsed.value,
    );

    return {
      success: true,
      data: withDeferredMutations(dashboard),
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
}

export async function exportDoctorDashboard(
  input: Record<string, string | string[] | undefined>,
  dependencies: ServiceDependencies = {},
) {
  const dashboard = await getDoctorDashboard(input, dependencies);
  if (!dashboard.success || !dashboard.data) return dashboard;

  return {
    ...dashboard,
    data: exportDoctorDashboardCsv(dashboard.data, normalizeStringFilters(input)),
  };
}

export async function prepareDoctorDashboardMutationPrerequisite(
  input: Record<string, string | string[] | undefined>,
  dependencies: ServiceDependencies = {},
): Promise<DoctorDashboardResponseEnvelope<DoctorDashboardMutationPrerequisiteResult>> {
  const correlationId = createCorrelationId();
  const generatedAt = new Date().toISOString();
  let actor: DoctorDashboardActor | null = null;
  let parsedInput: DoctorDashboardMutationPrerequisiteInput | null = null;
  let claimContext: DoctorDashboardClaimMutationContext | null = null;

  try {
    const parsed = validateDoctorDashboardMutationPrerequisiteInput(input);
    if (!parsed.ok) {
      throw new DoctorDashboardError("VALIDATION_ERROR", parsed.error);
    }
    parsedInput = parsed.value;

    const actorResult = await (dependencies.resolveActor ?? resolveDoctorDashboardActor)();
    if (!actorResult.ok) {
      throw new DoctorDashboardError(actorResult.code, actorResult.message);
    }
    actor = actorResult.value;

    requireDoctorDashboardMutationPreflight(actor);
    claimContext = await (dependencies.resolveClaimContext ?? resolveDoctorDashboardClaimMutationContext)(
      actorResult.client,
      actor,
      parsed.value.visitId,
    );
    requireDoctorDashboardClaimTenantPreflight(actor, claimContext, parsed.value.visitId);

    await (dependencies.appendMutationPrerequisiteAuditEvent ?? appendDoctorDashboardMutationPrerequisiteAuditEvent)({
      correlationId,
      actorProfileId: actor.profileId,
      organizationId: claimContext.claimOrganizationId,
      clinicId: claimContext.claimClinicId,
      visitId: parsed.value.visitId,
      claimId: claimContext.claimId,
      action: parsed.value.action,
      reasonCode: parsed.value.reasonCode,
      idempotencyKey: parsed.value.idempotencyKey,
      externalEventId: parsed.value.externalEventId,
      result: "prerequisite_passed_no_mutation",
    });

    return {
      success: true,
      data: {
        available: false,
        action: parsed.value.action,
        claimContext,
        correlationId,
        idempotencyKey: parsed.value.idempotencyKey,
        externalEventId: parsed.value.externalEventId,
        reasonCode: parsed.value.reasonCode,
        mutationExecuted: false,
      },
      meta: { correlationId, generatedAt },
      error: null,
    };
  } catch (error) {
    if (actor && parsedInput) {
      await (dependencies.appendMutationPrerequisiteAuditEvent ?? appendDoctorDashboardMutationPrerequisiteAuditEvent)({
        correlationId,
        actorProfileId: actor.profileId,
        organizationId: actor.activeOrganizationId,
        clinicId: actor.activeClinicId ?? "",
        visitId: parsedInput.visitId,
        claimId: claimContext?.claimId ?? null,
        action: parsedInput.action,
        reasonCode: parsedInput.reasonCode,
        idempotencyKey: parsedInput.idempotencyKey,
        externalEventId: parsedInput.externalEventId,
        result: "prerequisite_failed_no_mutation",
      });
    }

    return {
      success: false,
      data: null,
      meta: { correlationId, generatedAt },
      error: toSafeError(error),
    };
  }
}

function withDeferredMutations(dashboard: DoctorDashboardData): DoctorDashboardData {
  return {
    ...dashboard,
    mutationAvailability: {
      reevaluate: false,
      assignReviewer: false,
      manualOverride: false,
      claimReviewHandoff: false,
    },
  };
}

function toSafeError(error: unknown) {
  if (error instanceof DoctorDashboardError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Error && error.message === "claim_context_unavailable") {
    return {
      code: "CLAIM_CONTEXT_UNAVAILABLE",
      message: "Canonical claim context is unavailable for this Doctor Dashboard action.",
    };
  }

  return {
    code: "DASHBOARD_FAILED",
    message: "Doctor dashboard data could not be loaded safely.",
  };
}

function normalizeStringFilters(input: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value ?? ""]),
  );
}

function createCorrelationId() {
  return `doctor-dashboard-${Date.now()}`;
}
