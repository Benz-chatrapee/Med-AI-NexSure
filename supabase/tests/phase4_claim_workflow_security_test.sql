-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 3: Controlled Claim Workflow Mutation Security Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(10);

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
  'controlled workflow function exists before security execution checks'
);

select ok(
  case
    when to_regprocedure(
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)',
      'execute'
    )
  end,
  'PUBLIC cannot execute transition_claim_workflow'
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
  'anon cannot execute transition_claim_workflow'
);

select ok(
  case
    when to_regprocedure(
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
    ) is null then false
    else has_function_privilege(
      'authenticated',
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)',
      'execute'
    )
  end,
  'authenticated may execute only the controlled function path'
);

select ok(
  case
    when to_regprocedure(
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)'
    ) is null then false
    else has_function_privilege(
      'service_role',
      'public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)',
      'execute'
    )
  end,
  'service_role may execute the controlled function path'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_workflow_events', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_workflow_events', 'update')
    and not has_table_privilege('authenticated', 'public.claim_workflow_events', 'delete'),
  'authenticated users cannot bypass the function by writing workflow events directly'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'workflow_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'version', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_at', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_by', 'update'),
  'authenticated users cannot directly update protected workflow snapshot columns'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'transition_claim_workflow'
      and p.prosecdef
  ),
  'transition_claim_workflow is SECURITY DEFINER for controlled event insertion'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'transition_claim_workflow'
      and array_to_string(p.proconfig, ',') like '%search_path=public, private, auth, pg_temp%'
  ),
  'transition_claim_workflow has a fixed safe search_path'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c
      on c.oid = p.polrelid
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claim_workflow_events'
      and p.polcmd = 'r'
  ),
  'workflow history remains readable only through RLS select policy'
);

select * from finish();

rollback;
