import { initialTasks } from "./task-center-data";
import type { TaskItem } from "./types";

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
  };
  readiness: {
    score: string;
    status: string;
    risk: string;
    explanation: string;
    lastAssessment: string;
  };
  evidence: { name: string; status: string; owner: string }[];
  relatedItems: { label: string; value: string; tone: "blue" | "amber" | "rose" | "slate" }[];
  audit: { label: string; value: string }[];
};

export function getTaskDetail(taskId: string): TaskDetailRecord | undefined {
  const task = initialTasks.find((item) => item.id === taskId);
  if (!task) return undefined;

  return {
    task,
    patient: {
      initials: task.id === "TASK-1041" ? "NW" : "SS",
      name: task.subtitle.split(" · ")[0],
      hn: task.id === "TASK-1044" ? "User U-0188" : "HN-2026-004218",
      demographics: task.id === "TASK-1041" ? "Female, 39" : "Male, 54",
      consent: "PDPA consent active",
    },
    visit: {
      id: task.subtitle.includes("VIS-") ? task.subtitle.split(" · ")[1] : "Governance Review",
      payer: task.workflow === "Compliance" ? "Internal Governance" : "AIA Thailand",
      clinic: "Clinic A",
      clinician: task.assignee === "Unassigned" ? "Pending assignment" : task.assignee,
    },
    readiness: {
      score: task.status === "Completed" ? "92" : task.priority === "Critical" ? "72" : "81",
      status: task.status === "Completed" ? "Ready" : "Needs Review",
      risk: task.priority === "Critical" ? "High" : task.priority,
      explanation: task.description,
      lastAssessment: "Today, 09:20",
    },
    evidence: [
      { name: "SOAP note", status: "Available", owner: "Dr. Narin" },
      { name: "Operative note", status: task.workflow === "Missing Evidence" ? "Missing" : "Not required", owner: task.assignee },
      { name: "Claim summary", status: "Draft", owner: "Claim Readiness Agent" },
      { name: "Audit summary", status: "Available", owner: "Compliance Guard" },
    ],
    relatedItems: [
      { label: "Visit", value: task.subtitle.includes("VIS-") ? task.subtitle.split(" · ")[1] : "Governance Review", tone: "blue" },
      { label: "Evidence Package", value: task.workflow === "Missing Evidence" ? "Blocked" : "In Review", tone: task.workflow === "Missing Evidence" ? "rose" : "amber" },
      { label: "Claim Readiness", value: `${task.status === "Completed" ? "92" : "72"} · ${task.status === "Completed" ? "Ready" : "Needs Review"}`, tone: "amber" },
      { label: "Audit Trail", value: "2 events", tone: "slate" },
    ],
    audit: [
      { label: "Created by", value: "Claim Readiness Agent" },
      { label: "Created at", value: "Today, 09:12" },
      { label: "Assigned at", value: "Today, 09:18" },
      { label: "Source", value: "Med AI NexSure Web" },
      { label: "Review mode", value: "Human-in-the-loop required" },
    ],
  };
}
