-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Processing Detail Tables
-- Migration: 20260720082359_phase3_claim_detail_tables.sql
-- =============================================================================
--
-- LOGICAL RESPONSIBILITY
--   - public.claim_items
--   - public.claim_diagnoses
--   - public.claim_procedures
--   - public.claim_documents
--   - Core relational and financial integrity constraints
--   - Tenant-safe foreign keys
--
-- OUT OF SCOPE
--   - RLS policies
--   - Permission grants
--   - AI assessment tables
--   - Audit integration
--   - Workflow functions and triggers
--   - Additional performance and partial indexes
--
-- REQUIRED EXISTING OBJECTS
--   public.claims(organization_id, clinic_id, id)
--   public.organizations(id)
--   public.clinics(organization_id, id)
--   public.patients(organization_id, id)
--   public.visits(organization_id, clinic_id, patient_id, id)
--   public.visit_diagnoses(id)
--   public.prescription_items(id)
--   public.clinical_documents(id)
--   public.user_profiles(id)
--
-- NOTE
--   Optional clinical source foreign keys are intentionally simple UUID links
--   where the current repository master table does not expose a confirmed
--   tenant-safe composite key. Parent Claim tenant ownership remains mandatory.
-- =============================================================================

begin;

-- =============================================================================
-- 1. CLAIM ITEMS
-- =============================================================================

create table public.claim_items (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  line_number integer not null,
  item_type text not null,

  service_code text,
  revenue_code text,
  description text not null,

  service_date date not null,

  quantity numeric(12,3) not null default 1,
  unit_price numeric(14,2) not null default 0,

  gross_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  claimed_amount numeric(14,2) not null default 0,

  eligible_amount numeric(14,2),
  approved_amount numeric(14,2),
  patient_responsibility_amount numeric(14,2),
  payer_responsibility_amount numeric(14,2),

  prescription_item_id uuid,
  source_procedure_reference text,
  supporting_document_id uuid,

  status text not null default 'submitted',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint claim_items_line_number_positive_chk
    check (line_number > 0),

  constraint claim_items_item_type_chk
    check (
      item_type in (
        'consultation',
        'medication',
        'procedure',
        'laboratory',
        'imaging',
        'medical_supply',
        'room',
        'professional_fee',
        'facility_fee',
        'certificate',
        'other'
      )
    ),

  constraint claim_items_service_code_not_blank_chk
    check (
      service_code is null
      or btrim(service_code) <> ''
    ),

  constraint claim_items_revenue_code_not_blank_chk
    check (
      revenue_code is null
      or btrim(revenue_code) <> ''
    ),

  constraint claim_items_description_not_blank_chk
    check (btrim(description) <> ''),

  constraint claim_items_quantity_positive_chk
    check (quantity > 0),

  constraint claim_items_unit_price_nonnegative_chk
    check (unit_price >= 0),

  constraint claim_items_gross_amount_nonnegative_chk
    check (gross_amount >= 0),

  constraint claim_items_discount_amount_nonnegative_chk
    check (discount_amount >= 0),

  constraint claim_items_tax_amount_nonnegative_chk
    check (tax_amount >= 0),

  constraint claim_items_claimed_amount_nonnegative_chk
    check (claimed_amount >= 0),

  constraint claim_items_eligible_amount_nonnegative_chk
    check (
      eligible_amount is null
      or eligible_amount >= 0
    ),

  constraint claim_items_approved_amount_nonnegative_chk
    check (
      approved_amount is null
      or approved_amount >= 0
    ),

  constraint claim_items_patient_responsibility_nonnegative_chk
    check (
      patient_responsibility_amount is null
      or patient_responsibility_amount >= 0
    ),

  constraint claim_items_payer_responsibility_nonnegative_chk
    check (
      payer_responsibility_amount is null
      or payer_responsibility_amount >= 0
    ),

  constraint claim_items_discount_not_above_gross_chk
    check (discount_amount <= gross_amount),

  constraint claim_items_claimed_calculation_chk
    check (
      abs(
        claimed_amount
        - ((gross_amount - discount_amount) + tax_amount)
      ) <= 0.01
    ),

  constraint claim_items_eligible_not_above_claimed_chk
    check (
      eligible_amount is null
      or eligible_amount <= claimed_amount
    ),

  constraint claim_items_approved_requires_eligible_chk
    check (
      approved_amount is null
      or eligible_amount is not null
    ),

  constraint claim_items_approved_not_above_eligible_chk
    check (
      approved_amount is null
      or approved_amount <= eligible_amount
    ),

  constraint claim_items_responsibility_requires_approved_chk
    check (
      (
        patient_responsibility_amount is null
        and payer_responsibility_amount is null
      )
      or approved_amount is not null
    ),

  constraint claim_items_responsibility_total_chk
    check (
      approved_amount is null
      or (
        coalesce(patient_responsibility_amount, 0)
        + coalesce(payer_responsibility_amount, 0)
      ) <= approved_amount
    ),

  constraint claim_items_status_chk
    check (
      status in (
        'draft',
        'submitted',
        'eligible',
        'partially_eligible',
        'ineligible',
        'approved',
        'partially_approved',
        'rejected',
        'paid',
        'cancelled'
      )
    ),

  constraint claim_items_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_items_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_items_soft_delete_pair_chk
    check (
      (deleted_at is null and deleted_by is null)
      or
      (deleted_at is not null and deleted_by is not null)
    ),

  constraint claim_items_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_items_prescription_item_fk
    foreign key (prescription_item_id)
    references public.prescription_items(id)
    on update restrict
    on delete restrict,

  constraint claim_items_supporting_document_fk
    foreign key (supporting_document_id)
    references public.clinical_documents(id)
    on update restrict
    on delete restrict,

  constraint claim_items_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_items_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_items_deleted_by_fk
    foreign key (deleted_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_items_claim_line_uq
    unique (claim_id, line_number),

  constraint claim_items_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_items is
  'Line-level billed services, medications, procedures, diagnostics, supplies, and fees for a claim.';

comment on column public.claim_items.claimed_amount is
  'Calculated as gross amount minus discount plus tax, within 0.01 rounding tolerance.';

comment on column public.claim_items.source_procedure_reference is
  'Temporary external or clinical procedure reference until the normalized procedure source schema is confirmed.';

comment on column public.claim_items.metadata is
  'Non-PHI operational metadata only. Do not store raw clinical documentation.';

-- =============================================================================
-- 2. CLAIM DIAGNOSES
-- =============================================================================

create table public.claim_diagnoses (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  diagnosis_rank integer not null,
  diagnosis_role text not null,

  coding_system text not null default 'ICD-10',
  coding_version text not null,
  diagnosis_code text not null,
  diagnosis_description_snapshot text,

  source_visit_diagnosis_id uuid,

  present_on_admission text,
  coding_status text not null default 'submitted',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint claim_diagnoses_rank_positive_chk
    check (diagnosis_rank > 0),

  constraint claim_diagnoses_role_chk
    check (
      diagnosis_role in (
        'principal',
        'secondary',
        'comorbidity',
        'complication',
        'external_cause',
        'other'
      )
    ),

  constraint claim_diagnoses_coding_system_not_blank_chk
    check (btrim(coding_system) <> ''),

  constraint claim_diagnoses_coding_version_not_blank_chk
    check (btrim(coding_version) <> ''),

  constraint claim_diagnoses_code_not_blank_chk
    check (btrim(diagnosis_code) <> ''),

  constraint claim_diagnoses_description_not_blank_chk
    check (
      diagnosis_description_snapshot is null
      or btrim(diagnosis_description_snapshot) <> ''
    ),

  constraint claim_diagnoses_present_on_admission_chk
    check (
      present_on_admission is null
      or present_on_admission in (
        'yes',
        'no',
        'unknown',
        'clinically_undetermined',
        'not_applicable'
      )
    ),

  constraint claim_diagnoses_coding_status_chk
    check (
      coding_status in (
        'submitted',
        'valid',
        'invalid',
        'questionable',
        'not_assessable',
        'reviewed'
      )
    ),

  constraint claim_diagnoses_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_diagnoses_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_diagnoses_soft_delete_pair_chk
    check (
      (deleted_at is null and deleted_by is null)
      or
      (deleted_at is not null and deleted_by is not null)
    ),

  constraint claim_diagnoses_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_diagnoses_source_visit_diagnosis_fk
    foreign key (source_visit_diagnosis_id)
    references public.visit_diagnoses(id)
    on update restrict
    on delete restrict,

  constraint claim_diagnoses_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_diagnoses_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_diagnoses_deleted_by_fk
    foreign key (deleted_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_diagnoses_claim_rank_uq
    unique (claim_id, diagnosis_rank),

  constraint claim_diagnoses_claim_code_uq
    unique (
      claim_id,
      coding_system,
      coding_version,
      diagnosis_code
    ),

  constraint claim_diagnoses_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_diagnoses is
  'Claim diagnosis snapshot supporting principal, secondary, comorbidity, complication, and coding review use cases.';

comment on column public.claim_diagnoses.diagnosis_description_snapshot is
  'Description captured for reproducibility; the diagnosis code remains the authoritative business identifier.';

comment on column public.claim_diagnoses.coding_status is
  'Coding review status only. AI coding output and human review findings are stored in later migrations.';

-- Principal diagnosis uniqueness is intentionally implemented later as a partial
-- unique index in phase3_claim_indexes.sql:
--
--   unique (claim_id) where diagnosis_role = 'principal' and deleted_at is null

-- =============================================================================
-- 3. CLAIM PROCEDURES
-- =============================================================================

create table public.claim_procedures (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  procedure_rank integer not null,

  coding_system text not null,
  coding_version text not null,
  procedure_code text not null,
  procedure_description_snapshot text,

  procedure_date date not null,
  quantity numeric(12,3) not null default 1,

  practitioner_user_profile_id uuid,
  authorization_reference text,
  source_procedure_reference text,

  drg_relevant boolean not null default false,
  coding_status text not null default 'submitted',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint claim_procedures_rank_positive_chk
    check (procedure_rank > 0),

  constraint claim_procedures_coding_system_not_blank_chk
    check (btrim(coding_system) <> ''),

  constraint claim_procedures_coding_version_not_blank_chk
    check (btrim(coding_version) <> ''),

  constraint claim_procedures_code_not_blank_chk
    check (btrim(procedure_code) <> ''),

  constraint claim_procedures_description_not_blank_chk
    check (
      procedure_description_snapshot is null
      or btrim(procedure_description_snapshot) <> ''
    ),

  constraint claim_procedures_quantity_positive_chk
    check (quantity > 0),

  constraint claim_procedures_authorization_not_blank_chk
    check (
      authorization_reference is null
      or btrim(authorization_reference) <> ''
    ),

  constraint claim_procedures_source_reference_not_blank_chk
    check (
      source_procedure_reference is null
      or btrim(source_procedure_reference) <> ''
    ),

  constraint claim_procedures_coding_status_chk
    check (
      coding_status in (
        'submitted',
        'valid',
        'invalid',
        'questionable',
        'not_assessable',
        'reviewed'
      )
    ),

  constraint claim_procedures_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_procedures_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_procedures_soft_delete_pair_chk
    check (
      (deleted_at is null and deleted_by is null)
      or
      (deleted_at is not null and deleted_by is not null)
    ),

  constraint claim_procedures_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_procedures_practitioner_fk
    foreign key (practitioner_user_profile_id)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_procedures_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_procedures_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_procedures_deleted_by_fk
    foreign key (deleted_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_procedures_claim_rank_uq
    unique (claim_id, procedure_rank),

  constraint claim_procedures_claim_code_date_uq
    unique (
      claim_id,
      coding_system,
      coding_version,
      procedure_code,
      procedure_date
    ),

  constraint claim_procedures_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_procedures is
  'Claim procedure snapshot used for coding review, medical necessity, charge support, and DRG plausibility.';

comment on column public.claim_procedures.source_procedure_reference is
  'Temporary source reference until a normalized clinical procedure table is confirmed.';

comment on column public.claim_procedures.drg_relevant is
  'Indicates potential DRG relevance; this does not certify or calculate a DRG.';

-- =============================================================================
-- 4. CLAIM DOCUMENTS
-- =============================================================================

create table public.claim_documents (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  clinical_document_id uuid not null,

  document_type text not null,
  document_role text not null default 'supporting_evidence',

  document_status text not null default 'received',
  is_mandatory boolean not null default false,

  received_at timestamptz not null default now(),
  validated_at timestamptz,
  validated_by uuid,

  validation_message text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  deleted_at timestamptz,
  deleted_by uuid,

  constraint claim_documents_document_type_chk
    check (
      document_type in (
        'claim_form',
        'medical_certificate',
        'invoice',
        'receipt',
        'itemized_bill',
        'soap_note',
        'lab_report',
        'imaging_report',
        'referral',
        'preauthorization',
        'discharge_summary',
        'operative_note',
        'prescription',
        'identity_document',
        'policy_document',
        'other'
      )
    ),

  constraint claim_documents_document_role_chk
    check (
      document_role in (
        'supporting_evidence',
        'clinical_evidence',
        'financial_evidence',
        'policy_evidence',
        'administrative_evidence'
      )
    ),

  constraint claim_documents_status_chk
    check (
      document_status in (
        'missing',
        'received',
        'invalid',
        'expired',
        'needs_review',
        'accepted',
        'waived'
      )
    ),

  constraint claim_documents_validated_pair_chk
    check (
      (validated_at is null and validated_by is null)
      or
      (validated_at is not null and validated_by is not null)
    ),

  constraint claim_documents_validation_message_not_blank_chk
    check (
      validation_message is null
      or btrim(validation_message) <> ''
    ),

  constraint claim_documents_validated_not_before_received_chk
    check (
      validated_at is null
      or validated_at >= received_at
    ),

  constraint claim_documents_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_documents_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_documents_soft_delete_pair_chk
    check (
      (deleted_at is null and deleted_by is null)
      or
      (deleted_at is not null and deleted_by is not null)
    ),

  constraint claim_documents_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_documents_clinical_document_fk
    foreign key (clinical_document_id)
    references public.clinical_documents(id)
    on update restrict
    on delete restrict,

  constraint claim_documents_validated_by_fk
    foreign key (validated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_documents_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_documents_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_documents_deleted_by_fk
    foreign key (deleted_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_documents_claim_document_uq
    unique (claim_id, clinical_document_id),

  constraint claim_documents_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_documents is
  'Claim-to-clinical-document linkage with claim-specific evidence role and validation status.';

comment on column public.claim_documents.validation_message is
  'Concise validation result only. Do not duplicate full document content or PHI.';

comment on column public.claim_documents.metadata is
  'Minimum-necessary operational metadata. Raw document content remains in the document source system.';

commit;