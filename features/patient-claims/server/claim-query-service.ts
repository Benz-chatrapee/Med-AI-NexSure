import "server-only";

import type { Database } from "@/lib/database.types";
import { patientClaimsDashboard } from "../data/patient-claims.mock";
import type { CanonicalPatientClaimsDashboardData } from "../types/patient-claims.types";
import { ClaimIntegrationError, toClaimIntegrationError } from "./claim-integration-errors";
import { mapClaimDetail, mapClaimRow, mapPatientRow, summarizeClaims } from "./claim-mappers";

type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export type ClaimQueryContext = {
  actorId: string;
  organizationId: string;
  clinicId: string;
  accessToken?: string;
};

type TenantScopedPatientInput = {
  patientId: string;
  organizationId: string;
  clinicId: string;
};

export interface ClaimQueryGateway {
  getPatient(input: TenantScopedPatientInput): Promise<PatientRow | null>;
  listClaims(input: TenantScopedPatientInput): Promise<ClaimRow[]>;
}

type CreateClaimQueryServiceOptions = {
  gateway?: ClaimQueryGateway;
  getContext?: () => Promise<ClaimQueryContext>;
};

export function createClaimQueryService(options: CreateClaimQueryServiceOptions = {}) {
  const getContext = options.getContext ?? getDemoClaimReadContext;

  return {
    async getPatientClaimsDashboard(
      patientId: string,
    ): Promise<CanonicalPatientClaimsDashboardData> {
      if (!patientId.trim()) {
        throw new ClaimIntegrationError(
          "patient_not_found",
          "Patient identifier is required.",
        );
      }

      try {
        const context = await getContext();
        const gateway =
          options.gateway ?? createSupabaseRestClaimGateway(context.accessToken);
        const scope = {
          patientId,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
        };

        const patient = await gateway.getPatient(scope);
        if (!patient) {
          throw new ClaimIntegrationError(
            "patient_not_found",
            "Patient was not found in the authorized scope.",
          );
        }

        assertTenantScope(patient, context);

        const rows = await gateway.listClaims(scope);
        rows.forEach((row) => assertTenantScope(row, context));

        const claims = rows.map(mapClaimRow);

        return {
          ...patientClaimsDashboard,
          patient: mapPatientRow(patient),
          claims,
          claimDetails: rows.map(mapClaimDetail),
          summary: summarizeClaims(claims),
          readiness: {
            ...patientClaimsDashboard.readiness,
            source: "Presentation fallback — verified Claim Readiness assessment not integrated",
            lastCalculatedAt:
              claims.find((claim) => claim.stateUpdatedAt)?.stateUpdatedAt ??
              patient.updated_at,
          },
          missingEvidence: patientClaimsDashboard.missingEvidence.filter((item) =>
            item.claimId
              ? claims.some((claim) => claim.id === item.claimId)
              : true,
          ),
          activities: patientClaimsDashboard.activities.filter((item) =>
            item.relatedClaim
              ? claims.some((claim) => claim.claimNumber === item.relatedClaim)
              : true,
          ),
          payerRules: patientClaimsDashboard.payerRules,
        };
      } catch (error) {
        throw toClaimIntegrationError(error);
      }
    },
  };
}

export const claimQueryService = createClaimQueryService();

function assertTenantScope(
  row: { organization_id: string; clinic_id: string },
  context: Pick<ClaimQueryContext, "organizationId" | "clinicId">,
): void {
  if (
    row.organization_id !== context.organizationId ||
    row.clinic_id !== context.clinicId
  ) {
    throw new ClaimIntegrationError(
      "tenant_scope_mismatch",
      "Claim information is outside the authorized organization or clinic scope.",
    );
  }
}

async function getDemoClaimReadContext(): Promise<ClaimQueryContext> {
  const organizationId = process.env.MED_AI_DEMO_ORGANIZATION_ID;
  const clinicId = process.env.MED_AI_DEMO_CLINIC_ID;
  const actorId = process.env.MED_AI_DEMO_ACTOR_ID;
  const accessToken = process.env.MED_AI_DEMO_ACCESS_TOKEN;

  if (!organizationId || !clinicId || !actorId || !accessToken) {
    throw new ClaimIntegrationError(
      "configuration_error",
      "Authenticated server-side claim read context is not configured.",
    );
  }

  return {
    organizationId,
    clinicId,
    actorId,
    accessToken,
  };
}

function createSupabaseRestClaimGateway(
  accessToken: string | undefined,
): ClaimQueryGateway {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || !accessToken) {
    return createConfigurationErrorGateway();
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
  };

  return {
    async getPatient(input) {
      const query = new URLSearchParams({
        select:
          "id,organization_id,clinic_id,patient_code,display_label,date_of_birth,sex_at_birth,is_active,consent_status,consent_updated_at,created_at,created_by,updated_at,updated_by,deleted_at,deleted_by",
        id: `eq.${input.patientId}`,
        organization_id: `eq.${input.organizationId}`,
        clinic_id: `eq.${input.clinicId}`,
        deleted_at: "is.null",
        limit: "1",
      });

      const rows = await fetchRows<PatientRow>(
        `${url}/rest/v1/patients?${query}`,
        headers,
      );

      return rows[0] ?? null;
    },

    async listClaims(input) {
      const query = new URLSearchParams({
        select:
          "id,organization_id,clinic_id,patient_id,visit_id,claim_number,claim_type_code,workflow_status,decision_status,payment_status,version,state_updated_at,state_updated_by,current_decision_id,total_claimed_amount,total_eligible_amount,total_approved_amount,total_paid_amount,currency_code,payer_reference,policy_reference,risk_level,status,service_start_date,service_end_date,submitted_at,closed_at,created_at,created_by,updated_at,updated_by,deleted_at,deleted_by,current_ai_assessment_id,legacy_status_migration_state,member_reference,payer_id",
        patient_id: `eq.${input.patientId}`,
        organization_id: `eq.${input.organizationId}`,
        clinic_id: `eq.${input.clinicId}`,
        deleted_at: "is.null",
        order: "service_start_date.desc",
      });

      return fetchRows<ClaimRow>(`${url}/rest/v1/claims?${query}`, headers);
    },
  };
}

function createConfigurationErrorGateway(): ClaimQueryGateway {
  return {
    async getPatient() {
      throw new ClaimIntegrationError(
        "configuration_error",
        "Supabase authenticated server configuration is missing.",
      );
    },
    async listClaims() {
      throw new ClaimIntegrationError(
        "configuration_error",
        "Supabase authenticated server configuration is missing.",
      );
    },
  };
}

async function fetchRows<T>(
  url: string,
  headers: Record<string, string>,
): Promise<T[]> {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ClaimIntegrationError(
      "query_failed",
      `Claim query failed with status ${response.status}.`,
    );
  }

  return (await response.json()) as T[];
}
