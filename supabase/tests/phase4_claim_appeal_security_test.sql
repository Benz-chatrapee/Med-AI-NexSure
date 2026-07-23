-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 6: Formal Claim Appeal Security Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(16);

select ok(
  case
    when to_regprocedure(
      'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'PUBLIC cannot execute submit_claim_appeal'
);

select ok(
  case
    when to_regprocedure(
      'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'PUBLIC cannot execute resolve_claim_appeal'
);

select ok(
  case
    when to_regprocedure(
      'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'anon cannot execute submit_claim_appeal'
);

select ok(
  case
    when to_regprocedure(
      'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'anon cannot execute resolve_claim_appeal'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)',
    'execute'
  )
    and has_function_privilege(
      'service_role',
      'public.submit_claim_appeal(uuid, integer, text, text, timestamptz, uuid, text, uuid, text, text, uuid, jsonb)',
      'execute'
    ),
  'authenticated and service_role can execute submit_claim_appeal'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)',
    'execute'
  )
    and has_function_privilege(
      'service_role',
      'public.resolve_claim_appeal(uuid, integer, text, text, text, uuid, timestamptz, text, text, uuid, jsonb)',
      'execute'
    ),
  'authenticated and service_role can execute resolve_claim_appeal'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('submit_claim_appeal', 'resolve_claim_appeal')
      and p.prosecdef
    group by n.nspname
    having count(*) = 2
  ),
  'appeal functions are SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('submit_claim_appeal', 'resolve_claim_appeal')
      and p.proconfig @> array['search_path=public, private, auth, pg_temp']
    group by n.nspname
    having count(*) = 2
  ),
  'appeal functions have a fixed safe search_path'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claim_appeals'
      and c.relrowsecurity
  ),
  'RLS is enabled on claim_appeals'
);

select ok(
  not has_table_privilege('anon', 'public.claim_appeals', 'select')
    and not has_table_privilege('anon', 'public.claim_appeals', 'insert')
    and not has_table_privilege('anon', 'public.claim_appeals', 'update')
    and not has_table_privilege('anon', 'public.claim_appeals', 'delete'),
  'anon has no direct appeal table privileges'
);

select ok(
  has_table_privilege('authenticated', 'public.claim_appeals', 'select')
    and not has_table_privilege('authenticated', 'public.claim_appeals', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_appeals', 'update')
    and not has_table_privilege('authenticated', 'public.claim_appeals', 'delete'),
  'authenticated can read authorized appeals but cannot directly mutate them'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'workflow_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'decision_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'payment_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'version', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_at', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_by', 'update'),
  'appeal permissions do not grant direct protected Claim-state updates'
);

select ok(
  exists (
    select 1
    from public.permissions
    where permission_key in (
      'claim.appeal.view',
      'claim.appeal.create',
      'claim.appeal.submit',
      'claim.appeal.decide'
    )
    group by domain
    having count(*) = 4
      and domain = 'claim'
  ),
  'Batch 6 appeal permissions exist in the claim domain'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%''claim.appeal.submit''%'
      and pg_get_functiondef(p.oid) ilike '%public.has_permission(%'
  ),
  'submit_claim_appeal requires claim.appeal.submit through trusted authorization'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'resolve_claim_appeal'
      and pg_get_functiondef(p.oid) ilike '%''claim.appeal.decide''%'
      and pg_get_functiondef(p.oid) ilike '%public.has_permission(%'
  ),
  'resolve_claim_appeal requires claim.appeal.decide through trusted authorization'
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
      and p.permission_key in ('claim.appeal.submit', 'claim.appeal.decide')
  ),
  'clinical and intake roles cannot submit or decide formal appeals'
);

select * from finish();

rollback;
