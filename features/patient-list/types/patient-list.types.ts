import type { LucideIcon } from "lucide-react";

export type PatientVisitStatus = "STABLE" | "NEEDS REVIEW" | "IN-PATIENT";

export type ClaimTone = "ready" | "warning" | "inpatient";

export type PatientListKpi = {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  tone: "primary" | "secondary" | "success" | "warning" | "danger" | "muted";
};

export type PatientListRecord = {
  id: string;
  name: string;
  demographics: string;
  maskedIdentity: string;
  hn: string;
  visitDate: string;
  visitCode: string;
  visitType: string;
  status: PatientVisitStatus;
  claimScore: number;
  claimLabel: string;
  claimTone: ClaimTone;
  insuranceName: string;
  insuranceDetail: string;
  initials: string;
  avatarTone: string;
};

export type CareTeamMember = {
  name: string;
  role: string;
  initials: string;
};
