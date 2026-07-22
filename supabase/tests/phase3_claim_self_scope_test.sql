-- =============================================================================
-- Med AI NexSure
-- Phase 3 Claim Tenant Isolation Self-Scoped Integration Test
-- File: supabase/tests/phase3_claim_self_scope_test_COMPLETE.sql
-- =============================================================================
--
-- Purpose:
--   Prove self-scoped Claim access with self-contained, test-scoped fixtures.
--
-- Fixture model:
--   Organization A
--     - Clinic A1
--     - Clinic A2
--     - User A1 scoped to Clinic A1
--     - User A2 scoped to Clinic A1 (second persona)
--     - Claim A1 in Clinic A1
--     - Claim A2 in Clinic A2
--
--   Organization B
--     - Clinic B1
--     - User B1 scoped to Clinic B1
--     - Claim B1 in Clinic B1
--
-- Security properties:
--   - fixtures are created inside this pgTAP transaction
--   - no production seed dependency
--   - no permanent test data
--   - no service_role bypass
--   - RLS assertions execute as authenticated
--   - transaction rolls back on completion
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(45);

-- =============================================================================
-- 1. Static schema and security contracts
-- =============================================================================

select has_table(
  'public',
  'claims',
  'public.claims exists'
);

select has_function(
  'public',
  'has_permission',
  array['text', 'uuid', 'uuid'],
  'public.has_permission(text, uuid, uuid) exists'
);

select has_function(
  'private',
  'claim_can_read',
  array['uuid', 'uuid', 'uuid', 'text', 'boolean'],
  'private.claim_can_read(uuid, uuid, uuid, text, boolean) exists'
);

select ok(
  exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and p.policyname = 'claims_select_authorized'
      and p.cmd = 'SELECT'
      and 'authenticated' = any(p.roles)
  ),
  'Authenticated claims SELECT policy exists'
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
  'Authenticated claims UPDATE policy exists'
);

select is(
  (
    select count(*)::bigint
    from public.permissions p
    where p.permission_key in (
      'claim.read',
      'claim.update',
      'claim.audit.read'
    )
  ),
  3::bigint,
  'Required claim.read, claim.update, and claim.audit.read permissions exist'
);

select ok(
  coalesce(
    (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n
        on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'claims'
    ),
    false
  ),
  'RLS is enabled on public.claims'
);

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(
          lower(regexp_replace(p.qual, '\s+', '', 'g')),
          ''
        ) in ('true', '(true)')
        or
        coalesce(
          lower(regexp_replace(p.with_check, '\s+', '', 'g')),
          ''
        ) in ('true', '(true)')
      )
  ),
  'claims has no unconditional authenticated RLS policy'
);

select ok(
  exists (
    select 1
    from public.claim_types
  ),
  'claim type reference data exists for test-scoped claim fixtures'
);

-- =============================================================================
-- 2. Temporary authentication and mutation helpers
-- =============================================================================

create or replace function pg_temp.set_auth_user(
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

create or replace function pg_temp.claim_can_read_as_system(
  p_claim_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_permission_key text,
  p_is_deleted boolean
)
returns boolean
language sql
stable
security definer
set search_path = private, public, pg_temp
as $$
  select private.claim_can_read(
    p_claim_id,
    p_organization_id,
    p_clinic_id,
    p_permission_key,
    p_is_deleted
  );
$$;

create or replace function pg_temp.try_update_claim_amount(
  p_claim_id uuid,
  p_amount numeric
)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_affected integer := 0;
begin
  update public.claims
  set total_claimed_amount = p_amount
  where id = p_claim_id;

  get diagnostics v_affected = row_count;
  return v_affected;
exception
  when insufficient_privilege then
    return 0;
  when check_violation then
    return 0;
end;
$$;

create or replace function pg_temp.try_touch_claim(
  p_claim_id uuid
)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_affected integer := 0;
begin
  update public.claims
  set updated_at = updated_at
  where id = p_claim_id;

  get diagnostics v_affected = row_count;
  return v_affected;
exception
  when insufficient_privilege then
    return 0;
end;
$$;

-- =============================================================================
-- 3. Test-scoped fixture constants
-- =============================================================================

create temporary table tenant_test_context (
  organization_a_id uuid not null,
  organization_b_id uuid not null,
  clinic_a1_id uuid not null,
  clinic_a2_id uuid not null,
  clinic_b1_id uuid not null,
  user_a1_id uuid not null,
  user_a2_id uuid not null,
  user_b1_id uuid not null,
  patient_a1_id uuid not null,
  patient_a2_id uuid not null,
  patient_b1_id uuid not null,
  visit_a1_id uuid not null,
  visit_a2_id uuid not null,
  visit_b1_id uuid not null,
  claim_a1_id uuid not null,
  claim_a2_id uuid not null,
  claim_b1_id uuid not null,
  claim_self_final_id uuid not null,
  claim_self_deleted_id uuid not null,
  claim_type_code text not null,
  claim_reader_role_id uuid not null
) on commit drop;

insert into tenant_test_context (
  organization_a_id,
  organization_b_id,
  clinic_a1_id,
  clinic_a2_id,
  clinic_b1_id,
  user_a1_id,
  user_a2_id,
  user_b1_id,
  patient_a1_id,
  patient_a2_id,
  patient_b1_id,
  visit_a1_id,
  visit_a2_id,
  visit_b1_id,
  claim_a1_id,
  claim_a2_id,
  claim_b1_id,
  claim_self_final_id,
  claim_self_deleted_id,
  claim_type_code,
  claim_reader_role_id
)
select
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000001'::uuid,
  '72000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000003'::uuid,
  '73000000-0000-4000-8000-000000000001'::uuid,
  '73000000-0000-4000-8000-000000000002'::uuid,
  '73000000-0000-4000-8000-000000000003'::uuid,
  '74000000-0000-4000-8000-000000000001'::uuid,
  '74000000-0000-4000-8000-000000000002'::uuid,
  '74000000-0000-4000-8000-000000000003'::uuid,
  '75000000-0000-4000-8000-000000000001'::uuid,
  '75000000-0000-4000-8000-000000000002'::uuid,
  '75000000-0000-4000-8000-000000000003'::uuid,
  '76000000-0000-4000-8000-000000000001'::uuid,
  '76000000-0000-4000-8000-000000000002'::uuid,
  '76000000-0000-4000-8000-000000000003'::uuid,
  '76000000-0000-4000-8000-000000000004'::uuid,
  '76000000-0000-4000-8000-000000000005'::uuid,
  (
    select ct.code
    from public.claim_types ct
    order by ct.code
    limit 1
  ),
  (
    select r.id
    from public.roles r
    where coalesce(
            (to_jsonb(r) ->> 'is_active')::boolean,
            true
          )
      and to_jsonb(r) ->> 'deleted_at' is null
      and exists (
        select 1
        from public.role_permissions rp
        join public.permissions p
          on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.read'
      )
      and exists (
        select 1
        from public.role_permissions rp
        join public.permissions p
          on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.update'
      )
      and not exists (
        select 1
        from public.role_permissions rp
        join public.permissions p
          on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.audit.read'
      )
    order by
      case coalesce(
        to_jsonb(r) ->> 'role_code',
        to_jsonb(r) ->> 'role_key',
        to_jsonb(r) ->> 'name'
      )
        when 'clinic_staff' then 1
        when 'doctor' then 2
        when 'nurse' then 3
        else 10
      end,
      r.id
    limit 1
  );

-- =============================================================================
-- 4. Test-scoped tenant, identity, membership, and RBAC fixtures
-- =============================================================================

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    (select user_a1_id from tenant_test_context),
    'authenticated',
    'authenticated',
    'phase3.tenant.a1@example.invalid',
    crypt('LocalTest!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Phase 3 Tenant User A1"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    (select user_a2_id from tenant_test_context),
    'authenticated',
    'authenticated',
    'phase3.tenant.a2@example.invalid',
    crypt('LocalTest!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Phase 3 Tenant User A2"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    (select user_b1_id from tenant_test_context),
    'authenticated',
    'authenticated',
    'phase3.tenant.b1@example.invalid',
    crypt('LocalTest!2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Phase 3 Tenant User B1"}'::jsonb,
    now(),
    now()
  );

insert into public.organizations (
  id,
  code,
  name,
  organization_type,
  lifecycle_status,
  is_active
)
values
  (
    (select organization_a_id from tenant_test_context),
    'PH3-TENANT-ORG-A',
    'Phase 3 Tenant Test Organization A',
    'healthcare_provider',
    'active',
    true
  ),
  (
    (select organization_b_id from tenant_test_context),
    'PH3-TENANT-ORG-B',
    'Phase 3 Tenant Test Organization B',
    'healthcare_provider',
    'active',
    true
  );

insert into public.clinics (
  id,
  organization_id,
  code,
  name,
  clinic_type,
  lifecycle_status,
  is_active
)
values
  (
    (select clinic_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    'PH3-TENANT-A1',
    'Phase 3 Tenant Clinic A1',
    'clinic',
    'active',
    true
  ),
  (
    (select clinic_a2_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    'PH3-TENANT-A2',
    'Phase 3 Tenant Clinic A2',
    'clinic',
    'active',
    true
  ),
  (
    (select clinic_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    'PH3-TENANT-B1',
    'Phase 3 Tenant Clinic B1',
    'clinic',
    'active',
    true
  );

insert into public.user_profiles (
  id,
  organization_id,
  primary_clinic_id,
  display_name,
  email,
  job_title,
  department,
  is_active
)
values
  (
    (select user_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'Phase 3 Tenant User A1',
    'phase3.tenant.a1@example.invalid',
    'Claim Reader and Updater',
    'Claims',
    true
  ),
  (
    (select user_a2_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'Phase 3 Tenant User A2',
    'phase3.tenant.a2@example.invalid',
    'Clinic Claim Reader and Updater',
    'Claims',
    true
  ),
  (
    (select user_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    'Phase 3 Tenant User B1',
    'phase3.tenant.b1@example.invalid',
    'Claim Reader and Updater',
    'Claims',
    true
  );

insert into public.organization_memberships (
  organization_id,
  user_profile_id,
  membership_status
)
values
  (
    (select organization_a_id from tenant_test_context),
    (select user_a1_id from tenant_test_context),
    'active'
  ),
  (
    (select organization_a_id from tenant_test_context),
    (select user_a2_id from tenant_test_context),
    'active'
  ),
  (
    (select organization_b_id from tenant_test_context),
    (select user_b1_id from tenant_test_context),
    'active'
  );

insert into public.clinic_memberships (
  organization_id,
  clinic_id,
  user_profile_id
)
values
  (
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context)
  ),
  (
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    (select user_a2_id from tenant_test_context)
  ),
  (
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    (select user_b1_id from tenant_test_context)
  );

insert into public.user_role_assignments (
  id,
  organization_id,
  clinic_id,
  user_profile_id,
  role_id,
  assignment_status,
  assignment_reason,
  assigned_at
)
values
  (
    '77000000-0000-4000-8000-000000000001',
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context),
    (select claim_reader_role_id from tenant_test_context),
    'active',
    'Phase 3 self-scope User A1 with claim.read and claim.update',
    now()
  ),
  (
    '77000000-0000-4000-8000-000000000002',
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    (select user_a2_id from tenant_test_context),
    (select claim_reader_role_id from tenant_test_context),
    'active',
    'Phase 3 self-scope User A2 with claim.read and claim.update',
    now()
  ),
  (
    '77000000-0000-4000-8000-000000000003',
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    (select user_b1_id from tenant_test_context),
    (select claim_reader_role_id from tenant_test_context),
    'active',
    'Phase 3 self-scope User B1 with claim.read and claim.update',
    now()
  );

-- =============================================================================
-- 5. Test-scoped patient, visit, and claim fixtures
-- =============================================================================

insert into public.patients (
  id,
  organization_id,
  clinic_id,
  patient_code,
  display_label,
  consent_status,
  date_of_birth,
  sex_at_birth,
  is_active
)
values
  (
    (select patient_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'PH3-TENANT-A1',
    'Phase 3 Tenant Patient A1',
    'granted',
    '1985-01-01',
    'female',
    true
  ),
  (
    (select patient_a2_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a2_id from tenant_test_context),
    'PH3-TENANT-A2',
    'Phase 3 Tenant Patient A2',
    'granted',
    '1986-02-02',
    'male',
    true
  ),
  (
    (select patient_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    'PH3-TENANT-B1',
    'Phase 3 Tenant Patient B1',
    'granted',
    '1987-03-03',
    'female',
    true
  );

insert into public.visits (
  id,
  organization_id,
  clinic_id,
  patient_id,
  visit_number,
  department,
  visit_status,
  is_active
)
values
  (
    (select visit_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    (select patient_a1_id from tenant_test_context),
    'VN-PH3-TENANT-A1',
    'General Medicine',
    'in_consultation',
    true
  ),
  (
    (select visit_a2_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a2_id from tenant_test_context),
    (select patient_a2_id from tenant_test_context),
    'VN-PH3-TENANT-A2',
    'General Medicine',
    'in_consultation',
    true
  ),
  (
    (select visit_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    (select patient_b1_id from tenant_test_context),
    'VN-PH3-TENANT-B1',
    'General Medicine',
    'in_consultation',
    true
  );

insert into public.claims (
  id,
  organization_id,
  clinic_id,
  claim_number,
  claim_type_code,
  patient_id,
  visit_id,
  status,
  service_start_date,
  submitted_at,
  total_claimed_amount,
  total_eligible_amount,
  total_approved_amount,
  created_by,
  updated_by
)
values
  (
    (select claim_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'PH3-TENANT-CLAIM-A1',
    (select claim_type_code from tenant_test_context),
    (select patient_a1_id from tenant_test_context),
    (select visit_a1_id from tenant_test_context),
    'draft',
    current_date,
    null,
    1000.00,
    null,
    null,
    (select user_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context)
  ),
  (
    (select claim_a2_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a2_id from tenant_test_context),
    'PH3-TENANT-CLAIM-A2',
    (select claim_type_code from tenant_test_context),
    (select patient_a2_id from tenant_test_context),
    (select visit_a2_id from tenant_test_context),
    'draft',
    current_date,
    null,
    2000.00,
    null,
    null,
    (select user_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context)
  ),
  (
    (select claim_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    'PH3-TENANT-CLAIM-B1',
    (select claim_type_code from tenant_test_context),
    (select patient_b1_id from tenant_test_context),
    (select visit_b1_id from tenant_test_context),
    'draft',
    current_date,
    null,
    3000.00,
    null,
    null,
    (select user_b1_id from tenant_test_context),
    (select user_b1_id from tenant_test_context)
  ),
  (
    (select claim_self_final_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'PH3-SELF-FINAL-A1',
    (select claim_type_code from tenant_test_context),
    (select patient_a1_id from tenant_test_context),
    (select visit_a1_id from tenant_test_context),
    'approved',
    current_date,
    now(),
    4000.00,
    4000.00,
    4000.00,
    (select user_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context)
  ),
  (
    (select claim_self_deleted_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'PH3-SELF-DELETED-A1',
    (select claim_type_code from tenant_test_context),
    (select patient_a1_id from tenant_test_context),
    (select visit_a1_id from tenant_test_context),
    'draft',
    current_date,
    null,
    5000.00,
    null,
    null,
    (select user_a1_id from tenant_test_context),
    (select user_a1_id from tenant_test_context)
  );

update public.claims
set deleted_at = now(),
    deleted_by = (select user_a1_id from tenant_test_context)
where id = (select claim_self_deleted_id from tenant_test_context);

grant select on tenant_test_context to authenticated;

-- =============================================================================
-- 6. Fixture contract assertions
-- =============================================================================

select is(
  (
    select count(*)::bigint
    from public.claims
    where id in (
      select claim_a1_id from tenant_test_context
      union all
      select claim_a2_id from tenant_test_context
      union all
      select claim_b1_id from tenant_test_context
      union all
      select claim_self_final_id from tenant_test_context
      union all
      select claim_self_deleted_id from tenant_test_context
    )
  ),
  5::bigint,
  'self-scoped test transaction created five deterministic claims'
);

select ok(
  (select claim_reader_role_id is not null from tenant_test_context),
  'self-scoped test resolved an active role with claim.read and claim.update but without claim.audit.read'
);

select is(
  (
    select count(*)::bigint
    from public.user_role_assignments
    where id in (
      '77000000-0000-4000-8000-000000000001'::uuid,
      '77000000-0000-4000-8000-000000000002'::uuid,
      '77000000-0000-4000-8000-000000000003'::uuid
    )
      and assignment_status = 'active'
  ),
  3::bigint,
  'three active claim reader and updater assignments exist for self-scope personas'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where created_by = (select user_a1_id from tenant_test_context)
      and clinic_id = (select clinic_a1_id from tenant_test_context)
  ),
  3::bigint,
  'Creator A owns draft, finalized, and soft-deleted self claims'
);

-- =============================================================================
-- 7. Anonymous and unknown users
-- =============================================================================

select ok(
  not has_table_privilege(
    'anon',
    'public.claims',
    'select'
  ),
  'anonymous user has no direct self-scope access to claims'
);

select pg_temp.set_auth_user(
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

set local role authenticated;

select is(
  current_user,
  'authenticated',
  'unknown-user self-scope assertion runs as authenticated'
);

select is(
  auth.uid(),
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  'unknown authenticated JWT resolves to the expected UUID'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
  ),
  0::bigint,
  'unknown authenticated user has no self access to Creator A claim'
);

reset role;

-- =============================================================================
-- 8. Creator A: own draft claim
-- =============================================================================

select pg_temp.set_auth_user(
  (select user_a1_id from tenant_test_context)
);

set local role authenticated;

select is(
  current_user,
  'authenticated',
  'Creator A self-scope query runs as authenticated'
);

select is(
  auth.uid(),
  (select user_a1_id from tenant_test_context),
  'Creator A JWT resolves to the fixture actor'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
      and created_by = auth.uid()
  ),
  1::bigint,
  'Creator A can read own draft claim in Clinic A1'
);

select ok(
  pg_temp.claim_can_read_as_system(
    (select claim_a1_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'claim.read',
    false
  ),
  'Creator A claim_can_read agrees with RLS for own active Clinic A1 claim'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_a1_id from tenant_test_context),
    1111.00
  ),
  1,
  'Creator A can update own editable draft claim'
);

select is(
  (
    select total_claimed_amount
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
  ),
  1111.00::numeric,
  'Creator A own-claim update persists inside the test transaction'
);

-- =============================================================================
-- 9. Other user outside Creator A clinic scope
-- =============================================================================

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a2_id from tenant_test_context)
  ),
  0::bigint,
  'Creator A cannot read another user claim outside Clinic A1 scope'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_a2_id from tenant_test_context),
    2222.00
  ),
  0,
  'Creator A cannot update another user claim outside Clinic A1 scope'
);

-- =============================================================================
-- 10. Cross-organization and cross-clinic denial
-- =============================================================================

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_b1_id from tenant_test_context)
  ),
  0::bigint,
  'self ownership does not bypass Organization B isolation'
);

select ok(
  not pg_temp.claim_can_read_as_system(
    (select claim_b1_id from tenant_test_context),
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context),
    'claim.read',
    false
  ),
  'Creator A claim_can_read denies Organization B active claim'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_b1_id from tenant_test_context),
    3333.00
  ),
  0,
  'Creator A cannot update Organization B claim'
);

select ok(
  not public.has_permission(
    'claim.read',
    (select organization_b_id from tenant_test_context),
    (select clinic_b1_id from tenant_test_context)
  ),
  'claim.read capability does not bypass foreign organization scope'
);

select ok(
  not public.has_permission(
    'claim.read',
    (select organization_a_id from tenant_test_context),
    (select clinic_a2_id from tenant_test_context)
  ),
  'claim.read capability does not bypass Clinic A2 scope'
);

-- =============================================================================
-- 11. Immutable and soft-deleted self records
-- =============================================================================

select is(
  pg_temp.try_update_claim_amount(
    (select claim_self_final_id from tenant_test_context),
    4444.00
  ),
  0,
  'Creator A cannot update own finalized claim'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_self_deleted_id from tenant_test_context)
  ),
  0::bigint,
  'Creator A cannot read own soft-deleted claim through normal RLS'
);

select ok(
  not pg_temp.claim_can_read_as_system(
    (select claim_self_deleted_id from tenant_test_context),
    (select organization_a_id from tenant_test_context),
    (select clinic_a1_id from tenant_test_context),
    'claim.audit.read',
    true
  ),
  'Creator A claim_can_read denies own deleted claim without claim.audit.read'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_self_deleted_id from tenant_test_context),
    5555.00
  ),
  0,
  'Creator A cannot update own soft-deleted claim'
);

-- =============================================================================
-- 12. Ownership transfer and actor spoof prevention
-- =============================================================================

select is(
  pg_temp.try_touch_claim(
    (select claim_b1_id from tenant_test_context)
  ),
  0,
  'Creator A cannot use self identity to touch foreign tenant claim'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.claim_decisions',
    'insert'
  ),
  'Creator A cannot directly insert a final claim decision'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'insert'
  ),
  'Creator A cannot insert an arbitrary self-authored audit event'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'update'
  ),
  'Creator A cannot update an audit event where Creator A is actor'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'delete'
  ),
  'Creator A cannot delete an audit event where Creator A is actor'
);

reset role;

-- =============================================================================
-- 13. Different User A and reverse-tenant isolation
-- =============================================================================

select pg_temp.set_auth_user(
  (select user_a2_id from tenant_test_context)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
  ),
  1::bigint,
  'Different User A can read Clinic A1 claim when SELECT policy is clinic-scoped'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_a1_id from tenant_test_context),
    6666.00
  ),
  0,
  'Different User A cannot update Creator A claim under self-scoped UPDATE policy'
);

reset role;

select pg_temp.set_auth_user(
  (select user_b1_id from tenant_test_context)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_b1_id from tenant_test_context)
  ),
  1::bigint,
  'Creator B can read own Organization B claim'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
  ),
  0::bigint,
  'Creator B cannot read Creator A claim in Organization A'
);

reset role;

-- =============================================================================
-- 14. Missing JWT context fails closed
-- =============================================================================

select pg_temp.reset_auth();

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_a1_id from tenant_test_context)
  ),
  0::bigint,
  'Authenticated session without JWT sub cannot read Creator A claim'
);

reset role;

-- =============================================================================
-- 15. Static policy safety
-- =============================================================================

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(
          lower(regexp_replace(p.qual, '\s+', '', 'g')),
          ''
        ) in ('true', '(true)')
        or coalesce(
          lower(regexp_replace(p.with_check, '\s+', '', 'g')),
          ''
        ) in ('true', '(true)')
      )
  ),
  'no permissive authenticated policy bypasses self, tenant, or clinic scope'
);

select pg_temp.reset_auth();

select * from finish();

rollback;
