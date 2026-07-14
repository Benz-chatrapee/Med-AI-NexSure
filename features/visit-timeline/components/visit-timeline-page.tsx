"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpWideNarrow,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronsDown,
  ClipboardList,
  Copy,
  Database,
  ExternalLink,
  FileWarning,
  Filter,
  GitCompare,
  Home,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  claimReadiness,
  missingEvidence,
  recentActivity,
  timelineEvents,
  timelineSummary,
  visitContext,
} from "../data/visit-timeline.mock";
import type { TimelineCategory, TimelineEvent } from "../types/visit-timeline.types";

type ToastState = { title: string; text: string } | null;

const tabs: Array<{ id: TimelineCategory; label: string }> = [
  { id: "all", label: "All Events" },
  { id: "clinical", label: "Clinical" },
  { id: "document", label: "Documentation" },
  { id: "ai", label: "AI" },
  { id: "insurance", label: "Insurance" },
  { id: "audit", label: "Audit" },
];

const badgeClass = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  ai: "border-blue-100 bg-blue-50 text-blue-700",
  azure: "border-sky-100 bg-sky-50 text-sky-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  red: "border-red-100 bg-red-50 text-red-700",
  gray: "border-slate-200 bg-slate-100 text-slate-600",
};

const severityIconClass = {
  neutral: "border-blue-100 bg-white text-blue-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  critical: "border-red-100 bg-red-50 text-red-700",
  ai: "border-blue-100 bg-blue-50 text-blue-700",
};

export function VisitTimelinePage({ visitId }: { visitId: string }) {
  const [activeView, setActiveView] = useState<TimelineCategory>("all");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"ready" | "loading" | "error" | "empty">("ready");

  const filteredEvents = useMemo(() => {
    if (mode === "empty") return [];
    const normalized = search.trim().toLowerCase();
    const matched = timelineEvents.filter((event) => {
      const matchesView = activeView === "all" || event.category.includes(activeView);
      const matchesSearch =
        !normalized ||
        event.title.toLowerCase().includes(normalized) ||
        event.actor.toLowerCase().includes(normalized) ||
        event.searchText.includes(normalized) ||
        event.description?.toLowerCase().includes(normalized);
      return matchesView && matchesSearch;
    });
    return newestFirst ? matched : [...matched].reverse();
  }, [activeView, search, newestFirst, mode]);

  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
      groups[event.day] = [...(groups[event.day] ?? []), event];
      return groups;
    }, {});
  }, [filteredEvents]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!selectedEvent) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedEvent(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedEvent]);

  function showToast(title: string, text: string) {
    setToast({ title, text });
  }

  function chooseView(view: TimelineCategory) {
    setActiveView(view);
    setMode("ready");
  }

  function clearFilters() {
    setActiveView("all");
    setSearch("");
    setMode("ready");
    showToast("Advanced Filters Cleared", "ระบบแสดง Timeline Events ทั้งหมดอีกครั้ง");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 [--sidebar:252px] [--topbar:72px]">
      {sidebarOpen ? <button aria-label="Close mobile sidebar" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setSidebarOpen(false)} type="button" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar)] flex-col border-r border-white/10 bg-[#0F2A5F] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[var(--topbar)] items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-blue-600 font-extrabold shadow-lg">N</div>
          <div>
            <div className="text-base font-extrabold tracking-tight">Med AI NexSure</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">Enterprise Platform</div>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-3">
          <NavGroup title="Operations" items={["Dashboard", "Patients", "Visits", "SOAP Notes", "Claim Readiness"]} active="Visits" />
          <NavGroup title="Intelligence" items={["Clinical AI", "Insurance AI", "Evidence Package", "Audit & Compliance"]} />
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 font-extrabold">MH</div>
            <div>
              <div className="text-xs font-bold">Metro Health</div>
              <div className="text-[10px] text-slate-400">Provider Workspace</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[var(--sidebar)]">
        <header className="sticky top-0 z-30 flex h-[var(--topbar)] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 lg:hidden" onClick={() => setSidebarOpen(true)} type="button" aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <label className="hidden h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500 md:flex">
            <Search className="h-4 w-4" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search patient, visit, claim, policy..." />
            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">⌘K</span>
          </label>
          <div className="ml-auto flex items-center gap-2">
            <IconButton label="Notifications"><Bell className="h-4 w-4" /></IconButton>
            <IconButton label="Activity"><Activity className="h-4 w-4" /></IconButton>
            <div className="hidden items-center gap-3 pl-2 sm:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-blue-100 font-extrabold text-blue-900">AN</div>
              <div>
                <div className="text-xs font-bold">Dr. Anan</div>
                <div className="text-[10px] text-slate-500">Physician Reviewer</div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1920px] px-4 py-5 lg:px-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <Home className="h-3.5 w-3.5" /> Visits <span>/</span> <span>{visitId}</span> <span>/</span> <strong className="text-slate-800">Timeline</strong>
          </div>

          <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.09em] text-blue-700">
                <CalendarClock className="h-4 w-4" /> Visit Intelligence Timeline
              </div>
              <h1 className="m-0 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Visit Timeline</h1>
              <p className="mt-2 text-sm text-slate-500">Clinical, documentation, insurance, AI decision-support, and audit activity for the active visit.</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <ActionButton onClick={() => showToast("Evidence Package Opened", "เปิดชุดเอกสารประกอบเคลมสำหรับ Visit นี้แล้ว")}><Database className="h-4 w-4" />Evidence Package</ActionButton>
              <ActionButton onClick={() => showToast("Audit View Opened", "แสดง Audit View สำหรับ Visit Timeline แล้ว")}><ClipboardList className="h-4 w-4" />Audit View</ActionButton>
              <ActionButton primary onClick={() => showToast("Claim Readiness Reviewed", "ส่งต่อให้ Claim Reviewer ตรวจสอบต่อแล้ว")}><ShieldCheck className="h-4 w-4" />Review Claim</ActionButton>
            </div>
          </section>

          <section className="mb-4 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700"><AlertTriangle className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-red-700">Critical Clinical Safety Alert</div>
              <p className="mt-1 text-xs text-slate-600">AI output is decision support only. Missing evidence and clinical documentation gaps require authorized human review before claim submission.</p>
            </div>
            <button className="ml-auto hidden rounded-lg border border-red-100 bg-white px-3 text-xs font-bold text-red-700 sm:inline-flex" onClick={() => showToast("Safety Alert Acknowledged", "Clinical safety reminder remains visible in the audit context")} type="button">Acknowledge</button>
          </section>

          <VisitContextCard />
          <KpiCards activeView={activeView} onSelect={chooseView} />
          <Toolbar activeView={activeView} search={search} newestFirst={newestFirst} resultCount={filteredEvents.length} onClear={clearFilters} onMode={setMode} onSearch={setSearch} onSort={() => { setNewestFirst((value) => !value); showToast("Timeline Order Updated", newestFirst ? "แสดงเหตุการณ์เก่าสุดก่อน" : "แสดงเหตุการณ์ล่าสุดก่อน"); }} onView={chooseView} />

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-extrabold"><Activity className="h-4 w-4 text-blue-700" /> Timeline Events</div>
                <div className="text-[10px] text-slate-500">Showing {filteredEvents.length} matching events · Latest update 3 minutes ago</div>
              </div>
              {mode === "loading" ? <StateCard title="Loading visit timeline" text="Fetching timeline events and readiness intelligence..." /> : null}
              {mode === "error" ? <StateCard danger title="Timeline unavailable" text="No data changed. Retry or review the audit trail before operational decisions." /> : null}
              {mode !== "loading" && mode !== "error" && filteredEvents.length === 0 ? (
                <StateCard title={mode === "empty" ? "No timeline events yet" : "No matching timeline results"} text={mode === "empty" ? "This visit has no recorded clinical, claim, or audit events." : "Adjust filters or clear search to show the full visit timeline."} />
              ) : null}
              {mode === "ready" ? (
                <div className="space-y-4">
                  {Object.entries(groupedEvents).map(([day, events]) => (
                    <div key={day}>
                      <div className="sticky top-[82px] z-10 ml-12 mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[10px] font-extrabold text-slate-600 shadow-sm">
                        <CalendarClock className="h-3.5 w-3.5" /> {day}
                      </div>
                      <div className="relative before:absolute before:bottom-3 before:left-6 before:top-2 before:w-0.5 before:bg-blue-200">
                        {events.map((event) => <TimelineEventCard event={event} key={event.id} onAction={showToast} onOpen={setSelectedEvent} />)}
                      </div>
                    </div>
                  ))}
                  <button className="mx-auto flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm" onClick={() => showToast("Earlier Events Loaded", "เพิ่มเหตุการณ์ย้อนหลังอีก 8 รายการใน Timeline แล้ว")} type="button">
                    <ChevronsDown className="h-4 w-4" /> Load Earlier Events
                  </button>
                </div>
              ) : null}
            </section>
            <IntelligencePanel onToast={showToast} />
          </div>
        </div>
      </main>

      <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} onToast={showToast} />
      <Toast toast={toast} />
    </div>
  );
}

function NavGroup({ title, items, active }: { title: string; items: string[]; active?: string }) {
  return (
    <div className="mb-4">
      <div className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-300">{title}</div>
      {items.map((item) => (
        <div className={`my-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${active === item ? "border border-blue-200/25 bg-blue-600/25 text-white shadow-inner" : "text-slate-300 hover:bg-white/10 hover:text-white"}`} key={item}>
          <LayoutDashboard className="h-4 w-4" /> {item}
        </div>
      ))}
    </div>
  );
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return <button aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700" type="button">{children}</button>;
}

function ActionButton({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return <button className={`inline-flex min-h-10 w-[168px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold shadow-sm ${primary ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"}`} onClick={onClick} type="button">{children}</button>;
}

function VisitContextCard() {
  const cells = [
    ["Visit Type", visitContext.visitType],
    ["Department", visitContext.department],
    ["Physician", visitContext.physician],
    ["Payer", visitContext.payer],
    ["Policy", visitContext.policy],
    ["Status", visitContext.visitStatus],
  ];
  return (
    <section className="mb-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.25fr_repeat(6,minmax(110px,1fr))]">
      <div className="flex items-center gap-4 border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
        <div className="grid h-13 w-13 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-lg font-extrabold text-blue-900">{visitContext.patientInitials}</div>
        <div>
          <div className="font-extrabold">{visitContext.patientName}</div>
          <div className="mt-1 text-[11px] text-slate-500">{visitContext.patientMeta}</div>
        </div>
      </div>
      {cells.map(([label, value]) => (
        <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r last:border-r-0" key={label}>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
          <div className={`text-xs font-bold ${label === "Status" ? "text-red-700" : "text-slate-800"}`}>{label === "Status" ? <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" /> : null}{value}</div>
        </div>
      ))}
    </section>
  );
}

function KpiCards({ activeView, onSelect }: { activeView: TimelineCategory; onSelect: (view: TimelineCategory) => void }) {
  return (
    <section className="mb-4 flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
      {timelineSummary.map((item) => (
        <button className={`min-w-[185px] rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md ${activeView === item.id ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-200"}`} key={item.id} onClick={() => onSelect(item.id)} type="button">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">{item.label}</div>
            <div className={`grid h-8 w-8 place-items-center rounded-lg ${item.tone === "warning" ? "bg-amber-50 text-amber-700" : item.tone === "score" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}><Activity className="h-4 w-4" /></div>
          </div>
          <div className={`mt-2 text-2xl font-extrabold tracking-[-0.04em] ${item.tone === "warning" ? "text-amber-700" : item.tone === "score" ? "text-emerald-700" : "text-slate-950"}`}>{item.value}</div>
          <div className="mt-1 text-[10px] text-slate-500">{item.footnote}</div>
        </button>
      ))}
    </section>
  );
}

function Toolbar(props: {
  activeView: TimelineCategory;
  search: string;
  newestFirst: boolean;
  resultCount: number;
  onClear: () => void;
  onMode: (mode: "ready" | "loading" | "error" | "empty") => void;
  onSearch: (value: string) => void;
  onSort: () => void;
  onView: (view: TimelineCategory) => void;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button className={`inline-flex whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${props.activeView === tab.id ? "border border-blue-200 bg-white text-blue-900 shadow-sm" : "text-slate-500"}`} key={tab.id} onClick={() => props.onView(tab.id)} type="button">{tab.label}</button>
          ))}
        </div>
        <div className="hidden h-7 w-px bg-slate-200 md:block" />
        <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input className="w-full bg-transparent text-[11px] outline-none" onChange={(event) => props.onSearch(event.target.value)} placeholder="Search event, actor, ICD, policy, evidence..." value={props.search} />
        </label>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600" onClick={props.onSort} type="button">
          {props.newestFirst ? <ArrowDownWideNarrow className="h-4 w-4" /> : <ArrowUpWideNarrow className="h-4 w-4" />}
          {props.newestFirst ? "Newest First" : "Oldest First"}
        </button>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600" type="button"><Filter className="h-4 w-4" />Advanced <ChevronDown className="h-3.5 w-3.5" /></button>
        <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600" onChange={(event) => props.onMode(event.target.value as "ready" | "loading" | "error" | "empty")} defaultValue="ready" aria-label="Preview timeline state">
          <option value="ready">Preview: Populated</option>
          <option value="loading">Preview: Loading</option>
          <option value="error">Preview: Error</option>
          <option value="empty">Preview: Empty</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">View: {tabs.find((tab) => tab.id === props.activeView)?.label}</span>
        {props.search ? <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Search: {props.search}</span> : null}
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{props.resultCount} Results</span>
        <button className="ml-auto text-[10px] font-bold text-slate-500" onClick={props.onClear} type="button">Clear Filters</button>
      </div>
    </section>
  );
}

function TimelineEventCard({ event, onAction, onOpen }: { event: TimelineEvent; onAction: (title: string, text: string) => void; onOpen: (event: TimelineEvent) => void }) {
  const Icon = event.icon;
  return (
    <article className="relative grid grid-cols-[48px_minmax(0,1fr)] pb-3">
      <div className="relative z-10 pt-4">
        <div className={`ml-2 grid h-9 w-9 place-items-center rounded-xl border-2 shadow-[0_0_0_4px_#f8fafc] ${severityIconClass[event.severity]}`}><Icon className="h-4.5 w-4.5" /></div>
      </div>
      <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-100 hover:shadow-md ${event.severity === "critical" ? "border-l-4 border-l-red-600" : event.severity === "ai" ? "border-l-4 border-l-blue-600" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">{event.title}</h3>
              {event.badges.map((badge) => <span className={`rounded-full border px-2 py-1 text-[9px] font-extrabold ${badgeClass[badge.tone]}`} key={`${event.id}-${badge.label}`}>{badge.label}</span>)}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">{event.actor}</div>
          </div>
          <time className="whitespace-nowrap text-[10px] text-slate-500">{event.time}</time>
        </div>
        {event.description ? <p className="my-3 text-[11px] leading-6 text-slate-600">{event.description}</p> : null}
        {event.metrics ? <div className="mt-3 flex flex-wrap gap-3">{event.metrics.map((metric) => <span className="text-[10px] text-slate-600" key={metric.label}>{metric.label} <strong>{metric.value}</strong></span>)}</div> : null}
        {event.details?.scoreImpact ? (
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3 text-center">
            <div><span className="block text-[9px] font-bold uppercase text-slate-500">Previous Score</span><strong className="text-lg">{event.details.scoreImpact.previous}</strong></div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div><span className="block text-[9px] font-bold uppercase text-slate-500">Current Score</span><strong className="text-lg text-emerald-700">{event.details.scoreImpact.current}</strong></div>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {event.actions.map((action, index) => (
            <button className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline" key={action} onClick={() => index === 0 ? onOpen(event) : onAction(action, `${action} queued for ${event.title}`)} type="button">
              <ExternalLink className="h-3.5 w-3.5" /> {action}
            </button>
          ))}
          <button className="ml-auto text-slate-400" onClick={() => onAction("More Actions", "Additional event actions are available to authorized reviewers")} type="button" aria-label={`More actions for ${event.title}`}><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

function IntelligencePanel({ onToast }: { onToast: (title: string, text: string) => void }) {
  return (
    <aside className="space-y-3 xl:sticky xl:top-[88px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold"><ShieldCheck className="h-4 w-4 text-blue-700" /> Claim View Readiness</div>
          <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[9px] font-extrabold text-amber-700">Needs Review</span>
        </div>
        <div className="grid grid-cols-[92px_1fr] items-center gap-4 border-b border-slate-100 pb-4">
          <div className="relative grid h-[88px] w-[88px] place-items-center rounded-full bg-[conic-gradient(#d97706_82%,#f1f5f9_0)] before:absolute before:inset-2 before:rounded-full before:bg-white">
            <div className="relative text-center"><strong className="block text-2xl leading-none">{claimReadiness.score}</strong><span className="text-[9px] text-slate-500">out of 100</span></div>
          </div>
          <div>
            <div className="text-base font-extrabold text-amber-700">{claimReadiness.status}</div>
            <div className="whitespace-pre-line text-[10px] text-slate-500">{claimReadiness.help}</div>
            <span className="mt-2 inline-flex rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[9px] font-extrabold text-sky-700">{claimReadiness.improvement}</span>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {claimReadiness.breakdown.map((row) => (
            <div className="grid grid-cols-[1fr_36px] items-center gap-2" key={row.label}>
              <div>
                <div className="mb-1 flex justify-between text-[9px] text-slate-600"><span>{row.label}</span><span>{row.points}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${row.tone === "good" ? "bg-emerald-600" : row.tone === "warning" ? "bg-amber-600" : "bg-blue-600"}`} style={{ width: `${row.percent}%` }} /></div>
              </div>
              <div className="text-right text-[10px] font-extrabold">{row.percent}%</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-blue-900 bg-blue-900 px-3 text-xs font-bold text-white" onClick={() => onToast("Readiness Score Recalculated", "คะแนนล่าสุดคือ 82/100 และยังอยู่ในสถานะ Needs Review")} type="button"><RefreshCw className="h-4 w-4" />Recalculate Score</button>
          <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700" type="button"><ExternalLink className="h-4 w-4" />View Readiness Detail</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-extrabold"><FileWarning className="h-4 w-4 text-amber-700" /> Missing Evidence Completeness</div><span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[9px] font-extrabold text-amber-700">2 Action Items</span></div>
        <div className="space-y-2">
          {missingEvidence.map((item) => (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3" key={item.id}>
              <div className="flex gap-2"><TriangleAlertIcon /><div><div className="text-xs font-extrabold text-slate-800">{item.title}</div><div className="mt-1 text-[10px] text-slate-500">{item.meta}</div></div></div>
              <button className="mt-2 text-[10px] font-extrabold text-blue-700" onClick={() => onToast(item.action, "ระบบได้เน้นข้อมูลที่จำเป็นต้องดำเนินการให้ครบถ้วนแล้ว")} type="button">{item.action} →</button>
            </div>
          ))}
        </div>
        <button className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700" type="button"><Plus className="h-4 w-4" />Add Supporting Evidence Completeness</button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-extrabold"><Activity className="h-4 w-4" /> Recent Visit Activity</div><button className="text-[10px] font-bold text-blue-700" type="button">View All</button></div>
        <div className="space-y-3">
          {recentActivity.map((item) => <div className="flex gap-3" key={item.id}><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-900">{item.initials}</div><div><div className="text-[11px] text-slate-700">{item.text}</div><div className="mt-1 text-[10px] text-slate-500">{item.time}</div></div></div>)}
        </div>
      </section>
    </aside>
  );
}

function TriangleAlertIcon() {
  return <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-amber-700"><AlertTriangle className="h-4 w-4" /></div>;
}

function EventDrawer({ event, onClose, onToast }: { event: TimelineEvent | null; onClose: () => void; onToast: (title: string, text: string) => void }) {
  if (!event) return null;
  const Icon = event.icon;
  return (
    <>
      <button aria-label="Close event detail drawer" className="fixed inset-0 z-50 bg-slate-950/35" onClick={onClose} type="button" />
      <aside aria-modal="true" className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:max-w-[520px]" role="dialog">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <div className={`grid h-10 w-10 place-items-center rounded-xl border-2 ${severityIconClass[event.severity]}`}><Icon className="h-5 w-5" /></div>
          <div className="min-w-0"><h2 className="text-base font-extrabold">{event.title}</h2><div className="text-[10px] text-slate-500">Event ID: {event.details?.eventRef ?? event.id} · Audit View Ref: {event.details?.auditRef ?? "AUD-VISIT-TL"}</div></div>
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600" onClick={onClose} type="button" aria-label="Close drawer"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <DrawerSection title="Event Information">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Timestamp", event.details?.timestamp ?? `${event.day} · ${event.time}`],
                ["Source", event.details?.source ?? "User-Initiated"],
                ["Actor or Service", event.actor],
                ["Department", event.details?.department ?? visitContext.department],
                ["Related Module", event.details?.module ?? "Visit Timeline"],
                ["Severity", event.severity],
              ].map(([label, value]) => <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={label}><div className="text-[9px] font-bold uppercase text-slate-500">{label}</div><div className="mt-1 text-xs font-bold text-slate-800">{value}</div></div>)}
            </div>
          </DrawerSection>
          <DrawerSection title="Operational Description"><p className="text-[11px] leading-6 text-slate-600">{event.details?.operationalDescription ?? event.description ?? "Event detail recorded for visit timeline and audit traceability."}</p></DrawerSection>
          {event.details?.scoreImpact ? <DrawerSection title="Version & Value Change"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3 text-center"><div><span className="block text-[9px] font-bold uppercase text-slate-500">Previous Score</span><strong className="text-xl">{event.details.scoreImpact.previous}</strong></div><ArrowRight className="h-4 w-4 text-slate-400" /><div><span className="block text-[9px] font-bold uppercase text-slate-500">Current Score</span><strong className="text-xl text-emerald-700">{event.details.scoreImpact.current}</strong></div></div></DrawerSection> : null}
          <DrawerSection title="AI Decision-Support Metadata">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-blue-700"><Sparkles className="h-4 w-4" /> AI-Assisted Decision Support</div>
              <p className="text-[11px] leading-6 text-slate-600"><strong>Service:</strong> Claim View Intelligence Engine v2.4<br /><strong>Rule set:</strong> AIA Health Plus OPD 2026.06<br /><strong>Disclaimer:</strong> AI output is decision-support information only. กรุณาใช้วิจารณญาณของแพทย์หรือ Claim Reviewer ก่อนยืนยันผล</p>
              <div className="mt-2 flex flex-wrap gap-1"><span className="rounded-full border border-blue-100 bg-white px-2 py-1 text-[9px] font-extrabold text-blue-700">Model logged</span><span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700">Rules passed 8/10</span><span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[9px] font-extrabold text-amber-700">Human review required</span></div>
            </div>
          </DrawerSection>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 p-4">
          <ActionButton primary onClick={() => onToast("Full Record Opened", "Opening full timeline source record")}><ExternalLink className="h-4 w-4" />View Full Record</ActionButton>
          <ActionButton onClick={() => onToast("Compare Versions", "Version comparison opened")}><GitCompare className="h-4 w-4" />Compare Versions</ActionButton>
          <ActionButton onClick={() => onToast("Reference Copied", event.details?.auditRef ?? event.id)}><Copy className="h-4 w-4" />Copy Reference ID</ActionButton>
        </div>
      </aside>
    </>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-4"><h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">{title}</h3>{children}</section>;
}

function StateCard({ title, text, danger = false }: { title: string; text: string; danger?: boolean }) {
  return <div className={`rounded-2xl border bg-white p-8 text-center shadow-sm ${danger ? "border-red-100" : "border-slate-200"}`}><div className={`mx-auto grid h-12 w-12 place-items-center rounded-xl ${danger ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>{danger ? <AlertTriangle className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}</div><h3 className="mt-3 text-base font-extrabold">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-2xl transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} role="status" aria-live="polite">
      <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
      <div><div className="text-sm font-extrabold">{toast?.title ?? "Action Completed"}</div><div className="mt-1 text-xs text-slate-300">{toast?.text ?? "ดำเนินการเรียบร้อยแล้ว"}</div></div>
    </div>
  );
}
