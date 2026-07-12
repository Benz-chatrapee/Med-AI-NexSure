"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Readiness = "Ready" | "Needs Review" | "Not Ready";
type PackageStatus = "Draft" | "Ready" | "Pending Evidence" | "Exported" | "Submitted";
type SlaStatus = "Within SLA" | "At Risk" | "Breached";
type Priority = "Critical" | "High" | "Medium" | "Low";
type ClaimExposure = "low" | "medium" | "high";
type QueueStatus = "Waiting" | "In Consultation" | "Pending Evidence" | "Reviewer Queue" | "Completed" | "Exported";
type DocumentTab = "SOAP" | "ICD" | "Prescription" | "Certificate" | "Attachments" | "Claim Summary";
type SortKey = "priority" | "score" | "amount" | "aging";

type EvidenceCase = {
  id: number;
  priority: Priority;
  visit: string;
  hn: string;
  patient: string;
  phone: string;
  age: number;
  visitType: "OPD" | "IPD" | "Emergency";
  diagnosis: string;
  payer: string;
  claimType: string;
  consent: "Valid" | "Pending";
  reviewer: string;
  status: PackageStatus;
  readiness: Readiness;
  missing: string[];
  score: number;
  complete: number;
  total: number;
  amount: number;
  aging: number;
  sla: SlaStatus;
  updated: string;
  cost: ClaimExposure;
  queue: QueueStatus;
};

type Filters = {
  search: string;
  payer: string;
  readiness: "" | Readiness;
  sla: "" | SlaStatus;
  reviewer: string;
  missing: string;
  sort: SortKey;
};

type QuickFilter =
  | { type: "status"; value: Readiness; label: string }
  | { type: "pending"; label: string }
  | { type: "missing"; value: string; label: string }
  | { type: "sla"; value: SlaStatus; label: string }
  | { type: "cost"; value: ClaimExposure; label: string }
  | { type: "queue"; value: QueueStatus; label: string }
  | null;

const navItems = [
  "Main Dashboard",
  "Patient Management",
  "Visit Management",
  "SOAP Note",
  "Prescription",
  "Claim Readiness",
  "Evidence Package",
  "Payer Rules",
  "Economic Intelligence",
  "AI Copilot",
  "Audit & Compliance",
  "Admin Settings",
];

const cases: EvidenceCase[] = [
  { id: 1, priority: "Critical", visit: "VIS-10291", hn: "HN-240071", patient: "Somchai K.", phone: "089-xxx-1122", age: 42, visitType: "OPD", diagnosis: "J06.9 Acute URI", payer: "AIA Health", claimType: "Medical Claim", consent: "Valid", reviewer: "N. Suthida", status: "Pending Evidence", readiness: "Needs Review", missing: ["Medical Certificate"], score: 78, complete: 5, total: 6, amount: 2840, aging: 18, sla: "At Risk", updated: "12 Jul 2026, 16:18", cost: "medium", queue: "Pending Evidence" },
  { id: 2, priority: "Medium", visit: "VIS-10292", hn: "HN-240072", patient: "Araya P.", phone: "081-xxx-5588", age: 35, visitType: "OPD", diagnosis: "K29.7 Gastritis", payer: "Allianz Ayudhya", claimType: "Cashless OPD", consent: "Valid", reviewer: "P. Kanchana", status: "Ready", readiness: "Ready", missing: [], score: 96, complete: 6, total: 6, amount: 1960, aging: 3, sla: "Within SLA", updated: "12 Jul 2026, 15:52", cost: "low", queue: "Completed" },
  { id: 3, priority: "Critical", visit: "VIS-10293", hn: "HN-240073", patient: "Niran T.", phone: "092-xxx-4410", age: 51, visitType: "OPD", diagnosis: "M54.5 Low back pain", payer: "Muang Thai Life", claimType: "Reimbursement", consent: "Pending", reviewer: "Unassigned", status: "Draft", readiness: "Not Ready", missing: ["Diagnosis & ICD", "Prescription", "Medical Certificate"], score: 52, complete: 3, total: 6, amount: 5120, aging: 27, sla: "Breached", updated: "12 Jul 2026, 14:36", cost: "high", queue: "Waiting" },
  { id: 4, priority: "High", visit: "VIS-10294", hn: "HN-240074", patient: "Mali R.", phone: "086-xxx-7710", age: 29, visitType: "Emergency", diagnosis: "S93.4 Ankle sprain", payer: "FWD Insurance", claimType: "Accident Claim", consent: "Valid", reviewer: "A. Thanawat", status: "Pending Evidence", readiness: "Needs Review", missing: ["Attachment Missing"], score: 81, complete: 5, total: 6, amount: 4380, aging: 9, sla: "At Risk", updated: "12 Jul 2026, 15:10", cost: "high", queue: "Reviewer Queue" },
  { id: 5, priority: "Low", visit: "VIS-10295", hn: "HN-240075", patient: "Krit W.", phone: "099-xxx-1204", age: 47, visitType: "OPD", diagnosis: "E11.9 Diabetes follow-up", payer: "Bangkok Life", claimType: "Medical Claim", consent: "Valid", reviewer: "N. Suthida", status: "Submitted", readiness: "Ready", missing: [], score: 91, complete: 6, total: 6, amount: 3240, aging: 5, sla: "Within SLA", updated: "12 Jul 2026, 13:42", cost: "medium", queue: "Exported" },
  { id: 6, priority: "High", visit: "VIS-10296", hn: "HN-240076", patient: "Benjawan C.", phone: "083-xxx-8931", age: 63, visitType: "OPD", diagnosis: "I10 Hypertension", payer: "Self-Pay", claimType: "Receipt Package", consent: "Valid", reviewer: "P. Kanchana", status: "Pending Evidence", readiness: "Needs Review", missing: ["SOAP Incomplete"], score: 69, complete: 4, total: 6, amount: 1180, aging: 12, sla: "At Risk", updated: "12 Jul 2026, 12:28", cost: "low", queue: "In Consultation" },
];

const evidenceWeights: Record<DocumentTab, number> = {
  SOAP: 25,
  "ICD": 25,
  Prescription: 15,
  Certificate: 15,
  Attachments: 10,
  "Claim Summary": 10,
};

const trendData = [
  { date: "29 Jun", actual: 67, target: 85, previous: 63 },
  { date: "30 Jun", actual: 69, target: 85, previous: 64 },
  { date: "1 Jul", actual: 71, target: 85, previous: 66 },
  { date: "2 Jul", actual: 70, target: 85, previous: 67 },
  { date: "3 Jul", actual: 73, target: 85, previous: 66 },
  { date: "4 Jul", actual: 75, target: 85, previous: 68 },
  { date: "5 Jul", actual: 76, target: 85, previous: 70 },
  { date: "6 Jul", actual: 74, target: 85, previous: 71 },
  { date: "7 Jul", actual: 78, target: 85, previous: 71 },
  { date: "8 Jul", actual: 80, target: 85, previous: 73 },
  { date: "9 Jul", actual: 81, target: 85, previous: 74 },
  { date: "10 Jul", actual: 82, target: 85, previous: 75 },
  { date: "11 Jul", actual: 84, target: 85, previous: 77 },
  { date: "12 Jul", actual: 86, target: 85, previous: 78 },
];

const queueData = [
  { name: "Waiting", cases: 18 },
  { name: "In Consultation", cases: 32 },
  { name: "Pending Evidence", cases: 21 },
  { name: "Reviewer Queue", cases: 14 },
  { name: "Completed", cases: 57 },
  { name: "Exported", cases: 43 },
];

const missingData = [
  { name: "Medical Certificate", cases: 38, cumulative: 36 },
  { name: "SOAP Incomplete", cases: 27, cumulative: 62 },
  { name: "ICD Missing", cases: 18, cumulative: 79 },
  { name: "Attachment Missing", cases: 11, cumulative: 90 },
  { name: "Prescription Missing", cases: 7, cumulative: 96 },
  { name: "Claim Summary Missing", cases: 4, cumulative: 100 },
];

const agingData = [
  { name: "Under 2 Hours", cases: 6, color: "#059669" },
  { name: "2-4 Hours", cases: 4, color: "#10b981" },
  { name: "4-8 Hours", cases: 3, color: "#f59e0b" },
  { name: "8-24 Hours", cases: 5, color: "#d97706" },
  { name: "Over 24 Hours", cases: 3, color: "#dc2626" },
];

const costData = [
  { name: "Under THB 1,000", cases: 14, cost: "low" as ClaimExposure },
  { name: "THB 1,000-1,999", cases: 26, cost: "low" as ClaimExposure },
  { name: "THB 2,000-2,999", cases: 38, cost: "medium" as ClaimExposure },
  { name: "THB 3,000-3,999", cases: 27, cost: "medium" as ClaimExposure },
  { name: "THB 4,000-4,999", cases: 14, cost: "high" as ClaimExposure },
  { name: "THB 5,000+", cases: 9, cost: "high" as ClaimExposure },
];

const activities = [
  { user: "Dr. Anan", role: "Doctor", action: "Updated SOAP Note", time: "09:24", visit: "VIS-10291" },
  { user: "AI Coding Assist", role: "Clinical AI", action: "Suggested ICD-10 J06.9", time: "09:28", visit: "VIS-10291" },
  { user: "N. Suthida", role: "Claim Reviewer", action: "Exported PDF package", time: "09:41", visit: "VIS-10292" },
  { user: "Nurse Som", role: "Nurse", action: "Uploaded laboratory attachment", time: "09:52", visit: "VIS-10293" },
];

const emptyFilters: Filters = {
  search: "",
  payer: "",
  readiness: "",
  sla: "",
  reviewer: "",
  missing: "",
  sort: "priority",
};

function statusClass(status: Readiness | PackageStatus | SlaStatus) {
  if (status === "Ready" || status === "Exported" || status === "Submitted" || status === "Within SLA") return "ready";
  if (status === "Not Ready" || status === "Breached") return "notready";
  return "review";
}

function missingMatches(caseItem: EvidenceCase, label: string) {
  const normalized = label.toLowerCase();
  return caseItem.missing.some((item) => {
    const missing = item.toLowerCase();
    return missing.includes(normalized) || normalized.includes(missing) || (normalized.includes("icd") && missing.includes("icd"));
  });
}

function applyQuickFilter(data: EvidenceCase[], quickFilter: QuickFilter) {
  if (!quickFilter) return data;
  if (quickFilter.type === "status") return data.filter((item) => item.readiness === quickFilter.value);
  if (quickFilter.type === "pending") return data.filter((item) => item.missing.length > 0);
  if (quickFilter.type === "missing") return data.filter((item) => missingMatches(item, quickFilter.value));
  if (quickFilter.type === "sla") return data.filter((item) => item.sla === quickFilter.value);
  if (quickFilter.type === "cost") return data.filter((item) => item.cost === quickFilter.value);
  return data.filter((item) => item.queue === quickFilter.value);
}

function filterCases(data: EvidenceCase[], filters: Filters, quickFilter: QuickFilter) {
  const searched = filters.search.trim().toLowerCase();
  const priorityRank: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return applyQuickFilter(
    data.filter((item) => {
      const searchMatch = !searched || `${item.visit} ${item.patient} ${item.hn} ${item.payer}`.toLowerCase().includes(searched);
      return (
        searchMatch &&
        (!filters.payer || item.payer === filters.payer) &&
        (!filters.readiness || item.readiness === filters.readiness) &&
        (!filters.sla || item.sla === filters.sla) &&
        (!filters.reviewer || item.reviewer === filters.reviewer) &&
        (!filters.missing || missingMatches(item, filters.missing))
      );
    }),
    quickFilter,
  ).sort((a, b) => {
    if (filters.sort === "score") return a.score - b.score;
    if (filters.sort === "amount") return b.amount - a.amount;
    if (filters.sort === "aging") return b.aging - a.aging;
    const slaRank = (item: EvidenceCase) => (item.sla === "Breached" ? 0 : item.sla === "At Risk" ? 1 : 2);
    return slaRank(a) - slaRank(b) || priorityRank[a.priority] - priorityRank[b.priority] || b.amount - a.amount;
  });
}

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <span className={`ep-pill ${tone ?? statusClass(label as Readiness)}`}>{label}</span>;
}

export function EvidencePackagePage() {
  const [selectedId, setSelectedId] = useState(1);
  const [topFilters, setTopFilters] = useState({ search: "", payer: "", readiness: "" as "" | Readiness, sla: "" as "" | SlaStatus, reviewer: "" });
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [activeTab, setActiveTab] = useState<DocumentTab>("SOAP");
  const [toast, setToast] = useState("");
  const [lastUpdated, setLastUpdated] = useState("12 Jul 2026, 16:18");
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];

  const filteredCases = useMemo(() => filterCases(cases, filters, quickFilter), [filters, quickFilter]);
  const readyCount = filteredCases.filter((item) => item.readiness === "Ready").length;
  const pendingCount = filteredCases.filter((item) => item.missing.length > 0).length;
  const averageScore = filteredCases.length ? Math.round(filteredCases.reduce((total, item) => total + item.score, 0) / filteredCases.length) : 0;
  const readinessData = [
    { name: "Ready", value: 95, color: "#059669" },
    { name: "Needs Review", value: 24, color: "#d97706" },
    { name: "Not Ready", value: 9, color: "#dc2626" },
  ];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const blocked = selected.missing.length > 0;
  const contextItems = [
    ["HN", selected.hn],
    ["Patient", selected.patient],
    ["Age", `${selected.age} Years`],
    ["Visit ID", selected.visit],
    ["Visit Type", selected.visitType],
    ["Diagnosis", selected.diagnosis],
    ["Payer", selected.payer],
    ["Claim Type", selected.claimType],
    ["Consent", selected.consent],
    ["Assigned Reviewer", selected.reviewer],
    ["Package Status", selected.status],
    ["Last Updated", selected.updated],
  ];

  const scoreRows = Object.entries(evidenceWeights).map(([name, max]) => {
    const missing = name === "ICD" ? missingMatches(selected, "ICD") : missingMatches(selected, name);
    const score = missing ? 0 : Math.max(1, Math.round(max * (selected.score / 100)));
    return { name, max, score, missing };
  });

  const documentContent: Record<DocumentTab, { title: string; body: string }[]> = {
    SOAP: [
      { title: "Subjective", body: "Patient reports cough, sore throat, and rhinorrhea for two days, without dyspnea or high fever. ผู้ป่วยไอ เจ็บคอ และมีน้ำมูก 2 วัน" },
      { title: "Objective", body: "Vital signs stable, throat mildly injected, lungs clear, no respiratory distress." },
      { title: "Assessment", body: "Acute upper respiratory infection. ICD-10: J06.9" },
      { title: "Plan", body: "Symptomatic treatment, medication prescribed, follow-up if symptoms worsen." },
    ],
    ICD: [
      { title: "Primary Diagnosis", body: `${selected.diagnosis} · Coding confidence 92% · Human approval required` },
      { title: "Coding Consistency", body: "Diagnosis is consistent with SOAP Assessment and prescribed treatment." },
    ],
    Prescription: [
      { title: "Medication", body: "Paracetamol 500 mg · 1 tablet every 6 hours as needed · 5 days" },
      { title: "Safety Validation", body: "No known allergy conflict. Pharmacist verification complete." },
    ],
    Certificate: [
      { title: "Certificate Status", body: selected.missing.includes("Medical Certificate") ? "Missing - doctor action required. กรุณาดำเนินการก่อนสร้าง PDF" : "Issued and digitally signed" },
      { title: "Required Fields", body: "Diagnosis, treatment period, doctor name, issue date, and signature status." },
    ],
    Attachments: [
      { title: "Lab_Result.pdf", body: "PDF · Uploaded by Nurse Som · Verified" },
      { title: "Clinical_Image.jpg", body: "JPG · Uploaded 12 Jul 2026 · Pending reviewer validation" },
    ],
    "Claim Summary": [
      { title: "Claim Context", body: `${selected.claimType} · ${selected.payer} · Claim amount THB ${selected.amount.toLocaleString()}` },
      { title: "Reviewer Notes", body: selected.missing.length ? `${selected.missing.join(", ")} requires resolution.` : "Package ready for payer submission." },
    ],
  };

  function applyTopFilters() {
    setFilters((current) => ({ ...current, search: topFilters.search, payer: topFilters.payer, readiness: topFilters.readiness, sla: topFilters.sla, reviewer: topFilters.reviewer }));
    showToast("Filters applied");
  }

  function resetFilters() {
    setTopFilters({ search: "", payer: "", readiness: "", sla: "", reviewer: "" });
    setFilters(emptyFilters);
    setQuickFilter(null);
    showToast("Filters reset");
  }

  function exportCsv() {
    const rows = [["Visit ID", "Patient", "Payer", "Readiness", "Score", "Missing Evidence", "Claim Amount", "SLA"], ...filteredCases.map((item) => [item.visit, item.patient, item.payer, item.readiness, String(item.score), item.missing.join("|"), String(item.amount), item.sla])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    anchor.download = "evidence-package-worklist.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    showToast("CSV exported");
  }

  function generatePdf() {
    showToast(blocked ? "PDF blocked: required evidence is missing" : "PDF generated successfully");
  }

  return (
    <>
      <style>{`
        :root{--ep-bg:#f8fafc;--ep-surface:#fff;--ep-soft:#f8fbff;--ep-blue-900:#0f2a5f;--ep-blue-800:#1e3a8a;--ep-blue-700:#1d4ed8;--ep-blue-600:#2563eb;--ep-blue-100:#dbeafe;--ep-blue-50:#eff6ff;--ep-cyan:#38bdf8;--ep-green:#059669;--ep-green-bg:#ecfdf5;--ep-amber:#d97706;--ep-amber-bg:#fffbeb;--ep-red:#dc2626;--ep-red-bg:#fef2f2;--ep-text:#0f172a;--ep-muted:#64748b;--ep-border:#e2e8f0;--ep-shadow:0 12px 32px rgba(15,42,95,.08);--ep-radius:20px}
        .ep-app *{box-sizing:border-box}.ep-app button,.ep-app input,.ep-app select{font:inherit}.ep-app{display:grid;grid-template-columns:276px minmax(0,1fr);min-height:100vh;background:var(--ep-bg);color:var(--ep-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.ep-sidebar{position:sticky;top:0;height:100vh;padding:24px 18px;background:linear-gradient(180deg,var(--ep-blue-900),#071a3f);color:#fff;overflow:auto}.ep-brand{display:flex;align-items:center;gap:12px;margin-bottom:26px}.ep-brand-mark{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#60a5fa,#22d3ee);font-weight:900}.ep-brand h1{font-size:18px;margin:0}.ep-brand p{font-size:12px;color:#bfdbfe;margin:3px 0 0}.ep-nav-title{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;margin:20px 10px 8px}.ep-nav-item{display:flex;gap:10px;align-items:center;padding:12px 13px;border-radius:13px;color:#dbeafe;font-size:14px;margin-bottom:5px;text-decoration:none}.ep-nav-item.active{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.16);color:#fff}.ep-dot{width:8px;height:8px;border-radius:50%;background:#60a5fa}.ep-security{margin-top:24px;padding:15px;border-radius:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}.ep-security strong{font-size:13px}.ep-security p{font-size:12px;line-height:1.55;color:#c7d2fe;margin:7px 0 0}
        .ep-main{min-width:0;padding:26px 28px 40px}.ep-topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.ep-eyebrow{display:inline-flex;padding:7px 11px;border-radius:999px;background:var(--ep-blue-50);border:1px solid var(--ep-blue-100);color:var(--ep-blue-800);font-size:12px;font-weight:800;margin-bottom:10px}.ep-topbar h2{margin:0;color:var(--ep-blue-900);font-size:32px;letter-spacing:-.03em}.ep-subtitle{color:var(--ep-muted);font-size:14px;line-height:1.65;max-width:850px;margin:10px 0 0}.ep-actions,.ep-toolbar-actions{display:flex;gap:9px;flex-wrap:wrap}.ep-btn{border:0;border-radius:12px;padding:10px 14px;font-weight:800;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px}.ep-btn-primary{background:linear-gradient(135deg,var(--ep-blue-700),var(--ep-cyan));color:#fff;box-shadow:0 10px 24px rgba(37,99,235,.22)}.ep-btn-secondary{background:#fff;color:var(--ep-blue-800);border:1px solid var(--ep-border)}.ep-btn-ghost{background:var(--ep-blue-50);color:var(--ep-blue-700)}.ep-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
        .ep-filterbar{position:sticky;top:0;z-index:20;margin:20px 0 16px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border:1px solid var(--ep-border);border-radius:18px;padding:14px;box-shadow:var(--ep-shadow)}.ep-filters{display:grid;grid-template-columns:1.35fr repeat(5,minmax(130px,1fr));gap:10px}.ep-field label{display:block;font-size:11px;font-weight:800;color:var(--ep-muted);margin:0 0 6px}.ep-field input,.ep-field select{width:100%;border:1px solid var(--ep-border);background:#fff;color:var(--ep-text);padding:10px 11px;border-radius:11px;outline:none}.ep-field input:focus,.ep-field select:focus{border-color:#93c5fd;box-shadow:0 0 0 3px #dbeafe}.ep-filter-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:11px;color:var(--ep-muted);font-size:12px}
        .ep-selected-label{font-size:12px;font-weight:900;color:var(--ep-blue-800);margin:18px 0 8px}.ep-context-grid{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:10px}.ep-context-item,.ep-metric-mini{background:#fff;border:1px solid var(--ep-border);border-radius:14px;padding:12px}.ep-context-item label,.ep-metric-mini span{display:block;color:var(--ep-muted);font-size:11px;margin-bottom:5px}.ep-context-item strong,.ep-metric-mini strong{font-size:13px}.ep-alert{display:flex;justify-content:space-between;align-items:center;gap:18px;margin:16px 0;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:18px;padding:16px}.ep-alert.complete{background:#ecfdf5;border-color:#a7f3d0}.ep-alert h3{margin:0 0 5px;font-size:15px;color:#9a3412}.ep-alert.complete h3{color:#065f46}.ep-alert p{margin:0;color:#92400e;font-size:13px;line-height:1.55}.ep-alert.complete p{color:#047857}.ep-alert-meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:9px;color:#9a3412;font-size:12px}
        .ep-card{background:var(--ep-surface);border:1px solid var(--ep-border);border-radius:var(--ep-radius);box-shadow:var(--ep-shadow)}.ep-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin:16px 0}.ep-kpi{padding:18px;cursor:pointer;transition:.18s ease;text-align:left}.ep-kpi:hover{transform:translateY(-2px);border-color:#bfdbfe}.ep-kpi.active{outline:3px solid #dbeafe}.ep-kpi .label{font-size:12px;font-weight:800;color:var(--ep-muted)}.ep-kpi .value{font-size:30px;font-weight:900;color:var(--ep-blue-900);margin:7px 0 4px}.ep-trend{font-size:12px;font-weight:800}.up{color:var(--ep-green)}.down{color:var(--ep-red)}.neutral{color:var(--ep-amber)}.ep-sub{font-size:12px;color:var(--ep-muted);line-height:1.5;margin-top:6px}.ep-progress{height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin:10px 0 6px}.ep-progress span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--ep-blue-700),var(--ep-cyan))}.ep-progress.warn span{background:linear-gradient(90deg,#f59e0b,#d97706)}
        .ep-grid-2{display:grid;grid-template-columns:1.65fr 1fr;gap:16px;margin-bottom:16px}.ep-grid-even{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.ep-section{padding:18px}.ep-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:13px}.ep-section-head h3{margin:0;color:var(--ep-blue-900);font-size:17px}.ep-section-head p{margin:4px 0 0;color:var(--ep-muted);font-size:12px;line-height:1.5}.ep-chart-wrap{height:310px}.ep-chart-wrap.small{height:270px}.ep-chart-note{font-size:11px;color:var(--ep-muted);margin-top:8px}.ep-legend-list{display:grid;gap:8px;margin-top:10px}.ep-legend-row{display:flex;justify-content:space-between;gap:10px;font-size:12px}.ep-summary-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.ep-metric-mini strong{font-size:18px;color:var(--ep-blue-900)}
        .ep-heatmap{display:grid;grid-template-columns:120px repeat(3,1fr);gap:8px;align-items:stretch}.ep-axis{display:grid;place-items:center;text-align:center;font-size:12px;font-weight:800;color:var(--ep-muted);min-height:70px}.ep-heat-cell{border:1px solid var(--ep-border);border-radius:14px;padding:14px;cursor:pointer;transition:.18s;text-align:left}.ep-heat-cell:hover{transform:translateY(-2px);box-shadow:var(--ep-shadow)}.ep-heat-cell strong{display:block;font-size:20px;margin-bottom:5px}.ep-heat-cell span{font-size:12px;font-weight:800}.risk-low{background:#ecfdf5;color:#065f46}.risk-med{background:#fffbeb;color:#92400e}.risk-high{background:#fff7ed;color:#9a3412}.risk-critical{background:#fef2f2;color:#991b1b}
        .ep-active-filter{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--ep-blue-50);border:1px solid var(--ep-blue-100);padding:11px 13px;border-radius:13px;margin:0 0 12px;color:var(--ep-blue-800);font-size:13px}.ep-worklist{padding:18px;margin-bottom:16px}.ep-work-toolbar{display:grid;grid-template-columns:1.5fr repeat(5,minmax(120px,1fr));gap:9px;margin-bottom:12px}.ep-table-wrap{overflow:auto}.ep-case-table{width:100%;border-collapse:separate;border-spacing:0 8px;min-width:1550px}.ep-case-table th{text-align:left;padding:0 10px;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--ep-muted)}.ep-case-table td{padding:12px 10px;background:#fff;border-top:1px solid var(--ep-border);border-bottom:1px solid var(--ep-border);font-size:12px;vertical-align:middle}.ep-case-table td:first-child{border-left:1px solid var(--ep-border);border-radius:13px 0 0 13px}.ep-case-table td:last-child{border-right:1px solid var(--ep-border);border-radius:0 13px 13px 0}.ep-case-table tr{cursor:pointer}.ep-case-table tbody tr:hover td,.ep-case-table tbody tr.selected td{background:#f8fbff;border-color:#bfdbfe}.ep-patient strong{display:block;font-size:13px}.ep-patient span{color:var(--ep-muted);font-size:11px}.ep-pill{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;font-size:11px;font-weight:900;white-space:nowrap}.ep-pill.ready{background:var(--ep-green-bg);color:var(--ep-green)}.ep-pill.review{background:var(--ep-amber-bg);color:var(--ep-amber)}.ep-pill.notready{background:var(--ep-red-bg);color:var(--ep-red)}.ep-pill.blue{background:var(--ep-blue-50);color:var(--ep-blue-700)}.ep-priority{font-weight:900}.ep-priority.Critical{color:var(--ep-red)}.ep-priority.High{color:var(--ep-amber)}.ep-priority.Medium{color:var(--ep-blue-700)}.ep-priority.Low{color:var(--ep-green)}.ep-mini-progress{width:110px;height:7px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-top:5px}.ep-mini-progress span{display:block;height:100%;background:var(--ep-blue-600)}
        .ep-detail-grid{display:grid;grid-template-columns:360px minmax(0,1fr) 330px;gap:16px;margin-bottom:16px}.ep-checklist,.ep-doc-panel,.ep-pdf{padding:18px}.ep-check-item{padding:13px 0;border-bottom:1px solid var(--ep-border)}.ep-check-top{display:flex;gap:10px}.ep-check-icon{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:900}.ep-check-icon.ok{background:var(--ep-green-bg);color:var(--ep-green)}.ep-check-icon.bad{background:var(--ep-red-bg);color:var(--ep-red)}.ep-check-item h4{font-size:13px;margin:0}.ep-check-item p{font-size:11px;color:var(--ep-muted);margin:4px 0 0;line-height:1.5}.ep-check-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0 0;font-size:11px}.ep-tabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:13px}.ep-tab{padding:8px 10px;border-radius:10px;border:1px solid var(--ep-border);background:#fff;color:#334155;font-weight:800;font-size:12px;cursor:pointer}.ep-tab.active{background:var(--ep-blue-800);color:#fff;border-color:var(--ep-blue-800)}.ep-doc-box{background:var(--ep-soft);border:1px solid var(--ep-border);border-radius:14px;padding:14px;margin-bottom:10px}.ep-doc-box h4{margin:0 0 7px;font-size:13px;color:var(--ep-blue-900)}.ep-doc-box p{margin:0;color:#334155;font-size:12px;line-height:1.6}.ep-score-row{display:grid;grid-template-columns:125px 1fr 55px;gap:8px;align-items:center;font-size:12px;margin:10px 0}.ep-track{height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden}.ep-fill{height:100%;background:var(--ep-blue-600);border-radius:999px}.ep-preview-sheet{background:#fff;border:1px solid var(--ep-border);border-radius:16px;padding:16px;min-height:320px;box-shadow:inset 0 0 0 6px #f8fafc}.ep-line{height:8px;background:#e2e8f0;border-radius:999px;margin:11px 0}.ep-line.s{width:56%}.ep-line.m{width:78%}.ep-pdf-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.ep-pdf-meta div{background:var(--ep-soft);border:1px solid var(--ep-border);border-radius:10px;padding:9px}.ep-pdf-meta span{display:block;color:var(--ep-muted);font-size:10px}.ep-pdf-meta strong{font-size:11px}
        .ep-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ep-ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ep-info{background:var(--ep-soft);border:1px solid var(--ep-border);border-radius:12px;padding:12px}.ep-info span{display:block;font-size:10px;color:var(--ep-muted);margin-bottom:5px}.ep-info strong{font-size:13px}.ep-timeline{display:grid;gap:10px}.ep-event{display:grid;grid-template-columns:10px 1fr;gap:10px;font-size:12px}.ep-event-dot{width:9px;height:9px;border-radius:50%;background:var(--ep-blue-600);margin-top:4px}.ep-event strong{display:block}.ep-event span{color:var(--ep-muted)}.ep-compliance-table{width:100%;border-collapse:collapse}.ep-compliance-table th,.ep-compliance-table td{text-align:left;padding:9px;border-bottom:1px solid var(--ep-border);font-size:11px}.ep-compliance-table th{color:var(--ep-muted);text-transform:uppercase;letter-spacing:.05em}.ep-toast{position:fixed;right:24px;bottom:24px;background:var(--ep-blue-900);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:var(--ep-shadow);font-size:13px;opacity:0;transform:translateY(10px);pointer-events:none;transition:.2s;z-index:99}.ep-toast.show{opacity:1;transform:none}
        @media(max-width:1500px){.ep-kpis{grid-template-columns:repeat(3,1fr)}.ep-context-grid{grid-template-columns:repeat(4,1fr)}.ep-filters{grid-template-columns:1.4fr repeat(3,1fr)}.ep-work-toolbar{grid-template-columns:1.5fr repeat(3,1fr)}.ep-detail-grid{grid-template-columns:320px 1fr}.ep-pdf{grid-column:1/-1}.ep-bottom-grid{grid-template-columns:1fr}}@media(max-width:1180px){.ep-app{grid-template-columns:1fr}.ep-sidebar{display:none}.ep-main{padding:20px}.ep-grid-2,.ep-grid-even,.ep-detail-grid{grid-template-columns:1fr}.ep-kpis{grid-template-columns:repeat(2,1fr)}.ep-context-grid{grid-template-columns:repeat(3,1fr)}.ep-filters,.ep-work-toolbar{grid-template-columns:repeat(2,1fr)}.ep-pdf{grid-column:auto}}@media(max-width:720px){.ep-topbar{flex-direction:column}.ep-topbar h2{font-size:26px}.ep-kpis,.ep-context-grid,.ep-filters,.ep-work-toolbar,.ep-summary-metrics,.ep-ai-grid{grid-template-columns:1fr}.ep-main{padding:14px}.ep-alert{flex-direction:column;align-items:flex-start}.ep-chart-wrap{height:270px}.ep-heatmap{grid-template-columns:88px repeat(3,1fr)}.ep-heat-cell{padding:9px}.ep-bottom-grid{grid-template-columns:1fr}}
      `}</style>
      <div className="ep-app">
        <aside className="ep-sidebar">
          <div className="ep-brand"><div className="ep-brand-mark">NX</div><div><h1>Med AI NexSure</h1><p>Healthcare & Claim Intelligence</p></div></div>
          <div className="ep-nav-title">Enterprise Workspace</div>
          <nav aria-label="Enterprise workspace">
            {navItems.map((item) => <a className={`ep-nav-item ${item === "Evidence Package" ? "active" : ""}`} href="#" key={item}><span className="ep-dot" />{item}</a>)}
          </nav>
          <div className="ep-security"><strong>PHI Protected Workspace</strong><p>Role-based access with PDPA controls, audit trails, and protected file permissions.<br /><span lang="th">พื้นที่ข้อมูลผู้ป่วยที่ควบคุมสิทธิ์อย่างปลอดภัย</span></p></div>
        </aside>

        <main className="ep-main">
          <header className="ep-topbar">
            <div><div className="ep-eyebrow">AI-Assisted Evidence Operations</div><h2>Evidence Package Dashboard</h2><p className="ep-subtitle">Monitor evidence completeness, claim readiness, SLA risk, export status, and payer submission requirements.<br /><span lang="th">ติดตามความครบถ้วนของหลักฐานและเคสที่ต้องดำเนินการก่อนส่งเคลม</span></p></div>
            <div className="ep-actions"><button className="ep-btn ep-btn-secondary" onClick={() => { setLastUpdated(new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })); showToast("Dashboard data refreshed"); }}>Refresh Data</button><button className="ep-btn ep-btn-secondary" onClick={() => showToast("Opening package preview")}>Preview Package</button><button className="ep-btn ep-btn-secondary" onClick={exportCsv}>Export Report</button><button className="ep-btn ep-btn-primary" onClick={generatePdf} disabled={blocked}>Generate PDF</button></div>
          </header>

          <section className="ep-filterbar" aria-label="Dashboard filters">
            <div className="ep-filters">
              <div className="ep-field"><label htmlFor="ep-search">Search</label><input id="ep-search" placeholder="Visit ID, patient, payer..." value={topFilters.search} onChange={(event) => setTopFilters({ ...topFilters, search: event.target.value })} /></div>
              <div className="ep-field"><label htmlFor="ep-date">Date Range</label><select id="ep-date" defaultValue="Today"><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option></select></div>
              <div className="ep-field"><label htmlFor="ep-payer">Payer</label><select id="ep-payer" value={topFilters.payer} onChange={(event) => setTopFilters({ ...topFilters, payer: event.target.value })}><option value="">All Payers</option>{[...new Set(cases.map((item) => item.payer))].map((payer) => <option key={payer}>{payer}</option>)}</select></div>
              <div className="ep-field"><label htmlFor="ep-readiness">Readiness Status</label><select id="ep-readiness" value={topFilters.readiness} onChange={(event) => setTopFilters({ ...topFilters, readiness: event.target.value as "" | Readiness })}><option value="">All Statuses</option><option>Ready</option><option>Needs Review</option><option>Not Ready</option></select></div>
              <div className="ep-field"><label htmlFor="ep-sla">SLA Status</label><select id="ep-sla" value={topFilters.sla} onChange={(event) => setTopFilters({ ...topFilters, sla: event.target.value as "" | SlaStatus })}><option value="">All SLA</option><option>Within SLA</option><option>At Risk</option><option>Breached</option></select></div>
              <div className="ep-field"><label htmlFor="ep-reviewer">Assigned Reviewer</label><select id="ep-reviewer" value={topFilters.reviewer} onChange={(event) => setTopFilters({ ...topFilters, reviewer: event.target.value })}><option value="">All Reviewers</option>{[...new Set(cases.map((item) => item.reviewer))].map((reviewer) => <option key={reviewer}>{reviewer}</option>)}</select></div>
            </div>
            <div className="ep-filter-foot"><span>Last updated: {lastUpdated}</span><div className="ep-toolbar-actions"><button className="ep-btn ep-btn-secondary" onClick={resetFilters}>Reset Filters</button><button className="ep-btn ep-btn-primary" onClick={applyTopFilters}>Apply Filters</button></div></div>
          </section>

          <div className="ep-selected-label">Selected Evidence Case</div>
          <section className="ep-context-grid" aria-label="Selected evidence case">{contextItems.map(([label, value]) => <div className="ep-context-item" key={label}><label>{label}</label><strong>{value}</strong></div>)}</section>

          <section className={`ep-alert ${blocked ? "" : "complete"}`}>
            <div><h3>{blocked ? "Missing Evidence Detected" : "Evidence Package Complete"}</h3><p>{blocked ? `${selected.missing[0]} is required by ${selected.payer} rule. กรุณาดำเนินการก่อนสร้าง PDF` : "All blocking evidence has been validated. Package is ready for PDF generation."}</p>{blocked && <div className="ep-alert-meta"><span>Current score: {selected.score}</span><span>Projected score: {Math.min(100, selected.score + 10)}</span><span>PDF generation blocked</span><span>SLA: {selected.sla}</span></div>}</div>
            <div className="ep-actions"><button className="ep-btn ep-btn-secondary" onClick={() => showToast("Payer rule opened")}>View Payer Rule</button><button className="ep-btn ep-btn-primary" onClick={() => blocked ? showToast("Create evidence workflow opened") : generatePdf()}>{blocked ? "Resolve Evidence" : "Generate PDF"}</button></div>
          </section>

          <section className="ep-kpis" aria-label="Evidence package KPIs">
            <button className={`ep-card ep-kpi ${quickFilter === null ? "active" : ""}`} onClick={() => setQuickFilter(null)}><div className="label">Total Evidence Packages</div><div className="value">{filteredCases.length}</div><div className="ep-trend up">+8.4% vs Previous Period</div><div className="ep-sub">24 new packages today</div><div className="ep-progress"><span style={{ width: `${Math.min(100, filteredCases.length / 15 * 100)}%` }} /></div><div className="ep-sub">Daily Capacity <strong>{filteredCases.length} / 15</strong></div></button>
            <button className={`ep-card ep-kpi ${quickFilter?.type === "status" ? "active" : ""}`} onClick={() => setQuickFilter({ type: "status", value: "Ready", label: "Readiness = Ready" })}><div className="label">Export Ready Rate</div><div className="value">{filteredCases.length ? Math.round(readyCount / filteredCases.length * 100) : 0}%</div><div className="ep-trend neutral">Target 85% · Gap -11 pp</div><div className="ep-progress"><span style={{ width: `${filteredCases.length ? readyCount / filteredCases.length * 100 : 0}%` }} /></div><div className="ep-sub">{readyCount} of {filteredCases.length} Packages</div></button>
            <button className={`ep-card ep-kpi ${quickFilter?.type === "pending" ? "active" : ""}`} onClick={() => setQuickFilter({ type: "pending", label: "Pending Evidence" })}><div className="label">Pending Evidence</div><div className="value">{pendingCount}</div><div className="ep-trend up">-3 cases vs Yesterday</div><div className="ep-sub"><strong>5</strong> critical overdue · Oldest case 18h</div><div className="ep-progress warn"><span style={{ width: "68%" }} /></div><div className="ep-sub">SLA pressure requires review</div></button>
            <article className="ep-card ep-kpi"><div className="label">Average Readiness Score</div><div className="value">{averageScore} / 100</div><div className="ep-trend up">+4 points vs Last Week</div><div className="ep-progress"><span style={{ width: `${averageScore}%` }} /></div><div className="ep-sub">Human review remains required</div></article>
            <article className="ep-card ep-kpi"><div className="label">SLA Risk Cases</div><div className="value">{filteredCases.filter((item) => item.sla !== "Within SLA").length}</div><div className="ep-trend down">Critical workflow queue</div><div className="ep-sub">Prioritize breached and at-risk packages</div></article>
          </section>

          <section className="ep-grid-2">
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Readiness Trend</h3><p>Actual readiness versus target and previous period</p></div><StatusPill label="Interactive" tone="blue" /></div><div className="ep-chart-wrap"><ResponsiveContainer><LineChart data={trendData}><CartesianGrid stroke="#eef2f7" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Actual Readiness" onClick={() => setQuickFilter({ type: "status", value: "Ready", label: "Trend = Ready Cases" })} /><Line dataKey="target" stroke="#059669" strokeDasharray="6 5" name="Target" dot={false} /><Line type="monotone" dataKey="previous" stroke="#94a3b8" name="Previous Period" /></LineChart></ResponsiveContainer></div></div>
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Readiness Distribution</h3><p>Ready / Needs Review / Not Ready</p></div></div><div className="ep-chart-wrap small"><ResponsiveContainer><PieChart><Pie data={readinessData} dataKey="value" innerRadius="62%" outerRadius="82%" onClick={(data) => { const name = String(data.name ?? "Ready") as Readiness; setQuickFilter({ type: "status", value: name, label: `Readiness = ${name}` }); }}>{readinessData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="ep-legend-list">{readinessData.map((item) => <div className="ep-legend-row" key={item.name}><span>{item.name}</span><strong>{item.value} cases</strong></div>)}</div></div>
          </section>

          <section className="ep-grid-even">
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Queue Snapshot</h3><p>Operational case flow by current queue</p></div></div><div className="ep-chart-wrap small"><ResponsiveContainer><BarChart data={queueData} layout="vertical"><CartesianGrid stroke="#eef2f7" /><XAxis type="number" tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="cases" fill="#2563eb" radius={[0, 8, 8, 0]} onClick={(data) => { const name = String(data.name ?? "Waiting") as QueueStatus; setQuickFilter({ type: "queue", value: name, label: `Queue = ${name}` }); }} /></BarChart></ResponsiveContainer></div></div>
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Missing Evidence Pareto</h3><p>Highest-impact documentation gaps</p></div></div><div className="ep-chart-wrap small"><ResponsiveContainer><ComposedChart data={missingData}><CartesianGrid stroke="#eef2f7" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis yAxisId="left" tick={{ fontSize: 10 }} /><YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} /><Tooltip /><Bar yAxisId="left" dataKey="cases" fill="#1d4ed8" radius={[7, 7, 0, 0]} onClick={(data) => { const name = String(data.name ?? "Medical Certificate"); setQuickFilter({ type: "missing", value: name, label: `Missing Evidence = ${name}` }); }} /><Line yAxisId="right" dataKey="cumulative" stroke="#d97706" strokeWidth={2.5} /></ComposedChart></ResponsiveContainer></div></div>
          </section>

          <section className="ep-grid-even">
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Pending Evidence Aging</h3><p>Cases grouped by unresolved evidence duration</p></div></div><div className="ep-chart-wrap small"><ResponsiveContainer><BarChart data={agingData} layout="vertical"><CartesianGrid stroke="#eef2f7" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="cases" radius={[0, 8, 8, 0]} onClick={(data) => { const name = String(data.name ?? "Pending Evidence"); setQuickFilter(name === "Over 24 Hours" ? { type: "sla", value: "Breached", label: "SLA = Breached" } : { type: "pending", label: `Pending Aging = ${name}` }); }}>{agingData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Bar></BarChart></ResponsiveContainer></div></div>
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Claim Exposure</h3><p>Claim amount distribution before payer submission</p></div></div><div className="ep-chart-wrap small"><ResponsiveContainer><BarChart data={costData}><CartesianGrid stroke="#eef2f7" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="cases" radius={[7, 7, 0, 0]} onClick={(data) => { const payload = data.payload as { name?: string; cost?: ClaimExposure } | undefined; const name = String(payload?.name ?? "Claim Exposure"); const cost = payload?.cost ?? "medium"; setQuickFilter({ type: "cost", value: cost, label: `Cost Range = ${name}` }); }}>{costData.map((entry) => <Cell key={entry.name} fill={entry.cost === "high" ? "#dc2626" : entry.cost === "medium" ? "#2563eb" : "#60a5fa"} />)}</Bar></BarChart></ResponsiveContainer></div></div>
          </section>

          <section className="ep-card ep-section">
            <div className="ep-section-head"><div><h3>Risk Heatmap</h3><p>Readiness and claim exposure view for prioritization</p></div></div>
            <div className="ep-heatmap">
              <div className="ep-axis">Claim<br />Exposure</div><div className="ep-axis">Ready</div><div className="ep-axis">Needs Review</div><div className="ep-axis">Not Ready</div>
              {(["low", "medium", "high"] as ClaimExposure[]).map((cost) => <Fragment key={cost}><div className="ep-axis">{cost.toUpperCase()}</div>{(["Ready", "Needs Review", "Not Ready"] as Readiness[]).map((readiness) => {
                const count = cases.filter((item) => item.cost === cost && item.readiness === readiness).length;
                const risk = readiness === "Not Ready" && cost === "high" ? "risk-critical" : readiness === "Ready" ? "risk-low" : cost === "high" ? "risk-high" : "risk-med";
                return <button className={`ep-heat-cell ${risk}`} key={`${cost}-${readiness}`} onClick={() => setQuickFilter({ type: "cost", value: cost, label: `Claim Exposure = ${cost}, Readiness = ${readiness}` })}><strong>{count}</strong><span>{readiness}</span></button>;
              })}</Fragment>)}
            </div>
          </section>

          <section className="ep-card ep-worklist">
            <div className="ep-section-head"><div><h3>Evidence Worklist</h3><p>Search, sort, and select cases for package review</p></div><StatusPill label={`${filteredCases.length} Cases`} tone="blue" /></div>
            {quickFilter && <div className="ep-active-filter"><span>Active Filter: {quickFilter.label}</span><button className="ep-btn ep-btn-ghost" onClick={() => setQuickFilter(null)}>Clear</button></div>}
            <div className="ep-work-toolbar">
              <div className="ep-field"><label htmlFor="work-search">Worklist Search</label><input id="work-search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></div>
              <div className="ep-field"><label htmlFor="work-readiness">Readiness</label><select id="work-readiness" value={filters.readiness} onChange={(event) => setFilters({ ...filters, readiness: event.target.value as "" | Readiness })}><option value="">All</option><option>Ready</option><option>Needs Review</option><option>Not Ready</option></select></div>
              <div className="ep-field"><label htmlFor="work-missing">Missing</label><select id="work-missing" value={filters.missing} onChange={(event) => setFilters({ ...filters, missing: event.target.value })}><option value="">All</option>{missingData.map((item) => <option key={item.name}>{item.name}</option>)}</select></div>
              <div className="ep-field"><label htmlFor="work-sla">SLA</label><select id="work-sla" value={filters.sla} onChange={(event) => setFilters({ ...filters, sla: event.target.value as "" | SlaStatus })}><option value="">All</option><option>Within SLA</option><option>At Risk</option><option>Breached</option></select></div>
              <div className="ep-field"><label htmlFor="work-payer">Payer</label><select id="work-payer" value={filters.payer} onChange={(event) => setFilters({ ...filters, payer: event.target.value })}><option value="">All</option>{[...new Set(cases.map((item) => item.payer))].map((payer) => <option key={payer}>{payer}</option>)}</select></div>
              <div className="ep-field"><label htmlFor="work-sort">Sort</label><select id="work-sort" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as SortKey })}><option value="priority">Priority</option><option value="score">Lowest Score</option><option value="amount">Claim Amount</option><option value="aging">Aging</option></select></div>
            </div>
            <div className="ep-table-wrap"><table className="ep-case-table"><thead><tr><th>Priority</th><th>Visit ID</th><th>Patient</th><th>Payer</th><th>Evidence</th><th>Score</th><th>Status</th><th>Missing</th><th>Amount</th><th>Aging</th><th>SLA</th><th>Reviewer</th><th>Updated</th><th>Action</th></tr></thead><tbody>{filteredCases.map((item) => <tr className={selected.id === item.id ? "selected" : ""} key={item.id} onClick={() => { setSelectedId(item.id); setActiveTab("SOAP"); }}><td><span className={`ep-priority ${item.priority}`}>{item.priority}</span></td><td><strong>{item.visit}</strong></td><td className="ep-patient"><strong>{item.patient}</strong><span>{item.hn} · {item.phone}</span></td><td>{item.payer}</td><td>{item.complete} / {item.total} Complete<div className="ep-mini-progress"><span style={{ width: `${item.complete / item.total * 100}%` }} /></div></td><td><strong>{item.score}/100</strong></td><td><StatusPill label={item.status} tone={statusClass(item.status)} /></td><td>{item.missing.length ? item.missing.join(", ") : "None"}</td><td>THB {item.amount.toLocaleString()}</td><td>{item.aging}h</td><td><StatusPill label={item.sla} tone={statusClass(item.sla)} /></td><td>{item.reviewer}</td><td>{item.updated}</td><td><button className="ep-btn ep-btn-secondary" onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); }}>View Detail</button></td></tr>)}{filteredCases.length === 0 && <tr><td colSpan={14} style={{ textAlign: "center", padding: 30 }}>No cases match the selected filters.<br /><span lang="th">ไม่พบเคสตามเงื่อนไขที่เลือก</span></td></tr>}</tbody></table></div>
          </section>

          <section className="ep-detail-grid">
            <aside className="ep-card ep-checklist"><div className="ep-section-head"><div><h3>Evidence Checklist</h3><p>Weighted completeness review</p></div></div>{scoreRows.map((row) => <div className="ep-check-item" key={row.name}><div className="ep-check-top"><div className={`ep-check-icon ${row.missing ? "bad" : "ok"}`}>{row.missing ? "!" : "✓"}</div><div><h4>{row.name}</h4><p>{row.missing ? "Missing or incomplete - action required" : "Validated from source system"}</p></div></div><div className="ep-check-meta"><span>Contribution <strong>{row.score} / {row.max}</strong></span><span>Owner <strong>{row.name === "Certificate" ? "Doctor" : "Claim Ops"}</strong></span><span>Last updated <strong>{selected.updated}</strong></span><span>Source <strong>{row.name === "Attachments" ? "DMS" : "Clinical Record"}</strong></span></div></div>)}</aside>
            <section className="ep-card ep-doc-panel"><div className="ep-section-head"><div><h3>Evidence Package Detail</h3><p>Organized by clinical, insurance, and compliance evidence</p></div><StatusPill label={selected.readiness} tone={statusClass(selected.readiness)} /></div><div className="ep-tabs">{(Object.keys(evidenceWeights) as DocumentTab[]).map((tab) => <button className={`ep-tab ${activeTab === tab ? "active" : ""}`} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>{documentContent[activeTab].map((doc) => <div className="ep-doc-box" key={doc.title}><h4>{doc.title}</h4><p>{doc.body}</p></div>)}<div>{scoreRows.map((row) => <div className="ep-score-row" key={`${row.name}-score`}><span>{row.name}</span><div className="ep-track"><div className="ep-fill" style={{ width: `${row.score / row.max * 100}%` }} /></div><strong>{row.score}/{row.max}</strong></div>)}</div></section>
            <aside className="ep-card ep-pdf"><div className="ep-section-head"><div><h3>Preview PDF</h3><p>Review package status before document generation</p></div><StatusPill label={blocked ? "Pending Evidence" : "Ready for Export"} tone={blocked ? "review" : "ready"} /></div><div className="ep-preview-sheet"><h4>Evidence Package</h4><div className="ep-line m" /><div className="ep-line" /><div className="ep-line s" /><div className="ep-line m" /><div className="ep-line" /><div className="ep-line s" /><br /><StatusPill label={blocked ? "Pending Evidence" : "Ready for Export"} tone={blocked ? "review" : "ready"} /></div><div className="ep-pdf-meta"><div><span>Pages</span><strong>8</strong></div><div><span>Format</span><strong>PDF/A</strong></div><div><span>Audit</span><strong>Required</strong></div><div><span>Access</span><strong>RBAC</strong></div></div><p className="ep-chart-note">{blocked ? `PDF generation is unavailable because ${selected.missing.join(", ")} is missing.` : "Package is ready for PDF generation."}</p><div className="ep-actions"><button className="ep-btn ep-btn-secondary" onClick={() => showToast("Opening package preview")}>Preview</button><button className="ep-btn ep-btn-primary" onClick={generatePdf} disabled={blocked}>Generate PDF</button></div></aside>
          </section>

          <section className="ep-bottom-grid">
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>AI Recommendation Panel</h3><p>Explainable recommendation with human review required</p></div><StatusPill label="92% High" tone="blue" /></div><div className="ep-ai-grid">{[["Recommended Action", selected.missing.length ? `Resolve ${selected.missing[0]}` : "Proceed to PDF generation"], ["Reason", selected.missing.length ? "Required by payer rule" : "All required evidence validated"], ["Expected Impact", `${selected.score} -> ${Math.min(100, selected.score + 10)}`], ["Confidence", "92% High"], ["Source", `PR-${selected.payer.split(" ")[0].toUpperCase()}-OPD-014`], ["Human Review", "Required"]].map(([label, value]) => <div className="ep-info" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
            <div className="ep-card ep-section"><div className="ep-section-head"><div><h3>Recent Activity</h3><p>Audit-ready activity stream for traceability</p></div><button className="ep-btn ep-btn-secondary" onClick={() => showToast("Audit event recorded")}>Record Review</button></div><div className="ep-timeline">{activities.map((item) => <div className="ep-event" key={`${item.visit}-${item.time}`}><div className="ep-event-dot" /><div><strong>{item.user} · {item.role}</strong><span>{item.action} · {item.time} · {item.visit}</span></div></div>)}</div></div>
          </section>

          <section className="ep-card ep-section" style={{ marginTop: 16 }}><div className="ep-section-head"><div><h3>Security & Compliance</h3><p>PDPA controls, audit trail, and evidence traceability remain visible before export.</p></div></div><table className="ep-compliance-table"><thead><tr><th>Control</th><th>Status</th><th>Owner</th><th>Evidence</th></tr></thead><tbody>{[["Export Permission", "Enabled", "RBAC", "Reviewer role validated"], ["Data Masking", "Active", "Security", "Phone numbers masked"], ["Audit Logging", "On", "Compliance", "Sensitive actions require timestamp"], ["AI Safety", "Human Review", "Clinical AI", "Decision support only"]].map(([control, status, owner, evidence]) => <tr key={control}><td>{control}</td><td><StatusPill label={status} tone={status === "Human Review" ? "review" : "ready"} /></td><td>{owner}</td><td>{evidence}</td></tr>)}</tbody></table></section>
        </main>
      </div>
      <div className={`ep-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
