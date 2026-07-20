-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Evidence Tables
-- Migration: 20260720082402_phase3_claim_evidence_tables.sql
-- =============================================================================
--
-- PURPOSE
--   Create the claim evidence requirement, evaluation result, and waiver tables.
--
-- RESPONSIBILITY
--   - public.claim_evidence_requirements
--   - public.claim_evidence_results
--   - public.claim_evidence_waivers
--   - Tenant-safe relational integrity
--   - Evidence completeness data integrity
--
-- DOMAIN BOUNDARIES
--   claim_evidence_requirements
--     Defines what evidence a specific claim requires.
--
--   claim_evidence_results
--     Stores the current deterministic or human evaluation of a requirement.
--
--   claim_evidence_waivers
--     Stores an authorized exception to an evidence requirement.
--
-- OUT OF SCOPE
--   - RLS policies
--   - Permission grants
--   - AI assessment tables
--   - Performance and partial indexes
--   - Audit integration
--   - Functions and triggers
--
-- REQUIRED EXISTING OBJECTS
--   public.claims(organization_id, clinic_id, id)
--   public.claim_documents(organization_id, clinic_id, id)
--   public.user_profiles(id)
--
-- IMPORTANT
--   - Missing evidence is represented by claim_evidence_results.result_status.
--   - claim_documents remains only a Claim-to-Document link.
--   - AI findings must not be written directly into these tables.
--   - Evidence history and automated synchronization are added later through
--     audit and workflow migrations.
-- =============================================================================

begin;

-- Ensure document references cannot cross claims inside the same tenant.
alter table public.claim_documents
  add constraint claim_documents_claim_identity_uq
  unique (organization_id, clinic_id, claim_id, id);

-- =============================================================================
-- 1. CLAIM EVIDENCE REQUIREMENTS
-- =============================================================================

create table public.claim_evidence_requirements (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  requirement_code text not null,
  evidence_category text not null,
  document_type text,

  requirement_level text not null default 'mandatory',
  minimum_document_count smallint not null default 1,
  allow_waiver boolean not null default false,

  source_type text not null,
  source_reference text,

  requirement_text text not null,
  condition_snapshot jsonb not null default '{}'::jsonb,

  requirement_status text not null default 'active',

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_evidence_requirements_code_format_chk
    check (
      requirement_code = lower(btrim(requirement_code))
      and requirement_code ~ '^[a-z][a-z0-9_]{2,63}$'
    ),

  constraint claim_evidence_requirements_category_chk
    check (
      evidence_category in (
        'clinical',
        'financial',
        'policy',
        'administrative',
        'identity',
        'authorization',
        'other'
      )
    ),

  constraint claim_evidence_requirements_document_type_not_blank_chk
    check (
      document_type is null
      or btrim(document_type) <> ''
    ),

  constraint claim_evidence_requirements_level_chk
    check (
      requirement_level in (
        'mandatory',
        'conditional',
        'optional'
      )
    ),

  constraint claim_evidence_requirements_minimum_count_chk
    check (minimum_document_count > 0),

  constraint claim_evidence_requirements_source_type_chk
    check (
      source_type in (
        'payer_rule',
        'organization_rule',
        'claim_type_rule',
        'regulatory_rule',
        'manual'
      )
    ),

  constraint claim_evidence_requirements_source_reference_not_blank_chk
    check (
      source_reference is null
      or btrim(source_reference) <> ''
    ),

  constraint claim_evidence_requirements_source_reference_required_chk
    check (
      source_type = 'manual'
      or source_reference is not null
    ),

  constraint claim_evidence_requirements_text_not_blank_chk
    check (btrim(requirement_text) <> ''),

  constraint claim_evidence_requirements_condition_object_chk
    check (jsonb_typeof(condition_snapshot) = 'object'),

  constraint claim_evidence_requirements_conditional_rule_chk
    check (
      requirement_level <> 'conditional'
      or condition_snapshot <> '{}'::jsonb
    ),

  constraint claim_evidence_requirements_status_chk
    check (
      requirement_status in (
        'active',
        'cancelled'
      )
    ),

  constraint claim_evidence_requirements_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_evidence_requirements_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_requirements_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_requirements_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_requirements_claim_code_uq
    unique (claim_id, requirement_code),

  constraint claim_evidence_requirements_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id),

  constraint claim_evidence_requirements_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_evidence_requirements is
  'Claim-specific evidence requirements derived from payer, organization, claim-type, regulatory, or authorized manual rules.';

comment on column public.claim_evidence_requirements.document_type is
  'Expected claim document type when the requirement can be satisfied by a document.';

comment on column public.claim_evidence_requirements.condition_snapshot is
  'Immutable rule-condition snapshot for conditional evidence requirements.';

-- =============================================================================
-- 2. CLAIM EVIDENCE RESULTS
-- =============================================================================

create table public.claim_evidence_results (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  requirement_id uuid not null,

  primary_claim_document_id uuid,

  result_status text not null default 'missing',

  matched_document_count smallint not null default 0,
  accepted_document_count smallint not null default 0,

  evaluation_source text not null default 'system_rule',

  result_code text,
  result_message text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  evaluated_at timestamptz not null default now(),
  evaluated_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_evidence_results_status_chk
    check (
      result_status in (
        'missing',
        'received',
        'needs_review',
        'accepted',
        'rejected',
        'expired',
        'waived',
        'not_applicable'
      )
    ),

  constraint claim_evidence_results_matched_count_chk
    check (matched_document_count >= 0),

  constraint claim_evidence_results_accepted_count_chk
    check (
      accepted_document_count >= 0
      and accepted_document_count <= matched_document_count
    ),

  constraint claim_evidence_results_document_required_chk
    check (
      result_status in (
        'missing',
        'waived',
        'not_applicable'
      )
      or primary_claim_document_id is not null
    ),

  constraint claim_evidence_results_missing_count_chk
    check (
      result_status <> 'missing'
      or (
        matched_document_count = 0
        and accepted_document_count = 0
        and primary_claim_document_id is null
      )
    ),

  constraint claim_evidence_results_accepted_count_required_chk
    check (
      result_status <> 'accepted'
      or accepted_document_count > 0
    ),

  constraint claim_evidence_results_evaluation_source_chk
    check (
      evaluation_source in (
        'system_rule',
        'human_review',
        'external_payer',
        'import'
      )
    ),

  constraint claim_evidence_results_evaluator_required_chk
    check (
      evaluation_source <> 'human_review'
      or evaluated_by is not null
    ),

  constraint claim_evidence_results_result_code_not_blank_chk
    check (
      result_code is null
      or btrim(result_code) <> ''
    ),

  constraint claim_evidence_results_message_not_blank_chk
    check (
      result_message is null
      or btrim(result_message) <> ''
    ),

  constraint claim_evidence_results_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_evidence_results_evaluated_not_before_created_chk
    check (evaluated_at >= created_at),

  constraint claim_evidence_results_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_evidence_results_requirement_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      requirement_id
    )
    references public.claim_evidence_requirements(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_document_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      primary_claim_document_id
    )
    references public.claim_documents(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_results_requirement_uq
    unique (requirement_id),

  constraint claim_evidence_results_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_evidence_results is
  'Current evidence completeness and validation result for one claim evidence requirement.';

comment on column public.claim_evidence_results.primary_claim_document_id is
  'Primary linked claim document used to support the result; counts may represent additional matching documents.';

comment on column public.claim_evidence_results.evaluation_source is
  'Deterministic system, authorized human, external payer, or imported evaluation source. AI is intentionally excluded.';

-- =============================================================================
-- 3. CLAIM EVIDENCE WAIVERS
-- =============================================================================

create table public.claim_evidence_waivers (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  requirement_id uuid not null,

  waiver_status text not null default 'active',

  reason_code text not null,
  reason_text text not null,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  approved_by uuid not null,
  approved_at timestamptz not null default now(),

  expires_at timestamptz,

  revoked_by uuid,
  revoked_at timestamptz,
  revocation_reason text,

  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_evidence_waivers_status_chk
    check (
      waiver_status in (
        'active',
        'expired',
        'revoked'
      )
    ),

  constraint claim_evidence_waivers_reason_code_format_chk
    check (
      reason_code = lower(btrim(reason_code))
      and reason_code ~ '^[a-z][a-z0-9_]{2,63}$'
    ),

  constraint claim_evidence_waivers_reason_text_not_blank_chk
    check (btrim(reason_text) <> ''),

  constraint claim_evidence_waivers_expiry_chk
    check (
      expires_at is null
      or expires_at > approved_at
    ),

  constraint claim_evidence_waivers_revocation_pair_chk
    check (
      (
        revoked_at is null
        and revoked_by is null
        and revocation_reason is null
      )
      or
      (
        revoked_at is not null
        and revoked_by is not null
        and revocation_reason is not null
      )
    ),

  constraint claim_evidence_waivers_revocation_reason_not_blank_chk
    check (
      revocation_reason is null
      or btrim(revocation_reason) <> ''
    ),

  constraint claim_evidence_waivers_revoked_status_chk
    check (
      waiver_status <> 'revoked'
      or revoked_at is not null
    ),

  constraint claim_evidence_waivers_nonrevoked_fields_chk
    check (
      waiver_status = 'revoked'
      or revoked_at is null
    ),

  constraint claim_evidence_waivers_revoked_not_before_approved_chk
    check (
      revoked_at is null
      or revoked_at >= approved_at
    ),

  constraint claim_evidence_waivers_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_evidence_waivers_approved_not_before_created_chk
    check (approved_at >= created_at),

  constraint claim_evidence_waivers_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_evidence_waivers_requirement_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      requirement_id
    )
    references public.claim_evidence_requirements(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_approved_by_fk
    foreign key (approved_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_revoked_by_fk
    foreign key (revoked_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_evidence_waivers_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_evidence_waivers is
  'Authorized waiver of a claim evidence requirement with approval, expiry, and revocation context.';

comment on column public.claim_evidence_waivers.reason_code is
  'Organization-controlled waiver reason code; a shared reference catalog may be added later.';

comment on column public.claim_evidence_waivers.metadata is
  'Minimum-necessary non-PHI operational metadata only.';

-- A partial unique index allowing only one active waiver per requirement is
-- intentionally deferred to phase3_claim_indexes.sql.

commit;