import type { CaseRow, ChecklistItem, Kpi, NavSection, SoapSection, TimelineItem } from "@/types/soap-note";

export const navSections: NavSection[] = [
  {
    title: "Command Center",
    items: ["Executive Dashboard", "Queue Snapshot", "Case List"],
  },
  {
    title: "Clinical Operations",
    items: ["Patient List", "Visit Detail", "Enterprise SOAP Note", "Prescription"],
  },
  {
    title: "Insurance Intelligence",
    items: ["Claim Readiness", "Evidence Package", "Coverage Review"],
  },
  {
    title: "Governance",
    items: ["Audit & Compliance", "Access History", "PDPA Control"],
  },
];

export const kpis: Kpi[] = [
  { label: "Today Visits", value: "128", note: "+12% from yesterday" },
  { label: "Claim Ready", value: "74%", note: "32 cases need review" },
  { label: "AI Assisted Cases", value: "91", note: "Decision support only" },
  { label: "Average Readiness Score", value: "86%", note: "Insurance evidence quality" },
];

export const cases: CaseRow[] = [
  {
    visit: "VST-00045",
    patient: "สมชาย ใจดี",
    clinical: "SOAP In Progress",
    claim: "⚠ Needs Review",
    claimTone: "review",
    risk: "Critical Allergy",
    riskTone: "risk",
  },
  {
    visit: "VST-00046",
    patient: "กมลวรรณ สีดี",
    clinical: "Completed",
    claim: "✓ Ready",
    claimTone: "ready",
    risk: "Low",
    riskTone: "ready",
  },
  {
    visit: "VST-00047",
    patient: "ธนพล เมฆา",
    clinical: "Pending ICD",
    claim: "⚠ Missing ICD",
    claimTone: "review",
    risk: "Medium",
    riskTone: "review",
  },
];

export const readinessChecklist: ChecklistItem[] = [
  { label: "✓ SOAP Note", value: "Completed" },
  { label: "⚠ ICD Code", value: "Required" },
  { label: "⚠ Medical Certificate", value: "Required" },
];

export const economicItems: ChecklistItem[] = [
  { label: "Average Visit Cost", value: "฿1,420" },
  { label: "Expected Cost Range", value: "฿1,200–1,600" },
  { label: "Outlier Detection", value: "No outlier" },
];

export const timeline: TimelineItem[] = [
  { time: "10:45", description: "SOAP edited by Dr. Ananda · Audit logged" },
  { time: "10:41", description: "AI summary generated · Human review required" },
  { time: "10:30", description: "Vital signs added by Nurse Mali" },
  { time: "10:20", description: "PDPA consent verified" },
];

export const patientItems: ChecklistItem[] = [
  { label: "HN", value: "HN-000123" },
  { label: "PDPA", value: "✓ Active" },
  { label: "Allergy", value: "Penicillin" },
  { label: "Insurance", value: "Gold Care" },
];

export const evidenceItems: ChecklistItem[] = [
  { label: "SOAP Note", value: "Ready" },
  { label: "ICD Code", value: "Missing" },
  { label: "Prescription", value: "Ready" },
  { label: "Medical Certificate", value: "Missing" },
  { label: "Attachments", value: "2 files" },
];

export const soapSections: SoapSection[] = [
  {
    title: "Subjective · Completion 100%",
    fields: [
      { label: "Chief Complaint", value: "ไข้ ไอ เจ็บคอ 2 วัน" },
      { label: "History of Present Illness", value: "ผู้ป่วยมีไข้ต่ำ ไอแห้ง เจ็บคอ ไม่มีหอบเหนื่อย", multiline: true },
    ],
  },
  {
    title: "Objective · Completion 80%",
    fields: [
      { label: "Vital Signs", value: "BP 130/80, HR 88, Temp 37.8, SpO₂ 98%" },
      { label: "Physical Exam", value: "Throat mildly injected, lungs clear", multiline: true },
    ],
  },
  {
    title: "Assessment · Completion 60%",
    fields: [{ label: "Clinical Impression", value: "Acute upper respiratory infection", multiline: true }],
    alert: { tone: "ai", text: "✦ AI ICD Suggestion: J06.9 · Confidence 93% · Requires physician approval." },
  },
  {
    title: "Plan · Completion 70%",
    fields: [{ label: "Medication Plan", value: "Paracetamol, Antihistamine, cough syrup", multiline: true }],
    alert: { tone: "risk", text: "⚠ Safety Check: Avoid Penicillin-class antibiotics." },
  },
];
