-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 6: Formal Claim Appeal Functional Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(19);

select has_table(
  'public',
  'claim_appeals',
  'public.claim_appeals exists as the formal appeal source of truth'
);

select columns_are(
  'public',
  'claim_appeals',
  array[
    'id',
    'organization_id',
    'clinic_id',
    'claim_id',
    'appeal_sequence',
    'appeal_status',
    'appeal_reason_code',
    'appeal_reason_text',
    'submitted_by',
    'submitted_at',
    'deadline_at',
    'owner_user_id',
    'payer_reference',
    'source_system',
    'external_event_id',
    'correlation_id',
    'evidence_package_id',
    'outcome_decision_id',
    'resolved_at',
    'metadata',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'deleted_at'
  ],
  'claim_appeals has the approved Batch 6 contract columns'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claim_appeals'
      and column_name = 'appeal_sequence'
      and is_nullable = 'NO'
  ),
  'appeal_sequence is required'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conname = 'claim_appeals_status_chk'
      and conrelid = 'public.claim_appeals'::regclass
  ),
  'appeal_status is constrained to the approved Batch 6 states'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conname = 'claim_appeals_claim_tenant_fk'
      and conrelid = 'public.claim_appeals'::regclass
  ),
  'claim_appeals references claims with tenant and clinic scope'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'claim_appeals'
      and indexname = 'claim_appeals_claim_sequence_uq'
      and indexdef ilike '%organization_id%'
      and indexdef ilike '%clinic_id%'
      and indexdef ilike '%claim_id%'
      and indexdef ilike '%appeal_sequence%'
  ),
  'appeal sequence is unique per tenant-scoped claim'
);

select has_function(
  'public',
  'submit_claim_appeal',
  array[
    'uuid',
    'integer',
    'text',
    'text',
    'timestamp with time zone',
    'uuid',
    'text',
    'uuid',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'public.submit_claim_appeal has the approved Batch 6 signature'
);

select function_returns(
  'public',
  'submit_claim_appeal',
  array[
    'uuid',
    'integer',
    'text',
    'text',
    'timestamp with time zone',
    'uuid',
    'text',
    'uuid',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'setof record',
  'public.submit_claim_appeal returns a row contract'
);

select has_function(
  'public',
  'resolve_claim_appeal',
  array[
    'uuid',
    'integer',
    'text',
    'text',
    'text',
    'uuid',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'public.resolve_claim_appeal has the approved Batch 6 signature'
);

select function_returns(
  'public',
  'resolve_claim_appeal',
  array[
    'uuid',
    'integer',
    'text',
    'text',
    'text',
    'uuid',
    'timestamp with time zone',
    'text',
    'text',
    'uuid',
    'jsonb'
  ],
  'setof record',
  'public.resolve_claim_appeal returns a row contract'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%for update%'
      and pg_get_functiondef(p.oid) ilike '%v_claim.version <> p_expected_version%'
      and pg_get_functiondef(p.oid) ilike '%version = c.version + 1%'
  ),
  'submit_claim_appeal locks the Claim, validates expected version, and increments once'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%workflow_status = ''appealed''%'
      and pg_get_functiondef(p.oid) ilike '%insert into public.claim_workflow_events%'
  ),
  'submit_claim_appeal synchronizes appealed workflow and writes workflow evidence'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%decision_status%'
      and pg_get_functiondef(p.oid) ilike '%payment_status%'
      and pg_get_functiondef(p.oid) not ilike '%set decision_status%'
      and pg_get_functiondef(p.oid) not ilike '%set payment_status%'
  ),
  'submit_claim_appeal preserves decision and payment snapshots'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolve_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%for update%'
      and pg_get_functiondef(p.oid) ilike '%v_claim.version <> p_expected_version%'
      and pg_get_functiondef(p.oid) ilike '%version = c.version + 1%'
  ),
  'resolve_claim_appeal locks through Appeal, validates expected version, and increments once'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolve_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%public.claim_decisions%'
      and pg_get_functiondef(p.oid) ilike '%outcome_decision_id%'
      and pg_get_functiondef(p.oid) ilike '%decision_status = ''final''%'
  ),
  'resolve_claim_appeal validates optional outcome decision evidence'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolve_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%decision_status%'
      and pg_get_functiondef(p.oid) ilike '%payment_status%'
      and pg_get_functiondef(p.oid) not ilike '%set decision_status%'
      and pg_get_functiondef(p.oid) not ilike '%set payment_status%'
  ),
  'resolve_claim_appeal preserves decision and payment snapshots'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%idempotent_replay%'
      and pg_get_functiondef(p.oid) ilike '%external_event_id%'
  ),
  'submit_claim_appeal implements external idempotent replay behavior'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolve_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%idempotent_replay%'
      and pg_get_functiondef(p.oid) ilike '%external_event_id%'
  ),
  'resolve_claim_appeal implements external idempotent replay behavior'
);

select ok(
  to_regprocedure(
    'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
  ) is not null
    and to_regprocedure(
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
    ) is not null
    and to_regprocedure(
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
    ) is not null,
  'Batch 6 preserves separate workflow, decision, and payment controlled mutations'
);

select * from finish();

rollback;
