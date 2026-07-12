export type BadgeTone = "green" | "amber" | "red" | "blue" | "gray" | "purple";

export type CaseSort = "priority" | "scoreAsc" | "agingDesc" | "updatedDesc";

export type CaseFilters = {
  search: string;
  priority: string;
  visit: string;
  claim: string;
  payer: string;
  reviewer: string;
  chartVisit: string;
  chartClaim: string;
  evidence: string;
  sort: CaseSort;
};

export type NavItem = {
  label: string;
  group: string;
  active?: boolean;
};

export type ContextItem = {
  label: string;
  value: string;
  badgeTone?: BadgeTone;
};

export type KpiCard = {
  title: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down" | "good-down";
  target: string;
  color: string;
  sparkline: number[];
};

export type CaseRow = {
  id: number;
  priority: "P0 Critical" | "P1 High" | "P2 Medium" | "P3 Low";
  patient: string;
  hn: string;
  visit: string;
  score: number;
  claim: string;
  evidence: string[];
  alert: string;
  cost: string;
  aging: number;
  sla: number;
  reviewer: string;
  payer: string;
  updated: string;
  updatedRank: number;
};

export type ActivityItem = {
  id: number;
  time: string;
  actor: string;
  action: string;
  module: "Clinical" | "AI" | "Insurance" | "Compliance";
  detail: string;
};

export type PackageItem = {
  name: string;
  status: string;
};

export type BreakdownItem = {
  name: string;
  score: number;
  max: number;
  status: string;
  missing: string;
  recommended: string;
};

