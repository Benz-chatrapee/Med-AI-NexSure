import type { LucideIcon } from "lucide-react";

export type TimelineCategory =
  | "all"
  | "clinical"
  | "document"
  | "ai"
  | "insurance"
  | "audit";

export type TimelineSeverity = "neutral" | "success" | "warning" | "critical" | "ai";

export type VisitContext = {
  visitId: string;
  patientName: string;
  patientInitials: string;
  patientMeta: string;
  visitType: string;
  department: string;
  physician: string;
  payer: string;
  policy: string;
  visitStatus: string;
};

export type TimelineSummary = {
  id: TimelineCategory;
  label: string;
  value: string;
  footnote: string;
  tone?: "default" | "warning" | "ai" | "score";
};

export type TimelineEvent = {
  id: string;
  day: string;
  time: string;
  title: string;
  actor: string;
  description?: string;
  category: TimelineCategory[];
  severity: TimelineSeverity;
  badges: Array<{ label: string; tone: "blue" | "ai" | "azure" | "green" | "amber" | "red" | "gray" }>;
  actions: string[];
  searchText: string;
  icon: LucideIcon;
  details?: {
    eventRef: string;
    auditRef: string;
    source: string;
    department: string;
    module: string;
    timestamp: string;
    operationalDescription: string;
    scoreImpact?: { previous: number; current: number };
  };
  metrics?: Array<{ label: string; value: string }>;
};

export type ClaimReadiness = {
  score: number;
  status: string;
  help: string;
  improvement: string;
  breakdown: Array<{ label: string; points: string; percent: number; tone: "good" | "warning" | "default" }>;
};

export type MissingEvidence = {
  id: string;
  title: string;
  meta: string;
  action: string;
};

export type RecentActivity = {
  id: string;
  initials: string;
  text: string;
  time: string;
};
