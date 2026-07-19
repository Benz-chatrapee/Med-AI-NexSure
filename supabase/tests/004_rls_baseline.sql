begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

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
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls.alpha.doctor.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls.beta.doctor.test@example.invalid',
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
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'RLS Alpha Doctor',
    'rls.alpha.doctor.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    'RLS Beta Doctor',
    'rls.beta.doctor.test@example.invalid',
    'Doctor',
    'Clinical'
  )
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000401', 'active'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000402', 'active')
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000401',
    'active'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000402',
    'active'
  )
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
select v.organization_id, v.clinic_id, v.user_profile_id, r.id
from (
  values
    (
      '00000000-0000-4000-8000-000000000101'::uuid,
      '00000000-0000-4000-8000-000000000201'::uuid,
      '00000000-0000-4000-8000-000000000401'::uuid,
      'doctor'::text
    ),
    (
      '00000000-0000-4000-8000-000000000101'::uuid,
      '00000000-0000-4000-8000-000000000201'::uuid,
      '00000000-0000-4000-8000-000000000401'::uuid,
      'receptionist'::text
    ),
    (
      '00000000-0000-4000-8000-000000000102'::uuid,
      '00000000-0000-4000-8000-000000000203'::uuid,
      '00000000-0000-4000-8000-000000000402'::uuid,
      'doctor'::text
    )
) as v(organization_id, clinic_id, user_profile_id, role_name)
join public.roles r on r.organization_id is null and r.name = v.role_name
on conflict (organization_id, clinic_id, user_profile_id, role_id) do nothing;

insert into public.patients (id, organization_id, clinic_id, patient_code, display_label, consent_status, created_by)
values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'TEST-ALPHA-001',
    'Synthetic Alpha Patient',
    'granted',
    '00000000-0000-4000-8000-000000000401'
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    'TEST-BETA-001',
    'Synthetic Beta Patient',
    'granted',
    '00000000-0000-4000-8000-000000000402'
  )
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000401', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (select count(*)::integer from public.organizations),
  1,
  'RLS exposes only the authenticated user organization'
);
select is(
  (select count(*)::integer from public.clinics),
  1,
  'RLS exposes only the authenticated user clinic'
);
select is(
  (select count(*)::integer from public.patients where patient_code = 'TEST-ALPHA-001'),
  1,
  'RLS allows patient read in authorized clinic'
);
select is(
  (select count(*)::integer from public.patients where patient_code = 'TEST-BETA-001'),
  0,
  'RLS denies cross-organization patient read'
);
select lives_ok(
  $$
    insert into public.patients (organization_id, clinic_id, patient_code, display_label, consent_status)
    values (
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000201',
      'TEST-ALPHA-INSERT',
      'Synthetic Alpha Insert',
      'granted'
    )
  $$,
  'RLS allows patient insert with patient.create permission'
);
select throws_ok(
  $$
    insert into public.patients (organization_id, clinic_id, patient_code, display_label, consent_status)
    values (
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000203',
      'TEST-BETA-BLOCKED',
      'Synthetic Cross Tenant Insert',
      'granted'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "patients"',
  'RLS denies cross-organization patient insert'
);

select is(
  (select count(*)::integer from public.user_role_assignments),
  2,
  'role assignment policy exposes only self assignments without role.assign'
);
select is(
  (select count(*)::integer from public.audit_logs),
  0,
  'audit read policy hides logs without audit.view permission'
);

select throws_ok(
  $$
    update public.permissions
    set description = 'blocked escalation attempt'
    where permission_key = 'role.assign'
  $$,
  '42501',
  'permission denied for table permissions',
  'authenticated cannot mutate permission catalogue directly'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select throws_ok(
  $$ select count(*) from public.patients $$,
  '42501',
  'permission denied for table patients',
  'anon cannot read protected patient table'
);

select * from finish();

rollback;
