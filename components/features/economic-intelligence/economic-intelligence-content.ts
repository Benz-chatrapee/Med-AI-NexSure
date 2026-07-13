import type {
  CaseSignal,
  IntelligenceModule,
  KpiCard,
  NavItem,
  PriorityItem,
  TimelineItem,
} from "@/types/economic-intelligence";

export const navItems: NavItem[] = [
  { label: "Main Dashboard", active: true },
  { label: "Patient Management" },
  { label: "Visit Management" },
  { label: "SOAP Note" },
  { label: "Claim Readiness" },
  { label: "Evidence Package" },
  { label: "Economic Intelligence" },
  { label: "AI Decision Support" },
  { label: "Audit & Compliance" },
  { label: "Executive Dashboard" },
];

export const badges = [
  { label: "AI Decision Support", ai: true },
  { label: "Clinical Workflow" },
  { label: "Claim Readiness" },
  { label: "Evidence Package" },
  { label: "Economic Intelligence" },
  { label: "Audit & Compliance" },
];

export const kpis: KpiCard[] = [
  {
    label: "Today Visits",
    value: "128",
    note: "ภาพรวมปริมาณงานคลินิกวันนี้",
  },
  {
    label: "Claim Ready %",
    value: "82%",
    note: "เคสที่พร้อมส่งเคลมประกัน",
  },
  {
    label: "AI Assisted Cases",
    value: "94",
    note: "AI ช่วยวิเคราะห์ clinical, claim และ cost signals",
    ai: true,
  },
  {
    label: "Average Readiness Score",
    value: "91",
    note: "คะแนนความพร้อมด้านเอกสารและ compliance",
  },
];

export const modules: IntelligenceModule[] = [
  {
    title: "Clinical Workflow",
    description: "จัดการกระบวนการตรวจรักษาอย่างเป็นระบบ",
  },
  {
    title: "Claim Readiness",
    description: "ตรวจสอบความพร้อมก่อนส่งเคลม",
  },
  {
    title: "Evidence Package",
    description: "รวมหลักฐานทางการแพทย์สำหรับบริษัทประกัน",
  },
  {
    title: "Economic Intelligence",
    description: "วิเคราะห์ต้นทุนและค่าใช้จ่ายผิดปกติ",
  },
  {
    title: "AI Decision Support",
    description: "AI ช่วยสรุป insight และ recommendation",
  },
  {
    title: "Audit & Compliance",
    description: "รองรับ PDPA และ audit trail",
  },
  {
    title: "Insurance Review",
    description: "ช่วยทีมตรวจเคลมเห็น risk signal ได้เร็ว",
  },
  {
    title: "Executive Dashboard",
    description: "ภาพรวม performance สำหรับผู้บริหาร",
  },
];

export const priorities: PriorityItem[] = [
  {
    title: "1. Clinical Safety First",
    description:
      "แจ้งเตือนความเสี่ยงทางการแพทย์ เช่น allergy, critical condition หรือ missing clinical evidence ก่อนข้อมูลด้านเคลมและต้นทุนเสมอ",
    tone: "clinical",
  },
  {
    title: "2. Insurance Intelligence Second",
    description:
      "ประเมิน claim readiness, missing evidence, ICD support และ payer rule เพื่อช่วยลดการถูกขอข้อมูลซ้ำ",
    tone: "insurance",
  },
  {
    title: "3. Financial Intelligence Third",
    description:
      "วิเคราะห์ average visit cost, expected cost range, benchmark และ cost outlier เพื่อควบคุม claim leakage",
    tone: "financial",
  },
];

export const caseSignals: CaseSignal[] = [
  {
    patient: "P****** 2841",
    note: "Masked HN · PDPA Ready",
    visit: "OPD-2026-0712",
    clinicalStatus: "Clinical Review",
    clinicalTone: "alert",
    claimReadiness: "Needs Review",
    claimTone: "review",
    economicSignal: "Cost Alert",
    economicTone: "alert",
  },
  {
    patient: "S****** 1932",
    note: "Masked HN · PDPA Ready",
    visit: "OPD-2026-0713",
    clinicalStatus: "Completed",
    clinicalTone: "ready",
    claimReadiness: "Ready",
    claimTone: "ready",
    economicSignal: "Normal",
    economicTone: "ready",
  },
  {
    patient: "K****** 5520",
    note: "Masked HN · PDPA Ready",
    visit: "OPD-2026-0714",
    clinicalStatus: "Stable",
    clinicalTone: "ready",
    claimReadiness: "Pending Evidence",
    claimTone: "review",
    economicSignal: "Low Outlier",
    economicTone: "review",
  },
];

export const recommendations: TimelineItem[] = [
  {
    title: "Review Clinical Evidence",
    description: "กรุณาตรวจสอบ SOAP Note และ treatment justification ก่อนส่งเคลม",
  },
  {
    title: "Validate ICD-10 Support",
    description: "AI พบว่า diagnosis support อาจยังไม่เพียงพอต่อ claim review",
  },
  {
    title: "Check Expected Cost Range",
    description: "ค่าใช้จ่ายสูงกว่าช่วงที่คาดการณ์ ควรแนบคำอธิบายเพิ่มเติม",
  },
];

export const auditTrail: TimelineItem[] = [
  {
    title: "Claim Reviewer opened Visit Detail",
    description: "Access logged · Patient data masked · Role permission verified",
  },
  {
    title: "AI generated Claim Readiness recommendation",
    description: "Recommendation recorded for audit trail and human review",
  },
  {
    title: "Admin viewed Executive Dashboard",
    description: "Financial insight access logged · No unnecessary PHI displayed",
  },
];
