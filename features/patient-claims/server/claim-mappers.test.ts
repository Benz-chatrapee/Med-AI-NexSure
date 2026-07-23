import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { Database } from "@/lib/database.types";
import { mapClaimRow, mapPatientRow } from "./claim-mappers";

type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

const baseClaim: ClaimRow = {
  claim_number: "CLM-2026-0001",
  claim_type_code: "opd",
  clinic_id: "clinic-1",
  closed_at: null,
  created_at: "2026-07-23T00:00:00Z",
  created_by: "user-1",
  currency_code: "THB",
  current_ai_assessment_id: null,
  current_decision_id: "decision-1",
  decision_status: "approved",
  deleted_at: null,
  deleted_by: null,
  id: "claim-1",
  legacy_status_migration_state: null,
  member_reference: null,
  organization_id: "org-1",
  patient_id: "patient-1",
  payer_id: null,
  payer_reference: "AIA Thailand",
  payment_status: "partially_paid",
  policy_reference: "POL-001",
  risk_level: "medium",
  service_end_date: null,
  service_start_date: "2026-07-20",
  state_updated_at: "2026-07-23T01:00:00Z",
  state_updated_by: "user-1",
  status: "submitted",
  submitted_at: "2026-07-21T00:00:00Z",
  total_approved_amount: 8000,
  total_claimed_amount: 10000,
  total_eligible_amount: 9000,
  total_paid_amount: 4000,
  updated_at: "2026-07-23T01:00:00Z",
  updated_by: "user-1",
  version: 7,
  visit_id: "visit-1",
  workflow_status: "under_review",
};

describe("claim mappers", () => {
  it("maps split workflow, decision, payment, and version fields without collapsing them", () => {
    const claim = mapClaimRow(baseClaim);

    expect(claim.workflowStatus).toBe("under_review");
    expect(claim.decisionStatus).toBe("approved");
    expect(claim.paymentStatus).toBe("partially_paid");
    expect(claim.version).toBe(7);
    expect(claim.claimStatus).toBe("approved");
    expect(claim.canonicalStateSupported).toBe(true);
  });

  it("fails safe when a required split state is null", () => {
    const claim = mapClaimRow({ ...baseClaim, workflow_status: null });

    expect(claim.workflowStatus).toBe("unknown");
    expect(claim.canonicalStateSupported).toBe(false);
    expect(claim.claimStatus).toBe("needs_review");
    expect(claim.authoritativeActionsEnabled).toBe(false);
  });

  it("maps patient ownership and identity from the canonical patient row", () => {
    const row: PatientRow = {
      clinic_id: "clinic-1",
      consent_status: "active",
      consent_updated_at: null,
      created_at: "2026-07-20T00:00:00Z",
      created_by: null,
      date_of_birth: "1982-02-14",
      deleted_at: null,
      deleted_by: null,
      display_label: "Somying Kittipong",
      id: "patient-1",
      is_active: true,
      organization_id: "org-1",
      patient_code: "HN-6800124",
      sex_at_birth: "female",
      updated_at: "2026-07-23T00:00:00Z",
      updated_by: null,
    };

    const patient = mapPatientRow(row, new Date("2026-07-23T00:00:00Z"));

    expect(patient.id).toBe("patient-1");
    expect(patient.patientId).toBe("HN-6800124");
    expect(patient.fullName).toBe("Somying Kittipong");
    expect(patient.pdpaConsentStatus).toBe("active");
  });
});
