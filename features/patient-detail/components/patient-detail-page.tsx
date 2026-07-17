"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Edit3,
  FileCheck2,
  FileText,
  HelpCircle,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NamedStatus, PatientDetailData, PatientKpi, TableRow, VisitRecord } from "../types/patient-detail.types";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: User, active: true },
  { label: "Visits", href: "/visits", icon: History },
  { label: "AI Clinical Engine", href: "/ai-clinical-engine", icon: BrainCircuit },
  { label: "Prescriptions", href: "/prescription-management", icon: Stethoscope },
  { label: "Claim Readiness", href: "/claim-readiness", icon: FileCheck2 },
  { label: "Evidence Packages", href: "/evidence-package", icon: ClipboardCheck },
  { label: "Audit", href: "/audit-compliance", icon: ShieldCheck },
  { label: "Settings", href: "/organization/settings", icon: Settings },
];

const tabs = ["Overview", "Clinical", "Diagnostics", "Claim File", "Timeline"] as const;

export function PatientDetailPage({ data }: { data: PatientDetailData }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Clinical");
  const [visitFilter, setVisitFilter] = useState("All");
  const filteredVisits = useMemo(
    () => data.visits.filter((visit) => visitFilter === "All" || visit.status === visitFilter),
    [data.visits, visitFilter],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <ClinicalAlert data={data} />
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} type="button" /> : null}
      <main className="min-h-screen lg:pl-[260px]">
        <TopBar onOpenMenu={() => setMobileNavOpen(true)} />
        <div className="space-y-5 px-4 py-4 md:px-6 lg:px-8">
          <Breadcrumb patientNo={data.identity.patientNo} />
          <PatientHeader data={data} />
          <KpiGrid kpis={data.kpis} />
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <PatientSnapshot data={data} />
            <section className="min-w-0 space-y-6">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
              <ClinicalWorkspace data={data} />
              <VisitHistory visits={filteredVisits} filter={visitFilter} onFilterChange={setVisitFilter} />
              <OperationalSections data={data} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AccessDeniedState() {
  return (
    <StateShell title="Access Denied" icon={ShieldCheck}>
      <p className="text-sm text-[#64748B]">คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ป่วยนี้ กรุณาติดต่อผู้ดูแลระบบหรือเลือกผู้ป่วยในขอบเขตคลินิกของคุณ</p>
      <Link className="inline-flex min-h-10 items-center rounded bg-[#1E3A8A] px-4 text-sm font-semibold text-white" href="/patients">Back to Patients</Link>
    </StateShell>
  );
}

export function PatientNotFoundState() {
  return (
    <StateShell title="Patient Not Found" icon={Search}>
      <p className="text-sm text-[#64748B]">ไม่พบข้อมูลผู้ป่วยจากรหัสที่ระบุ โปรดตรวจสอบ Patient ID หรือกลับไปที่รายการผู้ป่วย</p>
      <Link className="inline-flex min-h-10 items-center rounded bg-[#1E3A8A] px-4 text-sm font-semibold text-white" href="/patients">Back to Patients</Link>
    </StateShell>
  );
}

function ClinicalAlert({ data }: { data: PatientDetailData }) {
  return (
    <header className="sticky top-0 z-[60] flex w-full items-center justify-center bg-[#DC2626] px-4 py-1 text-white">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <span>{data.safetyAlert.title}</span>
        <span className="hidden opacity-70 sm:inline">|</span>
        <span className="font-medium">{data.safetyAlert.verifiedBy}</span>
        <Button className="rounded px-2 py-1 text-xs font-semibold underline underline-offset-2 hover:bg-white/10" aria-label={`${data.safetyAlert.actionLabel}: ${data.safetyAlert.explanation}`}>
          {data.safetyAlert.actionLabel}
        </Button>
      </div>
    </header>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#0F2A5F] px-4 py-6 pt-10 text-white shadow-xl transition-transform lg:translate-x-0`}>
      <div className="mb-8 flex items-start justify-between px-2">
        <div>
          <h1 className="text-xl font-black tracking-tight">Med AI NexSure</h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/70">Clinical Operations</p>
        </div>
        <Button aria-label="Close navigation" className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden" onClick={onClose}><X className="h-5 w-5" /></Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold transition-colors ${item.active ? "bg-[#1E3A8A] text-white" : "text-sky-100/75 hover:bg-white/10 hover:text-white"}`} href={item.href}>
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4">
        <Link className="flex items-center gap-3 rounded px-4 py-3 text-xs font-semibold text-sky-100/75 hover:bg-white/10" href="/help"><HelpCircle className="h-5 w-5" />Help Center</Link>
        <div className="mt-4 flex items-center gap-3 px-4">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-sky-100/40 bg-[#1E3A8A] text-xs font-bold">CA</div>
          <div><p className="text-xs font-semibold">Clinical Admin</p><p className="text-[10px] text-sky-100/65">Enterprise Health</p></div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-6 z-40 flex min-h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 shadow-sm lg:top-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Button aria-label="Open navigation" className="rounded border border-[#E2E8F0] bg-white p-2 text-[#64748B] lg:hidden" onClick={onOpenMenu}><Menu className="h-5 w-5" /></Button>
        <label className="relative hidden w-full max-w-md md:block">
          <span className="sr-only">Global search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
          <Input className="w-full rounded-full border-0 bg-[#EFF6FF] py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/25" placeholder="Global search: Patients, Visits, Claims..." />
        </label>
        <nav className="hidden gap-6 lg:flex" aria-label="Patient detail quick navigation">
          {["Overview", "Patient History", "AI Insights"].map((item) => <a key={item} className="text-sm font-medium text-[#64748B] hover:text-[#1E3A8A]" href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>{item}</a>)}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button aria-label="Open AI copilot" className="relative rounded-full p-2 text-[#1E3A8A] hover:bg-[#EFF6FF]"><BrainCircuit className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#DC2626]" /></Button>
        <Button aria-label="Notifications" className="rounded-full p-2 text-[#1E3A8A] hover:bg-[#EFF6FF]"><Bell className="h-5 w-5" /></Button>
        <Button aria-label="Organization switcher" className="rounded-full p-2 text-[#1E3A8A] hover:bg-[#EFF6FF]"><Building2 className="h-5 w-5" /></Button>
      </div>
    </header>
  );
}

function Breadcrumb({ patientNo }: { patientNo: string }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-[#64748B]" aria-label="Breadcrumb">
      <Link href="/patients">Patients</Link><ChevronRight className="h-3.5 w-3.5" /><span>{patientNo}</span><ChevronRight className="h-3.5 w-3.5" /><span className="font-semibold text-[#1E3A8A]">Patient Detail</span>
    </nav>
  );
}

function PatientHeader({ data }: { data: PatientDetailData }) {
  const p = data.identity;
  return (
    <section className="flex flex-col justify-between gap-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:flex-row md:items-center" aria-labelledby="patient-title">
      <div className="flex min-w-0 gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#DBEAFE] text-xl font-black text-[#1E3A8A] shadow-inner">{p.initials}</div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 id="patient-title" className="text-2xl font-bold leading-tight text-[#1E3A8A] md:text-[32px]">{p.name}</h2>
            <StatusPill label={p.patientNo} tone="primary" />
            <StatusPill label={p.hn} tone="info" />
          </div>
          <p className="text-sm text-[#64748B]">{p.age}y - {p.sex} - {p.bloodType} <span className="px-2">|</span> DOB: {p.dob}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill label={p.status} tone="success" icon />
            <StatusPill label={p.attention} tone="danger" icon />
            <StatusPill label={p.insuranceStatus} tone="primary" icon />
          </div>
        </div>
      </div>
      <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 hover:bg-[#0F2A5F]" href="/visit-management">
        <Plus className="h-5 w-5" />Create New Visit
      </Link>
    </section>
  );
}

function KpiGrid({ kpis }: { kpis: PatientKpi[] }) {
  return <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" aria-label="Patient KPI Summary">{kpis.map((kpi) => <article key={kpi.label} className={`rounded-xl border bg-white p-4 shadow-sm ${kpi.tone === "primary" ? "border-[#1E3A8A]/30 ring-2 ring-[#1E3A8A]/10" : "border-[#E2E8F0]"}`}><p className="text-[11px] font-bold uppercase text-[#64748B]">{kpi.label}</p><div className="mt-2 flex items-baseline gap-2"><p className={`text-3xl font-bold ${kpi.tone === "primary" ? "text-[#1E3A8A]" : "text-[#0F172A]"}`}>{kpi.value}</p>{kpi.helper ? <span className={`text-xs font-bold ${kpi.tone === "primary" ? "text-[#DC2626]" : "text-[#059669]"}`}>{kpi.helper}</span> : null}</div></article>)}</section>;
}

function PatientSnapshot({ data }: { data: PatientDetailData }) {
  return (
    <aside className="h-fit space-y-4 xl:sticky xl:top-28" aria-label="Patient Snapshot">
      <Panel title="Patient Snapshot" icon={User}>
        <InfoBlock label="Contact Information" value={data.identity.maskedPhone} helper={data.identity.maskedEmail} />
        <InfoBlock label="Insurance Coverage" value={data.snapshot.coverage.label} helper={data.snapshot.coverage.value} status={data.snapshot.coverage.status} />
        <InfoBlock label="PDPA Consent" value={data.snapshot.pdpa.value} helper="Patient consent verified for current care and claim workflow." status={data.snapshot.pdpa.status} />
        <div className="border-t border-[#E2E8F0] pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase text-[#64748B]">Risk Indicators</p>
          <RiskBar label="Clinical Risk" value={data.snapshot.clinicalRisk} tone="danger" />
          <RiskBar label="Claim Risk" value={data.snapshot.claimRisk} tone="warning" />
        </div>
        <p className="rounded bg-[#EFF6FF] p-3 text-xs italic leading-relaxed text-[#64748B]">{data.snapshot.note}</p>
      </Panel>
      <QuickActions patientId={data.identity.id} />
    </aside>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: (typeof tabs)[number]) => void }) {
  return <div className="flex overflow-x-auto border-b border-[#E2E8F0]" role="tablist" aria-label="Patient detail sections">{tabs.map((tab) => <Button key={tab} role="tab" aria-selected={activeTab === tab} className={`min-h-12 shrink-0 px-5 text-sm font-semibold ${activeTab === tab ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]" : "text-[#64748B] hover:text-[#1E3A8A]"}`} onClick={() => onTabChange(tab)}>{tab}</Button>)}</div>;
}

function ClinicalWorkspace({ data }: { data: PatientDetailData }) {
  return (
    <section className="space-y-6" id="overview">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Panel title="Clinical Summary" icon={Stethoscope} action={<Button className="inline-flex items-center gap-1 rounded p-1 text-xs font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF]"><Edit3 className="h-4 w-4" />Edit</Button>}>
            <p className="rounded-lg border border-[#E2E8F0] bg-white p-3 text-sm leading-relaxed text-[#64748B]">{data.clinicalSummary}</p>
          </Panel>
          <DataTable title="Allergy Registry" headers={["Allergen", "Reaction", "Severity", "Status"]} rows={data.allergies} critical />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-4">
          {data.vitals.map((vital) => <StatusCard key={vital.label} item={vital} />)}
        </div>
      </div>
      <DataTable title="Medication History" headers={["Medication", "Dosage/Freq", "Period", "Prescriber", "Safety"]} rows={data.medications} />
      <DataTable title="Diagnosis History" headers={["Diagnosis", "ICD-10", "Date", "Provider"]} rows={data.diagnoses} />
      <AiSummary data={data} />
    </section>
  );
}

function VisitHistory({ visits, filter, onFilterChange }: { visits: VisitRecord[]; filter: string; onFilterChange: (filter: string) => void }) {
  return (
    <Panel title="Visit History" icon={History} id="patient-history" action={<select aria-label="Filter visits by status" className="rounded border border-[#E2E8F0] bg-white px-3 py-2 text-sm" value={filter} onChange={(event) => onFilterChange(event.target.value)}><option>All</option><option>In Consultation</option><option>Completed</option></select>}>
      {visits.length === 0 ? <EmptyMessage title="No visits available" text="ยังไม่มีประวัติการเข้ารับบริการในตัวกรองนี้" /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#EFF6FF] text-xs uppercase text-[#64748B]"><tr>{["Visit", "Date", "Clinic", "Provider", "Status", "Readiness"].map((h) => <th key={h} className="px-4 py-2 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#E2E8F0]">{visits.map((visit) => <tr key={visit.id} className="hover:bg-[#EFF6FF]/50"><td className="px-4 py-3"><Link className="font-bold text-[#1E3A8A] underline-offset-2 hover:underline" href={visit.href}>{visit.visitNo}</Link><p className="text-xs text-[#64748B]">{visit.reason}</p></td><td className="px-4 py-3">{visit.date}</td><td className="px-4 py-3">{visit.clinic}</td><td className="px-4 py-3">{visit.provider}</td><td className="px-4 py-3"><StatusPill label={visit.status} tone={visit.status === "Completed" ? "success" : "primary"} /></td><td className="px-4 py-3 font-bold text-[#1E3A8A]">{visit.readiness}%</td></tr>)}</tbody></table></div>}
    </Panel>
  );
}

function AiSummary({ data }: { data: PatientDetailData }) {
  return (
    <section id="ai-insights" className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 shadow-sm" aria-labelledby="ai-summary-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-[#2563EB]" /><h3 id="ai-summary-title" className="font-bold text-[#1E3A8A]">AI Patient Summary</h3><StatusPill label="AI Generated" tone="ai" /></div>
        <p className="text-xs font-semibold text-[#64748B]">Confidence {data.aiSummary.confidence} - {data.aiSummary.reviewStatus}</p>
      </div>
      <p className="text-sm leading-relaxed text-[#0F172A]">{data.aiSummary.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div><p className="text-xs font-bold uppercase text-[#1E3A8A]">Supporting Evidence</p><ul className="mt-2 space-y-1 text-sm text-[#64748B]">{data.aiSummary.evidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#2563EB]" />{item}</li>)}</ul></div>
        <div className="rounded border border-[#BFDBFE] bg-white p-3 text-sm text-[#64748B]"><p className="font-semibold text-[#1E3A8A]">Human review required</p><p>{data.aiSummary.limitation}</p><p className="mt-2 text-xs">Generated: {data.aiSummary.generatedAt}</p></div>
      </div>
    </section>
  );
}

function OperationalSections({ data }: { data: PatientDetailData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Insurance and Coverage" icon={ShieldCheck}>{data.insurance.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="Claim Readiness" icon={FileCheck2}><div className="mb-4 flex items-center gap-4"><div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-[#BFDBFE] text-2xl font-black text-[#1E3A8A]">{data.claimReadiness.score}%</div><div><StatusPill label={data.claimReadiness.status} tone="warning" /><p className="mt-2 text-sm text-[#64748B]">{data.claimReadiness.explanation}</p></div></div>{data.claimReadiness.dimensions.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="Missing Evidence" icon={AlertTriangle}>{data.missingEvidence.length === 0 ? <EmptyMessage title="No missing evidence" text="รายการเอกสารครบถ้วนในขณะนี้" /> : data.missingEvidence.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="Documents" icon={FileText}>{data.documents.length === 0 ? <EmptyMessage title="No documents" text="ยังไม่มีเอกสารในแฟ้มผู้ป่วยนี้" /> : data.documents.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="PDPA Consent" icon={ShieldCheck}>{data.consent.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="Patient Timeline" icon={History}>{data.timeline.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
      <Panel title="Audit Trail" icon={ClipboardCheck}>{data.auditTrail.map((item) => <ListItem key={item.label} item={item} />)}</Panel>
    </div>
  );
}

function QuickActions({ patientId }: { patientId: string }) {
  const actionClass = "inline-flex min-h-10 items-center gap-2 rounded border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30";

  return (
    <Panel title="Quick Actions" icon={Plus}>
      <Link className={actionClass} href="/visit-management"><Plus className="h-4 w-4" />Create Visit</Link>
      <Link className={actionClass} href={`/patients/${patientId}/documents`}><FileText className="h-4 w-4" />Open Documents</Link>
      <Link className={actionClass} href={`/patients/${patientId}/claims`}><FileCheck2 className="h-4 w-4" />Open Claim File</Link>
      <Button className={`${actionClass} w-full`}><Download className="h-4 w-4" />Export Evidence</Button>
    </Panel>
  );
}

function Panel({ title, icon: Icon, children, action, id }: { title: string; icon: typeof User; children: React.ReactNode; action?: React.ReactNode; id?: string }) {
  return <section id={id} className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm" aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-title`}><div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#EFF6FF] px-4 py-3"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#1E3A8A]" /><h3 id={`${title.replaceAll(" ", "-").toLowerCase()}-title`} className="font-bold text-[#1E3A8A]">{title}</h3></div>{action}</div><div className="space-y-4 p-4">{children}</div></section>;
}

function DataTable({ title, headers, rows, critical = false }: { title: string; headers: string[]; rows: TableRow[]; critical?: boolean }) {
  return <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"><div className={`border-b px-4 py-3 ${critical ? "border-red-100 bg-red-50" : "border-[#E2E8F0]"}`}><h4 className={`flex items-center gap-2 font-bold ${critical ? "text-[#DC2626]" : "text-[#0F172A]"}`}>{critical ? <AlertTriangle className="h-5 w-5" /> : null}{title}</h4></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#EFF6FF] text-[11px] uppercase text-[#64748B]"><tr>{headers.map((h) => <th key={h} className="px-4 py-2 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#E2E8F0]">{rows.map((row) => <tr key={row.cells.join("-")}>{row.cells.map((cell, index) => <td key={cell} className={`px-4 py-3 ${index === 0 ? "font-semibold" : ""} ${row.tone === "critical" && index === 0 ? "text-[#DC2626]" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

function StatusCard({ item }: { item: NamedStatus }) {
  return <article className="rounded-xl border border-[#E2E8F0] bg-white p-3"><p className="text-[10px] font-bold uppercase text-[#64748B]">{item.label}</p><p className="text-base font-bold">{item.value}</p><p className={`text-[11px] font-semibold ${item.tone === "warning" ? "text-[#D97706]" : item.tone === "success" ? "text-[#059669]" : "text-[#64748B]"}`}>{item.status}</p></article>;
}

function ListItem({ item }: { item: NamedStatus }) {
  const dotTone = item.tone === "critical" ? "critical" : item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "info";

  return <div className="flex gap-3 rounded border border-[#E2E8F0] p-3"><StatusDot tone={dotTone} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-[#0F172A]">{item.label}</p>{item.status ? <StatusPill label={item.status} tone={item.tone === "critical" ? "danger" : item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "primary"} /> : null}</div><p className="mt-1 text-sm text-[#64748B]">{item.value}</p></div></div>;
}

function InfoBlock({ label, value, helper, status }: { label: string; value: string; helper?: string; status?: string }) {
  return <div className="border-t border-[#E2E8F0] pt-4 first:border-t-0 first:pt-0"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase text-[#64748B]">{label}</p>{status ? <StatusPill label={status} tone="success" /> : null}</div><p className="mt-1 text-sm font-semibold">{value}</p>{helper ? <p className="mt-0.5 text-xs text-[#64748B]">{helper}</p> : null}</div>;
}

function RiskBar({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" }) {
  return <div className="mb-3"><div className="mb-1 flex justify-between text-xs"><span className="text-[#64748B]">{label}</span><span className={`font-bold ${tone === "danger" ? "text-[#DC2626]" : "text-[#D97706]"}`}>{tone === "danger" ? "High" : "Medium"}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]"><div className={`h-full ${tone === "danger" ? "bg-[#DC2626]" : "bg-[#D97706]"}`} style={{ width: `${value}%` }} /></div></div>;
}

function StatusPill({ label, tone, icon = false }: { label: string; tone: "success" | "danger" | "primary" | "info" | "warning" | "ai"; icon?: boolean }) {
  const styles = { success: "bg-emerald-50 text-emerald-700", danger: "bg-red-50 text-red-700", primary: "bg-blue-50 text-[#1E3A8A]", info: "bg-slate-100 text-[#64748B]", warning: "bg-amber-50 text-amber-700", ai: "bg-[#DBEAFE] text-[#2563EB]" };
  return <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${styles[tone]}`}>{icon ? <StatusDot tone={tone === "danger" ? "critical" : tone === "success" ? "success" : "info"} /> : null}{label}</span>;
}

function StatusDot({ tone }: { tone: "critical" | "success" | "warning" | "info" }) {
  const color = tone === "critical" ? "bg-[#DC2626]" : tone === "success" ? "bg-[#059669]" : tone === "warning" ? "bg-[#D97706]" : "bg-[#2563EB]";
  return <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />;
}

function EmptyMessage({ title, text }: { title: string; text: string }) {
  return <div className="rounded border border-dashed border-[#BFDBFE] bg-[#EFF6FF] p-4 text-center"><p className="font-semibold text-[#1E3A8A]">{title}</p><p className="mt-1 text-sm text-[#64748B]">{text}</p></div>;
}

function StateShell({ title, icon: Icon, children }: { title: string; icon: typeof Search; children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6"><section className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm"><Icon className="mx-auto h-10 w-10 text-[#1E3A8A]" /><h1 className="mt-4 text-2xl font-bold text-[#1E3A8A]">{title}</h1><div className="mt-4 space-y-4">{children}</div></section></main>;
}
