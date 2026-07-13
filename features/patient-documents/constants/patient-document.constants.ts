import { AlertTriangle, CheckCircle2, Clock3, FileText, Link2, ShieldAlert, type LucideIcon } from "lucide-react";
import type { AIProcessingStatus, ConfidentialityLevel, DocumentCategory, DocumentStatus } from "../types/patient-document.types";

export const categoryLabels: Record<DocumentCategory, string> = {
  identity: "Identity", insurance: "Insurance", clinical: "Clinical", laboratory: "Laboratory", radiology: "Radiology", prescription: "Prescription", medical_certificate: "Medical Certificate", consent: "Consent", claim_evidence: "Claim Evidence", referral: "Referral",
};
export const statusConfig: Record<DocumentStatus, { label: string; className: string; icon: LucideIcon }> = {
  verified: { label: "Verified", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  pending_review: { label: "Pending Review", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock3 },
  correction_requested: { label: "Correction Requested", className: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  expiring_soon: { label: "Expiring Soon", className: "bg-orange-50 text-orange-700 border-orange-200", icon: ShieldAlert },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText },
};
export const aiStatusLabels: Record<AIProcessingStatus, string> = { completed: "Completed", needs_review: "Needs Review", low_confidence: "Low Confidence", not_processed: "Not Processed", failed: "Failed" };
export const confidentialityLabels: Record<ConfidentialityLevel, string> = { standard: "Standard", sensitive: "Sensitive", confidential: "Confidential", restricted: "Restricted" };
export const chartColors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#38BDF8", "#64748B"];
export const kpiIconMap = { total: FileText, verified: CheckCircle2, pending: Clock3, expiring: ShieldAlert, missing: AlertTriangle, linked: Link2 } as const;
