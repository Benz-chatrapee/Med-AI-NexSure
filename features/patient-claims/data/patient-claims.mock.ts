import type { ClaimActivity, ClaimDetail, PatientClaim, PatientClaimsDashboardData } from "../types/patient-claims.types";

export const patientClaimsDashboard: PatientClaimsDashboardData = {
  patient: {
    id: "patient-kanokwan",
    fullName: "Somying Kittipong",
    initials: "SK",
    active: true,
    hn: "HN-6800124",
    patientId: "PT-000124",
    dateOfBirth: "1982-02-14",
    age: 44,
    gender: "Female",
    primaryPayer: "AIA Thailand",
    policyNumber: "TH-8821-4409",
    pdpaConsentStatus: "active",
    clinicalAlerts: ["Penicillin Allergy"],
  },
  claims: [
    claim("claim-1", "CLM-2026-00481", "VIS-260704-018", "2026-07-04", "Orthopedics", "AIA Thailand", "Health Plus Gold", "Lower back pain", "M54.5", 12480, 62, "not_ready", "high", undefined, 5, 9500, 11800, "Above Benchmark"),
    claim("claim-2", "CLM-2026-00462", "VIS-260628-007", "2026-06-28", "Internal Medicine", "Allianz Ayudhya", "Smart Health", "Acute bronchitis", "J20.9", 6820, 96, "submitted", "low", 2, 5, undefined, undefined, "Within Benchmark"),
    claim("claim-3", "CLM-2026-00431", "VIS-260615-011", "2026-06-15", "Neurology", "AIA Thailand", "Health Plus Gold", "Migraine", "G43.9", 8950, 88, "pending", "medium", 7, 5, undefined, undefined, "Review Needed"),
    claim("claim-4", "CLM-2026-00398", "VIS-260529-021", "2026-05-29", "Gastroenterology", "Muang Thai Life", "Elite Health 500", "Gastritis", "K29.7", 7230, 100, "approved", "low", 3, 5, undefined, undefined, "Within Benchmark", 7230),
    claim("claim-5", "CLM-2026-00364", "VIS-260510-008", "2026-05-10", "Internal Medicine", "AXA Thailand", "Health Max", "Essential hypertension", "I10", 5410, 74, "rejected", "high", 4, 5, undefined, undefined, "Consent Mismatch"),
  ],
  summary: {
    totalClaims: 12,
    approvedClaims: 7,
    pendingClaims: 2,
    notReadyClaims: 1,
    submittedClaims: 2,
    totalClaimedAmount: 96400,
    totalApprovedAmount: 64820,
  },
  readiness: {
    score: 82,
    status: "needs_review",
    lastCalculatedAt: "2026-07-10T16:42:00+07:00",
    source: "Mock readiness engine",
    breakdown: [
      { category: "soap", label: "SOAP & Clinical Notes", score: 23, maximumScore: 25 },
      { category: "diagnosis_icd", label: "Diagnosis & ICD", score: 17, maximumScore: 20 },
      { category: "treatment", label: "Treatment Evidence", score: 13, maximumScore: 15 },
      { category: "documents", label: "Supporting Documents", score: 13, maximumScore: 20 },
      { category: "payer_rules", label: "Payer Rules", score: 8, maximumScore: 10 },
      { category: "economic_review", label: "Economic Review", score: 8, maximumScore: 10 },
    ],
  },
  missingEvidence: [
    { id: "missing-1", claimId: "claim-1", name: "Signed Claim Form", description: "Payer requirement for CLM-2026-00481. Due today.", severity: "critical", dueAt: "2026-07-13", actionType: "upload" },
    { id: "missing-2", claimId: "claim-1", visitId: "visit-260704-018", name: "Referral Letter", description: "Outpatient referral rule requires reviewer assignment.", severity: "high", actionType: "assign" },
    { id: "missing-3", claimId: "claim-1", name: "ICD Supporting Evidence", description: "Diagnosis M54.5 requires clinical correlation review.", severity: "medium", actionType: "review" },
  ],
  activities: [
    activity("act-1", "AI evidence extraction completed", "AI Evidence Agent", "2026-07-13T16:38:00+07:00", "CLM-2026-00481", "Signed Claim Form", 94),
    activity("act-2", "Medical certificate verified", "Nattaporn S.", "2026-07-13T15:54:00+07:00", "CLM-2026-00481", "Medical Certificate", undefined),
    activity("act-3", "Claim submitted", "Claim Operations", "2026-06-28T10:15:00+07:00", "CLM-2026-00462", undefined, undefined),
    activity("act-4", "Payer requested additional information", "AIA Thailand", "2026-06-22T09:10:00+07:00", "CLM-2026-00431", "Treatment rationale", undefined),
  ],
  payerRules: {
    payerName: "AIA Thailand",
    planName: "Health Plus Gold",
    policyNumber: "TH-8821-4409",
    policyActiveDate: "2026-01-01",
    requiredEvidenceCount: 7,
    opdBenefitLimit: 1500,
    referralRequirement: "Conditional",
    autoSubmitThreshold: 90,
    lastUpdatedAt: "2026-07-10T12:30:00+07:00",
  },
};

export const patientClaimDetails: ClaimDetail[] = patientClaimsDashboard.claims.map((item) => ({
  ...item,
  claimType: "OPD Reimbursement",
  evidenceChecklist: [
    { id: "ev-1", label: "SOAP Note completed and signed", status: "complete" },
    { id: "ev-2", label: "Diagnosis and ICD-10 confirmed", status: "complete" },
    { id: "ev-3", label: "Prescription and treatment details", status: "complete" },
    { id: "ev-4", label: "Signed Claim Form", status: item.id === "claim-1" ? "missing" : "complete" },
    { id: "ev-5", label: "Referral Letter", status: item.id === "claim-1" ? "missing" : "not_applicable" },
    { id: "ev-6", label: "ICD supporting evidence", status: item.id === "claim-1" ? "needs_review" : "complete" },
  ],
  aiRecommendation:
    item.id === "claim-1"
      ? "Complete the signed claim form and attach referral evidence before submission. Cost exceeds expected range by 5.8%; add clinical justification."
      : "Evidence appears sufficient for human review. Confirm payer policy terms before any submission decision.",
}));

function claim(
  id: string,
  claimNumber: string,
  visitNumber: string,
  serviceDate: string,
  department: string,
  payerName: string,
  planName: string,
  diagnosisName: string,
  icdCode: string,
  claimedAmount: number,
  readinessScore: number,
  claimStatus: PatientClaim["claimStatus"],
  riskLevel: PatientClaim["riskLevel"],
  tatDays?: number,
  tatTargetDays?: number,
  expectedAmountMin?: number,
  expectedAmountMax?: number,
  economicStatus?: string,
  approvedAmount?: number,
): PatientClaim {
  return {
    id,
    claimNumber,
    patientId: "patient-kanokwan",
    visitId: visitNumber.toLowerCase(),
    visitNumber,
    serviceDate,
    department,
    payerName,
    planName,
    diagnosisName,
    icdCode,
    claimedAmount,
    readinessScore,
    claimStatus,
    riskLevel,
    tatDays,
    tatTargetDays,
    expectedAmountMin,
    expectedAmountMax,
    economicStatus,
    approvedAmount,
    claimType: "OPD Reimbursement",
  };
}

function activity(id: string, title: string, actor: string, timestamp: string, relatedClaim?: string, relatedDocument?: string, aiConfidence?: number): ClaimActivity {
  return {
    id,
    eventType: title,
    title,
    actor,
    timestamp,
    relatedClaim,
    relatedDocument,
    aiConfidence,
    auditHref: "/audit-compliance",
  };
}
