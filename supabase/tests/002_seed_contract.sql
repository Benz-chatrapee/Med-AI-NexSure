begin;

create extension if not exists pgtap with schema extensions;

select plan(42);

create or replace function public.test_run_demo_doctor_seed()
returns void
language plpgsql
as $$
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
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    phone_change, phone_change_token, email_change_token_current, reauthentication_token,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
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
    id, organization_id, primary_clinic_id, display_name, email, job_title, department, is_active
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
    organization_id, user_profile_id, membership_status, joined_at, is_active
  )
  select profile_record.organization_id, profile_record.id, 'active', now(), true
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
    organization_id, clinic_id, user_profile_id, membership_status, joined_at, is_active
  )
  select profile_record.organization_id, profile_record.primary_clinic_id, profile_record.id, 'active', now(), true
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
    organization_id, clinic_id, user_profile_id, role_id, assignment_status,
    assigned_at, expires_at, assignment_reason, revoked_at, revoked_by,
    revocation_reason, is_active
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
    id, organization_id, clinic_id, patient_code, display_label, date_of_birth,
    sex_at_birth, consent_status, consent_updated_at, created_by, updated_by, is_active
  )
  values (
    v_demo_patient_id, v_demo_organization_id, v_demo_clinic_id,
    'DEMO-PAT-BATCH-E-001', 'Synthetic Batch E Patient', date '1990-01-15',
    'unknown', 'granted', now(), v_demo_doctor_id, v_demo_doctor_id, true
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
    id, organization_id, clinic_id, patient_id, registration_number,
    registered_at, registration_status, created_by, updated_by, is_active
  )
  values (
    v_demo_registration_id, v_demo_organization_id, v_demo_clinic_id,
    v_demo_patient_id, 'DEMO-REG-BATCH-E-001', now(), 'active',
    v_demo_doctor_id, v_demo_doctor_id, true
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
    id, organization_id, clinic_id, patient_id, visit_number, department,
    attending_user_id, payer_name, visit_status, claim_status, risk_level,
    started_at, created_by, updated_by, is_active
  )
  values (
    v_demo_visit_id, v_demo_organization_id, v_demo_clinic_id, v_demo_patient_id,
    'DEMO-VIS-BATCH-E-001', 'Clinical Operations', v_demo_doctor_id,
    'Synthetic Demo Payer', 'in_consultation', 'needs_review', 'medium',
    current_date + time '09:00', v_demo_doctor_id, v_demo_doctor_id, true
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
    id, organization_id, clinic_id, visit_id, assessment_version, total_score,
    readiness_status, review_status, rule_set_version, calculated_by_type,
    calculated_by_user_id, calculated_at, is_current, created_by, updated_by, is_active
  )
  values (
    v_demo_assessment_id, v_demo_organization_id, v_demo_clinic_id, v_demo_visit_id,
    1, 82, 'needs_review', 'pending_review', 'batch-e-demo-v1', 'system',
    null, current_date + time '09:20', true, v_demo_doctor_id, v_demo_doctor_id, true
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
    id, organization_id, clinic_id, assessment_id, dimension_code, weight,
    raw_score, weighted_score, item_status, reason_code, reason_text,
    evidence_reference, created_by, updated_by, is_active
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

select is(
  (
    select count(*)::integer
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
  ),
  1,
  'configured local reset seed resolves app.seed_environment and creates the demo doctor once'
);

delete from public.claim_readiness_items
where assessment_id = '00000000-0000-4000-8000-000000000601';

delete from public.claim_readiness_assessments
where id = '00000000-0000-4000-8000-000000000601';

delete from public.visits
where id = '00000000-0000-4000-8000-000000000501';

delete from public.patient_clinic_registrations
where id = '00000000-0000-4000-8000-000000000401';

delete from public.patients
where id = '00000000-0000-4000-8000-000000000301';

delete from public.user_role_assignments
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.clinic_memberships
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.organization_memberships
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.user_profiles
where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from auth.users
where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

reset app.seed_environment;
select public.test_run_demo_doctor_seed();

select ok(
  not exists (
    select 1
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.user_profiles
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.organization_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.clinic_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.user_role_assignments
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.patients
    where id = '00000000-0000-4000-8000-000000000301'
  )
  and not exists (
    select 1
    from public.patient_clinic_registrations
    where id = '00000000-0000-4000-8000-000000000401'
  )
  and not exists (
    select 1
    from public.visits
    where id = '00000000-0000-4000-8000-000000000501'
  )
  and not exists (
    select 1
    from public.claim_readiness_assessments
    where id = '00000000-0000-4000-8000-000000000601'
  ),
  'missing environment fails closed for the complete demo identity and clinical fixture chain'
);

set local app.seed_environment = 'production';
select public.test_run_demo_doctor_seed();

select ok(
  not exists (
    select 1
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
  ),
  'production guard does not create the synthetic auth user'
);

select ok(
  not exists (
    select 1
    from public.user_profiles
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.organization_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.clinic_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.user_role_assignments
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.patients
    where id = '00000000-0000-4000-8000-000000000301'
  )
  and not exists (
    select 1
    from public.visits
    where id = '00000000-0000-4000-8000-000000000501'
  )
  and not exists (
    select 1
    from public.claim_readiness_assessments
    where id = '00000000-0000-4000-8000-000000000601'
  ),
  'production guard does not create demo profile, memberships, role assignment, or clinical fixture'
);

set local app.seed_environment = 'staging';
select public.test_run_demo_doctor_seed();

select ok(
  not exists (
    select 1
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.user_profiles
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.organization_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.clinic_memberships
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.user_role_assignments
    where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  )
  and not exists (
    select 1
    from public.patients
    where id = '00000000-0000-4000-8000-000000000301'
  )
  and not exists (
    select 1
    from public.visits
    where id = '00000000-0000-4000-8000-000000000501'
  )
  and not exists (
    select 1
    from public.claim_readiness_assessments
    where id = '00000000-0000-4000-8000-000000000601'
  ),
  'unknown environment fails closed for the complete demo identity and clinical fixture chain'
);

set local app.seed_environment = 'local';
select public.test_run_demo_doctor_seed();

select ok(
  exists (
    select 1
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
      and aud = 'authenticated'
      and role = 'authenticated'
      and is_super_admin = false
  ),
  'local guard permits the synthetic demo doctor auth fixture'
);

select ok(
  exists (
    select 1
    from auth.users u
    join public.user_profiles up on up.id = u.id
    join public.organization_memberships om on om.user_profile_id = up.id
      and om.organization_id = up.organization_id
    join public.clinic_memberships cm on cm.user_profile_id = up.id
      and cm.organization_id = up.organization_id
      and cm.clinic_id = up.primary_clinic_id
    join public.user_role_assignments ura on ura.user_profile_id = up.id
      and ura.organization_id = up.organization_id
      and ura.clinic_id = up.primary_clinic_id
    where u.id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and up.organization_id = '00000000-0000-4000-8000-000000000101'
      and up.primary_clinic_id = '00000000-0000-4000-8000-000000000201'
      and up.email = 'doctor.demo@nexsure.local'
      and up.is_active = true
      and up.deleted_at is null
      and om.membership_status = 'active'
      and om.is_active = true
      and om.deleted_at is null
      and cm.membership_status = 'active'
      and cm.is_active = true
      and cm.deleted_at is null
      and ura.assignment_status = 'active'
      and ura.is_active = true
      and ura.deleted_at is null
  ),
  'local guard creates the canonical auth to profile to membership to role assignment chain'
);

select ok(
  exists (
    select 1
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where ura.user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and ura.organization_id = '00000000-0000-4000-8000-000000000101'
      and ura.clinic_id = '00000000-0000-4000-8000-000000000201'
      and r.name = 'doctor'
      and r.organization_id is null
      and r.is_active = true
      and r.deleted_at is null
  ),
  'doctor role assignment resolves the active global doctor role by semantic identity'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where ura.user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and ura.organization_id = '00000000-0000-4000-8000-000000000101'
      and ura.clinic_id = '00000000-0000-4000-8000-000000000201'
      and ura.assignment_status = 'active'
      and ura.is_active = true
      and ura.deleted_at is null
      and r.name = 'doctor'
      and r.organization_id is null
      and r.is_active = true
      and r.deleted_at is null
  ),
  1,
  'role assignment is exactly one active canonical doctor assignment'
);

select ok(
  (
    select encrypted_password is not null
      and encrypted_password <> ''
      and encrypted_password like '$2a$10$%'
      and length(encrypted_password) = 60
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
  ),
  'demo auth fixture stores a populated bcrypt encrypted_password'
);

select ok(
  not exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.permissions p on p.id = rp.permission_id
    where ura.user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and p.permission_key in ('doctor:dashboard.read', 'claim.view')
      and rp.is_active = true
      and rp.deleted_at is null
      and p.is_active = true
      and p.deleted_at is null
  ),
  'demo doctor assignment does not grant doctor dashboard or claim view permissions'
);

select public.test_run_demo_doctor_seed();

select is(
  (
    select count(*)::integer
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
  ),
  1,
  'demo auth seed is idempotent'
);

select is(
  (
    select count(*)::integer
    from public.user_profiles
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
  ),
  1,
  'demo profile seed is idempotent'
);

select is(
  (
    select count(*)::integer
    from public.organization_memberships
    where organization_id = '00000000-0000-4000-8000-000000000101'
      and user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and membership_status = 'active'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'demo organization membership seed is idempotent'
);

select is(
  (
    select count(*)::integer
    from public.clinic_memberships
    where organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and membership_status = 'active'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'demo clinic membership seed is idempotent'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments
    where organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and assignment_status = 'active'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'demo doctor role assignment seed is idempotent'
);

select is(
  (
    select count(*)::integer
    from public.patients
    where id = '00000000-0000-4000-8000-000000000301'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and patient_code = 'DEMO-PAT-BATCH-E-001'
      and display_label = 'Synthetic Batch E Patient'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'local guard creates exactly one authorized synthetic patient'
);

select is(
  (
    select count(*)::integer
    from public.patient_clinic_registrations
    where id = '00000000-0000-4000-8000-000000000401'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and patient_id = '00000000-0000-4000-8000-000000000301'
      and registration_number = 'DEMO-REG-BATCH-E-001'
      and registration_status = 'active'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'local guard creates exactly one active patient clinic registration'
);

select is(
  (
    select count(*)::integer
    from public.visits
    where id = '00000000-0000-4000-8000-000000000501'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and patient_id = '00000000-0000-4000-8000-000000000301'
      and attending_user_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and visit_number = 'DEMO-VIS-BATCH-E-001'
      and visit_status = 'in_consultation'
      and claim_status = 'needs_review'
      and risk_level = 'medium'
      and started_at >= current_date
      and started_at < current_date + interval '1 day'
      and is_active = true
      and deleted_at is null
  ),
  1,
  'local guard creates exactly one today authorized visit assigned to the demo doctor'
);

select is(
  (
    select count(*)::integer
    from public.claim_readiness_assessments
    where id = '00000000-0000-4000-8000-000000000601'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and visit_id = '00000000-0000-4000-8000-000000000501'
      and assessment_version = 1
      and total_score = 82
      and readiness_status = 'needs_review'
      and review_status = 'pending_review'
      and rule_set_version = 'batch-e-demo-v1'
      and is_current = true
      and is_active = true
      and deleted_at is null
  ),
  1,
  'local guard creates exactly one current canonical readiness assessment'
);

select is(
  (
    select count(*)::integer
    from public.claim_readiness_items
    where assessment_id = '00000000-0000-4000-8000-000000000601'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and is_active = true
      and deleted_at is null
  ),
  6,
  'local guard creates six canonical readiness dimension items'
);

select is(
  (
    select coalesce(sum(weight), 0)::integer
    from public.claim_readiness_items
    where assessment_id = '00000000-0000-4000-8000-000000000601'
      and deleted_at is null
  ),
  100,
  'readiness item weights total the canonical 100 percent'
);

select is(
  (
    select coalesce(sum(weighted_score), 0)::integer
    from public.claim_readiness_items
    where assessment_id = '00000000-0000-4000-8000-000000000601'
      and deleted_at is null
  ),
  82,
  'readiness item weighted scores reconcile to the assessment score'
);

select ok(
  exists (
    select 1
    from public.visits v
    join public.patients p on p.id = v.patient_id
    join public.patient_clinic_registrations pcr on pcr.patient_id = p.id
      and pcr.organization_id = v.organization_id
      and pcr.clinic_id = v.clinic_id
    join public.claim_readiness_assessments cra on cra.visit_id = v.id
      and cra.organization_id = v.organization_id
      and cra.clinic_id = v.clinic_id
      and cra.is_current = true
    where v.id = '00000000-0000-4000-8000-000000000501'
      and v.organization_id = '00000000-0000-4000-8000-000000000101'
      and v.clinic_id = '00000000-0000-4000-8000-000000000201'
      and v.attending_user_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and v.started_at >= current_date
      and v.started_at < current_date + interval '1 day'
  ),
  'canonical dashboard dependency graph is tenant-scoped, clinic-scoped, assigned, current, and qualifies for today'
);

delete from public.claim_readiness_items
where assessment_id = '00000000-0000-4000-8000-000000000601';

delete from public.claim_readiness_assessments
where id = '00000000-0000-4000-8000-000000000601';

delete from public.visits
where id = '00000000-0000-4000-8000-000000000501';

delete from public.patient_clinic_registrations
where id = '00000000-0000-4000-8000-000000000401';

delete from public.patients
where id = '00000000-0000-4000-8000-000000000301';

delete from public.user_role_assignments
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.clinic_memberships
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.organization_memberships
where user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from public.user_profiles
where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

delete from auth.users
where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e';

set local app.seed_environment = 'demo';
select public.test_run_demo_doctor_seed();

select is(
  (
    select count(*)::integer
    from auth.users
    where id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and email = 'doctor.demo@nexsure.local'
  ),
  1,
  'demo guard permits the synthetic demo doctor auth fixture'
);

select is(
  (
    select count(*)::integer
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where ura.user_profile_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and ura.organization_id = '00000000-0000-4000-8000-000000000101'
      and ura.clinic_id = '00000000-0000-4000-8000-000000000201'
      and ura.assignment_status = 'active'
      and ura.is_active = true
      and ura.deleted_at is null
      and r.name = 'doctor'
      and r.organization_id is null
      and r.is_active = true
      and r.deleted_at is null
  ),
  1,
  'demo guard creates exactly one active canonical doctor assignment'
);

select is(
  (
    select count(*)::integer
    from public.visits
    where id = '00000000-0000-4000-8000-000000000501'
      and organization_id = '00000000-0000-4000-8000-000000000101'
      and clinic_id = '00000000-0000-4000-8000-000000000201'
      and attending_user_id = '7fd2c338-fc8b-414f-9d47-47e0a50dfe3e'
      and started_at >= current_date
      and started_at < current_date + interval '1 day'
  ),
  1,
  'demo guard creates the authorized today visit fixture'
);

select is(
  (
    select count(*)::integer
    from public.patients
    where id = '00000000-0000-4000-8000-000000000301'
  ),
  1,
  'demo guard creates exactly one synthetic patient fixture'
);

select is(
  (
    select count(*)::integer
    from public.patient_clinic_registrations
    where id = '00000000-0000-4000-8000-000000000401'
  ),
  1,
  'demo guard creates exactly one patient clinic registration fixture'
);

select is(
  (
    select count(*)::integer
    from public.claim_readiness_assessments
    where id = '00000000-0000-4000-8000-000000000601'
      and is_current = true
  ),
  1,
  'demo guard creates exactly one current readiness assessment fixture'
);

select * from finish();

rollback;
