-- Med AI NexSure MVP 1 core schema
-- Synthetic/demo-safe foundation. Do not seed real PHI, PII, clinical facts, or payer policies.

create extension if not exists "pgcrypto";

create type visit_status as enum (
  'scheduled',
  'checked_in',
  'in_consultation',
  'completed',
  'cancelled',
  'no_show'
);

create type claim_status as enum (
  'not_started',
  'documentation_pending',
  'ready_for_review',
  'needs_review',
  'blocked',
  'submitted'
);

create type risk_level as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type audit_action_type as enum (
  'create',
  'read',
  'update',
  'delete',
  'view',
  'export',
  'login',
  'permission_change',
  'clinical_review',
  'claim_review',
  'evidence_change',
  'dashboard_viewed',
  'filters_applied'
);

create type stock_movement_type as enum (
  'stock_in',
  'stock_out',
  'adjustment',
  'return',
  'waste',
  'transfer'
);

create type prescription_status as enum (
  'draft',
  'pending_review',
  'approved_by_clinician',
  'dispensed',
  'cancelled'
);

create type soap_status as enum (
  'draft',
  'submitted',
  'reviewed',
  'amended',
  'archived'
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  registration_number text,
  country_code char(2) not null default 'TH',
  timezone text not null default 'Asia/Bangkok',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  is_active boolean not null default true,
  constraint organizations_name_unique unique (name)
);

create table clinics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  name text not null,
  code text not null,
  address_line text,
  province text,
  country_code char(2) not null default 'TH',
  phone text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  is_active boolean not null default true,
  constraint clinics_org_code_unique unique (organization_id, code)
);

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete restrict,
  primary_clinic_id uuid references clinics(id) on delete restrict,
  display_name text not null,
  email text not null,
  job_title text,
  department text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  is_active boolean not null default true,
  constraint user_profiles_email_unique unique (email)
);

alter table clinics
  add constraint clinics_created_by_fk foreign key (created_by) references user_profiles(id),
  add constraint clinics_updated_by_fk foreign key (updated_by) references user_profiles(id),
  add constraint clinics_deleted_by_fk foreign key (deleted_by) references user_profiles(id);

create table patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  patient_code text not null,
  display_label text not null,
  date_of_birth date,
  sex_at_birth text,
  consent_status text not null default 'unknown',
  consent_updated_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint patients_org_code_unique unique (organization_id, patient_code),
  constraint patients_consent_status_check check (
    consent_status in ('unknown', 'granted', 'restricted', 'revoked', 'expired')
  ),
  constraint patients_sex_at_birth_check check (
    sex_at_birth is null or sex_at_birth in ('female', 'male', 'intersex', 'unknown')
  )
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  patient_id uuid not null references patients(id) on delete restrict,
  visit_number text not null,
  department text not null,
  attending_user_id uuid references user_profiles(id),
  payer_name text,
  visit_status visit_status not null default 'scheduled',
  claim_status claim_status not null default 'not_started',
  risk_level risk_level not null default 'low',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint visits_org_visit_number_unique unique (organization_id, visit_number)
);

create table soap_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  visit_id uuid not null references visits(id) on delete restrict,
  status soap_status not null default 'draft',
  current_version integer not null default 1,
  subjective text,
  objective text,
  assessment text,
  plan text,
  completeness_score integer,
  reviewed_by uuid references user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint soap_notes_visit_unique unique (visit_id),
  constraint soap_notes_completeness_score_check check (
    completeness_score is null or (completeness_score >= 0 and completeness_score <= 100)
  )
);

create table soap_note_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  soap_note_id uuid not null references soap_notes(id) on delete restrict,
  version integer not null,
  status soap_status not null,
  subjective text,
  objective text,
  assessment text,
  plan text,
  change_reason text not null,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint soap_note_versions_unique unique (soap_note_id, version),
  constraint soap_note_versions_version_positive check (version > 0)
);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  visit_id uuid not null references visits(id) on delete restrict,
  prescribing_user_id uuid references user_profiles(id),
  status prescription_status not null default 'draft',
  safety_review_required boolean not null default true,
  safety_review_summary text,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  sku text not null,
  item_name text not null,
  generic_name text,
  unit text not null,
  reorder_level numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint inventory_items_clinic_sku_unique unique (clinic_id, sku),
  constraint inventory_items_reorder_level_check check (reorder_level >= 0)
);

create table inventory_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  inventory_item_id uuid not null references inventory_items(id) on delete restrict,
  batch_number text not null,
  expiry_date date,
  quantity_on_hand numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2),
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint inventory_batches_item_batch_unique unique (inventory_item_id, batch_number),
  constraint inventory_batches_quantity_check check (quantity_on_hand >= 0),
  constraint inventory_batches_unit_cost_check check (unit_cost is null or unit_cost >= 0)
);

create table prescription_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  prescription_id uuid not null references prescriptions(id) on delete restrict,
  inventory_item_id uuid references inventory_items(id) on delete restrict,
  medication_label text not null,
  dosage_text text not null,
  frequency_text text not null,
  duration_text text,
  quantity numeric(12, 2),
  safety_note text,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint prescription_items_quantity_check check (quantity is null or quantity > 0)
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid not null references clinics(id) on delete restrict,
  inventory_item_id uuid not null references inventory_items(id) on delete restrict,
  inventory_batch_id uuid references inventory_batches(id) on delete restrict,
  movement_type stock_movement_type not null,
  quantity numeric(12, 2) not null,
  reason text not null,
  reference_table text,
  reference_record_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint stock_movements_quantity_nonzero check (quantity <> 0)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete restrict,
  clinic_id uuid references clinics(id) on delete restrict,
  actor_user_id uuid references user_profiles(id),
  action_type audit_action_type not null,
  target_table text not null,
  target_record_id uuid,
  reason text,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  correlation_id text,
  outcome text not null default 'success',
  created_at timestamptz not null default now(),
  constraint audit_logs_outcome_check check (outcome in ('success', 'failure', 'blocked'))
);

create trigger set_organizations_updated_at before update on organizations
  for each row execute function set_updated_at();
create trigger set_clinics_updated_at before update on clinics
  for each row execute function set_updated_at();
create trigger set_user_profiles_updated_at before update on user_profiles
  for each row execute function set_updated_at();
create trigger set_patients_updated_at before update on patients
  for each row execute function set_updated_at();
create trigger set_visits_updated_at before update on visits
  for each row execute function set_updated_at();
create trigger set_soap_notes_updated_at before update on soap_notes
  for each row execute function set_updated_at();
create trigger set_soap_note_versions_updated_at before update on soap_note_versions
  for each row execute function set_updated_at();
create trigger set_prescriptions_updated_at before update on prescriptions
  for each row execute function set_updated_at();
create trigger set_prescription_items_updated_at before update on prescription_items
  for each row execute function set_updated_at();
create trigger set_inventory_items_updated_at before update on inventory_items
  for each row execute function set_updated_at();
create trigger set_inventory_batches_updated_at before update on inventory_batches
  for each row execute function set_updated_at();
create trigger set_stock_movements_updated_at before update on stock_movements
  for each row execute function set_updated_at();
