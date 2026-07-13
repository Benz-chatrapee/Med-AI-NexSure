export type PrescriptionUserRole =
  | "doctor"
  | "pharmacist"
  | "nurse"
  | "clinic_staff"
  | "clinic_admin"
  | "claim_reviewer"
  | "auditor"
  | "compliance"
  | "admin";

export type PrescriptionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "clarification_required"
  | "approved"
  | "dispensed"
  | "completed"
  | "rejected"
  | "cancelled";

export type SafetySeverity = "critical" | "warning" | "info" | "passed";

export type StockStatus =
  | "available"
  | "low_stock"
  | "near_expiry"
  | "insufficient"
  | "out_of_stock"
  | "unknown";

export interface AllergySummary {
  id: string;
  substance: string;
  severity: "mild" | "moderate" | "severe" | "unknown";
}

export interface DiagnosisSummary {
  id: string;
  code: string;
  label: string;
}

export interface PatientContext {
  patientId: string;
  hn: string;
  displayName: string;
  age: number | null;
  gender: string | null;
  allergies: AllergySummary[];
}

export interface VisitContext {
  visitId: string;
  visitNumber: string;
  visitType: string;
  chiefComplaint: string | null;
  diagnoses: DiagnosisSummary[];
}

export interface MedicationOption {
  id: string;
  genericName: string;
  brandName?: string | null;
  strength: string;
  dosageForm: string;
  displayName: string;
  allergyClass?: string | null;
}

export interface InventoryBatch {
  batchId: string;
  batchNumber: string;
  availableQuantity: number;
  unit: string;
  expiryDate: string | null;
  expiryDays: number | null;
}

export interface InventorySummary {
  medicationId: string;
  currentStock: number;
  availableQuantity: number;
  reorderLevel: number;
  status: StockStatus;
  selectedBatch: InventoryBatch | null;
}

export interface PrescriptionItem {
  id: string;
  medicationId: string;
  medicationDisplayName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit: string;
  instructions: string;
}

export interface SafetyAlert {
  id: string;
  severity: SafetySeverity;
  code: string;
  title: string;
  description: string;
  medicationItemId?: string;
  requiresJustification: boolean;
  isBlocking: boolean;
}

export interface AuditEvent {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  occurredAt: string;
  description: string;
}

export interface PharmacistReview {
  status: "pending" | "queued" | "in_review" | "clarification_requested" | "approved" | "rejected";
  reviewerName: string | null;
  note: string;
}

export interface PrescriptionDetail {
  prescriptionId: string;
  prescriptionReference: string;
  status: PrescriptionStatus;
  patient: PatientContext;
  visit: VisitContext;
  items: PrescriptionItem[];
  inventory: Record<string, InventorySummary>;
  safetyAlerts: SafetyAlert[];
  clinicalJustification: string;
  pharmacistReview: PharmacistReview;
  auditEvents: AuditEvent[];
  updatedAt: string;
}

export interface StockReadiness {
  status: StockStatus;
  label: string;
  description: string;
}

export interface SubmissionDecision {
  ok: boolean;
  reasons: string[];
}

export interface SavePrescriptionPayload {
  items: PrescriptionItem[];
  clinicalJustification: string;
}

export interface SubmitPrescriptionPayload extends SavePrescriptionPayload {
  submittedByRole: PrescriptionUserRole;
}
