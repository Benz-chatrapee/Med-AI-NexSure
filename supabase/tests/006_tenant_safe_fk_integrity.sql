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
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'fk.alpha.user.test@example.invalid',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000602',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'fk.beta.user.test@example.invalid',
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
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'FK Alpha User',
    'fk.alpha.user.test@example.invalid',
    'Doctor',
    'Clinical'
  ),
  (
    '00000000-0000-4000-8000-000000000602',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    'FK Beta User',
    'fk.beta.user.test@example.invalid',
    'Doctor',
    'Clinical'
  )
on conflict (id) do nothing;

insert into public.roles (id, organization_id, name, description, is_system_role)
values
  (
    '00000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000101',
    'alpha_custom_operator',
    'Synthetic Alpha custom role',
    false
  )
on conflict (id) do nothing;

select is(
  (
    select count(*)::integer
    from public.organization_memberships om
    join public.user_profiles up on up.id = om.user_profile_id
    where om.organization_id <> up.organization_id
  ),
  0,
  'preflight: organization memberships do not reference profiles from another organization'
);

select is(
  (
    select count(*)::integer
    from public.clinic_memberships cm
    join public.user_profiles up on up.id = cm.user_profile_id
    where cm.organization_id <> up.organization_id
  ),
  0,
  'preflight: clinic memberships do not reference profiles from another organization'
);

select is(
  (
    select count(*)::integer
    from public.clinic_memberships cm
    join public.clinics c on c.id = cm.clinic_id
    where cm.organization_id <> c.organization_id
  ),
  0,
  'preflight: clinic memberships use clinics from the same organization'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments ura
    join public.user_profiles up on up.id = ura.user_profile_id
    where ura.organization_id <> up.organization_id
  ),
  0,
  'preflight: current role assignments do not reference profiles from another organization'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments ura
    join public.clinics c on c.id = ura.clinic_id
    where ura.clinic_id is not null
      and ura.organization_id <> c.organization_id
  ),
  0,
  'preflight: current role assignments use clinics from the same organization'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where r.organization_id is not null
      and ura.organization_id <> r.organization_id
  ),
  0,
  'preflight: current role assignments do not use roles from another organization'
);

select lives_ok(
  $$
    insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
    values (
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000601',
      'active'
    )
  $$,
  'valid same-organization membership is accepted'
);

select throws_ok(
  $$
    insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
    values (
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000601',
      'active'
    )
  $$,
  '23503',
  null,
  'cross-organization membership is rejected by tenant-safe profile FK'
);

select lives_ok(
  $$
    insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
    values (
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000202',
      '00000000-0000-4000-8000-000000000601',
      'active'
    )
  $$,
  'valid same-organization clinic membership is accepted'
);

select throws_ok(
  $$
    insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
    values (
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000601',
      'active'
    )
  $$,
  '23503',
  null,
  'cross-organization clinic membership is rejected by tenant-safe profile FK'
);

select lives_ok(
  $$
    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    select
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  'valid clinic-scoped assignment to a platform role is accepted'
);

select throws_ok(
  $$
    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    select
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  '23503',
  null,
  'cross-organization current role assignment is rejected by tenant-safe profile FK'
);

select throws_ok(
  $$
    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    select
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  '23503',
  null,
  'cross-clinic organization mismatch is rejected by tenant-safe clinic FK'
);

select throws_ok(
  $$
    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    values (
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000602',
      '00000000-0000-4000-8000-000000000701'
    )
  $$,
  '23514',
  null,
  'organization-scoped role cannot be assigned in another organization'
);

select throws_ok(
  $$
    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    select
      '00000000-0000-4000-8000-000000000101',
      null::uuid,
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor';

    insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
    select
      '00000000-0000-4000-8000-000000000101',
      null::uuid,
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  '23505',
  null,
  'duplicate current organization-level role assignment is rejected'
);

select lives_ok(
  $$
    insert into public.user_roles (organization_id, clinic_id, user_id, role_id)
    select
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  'valid legacy user_roles assignment is accepted for compatibility'
);

select throws_ok(
  $$
    insert into public.user_roles (organization_id, clinic_id, user_id, role_id)
    select
      '00000000-0000-4000-8000-000000000102',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000601',
      r.id
    from public.roles r
    where r.organization_id is null and r.name = 'doctor'
  $$,
  '23503',
  null,
  'cross-organization legacy user_roles assignment is rejected by tenant-safe profile FK'
);

select throws_ok(
  $$
    insert into public.role_permissions (role_id, permission_id)
    values (
      '00000000-0000-4000-8000-000000000701',
      '00000000-0000-4000-8000-000000000999'
    )
  $$,
  '23503',
  null,
  'orphan role-permission mapping is rejected'
);

select * from finish();

rollback;
