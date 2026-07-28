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

do $$
declare
  v_seed_environment text := lower(coalesce(nullif(current_setting('app.seed_environment', true), ''), ''));
  v_demo_doctor_id uuid := '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';
  v_demo_doctor_email text := 'doctor.demo@nexsure.local';
  v_demo_doctor_password_hash text := '$2a$10$wMU7zX3IWMnOwVXbkCEnc.klenxCW4BvuqKcaettW4kvkVYDDxCT2';
  v_demo_organization_id uuid := '00000000-0000-4000-8000-000000000101';
  v_demo_clinic_id uuid := '00000000-0000-4000-8000-000000000201';
  v_demo_patient_id uuid := '00000000-0000-4000-8000-000000000301';
  v_demo_registration_id uuid := '00000000-0000-4000-8000-000000000401';
  v_demo_visit_id uuid := '00000000-0000-4000-8000-000000000501';
  v_demo_assessment_id uuid := '00000000-0000-4000-8000-000000000601';
  v_doctor_role_id uuid;
begin
  if v_seed_environment not in ('local', 'demo') then
    return;
  end if;

  select role_record.id
  into v_doctor_role_id
  from public.roles role_record
  where role_record.name = 'doctor'
    and role_record.organization_id is null
    and role_record.is_active = true
    and role_record.deleted_at is null;

  if v_doctor_role_id is null then
    raise exception 'Canonical active global doctor role is required for demo doctor seed';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone_change,
    phone_change_token,
    email_change_token_current,
    reauthentication_token,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_demo_doctor_id,
    'authenticated',
    'authenticated',
    v_demo_doctor_email,
    v_demo_doctor_password_hash,
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Dr. Demo Doctor"}'::jsonb,
    false
  )
  on conflict (id) do update
  set aud = excluded.aud,
      role = excluded.role,
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
      confirmation_token = excluded.confirmation_token,
      recovery_token = excluded.recovery_token,
      email_change_token_new = excluded.email_change_token_new,
      email_change = excluded.email_change,
      phone_change = excluded.phone_change,
      phone_change_token = excluded.phone_change_token,
      email_change_token_current = excluded.email_change_token_current,
      reauthentication_token = excluded.reauthentication_token,
      updated_at = now(),
      raw_app_meta_data = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data;

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    v_demo_doctor_id,
    v_demo_doctor_id,
    v_demo_doctor_id::text,
    jsonb_build_object(
      'sub', v_demo_doctor_id::text,
      'email', v_demo_doctor_email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider_id, provider) do update
  set user_id = excluded.user_id,
      identity_data = excluded.identity_data,
      updated_at = now();

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
  values (
    v_demo_doctor_id,
    v_demo_organization_id,
    v_demo_clinic_id,
    'Dr. Demo Doctor',
    v_demo_doctor_email,
    'Doctor',
    'Clinical Operations',
    true
  )
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      primary_clinic_id = excluded.primary_clinic_id,
      display_name = excluded.display_name,
      email = excluded.email,
      job_title = excluded.job_title,
      department = excluded.department,
      is_active = excluded.is_active,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.organization_memberships (
    organization_id,
    user_profile_id,
    membership_status,
    joined_at,
    is_active
  )
  select
    profile_record.organization_id,
    profile_record.id,
    'active',
    now(),
    true
  from public.user_profiles profile_record
  join public.organizations organization_record
    on organization_record.id = profile_record.organization_id
  where profile_record.id = v_demo_doctor_id
    and profile_record.email = v_demo_doctor_email
    and profile_record.organization_id = v_demo_organization_id
    and profile_record.primary_clinic_id = v_demo_clinic_id
    and profile_record.is_active = true
    and profile_record.deleted_at is null
    and organization_record.is_active = true
    and organization_record.deleted_at is null
  on conflict (organization_id, user_profile_id) do update
  set membership_status = excluded.membership_status,
      is_active = excluded.is_active,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.clinic_memberships (
    organization_id,
    clinic_id,
    user_profile_id,
    membership_status,
    joined_at,
    is_active
  )
  select
    profile_record.organization_id,
    profile_record.primary_clinic_id,
    profile_record.id,
    'active',
    now(),
    true
  from public.user_profiles profile_record
  join public.organizations organization_record
    on organization_record.id = profile_record.organization_id
  join public.clinics clinic_record
    on clinic_record.organization_id = organization_record.id
    and clinic_record.id = profile_record.primary_clinic_id
  join public.organization_memberships organization_membership
    on organization_membership.organization_id = organization_record.id
    and organization_membership.user_profile_id = profile_record.id
  where profile_record.id = v_demo_doctor_id
    and profile_record.email = v_demo_doctor_email
    and organization_record.id = v_demo_organization_id
    and clinic_record.id = v_demo_clinic_id
    and profile_record.is_active = true
    and profile_record.deleted_at is null
    and organization_record.is_active = true
    and organization_record.deleted_at is null
    and clinic_record.is_active = true
    and clinic_record.deleted_at is null
    and organization_membership.membership_status = 'active'
    and organization_membership.is_active = true
    and organization_membership.deleted_at is null
  on conflict (organization_id, clinic_id, user_profile_id) do update
  set membership_status = excluded.membership_status,
      is_active = excluded.is_active,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.user_role_assignments (
    organization_id,
    clinic_id,
    user_profile_id,
    role_id,
    assignment_status,
    assigned_at,
    expires_at,
    assignment_reason,
    revoked_at,
    revoked_by,
    revocation_reason,
    is_active
  )
  select
    organization_record.id,
    clinic_record.id,
    profile_record.id,
    v_doctor_role_id,
    'active',
    now(),
    null,
    'Phase 5 Batch E demo doctor seed fixture',
    null,
    null,
    null,
    true
  from public.user_profiles profile_record
  join public.organizations organization_record
    on organization_record.id = profile_record.organization_id
  join public.clinics clinic_record
    on clinic_record.organization_id = organization_record.id
    and clinic_record.id = profile_record.primary_clinic_id
  join public.organization_memberships organization_membership
    on organization_membership.organization_id = organization_record.id
    and organization_membership.user_profile_id = profile_record.id
  join public.clinic_memberships clinic_membership
    on clinic_membership.organization_id = organization_record.id
    and clinic_membership.clinic_id = clinic_record.id
    and clinic_membership.user_profile_id = profile_record.id
  where profile_record.id = v_demo_doctor_id
    and profile_record.email = v_demo_doctor_email
    and organization_record.id = v_demo_organization_id
    and clinic_record.id = v_demo_clinic_id
    and profile_record.is_active = true
    and profile_record.deleted_at is null
    and organization_record.is_active = true
    and organization_record.deleted_at is null
    and clinic_record.is_active = true
    and clinic_record.deleted_at is null
    and organization_membership.membership_status = 'active'
    and organization_membership.is_active = true
    and organization_membership.deleted_at is null
    and clinic_membership.membership_status = 'active'
    and clinic_membership.is_active = true
    and clinic_membership.deleted_at is null
  on conflict (organization_id, clinic_id, user_profile_id, role_id) do update
  set assignment_status = 'active',
      expires_at = null,
      assignment_reason = excluded.assignment_reason,
      revoked_at = null,
      revoked_by = null,
      revocation_reason = null,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.patients (
    id,
    organization_id,
    clinic_id,
    patient_code,
    display_label,
    date_of_birth,
    sex_at_birth,
    consent_status,
    consent_updated_at,
    created_by,
    updated_by,
    is_active
  )
  values (
    v_demo_patient_id,
    v_demo_organization_id,
    v_demo_clinic_id,
    'DEMO-PAT-BATCH-E-001',
    'Synthetic Batch E Patient',
    date '1990-01-15',
    'unknown',
    'granted',
    now(),
    v_demo_doctor_id,
    v_demo_doctor_id,
    true
  )
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      clinic_id = excluded.clinic_id,
      patient_code = excluded.patient_code,
      display_label = excluded.display_label,
      date_of_birth = excluded.date_of_birth,
      sex_at_birth = excluded.sex_at_birth,
      consent_status = excluded.consent_status,
      consent_updated_at = excluded.consent_updated_at,
      updated_by = excluded.updated_by,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.patient_clinic_registrations (
    id,
    organization_id,
    clinic_id,
    patient_id,
    registration_number,
    registered_at,
    registration_status,
    created_by,
    updated_by,
    is_active
  )
  values (
    v_demo_registration_id,
    v_demo_organization_id,
    v_demo_clinic_id,
    v_demo_patient_id,
    'DEMO-REG-BATCH-E-001',
    now(),
    'active',
    v_demo_doctor_id,
    v_demo_doctor_id,
    true
  )
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      clinic_id = excluded.clinic_id,
      patient_id = excluded.patient_id,
      registration_number = excluded.registration_number,
      registration_status = excluded.registration_status,
      updated_by = excluded.updated_by,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.visits (
    id,
    organization_id,
    clinic_id,
    patient_id,
    visit_number,
    department,
    attending_user_id,
    payer_name,
    visit_status,
    claim_status,
    risk_level,
    started_at,
    created_by,
    updated_by,
    is_active
  )
  values (
    v_demo_visit_id,
    v_demo_organization_id,
    v_demo_clinic_id,
    v_demo_patient_id,
    'DEMO-VIS-BATCH-E-001',
    'Clinical Operations',
    v_demo_doctor_id,
    'Synthetic Demo Payer',
    'in_consultation',
    'needs_review',
    'medium',
    current_date + time '09:00',
    v_demo_doctor_id,
    v_demo_doctor_id,
    true
  )
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      clinic_id = excluded.clinic_id,
      patient_id = excluded.patient_id,
      visit_number = excluded.visit_number,
      department = excluded.department,
      attending_user_id = excluded.attending_user_id,
      payer_name = excluded.payer_name,
      visit_status = excluded.visit_status,
      claim_status = excluded.claim_status,
      risk_level = excluded.risk_level,
      started_at = excluded.started_at,
      updated_by = excluded.updated_by,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.claim_readiness_assessments (
    id,
    organization_id,
    clinic_id,
    visit_id,
    assessment_version,
    total_score,
    readiness_status,
    review_status,
    rule_set_version,
    calculated_by_type,
    calculated_by_user_id,
    calculated_at,
    is_current,
    created_by,
    updated_by,
    is_active
  )
  values (
    v_demo_assessment_id,
    v_demo_organization_id,
    v_demo_clinic_id,
    v_demo_visit_id,
    1,
    82,
    'needs_review',
    'pending_review',
    'batch-e-demo-v1',
    'system',
    null,
    current_date + time '09:20',
    true,
    v_demo_doctor_id,
    v_demo_doctor_id,
    true
  )
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      clinic_id = excluded.clinic_id,
      visit_id = excluded.visit_id,
      assessment_version = excluded.assessment_version,
      total_score = excluded.total_score,
      readiness_status = excluded.readiness_status,
      review_status = excluded.review_status,
      rule_set_version = excluded.rule_set_version,
      calculated_by_type = excluded.calculated_by_type,
      calculated_by_user_id = excluded.calculated_by_user_id,
      calculated_at = excluded.calculated_at,
      is_current = true,
      updated_by = excluded.updated_by,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();

  insert into public.claim_readiness_items (
    id,
    organization_id,
    clinic_id,
    assessment_id,
    dimension_code,
    weight,
    raw_score,
    weighted_score,
    item_status,
    reason_code,
    reason_text,
    evidence_reference,
    created_by,
    updated_by,
    is_active
  )
  values
    ('00000000-0000-4000-8000-000000000611', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'soap', 25, 80, 20, 'needs_review', 'DEMO_SOAP_REVIEW', 'SOAP Plan Rationale', 'synthetic:soap-note-check', v_demo_doctor_id, v_demo_doctor_id, true),
    ('00000000-0000-4000-8000-000000000612', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'diagnosis_icd', 20, 90, 18, 'complete', 'DEMO_ICD_PRESENT', 'Diagnosis and ICD documented', 'synthetic:diagnosis-check', v_demo_doctor_id, v_demo_doctor_id, true),
    ('00000000-0000-4000-8000-000000000613', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'prescription_procedure', 15, 80, 12, 'needs_review', 'DEMO_TREATMENT_REVIEW', 'Treatment evidence requires human review', 'synthetic:treatment-check', v_demo_doctor_id, v_demo_doctor_id, true),
    ('00000000-0000-4000-8000-000000000614', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'evidence', 20, 80, 16, 'needs_review', 'DEMO_EVIDENCE_REVIEW', 'Supporting evidence requires review', 'synthetic:evidence-check', v_demo_doctor_id, v_demo_doctor_id, true),
    ('00000000-0000-4000-8000-000000000615', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'payer_rule', 10, 80, 8, 'needs_review', 'DEMO_PAYER_REVIEW', 'Payer rule alignment requires review', 'synthetic:payer-rule-check', v_demo_doctor_id, v_demo_doctor_id, true),
    ('00000000-0000-4000-8000-000000000616', v_demo_organization_id, v_demo_clinic_id, v_demo_assessment_id, 'economic', 10, 80, 8, 'needs_review', 'DEMO_ECON_REVIEW', 'Economic justification requires review', 'synthetic:economic-check', v_demo_doctor_id, v_demo_doctor_id, true)
  on conflict (id) do update
  set organization_id = excluded.organization_id,
      clinic_id = excluded.clinic_id,
      assessment_id = excluded.assessment_id,
      dimension_code = excluded.dimension_code,
      weight = excluded.weight,
      raw_score = excluded.raw_score,
      weighted_score = excluded.weighted_score,
      item_status = excluded.item_status,
      reason_code = excluded.reason_code,
      reason_text = excluded.reason_text,
      evidence_reference = excluded.evidence_reference,
      updated_by = excluded.updated_by,
      is_active = true,
      deleted_at = null,
      deleted_by = null,
      updated_at = now();
end $$;
