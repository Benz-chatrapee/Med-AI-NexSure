export const navigationGroups = [
  {
    title: "Executive Command",
    items: ["Executive Dashboard", "Board Briefing", "Strategy Portfolio", "Risk Radar"],
  },
  {
    title: "Performance Domains",
    items: ["Clinical Quality", "Claim Readiness", "Revenue Assurance", "Compliance"],
  },
  {
    title: "Governance",
    items: ["AI Oversight", "Audit Center", "Policy Intelligence", "Admin Control"],
  },
];

export const kpiCards = [
  {
    label: "Enterprise Readiness",
    value: "91.4%",
    trend: "+3.8%",
    description: "Claim, evidence, and policy readiness across active service lines",
    thai: "ความพร้อมองค์กรโดยรวม",
    tone: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  },
  {
    label: "Net Claim Value",
    value: "฿42.8M",
    trend: "+8.2%",
    description: "Projected value passing documentation and evidence quality gates",
    thai: "มูลค่าเคลมสุทธิ",
    tone: "text-blue-700 bg-blue-50 ring-blue-200",
  },
  {
    label: "AI Governance Score",
    value: "96.1",
    trend: "AA",
    description: "Explainability, human review, audit coverage, and policy alignment",
    thai: "คะแนนกำกับดูแล AI",
    tone: "text-indigo-700 bg-indigo-50 ring-indigo-200",
  },
  {
    label: "Critical Risk Items",
    value: "12",
    trend: "-5",
    description: "Open executive risks requiring clinical, insurance, or compliance action",
    thai: "ประเด็นเสี่ยงสำคัญ",
    tone: "text-amber-700 bg-amber-50 ring-amber-200",
  },
];

export const commandFilters = ["Q3 2026", "All Facilities", "Executive View", "PDPA Safe"];

export const readinessTrend = [
  { month: "Jan", readiness: 82, claims: 28, audit: 91 },
  { month: "Feb", readiness: 84, claims: 30, audit: 92 },
  { month: "Mar", readiness: 87, claims: 34, audit: 94 },
  { month: "Apr", readiness: 86, claims: 33, audit: 95 },
  { month: "May", readiness: 89, claims: 37, audit: 95 },
  { month: "Jun", readiness: 91, claims: 41, audit: 96 },
  { month: "Jul", readiness: 91.4, claims: 42.8, audit: 96.1 },
];

export const domainMix = [
  { name: "Claim Ready", value: 56, fill: "#2563EB" },
  { name: "Needs Review", value: 24, fill: "#F59E0B" },
  { name: "Evidence Gap", value: 14, fill: "#06B6D4" },
  { name: "Escalated", value: 6, fill: "#EF4444" },
];

export const executiveControls = [
  { label: "Region", value: "Bangkok Cluster" },
  { label: "Service Line", value: "All Clinical Units" },
  { label: "Payer Segment", value: "Commercial + Corporate" },
  { label: "Risk Mode", value: "Board Priority" },
];

export const portfolioRows = [
  {
    domain: "Clinical Documentation Quality",
    owner: "Clinical Governance",
    readiness: "94%",
    value: "High",
    risk: "Low",
    status: "On Track",
  },
  {
    domain: "Claim Readiness Conversion",
    owner: "Insurance Intelligence",
    readiness: "89%",
    value: "฿18.6M",
    risk: "Medium",
    status: "Needs Review",
  },
  {
    domain: "Evidence Package Completion",
    owner: "Operations",
    readiness: "86%",
    value: "฿9.4M",
    risk: "Medium",
    status: "Action Required",
  },
  {
    domain: "AI Safety & Explainability",
    owner: "Compliance Guard",
    readiness: "97%",
    value: "Protected",
    risk: "Low",
    status: "On Track",
  },
];

export const rightSidebarItems = [
  {
    title: "Board Priority",
    value: "Reduce evidence gaps by 18%",
    detail: "ทีมปฏิบัติการควรเร่งเคลียร์รายการขาดหลักฐานใน 7 วัน",
  },
  {
    title: "Compliance Watch",
    value: "100% audit events captured",
    detail: "ไม่พบ silent modification ในรอบรายงานล่าสุด",
  },
  {
    title: "Human Review",
    value: "42 AI-assisted cases queued",
    detail: "ต้องมีผู้เชี่ยวชาญยืนยันก่อนใช้ประกอบการตัดสินใจ",
  },
];

export const activities = [
  "Executive claim readiness briefing generated with no PHI exposure",
  "Compliance Guard marked policy-rule review as PASS_WITH_WARNINGS",
  "AI Oversight confirmed explainability coverage for high-value claims",
  "Audit Center recorded revenue assurance threshold update",
];
