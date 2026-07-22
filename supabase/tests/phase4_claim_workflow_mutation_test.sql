-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 3: Controlled Claim Workflow Mutation Functional Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(12);

select has_function(
  'public',
  'transition_claim_workflow',
  array[
    'uuid',
    'claim_workflow_state_domain',
    'integer',
    'text',
    'text',
    'text',
    'text',
    'uuid',
    'timestamp with time zone'
  ],
  'public.transition_claim_workflow has the approved Batch 3 signature'
);

select ok(
  to_regtype('public.claim_workflow_state_domain') is not null,
  'Batch 1 workflow domain is available'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'workflow_status'
  ),
  'claims.workflow_status is available for controlled snapshot mutation'
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
    join pg_class r
      on r.oid = c.conrelid
    join pg_namespace n
      on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relname = 'claim_workflow_events'
      and c.conname = 'claim_workflow_events_claim_sequence_uq'
  ),
  'Batch 2 per-Claim workflow event sequence uniqueness exists'
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
      and r.relname = 'claim_workflow_events'
      and c.conname = 'claim_workflow_events_external_identity_uq'
  ),
  'Batch 2 external event identity uniqueness exists'
);

select lives_ok(
  $$
    select 'draft'::public.claim_workflow_state_domain;
    select 'collecting_data'::public.claim_workflow_state_domain;
    select 'validation_pending'::public.claim_workflow_state_domain;
    select 'needs_review'::public.claim_workflow_state_domain;
    select 'ready_to_submit'::public.claim_workflow_state_domain;
    select 'submitted'::public.claim_workflow_state_domain;
    select 'under_review'::public.claim_workflow_state_domain;
    select 'appealed'::public.claim_workflow_state_domain;
    select 'closed'::public.claim_workflow_state_domain;
    select 'cancelled'::public.claim_workflow_state_domain;
  $$,
  'all approved Batch 3 workflow states are accepted by the domain'
);

select is(
  (
    select count(*)::bigint
    from public.permissions
    where permission_key in (
      'claim.update',
      'claim.submit',
      'claim.review',
      'claim.reopen',
      'claim.cancel'
    )
  ),
  5::bigint,
  'all approved Batch 3 transition permission codes exist'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claim_workflow_events'
      and column_name in (
        'from_workflow_status',
        'to_workflow_status',
        'claim_version_before',
        'claim_version_after',
        'sequence_number',
        'source_system',
        'external_event_id',
        'reason_code',
        'reason_text',
        'occurred_at'
      )
    group by table_schema, table_name
    having count(*) = 10
  ),
  'workflow event table stores the evidence required for versioning and idempotency comparison'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.claim_workflow_events',
    'insert'
  ),
  'ordinary authenticated users cannot directly insert workflow events'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.claim_workflow_events',
    'update'
  )
  and not has_table_privilege(
    'authenticated',
    'public.claim_workflow_events',
    'delete'
  ),
  'ordinary authenticated users cannot directly mutate workflow events'
);

select ok(
  case
    when to_regprocedure(
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)',
      'execute'
    )
  end,
  'anonymous role cannot execute controlled workflow mutation'
);

select * from finish();

rollback;
