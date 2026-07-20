-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Review & Decision
-- Migration: 20260720082438_phase3_claim_review_decision.sql
-- =============================================================================
--
-- PURPOSE
--   Create human claim review, structured finding, adjudication decision, and
--   financial adjustment tables for Med AI NexSure.
--
-- RESPONSIBILITY
--   - public.claim_reviews
--   - public.claim_review_findings
--   - public.claim_decisions
--   - public.claim_decision_adjustments
--   - Human-only adjudication governance
--   - Tenant-safe relational integrity
--   - Decision versioning and partial approval support
--   - Deferred current-decision reference on public.claims
--
-- DOMAIN BOUNDARIES
--   claim_reviews
--     One human review cycle and reviewer assignment for a claim.
--
--   claim_review_findings
--     Structured human findings raised and resolved during a review.
--
--   claim_decisions
--     Versioned human adjudication outcomes. AI cannot finalize these rows.
--
--   claim_decision_adjustments
--     Claim-level or item-level amount adjustments supporting a decision.
--
-- OUT OF SCOPE
--   - RLS policies
--   - Permission grants
--   - AI assessment execution
--   - Performance and partial indexes
--   - Audit integration
--   - Functions and triggers
--   - Payment execution
--
-- REQUIRED EXISTING OBJECTS
--   public.claims(organization_id, clinic_id, id)
--   public.claim_items(organization_id, clinic_id, claim_id, id)
--   public.user_profiles(id)
--   public.decision_reason_codes(code)
--
-- IMPORTANT
--   - Final adjudication must be performed by an authorized human reviewer.
--   - AI output is decision support only.
--   - Final amount reconciliation and lifecycle transitions are additionally
--     enforced by trusted functions in a later migration.
--   - Queue and active-row indexes are deferred to phase3_claim_indexes.sql.
-- =============================================================================

begin;

-- Required parent key for tenant-safe claim item references.
alter table public.claim_items
  add constraint claim_items_claim_identity_uq
  unique (organization_id, clinic_id, claim_id, id);

-- =============================================================================
-- 1. CLAIM REVIEWS
-- =============================================================================

create table public.claim_reviews (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  review_number integer not null,
  review_type text not null,
  review_status text not null default 'pending',
  review_priority text not null default 'normal',

  trigger_source text not null default 'workflow',
  idempotency_key text,

  assigned_to uuid,
  assigned_role_snapshot text,
  assigned_at timestamptz,

  started_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,

  review_summary text,
  completion_reason_code text,
  completion_reason_text text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_reviews_number_chk
    check (review_number > 0),

  constraint claim_reviews_type_chk
    check (
      review_type in (
        'administrative',
        'clinical',
        'medical_coding',
        'coverage',
        'cost',
        'fraud',
        'evidence',
        'composite'
      )
    ),

  constraint claim_reviews_status_chk
    check (
      review_status in (
        'pending',
        'assigned',
        'in_review',
        'waiting_information',
        'completed',
        'cancelled'
      )
    ),

  constraint claim_reviews_priority_chk
    check (
      review_priority in ('low', 'normal', 'high', 'urgent')
    ),

  constraint claim_reviews_trigger_source_chk
    check (
      trigger_source in (
        'manual',
        'workflow',
        'validation',
        'coverage',
        'ai_signal',
        'payer_request',
        'import'
      )
    ),

  constraint claim_reviews_idempotency_key_not_blank_chk
    check (
      idempotency_key is null
      or btrim(idempotency_key) <> ''
    ),

  constraint claim_reviews_assignment_pair_chk
    check (
      num_nonnulls(
        assigned_to,
        assigned_role_snapshot,
        assigned_at
      ) in (0, 3)
    ),

  constraint claim_reviews_assigned_role_not_blank_chk
    check (
      assigned_role_snapshot is null
      or btrim(assigned_role_snapshot) <> ''
    ),

  constraint claim_reviews_assignment_state_chk
    check (
      review_status = 'pending'
      or assigned_to is not null
    ),

  constraint claim_reviews_started_state_chk
    check (
      review_status not in (
        'in_review',
        'waiting_information',
        'completed'
      )
      or started_at is not null
    ),

  constraint claim_reviews_completion_state_chk
    check (
      (
        review_status in ('completed', 'cancelled')
        and completed_at is not null
      )
      or
      (
        review_status in (
          'pending',
          'assigned',
          'in_review',
          'waiting_information'
        )
        and completed_at is null
      )
    ),

  constraint claim_reviews_time_order_chk
    check (
      (started_at is null or started_at >= created_at)
      and (assigned_at is null or assigned_at >= created_at)
      and (
        completed_at is null
        or started_at is null
        or completed_at >= started_at
      )
      and (due_at is null or due_at >= created_at)
    ),

  constraint claim_reviews_summary_not_blank_chk
    check (
      review_summary is null
      or btrim(review_summary) <> ''
    ),

  constraint claim_reviews_completion_reason_text_not_blank_chk
    check (
      completion_reason_text is null
      or btrim(completion_reason_text) <> ''
    ),

  constraint claim_reviews_cancelled_reason_required_chk
    check (
      review_status <> 'cancelled'
      or (
        completion_reason_code is not null
        and completion_reason_text is not null
      )
    ),

  constraint claim_reviews_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_reviews_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_reviews_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_reviews_assigned_to_fk
    foreign key (assigned_to)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_reviews_completion_reason_code_fk
    foreign key (completion_reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_reviews_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_reviews_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_reviews_claim_number_uq
    unique (claim_id, review_number),

  constraint claim_reviews_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id)
);

comment on table public.claim_reviews is
  'Human claim review cycle and reviewer assignment. AI may support review but cannot complete adjudication.';

comment on column public.claim_reviews.idempotency_key is
  'Optional retry-safe request key; uniqueness is added as a partial index later.';

-- =============================================================================
-- 2. CLAIM REVIEW FINDINGS
-- =============================================================================

create table public.claim_review_findings (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_review_id uuid not null,

  finding_code text not null,
  finding_category text not null,
  finding_status text not null default 'open',
  severity text not null,

  subject_type text not null default 'claim',
  subject_reference_id uuid,
  field_path text,

  title text not null,
  finding_text text not null,

  recommended_action text not null default 'none',
  requires_response boolean not null default false,
  response_due_at timestamptz,

  resolved_at timestamptz,
  resolved_by uuid,
  resolution_code text,
  resolution_text text,

  source_type text not null default 'human_review',
  source_reference text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_review_findings_code_format_chk
    check (
      finding_code = lower(btrim(finding_code))
      and finding_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_review_findings_category_chk
    check (
      finding_category in (
        'administrative',
        'clinical',
        'medical_coding',
        'coverage',
        'benefit_limit',
        'exclusion',
        'waiting_period',
        'cost',
        'fraud',
        'evidence',
        'document',
        'data_quality',
        'other'
      )
    ),

  constraint claim_review_findings_status_chk
    check (
      finding_status in (
        'open',
        'acknowledged',
        'waiting_response',
        'resolved',
        'dismissed'
      )
    ),

  constraint claim_review_findings_severity_chk
    check (
      severity in ('info', 'low', 'medium', 'high', 'critical')
    ),

  constraint claim_review_findings_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'diagnosis',
        'procedure',
        'document',
        'evidence_requirement',
        'policy_coverage',
        'validation_result',
        'ai_assessment',
        'other'
      )
    ),

  constraint claim_review_findings_subject_reference_chk
    check (
      (subject_type = 'claim' and subject_reference_id is null)
      or
      (subject_type <> 'claim' and subject_reference_id is not null)
    ),

  constraint claim_review_findings_field_path_not_blank_chk
    check (
      field_path is null
      or btrim(field_path) <> ''
    ),

  constraint claim_review_findings_title_not_blank_chk
    check (btrim(title) <> ''),

  constraint claim_review_findings_text_not_blank_chk
    check (btrim(finding_text) <> ''),

  constraint claim_review_findings_action_chk
    check (
      recommended_action in (
        'none',
        'request_information',
        'request_correction',
        'adjust_amount',
        'escalate',
        'reject_item',
        'reject_claim'
      )
    ),

  constraint claim_review_findings_response_due_chk
    check (
      response_due_at is null
      or requires_response = true
    ),

  constraint claim_review_findings_waiting_response_chk
    check (
      finding_status <> 'waiting_response'
      or requires_response = true
    ),

  constraint claim_review_findings_resolution_pair_chk
    check (
      num_nonnulls(
        resolved_at,
        resolved_by,
        resolution_code,
        resolution_text
      ) in (0, 4)
    ),

  constraint claim_review_findings_resolution_state_chk
    check (
      (
        finding_status in ('resolved', 'dismissed')
        and resolved_at is not null
      )
      or
      (
        finding_status in (
          'open',
          'acknowledged',
          'waiting_response'
        )
        and resolved_at is null
      )
    ),

  constraint claim_review_findings_resolution_text_not_blank_chk
    check (
      resolution_text is null
      or btrim(resolution_text) <> ''
    ),

  constraint claim_review_findings_resolved_not_before_created_chk
    check (
      resolved_at is null
      or resolved_at >= created_at
    ),

  constraint claim_review_findings_source_type_chk
    check (
      source_type in (
        'human_review',
        'validation_result',
        'policy_coverage',
        'ai_assessment',
        'payer_response',
        'import'
      )
    ),

  constraint claim_review_findings_source_reference_not_blank_chk
    check (
      source_reference is null
      or btrim(source_reference) <> ''
    ),

  constraint claim_review_findings_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_review_findings_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_review_findings_review_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_review_id
    )
    references public.claim_reviews(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_review_findings_resolved_by_fk
    foreign key (resolved_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_review_findings_resolution_code_fk
    foreign key (resolution_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_review_findings_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_review_findings_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_review_findings_review_finding_uq
    unique nulls not distinct (
      claim_review_id,
      finding_code,
      subject_type,
      subject_reference_id,
      field_path
    )
);

comment on table public.claim_review_findings is
  'Structured findings created and resolved by authorized human reviewers.';

comment on column public.claim_review_findings.finding_text is
  'Minimum-necessary business explanation; unnecessary PHI must not be stored.';

-- =============================================================================
-- 3. CLAIM DECISIONS
-- =============================================================================

create table public.claim_decisions (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_review_id uuid not null,

  decision_version integer not null,
  decision_status text not null default 'draft',
  decision_outcome text,

  currency_code char(3) not null,

  submitted_amount numeric(18,2) not null,
  approved_amount numeric(18,2),
  rejected_amount numeric(18,2),
  patient_responsibility_amount numeric(18,2),
  payer_responsibility_amount numeric(18,2),

  decision_reason_code text,
  decision_reason_text text,
  decision_summary text,

  decided_by uuid,
  decision_role_snapshot text,
  decided_at timestamptz,

  supersedes_decision_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_decisions_version_chk
    check (decision_version > 0),

  constraint claim_decisions_status_chk
    check (
      decision_status in (
        'draft',
        'final',
        'superseded',
        'cancelled'
      )
    ),

  constraint claim_decisions_outcome_chk
    check (
      decision_outcome is null
      or decision_outcome in (
        'approved',
        'partially_approved',
        'rejected',
        'request_information',
        'returned_for_correction'
      )
    ),

  constraint claim_decisions_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_decisions_amounts_nonnegative_chk
    check (
      submitted_amount >= 0
      and (approved_amount is null or approved_amount >= 0)
      and (rejected_amount is null or rejected_amount >= 0)
      and (
        patient_responsibility_amount is null
        or patient_responsibility_amount >= 0
      )
      and (
        payer_responsibility_amount is null
        or payer_responsibility_amount >= 0
      )
    ),

  constraint claim_decisions_final_fields_chk
    check (
      decision_status <> 'final'
      or (
        decision_outcome is not null
        and decided_by is not null
        and decision_role_snapshot is not null
        and decided_at is not null
      )
    ),

  constraint claim_decisions_nonfinal_decided_fields_chk
    check (
      decision_status = 'final'
      or (
        decided_by is null
        and decision_role_snapshot is null
        and decided_at is null
      )
    ),

  constraint claim_decisions_financial_outcome_fields_chk
    check (
      decision_outcome not in (
        'approved',
        'partially_approved',
        'rejected'
      )
      or (
        approved_amount is not null
        and rejected_amount is not null
        and patient_responsibility_amount is not null
        and payer_responsibility_amount is not null
      )
    ),

  constraint claim_decisions_nonfinancial_outcome_fields_chk
    check (
      decision_outcome not in (
        'request_information',
        'returned_for_correction'
      )
      or (
        approved_amount is null
        and rejected_amount is null
        and patient_responsibility_amount is null
        and payer_responsibility_amount is null
      )
    ),

  constraint claim_decisions_amount_balance_chk
    check (
      decision_outcome not in (
        'approved',
        'partially_approved',
        'rejected'
      )
      or approved_amount + rejected_amount = submitted_amount
    ),

  constraint claim_decisions_responsibility_balance_chk
    check (
      decision_outcome not in (
        'approved',
        'partially_approved'
      )
      or payer_responsibility_amount
           + patient_responsibility_amount
           = approved_amount
    ),

  constraint claim_decisions_approved_outcome_chk
    check (
      decision_outcome <> 'approved'
      or (
        rejected_amount = 0
        and approved_amount = submitted_amount
      )
    ),

  constraint claim_decisions_partial_outcome_chk
    check (
      decision_outcome <> 'partially_approved'
      or (
        approved_amount > 0
        and rejected_amount > 0
      )
    ),

  constraint claim_decisions_rejected_outcome_chk
    check (
      decision_outcome <> 'rejected'
      or (
        approved_amount = 0
        and rejected_amount = submitted_amount
        and payer_responsibility_amount = 0
        and patient_responsibility_amount = 0
      )
    ),

  constraint claim_decisions_reason_text_not_blank_chk
    check (
      decision_reason_text is null
      or btrim(decision_reason_text) <> ''
    ),

  constraint claim_decisions_reason_required_chk
    check (
      decision_outcome not in (
        'partially_approved',
        'rejected',
        'request_information',
        'returned_for_correction'
      )
      or (
        decision_reason_code is not null
        and decision_reason_text is not null
      )
    ),

  constraint claim_decisions_summary_not_blank_chk
    check (
      decision_summary is null
      or btrim(decision_summary) <> ''
    ),

  constraint claim_decisions_role_not_blank_chk
    check (
      decision_role_snapshot is null
      or btrim(decision_role_snapshot) <> ''
    ),

  constraint claim_decisions_time_order_chk
    check (
      (decided_at is null or decided_at >= created_at)
      and updated_at >= created_at
    ),

  constraint claim_decisions_supersedes_not_self_chk
    check (
      supersedes_decision_id is null
      or supersedes_decision_id <> id
    ),

  constraint claim_decisions_version_lineage_chk
    check (
      (decision_version = 1 and supersedes_decision_id is null)
      or
      (decision_version > 1 and supersedes_decision_id is not null)
    ),

  constraint claim_decisions_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_decisions_review_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_review_id
    )
    references public.claim_reviews(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_decisions_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_decisions_decided_by_fk
    foreign key (decided_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_decisions_reason_code_fk
    foreign key (decision_reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_decisions_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_decisions_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_decisions_claim_version_uq
    unique (claim_id, decision_version),

  constraint claim_decisions_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id),

  constraint claim_decisions_supersedes_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      supersedes_decision_id
    )
    references public.claim_decisions(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict
);

comment on table public.claim_decisions is
  'Versioned human claim adjudication. AI output cannot finalize or replace an authorized human decision.';

comment on column public.claim_decisions.decision_version is
  'Monotonic decision version within one claim.';

comment on column public.claim_decisions.supersedes_decision_id is
  'Previous decision version for the same tenant and claim.';

-- =============================================================================
-- 4. CLAIM DECISION ADJUSTMENTS
-- =============================================================================

create table public.claim_decision_adjustments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_decision_id uuid not null,

  claim_item_id uuid,

  adjustment_number integer not null,
  adjustment_type text not null,

  currency_code char(3) not null,
  original_amount numeric(18,2) not null,
  adjusted_amount numeric(18,2) not null,
  adjustment_amount numeric(18,2)
    generated always as (original_amount - adjusted_amount) stored,

  reason_code text not null,
  reason_text text not null,

  source_type text not null default 'human_review',
  source_reference text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_decision_adjustments_number_chk
    check (adjustment_number > 0),

  constraint claim_decision_adjustments_type_chk
    check (
      adjustment_type in (
        'benefit_limit',
        'exclusion',
        'waiting_period',
        'non_covered_service',
        'pricing_adjustment',
        'coding_adjustment',
        'duplicate_charge',
        'patient_responsibility',
        'manual_adjustment',
        'other'
      )
    ),

  constraint claim_decision_adjustments_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_decision_adjustments_amounts_chk
    check (
      original_amount >= 0
      and adjusted_amount >= 0
    ),

  constraint claim_decision_adjustments_reason_text_not_blank_chk
    check (btrim(reason_text) <> ''),

  constraint claim_decision_adjustments_source_type_chk
    check (
      source_type in (
        'human_review',
        'payer_rule',
        'policy_coverage',
        'validation_result',
        'external_payer',
        'import'
      )
    ),

  constraint claim_decision_adjustments_source_reference_not_blank_chk
    check (
      source_reference is null
      or btrim(source_reference) <> ''
    ),

  constraint claim_decision_adjustments_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_decision_adjustments_decision_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id
    )
    references public.claim_decisions(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_decision_adjustments_item_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_item_id
    )
    references public.claim_items(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_decision_adjustments_reason_code_fk
    foreign key (reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_decision_adjustments_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_decision_adjustments_decision_number_uq
    unique (claim_decision_id, adjustment_number)
);

comment on table public.claim_decision_adjustments is
  'Claim-level or item-level amount adjustment supporting a versioned human adjudication decision.';

comment on column public.claim_decision_adjustments.adjustment_amount is
  'Stored generated value equal to original_amount minus adjusted_amount.';

-- =============================================================================
-- 5. DEFERRED CURRENT DECISION REFERENCE
-- =============================================================================

alter table public.claims
  add constraint claims_current_decision_claim_fk
  foreign key (
    organization_id,
    clinic_id,
    id,
    current_decision_id
  )
  references public.claim_decisions(
    organization_id,
    clinic_id,
    claim_id,
    id
  )
  on update restrict
  on delete restrict;

comment on constraint claims_current_decision_claim_fk
  on public.claims is
  'Tenant-safe pointer to the current decision for the same claim. Final-status enforcement is handled by trusted workflow logic.';

commit;