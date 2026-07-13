import type {
  ClaimReadinessStatus,
  DashboardRiskLevel,
  DashboardValidationResult,
  ExecutiveDashboardFilters,
} from "./types";

const ORGANIZATIONS = ["org-nexsure-demo", "org-nexsure-north"] as const;
const CLINICS = ["all", "clinic-bangkok-01", "clinic-chiangmai-02"] as const;
const DEPARTMENTS = [
  "all",
  "Internal Medicine",
  "Orthopedics",
  "Cardiology",
  "Neurology",
] as const;
const PAYERS = ["all", "Aster Health", "BlueCare Plus", "Siam Shield"] as const;
const RISK_LEVELS: Array<DashboardRiskLevel | "all"> = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];
const CLAIM_STATUSES: Array<ClaimReadinessStatus | "all"> = [
  "all",
  "ready",
  "needs_review",
  "not_ready",
];

export const DEFAULT_DASHBOARD_FILTERS: ExecutiveDashboardFilters = {
  organizationId: "org-nexsure-demo",
  clinicId: "all",
  department: "all",
  payer: "all",
  riskLevel: "all",
  claimStatus: "all",
  dateFrom: "2026-07-01",
  dateTo: "2026-07-09",
};

export function validateDashboardFilters(
  input: Record<string, string | string[] | undefined>,
): DashboardValidationResult {
  const filters = {
    organizationId: readString(input.organizationId, DEFAULT_DASHBOARD_FILTERS.organizationId),
    clinicId: readString(input.clinicId, DEFAULT_DASHBOARD_FILTERS.clinicId),
    department: readString(input.department, DEFAULT_DASHBOARD_FILTERS.department),
    payer: readString(input.payer, DEFAULT_DASHBOARD_FILTERS.payer),
    riskLevel: readString(input.riskLevel, DEFAULT_DASHBOARD_FILTERS.riskLevel),
    claimStatus: readString(input.claimStatus, DEFAULT_DASHBOARD_FILTERS.claimStatus),
    dateFrom: readString(input.dateFrom, DEFAULT_DASHBOARD_FILTERS.dateFrom),
    dateTo: readString(input.dateTo, DEFAULT_DASHBOARD_FILTERS.dateTo),
  };

  if (!includes(ORGANIZATIONS, filters.organizationId)) {
    return { ok: false, error: "Invalid organization filter." };
  }
  if (!includes(CLINICS, filters.clinicId)) {
    return { ok: false, error: "Invalid clinic filter." };
  }
  if (!includes(DEPARTMENTS, filters.department)) {
    return { ok: false, error: "Invalid department filter." };
  }
  if (!includes(PAYERS, filters.payer)) {
    return { ok: false, error: "Invalid payer filter." };
  }
  if (!RISK_LEVELS.includes(filters.riskLevel as DashboardRiskLevel | "all")) {
    return { ok: false, error: "Invalid risk level filter." };
  }
  if (!CLAIM_STATUSES.includes(filters.claimStatus as ClaimReadinessStatus | "all")) {
    return { ok: false, error: "Invalid claim status filter." };
  }
  if (!isValidDate(filters.dateFrom) || !isValidDate(filters.dateTo)) {
    return { ok: false, error: "Date range must use YYYY-MM-DD dates." };
  }
  if (new Date(filters.dateFrom).getTime() > new Date(filters.dateTo).getTime()) {
    return { ok: false, error: "Date range start must be before date range end." };
  }

  return {
    ok: true,
    value: filters as ExecutiveDashboardFilters,
  };
}

function readString(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function includes<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.includes(value);
}
