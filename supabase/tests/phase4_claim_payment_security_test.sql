-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 5: Controlled Claim Payment Settlement Security Tests
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
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'public',
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)',
      'execute'
    )
  end,
  'PUBLIC cannot execute record_claim_payment_settlement'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
    ) is null then false
    else not has_function_privilege(
      'anon',
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)',
      'execute'
    )
  end,
  'anon cannot execute record_claim_payment_settlement'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
    ) is null then false
    else has_function_privilege(
      'authenticated',
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)',
      'execute'
    )
  end,
  'authenticated can execute the controlled payment settlement wrapper'
);

select ok(
  case
    when to_regprocedure(
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
    ) is null then false
    else has_function_privilege(
      'service_role',
      'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)',
      'execute'
    )
  end,
  'service_role can execute the controlled payment settlement wrapper'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and p.prosecdef
  ),
  'record_claim_payment_settlement is SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and p.proconfig @> array['search_path=public, private, auth, pg_temp']
  ),
  'record_claim_payment_settlement has a fixed safe search_path'
);

select ok(
  not has_column_privilege('authenticated', 'public.claims', 'payment_status', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'total_paid_amount', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'version', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_at', 'update')
    and not has_column_privilege('authenticated', 'public.claims', 'state_updated_by', 'update'),
  'authenticated cannot directly update protected payment/version state columns'
);

select ok(
  not has_table_privilege('anon', 'public.claim_payments', 'select')
    and not has_table_privilege('anon', 'public.claim_payments', 'insert')
    and not has_table_privilege('anon', 'public.claim_payments', 'update')
    and not has_table_privilege('anon', 'public.claim_payments', 'delete'),
  'anon has no direct payment table privileges'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_payments', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_payments', 'update')
    and not has_table_privilege('authenticated', 'public.claim_payments', 'delete'),
  'authenticated direct payment writes remain revoked'
);

select ok(
  not has_table_privilege('authenticated', 'public.claim_payment_allocations', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_payment_allocations', 'update')
    and not has_table_privilege('authenticated', 'public.claim_payment_allocations', 'delete')
    and not has_table_privilege('authenticated', 'public.claim_payment_reconciliations', 'insert')
    and not has_table_privilege('authenticated', 'public.claim_payment_reconciliations', 'update')
    and not has_table_privilege('authenticated', 'public.claim_payment_reconciliations', 'delete'),
  'authenticated direct allocation and reconciliation writes remain revoked'
);

select ok(
  exists (
    select 1
    from public.permissions
    where permission_key = 'claim.payment.record'
      and domain = 'claim'
  ),
  'payment recording permission exists'
);

select ok(
  exists (
    select 1
    from public.permissions
    where permission_key = 'claim.payment.reverse'
      and domain = 'claim'
  ),
  'payment reversal permission exists for reversed settlement evidence'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'record_claim_payment_settlement'
      and pg_get_functiondef(p.oid) ilike '%v_required_permission := ''claim.payment.reverse''%'
      and pg_get_functiondef(p.oid) ilike '%public.has_permission(%'
  ),
  'reversed settlement evidence requires claim.payment.reverse through trusted authorization'
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
        'claim.payment.record',
        'claim.payment.allocate',
        'claim.payment.reconcile'
      )
  ),
  'clinical and intake roles cannot authoritatively settle payments'
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
    ) in ('claim_reviewer', 'senior_claim_reviewer')
      and p.permission_key in (
        'claim.payment.record',
        'claim.payment.allocate',
        'claim.payment.reconcile'
      )
  ),
  'claim reviewer roles cannot authoritatively settle payments'
);

select * from finish();

rollback;
