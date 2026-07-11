export type NavItem = {
  icon: string;
  label: string;
  description: string;
  active?: boolean;
};

export type ContextItem = {
  label: string;
  value: string;
};

export type KpiItem = {
  icon: string;
  label: string;
  value: string;
  note: string;
};

export type PillTone = "ai" | "success" | "warn" | "danger" | "gray" | "purple";

export type Pill = {
  label: string;
  tone: PillTone;
};

export type CaseRow = {
  visitId: string;
  patient: string;
  aiStatus: Pill;
  confidence: string;
  claimImpact: Pill;
  action: {
    label: string;
    variant: "primary" | "secondary";
  };
};

export type SoapSection = {
  title: string;
  body: string;
};

export type RecommendationCard = {
  title: string;
  body: string;
  confidence?: number;
};

export type IcdSuggestion = {
  code: string;
  description: string;
  support: string;
  status: Pill;
};

export type DifferentialDiagnosis = {
  label: string;
  note: string;
  score: string;
};

export type ChecklistItem = {
  label: string;
  status: Pill;
};

export type TimelineItem = {
  title: string;
  detail: string;
  status: Pill;
};

export type TraceItem = {
  title: string;
  body: string;
};

export type SystemCard = {
  title: string;
  description: string;
  body: string;
};

export type ImpactCard = {
  title: string;
  body: string;
};
