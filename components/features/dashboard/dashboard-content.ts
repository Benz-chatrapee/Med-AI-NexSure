export const navigationGroups = [
  {
    title: "Enterprise Modules",
    items: [
      { label: "Main Dashboard", marker: "▦" },
      { label: "Patient Management", marker: "👥" },
      { label: "Executive Dashboard", marker: "🏥", active: true, badge: "Active" },
      { label: "SOAP Note", marker: "📝" },
      { label: "Prescription", marker: "💊" },
      { label: "Claim Readiness", marker: "✓" },
      { label: "Evidence Package", marker: "📦" },
      { label: "Payer Rules", marker: "⚖" },
      { label: "Economic Intelligence", marker: "📊" },
      { label: "AI Copilot", marker: "✦" },
      { label: "Audit & Compliance", marker: "🛡" },
      { label: "Admin Settings", marker: "⚙" },
    ],
  },
];

export const kpiCards = [
  {
    label: "Enterprise Readiness",
    icon: "🏥",
    value: "91.4%",
    note: "ความพร้อมองค์กรโดยรวม · +3.8%",
  },
  {
    label: "Net Claim Value",
    icon: "✓",
    value: "฿42.8M",
    note: "Projected value passing evidence gates",
  },
  {
    label: "AI Assisted Reviews",
    icon: "✦",
    value: "742",
    note: "AI decision support with human review",
  },
  {
    label: "Governance Score",
    icon: "📈",
    value: "96.1",
    note: "Explainability, audit, and policy alignment",
  },
];

export const queueSnapshot = [
  {
    label: "Ready",
    tone: "default",
    value: 184,
    description: "Claim and evidence packages ready for executive reporting",
  },
  {
    label: "In Review",
    tone: "blue",
    value: 72,
    description: "Clinical, insurance, and compliance teams reviewing cases",
  },
  {
    label: "Evidence Gap",
    tone: "purple",
    value: 31,
    description: "Missing documents or incomplete policy requirements",
  },
  {
    label: "Closed",
    tone: "green",
    value: 428,
    description: "Completed workflows with audit records captured",
  },
];

export const readinessTrend = [
  { month: "Jan", readiness: 82, audit: 91, claims: 28 },
  { month: "Feb", readiness: 84, audit: 92, claims: 30 },
  { month: "Mar", readiness: 87, audit: 94, claims: 34 },
  { month: "Apr", readiness: 86, audit: 95, claims: 33 },
  { month: "May", readiness: 89, audit: 95, claims: 37 },
  { month: "Jun", readiness: 91, audit: 96, claims: 41 },
  { month: "Jul", readiness: 91.4, audit: 96.1, claims: 42.8 },
];

export const readinessMix = [
  { name: "Claim Ready", value: 56, fill: "#2563EB" },
  { name: "Needs Review", value: 24, fill: "#D97706" },
  { name: "Evidence Gap", value: 14, fill: "#7C3AED" },
  { name: "Escalated", value: 6, fill: "#DC2626" },
];

export const portfolioRows = [
  {
    id: "EXD-24091",
    domain: "Clinical Documentation",
    owner: "Clinical Governance",
    status: "On Track",
    readiness: "94%",
    aiScore: "96%",
    updated: "09:45",
  },
  {
    id: "EXD-24092",
    domain: "Claim Readiness",
    owner: "Insurance Intelligence",
    status: "Needs Review",
    readiness: "89%",
    aiScore: "84%",
    updated: "09:38",
  },
  {
    id: "EXD-24093",
    domain: "Evidence Package",
    owner: "Operations",
    status: "Action Required",
    readiness: "76%",
    aiScore: "67%",
    updated: "09:31",
  },
];

export const aiSignals = [
  { label: "Clinical Safety", value: "Normal" },
  { label: "SOAP Completeness", value: "Passed" },
  { label: "ICD-10 Governance", value: "Review Required" },
];

export const claimReadiness = [
  { label: "พร้อมส่งเคลม", value: "184 cases" },
  { label: "รอตรวจสอบ", value: "72 cases" },
  { label: "ยังไม่พร้อมส่งเคลม", value: "31 cases" },
];

export const economicSignals = [
  { label: "Estimated Claim Value", value: "฿42.8M" },
  { label: "Cost Alert Domains", value: "4" },
  { label: "Normal Cost Domains", value: "96%" },
];

export const workspaceContext = [
  { label: "Scope", value: "Executive" },
  { label: "Period", value: "Q3 2026" },
  { label: "Dashboard ID", value: "EXD-24091" },
  { label: "PDPA Status", value: "Protected" },
];

export const workflowSteps = [
  { title: "Data Intake", detail: "Enterprise data confirmed", state: "done" },
  { title: "AI Review", detail: "Decision support generated", state: "active" },
  { title: "Human Approval", detail: "Executive review pending" },
  { title: "Board Brief", detail: "Ready for governance pack" },
];

export const clinicalBoxes = [
  {
    title: "Operational Context",
    body: "Aggregated visits, evidence packages, payer policy rules, and revenue assurance signals.",
  },
  {
    title: "Governance Summary",
    body: "AI outputs are explainable, audit-supported, and require accountable human review.",
  },
  {
    title: "Claim Intelligence",
    body: "Readiness scoring highlights evidence gaps and claim documentation risk before submission.",
  },
  {
    title: "Compliance Controls",
    body: "ข้อมูลแสดงเฉพาะระดับสรุป ไม่มี PHI/PII และรองรับ PDPA audit.",
  },
];

export const insightSignals = [
  { label: "AI Confidence", value: "96%" },
  { label: "Critical Risk", value: "Low" },
  { label: "Human Review", value: "Required" },
];

export const evidenceChecklist = [
  { label: "✓ SOAP Governance", value: "Completed" },
  { label: "✓ ICD-10 Consistency", value: "Completed" },
  { label: "⚠ Payer Rule Exception", value: "Review" },
  { label: "✓ Audit Trail", value: "Enabled" },
];

export const auditEvents = [
  { mark: "1", title: "Dashboard Generated", time: "09:11 · Orchestrator" },
  { mark: "2", title: "AI Review Completed", time: "09:16 · AI Copilot" },
  { mark: "3", title: "Compliance Guard Checked", time: "09:38 · Audit safe" },
];
