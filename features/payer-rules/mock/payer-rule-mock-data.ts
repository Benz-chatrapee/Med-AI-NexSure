import type { AffectedCase, AiRecommendation, AuditEvent, ImpactMetric, Payer, PayerRuleFormValues, RuleSetDetail, RuleSetSummary, VersionHistory } from "../types/payer-rule-types";

export const payers: Payer[] = [
  { id: "payer-aia", name: "AIA Mock", code: "PAYER_AIA_MOCK", status: "active", defaultRuleSetId: "rule-aia-opd" },
  { id: "payer-mtl", name: "Muang Thai Mock", code: "PAYER_MTL_MOCK", status: "needs_review", defaultRuleSetId: "rule-mtl-procedure" },
  { id: "payer-generic", name: "Generic Payer", code: "PAYER_GENERIC", status: "draft", defaultRuleSetId: "rule-generic-template" },
  { id: "payer-tpa", name: "Enterprise TPA Mock", code: "PAYER_TPA_MOCK", status: "simulation", defaultRuleSetId: "rule-tpa-governance" },
];

export const baseForm: PayerRuleFormValues = {
  payerName: "AIA Mock",
  payerCode: "PAYER_AIA_MOCK",
  status: "active",
  ruleSetName: "OPD Standard Claim Rule",
  effectiveDate: "2026-07-07",
  governanceOwner: "Product Owner / Claim Governance",
  description: "Mock payer rule configuration for MVP insurance intelligence demo. Controls evidence, ICD, coverage, cost, and readiness impact.",
  evidenceRules: [
    { key: "soap_note", label: "SOAP Note", enabled: true, requirement: "required", condition: "All OPD visits", readinessImpact: 18 },
    { key: "diagnosis", label: "Diagnosis", enabled: true, requirement: "required", condition: "All claim submissions", readinessImpact: 15 },
    { key: "icd10", label: "ICD-10", enabled: true, requirement: "required", condition: "Clinical diagnosis present", readinessImpact: 16 },
    { key: "icd9_procedure", label: "ICD-9 / Procedure", enabled: true, requirement: "required_if", condition: "Procedure charge exists", readinessImpact: 10 },
    { key: "prescription", label: "Prescription", enabled: true, requirement: "required_if", condition: "Medication dispensed", readinessImpact: 8 },
    { key: "medical_certificate", label: "Medical Certificate", enabled: true, requirement: "required_if", condition: "Reimbursement request", readinessImpact: 7 },
    { key: "attachments", label: "Attachments", enabled: true, requirement: "required_if", condition: "Cost above threshold", readinessImpact: 6 },
    { key: "claim_summary", label: "Claim Summary", enabled: true, requirement: "recommended", condition: "AI assisted claim packet", readinessImpact: 5 },
    { key: "cost_justification", label: "Cost Justification", enabled: true, requirement: "required_if", condition: "Cost alert triggered", readinessImpact: 9 },
  ],
  icdRules: { requireIcd10: true, requireIcd9ForProcedures: true, missingIcdAction: "block", diagnosisIcdConsistency: true, highRiskGroups: ["CARDIO", "NEURO", "SURGERY"], excludedGroups: ["COSMETIC", "NON_COVERED_OPD"], humanReview: true },
  coverageRules: { defaultStatus: "likely_covered", waitingPeriodSimulation: true, benefitLimit: 5000, exclusions: ["COSMETIC", "EXPERIMENTAL"], requiredEvidence: ["Medical Certificate", "Attachment"], humanReview: true },
  costRules: { expectedMinimum: 500, expectedMaximum: 2500, alertThreshold: 3000, blockThreshold: 8000, justificationThreshold: 3000, currency: "THB" },
  riskRules: [
    { key: "soap_incomplete", label: "SOAP Incomplete", enabled: true, riskLevel: "medium", resultingStatus: "needs_review", humanReview: true },
    { key: "icd_missing", label: "ICD Missing", enabled: true, riskLevel: "high", resultingStatus: "not_ready", humanReview: true },
    { key: "diagnosis_icd_mismatch", label: "Diagnosis-ICD Mismatch", enabled: true, riskLevel: "high", resultingStatus: "needs_review", humanReview: true },
    { key: "cost_alert", label: "Cost Alert", enabled: true, riskLevel: "medium", resultingStatus: "needs_review", humanReview: true },
    { key: "coverage_not_covered", label: "Coverage Not Covered", enabled: true, riskLevel: "critical", resultingStatus: "not_ready", humanReview: true },
    { key: "drug_interaction_override", label: "Drug Interaction Override", enabled: true, riskLevel: "critical", resultingStatus: "needs_review", humanReview: true },
  ],
  advancedNotes: "AI must never save, activate, or approve payer rules automatically. Human approval is required.",
};

export const ruleSets: RuleSetSummary[] = [
  { id: "rule-aia-opd", payerId: "payer-aia", name: "OPD Standard Claim Rule", version: "v3.2", status: "active", updatedBy: "Product Owner", updatedAt: "2026-07-13T10:42:00+07:00" },
  { id: "rule-mtl-procedure", payerId: "payer-mtl", name: "Procedure Claim Rule", version: "v2.1", status: "pending_approval", updatedBy: "Rule Owner", updatedAt: "2026-07-12T16:20:00+07:00" },
  { id: "rule-generic-template", payerId: "payer-generic", name: "Template Rule", version: "v1.0", status: "draft", updatedBy: "Admin", updatedAt: "2026-07-11T09:00:00+07:00" },
  { id: "rule-tpa-governance", payerId: "payer-tpa", name: "Claim Governance Rule", version: "v1.4", status: "draft", updatedBy: "QA Tester", updatedAt: "2026-07-10T13:11:00+07:00" },
];

export const ruleDetails: RuleSetDetail[] = ruleSets.map((ruleSet) => ({ ...ruleSet, form: { ...baseForm, ruleSetName: ruleSet.name, payerName: payers.find((payer) => payer.id === ruleSet.payerId)?.name ?? baseForm.payerName, payerCode: payers.find((payer) => payer.id === ruleSet.payerId)?.code ?? baseForm.payerCode } }));

export const impactMetrics: ImpactMetric[] = [
  { key: "ready", label: "Ready", before: 64, after: 72, unit: "%", lowerIsBetter: false },
  { key: "needs_review", label: "Needs Review", before: 28, after: 21, unit: "%", lowerIsBetter: true },
  { key: "not_ready", label: "Not Ready", before: 8, after: 7, unit: "%", lowerIsBetter: true },
  { key: "pending_evidence", label: "Pending Evidence", before: 33, after: 27, unit: "cases", lowerIsBetter: true },
  { key: "cost_alert", label: "Cost Alert", before: 22, after: 18, unit: "cases", lowerIsBetter: true },
  { key: "high_risk", label: "High Risk", before: 12, after: 9, unit: "cases", lowerIsBetter: true },
  { key: "average_readiness", label: "Average Readiness Score", before: 82, after: 86, unit: "score", lowerIsBetter: false },
];

export const aiRecommendation: AiRecommendation = {
  id: "rec-cost-evidence",
  title: "Suggested Rule Optimization",
  missingEvidencePattern: "ICD-10 and Cost Justification are the top Pending Evidence drivers across OPD cases.",
  predictedClaimImpact: "Conditional attachment rules may improve readiness clarity while avoiding unnecessary document burden.",
  costInsight: "Current Cost Alert Threshold detects 18 cases. Suggested review band: 3,000-8,000 THB.",
  confidence: 0.82,
  evidenceBasis: "Based on 128 mock visits evaluated by the active OPD rule set.",
  generatedAt: "2026-07-13T10:48:00+07:00",
};

export const affectedCases: AffectedCase[] = [
  { id: "case-1", hn: "HN-10291", visitId: "OPD-24071", patientNameMasked: "Masked Patient A***", payer: "AIA Mock", ruleSet: "OPD v3.2", readinessScore: 92, status: "ready", coverage: "likely_covered", risk: "low", missingEvidence: [], ruleFailures: [], costStatus: "normal", updatedAt: "Today 11:10" },
  { id: "case-2", hn: "HN-10304", visitId: "OPD-24072", patientNameMasked: "Masked Patient B***", payer: "AIA Mock", ruleSet: "OPD v3.2", readinessScore: 68, status: "needs_review", coverage: "likely_covered", risk: "medium", missingEvidence: ["Cost Justification"], ruleFailures: ["Cost Alert"], costStatus: "alert", updatedAt: "Today 10:58" },
  { id: "case-3", hn: "HN-10318", visitId: "OPD-24073", patientNameMasked: "Masked Patient C***", payer: "AIA Mock", ruleSet: "OPD v3.2", readinessScore: 41, status: "not_ready", coverage: "need_review", risk: "high", missingEvidence: ["ICD-10"], ruleFailures: ["ICD Missing"], costStatus: "blocked", updatedAt: "Today 10:21" },
  { id: "case-4", hn: "HN-10329", visitId: "OPD-24074", patientNameMasked: "Masked Patient D***", payer: "AIA Mock", ruleSet: "OPD v3.2", readinessScore: 74, status: "pending_evidence", coverage: "need_review", risk: "medium", missingEvidence: ["Medical Certificate", "Attachment"], ruleFailures: ["Waiting Period Evidence"], costStatus: "normal", updatedAt: "Today 09:55" },
];

export const versionHistory: VersionHistory[] = [
  { version: "v3.2", changeSummary: "Updated Cost Alert Threshold from 2,800 THB to 3,000 THB.", changedBy: "Product Owner", changedAt: "2026-07-13 10:42", approvalStatus: "active" },
  { version: "v3.1", changeSummary: "Enabled missing ICD block rule for OPD Claim Readiness.", changedBy: "Admin", changedAt: "2026-07-12 15:12", approvalStatus: "approved" },
  { version: "v3.0", changeSummary: "Created OPD Standard Claim Rule for MVP payer simulation.", changedBy: "Rule Owner", changedAt: "2026-07-10 09:30", approvalStatus: "approved" },
];

export const auditEvents: AuditEvent[] = [
  { id: "audit-1", event: "Rule Test Executed", actor: "QA Tester", role: "QA", timestamp: "2026-07-13 11:02", version: "v3.2", outcome: "success", phiStatus: "no_phi" },
  { id: "audit-2", event: "Rule Export Requested", actor: "Compliance Officer", role: "Compliance", timestamp: "2026-07-13 10:52", version: "v3.2", outcome: "success", phiStatus: "masked" },
  { id: "audit-3", event: "Approval Requested", actor: "Product Owner", role: "Rule Owner", timestamp: "2026-07-12 16:18", version: "v3.1", outcome: "success", phiStatus: "no_phi" },
];
