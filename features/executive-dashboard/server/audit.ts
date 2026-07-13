import type {
  DashboardAuditAction,
  ExecutiveDashboardActor,
  ExecutiveDashboardFilters,
} from "../domain/types";

export type ExecutiveDashboardAuditEvent = {
  id: string;
  action: DashboardAuditAction;
  actorId: string;
  organizationId: string;
  clinicId: string | "all";
  reason: string;
  before: string;
  after: string;
  timestamp: string;
  correlationId: string;
};

const auditEvents: ExecutiveDashboardAuditEvent[] = [];

export async function appendDashboardAuditEvent({
  action,
  actor,
  filters,
  reason,
  before = "not_applicable",
  after = "not_applicable",
}: {
  action: DashboardAuditAction;
  actor: ExecutiveDashboardActor;
  filters: ExecutiveDashboardFilters;
  reason: string;
  before?: string;
  after?: string;
}) {
  const event: ExecutiveDashboardAuditEvent = {
    id: `exec-audit-${auditEvents.length + 1}`,
    action,
    actorId: actor.actorId,
    organizationId: filters.organizationId,
    clinicId: filters.clinicId,
    reason,
    before,
    after,
    timestamp: new Date().toISOString(),
    correlationId: `exec-corr-${Date.now()}-${auditEvents.length + 1}`,
  };
  auditEvents.push(event);
  return event;
}

export async function listDashboardAuditEvents() {
  return [...auditEvents];
}
