-- Med AI NexSure MVP 1 clinical, claim, evidence, and organization settings tables.

create table if not exists public.patient_clinic_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  patient_id uuid not null references public.patients(id) on delete restrict,
  registration_number text not null,
  registered_at timestamptz not null default now(),
  registration_status text not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_patient_clinic_registrations_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_patient_clinic_registration_number unique (organization_id, clinic_id, registration_number),
  constraint uq_patient_clinic_registration_patient unique (organization_id, clinic_id, patient_id),
  constraint ck_patient_clinic_registration_status check (registration_status in ('active', 'inactive', 'transferred'))
);

create table if not exists public.visit_vitals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  visit_id uuid not null references public.visits(id) on delete restrict,
  measured_at timestamptz not null default now(),
  temperature_c numeric(5, 2),
  systolic_bp integer,
  diastolic_bp integer,
  heart_rate_bpm integer,
  respiratory_rate_bpm integer,
  oxygen_saturation_percent numeric(5, 2),
  weight_kg numeric(8, 2),
  height_cm numeric(8, 2),
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_visit_vitals_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint ck_visit_vitals_bp check ((systolic_bp is null and diastolic_bp is null) or (systolic_bp > 0 and diastolic_bp > 0 and systolic_bp >= diastolic_bp)),
  constraint ck_visit_vitals_positive check (
    (temperature_c is null or temperature_c > 0) and
    (heart_rate_bpm is null or heart_rate_bpm > 0) and
    (respiratory_rate_bpm is null or respiratory_rate_bpm > 0) and
    (oxygen_saturation_percent is null or oxygen_saturation_percent between 0 and 100) and
    (weight_kg is null or weight_kg > 0) and
    (height_cm is null or height_cm > 0)
  )
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  code_system text not null default 'ICD-10',
  diagnosis_code text not null,
  display_name text not null,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_diagnoses_org_code unique (organization_id, code_system, diagnosis_code),
  constraint ck_diagnoses_effective_range check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table if not exists public.visit_diagnoses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  visit_id uuid not null references public.visits(id) on delete restrict,
  diagnosis_id uuid references public.diagnoses(id) on delete restrict,
  diagnosis_code text not null,
  diagnosis_text text not null,
  diagnosis_type text not null default 'secondary',
  coding_status text not null default 'draft',
  source_type text not null default 'human',
  model_name text,
  model_version text,
  confidence numeric(5, 2),
  accepted_by uuid references public.user_profiles(id),
  accepted_at timestamptz,
  edited_after_generation boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_visit_diagnoses_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint ck_visit_diagnoses_type check (diagnosis_type in ('primary', 'secondary', 'differential')),
  constraint ck_visit_diagnoses_status check (coding_status in ('draft', 'suggested', 'accepted', 'rejected', 'amended')),
  constraint ck_visit_diagnoses_source check (source_type in ('human', 'ai', 'import')),
  constraint ck_visit_diagnoses_confidence check (confidence is null or confidence between 0 and 100),
  constraint ck_visit_diagnoses_ai_acceptance check (source_type <> 'ai' or coding_status <> 'accepted' or (accepted_by is not null and accepted_at is not null))
);

alter table public.soap_notes add column if not exists source_type text not null default 'human';
alter table public.soap_notes add column if not exists model_name text;
alter table public.soap_notes add column if not exists model_version text;
alter table public.soap_notes add column if not exists confidence numeric(5, 2);
alter table public.soap_notes add column if not exists accepted_by uuid references public.user_profiles(id);
alter table public.soap_notes add column if not exists accepted_at timestamptz;
alter table public.soap_notes add column if not exists edited_after_generation boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ck_soap_notes_ai_confidence' and conrelid = 'public.soap_notes'::regclass) then
    alter table public.soap_notes add constraint ck_soap_notes_ai_confidence check (confidence is null or confidence between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ck_soap_notes_ai_acceptance' and conrelid = 'public.soap_notes'::regclass) then
    alter table public.soap_notes add constraint ck_soap_notes_ai_acceptance check (source_type <> 'ai' or status <> 'reviewed' or (accepted_by is not null and accepted_at is not null));
  end if;
end $$;

alter table public.prescription_items add column if not exists dispensed_quantity numeric(12, 2) not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ck_prescription_items_dispensed_quantity' and conrelid = 'public.prescription_items'::regclass) then
    alter table public.prescription_items add constraint ck_prescription_items_dispensed_quantity
      check (dispensed_quantity >= 0 and (quantity is null or dispensed_quantity <= quantity));
  end if;
end $$;

create table if not exists public.claim_readiness_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  visit_id uuid not null references public.visits(id) on delete restrict,
  assessment_version integer not null default 1,
  total_score numeric(5, 2) not null,
  readiness_status text not null,
  review_status text not null default 'pending_review',
  rule_set_version text not null default 'mvp1-default',
  calculated_by_type text not null default 'system',
  calculated_by_user_id uuid references public.user_profiles(id),
  calculated_at timestamptz not null default now(),
  reviewed_by uuid references public.user_profiles(id),
  reviewed_at timestamptz,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_claim_readiness_assessments_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_claim_readiness_assessments_visit_version unique (visit_id, assessment_version),
  constraint ck_claim_readiness_total_score check (total_score between 0 and 100),
  constraint ck_claim_readiness_status check (
    (total_score >= 85 and readiness_status = 'ready') or
    (total_score >= 60 and total_score < 85 and readiness_status = 'needs_review') or
    (total_score < 60 and readiness_status = 'not_ready')
  ),
  constraint ck_claim_readiness_review_status check (review_status in ('pending_review', 'accepted', 'needs_changes', 'rejected'))
);

create table if not exists public.claim_readiness_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  assessment_id uuid not null references public.claim_readiness_assessments(id) on delete cascade,
  dimension_code text not null,
  weight numeric(5, 2) not null,
  raw_score numeric(5, 2) not null,
  weighted_score numeric(5, 2) not null,
  item_status text not null default 'needs_review',
  reason_code text not null,
  reason_text text not null,
  evidence_reference text,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_claim_readiness_items_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_claim_readiness_items_dimension unique (assessment_id, dimension_code),
  constraint ck_claim_readiness_items_weight check (weight > 0 and weight <= 100),
  constraint ck_claim_readiness_items_scores check (raw_score between 0 and 100 and weighted_score between 0 and 100),
  constraint ck_claim_readiness_items_dimension check (dimension_code in ('soap', 'diagnosis_icd', 'prescription_procedure', 'evidence', 'payer_rule', 'economic'))
);

create or replace function public.assert_claim_readiness_weights()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_assessment_id uuid;
  v_total numeric(7, 2);
  v_count integer;
begin
  v_assessment_id := coalesce(new.assessment_id, old.assessment_id);
  select coalesce(sum(weight), 0), count(*)
  into v_total, v_count
  from public.claim_readiness_items
  where assessment_id = v_assessment_id
    and deleted_at is null;

  if v_count = 6 and v_total <> 100 then
    raise exception 'claim readiness item weights must total 100 for assessment %', v_assessment_id
      using errcode = '23514';
  end if;
  return null;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_claim_readiness_weights_total'
      and tgrelid = 'public.claim_readiness_items'::regclass
  ) then
    create constraint trigger trg_claim_readiness_weights_total
    after insert or update or delete on public.claim_readiness_items
    deferrable initially deferred
    for each row execute function public.assert_claim_readiness_weights();
  end if;
end $$;

create table if not exists public.evidence_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  visit_id uuid not null references public.visits(id) on delete restrict,
  package_version integer not null default 1,
  package_status text not null default 'draft',
  completeness_score numeric(5, 2) not null default 0,
  storage_reference text,
  checksum text,
  generated_by uuid references public.user_profiles(id),
  generated_at timestamptz,
  approved_by uuid references public.user_profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_evidence_packages_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_evidence_packages_visit_version unique (visit_id, package_version),
  constraint ck_evidence_packages_score check (completeness_score between 0 and 100),
  constraint ck_evidence_packages_status check (package_status in ('draft', 'review_needed', 'complete', 'approved', 'submitted', 'superseded'))
);

create table if not exists public.organization_operational_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  visit_number_prefix text not null default 'VIS',
  patient_number_prefix text not null default 'PAT',
  settings_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_operational_settings_org unique (organization_id)
);

create table if not exists public.organization_claim_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  ready_threshold numeric(5, 2) not null default 85,
  needs_review_threshold numeric(5, 2) not null default 60,
  scoring_model_version text not null default 'mvp1-default',
  soap_weight numeric(5, 2) not null default 25,
  diagnosis_icd_weight numeric(5, 2) not null default 20,
  prescription_procedure_weight numeric(5, 2) not null default 15,
  evidence_weight numeric(5, 2) not null default 20,
  payer_rule_weight numeric(5, 2) not null default 10,
  economic_weight numeric(5, 2) not null default 10,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_claim_settings_org unique (organization_id),
  constraint ck_organization_claim_settings_thresholds check (needs_review_threshold < ready_threshold and needs_review_threshold >= 0 and ready_threshold <= 100),
  constraint ck_organization_claim_settings_weights check (
    soap_weight + diagnosis_icd_weight + prescription_procedure_weight + evidence_weight + payer_rule_weight + economic_weight = 100
  )
);

create table if not exists public.organization_clinical_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  require_ai_human_acceptance boolean not null default true,
  allow_ai_diagnosis_suggestions boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_clinical_settings_org unique (organization_id)
);

create table if not exists public.organization_security_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  session_timeout_minutes integer not null default 30,
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_security_settings_org unique (organization_id),
  constraint ck_organization_security_settings_timeout check (session_timeout_minutes between 5 and 1440)
);

create table if not exists public.organization_compliance_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  pdpa_region text not null default 'TH',
  retention_policy_reference text,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_compliance_settings_org unique (organization_id)
);

create table if not exists public.system_modules (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_module_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  module_id uuid not null references public.system_modules(id) on delete restrict,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_module_settings unique (organization_id, module_id)
);

create table if not exists public.notification_event_types (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_notification_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  event_type_id uuid not null references public.notification_event_types(id) on delete restrict,
  channel text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_notification_settings unique (organization_id, event_type_id, channel),
  constraint ck_organization_notification_channel check (channel in ('in_app', 'email', 'sms', 'webhook'))
);

create table if not exists public.integration_providers (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null unique,
  display_name text not null,
  provider_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  provider_id uuid not null references public.integration_providers(id) on delete restrict,
  integration_status text not null default 'disabled',
  config jsonb not null default '{}'::jsonb,
  secret_reference text,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_integrations unique (organization_id, provider_id),
  constraint ck_organization_integrations_status check (integration_status in ('disabled', 'enabled', 'error'))
);

create table if not exists public.organization_setting_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  setting_table text not null,
  setting_record_id uuid not null,
  version_no integer not null,
  previous_value jsonb,
  new_value jsonb not null,
  changed_by uuid references public.user_profiles(id),
  changed_at timestamptz not null default now(),
  change_reason text,
  constraint uq_organization_setting_versions unique (setting_table, setting_record_id, version_no),
  constraint ck_organization_setting_versions_version check (version_no > 0)
);

do $$
declare
  v_table text;
  v_trigger text;
begin
  foreach v_table in array array[
    'patient_clinic_registrations',
    'visit_vitals',
    'diagnoses',
    'visit_diagnoses',
    'claim_readiness_assessments',
    'claim_readiness_items',
    'evidence_packages',
    'organization_operational_settings',
    'organization_claim_settings',
    'organization_clinical_settings',
    'organization_security_settings',
    'organization_compliance_settings',
    'organization_module_settings',
    'organization_notification_settings',
    'organization_integrations'
  ]
  loop
    v_trigger := 'set_' || v_table || '_updated_at';
    if not exists (
      select 1
      from pg_trigger
      where tgname = v_trigger
        and tgrelid = format('public.%I', v_table)::regclass
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
        v_trigger,
        v_table
      );
    end if;
  end loop;
end $$;
