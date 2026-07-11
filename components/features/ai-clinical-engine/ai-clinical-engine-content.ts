import type {
  CaseRow,
  ChecklistItem,
  ContextItem,
  DifferentialDiagnosis,
  IcdSuggestion,
  ImpactCard,
  KpiItem,
  NavItem,
  RecommendationCard,
  SoapSection,
  SystemCard,
  TimelineItem,
  TraceItem,
} from "./ai-clinical-engine-types";

export const navItems: NavItem[] = [
  { icon: "📊", label: "Main Dashboard", description: "ภาพรวมผู้บริหารและปฏิบัติการ" },
  { icon: "👥", label: "Patient Management", description: "Patient directory" },
  { icon: "🩺", label: "Visit Management", description: "Clinical workflow" },
  { icon: "📝", label: "SOAP Note", description: "Clinical documentation" },
  { icon: "💊", label: "Prescription", description: "Medication workflow" },
  { icon: "🤖", label: "AI Clinical Engine", description: "AI decision support", active: true },
  { icon: "✅", label: "Claim Readiness", description: "ความพร้อมส่งเคลม" },
  { icon: "📦", label: "Evidence Package", description: "Claim evidence export" },
  { icon: "📘", label: "Payer Rules", description: "Insurance rule engine" },
  { icon: "💳", label: "Economic Intelligence", description: "Cost signal" },
  { icon: "💬", label: "AI Copilot", description: "Assistant workspace" },
  { icon: "🛡️", label: "Audit & Compliance", description: "PDPA-ready traceability" },
  { icon: "⚙️", label: "Admin Settings", description: "Role & policy" },
];

export const contextItems: ContextItem[] = [
  { label: "Patient Context", value: "HN-004928 · Male · 42Y" },
  { label: "Visit Status", value: "กำลังตรวจ" },
  { label: "PDPA Consent", value: "Verified" },
  { label: "AI Governance", value: "Human Review Required" },
];

export const kpis: KpiItem[] = [
  { icon: "AI", label: "AI Assisted Cases", value: "74", note: "เคสที่ AI ช่วยวิเคราะห์วันนี้" },
  { icon: "%", label: "Average Confidence", value: "91%", note: "AI confidence across reviewed cases" },
  { icon: "ICD", label: "ICD Suggestions", value: "128", note: "แนะนำรหัส ICD-10 พร้อมเหตุผลประกอบ" },
  { icon: "✓", label: "Accepted by Clinician", value: "62", note: "ผ่านการยืนยันโดยแพทย์แล้ว" },
];

export const caseRows: CaseRow[] = [
  {
    visitId: "VIS-2026-1042",
    patient: "Somchai J.",
    aiStatus: { label: "Generated", tone: "ai" },
    confidence: "94%",
    claimImpact: { label: "Ready", tone: "success" },
    action: { label: "Review", variant: "secondary" },
  },
  {
    visitId: "VIS-2026-1041",
    patient: "Malee P.",
    aiStatus: { label: "Reviewed", tone: "warn" },
    confidence: "82%",
    claimImpact: { label: "Needs Review", tone: "warn" },
    action: { label: "View Detail", variant: "secondary" },
  },
  {
    visitId: "VIS-2026-1039",
    patient: "Anan K.",
    aiStatus: { label: "Not Generated", tone: "gray" },
    confidence: "—",
    claimImpact: { label: "Not Ready", tone: "danger" },
    action: { label: "Generate", variant: "primary" },
  },
];

export const recommendationCards: RecommendationCard[] = [
  {
    title: "Clinical Recommendation",
    body: "Consider confirming respiratory findings and documenting lung auscultation result before finalizing ICD-10 and claim evidence.",
    confidence: 88,
  },
  {
    title: "Claim Readiness Signal",
    body: "SOAP and Assessment are mostly complete. Missing evidence risk remains for doctor signature and attachment verification.",
  },
];

export const soapSections: SoapSection[] = [
  { title: "Subjective", body: "ไข้ ไอ เจ็บคอ 2 วัน ไม่มีหอบเหนื่อย รับประทานอาหารได้น้อยลง" },
  { title: "Objective", body: "T 38.2°C, BP 122/78, HR 92, SpO2 98%. Throat erythema, no wheezing." },
  { title: "Assessment", body: "Acute upper respiratory infection, rule out influenza-like illness." },
  { title: "Plan", body: "Symptomatic treatment, hydration, return if dyspnea or persistent fever." },
];

export const icdSuggestions: IcdSuggestion[] = [
  {
    code: "J06.9",
    description: "Acute upper respiratory infection, unspecified",
    support: "Supported by fever, cough, sore throat, stable SpO2 and clinical assessment.",
    status: { label: "Primary", tone: "success" },
  },
  {
    code: "R50.9",
    description: "Fever, unspecified",
    support: "Can be considered if final diagnosis remains symptom-based.",
    status: { label: "Secondary", tone: "warn" },
  },
];

export const differentialDiagnoses: DifferentialDiagnosis[] = [
  { label: "Viral URI", note: "Most consistent with current SOAP evidence.", score: "91%" },
  { label: "Influenza-like illness", note: "Consider if exposure history or myalgia is present.", score: "68%" },
  { label: "Acute pharyngitis", note: "Needs additional throat assessment or test result.", score: "61%" },
];

export const missingEvidenceChecklist: ChecklistItem[] = [
  { label: "✅ SOAP Note", status: { label: "Passed", tone: "success" } },
  { label: "✅ ICD-10", status: { label: "Passed", tone: "success" } },
  { label: "⚠ Doctor Signature", status: { label: "Needs Review", tone: "warn" } },
  { label: "✅ PDPA Consent", status: { label: "Verified", tone: "success" } },
];

export const traceItems: TraceItem[] = [
  {
    title: "SOAP Evidence · Subjective",
    body: "Fever, cough and sore throat for 2 days support acute respiratory condition.",
  },
  {
    title: "SOAP Evidence · Objective",
    body: "Normal SpO2 and no wheezing reduce current concern for severe lower respiratory disease.",
  },
  {
    title: "Clinical Reasoning",
    body: "AI ranks Viral URI highest because symptoms and physical findings are consistent with uncomplicated URI.",
  },
  {
    title: "Confidence Basis",
    body: "High confidence due to sufficient SOAP completeness, stable vital signs and clear assessment.",
  },
];

export const timelineItems: TimelineItem[] = [
  {
    title: "AI Summary Generated",
    detail: "10:22 · Dr. Benz · Prompt Context v1.3",
    status: { label: "Generated", tone: "ai" },
  },
  {
    title: "ICD Suggestion Reviewed",
    detail: "10:27 · Clinician review required",
    status: { label: "Reviewed", tone: "warn" },
  },
  {
    title: "Recommendation Accepted",
    detail: "10:31 · Accepted with clinical confirmation",
    status: { label: "Accepted", tone: "success" },
  },
];

export const systemCards: SystemCard[] = [
  {
    title: "Language Strategy",
    description: "English-first product naming with Thai support for operational guidance.",
    body: "Main navigation, modules, KPIs and enterprise terminology use English. Thai is used for user guidance, warning messages, validation and workflow explanation.",
  },
  {
    title: "Enterprise Tone Guideline",
    description: "Modern, clear, audit-ready and healthcare-compliant.",
    body: "Use concise wording, avoid casual phrases, and always make AI governance visible. Clinical recommendations should be cautious and explainable.",
  },
];

export const impactCards: ImpactCard[] = [
  {
    title: "Loss Ratio Impact",
    body: "Reduce claim leakage by improving SOAP, ICD and evidence consistency before submission.",
  },
  {
    title: "Operation Efficiency",
    body: "ลดเวลาสรุป SOAP, ค้นหา ICD และตรวจหลักฐานซ้ำในงานประจำวัน",
  },
  {
    title: "Customer Journey",
    body: "Patients receive complete documentation faster, reducing claim delays and document rework.",
  },
];
