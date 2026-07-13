import { AlertCircle, BadgeCheck, Ban, CheckCircle2, Clock3, FileText, HelpCircle, Send, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ClaimRiskLevel, ClaimStatus, EvidenceSeverity } from "../types/patient-claims.types";

export const CLAIM_STATUS_CONFIG: Record<ClaimStatus, { label: string; thaiLabel: string; tone: string; icon: typeof HelpCircle }> = {
  draft: { label: "Draft", thaiLabel: "ฉบับร่าง", tone: "neutral", icon: FileText },
  not_ready: { label: "Not Ready", thaiLabel: "ยังไม่พร้อม", tone: "danger", icon: TriangleAlert },
  needs_review: { label: "Needs Review", thaiLabel: "ต้องตรวจสอบ", tone: "warning", icon: AlertCircle },
  submitted: { label: "Submitted", thaiLabel: "ส่งแล้ว", tone: "info", icon: Send },
  pending: { label: "Pending Review", thaiLabel: "รอตรวจสอบ", tone: "warning", icon: Clock3 },
  approved: { label: "Approved", thaiLabel: "อนุมัติแล้ว", tone: "success", icon: BadgeCheck },
  rejected: { label: "Rejected", thaiLabel: "ไม่อนุมัติ", tone: "danger", icon: Ban },
};

export const CLAIM_RISK_CONFIG: Record<ClaimRiskLevel, { label: string; tone: string; icon: typeof HelpCircle }> = {
  low: { label: "Low Risk", tone: "success", icon: CheckCircle2 },
  medium: { label: "Medium Risk", tone: "warning", icon: AlertCircle },
  high: { label: "High Risk", tone: "danger", icon: ShieldAlert },
  critical: { label: "Critical Risk", tone: "danger", icon: TriangleAlert },
};

export const EVIDENCE_SEVERITY_CONFIG: Record<EvidenceSeverity, { label: string; tone: string; icon: typeof HelpCircle }> = {
  low: { label: "Low", tone: "neutral", icon: FileText },
  medium: { label: "Medium", tone: "warning", icon: AlertCircle },
  high: { label: "High", tone: "warning", icon: ShieldAlert },
  critical: { label: "Critical", tone: "danger", icon: TriangleAlert },
};

export const initialPatientClaimsFilters = {
  query: "",
  status: "all",
  payer: "all",
  risk: "all",
  page: 1,
  pageSize: 5,
} as const;

export const readinessThresholds = {
  ready: 85,
  needsReview: 60,
} as const;
