export type GlobalSearchEntity = "patient" | "visit" | "claim" | "task" | "evidence" | "audit";

export type GlobalSearchCategory = "all" | "patient" | "visit" | "claim" | "task" | "other";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface GlobalSearchBadge {
  label: string;
  tone: BadgeTone;
}

export interface GlobalSearchResult {
  entity: GlobalSearchEntity;
  entityLabel: string;
  icon: string;
  confidence: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  recommendedAction: string;
  relatedEntities: string[];
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  badges: GlobalSearchBadge[];
  meta: Array<{ label: string; value: string }>;
  subline: string[];
  subBadges?: GlobalSearchBadge[];
  actionLabel: string;
  searchText: string;
}
