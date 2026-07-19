"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useWatch } from "react-hook-form";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Edit3,
  FileText,
  History,
  LayoutDashboard,
  Menu,
  Pill,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { updateSuggestionStatus } from "../services/ai-clinical.service";
import { buildSoapFormValues, summarizeSoapReadiness } from "../services/soap.service";
import type {
  AiClinicalSuggestion,
  AiSuggestionStatus,
  AlertSeverity,
  ClinicalSafetyAlert,
  DiagnosisSuggestion,
  SoapClinicalWorkspaceData,
  SoapSectionKey,
} from "../types/soap.types";
import { useSoapAutoSave } from "../hooks/use-soap-auto-save";
import { useSoapForm } from "../hooks/use-soap-form";

type PreviewState = "ready" | "empty" | "permission" | "error";
type AiTab = "summary" | "differential" | "icd" | "safety" | "claim" | "explainability";
type ToastState = { title: string; text: string } | null;

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: UserRound },
  { label: "Visits", href: "/visits", icon: Stethoscope, active: true },
  { label: "SOAP Notes", href: "/soap-note", icon: FileText },
  { label: "AI Clinical Engine", href: "/ai-clinical-engine", icon: BrainCircuit },
  { label: "Claim Readiness", href: "/claim-readiness", icon: ClipboardCheck },
] as const;

const aiTabs: Array<{ key: AiTab; label: string }> = [
  { key: "summary", label: "AI Summary" },
  { key: "differential", label: "Differential" },
  { key: "icd", label: "ICD" },
  { key: "safety", label: "Clinical Safety" },
  { key: "claim", label: "Claim Impact" },
  { key: "explainability", label: "Explainability" },
];

export function SoapClinicalWorkspace({ data }: { data: SoapClinicalWorkspaceData }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>("ready");
  const [alerts, setAlerts] = useState(data.safetyAlerts);
  const [suggestions, setSuggestions] = useState(data.aiSuggestions);
  const [activeAiTab, setActiveAiTab] = useState<AiTab>("summary");
  const [toast, setToast] = useState<ToastState>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [signAttempted, setSignAttempted] = useState(false);
  const form = useSoapForm(buildSoapFormValues(data));
  const watchedSections = useWatch({ control: form.control });
  const watchValue = JSON.stringify(watchedSections);
  const autoSave = useSoapAutoSave(watchValue);

  const readiness = useMemo(
    () =>
      summarizeSoapReadiness({
        subjective: watchedSections.subjective ?? "",
        objective: watchedSections.objective ?? "",
        assessment: watchedSections.assessment ?? "",
        plan: watchedSections.plan ?? "",
      }),
    [watchedSections.assessment, watchedSections.objective, watchedSections.plan, watchedSections.subjective],
  );
  const criticalAlerts = alerts.filter((alert) => alert.severity === "Critical" && !alert.acknowledged);

  function showMessage(title: string, text: string) {
    setToast({ title, text });
    window.setTimeout(() => setToast(null), 3200);
  }

  function updateAiAction(id: string, status: AiSuggestionStatus) {
    setSuggestions((current) => updateSuggestionStatus(current, id, status));
    showMessage(`AI suggestion ${status}`, "บันทึกการทบทวนโดยแพทย์ไว้สำหรับ audit trail แล้ว");
  }

  async function runAiAnalysis() {
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      showMessage("AI analysis refreshed", "ไม่มีการแก้ไข SOAP โดยอัตโนมัติ");
    }, 1200);
  }

  async function signAndComplete() {
    setSignAttempted(true);
    const valid = await form.trigger();
    if (!valid || criticalAlerts.length > 0) {
      showMessage("Sign blocked", "กรุณาแก้ไขข้อมูลที่จำเป็นและรับทราบ Critical Safety Alert ก่อนลงนาม");
      return;
    }
    showMessage("Ready for human sign-off", "พร้อมส่งต่อให้แพทย์ยืนยันและบันทึก audit trail");
  }

  if (preview !== "ready") {
    return (
      <Shell sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} onOpenSidebar={() => setSidebarOpen(true)}>
        <StateToolbar preview={preview} onPreview={setPreview} />
        <WorkspaceState state={preview} onReady={() => setPreview("ready")} />
      </Shell>
    );
  }

  return (
    <Shell sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} onOpenSidebar={() => setSidebarOpen(true)}>
      <StateToolbar preview={preview} onPreview={setPreview} />
      <SoapPageHeader data={data} readiness={readiness} />
      <ClinicalSafetyBanner
        alerts={alerts}
        onAcknowledge={(id) => {
          setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)));
          showMessage("Safety alert acknowledged", "Critical warning remains visible in patient context.");
        }}
      />
      <main className="grid gap-4 pb-28 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
        <PatientContextPanel data={data} />
        <section className="min-w-0 space-y-4">
          <SoapCompletenessPanel data={data} readiness={readiness} autoSaveState={autoSave.state} savedAt={autoSave.savedAt} />
          <SoapEditor form={form} signAttempted={signAttempted} />
        </section>
        <AiClinicalPanel
          activeTab={activeAiTab}
          claimScore={data.claimReadiness.score}
          diagnoses={data.differentialDiagnoses}
          suggestions={suggestions}
          onTab={setActiveAiTab}
          onSuggestion={updateAiAction}
        />
      </main>
      <RecentActivityTimeline data={data} />
      <SoapStickyActionBar
        autoSaveState={autoSave.state}
        isAnalyzing={isAnalyzing}
        onAnalyze={runAiAnalysis}
        onHistory={() => setShowHistory(true)}
        onSave={() => {
          autoSave.setState("saved");
          showMessage("Draft saved", "บันทึกฉบับร่างแล้ว ยังไม่ใช่ข้อมูลที่ลงนามแล้ว");
        }}
        onSign={signAndComplete}
      />
      {showHistory ? <VersionHistoryDrawer data={data} onClose={() => setShowHistory(false)} /> : null}
      <Toast toast={toast} />
    </Shell>
  );
}

function Shell({ children, sidebarOpen, onOpenSidebar, onCloseSidebar }: { children: ReactNode; sidebarOpen: boolean; onOpenSidebar: () => void; onCloseSidebar: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] [--sidebar:260px]">
      {sidebarOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={onCloseSidebar} type="button" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar)] flex-col bg-[#0F2A5F] px-3 py-5 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-3 pb-6">
          <h1 className="text-xl font-black">Med AI NexSure</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">Enterprise Clinical OS</p>
        </div>
        <nav className="grid gap-1" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold ${item.active ? "border-l-4 border-[#38BDF8] bg-white/12 text-white" : "text-blue-100 hover:bg-white/10"}`} href={item.href} key={item.label}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-lg bg-white/10 p-3 text-xs">
          <strong>Dr. Elena Smith</strong>
          <p className="mt-1 text-blue-100">Endocrinologist</p>
        </div>
      </aside>
      <div className="min-h-screen lg:ml-[var(--sidebar)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 lg:px-6">
          <Button aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] lg:hidden" onClick={onOpenSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#64748B] md:block">Metro General Hospital</div>
          <label className="relative ml-auto hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input className="h-10 rounded-full border-0 bg-[#F8FAFC] pl-9 text-sm" placeholder="Search patient, visit, ICD, evidence..." />
          </label>
          <Button className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-2 text-xs font-bold text-[#1E3A8A]">
            <Bot className="h-4 w-4" />
            AI Copilot
          </Button>
          <Button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-[#64748B] hover:bg-[#EFF6FF]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626]" />
          </Button>
        </header>
        <div className="mx-auto max-w-[1920px] space-y-4 p-4 lg:p-5">{children}</div>
      </div>
    </div>
  );
}

function StateToolbar({ preview, onPreview }: { preview: PreviewState; onPreview: (state: PreviewState) => void }) {
  return (
    <div className="flex justify-end">
      <label className="text-xs font-bold text-[#64748B]">
        Preview State
        <select className="ml-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs" value={preview} onChange={(event) => onPreview(event.target.value as PreviewState)}>
          <option value="ready">Ready</option>
          <option value="empty">Empty</option>
          <option value="permission">No permission</option>
          <option value="error">Error</option>
        </select>
      </label>
    </div>
  );
}

function WorkspaceState({ state, onReady }: { state: Exclude<PreviewState, "ready">; onReady: () => void }) {
  const content = {
    empty: ["SOAP workspace is empty", "ยังไม่มี SOAP note สำหรับ Visit นี้"],
    permission: ["No permission", "คุณไม่มีสิทธิ์เปิดดู SOAP note ของ Visit นี้"],
    error: ["Clinical workspace could not load", "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"],
  }[state];

  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
      <ShieldAlert className="mx-auto h-10 w-10 text-[#D97706]" />
      <h1 className="mt-3 text-2xl font-black">{content[0]}</h1>
      <p className="mt-2 text-sm text-[#64748B]">{content[1]}</p>
      <Button className="mt-5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white" onClick={onReady}>Preview Ready State</Button>
    </section>
  );
}

function SoapPageHeader({ data, readiness }: { data: SoapClinicalWorkspaceData; readiness: { completeness: number; status: string } }) {
  const kpis = [
    ["SOAP Completeness", `${readiness.completeness}%`, "Doctor draft progress", "blue"],
    ["AI Confidence", `${data.aiConfidence}%`, "Requires human review", "ai"],
    ["Clinical Risk", data.clinicalRisk, "Safety first", "warning"],
    ["Claim Readiness", data.claimReadiness.status, `${data.claimReadiness.score}/100`, "danger"],
    ["Documentation", data.documentStatus, "Draft lifecycle", "slate"],
  ] as const;

  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#EFF6FF] text-lg font-black text-[#1E3A8A]">{data.patient.initials}</div>
          <div>
            <h1 className="text-2xl font-black">{data.patient.name}</h1>
            <p className="mt-1 text-sm text-[#64748B]">{data.patient.hn} - {data.patient.sex} - {data.patient.age}y - {data.patient.dateOfBirth}</p>
          </div>
          <Divider />
          <InfoStack label="Current Visit" value={data.visit.visitNumber} />
          <Divider />
          <InfoStack label="Insurance" value={data.patient.insurance} />
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={data.visit.status} tone="success" />
          <StatusBadge label={readiness.status} tone={readiness.status === "Ready" ? "success" : "warning"} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(([label, value, helper, tone]) => <MetricCard helper={helper} key={label} label={label} tone={tone} value={value} />)}
      </div>
    </section>
  );
}

function ClinicalSafetyBanner({ alerts, onAcknowledge }: { alerts: ClinicalSafetyAlert[]; onAcknowledge: (id: string) => void }) {
  return (
    <section className="grid gap-2">
      {alerts.map((alert) => (
        <article className={`flex flex-col gap-3 rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center ${severityBannerClass(alert.severity)}`} key={alert.id} role={alert.severity === "Critical" ? "alert" : "status"}>
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-black uppercase">{alert.title}</h2>
            <p className="mt-1 text-sm">{alert.description}</p>
          </div>
          <Button className="rounded-lg border border-current bg-white/70 px-3 py-2 text-xs font-bold disabled:opacity-60" disabled={alert.acknowledged} onClick={() => onAcknowledge(alert.id)}>
            {alert.acknowledged ? "Acknowledged" : "Acknowledge"}
          </Button>
        </article>
      ))}
    </section>
  );
}

function PatientContextPanel({ data }: { data: SoapClinicalWorkspaceData }) {
  return (
    <aside className="space-y-4">
      <Panel title="Patient and Visit Context" icon={<UserRound className="h-4 w-4" />}>
        <InfoRow label="Chief Complaint" value={data.visit.chiefComplaint} />
        <InfoRow label="Clinic" value={data.visit.clinic} />
        <InfoRow label="Attending Clinician" value={data.visit.attendingClinician} />
        <InfoRow label="PDPA Consent" value={data.patient.pdpaConsent} />
      </Panel>
      <Panel title="Chronic Conditions" icon={<Activity className="h-4 w-4" />}>
        <div className="space-y-2">
          {data.patient.chronicConditions.map((condition) => (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3" key={condition.name}>
              <strong className={condition.severity === "High" ? "text-[#DC2626]" : "text-[#D97706]"}>{condition.name}</strong>
              <p className="mt-1 text-xs text-[#64748B]">{condition.detail}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Current Medications" icon={<Pill className="h-4 w-4" />}>
        <ul className="space-y-2">
          {data.patient.medications.map((medication) => (
            <li className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm" key={medication}>
              <Pill className="h-4 w-4 text-[#1E3A8A]" />
              {medication}
            </li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
}

function SoapCompletenessPanel({ data, readiness, autoSaveState, savedAt }: { data: SoapClinicalWorkspaceData; readiness: { completeness: number; status: string }; autoSaveState: string; savedAt: string }) {
  return (
    <section className="grid gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm md:grid-cols-4">
      <MetricInline label="SOAP Completeness" value={`${readiness.completeness}%`} helper={readiness.status} />
      <MetricInline label="Auto-save" value={autoSaveState} helper={`Last saved ${savedAt}`} />
      <MetricInline label="AI Suggestions" value={String(data.aiSuggestions.length)} helper="Pending human review" />
      <MetricInline label="Clinical Alerts" value={String(data.safetyAlerts.length)} helper="Clinical priority above claim" />
    </section>
  );
}

function SoapEditor({ form, signAttempted }: { form: ReturnType<typeof useSoapForm>; signAttempted: boolean }) {
  const sections: Array<{ key: SoapSectionKey; label: string; marker: string; helper: string }> = [
    { key: "subjective", label: "Subjective", marker: "S", helper: "Patient-reported symptoms and history. ระบุอาการสำคัญอย่างกระชับ" },
    { key: "objective", label: "Objective", marker: "O", helper: "Vitals, examination, and measured findings. ระบุผลตรวจที่เกี่ยวข้อง" },
    { key: "assessment", label: "Assessment", marker: "A", helper: "Doctor-confirmed assessment and working diagnosis. ตรวจสอบก่อนยืนยัน" },
    { key: "plan", label: "Plan", marker: "P", helper: "Treatment, orders, education, and follow-up. ระบุแผนดูแลต่อเนื่อง" },
  ];

  return (
    <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
      {sections.map((section) => {
        const error = form.formState.errors[section.key]?.message;
        return (
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm" key={section.key}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1E3A8A] text-sm font-black text-white">{section.marker}</span>
                <div>
                  <h2 className="text-lg font-black">{section.label}</h2>
                  <p className="text-xs text-[#64748B]">{section.helper}</p>
                </div>
              </div>
              <StatusBadge label={section.key === "subjective" || section.key === "objective" ? "Doctor Confirmed" : "Draft"} tone={section.key === "subjective" || section.key === "objective" ? "success" : "slate"} />
            </div>
            <textarea
              aria-invalid={Boolean(error)}
              className="min-h-32 w-full resize-y rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm leading-6 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              {...form.register(section.key)}
            />
            {error && signAttempted ? <p className="mt-2 text-sm font-semibold text-[#DC2626]" role="alert">{String(error)}</p> : null}
          </section>
        );
      })}
    </form>
  );
}

function AiClinicalPanel({ activeTab, claimScore, diagnoses, suggestions, onTab, onSuggestion }: { activeTab: AiTab; claimScore: number; diagnoses: DiagnosisSuggestion[]; suggestions: AiClinicalSuggestion[]; onTab: (tab: AiTab) => void; onSuggestion: (id: string, status: AiSuggestionStatus) => void }) {
  return (
    <aside className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-hidden">
      <div className="border-b border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#2563EB]" />
          <h2 className="font-black">AI Clinical Engine</h2>
        </div>
        <p className="mt-1 text-xs text-[#64748B]">AI-generated suggestions require authorized human review.</p>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0] bg-[#F8FAFC] p-2">
        {aiTabs.map((tab) => (
          <button className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-black ${activeTab === tab.key ? "bg-white text-[#1E3A8A] shadow-sm" : "text-[#64748B] hover:text-[#1E3A8A]"}`} key={tab.key} onClick={() => onTab(tab.key)} type="button">
            {tab.label}
          </button>
        ))}
      </div>
      <div className="max-h-[720px] overflow-y-auto p-4">
        {activeTab === "differential" || activeTab === "icd" ? (
          <DiagnosisTab diagnoses={diagnoses} />
        ) : activeTab === "claim" ? (
          <ClaimImpactTab claimScore={claimScore} suggestions={suggestions} />
        ) : (
          <SuggestionList activeTab={activeTab} suggestions={suggestions} onSuggestion={onSuggestion} />
        )}
      </div>
    </aside>
  );
}

function SuggestionList({ activeTab, suggestions, onSuggestion }: { activeTab: AiTab; suggestions: AiClinicalSuggestion[]; onSuggestion: (id: string, status: AiSuggestionStatus) => void }) {
  const categoryMap: Record<AiTab, AiClinicalSuggestion["category"]> = {
    summary: "Summary",
    differential: "Differential Diagnosis",
    icd: "ICD",
    safety: "Clinical Safety",
    claim: "Claim Impact",
    explainability: "Explainability",
  };
  const rows = suggestions.filter((suggestion) => suggestion.category === categoryMap[activeTab]);
  const visibleRows = rows.length ? rows : suggestions;
  return (
    <div className="space-y-3">
      {visibleRows.map((suggestion) => (
        <article className="rounded-lg border border-blue-100 bg-[#EFF6FF] p-3" key={suggestion.id}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-black text-[#1E3A8A]">{suggestion.title}</h3>
            <StatusBadge label={suggestion.status} tone={suggestion.status === "Rejected" ? "danger" : suggestion.status === "Pending Review" ? "warning" : "success"} />
          </div>
          <p className="mt-2 text-sm leading-6 text-[#0F172A]">{suggestion.description}</p>
          <p className="mt-2 text-xs font-bold text-[#1E3A8A]">Confidence {suggestion.confidence}%</p>
          <ul className="mt-2 space-y-1 text-xs text-[#64748B]">
            {suggestion.evidence.map((item) => <li className="flex gap-2" key={item}><ChevronRight className="mt-0.5 h-3 w-3" />{item}</li>)}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton icon={<Check className="h-3.5 w-3.5" />} label="Accept" onClick={() => onSuggestion(suggestion.id, "Accepted")} primary />
            <ActionButton icon={<Edit3 className="h-3.5 w-3.5" />} label="Modify" onClick={() => onSuggestion(suggestion.id, "Modified")} />
            <ActionButton icon={<XCircle className="h-3.5 w-3.5" />} label="Reject" onClick={() => onSuggestion(suggestion.id, "Rejected")} />
          </div>
        </article>
      ))}
      <p className="rounded-lg border border-[#E2E8F0] bg-white p-3 text-xs text-[#64748B]">
        AI output is decision-support only. ต้องให้แพทย์ตรวจสอบก่อนนำไปใช้
      </p>
    </div>
  );
}

function DiagnosisTab({ diagnoses }: { diagnoses: DiagnosisSuggestion[] }) {
  return (
    <div className="space-y-3">
      {diagnoses.map((diagnosis) => (
        <article className="rounded-lg border border-[#E2E8F0] bg-white p-3" key={diagnosis.id}>
          <div className="flex items-center justify-between gap-2">
            <strong>{diagnosis.diagnosis}</strong>
            <span className="font-mono text-sm font-black text-[#1E3A8A]">{diagnosis.icd10}</span>
          </div>
          <p className="mt-2 text-sm text-[#64748B]">{diagnosis.rationale}</p>
          <p className="mt-2 text-xs font-bold text-[#1E3A8A]">Confidence {diagnosis.confidence}% - {diagnosis.status}</p>
        </article>
      ))}
    </div>
  );
}

function ClaimImpactTab({ claimScore, suggestions }: { claimScore: number; suggestions: AiClinicalSuggestion[] }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-black uppercase text-[#D97706]">Claim Readiness Impact</p>
        <strong className="mt-1 block text-3xl text-[#1E3A8A]">{claimScore}/100</strong>
        <p className="mt-2 text-sm text-[#64748B]">Claim score is supporting information only. ไม่ใช่ผลอนุมัติเคลม</p>
      </div>
      {suggestions.slice(0, 2).map((suggestion) => <p className="rounded-lg border border-[#E2E8F0] p-3 text-sm text-[#64748B]" key={suggestion.id}>{suggestion.description}</p>)}
    </div>
  );
}

function RecentActivityTimeline({ data }: { data: SoapClinicalWorkspaceData }) {
  return (
    <section className="grid gap-4 pb-24 xl:grid-cols-2">
      <Panel title="Recent Activity" icon={<Clock3 className="h-4 w-4" />}>
        <div className="space-y-3">
          {data.recentActivity.map((item) => (
            <div className="flex gap-3" key={item.id}>
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
              <div>
                <strong className="text-sm">{item.action}</strong>
                <p className="text-xs text-[#64748B]">{item.timestamp} - {item.actor} - {item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Clinical Safety and Claim Separation" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoCard title="Clinical priority" text="Critical safety alerts stay above claim warnings. ต้องรับทราบก่อนลงนาม" tone="danger" />
          <InfoCard title="Claim guidance" text="Readiness recommendations explain missing evidence. ไม่ใช่ผลอนุมัติจาก payer" tone="warning" />
        </div>
      </Panel>
    </section>
  );
}

function SoapStickyActionBar({ autoSaveState, isAnalyzing, onAnalyze, onHistory, onSave, onSign }: { autoSaveState: string; isAnalyzing: boolean; onAnalyze: () => void; onHistory: () => void; onSave: () => void; onSign: () => void }) {
  return (
    <footer className="fixed bottom-0 right-0 z-30 flex w-full flex-col gap-3 border-t border-[#E2E8F0] bg-white/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center lg:w-[calc(100%-260px)]">
      <div className="mr-auto flex items-center gap-2 text-xs font-bold uppercase text-[#64748B]">
        <Save className="h-4 w-4 text-[#059669]" />
        Auto-save {autoSaveState}. Clinical Intelligence Engine Active.
      </div>
      <Button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#1E3A8A]" onClick={onHistory}>
        <History className="h-4 w-4" />
        Version History
      </Button>
      <Button className="rounded-lg border border-[#BFDBFE] bg-white px-4 py-2 text-xs font-bold text-[#1E3A8A]" onClick={onSave}>Save Draft</Button>
      <Button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={isAnalyzing} onClick={onAnalyze}>
        <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
        {isAnalyzing ? "Analyzing" : "Run AI Analysis"}
      </Button>
      <Button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white" onClick={onSign}>
        <CheckCircle2 className="h-4 w-4" />
        Sign and Complete
      </Button>
    </footer>
  );
}

function VersionHistoryDrawer({ data, onClose }: { data: SoapClinicalWorkspaceData; onClose: () => void }) {
  return (
    <>
      <button aria-label="Close version history overlay" className="fixed inset-0 z-40 bg-slate-950/35" onClick={onClose} type="button" />
      <aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto border-l border-[#E2E8F0] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Version History</h2>
          <Button aria-label="Close version history" className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E8F0]" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 space-y-3">
          {data.versionHistory.map((item) => (
            <article className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3" key={item.id}>
              <div className="flex justify-between gap-3">
                <strong>{item.version}</strong>
                <span className="text-xs font-bold text-[#64748B]">{item.timestamp}</span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">{item.author} - {item.summary}</p>
            </article>
          ))}
        </div>
      </aside>
    </>
  );
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={`fixed bottom-24 right-5 z-[70] max-w-sm rounded-lg border border-slate-700 bg-slate-950 p-4 text-white shadow-2xl transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} role="status" aria-live="polite">
      <strong className="text-sm">{toast?.title}</strong>
      <p className="mt-1 text-xs text-slate-300">{toast?.text}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0F172A]">{icon}{title}</h2>
      {children}
    </section>
  );
}

function ActionButton({ label, icon, primary = false, onClick }: { label: string; icon: ReactNode; primary?: boolean; onClick: () => void }) {
  return <Button className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${primary ? "bg-[#1E3A8A] text-white" : "border border-[#BFDBFE] bg-white text-[#1E3A8A]"}`} onClick={onClick}>{icon}{label}</Button>;
}

function MetricCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: string }) {
  const color = tone === "danger" ? "text-[#DC2626]" : tone === "warning" ? "text-[#D97706]" : "text-[#1E3A8A]";
  return (
    <article className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#64748B]">{label}</p>
      <strong className={`mt-1 block text-xl font-black ${color}`}>{value}</strong>
      <p className="mt-1 text-xs text-[#64748B]">{helper}</p>
    </article>
  );
}

function MetricInline({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <div><p className="text-[10px] font-black uppercase text-[#64748B]">{label}</p><strong className="mt-1 block text-lg capitalize text-[#1E3A8A]">{value}</strong><p className="text-xs text-[#64748B]">{helper}</p></div>;
}

function InfoStack({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-black uppercase text-[#64748B]">{label}</p><p className="text-sm font-black text-[#1E3A8A]">{value}</p></div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3"><p className="text-[10px] font-black uppercase text-[#64748B]">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>;
}

function InfoCard({ title, text, tone }: { title: string; text: string; tone: "danger" | "warning" }) {
  return <article className={`rounded-lg border p-3 ${tone === "danger" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><strong className="text-sm">{title}</strong><p className="mt-1 text-xs leading-5">{text}</p></article>;
}

function StatusBadge({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "slate" }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-[#059669]",
    warning: "border-amber-200 bg-amber-50 text-[#D97706]",
    danger: "border-red-200 bg-red-50 text-[#DC2626]",
    slate: "border-slate-200 bg-slate-50 text-[#64748B]",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black ${styles[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

function Divider() {
  return <span className="hidden h-10 w-px bg-[#E2E8F0] md:block" />;
}

function severityBannerClass(severity: AlertSeverity) {
  if (severity === "Critical") return "border-[#DC2626] bg-red-50 text-[#991B1B]";
  if (severity === "High") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-blue-200 bg-[#EFF6FF] text-[#1E3A8A]";
}
