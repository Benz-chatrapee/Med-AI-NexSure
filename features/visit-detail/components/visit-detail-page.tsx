"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type {
  ActivityItem,
  EvidenceDocument,
  Insight,
  Medication,
  ReadinessBreakdown,
  VisitDetail,
} from "../types/visit-detail.types";
import { getClaimReadinessStatus } from "../utils/claim-readiness";
import { VisitDetailEmptyState } from "./visit-detail-states";

type DialogState =
  | { kind: "confirm"; title: string; text: string; action: string; requiresReason?: boolean }
  | { kind: "document"; document: EvidenceDocument }
  | { kind: "activity"; activity: ActivityItem }
  | null;

type ToastState = { title: string; text: string } | null;

const activityIcons = {
  activity: Activity,
  ai: Bot,
  alert: AlertTriangle,
  claim: ShieldCheck,
  document: FileCheck2,
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: UserRound },
  { label: "Visits", href: "/visits", icon: Stethoscope, active: true },
  { label: "Claim Readiness", href: "/claim-readiness", icon: FileCheck2 },
  { label: "Evidence Package", href: "/evidence-package", icon: ClipboardCheck },
];

const sections = [
  ["overview", "Overview"],
  ["soap", "SOAP"],
  ["ai", "AI Summary"],
  ["diagnosis", "Diagnosis"],
  ["medication", "Medication"],
  ["evidence", "Evidence"],
  ["claim", "Claim"],
  ["activity", "Audit"],
] as const;

export function VisitDetailPage({ visit }: { visit: VisitDetail }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"soap" | "diagnosis" | "medication">("soap");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [reason, setReason] = useState("");
  const [previewState, setPreviewState] = useState<"ready" | "empty" | "permission">(
    visit.permissionDenied ? "permission" : "ready",
  );

  const readinessStatus = getClaimReadinessStatus(visit.claimScore);
  const completionWidth = Math.min(100, Math.max(0, visit.claimScore));

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function runDialogAction() {
    if (dialog?.kind !== "confirm") return;
    if (dialog.requiresReason && reason.trim().length < 8) {
      setToast({ title: "Reason required", text: "กรุณาระบุเหตุผลอย่างน้อย 8 ตัวอักษรก่อนดำเนินการ" });
      return;
    }
    setToast({ title: dialog.action, text: "Action recorded for authorized human review and audit trail." });
    setDialog(null);
    setReason("");
  }

  if (previewState === "empty") {
    return (
      <Shell sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} onCloseSidebar={() => setSidebarOpen(false)}>
        <StateToolbar onState={setPreviewState} state={previewState} />
        <VisitDetailEmptyState />
      </Shell>
    );
  }

  if (previewState === "permission") {
    return (
      <Shell sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} onCloseSidebar={() => setSidebarOpen(false)}>
        <StateToolbar onState={setPreviewState} state={previewState} />
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
          <h1 className="mt-3 text-xl font-extrabold text-slate-950">Permission required</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            ผู้ใช้ปัจจุบันไม่มีสิทธิ์เปิดดูรายละเอียด Clinical Visit นี้ กรุณาติดต่อผู้ดูแลระบบหรือเลือก Visit อื่น
          </p>
          <Button className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white" onClick={() => setPreviewState("ready")}>
            Preview Authorized State
          </Button>
        </section>
      </Shell>
    );
  }

  return (
    <Shell sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} onCloseSidebar={() => setSidebarOpen(false)}>
      <StateToolbar onState={setPreviewState} state={previewState} />
      <VisitHeader score={visit.claimScore} status={readinessStatus} visit={visit} width={completionWidth} onAction={setDialog} />
      <SectionNav onJump={jumpTo} />
      {visit.lockedReason ? <LockedBanner reason={visit.lockedReason} onReopen={() => setDialog({ kind: "confirm", title: "Reopen locked visit", text: "Reopening a completed record requires an authorized reason and creates an audit event.", action: "Visit Reopen Requested", requiresReason: true })} /> : null}
      <div className="grid gap-5 pb-28 xl:grid-cols-[320px_minmax(0,1fr)_350px]">
        <aside className="space-y-5">
          <PatientPanel visit={visit} />
          <DocumentsPanel documents={visit.documents} onOpen={(document) => setDialog({ kind: "document", document })} />
        </aside>
        <main className="min-w-0 space-y-5">
          <SafetyAlert allergy={visit.patient.allergy} onAck={() => setToast({ title: "Safety alert acknowledged", text: "Critical warning remains visible in clinical workflow." })} />
          <ClinicalOverview visit={visit} />
          <VitalsGrid visit={visit} />
          <Tabs active={activeTab} onActive={setActiveTab}>
            {activeTab === "soap" ? <SoapWorkspace visit={visit} /> : null}
            {activeTab === "diagnosis" ? <DiagnosisPanel visit={visit} /> : null}
            {activeTab === "medication" ? <MedicationPanel medications={visit.medications} onOverride={() => setDialog({ kind: "confirm", title: "Override medication warning", text: "Critical allergy overrides require a clinical justification and authorized review.", action: "Medication Override Requested", requiresReason: true })} /> : null}
          </Tabs>
          <AiSummary insights={visit.insights} onAction={(action) => setDialog({ kind: "confirm", title: `${action} AI summary`, text: "AI output is decision support only. A human reviewer must confirm before it affects diagnosis, treatment, or claim decisions.", action: `AI ${action} Recorded`, requiresReason: action !== "Accept" })} />
          <ProcedurePanel visit={visit} />
        </main>
        <aside className="space-y-5 xl:sticky xl:top-[150px] xl:self-start">
          <ClaimReadinessPanel breakdown={visit.readinessBreakdown} score={visit.claimScore} status={readinessStatus} onReevaluate={() => setDialog({ kind: "confirm", title: "Re-evaluate Claim Readiness", text: "This recalculates decision-support information. It is not final claim approval.", action: "Claim Readiness Re-evaluated" })} />
          <MissingEvidencePanel visit={visit} onRequest={() => setDialog({ kind: "confirm", title: "Request missing evidence", text: "Evidence request will notify responsible staff and add an audit entry.", action: "Evidence Request Sent" })} />
          <InsurancePanel visit={visit} />
          <EconomicPanel visit={visit} />
          <ActivityPanel activity={visit.activity} onOpen={(activity) => setDialog({ kind: "activity", activity })} />
        </aside>
      </div>
      <WorkflowBar
        onComplete={() => setDialog({ kind: "confirm", title: "Complete Visit", text: "Completing this visit locks clinical documentation and requires human confirmation.", action: "Visit Completion Confirmed" })}
        onEvidence={() => setDialog({ kind: "confirm", title: "Request Evidence", text: "Missing evidence will be routed to clinic staff for follow-up.", action: "Evidence Request Sent" })}
        onSave={() => setToast({ title: "Draft saved", text: "บันทึกฉบับร่างแล้ว ไม่มีข้อมูลถูกส่งไปยังระบบภายนอก" })}
      />
      <VisitDialog dialog={dialog} reason={reason} onClose={() => setDialog(null)} onReason={setReason} onRun={runDialogAction} />
      <Toast toast={toast} />
    </Shell>
  );
}

function Shell({ children, sidebarOpen, onOpenSidebar, onCloseSidebar }: { children: ReactNode; sidebarOpen: boolean; onOpenSidebar: () => void; onCloseSidebar: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground [--sidebar:260px]">
      {sidebarOpen ? <button aria-label="Close sidebar overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={onCloseSidebar} type="button" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar)] flex-col border-r border-white/10 bg-deep-blue text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-white/10 p-6">
          <h1 className="text-xl font-extrabold">Med AI NexSure</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Clinical Intelligence</p>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${item.active ? "border-l-4 border-accent bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`} href={item.href} key={item.label}>
              <item.icon className="h-5 w-5" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3 text-xs">
            <strong>Dr. Sarah Jenkins</strong>
            <p className="text-white/55">Chief Medical Officer</p>
          </div>
        </div>
      </aside>
      <main className="min-h-screen lg:ml-[var(--sidebar)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/95 px-4 backdrop-blur lg:px-8">
          <Button aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-white text-muted-foreground lg:hidden" onClick={onOpenSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground md:flex">
            <Link href="/visits">Visits</Link><span>/</span><span className="text-primary">Visit Detail</span>
          </div>
          <label className="relative ml-auto hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-10 w-full rounded-full border-0 bg-slate-100 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Search medical records..." />
          </label>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button aria-label="AI copilot" className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-soft-background"><Bot className="h-5 w-5" /></Button>
            <Button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-soft-background"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /></Button>
          </div>
        </header>
        <div className="mx-auto max-w-[1920px] space-y-4 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

function StateToolbar({ state, onState }: { state: "ready" | "empty" | "permission"; onState: (state: "ready" | "empty" | "permission") => void }) {
  return (
    <div className="flex justify-end">
      <label className="text-xs font-bold text-muted-foreground">
        Preview State
        <select className="ml-2 rounded-lg border border-border bg-white px-2 py-1 text-xs text-slate-700" value={state} onChange={(event) => onState(event.target.value as "ready" | "empty" | "permission")}>
          <option value="ready">Ready</option>
          <option value="empty">Empty</option>
          <option value="permission">Permission Denied</option>
        </select>
      </label>
    </div>
  );
}

function VisitHeader({ visit, score, status, width, onAction }: { visit: VisitDetail; score: number; status: string; width: number; onAction: (state: DialogState) => void }) {
  return (
    <section className="sticky top-16 z-20 flex flex-col gap-4 rounded-2xl border border-border bg-white/95 p-4 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-primary">{visit.patient.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{visit.patient.hn} · {visit.patient.visitId} · <StatusPill label={visit.status} tone="blue" /></p>
        </div>
        <Metric label="Claim Readiness" value={`${score}/100`} helper={status} width={width} />
        <Metric label="Clinical Risk" value={visit.clinicalRisk} helper="Clinical safety first" width={64} warning />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-soft-background" onClick={() => onAction({ kind: "confirm", title: "Open visit history", text: "Visit history opens in read-only audit context.", action: "History Opened" })}>History</Button>
        <Button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-deep-blue" onClick={() => onAction({ kind: "confirm", title: "Create new clinical note", text: "New notes remain draft until authorized human confirmation.", action: "New Note Created" })}>New Note</Button>
      </div>
    </section>
  );
}

function SectionNav({ onJump }: { onJump: (id: string) => void }) {
  return <nav className="sticky top-[146px] z-10 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2 shadow-sm" aria-label="Visit section navigation">{sections.map(([id, label]) => <button className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-soft-background hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent" key={id} onClick={() => onJump(id)} type="button">{label}</button>)}</nav>;
}

function LockedBanner({ reason, onReopen }: { reason: string; onReopen: () => void }) {
  return <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center"><ShieldAlert className="h-6 w-6 text-warning" /><div className="flex-1"><strong className="text-sm text-amber-900">Locked Visit</strong><p className="text-xs text-slate-600">{reason}</p></div><Button className="rounded-xl bg-warning px-4 py-2 text-xs font-bold text-white" onClick={onReopen}>Reopen with Reason</Button></section>;
}

function PatientPanel({ visit }: { visit: VisitDetail }) {
  return (
    <section id="overview" className="rounded-2xl border border-border bg-white p-5 shadow-sm scroll-mt-44">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-soft-background text-lg font-extrabold text-primary">{visit.patient.initials}</div>
        <div><h3 className="font-extrabold">{visit.patient.name}</h3><p className="text-xs text-muted-foreground">{visit.patient.age} Years · {visit.patient.sex}</p></div>
      </div>
      <div className="mt-5 space-y-3">
        <InfoRow label="Critical Allergy" value={visit.patient.allergy} danger />
        <InfoRow label="Insurance Policy" value={visit.patient.insurancePolicy} status={visit.patient.coverageStatus} />
        <InfoRow label="PDPA Consent" value={visit.patient.pdpaConsent} status="ยินยอมใช้งานข้อมูล" />
        <InfoRow label="Clinic" value={visit.patient.clinic} />
        <InfoRow label="Physician" value={visit.patient.physician} />
      </div>
    </section>
  );
}

function SafetyAlert({ allergy, onAck }: { allergy: string; onAck: () => void }) {
  return <section className="flex flex-col gap-4 rounded-2xl border-2 border-danger bg-red-50 p-4 shadow-sm sm:flex-row sm:items-center"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-danger text-white"><AlertTriangle className="h-6 w-6" /></div><div className="flex-1"><h3 className="text-sm font-extrabold uppercase text-danger">Severe Allergy Alert: {allergy}</h3><p className="mt-1 text-sm text-red-700">Patient has reported anaphylactic shock history. Do not prescribe Beta-lactam antibiotics. <strong>ห้ามใช้ยากลุ่มเพนิซิลลินโดยเด็ดขาด</strong></p></div><Button className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-white" onClick={onAck}>Acknowledge</Button></section>;
}

function ClinicalOverview({ visit }: { visit: VisitDetail }) {
  return <section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold text-slate-950">Clinical Overview</h3><div className="mt-4 grid gap-3 md:grid-cols-3"><InfoCard label="Visit Date" value={visit.patient.visitDate} /><InfoCard label="Primary Diagnosis" value="K29.7 Gastritis" /><InfoCard label="Audit Status" value="Traceable · Human review required" /></div></section>;
}

function VitalsGrid({ visit }: { visit: VisitDetail }) {
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{visit.vitals.map((vital) => <article className="rounded-2xl border border-border bg-white p-4 shadow-sm" key={vital.label}><p className="text-[10px] font-bold uppercase text-muted-foreground">{vital.label}</p><div className="mt-2 flex items-baseline gap-1"><strong className="font-mono text-xl text-primary">{vital.value}</strong><span className="text-xs text-muted-foreground">{vital.unit}</span></div><StatusPill label={vital.status} tone={vital.severity === "warning" ? "warning" : "success"} /></article>)}</section>;
}

function Tabs({ active, onActive, children }: { active: string; onActive: (tab: "soap" | "diagnosis" | "medication") => void; children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-white shadow-sm"><div className="flex gap-1 border-b border-border bg-slate-50 p-2">{(["soap", "diagnosis", "medication"] as const).map((tab) => <button className={`rounded-xl px-4 py-2 text-xs font-extrabold capitalize ${active === tab ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"}`} key={tab} onClick={() => onActive(tab)} type="button">{tab}</button>)}</div>{children}</section>;
}

function SoapWorkspace({ visit }: { visit: VisitDetail }) {
  const rows = [["S", "Subjective", visit.soap.subjective], ["O", "Objective", visit.soap.objective], ["A", "Assessment", visit.soap.assessment], ["P", "Plan", visit.soap.plan]];
  return <div id="soap" className="divide-y divide-border scroll-mt-44">{rows.map(([letter, label, text]) => <div className="grid gap-4 p-4 sm:grid-cols-[42px_minmax(0,1fr)]" key={letter}><div className="text-center text-2xl font-extrabold text-primary">{letter}</div><label className="block"><span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span><textarea className="mt-1 min-h-20 w-full resize-y rounded-xl border border-transparent bg-white p-2 text-sm leading-6 outline-none hover:border-border focus:border-primary focus:ring-2 focus:ring-accent" defaultValue={text} /></label></div>)}</div>;
}

function DiagnosisPanel({ visit }: { visit: VisitDetail }) {
  return <section id="diagnosis" className="space-y-3 p-4 scroll-mt-44">{visit.diagnoses.map((item) => <article className="rounded-xl border border-border bg-slate-50 p-4" key={item.code}><div className="flex flex-wrap items-center gap-2"><strong className="text-primary">{item.code}</strong><span className="font-bold">{item.label}</span><StatusPill label={item.status} tone={item.status === "AI Suggested" ? "blue" : "success"} /></div><p className="mt-2 text-xs text-muted-foreground">Confidence {item.confidence}% · Human confirmation required before final diagnosis.</p></article>)}</section>;
}

function MedicationPanel({ medications, onOverride }: { medications: Medication[]; onOverride: () => void }) {
  return <section id="medication" className="overflow-x-auto scroll-mt-44"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-3">Medication</th><th className="p-3">Dosage</th><th className="p-3">Freq</th><th className="p-3">Safety Status</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-border">{medications.map((med) => <tr className={med.safetyStatus === "Critical Warning" ? "bg-red-50" : ""} key={med.name}><td className={`p-3 font-bold ${med.safetyStatus === "Critical Warning" ? "text-danger" : ""}`}>{med.name}<p className="mt-1 text-xs font-normal text-muted-foreground">{med.explanation}</p></td><td className="p-3">{med.dosage}</td><td className="p-3">{med.frequency}</td><td className="p-3"><StatusPill label={med.safetyStatus} tone={med.safetyStatus === "Critical Warning" ? "danger" : "success"} /></td><td className="p-3">{med.safetyStatus === "Critical Warning" ? <Button className="rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-white" onClick={onOverride}>Override</Button> : <span className="text-xs text-muted-foreground">No action</span>}</td></tr>)}</tbody></table></section>;
}

function AiSummary({ insights, onAction }: { insights: Insight[]; onAction: (action: "Accept" | "Edit" | "Reject") => void }) {
  return <section id="ai" className="rounded-2xl border border-blue-200 bg-soft-background p-5 shadow-sm scroll-mt-44"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-ai" /><h3 className="text-sm font-extrabold uppercase text-ai">AI Clinical Summary</h3><span className="ml-auto text-xs font-bold text-success">Confidence 94%</span></div><div className="space-y-3">{insights.map((insight) => <article className="rounded-xl border border-blue-100 bg-white/70 p-3" key={insight.title}><strong className="text-sm text-slate-950">{insight.title}</strong><p className="mt-1 text-sm leading-6 text-slate-600">{insight.text}</p></article>)}</div><p className="mt-4 text-xs font-bold text-primary">AI output is decision-support information only. Requires authorized human review.</p><div className="mt-4 flex flex-wrap gap-2">{(["Accept", "Edit", "Reject"] as const).map((action) => <Button className={`rounded-xl px-4 py-2 text-xs font-bold ${action === "Accept" ? "bg-ai text-white" : "border border-blue-200 bg-white text-primary"}`} key={action} onClick={() => onAction(action)}>{action}</Button>)}</div></section>;
}

function ProcedurePanel({ visit }: { visit: VisitDetail }) {
  return <section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold">Procedure and Treatment</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{visit.procedures.map((item) => <InfoCard key={item.label} label={item.label} value={item.status} helper={item.note} />)}</div></section>;
}

function DocumentsPanel({ documents, onOpen }: { documents: EvidenceDocument[]; onOpen: (document: EvidenceDocument) => void }) {
  return <section id="evidence" className="rounded-2xl border border-border bg-white p-5 shadow-sm scroll-mt-44"><h3 className="text-sm font-extrabold uppercase text-slate-700">Medical Documents</h3><div className="mt-4 space-y-2">{documents.map((doc) => <button className="flex w-full items-center justify-between rounded-xl border border-transparent p-3 text-left hover:border-border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent" key={doc.id} onClick={() => onOpen(doc)} type="button"><span><strong className="block text-sm">{doc.title}</strong><span className="text-xs text-muted-foreground">{doc.meta}</span></span><StatusPill label={doc.status} tone={doc.status === "Missing" ? "danger" : doc.status === "Pending" ? "warning" : "success"} /></button>)}</div></section>;
}

function ClaimReadinessPanel({ score, status, breakdown, onReevaluate }: { score: number; status: string; breakdown: ReadinessBreakdown[]; onReevaluate: () => void }) {
  return <section id="claim" className="rounded-2xl border border-border bg-white p-5 shadow-sm scroll-mt-44"><div className="flex items-center justify-between"><h3 className="text-sm font-extrabold">Claim Readiness</h3><ShieldCheck className="h-5 w-5 text-primary" /></div><div className="my-5 grid place-items-center"><div className="grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(var(--nexsure-primary)_78%,#e2e8f0_0)]"><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><strong className="text-3xl text-primary">{score}</strong><span className="text-[10px] font-bold uppercase text-muted-foreground">{status}</span></div></div></div><div className="space-y-3">{breakdown.map((row) => <div key={row.label}><div className="mb-1 flex justify-between gap-2 text-[10px]"><span className="font-bold text-slate-600">{row.label} ({row.weight}%)</span><strong>{row.score}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-primary" style={{ width: `${row.score}%` }} /></div><p className="mt-1 text-[10px] text-muted-foreground">{row.explanation}</p></div>)}</div><p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-primary">Claim Readiness is decision-support information, not final claim approval.</p><Button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white" onClick={onReevaluate}><RefreshCw className="h-4 w-4" />Re-evaluate Claim Readiness</Button></section>;
}

function MissingEvidencePanel({ visit, onRequest }: { visit: VisitDetail; onRequest: () => void }) {
  return <section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold">Missing Evidence</h3><div className="mt-3 space-y-2">{visit.missingEvidence.map((item) => <label className={`flex gap-3 rounded-xl border p-3 ${item.priority === "Critical" ? "border-red-100 bg-red-50" : "border-amber-100 bg-amber-50"}`} key={item.id}><Checkbox aria-label={item.title} /><span><strong className={item.priority === "Critical" ? "text-danger" : "text-amber-800"}>{item.title}</strong><p className="text-xs text-slate-600">{item.explanation}</p></span></label>)}</div><Button className="mt-3 w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-primary hover:bg-soft-background" onClick={onRequest}>Request Evidence</Button></section>;
}

function InsurancePanel({ visit }: { visit: VisitDetail }) {
  return <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><h3 className="flex items-center gap-2 text-sm font-extrabold text-primary"><ShieldCheck className="h-5 w-5" />Insurance Intelligence</h3><ul className="mt-3 space-y-2">{visit.insuranceRules.map((rule) => <li className="flex gap-2 text-xs leading-5 text-slate-600" key={rule}><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{rule}</li>)}</ul></section>;
}

function EconomicPanel({ visit }: { visit: VisitDetail }) {
  return <section className="rounded-2xl border border-border bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold">Economic Intelligence</h3><div className="mt-3 space-y-2">{visit.economicSignals.map((signal) => <InfoCard key={signal.label} label={signal.label} value={signal.status} helper={signal.note} />)}</div></section>;
}

function ActivityPanel({ activity, onOpen }: { activity: ActivityItem[]; onOpen: (item: ActivityItem) => void }) {
  return <section id="activity" className="rounded-2xl border border-border bg-white p-5 shadow-sm scroll-mt-44"><h3 className="text-sm font-extrabold">Recent Activity</h3><div className="mt-4 space-y-4">{activity.map((item) => {
    const Icon = activityIcons[item.icon];
    return <button className="flex w-full gap-3 text-left" key={item.id} onClick={() => onOpen(item)} type="button"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft-background text-primary"><Icon className="h-4 w-4" /></div><span><strong className="block text-xs">{item.title}</strong><span className="block text-[10px] text-muted-foreground">{item.time} · {item.actor}</span></span></button>;
  })}</div></section>;
}

function WorkflowBar({ onSave, onEvidence, onComplete }: { onSave: () => void; onEvidence: () => void; onComplete: () => void }) {
  return <footer className="fixed bottom-0 right-0 z-30 flex w-full flex-col gap-3 border-t border-border bg-white/95 p-4 shadow-2xl backdrop-blur lg:w-[calc(100%-260px)] sm:flex-row sm:items-center sm:justify-end"><div className="mr-auto flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Save className="h-4 w-4" />Auto-saved at 11:04 AM</div><Button className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-primary hover:bg-soft-background" onClick={onSave}>Save Draft</Button><Button className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-primary hover:bg-soft-background" onClick={onEvidence}>Request Evidence</Button><Button className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-deep-blue" onClick={onComplete}>Complete Visit</Button></footer>;
}

function VisitDialog({ dialog, reason, onReason, onClose, onRun }: { dialog: DialogState; reason: string; onReason: (value: string) => void; onClose: () => void; onRun: () => void }) {
  if (!dialog) return null;
  if (dialog.kind === "document") {
    return <Modal title="Document Preview" onClose={onClose}><div className="rounded-xl border border-border bg-slate-50 p-5"><FileText className="mb-3 h-8 w-8 text-primary" /><strong>{dialog.document.title}</strong><p className="mt-2 text-sm text-muted-foreground">{dialog.document.meta}</p><StatusPill label={dialog.document.status} tone={dialog.document.status === "Missing" ? "danger" : "success"} /></div></Modal>;
  }
  if (dialog.kind === "activity") {
    return <Modal title="Activity Detail" onClose={onClose}><p className="text-sm leading-6 text-slate-600">{dialog.activity.detail}</p><p className="mt-3 text-xs text-muted-foreground">{dialog.activity.time} · {dialog.activity.actor}</p></Modal>;
  }
  return <Modal title={dialog.title} onClose={onClose}><p className="text-sm leading-6 text-slate-600">{dialog.text}</p>{dialog.requiresReason ? <label className="mt-4 block text-xs font-bold text-slate-700">Reason<textarea className="mt-1 min-h-24 w-full rounded-xl border border-border p-3 text-sm outline-none focus:ring-2 focus:ring-accent" value={reason} onChange={(event) => onReason(event.target.value)} placeholder="ระบุเหตุผลสำหรับ audit trail..." /></label> : null}<div className="mt-5 flex justify-end gap-2"><Button className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-slate-600" onClick={onClose}>Cancel</Button><Button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white" onClick={onRun}>{dialog.action}</Button></div></Modal>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <><button aria-label="Close dialog overlay" className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose} type="button" /><section aria-modal="true" role="dialog" className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-extrabold">{title}</h2><Button aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground" onClick={onClose}><X className="h-4 w-4" /></Button></div>{children}</section></>;
}

function Toast({ toast }: { toast: ToastState }) {
  return <div className={`fixed bottom-24 right-5 z-[70] max-w-sm rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white shadow-2xl transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} role="status" aria-live="polite"><strong className="text-sm">{toast?.title}</strong><p className="mt-1 text-xs text-slate-300">{toast?.text}</p></div>;
}

function Metric({ label, value, helper, width, warning = false }: { label: string; value: string; helper: string; width: number; warning?: boolean }) {
  return <div><p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p><div className="mt-1 flex items-center gap-2"><strong className={warning ? "text-warning" : "text-primary"}>{value}</strong><div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200"><span className={warning ? "block h-full bg-warning" : "block h-full bg-primary"} style={{ width: `${width}%` }} /></div></div><p className="text-[10px] text-muted-foreground">{helper}</p></div>;
}

function StatusPill({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "blue" }) {
  const styles = { success: "border-emerald-200 bg-emerald-50 text-success", warning: "border-amber-200 bg-amber-50 text-warning", danger: "border-red-200 bg-red-50 text-danger", blue: "border-blue-200 bg-blue-50 text-primary" };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${styles[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

function InfoRow({ label, value, status, danger = false }: { label: string; value: string; status?: string; danger?: boolean }) {
  return <div className={`rounded-xl border p-3 ${danger ? "border-red-200 bg-red-50" : "border-border bg-slate-50"}`}><p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><strong className={danger ? "text-danger" : "text-slate-900"}>{value}</strong>{status ? <StatusPill label={status} tone={danger ? "danger" : "success"} /> : null}</div></div>;
}

function InfoCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return <article className="rounded-xl border border-border bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p><strong className="mt-1 block text-sm text-slate-950">{value}</strong>{helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}</article>;
}
