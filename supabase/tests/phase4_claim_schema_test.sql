-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 1 Claim Split-State Schema Test
-- File: supabase/tests/phase4_claim_schema_test.sql
-- =============================================================================
-- Batch 1 validates schema-only split-state foundations.
-- Existing rows are intentionally not backfilled; new state columns remain
-- nullable and have no semantic defaults in this batch.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;

select plan(51);

-- =============================================================================
-- 1. Approved state types and domains
-- =============================================================================

select ok(
  to_regtype('public.claim_workflow_state') is not null,
  'public.claim_workflow_state enum exists'
);

select ok(
  to_regtype('public.claim_workflow_state_domain') is not null,
  'public.claim_workflow_state_domain domain exists'
);

select is(
  (
    select array_agg(e.enumlabel::text order by e.enumsortorder)
    from pg_type t
    join pg_namespace n
      on n.oid = t.typnamespace
    join pg_enum e
      on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'claim_workflow_state'
  ),
  array[
    'draft',
    'collecting_data',
    'validation_pending',
    'needs_review',
    'ready_to_submit',
    'submitted',
    'under_review',
    'appealed',
    'closed',
    'cancelled'
  ]::text[],
  'workflow values exactly match the approved Batch 1 set'
);

select ok(
  to_regtype('public.claim_decision_state') is not null,
  'public.claim_decision_state enum exists'
);

select ok(
  to_regtype('public.claim_decision_state_domain') is not null,
  'public.claim_decision_state_domain domain exists'
);

select is(
  (
    select array_agg(e.enumlabel::text order by e.enumsortorder)
    from pg_type t
    join pg_namespace n
      on n.oid = t.typnamespace
    join pg_enum e
      on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'claim_decision_state'
  ),
  array[
    'not_decided',
    'approved',
    'partially_approved',
    'rejected',
    'request_information',
    'voided'
  ]::text[],
  'decision values exactly match the approved Batch 1 set'
);

select ok(
  to_regtype('public.claim_payment_state') is not null,
  'public.claim_payment_state enum exists'
);

select ok(
  to_regtype('public.claim_payment_state_domain') is not null,
  'public.claim_payment_state_domain domain exists'
);

select is(
  (
    select array_agg(e.enumlabel::text order by e.enumsortorder)
    from pg_type t
    join pg_namespace n
      on n.oid = t.typnamespace
    join pg_enum e
      on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'claim_payment_state'
  ),
  array[
    'not_paid',
    'payment_pending',
    'partially_paid',
    'paid',
    'payment_failed',
    'partially_refunded',
    'refunded',
    'reversed'
  ]::text[],
  'payment values exactly match the approved Batch 1 set'
);

-- =============================================================================
-- 2. Claim snapshot columns and type contracts
-- =============================================================================

select has_column('public', 'claims', 'workflow_status', 'claims.workflow_status exists');
select has_column('public', 'claims', 'decision_status', 'claims.decision_status exists');
select has_column('public', 'claims', 'payment_status', 'claims.payment_status exists');
select has_column('public', 'claims', 'state_updated_at', 'claims.state_updated_at exists');
select has_column('public', 'claims', 'state_updated_by', 'claims.state_updated_by exists');
select has_column('public', 'claims', 'currency_code', 'claims.currency_code remains present');
select has_column('public', 'claims', 'legacy_status_migration_state', 'claims.legacy_status_migration_state exists');

select col_type_is(
  'public',
  'claims',
  'workflow_status',
  'claim_workflow_state_domain',
  'claims.workflow_status uses the approved workflow domain'
);

select col_type_is(
  'public',
  'claims',
  'decision_status',
  'claim_decision_state_domain',
  'claims.decision_status uses the approved decision domain'
);

select col_type_is(
  'public',
  'claims',
  'payment_status',
  'claim_payment_state_domain',
  'claims.payment_status uses the approved payment domain'
);

select col_type_is(
  'public',
  'claims',
  'state_updated_at',
  'timestamp with time zone',
  'claims.state_updated_at uses timestamptz'
);

select col_type_is(
  'public',
  'claims',
  'state_updated_by',
  'uuid',
  'claims.state_updated_by uses uuid'
);

select is(
  (
    select format_type(a.atttypid, a.atttypmod)
    from pg_attribute a
    join pg_class c
      on c.oid = a.attrelid
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claims'
      and a.attname = 'currency_code'
      and not a.attisdropped
  ),
  'character(3)',
  'claims.currency_code keeps the existing char(3) representation'
);

select col_type_is(
  'public',
  'claims',
  'legacy_status_migration_state',
  'text',
  'claims.legacy_status_migration_state uses text'
);

select col_is_null('public', 'claims', 'workflow_status', 'claims.workflow_status remains nullable');
select col_is_null('public', 'claims', 'decision_status', 'claims.decision_status remains nullable');
select col_is_null('public', 'claims', 'payment_status', 'claims.payment_status remains nullable');
select col_is_null('public', 'claims', 'state_updated_at', 'claims.state_updated_at remains nullable');
select col_is_null('public', 'claims', 'state_updated_by', 'claims.state_updated_by remains nullable');
select col_is_null('public', 'claims', 'legacy_status_migration_state', 'claims.legacy_status_migration_state remains nullable');

select col_hasnt_default('public', 'claims', 'workflow_status', 'claims.workflow_status has no Batch 1 default');
select col_hasnt_default('public', 'claims', 'decision_status', 'claims.decision_status has no Batch 1 default');
select col_hasnt_default('public', 'claims', 'payment_status', 'claims.payment_status has no Batch 1 default');
select col_hasnt_default('public', 'claims', 'state_updated_at', 'claims.state_updated_at has no Batch 1 default');
select col_hasnt_default('public', 'claims', 'state_updated_by', 'claims.state_updated_by has no Batch 1 default');
select col_hasnt_default('public', 'claims', 'legacy_status_migration_state', 'claims.legacy_status_migration_state has no Batch 1 default');

-- =============================================================================
-- 3. Legacy, version, currency, ownership, indexes, and scope boundaries
-- =============================================================================

select has_column('public', 'claims', 'status', 'legacy claims.status remains present');

select is(
  (
    select pg_get_constraintdef(c.oid)
    from pg_constraint c
    join pg_class r
      on r.oid = c.conrelid
    join pg_namespace n
      on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claims'
      and c.conname = 'claims_status_chk'
  ),
  'CHECK ((status = ANY (ARRAY[''draft''::text, ''collecting_evidence''::text, ''pending_validation''::text, ''validation_failed''::text, ''needs_information''::text, ''ready_for_submission''::text, ''submitted''::text, ''submission_failed''::text, ''under_review''::text, ''pending_medical_review''::text, ''pending_claim_assessor''::text, ''approved''::text, ''partially_approved''::text, ''rejected''::text, ''payment_pending''::text, ''partially_paid''::text, ''paid''::text, ''cancelled''::text, ''closed''::text])))',
  'legacy claims.status check constraint remains unchanged'
);

select has_column('public', 'claims', 'version', 'claims.version remains present');
select col_type_is('public', 'claims', 'version', 'integer', 'claims.version remains integer');
select col_not_null('public', 'claims', 'version', 'claims.version remains not null');

select hasnt_column('public', 'claims', 'state_version', 'no competing claims.state_version exists');

select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'currency_code'
  ),
  '''THB''::bpchar',
  'claims.currency_code keeps the existing THB default'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r
      on r.oid = c.conrelid
    join pg_namespace n
      on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claims'
      and c.conname = 'claims_currency_code_format_chk'
  ),
  'existing currency format check remains present'
);

select col_not_null('public', 'claims', 'organization_id', 'claims.organization_id remains not null');
select col_not_null('public', 'claims', 'clinic_id', 'claims.clinic_id remains not null');

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claims'
      and indexname = 'claims_workflow_status_queue_idx'
  ),
  'approved workflow queue index exists'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claims'
      and indexname = 'claims_clinic_workflow_status_queue_idx'
  ),
  'approved clinic workflow queue index exists'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claims'
      and indexname = 'claims_decision_status_queue_idx'
  ),
  'approved decision queue index exists'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claims'
      and indexname = 'claims_payment_status_queue_idx'
  ),
  'approved payment queue index exists'
);

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname in (
        'claim_appeals',
        'claim_line_decisions',
        'claim_payment_transactions'
      )
  ),
  'no Batch 2 claim tables are introduced'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'transition_claim_workflow',
        'submit_claim_appeal',
        'record_claim_refund',
        'record_claim_reversal'
      )
  ),
  'no Batch 2 claim mutation functions are introduced'
);

select * from finish();

rollback;
