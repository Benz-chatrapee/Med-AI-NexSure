export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type TaskWorkflow =
  | "Claim Readiness"
  | "Missing Evidence"
  | "Prescription Safety"
  | "Compliance"
  | "Clinical Review";
export type TaskStatus = "Open" | "In Progress" | "In Review" | "Overdue" | "Completed";
export type TaskTab = "mine" | "unassigned" | "overdue" | "completed";
export type ActiveTab = "all" | TaskTab;
export type DueTone = "rose" | "amber" | "emerald" | "slate";

export type TaskItem = {
  id: string;
  title: string;
  subtitle: string;
  workflow: TaskWorkflow;
  priority: TaskPriority;
  assignee: string;
  assigneeInitials: string;
  due: string;
  dueTone: DueTone;
  status: TaskStatus;
  tab: TaskTab;
  description: string;
};
