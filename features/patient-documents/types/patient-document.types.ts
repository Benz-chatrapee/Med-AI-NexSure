export type DocumentStatus = "verified" | "pending_review" | "correction_requested" | "expiring_soon" | "archived";
export type DocumentCategory = "identity" | "insurance" | "clinical" | "laboratory" | "radiology" | "prescription" | "medical_certificate" | "consent" | "claim_evidence" | "referral";
export type AIProcessingStatus = "completed" | "needs_review" | "low_confidence" | "not_processed" | "failed";
export type ConfidentialityLevel = "standard" | "sensitive" | "confidential" | "restricted";
export type DocumentLinkageState = "claim" | "evidence_package" | "linking_required" | "not_required";
export type DocumentExpiryBucket = "expired" | "within_7_days" | "within_30_days" | "within_90_days" | "more_than_90_days" | "no_expiry";

export interface PatientContext {
  id: string; name: string; hn: string; patientId: string; dateOfBirth: string; age: number; gender: string; primaryPayer: string; pdpaConsent: "active" | "expired" | "missing"; activeAlerts: string[];
}
export interface DocumentRelation { visitId?: string; claimId?: string; evidencePackageId?: string }
export interface DocumentAIExtraction { label: string; value: string; confidence: number; sourceLocation: string; reviewStatus: "accepted" | "needs_review" | "not_reviewed" }
export interface DocumentVersion { version: number; uploadedBy: string; uploadedAt: string; reason: string }
export interface PatientDocument {
  id: string; name: string; category: DocumentCategory; type: string; status: DocumentStatus; aiStatus: AIProcessingStatus; confidentiality: ConfidentialityLevel; linkage: DocumentLinkageState; documentNumber: string; issuingOrganization: string; documentDate: string; expiryDate?: string; uploadedBy: string; uploadedAt: string; fileType: "PDF" | "JPG" | "JPEG" | "PNG" | "DOCX"; fileSizeBytes: number; confidence: number; relation: DocumentRelation; extractions: DocumentAIExtraction[]; versions: DocumentVersion[]; summary: string;
}
export interface MissingDocumentRequirement { id: string; label: string; category: DocumentCategory; priority: "critical" | "high" | "medium" | "low"; impact: string; scoreImpact: number }
export interface DocumentActivity { id: string; action: string; actor: string; timestamp: string; reason: string; documentId?: string }
export interface ChartDataPoint { label: string; value: number; key: string }
export interface PatientDocumentFilters { status?: DocumentStatus; category?: DocumentCategory; expiryBucket?: DocumentExpiryBucket; linkage?: DocumentLinkageState; aiStatus?: AIProcessingStatus; search: string }
export interface PatientDocumentSummary {
  totalDocuments: number; categories: number; verified: number; pendingReview: number; correctionRequested: number; expiringSoon: number; missingRequired: number; claimLinked: number; completenessScore: number; statusDistribution: ChartDataPoint[]; categoryDistribution: ChartDataPoint[]; expiryDistribution: ChartDataPoint[]; aiQualityDistribution: ChartDataPoint[]; linkageDistribution: ChartDataPoint[]; missingEvidence: MissingDocumentRequirement[];
}
export interface PatientDocumentDashboardData { patient: PatientContext; documents: PatientDocument[]; summary: PatientDocumentSummary; activities: DocumentActivity[] }
export interface UploadPatientDocumentInput { file: File; documentName: string; category: DocumentCategory; documentType: string; relatedVisit?: string; relatedClaim?: string; documentDate: string; expiryDate?: string; confidentiality: ConfidentialityLevel; issuingOrganization: string; notes?: string }
export interface UploadPatientDocumentResponse { document: PatientDocument; auditEventId: string; aiQueueId: string }
