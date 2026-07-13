import type { EvidencePackage } from "../domain/types";

const basePackage: EvidencePackage = {
  id: "EP-VIS-2026-0081",
  version: "v3",
  lastUpdatedAt: "2026-07-07T10:42:00+07:00",
  packageStatus: "review_needed",
  claimReadinessScore: 92,
  evidenceQualityScore: 96,
  permissions: ["view", "export", "generate_ai_summary", "upload_document", "review_ai"],
  patient: {
    hn: "HN-240189",
    displayName: "Somchai K.",
    maskedDisplayName: "S***** K.",
    age: 42,
    sex: "Male",
    canViewFullName: false,
  },
  visit: {
    visitId: "VIS-2026-0081",
    visitDate: "2026-07-07",
    doctor: "Dr. Anan",
    clinic: "Internal Medicine",
    payer: "Aetna Thailand",
    claimType: "OPD Reimbursement",
  },
  claimSummary: {
    status: "review_required",
    generatedText:
      "Patient presented with acute upper respiratory symptoms. Clinical assessment supports acute pharyngitis with symptomatic treatment. ICD-10 and prescription records are aligned with claim readiness requirements, pending cost justification review.",
    confidence: 0.92,
    generatedAt: "2026-07-07T10:42:00+07:00",
    reviewedBy: null,
    humanReviewed: false,
    sourceReferences: ["SOAP v5", "Diagnosis record", "Prescription order", "Cost summary"],
  },
  soap: {
    status: "complete",
    subjective: "Fever, sore throat, mild cough for 2 days.",
    objective: "Temp 38.1C, throat erythema, no respiratory distress.",
    assessment: "Acute pharyngitis, low complication risk.",
    plan: "Medication, hydration, and follow-up if symptoms persist.",
    version: "SOAP-v5",
    author: "Dr. Anan",
    lastUpdatedAt: "2026-07-07T10:38:00+07:00",
    aiAssisted: true,
  },
  diagnosis: {
    status: "complete",
    primaryDiagnosis: "Acute pharyngitis",
    secondaryDiagnoses: [],
    icd10Codes: ["J02.9"],
    procedureCodes: [],
    consistencyStatus: "Diagnosis and ICD are aligned.",
    payerRuleStatus: "Payer rule validation passed.",
    warnings: [],
  },
  prescription: {
    status: "complete",
    required: true,
    safetyStatus: "Safety Passed",
    allergyAlerts: [],
    interactionWarnings: [],
    pharmacistReviewStatus: "Reviewed",
    medications: [
      { medication: "Paracetamol", strength: "500mg", dose: "1 tab", route: "PO", frequency: "q6h PRN", duration: "3 days", quantity: "10 tablets" },
      { medication: "Chlorpheniramine", strength: "4mg", dose: "1 tab", route: "PO", frequency: "HS", duration: "5 days", quantity: "5 tablets" },
    ],
  },
  medicalCertificate: {
    status: "review_required",
    version: "MC-v1",
    createdAt: "2026-07-07T10:20:00+07:00",
    signed: false,
    signer: "Dr. Anan",
    payerMandatory: false,
    exportable: true,
  },
  supportingDocuments: [
    { id: "doc-lab", fileName: "Lab_Result_240189.pdf", documentType: "Lab", mimeType: "application/pdf", uploadedAt: "2026-07-07T10:25:00+07:00", uploadedBy: "Nurse Mali", verificationStatus: "complete", fileSizeLabel: "248 KB" },
    { id: "doc-consent", fileName: "Consent_Form.png", documentType: "Consent", mimeType: "image/png", uploadedAt: "2026-07-07T10:26:00+07:00", uploadedBy: "Clinic Admin", verificationStatus: "complete", fileSizeLabel: "1.1 MB" },
  ],
  economicSummary: {
    visitCost: 4250,
    expectedMin: 1800,
    expectedMax: 3200,
    varianceAmount: 1050,
    variancePercent: 32.8,
    costDrivers: ["Lab", "Medication"],
    costStatus: "warning",
    justification: "Lab ordered due to persistent fever and payer documentation requirement.",
    reviewer: null,
    reviewStatus: "review_required",
  },
  validationItems: [
    { id: "claim-summary", evidenceName: "Claim Summary", required: true, status: "review_required", severity: "warning", reason: "AI summary has not been manually reviewed.", resolutionAction: "Clinician or claim reviewer must mark summary as reviewed.", source: "ai", sectionId: "claim-summary" },
    { id: "soap", evidenceName: "SOAP Note", required: true, status: "complete", severity: "critical", reason: "SOAP evidence is complete.", resolutionAction: "No action required.", source: "clinician", sectionId: "soap-evidence" },
    { id: "diagnosis-icd", evidenceName: "Diagnosis and ICD", required: true, status: "complete", severity: "critical", reason: "Primary diagnosis and ICD are present.", resolutionAction: "No action required.", source: "clinician", sectionId: "diagnosis-icd" },
    { id: "prescription", evidenceName: "Prescription / Treatment", required: true, status: "complete", severity: "critical", reason: "Treatment evidence is complete.", resolutionAction: "No action required.", source: "pharmacist", sectionId: "prescription-evidence" },
    { id: "certificate", evidenceName: "Medical Certificate", required: false, status: "review_required", severity: "warning", reason: "Certificate is draft but not payer-mandatory.", resolutionAction: "Confirm or sign before export if needed.", source: "clinician", sectionId: "medical-certificate" },
    { id: "supporting-docs", evidenceName: "Supporting Documents", required: true, status: "complete", severity: "critical", reason: "Required consent and lab documents are attached.", resolutionAction: "No action required.", source: "external_document", sectionId: "supporting-documents" },
    { id: "cost", evidenceName: "Cost Justification", required: true, status: "review_required", severity: "warning", reason: "Cost exceeds expected range but justification exists.", resolutionAction: "Claim reviewer should confirm justification.", source: "system", sectionId: "economic-summary" },
  ],
  aiRecommendation: {
    title: "Confirm cost justification and AI summary review",
    priority: "high",
    confidence: 0.92,
    explanation: "The package has no critical blocker, but export should require human confirmation because AI summary review and cost review remain open.",
    sourceReferences: ["Cost summary", "Claim summary", "Payer evidence checklist"],
    nextAction: "Review cost justification and mark AI summary as reviewed before final submission.",
  },
  timeline: [
    { id: "tl-1", timestamp: "2026-07-07T10:42:00+07:00", action: "Evidence Generated", actor: "AI Copilot", actorRole: "AI", source: "ai", relatedSection: "Claim Summary", version: "v3" },
    { id: "tl-2", timestamp: "2026-07-07T10:38:00+07:00", action: "SOAP Updated", actor: "Dr. Anan", actorRole: "Physician", source: "clinician", relatedSection: "SOAP", version: "SOAP-v5" },
    { id: "tl-3", timestamp: "2026-07-07T10:31:00+07:00", action: "ICD Added", actor: "Dr. Anan", actorRole: "Physician", source: "clinician", relatedSection: "Diagnosis", version: "v3" },
    { id: "tl-4", timestamp: "2026-07-07T10:25:00+07:00", action: "Attachment Uploaded", actor: "Nurse Mali", actorRole: "Nurse", source: "nurse", relatedSection: "Supporting Documents" },
  ],
  worklist: [
    { visitId: "VIS-2026-0081", hn: "HN-240189", patientLabel: "Masked patient view", visitDate: "2026-07-07", visitStatus: "Pending Evidence", claimReadinessScore: 92, evidenceQualityScore: 96, packageStatus: "review_needed", missingEvidence: ["Cost Review", "AI Review"], costStatus: "warning", lastUpdatedAt: "2026-07-07T10:42:00+07:00" },
    { visitId: "VIS-2026-0091", hn: "HN-240191", patientLabel: "Masked patient view", visitDate: "2026-07-07", visitStatus: "Completed", claimReadinessScore: 98, evidenceQualityScore: 96, packageStatus: "exported", missingEvidence: [], costStatus: "info", lastUpdatedAt: "2026-07-07T10:18:00+07:00" },
    { visitId: "VIS-2026-0205", hn: "HN-240205", patientLabel: "Masked patient view", visitDate: "2026-07-07", visitStatus: "Pending Evidence", claimReadinessScore: 68, evidenceQualityScore: 62, packageStatus: "draft", missingEvidence: ["ICD Missing", "SOAP Incomplete"], costStatus: "info", lastUpdatedAt: "2026-07-07T09:55:00+07:00" },
  ],
  compliance: {
    auditAlerts: 1,
    missingConsentCount: 0,
    blockedExportCount: 0,
    latestPackageVersion: "v3",
    exportedBy: null,
    exportedAt: null,
    pdpaConsentStatus: "complete",
    auditTrailStatus: "complete",
    accessControlStatus: "complete",
  },
  exportHistory: [],
};

const blockedPackage: EvidencePackage = {
  ...basePackage,
  id: "EP-VIS-2026-0205",
  packageStatus: "draft",
  claimReadinessScore: 68,
  evidenceQualityScore: 62,
  visit: { ...basePackage.visit, visitId: "VIS-2026-0205" },
  patient: { ...basePackage.patient, hn: "HN-240205", age: 51, sex: "Female" },
  soap: { ...basePackage.soap, status: "missing", subjective: null, objective: null, assessment: null, plan: null },
  diagnosis: { ...basePackage.diagnosis, status: "missing", primaryDiagnosis: null, icd10Codes: [], consistencyStatus: "Missing diagnosis and ICD.", payerRuleStatus: "Unable to validate." },
  claimSummary: { ...basePackage.claimSummary, status: "missing", generatedText: null, confidence: null, generatedAt: null },
  supportingDocuments: [],
  validationItems: basePackage.validationItems.map((item) => {
    if (item.id === "soap") return { ...item, status: "missing", reason: "SOAP evidence is missing.", resolutionAction: "Open Visit Detail and complete SOAP evidence." };
    if (item.id === "diagnosis-icd") return { ...item, status: "missing", reason: "Primary diagnosis or ICD is missing.", resolutionAction: "Add diagnosis and ICD before export." };
    if (item.id === "claim-summary") return { ...item, status: "missing", severity: "critical", reason: "Claim summary cannot be generated without clinical evidence." };
    if (item.id === "supporting-docs") return { ...item, status: "missing", reason: "Required consent document is missing." };
    return item;
  }),
};

const exportedPackage: EvidencePackage = {
  ...basePackage,
  id: "EP-VIS-2026-0091",
  packageStatus: "exported",
  visit: { ...basePackage.visit, visitId: "VIS-2026-0091" },
  patient: { ...basePackage.patient, hn: "HN-240191" },
  claimSummary: { ...basePackage.claimSummary, status: "complete", reviewedBy: "Claim Reviewer", humanReviewed: true },
  validationItems: basePackage.validationItems.map((item) => ({ ...item, status: "complete", severity: item.severity === "critical" ? "critical" : "info" })),
  compliance: { ...basePackage.compliance, latestPackageVersion: "v4", exportedBy: "Clinic Admin", exportedAt: "2026-07-07T10:18:00+07:00" },
  exportHistory: [{ id: "exp-1", version: "v4", exportedBy: "Clinic Admin", exportedAt: "2026-07-07T10:18:00+07:00", status: "exported" }],
};

const packages = new Map<string, EvidencePackage>([
  [basePackage.visit.visitId, basePackage],
  [blockedPackage.visit.visitId, blockedPackage],
  [exportedPackage.visit.visitId, exportedPackage],
]);

export async function findEvidencePackageByVisitId(visitId: string) {
  return packages.get(visitId) ?? null;
}

export async function listEvidencePackageWorklist() {
  return basePackage.worklist;
}
