begin;

create extension if not exists pgtap with schema extensions;

select plan(39);

insert into public.organizations (
  id, name, legal_name, registration_number, country_code, timezone, code, organization_type, locale, is_active
)
values
  ('00000000-0000-4000-8000-000000000101', 'NexSure Alpha Hospital', 'NexSure Alpha Hospital Co., Ltd.', 'TEST-ORG-ALPHA', 'TH', 'Asia/Bangkok', 'NX_ALPHA', 'healthcare_provider', 'en-TH', true),
  ('00000000-0000-4000-8000-000000000102', 'NexSure Beta Clinic', 'NexSure Beta Clinic Co., Ltd.', 'TEST-ORG-BETA', 'TH', 'Asia/Bangkok', 'NX_BETA', 'healthcare_provider', 'th-TH', true)
on conflict (id) do nothing;

insert into public.clinics (id, organization_id, name, code, clinic_type, is_primary)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Alpha Main Clinic', 'ALPHA_MAIN', 'hospital', true),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'Alpha Satellite Clinic', 'ALPHA_SAT', 'clinic', false),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000102', 'Beta Main Clinic', 'BETA_MAIN', 'clinic', true)
on conflict (id) do nothing;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
)
values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lifecycle.alpha.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000000802', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lifecycle.beta.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000000803', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lifecycle.alpha.doctor@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000000804', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lifecycle.platform.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false)
on conflict (id) do nothing;

insert into public.user_profiles (id, organization_id, primary_clinic_id, display_name, email, job_title, department)
values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'Lifecycle Alpha Admin', 'lifecycle.alpha.admin@example.invalid', 'Admin', 'Operations'),
  ('00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000203', 'Lifecycle Beta Admin', 'lifecycle.beta.admin@example.invalid', 'Admin', 'Operations'),
  ('00000000-0000-4000-8000-000000000803', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'Lifecycle Alpha Doctor', 'lifecycle.alpha.doctor@example.invalid', 'Doctor', 'Clinical'),
  ('00000000-0000-4000-8000-000000000804', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'Lifecycle Platform Admin', 'lifecycle.platform.admin@example.invalid', 'Platform', 'Operations')
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000801', 'active'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000802', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000803', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000804', 'active')
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000801', 'active'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000802', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000803', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000804', 'active')
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
select v.organization_id, v.clinic_id, v.user_profile_id, r.id
from (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, null::uuid, '00000000-0000-4000-8000-000000000801'::uuid, 'organization_admin'::text),
    ('00000000-0000-4000-8000-000000000102'::uuid, null::uuid, '00000000-0000-4000-8000-000000000802'::uuid, 'organization_admin'::text),
    ('00000000-0000-4000-8000-000000000101'::uuid, '00000000-0000-4000-8000-000000000201'::uuid, '00000000-0000-4000-8000-000000000803'::uuid, 'doctor'::text),
    ('00000000-0000-4000-8000-000000000101'::uuid, null::uuid, '00000000-0000-4000-8000-000000000804'::uuid, 'platform_admin'::text)
) as v(organization_id, clinic_id, user_profile_id, role_name)
join public.roles r on r.organization_id is null and r.name = v.role_name
on conflict do nothing;

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'organizations'
      and column_name = 'lifecycle_status'
      and is_nullable = 'NO'
  ),
  'organization lifecycle status is not nullable'
);
select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clinics'
      and column_name = 'lifecycle_status'
      and is_nullable = 'NO'
  ),
  'clinic lifecycle status is not nullable'
);

select is(
  (select lifecycle_status from public.organizations where id = '00000000-0000-4000-8000-000000000101'),
  'active',
  'default organization lifecycle status is active'
);
select is(
  (select lifecycle_status from public.clinics where id = '00000000-0000-4000-8000-000000000201'),
  'active',
  'default clinic lifecycle status is active'
);

select throws_ok(
  $$ insert into public.organizations (name, code, lifecycle_status) values ('Invalid Status Org', 'BAD_STATUS_ORG', 'draft') $$,
  '23514',
  null,
  'unsupported organization lifecycle status is rejected'
);
select throws_ok(
  $$ insert into public.clinics (organization_id, name, code, lifecycle_status) values ('00000000-0000-4000-8000-000000000101', 'Invalid Status Clinic', 'BAD_STATUS_CLINIC', 'draft') $$,
  '23514',
  null,
  'unsupported clinic lifecycle status is rejected'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000801', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'suspended', 'Synthetic suspension reason') $$,
  'authorized organization active to suspended succeeds'
);
select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000101'),
  false,
  'suspended organization denies normal membership helper access'
);
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'active', 'Tenant self reactivation attempt') $$,
  '42501',
  null,
  'tenant organization admin cannot reactivate suspended own organization'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000804', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'active', 'Platform recovery reason') $$,
  'platform recovery suspended to active succeeds'
);
select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'closed', 'Synthetic closure reason') $$,
  'authorized organization active to closed succeeds'
);
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'suspended', 'No reopening to suspended') $$,
  '23514',
  null,
  'organization closed to suspended is denied'
);
select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'archived', 'Synthetic archive reason') $$,
  'authorized organization closed to archived succeeds'
);
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'active', 'Archive reversal attempt') $$,
  '23514',
  null,
  'organization archived to active is denied'
);
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000102'::uuid, 'archived', 'Skip from active') $$,
  '23514',
  null,
  'organization active to archived is denied'
);
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000102'::uuid, 'suspended', '') $$,
  '23514',
  null,
  'organization lifecycle reason is required'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000802', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'suspended', 'Cross tenant attempt') $$,
  '42501',
  null,
  'tenant admin cannot alter another organization'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000803', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000102'::uuid, 'suspended', 'Doctor attempt') $$,
  '42501',
  null,
  'unauthorized organization lifecycle transition is denied'
);
select throws_ok(
  $$ update public.organizations set lifecycle_status = 'suspended' where id = '00000000-0000-4000-8000-000000000102' $$,
  '42501',
  'permission denied for table organizations',
  'normal authenticated role cannot directly update organization lifecycle status'
);

reset role;
update public.organizations
set lifecycle_status = 'active',
    is_active = true
where id = '00000000-0000-4000-8000-000000000101';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000801', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'suspended', 'Synthetic clinic suspension') $$,
  'authorized clinic active to suspended succeeds'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'suspended clinic denies normal clinic helper access'
);
select lives_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'active', 'Synthetic clinic reactivation') $$,
  'authorized clinic suspended to active succeeds'
);
select lives_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'closed', 'Synthetic clinic closure') $$,
  'authorized clinic active to closed succeeds'
);
select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'suspended', 'Closed clinic cannot suspend') $$,
  '23514',
  null,
  'clinic closed to suspended is denied'
);
select lives_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'archived', 'Synthetic clinic archive') $$,
  'authorized clinic closed to archived succeeds'
);
select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'active', 'Archive reversal attempt') $$,
  '23514',
  null,
  'clinic archived to active is denied'
);
select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000202'::uuid, 'archived', 'Skip from active') $$,
  '23514',
  null,
  'clinic active to archived is denied'
);
select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000202'::uuid, 'suspended', '') $$,
  '23514',
  null,
  'clinic lifecycle reason is required'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000802', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'suspended', 'Cross clinic attempt') $$,
  '42501',
  null,
  'cross-organization clinic lifecycle transition is denied'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000803', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000202'::uuid, 'suspended', 'Cross clinic same org attempt') $$,
  '42501',
  null,
  'cross-clinic lifecycle transition is denied'
);
select throws_ok(
  $$ update public.clinics set lifecycle_status = 'suspended' where id = '00000000-0000-4000-8000-000000000202' $$,
  '42501',
  'permission denied for table clinics',
  'normal authenticated role cannot directly update clinic lifecycle status'
);

select is(
  public.has_permission('patient.view', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'archived clinic denies normal operational permission'
);

reset role;
select is(
  (select count(*)::integer from public.clinics where id = '00000000-0000-4000-8000-000000000201'),
  1,
  'historical clinic row remains present after lifecycle transitions'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000804', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000102'::uuid, 'suspended', 'Org override test') $$,
  'platform can suspend organization for override test'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000203'),
  false,
  'active clinic inside suspended organization is operationally denied'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000000101'::uuid, 'active', 'Anon attempt') $$,
  '42501',
  'permission denied for function transition_organization_lifecycle',
  'anonymous cannot execute organization lifecycle function'
);
select throws_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000000201'::uuid, 'active', 'Anon attempt') $$,
  '42501',
  'permission denied for function transition_clinic_lifecycle',
  'anonymous cannot execute clinic lifecycle function'
);

reset role;

select ok(
  exists (
    select 1
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('transition_organization_lifecycle', 'transition_clinic_lifecycle')
      and p.prosecdef
      and p.proconfig @> array['search_path=public']
    having count(*) = 2
  ),
  'lifecycle transition functions are security definer with fixed public search_path'
);

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in ('transition_organization_lifecycle', 'transition_clinic_lifecycle')
      and grantee in ('PUBLIC', 'anon')
  ),
  'PUBLIC and anon cannot execute lifecycle transition functions'
);

select * from finish();

rollback;
