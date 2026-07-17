import type { VisitDetail } from "../types/visit-detail.types";
import { calculateWeightedReadiness } from "../utils/claim-readiness";

const readinessBreakdown = [
  { label: "SOAP Completeness", weight: 25, score: 88, explanation: "SOAP note is present with clear assessment and plan." },
  { label: "Diagnosis and ICD", weight: 20, score: 86, explanation: "Primary ICD-10 code is present and clinically aligned." },
  { label: "Prescription / Procedure", weight: 15, score: 70, explanation: "Medication list includes one critical allergy conflict requiring review." },
  { label: "Evidence Completeness", weight: 20, score: 60, explanation: "Medical certificate and lab order confirmation are still missing." },
  { label: "Insurance Rule Alignment", weight: 10, score: 78, explanation: "Allianz outpatient rules mostly align but require certificate evidence." },
  { label: "Economic Reasonableness", weight: 10, score: 84, explanation: "Estimated cost is below payer benchmark for comparable visits." },
];

const baseVisit: VisitDetail = {
  patient: {
    name: "Emily Thorne",
    initials: "ET",
    age: 32,
    sex: "Female",
    hn: "HN-2024-0815",
    visitId: "VIS-2026-0717-050",
    visitDate: "17 Jul 2026, 10:45",
    clinic: "Gastroenterology OPD",
    physician: "Dr. Sarah Jenkins",
    allergy: "Penicillin",
    insurancePolicy: "Allianz Elite OPD",
    coverageStatus: "Likely Covered",
    pdpaConsent: "Active Consent",
  },
  status: "In Consultation",
  claimScore: calculateWeightedReadiness(readinessBreakdown),
  clinicalRisk: "Moderate",
  vitals: [
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "Normal", severity: "safe" },
    { label: "Heart Rate", value: "72", unit: "bpm", status: "Stable", severity: "safe" },
    { label: "Temperature", value: "37.2", unit: "C", status: "Slightly Elevated", severity: "warning" },
    { label: "SpO2", value: "98", unit: "%", status: "Optimal", severity: "safe" },
  ],
  soap: {
    subjective: "Patient reports persistent epigastric pain for 3 days, burning sensation, worse after spicy meals. No nausea or vomiting.",
    objective: "Mild epigastric tenderness. Bowel sounds normal. No rebound tenderness or guarding. BMI 24.5.",
    assessment: "Acute gastritis is likely based on pain location and meal-related symptoms.",
    plan: "Prescribe PPI and antacid, avoid spicy food, follow up in 1 week if symptoms persist.",
  },
  diagnoses: [
    { code: "K29.7", label: "Gastritis, unspecified", confidence: 92, status: "AI Suggested" },
    { code: "R10.13", label: "Epigastric pain", confidence: 84, status: "Human Confirmed" },
  ],
  medications: [
    { name: "Omeprazole 20mg", dosage: "1 Cap", frequency: "O.M. (AC)", safetyStatus: "Safe", explanation: "No allergy or duplicate therapy detected." },
    { name: "Almagate 1.5g/15ml", dosage: "1 Sachet", frequency: "T.I.D. (PC)", safetyStatus: "Safe", explanation: "Within standard symptomatic treatment range." },
    { name: "Amoxicillin 500mg", dosage: "1 Cap", frequency: "B.I.D. (PC)", safetyStatus: "Critical Warning", explanation: "Conflicts with severe Penicillin allergy. Requires removal or override reason." },
  ],
  procedures: [
    { label: "Dietary counseling", status: "Completed", note: "Avoid spicy food and late meals." },
    { label: "Lab order confirmation", status: "Pending Signature", note: "Doctor signature required before evidence package." },
  ],
  documents: [
    { id: "doc-lab", title: "Blood Test Results", status: "Verified", meta: "Uploaded 2h ago" },
    { id: "doc-consent", title: "Initial Consent Form", status: "Verified", meta: "Verified by Clinic Staff" },
    { id: "doc-medcert", title: "Medical Certificate", status: "Missing", meta: "Required for workplace claim" },
  ],
  readinessBreakdown,
  missingEvidence: [
    { id: "med-cert", title: "Medical Certificate Missing", explanation: "Required by Allianz workplace claim rules.", priority: "Critical" },
    { id: "lab-sign", title: "Lab Order Confirmation", explanation: "Pending doctor signature before claim package.", priority: "Required" },
  ],
  insuranceRules: [
    "Requires ICD-10 at the 4th digit for outpatient coverage.",
    "Gastritis medication reimbursement is capped at 1,500 THB per visit.",
    "Claim Readiness is not payer approval and must be reviewed by an authorized human.",
  ],
  economicSignals: [
    { label: "Estimated Visit Cost", status: "THB 1,240", note: "12% below benchmark for comparable outpatient gastritis visits." },
    { label: "Cost Variance", status: "-12% vs Bench", note: "Within expected range; no economic outlier detected." },
  ],
  insights: [
    { title: "AI SOAP Summary", text: "Symptoms and vitals support likely gastritis. Human review is required before accepting diagnosis or treatment.", tone: "ai" },
    { title: "Medication Safety", text: "Amoxicillin conflicts with Penicillin allergy and should not proceed without authorized override reason.", tone: "warning" },
    { title: "Claim Improvement", text: "Adding the medical certificate may increase readiness from 78 to approximately 86.", tone: "success" },
  ],
  activity: [
    { id: "act-start", title: "Consultation Started", actor: "Dr. Sarah Jenkins", time: "10:45 AM", detail: "Visit moved into consultation with patient context opened.", icon: "activity" },
    { id: "act-ai", title: "AI SOAP Draft Generated", actor: "AI Clinical Engine", time: "10:52 AM", detail: "AI-generated summary created for physician review.", icon: "ai" },
    { id: "act-alert", title: "Allergy Alert Triggered", actor: "Medication Safety Service", time: "11:01 AM", detail: "Critical Penicillin allergy conflict detected in prescription list.", icon: "alert" },
    { id: "act-claim", title: "Claim Readiness Evaluated", actor: "Claim Intelligence", time: "11:04 AM", detail: "Readiness score calculated using configured weighted dimensions.", icon: "claim" },
    { id: "act-doc", title: "Evidence Checklist Updated", actor: "Clinic Staff", time: "11:08 AM", detail: "Medical certificate marked as required evidence.", icon: "document" },
  ],
};

export function getVisitDetailMock(visitId: string): VisitDetail {
  if (visitId.toLowerCase().includes("locked")) {
    return { ...baseVisit, status: "Locked", lockedReason: "Completed records require reopen reason before editing." };
  }
  if (visitId.toLowerCase().includes("denied")) {
    return { ...baseVisit, permissionDenied: true };
  }
  return { ...baseVisit, patient: { ...baseVisit.patient, visitId } };
}
