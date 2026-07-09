export const navigationGroups = [
  {
    title: "Clinical Operations",
    items: [
      "Main Dashboard",
      "Patient Management",
      "Visit Management",
      "SOAP Note",
      "Prescription",
    ],
  },
  {
    title: "Insurance Intelligence",
    items: [
      "Claim Readiness",
      "Evidence Package",
      "Payer Rules",
      "Economic Intelligence",
    ],
  },
  {
    title: "AI & Governance",
    items: ["AI Copilot", "Audit & Compliance", "Admin Settings"],
  },
];

export const kpiCards = [
  {
    label: "Today Visits",
    value: "148",
    trend: "+12.4%",
    description: "จำนวนเคสที่เข้ารับบริการวันนี้",
  },
  {
    label: "Claim Ready %",
    value: "82.6%",
    trend: "+4.8%",
    description: "เคสที่พร้อมเข้าสู่กระบวนการเคลม",
  },
  {
    label: "AI Assisted Cases",
    value: "96",
    trend: "64.8%",
    description: "เคสที่ AI ช่วยสรุปและตรวจสอบ",
  },
  {
    label: "Average Readiness Score",
    value: "88.2",
    trend: "Stable",
    description: "คะแนนความพร้อมเฉลี่ยของเอกสาร",
  },
];

export const queueItems = [
  { label: "Ready", value: 64, tone: "bg-emerald-500" },
  { label: "Needs Review", value: 38, tone: "bg-amber-500" },
  { label: "Pending Evidence", value: 29, tone: "bg-sky-500" },
  { label: "Not Ready", value: 17, tone: "bg-rose-500" },
];

export const missingEvidence = [
  { label: "SOAP Note", count: 18 },
  { label: "ICD-10 Support", count: 14 },
  { label: "Prescription", count: 11 },
  { label: "Lab Result", count: 9 },
];

export const caseList = [
  {
    id: "NX-24091",
    patient: "Anonymized Patient A",
    module: "Claim Readiness",
    payer: "AIA",
    score: 94,
    status: "Ready",
  },
  {
    id: "NX-24092",
    patient: "Anonymized Patient B",
    module: "Evidence Package",
    payer: "Allianz",
    score: 76,
    status: "Needs Review",
  },
  {
    id: "NX-24093",
    patient: "Anonymized Patient C",
    module: "Payer Rules",
    payer: "Muang Thai",
    score: 68,
    status: "Pending Evidence",
  },
  {
    id: "NX-24094",
    patient: "Anonymized Patient D",
    module: "Economic Intelligence",
    payer: "AXA",
    score: 59,
    status: "Not Ready",
  },
];

export const activities = [
  "Claim readiness review completed for NX-24091",
  "Evidence Package generated for insurer review",
  "AI Copilot flagged missing ICD-10 support",
  "Audit event recorded for documentation task",
];
