"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  Bot,
  CalendarDays,
  CircleHelp,
  Download,
  FileCheck2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { assignReviewerSchema, type AssignReviewerFormValues } from "../schemas/claim-dashboard.schema";
import { assignClaimReviewer, createEvidenceTasks, exportClaims, recalculateClaims } from "../services/claim-dashboard-service";
import { useClaimDashboard } from "../hooks/use-claim-dashboard";
import {
  readinessStatusConfig,
  riskStatusConfig,
  slaStatusConfig,
  workflowStatusConfig,
} from "../data/claim-dashboard.mock";
import type { ClaimDashboardFilters, ClaimKpiFilter, ClaimRiskCategory, ClaimRiskLevel, ClaimWorklistItem } from "../types/claim-dashboard.types";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[11px] border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-900 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = `${button} border-blue-800 bg-blue-900 text-white hover:border-blue-900 hover:bg-blue-950`;
const iconButton = "inline-flex h-10 w-10 items-center justify-center rounded-[11px] border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const card = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,42,95,.08)]";

const readinessChart = [
  { name: "Ready", key: "READY", value: 958, color: "#059669" },
  { name: "Needs Review", key: "NEEDS_REVIEW", value: 186, color: "#D97706" },
  { name: "Not Ready", key: "NOT_READY", value: 88, color: "#DC2626" },
  { name: "Not Assessed", key: "all", value: 16, color: "#94A3B8" },
] as const;
const trendData = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((week, index) => ({
  week,
  Actual: [71, 72.4, 73.8, 74.1, 75.5, 76, 76.4, 76.8][index],
  Target: 85,
  "Previous Period": [69, 69.8, 70.1, 70.7, 71.5, 72.1, 72.8, 73.4][index],
}));
const heatmap: Record<ClaimRiskLevel, number[]> = {
  CRITICAL: [9, 3, 7, 6, 4, 11],
  HIGH: [14, 18, 21, 23, 12, 19],
  MEDIUM: [85, 96, 74, 108, 91, 87],
  LOW: [132, 148, 119, 125, 106, 143],
};
const heatCategories: ClaimRiskCategory[] = ["Clinical", "Coding", "Coverage", "Evidence", "Cost", "SLA"];
const queueData = [
  { status: "Draft", "Within SLA": 72, "Near SLA": 16, Overdue: 8 },
  { status: "Pending Evidence", "Within SLA": 98, "Near SLA": 65, Overdue: 23 },
  { status: "Ready for Review", "Within SLA": 103, "Near SLA": 34, Overdue: 11 },
  { status: "In Review", "Within SLA": 99, "Near SLA": 18, Overdue: 7 },
  { status: "Ready to Submit", "Within SLA": 81, "Near SLA": 9, Overdue: 2 },
  { status: "Submitted", "Within SLA": 295, "Near SLA": 18, Overdue: 5 },
  { status: "Returned", "Within SLA": 24, "Near SLA": 11, Overdue: 6 },
  { status: "Approved", "Within SLA": 226, "Near SLA": 0, Overdue: 0 },
  { status: "Rejected", "Within SLA": 12, "Near SLA": 3, Overdue: 2 },
];
const slaAgingData = ["<4h", "4-8h", "8-24h", "1-2d", "3-5d", "> 5d"].map((bucket, index) => ({
  bucket,
  "Pending Evidence": [22, 31, 45, 52, 24, 12][index],
  "Ready for Review": [38, 41, 32, 21, 11, 5][index],
  "In Review": [42, 36, 24, 13, 7, 2][index],
  Returned: [5, 7, 8, 10, 7, 4][index],
}));
const evidencePareto = makePareto(["SOAP incomplete", "ICD-10 missing", "Medical Certificate missing", "Cost justification missing", "Consent missing", "Lab result missing", "Prescription incomplete"], [89, 64, 47, 31, 26, 19, 14]);
const returnPareto = makePareto(["Missing Evidence", "Coding Mismatch", "Coverage Not Confirmed", "Cost Justification", "Duplicate Claim", "Invalid Documentation", "Payer Rule Conflict"], [72, 51, 39, 28, 17, 13, 9]);
const costTrend = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((week, index) => ({ week, Actual: [6200, 6350, 6480, 6420, 6590, 6710, 6760, 6840][index], Benchmark: [6200, 6200, 6250, 6250, 6300, 6300, 6350, 6350][index], "Previous Period": [6000, 6120, 6180, 6210, 6280, 6330, 6380, 6420][index] }));
const costDistribution = ["0-2.5K", "2.5-5K", "5-7.5K", "7.5-10K", "10-25K", "> 25K"].map((bucket, index) => ({ bucket, Claims: [118, 284, 376, 221, 182, 67][index] }));
const outliers = [{ x: 5000, y: 5400 }, { x: 6500, y: 8900 }, { x: 30000, y: 48200 }, { x: 10000, y: 12300 }, { x: 6000, y: 7200 }, { x: 4200, y: 4100 }, { x: 38000, y: 67500 }, { x: 11000, y: 15600 }];
const payerLabels = ["AIA", "Muang Thai Life", "Allianz Ayudhya", "FWD"];
const payerPerformance = {
  "Approval Rate": [91, 88, 84, 81],
  "Claim Ready %": [82, 77, 73, 69],
  "Return Rate": [5, 7, 10, 13],
  "Average TAT": [2.8, 3.4, 4.1, 4.6],
  "Claim Volume": [360, 315, 288, 285],
} as const;

export function ClaimDashboardPage() {
  const dashboard = useClaimDashboard();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState("All Activities");
  const [payerMetric, setPayerMetric] = useState<keyof typeof payerPerformance>("Approval Rate");
  const worklistRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedIds = [...dashboard.selectedClaimIds];
  const selectKpi = (value: ClaimKpiFilter) => {
    dashboard.setSelectedKpi(value);
    dashboard.setSelectedHeatmapCell(null);
    requestAnimationFrame(() => worklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const handleMockAction = (label: string) => setToast(`${label} · mock handler ready for backend integration`);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-950">
      <Sidebar open={mobileOpen} close={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar openMenu={() => setMobileOpen(true)} search={dashboard.search} setSearch={dashboard.setSearch} action={handleMockAction} />
        <main className="w-full flex-1 px-3 py-4 sm:px-4 lg:px-6">
          <PageHeader lastUpdated={dashboard.lastUpdated} refresh={() => { dashboard.setLastUpdated(new Date()); setToast("Dashboard refreshed · ใช้ข้อมูล mock ในเครื่อง"); }} exportData={() => { exportClaims(selectedIds); handleMockAction("Export started"); }} />
          <Alert />
          <FilterPanel filters={dashboard.filters} updateFilter={dashboard.updateFilter} advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen} reset={() => { dashboard.reset(); setToast("Dashboard view reset"); }} />
          <ActiveChips filters={dashboard.filters} search={dashboard.search} heat={dashboard.selectedHeatmapCell} payer={dashboard.selectedPayer} evidence={dashboard.selectedEvidenceCategory} reset={dashboard.reset} />
          <SectionTitle title="Executive Claim Overview" meta="เลือก KPI เพื่อเจาะดูเคสที่เกี่ยวข้อง" />
          <KpiGrid selected={dashboard.selectedKpi} select={selectKpi} />
          <section className="mt-4 grid gap-4 xl:grid-cols-3">
            <ChartCard title="Claim Readiness" desc="Doughnut distribution with target comparison">
              <div className="relative h-[290px]" aria-label="Ready 958, Needs Review 186, Not Ready 88, Not Assessed 16">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={readinessChart} dataKey="value" innerRadius={78} outerRadius={108} paddingAngle={2} onClick={(entry) => {
                      const key = typeof entry.key === "string" ? entry.key : "all";
                      dashboard.updateFilter("readiness", key === "all" ? "" : key as ClaimDashboardFilters["readiness"]);
                    }}>
                      {readinessChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><strong className="text-3xl text-blue-950">76.8%</strong><span className="block text-xs text-slate-500">Claim Ready</span></div></div>
              </div>
              <SummaryLine items={[["Target", "85%"], ["Current", "76.8%"]]} />
            </ChartCard>
            <ChartCard title="Claim Readiness Trend" desc="Actual, target, and previous period">
              <LineChartBlock data={trendData} />
            </ChartCard>
            <ChartCard title="Risk Heatmap" desc="Keyboard-accessible risk cells">
              <RiskHeatmap selected={dashboard.selectedHeatmapCell} select={(category, severity) => { dashboard.setSelectedHeatmapCell({ category, severity }); setToast(`${category} x ${riskStatusConfig[severity].label} filter applied`); }} />
            </ChartCard>
          </section>
          <SectionTitle title="Operational Workflow & SLA" meta="Queue pressure and aging exposure" />
          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Claim Queue by Status" desc="Horizontal stacked SLA queue">
              <StackedQueueChart />
            </ChartCard>
            <ChartCard title="SLA Aging Distribution" desc="Aging buckets by queue state">
              <StackedSlaChart />
              <SummaryLine items={[["Within SLA", "78%"], ["Near Breach", "14%"], ["Overdue", "8%"]]} />
            </ChartCard>
          </section>
          <SectionTitle title="Evidence & Root Cause Intelligence" meta="Pareto analysis for missing evidence and returned claims" />
          <section className="grid gap-4 xl:grid-cols-2">
            <ParetoCard title="Top Missing Evidence" data={evidencePareto} color="#2563EB" onClick={(category) => dashboard.setSelectedEvidenceCategory(category)} action={() => { createEvidenceTasks(selectedIds); handleMockAction("Create Tasks"); }} />
            <ParetoCard title="Top Claim Return Reasons" data={returnPareto} color="#EA580C" onClick={(category) => dashboard.setSelectedEvidenceCategory(category)} />
          </section>
          <SectionTitle title="Financial Exposure & Economic Intelligence" meta="Compact operational economics" />
          <FinancialStrip />
          <section className="mt-4 grid gap-4 xl:grid-cols-3">
            <ChartCard title="Average Claim Cost Trend" desc="Actual vs benchmark">
              <LineChartBlock data={costTrend} currency />
            </ChartCard>
            <ChartCard title="Claim Cost Distribution" desc="Histogram-style claim buckets">
              <SimpleBar data={costDistribution} />
            </ChartCard>
            <ChartCard title="Cost Outlier Analysis" desc="Expected cost vs actual amount">
              <ScatterBlock />
            </ChartCard>
          </section>
          <SectionTitle title="Payer Performance Intelligence" meta="Payer ranking and approval efficiency" />
          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Payer Performance Ranking" desc="Metric selector updates without page rebuild">
              <select className="mb-3 h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={payerMetric} onChange={(event) => setPayerMetric(event.target.value as keyof typeof payerPerformance)}>
                {Object.keys(payerPerformance).map((metric) => <option key={metric}>{metric}</option>)}
              </select>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart layout="vertical" data={payerLabels.map((payer, index) => ({ payer, value: payerPerformance[payerMetric][index] }))}>
                  <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="payer" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" radius={[0, 7, 7, 0]} onClick={(entry) => {
                    const payload = getChartPayload<{ payer?: string }>(entry);
                    if (payload?.payer) dashboard.setSelectedPayer(payload.payer);
                  }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Approval Rate vs Turnaround Time" desc="Bubble size represents claim volume">
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart>
                  <CartesianGrid stroke="#E2E8F0" />
                  <XAxis dataKey="x" name="Average TAT" unit="d" />
                  <YAxis dataKey="y" name="Approval Rate" unit="%" domain={[75, 95]} />
                  <ZAxis dataKey="z" range={[90, 420]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name]} />
                  <Scatter data={payerLabels.map((payer, index) => ({ payer, x: [2.8, 3.4, 4.1, 4.6][index], y: [91, 88, 84, 81][index], z: [360, 315, 288, 285][index] }))} fill="#2563EB" onClick={(entry) => {
                    const payload = getChartPayload<{ payer?: string }>(entry);
                    if (payload?.payer) dashboard.setSelectedPayer(payload.payer);
                  }} />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
          <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
            <AiActionQueue action={(label) => { if (label === "Assign Reviewer") setAssignOpen(true); else handleMockAction(label); }} />
            <div className="grid gap-4">
              <RecentActivity filter={activityFilter} setFilter={setActivityFilter} />
              <AiPerformanceSummary />
            </div>
          </section>
          <ClaimWorklist refEl={worklistRef} rows={dashboard.rows} allRows={dashboard.allRows} selected={dashboard.selectedClaimIds} setSelected={dashboard.setSelectedClaimIds} search={dashboard.search} setSearch={dashboard.setSearch} reset={dashboard.reset} refresh={() => setToast("Data refreshed · mock data")} />
        </main>
      </div>
      <BulkBar count={selectedIds.length} assign={() => setAssignOpen(true)} task={() => { createEvidenceTasks(selectedIds); handleMockAction("Create Evidence Task"); }} recalc={() => { recalculateClaims(selectedIds); handleMockAction("Recalculate"); }} exportData={() => { exportClaims(selectedIds); handleMockAction("Export selected"); }} />
      <AssignDialog open={assignOpen} claimIds={selectedIds.length ? selectedIds : dashboard.rows.slice(0, 1).map((row) => row.id)} close={() => setAssignOpen(false)} success={(reviewer) => { assignClaimReviewer({ claimIds: selectedIds, reviewer, reason: "Reviewer assignment" }); setAssignOpen(false); dashboard.setSelectedClaimIds(new Set()); setToast(`Reviewer assigned to local state · ยังไม่ได้บันทึก Audit API`); }} />
      <div aria-live="polite" className={`fixed bottom-5 right-5 z-[90] rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white shadow-xl transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>{toast}</div>
    </div>
  );
}

function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  const links = [
    ["Workspace", LayoutDashboard, "Main Dashboard", "/dashboard", false],
    ["", Stethoscope, "Visit Management", "/visit-management", false],
    ["", FileCheck2, "Claim Readiness", "/claim-readiness", true],
    ["", PackageCheck, "Evidence Package", "/evidence-package", false],
    ["", Bot, "AI Copilot", "/ai-copilot-panel", false],
    ["Management", Users, "Patients", "/visit-management", false],
    ["", LayoutDashboard, "Economic Intelligence", "/economic-intelligence", false],
    ["", ScrollText, "Audit & Compliance", "/audit-compliance", false],
    ["", Settings, "Settings", "/admin/users", false],
  ] as const;
  return (
    <>
      <button aria-label="Close navigation backdrop" className={`fixed inset-0 z-40 bg-slate-950/35 lg:hidden ${open ? "" : "hidden"}`} onClick={close} />
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 overflow-auto bg-gradient-to-b from-blue-950 via-[#0B2451] to-[#081B3A] p-4 text-white transition lg:sticky lg:top-0 lg:z-auto lg:h-screen ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-5">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-sky-400 to-blue-700"><ShieldCheck size={22} /></div>
          <div><h1 className="text-sm font-bold">Med AI NexSure</h1><p className="text-[11px] text-blue-100/75">Healthcare & Insurance Intelligence</p></div>
        </div>
        <nav className="mt-4">
          {links.map(([group, Icon, label, href, active]) => (
            <div key={`${group}-${label}`}>
              {group ? <div className="mx-2 mt-5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-200/60">{group}</div> : null}
              <a className={`mt-1 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-blue-50 ${active ? "border-blue-200/20 bg-blue-500/20 shadow-[inset_3px_0_0_#38BDF8]" : "border-transparent hover:bg-white/10"}`} href={href}>
                <Icon size={18} />{label}{active ? <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold">23</span> : null}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 px-2 pt-4">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white font-extrabold text-blue-900">CM</div><div><strong className="text-sm">Claim Manager</strong><p className="text-[11px] text-blue-100/65">Authorized reviewer</p></div></div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ openMenu, search, setSearch, action }: { openMenu: () => void; search: string; setSearch: (value: string) => void; action: (label: string) => void }) {
  return <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7"><div className="flex items-center gap-3"><Button className={`${iconButton} lg:hidden`} aria-label="Open navigation" onClick={openMenu}><Menu size={18} /></Button><label className="hidden min-w-[360px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex"><Search size={17} className="text-slate-500" /><span className="sr-only">Global search</span><Input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Claim ID, patient, payer or ICD-10..." /></label></div><div className="flex gap-2"><Button className={`${button} hidden sm:inline-flex`} onClick={() => action("AI Copilot")}><Sparkles size={16} />AI Copilot</Button><Button className={iconButton} aria-label="Notifications"><Bell size={17} /></Button><Button className={iconButton} aria-label="Help"><CircleHelp size={17} /></Button></div></header>;
}

function PageHeader({ lastUpdated, refresh, exportData }: { lastUpdated: Date; refresh: () => void; exportData: () => void }) {
  return <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="text-xs font-extrabold uppercase tracking-[.08em] text-blue-600">Insurance Intelligence</div><h2 className="mt-1 text-3xl font-extrabold tracking-[-.035em] text-blue-950">Claim Dashboard</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">Monitor claim readiness, operational risk, evidence gaps, SLA exposure, and financial impact before submission.<br />ติดตามความพร้อม ความเสี่ยง เอกสารที่ขาด SLA และผลกระทบทางการเงินก่อนส่งเคลม</p></div><div className="flex flex-col items-start gap-2 sm:items-end"><div className="flex gap-2"><Button className={button} onClick={refresh}><RefreshCw size={16} />Refresh</Button><Button className={primaryButton} onClick={exportData}><Download size={16} />Export</Button></div><div className="rounded-[9px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">Last updated · {lastUpdated.toLocaleString("en-GB")}</div></div></section>;
}

function Alert() {
  return <div className="mt-4 flex gap-3 rounded-[14px] border border-indigo-200 bg-blue-50 p-4 text-sm leading-6 text-indigo-800"><Sparkles size={18} className="mt-0.5 shrink-0" /><div><strong>AI Decision Support</strong><br />AI-generated recommendations support operational review and do not replace authorized clinical, insurance, or compliance decisions. ข้อเสนอแนะจาก AI ใช้เพื่อสนับสนุนการตรวจสอบเท่านั้น</div></div>;
}

function FilterPanel({ filters, updateFilter, advancedOpen, setAdvancedOpen, reset }: { filters: ClaimDashboardFilters; updateFilter: ReturnType<typeof useClaimDashboard>["updateFilter"]; advancedOpen: boolean; setAdvancedOpen: (value: boolean) => void; reset: () => void }) {
  return <section className={`${card} mt-4 grid gap-3 p-4 min-[1500px]:grid-cols-6 md:grid-cols-3`} aria-label="Claim dashboard filters">
    <Select label="Organization" value={filters.organization} onChange={(value) => updateFilter("organization", value)} options={["Med AI Health Network"]} />
    <Select label="Clinic" value={filters.clinic} onChange={(value) => updateFilter("clinic", value)} options={["", "Bangkok Clinic", "Sukhumvit Clinic", "Chiang Mai Clinic"]} names={["All Clinics"]} />
    <Select label="Date Range" value={filters.dateRange} onChange={(value) => updateFilter("dateRange", value as ClaimDashboardFilters["dateRange"])} options={["Today", "Last 7 Days", "Last 30 Days", "This Month", "Custom Range"]} />
    <Select label="Payer" value={filters.payer} onChange={(value) => updateFilter("payer", value)} options={["", "AIA", "Muang Thai Life", "Allianz Ayudhya", "FWD"]} names={["All Payers"]} />
    <Select label="Claim Type" value={filters.claimType} onChange={(value) => updateFilter("claimType", value as ClaimDashboardFilters["claimType"])} options={["", "OPD", "IPD", "Accident"]} names={["All Types"]} />
    <Select label="Reviewer" value={filters.reviewer} onChange={(value) => updateFilter("reviewer", value)} options={["", "Arisa K.", "Narin P.", "Chalida S.", "Unassigned"]} names={["All Reviewers"]} />
    {advancedOpen ? <div className="grid gap-3 border-t border-slate-200 pt-3 min-[1500px]:col-span-6 md:col-span-3 md:grid-cols-3"><Select label="Readiness Status" value={filters.readiness} onChange={(value) => updateFilter("readiness", value as ClaimDashboardFilters["readiness"])} options={["", "READY", "NEEDS_REVIEW", "NOT_READY"]} names={["All Readiness", "Ready", "Needs Review", "Not Ready"]} /><Select label="Risk Level" value={filters.risk} onChange={(value) => updateFilter("risk", value as ClaimDashboardFilters["risk"])} options={["", "LOW", "MEDIUM", "HIGH", "CRITICAL"]} names={["All Risk Levels"]} /><Select label="SLA Status" value={filters.sla} onChange={(value) => updateFilter("sla", value as ClaimDashboardFilters["sla"])} options={["", "normal", "warning", "overdue"]} names={["All SLA Status", "Within SLA", "Near Breach", "Overdue"]} /></div> : null}
    <div className="flex justify-end gap-2 min-[1500px]:col-span-6 md:col-span-3"><Button className={button} onClick={() => setAdvancedOpen(!advancedOpen)}><SlidersHorizontal size={15} />Advanced Filters</Button><Button className={button} onClick={reset}>Reset Dashboard View</Button></div>
  </section>;
}

function Select({ label, value, onChange, options, names }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; names?: readonly string[] }) {
  return <label className="text-[11px] font-extrabold uppercase tracking-[.07em] text-slate-600">{label}<select className="mt-1.5 h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={`${label}-${option || "all"}`} value={option}>{names?.[index] ?? option}</option>)}</select></label>;
}

function ActiveChips({ filters, search, heat, payer, evidence, reset }: { filters: ClaimDashboardFilters; search: string; heat: { category: ClaimRiskCategory; severity: ClaimRiskLevel } | null; payer: string; evidence: string; reset: () => void }) {
  const chips = [filters.dateRange, filters.clinic, filters.payer, filters.claimType, filters.reviewer, filters.readiness, filters.risk, filters.sla, search ? `Search: ${search}` : "", heat ? `${heat.category} x ${heat.severity}` : "", payer ? `Payer: ${payer}` : "", evidence ? `Evidence: ${evidence}` : ""].filter(Boolean);
  return <div className="my-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>Active Filters:</span>{chips.map((chip) => <span key={chip} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-900">{chip}</span>)}<Button className="ml-1 inline-flex items-center gap-1 text-xs font-bold text-slate-500" onClick={reset}><X size={13} />Clear</Button></div>;
}

function KpiGrid({ selected, select }: { selected: ClaimKpiFilter; select: (value: ClaimKpiFilter) => void }) {
  const kpis = [
    { key: "all", title: "Today's Visits", value: "18", meta: "+12% vs Yesterday", detail: "90% (18 / 20 Visits) · Normal Volume", progress: 90, icon: CalendarDays },
    { key: "ready", title: "Claim Ready %", value: "76.8%", meta: "958 Ready Cases", detail: "Target 85% · Gap -8.2 pts", progress: 76.8, icon: FileCheck2 },
    { key: "evidence", title: "Pending Evidence", value: "186", meta: "412 missing items · 23 overdue", detail: "<24h 74 · 1-2d 58 · 3-5d 31 · >5d 23", progress: 54, icon: PackageCheck },
    { key: "all", title: "Average Readiness Score", value: "82.4", meta: "16 not assessed", detail: "Target 85", progress: 82.4, icon: ShieldCheck },
    { key: "value", title: "Value at Risk", value: "฿1.84M", meta: "฿620K blocked by evidence gaps", detail: "High and critical exposure", progress: 68, icon: Download },
    { key: "risk", title: "Critical Attention", value: "47", meta: "9 critical blockers · 11 SLA breaches", detail: "Human Review Required", progress: 47, icon: Bell },
  ] as const;
  return <section className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{kpis.map(({ key, title, value, meta, detail, progress, icon: Icon }) => <button key={`${title}-${key}`} className={`${card} min-h-[190px] w-full p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected === key ? "border-blue-500 ring-4 ring-blue-100" : ""}`} onClick={() => select(key)}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={19} /></span><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">Status</span></div><div className="mt-3 text-sm font-bold text-slate-600">{title}</div><div className="mt-1 text-center text-3xl font-extrabold tracking-[-.04em] text-blue-950">{value}</div><div className="mt-3 h-2 rounded-full bg-slate-200"><span className="block h-full rounded-full bg-blue-700" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-xs font-bold text-emerald-700">{meta}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p></button>)}</section>;
}

function SectionTitle({ title, meta }: { title: string; meta: string }) {
  return <div className="mb-3 mt-6 flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold text-blue-950">{title}</h3><span className="text-xs text-slate-500">{meta}</span></div>;
}

function ChartCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return <article className={`${card} min-w-0 p-4`}><div className="mb-3"><h4 className="font-extrabold text-blue-950">{title}</h4><p className="text-[11px] text-slate-500">{desc}</p></div>{children}</article>;
}

function RiskHeatmap({ selected, select }: { selected: { category: ClaimRiskCategory; severity: ClaimRiskLevel } | null; select: (category: ClaimRiskCategory, severity: ClaimRiskLevel) => void }) {
  return <div><div className="grid min-w-[520px] grid-cols-[72px_repeat(6,1fr)] gap-1.5 overflow-x-auto">{["", ...heatCategories].map((label) => <div key={label || "blank"} className="grid min-h-9 place-items-center text-center text-[10px] font-bold text-slate-500">{label}</div>)}{(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as ClaimRiskLevel[]).map((severity) => <div key={severity} className="contents"><div className="grid place-items-center text-[10px] font-bold text-slate-500">{riskStatusConfig[severity].label}</div>{heatmap[severity].map((value, index) => { const category = heatCategories[index]; const active = selected?.category === category && selected.severity === severity; return <button key={`${severity}-${category}`} aria-label={`${category} ${riskStatusConfig[severity].label}: ${value} cases`} className={`min-h-12 rounded-[9px] text-xs font-extrabold text-white transition hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active ? "ring-4 ring-blue-200" : ""}`} style={{ backgroundColor: heatColor(severity, value) }} onClick={() => select(category, severity)}>{value}<span className="sr-only"> cases</span></button>; })}</div>)}</div><SummaryLine items={[["Critical blockers", "9"], ["Reviewed", "71%"]]} /></div>;
}

function StackedQueueChart() {
  return <ResponsiveContainer width="100%" height={360}><BarChart layout="vertical" data={queueData} margin={{ left: 35 }}><CartesianGrid stroke="#E2E8F0" horizontal={false} /><XAxis type="number" /><YAxis dataKey="status" type="category" width={118} tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="Within SLA" stackId="a" fill="#059669" /><Bar dataKey="Near SLA" stackId="a" fill="#D97706" /><Bar dataKey="Overdue" stackId="a" fill="#DC2626" /></BarChart></ResponsiveContainer>;
}

function StackedSlaChart() {
  return <ResponsiveContainer width="100%" height={300}><BarChart data={slaAgingData}><CartesianGrid stroke="#E2E8F0" vertical={false} /><XAxis dataKey="bucket" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Pending Evidence" stackId="a" fill="#F59E0B" /><Bar dataKey="Ready for Review" stackId="a" fill="#2563EB" /><Bar dataKey="In Review" stackId="a" fill="#38BDF8" /><Bar dataKey="Returned" stackId="a" fill="#EA580C" /></BarChart></ResponsiveContainer>;
}

function ParetoCard({ title, data, color, onClick, action }: { title: string; data: ReturnType<typeof makePareto>; color: string; onClick: (category: string) => void; action?: () => void }) {
  return <ChartCard title={title} desc="Cases and cumulative percentage"><ResponsiveContainer width="100%" height={310}><ComposedChart layout="vertical" data={data} margin={{ left: 82 }}><CartesianGrid stroke="#E2E8F0" horizontal={false} /><XAxis type="number" /><YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} /><YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} /><Tooltip /><Legend /><Bar dataKey="Cases" fill={color} radius={[0, 7, 7, 0]} onClick={(entry) => {
    const payload = getChartPayload<{ name?: string }>(entry);
    if (payload?.name) onClick(payload.name);
  }} /><Line dataKey="Cumulative" stroke="#DC2626" strokeWidth={2} yAxisId="right" /></ComposedChart></ResponsiveContainer>{action ? <Button className={button} onClick={action}>Create Tasks</Button> : null}</ChartCard>;
}

function FinancialStrip() {
  const metrics = [["Total Claim Amount", "฿8.54M"], ["Value at Risk", "฿1.84M"], ["Amount Blocked", "฿620K"], ["Average Claim Cost", "฿6,840"], ["Expected Range", "฿4.9K-7.2K"], ["Cost Alerts", "38"], ["Saving Opportunity", "฿482K"], ["High-Cost Outliers", "14"]];
  return <section className="grid gap-2 min-[1500px]:grid-cols-8 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-[13px] border border-slate-200 bg-white p-3"><div className="text-[11px] text-slate-500">{label}</div><div className="mt-1 text-lg font-extrabold text-blue-950">{value}</div></div>)}</section>;
}

function LineChartBlock({ data, currency = false }: { data: Record<string, string | number>[]; currency?: boolean }) {
  return <ResponsiveContainer width="100%" height={290}><LineChart data={data}><CartesianGrid stroke="#E2E8F0" vertical={false} /><XAxis dataKey="week" /><YAxis tickFormatter={(value) => currency ? `฿${Number(value) / 1000}K` : `${value}%`} /><Tooltip /><Legend /><Line dataKey="Actual" stroke="#2563EB" strokeWidth={3} /><Line dataKey="Target" stroke="#059669" strokeDasharray="6 5" dot={false} /><Line dataKey="Benchmark" stroke="#94A3B8" strokeDasharray="6 5" dot={false} /><Line dataKey="Previous Period" stroke="#94A3B8" strokeDasharray="3 4" /></LineChart></ResponsiveContainer>;
}

function SimpleBar({ data }: { data: { bucket: string; Claims: number }[] }) {
  return <ResponsiveContainer width="100%" height={290}><BarChart data={data}><CartesianGrid stroke="#E2E8F0" vertical={false} /><XAxis dataKey="bucket" /><YAxis /><Tooltip /><Bar dataKey="Claims" fill="#2563EB" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer>;
}

function ScatterBlock() {
  return <ResponsiveContainer width="100%" height={290}><ScatterChart><CartesianGrid stroke="#E2E8F0" /><XAxis dataKey="x" name="Expected Cost" tickFormatter={(value) => `฿${Number(value) / 1000}K`} /><YAxis dataKey="y" name="Actual Claim Amount" tickFormatter={(value) => `฿${Number(value) / 1000}K`} /><Tooltip formatter={(value) => money.format(Number(value))} /><Scatter data={outliers} fill="#EA580C" /></ScatterChart></ResponsiveContainer>;
}

function AiActionQueue({ action }: { action: (label: string) => void }) {
  const items = [["P1 Critical", "CLM-2026-01074", "Clinical Safety Review", "Critical clinical risk · ฿48,200 exposure · SLA overdue 3h · Confidence 94%", "border-red-600"], ["P2 High", "CLM-2026-01044", "Review Coverage Eligibility", "Waiting Period and Coverage Rule require Human Review · ฿67,500 exposure", "border-orange-600"], ["P3 Standard", "CLM-2026-01031", "Request Cost Justification", "Supporting rationale missing · Near SLA breach · Confidence 88%", "border-blue-600"]];
  return <section className={`${card} p-4`}><h3 className="font-extrabold text-blue-950">AI Priority Action Queue</h3><p className="mt-1 text-xs text-slate-500">ข้อเสนอแนะจาก AI ใช้เพื่อสนับสนุนการตรวจสอบเท่านั้น การตัดสินใจขั้นสุดท้ายต้องได้รับการยืนยันจากผู้มีอำนาจ</p><div className="mt-3 grid gap-3">{items.map(([priority, claim, title, meta, border]) => <article key={claim} className={`rounded-xl border border-slate-200 border-l-4 ${border} p-3`}><div className="flex justify-between gap-2"><div><div className="text-sm font-extrabold">{priority} · {claim}</div><div className="mt-1 text-sm font-bold">{title}</div></div><span className="h-fit rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-extrabold text-blue-700">Human Review</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{meta}</p><div className="mt-3 flex flex-wrap gap-2">{["Review Case", "Assign Reviewer", "Create Task", "Audit Trail"].map((label) => <Button key={label} className={`${button} min-h-8 px-2 py-1 text-[11px]`} onClick={() => action(label)}>{label}</Button>)}</div></article>)}</div></section>;
}

function RecentActivity({ filter, setFilter }: { filter: string; setFilter: (value: string) => void }) {
  const entries = [["Readiness recalculated", "CLM-2026-01082 · 91 to 94 · Source: AI Engine", "5 min"], ["Evidence uploaded", "Medical certificate added · Actor: Clinic Staff", "12 min"], ["Reviewer assigned", "Narin P. assigned to CLM-2026-01061", "22 min"], ["Risk acknowledgement", "Coverage risk retained with reviewer note", "31 min"], ["Claim submitted", "CLM-2026-01055 submitted to Muang Thai Life", "44 min"], ["Manual override", "Economic alert overridden with justification", "1h"]];
  return <section className={`${card} p-4`}><div className="flex items-start justify-between gap-2"><div><h3 className="font-extrabold text-blue-950">Recent Activity</h3><p className="text-xs text-slate-500">Audit-ready event stream</p></div><select className="h-9 rounded-[10px] border border-slate-200 text-xs" value={filter} onChange={(event) => setFilter(event.target.value)}>{["All Activities", "Assignments", "Status Changes", "Evidence", "AI Actions", "Overrides"].map((item) => <option key={item}>{item}</option>)}</select></div><ul className="mt-3 grid gap-3">{entries.map(([title, desc, time]) => <li key={title} className="grid grid-cols-[34px_1fr_auto] gap-3 border-b border-slate-100 pb-3 last:border-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-blue-700"><ShieldCheck size={15} /></span><span><strong className="block text-xs">{title}</strong><span className="text-[11px] text-slate-500">{desc} · <button className="font-bold text-blue-700">View Audit Detail</button></span></span><span className="text-[11px] text-slate-500">{time}</span></li>)}</ul></section>;
}

function AiPerformanceSummary() {
  return <section className={`${card} grid grid-cols-2 gap-3 p-4 sm:grid-cols-5 xl:grid-cols-1`}><h3 className="col-span-full font-extrabold text-blue-950">AI Performance Summary</h3>{[["AI Assisted Cases", "742"], ["Acceptance Rate", "84%"], ["Human Review Required", "47"], ["Estimated Time Saved", "126h"], ["Override Rate", "6.2%"]].map(([label, value]) => <div key={label}><div className="text-[11px] text-slate-500">{label}</div><div className="text-lg font-extrabold text-blue-950">{value}</div></div>)}</section>;
}

function ClaimWorklist({ refEl, rows, allRows, selected, setSelected, search, setSearch, reset, refresh }: { refEl: React.RefObject<HTMLElement | null>; rows: ClaimWorklistItem[]; allRows: ClaimWorklistItem[]; selected: Set<string>; setSelected: (ids: Set<string>) => void; search: string; setSearch: (value: string) => void; reset: () => void; refresh: () => void }) {
  const visibleIds = rows.map((row) => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(visibleIds) : new Set());
  const toggleOne = (id: string, checked: boolean) => { const next = new Set(selected); if (checked) next.add(id); else next.delete(id); setSelected(next); };
  return <section ref={refEl} className={`${card} mt-4 w-full overflow-hidden`}><div className="border-b border-slate-200 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h3 className="font-extrabold text-blue-950">Claim Worklist</h3><p className="text-xs text-slate-500">Showing {rows.length} of {allRows.length} claim cases · รายการเคลมที่ต้องดำเนินการ</p></div><label className="flex w-full items-center gap-2 rounded-[10px] border border-slate-200 px-3 py-2 md:max-w-md"><Search size={16} className="text-slate-500" /><span className="sr-only">Search worklist</span><Input className="w-full text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Claim, Visit, patient, payer, ICD-10" /></label></div></div><div className="max-h-[620px] w-full overflow-x-auto overflow-y-auto"><table className="w-full min-w-[1180px] table-auto border-collapse text-left text-xs 2xl:min-w-0"><thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[.05em] text-slate-600"><tr>{["", "Claim / Visit ID", "Patient Context", "Payer", "Readiness", "Missing Evidence", "Risk", "Claim Amount", "Assignee", "SLA", "Status", "Action"].map((head) => <th key={head || "select"} className="border-b border-slate-200 px-3 py-3">{head ? head : <Checkbox aria-label="Select all visible claims" checked={allVisibleSelected} onChange={(event) => toggleAll(event.currentTarget.checked)} />}</th>)}</tr></thead><tbody>{rows.map((item) => <tr key={item.id} className={`hover:bg-blue-50/45 ${priorityClass(item)}`}><td className="border-b border-slate-100 px-3 py-3"><Checkbox aria-label={`Select ${item.id}`} checked={selected.has(item.id)} onChange={(event) => toggleOne(item.id, event.currentTarget.checked)} /></td><td className="border-b border-slate-100 px-3 py-3"><strong className="text-blue-800">{item.id}</strong><div className="text-[11px] text-slate-500">{item.visitId}</div></td><td className="border-b border-slate-100 px-3 py-3">{item.patientName}<div className="text-[11px] text-slate-500">{item.maskedHn} · {item.clinic}</div></td><td className="border-b border-slate-100 px-3 py-3">{item.payer}<div className="text-[11px] text-slate-500">{item.claimType}</div></td><td className="border-b border-slate-100 px-3 py-3"><Badge className={readinessStatusConfig[item.readiness].className}>{item.readinessScore} · {readinessStatusConfig[item.readiness].label}</Badge></td><td className="border-b border-slate-100 px-3 py-3">{item.missingEvidenceCount ? <><Badge className="border-amber-200 bg-amber-50 text-amber-700">{item.missingEvidenceCount} missing</Badge><div className="mt-1 text-[11px] text-slate-500">{item.missingEvidence[0]}</div></> : <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Complete</Badge>}</td><td className="border-b border-slate-100 px-3 py-3"><Badge className={riskStatusConfig[item.risk].className}>{riskStatusConfig[item.risk].label}</Badge><div className="mt-1 text-[11px] text-slate-500">{item.riskCategory}</div></td><td className="border-b border-slate-100 px-3 py-3 font-bold">{money.format(item.claimAmount)}</td><td className="border-b border-slate-100 px-3 py-3">{item.assignee ?? "Unassigned"}</td><td className="border-b border-slate-100 px-3 py-3"><Badge className={slaStatusConfig[item.slaStatus].className}>{item.slaLabel}</Badge></td><td className="border-b border-slate-100 px-3 py-3"><Badge className={workflowStatusConfig[item.status].className}>{workflowStatusConfig[item.status].label}</Badge></td><td className="border-b border-slate-100 px-3 py-3"><Button className={iconButton} aria-label={`Open actions for ${item.id}`}><MoreHorizontal size={16} /></Button></td></tr>)}</tbody></table>{rows.length === 0 ? <div className="p-8 text-center text-sm text-slate-500"><strong>No claim cases match the current filters.</strong><br />ไม่พบรายการเคลมตามเงื่อนไขที่เลือก<div className="mt-3 flex justify-center gap-2"><Button className={button} onClick={reset}>Clear filters</Button><Button className={button} onClick={refresh}>Refresh data</Button></div></div> : null}</div><div className="flex items-center justify-between border-t border-slate-200 p-4 text-xs text-slate-500"><span>Page 1 of 1</span><span>Pagination ready for backend results</span></div></section>;
}

function BulkBar({ count, assign, task, recalc, exportData }: { count: number; assign: () => void; task: () => void; recalc: () => void; exportData: () => void }) {
  if (!count) return null;
  return <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-2xl bg-blue-950 px-4 py-3 text-white shadow-2xl"><strong className="whitespace-nowrap text-sm">{count} selected</strong>{[["Assign Reviewer", assign], ["Create Evidence Task", task], ["Recalculate", recalc], ["Export", exportData]].map(([label, fn]) => <Button key={label as string} className="min-h-9 whitespace-nowrap rounded-lg bg-white px-3 text-xs font-bold text-blue-950" onClick={fn as () => void}>{label as string}</Button>)}</div>;
}

function AssignDialog({ open, claimIds, close, success }: { open: boolean; claimIds: string[]; close: () => void; success: (reviewer: AssignReviewerFormValues["reviewer"]) => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AssignReviewerFormValues>({ resolver: zodResolver(assignReviewerSchema), defaultValues: { reviewer: "Arisa K.", reason: "" } });
  useEffect(() => { if (!open) reset({ reviewer: "Arisa K.", reason: "" }); }, [open, reset]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-title"><form className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-2xl" onSubmit={handleSubmit((values) => success(values.reviewer))}><div className="flex items-start justify-between gap-3"><div><h3 id="assign-title" className="text-lg font-extrabold text-blue-950">Assign Reviewer</h3><p className="text-sm text-slate-500">Assign {claimIds.length} selected claim(s). การมอบหมายนี้เป็น mock local action</p></div><Button className={iconButton} onClick={close} aria-label="Close dialog"><X size={17} /></Button></div><label className="mt-4 block text-xs font-bold text-slate-600">Reviewer<select className="mt-1 h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm" {...register("reviewer")} autoFocus><option>Arisa K.</option><option>Narin P.</option><option>Chalida S.</option></select></label><label className="mt-4 block text-xs font-bold text-slate-600">Assignment Reason<textarea className="mt-1 min-h-24 w-full rounded-[10px] border border-slate-200 px-3 py-2 text-sm" {...register("reason")} /></label>{errors.reason ? <p className="mt-1 text-sm font-semibold text-red-600">{errors.reason.message}</p> : null}<div className="mt-5 flex justify-end gap-2"><Button className={button} onClick={close}>Cancel</Button><Button className={primaryButton} type="submit">Assign Reviewer</Button></div></form></div>;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-extrabold ${className}`}>{children}</span>;
}

function SummaryLine({ items }: { items: [string, string][] }) {
  return <div className="mt-3 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{items.map(([label, value]) => <span key={label}>{label}: <strong className="text-slate-900">{value}</strong></span>)}</div>;
}

function makePareto(labels: string[], values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let running = 0;
  return labels.map((name, index) => {
    running += values[index];
    return { name, Cases: values[index], Cumulative: Number(((running / total) * 100).toFixed(1)) };
  });
}

function heatColor(severity: ClaimRiskLevel, value: number) {
  if (severity === "CRITICAL") return `rgba(220,38,38,${0.5 + Math.min(value / 25, 0.45)})`;
  if (severity === "HIGH") return `rgba(234,88,12,${0.38 + Math.min(value / 35, 0.5)})`;
  if (severity === "MEDIUM") return `rgba(217,119,6,${0.28 + Math.min(value / 130, 0.5)})`;
  return `rgba(5,150,105,${0.35 + Math.min(value / 180, 0.35)})`;
}

function priorityClass(item: ClaimWorklistItem) {
  if (item.risk === "CRITICAL") return "shadow-[inset_4px_0_0_#DC2626]";
  if (item.risk === "HIGH") return "shadow-[inset_4px_0_0_#EA580C]";
  if (item.slaStatus === "warning") return "shadow-[inset_4px_0_0_#D97706]";
  if (item.readiness === "READY") return "shadow-[inset_4px_0_0_#059669]";
  return "shadow-[inset_4px_0_0_#2563EB]";
}

function getChartPayload<TPayload>(entry: unknown): TPayload | null {
  if (!entry || typeof entry !== "object" || !("payload" in entry)) return null;
  return (entry as { payload?: TPayload }).payload ?? null;
}
