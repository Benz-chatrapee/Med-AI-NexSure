import type { ClaimReadinessStatus, QueueStatus } from "../types/department.types";

export const thbFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
export function formatThb(value: number) { return thbFormatter.format(value); }
export function formatPercent(value: number | null) { return value === null ? "-" : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`; }
export function readinessStatusFromScore(score: number): ClaimReadinessStatus { if (score >= 85) return "ready"; if (score >= 60) return "needs_review"; return "not_ready"; }
export function evidenceAgingLabel(hours: number) { if (hours < 24) return "Under 24 Hours"; if (hours <= 72) return "1-3 Days"; return "Over 3 Days"; }
export function queueStatusLabel(status: QueueStatus) {
  const labels: Record<QueueStatus, string> = { completed: "Completed", in_consultation: "In Consultation", pending_evidence: "Pending Evidence", waiting: "Waiting", pharmacy: "Pharmacy" };
  return labels[status];
}
