-- =============================================================================
-- Med AI NexSure
-- Fix Phase 3 Claim Audit Function / Audit Log Schema Contract
-- =============================================================================

begin;

alter table public.audit_logs
  add column if not exists actor_role text,
  add column if not exists changed_fields text[],
  add column if not exists request_id uuid;

comment on column public.audit_logs.actor_role is
  'Authenticated JWT role captured by claim audit triggers.';

comment on column public.audit_logs.changed_fields is
  'Names of auditable fields changed by a domain mutation.';

comment on column public.audit_logs.request_id is
  'Request identifier captured from the inbound request context when available.';

create index if not exists idx_audit_logs_request_id
  on public.audit_logs (request_id)
  where request_id is not null;

commit;
