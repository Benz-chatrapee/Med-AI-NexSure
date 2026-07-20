-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim AI Assessment
-- Migration: 20260720082435_phase3_claim_ai_assessment.sql
-- =============================================================================
--
-- PURPOSE
--   Create AI decision-support assessment, risk signal, explainability, and
--   human-review tables for Med AI NexSure.
--
-- RESPONSIBILITY
--   - public.claim_ai_assessments
--   - public.claim_ai_risk_signals
--   - public.claim_ai_explanations
--   - public.claim_ai_review_outcomes
--   - Human-in-the-loop AI governance
--   - Explainability and model traceability
--   - Tenant-safe relational integrity
--
-- DOMAIN BOUNDARIES
--   claim_ai_assessments
--     Stores one versioned AI assessment execution for a claim.
--
--   claim_ai_risk_signals
--     Stores individual risk or anomaly signals produced by an assessment.
--
--   claim_ai_explanations
--     Stores human-readable explanations and feature contributions.
--
--   claim_ai_review_outcomes
--     Stores authorized human review of AI decision-support output.
--
-- OUT OF SCOPE
--   - RLS policies
--   - Permission grants
--   - Model execution
--   - External AI or payer API integration
--   - Performance and partial indexes
--   - Audit integration
--   - Functions and triggers
--   - Final claim adjudication decisions
--
-- REQUIRED EXISTING OBJECTS
--   public.claims(organization_id, clinic_id, id)
--   public.user_profiles(id)
--
-- IMPORTANT
--   - AI output is decision support only.
--   - AI must not approve, reject, or pay a claim.
--   - High and critical risk assessments require human review.
--   - Hidden chain-of-thought, raw prompts, secrets, raw medical records,
--     unnecessary PHI, and full external payloads must not be stored.
--   - Active/current uniqueness and performance indexes are deferred to
--     phase3_claim_indexes.sql.
-- =============================================================================

begin;

-- =============================================================================
-- 1. CLAIM AI ASSESSMENTS
-- =============================================================================

create table public.claim_ai_assessments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  assessment_number integer not null,
  assessment_type text not null,
  assessment_purpose text not null,
  assessment_status text not null default 'pending',
  trigger_source text not null,

  idempotency_key text,

  model_provider text not null,
  model_name text not null,
  model_version text not null,
  model_hash text,
  model_deployment_reference text,

  prompt_version text,
  feature_set_version text,
  feature_set_hash text,
  ruleset_reference text,
  ruleset_version text,
  governance_policy_version text not null,

  input_quality_status text not null default 'unknown',
  input_completeness_score numeric(5,2),

  risk_score numeric(5,2),
  confidence_score numeric(5,2),
  risk_level text not null default 'unknown',

  recommended_action text not null default 'manual_review',
  requires_human_review boolean not null default true,
  review_required_by timestamptz,

  threshold_snapshot jsonb not null default '{}'::jsonb,
  input_snapshot jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  started_at timestamptz,
  completed_at timestamptz,

  error_code text,
  error_message text,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_ai_assessments_number_chk
    check (assessment_number > 0),

  constraint claim_ai_assessments_type_chk
    check (
      assessment_type in (
        'fraud',
        'cost_anomaly',
        'duplicate_claim',
        'medical_coding',
        'clinical_consistency',
        'evidence_anomaly',
        'provider_pattern',
        'patient_pattern',
        'composite_risk'
      )
    ),

  constraint claim_ai_assessments_purpose_chk
    check (
      assessment_purpose in (
        'pre_submission_screening',
        'claim_triage',
        'fraud_investigation',
        'medical_review_support',
        'cost_validation',
        'post_payment_monitoring'
      )
    ),

  constraint claim_ai_assessments_status_chk
    check (
      assessment_status in (
        'pending',
        'running',
        'completed',
        'failed',
        'cancelled'
      )
    ),

  constraint claim_ai_assessments_trigger_source_chk
    check (
      trigger_source in (
        'manual',
        'workflow',
        'system',
        'claim_submission',
        'claim_update',
        'external_request'
      )
    ),

  constraint claim_ai_assessments_idempotency_key_not_blank_chk
    check (
      idempotency_key is null
      or btrim(idempotency_key) <> ''
    ),

  constraint claim_ai_assessments_model_provider_not_blank_chk
    check (btrim(model_provider) <> ''),

  constraint claim_ai_assessments_model_name_not_blank_chk
    check (btrim(model_name) <> ''),

  constraint claim_ai_assessments_model_version_not_blank_chk
    check (btrim(model_version) <> ''),

  constraint claim_ai_assessments_model_hash_not_blank_chk
    check (
      model_hash is null
      or btrim(model_hash) <> ''
    ),

  constraint claim_ai_assessments_model_deployment_not_blank_chk
    check (
      model_deployment_reference is null
      or btrim(model_deployment_reference) <> ''
    ),

  constraint claim_ai_assessments_prompt_version_not_blank_chk
    check (
      prompt_version is null
      or btrim(prompt_version) <> ''
    ),

  constraint claim_ai_assessments_feature_set_version_not_blank_chk
    check (
      feature_set_version is null
      or btrim(feature_set_version) <> ''
    ),

  constraint claim_ai_assessments_feature_set_hash_not_blank_chk
    check (
      feature_set_hash is null
      or btrim(feature_set_hash) <> ''
    ),

  constraint claim_ai_assessments_ruleset_reference_not_blank_chk
    check (
      ruleset_reference is null
      or btrim(ruleset_reference) <> ''
    ),

  constraint claim_ai_assessments_ruleset_version_not_blank_chk
    check (
      ruleset_version is null
      or btrim(ruleset_version) <> ''
    ),

  constraint claim_ai_assessments_governance_version_not_blank_chk
    check (btrim(governance_policy_version) <> ''),

  constraint claim_ai_assessments_input_quality_chk
    check (
      input_quality_status in (
        'sufficient',
        'partial',
        'insufficient',
        'invalid',
        'unknown'
      )
    ),

  constraint claim_ai_assessments_input_completeness_score_chk
    check (
      input_completeness_score is null
      or input_completeness_score between 0 and 100
    ),

  constraint claim_ai_assessments_risk_score_chk
    check (
      risk_score is null
      or risk_score between 0 and 100
    ),

  constraint claim_ai_assessments_confidence_score_chk
    check (
      confidence_score is null
      or confidence_score between 0 and 100
    ),

  constraint claim_ai_assessments_risk_level_chk
    check (
      risk_level in (
        'low',
        'medium',
        'high',
        'critical',
        'unknown'
      )
    ),

  constraint claim_ai_assessments_recommended_action_chk
    check (
      recommended_action in (
        'no_action',
        'monitor',
        'manual_review',
        'request_information',
        'hold_submission',
        'escalate'
      )
    ),

  constraint claim_ai_assessments_high_risk_review_chk
    check (
      risk_level not in ('high', 'critical')
      or requires_human_review = true
    ),

  constraint claim_ai_assessments_critical_action_chk
    check (
      risk_level <> 'critical'
      or recommended_action in (
        'manual_review',
        'hold_submission',
        'escalate'
      )
    ),

  constraint claim_ai_assessments_review_due_chk
    check (
      review_required_by is null
      or requires_human_review = true
    ),

  constraint claim_ai_assessments_threshold_snapshot_object_chk
    check (jsonb_typeof(threshold_snapshot) = 'object'),

  constraint claim_ai_assessments_input_snapshot_object_chk
    check (jsonb_typeof(input_snapshot) = 'object'),

  constraint claim_ai_assessments_output_summary_object_chk
    check (jsonb_typeof(output_summary) = 'object'),

  constraint claim_ai_assessments_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_ai_assessments_start_state_chk
    check (
      (
        assessment_status = 'pending'
        and started_at is null
      )
      or
      (
        assessment_status = 'cancelled'
      )
      or
      (
        assessment_status in ('running', 'completed', 'failed')
        and started_at is not null
      )
    ),

  constraint claim_ai_assessments_completion_state_chk
    check (
      (
        assessment_status in ('completed', 'failed', 'cancelled')
        and completed_at is not null
      )
      or
      (
        assessment_status in ('pending', 'running')
        and completed_at is null
      )
    ),

  constraint claim_ai_assessments_completed_not_before_started_chk
    check (
      completed_at is null
      or started_at is null
      or completed_at >= started_at
    ),

  constraint claim_ai_assessments_completed_result_chk
    check (
      assessment_status <> 'completed'
      or (
        risk_score is not null
        and confidence_score is not null
        and risk_level <> 'unknown'
        and output_summary <> '{}'::jsonb
      )
    ),

  constraint claim_ai_assessments_failed_error_chk
    check (
      assessment_status <> 'failed'
      or error_message is not null
    ),

  constraint claim_ai_assessments_error_code_not_blank_chk
    check (
      error_code is null
      or btrim(error_code) <> ''
    ),

  constraint claim_ai_assessments_error_message_not_blank_chk
    check (
      error_message is null
      or btrim(error_message) <> ''
    ),

  constraint claim_ai_assessments_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_ai_assessments_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_ai_assessments_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_assessments_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_assessments_claim_type_number_uq
    unique (claim_id, assessment_type, assessment_number),

  constraint claim_ai_assessments_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id)
);

comment on table public.claim_ai_assessments is
  'Versioned AI decision-support assessment for a claim. This table never represents final claim adjudication.';

comment on column public.claim_ai_assessments.input_snapshot is
  'Minimum-necessary structured features only; raw medical records, full prompts, secrets, and unnecessary PHI are prohibited.';

comment on column public.claim_ai_assessments.output_summary is
  'Human-auditable structured AI summary; hidden chain-of-thought must not be stored.';

comment on column public.claim_ai_assessments.governance_policy_version is
  'AI governance policy version in effect when the assessment was created.';

-- =============================================================================
-- 2. CLAIM AI RISK SIGNALS
-- =============================================================================

create table public.claim_ai_risk_signals (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  ai_assessment_id uuid not null,

  signal_code text not null,
  signal_category text not null,

  signal_title text not null,
  signal_description text not null,

  subject_type text not null default 'claim',
  subject_reference_id uuid,
  field_path text,

  risk_score numeric(5,2),
  confidence_score numeric(5,2),
  severity text not null,

  recommended_action text not null,
  requires_human_review boolean not null default true,

  feature_values jsonb not null default '{}'::jsonb,
  evidence_references jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_ai_risk_signals_code_format_chk
    check (
      signal_code = lower(btrim(signal_code))
      and signal_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_ai_risk_signals_category_chk
    check (
      signal_category in (
        'fraud',
        'duplicate',
        'cost',
        'medical_coding',
        'clinical_consistency',
        'evidence',
        'provider_pattern',
        'patient_pattern',
        'policy',
        'data_quality',
        'other'
      )
    ),

  constraint claim_ai_risk_signals_title_not_blank_chk
    check (btrim(signal_title) <> ''),

  constraint claim_ai_risk_signals_description_not_blank_chk
    check (btrim(signal_description) <> ''),

  constraint claim_ai_risk_signals_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'diagnosis',
        'procedure',
        'document',
        'evidence_requirement',
        'provider',
        'patient',
        'policy_coverage',
        'other'
      )
    ),

  constraint claim_ai_risk_signals_subject_reference_chk
    check (
      (
        subject_type = 'claim'
        and subject_reference_id is null
      )
      or
      (
        subject_type <> 'claim'
        and subject_reference_id is not null
      )
    ),

  constraint claim_ai_risk_signals_field_path_not_blank_chk
    check (
      field_path is null
      or btrim(field_path) <> ''
    ),

  constraint claim_ai_risk_signals_risk_score_chk
    check (
      risk_score is null
      or risk_score between 0 and 100
    ),

  constraint claim_ai_risk_signals_confidence_score_chk
    check (
      confidence_score is null
      or confidence_score between 0 and 100
    ),

  constraint claim_ai_risk_signals_severity_chk
    check (
      severity in (
        'info',
        'low',
        'medium',
        'high',
        'critical'
      )
    ),

  constraint claim_ai_risk_signals_action_chk
    check (
      recommended_action in (
        'no_action',
        'monitor',
        'manual_review',
        'request_information',
        'hold_submission',
        'escalate'
      )
    ),

  constraint claim_ai_risk_signals_high_severity_review_chk
    check (
      severity not in ('high', 'critical')
      or requires_human_review = true
    ),

  constraint claim_ai_risk_signals_critical_action_chk
    check (
      severity <> 'critical'
      or recommended_action in (
        'manual_review',
        'hold_submission',
        'escalate'
      )
    ),

  constraint claim_ai_risk_signals_feature_values_object_chk
    check (jsonb_typeof(feature_values) = 'object'),

  constraint claim_ai_risk_signals_evidence_references_array_chk
    check (jsonb_typeof(evidence_references) = 'array'),

  constraint claim_ai_risk_signals_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_ai_risk_signals_assessment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id
    )
    references public.claim_ai_assessments(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_ai_risk_signals_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_risk_signals_assessment_signal_uq
    unique nulls not distinct (
      ai_assessment_id,
      signal_code,
      subject_type,
      subject_reference_id,
      field_path
    ),

  constraint claim_ai_risk_signals_assessment_identity_uq
    unique (
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id,
      id
    )
);

comment on table public.claim_ai_risk_signals is
  'Individual risk, anomaly, or data-quality signals produced by one AI claim assessment.';

comment on column public.claim_ai_risk_signals.signal_description is
  'Human-readable minimum-necessary description; hidden chain-of-thought and unnecessary PHI are prohibited.';

-- =============================================================================
-- 3. CLAIM AI EXPLANATIONS
-- =============================================================================

create table public.claim_ai_explanations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  ai_assessment_id uuid not null,
  risk_signal_id uuid,

  explanation_type text not null,
  sequence_number integer not null,

  title text not null,
  summary text not null,

  feature_name text,
  feature_value jsonb,
  baseline_value jsonb,
  contribution_score numeric(7,4),

  source_type text,
  source_reference text,

  explanation_data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_ai_explanations_type_chk
    check (
      explanation_type in (
        'model_summary',
        'feature_contribution',
        'rule_reference',
        'threshold_comparison',
        'peer_comparison',
        'similar_case',
        'data_quality',
        'human_readable'
      )
    ),

  constraint claim_ai_explanations_sequence_chk
    check (sequence_number > 0),

  constraint claim_ai_explanations_title_not_blank_chk
    check (btrim(title) <> ''),

  constraint claim_ai_explanations_summary_not_blank_chk
    check (btrim(summary) <> ''),

  constraint claim_ai_explanations_feature_name_not_blank_chk
    check (
      feature_name is null
      or btrim(feature_name) <> ''
    ),

  constraint claim_ai_explanations_feature_contribution_fields_chk
    check (
      explanation_type <> 'feature_contribution'
      or (
        feature_name is not null
        and feature_value is not null
        and contribution_score is not null
      )
    ),

  constraint claim_ai_explanations_source_type_chk
    check (
      source_type is null
      or source_type in (
        'model',
        'rule',
        'threshold',
        'peer_group',
        'similar_case',
        'data_quality'
      )
    ),

  constraint claim_ai_explanations_source_reference_not_blank_chk
    check (
      source_reference is null
      or btrim(source_reference) <> ''
    ),

  constraint claim_ai_explanations_source_pair_chk
    check (
      (
        source_type is null
        and source_reference is null
      )
      or
      (
        source_type is not null
        and source_reference is not null
      )
    ),

  constraint claim_ai_explanations_data_object_chk
    check (jsonb_typeof(explanation_data) = 'object'),

  constraint claim_ai_explanations_assessment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id
    )
    references public.claim_ai_assessments(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_ai_explanations_signal_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id,
      risk_signal_id
    )
    references public.claim_ai_risk_signals(
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_ai_explanations_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_explanations_sequence_uq
    unique nulls not distinct (
      ai_assessment_id,
      risk_signal_id,
      explanation_type,
      sequence_number
    )
);

comment on table public.claim_ai_explanations is
  'Human-readable, auditable explanations for AI claim assessments and risk signals.';

comment on column public.claim_ai_explanations.summary is
  'Business-readable explanation only; hidden chain-of-thought must not be stored.';

-- =============================================================================
-- 4. CLAIM AI REVIEW OUTCOMES
-- =============================================================================

create table public.claim_ai_review_outcomes (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  ai_assessment_id uuid not null,

  review_number integer not null,
  review_status text not null default 'pending',
  review_decision text,

  review_reason_code text,
  review_reason_text text,

  reviewer_role_snapshot text,
  reviewed_by uuid,
  reviewed_at timestamptz,

  confirmed_risk_level text,
  confirmed_action text,

  feedback_label text,
  feedback_notes text,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_ai_review_outcomes_number_chk
    check (review_number > 0),

  constraint claim_ai_review_outcomes_status_chk
    check (
      review_status in (
        'pending',
        'in_review',
        'completed',
        'dismissed',
        'cancelled'
      )
    ),

  constraint claim_ai_review_outcomes_decision_chk
    check (
      review_decision is null
      or review_decision in (
        'confirmed',
        'partially_confirmed',
        'rejected',
        'needs_more_information',
        'escalated'
      )
    ),

  constraint claim_ai_review_outcomes_reason_code_not_blank_chk
    check (
      review_reason_code is null
      or btrim(review_reason_code) <> ''
    ),

  constraint claim_ai_review_outcomes_reason_text_not_blank_chk
    check (
      review_reason_text is null
      or btrim(review_reason_text) <> ''
    ),

  constraint claim_ai_review_outcomes_reviewer_role_not_blank_chk
    check (
      reviewer_role_snapshot is null
      or btrim(reviewer_role_snapshot) <> ''
    ),

  constraint claim_ai_review_outcomes_risk_level_chk
    check (
      confirmed_risk_level is null
      or confirmed_risk_level in (
        'low',
        'medium',
        'high',
        'critical',
        'unknown'
      )
    ),

  constraint claim_ai_review_outcomes_action_chk
    check (
      confirmed_action is null
      or confirmed_action in (
        'no_action',
        'monitor',
        'manual_review',
        'request_information',
        'hold_submission',
        'escalate'
      )
    ),

  constraint claim_ai_review_outcomes_feedback_label_chk
    check (
      feedback_label is null
      or feedback_label in (
        'true_positive',
        'false_positive',
        'true_negative',
        'false_negative',
        'uncertain',
        'not_applicable'
      )
    ),

  constraint claim_ai_review_outcomes_feedback_notes_not_blank_chk
    check (
      feedback_notes is null
      or btrim(feedback_notes) <> ''
    ),

  constraint claim_ai_review_outcomes_pending_state_chk
    check (
      review_status <> 'pending'
      or (
        review_decision is null
        and reviewer_role_snapshot is null
        and reviewed_by is null
        and reviewed_at is null
      )
    ),

  constraint claim_ai_review_outcomes_in_review_state_chk
    check (
      review_status <> 'in_review'
      or (
        reviewer_role_snapshot is not null
        and reviewed_by is not null
        and reviewed_at is null
      )
    ),

  constraint claim_ai_review_outcomes_completed_state_chk
    check (
      review_status <> 'completed'
      or (
        review_decision is not null
        and reviewer_role_snapshot is not null
        and reviewed_by is not null
        and reviewed_at is not null
      )
    ),

  constraint claim_ai_review_outcomes_dismissed_state_chk
    check (
      review_status <> 'dismissed'
      or (
        reviewer_role_snapshot is not null
        and reviewed_by is not null
        and reviewed_at is not null
        and review_reason_text is not null
      )
    ),

  constraint claim_ai_review_outcomes_cancelled_state_chk
    check (
      review_status <> 'cancelled'
      or (
        reviewed_at is not null
        and review_reason_text is not null
      )
    ),

  constraint claim_ai_review_outcomes_feedback_state_chk
    check (
      feedback_label is null
      or review_status = 'completed'
    ),

  constraint claim_ai_review_outcomes_confirmed_fields_chk
    check (
      review_status <> 'completed'
      or (
        confirmed_risk_level is not null
        and confirmed_action is not null
      )
    ),

  constraint claim_ai_review_outcomes_reviewed_not_before_created_chk
    check (
      reviewed_at is null
      or reviewed_at >= created_at
    ),

  constraint claim_ai_review_outcomes_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_ai_review_outcomes_assessment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      ai_assessment_id
    )
    references public.claim_ai_assessments(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_ai_review_outcomes_reviewed_by_fk
    foreign key (reviewed_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_review_outcomes_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_review_outcomes_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_ai_review_outcomes_assessment_review_uq
    unique (ai_assessment_id, review_number)
);

comment on table public.claim_ai_review_outcomes is
  'Authorized human review of AI decision-support output. This table is not the final claim adjudication decision.';

comment on column public.claim_ai_review_outcomes.feedback_label is
  'Human feedback used for model monitoring and improvement; it must not directly alter the final claim decision.';

comment on column public.claim_ai_review_outcomes.feedback_notes is
  'Minimum-necessary reviewer feedback; unnecessary PHI is prohibited.';

commit;