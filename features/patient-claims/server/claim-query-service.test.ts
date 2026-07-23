import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { Database } from "@/lib/database.types";
import {
  createClaimQueryService,
  type ClaimQueryContext,
  type ClaimQueryGateway,
} from "./claim-query-service";

type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

const context: ClaimQueryContext = {
  actorId: "actor-1",
  organizationId: "org-1",
  clinicId: "clinic-1",
};

const patient: PatientRow = {
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

const claim: ClaimRow = {
  claim_number: "CLM-1",
  claim_type_code: "opd",
  clinic_id: "clinic-1",
  closed_at: null,
  created_at: "2026-07-23T00:00:00Z",
  created_by: "actor-1",
  currency_code: "THB",
  current_ai_assessment_id: null,
  current_decision_id: null,
  decision_status: "not_decided",
  deleted_at: null,
  deleted_by: null,
  id: "claim-1",
  legacy_status_migration_state: null,
  member_reference: null,
  organization_id: "org-1",
  patient_id: "patient-1",
  payer_id: null,
  payer_reference: "AIA",
  payment_status: "not_paid",
  policy_reference: null,
  risk_level: "low",
  service_end_date: null,
  service_start_date: "2026-07-20",
  state_updated_at: "2026-07-23T00:00:00Z",
  state_updated_by: "actor-1",
  status: "draft",
  submitted_at: null,
  total_approved_amount: null,
  total_claimed_amount: 1000,
  total_eligible_amount: null,
  total_paid_amount: 0,
  updated_at: "2026-07-23T00:00:00Z",
  updated_by: "actor-1",
  version: 2,
  visit_id: null,
  workflow_status: "draft",
};

describe("claim query service", () => {
  it("passes trusted organization and clinic scope to every query", async () => {
    const calls: Array<Record<string, string>> = [];
    const gateway: ClaimQueryGateway = {
      async getPatient(input) {
        calls.push({ operation: "patient", ...input });
        return patient;
      },
      async listClaims(input) {
        calls.push({ operation: "claims", ...input });
        return [claim];
      },
    };

    const service = createClaimQueryService({
      gateway,
      getContext: async () => context,
    });
    const result = await service.getPatientClaimsDashboard("patient-1");

    expect(calls).toEqual([
      {
        operation: "patient",
        patientId: "patient-1",
        organizationId: "org-1",
        clinicId: "clinic-1",
      },
      {
        operation: "claims",
        patientId: "patient-1",
        organizationId: "org-1",
        clinicId: "clinic-1",
      },
    ]);
    expect(result.claims[0]).toMatchObject({
      id: "claim-1",
      version: 2,
      workflowStatus: "draft",
    });
  });

  it("rejects rows returned outside the trusted tenant or clinic scope", async () => {
    const gateway: ClaimQueryGateway = {
      async getPatient() {
        return patient;
      },
      async listClaims() {
        return [{ ...claim, clinic_id: "clinic-2" }];
      },
    };

    const service = createClaimQueryService({
      gateway,
      getContext: async () => context,
    });

    await expect(
      service.getPatientClaimsDashboard("patient-1"),
    ).rejects.toMatchObject({ code: "tenant_scope_mismatch" });
  });
});
