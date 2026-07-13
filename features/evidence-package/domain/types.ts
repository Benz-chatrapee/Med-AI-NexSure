export type EvidenceStatus = "complete" | "review_required" | "missing" | "blocked" | "not_applicable";
export type PackageStatus = "draft" | "review_needed" | "ready_to_export" | "exporting" | "exported" | "export_failed";
export type ClaimReadinessStatus = "ready" | "needs_review" | "not_ready";
export type ValidationSeverity = "info" | "warning" | "critical";
export type EvidenceSource = "clinician" | "nurse" | "pharmacist" | "ai" | "system" | "external_document";
export type UserPermission = "view" | "export" | "generate_ai_summary" | "upload_document" | "review_ai" | "view_patient_name";

export type PatientContext = {
  hn: string;
  displayName: string;
  maskedDisplayName: string;
  age: number;
  sex: "Female" | "Male" | "Other";
  canViewFullName: boolean;
};

export type VisitContext = {
  visitId: string;
  visitDate: string;
  doctor: string;
  clinic: string;
  payer: string;
  claimType: string;
};

export type ClaimSummary = {
  status: EvidenceStatus;
  generatedText: string | null;
  confidence: number | null;
  generatedAt: string | null;
  reviewedBy: string | null;
  humanReviewed: boolean;
  sourceReferences: string[];
};

export type SoapEvidence = {
  status: EvidenceStatus;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  version: string;
  author: string;
  lastUpdatedAt: string;
  aiAssisted: boolean;
};

export type DiagnosisEvidence = {
  status: EvidenceStatus;
  primaryDiagnosis: string | null;
  secondaryDiagnoses: string[];
  icd10Codes: string[];
  procedureCodes: string[];
  consistencyStatus: string;
  payerRuleStatus: string;
  warnings: string[];
};

export type PrescriptionItem = {
  medication: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
};

export type PrescriptionEvidence = {
  status: EvidenceStatus;
  required: boolean;
  safetyStatus: string;
  allergyAlerts: string[];
  interactionWarnings: string[];
  pharmacistReviewStatus: string;
  medications: PrescriptionItem[];
};

export type MedicalCertificateEvidence = {
  status: EvidenceStatus;
  version: string | null;
  createdAt: string | null;
  signed: boolean;
  signer: string | null;
  payerMandatory: boolean;
  exportable: boolean;
};

export type SupportingDocument = {
  id: string;
  fileName: string;
  documentType: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  verificationStatus: EvidenceStatus;
  fileSizeLabel: string;
};

export type EconomicSummary = {
  visitCost: number;
  expectedMin: number;
  expectedMax: number;
  varianceAmount: number;
  variancePercent: number;
  costDrivers: string[];
  costStatus: ValidationSeverity;
  justification: string | null;
  reviewer: string | null;
  reviewStatus: EvidenceStatus;
};

export type EvidenceValidationItem = {
  id: string;
  evidenceName: string;
  required: boolean;
  status: EvidenceStatus;
  severity: ValidationSeverity;
  reason: string;
  resolutionAction: string;
  source: EvidenceSource;
  sectionId: string;
};

export type ExportReadiness = {
  score: number;
  status: ClaimReadinessStatus;
  blockingIssues: EvidenceValidationItem[];
  warningIssues: EvidenceValidationItem[];
  explanation: string;
  canExport: boolean;
};

export type AIRecommendation = {
  title: string;
  priority: "low" | "medium" | "high";
  confidence: number;
  explanation: string;
  sourceReferences: string[];
  nextAction: string;
};

export type ActivityTimelineItem = {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  source: EvidenceSource;
  relatedSection: string;
  version?: string;
};

export type EvidenceWorklistItem = {
  visitId: string;
  hn: string;
  patientLabel: string;
  visitDate: string;
  visitStatus: string;
  claimReadinessScore: number;
  evidenceQualityScore: number;
  packageStatus: PackageStatus;
  missingEvidence: string[];
  costStatus: ValidationSeverity;
  lastUpdatedAt: string;
};

export type ComplianceSummary = {
  auditAlerts: number;
  missingConsentCount: number;
  blockedExportCount: number;
  latestPackageVersion: string;
  exportedBy: string | null;
  exportedAt: string | null;
  pdpaConsentStatus: EvidenceStatus;
  auditTrailStatus: EvidenceStatus;
  accessControlStatus: EvidenceStatus;
};

export type ExportHistoryItem = {
  id: string;
  version: string;
  exportedBy: string;
  exportedAt: string;
  status: PackageStatus;
};

export type EvidencePackage = {
  id: string;
  version: string;
  lastUpdatedAt: string;
  packageStatus: PackageStatus;
  claimReadinessScore: number;
  evidenceQualityScore: number;
  permissions: UserPermission[];
  patient: PatientContext;
  visit: VisitContext;
  claimSummary: ClaimSummary;
  soap: SoapEvidence;
  diagnosis: DiagnosisEvidence;
  prescription: PrescriptionEvidence;
  medicalCertificate: MedicalCertificateEvidence;
  supportingDocuments: SupportingDocument[];
  economicSummary: EconomicSummary;
  validationItems: EvidenceValidationItem[];
  aiRecommendation: AIRecommendation | null;
  timeline: ActivityTimelineItem[];
  worklist: EvidenceWorklistItem[];
  compliance: ComplianceSummary;
  exportHistory: ExportHistoryItem[];
};

export type ApiSuccessResponse<T> = { ok: true; data: T; correlationId: string };
export type ApiErrorResponse = { ok: false; error: { code: string; message: string; status: number }; correlationId: string };
