import type { ComponentType } from "react";

export type VisitStatus = "Waiting" | "In Consultation" | "Pharmacy" | "Completed";
export type ClaimReadinessStatus = "Ready" | "Needs Review" | "Not Ready" | "Calculating";
export type RiskLevel = "Critical" | "High Clinical Risk" | "Medication Risk" | "Economic Alert" | "Low";
export type VisitTab = "all" | "today" | "mine" | "high-risk";
export type SortKey = "patient" | "status" | "readiness" | "risk" | "cost";
export type SortDirection = "asc" | "desc";
export type UserRole = "Doctor" | "Nurse" | "Claim Reviewer";

export interface VisitKpi {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  tone: "primary" | "neutral" | "success" | "info" | "danger";
  icon: ComponentType<{ className?: string }>;
}

export interface QueueSnapshot {
  label: string;
  value: string;
  averageWait: string;
  progress: number;
  tone: "blue" | "warning" | "success";
  alert?: string;
  icon: ComponentType<{ className?: string }>;
}

export interface VisitRecord {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  initials: string;
  hnMasked: string;
  demographics: string;
  visitDate: string;
  department: string;
  clinician: string;
  status: VisitStatus;
  completedSteps: number;
  totalSteps: number;
  aiState: "Reviewed" | "Suggested" | "Processing" | "None";
  aiSummary: string;
  claimScore: number | null;
  claimStatus: ClaimReadinessStatus;
  evidenceSummary: string;
  risk: RiskLevel;
  clinicalAlertPriority: number;
  economicAmount: number | null;
  economicSignal: "Within range" | "Outlier" | "Pending";
  assignedToMe: boolean;
  isToday: boolean;
  allowedActions: UserRole[];
}
