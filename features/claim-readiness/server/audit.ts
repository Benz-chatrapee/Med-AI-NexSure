import type { ClaimReadinessAuditEvent } from "../domain/types";

const auditEvents: ClaimReadinessAuditEvent[] = [];

export async function appendAuditEvent(
  event: Omit<ClaimReadinessAuditEvent, "id" | "timestamp" | "correlationId">,
) {
  auditEvents.push({
    ...event,
    id: `audit-${auditEvents.length + 1}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr-${Date.now()}-${auditEvents.length + 1}`,
  });
}

export async function listAuditEvents() {
  return [...auditEvents];
}
