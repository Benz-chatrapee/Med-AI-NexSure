import type {
  DoctorDashboardFilters,
  DoctorDashboardMutationAction,
  DoctorDashboardMutationPrerequisiteInput,
} from "../types/doctor-dashboard.types";

const dateRanges = ["today", "7d", "14d"] as const;
const readinessStatuses = ["Ready for Human Review", "Needs Review", "Not Ready"] as const;
const riskLevels = ["Low", "Medium", "High", "Critical"] as const;
const visitStatuses = [
  "Waiting",
  "In Consultation",
  "Pharmacy",
  "Pending Evidence",
  "Ready for Human Review",
  "Completed",
] as const;
const priorities = ["Low", "Medium", "High", "Critical"] as const;
const mutationActions = [
  "markReadyForHumanReview",
  "claimReviewHandoff",
  "readinessReevaluation",
  "reviewerAssignment",
  "manualOverride",
] as const;
const reasonCodePattern = /^[A-Z][A-Z0-9_]{2,63}$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export type DoctorDashboardValidationResult =
  | { ok: true; value: DoctorDashboardFilters }
  | { ok: false; error: string };

export type DoctorDashboardMutationPrerequisiteValidationResult =
  | { ok: true; value: DoctorDashboardMutationPrerequisiteInput }
  | { ok: false; error: string };

export function emptyDoctorDashboardFilters(): DoctorDashboardFilters {
  return {
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
  };
}

export function validateDoctorDashboardFilters(
  input: Partial<Record<keyof DoctorDashboardFilters, string>> | Record<string, string | string[] | undefined>,
): DoctorDashboardValidationResult {
  const defaults = emptyDoctorDashboardFilters();
  const next = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof DoctorDashboardFilters)[]) {
    const rawValue = input[key];
    next[key] = (Array.isArray(rawValue) ? rawValue[0] : rawValue ?? defaults[key]).trim() as never;
  }

  if (!includes(dateRanges, next.dateRange)) return invalid();
  if (next.readinessStatus && !includes(readinessStatuses, next.readinessStatus)) return invalid();
  if (next.riskLevel && !includes(riskLevels, next.riskLevel)) return invalid();
  if (next.visitStatus && !includes(visitStatuses, next.visitStatus)) return invalid();
  if (next.priority && !includes(priorities, next.priority)) return invalid();

  return { ok: true, value: next };
}

export function validateDoctorDashboardMutationPrerequisiteInput(
  input: Record<string, string | string[] | undefined>,
): DoctorDashboardMutationPrerequisiteValidationResult {
  const visitId = normalizeInputValue(input.visitId);
  const action = normalizeInputValue(input.action);
  const reasonCode = normalizeInputValue(input.reasonCode);
  const idempotencyKey = normalizeInputValue(input.idempotencyKey);
  const externalEventId = normalizeInputValue(input.externalEventId);

  if (!visitId) return invalidMutationInput();
  if (!includes(mutationActions, action)) return invalidMutationInput();
  if (!reasonCodePattern.test(reasonCode)) return invalidMutationInput();
  if (!identityPattern.test(idempotencyKey)) return invalidMutationInput();
  if (!identityPattern.test(externalEventId)) return invalidMutationInput();

  return {
    ok: true,
    value: {
      visitId,
      action: action as DoctorDashboardMutationAction,
      reasonCode,
      idempotencyKey,
      externalEventId,
    },
  };
}

function includes<const T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.includes(value);
}

function invalid(): DoctorDashboardValidationResult {
  return { ok: false, error: "Doctor dashboard filters are invalid." };
}

function invalidMutationInput(): DoctorDashboardMutationPrerequisiteValidationResult {
  return {
    ok: false,
    error: "Doctor dashboard mutation prerequisite input is invalid.",
  };
}

function normalizeInputValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value ?? "").trim();
}
