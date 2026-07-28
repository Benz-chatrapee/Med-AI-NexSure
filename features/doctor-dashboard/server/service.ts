import "server-only";

import type { DoctorDashboardData, DoctorDashboardFilters } from "../types/doctor-dashboard.types";
import { validateDoctorDashboardFilters } from "../domain/validation";
import { appendDoctorDashboardAuditEvent } from "./audit";
import { DoctorDashboardError } from "./errors";
import { resolveDoctorDashboardActor, type DoctorDashboardActor, type DoctorDashboardActorResult } from "./identity";
import { exportDoctorDashboardCsv, readDoctorDashboard } from "./repository";
import { requireDoctorDashboardReadPermission, requireDoctorDashboardScope } from "./rbac";

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
