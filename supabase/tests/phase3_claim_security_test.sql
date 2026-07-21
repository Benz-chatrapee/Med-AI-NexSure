-- =============================================================================
-- Med AI NexSure
-- Phase 3 Claim Security Test
-- File: supabase/tests/phase3_claim_security_test.sql
-- =============================================================================
--
-- Security focus:
--   - deny by default
--   - RLS enabled on existing Phase 3 claim tables
--   - no unconditional authenticated policies
--   - anonymous and unknown-user denial through JWT-aware helpers
--   - no direct authenticated DELETE on claim tables
--   - server-only mutation boundaries
--   - append-only audit protection
--
-- Fixture-dependent cross-tenant, cross-clinic, assignment, workflow, and
-- self-approval scenarios belong in phase3_claim_fixtures-backed tests.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;

select plan(29);

-- =============================================================================
-- 1. Temporary JWT authentication helpers
-- These helpers intentionally do not SET ROLE. Effective row-filtering tests
-- require fixture-backed scenarios and are maintained separately.
-- =============================================================================

create or replace function pg_temp.set_authenticated_user(
  p_auth_user_id uuid
)
returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claim.sub',
    p_auth_user_id::text,
    true
  );

  perform set_config(
    'request.jwt.claim.role',
    'authenticated',
    true
  );
end;
$$;

create or replace function pg_temp.reset_auth()
returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claim.sub',
    '',
    true
  );

  perform set_config(
    'request.jwt.claim.role',
    'anon',
    true
  );
end;
$$;

-- =============================================================================
-- 2. Core security objects
-- =============================================================================

select has_table(
  'public',
  'claims',
  'public.claims exists'
);

select has_table(
  'public',
  'audit_logs',
  'public.audit_logs exists'
);

select has_function(
  'public',
  'has_permission',
  array['text', 'uuid', 'uuid'],
  'public.has_permission(text, uuid, uuid) exists'
);

select has_function(
  'private',
  'claim_has_permission',
  array['text', 'uuid', 'uuid'],
  'private.claim_has_permission(text, uuid, uuid) exists'
);

select function_returns(
  'private',
  'claim_has_permission',
  array['text', 'uuid', 'uuid'],
  'boolean',
  'private.claim_has_permission returns boolean'
);

-- =============================================================================
-- 3. RLS configuration
-- =============================================================================

select ok(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claims'
  ),
  'RLS is enabled on public.claims'
);

select ok(
  not exists (
    select distinct
      p.schemaname,
      p.tablename
    from pg_policies p
    join pg_class c
      on c.relname = p.tablename
    join pg_namespace n
      on n.oid = c.relnamespace
     and n.nspname = p.schemaname
    where p.schemaname = 'public'
      and p.tablename like 'claim%'
      and 'authenticated' = any(p.roles)
      and not c.relrowsecurity
  ),
  'claim tables with authenticated policies have RLS enabled'
);

select ok(
  exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and p.cmd = 'SELECT'
      and 'authenticated' = any(p.roles)
  ),
  'public.claims has an authenticated SELECT policy'
);

select ok(
  exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and p.cmd = 'INSERT'
      and 'authenticated' = any(p.roles)
  ),
  'public.claims has an authenticated INSERT policy'
);

select ok(
  exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and p.cmd = 'UPDATE'
      and 'authenticated' = any(p.roles)
  ),
  'public.claims has an authenticated UPDATE policy'
);

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename like 'claim%'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(lower(btrim(p.qual)), '') in ('true', '(true)')
        or coalesce(lower(btrim(p.with_check)), '') in ('true', '(true)')
      )
  ),
  'no authenticated claim policy uses unconditional true'
);

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename like 'claim%'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(lower(p.qual), '') = 'auth.role() = ''authenticated''::text'
        or coalesce(lower(p.with_check), '') = 'auth.role() = ''authenticated''::text'
      )
  ),
  'no claim policy authorizes only by auth.role()'
);

-- =============================================================================
-- 4. Anonymous and unknown-user denial
-- =============================================================================

select pg_temp.reset_auth();

select is(
  private.claim_has_permission(
    'claim.read',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'anonymous user has no claim.read permission'
);

select is(
  private.claim_has_permission(
    'claim.approve',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'anonymous user has no claim.approve permission'
);

select pg_temp.set_authenticated_user(
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

select is(
  private.claim_has_permission(
    'claim.read',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown authenticated user has no claim.read permission'
);

select is(
  private.claim_has_permission(
    'claim.approve',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown authenticated user has no claim.approve permission'
);

select is(
  private.claim_has_permission(
    'claim.permission_that_does_not_exist',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown claim permission returns false'
);

select pg_temp.reset_auth();

-- =============================================================================
-- 5. Table grant boundaries
-- =============================================================================

select ok(
  not has_table_privilege(
    'anon',
    'public.claims',
    'select'
  ),
  'anon has no SELECT privilege on public.claims'
);

select ok(
  not has_table_privilege(
    'anon',
    'public.claims',
    'insert'
  ),
  'anon has no INSERT privilege on public.claims'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.claims',
    'delete'
  ),
  'authenticated cannot physically delete claims'
);

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname like 'claim%'
      and c.relkind in ('r', 'p')
      and has_table_privilege(
        'authenticated',
        format('public.%I', c.relname),
        'delete'
      )
  ),
  'authenticated has no DELETE privilege on any claim table'
);

select ok(
  not exists (
    select 1
    from (
      values
        ('claim_decisions'),
        ('claim_decision_adjustments'),
        ('claim_payments'),
        ('claim_payment_allocations'),
        ('claim_payment_reconciliations'),
        ('claim_validation_runs'),
        ('claim_validation_results'),
        ('claim_ai_assessments'),
        ('claim_ai_risk_signals'),
        ('claim_ai_explanations')
    ) protected(table_name)
    where to_regclass(format('public.%I', protected.table_name)) is not null
      and (
        has_table_privilege(
          'authenticated',
          format('public.%I', protected.table_name),
          'insert'
        )
        or has_table_privilege(
          'authenticated',
          format('public.%I', protected.table_name),
          'update'
        )
        or has_table_privilege(
          'authenticated',
          format('public.%I', protected.table_name),
          'delete'
        )
      )
  ),
  'authenticated has no direct mutation privilege on server-only claim tables'
);

-- =============================================================================
-- 6. Audit security and append-only behavior
-- =============================================================================

select ok(
  not has_table_privilege(
    'anon',
    'public.audit_logs',
    'select'
  ),
  'anon has no SELECT privilege on public.audit_logs'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'insert'
  ),
  'authenticated cannot directly insert audit records'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'update'
  ),
  'authenticated cannot update audit records'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'delete'
  ),
  'authenticated cannot delete audit records'
);

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'audit_logs'
      and 'authenticated' = any(p.roles)
      and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'audit_logs has no authenticated mutation policy'
);

-- =============================================================================
-- 7. Internal helper execution boundary
-- =============================================================================

select ok(
  not has_function_privilege(
    'anon',
    'private.claim_has_permission(text,uuid,uuid)',
    'execute'
  ),
  'anon cannot execute private.claim_has_permission'
);

select ok(
  has_function_privilege(
    'authenticated',
    'private.claim_has_permission(text,uuid,uuid)',
    'execute'
  ),
  'authenticated can execute the RLS-safe claim permission helper'
);

select pg_temp.reset_auth();

select * from finish();

rollback;
