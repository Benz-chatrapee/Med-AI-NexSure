import type {
  InventorySummary,
  PatientContext,
  PrescriptionDetail,
  PrescriptionItem,
  PrescriptionStatus,
  PrescriptionUserRole,
  SafetyAlert,
  StockReadiness,
  StockStatus,
  SubmissionDecision,
} from "./types";

const EDITABLE_STATUSES: PrescriptionStatus[] = ["draft", "clarification_required", "rejected"];
const SUBMIT_STATUSES: PrescriptionStatus[] = ["draft", "clarification_required"];
const ORDER_EDIT_ROLES: PrescriptionUserRole[] = ["doctor", "admin"];
const SUBMIT_ROLES: PrescriptionUserRole[] = ["doctor", "admin"];

export function validatePrescriptionItems(items: PrescriptionItem[]): string[] {
  if (items.length === 0) return ["At least one medication item is required."];

  return items.flatMap((item, index) => {
    const row = index + 1;
    const errors: string[] = [];
    if (!item.medicationId.trim()) errors.push(`Row ${row}: medication is required.`);
    if (!item.dosage.trim()) errors.push(`Row ${row}: dosage is required.`);
    if (!item.frequency.trim()) errors.push(`Row ${row}: frequency is required.`);
    if (!item.duration.trim()) errors.push(`Row ${row}: duration is required.`);
    if (item.quantity <= 0) errors.push(`Row ${row}: quantity must be greater than zero.`);
    if (!item.unit.trim()) errors.push(`Row ${row}: unit is required.`);
    return errors;
  });
}

export function evaluatePrescriptionSafety({
  patient,
  items,
  inventory,
  clinicalJustification,
}: {
  patient: PatientContext;
  items: PrescriptionItem[];
  inventory: Record<string, InventorySummary>;
  clinicalJustification: string;
}): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const allergyTerms = patient.allergies.map((allergy) => allergy.substance.toLowerCase());

  for (const item of items) {
    const medicationName = item.medicationDisplayName.toLowerCase();
    const itemInventory = inventory[item.medicationId];

    if (allergyTerms.some((term) => medicationName.includes(term) || (term === "penicillin" && medicationName.includes("amoxicillin")))) {
      alerts.push({
        id: `alert-allergy-${item.id}`,
        severity: "critical",
        code: "allergy_contraindication",
        title: "Critical - Allergy Contraindication",
        description: `${item.medicationDisplayName} may conflict with documented allergy history. Licensed clinician and pharmacist review is required.`,
        medicationItemId: item.id,
        requiresJustification: true,
        isBlocking: clinicalJustification.trim().length < 20,
      });
    }

    if (!itemInventory) {
      alerts.push({
        id: `alert-stock-unknown-${item.id}`,
        severity: "info",
        code: "stock_unknown",
        title: "Info - Stock Unknown",
        description: `${item.medicationDisplayName} inventory is not available in the mock repository.`,
        medicationItemId: item.id,
        requiresJustification: false,
        isBlocking: false,
      });
      continue;
    }

    if (itemInventory.status === "out_of_stock" || itemInventory.availableQuantity === 0) {
      alerts.push({
        id: `alert-stock-out-${item.id}`,
        severity: "critical",
        code: "stock_out",
        title: "Critical - Out of Stock",
        description: `${item.medicationDisplayName} is currently out of stock. Adjust medication before submission.`,
        medicationItemId: item.id,
        requiresJustification: false,
        isBlocking: true,
      });
    } else if (item.quantity > itemInventory.availableQuantity) {
      alerts.push({
        id: `alert-stock-insufficient-${item.id}`,
        severity: "warning",
        code: "stock_insufficient",
        title: "Warning - Insufficient Stock",
        description: `${item.medicationDisplayName} quantity exceeds available stock.`,
        medicationItemId: item.id,
        requiresJustification: false,
        isBlocking: true,
      });
    } else if (itemInventory.status === "near_expiry" || (itemInventory.selectedBatch?.expiryDays ?? 999) < 30) {
      alerts.push({
        id: `alert-fefo-${item.id}`,
        severity: "warning",
        code: "fefo_near_expiry",
        title: "Warning - Near Expiry FEFO Batch",
        description: `${item.medicationDisplayName} has a FEFO batch requiring pharmacist verification.`,
        medicationItemId: item.id,
        requiresJustification: false,
        isBlocking: false,
      });
    } else {
      alerts.push({
        id: `alert-dose-${item.id}`,
        severity: "passed",
        code: "dose_range_passed",
        title: "Passed - Configured Dose Check",
        description: `${item.medicationDisplayName} passed configured structural checks. This does not guarantee clinical safety.`,
        medicationItemId: item.id,
        requiresJustification: false,
        isBlocking: false,
      });
    }
  }

  alerts.push({
    id: "alert-human-review",
    severity: "info",
    code: "human_review_required",
    title: "Info - Human Review Required",
    description: "AI and rule-based checks provide decision support only. A licensed clinician or pharmacist must review the result.",
    requiresJustification: false,
    isBlocking: false,
  });

  return alerts;
}

export function calculateStockReadiness(
  items: PrescriptionItem[],
  inventory: Record<string, InventorySummary>,
): StockReadiness {
  const statuses = items.map((item) => inventory[item.medicationId]?.status ?? "unknown");

  if (statuses.includes("out_of_stock")) return stockReadiness("out_of_stock");
  if (items.some((item) => item.quantity > (inventory[item.medicationId]?.availableQuantity ?? 0))) return stockReadiness("insufficient");
  if (statuses.includes("near_expiry")) return stockReadiness("near_expiry");
  if (statuses.includes("low_stock")) return stockReadiness("low_stock");
  if (statuses.length > 0 && statuses.every((status) => status === "available")) return stockReadiness("available");
  return stockReadiness("unknown");
}

export function canEditPrescription(role: PrescriptionUserRole, status: PrescriptionStatus): boolean {
  return ORDER_EDIT_ROLES.includes(role) && EDITABLE_STATUSES.includes(status);
}

export function canSubmitPrescription({
  prescription,
  alerts,
  role,
  isMutating,
}: {
  prescription: PrescriptionDetail;
  alerts: SafetyAlert[];
  role: PrescriptionUserRole;
  isMutating: boolean;
}): SubmissionDecision {
  const reasons = [
    ...validatePrescriptionItems(prescription.items),
    ...alerts.filter((alert) => alert.isBlocking).map((alert) => alert.title),
  ];

  if (!SUBMIT_ROLES.includes(role)) reasons.push("Current role cannot submit prescriptions.");
  if (!SUBMIT_STATUSES.includes(prescription.status)) reasons.push("Prescription status is not eligible for submission.");
  if (isMutating) reasons.push("A save or submit action is already in progress.");

  return { ok: reasons.length === 0, reasons };
}

function stockReadiness(status: StockStatus): StockReadiness {
  const labels: Record<StockStatus, StockReadiness> = {
    available: {
      status,
      label: "Available",
      description: "All selected medication quantities are available.",
    },
    low_stock: {
      status,
      label: "Low Stock",
      description: "Stock is available but near the configured reorder level.",
    },
    near_expiry: {
      status,
      label: "Near Expiry",
      description: "FEFO batch is available and requires pharmacist verification.",
    },
    insufficient: {
      status,
      label: "Insufficient",
      description: "At least one quantity exceeds available inventory.",
    },
    out_of_stock: {
      status,
      label: "Out of Stock",
      description: "At least one selected medication has no available stock.",
    },
    unknown: {
      status,
      label: "Unknown",
      description: "Inventory information is unavailable for at least one item.",
    },
  };

  return labels[status];
}
