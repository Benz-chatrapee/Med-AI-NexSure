import type { DueTone, TaskPriority, TaskStatus, TaskWorkflow } from "../types";

export const focusRing = "focus:outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-500/20";

export function priorityClasses(priority: TaskPriority) {
  return ({ Critical: "bg-[#FEE2E2] text-[#DC2626]", High: "bg-[#FEF3C7] text-[#D97706]", Medium: "bg-[#EFF6FF] text-[#2563EB]", Low: "bg-[#F8FAFC] text-[#64748B]" } satisfies Record<TaskPriority, string>)[priority];
}

export function workflowClasses(workflow: TaskWorkflow) {
  return ({ "Missing Evidence": "bg-[#EFF6FF] text-[#2563EB]", "Prescription Safety": "bg-[#FEE2E2] text-[#DC2626]", "Claim Readiness": "bg-[#FEF3C7] text-[#D97706]", Compliance: "bg-[#F8FAFC] text-[#0F2A5F]", "Clinical Review": "bg-[#ECFDF5] text-[#059669]" } satisfies Record<TaskWorkflow, string>)[workflow];
}

export function statusClasses(status: TaskStatus) {
  return ({ Open: "bg-[#F8FAFC] text-[#64748B]", "In Progress": "bg-[#EFF6FF] text-[#2563EB]", "In Review": "bg-[#FEF3C7] text-[#D97706]", Overdue: "bg-[#FEE2E2] text-[#DC2626]", Completed: "bg-[#ECFDF5] text-[#059669]" } satisfies Record<TaskStatus, string>)[status];
}

export function dueClasses(tone: DueTone) {
  return ({ rose: "text-[#DC2626]", amber: "text-[#D97706]", emerald: "text-[#059669]", slate: "text-[#64748B]" } satisfies Record<DueTone, string>)[tone];
}
