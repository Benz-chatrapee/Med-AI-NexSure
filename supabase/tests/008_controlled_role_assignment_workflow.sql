begin;

create extension if not exists pgtap with schema extensions;

select plan(44);

insert into public.organizations (
  id, name, legal_name, registration_number, country_code, timezone, code, organization_type, locale, is_active, lifecycle_status
)
values
  ('00000000-0000-4000-8000-000000001101', 'Role Workflow Alpha Hospital', 'Role Workflow Alpha Hospital Co., Ltd.', 'TEST-RBAC-ALPHA', 'TH', 'Asia/Bangkok', 'RBAC_ALPHA', 'healthcare_provider', 'en-TH', true, 'active'),
  ('00000000-0000-4000-8000-000000001102', 'Role Workflow Beta Clinic', 'Role Workflow Beta Clinic Co., Ltd.', 'TEST-RBAC-BETA', 'TH', 'Asia/Bangkok', 'RBAC_BETA', 'healthcare_provider', 'th-TH', true, 'active')
on conflict (id) do nothing;

insert into public.clinics (id, organization_id, name, code, clinic_type, is_primary, is_active, lifecycle_status)
values
  ('00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001101', 'RBAC Alpha Main Clinic', 'RBAC_ALPHA_MAIN', 'hospital', true, true, 'active'),
  ('00000000-0000-4000-8000-000000001202', '00000000-0000-4000-8000-000000001101', 'RBAC Alpha Satellite Clinic', 'RBAC_ALPHA_SAT', 'clinic', false, true, 'active'),
  ('00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000001102', 'RBAC Beta Main Clinic', 'RBAC_BETA_MAIN', 'clinic', true, true, 'active')
on conflict (id) do nothing;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
)
values
  ('00000000-0000-4000-8000-000000001301', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.alpha.org.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001302', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.alpha.clinic.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001303', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.alpha.target@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001304', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.beta.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001305', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.platform.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001306', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.unauthorized@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001307', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.inactive.target@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001308', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.missing.membership@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000001309', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rbac.expired.membership@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false)
on conflict (id) do nothing;

insert into public.user_profiles (id, organization_id, primary_clinic_id, display_name, email, job_title, department, is_active)
values
  ('00000000-0000-4000-8000-000000001301', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Alpha Org Admin', 'rbac.alpha.org.admin@example.invalid', 'Admin', 'Operations', true),
  ('00000000-0000-4000-8000-000000001302', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Alpha Clinic Admin', 'rbac.alpha.clinic.admin@example.invalid', 'Admin', 'Operations', true),
  ('00000000-0000-4000-8000-000000001303', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Alpha Target', 'rbac.alpha.target@example.invalid', 'Doctor', 'Clinical', true),
  ('00000000-0000-4000-8000-000000001304', '00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000001203', 'RBAC Beta Admin', 'rbac.beta.admin@example.invalid', 'Admin', 'Operations', true),
  ('00000000-0000-4000-8000-000000001305', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Platform Admin', 'rbac.platform.admin@example.invalid', 'Platform', 'Operations', true),
  ('00000000-0000-4000-8000-000000001306', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Unauthorized', 'rbac.unauthorized@example.invalid', 'Doctor', 'Clinical', true),
  ('00000000-0000-4000-8000-000000001307', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Inactive Target', 'rbac.inactive.target@example.invalid', 'Doctor', 'Clinical', false),
  ('00000000-0000-4000-8000-000000001308', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Missing Membership', 'rbac.missing.membership@example.invalid', 'Doctor', 'Clinical', true),
  ('00000000-0000-4000-8000-000000001309', '00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', 'RBAC Expired Membership', 'rbac.expired.membership@example.invalid', 'Doctor', 'Clinical', true)
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001301', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001302', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001303', 'active'),
  ('00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000001304', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001305', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001306', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001307', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001309', 'active')
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001301', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001302', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001303', 'active'),
  ('00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000001304', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001305', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001306', 'active'),
  ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000001307', 'active')
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.user_role_assignments (id, organization_id, clinic_id, user_profile_id, role_id)
select v.id, v.organization_id, v.clinic_id, v.user_profile_id, r.id
from (
  values
    ('00000000-0000-4000-8000-000000001901'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, '00000000-0000-4000-8000-000000001301'::uuid, 'organization_admin'::text),
    ('00000000-0000-4000-8000-000000001902'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, '00000000-0000-4000-8000-000000001302'::uuid, 'clinic_admin'::text),
    ('00000000-0000-4000-8000-000000001903'::uuid, '00000000-0000-4000-8000-000000001102'::uuid, null::uuid, '00000000-0000-4000-8000-000000001304'::uuid, 'organization_admin'::text),
    ('00000000-0000-4000-8000-000000001904'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, '00000000-0000-4000-8000-000000001305'::uuid, 'platform_admin'::text),
    ('00000000-0000-4000-8000-000000001905'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, '00000000-0000-4000-8000-000000001306'::uuid, 'doctor'::text)
) as v(id, organization_id, clinic_id, user_profile_id, role_name)
join public.roles r on r.organization_id is null and r.name = v.role_name
on conflict do nothing;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'compliance_officer' and organization_id is null), now(), null::timestamptz, 'Org scoped coverage') $$,
  'authorized organization role assignment succeeds'
);
select is(
  (select count(*)::integer from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null) and assignment_status = 'active'),
  1,
  'organization assignment persists with target and role'
);
select is(
  (select assigned_by from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)),
  '00000000-0000-4000-8000-000000001301'::uuid,
  'assignment actor is derived from auth context'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'compliance_officer' and organization_id is null), now(), null::timestamptz, 'Duplicate') $$,
  '23505',
  null,
  'duplicate active organization assignment is rejected'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, '') $$,
  '23514',
  null,
  'assignment reason is required'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001307'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Inactive target') $$,
  '42501',
  null,
  'inactive target profile is rejected'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001308'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Missing membership') $$,
  '42501',
  null,
  'missing target organization membership is rejected'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001309'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Missing clinic membership') $$,
  '42501',
  null,
  'missing target clinic membership is rejected for role requiring clinic membership'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001301'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Self grant') $$,
  '42501',
  null,
  'self-assignment is rejected'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'platform_admin' and organization_id is null), now(), null::timestamptz, 'Tenant platform escalation') $$,
  '42501',
  null,
  'tenant admin cannot assign platform role'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001302', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), now() + interval '10 days', 'Clinic scoped coverage') $$,
  'authorized clinic role assignment succeeds'
);
reset role;
select is(
  (select clinic_id from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'doctor' and organization_id is null)),
  '00000000-0000-4000-8000-000000001201'::uuid,
  'clinic assignment persists with correct clinic'
);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001302', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'organization_admin' and organization_id is null), now(), null::timestamptz, 'Clinic admin org escalation') $$,
  '42501',
  null,
  'clinic admin cannot assign organization-wide role'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001202'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Cross clinic scope') $$,
  '42501',
  null,
  'clinic admin cannot assign into another clinic'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001203'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Cross org clinic') $$,
  '42501',
  null,
  'cross-organization clinic scope is rejected'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001304'::uuid, '00000000-0000-4000-8000-000000001102'::uuid, null::uuid, (select id from public.roles where name = 'platform_admin' and organization_id is null), now(), null::timestamptz, 'Platform authorized assignment') $$,
  'authorized platform role assignment succeeds'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now() + interval '2 days', now() + interval '1 day', 'Bad date order') $$,
  '23514',
  null,
  'expiry must be after effective start'
);
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now() - interval '1 day', null::timestamptz, 'Past start') $$,
  '23514',
  null,
  'past effective start is rejected'
);

reset role;
update public.organizations set lifecycle_status = 'suspended', is_active = false where id = '00000000-0000-4000-8000-000000001101';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Suspended org assignment') $$,
  '42501',
  null,
  'suspended organization assignment is rejected'
);
reset role;
update public.organizations set lifecycle_status = 'closed', is_active = false where id = '00000000-0000-4000-8000-000000001101';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Closed org assignment') $$,
  '42501',
  null,
  'closed organization assignment is rejected'
);
reset role;
update public.organizations set lifecycle_status = 'archived', is_active = false where id = '00000000-0000-4000-8000-000000001101';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Archived org assignment') $$,
  '42501',
  null,
  'archived organization assignment is rejected'
);

reset role;
update public.organizations set lifecycle_status = 'active', is_active = true where id = '00000000-0000-4000-8000-000000001101';
update public.clinics set lifecycle_status = 'suspended', is_active = false where id = '00000000-0000-4000-8000-000000001201';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Suspended clinic assignment') $$,
  '42501',
  null,
  'suspended clinic assignment is rejected'
);
reset role;
update public.clinics set lifecycle_status = 'closed', is_active = false where id = '00000000-0000-4000-8000-000000001201';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Closed clinic assignment') $$,
  '42501',
  null,
  'closed clinic assignment is rejected'
);
reset role;
update public.clinics set lifecycle_status = 'archived', is_active = false where id = '00000000-0000-4000-8000-000000001201';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Archived clinic assignment') $$,
  '42501',
  null,
  'archived clinic assignment is rejected'
);

reset role;
update public.clinics set lifecycle_status = 'active', is_active = true where id = '00000000-0000-4000-8000-000000001201';
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001306', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, '00000000-0000-4000-8000-000000001201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Unauthorized actor') $$,
  '42501',
  null,
  'unauthorized actor is rejected'
);
select throws_ok(
  $$ insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id) select '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, '00000000-0000-4000-8000-000000001306'::uuid, id from public.roles where name = 'nurse' and organization_id is null $$,
  '42501',
  'permission denied for table user_role_assignments',
  'normal authenticated user cannot insert role assignments directly'
);
select throws_ok(
  $$ update public.user_role_assignments set role_id = (select id from public.roles where name = 'nurse' and organization_id is null) where user_profile_id = '00000000-0000-4000-8000-000000001306' $$,
  '42501',
  'permission denied for table user_role_assignments',
  'normal authenticated user cannot update role assignments directly'
);
select throws_ok(
  $$ delete from public.user_role_assignments where user_profile_id = '00000000-0000-4000-8000-000000001306' $$,
  '42501',
  'permission denied for table user_role_assignments',
  'normal authenticated user cannot delete role assignments directly'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000001303'::uuid, '00000000-0000-4000-8000-000000001101'::uuid, null::uuid, '00000000-0000-4000-8000-000000009999'::uuid, now(), null::timestamptz, 'Anon assign') $$,
  '42501',
  'permission denied for function assign_role',
  'anonymous cannot execute assign role workflow'
);
select throws_ok(
  $$ select public.revoke_role_assignment('00000000-0000-4000-8000-000000001901'::uuid, 'Anon revoke') $$,
  '42501',
  'permission denied for function revoke_role_assignment',
  'anonymous cannot execute revoke workflow'
);

reset role;
select ok(
  exists (
    select 1
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('assign_role', 'revoke_role_assignment')
      and p.prosecdef
      and p.proconfig @> array['search_path=public']
    having count(*) = 2
  ),
  'role workflow functions are security definer with fixed public search_path'
);
select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in ('assign_role', 'revoke_role_assignment')
      and grantee in ('PUBLIC', 'anon')
  ),
  'PUBLIC and anon cannot execute role workflow functions'
);
select ok(
  exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in ('assign_role', 'revoke_role_assignment')
      and grantee = 'authenticated'
    having count(*) = 2
  ),
  'authenticated receives minimal execute on controlled role workflow functions'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.revoke_role_assignment((select id from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)), 'Access no longer required') $$,
  'authorized revocation succeeds'
);
select is(
  (select assignment_status from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)),
  'revoked',
  'revocation marks assignment revoked'
);
select isnt(
  (select revoked_at from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)),
  null::timestamptz,
  'revocation timestamp is database generated'
);
select is(
  (select revoked_by from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)),
  '00000000-0000-4000-8000-000000001301'::uuid,
  'revoked by actor is derived from auth context'
);
select is(
  (select count(*)::integer from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)),
  1,
  'revoked assignment remains historically present'
);
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001303', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  public.has_permission('audit.view', '00000000-0000-4000-8000-000000001101', null),
  false,
  'revoked assignment no longer participates in authorization'
);
reset role;
insert into public.user_role_assignments (
  id, organization_id, clinic_id, user_profile_id, role_id, assignment_status, assigned_at, assigned_by
)
select
  '00000000-0000-4000-8000-000000001906',
  '00000000-0000-4000-8000-000000001101',
  null::uuid,
  '00000000-0000-4000-8000-000000001303',
  r.id,
  'active',
  now() + interval '1 day',
  '00000000-0000-4000-8000-000000001301'
from public.roles r
where r.organization_id is null
  and r.name = 'auditor';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001303', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  public.has_permission('audit.view', '00000000-0000-4000-8000-000000001101', null),
  false,
  'future effective assignment does not participate before start time'
);
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.revoke_role_assignment((select id from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)), '') $$,
  '23514',
  null,
  'revocation reason is required'
);
select throws_ok(
  $$ select public.revoke_role_assignment((select id from public.user_role_assignments where organization_id = '00000000-0000-4000-8000-000000001101' and clinic_id is null and user_profile_id = '00000000-0000-4000-8000-000000001303' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)), 'Repeated revoke') $$,
  '23514',
  null,
  'repeated revocation fails deterministically'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001306', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.revoke_role_assignment('00000000-0000-4000-8000-000000001905'::uuid, 'Cross tenant revoke') $$,
  '42501',
  null,
  'cross-tenant revocation is rejected'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001302', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.revoke_role_assignment('00000000-0000-4000-8000-000000001901'::uuid, 'Clinic admin org revoke') $$,
  '42501',
  null,
  'clinic admin cannot revoke organization-wide assignment'
);

select * from finish();

rollback;
