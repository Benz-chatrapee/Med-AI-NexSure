"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit3,
  FileCheck2,
  Filter,
  HelpCircle,
  History,
  LayoutDashboard,
  Menu,
  MoreVertical,
  Search,
  Settings,
  Stethoscope,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { patientCareTeam, patientListKpis, patientListRecords } from "../data/patient-list.mock";
import type { PatientListRecord, PatientVisitStatus } from "../types/patient-list.types";

type IconComponent = ComponentType<{ className?: string }>;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patient Management", href: "/patients", icon: UsersRound, active: true },
  { label: "AI Clinical Engine", href: "/ai-clinical-engine", icon: BrainCircuit },
  { label: "Claim Readiness", href: "/claim-readiness", icon: FileCheck2 },
];

export function PatientListPage() {
  const [selectedId, setSelectedId] = useState(patientListRecords[0]?.id ?? "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const selectedPatient = patientListRecords.find((patient) => patient.id === selectedId) ?? patientListRecords[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A1B21]">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} type="button" /> : null}
      <main className="flex min-h-screen flex-col lg:pl-[240px]">
        <TopBar onOpenMenu={() => setMobileNavOpen(true)} />
        <div className="flex flex-1 flex-col overflow-hidden pt-16 xl:flex-row">
          <section className="min-w-0 flex-1 overflow-y-auto">
            <div className="space-y-6 p-4 md:p-8">
              <PageHeader />
              <KpiGrid />
              <FilterBar />
              <PatientTable selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </section>
          <PatientPreview patient={selectedPatient} />
        </div>
      </main>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[#C5C5D3] bg-[#00236F] px-4 py-6 text-white transition-transform lg:translate-x-0`}>
      <div className="mb-8 px-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Med AI NexSure</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Clinical AI Intelligence</p>
          </div>
          <Button aria-label="Close navigation" className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} className={`flex items-center gap-3 rounded px-3 py-2 text-[13px] font-semibold transition-colors ${item.active ? "bg-[#A9C0FE] text-[#001946]" : "text-white/70 hover:bg-[#1E3A8A]/60 hover:text-white"}`} href={item.href}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <NavUtility icon={Settings} label="Settings" />
        <NavUtility icon={HelpCircle} label="Support" />
      </div>
    </aside>
  );
}

function NavUtility({ icon: Icon, label }: { icon: IconComponent; label: string }) {
  return <a className="flex items-center gap-3 rounded px-3 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:bg-[#1E3A8A]/60 hover:text-white" href="#"><Icon className="h-5 w-5" />{label}</a>;
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#C5C5D3] bg-[#FAF8FF] px-4 md:px-8 lg:w-[calc(100%-240px)]">
      <div className="flex min-w-0 items-center gap-4 lg:gap-8">
        <Button aria-label="Open navigation" className="rounded border border-[#E2E8F0] bg-white p-2 text-[#64748B] lg:hidden" onClick={onOpenMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <label className="relative hidden w-64 md:block xl:w-96">
          <span className="sr-only">Search patient registry</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444651]" />
          <Input className="w-full rounded border border-[#C5C5D3] bg-[#F4F3FA] py-1.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/15" placeholder="Search HN, Name, or ID..." />
        </label>
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Patient workspace tabs">
          <Link className="border-b-2 border-[#00236F] pb-1 text-sm font-semibold text-[#00236F]" href="/patients">Patients</Link>
          <Link className="pb-1 text-sm font-semibold text-[#444651] hover:text-[#00236F]" href="/ai-copilot-panel">AI Copilot</Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-[#444651] hover:bg-[#F4F3FA]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#FAF8FF] bg-[#BA1A1A]" />
        </Button>
        <div className="hidden h-8 w-px bg-[#C5C5D3] sm:block" />
        <div className="hidden items-center gap-3 pl-1 sm:flex">
          <div className="text-right">
            <p className="text-xs font-bold leading-tight text-[#00236F]">Dr. Sarah Korn</p>
            <p className="text-[10px] uppercase tracking-tight text-[#444651]">Senior Clinical Analyst</p>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[#C5C5D3] bg-[#DCE1FF] text-xs font-bold text-[#00164E]">SK</div>
        </div>
      </div>
    </header>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-xs text-[#444651]" aria-label="Breadcrumb">
          <span>Patient Management</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-bold text-[#00236F]">Patient List</span>
        </nav>
        <h2 className="text-3xl font-bold leading-tight text-[#00236F] md:text-[32px]">Patient Management</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#444651]">Manage patient identity, clinical activity, and claim readiness. <span className="mt-1 block text-sm opacity-70">จัดการข้อมูลผู้ป่วย การเข้ารับบริการ และสถานะเคลม</span></p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton icon={History} label="View Detail" />
        <ActionButton icon={Download} label="Export" />
        <ActionButton icon={UserPlus} label="Add Patient" primary />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary = false }: { icon: IconComponent; label: string; primary?: boolean }) {
  return <Button className={`inline-flex min-h-10 items-center gap-2 rounded border px-4 py-2 text-[13px] font-semibold transition-colors ${primary ? "border-[#00236F] bg-[#00236F] text-white hover:bg-[#1E3A8A]" : "border-[#C5C5D3] bg-white text-[#00236F] hover:bg-[#F4F3FA]"}`}><Icon className="h-[18px] w-[18px]" />{label}</Button>;
}

function KpiGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" aria-label="Patient KPIs">
      {patientListKpis.map((kpi) => (
        <article key={kpi.label} className={`rounded-lg border bg-white p-3 shadow-sm transition-all ${kpi.tone === "success" ? "border-[#00236F]/20 border-l-4 border-l-[#00236F] bg-blue-50/50" : kpi.tone === "danger" ? "border-[#C5C5D3] hover:border-[#BA1A1A]" : "border-[#C5C5D3] hover:border-[#00236F]"}`}>
          <div className="mb-1 flex items-start justify-between">
            <span className={`rounded p-1 ${kpi.tone === "danger" ? "bg-red-50 text-[#BA1A1A]" : kpi.tone === "muted" ? "bg-[#E3E1E9] text-[#444651]" : "bg-[#DCE1FF]/45 text-[#00236F]"}`}><kpi.icon className="h-[18px] w-[18px]" /></span>
            {kpi.trend ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">{kpi.trend}</span> : null}
          </div>
          <p className="mb-0.5 text-[13px] font-semibold text-[#444651]">{kpi.label}</p>
          <p className={`text-[28px] font-bold leading-none ${kpi.tone === "danger" ? "text-[#BA1A1A]" : "text-[#00236F]"}`}>{kpi.value}</p>
        </article>
      ))}
    </section>
  );
}

function FilterBar() {
  return (
    <section className="sticky top-16 z-20 flex flex-wrap items-center gap-4 rounded-lg border border-[#C5C5D3] bg-white p-3 shadow-sm" aria-label="Patient filters">
      <label className="relative min-w-[220px] flex-1">
        <span className="sr-only">Search patient table</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444651]" />
        <Input className="w-full rounded border-0 bg-[#F4F3FA] py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00236F]/20" placeholder="Search by HN, patient name, phone, or Visit ID" />
      </label>
      <FilterSelect label="Activity status" options={["Status: All Activity", "Active Now", "Discharged"]} />
      <FilterSelect label="Claim readiness" options={["Claim Readiness: All", "Ready for Submission", "Correction Required"]} />
      <FilterSelect label="Insurance" options={["Insurance: All Payors", "AIA", "Allianz", "Government"]} />
      <Button className="inline-flex min-h-10 items-center gap-2 px-2 text-sm text-[#444651] transition-colors hover:text-[#00236F]"><Filter className="h-5 w-5" />More Filters</Button>
    </section>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="min-h-10 rounded border border-[#C5C5D3] bg-white px-3 py-2 text-sm outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/15">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function PatientTable({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#C5C5D3] bg-white shadow-sm" aria-label="Patient list table">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] border-collapse text-left">
          <thead className="border-b border-[#C5C5D3] bg-[#F4F3FA]">
            <tr>
              {["", "Patient", "HN", "Latest Visit", "Visit Status", "Clinical Alert", "Claim Readiness", "Insurance", "Actions"].map((heading) => (
                <th key={heading || "select"} className={`p-2 text-[13px] font-semibold uppercase tracking-wider text-[#444651] ${heading === "Actions" ? "text-right" : ""}`}>
                  {heading ? heading : <Checkbox aria-label="Select all patients" className="rounded border-[#C5C5D3] text-[#00236F] focus:ring-[#00236F]" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C5C5D3]">
            {patientListRecords.map((patient) => <PatientRow key={patient.id} patient={patient} selected={patient.id === selectedId} onSelect={() => onSelect(patient.id)} />)}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#C5C5D3] bg-[#F4F3FA] p-3">
        <p className="text-xs text-[#444651]">Showing 1-15 of 18,542 Patients</p>
        <div className="flex items-center gap-1" aria-label="Pagination">
          {[ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight].map((Icon, index) => (
            <Button key={index} aria-label={`Pagination action ${index + 1}`} className="rounded p-1 text-[#444651] hover:bg-[#E3E1E9]"><Icon className="h-5 w-5" /></Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PatientRow({ patient, selected, onSelect }: { patient: PatientListRecord; selected: boolean; onSelect: () => void }) {
  return (
    <tr className={`cursor-pointer transition-colors hover:bg-blue-50/30 ${selected ? "bg-blue-50/30" : ""}`} onClick={onSelect}>
      <td className="p-3 py-1.5 text-center"><Checkbox aria-label={`Select ${patient.name}`} checked={selected} readOnly className="rounded border-[#C5C5D3] text-[#00236F] focus:ring-[#00236F]" /></td>
      <td className="p-3 py-1.5">
        <div className="flex items-center gap-3">
          <Avatar patient={patient} />
          <div>
            <p className="text-sm font-bold text-[#00236F]">{patient.name}</p>
            <p className="text-[11px] text-[#444651]">{patient.demographics} • {patient.maskedIdentity}</p>
          </div>
        </div>
      </td>
      <td className="p-3 py-1.5 font-mono text-sm">{patient.hn}</td>
      <td className="p-3 py-1.5"><p className="text-sm font-medium">{patient.visitDate}</p><p className="text-[11px] text-[#444651]">VN: {patient.visitCode} ({patient.visitType})</p></td>
      <td className="p-3 py-1.5"><StatusBadge status={patient.status} /></td>
      <td className="p-3 py-1.5"><ClaimScore patient={patient} /></td>
      <td className="p-3 py-1.5"><p className="text-sm font-medium">{patient.insuranceName}</p><p className="text-[11px] text-[#444651]">{patient.insuranceDetail}</p></td>
      <td className="p-3 py-1.5 text-right"><Button aria-label={`Open actions for ${patient.name}`} className="rounded p-2 text-[#444651] hover:bg-[#E3E1E9]"><MoreVertical className="h-5 w-5" /></Button></td>
    </tr>
  );
}

function StatusBadge({ status }: { status: PatientVisitStatus }) {
  const styles = {
    STABLE: "bg-emerald-100 text-emerald-800",
    "NEEDS REVIEW": "bg-amber-100 text-amber-800",
    "IN-PATIENT": "bg-blue-100 text-blue-800",
  };
  return <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}>{status}</span>;
}

function ClaimScore({ patient }: { patient: PatientListRecord }) {
  const barColor = patient.claimTone === "warning" ? "bg-amber-500" : "bg-emerald-500";
  const textColor = patient.claimTone === "warning" ? "text-amber-700" : "text-emerald-700";
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#C5C5D3]"><div className={`h-full ${barColor}`} style={{ width: `${patient.claimScore}%` }} /></div>
        <span className={`text-xs font-bold ${textColor}`}>{patient.claimScore}%</span>
      </div>
      <p className="text-[10px] font-medium uppercase text-[#444651]">{patient.claimLabel}</p>
    </div>
  );
}

function Avatar({ patient }: { patient: PatientListRecord }) {
  return <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C5C5D3] text-xs font-bold ${patient.avatarTone}`}>{patient.initials}</div>;
}

function PatientPreview({ patient }: { patient: PatientListRecord }) {
  return (
    <aside className="flex w-full flex-col border-t border-[#C5C5D3] bg-white shadow-2xl xl:w-[360px] xl:border-l xl:border-t-0" aria-label="Selected patient preview">
      <div className="border-b border-[#C5C5D3] bg-[#F4F3FA] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className={`grid h-16 w-16 place-items-center rounded-lg border border-[#C5C5D3] text-base font-bold ${patient.avatarTone}`}>{patient.initials}</div>
          <Button aria-label="Close preview" className="rounded p-1.5 text-[#444651] hover:bg-[#E3E1E9]"><X className="h-5 w-5" /></Button>
        </div>
        <h3 className="text-sm font-bold text-[#00236F]">{patient.name}</h3>
        <p className="mb-4 text-xs text-[#444651]">HN: {patient.hn.replace("HN-", "")} • ID: 3-1002-33291-1</p>
        <div className="flex gap-2">
          <Button className="min-h-8 flex-1 rounded bg-[#00236F] py-1.5 text-[11px] font-bold text-white">OPEN CHART</Button>
          <Button aria-label="Edit patient" className="grid h-8 w-10 place-items-center rounded border border-[#C5C5D3] text-[#444651] hover:bg-[#F4F3FA]"><Edit3 className="h-[18px] w-[18px]" /></Button>
        </div>
      </div>
      <div className="space-y-8 p-6">
        <PreviewSection icon={BrainCircuit} title="AI Clinical Summary">
          <div className="rounded border border-[#00236F]/10 bg-blue-50 p-4">
            <p className="mb-2 text-xs italic leading-relaxed text-[#1A1B21]">Patient shows stable progress post-hypertension management. Current labs indicate creatinine normalization (1.1 mg/dL). <span className="mt-1 block text-[11px] not-italic opacity-60">ผู้ป่วยมีอาการคงที่หลังการรักษาความดันโลหิตสูง ผลแล็บล่าสุดปกติ</span></p>
            <div className="space-y-2 text-[11px]"><div className="flex justify-between"><span className="text-[#444651]">Risk Profile</span><span className="font-bold text-emerald-600">LOW RISK</span></div><div className="flex justify-between"><span className="text-[#444651]">Recommended Action</span><span className="font-bold">Follow-up in 3M</span></div></div>
          </div>
        </PreviewSection>
        <PreviewSection icon={FileCheck2} title="Claim Integrity Score">
          <div className="flex flex-col items-center py-4 text-center">
            <div className="relative grid h-32 w-32 place-items-center rounded-full border-[8px] border-blue-100"><span className="text-3xl font-bold text-[#00236F]">92</span><span className="absolute top-[78px] text-[10px] uppercase text-[#444651]">Excellent</span></div>
            <p className="mt-3 px-4 text-[11px] text-[#444651]">Missing only signed consent for digital disclosure (Minor Ref: B-29).</p>
          </div>
          <div className="space-y-2">
            <IntegrityItem tone="success" title="ICD-10 Mapping Complete" text="Verified against clinician notes." />
            <IntegrityItem tone="warning" title="Pending Consent Form" text="Requires patient signature. ยังไม่ได้รับความยินยอมที่ครบถ้วน" />
          </div>
        </PreviewSection>
        <PreviewSection icon={Stethoscope} title="Assigned Care Team">
          <div className="space-y-3">
            {patientCareTeam.map((member) => <div key={member.name} className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full border border-[#C5C5D3] bg-slate-100 text-[10px] font-bold text-[#00236F]">{member.initials}</div><div className="text-[11px]"><p className="font-bold">{member.name}</p><p className="italic text-[#444651]">{member.role}</p></div></div>)}
          </div>
        </PreviewSection>
      </div>
      <div className="mt-auto border-t border-[#C5C5D3] p-6">
        <div className="flex items-center justify-between font-mono text-[10px] text-[#444651]"><span>Last Updated: Today, 14:02</span><span className="rounded bg-[#E9E7EF] px-2 py-0.5 uppercase">Ver 2.4</span></div>
      </div>
    </aside>
  );
}

function PreviewSection({ icon: Icon, title, children }: { icon: IconComponent; title: string; children: ReactNode }) {
  return <section className="space-y-3"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#00236F]" /><h4 className="text-xs font-bold uppercase tracking-wider text-[#00236F]">{title}</h4></div>{children}</section>;
}

function IntegrityItem({ tone, title, text }: { tone: "success" | "warning"; title: string; text: string }) {
  const isSuccess = tone === "success";
  return <div className={`flex gap-3 rounded border p-3 ${isSuccess ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-amber-100 bg-amber-50 text-amber-800"}`}><FileCheck2 className="h-5 w-5 shrink-0" /><div className="text-[11px]"><p className="font-bold">{title}</p><p className="opacity-75">{text}</p></div></div>;
}
