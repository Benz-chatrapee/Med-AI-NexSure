"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckSquare2,
  Download,
  FileBarChart,
  FileHeart,
  Hospital,
  KeyRound,
  LayoutDashboard,
  ListStart,
  Menu,
  NotebookPen,
  PackageCheck,
  Pill,
  RefreshCw,
  ScanSearch,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCog,
  Users,
  X,
} from "lucide-react";
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
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildAlertAuditPayload } from "../services/clinic-dashboard-service";
import type {
  ClinicDashboardData,
  ClinicDashboardFilters,
  ClinicDashboardKpi,
  MetricStatus,
  QueueItem,
  VisitStatus,
} from "../types/clinic-dashboard.types";
import { formatBaht, statusLabel } from "../utils/clinic-dashboard-formatters";
import { filterQueue, sortQueue } from "../utils/clinic-dashboard-selectors";

const colors = {
  primary: "#1E3A8A",
  navy: "#0F2A5F",
  ai: "#2563EB",
  sky: "#38BDF8",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  slate: "#64748B",
  border: "#E2E8F0",
};

const chartStatusColor: Record<MetricStatus, string> = {
  good: colors.success,
  warning: colors.warning,
  critical: colors.danger,
  neutral: colors.ai,
};

type Props = { initialData: ClinicDashboardData };

export function ClinicDashboardPage({ initialData }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState<ClinicDashboardFilters>(initialData.filters);
  const [draftFilters, setDraftFilters] = useState<ClinicDashboardFilters>(initialData.filters);
  const [activeStage, setActiveStage] = useState<VisitStatus | "all">("all");
  const [queueSearch, setQueueSearch] = useState("");
  const [queueSort, setQueueSort] = useState<"urgency" | "wait" | "name">("urgency");
  const [selectedKpi, setSelectedKpi] = useState<ClinicDashboardKpi | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<QueueItem | null>(null);
  const [waitRange, setWaitRange] = useState<"today" | "sevenDays" | "thirtyDays">("today");
  const [forecastRange, setForecastRange] = useState<"day" | "week" | "month">("week");
  const [heatSort, setHeatSort] = useState("Highest Risk");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  const activeChips = Object.entries(filters).filter(([key, value]) => key !== "clinic" && value !== "all");
  const queue = useMemo(
    () => sortQueue(filterQueue(initialData.queue, filters, queueSearch, activeStage), queueSort),
    [activeStage, filters, initialData.queue, queueSearch, queueSort],
  );
  const sortedDepartments = useMemo(() => {
    return [...initialData.departments].sort((a, b) => {
      if (heatSort === "Highest Volume") return Number.parseInt(b.metrics[0].value, 10) - Number.parseInt(a.metrics[0].value, 10);
      if (heatSort === "Lowest Claim Readiness") return Number.parseInt(a.metrics[3].value, 10) - Number.parseInt(b.metrics[3].value, 10);
      if (heatSort === "Highest Wait Time") return Number.parseInt(b.metrics[1].value, 10) - Number.parseInt(a.metrics[1].value, 10);
      return Math.max(...b.metrics.map((metric) => metric.riskScore)) - Math.max(...a.metrics.map((metric) => metric.riskScore));
    });
  }, [heatSort, initialData.departments]);
  const topEvidence = initialData.claimReadiness.missingEvidence.find((item) => item.cumulativePercentage >= 65);

  function removeChip(key: string) {
    const next = { ...filters, [key]: "all" } as ClinicDashboardFilters;
    setFilters(next);
    setDraftFilters(next);
  }

  function acknowledgeAlert(alertId: string) {
    setAcknowledgedAlerts((current) => [...current, alertId]);
    const payload = buildAlertAuditPayload(alertId, initialData.context.userName);
    console.info("Clinic dashboard intended audit event", payload);
    showToast("Alert acknowledged and audit event payload prepared.");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <style>{`
        .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;height:2.5rem;border-radius:.5rem;background:#1E3A8A;padding:0 .8rem;font-size:.75rem;font-weight:900;color:#fff;white-space:nowrap}
        .btn-primary:focus-visible,.btn-secondary:focus-visible,.icon-btn:focus-visible,.field:focus-visible{outline:3px solid rgba(37,99,235,.28);outline-offset:2px}
        .btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:2.25rem;border-radius:.5rem;border:1px solid #E2E8F0;background:#fff;padding:.45rem .7rem;font-size:.75rem;font-weight:900;color:#334155;white-space:nowrap}
        .btn-secondary:disabled{opacity:.58;cursor:not-allowed}
        .icon-btn{display:inline-flex;height:2.5rem;width:2.5rem;align-items:center;justify-content:center;border-radius:.5rem;border:1px solid #E2E8F0;background:#fff;color:#475569}
        .field{height:2.25rem;border-radius:.5rem;border:1px solid #E2E8F0;background:#fff;padding:0 .65rem;font-size:.75rem;color:#0F172A;outline:none}
        @media (prefers-reduced-motion: reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      `}</style>
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[276px_minmax(0,1fr)]">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0">
          <GlobalHeader data={initialData} onOpenMenu={() => setMobileOpen(true)} onAction={showToast} />
          <div className="mx-auto max-w-[1920px] space-y-4 p-4 md:p-6">
            <PageHeader data={initialData} onAction={showToast} />
            <FilterBar
              data={initialData}
              draftFilters={draftFilters}
              activeChips={activeChips}
              onDraftChange={setDraftFilters}
              onApply={() => {
                setFilters(draftFilters);
                showToast("Dashboard filters applied.");
              }}
              onReset={() => {
                setFilters(initialData.filters);
                setDraftFilters(initialData.filters);
                setActiveStage("all");
                showToast("Filters reset.");
              }}
              onSave={() => showToast("View preference saved locally for demo. Backend persistence is not connected.")}
              onRemoveChip={removeChip}
            />

            <section className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6" aria-label="Clinic KPI summary">
              {initialData.kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} onSelect={() => setSelectedKpi(kpi)} />
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-12">
              <Card className="lg:col-span-12" title="Clinic Flow" subtitle="Operational stage view · เลือก stage เพื่อกรองคิว">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
                    {activeStage === "all" ? "No active stage filter" : `Stage: ${activeStage}`}
                  </span>
                  <button className="btn-secondary" onClick={() => setActiveStage("all")}>Clear</button>
                </div>
                <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-7">
                  {initialData.clinicFlow.map((stage) => (
                    <button
                      key={stage.stage}
                      className={`rounded-lg border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                        activeStage === stage.stage ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
                      }`}
                      onClick={() => setActiveStage(stage.stage)}
                      aria-pressed={activeStage === stage.stage}
                    >
                      <span className="text-2xl font-black">{stage.count}</span>
                      <span className="mt-1 block text-sm font-black">{stage.stage}</span>
                      <span className="mt-2 block text-xs leading-5 text-slate-600">
                        {stage.percentage}% visits · Avg {stage.averageMinutes}m · SLA {stage.slaTargetMinutes}m
                      </span>
                      <StatusPill status={stage.status === "Breached" ? "critical" : stage.status === "Near SLA" || stage.status === "Attention" ? "warning" : "good"} label={stage.status} />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-5" title="Queue by Department" subtitle="Accessible department filter is available below the chart.">
                <ChartBox summary="General Medicine has the largest active queue with 17 patients.">
                  <ResponsiveContainer>
                    <BarChart data={initialData.queueByDepartment} layout="vertical" margin={{ left: 18 }}>
                      <CartesianGrid stroke={colors.border} horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="department" type="category" width={118} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="activeQueue" fill={colors.ai} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
                <div className="mt-3 flex flex-wrap gap-2">
                  {initialData.queueByDepartment.map((item) => (
                    <button
                      key={item.department}
                      className="btn-secondary"
                      onClick={() => {
                        const next = { ...filters, department: item.department };
                        setFilters(next);
                        setDraftFilters(next);
                      }}
                    >
                      {item.department}
                    </button>
                  ))}
                </div>
              </Card>

              <QueueCommandCenter
                className="lg:col-span-7"
                queue={queue}
                search={queueSearch}
                sort={queueSort}
                onSearch={setQueueSearch}
                onSort={setQueueSort}
                onClear={() => {
                  setQueueSearch("");
                  setQueueSort("urgency");
                  setActiveStage("all");
                  setFilters(initialData.filters);
                  setDraftFilters(initialData.filters);
                }}
                onOpenVisit={setSelectedVisit}
              />

              <Card className="lg:col-span-6" title="Hourly Wait Time Trend" subtitle="Actual, previous day and SLA target">
                <Segmented value={waitRange} values={[["today", "Today"], ["sevenDays", "7 Days"], ["thirtyDays", "30 Days"]]} onChange={(value) => setWaitRange(value as typeof waitRange)} />
                <ChartBox summary="Actual wait time is above target around 10:00 and 11:00, then returns within SLA.">
                  <ResponsiveContainer>
                    <LineChart data={initialData.waitTime[waitRange]}>
                      <CartesianGrid stroke={colors.border} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke={colors.ai} strokeWidth={2} />
                      <Line type="monotone" dataKey="previous" stroke="#94A3B8" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="target" stroke={colors.danger} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartBox>
              </Card>

              <Card className="lg:col-span-6" title="Wait Time Distribution" subtitle="SLA-risk ranges include textual status labels.">
                <ChartBox summary="Six patients are in SLA-risk ranges above 30 minutes.">
                  <ResponsiveContainer>
                    <BarChart data={initialData.waitTime.distribution}>
                      <CartesianGrid stroke={colors.border} vertical={false} />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="patients" radius={[8, 8, 0, 0]}>
                        {initialData.waitTime.distribution.map((item) => <Cell key={item.range} fill={chartStatusColor[item.status]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
                <TextLegend items={initialData.waitTime.distribution.map((item) => `${item.range}: ${item.patients} patients · ${statusLabel(item.status)}`)} />
              </Card>

              <DepartmentHeatmap data={sortedDepartments} sort={heatSort} onSort={setHeatSort} />
              <DoctorPerformance data={initialData} />
              <PatientForecast data={initialData} range={forecastRange} onRange={setForecastRange} />
              <ClaimReadiness data={initialData} topEvidence={topEvidence?.cumulativePercentage ?? 65} />
              <ClinicalScorecard data={initialData} />
              <FinancialIntelligence data={initialData} />
              <AlertsAndActivities data={initialData} acknowledged={acknowledgedAlerts} onAcknowledge={acknowledgeAlert} onAction={showToast} />
            </section>
          </div>
        </main>
      </div>
      {selectedKpi ? <KpiDialog kpi={selectedKpi} onClose={() => setSelectedKpi(null)} /> : null}
      {selectedVisit ? <VisitSheet visit={selectedVisit} onClose={() => setSelectedVisit(null)} /> : null}
      <div aria-live="polite" className="fixed bottom-5 right-5 z-50">
        {toast ? <div className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">{toast}</div> : null}
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const groups = [
    { title: "Workspace", links: [["/clinic-dashboard", "Main Dashboard", LayoutDashboard, "active"], ["/dashboard", "Patient Management", Users, ""], ["/visit-management", "Visit Management", CalendarClock, "24"], ["/soap-note", "SOAP Note", NotebookPen, ""], ["/ai-clinical-engine", "AI Clinical Insight", BrainCircuit, ""], ["/soap-note", "Diagnosis", Stethoscope, ""], ["/prescription", "Prescription", Pill, ""], ["/medical-certificate", "Medical Certificate", FileHeart, ""]] },
    { title: "Insurance Intelligence", links: [["/claim-readiness", "Claim Readiness", ShieldCheck, "12"], ["/evidence-package", "Evidence Package", PackageCheck, ""], ["/insurance-intelligence", "Insurance Intelligence", ScanSearch, ""], ["/economic-intelligence", "Economic Intelligence", FileBarChart, ""], ["/payer-rules", "Reports", FileBarChart, ""]] },
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
                <Icon size={17} /><span>{label}</span>{badge && badge !== "active" ? <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] text-blue-900">{badge}</span> : null}
              </Link>
            ))}
          </nav>
        ))}
      </aside>
      {open ? <button className="fixed inset-0 z-30 bg-slate-950/40 xl:hidden" aria-label="Close navigation overlay" onClick={onClose} /> : null}
    </>
  );
}

function GlobalHeader({ data, onOpenMenu, onAction }: { data: ClinicDashboardData; onOpenMenu: () => void; onAction: (message: string) => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <button className="icon-btn xl:hidden" aria-label="Open navigation" onClick={onOpenMenu}><Menu size={18} /></button>
      <form className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" onSubmit={(event) => { event.preventDefault(); onAction("Search is ready for backend connection."); }}>
        <Search size={17} className="text-slate-500" />
        <input aria-label="Global search" className="min-w-0 flex-1 text-sm outline-none" placeholder="Search patient, HN, visit, claim or document..." />
      </form>
      <button className="icon-btn hidden md:inline-flex" aria-label="Open AI Copilot" onClick={() => onAction("AI Copilot opened.")}><Sparkles size={18} /></button>
      <button className="icon-btn hidden md:inline-flex" aria-label="Open Task Center" onClick={() => onAction("Task Center route is not connected; opening task summary.")}><CheckSquare2 size={18} /></button>
      <button className="icon-btn" aria-label="Open Notifications" onClick={() => onAction("Notification center opened.")}><Bell size={18} /></button>
      <div className="hidden items-center gap-2 md:flex">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-xs font-black text-blue-800">BM</div>
        <div><div className="text-xs font-black">{data.context.userName}</div><div className="text-[10px] text-slate-500">{data.context.userRole}</div></div>
      </div>
    </header>
  );
}

function PageHeader({ data, onAction }: { data: ClinicDashboardData; onAction: (message: string) => void }) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Enterprise Clinic Dashboard</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{data.context.clinicName}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {data.context.currentDateLabel} · {data.context.currentShift} · {data.context.organization} / Clinic / Dashboard
          <br />ภาพรวมการดำเนินงานแบบ Real-time พร้อม AI และ Insurance Intelligence
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Systems Operational</span>
        <button className="btn-secondary" onClick={() => onAction("Dashboard refreshed from typed mock service.")}><RefreshCw size={15} />Refresh</button>
        <button className="btn-secondary" onClick={() => onAction("Export is prepared for future backend integration.")}><Download size={15} />Export</button>
      </div>
    </section>
  );
}

function FilterBar(props: {
  data: ClinicDashboardData;
  draftFilters: ClinicDashboardFilters;
  activeChips: [string, string][];
  onDraftChange: (filters: ClinicDashboardFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onSave: () => void;
  onRemoveChip: (key: string) => void;
}) {
  const { data, draftFilters, onDraftChange } = props;
  const update = (key: keyof ClinicDashboardFilters, value: string) => onDraftChange({ ...draftFilters, [key]: value } as ClinicDashboardFilters);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Dashboard filters">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Select label="Date range" value={draftFilters.dateRange} onChange={(value) => update("dateRange", value)} options={["Today", "Last 7 Days", "Last 30 Days"]} />
        <Select label="Clinic" value={draftFilters.clinic} onChange={(value) => update("clinic", value)} options={data.filterOptions.clinics} />
        <Select label="Department" value={draftFilters.department} onChange={(value) => update("department", value)} options={["all", ...data.filterOptions.departments]} />
        <Select label="Doctor" value={draftFilters.doctor} onChange={(value) => update("doctor", value)} options={["all", ...data.filterOptions.doctors]} />
        <Select label="Payer" value={draftFilters.payer} onChange={(value) => update("payer", value)} options={["all", ...data.filterOptions.payers]} />
        <Select label="Visit status" value={draftFilters.visitStatus} onChange={(value) => update("visitStatus", value)} options={["all", ...data.filterOptions.statuses]} />
        <Select label="Risk level" value={draftFilters.riskLevel} onChange={(value) => update("riskLevel", value)} options={["all", ...data.filterOptions.risks]} />
        <button className="btn-primary" onClick={props.onApply}>Apply Filters</button>
        <button className="btn-secondary" onClick={props.onReset}>Reset</button>
        <button className="btn-secondary" onClick={props.onSave}>Save View</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {props.activeChips.map(([key, value]) => (
          <button key={key} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200" onClick={() => props.onRemoveChip(key)}>
            {key}: {value} <span aria-hidden>×</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function KpiCard({ kpi, onSelect }: { kpi: ClinicDashboardKpi; onSelect: () => void }) {
  return (
    <button className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200" onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><ListStart size={18} /></div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${kpi.trend.startsWith("-") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{kpi.trend}</span>
      </div>
      <div className="mt-3 text-3xl font-black">{kpi.value}</div>
      <div className="mt-1 text-sm font-black">{kpi.label}</div>
      <div className="text-xs text-slate-500">{kpi.thaiHelper}</div>
      <div className="mt-3 h-10" aria-hidden>
        <ResponsiveContainer>
          <AreaChart data={kpi.sparkline.map((value, index) => ({ index, value }))}>
            <Area dataKey="value" stroke={colors.ai} fill="#EFF6FF" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <span>{kpi.previous}</span><b className={kpi.status === "critical" ? "text-red-700" : kpi.status === "warning" ? "text-amber-700" : "text-emerald-700"}>{kpi.target}</b>
      </div>
    </button>
  );
}

function QueueCommandCenter(props: {
  className?: string;
  queue: QueueItem[];
  search: string;
  sort: "urgency" | "wait" | "name";
  onSearch: (value: string) => void;
  onSort: (value: "urgency" | "wait" | "name") => void;
  onClear: () => void;
  onOpenVisit: (visit: QueueItem) => void;
}) {
  return (
    <Card className={props.className} title="Real-time Queue Command Center" subtitle="AI-assisted ordering only. Final operational and clinical prioritization must be reviewed by authorized staff. การจัดลำดับโดย AI ต้องผ่านการตรวจสอบโดยบุคลากร">
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="field min-w-56" value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder="Search patient or HN" aria-label="Search queue patients" />
        <Select label="Sort queue" value={props.sort} onChange={(value) => props.onSort(value as "urgency" | "wait" | "name")} options={["urgency", "wait", "name"]} />
        <button className="btn-secondary" onClick={props.onClear}>Clear filters</button>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">Active queue {props.queue.length}</span>
      </div>
      {props.queue.length === 0 ? <EmptyState title="No queue patients" /> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-[0.08em] text-slate-500">
              <tr>{["Patient", "HN", "Doctor", "Department", "Waiting Time", "SLA", "Priority", "Clinical Risk", "Status", "AI Recommendation", "Action"].map((head) => <th key={head} className="border-b border-slate-200 p-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {props.queue.map((item) => (
                <tr key={item.id} className={item.urgencyScore >= 90 ? "bg-red-50/40" : "hover:bg-blue-50/40"}>
                  <td className="border-b border-slate-100 p-3 font-black">{item.urgencyScore >= 90 ? "Urgent · " : ""}{item.patientName}</td>
                  <td className="border-b border-slate-100 p-3">{item.hn}</td>
                  <td className="border-b border-slate-100 p-3">{item.doctorName}</td>
                  <td className="border-b border-slate-100 p-3">{item.department}</td>
                  <td className="border-b border-slate-100 p-3"><b>{item.waitingMinutes} min</b><div className="text-xs text-slate-500">{item.waitingMinutes > 20 ? `SLA exceeded by ${item.waitingMinutes - 20} min` : "Within SLA"}</div></td>
                  <td className="border-b border-slate-100 p-3"><StatusPill status={item.slaStatus === "Breached" ? "critical" : item.slaStatus === "Near SLA" ? "warning" : "good"} label={item.slaStatus} /></td>
                  <td className="border-b border-slate-100 p-3"><StatusPill status={item.priority === "Critical" ? "critical" : item.priority === "High" ? "warning" : "neutral"} label={item.priority} /></td>
                  <td className="border-b border-slate-100 p-3"><StatusPill status={item.clinicalRisk === "High" ? "critical" : item.clinicalRisk === "Medium" ? "warning" : "good"} label={item.clinicalRisk} /></td>
                  <td className="border-b border-slate-100 p-3">{item.visitStatus}</td>
                  <td className="border-b border-slate-100 p-3">{item.aiRecommendation}</td>
                  <td className="border-b border-slate-100 p-3"><button className="btn-secondary" onClick={() => props.onOpenVisit(item)}>Open Visit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function DepartmentHeatmap({ data, sort, onSort }: { data: ClinicDashboardData["departments"]; sort: string; onSort: (value: string) => void }) {
  return (
    <Card className="lg:col-span-12" title="Department Performance Heatmap" subtitle="Cells include actual value, target and textual status.">
      <Select label="Sort department heatmap" value={sort} onChange={onSort} options={["Highest Risk", "Highest Volume", "Lowest Claim Readiness", "Highest Wait Time"]} />
      <div className="mt-3 overflow-x-auto">
        <div className="grid min-w-[820px] grid-cols-[160px_repeat(5,minmax(120px,1fr))] gap-2">
          <div />
          {["Patient Volume", "Average Wait", "Revenue vs Target", "Claim Readiness", "Clinical Quality"].map((head) => <div key={head} className="text-xs font-black text-slate-500">{head}</div>)}
          {data.map((department) => (
            <div key={department.department} className="contents">
              <div className="flex items-center text-sm font-black">{department.department}</div>
              {department.metrics.map((metric) => (
                <div key={metric.label} className={`rounded-lg border p-3 text-xs ${metric.status === "critical" ? "border-red-200 bg-red-50 text-red-900" : metric.status === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
                  <b className="block text-sm">{metric.value}</b>Target {metric.target}<br />{statusLabel(metric.status)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DoctorPerformance({ data }: { data: ClinicDashboardData }) {
  return (
    <Card className="lg:col-span-6" title="Doctor Performance" subtitle="Risk-adjusted comparison">
      <ChartBox summary="Dr. Araya leads clinical quality with 94 across 48 cases.">
        <ResponsiveContainer>
          <BarChart data={data.doctors} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke={colors.border} horizontal={false} />
            <XAxis type="number" domain={[75, 100]} />
            <YAxis type="category" dataKey="doctor" width={90} />
            <Tooltip />
            <Legend />
            <Bar dataKey="clinicalQuality" fill={colors.ai} radius={[0, 8, 8, 0]} />
            <Bar dataKey="documentationQuality" fill={colors.sky} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <Disclaimer text="Performance is risk-adjusted and should be interpreted with case volume, specialty, and patient complexity. ผลการประเมินควรพิจารณาร่วมกับจำนวนเคสและความซับซ้อน" />
    </Card>
  );
}

function PatientForecast({ data, range, onRange }: { data: ClinicDashboardData; range: "day" | "week" | "month"; onRange: (value: "day" | "week" | "month") => void }) {
  return (
    <Card className="lg:col-span-6" title="Patient Trend and AI Forecast" subtitle="Forecast is advisory only">
      <Segmented value={range} values={[["day", "Day"], ["week", "Week"], ["month", "Month"]]} onChange={(value) => onRange(value as "day" | "week" | "month")} />
      <ChartBox summary="Forecast suggests peak demand may exceed capacity in the selected range.">
        <ResponsiveContainer>
          <LineChart data={data.forecast[range]}>
            <CartesianGrid stroke={colors.border} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="actual" stroke={colors.ai} />
            <Line dataKey="forecast" stroke={colors.sky} strokeDasharray="5 5" />
            <Line dataKey="capacity" stroke={colors.warning} dot={false} />
            <Line dataKey="high" stroke="#BFDBFE" dot={false} />
            <Line dataKey="low" stroke="#BFDBFE" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-950">{data.forecast.advisory} AI forecast is advisory only.</div>
    </Card>
  );
}

function ClaimReadiness({ data, topEvidence }: { data: ClinicDashboardData; topEvidence: number }) {
  return (
    <>
      <Card className="lg:col-span-4" title="Claim Readiness Donut" subtitle="Textual summary provided with chart.">
        <ChartBox height="h-60" summary={`${data.claimReadiness.overallPercentage}% of visits are claim-ready.`}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.claimReadiness.donut} dataKey="value" nameKey="status" innerRadius={62} outerRadius={92}>
                {[colors.success, colors.warning, colors.danger].map((color) => <Cell key={color} fill={color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>
        <TextLegend items={[`${data.claimReadiness.overallPercentage}% overall readiness`, `${data.claimReadiness.readyVisits} ready visits`, `${data.claimReadiness.pendingEvidence} pending evidence`, `${formatBaht(data.claimReadiness.estimatedClaimValue)} estimated claim value`]} />
      </Card>
      <Card className="lg:col-span-4" title="Claim Readiness by Department" subtitle="100% stacked status distribution">
        <ChartBox height="h-60" summary="Orthopedics has the lowest readiness at 78%.">
          <ResponsiveContainer>
            <BarChart data={data.claimReadiness.byDepartment} layout="vertical" margin={{ left: 16 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ready" stackId="a" fill={colors.success} />
              <Bar dataKey="needsReview" stackId="a" fill={colors.warning} />
              <Bar dataKey="notReady" stackId="a" fill={colors.danger} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>
      <Card className="lg:col-span-4" title="Top Missing Evidence" subtitle="Pareto view with calculated cumulative insight">
        <ChartBox height="h-60" summary={`Top evidence categories account for ${topEvidence}% of affected cases.`}>
          <ResponsiveContainer>
            <ComposedChart data={data.claimReadiness.missingEvidence}>
              <CartesianGrid stroke={colors.border} />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="affectedCases" fill={colors.ai} radius={[8, 8, 0, 0]} />
              <Line dataKey="cumulativePercentage" stroke={colors.warning} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
        <p className="text-xs leading-5 text-slate-600">Addressing the leading categories can improve readiness for about {topEvidence}% of affected cases.</p>
      </Card>
    </>
  );
}

function ClinicalScorecard({ data }: { data: ClinicDashboardData }) {
  return (
    <Card className="lg:col-span-6" title="Clinical AI Scorecard" subtitle="Decision support quality metrics">
      <div className="grid gap-2 md:grid-cols-2">
        {data.clinicalAI.metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between gap-2"><b className="text-sm">{metric.label}</b><span className="text-xl font-black text-blue-700">{metric.score}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600" style={{ width: `${metric.score}%` }} /></div>
            <div className="mt-2 flex justify-between text-xs text-slate-500"><span>Target {metric.target}% · {metric.cases} cases</span><span>{metric.change}</span></div>
          </div>
        ))}
      </div>
      <ChartBox height="h-56" summary="SOAP, correlation and ICD confidence are stable above 88%.">
        <ResponsiveContainer>
          <LineChart data={data.clinicalAI.trend}>
            <CartesianGrid stroke={colors.border} />
            <XAxis dataKey="label" />
            <YAxis domain={[75, 100]} />
            <Tooltip />
            <Legend />
            <Line dataKey="soap" stroke={colors.ai} />
            <Line dataKey="correlation" stroke={colors.sky} />
            <Line dataKey="icd" stroke={colors.success} />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
      <Disclaimer text="AI provides decision support only. Final clinical and claim decisions require authorized human review. AI เป็นเครื่องมือช่วยตัดสินใจ ไม่ใช่ผู้ตัดสินใจแทนบุคลากรทางการแพทย์" />
    </Card>
  );
}

function FinancialIntelligence({ data }: { data: ClinicDashboardData }) {
  return (
    <>
      <Card className="lg:col-span-6" title="Revenue Performance" subtitle="Thai Baht formatting via Intl.NumberFormat">
        <ChartBox summary="Revenue is above target during late morning and afternoon periods.">
          <ResponsiveContainer>
            <ComposedChart data={data.financial.revenueTrend}>
              <CartesianGrid stroke={colors.border} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => formatBaht(Number(value))} />
              <Tooltip formatter={(value) => formatBaht(Number(value))} />
              <Legend />
              <Bar dataKey="actual" fill={colors.ai} radius={[8, 8, 0, 0]} />
              <Line dataKey="target" stroke={colors.warning} />
              <Line dataKey="previous" stroke="#94A3B8" strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>
      <Card className="lg:col-span-6" title="Financial KPI Summary" subtitle="Revenue, claim value, cost and realizable revenue">
        <div className="grid gap-2 md:grid-cols-3">
          {data.financial.metrics.map((metric) => <MiniMetric key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} status={metric.status} />)}
        </div>
      </Card>
      <Card className="lg:col-span-6" title="Visit Cost Distribution" subtitle="Cost ranges and outlier volumes">
        <ChartBox summary="Eight visits are above ฿5,000 and require review.">
          <ResponsiveContainer>
            <BarChart data={data.financial.costDistribution}>
              <CartesianGrid stroke={colors.border} vertical={false} />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" radius={[8, 8, 0, 0]}>
                {data.financial.costDistribution.map((item) => <Cell key={item.range} fill={chartStatusColor[item.status]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>
      <Card className="lg:col-span-6" title="Cost vs Clinical Complexity" subtitle="Outliers are marked by label and shape category">
        <ChartBox summary="Three visits are outliers above expected cost benchmark.">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid stroke={colors.border} />
              <XAxis type="number" dataKey="complexity" name="Clinical complexity" />
              <YAxis type="number" dataKey="cost" name="Visit cost" tickFormatter={(value) => formatBaht(Number(value))} />
              <Tooltip formatter={(value) => typeof value === "number" ? formatBaht(value) : value} />
              <Legend />
              <Scatter name="Normal Visits" data={data.financial.costComplexity.filter((point) => !point.outlier)} fill={colors.ai} />
              <Scatter name="Outlier - requires justification" data={data.financial.costComplexity.filter((point) => point.outlier)} fill={colors.danger} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartBox>
        <Disclaimer text="Outliers above benchmark require clinical or treatment-cost justification. เคสที่มีต้นทุนสูงกว่ามาตรฐานควรมีเหตุผลทางการแพทย์หรือหลักฐานรองรับ" />
      </Card>
    </>
  );
}

function AlertsAndActivities({ data, acknowledged, onAcknowledge, onAction }: { data: ClinicDashboardData; acknowledged: string[]; onAcknowledge: (id: string) => void; onAction: (message: string) => void }) {
  return (
    <>
      <Card className="lg:col-span-4" title="AI Alert Center" subtitle="Critical 1 · High 1 · Resolved today 6">
        {data.alerts.map((alert) => {
          const done = acknowledged.includes(alert.id);
          return (
            <div key={alert.id} className={`mb-2 rounded-lg border border-l-4 p-3 ${alert.severity === "critical" ? "border-l-red-600" : "border-l-amber-500"}`}>
              <div className="text-sm font-black">{alert.type} · {alert.affectedCase}</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{alert.reason} {alert.confidence ? `Confidence ${alert.confidence}%` : ""}</p>
              <p className="text-xs text-slate-500">Owner: {alert.owner} · Due {alert.dueTime}</p>
              <button className="btn-secondary mt-2" disabled={done} onClick={() => onAcknowledge(alert.id)}>{done ? "Acknowledged" : "Review Alert"}</button>
            </div>
          );
        })}
      </Card>
      <Card className="lg:col-span-4" title="My Tasks" subtitle="งานที่รอดำเนินการของคุณ">
        <div className="space-y-2">
          {data.tasks.map((task) => <MiniMetric key={task.label} label={task.label} value={`${task.count}`} helper={`${task.overdue} overdue · ${task.priority}`} status={task.overdue > 0 ? "warning" : "good"} />)}
        </div>
        <button className="btn-primary mt-3 w-full" onClick={() => onAction("Task Center route is not connected; showing dashboard tasks.")}>View Tasks</button>
      </Card>
      <Card className="lg:col-span-4" title="Notifications" subtitle="System and intelligence feed">
        <Timeline items={data.notifications.map((item) => ({ title: item.title, meta: `${item.timestamp} · ${item.source}${item.unread ? " · Unread" : ""}` }))} />
      </Card>
      <Card className="lg:col-span-12" title="Recent Activities" subtitle="User and system audit activity">
        <div className="grid gap-2 md:grid-cols-4">
          {data.activities.map((item) => <MiniMetric key={item.id} label={item.action} value={item.auditState} helper={`${item.actor} · ${item.timestamp}`} status="neutral" />)}
        </div>
        <button className="btn-secondary mt-3" onClick={() => onAction("Audit Log opened.")}>Open Audit Log</button>
      </Card>
    </>
  );
}

function KpiDialog({ kpi, onClose }: { kpi: ClinicDashboardKpi; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="kpi-dialog-title">
      <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><h2 id="kpi-dialog-title" className="text-xl font-black">{kpi.detailTitle}</h2><p className="mt-1 text-sm text-slate-600">{kpi.detailSummary}</p></div>
          <button className="icon-btn" aria-label="Close KPI detail" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mt-4 grid gap-2">
          {kpi.detailRows.map((row) => <MiniMetric key={row.label} label={row.label} value={row.value} helper="Contextual drill-down detail" status={kpi.status} />)}
        </div>
      </div>
    </div>
  );
}

function VisitSheet({ visit, onClose }: { visit: QueueItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-labelledby="visit-sheet-title">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><h2 id="visit-sheet-title" className="text-xl font-black">Visit Detail · {visit.id}</h2><p className="text-sm text-slate-600">{visit.patientName} · {visit.hn}</p></div>
          <button className="icon-btn" aria-label="Close visit detail" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-2">
          <MiniMetric label="Department" value={visit.department} helper={visit.doctorName} status="neutral" />
          <MiniMetric label="SLA" value={visit.slaStatus} helper={`${visit.waitingMinutes} minutes waiting`} status={visit.slaStatus === "Breached" ? "critical" : "warning"} />
          <MiniMetric label="AI Recommendation" value={visit.aiRecommendation} helper="Decision support only; human review required." status="warning" />
        </div>
      </aside>
    </div>
  );
}

function Card({ title, subtitle, className = "", children }: { title: string; subtitle: string; className?: string; children: ReactNode }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}><div className="p-4 pb-0"><h2 className="text-base font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div><div className="p-4">{children}</div></section>;
}

function ChartBox({ children, summary, height = "h-72" }: { children: ReactNode; summary: string; height?: string }) {
  return <div><div className={`${height} min-w-0`} aria-hidden>{children}</div><p className="sr-only">{summary}</p></div>;
}

function StatusPill({ status, label }: { status: MetricStatus; label: string }) {
  return <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black ${status === "critical" ? "bg-red-50 text-red-700" : status === "warning" ? "bg-amber-50 text-amber-700" : status === "good" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{label}</span>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="inline-flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <select className="field min-w-36" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label}` : option}</option>)}
      </select>
    </label>
  );
}

function Segmented({ value, values, onChange }: { value: string; values: [string, string][]; onChange: (value: string) => void }) {
  return <div className="mb-3 inline-flex overflow-hidden rounded-lg border border-slate-200">{values.map(([id, label]) => <button key={id} className={`px-3 py-2 text-xs font-black ${value === id ? "bg-blue-900 text-white" : "bg-white text-slate-600"}`} onClick={() => onChange(id)}>{label}</button>)}</div>;
}

function TextLegend({ items }: { items: string[] }) {
  return <ul className="mt-3 grid gap-1 text-xs leading-5 text-slate-600">{items.map((item) => <li key={item}>• {item}</li>)}</ul>;
}

function MiniMetric({ label, value, helper, status }: { label: string; value: string; helper: string; status: MetricStatus }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-slate-500">{label}</div><div className={`mt-1 text-lg font-black ${status === "critical" ? "text-red-700" : status === "warning" ? "text-amber-700" : status === "good" ? "text-emerald-700" : "text-blue-800"}`}>{value}</div><div className="mt-1 text-xs text-slate-500">{helper}</div></div>;
}

function Timeline({ items }: { items: { title: string; meta: string }[] }) {
  return <div className="space-y-3">{items.map((item) => <div key={item.title} className="border-l-2 border-blue-200 pl-3"><div className="text-sm font-black">{item.title}</div><div className="text-xs text-slate-500">{item.meta}</div></div>)}</div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">{title} · ไม่มีข้อมูลที่ตรงกับตัวกรอง</div>;
}

function Disclaimer({ text }: { text: string }) {
  return <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-950">{text}</div>;
}
