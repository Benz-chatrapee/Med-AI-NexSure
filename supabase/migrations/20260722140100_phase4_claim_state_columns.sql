-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 1: Claim Split-State Snapshot Columns
-- Migration: 20260722140100_phase4_claim_state_columns.sql
-- =============================================================================
-- Scope:
--   - Add nullable Claim split-state snapshot columns.
--   - Reuse existing public.claims.version for optimistic concurrency.
--   - Preserve existing public.claims.status and currency_code behavior.
--   - Add only approved minimal queue indexes.
--   - No semantic backfill, final NOT NULL, RLS/RBAC, functions, or Batch 2 tables.
-- =============================================================================

begin;

alter table public.claims
  add column workflow_status public.claim_workflow_state_domain,
  add column decision_status public.claim_decision_state_domain,
  add column payment_status public.claim_payment_state_domain,
  add column state_updated_at timestamptz,
  add column state_updated_by uuid,
  add column legacy_status_migration_state text;

alter table public.claims
  add constraint claims_state_updated_by_fk
  foreign key (state_updated_by)
  references public.user_profiles(id)
  on update restrict
  on delete restrict;

comment on column public.claims.workflow_status is
  'Phase 4 split-state operational workflow snapshot. Nullable in Batch 1 because no semantic backfill is performed.';

comment on column public.claims.decision_status is
  'Phase 4 split-state payer decision snapshot. Nullable in Batch 1 because authoritative decision synchronization is deferred.';

comment on column public.claims.payment_status is
  'Phase 4 split-state payment summary snapshot. Nullable in Batch 1 because authoritative payment synchronization is deferred.';

comment on column public.claims.state_updated_at is
  'Timestamp for the latest split-state snapshot update. Nullable until controlled state operations are implemented.';

comment on column public.claims.state_updated_by is
  'User profile that last updated the split-state snapshot. Nullable until controlled state operations are implemented.';

comment on column public.claims.legacy_status_migration_state is
  'Forward-only migration marker for later legacy status backfill and verification. No Batch 1 backfill is performed.';

create index claims_workflow_status_queue_idx
  on public.claims (
    organization_id,
    workflow_status,
    deleted_at
  );

create index claims_clinic_workflow_status_queue_idx
  on public.claims (
    organization_id,
    clinic_id,
    workflow_status,
    deleted_at
  );

create index claims_decision_status_queue_idx
  on public.claims (
    organization_id,
    decision_status,
    deleted_at
  );

create index claims_payment_status_queue_idx
  on public.claims (
    organization_id,
    payment_status,
    deleted_at
  );

commit;
