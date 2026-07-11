export type BadgeTone = "ai" | "ready" | "review" | "risk";

export interface NavSection {
  title: string;
  items: string[];
}

export interface Kpi {
  label: string;
  value: string;
  note: string;
}

export interface CaseRow {
  visit: string;
  patient: string;
  clinical: string;
  claim: string;
  claimTone: BadgeTone;
  risk: string;
  riskTone: BadgeTone;
}

export interface ChecklistItem {
  label: string;
  value: string;
}

export interface TimelineItem {
  time: string;
  description: string;
}

export interface SoapSection {
  title: string;
  fields: Array<{
    label: string;
    value: string;
    multiline?: boolean;
  }>;
  alert?: {
    tone: "ai" | "risk";
    text: string;
  };
}
