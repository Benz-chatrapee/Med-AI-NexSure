import type { CasePriority, ClaimReadinessStatus, DataHealthStatus, RiskLevel, SlaStatus } from "../types/executive-dashboard.types";

export const defaultDashboardFilters = {
  dateRange: "Last 30 Days",
  clinicId: null,
  departmentId: null,
  payerId: null,
  claimStatus: null,
  riskLevel: null,
  missingEvidenceCategory: null,
} as const;

export const readinessStatusConfig: Record<ClaimReadinessStatus, { label: string; thaiLabel: string; className: string }> = {
  ready: { label: "Ready", thaiLabel: "พร้อมส่งเคลม", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  needs_review: { label: "Needs Review", thaiLabel: "ต้องตรวจสอบ", className: "bg-amber-50 text-amber-700 border-amber-200" },
  not_ready: { label: "Not Ready", thaiLabel: "ยังไม่พร้อม", className: "bg-red-50 text-red-700 border-red-200" },
};

export const riskLevelConfig: Record<RiskLevel, { label: string; thaiLabel: string; className: string; color: string }> = {
  critical: { label: "Critical", thaiLabel: "วิกฤต", className: "bg-red-50 text-red-700 border-red-200", color: "#DC2626" },
  high: { label: "High", thaiLabel: "สูง", className: "bg-orange-50 text-orange-700 border-orange-200", color: "#EA580C" },
  medium: { label: "Medium", thaiLabel: "กลาง", className: "bg-amber-50 text-amber-700 border-amber-200", color: "#D97706" },
  low: { label: "Low", thaiLabel: "ต่ำ", className: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#059669" },
};

export const priorityConfig: Record<CasePriority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200" },
  normal: { label: "Normal", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export const slaStatusConfig: Record<SlaStatus, { label: string; className: string }> = {
  within_sla: { label: "Within SLA", className: "text-emerald-700" },
  due_soon: { label: "Due Soon", className: "text-amber-700" },
  breached: { label: "Breached", className: "font-bold text-red-700" },
};

export const dataHealthConfig: Record<DataHealthStatus, { label: string; thaiLabel: string; className: string }> = {
  healthy: { label: "Data healthy", thaiLabel: "ข้อมูลพร้อมใช้งาน", className: "bg-emerald-400/10 text-emerald-100 border-emerald-300/30" },
  delayed: { label: "Data delayed", thaiLabel: "ข้อมูลล่าช้า", className: "bg-amber-400/10 text-amber-100 border-amber-300/30" },
  degraded: { label: "Data degraded", thaiLabel: "ข้อมูลบางส่วนไม่สมบูรณ์", className: "bg-red-400/10 text-red-100 border-red-300/30" },
};

export const chartColors = {
  primary: "#1E3A8A",
  executive: "#0F2A5F",
  ai: "#2563EB",
  azure: "#38BDF8",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  border: "#E2E8F0",
  muted: "#64748B",
};
