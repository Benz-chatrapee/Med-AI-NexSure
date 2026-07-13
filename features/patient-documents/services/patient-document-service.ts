import { patientDocumentDashboard, patientDocuments } from "../data/patient-document.mock";
import type { PatientDocumentFilters, UploadPatientDocumentInput, UploadPatientDocumentResponse } from "../types/patient-document.types";
import { buildPatientDocumentSummary, filterDocuments } from "../utils/patient-document-utils";

export async function getPatientDocuments(patientId: string, filters?: PatientDocumentFilters) {
  await delay(80);
  const documents = filters ? filterDocuments(patientDocuments, filters) : patientDocuments;
  return { patientId, documents };
}
export async function getPatientDocumentSummary() { await delay(60); return buildPatientDocumentSummary(patientDocuments); }
export async function getPatientDocumentById(documentId: string) { await delay(40); return patientDocuments.find((document) => document.id === documentId) ?? null; }
export async function getPatientDocumentDashboard() { await delay(80); return patientDocumentDashboard; }
export async function uploadPatientDocument(patientId: string, payload: UploadPatientDocumentInput, signal?: AbortSignal): Promise<UploadPatientDocumentResponse> {
  await delay(500, signal);
  const document = { ...patientDocuments[0], id: `doc-upload-${Date.now()}`, name: payload.documentName, category: payload.category, type: payload.documentType, confidentiality: payload.confidentiality, issuingOrganization: payload.issuingOrganization, documentDate: payload.documentDate, expiryDate: payload.expiryDate, status: "pending_review" as const, aiStatus: "not_processed" as const, uploadedAt: new Date().toISOString(), relation: { visitId: payload.relatedVisit, claimId: payload.relatedClaim } };
  return { document, auditEventId: `audit-${patientId}-${Date.now()}`, aiQueueId: `ai-doc-${Date.now()}` };
}
export async function verifyPatientDocument(documentId: string) { await delay(80); return { documentId, status: "verified" as const, auditEventId: `audit-${documentId}` }; }
export async function requestDocumentCorrection(documentId: string, reason: string) { await delay(80); return { documentId, reason, status: "correction_requested" as const }; }
export async function archivePatientDocuments(documentIds: string[]) { await delay(80); return { archived: documentIds.length }; }
export async function addDocumentsToEvidencePackage(documentIds: string[], evidencePackageId: string) { await delay(80); return { documentIds, evidencePackageId }; }
export async function assignDocumentReviewer(documentIds: string[], reviewerId: string) { await delay(80); return { documentIds, reviewerId }; }

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Upload cancelled", "AbortError")); return; }
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timeout); reject(new DOMException("Upload cancelled", "AbortError")); }, { once: true });
  });
}
