import { describe, expect, it } from "vitest";
import type { PatientClaim, PatientClaimsFilters } from "../types/patient-claims.types";
import { filterPatientClaims, formatClaimCurrency, paginatePatientClaims } from "./patient-claims-utils";

const claims: PatientClaim[] = [
  {
    id: "claim-1",
    claimNumber: "CLM-2026-00481",
    patientId: "patient-kanokwan",
    visitId: "visit-1",
    visitNumber: "VIS-260704-018",
    serviceDate: "2026-07-04",
    department: "Orthopedics",
    payerName: "AIA Thailand",
    planName: "Health Plus Gold",
    diagnosisName: "Lower back pain",
    icdCode: "M54.5",
    claimedAmount: 12480,
    readinessScore: 62,
    claimStatus: "not_ready",
    riskLevel: "high",
  },
  {
    id: "claim-2",
    claimNumber: "CLM-2026-00462",
    patientId: "patient-kanokwan",
    visitId: "visit-2",
    visitNumber: "VIS-260628-007",
    serviceDate: "2026-06-28",
    department: "Internal Medicine",
    payerName: "Allianz Ayudhya",
    planName: "Smart Health",
    diagnosisName: "Acute bronchitis",
    icdCode: "J20.9",
    claimedAmount: 6820,
    readinessScore: 96,
    claimStatus: "submitted",
    riskLevel: "low",
  },
  {
    id: "claim-3",
    claimNumber: "CLM-2026-00398",
    patientId: "patient-kanokwan",
    visitId: "visit-3",
    visitNumber: "VIS-260529-021",
    serviceDate: "2026-05-29",
    department: "Gastroenterology",
    payerName: "Muang Thai Life",
    planName: "Elite Health 500",
    diagnosisName: "Gastritis",
    icdCode: "K29.7",
    claimedAmount: 7230,
    readinessScore: 100,
    claimStatus: "approved",
    riskLevel: "low",
  },
];

function filters(overrides: Partial<PatientClaimsFilters>): PatientClaimsFilters {
  return {
    query: "",
    status: "all",
    payer: "all",
    risk: "all",
    page: 1,
    pageSize: 10,
    ...overrides,
  };
}

describe("patient claims utilities", () => {
  it("filters claims by query across claim number, visit, diagnosis, ICD, and payer", () => {
    expect(filterPatientClaims(claims, filters({ query: "m54.5" })).map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(filterPatientClaims(claims, filters({ query: "allianz" })).map((claim) => claim.id)).toEqual(["claim-2"]);
    expect(filterPatientClaims(claims, filters({ query: "VIS-260529" })).map((claim) => claim.id)).toEqual(["claim-3"]);
  });

  it("applies status, risk, payer, and date filters together", () => {
    const result = filterPatientClaims(
      claims,
      filters({
        status: "submitted",
        risk: "low",
        payer: "Allianz Ayudhya",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    );

    expect(result.map((claim) => claim.claimNumber)).toEqual(["CLM-2026-00462"]);
  });

  it("paginates claims with a stable item range", () => {
    const result = paginatePatientClaims(claims, { page: 2, pageSize: 2 });

    expect(result.items.map((claim) => claim.id)).toEqual(["claim-3"]);
    expect(result.total).toBe(3);
    expect(result.pageCount).toBe(2);
    expect(result.rangeLabel).toBe("Showing 3-3 of 3 claims");
  });

  it("formats Thai baht without decimal noise", () => {
    expect(formatClaimCurrency(96400)).toBe("฿96,400");
  });
});
