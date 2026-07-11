import type {
  Alert,
  Badge,
  CaseRow,
  ChecklistItem,
  Kpi,
  NavGroup,
  PatientInfo,
  SoapSection,
  TimelineItem,
} from "./visit-management-types";

export const navGroups: NavGroup[] = [
  {
    title: "Command Center",
    items: [
      { label: "Executive Dashboard", active: true },
      { label: "Queue Snapshot" },
      { label: "Case List" },
    ],
  },
  {
    title: "Clinical Operations",
    items: [
      { label: "Patient List" },
      { label: "Visit Detail" },
      { label: "Enterprise SOAP Note" },
      { label: "Prescription" },
    ],
  },
  {
    title: "Insurance Intelligence",
    items: [
      { label: "Claim Readiness" },
      { label: "Evidence Package" },
      { label: "Coverage Review" },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Audit & Compliance" },
      { label: "Access History" },
      { label: "PDPA Control" },
    ],
  },
];

export const topBadges: Badge[] = [
  { label: "✦ AI Decision Support", tone: "ai" },
  { label: "✓ PDPA Ready", tone: "ready" },
  { label: "Role: Doctor", tone: "review" },
];

export const kpis: Kpi[] = [
  { label: "Today Visits", value: "128", note: "+12% from yesterday" },
  { label: "Claim Ready", value: "74%", note: "32 cases need review" },
  { label: "AI Assisted Cases", value: "91", note: "Decision support only" },
  {
    label: "Average Readiness Score",
    value: "86%",
    note: "Insurance evidence quality",
  },
];

export const caseRows: CaseRow[] = [
  {
    visit: "VST-00045",
    patient: "สมชาย ใจดี",
    clinical: "SOAP In Progress",
    claim: { label: "⚠ Needs Review", tone: "review" },
    risk: { label: "Critical Allergy", tone: "risk" },
  },
  {
    visit: "VST-00046",
    patient: "กมลวรรณ สีดี",
    clinical: "Completed",
    claim: { label: "✓ Ready", tone: "ready" },
    risk: { label: "Low", tone: "ready" },
  },
  {
    visit: "VST-00047",
    patient: "ธนพล เมฆา",
    clinical: "Pending ICD",
    claim: { label: "⚠ Missing ICD", tone: "review" },
    risk: { label: "Medium", tone: "review" },
  },
];

export const readinessChecklist: ChecklistItem[] = [
  { label: "✓ SOAP Note", value: "Completed" },
  { label: "⚠ ICD Code", value: "Required" },
  { label: "⚠ Medical Certificate", value: "Required" },
];

export const aiAlerts: Alert[] = [
  {
    title: "✦ AI Clinical Summary",
    body: "Patient symptoms suggest Acute URI. ICD-10 J06.9 recommended with 93% confidence.",
    tone: "ai",
  },
  {
    title: "Human Review Status",
    body: "Awaiting physician confirmation before final diagnosis and claim use.",
    tone: "ai",
  },
];

export const economicAlert: Alert = {
  title: "Cost Benchmark",
  body: "Expected visit cost ฿1,420 vs clinic benchmark ฿1,350. Variance +5%.",
  tone: "econ",
};

export const economicItems: ChecklistItem[] = [
  { label: "Average Visit Cost", value: "฿1,420" },
  { label: "Expected Cost Range", value: "฿1,200–1,600" },
  { label: "Outlier Detection", value: "No outlier" },
];

export const timelineItems: TimelineItem[] = [
  { time: "10:45", event: "SOAP edited by Dr. Ananda · Audit logged" },
  { time: "10:41", event: "AI summary generated · Human review required" },
  { time: "10:30", event: "Vital signs added by Nurse Mali" },
  { time: "10:20", event: "PDPA consent verified" },
];

export const patientInfo: PatientInfo[] = [
  { label: "HN", value: "HN-000123" },
  { label: "PDPA", value: "✓ Active" },
  { label: "Allergy", value: "Penicillin" },
  { label: "Insurance", value: "Gold Care" },
];

export const safetyAlert: Alert = {
  title: "⚠ Critical Safety Alert",
  body: "Penicillin allergy detected. Medication review required.",
  tone: "risk",
};

export const soapSections: SoapSection[] = [
  {
    title: "Subjective · Completion 100%",
    fields: [
      { kind: "input", label: "Chief Complaint", value: "ไข้ ไอ เจ็บคอ 2 วัน" },
      {
        kind: "textarea",
        label: "History of Present Illness",
        value: "ผู้ป่วยมีไข้ต่ำ ไอแห้ง เจ็บคอ ไม่มีหอบเหนื่อย",
      },
    ],
  },
  {
    title: "Objective · Completion 80%",
    fields: [
      {
        kind: "input",
        label: "Vital Signs",
        value: "BP 130/80, HR 88, Temp 37.8, SpO₂ 98%",
      },
      {
        kind: "textarea",
        label: "Physical Exam",
        value: "Throat mildly injected, lungs clear",
      },
    ],
  },
  {
    title: "Assessment · Completion 60%",
    fields: [
      {
        kind: "textarea",
        label: "Clinical Impression",
        value: "Acute upper respiratory infection",
      },
    ],
    alert: {
      body: "✦ AI ICD Suggestion: J06.9 · Confidence 93% · Requires physician approval.",
      tone: "ai",
    },
  },
  {
    title: "Plan · Completion 70%",
    fields: [
      {
        kind: "textarea",
        label: "Medication Plan",
        value: "Paracetamol, Antihistamine, cough syrup",
      },
    ],
    alert: {
      body: "⚠ Safety Check: Avoid Penicillin-class antibiotics.",
      tone: "risk",
    },
  },
];

export const evidencePackage: ChecklistItem[] = [
  { label: "SOAP Note", value: "Ready" },
  { label: "ICD Code", value: "Missing" },
  { label: "Prescription", value: "Ready" },
  { label: "Medical Certificate", value: "Missing" },
  { label: "Attachments", value: "2 files" },
];
