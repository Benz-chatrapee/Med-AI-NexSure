import type { ComponentType } from "react";

export type PatientAccessState = "allowed" | "forbidden";
export type AlertSeverity = "critical" | "high" | "warning" | "info" | "success";
export type ReadinessStatus = "Ready" | "Needs Review" | "Not Ready";
export type ReviewStatus = "AI Suggested" | "Pending Review" | "Human Confirmed";

export type IconComponent = ComponentType<{ className?: string }>;

export interface PatientIdentity {
  id: string;
  patientNo: string;
  hn: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  bloodType: string;
  dob: string;
  status: string;
  attention: string;
  insuranceStatus: string;
  maskedPhone: string;
  maskedEmail: string;
}

export interface SafetyAlert {
  severity: AlertSeverity;
  title: string;
  explanation: string;
  verifiedBy: string;
  actionLabel: string;
}

export interface PatientKpi {
  label: string;
  value: string;
  helper?: string;
  tone: "default" | "danger" | "primary" | "success";
}

export interface VisitRecord {
  id: string;
  visitNo: string;
  date: string;
  clinic: string;
  provider: string;
  status: string;
  reason: string;
  readiness: number;
  href: string;
}

export interface TableRow {
  cells: string[];
  tone?: AlertSeverity;
}

export interface NamedStatus {
  label: string;
  value: string;
  status?: string;
  tone?: AlertSeverity;
}

export interface PatientDetailData {
  access: PatientAccessState;
  identity: PatientIdentity;
  safetyAlert: SafetyAlert;
  kpis: PatientKpi[];
  snapshot: {
    coverage: NamedStatus;
    pdpa: NamedStatus;
    clinicalRisk: number;
    claimRisk: number;
    note: string;
  };
  clinicalSummary: string;
  aiSummary: {
    confidence: string;
    generatedAt: string;
    reviewStatus: ReviewStatus;
    summary: string;
    evidence: string[];
    limitation: string;
  };
  vitals: NamedStatus[];
  allergies: TableRow[];
  medications: TableRow[];
  diagnoses: TableRow[];
  visits: VisitRecord[];
  insurance: NamedStatus[];
  claimReadiness: {
    score: number;
    status: ReadinessStatus;
    explanation: string;
    dimensions: NamedStatus[];
  };
  missingEvidence: NamedStatus[];
  documents: NamedStatus[];
  consent: NamedStatus[];
  timeline: NamedStatus[];
  auditTrail: NamedStatus[];
}
