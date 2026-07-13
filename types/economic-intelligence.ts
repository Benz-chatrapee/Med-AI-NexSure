export type NavItem = {
  label: string;
  active?: boolean;
};

export type KpiCard = {
  label: string;
  value: string;
  note: string;
  ai?: boolean;
};

export type IntelligenceModule = {
  title: string;
  description: string;
};

export type PriorityItem = {
  title: string;
  description: string;
  tone: "clinical" | "insurance" | "financial";
};

export type CaseSignal = {
  patient: string;
  note: string;
  visit: string;
  clinicalStatus: string;
  clinicalTone: "ready" | "review" | "alert";
  claimReadiness: string;
  claimTone: "ready" | "review" | "alert";
  economicSignal: string;
  economicTone: "ready" | "review" | "alert";
};

export type TimelineItem = {
  title: string;
  description: string;
};
