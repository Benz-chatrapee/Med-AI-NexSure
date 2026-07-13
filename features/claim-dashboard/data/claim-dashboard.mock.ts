import type {
  ClaimDashboardFilters,
  ClaimRiskLevel,
  ClaimWorklistItem,
  StatusConfig,
} from "../types/claim-dashboard.types";

export const defaultClaimDashboardFilters: ClaimDashboardFilters = {
  organization: "Med AI Health Network",
  clinic: "",
  dateRange: "Last 30 Days",
  payer: "",
  claimType: "",
  reviewer: "",
  readiness: "",
  risk: "",
  sla: "",
};

export const claimWorklistMock: ClaimWorklistItem[] = [
  { id: "CLM-2026-01082", visitId: "VIS-88431", patientName: "Somchai P.", maskedHn: "HN-******38", clinic: "Bangkok Clinic", payer: "AIA", claimType: "OPD", icd10: "J06.9", readinessScore: 94, readiness: "READY", missingEvidenceCount: 0, missingEvidence: [], risk: "LOW", riskCategory: "Coding", claimAmount: 5400, assignee: "Arisa K.", slaLabel: "4h 18m", slaStatus: "normal", status: "READY_TO_SUBMIT" },
  { id: "CLM-2026-01079", visitId: "VIS-88419", patientName: "Napat S.", maskedHn: "HN-******42", clinic: "Sukhumvit Clinic", payer: "Muang Thai Life", claimType: "OPD", icd10: "R51", readinessScore: 72, readiness: "NEEDS_REVIEW", missingEvidenceCount: 2, missingEvidence: ["SOAP incomplete", "ICD-10 missing"], risk: "HIGH", riskCategory: "Evidence", claimAmount: 8900, assignee: "Narin P.", slaLabel: "1h 05m", slaStatus: "warning", status: "IN_REVIEW" },
  { id: "CLM-2026-01074", visitId: "VIS-88397", patientName: "Kanya R.", maskedHn: "HN-******15", clinic: "Bangkok Clinic", payer: "Allianz Ayudhya", claimType: "IPD", readinessScore: 58, readiness: "NOT_READY", missingEvidenceCount: 3, missingEvidence: ["Medical Certificate missing", "Lab Result missing"], risk: "CRITICAL", riskCategory: "Clinical", claimAmount: 48200, assignee: null, slaLabel: "3h overdue", slaStatus: "overdue", status: "PENDING_EVIDENCE" },
  { id: "CLM-2026-01068", visitId: "VIS-88364", patientName: "Thanawat K.", maskedHn: "HN-******77", clinic: "Chiang Mai Clinic", payer: "FWD", claimType: "Accident", icd10: "S93.4", readinessScore: 87, readiness: "READY", missingEvidenceCount: 0, missingEvidence: [], risk: "MEDIUM", riskCategory: "Cost", claimAmount: 12300, assignee: "Arisa K.", slaLabel: "8h 42m", slaStatus: "normal", status: "READY_FOR_REVIEW" },
  { id: "CLM-2026-01061", visitId: "VIS-88333", patientName: "Ploy T.", maskedHn: "HN-******09", clinic: "Sukhumvit Clinic", payer: "AIA", claimType: "OPD", icd10: "K29.7", readinessScore: 65, readiness: "NEEDS_REVIEW", missingEvidenceCount: 1, missingEvidence: ["Prescription incomplete"], risk: "CRITICAL", riskCategory: "Clinical", claimAmount: 7200, assignee: "Narin P.", slaLabel: "42m", slaStatus: "warning", status: "IN_REVIEW" },
  { id: "CLM-2026-01055", visitId: "VIS-88302", patientName: "Anon C.", maskedHn: "HN-******63", clinic: "Bangkok Clinic", payer: "Muang Thai Life", claimType: "OPD", icd10: "J20.9", readinessScore: 91, readiness: "READY", missingEvidenceCount: 0, missingEvidence: [], risk: "LOW", riskCategory: "Coverage", claimAmount: 4100, assignee: "Arisa K.", slaLabel: "Submitted", slaStatus: "normal", status: "SUBMITTED" },
  { id: "CLM-2026-01044", visitId: "VIS-88254", patientName: "Supaporn M.", maskedHn: "HN-******91", clinic: "Chiang Mai Clinic", payer: "Allianz Ayudhya", claimType: "IPD", readinessScore: 68, readiness: "NEEDS_REVIEW", missingEvidenceCount: 1, missingEvidence: ["Consent missing"], risk: "HIGH", riskCategory: "Coverage", claimAmount: 67500, assignee: null, slaLabel: "6h overdue", slaStatus: "overdue", status: "RETURNED" },
  { id: "CLM-2026-01031", visitId: "VIS-88198", patientName: "Wichai B.", maskedHn: "HN-******20", clinic: "Sukhumvit Clinic", payer: "FWD", claimType: "OPD", icd10: "M54.5", readinessScore: 84, readiness: "NEEDS_REVIEW", missingEvidenceCount: 1, missingEvidence: ["Cost justification missing"], risk: "HIGH", riskCategory: "Cost", claimAmount: 15600, assignee: "Narin P.", slaLabel: "2h 14m", slaStatus: "warning", status: "READY_FOR_REVIEW" },
];

export const readinessStatusConfig = {
  READY: { label: "Ready", thaiLabel: "พร้อมส่งเคลม", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  NEEDS_REVIEW: { label: "Needs Review", thaiLabel: "ต้องตรวจสอบ", className: "border-amber-200 bg-amber-50 text-amber-700" },
  NOT_READY: { label: "Not Ready", thaiLabel: "ยังไม่พร้อม", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<ClaimWorklistItem["readiness"], StatusConfig>;

export const riskStatusConfig = {
  LOW: { label: "Low", thaiLabel: "ต่ำ", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  MEDIUM: { label: "Medium", thaiLabel: "ปานกลาง", className: "border-amber-200 bg-amber-50 text-amber-700" },
  HIGH: { label: "High", thaiLabel: "สูง", className: "border-orange-200 bg-orange-50 text-orange-700" },
  CRITICAL: { label: "Critical", thaiLabel: "วิกฤต", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<ClaimRiskLevel, StatusConfig>;

export const slaStatusConfig = {
  normal: { label: "Within SLA", thaiLabel: "อยู่ใน SLA", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  warning: { label: "Near Breach", thaiLabel: "ใกล้เกินกำหนด", className: "border-amber-200 bg-amber-50 text-amber-700" },
  overdue: { label: "Overdue", thaiLabel: "เกินกำหนด", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<ClaimWorklistItem["slaStatus"], StatusConfig>;

export const workflowStatusConfig = {
  READY_TO_SUBMIT: { label: "Ready to Submit", thaiLabel: "พร้อมส่ง", className: "border-blue-200 bg-blue-50 text-blue-700" },
  IN_REVIEW: { label: "In Review", thaiLabel: "กำลังตรวจสอบ", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  PENDING_EVIDENCE: { label: "Pending Evidence", thaiLabel: "รอเอกสาร", className: "border-amber-200 bg-amber-50 text-amber-700" },
  READY_FOR_REVIEW: { label: "Ready for Review", thaiLabel: "พร้อมตรวจ", className: "border-sky-200 bg-sky-50 text-sky-700" },
  SUBMITTED: { label: "Submitted", thaiLabel: "ส่งแล้ว", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  RETURNED: { label: "Returned", thaiLabel: "ถูกส่งกลับ", className: "border-orange-200 bg-orange-50 text-orange-700" },
} satisfies Record<ClaimWorklistItem["status"], StatusConfig>;
