-- =============================================================================
-- Med AI NexSure
-- Phase 3 Claim Permissions Test
-- File: supabase/tests/phase3_claim_permissions_test.sql
-- =============================================================================
--
-- Scope:
--   - Claim permission catalog
--   - Role-permission mappings
--   - Deny-by-default helper contract
--   - Anonymous and unknown-user denial
--   - Mapping uniqueness and least privilege
--
-- This file does not create permanent fixtures and always rolls back.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;

select plan(26);

-- =============================================================================
-- 1. Schema and helper contract
-- =============================================================================

select has_table(
  'public',
  'permissions',
  'public.permissions exists'
);

select has_table(
  'public',
  'roles',
  'public.roles exists'
);

select has_table(
  'public',
  'role_permissions',
  'public.role_permissions exists'
);

select has_column(
  'public',
  'permissions',
  'permission_key',
  'permissions.permission_key exists'
);

select has_function(
  'public',
  'has_permission',
  array['text', 'uuid', 'uuid'],
  'public.has_permission(text, uuid, uuid) exists'
);

select function_returns(
  'public',
  'has_permission',
  array['text', 'uuid', 'uuid'],
  'boolean',
  'public.has_permission returns boolean'
);

-- =============================================================================
-- 2. Permission seed validation
-- =============================================================================

with expected(permission_key) as (
  values
    ('claim.read'),
    ('claim.create'),
    ('claim.update'),
    ('claim.submit'),
    ('claim.assign'),
    ('claim.review'),
    ('claim.approve'),
    ('claim.reject'),
    ('claim.request_information'),
    ('claim.override'),
    ('claim.reopen'),
    ('claim.cancel'),
    ('claim.export'),
    ('claim.delete'),
    ('claim.decide'),
    ('claim.decision.supersede'),
    ('claim.payment.record'),
    ('claim.payment.allocate'),
    ('claim.payment.reconcile'),
    ('claim.evidence.read'),
    ('claim.evidence.upload'),
    ('claim.evidence.verify'),
    ('claim.clinical.read'),
    ('claim.medical_coding.read'),
    ('claim.medical_coding.update'),
    ('claim.fraud.read'),
    ('claim.fraud.review'),
    ('claim.fraud.override'),
    ('claim.cost.read'),
    ('claim.cost.review'),
    ('claim.cost.override'),
    ('claim.audit.read'),
    ('claim.audit.export')
)
select is(
  (
    select count(*)::bigint
    from expected e
    join public.permissions p
      on p.permission_key = e.permission_key
  ),
  33::bigint,
  'all 33 required Phase 3 claim permissions exist'
);

select is(
  (
    select count(*)::bigint
    from public.permissions p
    where p.permission_key is null
       or btrim(p.permission_key) = ''
  ),
  0::bigint,
  'permission keys are not null or empty'
);

select is(
  (
    select count(*)::bigint
    from (
      select lower(p.permission_key)
      from public.permissions p
      where p.permission_key like 'claim.%'
      group by lower(p.permission_key)
      having count(*) > 1
    ) duplicates
  ),
  0::bigint,
  'claim permission keys are unique case-insensitively'
);

select is(
  (
    select count(*)::bigint
    from (
      select rp.role_id, rp.permission_id
      from public.role_permissions rp
      group by rp.role_id, rp.permission_id
      having count(*) > 1
    ) duplicates
  ),
  0::bigint,
  'role-permission mappings are unique'
);

select is(
  (
    select count(*)::bigint
    from public.permissions p
    where p.permission_key like 'claim.%'
      and nullif(btrim(p.description), '') is null
  ),
  0::bigint,
  'claim permissions have non-empty descriptions'
);

-- =============================================================================
-- 3. Positive role mappings
-- Optional roles are intentionally not asserted here because the production
-- migration maps permissions only to roles that already exist at migration time.
-- Their mappings should be validated in fixture-specific integration tests.
-- Role identifiers follow the production migration contract:
-- role_code when present, otherwise role_key.
-- =============================================================================

select ok(
  exists (
    select 1
    from public.roles r
    join public.role_permissions rp
      on rp.role_id = r.id
    join public.permissions p
      on p.id = rp.permission_id
    where coalesce(
        to_jsonb(r) ->> 'role_code',
        to_jsonb(r) ->> 'role_key',
        to_jsonb(r) ->> 'name'
      ) = 'claim_reviewer'
      and p.permission_key = 'claim.review'
  ),
  'claim_reviewer has claim.review'
);

select ok(
  exists (
    select 1
    from public.roles r
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where coalesce(
        to_jsonb(r) ->> 'role_code',
        to_jsonb(r) ->> 'role_key',
        to_jsonb(r) ->> 'name'
      ) = 'auditor'
      and p.permission_key = 'claim.audit.read'
  ),
  'auditor has claim.audit.read'
);

-- =============================================================================
-- 4. Negative role mappings and separation of duties
-- =============================================================================

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
      ) = 'clinic_staff'
      and p.permission_key in (
        'claim.approve',
        'claim.reject',
        'claim.override',
        'claim.fraud.override',
        'claim.cost.override'
      )
  ),
  'clinic_staff cannot approve, reject, or override claims'
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
      ) = 'doctor'
      and p.permission_key in (
        'claim.approve',
        'claim.reject',
        'claim.override'
      )
  ),
  'doctor cannot make final claim decisions'
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
      ) = 'claim_reviewer'
      and p.permission_key in (
        'claim.payment.record',
        'claim.payment.allocate',
        'claim.payment.reconcile'
      )
  ),
  'claim_reviewer cannot execute payment operations'
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
        'claim.approve',
        'claim.reject',
        'claim.decide',
        'claim.decision.supersede'
      )
  ),
  'finance roles cannot finalize claim decisions'
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
      ) = 'auditor'
      and p.permission_key in (
        'claim.create',
        'claim.update',
        'claim.submit',
        'claim.approve',
        'claim.reject',
        'claim.override',
        'claim.delete'
      )
  ),
  'auditor remains read-only'
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
      ) = 'organization_admin'
      and p.permission_key in (
        'claim.approve',
        'claim.reject',
        'claim.override'
      )
  ),
  'organization_admin does not receive final-decision permissions automatically'
);

-- =============================================================================
-- 5. Anonymous, unknown user, and invalid-input denial
-- =============================================================================

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);

select is(
  public.has_permission(
    'claim.read',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'anonymous user cannot use claim.read'
);

select is(
  public.has_permission(
    'claim.approve',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'anonymous user cannot use claim.approve'
);

select set_config(
  'request.jwt.claim.sub',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  public.has_permission(
    'claim.read',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown authenticated user cannot use claim.read'
);

select is(
  public.has_permission(
    'claim.approve',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown authenticated user cannot use claim.approve'
);

select is(
  public.has_permission(
    'claim.permission_that_does_not_exist',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'unknown claim permission returns false'
);

select is(
  public.has_permission(
    null,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'null permission key returns false'
);

select is(
  public.has_permission(
    '',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid
  ),
  false,
  'empty permission key returns false'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);

select * from finish();

rollback;
