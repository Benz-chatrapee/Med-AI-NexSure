-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Processing Core Tables
-- Migration: 20260720082357_phase3_claim_core_tables.sql
-- =============================================================================
--
-- PURPOSE
--   Create the core claim aggregate, lifecycle history, and claim parties.
--
-- LOGICAL RESPONSIBILITY
--   - public.claims
--   - public.claim_status_history
--   - public.claim_parties
--   - Core constraints
--   - Tenant-safe foreign keys
--
-- OUT OF SCOPE
--   - Claim detail tables
--   - Policy and coverage tables
--   - Evidence tables
--   - Rule engine and validation tables
--   - AI assessment tables
--   - Review and decision tables
--   - Payment tables
--   - Functions and triggers
--   - Additional performance indexes
--   - Permission grants
--   - Row Level Security policies
--   - Audit integration
--
-- REQUIRED EXISTING OBJECTS
--   public.organizations(id)
--   public.clinics(organization_id, id)
--   public.patients(organization_id, id)
--   public.visits(organization_id, clinic_id, patient_id, id)
--   public.user_profiles(id)
--   public.claim_types(code)
--
-- REQUIRED UNIQUE KEYS ON DEPENDENCIES
--   public.clinics(organization_id, id)
--   public.patients(organization_id, id)
--   public.visits(organization_id, clinic_id, patient_id, id)
-- =============================================================================

begin;

-- =============================================================================
-- 1. CLAIMS
-- =============================================================================

create table public.claims (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,

  claim_number text not null,
  claim_type_code text not null,

  patient_id uuid not null,
  visit_id uuid,

  payer_id uuid,
  payer_reference text,
  policy_reference text,
  member_reference text,

  status text not null default 'draft',

  service_start_date date not null,
  service_end_date date,

  currency_code char(3) not null default 'THB',

  total_claimed_amount numeric(14,2) not null default 0,
  total_eligible_amount numeric(14,2),
  total_approved_amount numeric(14,2),
  total_paid_amount numeric(14,2) not null default 0,

  risk_level text,

  current_ai_assessment_id uuid,
  current_decision_id uuid,

  version integer not null default 1,

  submitted_at timestamptz,
  closed_at timestamptz,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  deleted_at timestamptz,
  deleted_by uuid,

  constraint claims_claim_number_format_chk
    check (
      claim_number = upper(btrim(claim_number))
      and claim_number ~ '^[A-Z0-9][A-Z0-9-]{2,63}$'
    ),

  constraint claims_claim_type_fk
    foreign key (claim_type_code)
    references public.claim_types(code)
    on update restrict
    on delete restrict,

  constraint claims_status_chk
    check (
      status in (
        'draft',
        'collecting_evidence',
        'pending_validation',
        'validation_failed',
        'needs_information',
        'ready_for_submission',
        'submitted',
        'submission_failed',
        'under_review',
        'pending_medical_review',
        'pending_claim_assessor',
        'approved',
        'partially_approved',
        'rejected',
        'payment_pending',
        'partially_paid',
        'paid',
        'cancelled',
        'closed'
      )
    ),

  constraint claims_currency_code_format_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claims_payer_reference_not_blank_chk
    check (payer_reference is null or btrim(payer_reference) <> ''),

  constraint claims_policy_reference_not_blank_chk
    check (policy_reference is null or btrim(policy_reference) <> ''),

  constraint claims_member_reference_not_blank_chk
    check (member_reference is null or btrim(member_reference) <> ''),

  constraint claims_service_date_order_chk
    check (
      service_end_date is null
      or service_end_date >= service_start_date
    ),

  constraint claims_total_claimed_nonnegative_chk
    check (total_claimed_amount >= 0),

  constraint claims_total_eligible_nonnegative_chk
    check (
      total_eligible_amount is null
      or total_eligible_amount >= 0
    ),

  constraint claims_total_approved_nonnegative_chk
    check (
      total_approved_amount is null
      or total_approved_amount >= 0
    ),

  constraint claims_total_paid_nonnegative_chk
    check (total_paid_amount >= 0),

  constraint claims_eligible_not_above_claimed_chk
    check (
      total_eligible_amount is null
      or total_eligible_amount <= total_claimed_amount
    ),

  constraint claims_approved_requires_eligible_chk
    check (
      total_approved_amount is null
      or total_eligible_amount is not null
    ),

  constraint claims_approved_not_above_eligible_chk
    check (
      total_approved_amount is null
      or total_approved_amount <= total_eligible_amount
    ),

  constraint claims_paid_requires_approved_chk
    check (
      total_paid_amount = 0
      or total_approved_amount is not null
    ),

  constraint claims_paid_not_above_approved_chk
    check (
      total_paid_amount = 0
      or total_paid_amount <= total_approved_amount
    ),

  constraint claims_approved_status_amount_chk
    check (
      status not in (
        'approved',
        'partially_approved',
        'payment_pending',
        'partially_paid',
        'paid'
      )
      or total_approved_amount is not null
    ),

  constraint claims_rejected_amount_chk
    check (
      status <> 'rejected'
      or coalesce(total_approved_amount, 0) = 0
    ),

  constraint claims_partially_paid_amount_chk
    check (
      status <> 'partially_paid'
      or (
        total_approved_amount is not null
        and total_paid_amount > 0
        and total_paid_amount < total_approved_amount
      )
    ),

  constraint claims_paid_amount_chk
    check (
      status <> 'paid'
      or (
        total_approved_amount is not null
        and total_paid_amount = total_approved_amount
      )
    ),

  constraint claims_submitted_at_required_chk
    check (
      status not in (
        'submitted',
        'submission_failed',
        'under_review',
        'pending_medical_review',
        'pending_claim_assessor',
        'approved',
        'partially_approved',
        'rejected',
        'payment_pending',
        'partially_paid',
        'paid',
        'closed'
      )
      or submitted_at is not null
    ),

  constraint claims_closed_at_required_chk
    check (
      status <> 'closed'
      or closed_at is not null
    ),

  constraint claims_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claims_submitted_not_before_created_chk
    check (
      submitted_at is null
      or submitted_at >= created_at
    ),

  constraint claims_closed_not_before_submitted_chk
    check (
      closed_at is null
      or submitted_at is null
      or closed_at >= submitted_at
    ),

  constraint claims_version_positive_chk
    check (version > 0),

  constraint claims_risk_level_chk
    check (
      risk_level is null
      or risk_level in ('low', 'medium', 'high', 'critical')
    ),

  constraint claims_soft_delete_pair_chk
    check (
      (deleted_at is null and deleted_by is null)
      or
      (deleted_at is not null and deleted_by is not null)
    ),

  constraint claims_organization_fk
    foreign key (organization_id)
    references public.organizations(id)
    on update restrict
    on delete restrict,

  constraint claims_clinic_tenant_fk
    foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id)
    on update restrict
    on delete restrict,

  constraint claims_patient_tenant_fk
    foreign key (organization_id, patient_id)
    references public.patients(organization_id, id)
    on update restrict
    on delete restrict,

  constraint claims_visit_tenant_fk
    foreign key (
      organization_id,
      clinic_id,
      patient_id,
      visit_id
    )
    references public.visits(
      organization_id,
      clinic_id,
      patient_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claims_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claims_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claims_deleted_by_fk
    foreign key (deleted_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claims_org_claim_number_uq
    unique (organization_id, claim_number)
);

-- Required by all tenant-safe child foreign keys.
alter table public.claims
  add constraint claims_tenant_identity_uq
  unique (organization_id, clinic_id, id);

comment on table public.claims is
  'Core claim aggregate for Med AI NexSure. AI recommendations, deterministic rules, human decisions, and payments are stored separately.';

comment on column public.claims.claim_number is
  'Uppercase organization-scoped claim business identifier.';

comment on column public.claims.current_ai_assessment_id is
  'Deferred advisory AI assessment reference.';

comment on column public.claims.current_decision_id is
  'Deferred active final decision reference.';

comment on column public.claims.version is
  'Optimistic concurrency version controlled by trusted workflow logic.';

-- =============================================================================
-- 2. CLAIM STATUS HISTORY
-- =============================================================================

create table public.claim_status_history (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  sequence_number integer not null,

  from_status text,
  to_status text not null,

  reason_code text,
  reason_text text,

  changed_by uuid not null,
  changed_at timestamptz not null default now(),

  correlation_id uuid,
  metadata jsonb not null default '{}'::jsonb,

  constraint claim_status_history_sequence_positive_chk
    check (sequence_number > 0),

  constraint claim_status_history_from_status_chk
    check (
      from_status is null
      or from_status in (
        'draft',
        'collecting_evidence',
        'pending_validation',
        'validation_failed',
        'needs_information',
        'ready_for_submission',
        'submitted',
        'submission_failed',
        'under_review',
        'pending_medical_review',
        'pending_claim_assessor',
        'approved',
        'partially_approved',
        'rejected',
        'payment_pending',
        'partially_paid',
        'paid',
        'cancelled',
        'closed'
      )
    ),

  constraint claim_status_history_to_status_chk
    check (
      to_status in (
        'draft',
        'collecting_evidence',
        'pending_validation',
        'validation_failed',
        'needs_information',
        'ready_for_submission',
        'submitted',
        'submission_failed',
        'under_review',
        'pending_medical_review',
        'pending_claim_assessor',
        'approved',
        'partially_approved',
        'rejected',
        'payment_pending',
        'partially_paid',
        'paid',
        'cancelled',
        'closed'
      )
    ),

  constraint claim_status_history_initial_status_chk
    check (
      from_status is not null
      or (
        sequence_number = 1
        and to_status = 'draft'
      )
    ),

  constraint claim_status_history_noninitial_from_status_chk
    check (
      sequence_number = 1
      or from_status is not null
    ),

  constraint claim_status_history_status_changed_chk
    check (
      from_status is null
      or from_status <> to_status
    ),

  constraint claim_status_history_reason_code_not_blank_chk
    check (
      reason_code is null
      or btrim(reason_code) <> ''
    ),

  constraint claim_status_history_reason_text_not_blank_chk
    check (
      reason_text is null
      or btrim(reason_text) <> ''
    ),

  constraint claim_status_history_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_status_history_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_status_history_changed_by_fk
    foreign key (changed_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_status_history_claim_sequence_uq
    unique (claim_id, sequence_number)
);

comment on table public.claim_status_history is
  'Append-only claim lifecycle history. Transition enforcement is added in the functions migration.';

comment on column public.claim_status_history.from_status is
  'Null only for sequence 1, which must initialize the claim as draft.';

comment on column public.claim_status_history.reason_code is
  'Status-transition reason. It is intentionally separate from adjudication decision reasons.';

comment on column public.claim_status_history.metadata is
  'Non-PHI operational metadata only.';

-- =============================================================================
-- 3. CLAIM PARTIES
-- =============================================================================

create table public.claim_parties (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  party_role text not null,

  patient_id uuid,
  user_profile_id uuid,

  external_party_type text,
  external_party_reference text,
  display_name_snapshot text,

  is_primary boolean not null default false,

  effective_from date,
  effective_to date,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_parties_role_chk
    check (
      party_role in (
        'patient',
        'insured',
        'policyholder',
        'provider',
        'attending_practitioner',
        'referring_practitioner',
        'payer',
        'employer',
        'claim_submitter',
        'authorized_representative',
        'other'
      )
    ),

  constraint claim_parties_external_party_type_chk
    check (
      external_party_type is null
      or external_party_type in (
        'organization',
        'clinic',
        'provider',
        'practitioner',
        'payer',
        'employer',
        'person',
        'other'
      )
    ),

  constraint claim_parties_display_name_not_blank_chk
    check (
      display_name_snapshot is null
      or btrim(display_name_snapshot) <> ''
    ),

  constraint claim_parties_external_reference_not_blank_chk
    check (
      external_party_reference is null
      or btrim(external_party_reference) <> ''
    ),

  constraint claim_parties_effective_date_order_chk
    check (
      effective_to is null
      or effective_from is null
      or effective_to >= effective_from
    ),

  constraint claim_parties_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_parties_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_parties_exactly_one_identity_chk
    check (
      num_nonnulls(
        patient_id,
        user_profile_id,
        external_party_reference
      ) = 1
    ),

  constraint claim_parties_external_pair_chk
    check (
      (external_party_type is null and external_party_reference is null)
      or
      (external_party_type is not null and external_party_reference is not null)
    ),

  constraint claim_parties_patient_role_identity_chk
    check (
      party_role <> 'patient'
      or patient_id is not null
    ),

  constraint claim_parties_payer_role_identity_chk
    check (
      party_role <> 'payer'
      or external_party_type = 'payer'
    ),

  constraint claim_parties_practitioner_role_identity_chk
    check (
      party_role not in (
        'attending_practitioner',
        'referring_practitioner'
      )
      or (
        user_profile_id is not null
        or external_party_type = 'practitioner'
      )
    ),

  constraint claim_parties_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_parties_patient_tenant_fk
    foreign key (organization_id, patient_id)
    references public.patients(organization_id, id)
    on update restrict
    on delete restrict,

  constraint claim_parties_user_profile_fk
    foreign key (user_profile_id)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_parties_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_parties_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict
);

comment on table public.claim_parties is
  'Normalized claim parties for patient, insured, policyholder, provider, payer, and submitter roles.';

comment on column public.claim_parties.external_party_reference is
  'External party identifier when a normalized master record is unavailable.';

comment on column public.claim_parties.display_name_snapshot is
  'Minimum-necessary display snapshot; do not duplicate full personal profiles.';

comment on column public.claim_parties.metadata is
  'Minimum-necessary non-clinical metadata only.';

commit;