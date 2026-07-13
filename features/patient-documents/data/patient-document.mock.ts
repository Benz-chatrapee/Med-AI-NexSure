import type { DocumentActivity, PatientContext, PatientDocument } from "../types/patient-document.types";
import { buildPatientDocumentSummary } from "../utils/patient-document-utils";

export const patientContext: PatientContext = {
  id: "patient-kanokwan", name: "Kanokwan Srisuk", hn: "68-001245", patientId: "PT-000124", dateOfBirth: "1988-08-14", age: 37, gender: "Female", primaryPayer: "AIA Health Plus", pdpaConsent: "active", activeAlerts: ["Penicillin Allergy"],
};

const base = { uploadedBy: "Nurse Arisa", uploadedAt: "2026-07-13T09:20:00+07:00", fileSizeBytes: 2_400_000, versions: [{ version: 1, uploadedBy: "Nurse Arisa", uploadedAt: "2026-07-13T09:20:00+07:00", reason: "Initial upload" }] };
const extraction = (label: string, value: string, confidence = 92) => [{ label, value, confidence, sourceLocation: "Page 1", reviewStatus: confidence < 80 ? "needs_review" as const : "accepted" as const }];

export const patientDocuments: PatientDocument[] = [
  doc("doc-01", "Thai National ID Card", "identity", "National ID", "verified", "completed", "standard", "not_required", "ID-8891", "Department of Provincial Administration", "2024-01-10", "2030-01-10", "PDF", 97),
  doc("doc-02", "Passport Copy", "identity", "Passport", "verified", "completed", "standard", "not_required", "PP-4412", "Ministry of Foreign Affairs", "2023-02-15", "2033-02-15", "PDF", 96),
  doc("doc-03", "House Registration", "identity", "Registration", "verified", "completed", "standard", "not_required", "HR-1172", "Bangkok District Office", "2025-04-08", undefined, "PDF", 92),
  doc("doc-04", "AIA Health Plus Policy", "insurance", "Policy", "verified", "completed", "confidential", "claim", "POL-889012", "AIA Thailand", "2026-01-01", "2026-12-31", "PDF", 94),
  doc("doc-05", "Insurance Card Front", "insurance", "Insurance Card", "expiring_soon", "needs_review", "confidential", "linking_required", "CARD-2219", "AIA Thailand", "2025-07-22", "2026-07-22", "PNG", 78),
  doc("doc-06", "Preauthorization Letter", "insurance", "Preauthorization", "verified", "completed", "confidential", "evidence_package", "PRE-4490", "AIA Thailand", "2026-07-01", "2026-09-30", "PDF", 91),
  doc("doc-07", "Coverage Benefit Summary", "insurance", "Coverage", "pending_review", "needs_review", "confidential", "claim", "COV-3331", "AIA Thailand", "2026-06-21", "2026-12-31", "PDF", 76),
  doc("doc-08", "Initial Clinical Summary", "clinical", "Clinical Summary", "verified", "completed", "sensitive", "claim", "CS-1001", "Med AI Clinic", "2026-07-10", undefined, "PDF", 93),
  doc("doc-09", "SOAP Note Visit 2026-07-10", "clinical", "SOAP Note", "verified", "completed", "sensitive", "evidence_package", "SOAP-7710", "Med AI Clinic", "2026-07-10", undefined, "PDF", 95),
  doc("doc-10", "Referral Follow-up Note", "clinical", "Progress Note", "pending_review", "low_confidence", "sensitive", "linking_required", "REF-FU-19", "Med AI Clinic", "2026-07-11", undefined, "DOCX", 69),
  doc("doc-11", "Discharge Instruction", "clinical", "Instruction", "verified", "completed", "sensitive", "claim", "DIS-4301", "Med AI Clinic", "2026-07-12", undefined, "PDF", 90),
  doc("doc-12", "Medication Allergy Note", "clinical", "Allergy Note", "verified", "completed", "restricted", "evidence_package", "ALG-2201", "Med AI Clinic", "2026-07-10", undefined, "PDF", 89),
  doc("doc-13", "CBC Lab Result", "laboratory", "CBC", "verified", "completed", "sensitive", "evidence_package", "LAB-CBC-11", "Med AI Lab", "2026-07-10", undefined, "PDF", 96),
  doc("doc-14", "HbA1c Lab Result", "laboratory", "HbA1c", "verified", "completed", "sensitive", "claim", "LAB-A1C-12", "Med AI Lab", "2026-07-10", undefined, "PDF", 93),
  doc("doc-15", "Liver Function Test", "laboratory", "LFT", "correction_requested", "needs_review", "sensitive", "linking_required", "LAB-LFT-13", "Med AI Lab", "2026-07-10", undefined, "PDF", 72),
  doc("doc-16", "Chest X-ray Report", "radiology", "X-ray", "verified", "completed", "sensitive", "claim", "RAD-XR-31", "Med AI Radiology", "2026-07-10", undefined, "PDF", 94),
  doc("doc-17", "Ultrasound Image Summary", "radiology", "Ultrasound", "verified", "completed", "sensitive", "not_required", "RAD-US-32", "Med AI Radiology", "2026-07-11", undefined, "JPG", 88),
  doc("doc-18", "Prescription Order", "prescription", "Prescription", "verified", "completed", "sensitive", "claim", "RX-441", "Med AI Clinic", "2026-07-10", undefined, "PDF", 95),
  doc("doc-19", "Pharmacy Dispense Record", "prescription", "Dispense Record", "verified", "completed", "sensitive", "not_required", "RX-D-442", "Med AI Pharmacy", "2026-07-10", undefined, "PDF", 91),
  doc("doc-20", "Medical Certificate", "medical_certificate", "Medical Certificate", "verified", "completed", "standard", "claim", "MC-991", "Med AI Clinic", "2026-07-12", "2026-08-12", "PDF", 94),
  doc("doc-21", "Sick Leave Certificate", "medical_certificate", "Sick Leave", "verified", "completed", "standard", "not_required", "SLC-992", "Med AI Clinic", "2026-07-12", "2026-08-12", "PDF", 91),
  doc("doc-22", "PDPA Consent Form", "consent", "PDPA Consent", "expiring_soon", "needs_review", "confidential", "linking_required", "CONS-551", "Med AI Clinic", "2025-07-25", "2026-07-25", "PDF", 80),
  doc("doc-23", "Claim Evidence Checklist", "claim_evidence", "Checklist", "verified", "completed", "confidential", "evidence_package", "EV-778", "Claim Team", "2026-07-13", undefined, "PDF", 92),
  doc("doc-24", "Claim Reviewer Note", "claim_evidence", "Reviewer Note", "pending_review", "needs_review", "confidential", "claim", "CRN-779", "Claim Team", "2026-07-13", undefined, "DOCX", 74),
];

export const documentActivities: DocumentActivity[] = [
  { id: "act-1", action: "Previewed restricted allergy note", actor: "Dr. Benz", timestamp: "13 Jul 2026 10:20", reason: "Clinical review before claim package", documentId: "doc-12" },
  { id: "act-2", action: "Requested correction", actor: "Claim Reviewer", timestamp: "13 Jul 2026 10:05", reason: "LFT document number mismatch", documentId: "doc-15" },
  { id: "act-3", action: "AI extraction completed", actor: "AI Document Queue", timestamp: "13 Jul 2026 09:44", reason: "Classification and field extraction", documentId: "doc-24" },
  { id: "act-4", action: "Added to evidence package", actor: "Nurse Arisa", timestamp: "13 Jul 2026 09:31", reason: "Claim evidence preparation", documentId: "doc-23" },
];

export const patientDocumentDashboard = { patient: patientContext, documents: patientDocuments, summary: buildPatientDocumentSummary(patientDocuments), activities: documentActivities };

function doc(id: string, name: string, category: PatientDocument["category"], type: string, status: PatientDocument["status"], aiStatus: PatientDocument["aiStatus"], confidentiality: PatientDocument["confidentiality"], linkage: PatientDocument["linkage"], documentNumber: string, issuingOrganization: string, documentDate: string, expiryDate: string | undefined, fileType: PatientDocument["fileType"], confidence: number): PatientDocument {
  return { id, name, category, type, status, aiStatus, confidentiality, linkage, documentNumber, issuingOrganization, documentDate, expiryDate, fileType, confidence, relation: relation(linkage), extractions: extraction(type, documentNumber, confidence), summary: `${type} supporting patient document intelligence and claim readiness workflow.`, ...base };
}
function relation(linkage: PatientDocument["linkage"]) {
  if (linkage === "claim") return { claimId: "CLM-2026-0713" };
  if (linkage === "evidence_package") return { evidencePackageId: "EVP-0003", claimId: "CLM-2026-0713" };
  if (linkage === "linking_required") return { visitId: "VIS-2026-0710" };
  return {};
}
