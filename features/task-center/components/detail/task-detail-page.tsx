"use client";

import Link from "next/link";
import { useState } from "react";
import type { TaskDetailRecord } from "../../detail-data";
import { dueClasses, focusRing, priorityClasses, statusClasses, workflowClasses } from "../task-center-styles";
import { TaskShell } from "../task-shell";
import { TaskToast } from "../task-toast";

type DetailTab = "Overview" | "Evidence" | "Related Items" | "Comments";

const tabs: DetailTab[] = ["Overview", "Evidence", "Related Items", "Comments"];

export function TaskDetailPage({ detail }: { detail: TaskDetailRecord }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const [toast, setToast] = useState("");
  const [status, setStatus] = useState(detail.task.status);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function markComplete() {
    setStatus("Completed");
    showToast(`${detail.task.id} marked complete`);
  }

  const currentTask = { ...detail.task, status, due: status === "Completed" ? "Completed" : detail.task.due, dueTone: status === "Completed" ? "emerald" : detail.task.dueTone };
  const missingEvidenceCount = detail.evidence.filter((item) => item.status === "Missing").length;
  const blockingEvidence = detail.evidence.find((item) => item.status === "Missing")?.name ?? "No active blocker";
  const nextAction = missingEvidenceCount > 0 ? "Upload required evidence" : "Review and confirm";

  return (
    <TaskShell sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onClosePanels={() => setSidebarOpen(false)}>
      <div className="min-w-0 px-4 py-5 sm:px-6 xl:px-8 xl:py-7">
        <div className="mb-5 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
          <div className="border-l-4 border-blue-700 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-700">
                  <Link href="/task-center" className="hover:text-blue-900">Task Center</Link>
                  <span className="text-slate-300">/</span>
                  <span>{currentTask.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusClasses(currentTask.status)}>{currentTask.status}</Badge>
                  <Badge className={priorityClasses(currentTask.priority)}>{currentTask.priority}</Badge>
                  <Badge className={workflowClasses(currentTask.workflow)}>{currentTask.workflow}</Badge>
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">{currentTask.title}</h1>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{currentTask.description}</p>
                <p className="mt-1 text-sm text-slate-500">เห็นภาพงาน เจ้าของงาน หลักฐานที่ขาด และประวัติการตรวจสอบในหน้าเดียว</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button className={`${focusRing} rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm`} onClick={() => showToast("Task reassigned")} type="button">Reassign</button>
                <button className={`${focusRing} rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(30,58,138,0.08)] hover:bg-[#0F2A5F]`} onClick={markComplete} type="button">Mark Complete</button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetaCard label="Due Date" value={currentTask.due} valueClass={dueClasses(currentTask.dueTone)} helper="SLA and workload priority" />
              <MetaCard label="Owner" value={currentTask.assignee} helper={currentTask.assigneeInitials === "—" ? "Pending assignment" : `Reviewer ${currentTask.assigneeInitials}`} />
              <MetaCard label="Blocker" value={blockingEvidence} valueClass={missingEvidenceCount ? "text-rose-700" : "text-emerald-700"} helper={missingEvidenceCount ? "Completion blocked" : "No missing evidence"} />
              <MetaCard label="Next Action" value={nextAction} helper="Human review required" />
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-4">
          <AnalyticsCard title="Claim Readiness" value={detail.readiness.score} suffix="/100" helper={detail.readiness.status} tone="blue" />
          <AnalyticsCard title="Evidence Gap" value={`${missingEvidenceCount}`} suffix=" item" helper={blockingEvidence} tone={missingEvidenceCount ? "rose" : "emerald"} />
          <AnalyticsCard title="Risk Level" value={detail.readiness.risk} helper="Decision support only" tone={detail.readiness.risk === "High" ? "rose" : "amber"} />
          <AnalyticsCard title="Audit Events" value={`${detail.audit.length}`} helper="Traceable activity" tone="slate" />
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,34%)]">
          <main className="min-w-0 space-y-5">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
              <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-4">
                {tabs.map((tab) => (
                  <button key={tab} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${activeTab === tab ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
                ))}
              </div>
              <div className="p-4 sm:p-5">
                {activeTab === "Overview" ? <OverviewTab detail={detail} /> : null}
                {activeTab === "Evidence" ? <EvidenceTab detail={detail} /> : null}
                {activeTab === "Related Items" ? <RelatedItemsTab detail={detail} /> : null}
                {activeTab === "Comments" ? <CommentsTab /> : null}
              </div>
            </section>
            <ActivityAuditSection detail={detail} />
          </main>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
            <ContextPanel detail={detail} />
            <ChecklistPanel missingEvidenceCount={missingEvidenceCount} />
            <ActionsPanel onReassign={() => showToast("Task reassigned")} onComplete={markComplete} />
          </aside>
        </div>
      </div>
      <TaskToast message={toast} />
    </TaskShell>
  );
}

function OverviewTab({ detail }: { detail: TaskDetailRecord }) {
  return (
    <div className="space-y-5">
      <Section title="Why This Task Exists"><p className="text-sm leading-6 text-slate-600">{detail.task.description}</p></Section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Patient and Visit Context"><PatientVisit detail={detail} /></Section>
        <Section title="Claim Readiness and Risk"><Readiness detail={detail} /></Section>
      </div>
    </div>
  );
}

function EvidenceTab({ detail }: { detail: TaskDetailRecord }) {
  return (
    <Section title="Evidence and Attachments">
      <div className="min-w-0 divide-y divide-slate-100 rounded-2xl border border-slate-200">
        {detail.evidence.map((item) => <div key={item.name} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-extrabold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">Owner · {item.owner}</p></div><Badge className={item.status === "Missing" ? "bg-rose-100 text-rose-700" : item.status === "Draft" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}>{item.status}</Badge></div>)}
      </div>
    </Section>
  );
}

function RelatedItemsTab({ detail }: { detail: TaskDetailRecord }) {
  return (
    <Section title="Related Items">
      <div className="grid gap-3 sm:grid-cols-2">
        {detail.relatedItems.map((item) => <RelatedItem key={item.label} label={item.label} value={item.value} tone={item.tone} />)}
      </div>
    </Section>
  );
}

function CommentsTab() {
  return (
    <Section title="Internal Notes">
      <label htmlFor="detail-comment" className="text-sm font-extrabold text-slate-900">Internal Note</label>
      <textarea id="detail-comment" rows={5} className={`${focusRing} mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm`} placeholder="Add a note for the care or claim team..." />
      <p className="mt-2 text-xs text-slate-500">บันทึกนี้ใช้สำหรับทีมภายในและควรหลีกเลี่ยงข้อมูลที่ไม่จำเป็น</p>
    </Section>
  );
}

function ActivityAuditSection({ detail }: { detail: TaskDetailRecord }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-extrabold text-slate-900">Activity and Audit</h2>
        <p className="mt-1 text-xs text-slate-500">ประวัติการทำงานและหลักฐานการตรวจสอบสำหรับ human-in-the-loop review</p>
      </div>
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
        <Section title="Activity Timeline"><Timeline /></Section>
        <Section title="Audit Information"><Audit detail={detail} /></Section>
      </div>
    </section>
  );
}

function ContextPanel({ detail }: { detail: TaskDetailRecord }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <div className="border-b border-slate-100 bg-blue-950 p-4"><h2 className="text-sm font-extrabold text-white">Patient and Visit Context</h2></div>
      <div className="p-4"><PatientVisit detail={detail} /></div>
    </section>
  );
}

function ChecklistPanel({ missingEvidenceCount }: { missingEvidenceCount: number }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-slate-900">Completion Checklist</h2>
        <Badge className={missingEvidenceCount ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}>{missingEvidenceCount ? "Blocked" : "Clear"}</Badge>
      </div>
      <div className="mt-3 space-y-2">
        <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><input type="checkbox" checked readOnly className="mt-1" /><span><span className="block text-sm font-bold text-emerald-800">Confirm diagnosis and ICD coding</span><span className="mt-0.5 block text-xs text-emerald-700">Completed by Dr. Narin</span></span></label>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" className="mt-1" /><span><span className="block text-sm font-bold text-slate-800">Upload operative note</span><span className="mt-0.5 block text-xs text-slate-500">เอกสารยังไม่ครบถ้วน</span></span></label>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" className="mt-1" /><span><span className="block text-sm font-bold text-slate-800">Re-run claim readiness assessment</span><span className="mt-0.5 block text-xs text-slate-500">Available after evidence upload</span></span></label>
      </div>
    </section>
  );
}

function ActionsPanel({ onReassign, onComplete }: { onReassign: () => void; onComplete: () => void }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <h2 className="text-sm font-extrabold text-slate-900">Actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-3"><button className={`${focusRing} rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700`} onClick={onReassign} type="button">Reassign</button><button className={`${focusRing} rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white`} onClick={onComplete} type="button">Mark Complete</button></div>
    </section>
  );
}

function PatientVisit({ detail }: { detail: TaskDetailRecord }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">{detail.patient.initials}</div><div><p className="text-sm font-bold text-slate-900">{detail.patient.name}</p><p className="text-xs text-slate-500">{detail.patient.hn} · {detail.patient.demographics}</p></div></div>
      <div className="grid grid-cols-2 gap-3 text-sm"><Info label="Visit" value={detail.visit.id} /><Info label="Payer" value={detail.visit.payer} /><Info label="Clinic" value={detail.visit.clinic} /><Info label="Clinician" value={detail.visit.clinician} /><Info label="Consent" value={detail.patient.consent} valueClass="text-emerald-700" /></div>
    </div>
  );
}

function Readiness({ detail }: { detail: TaskDetailRecord }) {
  return <div className="space-y-3"><div className="flex items-end gap-2"><strong className="text-4xl font-extrabold text-blue-950">{detail.readiness.score}</strong><span className="pb-1 text-sm font-bold text-amber-700">{detail.readiness.status}</span></div><p className="text-sm leading-6 text-slate-600">{detail.readiness.explanation}</p><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${detail.readiness.score}%` }} /></div><div className="grid grid-cols-2 gap-3 text-sm"><Info label="Risk" value={detail.readiness.risk} valueClass={detail.readiness.risk === "High" ? "text-rose-700" : "text-amber-700"} /><Info label="Last Assessment" value={detail.readiness.lastAssessment} /></div><p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">AI and rule outputs are decision support only. Human confirmation is required before claim or clinical action.</p></div>;
}

function Timeline() {
  return <div className="space-y-4 border-l border-slate-200 pl-4"><TimelineDot active title="Task created by Claim Readiness Agent" time="Today, 09:12" /><TimelineDot title="Assigned to Chatrapee Jam-Oum" time="Today, 09:18" /></div>;
}

function Audit({ detail }: { detail: TaskDetailRecord }) {
  return <div className="grid gap-3">{detail.audit.map((item) => <Info key={item.label} label={item.label} value={item.value} />)}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 text-sm font-extrabold text-slate-900">{title}</h2>{children}</section>;
}

function MetaCard({ label, value, helper, valueClass = "text-slate-900" }: { label: string; value: string; helper: string; valueClass?: string }) {
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,42,95,0.08)]"><p className="text-xs font-semibold text-slate-400">{label}</p><p className={`mt-2 truncate text-sm font-extrabold ${valueClass}`}>{value}</p><p className="mt-1 truncate text-xs text-slate-500">{helper}</p></article>;
}

function AnalyticsCard({ title, value, helper, tone, suffix = "" }: { title: string; value: string; helper: string; tone: "blue" | "rose" | "amber" | "emerald" | "slate"; suffix?: string }) {
  const toneClass = { blue: "border-blue-200 bg-blue-50 text-blue-900", rose: "border-rose-200 bg-rose-50 text-rose-700", amber: "border-amber-200 bg-amber-50 text-amber-800", emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", slate: "border-slate-200 bg-white text-slate-800" } satisfies Record<typeof tone, string>;
  return <article className={`min-w-0 rounded-2xl border p-4 shadow-[0_10px_30px_rgba(15,42,95,0.08)] ${toneClass[tone]}`}><p className="text-xs font-bold uppercase tracking-[.08em] opacity-70">{title}</p><p className="mt-3 text-2xl font-extrabold tracking-tight">{value}<span className="ml-1 text-sm font-bold opacity-70">{suffix}</span></p><p className="mt-1 truncate text-xs font-semibold opacity-75">{helper}</p></article>;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${className}`}>{children}</span>;
}

function Info({ label, value, valueClass = "text-slate-800" }: { label: string; value: string; valueClass?: string }) {
  return <div><p className="text-xs font-semibold text-slate-400">{label}</p><p className={`mt-1 font-bold ${valueClass}`}>{value}</p></div>;
}

function TimelineDot({ title, time, active = false }: { title: string; time: string; active?: boolean }) {
  return <div className="relative"><span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${active ? "bg-blue-600 ring-blue-50" : "bg-slate-300 ring-white"} ring-4`} /><p className="text-sm font-bold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{time}</p></div>;
}

function RelatedItem({ label, value, tone }: { label: string; value: string; tone: "blue" | "amber" | "rose" | "slate" }) {
  const toneClass = { blue: "border-blue-200 bg-blue-50 text-blue-800", amber: "border-amber-200 bg-amber-50 text-amber-800", rose: "border-rose-200 bg-rose-50 text-rose-700", slate: "border-slate-200 bg-slate-50 text-slate-700" } satisfies Record<typeof tone, string>;
  return <article className={`rounded-2xl border p-4 ${toneClass[tone]}`}><p className="text-xs font-semibold opacity-75">{label}</p><p className="mt-2 text-sm font-extrabold">{value}</p></article>;
}
