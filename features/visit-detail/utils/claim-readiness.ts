import type { ReadinessBreakdown, ReadinessStatus } from "../types/visit-detail.types";

export function getClaimReadinessStatus(score: number): ReadinessStatus {
  if (score >= 85) return "Ready";
  if (score >= 60) return "Needs Review";
  return "Not Ready";
}

export function calculateWeightedReadiness(rows: ReadinessBreakdown[]) {
  return Math.round(
    rows.reduce((total, row) => total + (row.score * row.weight) / 100, 0),
  );
}
