"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bot,
  Check,
  Clock,
  FileText,
  Flag,
  History,
  LinkIcon,
  MessageSquare,
  Paperclip,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { TaskDetailRecord } from "../../detail-data";
import type { TaskStatus } from "../../types";
import { dueClasses, focusRing, priorityClasses, statusClasses, workflowClasses } from "../task-center-styles";
import { TaskShell } from "../task-shell";
import { TaskToast } from "../task-toast";

type SlaState = "On Track" | "Due Soon" | "At Risk" | "Overdue";

export function TaskDetailPage({ detail }: { detail: TaskDetailRecord }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [status, setStatus] = useState<TaskStatus>(detail.task.status);
  const [checklist, setChecklist] = useState(detail.checklist);
  const [evidence, setEvidence] = useState(detail.evidence);
  const [comments, setComments] = useState(detail.comments);
  const [comment, setComment] = useState("");

  const completedCount = checklist.filter((item) => item.state === "completed").length;
  const requiredOpenCount = checklist.filter((item) => item.required && item.state !== "completed").length;
  const blockingCount = evidence.filter((item) => item.blocking && item.status === "Missing").length;
  const completionPercent = Math.round((completedCount / checklist.length) * 100);
  const slaState = getSlaState(detail.sla.progress);
  const canComplete = requiredOpenCount === 0 && blockingCount === 0;
  const primaryAction = getPrimaryAction(status, blockingCount);

  const currentTask = {
    ...detail.task,
    status,
    due: status === "Completed" ? "Completed" : detail.task.due,
    dueTone: status === "Completed" ? "emerald" : detail.task.dueTone,
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleChecklist(id: string) {
    setChecklist((items) =>
      items.map((item) =>
        item.id === id ? { ...item, state: item.state === "completed" ? (item.required ? "required" : "waiting") : "completed" } : item,
      ),
    );
    showToast("Checklist updated · อัปเดตความคืบหน้าเรียบร้อยแล้ว");
  }

  function resolveEvidence(id: string) {
    setEvidence((items) => items.map((item) => (item.id === id ? { ...item, status: "Available", blocking: false, updated: "Just now" } : item)));
    setChecklist((items) => items.map((item) => (item.id === "add-icd" ? { ...item, state: "completed", blocking: false } : item)));
    showToast("Evidence updated · บันทึกหลักฐานสำหรับ Audit Log แล้ว");
  }

  function addComment() {
    const value = comment.trim();
    if (!value) {
      showToast("Comment required · กรุณาระบุข้อความก่อนบันทึก");
      return;
    }
    setComments((items) => [{ author: "Pharmacist Team", role: "Medication Safety", text: value, time: "Just now" }, ...items]);
    setComment("");
    showToast("Comment added · บันทึกความคิดเห็นและแจ้งทีมที่เกี่ยวข้องแล้ว");
  }

  function handlePrimaryAction() {
    if (status === "Open") {
      setStatus("In Progress");
      showToast("Task started · เริ่มดำเนินการตรวจสอบแล้ว");
      return;
    }

    if (!canComplete) {
      showToast("Completion blocked · ยังไม่สามารถปิดงานได้ เนื่องจากมีรายการสำคัญที่ยังดำเนินการไม่ครบ");
      return;
    }

    setStatus("Completed");
    showToast("Task completed · บันทึกการตรวจสอบโดยผู้ใช้งานแล้ว");
  }

  return (
    <TaskShell sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onClosePanels={() => setSidebarOpen(false)}>
      <div className="min-w-0 px-4 py-5 sm:px-6 xl:px-8 xl:py-7">
        <TaskDetailHeader
          detail={detail}
          currentStatus={currentTask.status}
          slaState={slaState}
          blockingCount={blockingCount}
          primaryAction={primaryAction}
          onPrimaryAction={handlePrimaryAction}
          onRequestEvidence={() => resolveEvidence("operative")}
          onToast={showToast}
        />

        <TaskOperationalSummary detail={detail} currentStatus={currentTask.status} slaState={slaState} />
        <div className="mb-6 mt-5">
          <TaskLifecycleTimeline activity={detail.activity} />
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)]">
          <main className="min-w-0 space-y-5">
            <TaskOverviewCard detail={detail} blockingCount={blockingCount} />
            <TaskCodingReview detail={detail} />
            <TaskSlaProgress detail={detail} slaState={slaState} />
            <TaskCompletionChecklist
              checklist={checklist}
              completedCount={completedCount}
              completionPercent={completionPercent}
              requiredOpenCount={requiredOpenCount}
              blockingCount={blockingCount}
              onToggle={toggleChecklist}
              onResolve={resolveEvidence}
            />
            <TaskDecisionAnalytics
              detail={detail}
              completedCount={completedCount}
              completionPercent={completionPercent}
              requiredOpenCount={requiredOpenCount}
              blockingCount={blockingCount}
              slaState={slaState}
            />
            <ActivityAndComments detail={detail} comments={comments} comment={comment} onCommentChange={setComment} onAddComment={addComment} />
          </main>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
            <TaskContextPanel detail={detail} />
            <TaskRiskSummary detail={detail} blockingCount={blockingCount} slaState={slaState} />
            <TaskAiAssistancePanel detail={detail} onRequestEvidence={() => resolveEvidence("operative")} />
            <TaskAttachments detail={detail} />
            <TaskAuditTrail detail={detail} status={status} />
          </aside>
        </div>
      </div>
      <TaskToast message={toast} />
    </TaskShell>
  );
}

function TaskDetailHeader({
  detail,
  currentStatus,
  slaState,
  blockingCount,
  primaryAction,
  onPrimaryAction,
  onRequestEvidence,
  onToast,
}: {
  detail: TaskDetailRecord;
  currentStatus: TaskStatus;
  slaState: SlaState;
  blockingCount: number;
  primaryAction: string;
  onPrimaryAction: () => void;
  onRequestEvidence: () => void;
  onToast: (message: string) => void;
}) {
  const showComplete = currentStatus !== "Completed";
  const showRequestEvidence = currentStatus !== "Completed" && blockingCount > 0;

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <div className="border-l-4 border-blue-800 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/task-center" className={`${focusRing} inline-flex items-center gap-2 rounded-lg text-blue-800 hover:text-blue-950`}>
            <ArrowLeft className="h-4 w-4" /> Back to Task Center
          </Link>
          <span>/</span>
          <span className="font-extrabold text-slate-950">{detail.task.id}</span>
        </div>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={workflowClasses(detail.task.workflow)}>{detail.task.workflow}</Badge>
              <Badge className={statusClasses(currentStatus)}>{currentStatus}</Badge>
              <Badge className={priorityClasses(detail.task.priority)}>{detail.task.priority}</Badge>
              <Badge className={slaTone(slaState)}>{slaState}</Badge>
            </div>
            <h1 className="mt-3 max-w-5xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{detail.task.title}</h1>
            <p className="mt-2 max-w-4xl text-base leading-7 text-slate-600">{detail.task.description}</p>
            <p className="mt-1 text-sm text-slate-500">ตรวจสอบสถานะ เจ้าของงาน SLA และหลักฐานที่เกี่ยวข้องก่อนดำเนินการต่อ</p>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
              <Info label="Task ID" value={detail.task.id} />
              <Info label="Assignee" value={detail.task.assignee} />
              <Info label="Due Date" value={detail.task.due} valueClass={dueClasses(detail.task.dueTone)} />
              <Info label="Risk Level" value={detail.readiness.risk} valueClass={detail.readiness.risk === "High" ? "text-rose-700" : "text-orange-700"} />
              <Info label="Last Updated" value={detail.readiness.lastAssessment} />
              <Info label="Related Visit" value={detail.visit.id} />
              <Info label="Claim" value={detail.visit.claimId} />
              <Info label="Patient" value={detail.patient.name} />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-sm xl:justify-end">
            <button className={`${buttonPrimary()} ${focusRing}`} onClick={onPrimaryAction} type="button">
              <Check className="h-4 w-4" /> {primaryAction}
            </button>
            <button className={`${buttonSecondary()} ${focusRing}`} onClick={() => onToast("Reassign Task opened · เลือกผู้รับผิดชอบใหม่ก่อนบันทึก")} type="button">
              <UserRound className="h-4 w-4" /> Reassign Task
            </button>
            {showRequestEvidence ? (
              <button className={`${buttonSecondary()} ${focusRing}`} onClick={onRequestEvidence} type="button">
                <FileText className="h-4 w-4" /> Request Evidence
              </button>
            ) : null}
            {currentStatus !== "Completed" ? (
              <button className={`${buttonSecondary()} ${focusRing} text-orange-800`} onClick={() => onToast("Escalation noted · บันทึกสถานะสำหรับหัวหน้าทีมแล้ว")} type="button">
                <AlertTriangle className="h-4 w-4" /> Escalate
              </button>
            ) : null}
            {showComplete ? (
              <button className={`${buttonSecondary()} ${focusRing}`} onClick={onPrimaryAction} type="button">
                Mark as Complete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TaskOperationalSummary({ detail, currentStatus, slaState }: { detail: TaskDetailRecord; currentStatus: TaskStatus; slaState: SlaState }) {
  return (
    <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6" aria-label="Task operational summary">
      <SummaryCard label="Current Status" value={currentStatus} badgeClass={statusClasses(currentStatus)} helper="Current workflow state" />
      <SummaryCard label="Priority" value={detail.task.priority} badgeClass={priorityClasses(detail.task.priority)} helper="Operational urgency" />
      <SummaryCard label="Assigned To" value={detail.task.assignee} helper={`Team ${detail.task.assigneeInitials}`} />
      <SummaryCard label="SLA Remaining" value={detail.sla.remaining} badgeClass={slaTone(slaState)} helper={detail.sla.target} />
      <SummaryCard label="Due Date" value={detail.task.due} valueClass={dueClasses(detail.task.dueTone)} helper="SLA target date" />
      <SummaryCard label="Risk Level" value={detail.readiness.risk} valueClass={detail.readiness.risk === "High" ? "text-rose-700" : "text-orange-700"} helper="Requires human review" />
    </section>
  );
}

function TaskDecisionAnalytics({
  detail,
  completedCount,
  completionPercent,
  requiredOpenCount,
  blockingCount,
  slaState,
}: {
  detail: TaskDetailRecord;
  completedCount: number;
  completionPercent: number;
  requiredOpenCount: number;
  blockingCount: number;
  slaState: SlaState;
}) {
  const readinessCurrent = Number(detail.readiness.score);
  const readinessExpected = Number(detail.readiness.expectedScore);
  const readinessTarget = Number(detail.readiness.targetScore);
  const validationTotal = detail.analytics.validationResults.reduce((sum, item) => sum + item.count, 0);
  const highestRisk = detail.analytics.risks.find((item) => item.level === "Critical") ?? detail.analytics.risks.find((item) => item.level === "High") ?? detail.analytics.risks[0];

  return (
    <Card title="Decision Analytics" icon={<BarChart3 className="h-5 w-5" />} description="Minimum chart set for SLA, completion, readiness impact, and risk validation">
      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanel title="SLA Consumption Progress" summary={`${detail.sla.consumed} · ${detail.sla.remaining}`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-extrabold text-slate-950">{detail.sla.progress}%</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{detail.sla.elapsedHours}h of {detail.sla.targetHours}h target</p>
            </div>
            <Badge className={slaTone(slaState)}>{slaState}</Badge>
          </div>
          <ThresholdBar value={Math.min(detail.sla.progress, 100)} threshold={detail.sla.warningThreshold} tone={detail.sla.progress >= 90 ? "danger" : detail.sla.progress >= 70 ? "warning" : "success"} ariaLabel={`SLA consumption ${detail.sla.progress}% with ${detail.sla.warningThreshold}% warning threshold`} />
          <p className="text-xs leading-5 text-slate-500">ช่วยประเมินว่างานใกล้เกิน SLA หรือควร Escalate แล้วหรือยัง</p>
        </AnalyticsPanel>

        <AnalyticsPanel title="Required Action Completion" summary={`${completedCount} of ${detail.checklist.length} actions completed`}>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Progress" value={`${completionPercent}%`} tone="text-blue-900" />
            <MiniStat label="Open Required" value={String(requiredOpenCount)} tone={requiredOpenCount > 0 ? "text-orange-700" : "text-emerald-700"} />
            <MiniStat label="Blocking" value={String(blockingCount)} tone={blockingCount > 0 ? "text-rose-700" : "text-emerald-700"} />
          </div>
          <ThresholdBar value={completionPercent} threshold={100} tone={blockingCount > 0 ? "danger" : requiredOpenCount > 0 ? "warning" : "success"} ariaLabel={`Required action completion ${completionPercent}%`} />
        </AnalyticsPanel>

        <AnalyticsPanel title="Claim Readiness Impact" summary={`Current ${detail.readiness.score} · Expected ${detail.readiness.expectedScore} · Target ${detail.readiness.targetScore}`}>
          <ReadinessBar label="Previous" value={Number(detail.readiness.previousScore)} target={readinessTarget} />
          <ReadinessBar label="Current" value={readinessCurrent} target={readinessTarget} highlight />
          <ReadinessBar label="Expected" value={readinessExpected} target={readinessTarget} />
          <p className="text-xs leading-5 text-slate-500">Potential improvement {detail.readiness.scoreChange} points after Required Actions are resolved.</p>
        </AnalyticsPanel>

        <AnalyticsPanel title="Risk and Validation Summary" summary={`${detail.analytics.blockingItemCount} blocker · ${detail.analytics.warningItemCount} warnings · highest risk ${highestRisk?.level ?? "N/A"}`}>
          <div className="space-y-3">
            <SegmentedValidationBar items={detail.analytics.validationResults} total={validationTotal} />
            <div className="grid grid-cols-4 gap-2" aria-label="Risk matrix summary">
              {detail.analytics.risks.map((risk) => (
                <div key={risk.type} className={`rounded-xl border p-3 text-center ${riskTone(risk.level)}`}>
                  <p className="text-xs font-extrabold">{risk.type}</p>
                  <p className="mt-1 text-lg font-black">{risk.level}</p>
                  <p className="mt-1 text-[11px] font-semibold">L{risk.likelihood} x I{risk.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </AnalyticsPanel>
      </div>
    </Card>
  );
}

function TaskOverviewCard({ detail, blockingCount }: { detail: TaskDetailRecord; blockingCount: number }) {
  return (
    <Card title="Task Overview" icon={<FileText className="h-5 w-5" />} description="Objective, reason, blocking issue, and expected outcome">
      <div className="grid gap-4 lg:grid-cols-2">
        <DescriptionBlock label="Description" value={detail.task.description} />
        <DescriptionBlock label="Task Objective" value="Confirm the missing ICD-10 Code and record an authorized Human Review decision." />
        <DescriptionBlock label="Reason Created" value="Claim Readiness detected a missing Primary Diagnosis code required before Evidence Package completion." />
        <DescriptionBlock label="Current Blocking Issue" value={blockingCount > 0 ? detail.readiness.blockers : "No active blocking item remains."} tone={blockingCount > 0 ? "warning" : "success"} />
        <DescriptionBlock label="Expected Outcome" value="Diagnosis Code — ICD-10 confirmed, any applicable procedure context reviewed separately, and decision recorded in the Audit Trail." />
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Info label="Created By" value="NexSure Engine" />
          <Info label="Created Date" value="10 Jul 2026, 09:12" />
        </div>
      </div>
    </Card>
  );
}

function TaskCodingReview({ detail }: { detail: TaskDetailRecord }) {
  return (
    <div className="space-y-5">
      <Card title="ICD-10 Diagnosis Review" icon={<FileText className="h-5 w-5" />} description="Primary coding review for the selected task">
        <div className="grid gap-4 lg:grid-cols-2">
          <DescriptionBlock label="Diagnosis Code — ICD-10" value={detail.diagnosisReview.diagnosisCode ?? "Missing ICD-10 Code"} tone={detail.diagnosisReview.codingStatus === "Missing" ? "warning" : "success"} />
          <DescriptionBlock label="Diagnosis Description" value={detail.diagnosisReview.diagnosisDescription} />
          <DescriptionBlock label="Coding Status" value={detail.diagnosisReview.codingStatus} tone={detail.diagnosisReview.codingStatus === "Missing" ? "warning" : "neutral"} />
          <DescriptionBlock label="Supporting Evidence" value={detail.diagnosisReview.supportingEvidence} />
        </div>
        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
          ICD-10 remains the primary diagnosis coding review. กรุณาตรวจสอบ Diagnosis และ Clinical Note เพื่อระบุ ICD-10 Code ที่เหมาะสมก่อนส่งเคลม
        </p>
      </Card>

      <ProcedureCodingContextCard detail={detail} />
    </div>
  );
}

function ProcedureCodingContextCard({ detail }: { detail: TaskDetailRecord }) {
  const procedure = detail.procedureCoding;

  if (!procedure) {
    return (
      <Card title="Procedure Coding Context — ICD-9-CM" icon={<ShieldCheck className="h-5 w-5" />} description="ข้อมูลรหัสหัตถการที่เกี่ยวข้องกับการรักษาและการส่งเคลม">
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">No procedure coding required</p>
      </Card>
    );
  }

  const hasCode = Boolean(procedure.existingCode);
  const showAiSuggestion = Boolean(procedure.aiSuggestion && (procedure.codingStatus === "Suggested" || procedure.codingStatus === "Missing"));

  return (
    <Card title="Procedure Coding Context — ICD-9-CM" icon={<ShieldCheck className="h-5 w-5" />} description="ข้อมูลรหัสหัตถการที่เกี่ยวข้องกับการรักษาและการส่งเคลม">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge className={procedureStatusTone(procedure.codingStatus)}>{procedure.codingStatus}</Badge>
        <Badge className={consistencyTone(procedure.consistency)}>{procedure.consistency}</Badge>
        <Badge className={procedure.claimReadinessImpact === "Missing" ? "bg-rose-100 text-rose-700" : procedure.claimReadinessImpact === "Not Required" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"}>Claim Readiness: {procedure.claimReadinessImpact}</Badge>
      </div>

      {!hasCode ? (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900">
          <strong>No ICD-9-CM procedure code assigned</strong>
          <p className="mt-1">ยังไม่ได้ระบุรหัสหัตถการ กรุณาตรวจสอบเวชระเบียนและรายละเอียดการรักษา</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoPanel label="Procedure Name" value={procedure.procedureName} />
        <InfoPanel label="Procedure Date" value={procedure.procedureDate} />
        <InfoPanel label="Procedure Code — ICD-9-CM" value={procedure.existingCode ?? "Not assigned"} tone={!hasCode ? "warning" : "neutral"} />
        <InfoPanel label="ICD-9-CM Description" value={procedure.codeDescription ?? "Not available until code is assigned"} />
        <InfoPanel label="Supporting Evidence" value={procedure.supportingEvidence} />
        <InfoPanel label="Diagnosis Linkage" value={procedure.diagnosisLinkage} />
        <InfoPanel label="Payer Requirement" value={procedure.payerRequirement} tone={procedure.payerRequirement === "Required" ? "warning" : "neutral"} />
        <InfoPanel label="Reviewer Note" value={procedure.reviewerNote} />
        <InfoPanel label="Reviewed By" value={procedure.reviewedBy ?? "Not reviewed"} />
        <InfoPanel label="Reviewed At" value={procedure.reviewedAt ?? "Not available"} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <strong>Coding Consistency:</strong> {procedure.consistency}
        <p className="mt-1">{procedure.consistencyReason}</p>
      </div>

      {showAiSuggestion && procedure.aiSuggestion ? <ProcedureAiSuggestion suggestion={procedure.aiSuggestion} /> : null}
    </Card>
  );
}

function ProcedureAiSuggestion({ suggestion }: { suggestion: NonNullable<NonNullable<TaskDetailRecord["procedureCoding"]>["aiSuggestion"]> }) {
  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[.08em] text-blue-800">AI-generated procedure coding suggestion. Human review is required before confirmation.</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">คำแนะนำรหัสหัตถการจาก AI ใช้เพื่อสนับสนุนการตัดสินใจเท่านั้น ผู้ตรวจสอบต้องยืนยันก่อนใช้งาน</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <InfoPanel label="Suggested Procedure Code" value={suggestion.code} />
        <InfoPanel label="Procedure Description" value={suggestion.description} />
        <InfoPanel label="Confidence Score" value={`${suggestion.confidence}%`} />
        <InfoPanel label="Source" value={suggestion.source} />
        <InfoPanel label="Supporting Evidence" value={suggestion.supportingEvidence} />
        <InfoPanel label="Alternative Codes" value={suggestion.alternativeCodes.map((item) => `${item.code} — ${item.description}`).join("; ")} />
      </div>
    </div>
  );
}

function TaskSlaProgress({ detail, slaState }: { detail: TaskDetailRecord; slaState: SlaState }) {
  const visibleProgress = Math.min(detail.sla.progress, 100);
  const overrun = Math.max(detail.sla.progress - 100, 0);
  return (
    <Card title="SLA Progress" icon={<Clock className="h-5 w-5" />} description="Time consumed, remaining time, target, and SLA status">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge className={slaTone(slaState)}>{slaState}</Badge>
          <p className="mt-2 text-sm leading-6 text-slate-600">Time consumed: {detail.sla.consumed} · Time remaining: {detail.sla.remaining} · SLA target: {detail.sla.target}</p>
          <p className="mt-1 text-sm text-slate-500">งานนี้ใกล้เกินกำหนด กรุณาดำเนินการหรือส่งต่อให้ผู้รับผิดชอบโดยเร็ว</p>
        </div>
        <strong className="text-2xl font-extrabold text-slate-950">{detail.sla.progress}%</strong>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-[.08em] text-slate-500">
          <span>0%</span><span>70 Due Soon</span><span>90 At Risk</span><span>100 Target</span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={`SLA ${slaState}, ${detail.sla.progress}% consumed`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={visibleProgress}>
          <div className={`h-full rounded-full ${slaState === "Overdue" ? "bg-rose-600" : slaState === "At Risk" ? "bg-orange-500" : slaState === "Due Soon" ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${visibleProgress}%` }} />
          <div className="absolute left-[70%] top-0 h-full border-l border-amber-700" />
          <div className="absolute left-[90%] top-0 h-full border-l border-orange-700" />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>Due date: {detail.sla.dueAt}</span>
          {overrun > 0 ? <span className="font-bold text-rose-700">Over target by {overrun}%</span> : null}
        </div>
      </div>
    </Card>
  );
}

function TaskCompletionChecklist({
  checklist,
  completedCount,
  completionPercent,
  requiredOpenCount,
  blockingCount,
  onToggle,
  onResolve,
}: {
  checklist: TaskDetailRecord["checklist"];
  completedCount: number;
  completionPercent: number;
  requiredOpenCount: number;
  blockingCount: number;
  onToggle: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  return (
    <Card title="Completion Checklist" icon={<ShieldCheck className="h-5 w-5" />} description="Actionable required items, owners, and blocking status">
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <MiniStat label="Completed" value={`${completedCount}/${checklist.length}`} />
        <MiniStat label="Completion" value={`${completionPercent}%`} />
        <MiniStat label="Required Open" value={`${requiredOpenCount}`} tone={requiredOpenCount > 0 ? "text-orange-700" : "text-emerald-700"} />
        <MiniStat label="Blocking" value={`${blockingCount}`} tone={blockingCount > 0 ? "text-rose-700" : "text-emerald-700"} />
      </div>
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={`Checklist completion ${completionPercent}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
        <div className="h-full rounded-full bg-blue-800" style={{ width: `${completionPercent}%` }} />
      </div>
      <div className="divide-y divide-slate-100">
        {checklist.map((item) => (
          <div key={item.id} className="grid gap-3 py-3 sm:grid-cols-[28px_1fr_auto] sm:items-center">
            <button
              className={`${focusRing} grid h-6 w-6 place-items-center rounded-lg border ${item.state === "completed" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"}`}
              onClick={() => onToggle(item.id)}
              type="button"
              aria-label={`Toggle ${item.title}`}
            >
              <Check className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className={`text-sm font-extrabold ${item.state === "completed" ? "text-slate-500 line-through" : "text-slate-950"}`}>{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.meta} · Owner: {item.owner}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {item.blocking ? <Badge className="bg-rose-100 text-rose-700">Blocking</Badge> : null}
              <Badge className={item.state === "completed" ? "bg-emerald-100 text-emerald-700" : item.state === "required" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600"}>{item.required ? "Required" : "Optional"} · {formatChecklistState(item.state)}</Badge>
              {item.blocking ? <button className={`${focusRing} rounded-lg px-2 py-1 text-xs font-bold text-blue-800 hover:bg-blue-50`} onClick={() => onResolve("operative")} type="button">Request Evidence</button> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TaskLifecycleTimeline({ activity }: { activity: TaskDetailRecord["activity"] }) {
  if (activity.length === 0) {
    return (
      <Card title="Task Lifecycle Timeline" icon={<History className="h-5 w-5" />} description="ติดตามลำดับขั้นตอนและสถานะล่าสุดของงาน">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-extrabold text-slate-700">No lifecycle activity available</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">ยังไม่มีประวัติการดำเนินงานสำหรับรายการนี้</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Task Lifecycle Timeline" icon={<History className="h-5 w-5" />} description="ติดตามลำดับขั้นตอนและสถานะล่าสุดของงาน">
      <div className="hidden min-w-0 xl:grid" style={{ gridTemplateColumns: `repeat(${activity.length}, minmax(0, 1fr))` }}>
        {activity.map((item, index) => (
          <div key={`${item.action}-${item.time}`} className="relative min-w-0 px-2 pb-2 text-center">
            {index < activity.length - 1 ? <div className={`absolute left-1/2 right-0 top-4 h-0.5 ${item.state === "future" ? "border-t border-dashed border-slate-300" : "bg-slate-300"}`} /> : null}
            <span className={`relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs font-extrabold ${timelineTone(item.state)}`} aria-label={`${formatTimelineState(item.state)} stage ${index + 1}`}>
              {timelineIcon(item.state, index + 1)}
            </span>
            <strong className="mt-3 block text-sm leading-5 text-slate-950">{item.action}</strong>
            <Badge className={`${timelineTone(item.state)} mt-2`}>{formatTimelineState(item.state)}</Badge>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.actor}</p>
            <time className="text-xs text-slate-400">{item.time}</time>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4 border-l border-slate-200 pl-5 xl:hidden">
        {activity.map((item) => (
          <div key={`${item.action}-${item.time}`} className="relative">
            <span className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${dotTone(item.state)}`} />
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-sm text-slate-950">{item.action}</strong>
              <Badge className={timelineTone(item.state)}>{formatTimelineState(item.state)}</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.actor} · {item.detail}</p>
            <time className="text-xs text-slate-400">{item.time}</time>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityAndComments({
  detail,
  comments,
  comment,
  onCommentChange,
  onAddComment,
}: {
  detail: TaskDetailRecord;
  comments: TaskDetailRecord["comments"];
  comment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
}) {
  return (
    <Card title="Activity and Comments" icon={<MessageSquare className="h-5 w-5" />} description="Collaboration history and source activity">
      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="text-sm font-extrabold text-slate-950">Comments</h3>
          <label htmlFor="task-comment" className="mt-3 block text-sm font-bold text-slate-700">Add Comment</label>
          <textarea id="task-comment" value={comment} onChange={(event) => onCommentChange(event.target.value)} rows={3} className={`${focusRing} mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm`} placeholder="Add clinical coding or claim review note..." />
          <button className={`${buttonPrimary()} ${focusRing} mt-3`} onClick={onAddComment} type="button">Add Comment</button>
          <div className="mt-4 space-y-3">
            {comments.map((item) => (
              <article key={`${item.author}-${item.time}-${item.text}`} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex justify-between gap-3"><strong className="text-sm text-slate-950">{item.author}</strong><time className="text-xs text-slate-400">{item.time}</time></div>
                <p className="text-xs text-slate-500">{item.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-extrabold text-slate-950">Activity History</h3>
          <div className="mt-3 space-y-3">
            {detail.activity.map((item) => (
              <article key={`${item.action}-${item.time}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm text-slate-950">{item.actor}</strong>
                  <Badge className={timelineTone(item.state)}>{formatTimelineState(item.state)}</Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-blue-900">{item.action}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <time className="text-xs text-slate-400">{item.time} · Source: Task Detail</time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Card>
  );
}

function TaskContextPanel({ detail }: { detail: TaskDetailRecord }) {
  return (
    <Card title="Related Case" icon={<LinkIcon className="h-5 w-5" />} description="Available context links only">
      <div className="space-y-3">
        <ContextLink label="Patient" value={`${detail.patient.name} · ${detail.patient.hn}`} href="#" />
        <ContextLink label="Visit" value={detail.visit.id} href={`/visits/${detail.visit.id}/timeline`} />
        <ContextLink label="Claim" value={detail.visit.claimId} href={`/claim-readiness/${detail.visit.id}`} />
        <ContextLink label="Evidence Package" value={detail.relatedItems.find((item) => item.label === "Evidence Package")?.value ?? "Not linked"} href={`/evidence-package/${detail.visit.id}`} />
        <ContextLink label="Claim Readiness" value={detail.relatedItems.find((item) => item.label === "Claim Readiness")?.value ?? "Not assessed"} href={`/claim-readiness/${detail.visit.id}`} />
        {detail.relatedItems.filter((item) => item.label === "Parent Task" || item.label === "Related Task").map((item) => <ContextLink key={item.label} label={item.label} value={item.value} href="#" />)}
      </div>
    </Card>
  );
}

function TaskRiskSummary({ detail, blockingCount, slaState }: { detail: TaskDetailRecord; blockingCount: number; slaState: SlaState }) {
  const likelihood = blockingCount > 0 || slaState === "Overdue" ? "High" : slaState === "At Risk" ? "Medium" : "Low";
  const impact = detail.task.priority === "Critical" || detail.task.priority === "High" ? detail.task.priority : "Medium";

  return (
    <Card title="Risk Summary" icon={<Flag className="h-5 w-5" />} description="Structured risk card from current task data">
      <div className="grid gap-3">
        <Info label="Risk Level" value={detail.readiness.risk} valueClass="text-rose-700" />
        <Info label="Risk Category" value={detail.task.workflow} />
        <Info label="Impact" value={impact} />
        <Info label="Likelihood" value={likelihood} />
      </div>
      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm leading-6 text-orange-900">
        <strong>Reason:</strong> {detail.readiness.blockers}
        <br />
        <strong>Required human review:</strong> Authorized coding reviewer must confirm ICD-10 and any applicable ICD-9-CM procedure context.
        <br />
        <strong>Recommended mitigation:</strong> Confirm diagnosis coding first, review procedure-code requirement only when applicable, and record the decision.
      </div>
    </Card>
  );
}

function TaskAiAssistancePanel({ detail, onRequestEvidence }: { detail: TaskDetailRecord; onRequestEvidence: () => void }) {
  return (
    <Card title="AI Assistance" icon={<Bot className="h-5 w-5" />} description="AI-generated recommendation. Human review is required.">
      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <p><strong className="text-slate-950">AI Task Summary:</strong> {detail.readiness.explanation}</p>
        <p><strong className="text-slate-950">Suggested Next Action:</strong> Confirm Diagnosis Code — ICD-10, then review Procedure Code — ICD-9-CM only if required.</p>
        <p><strong className="text-slate-950">Missing Evidence Recommendation:</strong> Attach the coding review note and procedure evidence when Payer Rules require it.</p>
        <p><strong className="text-slate-950">Risk Explanation:</strong> {detail.readiness.blockers}</p>
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500"><span>Confidence Score</span><span>92%</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-[92%] rounded-full bg-blue-800" /></div>
        </div>
        <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-blue-900">AI-generated recommendation. Human review is required before completing this task. AI must not confirm ICD-10 or ICD-9-CM codes automatically.</p>
        <p className="text-xs text-slate-500">Generated: Today, 09:20 · Source: NexSure rule engine</p>
        <button className={`${buttonSecondary()} ${focusRing}`} onClick={onRequestEvidence} type="button">Request Evidence</button>
      </div>
    </Card>
  );
}

function TaskAttachments({ detail }: { detail: TaskDetailRecord }) {
  return (
    <Card title="Attachments" icon={<Paperclip className="h-5 w-5" />} description="Supporting files linked to this task">
      <div className="space-y-3">
        {detail.attachments.length === 0 ? <p className="text-sm text-slate-500">ยังไม่มีไฟล์แนบสำหรับงานนี้</p> : null}
        {detail.attachments.map((item) => (
          <article key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex justify-between gap-3"><strong className="text-sm text-slate-950">{item.name}</strong><Badge className="bg-slate-100 text-slate-600">{item.type}</Badge></div>
            <p className="mt-1 text-xs text-slate-500">Uploaded by {item.uploadedBy} · {item.uploadedAt}</p>
            <button className={`${focusRing} mt-2 rounded-lg px-2 py-1 text-xs font-bold text-blue-800 hover:bg-blue-50`} type="button">{item.action}</button>
          </article>
        ))}
      </div>
    </Card>
  );
}

function TaskAuditTrail({ detail, status }: { detail: TaskDetailRecord; status: TaskStatus }) {
  const rows = status === "Completed" ? [{ timestamp: "Just now", actor: "Pharmacist Team", action: "task.complete", previousValue: detail.task.status, newValue: "Completed", source: "Task Detail", reason: "Human decision recorded" }, ...detail.audit] : detail.audit;
  return (
    <Card title="Audit Information" icon={<History className="h-5 w-5" />} description="Status, assignment, and value changes">
      <div className="space-y-3">
        {rows.map((item) => (
          <article key={`${item.timestamp}-${item.action}`} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex justify-between gap-3"><strong className="text-sm text-blue-900">{item.action}</strong><time className="text-xs text-slate-400">{item.timestamp}</time></div>
            <p className="mt-1 text-xs text-slate-500">{item.actor} · Source: {item.source}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">Previous: {item.previousValue} · New: {item.newValue}</p>
            <p className="mt-1 text-xs text-slate-500">Reason: {item.reason}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}

function SummaryCard({ label, value, helper, badgeClass, valueClass = "text-slate-950" }: { label: string; value: string; helper: string; badgeClass?: string; valueClass?: string }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[.08em] text-slate-500">{label}</p>
      <div className={`mt-2 text-sm font-extrabold ${valueClass}`}>{badgeClass ? <Badge className={badgeClass}>{value}</Badge> : value}</div>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

function Card({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,42,95,0.08)]">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800">{icon}</div>
        <div>
          <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DescriptionBlock({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" | "success" }) {
  const toneClass = tone === "warning" ? "border-orange-200 bg-orange-50 text-orange-900" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[.08em] opacity-70">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}

function AnalyticsPanel({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{summary}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ThresholdBar({ value, threshold, tone, ariaLabel }: { value: number; threshold: number; tone: "success" | "warning" | "danger"; ariaLabel: string }) {
  const color = tone === "danger" ? "bg-rose-600" : tone === "warning" ? "bg-orange-500" : "bg-emerald-600";
  return (
    <div className="relative pt-4">
      <div className="relative h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200" role="meter" aria-label={ariaLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="absolute top-1 h-6 border-l-2 border-slate-500" style={{ left: `${Math.min(threshold, 100)}%` }} aria-hidden="true" />
      <p className="mt-1 text-[11px] font-semibold text-slate-500">Threshold {threshold}%</p>
    </div>
  );
}

function ReadinessBar({ label, value, target, highlight = false }: { label: string; value: number; target: number; highlight?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="relative h-5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200" role="meter" aria-label={`${label} readiness score ${value} of 100 with target ${target}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className={`h-full rounded-full ${highlight ? "bg-blue-800" : value >= target ? "bg-emerald-600" : "bg-orange-500"}`} style={{ width: `${value}%` }} />
        <span className="absolute top-0 h-full border-l-2 border-slate-700" style={{ left: `${target}%` }} aria-hidden="true" />
      </div>
    </div>
  );
}

function SegmentedValidationBar({ items, total }: { items: TaskDetailRecord["analytics"]["validationResults"]; total: number }) {
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200" aria-label="Validation result status distribution">
        {items.map((item) => (
          <span key={item.label} className={validationTone(item.label)} style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }} title={`${item.label}: ${item.count}`} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item.label} className={validationBadgeTone(item.label)}>{item.label} {item.count}</Badge>
        ))}
      </div>
    </div>
  );
}

function InfoPanel({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" }) {
  const toneClass = tone === "warning" ? "border-orange-200 bg-orange-50 text-orange-900" : "border-slate-200 bg-white text-slate-700";
  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[.08em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}

function ContextLink({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className={`${focusRing} flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50`}>
      <span><span className="block text-xs font-bold uppercase tracking-[.08em] text-slate-500">{label}</span><strong className="mt-1 block text-sm text-slate-950">{value}</strong></span>
      <LinkIcon className="h-4 w-4 text-blue-800" />
    </Link>
  );
}

function MiniStat({ label, value, tone = "text-slate-950" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-[.08em] text-slate-500">{label}</p><p className={`mt-1 text-lg font-extrabold ${tone}`}>{value}</p></div>;
}

function Info({ label, value, valueClass = "text-slate-800" }: { label: string; value: string; valueClass?: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[.08em] text-slate-400">{label}</p><p className={`mt-1 text-sm font-extrabold ${valueClass}`}>{value}</p></div>;
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-flex min-h-6 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${className}`}>{children}</span>;
}

function getSlaState(progress: number): SlaState {
  if (progress >= 100) return "Overdue";
  if (progress >= 90) return "At Risk";
  if (progress >= 70) return "Due Soon";
  return "On Track";
}

function getPrimaryAction(status: TaskStatus, blockingCount: number) {
  if (status === "Open") return "Start Task";
  if (status === "Completed") return "Reopen Task";
  if (blockingCount > 0) return "Continue Review";
  return "Mark as Complete";
}

function formatChecklistState(state: TaskDetailRecord["checklist"][number]["state"]) {
  if (state === "completed") return "Completed";
  if (state === "required") return "Required";
  return "Pending Review";
}

function formatTimelineState(state: TaskDetailRecord["activity"][number]["state"]) {
  if (state === "completed") return "Completed";
  if (state === "current") return "In Progress";
  if (state === "delayed") return "Overdue";
  return "Pending Review";
}

function timelineIcon(state: TaskDetailRecord["activity"][number]["state"], fallback: number) {
  if (state === "completed") return <Check className="h-4 w-4" />;
  if (state === "current") return <Clock className="h-4 w-4" />;
  if (state === "delayed") return <AlertTriangle className="h-4 w-4" />;
  return fallback;
}

function slaTone(state: SlaState) {
  if (state === "Overdue") return "bg-rose-100 text-rose-700";
  if (state === "At Risk") return "bg-orange-100 text-orange-800";
  if (state === "Due Soon") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-700";
}

function procedureStatusTone(status: NonNullable<TaskDetailRecord["procedureCoding"]>["codingStatus"]) {
  if (status === "Confirmed") return "bg-emerald-100 text-emerald-700";
  if (status === "Missing" || status === "Inconsistent") return "bg-rose-100 text-rose-700";
  if (status === "Suggested" || status === "Needs Review") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function consistencyTone(state: NonNullable<TaskDetailRecord["procedureCoding"]>["consistency"]) {
  if (state === "Consistent") return "bg-emerald-100 text-emerald-700";
  if (state === "Inconsistent") return "bg-rose-100 text-rose-700";
  if (state === "Needs Review") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function validationTone(label: TaskDetailRecord["analytics"]["validationResults"][number]["label"]) {
  if (label === "Passed") return "bg-emerald-600";
  if (label === "Warning") return "bg-orange-500";
  if (label === "Failed") return "bg-rose-600";
  return "bg-slate-400";
}

function validationBadgeTone(label: TaskDetailRecord["analytics"]["validationResults"][number]["label"]) {
  if (label === "Passed") return "bg-emerald-100 text-emerald-700";
  if (label === "Warning") return "bg-orange-100 text-orange-800";
  if (label === "Failed") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function riskTone(level: TaskDetailRecord["analytics"]["risks"][number]["level"]) {
  if (level === "Critical") return "border-rose-300 bg-rose-50 text-rose-800";
  if (level === "High") return "border-orange-300 bg-orange-50 text-orange-900";
  if (level === "Medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function timelineTone(state: TaskDetailRecord["activity"][number]["state"]) {
  if (state === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (state === "current") return "border-blue-200 bg-blue-50 text-blue-800";
  if (state === "delayed") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function dotTone(state: TaskDetailRecord["activity"][number]["state"]) {
  if (state === "completed") return "bg-emerald-600";
  if (state === "current") return "bg-blue-700";
  if (state === "delayed") return "bg-rose-600";
  return "bg-slate-300";
}

function buttonPrimary() {
  return "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 text-sm font-extrabold text-white shadow-[0_7px_18px_rgba(30,58,138,0.18)] hover:bg-[#0F2A5F]";
}

function buttonSecondary() {
  return "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900";
}
