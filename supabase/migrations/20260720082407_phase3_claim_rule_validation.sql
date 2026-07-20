-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Rule Validation
-- Migration: 20260720082407_phase3_claim_rule_validation.sql
-- =============================================================================
--
-- PURPOSE
--   Create deterministic claim validation run, result, and authorized override
--   tables for Med AI NexSure.
--
-- RESPONSIBILITY
--   - public.claim_validation_runs
--   - public.claim_validation_results
--   - public.claim_validation_overrides
--   - Tenant-safe relational integrity
--   - Validation lifecycle integrity
--   - Human override governance
--
-- DOMAIN BOUNDARIES
--   claim_validation_runs
--     Stores one execution of a claim validation ruleset.
--
--   claim_validation_results
--     Stores the result of each deterministic rule evaluated in a run.
--
--   claim_validation_overrides
--     Stores an authorized human override for one validation result.
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
--   public.user_profiles(id)
--
-- IMPORTANT
--   - AI findings must not be written directly into these tables.
--   - One validation run may contain many deterministic rule results.
--   - Override authorization is recorded here; permission enforcement is added
--     later in the permissions, RLS, and workflow migrations.
--   - Active-only uniqueness is deferred to phase3_claim_indexes.sql.
-- =============================================================================

begin;

-- =============================================================================
-- 1. CLAIM VALIDATION RUNS
-- =============================================================================

create table public.claim_validation_runs (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  validation_stage text not null,
  run_status text not null default 'pending',
  trigger_source text not null,

  ruleset_reference text not null,
  ruleset_version text not null,
  ruleset_snapshot jsonb not null default '{}'::jsonb,

  started_at timestamptz,
  completed_at timestamptz,

  summary_status text not null default 'not_evaluated',

  passed_count integer not null default 0,
  warning_count integer not null default 0,
  failed_count integer not null default 0,
  blocked_count integer not null default 0,
  needs_review_count integer not null default 0,
  not_applicable_count integer not null default 0,

  error_code text,
  error_message text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_validation_runs_stage_chk
    check (
      validation_stage in (
        'draft',
        'pre_submission',
        'submission',
        'pre_adjudication',
        'post_adjudication'
      )
    ),

  constraint claim_validation_runs_status_chk
    check (
      run_status in (
        'pending',
        'running',
        'completed',
        'failed',
        'cancelled'
      )
    ),

  constraint claim_validation_runs_trigger_source_chk
    check (
      trigger_source in (
        'manual',
        'system',
        'workflow',
        'external_payer',
        'import'
      )
    ),

  constraint claim_validation_runs_ruleset_reference_not_blank_chk
    check (btrim(ruleset_reference) <> ''),

  constraint claim_validation_runs_ruleset_version_not_blank_chk
    check (btrim(ruleset_version) <> ''),

  constraint claim_validation_runs_ruleset_snapshot_object_chk
    check (jsonb_typeof(ruleset_snapshot) = 'object'),

  constraint claim_validation_runs_summary_status_chk
    check (
      summary_status in (
        'not_evaluated',
        'passed',
        'warning',
        'failed',
        'blocked',
        'needs_review'
      )
    ),

  constraint claim_validation_runs_counts_chk
    check (
      passed_count >= 0
      and warning_count >= 0
      and failed_count >= 0
      and blocked_count >= 0
      and needs_review_count >= 0
      and not_applicable_count >= 0
    ),

  constraint claim_validation_runs_start_state_chk
    check (
      run_status = 'pending'
      or started_at is not null
    ),

  constraint claim_validation_runs_completion_state_chk
    check (
      (
        run_status in ('completed', 'failed', 'cancelled')
        and completed_at is not null
      )
      or
      (
        run_status in ('pending', 'running')
        and completed_at is null
      )
    ),

  constraint claim_validation_runs_completed_not_before_started_chk
    check (
      completed_at is null
      or (
        started_at is not null
        and completed_at >= started_at
      )
    ),

  constraint claim_validation_runs_completed_summary_chk
    check (
      run_status <> 'completed'
      or summary_status <> 'not_evaluated'
    ),

  constraint claim_validation_runs_error_code_not_blank_chk
    check (
      error_code is null
      or btrim(error_code) <> ''
    ),

  constraint claim_validation_runs_error_message_not_blank_chk
    check (
      error_message is null
      or btrim(error_message) <> ''
    ),

  constraint claim_validation_runs_failure_error_chk
    check (
      run_status <> 'failed'
      or error_message is not null
    ),

  constraint claim_validation_runs_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_validation_runs_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_validation_runs_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_validation_runs_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_runs_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_runs_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id),

  constraint claim_validation_runs_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_validation_runs is
  'One deterministic claim validation execution against a versioned ruleset.';

comment on column public.claim_validation_runs.ruleset_snapshot is
  'Immutable minimum-necessary ruleset metadata snapshot used for reproducibility.';

comment on column public.claim_validation_runs.summary_status is
  'Overall deterministic validation outcome for the run.';

-- =============================================================================
-- 2. CLAIM VALIDATION RESULTS
-- =============================================================================

create table public.claim_validation_results (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  validation_run_id uuid not null,

  rule_code text not null,
  rule_category text not null,
  rule_version text not null,

  result_status text not null,
  severity text not null,
  blocking_action text not null default 'none',

  subject_type text not null default 'claim',
  subject_reference_id uuid,

  result_code text,
  message text not null,

  expected_value jsonb,
  actual_value jsonb,
  result_data jsonb not null default '{}'::jsonb,

  evaluated_at timestamptz not null default now(),
  evaluation_source text not null default 'system_rule',
  evaluated_by uuid,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_validation_results_rule_code_format_chk
    check (
      rule_code = lower(btrim(rule_code))
      and rule_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_validation_results_rule_category_chk
    check (
      rule_category in (
        'coverage',
        'benefit_limit',
        'exclusion',
        'waiting_period',
        'evidence',
        'medical_coding',
        'cost',
        'duplicate',
        'administrative',
        'clinical_consistency',
        'policy',
        'other'
      )
    ),

  constraint claim_validation_results_rule_version_not_blank_chk
    check (btrim(rule_version) <> ''),

  constraint claim_validation_results_status_chk
    check (
      result_status in (
        'passed',
        'warning',
        'failed',
        'blocked',
        'not_applicable',
        'needs_review'
      )
    ),

  constraint claim_validation_results_severity_chk
    check (
      severity in (
        'info',
        'low',
        'medium',
        'high',
        'critical'
      )
    ),

  constraint claim_validation_results_blocking_action_chk
    check (
      blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_validation_results_blocked_action_chk
    check (
      result_status <> 'blocked'
      or blocking_action in (
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_validation_results_nonblocking_action_chk
    check (
      result_status = 'blocked'
      or blocking_action not in (
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_validation_results_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'diagnosis',
        'procedure',
        'document',
        'evidence_requirement',
        'policy_coverage',
        'other'
      )
    ),

  constraint claim_validation_results_subject_reference_chk
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

  constraint claim_validation_results_result_code_not_blank_chk
    check (
      result_code is null
      or btrim(result_code) <> ''
    ),

  constraint claim_validation_results_message_not_blank_chk
    check (btrim(message) <> ''),

  constraint claim_validation_results_expected_value_type_chk
    check (
      expected_value is null
      or jsonb_typeof(expected_value) in (
        'object',
        'array',
        'string',
        'number',
        'boolean',
        'null'
      )
    ),

  constraint claim_validation_results_actual_value_type_chk
    check (
      actual_value is null
      or jsonb_typeof(actual_value) in (
        'object',
        'array',
        'string',
        'number',
        'boolean',
        'null'
      )
    ),

  constraint claim_validation_results_result_data_object_chk
    check (jsonb_typeof(result_data) = 'object'),

  constraint claim_validation_results_evaluation_source_chk
    check (
      evaluation_source in (
        'system_rule',
        'human_review',
        'external_payer',
        'import'
      )
    ),

  constraint claim_validation_results_evaluator_required_chk
    check (
      evaluation_source <> 'human_review'
      or evaluated_by is not null
    ),

  constraint claim_validation_results_evaluated_not_before_created_chk
    check (evaluated_at >= created_at),

  constraint claim_validation_results_run_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      validation_run_id
    )
    references public.claim_validation_runs(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_validation_results_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_validation_results_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_results_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_results_run_rule_uq
    unique (validation_run_id, rule_code, subject_type, subject_reference_id),

  constraint claim_validation_results_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id),

  constraint claim_validation_results_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_validation_results is
  'Deterministic result of one validation rule within one claim validation run.';

comment on column public.claim_validation_results.subject_reference_id is
  'Domain record identifier evaluated by the rule; polymorphic integrity is enforced by trusted workflow logic.';

comment on column public.claim_validation_results.expected_value is
  'Minimum-necessary expected value snapshot for explainability.';

comment on column public.claim_validation_results.actual_value is
  'Minimum-necessary observed value snapshot for explainability.';

-- =============================================================================
-- 3. CLAIM VALIDATION OVERRIDES
-- =============================================================================

create table public.claim_validation_overrides (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  validation_result_id uuid not null,

  override_status text not null default 'active',
  override_action text not null,

  reason_code text not null,
  reason_text text not null,

  replacement_result_status text,
  replacement_severity text,
  replacement_blocking_action text,

  approved_role_snapshot text not null,
  approved_by uuid not null,
  approved_at timestamptz not null default now(),

  expires_at timestamptz,

  revoked_by uuid,
  revoked_at timestamptz,
  revocation_reason text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_validation_overrides_status_chk
    check (
      override_status in (
        'active',
        'expired',
        'revoked'
      )
    ),

  constraint claim_validation_overrides_action_chk
    check (
      override_action in (
        'accept_warning',
        'allow_submission',
        'mark_not_applicable',
        'replace_result',
        'request_manual_review'
      )
    ),

  constraint claim_validation_overrides_reason_code_format_chk
    check (
      reason_code = lower(btrim(reason_code))
      and reason_code ~ '^[a-z][a-z0-9_]{2,63}$'
    ),

  constraint claim_validation_overrides_reason_text_not_blank_chk
    check (btrim(reason_text) <> ''),

  constraint claim_validation_overrides_replacement_status_chk
    check (
      replacement_result_status is null
      or replacement_result_status in (
        'passed',
        'warning',
        'failed',
        'blocked',
        'not_applicable',
        'needs_review'
      )
    ),

  constraint claim_validation_overrides_replacement_severity_chk
    check (
      replacement_severity is null
      or replacement_severity in (
        'info',
        'low',
        'medium',
        'high',
        'critical'
      )
    ),

  constraint claim_validation_overrides_replacement_action_chk
    check (
      replacement_blocking_action is null
      or replacement_blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_validation_overrides_replace_result_fields_chk
    check (
      (
        override_action = 'replace_result'
        and replacement_result_status is not null
        and replacement_severity is not null
        and replacement_blocking_action is not null
      )
      or
      (
        override_action <> 'replace_result'
        and replacement_result_status is null
        and replacement_severity is null
        and replacement_blocking_action is null
      )
    ),

  constraint claim_validation_overrides_replacement_blocked_chk
    check (
      replacement_result_status <> 'blocked'
      or replacement_blocking_action in (
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_validation_overrides_approved_role_not_blank_chk
    check (btrim(approved_role_snapshot) <> ''),

  constraint claim_validation_overrides_expiry_chk
    check (
      expires_at is null
      or expires_at > approved_at
    ),

  constraint claim_validation_overrides_revocation_pair_chk
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

  constraint claim_validation_overrides_revocation_reason_not_blank_chk
    check (
      revocation_reason is null
      or btrim(revocation_reason) <> ''
    ),

  constraint claim_validation_overrides_revoked_status_chk
    check (
      override_status <> 'revoked'
      or revoked_at is not null
    ),

  constraint claim_validation_overrides_nonrevoked_fields_chk
    check (
      override_status = 'revoked'
      or revoked_at is null
    ),

  constraint claim_validation_overrides_revoked_not_before_approved_chk
    check (
      revoked_at is null
      or revoked_at >= approved_at
    ),

  constraint claim_validation_overrides_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_validation_overrides_approved_not_before_created_chk
    check (approved_at >= created_at),

  constraint claim_validation_overrides_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_validation_overrides_result_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      validation_result_id
    )
    references public.claim_validation_results(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_approved_by_fk
    foreign key (approved_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_revoked_by_fk
    foreign key (revoked_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_validation_overrides_tenant_identity_uq
    unique (organization_id, clinic_id, id)
);

comment on table public.claim_validation_overrides is
  'Authorized human override of one deterministic claim validation result.';

comment on column public.claim_validation_overrides.approved_role_snapshot is
  'Role or authority held by the approver at approval time.';

comment on column public.claim_validation_overrides.replacement_result_status is
  'Replacement deterministic status used only when override_action is replace_result.';

-- One active override per validation result is deferred to
-- phase3_claim_indexes.sql.

commit;