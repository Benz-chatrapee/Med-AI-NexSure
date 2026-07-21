-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Policy Coverage
-- Migration: 20260720082432_phase3_claim_policy_coverage.sql
-- =============================================================================

create table public.claim_policy_coverages (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,

  evaluation_number integer not null,
  evaluation_status text not null default 'pending',

  payer_reference text,
  payer_name_snapshot text,

  policy_number_snapshot text not null,
  plan_code_snapshot text,
  plan_name_snapshot text,
  member_number_snapshot text,

  coverage_start_date date,
  coverage_end_date date,
  service_date date not null,

  coverage_status text not null default 'unknown',
  blocking_action text not null default 'needs_review',

  coverage_reason_code text,
  coverage_reason_text text,

  source_type text not null,
  source_reference text,
  source_version text,
  source_effective_at timestamptz,
  source_hash text,

  policy_snapshot jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  evaluated_at timestamptz,
  evaluated_by uuid,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_policy_coverages_evaluation_number_chk
    check (evaluation_number > 0),

  constraint claim_policy_coverages_evaluation_status_chk
    check (
      evaluation_status in ('pending', 'evaluated', 'failed', 'cancelled')
    ),

  constraint claim_policy_coverages_payer_reference_not_blank_chk
    check (payer_reference is null or btrim(payer_reference) <> ''),

  constraint claim_policy_coverages_payer_name_not_blank_chk
    check (payer_name_snapshot is null or btrim(payer_name_snapshot) <> ''),

  constraint claim_policy_coverages_policy_number_not_blank_chk
    check (btrim(policy_number_snapshot) <> ''),

  constraint claim_policy_coverages_plan_code_not_blank_chk
    check (plan_code_snapshot is null or btrim(plan_code_snapshot) <> ''),

  constraint claim_policy_coverages_plan_name_not_blank_chk
    check (plan_name_snapshot is null or btrim(plan_name_snapshot) <> ''),

  constraint claim_policy_coverages_member_number_not_blank_chk
    check (member_number_snapshot is null or btrim(member_number_snapshot) <> ''),

  constraint claim_policy_coverages_period_chk
    check (
      coverage_end_date is null
      or coverage_start_date is null
      or coverage_end_date >= coverage_start_date
    ),

  constraint claim_policy_coverages_status_chk
    check (
      coverage_status in (
        'likely_covered',
        'needs_review',
        'not_covered',
        'unknown'
      )
    ),

  constraint claim_policy_coverages_blocking_action_chk
    check (
      blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_policy_coverages_not_covered_action_chk
    check (
      coverage_status <> 'not_covered'
      or blocking_action in ('block_submission', 'block_decision')
    ),

  constraint claim_policy_coverages_likely_covered_action_chk
    check (
      coverage_status <> 'likely_covered'
      or blocking_action in ('none', 'informational')
    ),

  constraint claim_policy_coverages_needs_review_action_chk
    check (
      coverage_status <> 'needs_review'
      or blocking_action in ('needs_review', 'block_decision')
    ),

  constraint claim_policy_coverages_reason_code_not_blank_chk
    check (coverage_reason_code is null or btrim(coverage_reason_code) <> ''),

  constraint claim_policy_coverages_reason_text_not_blank_chk
    check (coverage_reason_text is null or btrim(coverage_reason_text) <> ''),

  constraint claim_policy_coverages_negative_reason_required_chk
    check (
      coverage_status not in ('not_covered', 'needs_review')
      or coverage_reason_text is not null
    ),

  constraint claim_policy_coverages_source_type_chk
    check (
      source_type in (
        'payer_api',
        'policy_snapshot',
        'system_rule',
        'human_review',
        'import'
      )
    ),

  constraint claim_policy_coverages_source_reference_not_blank_chk
    check (source_reference is null or btrim(source_reference) <> ''),

  constraint claim_policy_coverages_source_version_not_blank_chk
    check (source_version is null or btrim(source_version) <> ''),

  constraint claim_policy_coverages_source_hash_not_blank_chk
    check (source_hash is null or btrim(source_hash) <> ''),

  constraint claim_policy_coverages_policy_snapshot_object_chk
    check (jsonb_typeof(policy_snapshot) = 'object'),

  constraint claim_policy_coverages_result_data_object_chk
    check (jsonb_typeof(result_data) = 'object'),

  constraint claim_policy_coverages_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_policy_coverages_evaluation_state_chk
    check (
      (evaluation_status = 'pending' and evaluated_at is null)
      or
      (
        evaluation_status in ('evaluated', 'failed', 'cancelled')
        and evaluated_at is not null
      )
    ),

  constraint claim_policy_coverages_human_evaluator_chk
    check (source_type <> 'human_review' or evaluated_by is not null),

  constraint claim_policy_coverages_evaluated_not_before_created_chk
    check (evaluated_at is null or evaluated_at >= created_at),

  constraint claim_policy_coverages_updated_not_before_created_chk
    check (updated_at >= created_at),

  constraint claim_policy_coverages_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims(organization_id, clinic_id, id)
    on update restrict
    on delete restrict,

  constraint claim_policy_coverages_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_policy_coverages_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_policy_coverages_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_policy_coverages_claim_evaluation_uq
    unique (claim_id, evaluation_number),

  constraint claim_policy_coverages_claim_identity_uq
    unique (organization_id, clinic_id, claim_id, id)
);

comment on table public.claim_policy_coverages is
  'Versioned claim-level policy coverage evaluation with minimum-necessary policy snapshots.';

comment on column public.claim_policy_coverages.policy_snapshot is
  'Minimum-necessary policy snapshot only; raw payer payloads and unnecessary PHI are prohibited.';

comment on column public.claim_policy_coverages.coverage_status is
  'Business coverage outcome, separate from evaluation processing status.';

create table public.claim_benefit_limit_results (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  policy_coverage_id uuid not null,

  rule_code text not null,
  rule_version text not null,
  rule_definition_hash text,

  benefit_code text not null,
  benefit_name_snapshot text,
  benefit_period text not null,

  subject_type text not null default 'claim',
  subject_reference_id uuid,
  field_path text,

  currency_code char(3) not null,

  limit_amount numeric(18,2) not null,
  used_amount_before_claim numeric(18,2) not null default 0,
  claim_amount numeric(18,2) not null default 0,
  remaining_amount_before_claim numeric(18,2),
  remaining_amount_after_claim numeric(18,2),

  result_status text not null,
  blocking_action text not null default 'none',

  reason_code text,
  reason_text text,

  result_data jsonb not null default '{}'::jsonb,

  evaluated_at timestamptz not null default now(),
  evaluation_source text not null default 'system_rule',
  evaluated_by uuid,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_benefit_limit_results_rule_code_format_chk
    check (
      rule_code = lower(btrim(rule_code))
      and rule_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_benefit_limit_results_rule_version_not_blank_chk
    check (btrim(rule_version) <> ''),

  constraint claim_benefit_limit_results_rule_hash_not_blank_chk
    check (rule_definition_hash is null or btrim(rule_definition_hash) <> ''),

  constraint claim_benefit_limit_results_benefit_code_not_blank_chk
    check (btrim(benefit_code) <> ''),

  constraint claim_benefit_limit_results_benefit_name_not_blank_chk
    check (benefit_name_snapshot is null or btrim(benefit_name_snapshot) <> ''),

  constraint claim_benefit_limit_results_period_chk
    check (
      benefit_period in (
        'per_visit',
        'per_day',
        'per_year',
        'per_policy',
        'lifetime',
        'other'
      )
    ),

  constraint claim_benefit_limit_results_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'procedure',
        'diagnosis',
        'other'
      )
    ),

  constraint claim_benefit_limit_results_subject_reference_chk
    check (
      (subject_type = 'claim' and subject_reference_id is null)
      or
      (subject_type <> 'claim' and subject_reference_id is not null)
    ),

  constraint claim_benefit_limit_results_field_path_not_blank_chk
    check (field_path is null or btrim(field_path) <> ''),

  constraint claim_benefit_limit_results_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_benefit_limit_results_amounts_chk
    check (
      limit_amount >= 0
      and used_amount_before_claim >= 0
      and claim_amount >= 0
    ),

  constraint claim_benefit_limit_results_remaining_before_chk
    check (
      remaining_amount_before_claim is null
      or remaining_amount_before_claim >= 0
    ),

  constraint claim_benefit_limit_results_status_chk
    check (
      result_status in (
        'within_limit',
        'near_limit',
        'exceeded',
        'not_applicable',
        'needs_review',
        'unknown'
      )
    ),

  constraint claim_benefit_limit_results_action_chk
    check (
      blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_benefit_limit_results_within_limit_chk
    check (
      result_status <> 'within_limit'
      or (
        remaining_amount_after_claim is not null
        and remaining_amount_after_claim >= 0
      )
    ),

  constraint claim_benefit_limit_results_exceeded_action_chk
    check (
      result_status <> 'exceeded'
      or blocking_action in (
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_benefit_limit_results_reason_code_not_blank_chk
    check (reason_code is null or btrim(reason_code) <> ''),

  constraint claim_benefit_limit_results_reason_text_not_blank_chk
    check (reason_text is null or btrim(reason_text) <> ''),

  constraint claim_benefit_limit_results_negative_reason_required_chk
    check (
      result_status not in ('exceeded', 'needs_review')
      or reason_text is not null
    ),

  constraint claim_benefit_limit_results_result_data_object_chk
    check (jsonb_typeof(result_data) = 'object'),

  constraint claim_benefit_limit_results_evaluation_source_chk
    check (
      evaluation_source in (
        'system_rule',
        'human_review',
        'external_payer',
        'import'
      )
    ),

  constraint claim_benefit_limit_results_human_evaluator_chk
    check (evaluation_source <> 'human_review' or evaluated_by is not null),

  constraint claim_benefit_limit_results_evaluated_not_before_created_chk
    check (evaluated_at >= created_at),

  constraint claim_benefit_limit_results_coverage_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      policy_coverage_id
    )
    references public.claim_policy_coverages(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_benefit_limit_results_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_benefit_limit_results_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_benefit_limit_results_rule_subject_uq
    unique nulls not distinct (
      policy_coverage_id,
      rule_code,
      benefit_code,
      subject_type,
      subject_reference_id,
      field_path
    )
);

comment on table public.claim_benefit_limit_results is
  'Benefit limit validation outcomes for one claim policy coverage evaluation.';

create table public.claim_exclusion_results (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  policy_coverage_id uuid not null,

  rule_code text not null,
  rule_version text not null,
  rule_definition_hash text,

  exclusion_code text not null,
  exclusion_category text not null,
  exclusion_text_snapshot text not null,

  subject_type text not null default 'claim',
  subject_reference_id uuid,
  field_path text,

  result_status text not null,
  severity text not null,
  blocking_action text not null default 'none',

  reason_code text,
  reason_text text,

  source_reference text,
  source_version text,

  result_data jsonb not null default '{}'::jsonb,

  evaluated_at timestamptz not null default now(),
  evaluation_source text not null default 'system_rule',
  evaluated_by uuid,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_exclusion_results_rule_code_format_chk
    check (
      rule_code = lower(btrim(rule_code))
      and rule_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_exclusion_results_rule_version_not_blank_chk
    check (btrim(rule_version) <> ''),

  constraint claim_exclusion_results_rule_hash_not_blank_chk
    check (rule_definition_hash is null or btrim(rule_definition_hash) <> ''),

  constraint claim_exclusion_results_exclusion_code_not_blank_chk
    check (btrim(exclusion_code) <> ''),

  constraint claim_exclusion_results_category_chk
    check (
      exclusion_category in (
        'diagnosis',
        'procedure',
        'treatment',
        'provider',
        'pre_existing_condition',
        'policy',
        'administrative',
        'experimental',
        'cosmetic',
        'other'
      )
    ),

  constraint claim_exclusion_results_text_not_blank_chk
    check (btrim(exclusion_text_snapshot) <> ''),

  constraint claim_exclusion_results_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'diagnosis',
        'procedure',
        'document',
        'other'
      )
    ),

  constraint claim_exclusion_results_subject_reference_chk
    check (
      (subject_type = 'claim' and subject_reference_id is null)
      or
      (subject_type <> 'claim' and subject_reference_id is not null)
    ),

  constraint claim_exclusion_results_field_path_not_blank_chk
    check (field_path is null or btrim(field_path) <> ''),

  constraint claim_exclusion_results_status_chk
    check (
      result_status in (
        'not_excluded',
        'potential_exclusion',
        'excluded',
        'not_applicable',
        'needs_review'
      )
    ),

  constraint claim_exclusion_results_severity_chk
    check (severity in ('info', 'low', 'medium', 'high', 'critical')),

  constraint claim_exclusion_results_action_chk
    check (
      blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_exclusion_results_excluded_action_chk
    check (
      result_status <> 'excluded'
      or blocking_action in ('block_submission', 'block_decision')
    ),

  constraint claim_exclusion_results_potential_action_chk
    check (
      result_status <> 'potential_exclusion'
      or blocking_action in ('needs_review', 'block_decision')
    ),

  constraint claim_exclusion_results_reason_code_not_blank_chk
    check (reason_code is null or btrim(reason_code) <> ''),

  constraint claim_exclusion_results_reason_text_not_blank_chk
    check (reason_text is null or btrim(reason_text) <> ''),

  constraint claim_exclusion_results_negative_reason_required_chk
    check (
      result_status not in ('excluded', 'potential_exclusion', 'needs_review')
      or reason_text is not null
    ),

  constraint claim_exclusion_results_source_reference_not_blank_chk
    check (source_reference is null or btrim(source_reference) <> ''),

  constraint claim_exclusion_results_source_version_not_blank_chk
    check (source_version is null or btrim(source_version) <> ''),

  constraint claim_exclusion_results_result_data_object_chk
    check (jsonb_typeof(result_data) = 'object'),

  constraint claim_exclusion_results_evaluation_source_chk
    check (
      evaluation_source in (
        'system_rule',
        'human_review',
        'external_payer',
        'import'
      )
    ),

  constraint claim_exclusion_results_human_evaluator_chk
    check (evaluation_source <> 'human_review' or evaluated_by is not null),

  constraint claim_exclusion_results_evaluated_not_before_created_chk
    check (evaluated_at >= created_at),

  constraint claim_exclusion_results_coverage_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      policy_coverage_id
    )
    references public.claim_policy_coverages(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_exclusion_results_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_exclusion_results_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_exclusion_results_rule_subject_uq
    unique nulls not distinct (
      policy_coverage_id,
      rule_code,
      exclusion_code,
      subject_type,
      subject_reference_id,
      field_path
    )
);

comment on table public.claim_exclusion_results is
  'Policy exclusion outcomes for one claim policy coverage evaluation.';

create table public.claim_waiting_period_results (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  policy_coverage_id uuid not null,

  rule_code text not null,
  rule_version text not null,
  rule_definition_hash text,

  waiting_period_code text not null,
  waiting_period_type text not null,

  effective_date date not null,
  service_date date not null,

  required_days integer not null,
  elapsed_days integer not null,
  remaining_days integer not null,

  subject_type text not null default 'claim',
  subject_reference_id uuid,
  field_path text,

  result_status text not null,
  blocking_action text not null default 'none',

  reason_code text,
  reason_text text,

  result_data jsonb not null default '{}'::jsonb,

  evaluated_at timestamptz not null default now(),
  evaluation_source text not null default 'system_rule',
  evaluated_by uuid,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_waiting_period_results_rule_code_format_chk
    check (
      rule_code = lower(btrim(rule_code))
      and rule_code ~ '^[a-z][a-z0-9_]{2,127}$'
    ),

  constraint claim_waiting_period_results_rule_version_not_blank_chk
    check (btrim(rule_version) <> ''),

  constraint claim_waiting_period_results_rule_hash_not_blank_chk
    check (rule_definition_hash is null or btrim(rule_definition_hash) <> ''),

  constraint claim_waiting_period_results_code_not_blank_chk
    check (btrim(waiting_period_code) <> ''),

  constraint claim_waiting_period_results_type_chk
    check (
      waiting_period_type in (
        'general',
        'specific_condition',
        'maternity',
        'pre_existing_condition',
        'procedure',
        'benefit',
        'other'
      )
    ),

  constraint claim_waiting_period_results_dates_chk
    check (service_date >= effective_date),

  constraint claim_waiting_period_results_days_chk
    check (
      required_days >= 0
      and elapsed_days >= 0
      and remaining_days >= 0
    ),

  constraint claim_waiting_period_results_subject_type_chk
    check (
      subject_type in (
        'claim',
        'claim_item',
        'diagnosis',
        'procedure',
        'benefit',
        'other'
      )
    ),

  constraint claim_waiting_period_results_subject_reference_chk
    check (
      (subject_type = 'claim' and subject_reference_id is null)
      or
      (subject_type <> 'claim' and subject_reference_id is not null)
    ),

  constraint claim_waiting_period_results_field_path_not_blank_chk
    check (field_path is null or btrim(field_path) <> ''),

  constraint claim_waiting_period_results_status_chk
    check (
      result_status in (
        'satisfied',
        'not_satisfied',
        'not_applicable',
        'needs_review',
        'unknown'
      )
    ),

  constraint claim_waiting_period_results_action_chk
    check (
      blocking_action in (
        'none',
        'informational',
        'needs_review',
        'block_submission',
        'block_decision'
      )
    ),

  constraint claim_waiting_period_results_satisfied_chk
    check (
      result_status <> 'satisfied'
      or remaining_days = 0
    ),

  constraint claim_waiting_period_results_not_satisfied_chk
    check (
      result_status <> 'not_satisfied'
      or (
        remaining_days > 0
        and blocking_action in (
          'needs_review',
          'block_submission',
          'block_decision'
        )
      )
    ),

  constraint claim_waiting_period_results_reason_code_not_blank_chk
    check (reason_code is null or btrim(reason_code) <> ''),

  constraint claim_waiting_period_results_reason_text_not_blank_chk
    check (reason_text is null or btrim(reason_text) <> ''),

  constraint claim_waiting_period_results_negative_reason_required_chk
    check (
      result_status not in ('not_satisfied', 'needs_review')
      or reason_text is not null
    ),

  constraint claim_waiting_period_results_result_data_object_chk
    check (jsonb_typeof(result_data) = 'object'),

  constraint claim_waiting_period_results_evaluation_source_chk
    check (
      evaluation_source in (
        'system_rule',
        'human_review',
        'external_payer',
        'import'
      )
    ),

  constraint claim_waiting_period_results_human_evaluator_chk
    check (evaluation_source <> 'human_review' or evaluated_by is not null),

  constraint claim_waiting_period_results_evaluated_not_before_created_chk
    check (evaluated_at >= created_at),

  constraint claim_waiting_period_results_coverage_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      policy_coverage_id
    )
    references public.claim_policy_coverages(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_waiting_period_results_evaluated_by_fk
    foreign key (evaluated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_waiting_period_results_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_waiting_period_results_rule_subject_uq
    unique nulls not distinct (
      policy_coverage_id,
      rule_code,
      waiting_period_code,
      subject_type,
      subject_reference_id,
      field_path
    )
);

comment on table public.claim_waiting_period_results is
  'Waiting-period outcomes for one claim policy coverage evaluation.';
