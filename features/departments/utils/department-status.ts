import type { ClaimReadinessStatus, CostStatus, DepartmentStatus, DepartmentType, Severity, SlaStatus } from "../types/department.types";

export function badgeClass(tone: Severity | ClaimReadinessStatus | DepartmentStatus | DepartmentType | CostStatus | SlaStatus) {
  if (tone === "success" || tone === "ready" || tone === "active" || tone === "clinical" || tone === "normal" || tone === "within_sla") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning" || tone === "needs_review" || tone === "inactive" || tone === "diagnostic" || tone === "cost_alert" || tone === "approaching") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "critical" || tone === "not_ready" || tone === "archived" || tone === "breached") return "border-red-200 bg-red-50 text-red-700";
  return "border-blue-200 bg-blue-50 text-blue-800";
}
export function readableToken(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
