import Link from "next/link";
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Paperclip,
  PenLine,
  Plus,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { certificatePurposes } from "./data";
import type {
  CertificateAttachment,
  ClinicalReference,
  MedicalCertificateWorkspace,
  ReadinessCheck,
} from "./types";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: UserRound },
  { label: "Visits", href: "/visits", icon: Stethoscope },
  { label: "Medical Certificate", href: "#", icon: FileText, active: true },
  { label: "Insurance Intelligence", href: "/insurance-intelligence", icon: ClipboardCheck },
];

const referenceToneClass: Record<ClinicalReference["tone"], string> = {
  primary: "border-blue-200 bg-blue-50 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-success",
  warning: "border-amber-200 bg-amber-50 text-warning",
  muted: "border-slate-200 bg-slate-50 text-slate-600",
};

const readinessToneClass: Record<ReadinessCheck["status"], string> = {
  Verified: "text-success",
  Pending: "text-warning",
  Review: "text-primary",
};

export function MedicalCertificatePage({ workspace }: { workspace: MedicalCertificateWorkspace }) {
  return (
    <div className="min-h-screen bg-background text-foreground [--sidebar:280px]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar)] flex-col bg-primary py-6 text-white lg:flex">
        <div className="px-6 pb-8">
          <h1 className="text-2xl font-extrabold">NexSure</h1>
          <p className="mt-1 text-[10px] font-bold uppercase text-blue-100">Clinical Intelligence</p>
        </div>
        <nav className="flex-1 space-y-1 px-2" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold uppercase ${
                item.active ? "bg-white/15 text-white" : "text-blue-100/80 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
              key={item.label}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 px-2">
          <Link className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold uppercase text-blue-100/80 hover:bg-white/10" href="/settings">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold uppercase text-blue-100/80 hover:bg-white/10" href="/support">
            <HelpCircle className="h-5 w-5" />
            Support
          </Link>
          <div className="mx-2 mt-4 rounded-xl bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-primary">JS</div>
              <div>
                <p className="text-xs font-bold">{workspace.clinician.name}</p>
                <p className="text-[10px] text-blue-100/70">{workspace.clinician.license}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[var(--sidebar)]">
        <TopBar visitNumber={workspace.patient.vn} />
        <div className="mx-auto max-w-[1920px] px-4 pb-28 pt-5 lg:px-6">
          <PageHeader workspace={workspace} />
          <div className="mt-5 grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_330px]">
            <aside className="space-y-5">
              <PatientCard workspace={workspace} />
              <ClinicalReferenceCard references={workspace.clinicalReferences} />
              <SoapSnapshot snapshot={workspace.soapSnapshot} />
            </aside>
            <CertificateBuilder workspace={workspace} />
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <ClinicalEngine score={workspace.readinessScore} />
              <ReadinessChecks checks={workspace.readinessChecks} />
              <AttachmentPanel attachments={workspace.attachments} />
            </aside>
          </div>
        </div>
        <SigningBar score={workspace.readinessScore} />
      </main>
    </div>
  );
}

function TopBar({ visitNumber }: { visitNumber: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-white/90 px-4 backdrop-blur lg:px-6">
      <Button aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-white text-muted-foreground lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      <nav className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground md:flex" aria-label="Breadcrumb">
        <Link href="/visits">Visits</Link>
        <ChevronRight className="h-4 w-4" />
        <span>{visitNumber}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary">Medical Certificate</span>
      </nav>
      <label className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-10 w-full rounded-full border border-border bg-slate-100 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Global Clinical Search..." />
      </label>
      <Button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-soft-background">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
      </Button>
      <Button className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm md:flex">
        <Bot className="h-4 w-4" />
        AI Copilot
      </Button>
    </header>
  );
}

function PageHeader({ workspace }: { workspace: MedicalCertificateWorkspace }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-primary md:text-[28px]">Medical Certificate</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase text-muted-foreground">{workspace.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">จัดทำและตรวจสอบใบรับรองแพทย์ โดยมีแพทย์เป็นผู้พิจารณาและลงนามขั้นสุดท้าย</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
          {workspace.stats.map((stat) => (
            <div className="rounded-lg border border-border bg-slate-50 p-4" key={stat.label}>
              <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PatientCard({ workspace }: { workspace: MedicalCertificateWorkspace }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Patient Context</p>
      <h3 className="mt-2 text-lg font-extrabold text-slate-950">{workspace.patient.name}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="HN" value={workspace.patient.hn} />
        <Info label="VN" value={workspace.patient.vn} />
        <Info label="Age" value={workspace.patient.age} />
        <Info label="Allergy" value={workspace.patient.allergy} />
      </div>
    </section>
  );
}

function ClinicalReferenceCard({ references }: { references: ClinicalReference[] }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-primary">Clinical Reference</h3>
      <p className="text-xs text-muted-foreground">ข้อมูลอ้างอิงทางคลินิก</p>
      <div className="mt-4 space-y-3">
        {references.map((reference) => (
          <div className={`rounded-lg border p-3 ${referenceToneClass[reference.tone]}`} key={reference.label}>
            <p className="text-[10px] font-extrabold uppercase opacity-75">{reference.label}</p>
            <p className="mt-1 text-sm font-bold">{reference.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SoapSnapshot({ snapshot }: { snapshot: MedicalCertificateWorkspace["soapSnapshot"] }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase text-muted-foreground">SOAP Notes Snapshot</h3>
      <div className="mt-4 space-y-3">
        {Object.entries(snapshot).map(([label, value]) => (
          <div className="border-l-2 border-blue-200 pl-3" key={label}>
            <p className="text-[10px] font-extrabold uppercase text-primary">{label}</p>
            <p className="text-xs text-slate-600">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificateBuilder({ workspace }: { workspace: MedicalCertificateWorkspace }) {
  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary">Certificate Construction</h3>
          <p className="text-xs text-muted-foreground">ร่างใบรับรองแพทย์โดย AI และตรวจทานโดยแพทย์</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Assisted Draft
          </span>
          <Button className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">TH/EN</Button>
          <Button className="rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary hover:bg-blue-50">Preview PDF</Button>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <Label title="Certificate Purpose" thai="วัตถุประสงค์การออกใบรับรอง" />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {certificatePurposes.map((purpose) => (
              <Button
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center font-bold ${
                  purpose.selected ? "border-primary bg-blue-50 text-primary" : "border-border text-muted-foreground hover:bg-slate-50"
                }`}
                key={purpose.label}
              >
                <purpose.icon className="h-5 w-5" />
                <span>{purpose.label}</span>
                <span className="text-[11px] font-normal">{purpose.thai}</span>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label title="Clinical Findings Text" thai="ข้อความรับรองทางคลินิก" />
            <Button className="inline-flex items-center gap-1 text-xs font-bold text-primary">
              <Sparkles className="h-3 w-3" />
              Regenerate
            </Button>
          </div>
          <textarea className="min-h-36 w-full rounded-xl border border-border bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-accent/30" defaultValue={workspace.findingsText} />
        </section>

        <section className="rounded-xl border border-border bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label title="Rest and Validity Period" thai="ช่วงวันที่แนะนำให้พักรักษาตัว" />
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-primary">{workspace.restPeriod.aiSuggestion}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DateBox label="Issue Date" value={workspace.restPeriod.startDate} />
            <DateBox label="Valid Until" value={workspace.restPeriod.endDate} />
            <div className="rounded-lg border border-border bg-white p-3">
              <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Rest Days</p>
              <p className="mt-2 text-2xl font-extrabold text-primary">{workspace.restPeriod.days}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function ClinicalEngine({ score }: { score: number }) {
  return (
    <section className="rounded-xl border border-primary bg-primary p-5 text-white shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <Bot className="h-5 w-5" />
        Clinical Engine
      </h3>
      <p className="text-xs text-blue-100">ระบบวิเคราะห์ข้อมูลทางคลินิก</p>
      <div className="mt-5 space-y-3">
        <EngineRow label="SOAP Completeness" value="Complete" />
        <EngineRow label="Diagnosis Match" value="J02.9" />
        <EngineRow label="Meds vs. Diagnosis" value="Aligned" />
      </div>
      <div className="mt-6 rounded-xl bg-white/10 p-4">
        <p className="text-[10px] font-extrabold uppercase text-blue-100">Issue Readiness</p>
        <p className="mt-2 text-3xl font-extrabold">{score}%</p>
        <div className="mt-3 h-2 rounded-full bg-white/20">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${score}%` }} />
        </div>
      </div>
    </section>
  );
}

function ReadinessChecks({ checks }: { checks: ReadinessCheck[] }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-primary">Review Checklist</h3>
      <div className="mt-4 space-y-4">
        {checks.map((check) => (
          <div className="flex items-start gap-3" key={check.label}>
            <CheckCircle2 className={`mt-0.5 h-5 w-5 ${readinessToneClass[check.status]}`} />
            <div>
              <p className="text-sm font-bold text-slate-950">{check.label}</p>
              <p className="text-xs text-muted-foreground">{check.thai}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AttachmentPanel({ attachments }: { attachments: CertificateAttachment[] }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-primary">Linked Evidence</h3>
        <Button aria-label="Add linked evidence" className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {attachments.map((attachment) => (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-slate-50 p-3" key={attachment.name}>
            <Paperclip className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-bold text-slate-950">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">{attachment.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SigningBar({ score }: { score: number }) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-12px_28px_rgba(15,42,95,0.08)] backdrop-blur lg:left-[var(--sidebar)] lg:px-6">
      <div className="mx-auto flex max-w-[1920px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <Checkbox className="mt-0.5 h-5 w-5 rounded border-border text-primary" />
          <span>
            I confirm this certificate has been reviewed by an authorized clinician.
            <span className="block text-xs text-muted-foreground">ยืนยันว่าแพทย์ตรวจทานก่อนลงนามและออกเอกสาร</span>
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Issue Status</p>
            <p className="text-sm font-bold text-primary">{score}% Ready to Sign</p>
          </div>
          <Button className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-deep-blue">
            <PenLine className="h-5 w-5" />
            <span className="text-left">
              Sign & Issue Certificate
              <span className="block text-[10px] font-normal text-blue-100">ลงนามและออกใบรับรอง</span>
            </span>
          </Button>
        </div>
      </div>
    </footer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</p>
      <p className="break-words font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Label({ title, thai }: { title: string; thai: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase text-muted-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground">{thai}</p>
    </div>
  );
}

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <label className="block rounded-lg border border-border bg-white p-3">
      <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</span>
      <Input className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm" defaultValue={value} type="date" />
    </label>
  );
}

function EngineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3">
      <span className="text-xs text-blue-100">{label}</span>
      <span className="text-xs font-extrabold">{value}</span>
    </div>
  );
}
