begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

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
on conflict (id) do update
set name = excluded.name,
    legal_name = excluded.legal_name,
    registration_number = excluded.registration_number,
    country_code = excluded.country_code,
    timezone = excluded.timezone,
    code = excluded.code,
    organization_type = excluded.organization_type,
    locale = excluded.locale,
    is_active = excluded.is_active,
    deleted_at = null,
    deleted_by = null,
    updated_at = now();

insert into public.clinics (
  id, organization_id, name, code, address_line, province, country_code, phone, clinic_type, is_primary, is_active
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    'Alpha Main Clinic',
    'ALPHA_MAIN',
    'Synthetic local fixture address',
    'Bangkok',
    'TH',
    '+66000000001',
    'hospital',
    true,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000101',
    'Alpha Satellite Clinic',
    'ALPHA_SAT',
    'Synthetic local fixture address',
    'Bangkok',
    'TH',
    '+66000000002',
    'clinic',
    false,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000102',
    'Beta Main Clinic',
    'BETA_MAIN',
    'Synthetic local fixture address',
    'Chiang Mai',
    'TH',
    '+66000000003',
    'clinic',
    true,
    true
  )
on conflict (id) do update
set organization_id = excluded.organization_id,
    name = excluded.name,
    code = excluded.code,
    address_line = excluded.address_line,
    province = excluded.province,
    country_code = excluded.country_code,
    phone = excluded.phone,
    clinic_type = excluded.clinic_type,
    is_primary = excluded.is_primary,
    is_active = excluded.is_active,
    deleted_at = null,
    deleted_by = null,
    updated_at = now();

select is(
  (select count(*)::integer from public.organizations where code in ('NX_ALPHA', 'NX_BETA')),
  2,
  'local seed creates two synthetic organizations'
);

select is(
  (select count(*)::integer from public.clinics where code in ('ALPHA_MAIN', 'ALPHA_SAT', 'BETA_MAIN')),
  3,
  'local seed creates three synthetic clinics'
);

select is(
  (
    select count(*)::integer
    from public.clinics c
    join public.organizations o on o.id = c.organization_id
    where o.code = 'NX_ALPHA'
      and c.code in ('ALPHA_MAIN', 'ALPHA_SAT')
  ),
  2,
  'Alpha organization has two seeded clinics'
);

select is(
  (
    select count(*)::integer
    from public.clinics c
    join public.organizations o on o.id = c.organization_id
    where o.code = 'NX_BETA'
      and c.code = 'BETA_MAIN'
  ),
  1,
  'Beta organization has one seeded clinic'
);

select ok(
  exists (
    select 1 from public.clinics
    where id = '00000000-0000-4000-8000-000000000201'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and is_primary
  ),
  'Alpha main clinic uses deterministic tenant-safe IDs'
);

select ok(
  not exists (
    select 1
    from public.organizations
    where code in ('NX_ALPHA', 'NX_BETA')
      and (deleted_at is not null or is_active = false)
  ),
  'seed organizations are active and undeleted'
);

select ok(
  not exists (
    select 1
    from public.clinics
    where code in ('ALPHA_MAIN', 'ALPHA_SAT', 'BETA_MAIN')
      and (deleted_at is not null or is_active = false)
  ),
  'seed clinics are active and undeleted'
);

select ok(
  exists (select 1 from public.permissions where permission_key = 'role.assign'),
  'canonical RBAC permission seed exists from migrations'
);

select ok(
  exists (select 1 from public.roles where organization_id is null and name = 'organization_admin'),
  'canonical organization_admin role seed exists from migrations'
);

select ok(
  exists (
    select 1
    from public.role_permissions rp
    join public.roles r on r.id = rp.role_id
    join public.permissions p on p.id = rp.permission_id
    where r.name = 'doctor'
      and p.permission_key = 'soap.update'
  ),
  'doctor role has expected SOAP update permission'
);

select lives_ok(
  $$
    insert into public.organizations (id, name, code)
    values ('00000000-0000-4000-8000-000000000101', 'NexSure Alpha Hospital', 'NX_ALPHA')
    on conflict (id) do update set code = excluded.code
  $$,
  'organization seed upsert pattern is idempotent'
);

select lives_ok(
  $$
    insert into public.clinics (id, organization_id, name, code)
    values (
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000101',
      'Alpha Main Clinic',
      'ALPHA_MAIN'
    )
    on conflict (id) do update set code = excluded.code
  $$,
  'clinic seed upsert pattern is idempotent'
);

select * from finish();

rollback;
