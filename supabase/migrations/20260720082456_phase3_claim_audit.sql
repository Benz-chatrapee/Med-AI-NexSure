-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Audit
-- Migration: 20260720082456_phase3_claim_audit.sql
-- =============================================================================
--
-- PURPOSE
--   Add append-only, minimum-necessary audit logging for critical Phase 3
--   claim records by reusing the existing public.audit_logs table.
--
-- SECURITY
--   - Audit writes occur through a SECURITY DEFINER trigger function.
--   - Browser-authenticated users cannot insert, update, or delete audit rows.
--   - Audit payloads contain only approved operational fields, not full PHI.
--   - Existing audit SELECT/RLS policies remain owned by Core Foundation.
--
-- NOTE
--   Do not add BEGIN/COMMIT. Supabase migrations are transactional.
-- =============================================================================

create schema if not exists private;

-- =============================================================================
-- 1. PREFLIGHT
-- =============================================================================

do $$
begin
  if to_regclass('public.audit_logs') is null then
    raise exception 'Required table public.audit_logs does not exist';
  end if;

  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'action_type'
  ) then
    raise exception 'public.audit_logs.action_type is required';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'target_table'
  ) then
    raise exception 'public.audit_logs.target_table is required';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'metadata'
  ) then
    raise exception 'public.audit_logs.metadata is required';
  end if;
end;
$$;

-- =============================================================================
-- 2. MINIMUM-NECESSARY AUDIT PROJECTION
-- =============================================================================

create or replace function private.claim_audit_projection(
  p_row jsonb
)
returns jsonb
language sql
immutable
set search_path = private, public, pg_temp
as $$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'status', p_row -> 'status',
      'review_status', p_row -> 'review_status',
      'decision_status', p_row -> 'decision_status',
      'decision_type', p_row -> 'decision_type',
      'payment_status', p_row -> 'payment_status',
      'reconciliation_status', p_row -> 'reconciliation_status',
      'validation_status', p_row -> 'validation_status',
      'result_status', p_row -> 'result_status',
      'coverage_status', p_row -> 'coverage_status',
      'risk_level', p_row -> 'risk_level',
      'severity', p_row -> 'severity',
      'blocking_action', p_row -> 'blocking_action',
      'assigned_to', p_row -> 'assigned_to',
      'assigned_reviewer_id', p_row -> 'assigned_reviewer_id',
      'reviewer_id', p_row -> 'reviewer_id',
      'verified_by', p_row -> 'verified_by',
      'evaluated_by', p_row -> 'evaluated_by',
      'decision_by', p_row -> 'decision_by',
      'requested_amount', p_row -> 'requested_amount',
      'approved_amount', p_row -> 'approved_amount',
      'paid_amount', p_row -> 'paid_amount',
      'payment_amount', p_row -> 'payment_amount',
      'allocated_amount', p_row -> 'allocated_amount',
      'reconciled_amount', p_row -> 'reconciled_amount',
      'reason_code', p_row -> 'reason_code',
      'rejection_code', p_row -> 'rejection_code',
      'source', p_row -> 'source',
      'source_type', p_row -> 'source_type',
      'evaluation_source', p_row -> 'evaluation_source',
      'created_at', p_row -> 'created_at',
      'updated_at', p_row -> 'updated_at',
      'submitted_at', p_row -> 'submitted_at',
      'evaluated_at', p_row -> 'evaluated_at',
      'reviewed_at', p_row -> 'reviewed_at',
      'decided_at', p_row -> 'decided_at',
      'paid_at', p_row -> 'paid_at',
      'reconciled_at', p_row -> 'reconciled_at'
    )
  );
$$;

create or replace function private.claim_audit_changed_fields(
  p_old jsonb,
  p_new jsonb
)
returns text[]
language sql
immutable
set search_path = private, public, pg_temp
as $$
  select coalesce(
    array_agg(k order by k),
    array[]::text[]
  )
  from (
    select key as k
    from jsonb_object_keys(
      coalesce(p_old, '{}'::jsonb) || coalesce(p_new, '{}'::jsonb)
    ) as keys(key)
    where coalesce(p_old -> key, 'null'::jsonb)
      is distinct from coalesce(p_new -> key, 'null'::jsonb)
  ) changed;
$$;

-- =============================================================================
-- 3. CLAIM EVENT CLASSIFICATION AND SAFE TEXT
-- =============================================================================

create or replace function private.claim_audit_safe_reason(
  p_reason text
)
returns text
language sql
immutable
set search_path = private, public, pg_temp
as $$
  select case
    when p_reason is null then null
    else left(
      regexp_replace(
        btrim(p_reason),
        '[[:cntrl:]]+',
        ' ',
        'g'
      ),
      500
    )
  end;
$$;

create or replace function private.classify_claim_audit_event(
  p_table_name text,
  p_operation text,
  p_old jsonb,
  p_new jsonb,
  p_default_prefix text
)
returns text
language plpgsql
immutable
set search_path = private, public, pg_temp
as $$
declare
  v_old_status text := p_old ->> 'status';
  v_new_status text := p_new ->> 'status';
  v_old_review_status text := p_old ->> 'review_status';
  v_new_review_status text := p_new ->> 'review_status';
  v_new_decision text := coalesce(
    p_new ->> 'decision_type',
    p_new ->> 'decision_status'
  );
  v_old_verification text := coalesce(
    p_old ->> 'verification_status',
    p_old ->> 'result_status'
  );
  v_new_verification text := coalesce(
    p_new ->> 'verification_status',
    p_new ->> 'result_status'
  );
begin
  if p_table_name = 'claims' then
    if p_operation = 'INSERT' then
      return 'claim.created';
    end if;

    if p_operation = 'DELETE' then
      return 'claim.hard_deleted';
    end if;

    if (p_old ->> 'deleted_at') is null
       and (p_new ->> 'deleted_at') is not null then
      return 'claim.soft_deleted';
    end if;

    if v_old_status is distinct from v_new_status then
      return case v_new_status
        when 'submitted' then 'claim.submitted'
        when 'cancelled' then 'claim.cancelled'
        when 'reopened' then 'claim.reopened'
        else 'claim.status_changed'
      end;
    end if;

    return 'claim.updated';
  end if;

  if p_table_name = 'claim_reviews' then
    if p_operation = 'INSERT' then
      return 'claim.review_started';
    end if;

    if v_old_review_status is distinct from v_new_review_status then
      return case v_new_review_status
        when 'completed' then 'claim.review_completed'
        when 'waiting_information' then 'claim.information_requested'
        else 'claim.review_updated'
      end;
    end if;

    return 'claim.review_updated';
  end if;

  if p_table_name = 'claim_decisions' and p_operation = 'INSERT' then
    return case v_new_decision
      when 'approved' then 'claim.approved'
      when 'partially_approved' then 'claim.partially_approved'
      when 'rejected' then 'claim.rejected'
      when 'overridden' then 'claim.decision_overridden'
      else 'claim.decision_created'
    end;
  end if;

  if p_table_name = 'claim_decision_adjustments' then
    return 'claim.decision_overridden';
  end if;

  if p_table_name in ('claim_documents', 'claim_evidence_results') then
    if p_operation = 'INSERT' then
      return 'claim.evidence_uploaded';
    end if;

    if (p_old ->> 'deleted_at') is null
       and (p_new ->> 'deleted_at') is not null then
      return 'claim.evidence_soft_deleted';
    end if;

    if v_old_verification is distinct from v_new_verification then
      return case v_new_verification
        when 'verified' then 'claim.evidence_verified'
        when 'rejected' then 'claim.evidence_rejected'
        else 'claim.evidence_updated'
      end;
    end if;

    return 'claim.evidence_updated';
  end if;

  if p_table_name = 'claim_policy_coverages' then
    if p_operation = 'INSERT' then
      return 'claim.coverage_validated';
    end if;

    if (p_old ->> 'evaluation_source') is distinct from
       (p_new ->> 'evaluation_source')
       and (p_new ->> 'evaluation_source') = 'human_review' then
      return 'claim.coverage_overridden';
    end if;

    return 'claim.coverage_validated';
  end if;

  if p_table_name = 'claim_ai_assessments' then
    return 'claim.fraud_analysis_created';
  end if;

  if p_table_name = 'claim_ai_review_outcomes' then
    if (p_new ->> 'override_reason') is not null then
      return 'claim.fraud_overridden';
    end if;

    return 'claim.fraud_reviewed';
  end if;

  if p_table_name in (
    'claim_benefit_limit_results',
    'claim_exclusion_results',
    'claim_waiting_period_results',
    'claim_validation_results'
  ) then
    return case
      when p_operation = 'INSERT'
        then 'claim.cost_validation_created'
      when (p_new ->> 'override_reason') is not null
        then 'claim.cost_overridden'
      else 'claim.cost_reviewed'
    end;
  end if;

  if p_table_name = 'claim_payments' then
    return 'claim.payment_recorded';
  end if;

  if p_table_name = 'claim_payment_allocations' then
    return 'claim.payment_allocated';
  end if;

  if p_table_name = 'claim_payment_reconciliations' then
    return 'claim.payment_reconciled';
  end if;

  return p_default_prefix || case p_operation
    when 'INSERT' then '.created'
    when 'UPDATE' then '.updated'
    when 'DELETE' then '.deleted'
    else '.changed'
  end;
end;
$$;

-- =============================================================================
-- 4. GENERIC CLAIM AUDIT TRIGGER
-- =============================================================================

create or replace function private.write_claim_audit()
returns trigger
language plpgsql
security definer
set search_path = private, public, auth, pg_temp
as $$
declare
  v_old_row jsonb;
  v_new_row jsonb;
  v_source_row jsonb;

  v_organization_id uuid;
  v_clinic_id uuid;
  v_claim_id uuid;
  v_patient_id uuid;
  v_visit_id uuid;
  v_target_record_id uuid;
  v_actor_profile_id uuid;

  v_action_prefix text;
  v_action_type text;
  v_reason text;
  v_metadata jsonb;
  v_old_projection jsonb;
  v_new_projection jsonb;
  v_changed_fields text[];
begin
  if tg_table_schema <> 'public' then
    raise exception 'Claim audit trigger is restricted to public schema tables';
  end if;

  if tg_table_name = 'audit_logs' then
    raise exception 'Claim audit trigger cannot be attached to public.audit_logs';
  end if;

  if tg_op = 'INSERT' then
    v_old_row := null;
    v_new_row := to_jsonb(new);
    v_source_row := v_new_row;
  elsif tg_op = 'UPDATE' then
    v_old_row := to_jsonb(old);
    v_new_row := to_jsonb(new);
    v_source_row := v_new_row;
  elsif tg_op = 'DELETE' then
    v_old_row := to_jsonb(old);
    v_new_row := null;
    v_source_row := v_old_row;
  else
    raise exception 'Unsupported trigger operation: %', tg_op;
  end if;

  v_organization_id :=
    nullif(v_source_row ->> 'organization_id', '')::uuid;

  v_clinic_id :=
    nullif(v_source_row ->> 'clinic_id', '')::uuid;

  v_claim_id :=
    case
      when tg_table_name = 'claims'
        then nullif(v_source_row ->> 'id', '')::uuid
      else nullif(v_source_row ->> 'claim_id', '')::uuid
    end;

  v_patient_id :=
    nullif(v_source_row ->> 'patient_id', '')::uuid;

  v_visit_id :=
    nullif(v_source_row ->> 'visit_id', '')::uuid;

  v_target_record_id :=
    nullif(v_source_row ->> 'id', '')::uuid;

  if v_organization_id is null then
    raise exception
      'Audit source %.% does not expose organization_id',
      tg_table_schema,
      tg_table_name;
  end if;

  if v_claim_id is null and tg_table_name <> 'claims' then
    raise exception
      'Audit source %.% does not expose claim_id',
      tg_table_schema,
      tg_table_name;
  end if;

  v_actor_profile_id := auth.uid();

  v_action_prefix := coalesce(
    nullif(tg_argv[0], ''),
    regexp_replace(tg_table_name, '^claim_', 'claim.')
  );

  v_action_type := private.classify_claim_audit_event(
    tg_table_name,
    tg_op,
    coalesce(v_old_row, '{}'::jsonb),
    coalesce(v_new_row, '{}'::jsonb),
    v_action_prefix
  );

  v_old_projection := private.claim_audit_projection(v_old_row);
  v_new_projection := private.claim_audit_projection(v_new_row);

  if tg_op = 'UPDATE'
     and v_old_projection is not distinct from v_new_projection then
    return new;
  end if;

  v_changed_fields :=
    private.claim_audit_changed_fields(
      v_old_projection,
      v_new_projection
    );

  v_reason := private.claim_audit_safe_reason(
    coalesce(
      v_source_row ->> 'reason',
      v_source_row ->> 'reason_text',
      v_source_row ->> 'review_reason',
      v_source_row ->> 'decision_reason',
      v_source_row ->> 'override_reason',
      v_source_row ->> 'reconciliation_note'
    )
  );

  v_metadata := jsonb_strip_nulls(
    jsonb_build_object(
      'schema_name', tg_table_schema,
      'table_name', tg_table_name,
      'operation', tg_op,
      'trigger_name', tg_name,
      'claim_id', v_claim_id,
      'patient_id', v_patient_id,
      'visit_id', v_visit_id,
      'record_version',
        coalesce(
          v_source_row -> 'version_number',
          v_source_row -> 'evaluation_number',
          v_source_row -> 'review_number'
        ),
      'decision_support_only',
        case
          when tg_table_name like 'claim_ai_%' then true
          else null
        end,
      'request_jwt_role',
        nullif(current_setting('request.jwt.claim.role', true), ''),
      'actor_type',
        case
          when auth.uid() is not null then 'human'
          when tg_table_name like 'claim_ai_%' then 'ai'
          else 'system'
        end,
      'auth_user_id',
        auth.uid(),
      'source',
        case
          when tg_table_name like 'claim_ai_%' then 'ai_analysis'
          when tg_table_name like 'claim_payment_%' then 'payment_workflow'
          when tg_table_name like 'claim_validation_%' then 'validation_process'
          else 'claim_workflow'
        end
    )
  );

  insert into public.audit_logs (
    organization_id,
    clinic_id,
    actor_user_id,
    actor_role,
    action_type,
    target_table,
    target_record_id,
    old_value,
    new_value,
    changed_fields,
    reason,
    request_id,
    correlation_id,
    occurred_at,
    metadata
  )
  values (
    v_organization_id,
    v_clinic_id,
    v_actor_profile_id,
    nullif(current_setting('request.jwt.claim.role', true), ''),
    v_action_type,
    tg_table_name,
    v_target_record_id,
    v_old_projection,
    v_new_projection,
    v_changed_fields,
    v_reason,
    public.safe_uuid(
      nullif(current_setting('request.headers', true), '')::jsonb
        ->> 'x-request-id'
    ),
    coalesce(
      nullif(v_source_row ->> 'correlation_id', '')::uuid,
      gen_random_uuid()
    ),
    now(),
    v_metadata
  );

  return coalesce(new, old);
end;
$$;

revoke all on function private.claim_audit_projection(jsonb)
  from public, anon, authenticated;
revoke all on function private.claim_audit_safe_reason(text)
  from public, anon, authenticated;
revoke all on function private.classify_claim_audit_event(text, text, jsonb, jsonb, text)
  from public, anon, authenticated;
revoke all on function private.claim_audit_changed_fields(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function private.write_claim_audit()
  from public, anon, authenticated;

grant execute on function private.claim_audit_projection(jsonb)
  to service_role;
grant execute on function private.claim_audit_safe_reason(text)
  to service_role;
grant execute on function private.classify_claim_audit_event(text, text, jsonb, jsonb, text)
  to service_role;
grant execute on function private.claim_audit_changed_fields(jsonb, jsonb)
  to service_role;
grant execute on function private.write_claim_audit()
  to service_role;

-- =============================================================================
-- 5. INSTALL TRIGGERS ON EXISTING PHASE 3 CLAIM TABLES
-- =============================================================================

do $$
declare
  v_record record;
begin
  for v_record in
    select *
    from (
      values
        ('claims', 'claim'),
        ('claim_assignments', 'claim.assignment'),
        ('claim_reviews', 'claim.review'),
        ('claim_review_findings', 'claim.review_finding'),
        ('claim_decisions', 'claim.decision'),
        ('claim_decision_adjustments', 'claim.decision_adjustment'),
        ('claim_documents', 'claim.evidence'),
        ('claim_evidence_results', 'claim.evidence_result'),
        ('claim_policy_coverages', 'claim.policy_coverage'),
        ('claim_benefit_limit_results', 'claim.benefit_limit'),
        ('claim_exclusion_results', 'claim.exclusion'),
        ('claim_waiting_period_results', 'claim.waiting_period'),
        ('claim_validation_runs', 'claim.validation_run'),
        ('claim_validation_results', 'claim.validation_result'),
        ('claim_ai_assessments', 'claim.ai_assessment'),
        ('claim_ai_risk_signals', 'claim.ai_risk_signal'),
        ('claim_ai_explanations', 'claim.ai_explanation'),
        ('claim_ai_review_outcomes', 'claim.ai_review'),
        ('claim_payments', 'claim.payment'),
        ('claim_payment_allocations', 'claim.payment_allocation'),
        ('claim_payment_reconciliations', 'claim.payment_reconciliation'),
        ('claim_submissions', 'claim.submission')
    ) as tables(table_name, action_prefix)
  loop
    if to_regclass(format('public.%I', v_record.table_name)) is null then
      continue;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_record.table_name
        and column_name = 'id'
    ) then
      raise exception
        'Audit target public.% must expose id',
        v_record.table_name;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_record.table_name
        and column_name = 'organization_id'
    ) then
      raise exception
        'Audit target public.% must expose organization_id',
        v_record.table_name;
    end if;

    if v_record.table_name <> 'claims'
       and not exists (
         select 1
         from information_schema.columns
         where table_schema = 'public'
           and table_name = v_record.table_name
           and column_name = 'claim_id'
       ) then
      raise exception
        'Audit target public.% must expose claim_id',
        v_record.table_name;
    end if;

    execute format(
      'drop trigger if exists %I on public.%I',
      'trg_' || v_record.table_name || '_aiud_write_claim_audit',
      v_record.table_name
    );

    execute format(
      'create trigger %I
       after insert or update or delete
       on public.%I
       for each row
       execute function private.write_claim_audit(%L)',
      'trg_' || v_record.table_name || '_aiud_write_claim_audit',
      v_record.table_name,
      v_record.action_prefix
    );
  end loop;
end;
$$;

-- =============================================================================
-- 6. APPEND-ONLY AUDIT BOUNDARY
-- =============================================================================

revoke insert, update, delete
on table public.audit_logs
from anon, authenticated;

create index if not exists audit_logs_claim_timeline_idx
  on public.audit_logs (
    organization_id,
    target_table,
    target_record_id,
    occurred_at desc
  )
  where target_table like 'claim%';

create index if not exists audit_logs_claim_action_idx
  on public.audit_logs (
    action_type,
    occurred_at desc
  )
  where target_table like 'claim%';

create index if not exists audit_logs_claim_correlation_idx
  on public.audit_logs (correlation_id)
  where target_table like 'claim%'
    and correlation_id is not null;

comment on function private.write_claim_audit() is
  'Writes minimum-necessary append-only Phase 3 claim audit events into public.audit_logs.';

comment on function private.claim_audit_projection(jsonb) is
  'Projects approved operational claim fields and intentionally excludes full clinical, document, payer payload, and AI explanation content.';

comment on function private.classify_claim_audit_event(text, text, jsonb, jsonb, text) is
  'Classifies Phase 3 claim audit events from approved status and workflow fields.';

comment on function private.claim_audit_safe_reason(text) is
  'Normalizes control characters and limits audit reasons to 500 characters.';
