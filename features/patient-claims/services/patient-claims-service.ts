import { patientClaimDetails, patientClaimsDashboard } from "../data/patient-claims.mock";
import type { PatientClaimsFilters, RecalculateReadinessResult } from "../types/patient-claims.types";
import { filterPatientClaims } from "../utils/patient-claims-utils";

export class PatientClaimsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatientClaimsServiceError";
  }
}

export async function getPatientClaimsDashboard(patientId: string) {
  await delay(80);
  if (!patientId) {
    throw new PatientClaimsServiceError("Patient claims could not be loaded.");
  }

  return patientClaimsDashboard;
}

export async function getPatientClaims(patientId: string, filters: PatientClaimsFilters) {
  await delay(80);
  if (!patientId) {
    throw new PatientClaimsServiceError("Claims could not be loaded.");
  }

  return filterPatientClaims(patientClaimsDashboard.claims, filters);
}

export async function getClaimDetail(claimId: string) {
  await delay(180);
  if (!claimId) {
    throw new PatientClaimsServiceError("Claim detail could not be loaded.");
  }

  return patientClaimDetails.find((claim) => claim.id === claimId) ?? null;
}

export async function recalculateClaimReadiness(patientId: string): Promise<RecalculateReadinessResult> {
  await delay(500);
  if (!patientId) {
    throw new PatientClaimsServiceError("Readiness could not be recalculated.");
  }

  return {
    readiness: {
      ...patientClaimsDashboard.readiness,
      lastCalculatedAt: new Date().toISOString(),
      source: "Mock readiness recalculation",
    },
    auditEventId: `audit-readiness-${Date.now()}`,
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
