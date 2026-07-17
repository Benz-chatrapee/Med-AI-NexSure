"use client";

import { useEffect, useMemo, useState } from "react";
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
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type ReadinessStatus = "Ready" | "Needs Review" | "Not Ready";
type RiskLevel = "Low" | "Medium" | "High";
type MatrixRiskLevel = "Low" | "Moderate" | "High" | "Critical";
type SlaStatus = "Within SLA" | "Near SLA" | "Over SLA";
type CostStatus = "Normal" | "Cost Alert";
type QueueStatus = "Waiting" | "In Consultation" | "Pending Evidence" | "Completed";

type ClaimCase = {
  id: string;
  hn: string;
  patient: string;
  date: string;
  visitType: "OPD" | "IPD";
  queue: QueueStatus;
  score: number;
  status: ReadinessStatus;
  risk: RiskLevel;
  blocker: string;
  missing: string[];
  cost: CostStatus;
  recommendation: string;
  sla: SlaStatus;
  aging: string;
  owner: string;
  ai: "Yes" | "No";
  payer: "ABC Insurance" | "XYZ Health";
  clinic: "Bangkok OPD" | "Chiang Mai Clinic";
  department: "General Medicine" | "Orthopedics";
  claimType: "Direct Billing" | "Reimbursement";
  updated: number;
  value: number;
  valueAtRisk: number;
  aiConfidence: number;
  expectedCost: number;
  actualCost: number;
  ownerRole: string;
  lastUpdated: string;
  payerRule: "Aligned" | "Needs Review" | "Exception";
};

type Filters = {
  clinic: string;
  department: string;
  payer: string;
  visitType: string;
  claimType: string;
  ai: string;
  search: string;
  status: string;
  risk: string;
  missing: string;
  sort: "priority" | "score" | "updated";
};

type ChartFilter =
  | { kind: "status"; value: ReadinessStatus }
  | { kind: "riskStatus"; risk: RiskLevel; status: ReadinessStatus }
  | { kind: "queue"; value: QueueStatus }
  | { kind: "missing"; value: string }
  | { kind: "matrix"; likelihood: number; impact: number }
  | { kind: "costOutlier"; value: string }
  | null;

const initialCases: ClaimCase[] = [
  {
    id: "VIS-10091",
    hn: "HN-240091",
    patient: "K. S*** P.",
    date: "07 Jul 2026",
    visitType: "OPD",
    queue: "Pending Evidence",
    score: 78,
    status: "Needs Review",
    risk: "Medium",
    blocker: "ICD Missing",
    missing: ["ICD Missing", "Medical Certificate Missing"],
    cost: "Normal",
    recommendation: "Add ICD-10 J06.9 based on the Assessment text.",
    sla: "Near SLA",
    aging: "1 hr 24 min",
    owner: "Dr. Ben",
    ai: "Yes",
    payer: "ABC Insurance",
    clinic: "Bangkok OPD",
    department: "General Medicine",
    claimType: "Direct Billing",
    updated: 3,
    value: 48000,
    valueAtRisk: 18000,
    aiConfidence: 92,
    expectedCost: 22000,
    actualCost: 24800,
    ownerRole: "Clinical Coder",
    lastUpdated: "Today 10:42",
    payerRule: "Needs Review",
  },
  {
    id: "VIS-10102",
    hn: "HN-240102",
    patient: "K. M*** T.",
    date: "07 Jul 2026",
    visitType: "OPD",
    queue: "Completed",
    score: 92,
    status: "Ready",
    risk: "Low",
    blocker: "None",
    missing: [],
    cost: "Normal",
    recommendation: "No blocking issue.",
    sla: "Within SLA",
    aging: "18 min",
    owner: "Claim Team",
    ai: "Yes",
    payer: "XYZ Health",
    clinic: "Bangkok OPD",
    department: "General Medicine",
    claimType: "Reimbursement",
    updated: 1,
    value: 26500,
    valueAtRisk: 1200,
    aiConfidence: 95,
    expectedCost: 18000,
    actualCost: 17600,
    ownerRole: "Claim Reviewer",
    lastUpdated: "Today 10:31",
    payerRule: "Aligned",
  },
  {
    id: "VIS-10118",
    hn: "HN-240118",
    patient: "K. A*** R.",
    date: "07 Jul 2026",
    visitType: "OPD",
    queue: "In Consultation",
    score: 48,
    status: "Not Ready",
    risk: "High",
    blocker: "SOAP Incomplete",
    missing: ["SOAP Incomplete", "ICD Missing", "Cost Justification Missing"],
    cost: "Cost Alert",
    recommendation: "Human Review Required.",
    sla: "Over SLA",
    aging: "6 hr",
    owner: "Unassigned",
    ai: "Yes",
    payer: "ABC Insurance",
    clinic: "Chiang Mai Clinic",
    department: "Orthopedics",
    claimType: "Direct Billing",
    updated: 5,
    value: 128000,
    valueAtRisk: 86000,
    aiConfidence: 88,
    expectedCost: 62000,
    actualCost: 94000,
    ownerRole: "Clinical Reviewer",
    lastUpdated: "Today 09:58",
    payerRule: "Exception",
  },
  {
    id: "VIS-10123",
    hn: "HN-240123",
    patient: "K. P*** N.",
    date: "07 Jul 2026",
    visitType: "OPD",
    queue: "Waiting",
    score: 84,
    status: "Needs Review",
    risk: "Medium",
    blocker: "Medical Certificate Missing",
    missing: ["Medical Certificate Missing"],
    cost: "Normal",
    recommendation: "Upload required certificate.",
    sla: "Within SLA",
    aging: "26 min",
    owner: "Nurse A",
    ai: "No",
    payer: "XYZ Health",
    clinic: "Bangkok OPD",
    department: "General Medicine",
    claimType: "Reimbursement",
    updated: 2,
    value: 34000,
    valueAtRisk: 11200,
    aiConfidence: 81,
    expectedCost: 25000,
    actualCost: 26200,
    ownerRole: "Nurse Reviewer",
    lastUpdated: "Today 10:17",
    payerRule: "Aligned",
  },
  {
    id: "VIS-10131",
    hn: "HN-240131",
    patient: "K. T*** C.",
    date: "07 Jul 2026",
    visitType: "IPD",
    queue: "Pending Evidence",
    score: 58,
    status: "Not Ready",
    risk: "High",
    blocker: "ICD Missing",
    missing: ["ICD Missing", "Attachment Missing"],
    cost: "Cost Alert",
    recommendation: "Coding and document review required.",
    sla: "Over SLA",
    aging: "8 hr",
    owner: "Coder 2",
    ai: "Yes",
    payer: "ABC Insurance",
    clinic: "Chiang Mai Clinic",
    department: "Orthopedics",
    claimType: "Direct Billing",
    updated: 4,
    value: 96000,
    valueAtRisk: 67000,
    aiConfidence: 90,
    expectedCost: 54000,
    actualCost: 78000,
    ownerRole: "Payer Liaison",
    lastUpdated: "Today 09:36",
    payerRule: "Exception",
  },
];

const defaultFilters: Filters = {
  clinic: "",
  department: "",
  payer: "",
  visitType: "",
  claimType: "",
  ai: "",
  search: "",
  status: "",
  risk: "",
  missing: "",
  sort: "priority",
};

const trendData = [
  { day: "Jul 1", actual: 61, target: 85, previous: 58 },
  { day: "Jul 2", actual: 63, target: 85, previous: 59 },
  { day: "Jul 3", actual: 65, target: 85, previous: 60 },
  { day: "Jul 4", actual: 64, target: 85, previous: 61 },
  { day: "Jul 5", actual: 67, target: 85, previous: 62 },
  { day: "Jul 6", actual: 66, target: 85, previous: 63 },
  { day: "Jul 7", actual: 68, target: 85, previous: 64 },
];

const readinessData = [
  { name: "Ready", value: 42, color: "#059669" },
  { name: "Needs Review", value: 56, color: "#d97706" },
  { name: "Not Ready", value: 30, color: "#dc2626" },
] as const;

const paretoData = [
  { issue: "SOAP Incomplete", count: 18, percentage: 24, cumulative: 24, value: 420000 },
  { issue: "Medical Certificate Missing", count: 14, percentage: 19, cumulative: 43, value: 318000 },
  { issue: "ICD Missing", count: 12, percentage: 16, cumulative: 59, value: 287000 },
  { issue: "Diagnosis and Procedure Mismatch", count: 10, percentage: 13, cumulative: 72, value: 244000 },
  { issue: "Investigation Result Missing", count: 8, percentage: 11, cumulative: 83, value: 168000 },
  { issue: "Physician Signature Missing", count: 7, percentage: 9, cumulative: 92, value: 122000 },
  { issue: "Payer Document Missing", count: 6, percentage: 8, cumulative: 100, value: 98000 },
];

const readinessFactors = [
  { factor: "SOAP Completeness", current: 78, target: 90, affected: 18, status: "Needs Review" as const },
  { factor: "Diagnosis and ICD", current: 74, target: 88, affected: 12, status: "Needs Review" as const },
  { factor: "Prescription or Procedure", current: 86, target: 90, affected: 6, status: "Ready" as const },
  { factor: "Evidence Completeness", current: 69, target: 88, affected: 24, status: "Needs Review" as const },
  { factor: "Insurance Rule Alignment", current: 82, target: 90, affected: 11, status: "Needs Review" as const },
  { factor: "Economic Justification", current: 58, target: 85, affected: 9, status: "Not Ready" as const },
];

const riskMatrixItems = [
  { category: "Missing clinical evidence", likelihood: 4, impact: 4, level: "High" as MatrixRiskLevel, count: 18, value: 420000, owner: "Clinical Reviewer", payer: "ABC Insurance" },
  { category: "Coding mismatch", likelihood: 4, impact: 3, level: "High" as MatrixRiskLevel, count: 12, value: 287000, owner: "Clinical Coder", payer: "ABC Insurance" },
  { category: "Coverage uncertainty", likelihood: 3, impact: 4, level: "High" as MatrixRiskLevel, count: 9, value: 244000, owner: "Payer Liaison", payer: "XYZ Health" },
  { category: "Benefit limit exceeded", likelihood: 3, impact: 5, level: "Critical" as MatrixRiskLevel, count: 5, value: 360000, owner: "Claim Reviewer", payer: "ABC Insurance" },
  { category: "Cost outlier", likelihood: 4, impact: 5, level: "Critical" as MatrixRiskLevel, count: 7, value: 510000, owner: "Economic Review", payer: "ABC Insurance" },
  { category: "Duplicate claim risk", likelihood: 2, impact: 3, level: "Moderate" as MatrixRiskLevel, count: 4, value: 76000, owner: "Audit Team", payer: "XYZ Health" },
  { category: "PDPA or consent gap", likelihood: 2, impact: 5, level: "High" as MatrixRiskLevel, count: 3, value: 118000, owner: "Compliance", payer: "ABC Insurance" },
  { category: "Possible fraud indicator", likelihood: 1, impact: 5, level: "High" as MatrixRiskLevel, count: 2, value: 210000, owner: "Fraud Review", payer: "XYZ Health" },
];

const queueData = [
  { queue: "Waiting" as const, count: 24, percent: "18.8%", width: "49%", color: "#64748b" },
  { queue: "In Consultation" as const, count: 18, percent: "14.1%", width: "37%", color: "#2563eb" },
  { queue: "Pending Evidence" as const, count: 37, percent: "28.9%", width: "76%", color: "#d97706" },
  { queue: "Completed" as const, count: 49, percent: "38.3%", width: "100%", color: "#059669" },
];

export function ClaimReadinessDashboard() {
  const [cases, setCases] = useState(initialCases);
  const [filters, setFilters] = useState(defaultFilters);
  const [chartFilter, setChartFilter] = useState<ChartFilter>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [activities, setActivities] = useState([
    "Readiness score recalculated - 72 to 78 - Source: Rule Engine",
    "ICD-10 recommendation applied - J06.9 added - Source: User Action",
    "Risk changed - Medium to High - Source: Manual Review",
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCaseId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return [...cases]
      .filter((item) => {
        const searchable = `${item.hn} ${item.patient} ${item.id}`.toLowerCase();
        const chartMatch =
          !chartFilter ||
          (chartFilter.kind === "status" && item.status === chartFilter.value) ||
          (chartFilter.kind === "queue" && item.queue === chartFilter.value) ||
          (chartFilter.kind === "missing" && item.missing.includes(chartFilter.value)) ||
          (chartFilter.kind === "costOutlier" && item.actualCost > item.expectedCost && item.id === chartFilter.value) ||
          (chartFilter.kind === "matrix" &&
            riskPriority[item.risk] >= Math.max(1, Math.ceil(chartFilter.impact / 2)) &&
            item.valueAtRisk >= chartFilter.likelihood * 12000) ||
          (chartFilter.kind === "riskStatus" &&
            item.risk === chartFilter.risk &&
            item.status === chartFilter.status);

        return (
          (!query || searchable.includes(query)) &&
          (!filters.status || item.status === filters.status) &&
          (!filters.risk || item.risk === filters.risk) &&
          (!filters.missing || item.missing.includes(filters.missing)) &&
          (!filters.clinic || item.clinic === filters.clinic) &&
          (!filters.department || item.department === filters.department) &&
          (!filters.payer || item.payer === filters.payer) &&
          (!filters.visitType || item.visitType === filters.visitType) &&
          (!filters.claimType || item.claimType === filters.claimType) &&
          (!filters.ai || item.ai === filters.ai) &&
          chartMatch
        );
      })
      .sort((a, b) => {
        if (filters.sort === "score") return b.score - a.score;
        if (filters.sort === "updated") return b.updated - a.updated;
        return b.valueAtRisk - a.valueAtRisk || riskPriority[b.risk] - riskPriority[a.risk] || slaPriority[b.sla] - slaPriority[a.sla] || b.updated - a.updated;
      });
  }, [cases, chartFilter, filters]);

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null;

  const showToast = (message: string) => setToast(message);
  const addActivity = (message: string) => {
    setActivities((current) => [`${message} - Source: User Action`, ...current]);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applySuggestion = () => {
    if (!selectedCase) return;
    setCases((current) =>
      current.map((item) => {
        if (item.id !== selectedCase.id) return item;
        const missing = item.missing.filter((entry) => entry !== "ICD Missing");
        const score = Math.min(100, item.score + 8);
        return {
          ...item,
          missing,
          score,
          status: score >= 85 && missing.length === 0 ? "Ready" : score >= 60 ? "Needs Review" : "Not Ready",
          blocker: missing[0] ?? "None",
          recommendation: "Recommendation applied. Awaiting human confirmation.",
        };
      }),
    );
    showToast("AI suggestion applied");
    addActivity(`AI recommendation applied to ${selectedCase.id}`);
  };

  const uploadEvidence = () => {
    if (!selectedCase) return;
    setCases((current) =>
      current.map((item) => {
        if (item.id !== selectedCase.id) return item;
        const missing = item.missing.filter((entry) => !entry.includes("Certificate") && !entry.includes("Attachment"));
        const score = missing.length === 0 && item.score < 85 ? 85 : item.score;
        return {
          ...item,
          missing,
          score,
          status: missing.length === 0 && score >= 85 ? "Ready" : item.status,
          blocker: missing[0] ?? "None",
        };
      }),
    );
    showToast("Evidence uploaded");
    addActivity(`Evidence uploaded for ${selectedCase.id}`);
  };

  return (
    <div className="grid min-h-screen bg-[#F8FAFC] text-[#0F172A] lg:grid-cols-[272px_minmax(0,1fr)]">
      <Sidebar open={sidebarOpen} />
      <main className="min-w-0 px-4 py-4 sm:px-7 sm:py-6">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button className={buttonSecondary} onClick={() => setSidebarOpen((open) => !open)}>
            Menu
          </button>
          <strong>Claim Readiness</strong>
        </div>

        <header className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[.1em] text-blue-600">
              Enterprise Claim Intelligence
            </div>
            <h1 className="mt-1 text-[38px] font-extrabold text-[#0F2A5F] tracking-[-.04em]">Claim Readiness</h1>
            <p className="max-w-3xl text-sm leading-6 text-[#64748B]">
              Monitor claim-ready cases, missing evidence, risk level, economic alerts, and AI recommendations in one audit-ready operational workspace.
            </p>
            <p className="mt-1 text-xs text-[#64748B]">ตรวจสอบความพร้อมของข้อมูลก่อนสร้าง Evidence Package หรือส่งเคลมประกัน</p>
          </div>
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              className={buttonSecondary}
              onClick={() => {
                showToast("Readiness scores recalculated");
                addActivity("Readiness scores recalculated for current filter scope");
              }}
            >
              Recalculate All
            </button>
            <button className={buttonSecondary}>Audit Review Mode</button>
            <button className={buttonPrimary} onClick={() => showToast("Select a Ready case before generating an Evidence Package")}>
              Generate Evidence Package
            </button>
          </div>
        </header>

        <FilterPanel filters={filters} updateFilter={updateFilter} reset={() => {
          setFilters(defaultFilters);
          setChartFilter(null);
          showToast("Filters reset");
        }} />

        <section className="mb-4 grid gap-4 min-[1500px]:grid-cols-6 md:grid-cols-3">
          <Kpi label="Total Claim Candidates" icon="TC" value="128" meta="Target: 120 reviewed/day" trend="+12% vs previous period" progress={100} />
          <Kpi label="Average Readiness Score" icon="AS" value="78" meta="Target score: 85" trend="+4 points today" progress={78} />
          <Kpi tone="success" label="Claim Ready Rate" icon="RR" value="32.8%" meta="SLA target: 45%" trend="+5% vs last week" progress={33} />
          <Kpi tone="warning" label="Claims Pending Review" icon="PR" value="56" meta="เคสที่ต้องตรวจสอบโดยมนุษย์" trend="43.8% of candidates" progress={44} />
          <Kpi tone="danger" label="Value at Risk" icon="VR" value="฿183K" meta="High-risk unresolved value" trend="฿67K over SLA" progress={68} />
          <Kpi label="First-pass Approval Rate" icon="FA" value="71%" meta="Target: 82%" trend="-3% vs previous period" progress={71} />
        </section>

        <section className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.85fr)]">
          <ChartCard title="Claim Readiness Trend" description="Actual vs target readiness score">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[50, 90]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line dataKey="actual" name="Actual Readiness %" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                <Line dataKey="target" name="Target %" stroke="#059669" strokeDasharray="6 5" strokeWidth={2} dot={false} />
                <Line dataKey="previous" name="Previous Period" stroke="#94a3b8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className={insightClass}>Readiness improved today, but the current average remains below the 85% target threshold.</div>
          </ChartCard>

          <ChartCard title="Readiness Distribution" description="Click chart segment to filter cases">
            <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readinessData}
                      innerRadius={78}
                      outerRadius={104}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(entry) => {
                        setChartFilter({ kind: "status", value: entry.name as ReadinessStatus });
                        showToast(`Filtered by ${entry.name}`);
                      }}
                    >
                      {readinessData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <strong className="text-3xl">128</strong>
                    <span className="mt-1 block text-[11px] text-slate-500">Eligible Visits</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                {readinessData.map((item) => (
                  <div key={item.name} className="grid grid-cols-[12px_1fr_auto] items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
                <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
                  <Summary label="Ready Rate" value="32.8%" />
                  <Summary label="Needs Action" value="67.2%" />
                </div>
              </div>
            </div>
          </ChartCard>
        </section>

        <section className="mb-4 grid gap-4 xl:grid-cols-2">
          <ChartCard title="Missing Evidence Pareto" description="Top documentation blockers by issue count">
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart layout="vertical" data={paretoData} margin={{ left: 58 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="issue" type="category" width={116} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Issue Count"
                  fill="#2563eb"
                  radius={[0, 6, 6, 0]}
                  onClick={(entry) => {
                    const issue = (entry.payload as { issue: string }).issue;
                    setChartFilter({ kind: "missing", value: issue });
                    showToast(`Filtered by ${issue}`);
                  }}
                />
                <Line dataKey="cumulative" name="Cumulative %" stroke="#d97706" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className={insightClass}>ICD and SOAP gaps contribute more than half of all readiness blockers.</div>
          </ChartCard>

          <ChartCard title="Readiness Factor Breakdown" description="Weighted readiness factors with target gap and affected cases">
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={readinessFactors} layout="vertical" margin={{ left: 72, right: 16 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="factor" type="category" width={160} tick={{ fontSize: 11 }} />
                <Tooltip content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as typeof readinessFactors[number] | undefined;
                  if (!active || !item) return null;
                  return <div className="rounded-[10px] border border-slate-200 bg-white p-3 text-xs shadow-lg"><strong>{item.factor}</strong><br />Current: {item.current}%<br />Target: {item.target}%<br />Gap: {Math.max(0, item.target - item.current)} points<br />Affected cases: {item.affected}</div>;
                }} />
                <Legend />
                <Bar dataKey="current" name="Current Score" fill="#2563eb" radius={[0, 7, 7, 0]} />
                <Bar dataKey="target" name="Target Score" fill="#94a3b8" radius={[0, 7, 7, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid gap-2 text-xs">
              {readinessFactors.map((item) => (
                <button key={item.factor} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[10px] border border-slate-200 px-3 py-2 text-left hover:bg-blue-50" onClick={() => {
                  setChartFilter({ kind: "missing", value: item.factor.includes("SOAP") ? "SOAP Incomplete" : item.factor.includes("ICD") ? "ICD Missing" : item.factor.includes("Evidence") ? "Medical Certificate Missing" : "Cost Justification Missing" });
                  showToast(`Filtered by ${item.factor}`);
                }}>
                  <span className="font-bold">{item.factor}</span>
                  <span>{item.affected} affected</span>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </button>
              ))}
            </div>
          </ChartCard>
        </section>

        <section className="mb-4 grid gap-4 xl:grid-cols-2">
          <ChartCard title="Risk and Compliance Matrix" description="Likelihood x Impact with owner and value-at-risk context">
            <div className="overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[92px_repeat(5,1fr)] gap-2">
                <HeatLabel>Impact</HeatLabel>
                {[1, 2, 3, 4, 5].map((likelihood) => <HeatLabel key={likelihood}>L{likelihood}</HeatLabel>)}
                {[5, 4, 3, 2, 1].map((impact) => (
                  <div key={`impact-row-${impact}`} className="contents">
                    <HeatLabel key={`impact-${impact}`}>I{impact}</HeatLabel>
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const items = riskMatrixItems.filter((item) => item.impact === impact && item.likelihood === likelihood);
                      const strongest = items[0];
                      return (
                        <button key={`${impact}-${likelihood}`} className={`min-h-[86px] rounded-[10px] border border-slate-200 p-2 text-left text-[10px] transition hover:-translate-y-0.5 hover:shadow-lg ${matrixTone(strongest?.level)}`} aria-label={`Likelihood ${likelihood}, impact ${impact}, ${items.length} risk categories`} onClick={() => {
                          setChartFilter({ kind: "matrix", likelihood, impact });
                          showToast(`Filtered by L${likelihood} / I${impact}`);
                        }}>
                          <strong className="block text-sm">{items.length ? `${items.length} risks` : "0"}</strong>
                          {strongest ? <span className="block leading-4">{strongest.level}<br />{strongest.count} claims<br />{formatMoney(strongest.value)}</span> : <span className="block text-slate-500">No active risk</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              {riskMatrixItems.slice(0, 4).map((item) => <div key={item.category} className="rounded-[10px] border border-slate-200 p-3"><strong>{item.category}</strong><span className="block text-slate-500">{item.level} · {item.count} claims · {formatMoney(item.value)} · Owner: {item.owner} · Top payer: {item.payer}</span></div>)}
            </div>
          </ChartCard>

          <ChartCard title="Actual vs Expected Cost" description="Bubble size reflects value at risk; reference line marks expected cost parity">
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 18, right: 20, bottom: 16, left: 8 }}>
                <CartesianGrid stroke="#e2e8f0" />
                <XAxis dataKey="expectedCost" name="Expected Cost" type="number" tickFormatter={(value) => `฿${Number(value) / 1000}K`} />
                <YAxis dataKey="actualCost" name="Actual Cost" type="number" tickFormatter={(value) => `฿${Number(value) / 1000}K`} />
                <ZAxis dataKey="valueAtRisk" range={[80, 460]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as ClaimCase | undefined;
                  if (!active || !item) return null;
                  return <div className="rounded-[10px] border border-slate-200 bg-white p-3 text-xs shadow-lg"><strong>{item.id}</strong><br />Patient: {item.patient}<br />Expected: {formatMoney(item.expectedCost)}<br />Actual: {formatMoney(item.actualCost)}<br />Variance: {formatMoney(item.actualCost - item.expectedCost)}<br />Payer: {item.payer}<br />Readiness: {item.score}</div>;
                }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100000, y: 100000 }]} stroke="#64748b" strokeDasharray="5 5" label="Actual = Expected" />
                <Scatter name="Claim Cost Variance" data={cases} fill="#2563eb" onClick={(entry) => {
                  const item = getChartPayload<ClaimCase>(entry);
                  if (!item) return;
                  setChartFilter({ kind: "costOutlier", value: item.id });
                  setSelectedCaseId(item.id);
                  showToast(`Opened ${item.id}`);
                }} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className={insightClass}>จุดเหนือเส้นอ้างอิงคือค่าใช้จ่ายจริงสูงกว่าคาด ต้องตรวจสอบความเหมาะสมก่อนส่ง Claim</div>
          </ChartCard>
        </section>

        <section className="mb-4 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
          <ChartCard title="Operational Queue Snapshot" description="ภาพรวมสถานะงานและเคสที่ยังรอดำเนินการ">
            <div className="grid gap-3">
              {queueData.map((item) => (
                <button
                  key={item.queue}
                  className="grid grid-cols-[140px_1fr_72px] items-center gap-3 text-left max-sm:grid-cols-[110px_1fr_60px]"
                  onClick={() => {
                    setChartFilter({ kind: "queue", value: item.queue });
                    showToast(`Filtered by ${item.queue}`);
                  }}
                >
                  <span className="text-xs font-bold">{item.queue}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <span className="block h-full rounded-full" style={{ width: item.width, background: item.color }} />
                  </span>
                  <span className="text-right text-xs font-extrabold">
                    {item.count}
                    <span className="block text-[10px] font-medium text-slate-500">{item.percent}</span>
                  </span>
                </button>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Intelligence Summary" description="Top 3 actionable priorities; decision support only">
            <div className="grid gap-3">
              {[
                ["Missing SOAP details", "12 affected cases", "฿420,000 estimated value at risk", "Request clinical documentation review", "92%", "Clinical Reviewer"],
                ["Cost outlier requires justification", "7 affected cases", "฿510,000 estimated value at risk", "Validate economic rationale and payer exception", "88%", "Economic Review"],
                ["Payer-specific document missing", "6 affected cases", "฿98,000 estimated value at risk", "Request payer checklist evidence", "84%", "Payer Liaison"],
              ].map(([issue, casesText, value, action, confidence, role]) => (
                <div key={issue} className="rounded-[10px] border border-slate-200 p-3 text-xs leading-5">
                  <strong className="text-sm">{issue}</strong>
                  <span className="block text-slate-500">{casesText} · {value}</span>
                  <span className="mt-2 block"><strong>Recommended action:</strong> {action}</span>
                  <span className="block text-slate-500">AI confidence: {confidence} · Human review required · Responsible role: {role}</span>
                </div>
              ))}
              <button className={buttonPrimary} onClick={() => {
                setChartFilter({ kind: "missing", value: "SOAP Incomplete" });
                showToast("Filtered affected claims");
              }}>Review Affected Claims</button>
            </div>
          </ChartCard>
        </section>

        <Worklist rows={rows} filters={filters} updateFilter={updateFilter} openCase={setSelectedCaseId} clearChart={() => {
          setChartFilter(null);
          showToast("Chart filter cleared");
        }} />

        <RecentActivity activities={activities} />
      </main>

      <CaseDrawer
        selectedCase={selectedCase}
        close={() => setSelectedCaseId(null)}
        applySuggestion={applySuggestion}
        uploadEvidence={uploadEvidence}
        generate={() => {
          if (!selectedCase) return;
          showToast("Evidence Package generated");
          addActivity(`Evidence Package generated for ${selectedCase.id}`);
        }}
      />
      <div className={`fixed bottom-6 right-6 z-[120] rounded-[10px] bg-[#071733] px-4 py-3 text-xs text-white shadow-xl transition ${toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        {toast}
      </div>
    </div>
  );
}

function Sidebar({ open }: { open: boolean }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 h-screen w-[272px] overflow-auto bg-[#0F2A5F] px-[18px] py-6 text-blue-100 transition lg:sticky lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-3 px-1 pb-6">
        <div className="grid h-11 w-11 place-items-center rounded-[10px] border border-sky-300/30 bg-[#1E3A8A] font-extrabold text-white">AI</div>
        <div>
          <h2 className="m-0 text-[17px] font-bold text-white">Med AI NexSure</h2>
          <p className="mt-1 text-[11px] text-blue-300">Enterprise Healthcare Intelligence</p>
        </div>
      </div>
      <nav>
        <NavGroup label="Operations" items={["Main Dashboard", "Patient Management", "Visit Management", "SOAP Note", "Prescription", "Claim Readiness"]} />
        <NavGroup label="Intelligence" items={["Evidence Package", "Payer Rules", "Economic Intelligence", "AI Copilot"]} start={7} />
        <NavGroup label="Governance" items={["Audit & Compliance", "Admin Settings"]} codePrefix="C" />
      </nav>
    </aside>
  );
}

function NavGroup({ label, items, start = 1, codePrefix }: { label: string; items: string[]; start?: number; codePrefix?: string }) {
  return (
    <div className="mt-2">
      <div className="px-3 pb-1.5 pt-3 text-[10px] font-extrabold uppercase tracking-[.12em] text-sky-300">{label}</div>
      {items.map((item, index) => (
        <a
          key={item}
          href="#"
          className={`mb-1 flex items-center justify-between rounded-[8px] px-3 py-3 text-[13px] no-underline ${item === "Claim Readiness" ? "border border-sky-300/25 bg-[#1E3A8A] text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
        >
          {item}
          <span>{codePrefix ? `⌘${codePrefix}` : `⌘${start + index}`}</span>
        </a>
      ))}
    </div>
  );
}

function FilterPanel({ filters, updateFilter, reset }: { filters: Filters; updateFilter: (key: keyof Filters, value: string) => void; reset: () => void }) {
  return (
    <section className={panelClass}>
      <div className="grid items-end gap-2 min-[1500px]:grid-cols-7 md:grid-cols-4 sm:grid-cols-2">
        <Field label="Date Range">
          <select defaultValue="Last 7 Days"><option>Last 7 Days</option><option>Last 30 Days</option><option>Last 90 Days</option></select>
        </Field>
        <Field label="Clinic"><SelectValue value={filters.clinic} onChange={(value) => updateFilter("clinic", value)} options={["All Clinics", "Bangkok OPD", "Chiang Mai Clinic"]} /></Field>
        <Field label="Department"><SelectValue value={filters.department} onChange={(value) => updateFilter("department", value)} options={["All Departments", "General Medicine", "Orthopedics"]} /></Field>
        <Field label="Payer"><SelectValue value={filters.payer} onChange={(value) => updateFilter("payer", value)} options={["All Payers", "ABC Insurance", "XYZ Health"]} /></Field>
        <Field label="Visit Type"><SelectValue value={filters.visitType} onChange={(value) => updateFilter("visitType", value)} options={["All Visit Types", "OPD", "IPD"]} /></Field>
        <Field label="Claim Type"><SelectValue value={filters.claimType} onChange={(value) => updateFilter("claimType", value)} options={["All Claim Types", "Reimbursement", "Direct Billing"]} /></Field>
        <Field label="AI Assisted"><SelectValue value={filters.ai} onChange={(value) => updateFilter("ai", value)} options={["All Cases", "AI Assisted", "Non-AI"]} values={["", "Yes", "No"]} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1.5 text-[11px] font-bold text-[#1E3A8A]">Last 7 Days</span>
        <button className={buttonGhost} onClick={reset}>Reset Filters</button>
      </div>
    </section>
  );
}

function Worklist({ rows, filters, updateFilter, openCase, clearChart }: { rows: ClaimCase[]; filters: Filters; updateFilter: (key: keyof Filters, value: string) => void; openCase: (id: string) => void; clearChart: () => void }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className={`${cardClass} overflow-hidden p-0`}>
      <div className="border-b border-slate-200 p-[18px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="m-0 text-lg font-bold">Claims Requiring Attention</h3>
            <p className="mt-1 text-xs text-slate-500">รายการเคสสำหรับตรวจสอบ แก้ไข และส่งต่อ Evidence Package</p>
          </div>
          <div className="flex gap-2">
            <button className={buttonSecondary}>Export</button>
            <button className={buttonSecondary}>Column Settings</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input className="h-10 min-w-[260px] flex-1 rounded-[10px] border border-slate-200 px-3 text-sm" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search HN, Patient, Visit ID" />
          <SelectValue value={filters.status} onChange={(value) => updateFilter("status", value)} options={["All Readiness Status", "Ready", "Needs Review", "Not Ready"]} />
          <SelectValue value={filters.risk} onChange={(value) => updateFilter("risk", value)} options={["All Risk Levels", "Low", "Medium", "High"]} />
          <SelectValue value={filters.missing} onChange={(value) => updateFilter("missing", value)} options={["All Missing Evidence", "ICD Missing", "SOAP Incomplete", "Medical Certificate Missing", "Cost Justification Missing"]} />
          <SelectValue value={filters.sort} onChange={(value) => updateFilter("sort", value)} options={["Sort by Priority", "Sort by Score", "Sort by Last Updated"]} values={["priority", "score", "updated"]} />
          <button className={buttonSecondary} onClick={clearChart}>Clear Chart Filter</button>
        </div>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[1900px] border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr className="bg-[#EFF6FF] text-[11px] text-[#0F2A5F]">
              {["", "Claim ID", "Patient", "Payer", "Readiness Score", "Risk Level", "Primary Blocker", "Aging", "SLA Status", "Estimated Claim Value", "Value at Risk", "Owner", "AI Confidence", "Next Best Action", "Last Updated", "Actions"].map((head) => (
                <th key={head} className="sticky top-0 z-10 border-b border-blue-200 bg-[#EFF6FF] px-2.5 py-3">{head || <input type="checkbox" aria-label="Select all" />}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((item) => (
              <tr key={item.id} className="cursor-pointer align-top hover:bg-[#EFF6FF]" onClick={(event) => {
                if ((event.target as HTMLElement).closest("button,input")) return;
                openCase(item.id);
              }}>
                <td className={tdClass}><input type="checkbox" aria-label={`Select ${item.id}`} /></td>
                <td className={tdClass}><strong className="text-blue-800">{item.id}</strong><div className={mutedClass}>{item.date} · {item.visitType}</div></td>
                <td className={tdClass}><strong>{item.patient}</strong><div className={mutedClass}>{item.hn} · {item.clinic}</div></td>
                <td className={tdClass}>{item.payer}<div className={mutedClass}>{item.payerRule}</div></td>
                <td className={tdClass}><ScoreMini score={item.score} /></td>
                <td className={tdClass}><Badge tone={riskTone(item.risk)}>{item.risk}</Badge></td>
                <td className={tdClass}>{item.blocker === "None" ? <Badge tone="green">No blocker</Badge> : <strong>{item.blocker}</strong>}</td>
                <td className={tdClass}>{item.aging}<div className={mutedClass}>{item.queue}</div></td>
                <td className={tdClass}><Badge tone={slaTone(item.sla)}>{item.sla}</Badge></td>
                <td className={tdClass}>{formatMoney(item.value)}</td>
                <td className={tdClass}><strong className={item.valueAtRisk > 50000 ? "text-red-600" : "text-slate-950"}>{formatMoney(item.valueAtRisk)}</strong><div className={mutedClass}>{item.cost}</div></td>
                <td className={tdClass}>{item.owner}<div className={mutedClass}>{item.ownerRole}</div></td>
                <td className={tdClass}>{item.aiConfidence}%<div className={mutedClass}>{item.ai === "Yes" ? "AI Assisted" : "Manual Review"}</div></td>
                <td className={tdClass}>{item.recommendation}<div className={mutedClass}>Human review required</div></td>
                <td className={tdClass}>{item.lastUpdated}</td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-1.5">
                    <button className={smallButtonSecondary} onClick={() => openCase(item.id)}>View Detail</button>
                    <button className={smallButtonSecondary}>Assign Owner</button>
                    <button className={smallButtonPrimary} disabled={item.status !== "Ready"} title={item.status !== "Ready" ? "Resolve blocking issues first" : "Generate Evidence Package"}>Generate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <div className="p-8 text-center text-sm text-slate-500">No claim cases found for the selected filters.<br />ไม่พบเคสตามเงื่อนไขที่เลือก กรุณาปรับตัวกรองและลองอีกครั้ง</div> : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-3 text-xs text-slate-500">
        <span>Showing {rows.length ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, rows.length)} of {rows.length} claims</span>
        <div className="flex items-center gap-2">
          <button className={smallButtonSecondary} disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
          <strong className="text-slate-700">Page {safePage} / {totalPages}</strong>
          <button className={smallButtonSecondary} disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
        </div>
      </div>
    </section>
  );
}

function CaseDrawer({ selectedCase, close, applySuggestion, uploadEvidence, generate }: { selectedCase: ClaimCase | null; close: () => void; applySuggestion: () => void; uploadEvidence: () => void; generate: () => void }) {
  const components = selectedCase ? getScoreComponents(selectedCase) : [];
  return (
    <>
      <button aria-label="Close drawer backdrop" className={`fixed inset-0 z-40 bg-slate-900/35 transition ${selectedCase ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={close} />
      <aside className={`fixed right-0 top-0 z-50 flex h-screen w-[min(480px,100vw)] flex-col bg-white shadow-[-20px_0_60px_rgba(15,23,42,.18)] transition ${selectedCase ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!selectedCase}>
        {selectedCase ? (
          <>
            <div className="flex justify-between gap-3 border-b border-slate-200 p-[18px]">
              <div>
                <h3 className="m-0 text-lg font-bold">{selectedCase.hn} · {selectedCase.patient}</h3>
                <div className={mutedClass}>{selectedCase.id} · {selectedCase.date} · {selectedCase.visitType} · {selectedCase.payer}</div>
              </div>
              <button className={buttonSecondary} onClick={close} aria-label="Close drawer">x</button>
            </div>
            <div className="overflow-auto p-[18px]">
              <div className="mb-[18px] grid grid-cols-[110px_1fr] items-center gap-4">
                <div className="grid h-[106px] w-[106px] place-items-center rounded-full text-center" style={{ background: `radial-gradient(circle,#fff 56%,transparent 57%),conic-gradient(${scoreColor(selectedCase.score)} 0 ${selectedCase.score}%,#e2e8f0 ${selectedCase.score}% 100%)` }}>
                  <div><strong className="text-[28px]">{selectedCase.score}</strong><div className={mutedClass}>Readiness</div></div>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5"><Badge tone={statusTone(selectedCase.status)}>{selectedCase.status}</Badge><Badge tone={riskTone(selectedCase.risk)}>{selectedCase.risk} Risk</Badge></div>
                  <p className={mutedClass}>{selectedCase.score >= 85 ? "Ready threshold achieved." : `${85 - selectedCase.score} points to Ready`}</p>
                  <div className={governanceClass}>AI recommendation has not been applied. Human confirmation is required.</div>
                </div>
              </div>
              <DrawerSection title="Score Breakdown">
                {components.map((item) => (
                  <div key={item.label} className="mb-2.5">
                    <div className="mb-1 flex justify-between text-[11px]"><span>{item.label}</span><strong>{item.value}/{item.total}</strong></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${(item.value / item.total) * 100}%`, background: item.value === item.total ? "#059669" : "#2563eb" }} /></div>
                  </div>
                ))}
              </DrawerSection>
              <DrawerSection title="Issues">
                {selectedCase.missing.length ? selectedCase.missing.map((issue, index) => (
                  <div key={issue} className={`mb-2 rounded-[10px] border p-3 text-xs ${index === 0 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}><strong>{index === 0 ? "Blocking" : "Required"}:</strong> {issue}</div>
                )) : <div className="rounded-[10px] border border-slate-200 p-3 text-xs"><strong>No blocking issue.</strong> Evidence is complete.</div>}
              </DrawerSection>
              <DrawerSection title="AI Recommendation">
                <div className={insightClass}><strong>{selectedCase.recommendation}</strong><br />Confidence: 87%<br />Expected impact: {selectedCase.score < 85 ? "+8 readiness points" : "No change required"}</div>
              </DrawerSection>
              <DrawerSection title="Required Documents">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={selectedCase.missing.includes("SOAP Incomplete") ? "red" : "green"}>SOAP Note</Badge>
                  <Badge tone="green">Prescription</Badge>
                  <Badge tone={selectedCase.missing.includes("Medical Certificate Missing") ? "amber" : "green"}>Medical Certificate</Badge>
                  <Badge tone={selectedCase.missing.includes("Attachment Missing") ? "amber" : "blue"}>Supporting Attachment</Badge>
                  <Badge tone="blue">Claim Summary</Badge>
                </div>
              </DrawerSection>
              <div className={governanceClass}>AI Decision Support only. AI-generated recommendations must not automatically approve or submit a claim. High-risk cases require human review, reviewer confirmation, permission validation, and an audit trail.</div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 p-[14px_18px]">
              <button className={buttonPrimary} onClick={applySuggestion}>Apply Suggestion</button>
              <button className={buttonSecondary} onClick={uploadEvidence}>Upload Evidence</button>
              <button className={buttonSecondary}>Request Manual Review</button>
              <button className={buttonDanger}>Manual Override</button>
              <button className={buttonPrimary} disabled={selectedCase.status !== "Ready"} onClick={generate} title={selectedCase.status !== "Ready" ? "Resolve blocking issues first" : "Generate Evidence Package"}>Generate Evidence Package</button>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function RecentActivity({ activities }: { activities: string[] }) {
  return (
    <section className={`${cardClass} mt-4`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><h3 className="m-0 text-lg font-bold">Recent Activity</h3><p className="mt-1 text-xs text-slate-500">ประวัติการเปลี่ยนแปลงเพื่อรองรับ Audit Trail</p></div>
        <button className={buttonSecondary}>View Full Audit Trail</button>
      </div>
      <div>
        {activities.map((activity, index) => (
          <div key={`${activity}-${index}`} className="grid grid-cols-[70px_14px_1fr] gap-2.5 border-b border-slate-100 py-3">
            <div className="text-[11px] text-slate-500">{index === 0 && activity.includes("Source: User Action") ? "Now" : ["10:42", "10:31", "10:18"][index] ?? "Now"}</div>
            <div className="relative mt-1 h-2.5 w-2.5 rounded-full bg-blue-600 after:absolute after:left-1 after:top-2.5 after:h-[54px] after:w-0.5 after:bg-blue-100 last:after:hidden" />
            <div><strong>{activity.includes("AI") ? "AI System" : activity.includes("Risk") ? "Claim Reviewer" : "Current User"}</strong><div className={mutedClass}>{activity}</div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Kpi({ label, icon, value, meta, trend, progress, tone = "default" }: { label: string; icon: string; value: string | number; meta: string; trend: string; progress: number; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneColor = tone === "success" ? "#059669" : tone === "warning" ? "#d97706" : tone === "danger" ? "#dc2626" : "#2563eb";
  return (
    <article className={`${cardClass} relative overflow-hidden p-[17px] before:absolute before:inset-y-0 before:left-0 before:w-1`}>
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: toneColor }} />
      <div className="flex items-center justify-between gap-2"><div className="text-[13px] font-extrabold tracking-[-.01em] text-[#0F2A5F]">{label}</div><div className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] text-[13px] font-extrabold text-[#1E3A8A]">{icon}</div></div>
      <div className="mt-3.5 text-center text-[34px] font-extrabold tracking-[-.045em]">{value}</div>
      <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full" style={{ width: `${progress}%`, background: toneColor }} /></div>
      <div className={`mt-3.5 text-[11px] font-bold ${tone === "warning" ? "text-amber-600" : tone === "danger" ? "text-red-600" : "text-emerald-600"}`}>{trend}</div>
      <div className="mt-1 text-[11px] font-semibold text-slate-500">{meta}</div>
    </article>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <article className={cardClass}>
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div><h3 className="m-0 text-lg font-bold">{title}</h3><p className="mt-1 text-xs text-slate-500">{description}</p></div>
      </div>
      {children}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold text-slate-500">{label}<div className="mt-1.5">{children}</div></label>;
}

function SelectValue({ value, onChange, options, values }: { value: string; onChange: (value: string) => void; options: string[]; values?: string[] }) {
  return (
    <select className="h-10 min-w-[150px] rounded-[8px] border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option, index) => <option key={option} value={values?.[index] ?? (index === 0 ? "" : option)}>{option}</option>)}
    </select>
  );
}

function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "blue" | "gray"; children: React.ReactNode }) {
  const tones = {
    green: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border border-amber-200 bg-amber-50 text-amber-700",
    red: "border border-red-200 bg-red-50 text-red-600",
    blue: "border border-blue-200 bg-[#EFF6FF] text-[#1E3A8A]",
    gray: "border border-slate-200 bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}

function ScoreMini({ score }: { score: number }) {
  return <div className="w-20"><strong className="text-base">{score}</strong><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor(score) }} /></div></div>;
}

function Summary({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className="flex justify-between"><span>{label}</span><strong className={danger ? "text-red-600" : "text-slate-950"}>{value}</strong></div>;
}

function HeatLabel({ children }: { children?: React.ReactNode }) {
  return <div className="grid min-h-[42px] place-items-center text-center text-[11px] font-extrabold text-slate-500">{children}</div>;
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-[18px]"><h4 className="mb-2.5 text-sm font-bold">{title}</h4>{children}</section>;
}

function getScoreComponents(item: ClaimCase) {
  return [
    { label: "SOAP Completeness", value: item.missing.includes("SOAP Incomplete") ? 14 : 25, total: 25 },
    { label: "Diagnosis & ICD", value: item.missing.includes("ICD Missing") ? 12 : 20, total: 20 },
    { label: "Prescription / Procedure", value: 15, total: 15 },
    { label: "Evidence", value: item.missing.length ? 11 : 20, total: 20 },
    { label: "Insurance Rule", value: 8, total: 10 },
    { label: "Economic Check", value: item.cost === "Cost Alert" ? 5 : 10, total: 10 },
  ];
}

const riskPriority: Record<RiskLevel, number> = { High: 3, Medium: 2, Low: 1 };
const slaPriority: Record<SlaStatus, number> = { "Over SLA": 3, "Near SLA": 2, "Within SLA": 1 };
const panelClass = "mb-4 rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-[0_8px_24px_rgba(15,42,95,.06)]";
const cardClass = "rounded-[8px] border border-[#E2E8F0] bg-white p-[18px] shadow-[0_8px_24px_rgba(15,42,95,.06)]";
const buttonPrimary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[#1E3A8A] bg-[#1E3A8A] px-3.5 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(30,58,138,.16)] hover:bg-[#0F2A5F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none";
const buttonSecondary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[#BFDBFE] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#0F2A5F] hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:text-slate-400";
const buttonGhost = "inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-transparent px-3.5 py-2.5 text-[13px] font-bold text-[#64748B] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]";
const buttonDanger = "inline-flex min-h-10 items-center justify-center rounded-[8px] border border-red-200 bg-white px-3.5 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50";
const smallButtonPrimary = `${buttonPrimary} min-h-8 px-2.5 py-1.5 text-[11px]`;
const smallButtonSecondary = `${buttonSecondary} min-h-8 px-2.5 py-1.5 text-[11px]`;
const mutedClass = "mt-1 text-[11px] text-slate-500";
const tdClass = "border-b border-slate-100 px-2.5 py-3 align-top";
const insightClass = "mt-3 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-3 text-xs leading-5 text-[#0F2A5F]";
const governanceClass = "rounded-[8px] border border-dashed border-[#BFDBFE] bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#64748B]";

function statusTone(status: ReadinessStatus) {
  return status === "Ready" ? "green" : status === "Needs Review" ? "amber" : "red";
}

function riskTone(risk: RiskLevel) {
  return risk === "Low" ? "green" : risk === "Medium" ? "amber" : "red";
}

function slaTone(status: SlaStatus) {
  return status === "Within SLA" ? "green" : status === "Near SLA" ? "amber" : "red";
}

function scoreColor(score: number) {
  return score >= 85 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
}

function matrixTone(level?: MatrixRiskLevel) {
  if (level === "Critical") return "bg-red-50 text-red-800";
  if (level === "High") return "bg-amber-50 text-amber-800";
  if (level === "Moderate") return "bg-blue-50 text-blue-900";
  return "bg-slate-50 text-slate-500";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", { currency: "THB", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function getChartPayload<TPayload>(entry: unknown): TPayload | null {
  if (!entry || typeof entry !== "object") return null;
  const maybePayload = (entry as { payload?: unknown }).payload;
  return maybePayload && typeof maybePayload === "object" ? (maybePayload as TPayload) : null;
}
