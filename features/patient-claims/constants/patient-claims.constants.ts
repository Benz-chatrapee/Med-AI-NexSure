import { AlertCircle, BadgeCheck, Ban, CheckCircle2, Clock3, FileText, HelpCircle, Send, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ClaimDecisionStatus, ClaimPaymentStatus, ClaimRiskLevel, ClaimStatus, ClaimWorkflowStatus, EvidenceSeverity } from "../types/patient-claims.types";

export const CLAIM_STATUS_CONFIG: Record<ClaimStatus, { label: string; thaiLabel: string; tone: string; icon: typeof HelpCircle }> = {
  draft: { label: "Draft", thaiLabel: "ฉบับร่าง", tone: "neutral", icon: FileText },
  not_ready: { label: "Not Ready", thaiLabel: "ยังไม่พร้อม", tone: "danger", icon: TriangleAlert },
  needs_review: { label: "Needs Review", thaiLabel: "ต้องตรวจสอบ", tone: "warning", icon: AlertCircle },
  submitted: { label: "Submitted", thaiLabel: "ส่งแล้ว", tone: "info", icon: Send },
  pending: { label: "Pending Review", thaiLabel: "รอตรวจสอบ", tone: "warning", icon: Clock3 },
  approved: { label: "Approved", thaiLabel: "อนุมัติแล้ว", tone: "success", icon: BadgeCheck },
  rejected: { label: "Rejected", thaiLabel: "ไม่อนุมัติ", tone: "danger", icon: Ban },
};

export const CLAIM_WORKFLOW_STATUS_CONFIG: Record<ClaimWorkflowStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "neutral" },
  collecting_data: { label: "Collecting Data", tone: "warning" },
  validation_pending: { label: "Validation Pending", tone: "warning" },
  needs_review: { label: "Needs Review", tone: "warning" },
  ready_to_submit: { label: "Ready to Submit", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under Review", tone: "warning" },
  appealed: { label: "Appealed", tone: "warning" },
  closed: { label: "Closed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const CLAIM_DECISION_STATUS_CONFIG: Record<ClaimDecisionStatus, { label: string; tone: string }> = {
  not_decided: { label: "Not Decided", tone: "neutral" },
  approved: { label: "Approved", tone: "success" },
  partially_approved: { label: "Partially Approved", tone: "warning" },
  rejected: { label: "Rejected", tone: "danger" },
  request_information: { label: "Information Requested", tone: "warning" },
  voided: { label: "Voided", tone: "danger" },
};

export const CLAIM_PAYMENT_STATUS_CONFIG: Record<ClaimPaymentStatus, { label: string; tone: string }> = {
  not_paid: { label: "Not Paid", tone: "neutral" },
  payment_pending: { label: "Payment Pending", tone: "warning" },
  partially_paid: { label: "Partially Paid", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  payment_failed: { label: "Payment Failed", tone: "danger" },
  partially_refunded: { label: "Partially Refunded", tone: "warning" },
  refunded: { label: "Refunded", tone: "info" },
  reversed: { label: "Reversed", tone: "danger" },
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
