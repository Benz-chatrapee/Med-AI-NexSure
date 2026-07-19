begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

insert into public.organizations (
  id, name, legal_name, registration_number, country_code, timezone, code, organization_type, locale, is_active
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'NexSure Alpha Hospital',
    'NexSure Alpha Hospital Co., Ltd.',
    'TEST-ORG-ALPHA',
    'TH',
    'Asia/Bangkok',
    'NX_ALPHA',
    'healthcare_provider',
    'en-TH',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'NexSure Beta Clinic',
    'NexSure Beta Clinic Co., Ltd.',
    'TEST-ORG-BETA',
    'TH',
    'Asia/Bangkok',
    'NX_BETA',
    'healthcare_provider',
    'th-TH',
    true
  )
on conflict (id) do nothing;

insert into public.clinics (id, organization_id, name, code, clinic_type, is_primary)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Alpha Main Clinic', 'ALPHA_MAIN', 'hospital', true),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'Alpha Satellite Clinic', 'ALPHA_SAT', 'clinic', false),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000102', 'Beta Main Clinic', 'BETA_MAIN', 'clinic', true)
on conflict (id) do nothing;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha.doctor.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha.suspended.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha.inactive.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000304',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha.revoked.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000305',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha.expired.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
on conflict (id) do nothing;

insert into public.user_profiles (id, organization_id, primary_clinic_id, display_name, email, job_title, department)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Alpha Test Doctor',
    'alpha.doctor.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Alpha Suspended User',
    'alpha.suspended.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Alpha Inactive User',
    'alpha.inactive.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000304',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Alpha Revoked User',
    'alpha.revoked.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000305',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Alpha Expired User',
    'alpha.expired.test@example.invalid',
    'Doctor',
    'Clinical'
  )
on conflict (id) do nothing;

update public.user_profiles
set is_active = false
where id = '00000000-0000-4000-8000-000000000303';

insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000301', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000302', 'suspended'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000303', 'active'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000304', 'revoked'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000305', 'active')
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000301',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000302',
    'suspended'
  ),
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000303',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000304',
    'revoked'
  ),
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000305',
    'active'
  )
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
select
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000301',
  r.id
from public.roles r
where r.organization_id is null
  and r.name = 'doctor'
on conflict (organization_id, clinic_id, user_profile_id, role_id) do nothing;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id, assignment_status, assigned_at, expires_at)
select
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  v.user_profile_id,
  r.id,
  v.assignment_status,
  now() - interval '2 days',
  v.expires_at
from (
  values
    ('00000000-0000-4000-8000-000000000304'::uuid, 'revoked'::text, null::timestamptz),
    ('00000000-0000-4000-8000-000000000305'::uuid, 'active'::text, now() - interval '1 day')
) as v(user_profile_id, assignment_status, expires_at)
join public.roles r on r.organization_id is null and r.name = 'doctor'
on conflict (organization_id, clinic_id, user_profile_id, role_id) do update
set assignment_status = excluded.assignment_status,
    assigned_at = excluded.assigned_at,
    expires_at = excluded.expires_at;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.current_user_profile_id(),
  '00000000-0000-4000-8000-000000000301'::uuid,
  'auth.uid resolves to active profile'
);
select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000101'),
  true,
  'active organization membership is allowed'
);
select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000102'),
  false,
  'cross-organization membership is denied'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  true,
  'active clinic membership is allowed'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202'),
  false,
  'unassigned sibling clinic access is denied for clinic-scoped role'
);
select is(
  public.has_permission('soap.update', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  true,
  'canonical permission is allowed for active role assignment'
);
select is(
  public.has_permission('role.assign', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'unassigned high-risk permission is denied'
);
select is(
  public.has_permission('soap:update', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'legacy colon permission is not accepted by standardized helper'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000302', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000101'),
  false,
  'suspended organization membership is denied'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'suspended clinic membership is denied'
);
select is(
  public.has_permission('soap.update', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'suspended user has no role-derived permission'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000303', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.current_user_profile_id(),
  null::uuid,
  'inactive profile fails closed'
);
select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000101'),
  false,
  'inactive profile cannot establish organization membership'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000304', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.is_organization_member('00000000-0000-4000-8000-000000000101'),
  false,
  'revoked organization membership is denied'
);
select is(
  public.has_clinic_access('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'revoked clinic membership is denied'
);
select is(
  public.has_permission('soap.update', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'revoked assignment is denied'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.has_permission('soap.update', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201'),
  false,
  'expired assignment is denied'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role anon;

select throws_ok(
  $$ select public.has_permission('soap.update', '00000000-0000-4000-8000-000000000101'::uuid, '00000000-0000-4000-8000-000000000201'::uuid) $$,
  '42501',
  'permission denied for function has_permission',
  'anon cannot execute standardized authorization helper'
);

select * from finish();

rollback;
