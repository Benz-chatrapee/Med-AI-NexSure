import type { PatientDetailData } from "../types/patient-detail.types";

const patientDetail: PatientDetailData = {
  access: "allowed",
  identity: {
    id: "patient-sunee",
    patientNo: "PT-2026-004872",
    hn: "HN-009241",
    name: "Ms. Naree Srisuk",
    initials: "NS",
    age: 42,
    sex: "Female",
    bloodType: "O+",
    dob: "14 Feb 1984",
    status: "Active Patient",
    attention: "High Attention",
    insuranceStatus: "Insurance Verified",
    maskedPhone: "+66 8* *** 5542",
    maskedEmail: "n****.s@email.com",
  },
  safetyAlert: {
    severity: "critical",
    title: "Critical Alert: Penicillin Allergy - Anaphylaxis",
    explanation: "Strict avoidance is mandatory before prescribing or dispensing medication.",
    verifiedBy: "Verified by Dr. Anan Chaiyasit",
    actionLabel: "View Clinical Safety Detail",
  },
  kpis: [
    { label: "Visits", value: "18", helper: "+2 New", tone: "default" },
    { label: "Conditions", value: "4", tone: "default" },
    { label: "Claims", value: "2", tone: "default" },
    { label: "Readiness", value: "78%", helper: "Needs Review", tone: "primary" },
    { label: "Meds", value: "5", tone: "default" },
    { label: "Docs", value: "24", tone: "default" },
  ],
  snapshot: {
    coverage: { label: "Thai Life Insurance", value: "Tier 1: Global Platinum", status: "Active", tone: "success" },
    pdpa: { label: "PDPA Consent", value: "Active / Verified", status: "Granted", tone: "success" },
    clinicalRisk: 85,
    claimRisk: 45,
    note: "เอกสาร PDPA ครบถ้วน ตรวจสอบสิทธิประกันเรียบร้อยแล้ว",
  },
  clinicalSummary:
    "Patient is a 42-year-old female with Type 2 Diabetes and Hypertension, currently managing Stage 3 CKD. Recent trends show rising HbA1c levels requiring medication adjustment. Strict avoidance of Penicillin is mandatory.",
  aiSummary: {
    confidence: "82%",
    generatedAt: "17 Jul 2026, 10:42",
    reviewStatus: "Pending Review",
    summary:
      "AI suggests prioritizing renal-safe diabetes medication review and evidence completion before claim submission. This is decision support and requires clinician review.",
    evidence: ["Latest HbA1c trend", "CKD Stage 3 diagnosis", "Medication list", "Claim evidence checklist"],
    limitation: "ผลสรุปจาก AI ยังไม่ใช่การวินิจฉัยหรือการอนุมัติเคลม ต้องให้ผู้มีอำนาจตรวจสอบก่อน",
  },
  vitals: [
    { label: "Blood Pressure", value: "138/88", status: "High", tone: "warning" },
    { label: "Heart Rate", value: "72 bpm", status: "Normal", tone: "success" },
    { label: "Resp. Rate", value: "16 /min", status: "Stable", tone: "success" },
    { label: "Temp", value: "36.6 C", status: "Normal", tone: "success" },
    { label: "SpO2", value: "98%", status: "Optimal", tone: "success" },
    { label: "BMI", value: "24.2", status: "Normal", tone: "info" },
  ],
  allergies: [{ cells: ["Penicillin", "Anaphylaxis", "SEVERE", "Verified"], tone: "critical" }],
  medications: [
    { cells: ["Metformin", "500mg BID", "Jan 2021 - Present", "Dr. Anan C.", "Safe"], tone: "success" },
    { cells: ["Amlodipine", "5mg QD", "Jun 2023 - Present", "Dr. Anan C.", "Safe"], tone: "success" },
  ],
  diagnoses: [
    { cells: ["Type 2 Diabetes Mellitus", "E11.9", "12 Jan 2021", "Dr. Somchai P."] },
    { cells: ["Essential Hypertension", "I10", "05 Jun 2023", "Dr. Anan C."] },
    { cells: ["CKD Stage 3", "N18.30", "18 Mar 2025", "Dr. Anan C."] },
  ],
  visits: [
    { id: "visit-9284305", visitNo: "V-9284305", date: "17 Jul 2026", clinic: "Internal Medicine", provider: "Dr. Anan C.", status: "In Consultation", reason: "Diabetes follow-up", readiness: 78, href: "/visits/visit-9284305" },
    { id: "visit-9271102", visitNo: "V-9271102", date: "23 Jun 2026", clinic: "Nephrology", provider: "Dr. Kanya R.", status: "Completed", reason: "CKD monitoring", readiness: 84, href: "/visits/visit-9271102" },
    { id: "visit-9260041", visitNo: "V-9260041", date: "02 Jun 2026", clinic: "Pharmacy", provider: "Pharm. Mali S.", status: "Completed", reason: "Medication review", readiness: 72, href: "/visits/visit-9260041" },
  ],
  insurance: [
    { label: "Payer", value: "Thai Life Insurance", status: "Verified", tone: "success" },
    { label: "Policy", value: "GLP-9282-TH", status: "Active", tone: "success" },
    { label: "Coverage Indicator", value: "Likely Covered", status: "Requires payer review", tone: "warning" },
  ],
  claimReadiness: {
    score: 78,
    status: "Needs Review",
    explanation: "Advisory readiness score only. It is not claim approval.",
    dimensions: [
      { label: "SOAP Completeness", value: "22 / 25", status: "Good", tone: "success" },
      { label: "Diagnosis and ICD", value: "16 / 20", status: "Review CKD evidence", tone: "warning" },
      { label: "Prescription or Procedure", value: "12 / 15", status: "Safe", tone: "success" },
      { label: "Evidence", value: "13 / 20", status: "Missing lab attachment", tone: "warning" },
      { label: "Insurance Rule", value: "8 / 10", status: "Aligned", tone: "success" },
      { label: "Economic", value: "7 / 10", status: "Needs justification", tone: "warning" },
    ],
  },
  missingEvidence: [
    { label: "Latest HbA1c Lab Report", value: "Required for payer rule TH-DM-07", status: "Missing", tone: "warning" },
    { label: "Renal Function Trend", value: "Attach eGFR trend for CKD claim context", status: "Unverified", tone: "warning" },
  ],
  documents: [
    { label: "SOAP Note", value: "Version 4", status: "Human Confirmed", tone: "success" },
    { label: "Prescription", value: "Version 2", status: "Pharmacist Reviewed", tone: "success" },
    { label: "Lab Attachment", value: "Pending upload", status: "Missing Evidence", tone: "warning" },
  ],
  consent: [
    { label: "Treatment Consent", value: "Granted 10 Jan 2026", status: "Active", tone: "success" },
    { label: "Insurance Disclosure", value: "Granted 10 Jan 2026", status: "Active", tone: "success" },
    { label: "AI Assistance Notice", value: "Acknowledged", status: "Active", tone: "success" },
  ],
  timeline: [
    { label: "Critical allergy verified", value: "17 Jul 2026 09:15", status: "Clinical Safety", tone: "critical" },
    { label: "AI patient summary generated", value: "17 Jul 2026 10:42", status: "Pending Review", tone: "info" },
    { label: "Claim readiness recalculated", value: "17 Jul 2026 10:45", status: "Needs Review", tone: "warning" },
  ],
  auditTrail: [
    { label: "Patient record accessed", value: "Clinical Admin | 17 Jul 2026 10:41", status: "Audited", tone: "success" },
    { label: "AI summary generated", value: "Model: clinical-summary-v2 | Rule: CR-2026.07", status: "Audited", tone: "info" },
    { label: "Evidence checklist updated", value: "Claim Reviewer | 17 Jul 2026 10:46", status: "Audited", tone: "success" },
  ],
};

export function getPatientDetail(patientId: string): PatientDetailData | null {
  if (patientId === "missing" || patientId === "patient-not-found") {
    return null;
  }

  if (patientId === "forbidden") {
    return { ...patientDetail, access: "forbidden" };
  }

  if (patientId === "empty") {
    return { ...patientDetail, visits: [], missingEvidence: [], documents: [] };
  }

  return {
    ...patientDetail,
    identity: {
      ...patientDetail.identity,
      id: patientId,
      patientNo: patientId.toUpperCase().startsWith("PT-") ? patientId.toUpperCase() : patientDetail.identity.patientNo,
    },
    visits: patientDetail.visits.map((visit) => ({
      ...visit,
      href: `/visits/${visit.id}`,
    })),
  };
}
