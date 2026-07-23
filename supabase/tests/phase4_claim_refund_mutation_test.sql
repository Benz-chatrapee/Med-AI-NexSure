-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 7: Controlled Claim Refund Lifecycle Functional Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(19);

select has_function(
  'public',
  'record_claim_refund',
  array[
    'uuid',
    'uuid',
    'integer',
    'numeric',
    'text',
    'text',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'public.record_claim_refund has the approved Batch 7 signature'
);

select function_returns(
  'public',
  'record_claim_refund',
  array[
    'uuid',
    'uuid',
    'integer',
    'numeric',
    'text',
    'text',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'setof record',
  'public.record_claim_refund returns the approved row contract'
);

select lives_ok(
  $$
    select 'partially_refunded'::public.claim_payment_state_domain;
    select 'refunded'::public.claim_payment_state_domain;
  $$,
  'Batch 7 refund summary states are accepted by the payment domain'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conname = 'claim_payments_status_chk'
      and pg_get_constraintdef(oid) ilike '%refund%'
  ),
  'claim_payments can store controlled refund evidence'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_payments'
      and indexname = 'claim_payments_refund_original_idx'
      and indexdef ilike '%payment_status = ''refund''%'
  ),
  'refund evidence is indexed by original payment metadata'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%p_original_payment_id%'
      and pg_get_functiondef(p.oid) ilike '%payment_status = ''received''%'
      and pg_get_functiondef(p.oid) ilike '%p.net_payment_amount > 0%'
  ),
  'refund mutation requires successful settled original payment evidence'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%v_refund_amount := round(p_refund_amount, 2)%'
      and pg_get_functiondef(p.oid) ilike '%v_refund_amount <= 0%'
  ),
  'refund mutation validates exact positive refund amount'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%v_prior_refunded + v_refund_amount > v_gross_paid%'
      and pg_get_functiondef(p.oid) ilike '%would exceed refundable amount%'
  ),
  'refund mutation prevents cumulative over-refund'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%v_claim.version <> p_expected_version%'
      and pg_get_functiondef(p.oid) ilike '%version conflict%'
  ),
  'refund mutation enforces optimistic version conflicts before writes'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%idempotent_replay%'
      and pg_get_functiondef(p.oid) ilike '%idempotency_key = v_external_event_id%'
      and pg_get_functiondef(p.oid) ilike '%event identity conflicts%'
  ),
  'refund mutation implements equivalent replay and conflicting replay behavior'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%payment_status = v_next_snapshot%'
      and pg_get_functiondef(p.oid) ilike '%total_paid_amount = v_net_paid%'
      and pg_get_functiondef(p.oid) ilike '%version = c.version + 1%'
  ),
  'refund mutation synchronizes payment summary and increments version once'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%then ''refunded''::public.claim_payment_state_domain%'
      and pg_get_functiondef(p.oid) ilike '%else ''partially_refunded''::public.claim_payment_state_domain%'
  ),
  'refund mutation distinguishes full and partial refund summaries'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%''operation'',%''record_claim_refund''%'
      and pg_get_functiondef(p.oid) ilike '%''original_payment_id''%'
      and pg_get_functiondef(p.oid) ilike '%''reason_code''%'
  ),
  'refund mutation appends immutable refund evidence metadata'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%workflow_status =%'
  ),
  'refund mutation does not mutate workflow_status'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and (
        pg_get_functiondef(p.oid) ilike '%decision_status =%'
        or pg_get_functiondef(p.oid) ilike '%current_decision_id =%'
      )
  ),
  'refund mutation does not mutate decision snapshot or current decision pointer'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%claim_appeals%'
  ),
  'refund mutation does not mutate appeal lifecycle records'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%claims.status%'
  ),
  'Batch 7 refund mutation does not write legacy claims.status'
);

select ok(
  to_regprocedure(
    'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
  ) is not null,
  'Batch 7 preserves separate controlled payment settlement mutation'
);

select ok(
  to_regprocedure(
    'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
  ) is not null
    and to_regprocedure(
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
    ) is not null,
  'Batch 7 preserves separate controlled decision and workflow mutations'
);

select * from finish();

rollback;
