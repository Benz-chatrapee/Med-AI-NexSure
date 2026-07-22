-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 2 Claim Workflow History Foundation Test
-- File: supabase/tests/phase4_claim_workflow_history_test.sql
-- =============================================================================
-- Batch 2 validates immutable workflow-history storage only.
-- It intentionally does not validate transition functions, triggers, backfill,
-- claim snapshot mutation, appeals, decision records, or payment records.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;

select plan(47);

-- =============================================================================
-- 1. Table and column contract
-- =============================================================================

select has_table('public', 'claim_workflow_events', 'claim_workflow_events table exists');

select has_column('public', 'claim_workflow_events', 'id', 'id column exists');
select has_column('public', 'claim_workflow_events', 'organization_id', 'organization_id column exists');
select has_column('public', 'claim_workflow_events', 'clinic_id', 'clinic_id column exists');
select has_column('public', 'claim_workflow_events', 'claim_id', 'claim_id column exists');
select has_column('public', 'claim_workflow_events', 'from_workflow_status', 'from_workflow_status column exists');
select has_column('public', 'claim_workflow_events', 'to_workflow_status', 'to_workflow_status column exists');
select has_column('public', 'claim_workflow_events', 'sequence_number', 'sequence_number column exists');
select has_column('public', 'claim_workflow_events', 'claim_version_before', 'claim_version_before column exists');
select has_column('public', 'claim_workflow_events', 'claim_version_after', 'claim_version_after column exists');
select has_column('public', 'claim_workflow_events', 'actor_type', 'actor_type column exists');
select has_column('public', 'claim_workflow_events', 'source_system', 'source_system column exists');
select has_column('public', 'claim_workflow_events', 'reason_code', 'reason_code column exists');
select has_column('public', 'claim_workflow_events', 'occurred_at', 'occurred_at column exists');
select has_column('public', 'claim_workflow_events', 'recorded_at', 'recorded_at column exists');
select has_column('public', 'claim_workflow_events', 'created_at', 'created_at column exists');
select has_column('public', 'claim_workflow_events', 'actor_user_id', 'actor_user_id column exists');
select has_column('public', 'claim_workflow_events', 'actor_reference', 'actor_reference column exists');
select has_column('public', 'claim_workflow_events', 'external_event_id', 'external_event_id column exists');
select has_column('public', 'claim_workflow_events', 'correlation_id', 'correlation_id column exists');
select has_column('public', 'claim_workflow_events', 'received_at', 'received_at column exists');
select has_column('public', 'claim_workflow_events', 'reason_text', 'reason_text column exists');
select has_column('public', 'claim_workflow_events', 'metadata', 'metadata column exists');
select has_column('public', 'claim_workflow_events', 'supersedes_event_id', 'supersedes_event_id column exists');

select col_type_is('public', 'claim_workflow_events', 'id', 'uuid', 'id uses uuid');
select col_type_is('public', 'claim_workflow_events', 'from_workflow_status', 'claim_workflow_state_domain', 'from_workflow_status reuses Batch 1 workflow domain');
select col_type_is('public', 'claim_workflow_events', 'to_workflow_status', 'claim_workflow_state_domain', 'to_workflow_status reuses Batch 1 workflow domain');
select col_type_is('public', 'claim_workflow_events', 'sequence_number', 'integer', 'sequence_number uses integer');
select col_type_is('public', 'claim_workflow_events', 'claim_version_before', 'integer', 'claim_version_before uses integer');
select col_type_is('public', 'claim_workflow_events', 'claim_version_after', 'integer', 'claim_version_after uses integer');
select col_type_is('public', 'claim_workflow_events', 'metadata', 'jsonb', 'metadata uses jsonb');

select col_not_null('public', 'claim_workflow_events', 'organization_id', 'organization_id is required');
select col_not_null('public', 'claim_workflow_events', 'clinic_id', 'clinic_id is required');
select col_not_null('public', 'claim_workflow_events', 'claim_id', 'claim_id is required');
select col_is_null('public', 'claim_workflow_events', 'from_workflow_status', 'from_workflow_status allows initial event null');
select col_not_null('public', 'claim_workflow_events', 'to_workflow_status', 'to_workflow_status is required');
select col_not_null('public', 'claim_workflow_events', 'sequence_number', 'sequence_number is required');
select col_not_null('public', 'claim_workflow_events', 'recorded_at', 'recorded_at is required');

-- =============================================================================
-- 2. Constraints, indexes, RLS, and scope boundaries
-- =============================================================================

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_workflow_events'
      and c.conname = 'claim_workflow_events_claim_sequence_uq'
      and c.contype = 'u'
  ),
  'claim workflow event sequence is unique per claim'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_workflow_events'
      and c.conname in (
        'claim_workflow_events_claim_tenant_fk',
        'fk_claim_workflow_events_claims'
      )
      and c.contype = 'f'
  ),
  'claim workflow events use a tenant-safe claim foreign key'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_workflow_events'
      and c.conname = 'claim_workflow_events_version_forward_chk'
      and c.contype = 'c'
  ),
  'claim version must move forward for every workflow event'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_workflow_events'
      and c.conname = 'claim_workflow_events_external_identity_uq'
      and c.contype = 'u'
  ),
  'external event identity is unique within source scope when supplied'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_workflow_events'
      and indexname = 'claim_workflow_events_claim_order_idx'
  ),
  'ordered claim history index exists'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_workflow_events'
      and indexname = 'claim_workflow_events_tenant_claim_idx'
  ),
  'tenant claim lookup index exists'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claim_workflow_events'
      and c.relrowsecurity
  ),
  'RLS is enabled on claim_workflow_events'
);

select ok(
  coalesce(
    not has_table_privilege('authenticated', to_regclass('public.claim_workflow_events'), 'INSERT')
      and not has_table_privilege('authenticated', to_regclass('public.claim_workflow_events'), 'UPDATE')
      and not has_table_privilege('authenticated', to_regclass('public.claim_workflow_events'), 'DELETE'),
    false
  ),
  'authenticated cannot directly insert, update, or delete workflow history'
);

select ok(
  to_regprocedure(
    'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
  ) is not null
  and not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_workflow_event'
  ),
  'workflow history is written through the Batch 3 controlled transition function only'
);

select * from finish();

rollback;
