"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  BadgeCheck,
  Bell,
  Bot,
  BrainCircuit,
  Building2,
  CalendarClock,
  Clock3,
  Download,
  FileBarChart,
  FileHeart,
  FileWarning,
  Gauge,
  Hospital,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Menu,
  NotebookPen,
  PackageCheck,
  Pill,
  Presentation,
  ScanSearch,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerOff,
  TriangleAlert,
  UserCog,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  chartColors,
  dataHealthConfig,
  defaultDashboardFilters,
  priorityConfig,
  readinessStatusConfig,
  riskLevelConfig,
  slaStatusConfig,
} from "../constants/executive-dashboard.constants";
import { executiveCaseWorklist } from "../data/executive-dashboard-mock";
import { createReviewTaskSchema, type CreateReviewTaskFormValues } from "../schemas/executive-dashboard-schema";
import {
  createCaseExportCsv,
  createReviewTask,
  dismissRecommendation,
  filterCases,
  getExecutiveCases,
  getExecutiveDashboard,
} from "../services/executive-dashboard-service";
import type {
  CaseWorklistItem,
  ClaimReadinessStatus,
  DashboardFilters,
  ExecutiveDashboardResponse,
  Recommendation,
  RiskLevel,
  SortDirection,
  SortKey,
} from "../types/executive-dashboard.types";
import { formatCurrencyTHB, formatDateTime, formatPercentagePoint, formatRelativeTime } from "../utils/dashboard-formatters";

const cardClass = "rounded-lg border border-[#E2E8F0] bg-white shadow-sm";
const selectClass = "mt-1 h-9 w-full min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-950 outline-none focus:ring-4 focus:ring-blue-100";
const iconMap = [Users, BadgeCheck, Gauge, TriangleAlert, FileWarning, WalletCards];
const heatmapStyles: Record<RiskLevel, string> = {
  low: "border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
  medium: "border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-200",
  high: "border-orange-200 bg-orange-100 text-orange-900 hover:bg-orange-200",
  critical: "border-red-200 bg-red-100 text-red-900 hover:bg-red-200",
};

export function ExecutiveDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({ ...defaultDashboardFilters });
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>({ ...defaultDashboardFilters });
  const [dashboard, setDashboard] = useState<ExecutiveDashboardResponse | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [economicTab, setEconomicTab] = useState<"trend" | "waterfall" | "drivers">("trend");
  const [presentationMode, setPresentationMode] = useState(false);
  const [toast, setToast] = useState("");
  const [dialogCaseIds, setDialogCaseIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [casePage, setCasePage] = useState<{ items: CaseWorklistItem[]; total: number; totalPages: number }>({ items: [], total: 0, totalPages: 1 });
  const worklistRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    getExecutiveDashboard(filters).then((result) => {
      setDashboard(result);
      setRecommendations(result.recommendations);
    });
  }, [filters]);

  useEffect(() => {
    getExecutiveCases({ filters, search, sortKey, sortDirection, page, pageSize: 6 }).then((result) => {
      setCasePage({ items: result.items, total: result.total, totalPages: result.totalPages });
      setSelectedIds((current) => current.filter((id) => result.items.some((item) => item.id === id)));
    });
  }, [filters, page, search, sortDirection, sortKey]);

  const activeFilterCount = Object.entries(draftFilters).filter(([key, value]) => key !== "dateRange" && value).length;
  const filteredForExport = useMemo(() => filterCases(executiveCaseWorklist, filters, search), [filters, search]);

  if (!dashboard) return <DashboardSkeleton />;

  const health = dataHealthConfig[dashboard.dataHealth];

  function applyFilters(nextFilters = draftFilters) {
    setFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPage(1);
    showToast("Dashboard filters applied. Mock KPIs remain summary-level where recalculation is unsupported.");
  }

  function resetFilters() {
    const next = { ...defaultDashboardFilters };
    setDraftFilters(next);
    applyFilters(next);
    setSearch("");
  }

  function updateFilter<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function drillDown(partial: Partial<DashboardFilters>) {
    const next = { ...filters, ...partial };
    setDraftFilters(next);
    applyFilters(next);
    worklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleSort(key: SortKey) {
    setSortKey(key);
    setSortDirection((current) => (sortKey === key && current === "asc" ? "desc" : "asc"));
  }

  function exportCases() {
    const csv = createCaseExportCsv(filteredForExport);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `med-ai-nexsure-executive-cases-2026-07-13.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("CSV export prepared for the currently filtered worklist.");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC] text-[#0F172A]">
      <DashboardStyle />
      <div className="grid min-h-screen w-full grid-cols-1 xl:grid-cols-[276px_minmax(0,1fr)]">
        <ExecutiveSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className={`w-full min-w-0 flex-1 ${presentationMode ? "presentation-mode" : ""}`}>
          <ExecutiveGlobalHeader onOpenMenu={() => setMobileOpen(true)} onAction={showToast} />
          <div className="w-full space-y-4 px-4 py-4 md:px-6 md:py-6 xl:px-8">
      {toast ? <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl" role="status">{toast}</div> : null}

      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Executive Dashboard</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Executive Healthcare & Insurance Intelligence</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Unified executive view of operational performance, claim readiness, evidence quality, financial variance, AI impact, and compliance risk.
              <br />
              ภาพรวมสำหรับผู้บริหารเพื่อค้นหาความเสี่ยง สาเหตุ และงานที่ควรดำเนินการก่อน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
              <span className="block text-slate-500">Last updated</span>
              <strong className="text-sm">{formatDateTime(dashboard.generatedAt)}</strong>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${health.className}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-current" /> {health.label} <span className="sr-only">{health.thaiLabel}</span>
            </div>
            <Button onClick={exportCases} className="btn-secondary">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setPresentationMode((value) => !value)} className="btn-primary">
              <Presentation className="h-4 w-4" /> {presentationMode ? "Exit" : "Presentation"}
            </Button>
          </div>
        </div>
      </header>

      {!presentationMode ? (
        <section className={`${cardClass} p-3`} aria-label="Global filters">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterSelect label="Date Range" value={draftFilters.dateRange} onChange={(value) => updateFilter("dateRange", value)} options={["Last 30 Days", "Last 7 Days", "Last 90 Days", "Last 12 Months"].map((item) => [item, item])} />
            <FilterSelect label="Clinic" value={draftFilters.clinicId ?? ""} onChange={(value) => updateFilter("clinicId", value || null)} options={[["", "All Clinics"], ...dashboard.filters.clinics.map((item) => [item.id, item.name] as [string, string])]} />
            <FilterSelect label="Department" value={draftFilters.departmentId ?? ""} onChange={(value) => updateFilter("departmentId", value || null)} options={[["", "All Departments"], ...dashboard.filters.departments.map((item) => [item.id, item.name] as [string, string])]} />
            <FilterSelect label="Payer" value={draftFilters.payerId ?? ""} onChange={(value) => updateFilter("payerId", value || null)} options={[["", "All Payers"], ...dashboard.filters.payers.map((item) => [item.id, item.name] as [string, string])]} />
            <FilterSelect label="Claim Status" value={draftFilters.claimStatus ?? ""} onChange={(value) => updateFilter("claimStatus", (value || null) as ClaimReadinessStatus | null)} options={[["", "All Statuses"], ["ready", "Ready"], ["needs_review", "Needs Review"], ["not_ready", "Not Ready"]]} />
            <FilterSelect label="Risk Level" value={draftFilters.riskLevel ?? ""} onChange={(value) => updateFilter("riskLevel", (value || null) as RiskLevel | null)} options={[["", "All Risk Levels"], ["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]]} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={resetFilters} className="btn-secondary">Reset</Button>
            <Button onClick={() => applyFilters()} className="btn-primary">Apply Filters <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5">{activeFilterCount}</span></Button>
          </div>
        </section>
      ) : null}

      <section className="flex items-start gap-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3.5 text-[#1E3A8A]">
        <div className="rounded-full bg-white p-2 shadow-sm"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h2 className="font-bold">Decision-Support Boundary</h2>
          <p className="mt-0.5 text-sm leading-6">AI supports prioritization only. Final clinical, financial, insurance, and compliance decisions require authorized human review and remain fully auditable.</p>
          <p className="text-xs text-[#1E3A8A]/75">AI ช่วยวิเคราะห์และจัดลำดับงาน มนุษย์ผู้มีอำนาจเป็นผู้ตัดสินใจขั้นสุดท้าย</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6" aria-label="Executive KPI Overview">
        {dashboard.kpis.map((kpi, index) => {
          const Icon = iconMap[index] ?? Gauge;
          return <KpiCard key={kpi.id} kpi={kpi} icon={<Icon className="h-5 w-5" />} />;
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[Bot, ListTodo, TimerOff, Clock3].map((Icon, index) => (
          <div key={dashboard.secondaryMetrics[index].id} className={`${cardClass} flex items-center gap-3 p-4`}>
            <span className="rounded-xl bg-blue-50 p-2 text-[#2563EB]"><Icon className="h-5 w-5" /></span>
            <div><p className="text-xs text-slate-500">{dashboard.secondaryMetrics[index].label}</p><strong className="text-xl">{dashboard.secondaryMetrics[index].value}</strong><p className="text-xs text-slate-500">{dashboard.secondaryMetrics[index].helperText}</p></div>
          </div>
        ))}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <ChartCard title="Claim Readiness Overview" subtitle="สัดส่วนความพร้อมของเคสทั้งหมด" className="xl:col-span-4" summary="Claim readiness is 72 percent. Ninety-two cases are ready, twenty-seven need review, and nine are not ready.">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={dashboard.readinessComposition} dataKey="value" nameKey="label" innerRadius={70} outerRadius={100} onClick={(data) => drillDown({ claimStatus: (data as unknown as { status: ClaimReadinessStatus }).status })}>
                {dashboard.readinessComposition.map((item) => <Cell key={item.status} fill={item.status === "ready" ? chartColors.success : item.status === "needs_review" ? chartColors.warning : chartColors.danger} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-[#1E3A8A]"><b>Insight:</b> 92 of 128 cases are ready; 36 cases still require intervention.</p>
        </ChartCard>
        <ChartCard title="Claim Readiness Performance" subtitle="Actual versus target and previous period" className="xl:col-span-8" summary="Actual readiness is improving but remains below the 85 percent target.">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {["Current 72%", "Target Gap -13 pp", "Trend Improving", "Best Clinic BKK A"].map((item) => <div key={item} className="rounded-xl bg-slate-50 p-3 font-semibold">{item}</div>)}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dashboard.readinessTrend}>
              <CartesianGrid stroke={chartColors.border} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Area dataKey="actual" name="Actual Readiness" stroke={chartColors.ai} fill="rgba(37,99,235,.10)" />
              <Line dataKey="target" name="Target 85%" stroke={chartColors.executive} strokeDasharray="6 4" dot={false} />
              <Line dataKey="previous" name="Previous Period" stroke={chartColors.muted} strokeDasharray="3 4" />
              <ReferenceLine x="3 Jul" label="SOAP template updated" stroke={chartColors.warning} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <ChartCard title="Visit & Operational Trend" subtitle="Actual volume, capacity, and prior period" className="xl:col-span-7" summary="Friday is the peak day with 188 visits, above operational capacity.">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboard.visitTrend}>
              <CartesianGrid stroke={chartColors.border} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area dataKey="actual" name="Actual Visits" stroke={chartColors.ai} fill="rgba(37,99,235,.12)" />
              <Line dataKey="capacity" name="Operational Capacity" stroke={chartColors.executive} strokeDasharray="6 4" />
              <Line dataKey="previous" name="Previous Period" stroke={chartColors.muted} strokeDasharray="3 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <section className={`${cardClass} p-5 xl:col-span-5`}>
          <h2 className="text-xl font-bold">Queue Snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">Queue volume, overdue workload, and oldest case</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <QueueList title="Operational Queue" items={dashboard.operationalQueue} onClick={drillDown} />
            <QueueList title="Claim Review Queue" items={dashboard.claimQueue} onClick={drillDown} />
          </div>
        </section>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <ChartCard title="Missing Evidence Pareto" subtitle="Affected cases, cumulative share, and expected delay" className="xl:col-span-7" summary="Attachments, SOAP Note, Diagnosis and payer documents make up most missing evidence gaps.">
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={dashboard.evidencePareto}>
              <CartesianGrid stroke={chartColors.border} />
              <XAxis dataKey="category" interval={0} angle={-18} textAnchor="end" height={70} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value, name) => name === "Cumulative %" ? `${value}%` : value} />
              <Legend />
              <Bar yAxisId="left" dataKey="affectedCases" name="Affected cases" fill={chartColors.ai} onClick={(data) => drillDown({ missingEvidenceCategory: (data as unknown as { category: string }).category })} />
              <Line yAxisId="right" dataKey="cumulative" name="Cumulative %" stroke={chartColors.danger} />
              <ReferenceLine yAxisId="right" y={80} stroke={chartColors.warning} label="80%" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <section className={`${cardClass} p-5 xl:col-span-5`}>
          <h2 className="text-xl font-bold">Risk & Compliance Heatmap</h2>
          <p className="mt-1 text-sm text-slate-500">Keyboard-accessible matrix by clinical severity and financial impact</p>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Risk heatmap legend">
            {(["low", "medium", "high", "critical"] as const).map((level) => (
              <span key={level} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${heatmapStyles[level]}`}>
                {riskLevelConfig[level].label}
              </span>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="grid min-w-[520px] grid-cols-4 gap-2">
              {dashboard.riskHeatmap.map((cell) => (
                <button key={`${cell.clinicalSeverity}-${cell.financialImpact}`} type="button" onClick={() => drillDown({ riskLevel: cell.clinicalSeverity })} title={`${riskLevelConfig[cell.clinicalSeverity].label} clinical severity, ${riskLevelConfig[cell.financialImpact].label} financial impact`} aria-label={`${cell.cases} cases. ${riskLevelConfig[cell.clinicalSeverity].label} clinical severity and ${riskLevelConfig[cell.financialImpact].label} financial impact`} className={`min-h-20 rounded-xl border p-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100 ${heatmapStyles[cell.clinicalSeverity]}`}>
                  <strong className="text-lg">{cell.cases}</strong>
                  <span className="block text-xs font-semibold opacity-85">{riskLevelConfig[cell.clinicalSeverity].label} clinical</span>
                  <span className="block text-xs font-semibold opacity-85">{riskLevelConfig[cell.financialImpact].label} financial</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-red-50 p-3"><b>฿1.26M</b><p>High-risk exposure</p></div><div className="rounded-xl bg-amber-50 p-3"><b>3</b><p>Consent alerts</p></div></div>
        </section>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <ChartCard title="Economic Intelligence" subtitle="Cost trend, variance waterfall, and cost drivers" className="xl:col-span-7" summary="Average visit cost is above benchmark and requires finance review.">
          <div className="flex flex-wrap gap-2">
            {(["trend", "waterfall", "drivers"] as const).map((tab) => <Button key={tab} onClick={() => setEconomicTab(tab)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${economicTab === tab ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700"}`}>{tab === "trend" ? "Cost Trend" : tab === "waterfall" ? "Variance Waterfall" : "Cost Drivers"}</Button>)}
          </div>
          <EconomicChart tab={economicTab} data={dashboard.economic} />
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Review warning: actual cost is {dashboard.economic.variancePercent}% above benchmark.</p>
        </ChartCard>
        <ChartCard title="Clinic Performance Matrix" subtitle="Readiness, cost, and visit volume by clinic" className="xl:col-span-5" summary="Bangkok Clinic A is above readiness target and below cost benchmark.">
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart>
              <CartesianGrid stroke={chartColors.border} />
              <XAxis dataKey="readiness" type="number" name="Claim Ready %" domain={[45, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="averageCost" type="number" name="Average Visit Cost" tickFormatter={(value) => `฿${value}`} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => name === "averageCost" ? formatCurrencyTHB(Number(value)) : value} />
              <ReferenceLine x={85} stroke={chartColors.executive} label="Target 85%" />
              <ReferenceLine y={2750} stroke={chartColors.warning} label="Benchmark" />
              <Scatter data={dashboard.clinicPerformance} fill={chartColors.ai} onClick={(data) => drillDown({ clinicId: (data as unknown as { clinicId: string }).clinicId })} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <ChartCard title="AI Impact & Governance" subtitle="AI-assisted versus non-AI-assisted outcomes" className="xl:col-span-5" summary="AI-assisted cases show higher readiness and completeness. Human acceptance has no non-AI comparison.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.aiImpact} layout="vertical">
              <CartesianGrid stroke={chartColors.border} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="metric" width={135} />
              <Tooltip formatter={(value) => value === null ? "N/A" : `${value}%`} />
              <Legend />
              <Bar dataKey="aiAssisted" name="AI-Assisted" fill={chartColors.ai} />
              <Bar dataKey="nonAiAssisted" name="Non-AI-Assisted" fill="#CBD5E1" />
            </BarChart>
          </ResponsiveContainer>
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-[#1E3A8A]">AI recommendations require authorized human validation. Override and acceptance actions are recorded in the audit trail.</p>
        </ChartCard>
        <section className={`${cardClass} p-5 xl:col-span-7`}>
          <h2 className="text-xl font-bold">Prioritized AI Recommendation Queue</h2>
          <div className="mt-4 space-y-3">
            {recommendations.length ? recommendations.map((item) => (
              <article key={item.id} className={`rounded-2xl border p-4 ${item.priority === "P1" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40"}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold">{item.priority}</span><h3 className="mt-2 font-bold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.reason}</p><p className="mt-2 text-xs text-slate-600">{item.affectedCases} cases · Impact: {item.expectedImpact} · Owner: {item.owner} · Due: {item.dueDate} · Confidence: {item.confidence}%</p><p className="mt-2 text-xs font-semibold text-[#1E3A8A]">Pending Human Validation · Audit logging enabled</p></div>
                  <div className="flex shrink-0 flex-wrap gap-2"><Button onClick={() => drillDown({})} className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold">View Cases</Button><Button onClick={() => setDialogCaseIds(filteredForExport.map((caseItem) => caseItem.id))} className="rounded-lg bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white">Create Task</Button><Button onClick={() => { dismissRecommendation(item.id, "Executive dismissed in MVP"); setRecommendations((current) => current.filter((rec) => rec.id !== item.id)); showToast("Recommendation dismissed with audit placeholder."); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500">Dismiss</Button></div>
                </div>
              </article>
            )) : <EmptyState title="No recommendations" />}
          </div>
        </section>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className={`${cardClass} p-5 xl:col-span-5`}>
          <h2 className="text-xl font-bold">Risk & Compliance Alerts</h2>
          <div className="mt-4 space-y-3">
            {dashboard.alerts.map((alert) => <article key={alert.id} className={`rounded-xl border p-3 ${riskLevelConfig[alert.severity].className}`}><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase">{riskLevelConfig[alert.severity].label}</span><h3 className="font-bold">{alert.title}</h3><p className="text-xs">{alert.affectedCount} affected cases · {alert.owner} · {formatRelativeTime(alert.timestamp)}</p></div><Button onClick={() => { setAcknowledgedAlerts((ids) => [...ids, alert.id]); showToast("Alert acknowledged and audit event placeholder preserved."); }} className="rounded-lg bg-white/80 px-3 py-2 text-xs font-bold">{acknowledgedAlerts.includes(alert.id) ? "Acknowledged" : alert.status}</Button></div></article>)}
          </div>
        </section>
        <section className={`${cardClass} p-5 xl:col-span-7`}>
          <h2 className="text-xl font-bold">Executive Activity Feed</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {dashboard.activity.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{item.severity}</span><span className="text-xs text-slate-400">{formatRelativeTime(item.timestamp)}</span></div><h3 className="mt-2 font-bold">{item.eventType}</h3><p className="mt-1 text-xs text-slate-500">{item.actorRole} · {item.entityId}</p></article>)}
          </div>
        </section>
      </section>

      <section ref={worklistRef} className={`${cardClass} mt-5 overflow-hidden`} aria-label="Case Worklist">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-xl font-bold">Case Worklist</h2><p className="text-sm text-slate-500">No PHI or patient-identifiable data is shown in this executive view.</p></div>
            <div className="flex flex-wrap gap-2"><Button onClick={() => setDialogCaseIds(selectedIds)} className="min-h-11 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white">Bulk Task ({selectedIds.length})</Button><Button onClick={resetFilters} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold">Clear Filters</Button></div>
          </div>
          <label className="relative mt-4 block max-w-xl"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100" placeholder="Search visit, clinic, payer, owner, evidence, or risk reason" /></label>
        </div>
        {casePage.total ? <CaseTable items={casePage.items} selectedIds={selectedIds} onSelect={setSelectedIds} onSort={toggleSort} onOpen={(id) => setDialogCaseIds([id])} /> : <EmptyState title="No cases match the selected filters." subtitle="ไม่พบรายการตามตัวกรองที่เลือก กรุณาปรับเงื่อนไขและลองอีกครั้ง" />}
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{casePage.total} cases · Page {page} of {casePage.totalPages}</span><div className="flex gap-2"><Button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-3 py-2 disabled:opacity-50">Previous</Button><Button disabled={page === casePage.totalPages} onClick={() => setPage((value) => Math.min(casePage.totalPages, value + 1))} className="rounded-lg border px-3 py-2 disabled:opacity-50">Next</Button></div></div>
      </section>

      <footer className="mt-5 grid gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs font-semibold text-slate-500 md:grid-cols-5">
        <span>Synthetic data</span><span>Role-based view</span><span>Audit logging enabled</span><span>Human review required</span><span>PDPA-conscious display</span>
      </footer>

      {dialogCaseIds.length ? <CreateTaskDialog caseIds={dialogCaseIds} onClose={() => setDialogCaseIds([])} onSuccess={(message) => showToast(message)} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardStyle() {
  return (
    <style>{`
      .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:2.5rem;border-radius:.5rem;background:#1E3A8A;padding:.5rem .8rem;font-size:.75rem;font-weight:900;color:#fff;white-space:nowrap}
      .btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:2.25rem;border-radius:.5rem;border:1px solid #E2E8F0;background:#fff;padding:.45rem .7rem;font-size:.75rem;font-weight:900;color:#334155;white-space:nowrap}
      .icon-btn{display:inline-flex;height:2.5rem;width:2.5rem;align-items:center;justify-content:center;border-radius:.5rem;border:1px solid #E2E8F0;background:#fff;color:#475569}
      .btn-primary:focus-visible,.btn-secondary:focus-visible,.icon-btn:focus-visible,button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid rgba(37,99,235,.28);outline-offset:2px}
      @media (prefers-reduced-motion: reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
    `}</style>
  );
}

function ExecutiveSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const groups = [
    { title: "Workspace", links: [["/clinic-dashboard", "Clinic Dashboard", LayoutDashboard, ""], ["/dashboard", "Executive Dashboard", Users, "active"], ["/visit-management", "Visit Management", CalendarClock, ""], ["/soap-note", "SOAP Note", NotebookPen, ""], ["/ai-clinical-engine", "AI Clinical Insight", BrainCircuit, ""], ["/soap-note", "Diagnosis", Stethoscope, ""], ["/prescription", "Prescription", Pill, ""], ["/medical-certificate", "Medical Certificate", FileHeart, ""]] },
    { title: "Insurance Intelligence", links: [["/claim-readiness", "Claim Readiness", ShieldCheck, ""], ["/evidence-package", "Evidence Package", PackageCheck, ""], ["/insurance-intelligence", "Insurance Intelligence", ScanSearch, ""], ["/economic-intelligence", "Economic Intelligence", FileBarChart, ""], ["/payer-rules", "Reports", FileBarChart, ""]] },
    { title: "Administration", links: [["/admin/organizations", "Organization Management", Building2, ""], ["/admin/clinics", "Clinic Management", Hospital, ""], ["/admin/users", "User Management", UserCog, ""], ["/admin/roles", "Role Management", KeyRound, ""], ["/admin/settings", "Admin Settings", Settings, ""], ["/audit-compliance", "Audit & Compliance", ScrollText, ""]] },
  ] as const;

  return (
    <>
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[276px] overflow-y-auto bg-gradient-to-b from-[#0F2A5F] to-[#1E3A8A] p-4 text-blue-100 transition xl:sticky xl:top-0 xl:h-screen xl:translate-x-0`}>
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white shadow-lg"><Activity /></div>
            <div><div className="font-black text-white">Med AI NexSure</div><div className="text-xs font-bold text-sky-300">Enterprise Intelligence</div></div>
          </div>
          <button className="xl:hidden" aria-label="Close navigation" onClick={onClose}><X /></button>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <div className="px-3 pb-2 pt-4 text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">{group.title}</div>
            {group.links.map(([href, label, Icon, badge]) => (
              <Link key={`${href}-${label}`} href={href} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold ${badge === "active" ? "border border-white/15 bg-white/10 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}>
                <Icon size={17} /><span>{label}</span>
              </Link>
            ))}
          </nav>
        ))}
      </aside>
      {open ? <button className="fixed inset-0 z-30 bg-slate-950/40 xl:hidden" aria-label="Close navigation overlay" onClick={onClose} /> : null}
    </>
  );
}

function ExecutiveGlobalHeader({ onOpenMenu, onAction }: { onOpenMenu: () => void; onAction: (message: string) => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <button className="icon-btn xl:hidden" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={18} /></button>
      <form className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" onSubmit={(event) => { event.preventDefault(); onAction("Executive search is ready for backend connection."); }}>
        <Search size={17} className="text-slate-500" />
        <input aria-label="Global search" className="min-w-0 flex-1 text-sm outline-none" placeholder="Search clinic, visit, claim, payer or evidence..." />
      </form>
      <button className="icon-btn hidden md:inline-flex" aria-label="Open AI Copilot" onClick={() => onAction("AI Copilot opened.")}><Sparkles size={18} /></button>
      <button className="icon-btn hidden md:inline-flex" aria-label="Open Executive Tasks" onClick={() => onAction("Executive task center opened.")}><ListTodo size={18} /></button>
      <button className="icon-btn" aria-label="Open Notifications" onClick={() => onAction("Notification center opened.")}><Bell size={18} /></button>
      <div className="hidden items-center gap-2 md:flex">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-xs font-black text-blue-800">EX</div>
        <div><div className="text-xs font-black">Executive User</div><div className="text-[10px] text-slate-500">Enterprise Executive</div></div>
      </div>
    </header>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-slate-700">{label}<select className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={`${label}-${optionValue}`} value={optionValue}>{text}</option>)}</select></label>;
}

function KpiCard({ kpi, icon }: { kpi: ExecutiveDashboardResponse["kpis"][number]; icon: React.ReactNode }) {
  const status = kpi.status === "danger" ? "text-red-700" : kpi.status === "warning" ? "text-amber-700" : kpi.status === "success" ? "text-emerald-700" : "text-[#1E3A8A]";
  return (
    <article className={`${cardClass} flex min-h-40 flex-col justify-between p-4`}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-[#2563EB]">{icon}</span>
          {kpi.comparison ? <span className={`rounded-full px-2 py-1 text-[10px] font-black ${kpi.comparison.sentiment === "positive" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{kpi.comparison.unit === "percentage_point" ? formatPercentagePoint(kpi.comparison.value) : `${kpi.comparison.value}%`}</span> : null}
        </div>
        <div className={`mt-3 text-3xl font-black tracking-tight ${status}`}>{kpi.value}</div>
        <p className="mt-1 text-sm font-black text-slate-900">{kpi.label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{kpi.helperText}</p>
      </div>
      {kpi.comparison ? <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500">{kpi.comparison.label}</p> : null}
    </article>
  );
}

function ChartCard({ title, subtitle, summary, className = "", children }: { title: string; subtitle: string; summary: string; className?: string; children: React.ReactNode }) {
  return <article className={`${cardClass} ${className}`}><div className="p-4 pb-0"><h2 className="text-base font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p><p className="sr-only">{summary}</p></div><div className="space-y-4 p-4">{children}</div></article>;
}

function QueueList({ title, items, onClick }: { title: string; items: ExecutiveDashboardResponse["claimQueue"]; onClick: (filters: Partial<DashboardFilters>) => void }) {
  return <div><h3 className="text-sm font-bold text-[#1E3A8A]">{title}</h3><div className="mt-3 space-y-3">{items.map((item) => <button key={item.id} type="button" onClick={() => item.supportedFilter && onClick(item.supportedFilter)} disabled={!item.supportedFilter} className="w-full rounded-xl border border-slate-200 p-3 text-left disabled:cursor-not-allowed disabled:opacity-70"><div className="flex justify-between text-sm"><b>{item.label}</b><span>{item.count}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><span className="block h-2 rounded-full bg-[#2563EB]" style={{ width: `${item.percentage}%` }} /></div><p className="mt-2 text-xs text-slate-500">{item.percentage}% queue · {item.overdue} overdue · oldest {item.oldestCase}</p></button>)}</div></div>;
}

function EconomicChart({ tab, data }: { tab: "trend" | "waterfall" | "drivers"; data: ExecutiveDashboardResponse["economic"] }) {
  if (tab === "drivers") return <ResponsiveContainer width="100%" height={320}><BarChart data={data.drivers} layout="vertical"><CartesianGrid stroke={chartColors.border} /><XAxis type="number" tickFormatter={(value) => `฿${value}`} /><YAxis type="category" dataKey="label" width={100} /><Tooltip formatter={(value) => formatCurrencyTHB(Number(value))} /><Bar dataKey="value" fill={chartColors.ai} /></BarChart></ResponsiveContainer>;
  if (tab === "waterfall") return <ResponsiveContainer width="100%" height={320}><BarChart data={data.waterfall}><CartesianGrid stroke={chartColors.border} /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => `฿${value}`} /><Tooltip formatter={(value) => formatCurrencyTHB(Number(value))} /><Bar dataKey="start" stackId="a" fill="transparent" /><Bar dataKey="delta" stackId="a">{data.waterfall.map((item) => <Cell key={item.label} fill={item.delta < 0 ? chartColors.success : item.label === "Actual" ? chartColors.danger : chartColors.warning} />)}</Bar></BarChart></ResponsiveContainer>;
  return <ResponsiveContainer width="100%" height={320}><AreaChart data={data.costTrend}><CartesianGrid stroke={chartColors.border} /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => `฿${value}`} /><Tooltip formatter={(value) => formatCurrencyTHB(Number(value))} /><Legend /><Area dataKey="actual" name="Actual Cost" stroke={chartColors.danger} fill="rgba(220,38,38,.08)" /><Line dataKey="previous" name="Benchmark" stroke={chartColors.executive} strokeDasharray="6 4" /><Line dataKey="target" name="Upper Threshold" stroke={chartColors.warning} strokeDasharray="3 4" /></AreaChart></ResponsiveContainer>;
}

function CaseTable({ items, selectedIds, onSelect, onSort, onOpen }: { items: CaseWorklistItem[]; selectedIds: string[]; onSelect: (ids: string[]) => void; onSort: (key: SortKey) => void; onOpen: (id: string) => void }) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  function toggleAll(checked: boolean) {
    onSelect(checked ? Array.from(new Set([...selectedIds, ...items.map((item) => item.id)])) : selectedIds.filter((id) => !items.some((item) => item.id === id)));
  }
  return <div className="max-h-[560px] overflow-auto"><table className="w-full min-w-[1280px] border-collapse text-sm"><thead className="sticky top-0 z-10 bg-[#F8FAFC] text-left text-slate-500"><tr><th className="p-3"><Checkbox checked={allSelected} onChange={(event) => toggleAll(event.currentTarget.checked)} aria-label="Select all current page" /></th>{[["priority", "Priority"], ["visitId", "Visit ID"], ["clinic", "Clinic / Department"], ["payer", "Payer"], ["claimValue", "Claim Value"], ["readinessScore", "Readiness"], ["missing", "Missing Evidence"], ["risk", "Risk & Reason"], ["sla", "SLA"], ["owner", "Owner"], ["updatedAt", "Last Updated"], ["action", "Recommended Action"], ["open", "Action"]].map(([key, label]) => <th key={key} className="p-3">{["priority", "visitId", "claimValue", "readinessScore", "updatedAt"].includes(key) ? <button type="button" onClick={() => onSort(key as SortKey)} className="font-semibold hover:text-[#1E3A8A]">{label}</button> : label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100 hover:bg-blue-50/60"><td className="p-3"><Checkbox checked={selectedIds.includes(item.id)} onChange={(event) => onSelect(event.currentTarget.checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id))} aria-label={`Select ${item.visitId}`} /></td><td className="p-3"><Badge className={priorityConfig[item.priority].className}>{priorityConfig[item.priority].label}</Badge></td><td className="p-3 font-bold text-[#1E3A8A]">{item.visitId}</td><td className="p-3"><b>{item.clinicName}</b><span className="block text-xs text-slate-500">{item.departmentName}</span></td><td className="p-3">{item.payerName}</td><td className="p-3 font-semibold">{formatCurrencyTHB(item.claimValue)}</td><td className="p-3"><div className="flex items-center justify-between gap-2"><b>{item.readinessScore}%</b><span className={item.readinessTrend >= 0 ? "text-emerald-700" : "text-red-700"}>{formatPercentagePoint(item.readinessTrend)}</span></div><div className="mt-1 h-2 w-32 rounded-full bg-slate-100"><span className="block h-2 rounded-full bg-[#2563EB]" style={{ width: `${item.readinessScore}%` }} /></div><Badge className={readinessStatusConfig[item.readinessStatus].className}>{readinessStatusConfig[item.readinessStatus].label}</Badge></td><td className="max-w-[180px] p-3">{item.missingEvidence.length ? item.missingEvidence.join(", ") : "None"}</td><td className="p-3"><Badge className={riskLevelConfig[item.riskLevel].className}>{riskLevelConfig[item.riskLevel].label}</Badge><span className="mt-1 block max-w-[190px] text-xs text-slate-500">{item.riskReason}</span></td><td className={`p-3 ${slaStatusConfig[item.slaStatus].className}`}>{item.slaLabel}</td><td className="p-3">{item.ownerName}</td><td className="p-3">{formatRelativeTime(item.updatedAt)}</td><td className="p-3 font-semibold">{item.recommendedAction}</td><td className="p-3"><Button onClick={() => onOpen(item.id)} className="rounded-lg bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white">Open</Button></td></tr>)}</tbody></table></div>;
}

function CreateTaskDialog({ caseIds, onClose, onSuccess }: { caseIds: string[]; onClose: () => void; onSuccess: (message: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateReviewTaskFormValues>({ resolver: zodResolver(createReviewTaskSchema), defaultValues: { title: caseIds.length > 1 ? `Bulk review task · ${caseIds.length} selected cases` : "Review evidence completeness", owner: "", dueDate: "", notes: "" } });
  async function onSubmit(values: CreateReviewTaskFormValues) {
    setSubmitting(true);
    await createReviewTask({ ...values, caseIds });
    setSubmitting(false);
    onClose();
    onSuccess("Task created successfully and audit placeholder added.");
  }
  return <div role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="task-dialog-title" className="text-xl font-bold">Create Review Task</h2><p className="mt-1 text-sm text-slate-500">Human approval is required and the action will be audit logged.</p></div><Button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2"><X className="h-5 w-5" /></Button></div><div className="mt-4 space-y-3"><FormField label="Task title" error={errors.title?.message}><Input {...register("title")} className={selectClass} /></FormField><FormField label="Owner" error={errors.owner?.message}><Input {...register("owner")} className={selectClass} /></FormField><FormField label="Due date" error={errors.dueDate?.message}><Input type="date" {...register("dueDate")} className={selectClass} /></FormField><FormField label="Notes" error={errors.notes?.message}><textarea {...register("notes")} className={`${selectClass} min-h-24`} /></FormField></div><div className="mt-5 flex justify-end gap-2"><Button onClick={onClose} className="rounded-xl border px-4 py-2 font-semibold">Cancel</Button><Button type="submit" disabled={submitting} className="rounded-xl bg-[#1E3A8A] px-4 py-2 font-semibold text-white disabled:opacity-60">{submitting ? "Creating..." : "Create Task"}</Button></div></form></div>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{children}{error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}</label>;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

function EmptyState({ title, subtitle = "ไม่มีข้อมูลสำหรับเงื่อนไขปัจจุบัน" }: { title: string; subtitle?: string }) {
  return <div className="p-8 text-center"><p className="font-bold text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}

function DashboardSkeleton() {
  return <main className="min-h-screen bg-[#F8FAFC] p-6"><div className="h-56 rounded-2xl bg-slate-200" /><div className="mt-5 grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-48 rounded-2xl bg-slate-200" />)}</div></main>;
}
