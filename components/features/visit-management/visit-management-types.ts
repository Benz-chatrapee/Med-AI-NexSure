export type BadgeTone = "ai" | "ready" | "review" | "risk";

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  active?: boolean;
}

export interface Badge {
  label: string;
  tone: BadgeTone;
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
  claim: Badge;
  risk: Badge;
}

export interface ChecklistItem {
  label: string;
  value: string;
}

export interface Alert {
  title?: string;
  body: string;
  tone: "ai" | "risk" | "econ";
}

export interface TimelineItem {
  time: string;
  event: string;
}

export interface PatientInfo {
  label: string;
  value: string;
}

export interface SoapSection {
  title: string;
  fields: SoapField[];
  alert?: Alert;
}

export type SoapField =
  | {
      kind: "input";
      label: string;
      value: string;
    }
  | {
      kind: "textarea";
      label: string;
      value: string;
    };
