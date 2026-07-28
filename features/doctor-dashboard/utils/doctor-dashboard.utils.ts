import type {
  DoctorDashboardFilters,
  DoctorKpi,
  DoctorWorklistVisit,
  PriorityLevel,
  ReadinessStatus,
  RiskLevel,
  StatusTone,
  VisitStatus,
  WorklistReadinessStatus,
} from "../types/doctor-dashboard.types";

export type ClaimRiskCell = {
  impact: string;
  likelihood: string;
  score: number;
  cases: number;
  tone: StatusTone;
};

export type VisitCostTrendPoint = {
  date: string;
  actual: number;
  benchmark?: number;
};

export type CostVarianceBridgeItem = {
  label: string;
  value: number;
  start: number;
  end: number;
  tone: "base" | "increase" | "decrease";
};

export type EconomicAlertItem = {
  label: string;
  count: number;
  impact: number;
};

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

const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"] as const;
const impactLabels = ["Minimal", "Minor", "Moderate", "Major", "Severe"] as const;

export function clampScore(score: number | null): number {
  if (score === null) return 0;
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getReadinessStatus(score: number): ReadinessStatus {
  const safeScore = clampScore(score);
  if (safeScore >= READINESS_THRESHOLDS.ready) return "Ready for Human Review";
  if (safeScore >= READINESS_THRESHOLDS.review) return "Needs Review";
  return "Not Ready";
}

export function getReadinessTone(status: WorklistReadinessStatus): StatusTone {
  const tones = {
    "Ready for Human Review": "success",
    "Needs Review": "warning",
    "Not Ready": "danger",
    "Assessment Unavailable": "info",
  } satisfies Record<WorklistReadinessStatus, StatusTone>;
  return tones[status];
}

export function getPointsToReady(score: number | null): number {
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

export function safePercent(value: number, denominator: number): number {
  return toPercent(value, denominator);
}

export function buildVisitVolumeHeatmap(
  workflow: Array<{ status: VisitStatus; count: number }>,
): Array<{ day: string; hour: string; count: number }> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["08", "10", "12", "14", "16", "18"];
  const total = workflow.reduce((sum, item) => sum + Math.max(0, item.count), 0);
  if (total === 0) {
    return days.flatMap((day) => hours.map((hour) => ({ day, hour, count: 0 })));
  }

  let remaining = total;
  return days.flatMap((day, dayIndex) =>
    hours.map((hour, hourIndex) => {
      const isLast = dayIndex === days.length - 1 && hourIndex === hours.length - 1;
      const count = isLast ? remaining : total > 0 && remaining > 0 ? 1 : 0;
      remaining = Math.max(0, remaining - count);
      return { day, hour, count };
    }),
  );
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

function riskScoreTone(score: number): StatusTone {
  if (score >= 18) return "danger";
  if (score >= 10) return "warning";
  return score >= 5 ? "info" : "success";
}

function riskWeight(level: RiskLevel): number {
  const weights = {
    Low: 2,
    Medium: 3,
    High: 4,
    Critical: 5,
  } satisfies Record<RiskLevel, number>;
  return weights[level];
}

function likelihoodWeight(visit: DoctorWorklistVisit): number {
  if (visit.priority === "Critical" || visit.blockingGapCount >= 3) return 5;
  if (visit.priority === "High" || visit.blockingGapCount >= 2) return 4;
  if (visit.priority === "Medium" || visit.blockingGapCount >= 1) return 3;
  return 2;
}

export function buildClaimRiskMatrix(visits: DoctorWorklistVisit[]): ClaimRiskCell[] {
  const matrix = impactLabels.flatMap((impact, impactIndex) =>
    likelihoodLabels.map((likelihood, likelihoodIndex) => {
      const score = (impactIndex + 1) * (likelihoodIndex + 1);
      return {
        impact,
        likelihood,
        score,
        cases: 0,
        tone: riskScoreTone(score),
      };
    }),
  );

  for (const visit of visits) {
    const impact = impactLabels[riskWeight(visit.riskLevel) - 1];
    const likelihood = likelihoodLabels[likelihoodWeight(visit) - 1];
    const cell = matrix.find((item) => item.impact === impact && item.likelihood === likelihood);
    if (cell) cell.cases += 1;
  }

  return matrix;
}

export function buildVisitCostTrend(
  visits: DoctorWorklistVisit[],
  _timeToReadiness: Array<{ date: string; minutes: number; targetMinutes: number }>,
): VisitCostTrendPoint[] {
  void visits;
  void _timeToReadiness;
  return [];
}

export function buildCostVarianceBridge(
  visits: DoctorWorklistVisit[],
  _timeToReadiness: Array<{ date: string; minutes: number; targetMinutes: number }>,
): CostVarianceBridgeItem[] {
  void visits;
  void _timeToReadiness;
  return [];
}

export function buildEconomicAlerts(visits: DoctorWorklistVisit[]): EconomicAlertItem[] {
  if (visits.length === 0) return [];

  const alerts = new Map<string, EconomicAlertItem>();

  for (const visit of visits) {
    if (!visit.primaryGap) continue;
    const label = visit.primaryGap === "Imaging Report" ? "High-cost imaging review" : visit.primaryGap;
    const current = alerts.get(label) ?? { label, count: 0, impact: 0 };
    alerts.set(label, { ...current, count: current.count + 1 });
  }

  return [...alerts.values()].sort((first, second) => second.count - first.count || first.label.localeCompare(second.label));
}
