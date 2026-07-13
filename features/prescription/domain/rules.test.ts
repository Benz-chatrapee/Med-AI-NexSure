import { describe, expect, test } from "vitest";

import {
  calculateStockReadiness,
  canEditPrescription,
  canSubmitPrescription,
  evaluatePrescriptionSafety,
  validatePrescriptionItems,
} from "./rules";
import type {
  InventorySummary,
  PatientContext,
  PrescriptionDetail,
  PrescriptionItem,
} from "./types";

const patient: PatientContext = {
  patientId: "pat-1",
  hn: "HN-000123",
  displayName: "Araya S.",
  age: 34,
  gender: "Female",
  allergies: [{ id: "alg-1", substance: "Penicillin", severity: "severe" }],
};

const baseItem: PrescriptionItem = {
  id: "item-1",
  medicationId: "med-amx",
  medicationDisplayName: "Amoxicillin 500 mg",
  dosage: "500 mg",
  frequency: "TID",
  duration: "7 days",
  quantity: 21,
  unit: "capsule",
  instructions: "Take after meals",
};

const inventory: Record<string, InventorySummary> = {
  "med-amx": {
    medicationId: "med-amx",
    currentStock: 420,
    availableQuantity: 420,
    reorderLevel: 300,
    status: "near_expiry",
    selectedBatch: {
      batchId: "batch-1",
      batchNumber: "AMX-2406",
      availableQuantity: 420,
      unit: "capsule",
      expiryDate: "2026-08-03",
      expiryDays: 21,
    },
  },
  "med-oos": {
    medicationId: "med-oos",
    currentStock: 0,
    availableQuantity: 0,
    reorderLevel: 20,
    status: "out_of_stock",
    selectedBatch: null,
  },
};

function detail(overrides: Partial<PrescriptionDetail> = {}): PrescriptionDetail {
  return {
    prescriptionId: "rx-1",
    prescriptionReference: "RX-2026-00128",
    status: "draft",
    patient,
    visit: {
      visitId: "visit-1",
      visitNumber: "VN-2026-0712-019",
      visitType: "Outpatient Visit",
      chiefComplaint: "Sore throat, fever",
      diagnoses: [{ id: "dx-1", code: "J06.9", label: "Acute URI" }],
    },
    items: [baseItem],
    inventory,
    safetyAlerts: [],
    clinicalJustification: "",
    pharmacistReview: {
      status: "pending",
      reviewerName: null,
      note: "Awaiting submission.",
    },
    auditEvents: [],
    updatedAt: "2026-07-12T13:14:00.000Z",
    ...overrides,
  };
}

describe("prescription domain rules", () => {
  test("rejects an empty medication list", () => {
    expect(validatePrescriptionItems([])).toContain("At least one medication item is required.");
  });

  test("reports missing required medication fields", () => {
    expect(validatePrescriptionItems([{ ...baseItem, dosage: "" }])).toContain("Row 1: dosage is required.");
  });

  test("rejects quantity equal to zero", () => {
    expect(validatePrescriptionItems([{ ...baseItem, quantity: 0 }])).toContain("Row 1: quantity must be greater than zero.");
  });

  test("detects quantity greater than available stock", () => {
    const alerts = evaluatePrescriptionSafety({
      patient,
      items: [{ ...baseItem, quantity: 500 }],
      inventory,
      clinicalJustification: "",
    });

    expect(alerts.some((alert) => alert.code === "stock_insufficient")).toBe(true);
  });

  test("detects out-of-stock medication", () => {
    const alerts = evaluatePrescriptionSafety({
      patient,
      items: [{ ...baseItem, medicationId: "med-oos", medicationDisplayName: "Ibuprofen 400 mg" }],
      inventory,
      clinicalJustification: "",
    });

    expect(alerts.some((alert) => alert.code === "stock_out")).toBe(true);
  });

  test("detects near-expiry medication as a non-blocking warning", () => {
    const alerts = evaluatePrescriptionSafety({ patient, items: [baseItem], inventory, clinicalJustification: "" });
    const nearExpiry = alerts.find((alert) => alert.code === "fefo_near_expiry");

    expect(nearExpiry?.severity).toBe("warning");
    expect(nearExpiry?.isBlocking).toBe(false);
  });

  test("detects allergy contraindication", () => {
    const alerts = evaluatePrescriptionSafety({ patient, items: [baseItem], inventory, clinicalJustification: "" });

    expect(alerts.some((alert) => alert.code === "allergy_contraindication")).toBe(true);
  });

  test("blocks critical alert without meaningful justification", () => {
    const prescription = detail({ clinicalJustification: "short" });
    const alerts = evaluatePrescriptionSafety({
      patient,
      items: prescription.items,
      inventory,
      clinicalJustification: prescription.clinicalJustification,
    });

    expect(canSubmitPrescription({ prescription, alerts, role: "doctor", isMutating: false }).ok).toBe(false);
  });

  test("allows critical alert with valid justification for doctor review submission", () => {
    const prescription = detail({
      clinicalJustification: "Patient history reviewed; alternative therapy unavailable, pharmacist review required before dispense.",
    });
    const alerts = evaluatePrescriptionSafety({
      patient,
      items: prescription.items,
      inventory,
      clinicalJustification: prescription.clinicalJustification,
    });

    expect(canSubmitPrescription({ prescription, alerts, role: "doctor", isMutating: false }).ok).toBe(true);
  });

  test("summarizes valid prescription stock readiness as partial when FEFO warning exists", () => {
    expect(calculateStockReadiness([baseItem], inventory).status).toBe("near_expiry");
  });

  test("blocks role without edit permission", () => {
    const prescription = detail({
      clinicalJustification: "Patient history reviewed; pharmacist verification required before any dispensing.",
    });
    const alerts = evaluatePrescriptionSafety({
      patient,
      items: prescription.items,
      inventory,
      clinicalJustification: prescription.clinicalJustification,
    });

    expect(canSubmitPrescription({ prescription, alerts, role: "auditor", isMutating: false }).ok).toBe(false);
  });

  test("submitted prescription is read-only for doctor order editing", () => {
    expect(canEditPrescription("doctor", "submitted")).toBe(false);
  });
});
