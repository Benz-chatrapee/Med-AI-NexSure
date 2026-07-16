import type { LucideIcon } from "lucide-react";

export type NotificationSeverity = "critical" | "high" | "medium" | "low" | "info";
export type NotificationCategory = "clinical" | "evidence" | "security" | "claims" | "economic" | "tasks" | "system";
export type NotificationStatus = "unread" | "acknowledged" | "escalated" | "resolved";
export type NotificationSla = "overdue" | "due" | "track";
export type NotificationTab = "all" | "unread" | "critical" | "clinical" | "claims" | "evidence" | "mine" | "resolved";
export type KpiFilter = "all" | "critical" | "action" | "mine" | "due" | "overdue";

export type NotificationBadge = {
  label: string;
  tone: NotificationSeverity | "status" | "escalated" | "ai" | "action";
  icon?: LucideIcon;
};

export type NotificationItem = {
  id: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  status: NotificationStatus;
  mine: boolean;
  actionRequired: boolean;
  sla: NotificationSla;
  title: string;
  description: string;
  entity: string[];
  time: string;
  slaLabel: string;
  assignee: string;
  assigneeInitials: string;
  unread: boolean;
  badges: NotificationBadge[];
};

export type NotificationFilters = {
  tab: NotificationTab;
  severity: "" | NotificationSeverity;
  category: "" | NotificationCategory;
  status: "" | NotificationStatus;
  text: string;
  kpi: "" | KpiFilter;
};
