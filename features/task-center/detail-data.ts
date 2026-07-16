import { initialTasks } from "./task-center-data";
import type { TaskItem } from "./types";

export type ProcedureCodingStatus =
  | "Not Required"
  | "Missing"
  | "Suggested"
  | "Needs Review"
  | "Confirmed"
  | "Inconsistent"
  | "Not Available";

export type CodingConsistencyState =
  | "Consistent"
  | "Needs Review"
  | "Inconsistent"
  | "Insufficient Evidence";

export type ProcedureCodingContext = {
  procedureName: string;
  procedureDate: string;
  existingCode?: string;
  codeDescription?: string;
  codingStatus: ProcedureCodingStatus;
  supportingEvidence: string;
  diagnosisLinkage: string;
  payerRequirement: "Required" | "Not Required" | "Conditional";
  claimReadinessImpact: "Complete" | "Missing" | "Needs Review" | "Not Required";
  reviewerNote: string;
  reviewedBy?: string;
  reviewedAt?: string;
  consistency: CodingConsistencyState;
  consistencyReason: string;
  aiSuggestion?: {
    code: string;
    description: string;
    confidence: number;
    supportingEvidence: string;
    source: string;
    alternativeCodes: { code: string; description: string }[];
  };
};

export type TaskDetailRecord = {
  task: TaskItem;
  patient: {
    initials: string;
    name: string;
    hn: string;
    demographics: string;
    consent: string;
  };
  visit: {
    id: string;
    payer: string;
    clinic: string;
    clinician: string;
    claimId: string;
    serviceDate: string;
  };
  readiness: {
    score: string;
    previousScore: string;
    expectedScore: string;
    targetScore: string;
    scoreChange: string;
    status: string;
    risk: string;
    explanation: string;
    lastAssessment: string;
    blockers: string;
    procedureCodingImpact?: "Complete" | "Missing" | "Needs Review" | "Not Required";
    components: {
      label: string;
      score: number;
      status: "Passed" | "Warning" | "Failed" | "Pending";
    }[];
  };
  diagnosisReview: {
    codeSystem: "ICD-10";
    diagnosisCode?: string;
    diagnosisDescription: string;
    codingStatus: "Missing" | "Needs Review" | "Confirmed" | "Inconsistent";
    supportingEvidence: string;
    reviewerNote: string;
  };
  procedureCoding?: ProcedureCodingContext;
  sla: {
    remaining: string;
    dueAt: string;
    progress: number;
    target: string;
    consumed: string;
    elapsedHours: number;
    targetHours: number;
    warningThreshold: number;
  };
  analytics: {
    missingEvidenceCount: number;
    blockingItemCount: number;
    warningItemCount: number;
    validationResults: {
      label: "Passed" | "Warning" | "Failed" | "Pending";
      count: number;
    }[];
    risks: {
      type: "Clinical" | "Claim" | "Compliance" | "Financial";
      likelihood: number;
      impact: number;
      level: "Low" | "Medium" | "High" | "Critical";
    }[];
  };
  checklist: {
    id: string;
    title: string;
    meta: string;
    state: "completed" | "required" | "waiting";
    required: boolean;
    owner: string;
    blocking: boolean;
  }[];
  evidence: {
    id: string;
    name: string;
    note: string;
    severity: "Critical" | "High" | "Medium";
    status: "Available" | "Missing" | "Draft" | "Not required";
    owner: string;
    updated: string;
    blocking: boolean;
  }[];
  comments: { author: string; role: string; text: string; time: string }[];
  activity: { action: string; actor: string; detail: string; time: string; state: "completed" | "current" | "delayed" | "future"; duration: string }[];
  relatedItems: { label: string; value: string; tone: "blue" | "amber" | "rose" | "slate" }[];
  attachments: { name: string; type: string; uploadedBy: string; uploadedAt: string; action: "Preview" | "Download" }[];
  audit: { timestamp: string; actor: string; action: string; previousValue: string; newValue: string; source: string; reason: string }[];
};

export function getTaskDetail(taskId: string): TaskDetailRecord | undefined {
  const task = initialTasks.find((item) => item.id === taskId);
  if (!task) return undefined;
  const detailTask: TaskItem =
    task.id === "TASK-1041"
      ? {
          ...task,
          title: "Review Missing ICD-10 Code",
          workflow: "Claim Readiness",
          description: "Primary Diagnosis requires ICD-10 Code confirmation before Claim Readiness can proceed.",
        }
      : task;
  const hasProcedureContext = detailTask.id === "TASK-1041";
  const procedureRequired = hasProcedureContext;

  return {
    task: detailTask,
    patient: {
      initials: detailTask.id === "TASK-1041" ? "NW" : "SS",
      name: detailTask.subtitle.split(" · ")[0],
      hn: detailTask.id === "TASK-1044" ? "User U-0188" : "HN-2026-004218",
      demographics: detailTask.id === "TASK-1041" ? "Female, 39" : "Male, 54",
      consent: "PDPA consent active",
    },
    visit: {
      id: detailTask.subtitle.includes("VIS-") ? detailTask.subtitle.split(" · ")[1] : "Governance Review",
      payer: detailTask.workflow === "Compliance" ? "Internal Governance" : "AIA Thailand",
      clinic: "Clinic A",
      clinician: detailTask.assignee === "Unassigned" ? "Pending assignment" : detailTask.assignee,
      claimId: detailTask.workflow === "Compliance" ? "N/A" : "CLM-260715-884",
      serviceDate: "10 Jul 2026, 13:10",
    },
    readiness: {
      score: detailTask.status === "Completed" ? "92" : detailTask.priority === "Critical" ? "72" : "81",
      previousScore: detailTask.id === "TASK-1041" ? "68" : detailTask.priority === "Critical" ? "70" : "78",
      expectedScore: detailTask.priority === "Critical" ? "84" : "88",
      targetScore: "85",
      scoreChange: detailTask.id === "TASK-1041" ? "+4" : "+3",
      status: detailTask.status === "Completed" ? "Ready" : "Needs Review",
      risk: detailTask.priority === "Critical" ? "High" : detailTask.priority,
      explanation: detailTask.id === "TASK-1041" ? "ICD-10 diagnosis coding is the primary review. Procedure coding context is secondary and shown because this visit includes a procedure-related claim requirement." : detailTask.description,
      lastAssessment: "Today, 09:20",
      blockers: detailTask.id === "TASK-1041" ? "Primary Diagnosis is missing an ICD-10 Code. ICD-9-CM procedure context also needs review because Payer Rule validation requires procedure coding for this visit." : detailTask.workflow === "Missing Evidence" ? "1 blocking evidence item" : "No active blocking evidence",
      procedureCodingImpact: hasProcedureContext ? "Missing" : "Not Required",
      components: [
        { label: "SOAP", score: detailTask.id === "TASK-1041" ? 82 : 88, status: "Warning" },
        { label: "Diagnosis and ICD", score: detailTask.id === "TASK-1041" ? 40 : 78, status: detailTask.id === "TASK-1041" ? "Failed" : "Warning" },
        { label: "Prescription / Procedure", score: detailTask.id === "TASK-1041" ? 55 : 84, status: detailTask.id === "TASK-1041" ? "Warning" : "Passed" },
        { label: "Evidence", score: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? 70 : 86, status: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? "Warning" : "Passed" },
        { label: "Insurance Rule", score: 90, status: "Passed" },
        { label: "Economic", score: 75, status: "Warning" },
      ],
    },
    diagnosisReview: {
      codeSystem: "ICD-10",
      diagnosisCode: detailTask.id === "TASK-1041" ? undefined : "J06.9",
      diagnosisDescription: detailTask.id === "TASK-1041" ? "Primary Diagnosis requires ICD-10 Code confirmation" : "Acute upper respiratory infection, unspecified",
      codingStatus: detailTask.id === "TASK-1041" ? "Missing" : "Confirmed",
      supportingEvidence: "SOAP Note assessment and claim diagnosis text",
      reviewerNote: detailTask.id === "TASK-1041" ? "Confirm the ICD-10 Code before completing this task." : "Diagnosis code already confirmed.",
    },
    procedureCoding: hasProcedureContext
      ? {
          procedureName: "Nebulized bronchodilator administration",
          procedureDate: "10 Jul 2026, 13:40",
          existingCode: undefined,
          codeDescription: undefined,
          codingStatus: "Missing",
          supportingEvidence: "Medication administration note and nursing procedure record",
          diagnosisLinkage: "Procedure is linked to respiratory symptom management; ICD-10 Code must be confirmed first.",
          payerRequirement: procedureRequired ? "Required" : "Not Required",
          claimReadinessImpact: procedureRequired ? "Missing" : "Not Required",
          reviewerNote: "Review whether the documented service requires ICD-9-CM procedure coding for Supporting Evidence.",
          reviewedBy: undefined,
          reviewedAt: undefined,
          consistency: "Needs Review",
          consistencyReason: "ICD-10 Code is not yet confirmed, so diagnosis-procedure consistency cannot be finalized.",
          aiSuggestion: {
            code: "93.94",
            description: "Respiratory medication administered by nebulizer",
            confidence: 78,
            supportingEvidence: "Nursing procedure record documents nebulized medication administration.",
            source: "NexSure coding support rule",
            alternativeCodes: [
              { code: "93.90", description: "Non-invasive mechanical ventilation, unspecified" },
              { code: "99.29", description: "Injection or infusion of other therapeutic substance" },
            ],
          },
        }
      : undefined,
    sla: {
      remaining: detailTask.dueTone === "rose" ? (detailTask.status === "Overdue" ? "Overdue by 1 day" : "2h 14m remaining") : detailTask.dueTone === "amber" ? "4h 30m remaining" : "On schedule",
      dueAt: detailTask.due,
      progress: detailTask.status === "Overdue" ? 128 : detailTask.dueTone === "rose" ? 92 : detailTask.dueTone === "amber" ? 76 : detailTask.status === "Completed" ? 100 : 42,
      target: "4h review SLA",
      consumed: detailTask.status === "Overdue" ? "5h 07m consumed" : detailTask.dueTone === "rose" ? "3h 41m consumed" : detailTask.dueTone === "amber" ? "3h 02m consumed" : "1h 41m consumed",
      elapsedHours: detailTask.status === "Overdue" ? 5.1 : detailTask.dueTone === "rose" ? 3.7 : detailTask.dueTone === "amber" ? 3 : 1.7,
      targetHours: 4,
      warningThreshold: 80,
    },
    analytics: {
      missingEvidenceCount: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? 1 : 0,
      blockingItemCount: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? 1 : 0,
      warningItemCount: detailTask.id === "TASK-1041" ? 3 : 2,
      validationResults: detailTask.id === "TASK-1041"
        ? [
            { label: "Passed", count: 8 },
            { label: "Warning", count: 2 },
            { label: "Failed", count: 1 },
            { label: "Pending", count: 3 },
          ]
        : [
            { label: "Passed", count: 9 },
            { label: "Warning", count: 2 },
            { label: "Failed", count: detailTask.workflow === "Missing Evidence" ? 1 : 0 },
            { label: "Pending", count: 1 },
          ],
      risks: [
        { type: "Clinical", likelihood: detailTask.id === "TASK-1041" ? 2 : 1, impact: 2, level: detailTask.id === "TASK-1041" ? "Medium" : "Low" },
        { type: "Claim", likelihood: detailTask.id === "TASK-1041" ? 3 : 2, impact: 3, level: "High" },
        { type: "Compliance", likelihood: 2, impact: 2, level: "Medium" },
        { type: "Financial", likelihood: 2, impact: detailTask.priority === "Critical" ? 3 : 2, level: detailTask.priority === "Critical" ? "High" : "Medium" },
      ],
    },
    checklist: [
      { id: "review-soap", title: "Review SOAP Note and diagnosis context", meta: "Completed by Claim Readiness Agent", state: "completed", required: true, owner: "Claim Readiness Agent", blocking: false },
      { id: "add-icd", title: detailTask.id === "TASK-1041" ? "Confirm ICD-10 Code" : detailTask.workflow === "Missing Evidence" ? "Add missing ICD-10 Code or evidence reference" : "Confirm coding and task rationale", meta: "Primary Diagnosis coding review", state: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? "required" : "completed", required: true, owner: detailTask.assignee, blocking: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" },
      { id: "payer-rule", title: "Review Payer Rule alignment", meta: "Confirm claim impact before closure", state: "waiting", required: true, owner: "Claim Readiness Agent", blocking: false },
      { id: "cost", title: "Confirm Cost Justification", meta: "Required when medication review changes claim evidence", state: "waiting", required: true, owner: task.assignee, blocking: false },
      ...(procedureRequired
        ? [
            { id: "procedure-doc", title: "Review Documented Procedure", meta: "Procedure coding context", state: "waiting" as const, required: true, owner: "Clinical Coding Reviewer", blocking: false },
            { id: "procedure-icd9", title: "Verify Procedure Code — ICD-9-CM", meta: "Required by Payer Rule for this visit", state: "required" as const, required: true, owner: "Clinical Coding Reviewer", blocking: true },
            { id: "dx-procedure-consistency", title: "Confirm diagnosis-procedure consistency", meta: "Requires ICD-10 Code confirmation first", state: "waiting" as const, required: true, owner: "Clinical Coding Reviewer", blocking: false },
            { id: "procedure-payer", title: "Validate Payer Rule procedure-code requirement", meta: "Claim Readiness procedure rule", state: "waiting" as const, required: true, owner: "Claim Readiness Agent", blocking: false },
          ]
        : []),
      { id: "recalculate", title: "Recalculate Claim Readiness Score", meta: "Available after evidence resolution", state: task.status === "Completed" ? "completed" : "waiting", required: true, owner: "NexSure Engine", blocking: false },
      { id: "resolution", title: "Record Human Review Decision", meta: "Recorded in Audit Log", state: "waiting", required: true, owner: task.assignee, blocking: false },
      { id: "notify-team", title: "Notify Evidence Owner if Delay Continues", meta: "Optional handoff for team visibility", state: "waiting", required: false, owner: "Care Team", blocking: false },
    ],
    evidence: [
      { id: "soap", name: "SOAP Note", note: "Assessment and plan are available for Human Review.", severity: "Medium", status: "Available", owner: "Dr. Narin", updated: "Today, 09:12", blocking: false },
      { id: "operative", name: detailTask.id === "TASK-1041" ? "Missing ICD-10 Code" : detailTask.workflow === "Missing Evidence" ? "Missing ICD-10 / operative evidence" : "Supporting Evidence", note: detailTask.id === "TASK-1041" ? "ICD-10 Code must be confirmed before Claim Readiness can proceed." : "Required before claim package can be finalized.", severity: "Critical", status: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? "Missing" : "Not required", owner: detailTask.assignee, updated: "Today, 09:18", blocking: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" },
      { id: "claim", name: "Claim Summary", note: "Draft package awaits final evidence and score refresh.", severity: "High", status: "Draft", owner: "Claim Readiness Agent", updated: "Today, 09:20", blocking: false },
      { id: "audit", name: "Audit Summary", note: "Human Review requirement is captured.", severity: "Medium", status: "Available", owner: "Compliance Guard", updated: "Today, 09:22", blocking: false },
    ],
    comments: [
      { author: "Clinical Coding Reviewer", role: "Claim Coding", text: "Please confirm the ICD-10 Code first. Procedure coding is secondary and should be reviewed only because this visit has a Payer Rule procedure-code requirement.", time: "Today, 09:31" },
      { author: "NexSure Engine", role: "System", text: "Task remains open because required evidence is incomplete.", time: "Today, 09:20" },
    ],
    activity: [
      { action: "Task Created", actor: "Claim Readiness Agent", detail: "Evidence gap detected from latest package scan", time: "Today, 09:12", state: "completed", duration: "Start" },
      { action: "Assigned", actor: "System", detail: detailTask.assignee, time: "Today, 09:18", state: "completed", duration: "6m" },
      { action: "Work Started", actor: detailTask.assignee, detail: "Reviewer opened the task context", time: "Today, 09:24", state: detailTask.status === "Open" ? "future" : "completed", duration: "6m" },
      { action: "Evidence Requested", actor: "NexSure Engine", detail: detailTask.id === "TASK-1041" ? "ICD-10 Code confirmation requested" : "Blocking evidence requires human follow-up", time: "Today, 09:31", state: detailTask.workflow === "Missing Evidence" || detailTask.id === "TASK-1041" ? "current" : "completed", duration: "7m" },
      { action: "Evidence Received", actor: detailTask.assignee, detail: "Awaiting reviewer update", time: "Pending", state: "future", duration: "Pending" },
      { action: "Reviewed", actor: detailTask.assignee, detail: "Pending completion requirements", time: "Pending", state: detailTask.status === "Completed" ? "completed" : detailTask.status === "Overdue" ? "delayed" : "future", duration: "Pending" },
      { action: "Completed", actor: detailTask.assignee, detail: "Resolution summary and audit record", time: detailTask.status === "Completed" ? "Completed" : "Future", state: detailTask.status === "Completed" ? "completed" : "future", duration: "Future" },
    ],
    relatedItems: [
      { label: "Visit", value: detailTask.subtitle.includes("VIS-") ? detailTask.subtitle.split(" · ")[1] : "Governance Review", tone: "blue" },
      { label: "Evidence Package", value: detailTask.workflow === "Missing Evidence" ? "Blocked" : "In Review", tone: detailTask.workflow === "Missing Evidence" ? "rose" : "amber" },
      { label: "Claim Readiness", value: `${detailTask.status === "Completed" ? "92" : "72"} · ${detailTask.status === "Completed" ? "Ready" : "Needs Review"}`, tone: "amber" },
      { label: "Parent Task", value: "Claim Coding Queue", tone: "blue" },
      { label: "Related Task", value: detailTask.id === "TASK-1041" ? "PROC-ICD9-260715-104" : "None linked", tone: "slate" },
      { label: "Audit Trail", value: "2 events", tone: "slate" },
    ],
    attachments: [
      { name: "diagnosis-coding-gap.pdf", type: "PDF", uploadedBy: "NexSure Engine", uploadedAt: "Today, 09:20", action: "Preview" },
      { name: "procedure-context.json", type: "System Evidence", uploadedBy: "Claim Readiness", uploadedAt: "Today, 09:21", action: "Download" },
    ],
    audit: [
      { timestamp: "10 Jul 2026, 09:12:08", actor: "Claim Readiness Agent", action: "task.create", previousValue: "—", newValue: detailTask.id, source: "Task Center", reason: "Rule-triggered review" },
      { timestamp: "10 Jul 2026, 09:18:44", actor: "System", action: "task.assign", previousValue: "Unassigned", newValue: detailTask.assignee, source: "Assignment Rule", reason: "Role-based queue routing" },
      { timestamp: "10 Jul 2026, 09:20:11", actor: "NexSure Engine", action: "claim.readiness.evaluate", previousValue: "Score pending", newValue: `${detailTask.priority === "Critical" ? "72" : "81"} · Needs Review`, source: "Claim Readiness", reason: "Diagnosis and procedure coding review required" },
    ],
  };
}
