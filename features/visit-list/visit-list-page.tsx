"use client";

import Link from "next/link";
import { useMemo, useState, type ComponentType } from "react";
import {
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  Filter,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { currentVisitRole, queueSnapshots, visitKpis, visitRecords } from "./data";
import type { ClaimReadinessStatus, RiskLevel, SortDirection, SortKey, VisitRecord, VisitStatus, VisitTab } from "./types";

type IconComponent = ComponentType<{ className?: string }>;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patient Management", href: "/patients", icon: UsersRound },
  { label: "Visit Management", href: "/visits", icon: Stethoscope, active: true },
  { label: "Claim Readiness", href: "/claim-readiness", icon: FileCheck2 },
];

const tabOptions: Array<{ key: VisitTab; label: string }> = [
  { key: "all", label: "All Visits" },
  { key: "today", label: "Today" },
  { key: "mine", label: "My Patients" },
  { key: "high-risk", label: "High Risk" },
];

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export function VisitListPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<VisitTab>("all");
  const [status, setStatus] = useState<VisitStatus | "All">("All");
  const [readiness, setReadiness] = useState<ClaimReadinessStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string>(visitRecords[0]?.id ?? "");
  const [forceError, setForceError] = useState(false);
  const [forceLoading, setForceLoading] = useState(false);
  const pageSize = 4;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = visitRecords
      .filter((visit) => {
        const text = `${visit.patientName} ${visit.visitId} ${visit.hnMasked} ${visit.department} ${visit.clinician}`.toLowerCase();
        const tabMatch = tab === "all" || (tab === "today" && visit.isToday) || (tab === "mine" && visit.assignedToMe) || (tab === "high-risk" && visit.clinicalAlertPriority <= 1);
        const statusMatch = status === "All" || visit.status === status;
        const readinessMatch = readiness === "All" || visit.claimStatus === readiness;
        return (!normalized || text.includes(normalized)) && tabMatch && statusMatch && readinessMatch;
      })
      .sort((a, b) => compareVisits(a, b, sortKey, sortDirection));
    return rows;
  }, [query, readiness, sortDirection, sortKey, status, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);

  function resetFilters() {
    setQuery("");
    setTab("all");
    setStatus("All");
    setReadiness("All");
    setPage(1);
    setForceError(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} type="button" /> : null}
      <main className="flex min-h-screen flex-col lg:pl-[260px]">
        <TopBar onOpenMenu={() => setMobileNavOpen(true)} />
        <div className="space-y-6 p-4 pt-20 md:p-8 md:pt-24">
          <PageHeader />
          <KpiGrid />
          <IntelligenceGrid />
          <VisitWorkspace
            error={forceError}
            loading={forceLoading}
            page={Math.min(page, totalPages)}
            query={query}
            readiness={readiness}
            rows={visibleRows}
            selected={selected}
            sortDirection={sortDirection}
            sortKey={sortKey}
            status={status}
            tab={tab}
            totalFiltered={filtered.length}
            totalPages={totalPages}
            onClear={resetFilters}
            onErrorToggle={() => setForceError((value) => !value)}
            onLoadingToggle={() => setForceLoading((value) => !value)}
            onPageChange={setPage}
            onQueryChange={(value) => { setQuery(value); setPage(1); }}
            onReadinessChange={(value) => { setReadiness(value); setPage(1); }}
            onSelect={setSelected}
            onSortChange={(value) => {
              setSortKey(value);
              setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            }}
            onStatusChange={(value) => { setStatus(value); setPage(1); }}
            onTabChange={(value) => { setTab(value); setPage(1); }}
          />
        </div>
      </main>
    </div>
  );
}

function compareVisits(a: VisitRecord, b: VisitRecord, key: SortKey, direction: SortDirection) {
  const modifier = direction === "asc" ? 1 : -1;
  const values: Record<SortKey, [string | number, string | number]> = {
    patient: [a.patientName, b.patientName],
    status: [a.status, b.status],
    readiness: [a.claimScore ?? -1, b.claimScore ?? -1],
    risk: [a.clinicalAlertPriority, b.clinicalAlertPriority],
    cost: [a.economicAmount ?? -1, b.economicAmount ?? -1],
  };
  const [left, right] = values[key];
  if (typeof left === "number" && typeof right === "number") return (left - right) * modifier;
  return String(left).localeCompare(String(right)) * modifier;
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-sidebar-border bg-deep-blue px-4 py-6 text-white transition-transform lg:translate-x-0`}>
      <div className="mb-8 flex items-start justify-between gap-3 px-2">
        <div>
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-xl font-black text-deep-blue">N</div><div><h1 className="text-xl font-bold">NexSure</h1><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Enterprise Healthcare</p></div></div>
        </div>
        <Button aria-label="Close navigation" className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden" onClick={onClose}><X className="h-5 w-5" /></Button>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} className={`flex items-center gap-3 rounded px-3 py-3 text-[13px] font-semibold transition-colors ${item.active ? "border-l-4 border-accent bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`} href={item.href}>
            <item.icon className="h-5 w-5" /><span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <Button className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-deep-blue hover:bg-sky-300"><Bot className="h-5 w-5" />AI Insights</Button>
      <div className="space-y-1 border-t border-white/10 pt-4"><NavUtility icon={Settings} label="Settings" /><NavUtility icon={HelpCircle} label="Support" /></div>
    </aside>
  );
}

function NavUtility({ icon: Icon, label }: { icon: IconComponent; label: string }) {
  return <a className="flex items-center gap-3 rounded px-3 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white" href="#"><Icon className="h-5 w-5" />{label}</a>;
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 md:px-8 lg:w-[calc(100%-260px)]">
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-8">
        <Button aria-label="Open navigation" className="rounded border border-border bg-white p-2 text-muted-foreground lg:hidden" onClick={onOpenMenu}><Menu className="h-5 w-5" /></Button>
        <label className="relative hidden w-full max-w-md md:block">
          <span className="sr-only">Global visit search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-full rounded-full border-0 bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Search HN, Patient Name, or Visit ID..." />
        </label>
        <button className="hidden items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary md:flex" type="button">Clinic Switcher<ChevronRight className="h-4 w-4 rotate-90" /></button>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-deep-blue focus:outline-none focus:ring-2 focus:ring-accent" href="/visits/new">+ New Visit</Link>
        <Button aria-label="AI copilot" className="hidden rounded-full p-2 text-muted-foreground hover:bg-soft-background md:grid"><Bot className="h-5 w-5" /></Button>
        <Button aria-label="Notifications" className="relative grid rounded-full p-2 text-muted-foreground hover:bg-soft-background"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /></Button>
        <div className="hidden h-8 w-8 place-items-center rounded-full border border-border bg-soft-background text-xs font-bold text-primary sm:grid">SK</div>
      </div>
    </header>
  );
}

function PageHeader() {
  return (
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-slate-950 md:text-[28px]">Visit Management</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">ติดตามสถานะการรักษา <span className="font-bold text-primary">Clinical Progress</span>, AI Assistance และ Claim Readiness ของทุก Visit</p>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-primary">
        <strong>AI Decision Support</strong><span className="block text-xs text-slate-600">AI suggestions require authorized human review before clinical or claim decisions.</span>
      </div>
    </header>
  );
}

function KpiGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" aria-label="Visit KPIs">
      {visitKpis.map((kpi) => (
        <article key={kpi.label} className={`rounded-lg border bg-white p-4 shadow-sm ${kpi.tone === "danger" ? "border-red-200 ring-1 ring-red-100" : "border-border"}`}>
          <div className="mb-2 flex items-start justify-between"><span className="text-xs font-semibold text-muted-foreground">{kpi.label}</span><kpi.icon className={`h-5 w-5 ${kpi.tone === "danger" ? "text-danger" : kpi.tone === "success" ? "text-success" : "text-primary"}`} /></div>
          <div className="flex items-end justify-between gap-2"><strong className={`text-2xl ${kpi.tone === "danger" ? "text-danger" : kpi.tone === "info" ? "text-accent" : "text-primary"}`}>{kpi.value}</strong>{kpi.trend ? <span className="text-xs font-bold text-success">{kpi.trend}</span> : null}</div>
          {kpi.helper ? <p className="mt-1 text-xs text-muted-foreground">{kpi.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}

function IntelligenceGrid() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12" aria-label="Visit operational intelligence">
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm lg:col-span-8">
        <div className="mb-5 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><Stethoscope className="h-5 w-5 text-primary" />Queue Snapshot Panel</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live Updates</span></div>
        <div className="grid gap-4 md:grid-cols-3">{queueSnapshots.map((item) => <QueueCard key={item.label} item={item} />)}</div>
      </div>
      <div className="rounded-lg bg-primary p-5 text-white shadow-sm lg:col-span-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent"><ShieldCheck className="h-4 w-4" />Insurance Intelligence</p>
        <h3 className="text-xl font-bold">Claim Readiness</h3>
        <p className="mt-2 text-sm text-blue-100">Decision support based on clinical completeness, evidence, payer rules, and cost signals.</p>
        <div className="mt-6 space-y-4"><div><div className="mb-1 flex justify-between text-xs"><span>Daily Target Readiness</span><strong className="text-accent">82%</strong></div><div className="flex h-3 overflow-hidden rounded-full bg-white/15"><span className="bg-accent" style={{ width: "82%" }} /><span className="bg-amber-400" style={{ width: "10%" }} /><span className="bg-red-400" style={{ width: "8%" }} /></div></div><div className="grid grid-cols-2 gap-3"><MiniMetric label="Evidence Score" value="94.2" /><MiniMetric label="Payer Alignment" value="High" /></div></div>
      </div>
    </section>
  );
}

function QueueCard({ item }: { item: (typeof queueSnapshots)[number] }) {
  const styles = item.tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : item.tone === "success" ? "border-emerald-100 bg-slate-50 text-slate-900" : "border-slate-100 bg-slate-50 text-slate-900";
  const bar = item.tone === "warning" ? "bg-warning" : item.tone === "success" ? "bg-success" : "bg-ai";
  return <article className={`rounded-lg border p-4 ${styles}`}><div className="flex justify-between"><item.icon className="h-8 w-8 rounded-lg bg-white p-2 text-primary" /><span className="text-sm font-semibold">{item.label}</span></div><div className="mt-4 flex items-baseline gap-2"><strong className="text-3xl">{item.value}</strong><span className="text-xs opacity-70">Total</span></div><div className="mt-4 text-xs"><div className="mb-1 flex justify-between"><span>Avg Wait</span><strong>{item.averageWait}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><span className={`block h-full ${bar}`} style={{ width: `${item.progress}%` }} /></div></div>{item.alert ? <p className="mt-3 rounded bg-white/70 px-2 py-1 text-[10px] font-bold">{item.alert}</p> : null}</article>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/10 p-3"><p className="text-[10px] uppercase text-blue-100">{label}</p><strong className="text-xl">{value}</strong></div>;
}

function VisitWorkspace(props: {
  error: boolean; loading: boolean; page: number; query: string; readiness: ClaimReadinessStatus | "All"; rows: VisitRecord[]; selected: string; sortDirection: SortDirection; sortKey: SortKey; status: VisitStatus | "All"; tab: VisitTab; totalFiltered: number; totalPages: number;
  onClear: () => void; onErrorToggle: () => void; onLoadingToggle: () => void; onPageChange: (page: number) => void; onQueryChange: (value: string) => void; onReadinessChange: (value: ClaimReadinessStatus | "All") => void; onSelect: (id: string) => void; onSortChange: (key: SortKey) => void; onStatusChange: (value: VisitStatus | "All") => void; onTabChange: (value: VisitTab) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white shadow-sm" aria-label="Visit worklist">
      <div className="flex flex-col gap-4 border-b border-border p-4 md:p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">{tabOptions.map((option) => <Button key={option.key} className={`rounded-full px-4 py-2 text-xs font-bold ${props.tab === option.key ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:bg-soft-background"}`} onClick={() => props.onTabChange(option.key)}>{option.label}{option.key === "high-risk" ? <span className="ml-2 rounded-full bg-danger px-1.5 text-[10px] text-white">3</span> : null}</Button>)}</div>
          <div className="flex items-center gap-2"><Button aria-label="Toggle loading state" className="rounded border border-border p-2 text-muted-foreground hover:bg-soft-background" onClick={props.onLoadingToggle}><SlidersHorizontal className="h-4 w-4" /></Button><Button aria-label="Export filtered visits" className="rounded border border-border p-2 text-muted-foreground hover:bg-soft-background"><Download className="h-4 w-4" /></Button></div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[240px] flex-1"><span className="sr-only">Search visit table</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="w-full rounded border border-border bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Search Visit ID, patient, HN, department..." value={props.query} onChange={(event) => props.onQueryChange(event.target.value)} /></label>
          <Select label="Clinical progress" value={props.status} options={["All", "Waiting", "In Consultation", "Pharmacy", "Completed"]} onChange={(value) => props.onStatusChange(value as VisitStatus | "All")} />
          <Select label="Claim status" value={props.readiness} options={["All", "Ready", "Needs Review", "Not Ready", "Calculating"]} onChange={(value) => props.onReadinessChange(value as ClaimReadinessStatus | "All")} />
          <Select label="Sort visits" value={props.sortKey} options={["risk", "patient", "status", "readiness", "cost"]} onChange={(value) => props.onSortChange(value as SortKey)} />
          <Button className="inline-flex min-h-10 items-center gap-2 rounded border border-border px-3 text-sm font-semibold text-primary hover:bg-soft-background" onClick={props.onClear}><Filter className="h-4 w-4" />Clear</Button>
          <Button className="min-h-10 rounded border border-border px-3 text-sm text-muted-foreground hover:bg-soft-background" onClick={props.onErrorToggle}>Error state</Button>
        </div>
      </div>
      {props.error ? <StatePanel title="Visit data unavailable" text="ไม่สามารถโหลดข้อมูล Visit ได้ กรุณาลองใหม่อีกครั้ง โดยไม่มีการเปิดเผยข้อมูลภายในระบบ" action="Retry" onAction={props.onErrorToggle} /> : props.loading ? <LoadingRows /> : props.rows.length === 0 ? <StatePanel title="No visits match the current filters" text="ไม่พบรายการ Visit ตามเงื่อนไขที่เลือก ล้างตัวกรองหรือลองค้นหาใหม่" action="Clear filters" onAction={props.onClear} /> : <VisitTable rows={props.rows} selected={props.selected} sortDirection={props.sortDirection} sortKey={props.sortKey} onSelect={props.onSelect} />}
      <div className="flex flex-col gap-3 border-t border-border bg-slate-50 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {props.rows.length ? (props.page - 1) * 4 + 1 : 0}-{(props.page - 1) * 4 + props.rows.length} of {props.totalFiltered} visits</span>
        <div className="flex items-center gap-2" aria-label="Pagination">
          <Button aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded border border-border bg-white disabled:opacity-40" disabled={props.page === 1} onClick={() => props.onPageChange(Math.max(1, props.page - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="rounded bg-primary px-3 py-1.5 font-bold text-white">{props.page}</span>
          <span>of {props.totalPages}</span>
          <Button aria-label="Next page" className="grid h-8 w-8 place-items-center rounded border border-border bg-white disabled:opacity-40" disabled={props.page === props.totalPages} onClick={() => props.onPageChange(Math.min(props.totalPages, props.page + 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </section>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span className="sr-only">{label}</span><select className="min-h-10 rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function VisitTable({ rows, selected, sortDirection, sortKey, onSelect }: { rows: VisitRecord[]; selected: string; sortDirection: SortDirection; sortKey: SortKey; onSelect: (id: string) => void }) {
  const headings = ["", "Visit / Patient", "Clinical Progress", "AI Assistance", "Claim Status", "Evidence / Risk", "Economic Signal", "Action"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead className="border-b border-border bg-slate-50"><tr>{headings.map((heading) => <th key={heading || "select"} className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">{heading || <Checkbox aria-label="Select all visible visits" />}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{rows.map((visit) => <VisitRow key={visit.id} visit={visit} selected={selected === visit.id} sortDirection={sortDirection} sortKey={sortKey} onSelect={() => onSelect(visit.id)} />)}</tbody>
      </table>
    </div>
  );
}

function VisitRow({ visit, selected, sortDirection, sortKey, onSelect }: { visit: VisitRecord; selected: boolean; sortDirection: SortDirection; sortKey: SortKey; onSelect: () => void }) {
  const canAct = visit.allowedActions.includes(currentVisitRole);
  return (
    <tr className={`group transition-colors hover:bg-blue-50/70 ${selected ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""}`} onClick={onSelect}>
      <td className="px-4 py-4"><Checkbox aria-label={`Select visit ${visit.visitId}`} checked={selected} readOnly /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{visit.initials}</div><div><Link className="font-bold text-slate-950 hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent" href={`/patients/${visit.patientId}`} onClick={(event) => event.stopPropagation()}>{visit.patientName}</Link><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link className="font-bold text-primary hover:underline" href={`/visits/${visit.visitId}`} onClick={(event) => event.stopPropagation()}>{visit.visitId}</Link><span>{visit.hnMasked}</span><span>{visit.demographics}</span></div><p className="mt-1 text-[11px] text-muted-foreground">{visit.department} · {visit.clinician}</p></div></div>
      </td>
      <td className="px-4 py-4"><Progress visit={visit} /></td>
      <td className="px-4 py-4"><AiCell visit={visit} /></td>
      <td className="px-4 py-4"><ClaimCell visit={visit} /></td>
      <td className="px-4 py-4"><RiskCell visit={visit} /></td>
      <td className="px-4 py-4"><EconomicCell visit={visit} /></td>
      <td className="px-4 py-4 text-right"><Link aria-label={`Open visit ${visit.visitId}`} className="inline-grid h-9 w-9 place-items-center rounded text-muted-foreground hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent" href={`/visits/${visit.visitId}`} onClick={(event) => event.stopPropagation()}>{canAct ? <ChevronRight className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}</Link><span className="sr-only">{sortKey} {sortDirection}</span></td>
    </tr>
  );
}

function Progress({ visit }: { visit: VisitRecord }) {
  const pct = Math.round((visit.completedSteps / visit.totalSteps) * 100);
  const color = visit.status === "Completed" ? "bg-success" : visit.status === "Waiting" ? "bg-blue-300" : "bg-primary";
  return <div className="max-w-[150px]"><p className="text-sm font-semibold text-slate-950">{visit.completedSteps} of {visit.totalSteps} completed</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full ${color}`} style={{ width: `${pct}%` }} /></div><StatusBadge status={visit.status} /></div>;
}

function StatusBadge({ status }: { status: VisitStatus }) {
  const styles: Record<VisitStatus, string> = { Waiting: "text-slate-600", "In Consultation": "text-primary", Pharmacy: "text-amber-700", Completed: "text-success" };
  return <span className={`mt-1 block text-[10px] font-bold uppercase ${styles[status]}`}>{status}</span>;
}

function AiCell({ visit }: { visit: VisitRecord }) {
  if (visit.aiState === "Processing") return <p className="text-sm text-muted-foreground">Processing...</p>;
  const needsReview = visit.aiState === "Suggested";
  return <div><p className={`flex items-center gap-1.5 text-sm font-bold ${needsReview ? "text-amber-700" : "text-accent"}`}><Bot className="h-4 w-4" />{needsReview ? "AI Suggested" : "AI Assisted"}</p><p className="mt-1 text-xs text-muted-foreground">{visit.aiSummary}</p><p className="mt-1 text-[10px] font-semibold uppercase text-slate-500">Human review required</p></div>;
}

function ClaimCell({ visit }: { visit: VisitRecord }) {
  if (visit.claimScore === null) return <div className="flex items-center gap-3"><div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-100 border-t-accent" /><span className="text-sm font-semibold text-muted-foreground">Calculating</span></div>;
  const color = visit.claimStatus === "Ready" ? "text-success" : visit.claimStatus === "Needs Review" ? "text-warning" : "text-danger";
  return <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full border-4 border-blue-100 text-[10px] font-bold text-slate-950">{visit.claimScore}/100</div><div><p className={`text-sm font-bold ${color}`}>{visit.claimStatus}</p><p className="text-[10px] text-muted-foreground">Not claim approval</p></div></div>;
}

function RiskCell({ visit }: { visit: VisitRecord }) {
  const styles: Record<RiskLevel, string> = { Critical: "border-red-200 bg-red-50 text-danger", "High Clinical Risk": "border-red-200 bg-red-50 text-danger", "Medication Risk": "border-amber-200 bg-amber-50 text-amber-700", "Economic Alert": "border-amber-200 bg-amber-50 text-amber-700", Low: "border-emerald-200 bg-emerald-50 text-success" };
  const Icon = visit.clinicalAlertPriority <= 1 ? ShieldAlert : ShieldCheck;
  return <div><p className="flex items-center gap-1.5 text-sm font-bold text-slate-700"><FileCheck2 className="h-4 w-4" />{visit.evidenceSummary}</p><span className={`mt-2 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${styles[visit.risk]}`}><Icon className="h-3 w-3" />{visit.risk}</span></div>;
}

function EconomicCell({ visit }: { visit: VisitRecord }) {
  const isOutlier = visit.economicSignal === "Outlier";
  return <div><p className={`text-base font-bold ${isOutlier ? "text-danger" : "text-slate-950"}`}>{visit.economicAmount === null ? "THB --" : money.format(visit.economicAmount)}</p><p className={`mt-1 text-xs font-bold ${isOutlier ? "text-danger" : visit.economicSignal === "Pending" ? "text-muted-foreground" : "text-success"}`}>{visit.economicSignal}</p></div>;
}

function StatePanel({ title, text, action, onAction }: { title: string; text: string; action: string; onAction: () => void }) {
  return <div className="grid min-h-72 place-items-center p-8 text-center"><div><h3 className="text-base font-bold text-slate-950">{title}</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p><Button className="mt-4 rounded bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-deep-blue" onClick={onAction}>{action}</Button></div></div>;
}

function LoadingRows() {
  return <div className="space-y-3 p-5" aria-label="Loading visits">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}</div>;
}
