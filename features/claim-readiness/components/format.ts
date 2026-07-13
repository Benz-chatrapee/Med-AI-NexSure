import type {
  ClaimRiskLevel,
  DocumentationTaskPriority,
  EvidenceItemStatus,
  EvidencePackageStatus,
  GapCategory,
  GapSeverity,
  PayerRuleStatus,
  ReadinessDimension,
} from "../domain/types";

export const riskLabels: Record<ClaimRiskLevel, string> = {
  ready: "Ready for Review",
  needs_review: "Needs Review",
  at_risk: "At Risk",
  blocked: "Blocked",
};

export const riskStyles: Record<ClaimRiskLevel, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_review: "border-sky-200 bg-sky-50 text-sky-800",
  at_risk: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800",
};

export const severityStyles: Record<GapSeverity, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-800",
  high: "border-orange-200 bg-orange-50 text-orange-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-700",
};

export const dimensionLabels: Record<ReadinessDimension, string> = {
  evidenceCompleteness: "Evidence",
  soapCompleteness: "SOAP",
  icdValidity: "ICD",
  medicalNecessity: "Medical Necessity",
  payerRejectionRisk: "Payer Risk",
};

export const categoryLabels: Record<GapCategory, string> = {
  evidence: "Evidence",
  soap: "SOAP",
  icd: "ICD",
  medical_necessity: "Medical Necessity",
  payer_rule: "Payer Rule",
  compliance: "Compliance",
};

export const priorityLabels: Record<DocumentationTaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
};

export const evidencePackageLabels: Record<EvidencePackageStatus, string> = {
  complete: "Complete",
  needs_review: "Needs Review",
  missing_required: "Missing Required",
  blocked: "Blocked",
};

export const evidenceItemLabels: Record<EvidenceItemStatus, string> = {
  linked: "Linked",
  missing: "Missing",
  needs_review: "Needs Review",
};

export const payerRuleStatusLabels: Record<PayerRuleStatus, string> = {
  active: "Active",
  draft: "Draft",
  needs_review: "Needs Review",
};

export const evidenceStatusStyles: Record<EvidencePackageStatus | EvidenceItemStatus, string> = {
  complete: "border-emerald-200 bg-emerald-50 text-emerald-800",
  linked: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  missing_required: "border-rose-200 bg-rose-50 text-rose-800",
  missing: "border-rose-200 bg-rose-50 text-rose-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800",
};

export const payerRuleStatusStyles: Record<PayerRuleStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}
