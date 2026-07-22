-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 4: Controlled Claim Decision Mutation Functional Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(19);

select has_function(
  'public',
  'record_claim_decision',
  array[
    'uuid',
    'claim_decision_state_domain',
    'integer',
    'text',
    'text',
    'numeric',
    'numeric',
    'text',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'public.record_claim_decision has the approved Batch 4 signature'
);

select function_returns(
  'public',
  'record_claim_decision',
  array[
    'uuid',
    'claim_decision_state_domain',
    'integer',
    'text',
    'text',
    'numeric',
    'numeric',
    'text',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'setof record',
  'public.record_claim_decision returns a row contract'
);

select has_column(
  'public',
  'claim_decisions',
  'source_system',
  'claim_decisions.source_system stores decision event source'
);

select has_column(
  'public',
  'claim_decisions',
  'external_event_id',
  'claim_decisions.external_event_id stores external decision identity'
);

select has_column(
  'public',
  'claim_decisions',
  'correlation_id',
  'claim_decisions.correlation_id stores decision correlation id'
);

select has_column(
  'public',
  'claim_decisions',
  'payer_reference',
  'claim_decisions.payer_reference stores typed payer reference for idempotency comparison'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_decisions'
      and indexname = 'claim_decisions_external_identity_uq'
      and indexdef ilike '%organization_id%'
      and indexdef ilike '%source_system%'
      and indexdef ilike '%external_event_id%'
      and indexdef ilike '%external_event_id IS NOT NULL%'
  ),
  'external decision event identity is unique per organization and source'
);

select ok(
  to_regtype('public.claim_decision_state_domain') is not null,
  'Batch 1 decision domain is available'
);

select lives_ok(
  $$
    select 'not_decided'::public.claim_decision_state_domain;
    select 'approved'::public.claim_decision_state_domain;
    select 'partially_approved'::public.claim_decision_state_domain;
    select 'rejected'::public.claim_decision_state_domain;
    select 'request_information'::public.claim_decision_state_domain;
    select 'voided'::public.claim_decision_state_domain;
  $$,
  'all approved Batch 4 decision states are accepted by the domain'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'decision_status'
      and domain_schema = 'public'
      and domain_name = 'claim_decision_state_domain'
  ),
  'claims.decision_status is the split decision snapshot'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'current_decision_id'
  ),
  'claims.current_decision_id is available as current decision pointer'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'version'
      and is_nullable = 'NO'
  ),
  'claims.version is the required optimistic lock counter'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_decisions'
      and c.conname = 'claim_decisions_claim_version_uq'
  ),
  'claim decision version uniqueness exists'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_decisions'
      and indexname = 'claim_decisions_one_final_per_claim_uq'
  ),
  'only one active final decision is allowed per Claim'
);

select ok(
  exists (
    select 1
    from public.permissions
    where permission_key = 'claim.decision.void'
      and domain = 'claim'
  ),
  'Batch 4 void decision permission exists'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_decisions', 'insert'),
  'ordinary authenticated users cannot directly insert authoritative decisions'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_decisions', 'update')
    and not has_table_privilege('authenticated', 'public.claim_decisions', 'delete'),
  'ordinary authenticated users cannot directly mutate authoritative decisions'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'decision_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'current_decision_id', 'update'),
  'ordinary authenticated users cannot directly update decision snapshot or pointer'
);

select ok(
  to_regprocedure(
    'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
  ) is not null,
  'Batch 4 preserves separate controlled workflow mutation'
);

select * from finish();

rollback;
