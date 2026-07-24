import { describe, expect, it } from "vitest";
import type { CanonicalPatientClaim, PatientClaimsFilters } from "../types/patient-claims.types";
import { filterPatientClaims, formatClaimCurrency, paginatePatientClaims } from "./patient-claims-utils";

const claims: CanonicalPatientClaim[] = [
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
    readinessScore: 59,
    legacyClaimPresentationStatus: "not_ready", readinessSource: "presentation_fallback", readinessAuthoritative: false, organizationId: "org-1", clinicId: "clinic-1", workflowStatus: "collecting_data", decisionStatus: "not_decided", paymentStatus: "not_paid", version: 1, stateUpdatedAt: null, currentDecisionId: null, totalEligibleAmount: null, totalPaidAmount: 0, currencyCode: "THB", legacyStatus: null, canonicalStateSupported: true, authoritativeActionsEnabled: true,
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
    legacyClaimPresentationStatus: "submitted", readinessSource: "verified_assessment", readinessAuthoritative: true, organizationId: "org-1", clinicId: "clinic-1", workflowStatus: "submitted", decisionStatus: "not_decided", paymentStatus: "payment_pending", version: 1, stateUpdatedAt: null, currentDecisionId: null, totalEligibleAmount: null, totalPaidAmount: 0, currencyCode: "THB", legacyStatus: null, canonicalStateSupported: true, authoritativeActionsEnabled: true,
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
    legacyClaimPresentationStatus: "approved", readinessSource: "verified_assessment", readinessAuthoritative: true, organizationId: "org-1", clinicId: "clinic-1", workflowStatus: "closed", decisionStatus: "approved", paymentStatus: "paid", version: 1, stateUpdatedAt: null, currentDecisionId: null, totalEligibleAmount: null, totalPaidAmount: 7230, currencyCode: "THB", legacyStatus: null, canonicalStateSupported: true, authoritativeActionsEnabled: true,
    riskLevel: "low",
  },
];

function filters(overrides: Partial<PatientClaimsFilters>): PatientClaimsFilters {
  return {
    query: "",
    workflowStatus: "all",
    workflowGroup: "all",
    decisionStatus: "all",
    paymentStatus: "all",
    readinessStatus: "all",
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
        workflowStatus: "submitted",
        paymentStatus: "payment_pending",
        risk: "low",
        payer: "Allianz Ayudhya",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
      }),
    );

    expect(result.map((claim) => claim.claimNumber)).toEqual(["CLM-2026-00462"]);
  });

  it("filters workflow, decision, payment, and readiness independently", () => {
    expect(filterPatientClaims(claims, filters({ decisionStatus: "approved" })).map((claim) => claim.id)).toEqual(["claim-3"]);
    expect(filterPatientClaims(claims, filters({ paymentStatus: "not_paid" })).map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(filterPatientClaims(claims, filters({ readinessStatus: "not_ready" })).map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(filterPatientClaims(claims, filters({ workflowGroup: "pending" })).map((claim) => claim.id)).toEqual(["claim-1", "claim-2"]);
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


