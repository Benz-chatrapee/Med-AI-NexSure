-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 2: Claim Workflow History Foundation
-- Migration: 20260722140200_phase4_claim_workflow_events.sql
-- =============================================================================
-- Scope:
--   - Add immutable append-only workflow history storage.
--   - Preserve per-Claim ordering and source event identity.
--   - Deny ordinary direct writes until controlled Batch 3 workflow operations.
-- Out of scope:
--   - No workflow transition function.
--   - No automatic trigger.
--   - No Claim snapshot mutation.
--   - No historical backfill.
-- =============================================================================

create table public.claim_workflow_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  from_workflow_status public.claim_workflow_state_domain,
  to_workflow_status public.claim_workflow_state_domain not null,
  sequence_number integer not null,
  claim_version_before integer not null,
  claim_version_after integer not null,
  actor_type text not null,
  actor_user_id uuid,
  actor_reference text,
  source_system text not null,
  external_event_id text,
  correlation_id text,
  reason_code text,
  reason_text text,
  occurred_at timestamptz not null,
  received_at timestamptz,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  supersedes_event_id uuid,
  constraint claim_workflow_events_sequence_positive_chk
    check (sequence_number > 0),
  constraint claim_workflow_events_version_positive_chk
    check (claim_version_before > 0 and claim_version_after > 0),
  constraint claim_workflow_events_version_forward_chk
    check (claim_version_after > claim_version_before),
  constraint claim_workflow_events_actor_type_chk
    check (actor_type in ('human', 'integration', 'system', 'migration')),
  constraint claim_workflow_events_human_actor_user_chk
    check (
      (actor_type = 'human' and actor_user_id is not null)
      or (actor_type <> 'human' and actor_user_id is null)
    ),
  constraint claim_workflow_events_source_system_not_blank_chk
    check (length(btrim(source_system)) > 0),
  constraint claim_workflow_events_actor_reference_not_blank_chk
    check (actor_reference is null or length(btrim(actor_reference)) > 0),
  constraint claim_workflow_events_external_event_id_not_blank_chk
    check (external_event_id is null or length(btrim(external_event_id)) > 0),
  constraint claim_workflow_events_correlation_id_not_blank_chk
    check (correlation_id is null or length(btrim(correlation_id)) > 0),
  constraint claim_workflow_events_reason_code_not_blank_chk
    check (reason_code is null or length(btrim(reason_code)) > 0),
  constraint claim_workflow_events_reason_text_not_blank_chk
    check (reason_text is null or length(btrim(reason_text)) > 0),
  constraint claim_workflow_events_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),
  constraint claim_workflow_events_external_identity_uq
    unique (organization_id, source_system, external_event_id),
  constraint claim_workflow_events_claim_sequence_uq
    unique (claim_id, sequence_number),
  constraint claim_workflow_events_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims (organization_id, clinic_id, id),
  constraint claim_workflow_events_actor_user_fk
    foreign key (actor_user_id)
    references public.user_profiles (id),
  constraint claim_workflow_events_supersedes_event_fk
    foreign key (supersedes_event_id)
    references public.claim_workflow_events (id)
);

comment on table public.claim_workflow_events is
  'Phase 4 Batch 2 append-only claim workflow transition history. Does not mutate the current Claim snapshot.';

comment on column public.claim_workflow_events.id is
  'Internal immutable event identifier.';

comment on column public.claim_workflow_events.external_event_id is
  'Optional source event identifier for idempotency within organization and source_system scope.';

comment on column public.claim_workflow_events.sequence_number is
  'Deterministic order within one Claim. Batch 2 does not allocate this sequence concurrently.';

comment on column public.claim_workflow_events.metadata is
  'Supplemental non-authoritative metadata only. Workflow state, tenant ownership, actors, and ordering must remain typed columns.';

create index claim_workflow_events_claim_order_idx
  on public.claim_workflow_events (
    claim_id,
    sequence_number
  );

create index claim_workflow_events_tenant_claim_idx
  on public.claim_workflow_events (
    organization_id,
    clinic_id,
    claim_id,
    recorded_at desc
  );

create index claim_workflow_events_recorded_at_idx
  on public.claim_workflow_events (
    organization_id,
    recorded_at desc
  );

alter table public.claim_workflow_events enable row level security;

drop policy if exists claim_workflow_events_select_authorized
  on public.claim_workflow_events;

create policy claim_workflow_events_select_authorized
on public.claim_workflow_events
for select
to authenticated
using (
  public.has_permission(
    case
      when exists (
        select 1
        from public.claims c
        where c.id = claim_workflow_events.claim_id
          and c.organization_id = claim_workflow_events.organization_id
          and c.clinic_id = claim_workflow_events.clinic_id
          and c.deleted_at is not null
      )
      then 'claim.audit.read'
      else 'claim.read'
    end,
    organization_id,
    clinic_id
  )
);

revoke all on table public.claim_workflow_events from anon;
revoke all on table public.claim_workflow_events from authenticated;
grant select on table public.claim_workflow_events to authenticated;
grant all on table public.claim_workflow_events to service_role;

comment on policy claim_workflow_events_select_authorized
on public.claim_workflow_events is
  'Allows tenant- and clinic-scoped Claim readers to read append-only workflow history. Soft-deleted Claim history requires claim.audit.read.';
