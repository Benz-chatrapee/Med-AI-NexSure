-- Med AI NexSure local database seed.
-- Synthetic, demo-safe fixtures only. Do not add real PHI, PII, clinical facts, or payer policy data.

insert into public.organizations (
  id,
  name,
  legal_name,
  registration_number,
  country_code,
  timezone,
  code,
  organization_type,
  locale,
  is_active
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
  id,
  organization_id,
  name,
  code,
  address_line,
  province,
  country_code,
  phone,
  clinic_type,
  is_primary,
  is_active
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

-- User/auth/profile fixtures are created inside pgTAP transactions because local auth.users
-- fixture support must stay test-scoped and must not be treated as production seed behavior.
