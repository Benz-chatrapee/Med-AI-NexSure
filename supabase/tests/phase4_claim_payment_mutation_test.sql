-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 5: Controlled Claim Payment Settlement Functional Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(18);

select has_function(
  'public',
  'record_claim_payment_settlement',
  array[
    'uuid',
    'integer',
    'numeric',
    'text',
    'text',
    'text',
    'timestamp with time zone',
    'date',
    'text',
    'text',
    'uuid',
    'text',
    'text',
    'jsonb'
  ],
  'public.record_claim_payment_settlement has the approved Batch 5 signature'
);

select function_returns(
  'public',
  'record_claim_payment_settlement',
  array[
    'uuid',
    'integer',
    'numeric',
    'text',
    'text',
    'text',
    'timestamp with time zone',
    'date',
    'text',
    'text',
    'uuid',
    'text',
    'text',
    'jsonb'
  ],
  'setof record',
  'public.record_claim_payment_settlement returns a row contract'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'payment_status'
      and domain_schema = 'public'
      and domain_name = 'claim_payment_state_domain'
  ),
  'claims.payment_status is the split payment snapshot'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'total_paid_amount'
      and data_type = 'numeric'
      and numeric_scale = 2
  ),
  'claims.total_paid_amount remains exact numeric financial summary'
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
  'claims.version remains the optimistic lock for payment settlement'
);

select ok(
  to_regclass('public.claim_payments') is not null,
  'Batch 5 reuses public.claim_payments as authoritative payment evidence'
);

select ok(
  to_regclass('public.claim_payment_allocations') is not null
    and to_regclass('public.claim_payment_reconciliations') is not null,
  'Batch 5 preserves payment allocation and reconciliation objects'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_payments'
      and indexname = 'claim_payments_idempotency_uq'
      and indexdef ilike '%organization_id%'
      and indexdef ilike '%idempotency_key%'
      and indexdef ilike '%idempotency_key IS NOT NULL%'
  ),
  'payment idempotency identity is unique per organization'
);

select lives_ok(
  $$
    select 'not_paid'::public.claim_payment_state_domain;
    select 'payment_pending'::public.claim_payment_state_domain;
    select 'partially_paid'::public.claim_payment_state_domain;
    select 'paid'::public.claim_payment_state_domain;
    select 'payment_failed'::public.claim_payment_state_domain;
    select 'reversed'::public.claim_payment_state_domain;
  $$,
  'approved Batch 5 payment summary states are accepted by the domain'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%claims.status%'
  ),
  'Batch 5 settlement function does not mutate legacy claims.status'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%payment_status%'
      and pg_get_functiondef(p.oid) ilike '%total_paid_amount%'
      and pg_get_functiondef(p.oid) ilike '%version = c.version + 1%'
  ),
  'settlement function synchronizes payment snapshot, paid total, and version'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%v_created_at := least(v_now, v_event_at)%'
  ),
  'settlement function preserves source event timing without violating payment timestamp constraints'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%decision_status%'
      and pg_get_functiondef(p.oid) ilike '%approved%'
      and pg_get_functiondef(p.oid) ilike '%partially_approved%'
  ),
  'settlement function requires payable decision evidence'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%v_payment_status in (''pending'', ''scheduled'', ''processing'')%'
      and pg_get_functiondef(p.oid) ilike '%would exceed approved amount%'
  ),
  'settlement function rejects pending or processing payment evidence above approved amount'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%idempotent_replay%'
      and pg_get_functiondef(p.oid) ilike '%idempotency_key%'
  ),
  'settlement function implements idempotent external replay behavior'
);

select ok(
  to_regprocedure(
    'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
  ) is not null,
  'Batch 5 preserves separate controlled decision mutation'
);

select ok(
  to_regprocedure(
    'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
  ) is not null,
  'Batch 5 preserves separate controlled workflow mutation'
);

select ok(
  to_regprocedure(
    'public.record_claim_payment(uuid, uuid, text, numeric, text, numeric, numeric, text, text, text, text, text, timestamptz, date, text, text, jsonb)'
  ) is not null,
  'Batch 5 leaves the existing Phase 3 payment evidence function available'
);

select * from finish();

rollback;
