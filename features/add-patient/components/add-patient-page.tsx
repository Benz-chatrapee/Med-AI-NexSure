"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  Cloud,
  FileText,
  History,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Save,
  Search,
  ShieldCheck,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type IconComponent = ComponentType<{ className?: string }>;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patient Management", href: "/patients", icon: UsersRound, active: true },
  { label: "AI Clinical Engine", href: "/ai-clinical-engine", icon: BrainCircuit },
  { label: "Claim Readiness", href: "/claim-readiness", icon: ClipboardCheck },
];

const steps = ["Identity", "Contact", "Address", "Emergency", "Clinical", "Insurance"];

export function AddPatientPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} type="button" /> : null}
      <main className="flex min-h-screen flex-col pb-28 lg:pl-[240px]">
        <PageHeader onOpenMenu={() => setMobileNavOpen(true)} />
        <div className="grid flex-1 gap-6 px-4 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 space-y-6" aria-label="Add patient form">
            <Stepper />
            <ClinicalSafetyProfile />
            <PatientIdentity />
            <InsurancePayer />
            <PdpaConsent />
          </section>
          <RegistrationSidebar />
        </div>
        <StickyActionBar />
      </main>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[#1E3A8A]/30 bg-[#0F2A5F] px-4 py-6 text-white shadow-2xl transition-transform lg:translate-x-0`}>
      <div className="mb-8 flex items-start justify-between gap-3 px-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">NexSure</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BFD7FF]">AI Intelligence</p>
        </div>
        <Button aria-label="Close navigation" className="rounded p-1 text-white/75 hover:bg-white/10 lg:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} className={`flex items-center gap-3 rounded px-3 py-2 text-[13px] font-semibold transition-colors ${item.active ? "border-l-4 border-[#38BDF8] bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`} href={item.href}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-white/10 bg-white/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider">System Verified</span>
        </div>
        <p className="text-xs leading-relaxed text-white/70">Safety Grade A Protocol Active</p>
      </div>
    </aside>
  );
}

function PageHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <Button aria-label="Open navigation" className="mt-1 h-10 w-10 shrink-0 rounded border border-[#E2E8F0] bg-white text-[#64748B] lg:hidden" onClick={onOpenMenu}>
            <Menu className="mx-auto h-5 w-5" />
          </Button>
          <div>
            <nav className="mb-1 flex items-center gap-2 text-xs text-[#64748B]" aria-label="Breadcrumb">
              <Link className="hover:text-[#1E3A8A]" href="/patients">Patient Management</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-bold text-[#1E3A8A]">Add Patient</span>
            </nav>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl font-bold leading-tight text-[#1E3A8A]">Add Patient</h2>
              <span className="text-sm italic text-[#64748B]">เพิ่มผู้ป่วยรายใหม่</span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-[#64748B]">Register a new patient profile with automated duplicate, safety, payer, and privacy checks.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="inline-flex min-h-10 items-center rounded border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]" href="/patients">Cancel</Link>
          <Button className="min-h-10 rounded border border-[#1E3A8A]/20 bg-white px-4 text-sm font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF]">Save Draft</Button>
          <Button className="inline-flex min-h-10 items-center gap-2 rounded bg-[#1E3A8A] px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-[#0F2A5F]">
            <Save className="h-4 w-4" />
            Save & Create Visit
          </Button>
        </div>
      </div>
    </header>
  );
}

function Stepper() {
  return (
    <nav className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm" aria-label="Patient registration steps">
      <ol className="flex min-w-[820px] items-center">
        {steps.map((step, index) => (
          <li key={step} className="flex flex-1 items-center">
            <div className={`flex items-center gap-3 rounded px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[#1E3A8A] text-white shadow" : index === 1 ? "text-[#64748B] hover:bg-[#F8FAFC]" : "text-[#64748B]/70"}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${index === 0 ? "bg-white text-[#1E3A8A]" : "bg-[#E2E8F0] text-[#64748B]"}`}>{index + 1}</span>
              {step}
            </div>
            {index < steps.length - 1 ? <span className={`mx-2 h-px flex-1 ${index === 0 ? "bg-[#1E3A8A]/25" : "bg-[#E2E8F0]"}`} /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ClinicalSafetyProfile() {
  return (
    <FormCard icon={AlertTriangle} title="Clinical Safety Profile" thaiLabel="โปรไฟล์ความปลอดภัยทางคลินิก" tone="danger" badge="Critical Alerts">
      <div className="grid gap-6 lg:grid-cols-2">
        <TagField title="Life-threatening Allergies" thai="ภูมิแพ้รุนแรง" action="Add Allergy" danger values={["Penicillin"]} />
        <TagField title="Chronic Conditions" thai="โรคประจำตัว" action="Add Condition" values={["Hypertension"]} />
        <div className="rounded-lg border border-red-100 bg-red-50 p-5 lg:col-span-2">
          <div className="flex gap-4">
            <ShieldCheck className="h-8 w-8 shrink-0 text-[#DC2626]" />
            <div>
              <p className="font-bold uppercase tracking-tight text-[#DC2626]">Clinical Safety Disclaimer</p>
              <p className="mt-1 text-sm leading-relaxed text-[#64748B]">ข้อมูลทางคลินิกส่วนนี้มีความสำคัญต่อความปลอดภัยของผู้ป่วย กรุณาตรวจสอบความถูกต้องก่อนบันทึกทุกครั้ง</p>
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
}

function PatientIdentity() {
  return (
    <FormCard icon={Search} title="Patient Identity" thaiLabel="ข้อมูลอัตลักษณ์ผู้ป่วย" badge="AI Duplicate Search Active">
      <div className="grid gap-6 lg:grid-cols-3">
        <Field label="Hospital Number (HN)">
          <div className="relative">
            <Input className="w-full cursor-not-allowed rounded-lg border-2 border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-mono font-bold text-[#1E3A8A]" readOnly value="HN-2024-88910" />
            <span className="absolute right-3 top-3 rounded bg-[#EFF6FF] px-2 py-1 text-[9px] font-black uppercase text-[#1E3A8A]/60">Auto-Generated</span>
          </div>
        </Field>
        <Field label="ID Type">
          <select className="w-full rounded-lg border-2 border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15">
            <option>Thai National ID Card</option>
            <option>Passport</option>
            <option>Alien Identity Card</option>
          </select>
        </Field>
        <Field label="Identification Number">
          <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 font-mono outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15" placeholder="X-XXXX-XXXXX-XX-X" />
        </Field>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <NameFields label="Full Name (English)" first="First Name" last="Last Name" />
          <NameFields label="Full Name (Thai)" helper="ชื่อ-นามสกุล ภาษาไทย" first="ชื่อ" last="นามสกุล" />
        </div>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Date of Birth">
              <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15" type="date" />
            </Field>
            <Field label="Age (Calculated)">
              <div className="flex min-h-[50px] items-center rounded-lg border-2 border-[#E2E8F0] bg-[#F8FAFC] px-4 font-mono font-bold text-[#1E3A8A]/55">-- Years -- Months</div>
            </Field>
          </div>
          <Field label="Sex at Birth">
            <div className="grid gap-3 sm:grid-cols-3">
              {["Male", "Female", "Other"].map((option) => <RadioCard key={option} label={option} />)}
            </div>
          </Field>
        </div>
      </div>
    </FormCard>
  );
}

function InsurancePayer() {
  return (
    <FormCard icon={BadgeCheck} title="Insurance & Payer" thaiLabel="ข้อมูลประกันและผู้ชำระเงิน">
      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <Field label="Primary Coverage Plan">
            <select className="w-full rounded-lg border-2 border-[#E2E8F0] bg-white px-4 py-3 font-bold text-[#1E3A8A] outline-none focus:border-[#1E3A8A]">
              <option>NexSure Health Insurance (Premium)</option>
              <option>Self Pay / Cash</option>
              <option>Corporate Contract</option>
              <option>Government Scheme (UC/Social Security)</option>
            </select>
          </Field>
          <div className="rounded-lg border-2 border-[#1E3A8A]/10 bg-[#EFF6FF] p-5">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#1E3A8A]" />
              <p className="font-black uppercase tracking-widest text-[#1E3A8A]">Active Policy Detected</p>
            </div>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Policy Holder" value="Self" />
              <InfoRow label="Limit per Visit" value="฿120,000.00" />
              <InfoRow label="Status" value="Verified Grade A" success />
            </dl>
          </div>
        </div>
        <div className="space-y-6">
          <Field label="Policy Number / Member ID">
            <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 font-mono text-lg outline-none focus:border-[#1E3A8A]" placeholder="NX-882-XXX-XXX" />
          </Field>
          <Field label="Policy Expiry">
            <div className="relative">
              <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#1E3A8A]" type="month" />
              <CalendarDays className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-[#64748B]" />
            </div>
          </Field>
        </div>
      </div>
    </FormCard>
  );
}

function PdpaConsent() {
  return (
    <FormCard icon={ShieldCheck} title="PDPA & Privacy Consent" thaiLabel="ความยินยอมในการเก็บข้อมูล (PDPA)">
      <div className="space-y-4">
        <ConsentRow title="General Treatment & Medical Record Consent" text="ความยินยอมในการรับการรักษาและจัดเก็บประวัติทางการแพทย์เพื่อการดูแลต่อเนื่อง" defaultChecked />
        <ConsentRow title="Data Privacy & Sharing Protocol" text="ความยินยอมให้เปิดเผยข้อมูลแก่บริษัทประกันหรือหน่วยงานที่เกี่ยวข้องตามความจำเป็น" defaultChecked />
        <ConsentRow title="Marketing & Hospital News Communication" text="ความยินยอมในการรับข้อมูลข่าวสาร โปรโมชั่น และสิทธิพิเศษทางสุขภาพ" />
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
          <Upload className="h-9 w-9 text-[#1E3A8A]" />
        </div>
        <p className="text-lg font-black">Upload Signed Consent Documents</p>
        <p className="mt-1 text-sm text-[#64748B]">Drop scanned PDF, JPG or PNG files here. Max 10MB per file.</p>
        <Button className="mt-5 rounded border-2 border-[#1E3A8A] bg-white px-6 py-2 text-sm font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white">Browse System Files</Button>
      </div>
    </FormCard>
  );
}

function RegistrationSidebar() {
  return (
    <aside className="space-y-5 xl:sticky xl:top-[104px] xl:self-start" aria-label="Registration summary">
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#1E3A8A]">Registration Summary</h3>
          <History className="h-5 w-5 text-[#64748B]" />
        </div>
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span className="text-[#64748B]">Form Completion Status</span>
            <span className="text-lg text-[#1E3A8A]">42%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full w-[42%] rounded-full bg-[#1E3A8A]" /></div>
        </div>
        <div className="space-y-4 border-t border-[#E2E8F0] pt-5">
          <SummaryItem icon={AlertTriangle} status="Critical Alert" title="Penicillin Allergy" text="Safety Profile Sync Active" tone="danger" />
          <SummaryItem icon={CheckCircle2} status="Duplicate Check" title="No Existing Records" text="Global Search Verified" tone="success" />
          <SummaryItem icon={ShieldCheck} status="Audit Protocol" title="Session Encrypted" text="By Dr. Thanapat (Lead)" tone="info" />
        </div>
        <div className="mt-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Registrar Badge</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-blue-100" />
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] text-xs font-black text-[#1E3A8A]">TP</div>
            <div>
              <p className="text-xs font-black uppercase text-[#1E3A8A]">Dr. Thanapat P.</p>
              <p className="font-mono text-[11px] text-[#64748B]">SYS-REG-2024-XP4</p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border-2 border-[#1E3A8A]/10 bg-[#EFF6FF] p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded bg-[#1E3A8A] text-white"><Lightbulb className="h-5 w-5" /></div>
          <h4 className="text-sm font-black uppercase tracking-widest text-[#1E3A8A]">Enterprise Tip</h4>
        </div>
        <p className="text-sm leading-relaxed text-[#64748B]">Ensuring the <span className="font-black text-[#1E3A8A]">Thai Name</span> matches the National ID card precisely helps automate insurance verification and reduce claim rejection.</p>
      </div>
      <div className="rounded-lg bg-[#0F2A5F] p-5 text-white shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5" />
          <p className="font-black">NexSure Identity Protection</p>
        </div>
        <p className="text-xs leading-relaxed text-white/75">Secured patient records and clinical data integrity protocol.</p>
      </div>
    </aside>
  );
}

function StickyActionBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:px-8 lg:left-[240px]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-black uppercase tracking-wider text-emerald-700">
            <Cloud className="h-5 w-5" />
            Draft Auto-Saved <span className="font-mono opacity-70">12:44:02</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#1E3A8A]">Clinical Status</p>
            <p className="text-sm font-medium text-[#64748B]">Ready for Registrar Verification (พร้อมตรวจสอบข้อมูล)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#64748B] hover:text-[#1E3A8A]">
            <FileText className="h-5 w-5" />
            Preview PDF Registration
          </Button>
          <Button className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#1E3A8A] px-8 text-base font-black text-white shadow-xl shadow-blue-900/20 hover:bg-[#0F2A5F]">
            Save & Create Visit
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}

function FormCard({ icon: Icon, title, thaiLabel, badge, tone = "default", children }: { icon: IconComponent; title: string; thaiLabel: string; badge?: string; tone?: "default" | "danger"; children: ReactNode }) {
  const danger = tone === "danger";
  return (
    <section className={`overflow-hidden rounded-lg border bg-white shadow-lg ${danger ? "border-l-4 border-l-[#DC2626]" : "border-[#E2E8F0]"}`}>
      <div className={`flex flex-col gap-3 border-b border-[#E2E8F0] px-5 py-4 md:flex-row md:items-center md:justify-between ${danger ? "bg-red-50" : "bg-[#F8FAFC]"}`}>
        <div className="flex flex-wrap items-center gap-3">
          <Icon className={`h-5 w-5 ${danger ? "text-[#DC2626]" : "text-[#1E3A8A]"}`} />
          <h3 className={`text-xl font-bold ${danger ? "text-[#DC2626]" : "text-[#1E3A8A]"}`}>{title}</h3>
          {badge ? <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${danger ? "bg-[#DC2626] text-white" : "border border-[#1E3A8A]/10 bg-[#EFF6FF] text-[#1E3A8A]"}`}>{badge}</span> : null}
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">{thaiLabel}</p>
      </div>
      <div className="p-5 md:p-8">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold uppercase tracking-wider text-[#64748B]">{label}</span>
      {children}
    </label>
  );
}

function NameFields({ label, helper, first, last }: { label: string; helper?: string; first: string; last: string }) {
  return (
    <Field label={label}>
      {helper ? <span className="block text-xs font-normal normal-case tracking-normal text-[#64748B]">{helper}</span> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#1E3A8A]" placeholder={first} />
        <Input className="w-full rounded-lg border-2 border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#1E3A8A]" placeholder={last} />
      </div>
    </Field>
  );
}

function RadioCard({ label }: { label: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-[#E2E8F0] px-4 py-3 font-bold hover:border-[#1E3A8A] hover:bg-[#EFF6FF]">
      <input className="h-4 w-4 accent-[#1E3A8A]" name="sex-at-birth" type="radio" />
      {label}
    </label>
  );
}

function TagField({ title, thai, action, values, danger = false }: { title: string; thai: string; action: string; values: string[]; danger?: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold uppercase tracking-widest text-[#64748B]">{title} <span className="text-xs font-normal normal-case tracking-normal">({thai})</span></p>
      <div className="flex flex-wrap gap-3">
        {values.map((value) => (
          <span key={value} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${danger ? "bg-[#DC2626] text-white" : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]"}`}>
            {value}
            <X className="h-4 w-4" />
          </span>
        ))}
        <Button className={`inline-flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-2 text-sm font-bold ${danger ? "border-[#DC2626]/40 text-[#DC2626] hover:bg-red-50" : "border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]"}`}>
          <CirclePlus className="h-5 w-5" />
          {action}
        </Button>
      </div>
    </div>
  );
}

function ConsentRow({ title, text, defaultChecked = false }: { title: string; text: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer flex-col gap-4 rounded-lg border-2 border-[#E2E8F0] p-5 hover:border-[#1E3A8A]/30 hover:bg-[#EFF6FF] sm:flex-row sm:items-center sm:justify-between">
      <span>
        <span className="block font-black">{title}</span>
        <span className="mt-1 block text-sm text-[#64748B]">{text}</span>
      </span>
      <Checkbox defaultChecked={defaultChecked} className="h-6 w-6 shrink-0 accent-[#1E3A8A]" />
    </label>
  );
}

function InfoRow({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1E3A8A]/10 pb-2 last:border-0 last:pb-0">
      <dt className="font-medium text-[#64748B]">{label}:</dt>
      <dd className={`font-bold ${success ? "text-emerald-700" : "text-[#0F172A]"}`}>{success ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" /> : null}{value}</dd>
    </div>
  );
}

function SummaryItem({ icon: Icon, status, title, text, tone }: { icon: IconComponent; status: string; title: string; text: string; tone: "danger" | "success" | "info" }) {
  const styles = {
    danger: { container: "bg-red-50 text-[#DC2626]", text: "text-[#DC2626]" },
    success: { container: "bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
    info: { container: "bg-blue-50 text-[#2563EB]", text: "text-[#2563EB]" },
  };
  return (
    <div className="flex gap-4 rounded-lg p-3">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${styles[tone].container}`}><Icon className="h-6 w-6" /></div>
      <div>
        <p className={`text-sm font-black uppercase tracking-tight ${styles[tone].text}`}>{status}</p>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[10px] uppercase text-[#64748B]">{text}</p>
      </div>
    </div>
  );
}
