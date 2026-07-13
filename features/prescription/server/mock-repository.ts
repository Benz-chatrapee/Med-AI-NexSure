import type {
  AuditEvent,
  InventorySummary,
  MedicationOption,
  PrescriptionDetail,
  SavePrescriptionPayload,
  SubmitPrescriptionPayload,
} from "../domain/types";

const medications: MedicationOption[] = [
  { id: "med-amx", genericName: "Amoxicillin", brandName: null, strength: "500 mg", dosageForm: "capsule", displayName: "Amoxicillin 500 mg", allergyClass: "penicillin" },
  { id: "med-pcm", genericName: "Paracetamol", brandName: null, strength: "500 mg", dosageForm: "tablet", displayName: "Paracetamol 500 mg" },
  { id: "med-ctz", genericName: "Cetirizine", brandName: null, strength: "10 mg", dosageForm: "tablet", displayName: "Cetirizine 10 mg" },
  { id: "med-ibu", genericName: "Ibuprofen", brandName: null, strength: "400 mg", dosageForm: "tablet", displayName: "Ibuprofen 400 mg" },
];

const inventory: Record<string, InventorySummary> = {
  "med-amx": {
    medicationId: "med-amx",
    currentStock: 420,
    availableQuantity: 420,
    reorderLevel: 300,
    status: "near_expiry",
    selectedBatch: { batchId: "batch-amx", batchNumber: "AMX-2406", availableQuantity: 420, unit: "capsule", expiryDate: "2026-08-03", expiryDays: 21 },
  },
  "med-pcm": {
    medicationId: "med-pcm",
    currentStock: 845,
    availableQuantity: 845,
    reorderLevel: 300,
    status: "available",
    selectedBatch: { batchId: "batch-pcm", batchNumber: "PCM-2510", availableQuantity: 845, unit: "tablet", expiryDate: "2027-01-17", expiryDays: 188 },
  },
  "med-ctz": {
    medicationId: "med-ctz",
    currentStock: 180,
    availableQuantity: 180,
    reorderLevel: 200,
    status: "low_stock",
    selectedBatch: { batchId: "batch-ctz", batchNumber: "CTZ-2503", availableQuantity: 180, unit: "tablet", expiryDate: "2026-09-25", expiryDays: 74 },
  },
  "med-ibu": { medicationId: "med-ibu", currentStock: 0, availableQuantity: 0, reorderLevel: 100, status: "out_of_stock", selectedBatch: null },
};

let prescription: PrescriptionDetail = {
  prescriptionId: "rx-2026-00128",
  prescriptionReference: "RX-2026-00128",
  status: "draft",
  patient: {
    patientId: "pat-000123",
    hn: "HN-000123",
    displayName: "Araya S.",
    age: 34,
    gender: "Female",
    allergies: [{ id: "alg-pen", substance: "Penicillin", severity: "severe" }],
  },
  visit: {
    visitId: "visit-2026-0712-019",
    visitNumber: "VN-2026-0712-019",
    visitType: "Outpatient Visit",
    chiefComplaint: "Sore throat, fever",
    diagnoses: [{ id: "dx-uri", code: "J06.9", label: "Acute URI" }],
  },
  items: [
    { id: "item-amx", medicationId: "med-amx", medicationDisplayName: "Amoxicillin 500 mg", dosage: "500 mg", frequency: "TID", duration: "7 days", quantity: 21, unit: "capsule", instructions: "Take after meals" },
    { id: "item-pcm", medicationId: "med-pcm", medicationDisplayName: "Paracetamol 500 mg", dosage: "500 mg", frequency: "PRN q6h", duration: "3 days", quantity: 12, unit: "tablet", instructions: "For fever or pain" },
  ],
  inventory,
  safetyAlerts: [],
  clinicalJustification: "",
  pharmacistReview: { status: "pending", reviewerName: null, note: "Draft has not been submitted to pharmacist review." },
  auditEvents: [
    { id: "audit-created", action: "prescription_created", actorName: "Dr. Narin", actorRole: "doctor", occurredAt: "2026-07-12T13:08:00.000Z", description: "Prescription draft created from outpatient visit context." },
    { id: "audit-updated", action: "medication_added", actorName: "Dr. Narin", actorRole: "doctor", occurredAt: "2026-07-12T13:14:00.000Z", description: "Two medication items added for rule and pharmacist review." },
  ],
  updatedAt: "2026-07-12T13:14:00.000Z",
};

export async function getPrescriptionByVisit(visitId: string, signal?: AbortSignal): Promise<PrescriptionDetail> {
  await wait(signal);
  return { ...prescription, visit: { ...prescription.visit, visitId } };
}

export async function searchMedications(query: string, signal?: AbortSignal): Promise<MedicationOption[]> {
  await wait(signal, 120);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return medications;
  return medications.filter((medication) => `${medication.displayName} ${medication.genericName} ${medication.brandName ?? ""}`.toLowerCase().includes(normalized));
}

export async function getMedicationInventory(medicationId: string, signal?: AbortSignal): Promise<InventorySummary> {
  await wait(signal, 120);
  return inventory[medicationId] ?? { medicationId, currentStock: 0, availableQuantity: 0, reorderLevel: 0, status: "unknown", selectedBatch: null };
}

export async function saveDraft(payload: SavePrescriptionPayload): Promise<PrescriptionDetail> {
  await wait();
  prescription = { ...prescription, status: "draft", items: payload.items, clinicalJustification: payload.clinicalJustification, updatedAt: new Date().toISOString(), auditEvents: [...prescription.auditEvents, audit("draft_saved", "Draft saved with medication items and clinical justification.")] };
  return prescription;
}

export async function submitPrescription(payload: SubmitPrescriptionPayload): Promise<PrescriptionDetail> {
  await wait();
  prescription = {
    ...prescription,
    status: "submitted",
    items: payload.items,
    clinicalJustification: payload.clinicalJustification,
    pharmacistReview: { status: "queued", reviewerName: null, note: "Submitted to pharmacist review queue. Editing is restricted by workflow status." },
    updatedAt: new Date().toISOString(),
    auditEvents: [...prescription.auditEvents, audit("prescription_submitted", `Submitted by ${payload.submittedByRole} to pharmacist review queue.`)],
  };
  return prescription;
}

export async function getAuditEvents(signal?: AbortSignal): Promise<AuditEvent[]> {
  await wait(signal, 100);
  return prescription.auditEvents;
}

function audit(action: string, description: string): AuditEvent {
  return { id: `audit-${action}-${Date.now()}`, action, actorName: "Dr. Narin", actorRole: "doctor", occurredAt: new Date().toISOString(), description };
}

function wait(signal?: AbortSignal, ms = 220): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request cancelled", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Request cancelled", "AbortError"));
    }, { once: true });
  });
}
