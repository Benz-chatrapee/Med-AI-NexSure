-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 7: Controlled Claim Refund Lifecycle Security Tests
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(15);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'PUBLIC cannot execute record_claim_refund'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'anon cannot execute record_claim_refund'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else has_function_privilege(
      'authenticated',
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'authenticated can execute the controlled refund wrapper'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)'
    ) is null then false
    else has_function_privilege(
      'service_role',
      'public.record_claim_refund(uuid, uuid, integer, numeric, text, text, timestamptz, text, text, uuid, jsonb)',
      'execute'
    )
  end,
  'service_role can execute the controlled refund wrapper'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and p.prosecdef
  ),
  'record_claim_refund is SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and p.proconfig @> array['search_path=public, private, auth, pg_temp']
  ),
  'record_claim_refund has a fixed safe search_path'
);

select ok(
  exists (
    select 1
    from public.permissions
    where permission_key = 'claim.payment.refund'
      and domain = 'claim'
  ),
  'refund permission exists'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%auth.uid()%'
      and pg_get_functiondef(p.oid) ilike '%v_actor_id is null%'
      and pg_get_functiondef(p.oid) ilike '%Claim refund is not authorized%'
  ),
  'refund mutation derives actor from auth.uid and denies unauthenticated requests'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%public.has_permission(%'
      and pg_get_functiondef(p.oid) ilike '%claim.payment.refund%'
      and pg_get_functiondef(p.oid) ilike '%v_claim.organization_id%'
      and pg_get_functiondef(p.oid) ilike '%v_claim.clinic_id%'
  ),
  'refund mutation authorizes through trusted tenant and clinic scope'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%p.organization_id = v_claim.organization_id%'
      and pg_get_functiondef(p.oid) ilike '%p.clinic_id = v_claim.clinic_id%'
      and pg_get_functiondef(p.oid) ilike '%p.claim_id = v_claim.id%'
  ),
  'refund mutation validates original payment tenant, clinic, and Claim ownership'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'payment_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'total_paid_amount', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'version', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_at', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_by', 'update'),
  'authenticated cannot directly update protected refund summary columns'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_payments', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_payments', 'update')
    and not has_table_privilege('authenticated', 'public.claim_payments', 'delete'),
  'authenticated direct payment and refund evidence writes remain revoked'
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
    ) in ('doctor', 'nurse', 'pharmacist', 'clinic_staff', 'receptionist', 'claim_reviewer', 'senior_claim_reviewer')
      and p.permission_key = 'claim.payment.refund'
  ),
  'clinical, intake, and claim reviewer roles cannot authoritatively refund'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and pg_get_functiondef(p.oid) ilike '%v_source_system <> ''internal''%'
      and pg_get_functiondef(p.oid) ilike '%requires an event identity%'
  ),
  'trusted external refund events require explicit event identity'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_refund'
      and (
        pg_get_functiondef(p.oid) ilike '%raw sql%'
        or pg_get_functiondef(p.oid) ilike '%permission name%'
        or pg_get_functiondef(p.oid) ilike '%patient%'
      )
  ),
  'refund mutation uses sanitized errors without PHI or raw SQL diagnostics'
);

select * from finish();

rollback;
