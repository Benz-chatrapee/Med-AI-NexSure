-- =============================================================================
-- Med AI NexSure
-- Phase 3 Claim Tenant Isolation — Self-Contained Security Test
-- File: supabase/tests/phase3_claim_tenant_isolation_test_SELF_CONTAINED.sql
-- =============================================================================
--
-- Scope:
--   Organization and clinic isolation, active/deleted Claim visibility,
--   RBAC scope, authenticated fail-closed behavior, JWT tenant-claim tampering,
--   known-UUID access attempts, and supported mutation isolation.
--
-- Notes:
--   - Production schema, RLS policies, and authorization functions are reused.
--   - Reference roles/permissions and claim_types are expected from migrations.
--   - All business fixtures are created in this transaction and rolled back.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;
set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

select plan(43);

-- ---------------------------------------------------------------------------
-- 01. Schema and security preconditions
-- ---------------------------------------------------------------------------

select has_table(
  'public',
  'claims',
  'Precondition: public.claims exists'
);

select has_table(
  'public',
  'organizations',
  'Precondition: public.organizations exists'
);

select has_table(
  'public',
  'clinics',
  'Precondition: public.clinics exists'
);

select has_function(
  'public',
  'has_permission',
  array['text', 'uuid', 'uuid'],
  'Precondition: public.has_permission(text, uuid, uuid) exists'
);

select ok(
  to_regprocedure(
    'private.claim_can_read(uuid,uuid,uuid,text,boolean)'
  ) is not null,
  'Precondition: private.claim_can_read(uuid, uuid, uuid, text, boolean) exists'
);

select ok(
  coalesce(
    (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'claims'
    ),
    false
  ),
  'Precondition: RLS is enabled on public.claims'
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
  'Precondition: authenticated Claim SELECT policy exists'
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
  'Precondition: authenticated Claim UPDATE policy exists'
);

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(lower(regexp_replace(p.qual, '\s+', '', 'g')), '')
          in ('true', '(true)')
        or
        coalesce(lower(regexp_replace(p.with_check, '\s+', '', 'g')), '')
          in ('true', '(true)')
      )
  ),
  'Precondition: no unconditional authenticated Claim policy exists'
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
  'Precondition: claim.read, claim.update, and claim.audit.read exist'
);

select ok(
  exists (select 1 from public.claim_types),
  'Precondition: Claim type reference data exists'
);

-- ---------------------------------------------------------------------------
-- 02. Test-scoped authentication and mutation helpers
-- ---------------------------------------------------------------------------

create or replace function pg_temp.set_auth_context(
  p_auth_user_id uuid,
  p_organization_claim text default null,
  p_clinic_claim text default null
)
returns void
language plpgsql
as $$
declare
  v_claims jsonb;
begin
  v_claims := jsonb_strip_nulls(
    jsonb_build_object(
      'sub', p_auth_user_id::text,
      'role', 'authenticated',
      'organization_id', p_organization_claim,
      'clinic_id', p_clinic_claim
    )
  );

  perform set_config('request.jwt.claims', v_claims::text, true);
  perform set_config('request.jwt.claim.sub', p_auth_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config(
    'request.jwt.claim.organization_id',
    coalesce(p_organization_claim, ''),
    true
  );
  perform set_config(
    'request.jwt.claim.clinic_id',
    coalesce(p_clinic_claim, ''),
    true
  );
end;
$$;

create or replace function pg_temp.reset_auth()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{}'::text, true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claim.organization_id', '', true);
  perform set_config('request.jwt.claim.clinic_id', '', true);
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
  when insufficient_privilege or check_violation then
    return 0;
end;
$$;

create or replace function pg_temp.try_move_claim(
  p_claim_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid
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
  set organization_id = p_organization_id,
      clinic_id = p_clinic_id
  where id = p_claim_id;

  get diagnostics v_affected = row_count;
  return v_affected;
exception
  when insufficient_privilege
    or check_violation
    or foreign_key_violation
    or unique_violation then
    return 0;
end;
$$;

create or replace function pg_temp.try_soft_delete_claim(
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
  set deleted_at = '2026-07-22 09:00:00+00'::timestamptz,
      deleted_by = auth.uid()
  where id = p_claim_id;

  get diagnostics v_affected = row_count;
  return v_affected;
exception
  when insufficient_privilege or check_violation then
    return 0;
end;
$$;

-- ---------------------------------------------------------------------------
-- 03. Deterministic fixture constants
-- ---------------------------------------------------------------------------

create temporary table tenant_fixture (
  organization_alpha_id uuid not null,
  organization_beta_id uuid not null,
  clinic_alpha_primary_id uuid not null,
  clinic_alpha_secondary_id uuid not null,
  clinic_beta_primary_id uuid not null,
  user_alpha_primary_id uuid not null,
  user_alpha_secondary_id uuid not null,
  user_beta_primary_id uuid not null,
  user_alpha_auditor_id uuid not null,
  user_alpha_no_permission_id uuid not null,
  user_alpha_no_membership_id uuid not null,
  patient_alpha_primary_id uuid not null,
  patient_alpha_secondary_id uuid not null,
  patient_beta_primary_id uuid not null,
  visit_alpha_primary_id uuid not null,
  visit_alpha_secondary_id uuid not null,
  visit_beta_primary_id uuid not null,
  claim_alpha_active_id uuid not null,
  claim_alpha_secondary_active_id uuid not null,
  claim_alpha_deleted_id uuid not null,
  claim_beta_active_id uuid not null,
  claim_beta_deleted_id uuid not null,
  claim_type_code text not null,
  claim_updater_role_id uuid not null,
  claim_auditor_role_id uuid not null
) on commit drop;

insert into tenant_fixture
select
  '91000000-0000-4000-8000-000000000001'::uuid,
  '91000000-0000-4000-8000-000000000002'::uuid,
  '92000000-0000-4000-8000-000000000001'::uuid,
  '92000000-0000-4000-8000-000000000002'::uuid,
  '92000000-0000-4000-8000-000000000003'::uuid,
  '93000000-0000-4000-8000-000000000001'::uuid,
  '93000000-0000-4000-8000-000000000002'::uuid,
  '93000000-0000-4000-8000-000000000003'::uuid,
  '93000000-0000-4000-8000-000000000004'::uuid,
  '93000000-0000-4000-8000-000000000005'::uuid,
  '93000000-0000-4000-8000-000000000006'::uuid,
  '96000000-0000-4000-8000-000000000001'::uuid,
  '96000000-0000-4000-8000-000000000002'::uuid,
  '96000000-0000-4000-8000-000000000003'::uuid,
  '97000000-0000-4000-8000-000000000001'::uuid,
  '97000000-0000-4000-8000-000000000002'::uuid,
  '97000000-0000-4000-8000-000000000003'::uuid,
  '98000000-0000-4000-8000-000000000001'::uuid,
  '98000000-0000-4000-8000-000000000002'::uuid,
  '98000000-0000-4000-8000-000000000003'::uuid,
  '98000000-0000-4000-8000-000000000004'::uuid,
  '98000000-0000-4000-8000-000000000005'::uuid,
  (
    select ct.code
    from public.claim_types ct
    order by ct.code
    limit 1
  ),
  (
    select r.id
    from public.roles r
    where coalesce((to_jsonb(r) ->> 'is_active')::boolean, true)
      and to_jsonb(r) ->> 'deleted_at' is null
      and exists (
        select 1
        from public.role_permissions rp
        join public.permissions p on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.read'
      )
      and exists (
        select 1
        from public.role_permissions rp
        join public.permissions p on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.update'
      )
      and not exists (
        select 1
        from public.role_permissions rp
        join public.permissions p on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.audit.read'
      )
    order by r.id
    limit 1
  ),
  (
    select r.id
    from public.roles r
    where coalesce((to_jsonb(r) ->> 'is_active')::boolean, true)
      and to_jsonb(r) ->> 'deleted_at' is null
      and exists (
        select 1
        from public.role_permissions rp
        join public.permissions p on p.id = rp.permission_id
        where rp.role_id = r.id
          and p.permission_key = 'claim.audit.read'
      )
    order by r.id
    limit 1
  );

-- ---------------------------------------------------------------------------
-- 04. Tenant, identity, membership, and RBAC fixtures
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  v.id,
  'authenticated',
  'authenticated',
  v.email,
  crypt('LocalTest!2026', gen_salt('bf')),
  '2026-07-22 08:00:00+00'::timestamptz,
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', v.display_name),
  '2026-07-22 08:00:00+00'::timestamptz,
  '2026-07-22 08:00:00+00'::timestamptz
from (
  values
    ((select user_alpha_primary_id from tenant_fixture),
     'phase3.alpha.primary@example.invalid',
     'Phase 3 Alpha Primary'),
    ((select user_alpha_secondary_id from tenant_fixture),
     'phase3.alpha.secondary@example.invalid',
     'Phase 3 Alpha Secondary'),
    ((select user_beta_primary_id from tenant_fixture),
     'phase3.beta.primary@example.invalid',
     'Phase 3 Beta Primary'),
    ((select user_alpha_auditor_id from tenant_fixture),
     'phase3.alpha.auditor@example.invalid',
     'Phase 3 Alpha Auditor'),
    ((select user_alpha_no_permission_id from tenant_fixture),
     'phase3.alpha.nopermission@example.invalid',
     'Phase 3 Alpha No Permission'),
    ((select user_alpha_no_membership_id from tenant_fixture),
     'phase3.alpha.nomembership@example.invalid',
     'Phase 3 Alpha No Membership')
) as v(id, email, display_name);

insert into public.organizations (
  id, code, name, organization_type, lifecycle_status, is_active
)
values
  (
    (select organization_alpha_id from tenant_fixture),
    'PH3-ISO-ALPHA',
    'Phase 3 Isolation Organization Alpha',
    'healthcare_provider',
    'active',
    true
  ),
  (
    (select organization_beta_id from tenant_fixture),
    'PH3-ISO-BETA',
    'Phase 3 Isolation Organization Beta',
    'healthcare_provider',
    'active',
    true
  );

insert into public.clinics (
  id, organization_id, code, name, clinic_type, lifecycle_status, is_active
)
values
  (
    (select clinic_alpha_primary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    'PH3-ISO-ALPHA-A1',
    'Phase 3 Isolation Alpha Primary Clinic',
    'clinic',
    'active',
    true
  ),
  (
    (select clinic_alpha_secondary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    'PH3-ISO-ALPHA-A2',
    'Phase 3 Isolation Alpha Secondary Clinic',
    'clinic',
    'active',
    true
  ),
  (
    (select clinic_beta_primary_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    'PH3-ISO-BETA-B1',
    'Phase 3 Isolation Beta Primary Clinic',
    'clinic',
    'active',
    true
  );

insert into public.user_profiles (
  id, organization_id, primary_clinic_id, display_name,
  email, job_title, department, is_active
)
values
  (
    (select user_alpha_primary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'Phase 3 Alpha Primary',
    'phase3.alpha.primary@example.invalid',
    'Claim Updater',
    'Claims',
    true
  ),
  (
    (select user_alpha_secondary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    'Phase 3 Alpha Secondary',
    'phase3.alpha.secondary@example.invalid',
    'Claim Updater',
    'Claims',
    true
  ),
  (
    (select user_beta_primary_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    'Phase 3 Beta Primary',
    'phase3.beta.primary@example.invalid',
    'Claim Updater',
    'Claims',
    true
  ),
  (
    (select user_alpha_auditor_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'Phase 3 Alpha Auditor',
    'phase3.alpha.auditor@example.invalid',
    'Claim Auditor',
    'Compliance',
    true
  ),
  (
    (select user_alpha_no_permission_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'Phase 3 Alpha No Permission',
    'phase3.alpha.nopermission@example.invalid',
    'Observer',
    'Operations',
    true
  ),
  (
    (select user_alpha_no_membership_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'Phase 3 Alpha No Membership',
    'phase3.alpha.nomembership@example.invalid',
    'Observer',
    'Operations',
    true
  );

insert into public.organization_memberships (
  organization_id, user_profile_id, membership_status
)
values
  (
    (select organization_alpha_id from tenant_fixture),
    (select user_alpha_primary_id from tenant_fixture),
    'active'
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select user_alpha_secondary_id from tenant_fixture),
    'active'
  ),
  (
    (select organization_beta_id from tenant_fixture),
    (select user_beta_primary_id from tenant_fixture),
    'active'
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select user_alpha_auditor_id from tenant_fixture),
    'active'
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select user_alpha_no_permission_id from tenant_fixture),
    'active'
  );

insert into public.clinic_memberships (
  organization_id, clinic_id, user_profile_id
)
values
  (
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select user_alpha_primary_id from tenant_fixture)
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    (select user_alpha_secondary_id from tenant_fixture)
  ),
  (
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    (select user_beta_primary_id from tenant_fixture)
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select user_alpha_auditor_id from tenant_fixture)
  ),
  (
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select user_alpha_no_permission_id from tenant_fixture)
  );

insert into public.user_role_assignments (
  id, organization_id, clinic_id, user_profile_id, role_id,
  assignment_status, is_active, assignment_reason, assigned_at
)
values
  (
    '94000000-0000-4000-8000-000000000001',
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select user_alpha_primary_id from tenant_fixture),
    (select claim_updater_role_id from tenant_fixture),
    'active',
    true,
    'Phase 3 tenant-isolation Alpha primary updater',
    '2020-01-01 00:00:00+00'::timestamptz
  ),
  (
    '94000000-0000-4000-8000-000000000002',
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    (select user_alpha_secondary_id from tenant_fixture),
    (select claim_updater_role_id from tenant_fixture),
    'active',
    true,
    'Phase 3 tenant-isolation Alpha secondary updater',
    '2020-01-01 00:00:00+00'::timestamptz
  ),
  (
    '94000000-0000-4000-8000-000000000003',
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    (select user_beta_primary_id from tenant_fixture),
    (select claim_updater_role_id from tenant_fixture),
    'active',
    true,
    'Phase 3 tenant-isolation Beta primary updater',
    '2020-01-01 00:00:00+00'::timestamptz
  ),
  (
    '94000000-0000-4000-8000-000000000004',
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select user_alpha_auditor_id from tenant_fixture),
    (select claim_auditor_role_id from tenant_fixture),
    'active',
    true,
    'Phase 3 tenant-isolation Alpha auditor',
    '2020-01-01 00:00:00+00'::timestamptz
  );

-- ---------------------------------------------------------------------------
-- 05. Clinical and Claim fixtures
-- ---------------------------------------------------------------------------

insert into public.patients (
  id, organization_id, clinic_id, patient_code, display_label,
  consent_status, date_of_birth, sex_at_birth, is_active
)
values
  (
    (select patient_alpha_primary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'PH3-ISO-PAT-ALPHA-A1',
    'Phase 3 Alpha Primary Patient',
    'granted',
    '1985-01-01',
    'female',
    true
  ),
  (
    (select patient_alpha_secondary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    'PH3-ISO-PAT-ALPHA-A2',
    'Phase 3 Alpha Secondary Patient',
    'granted',
    '1986-02-02',
    'male',
    true
  ),
  (
    (select patient_beta_primary_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    'PH3-ISO-PAT-BETA-B1',
    'Phase 3 Beta Primary Patient',
    'granted',
    '1987-03-03',
    'female',
    true
  );

insert into public.visits (
  id, organization_id, clinic_id, patient_id, visit_number,
  department, visit_status, is_active
)
values
  (
    (select visit_alpha_primary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    (select patient_alpha_primary_id from tenant_fixture),
    'VN-PH3-ISO-ALPHA-A1',
    'General Medicine',
    'in_consultation',
    true
  ),
  (
    (select visit_alpha_secondary_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    (select patient_alpha_secondary_id from tenant_fixture),
    'VN-PH3-ISO-ALPHA-A2',
    'General Medicine',
    'in_consultation',
    true
  ),
  (
    (select visit_beta_primary_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    (select patient_beta_primary_id from tenant_fixture),
    'VN-PH3-ISO-BETA-B1',
    'General Medicine',
    'in_consultation',
    true
  );

insert into public.claims (
  id, organization_id, clinic_id, claim_number, claim_type_code,
  patient_id, visit_id, status, service_start_date, submitted_at,
  total_claimed_amount, total_eligible_amount, total_approved_amount,
  created_by, updated_by
)
values
  (
    (select claim_alpha_active_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'PH3-ISO-CLAIM-ALPHA-ACTIVE',
    (select claim_type_code from tenant_fixture),
    (select patient_alpha_primary_id from tenant_fixture),
    (select visit_alpha_primary_id from tenant_fixture),
    'draft',
    '2026-07-22'::date,
    null,
    1000.00,
    null,
    null,
    (select user_alpha_primary_id from tenant_fixture),
    (select user_alpha_primary_id from tenant_fixture)
  ),
  (
    (select claim_alpha_secondary_active_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture),
    'PH3-ISO-CLAIM-ALPHA-SECONDARY',
    (select claim_type_code from tenant_fixture),
    (select patient_alpha_secondary_id from tenant_fixture),
    (select visit_alpha_secondary_id from tenant_fixture),
    'draft',
    '2026-07-22'::date,
    null,
    2000.00,
    null,
    null,
    (select user_alpha_secondary_id from tenant_fixture),
    (select user_alpha_secondary_id from tenant_fixture)
  ),
  (
    (select claim_alpha_deleted_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'PH3-ISO-CLAIM-ALPHA-DELETED',
    (select claim_type_code from tenant_fixture),
    (select patient_alpha_primary_id from tenant_fixture),
    (select visit_alpha_primary_id from tenant_fixture),
    'draft',
    '2026-07-22'::date,
    null,
    3000.00,
    null,
    null,
    (select user_alpha_primary_id from tenant_fixture),
    (select user_alpha_primary_id from tenant_fixture)
  ),
  (
    (select claim_beta_active_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    'PH3-ISO-CLAIM-BETA-ACTIVE',
    (select claim_type_code from tenant_fixture),
    (select patient_beta_primary_id from tenant_fixture),
    (select visit_beta_primary_id from tenant_fixture),
    'draft',
    '2026-07-22'::date,
    null,
    4000.00,
    null,
    null,
    (select user_beta_primary_id from tenant_fixture),
    (select user_beta_primary_id from tenant_fixture)
  ),
  (
    (select claim_beta_deleted_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    'PH3-ISO-CLAIM-BETA-DELETED',
    (select claim_type_code from tenant_fixture),
    (select patient_beta_primary_id from tenant_fixture),
    (select visit_beta_primary_id from tenant_fixture),
    'draft',
    '2026-07-22'::date,
    null,
    5000.00,
    null,
    null,
    (select user_beta_primary_id from tenant_fixture),
    (select user_beta_primary_id from tenant_fixture)
  );

update public.claims
set deleted_at = '2026-07-22 08:30:00+00'::timestamptz,
    deleted_by = case
      when organization_id = (select organization_alpha_id from tenant_fixture)
        then (select user_alpha_primary_id from tenant_fixture)
      else (select user_beta_primary_id from tenant_fixture)
    end
where id in (
  (select claim_alpha_deleted_id from tenant_fixture),
  (select claim_beta_deleted_id from tenant_fixture)
);

grant select on tenant_fixture to authenticated;

-- ---------------------------------------------------------------------------
-- 06. Fixture integrity
-- ---------------------------------------------------------------------------

select is(
  (
    select count(*)::bigint
    from public.claims
    where id in (
      select claim_alpha_active_id from tenant_fixture
      union all
      select claim_alpha_secondary_active_id from tenant_fixture
      union all
      select claim_alpha_deleted_id from tenant_fixture
      union all
      select claim_beta_active_id from tenant_fixture
      union all
      select claim_beta_deleted_id from tenant_fixture
    )
  ),
  5::bigint,
  'Fixture: five deterministic Claims exist'
);

select ok(
  (select claim_updater_role_id is not null from tenant_fixture),
  'Fixture: active role with claim.read and claim.update was resolved'
);

select ok(
  (select claim_auditor_role_id is not null from tenant_fixture),
  'Fixture: active role with claim.audit.read was resolved'
);

select is(
  (
    select count(*)::bigint
    from public.user_role_assignments
    where id::text like '94000000-0000-4000-8000-00000000000%'
      and assignment_status = 'active'
  ),
  4::bigint,
  'Fixture: four active scoped role assignments exist'
);

-- ---------------------------------------------------------------------------
-- 07. Anonymous, unknown, missing-profile, and missing-membership denial
-- ---------------------------------------------------------------------------

select ok(
  not has_table_privilege('anon', 'public.claims', 'select'),
  'Anonymous actor has no direct Claim SELECT privilege'
);

select pg_temp.set_auth_context(
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  0::bigint,
  'Unknown authenticated actor cannot SELECT a known Alpha Claim UUID'
);

reset role;

select pg_temp.set_auth_context(
  (select user_alpha_no_membership_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_alpha_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  0::bigint,
  'Actor with profile but no membership cannot SELECT an Alpha Claim'
);

reset role;

select pg_temp.set_auth_context(
  (select user_alpha_no_permission_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_alpha_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  0::bigint,
  'In-scope member without Claim permission cannot SELECT an Alpha Claim'
);

reset role;

-- ---------------------------------------------------------------------------
-- 08. Alpha primary authorized access and tenant isolation
-- ---------------------------------------------------------------------------

select pg_temp.set_auth_context(
  (select user_alpha_primary_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_alpha_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  1::bigint,
  'Alpha primary actor can SELECT the active Claim in Alpha primary clinic'
);

select is(
  pg_temp.claim_can_read_as_system(
    (select claim_alpha_active_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'claim.read',
    false
  ),
  true,
  'Alpha primary authorization helper permits the active in-scope Claim'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_secondary_active_id from tenant_fixture)
  ),
  0::bigint,
  'Alpha primary actor cannot SELECT a known Claim UUID from Alpha secondary clinic'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_active_id from tenant_fixture)
  ),
  0::bigint,
  'Alpha primary actor cannot SELECT a known active Claim UUID from Beta'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_deleted_id from tenant_fixture)
  ),
  0::bigint,
  'Alpha primary actor cannot SELECT a known deleted Claim UUID from Beta'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_alpha_active_id from tenant_fixture),
    1111.00
  ),
  1,
  'Alpha primary actor can UPDATE the own editable in-scope Claim'
);

select is(
  (
    select total_claimed_amount
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  1111.00::numeric,
  'Allowed Alpha Claim UPDATE persists inside the transaction'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_alpha_secondary_active_id from tenant_fixture),
    2222.00
  ),
  0,
  'Alpha primary actor cannot UPDATE the Alpha secondary-clinic Claim'
);

select is(
  pg_temp.try_update_claim_amount(
    (select claim_beta_active_id from tenant_fixture),
    4444.00
  ),
  0,
  'Alpha primary actor cannot UPDATE the Beta Claim'
);

select is(
  pg_temp.try_move_claim(
    (select claim_alpha_active_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture)
  ),
  0,
  'Alpha primary actor cannot move an Alpha Claim into Beta'
);

select is(
  pg_temp.try_move_claim(
    (select claim_alpha_active_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_secondary_id from tenant_fixture)
  ),
  0,
  'Alpha primary actor cannot move a Claim into Alpha secondary clinic'
);

select is(
  pg_temp.try_soft_delete_claim(
    (select claim_beta_active_id from tenant_fixture)
  ),
  0,
  'Alpha primary actor cannot soft-delete a Beta Claim'
);

reset role;

-- ---------------------------------------------------------------------------
-- 09. Deleted Claim and audit-permission isolation
-- ---------------------------------------------------------------------------

select pg_temp.set_auth_context(
  (select user_alpha_primary_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_alpha_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_deleted_id from tenant_fixture)
  ),
  0::bigint,
  'claim.read and claim.update do not reveal an Alpha soft-deleted Claim'
);

reset role;

select pg_temp.set_auth_context(
  (select user_alpha_auditor_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_alpha_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_deleted_id from tenant_fixture)
  ),
  1::bigint,
  'Alpha auditor can SELECT an Alpha deleted Claim in the authorized clinic'
);

select is(
  pg_temp.claim_can_read_as_system(
    (select claim_alpha_deleted_id from tenant_fixture),
    (select organization_alpha_id from tenant_fixture),
    (select clinic_alpha_primary_id from tenant_fixture),
    'claim.audit.read',
    true
  ),
  true,
  'Alpha auditor helper permits the in-scope deleted Claim'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_deleted_id from tenant_fixture)
  ),
  0::bigint,
  'Alpha audit permission does not reveal a Beta deleted Claim'
);

select is(
  pg_temp.claim_can_read_as_system(
    (select claim_beta_deleted_id from tenant_fixture),
    (select organization_beta_id from tenant_fixture),
    (select clinic_beta_primary_id from tenant_fixture),
    'claim.audit.read',
    true
  ),
  false,
  'Alpha auditor helper denies the Beta deleted Claim'
);

reset role;

-- ---------------------------------------------------------------------------
-- 10. Beta reverse-tenant isolation
-- ---------------------------------------------------------------------------

select pg_temp.set_auth_context(
  (select user_beta_primary_id from tenant_fixture),
  (select organization_beta_id::text from tenant_fixture),
  (select clinic_beta_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_active_id from tenant_fixture)
  ),
  1::bigint,
  'Beta actor can SELECT the active Beta Claim'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  0::bigint,
  'Beta actor cannot SELECT the active Alpha Claim'
);

reset role;

-- ---------------------------------------------------------------------------
-- 11. JWT tenant-claim tampering and fail-closed behavior
-- ---------------------------------------------------------------------------

select pg_temp.set_auth_context(
  (select user_alpha_primary_id from tenant_fixture),
  (select organization_beta_id::text from tenant_fixture),
  (select clinic_beta_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_active_id from tenant_fixture)
  ),
  0::bigint,
  'Changing Alpha actor JWT tenant claims to Beta does not grant Beta access'
);

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_alpha_active_id from tenant_fixture)
  ),
  1::bigint,
  'Trusted database membership still governs Alpha access after JWT tampering'
);

reset role;

select pg_temp.set_auth_context(
  (select user_alpha_primary_id from tenant_fixture),
  (select organization_alpha_id::text from tenant_fixture),
  (select clinic_beta_primary_id::text from tenant_fixture)
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_active_id from tenant_fixture)
  ),
  0::bigint,
  'Mismatched Alpha organization and Beta clinic JWT claims grant no Beta access'
);

reset role;

select pg_temp.set_auth_context(
  (select user_alpha_primary_id from tenant_fixture),
  'not-a-uuid',
  'also-not-a-uuid'
);

set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.claims
    where id = (select claim_beta_active_id from tenant_fixture)
  ),
  0::bigint,
  'Malformed tenant JWT claims fail closed for foreign Claim access'
);

reset role;

select pg_temp.reset_auth();

-- ---------------------------------------------------------------------------
-- 12. Final policy safety and completion
-- ---------------------------------------------------------------------------

select ok(
  not exists (
    select 1
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'claims'
      and 'authenticated' = any(p.roles)
      and (
        coalesce(lower(regexp_replace(p.qual, '\s+', '', 'g')), '')
          in ('true', '(true)')
        or
        coalesce(lower(regexp_replace(p.with_check, '\s+', '', 'g')), '')
          in ('true', '(true)')
      )
  ),
  'Final check: no permissive authenticated policy bypasses tenant scope'
);

select * from finish();

rollback;
