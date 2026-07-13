import type {
  DoctorDashboardFilters,
  DoctorKpi,
  DoctorWorklistVisit,
  PriorityLevel,
  ReadinessStatus,
  RiskLevel,
  StatusTone,
} from "../types/doctor-dashboard.types";

export const READINESS_THRESHOLDS = {
  review: 60,
  ready: 85,
} as const;

export const READINESS_WEIGHTS = {
  soap: 25,
  diagnosisAndIcd: 20,
  prescriptionOrProcedure: 15,
  evidence: 20,
  insuranceRule: 10,
  economic: 10,
} as const;

const priorityRank: Record<PriorityLevel, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getReadinessStatus(score: number): ReadinessStatus {
  const safeScore = clampScore(score);
  if (safeScore >= READINESS_THRESHOLDS.ready) return "Ready for Human Review";
  if (safeScore >= READINESS_THRESHOLDS.review) return "Needs Review";
  return "Not Ready";
}

export function getReadinessTone(status: ReadinessStatus): StatusTone {
  const tones = {
    "Ready for Human Review": "success",
    "Needs Review": "warning",
    "Not Ready": "danger",
  } satisfies Record<ReadinessStatus, StatusTone>;
  return tones[status];
}

export function getPointsToReady(score: number): number {
  return Math.max(0, READINESS_THRESHOLDS.ready - clampScore(score));
}

export function formatDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function canSendToClaimReview(visit: DoctorWorklistVisit): boolean {
  return visit.blockingGapCount === 0 && visit.readinessStatus === "Ready for Human Review";
}

export function sortWorklist(visits: DoctorWorklistVisit[]): DoctorWorklistVisit[] {
  return [...visits].sort((a, b) => {
    const priorityDiff = priorityRank[b.priority] - priorityRank[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.pendingMinutes - a.pendingMinutes;
  });
}

export function filterWorklist(
  visits: DoctorWorklistVisit[],
  filters: DoctorDashboardFilters,
): DoctorWorklistVisit[] {
  const query = filters.search.trim().toLowerCase();
  return sortWorklist(
    visits.filter((visit) => {
      const searchable = [
        visit.patientName,
        visit.hn,
        visit.id,
        visit.payerName,
        visit.diagnosisCode,
        visit.diagnosisLabel,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!filters.readinessStatus || visit.readinessStatus === filters.readinessStatus) &&
        (!filters.riskLevel || visit.riskLevel === filters.riskLevel) &&
        (!filters.visitStatus || visit.visitStatus === filters.visitStatus) &&
        (!filters.priority || visit.priority === filters.priority) &&
        (!filters.gapType || visit.primaryGap === filters.gapType)
      );
    }),
  );
}

export function getKpiFilter(kpi: DoctorKpi): Partial<DoctorDashboardFilters> {
  return kpi.targetFilter ?? {};
}

export function toPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}

export function riskTone(level: RiskLevel): StatusTone {
  const tones = {
    Low: "success",
    Medium: "info",
    High: "warning",
    Critical: "danger",
  } satisfies Record<RiskLevel, StatusTone>;
  return tones[level];
}
