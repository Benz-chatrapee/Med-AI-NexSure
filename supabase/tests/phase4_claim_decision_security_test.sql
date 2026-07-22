-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 4: Controlled Claim Decision Mutation Security Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(12);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'PUBLIC cannot execute record_claim_decision'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'anon cannot execute record_claim_decision'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else has_function_privilege(
      'authenticated',
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'authenticated can execute the controlled decision mutation wrapper'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else has_function_privilege(
      'service_role',
      'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'service_role can execute the controlled decision mutation wrapper'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_decision'
      and p.prosecdef
  ),
  'record_claim_decision is SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_decision'
      and p.proconfig @> array['search_path=public, private, auth, pg_temp']
  ),
  'record_claim_decision has a fixed safe search_path'
);

select ok(
  not has_table_privilege('anon', 'public.claim_decisions', 'select')
    and not has_table_privilege('anon', 'public.claim_decisions', 'insert')
    and not has_table_privilege('anon', 'public.claim_decisions', 'update')
    and not has_table_privilege('anon', 'public.claim_decisions', 'delete'),
  'anon has no direct decision table privileges'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_decisions', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_decisions', 'update')
    and not has_table_privilege('authenticated', 'public.claim_decisions', 'delete'),
  'authenticated direct decision writes remain revoked'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'decision_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'current_decision_id', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'version', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_at', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_by', 'update'),
  'authenticated cannot directly update protected decision/version state columns'
);

select ok(
  exists (
    select count(*) = 3
    from public.permissions
    where permission_key in (
      'claim.decide',
      'claim.decision.supersede',
      'claim.decision.void'
    )
  ),
  'all adjudication permissions required by Batch 4 exist'
);

select ok(
  not exists (
    select 1
    from public.roles r
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where coalesce(
      to_jsonb(r) ->> 'role_code',
      to_jsonb(r) ->> 'role_key',
      to_jsonb(r) ->> 'name'
    ) in ('finance_officer', 'finance_manager')
      and p.permission_key in (
        'claim.decide',
        'claim.decision.supersede',
        'claim.decision.void'
      )
  ),
  'finance roles cannot authoritatively adjudicate claims'
);

select ok(
  not exists (
    select 1
    from public.roles r
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where coalesce(
      to_jsonb(r) ->> 'role_code',
      to_jsonb(r) ->> 'role_key',
      to_jsonb(r) ->> 'name'
    ) in ('doctor', 'nurse', 'pharmacist', 'clinic_staff', 'receptionist')
      and p.permission_key in (
        'claim.decide',
        'claim.decision.supersede',
        'claim.decision.void'
      )
  ),
  'clinical and intake roles cannot authoritatively adjudicate claims'
);

select * from finish();

rollback;
