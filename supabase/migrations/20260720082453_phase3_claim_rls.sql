-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Row Level Security
-- Migration: 20260720082453_phase3_claim_rls.sql
-- =============================================================================
--
-- PURPOSE
--   Enforce multi-tenant organization isolation, clinic-level authorization,
--   permission-based access, reviewer assignment scope, separation of duties,
--   Human-in-the-Loop decision control, and server-only financial mutations.
--
-- REQUIRED BEFORE THIS MIGRATION
--   - Phase 3 claim tables
--   - Phase 3 claim permissions
--   - public.has_permission(...)
--
-- SECURITY PRINCIPLES
--   - Deny by default.
--   - No anonymous claim access.
--   - Every claim record is scoped by organization_id and clinic_id.
--   - Core Foundation public.has_permission(...) remains the source of truth
--     for active profile, membership, role assignment, and permission checks.
--   - Child-table access derives from the parent claim.
--   - Standard reviewers without claim.assign see assigned claims only.
--   - AI output is read/review support only; AI cannot finalize decisions.
--   - Decision and payment writes are performed through trusted server RPCs.
--   - Physical DELETE is not granted to authenticated users.
--
-- NOTE
--   Do not add BEGIN/COMMIT. Supabase migrations are transactional.
-- =============================================================================

create schema if not exists private;

-- =============================================================================
-- 1. VALIDATE CORE AUTHORIZATION DEPENDENCIES
-- =============================================================================

do $$
begin
  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception
      'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;

  if to_regprocedure('public.is_organization_member(uuid)') is null then
    raise exception
      'Required helper public.is_organization_member(uuid) does not exist';
  end if;

  if to_regprocedure('public.has_clinic_access(uuid,uuid)') is null then
    raise exception
      'Required helper public.has_clinic_access(uuid,uuid) does not exist';
  end if;

  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_reviews') is null then
    raise exception 'Required table public.claim_reviews does not exist';
  end if;
end;
$$;

-- =============================================================================
-- 2. CLAIM AUTHORIZATION HELPERS
-- =============================================================================

create or replace function private.claim_has_permission(
  p_permission_key text,
  p_organization_id uuid,
  p_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and p_permission_key is not null
    and p_organization_id is not null
    and p_clinic_id is not null
    and coalesce(
      public.is_organization_member(p_organization_id),
      false
    )
    and coalesce(
      public.has_clinic_access(
        p_organization_id,
        p_clinic_id
      ),
      false
    )
    and coalesce(
      public.has_permission(
        p_permission_key,
        p_organization_id,
        p_clinic_id
      ),
      false
    );
$$;

create or replace function private.claim_is_assignee(
  p_claim_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and p_claim_id is not null
    and exists (
      select 1
      from public.claim_reviews cr
      where cr.claim_id = p_claim_id
        and cr.assigned_to = auth.uid()
        and cr.review_status in (
          'assigned',
          'in_review',
          'waiting_information'
        )
    );
$$;

create or replace function private.claim_exists_in_scope(
  p_claim_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_include_deleted boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.claims c
    where c.id = p_claim_id
      and c.organization_id = p_organization_id
      and c.clinic_id = p_clinic_id
      and (
        p_include_deleted
        or c.deleted_at is null
      )
  );
$$;

create or replace function private.claim_can_read(
  p_claim_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_permission_key text default 'claim.read',
  p_include_deleted boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select
    private.claim_exists_in_scope(
      p_claim_id,
      p_organization_id,
      p_clinic_id,
      p_include_deleted
    )
    and private.claim_has_permission(
      p_permission_key,
      p_organization_id,
      p_clinic_id
    )
    and (
      -- Managers and administrators with assignment authority have queue scope.
      private.claim_has_permission(
        'claim.assign',
        p_organization_id,
        p_clinic_id
      )
      -- Users who are not claim reviewers retain their permission-defined scope.
      or not private.claim_has_permission(
        'claim.review',
        p_organization_id,
        p_clinic_id
      )
      -- Standard reviewers are restricted to assigned claims.
      or private.claim_is_assignee(p_claim_id)
    );
$$;

create or replace function private.claim_can_mutate(
  p_claim_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select
    private.claim_exists_in_scope(
      p_claim_id,
      p_organization_id,
      p_clinic_id,
      false
    )
    and private.claim_has_permission(
      p_permission_key,
      p_organization_id,
      p_clinic_id
    )
    and (
      private.claim_has_permission(
        'claim.assign',
        p_organization_id,
        p_clinic_id
      )
      or not private.claim_has_permission(
        'claim.review',
        p_organization_id,
        p_clinic_id
      )
      or private.claim_is_assignee(p_claim_id)
    );
$$;

revoke all on function private.claim_has_permission(text, uuid, uuid)
  from public, anon;
revoke all on function private.claim_is_assignee(uuid)
  from public, anon;
revoke all on function private.claim_exists_in_scope(uuid, uuid, uuid, boolean)
  from public, anon;
revoke all on function private.claim_can_read(uuid, uuid, uuid, text, boolean)
  from public, anon;
revoke all on function private.claim_can_mutate(uuid, uuid, uuid, text)
  from public, anon;

grant execute on function private.claim_has_permission(text, uuid, uuid)
  to authenticated, service_role;
grant execute on function private.claim_is_assignee(uuid)
  to authenticated, service_role;
grant execute on function private.claim_exists_in_scope(uuid, uuid, uuid, boolean)
  to authenticated, service_role;
grant execute on function private.claim_can_read(uuid, uuid, uuid, text, boolean)
  to authenticated, service_role;
grant execute on function private.claim_can_mutate(uuid, uuid, uuid, text)
  to authenticated, service_role;

-- =============================================================================
-- 3. POLICY CONFLICT PREFLIGHT
-- =============================================================================
--
-- Abort when an existing authenticated policy on a Phase 3 claim table contains
-- an unconditional USING/WITH CHECK expression. A stricter new permissive policy
-- would otherwise be combined with the old policy by OR and would not close the
-- access path.
-- =============================================================================

do $$
declare
  v_conflicts text;
begin
  select string_agg(
    format('%I.%I:%I', schemaname, tablename, policyname),
    ', '
    order by tablename, policyname
  )
  into v_conflicts
  from pg_policies
  where schemaname = 'public'
    and tablename like 'claim%'
    and (
      coalesce(qual, '') ~* '^\s*(true|\(true\))\s*$'
      or coalesce(with_check, '') ~* '^\s*(true|\(true\))\s*$'
    )
    and (
      roles is null
      or roles && array['public', 'authenticated']::name[]
    );

  if v_conflicts is not null then
    raise exception
      'Unsafe existing permissive claim policies must be reviewed before Phase 3 RLS: %',
      v_conflicts;
  end if;
end;
$$;

-- =============================================================================
-- 4. ENABLE RLS ON EXISTING PHASE 3 TABLES
-- =============================================================================

do $$
declare
  v_table text;
  v_tables text[] := array[
    'claims',
    'claim_status_history',
    'claim_parties',
    'claim_items',
    'claim_diagnoses',
    'claim_procedures',
    'claim_documents',
    'claim_evidence_requirements',
    'claim_evidence_results',
    'claim_validation_runs',
    'claim_validation_results',
    'claim_policy_coverages',
    'claim_benefit_limit_results',
    'claim_exclusion_results',
    'claim_waiting_period_results',
    'claim_ai_assessments',
    'claim_ai_risk_signals',
    'claim_ai_explanations',
    'claim_ai_review_outcomes',
    'claim_reviews',
    'claim_review_findings',
    'claim_decisions',
    'claim_decision_adjustments',
    'claim_payments',
    'claim_payment_allocations',
    'claim_payment_reconciliations',
    'claim_submissions'
  ];
begin
  foreach v_table in array v_tables
  loop
    if to_regclass(format('public.%I', v_table)) is not null then
      execute format(
        'alter table public.%I enable row level security',
        v_table
      );
      -- FORCE RLS is intentionally not enabled here. Existing trusted
      -- SECURITY DEFINER workflow functions must continue to operate through
      -- their explicit authorization checks without recursive policy execution.
      execute format(
        'revoke all on table public.%I from anon',
        v_table
      );
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 5. CORE CLAIM POLICIES
-- =============================================================================

drop policy if exists claims_select_authorized on public.claims;
drop policy if exists claims_insert_authorized on public.claims;
drop policy if exists claims_update_authorized on public.claims;
drop policy if exists claims_delete_authorized on public.claims;

create policy claims_select_authorized
on public.claims
for select
to authenticated
using (
  private.claim_can_read(
    id,
    organization_id,
    clinic_id,
    case
      when deleted_at is null then 'claim.read'
      else 'claim.audit.read'
    end,
    deleted_at is not null
  )
);

create policy claims_insert_authorized
on public.claims
for insert
to authenticated
with check (
  private.claim_has_permission(
    'claim.create',
    organization_id,
    clinic_id
  )
  and created_by = auth.uid()
  and updated_by = auth.uid()
  and deleted_at is null
  and deleted_by is null
  and status in (
    'draft',
    'collecting_evidence'
  )
  and exists (
    select 1
    from public.patients p
    where p.id = patient_id
      and p.organization_id = organization_id
  )
  and (
    visit_id is null
    or exists (
      select 1
      from public.visits v
      where v.id = visit_id
        and v.organization_id = organization_id
        and v.clinic_id = clinic_id
        and v.patient_id = patient_id
    )
  )
);

create policy claims_update_authorized
on public.claims
for update
to authenticated
using (
  deleted_at is null
  and status in (
    'draft',
    'collecting_evidence',
    'validation_failed',
    'needs_information'
  )
  and private.claim_can_mutate(
    id,
    organization_id,
    clinic_id,
    'claim.update'
  )
)
with check (
  deleted_at is null
  and deleted_by is null
  and status in (
    'draft',
    'collecting_evidence',
    'validation_failed',
    'needs_information'
  )
  and private.claim_has_permission(
    'claim.update',
    organization_id,
    clinic_id
  )
  and updated_by = auth.uid()
);

revoke all on table public.claims from authenticated;
grant select, insert, update on table public.claims to authenticated;

comment on policy claims_select_authorized on public.claims is
  'Tenant/clinic permission scope with assigned-only restriction for standard claim reviewers.';
comment on policy claims_insert_authorized on public.claims is
  'Allows authorized draft claim creation only; creator and updater must be auth.uid().';
comment on policy claims_update_authorized on public.claims is
  'Allows direct edits only in mutable pre-submission states. Workflow status transitions use trusted RPC functions.';

-- =============================================================================
-- 6. GENERIC CHILD-TABLE POLICY INSTALLER
-- =============================================================================
--
-- Each listed child table must expose organization_id, clinic_id, and claim_id.
-- Missing tables are skipped so this migration remains compatible with the
-- repository's actual Phase 3 table set.
-- =============================================================================

do $$
declare
  v_record record;
begin
  for v_record in
    select *
    from (
      values
        -- table_name, read_permission, insert_permission, update_permission
        ('claim_parties', 'claim.read', 'claim.update', 'claim.update'),
        ('claim_items', 'claim.read', 'claim.update', 'claim.update'),
        ('claim_diagnoses', 'claim.medical_coding.read', 'claim.medical_coding.update', 'claim.medical_coding.update'),
        ('claim_procedures', 'claim.medical_coding.read', 'claim.medical_coding.update', 'claim.medical_coding.update'),

        ('claim_documents', 'claim.evidence.read', 'claim.evidence.upload', 'claim.evidence.upload'),
        ('claim_evidence_requirements', 'claim.evidence.read', null, null),
        ('claim_evidence_results', 'claim.evidence.read', 'claim.evidence.verify', 'claim.evidence.verify'),

        ('claim_validation_runs', 'claim.review', null, null),
        ('claim_validation_results', 'claim.review', null, null),

        ('claim_policy_coverages', 'claim.cost.read', null, null),
        ('claim_benefit_limit_results', 'claim.cost.read', null, null),
        ('claim_exclusion_results', 'claim.cost.read', null, null),
        ('claim_waiting_period_results', 'claim.cost.read', null, null),

        ('claim_ai_assessments', 'claim.fraud.read', null, null),
        ('claim_ai_risk_signals', 'claim.fraud.read', null, null),
        ('claim_ai_explanations', 'claim.fraud.read', null, null),
        ('claim_ai_review_outcomes', 'claim.fraud.read', 'claim.fraud.review', 'claim.fraud.review'),

        ('claim_review_findings', 'claim.review', 'claim.review', 'claim.review'),

        ('claim_decisions', 'claim.read', null, null),
        ('claim_decision_adjustments', 'claim.read', null, null),

        ('claim_payments', 'claim.cost.read', null, null),
        ('claim_payment_allocations', 'claim.cost.read', null, null),
        ('claim_payment_reconciliations', 'claim.cost.read', null, null),

        ('claim_submissions', 'claim.read', 'claim.submit', null)
    ) as t(
      table_name,
      read_permission,
      insert_permission,
      update_permission
    )
  loop
    if to_regclass(format('public.%I', v_record.table_name)) is null then
      continue;
    end if;

    -- Safety check: generic policies require tenant and parent claim columns.
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_record.table_name
        and column_name = 'organization_id'
    )
    or not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_record.table_name
        and column_name = 'clinic_id'
    )
    or not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_record.table_name
        and column_name = 'claim_id'
    ) then
      raise exception
        'Table public.% must contain organization_id, clinic_id, and claim_id for Claim RLS',
        v_record.table_name;
    end if;

    execute format(
      'drop policy if exists %I on public.%I',
      v_record.table_name || '_select_authorized',
      v_record.table_name
    );

    execute format(
      'create policy %I on public.%I
       for select to authenticated
       using (
         private.claim_can_read(
           claim_id,
           organization_id,
           clinic_id,
           %L,
           false
         )
       )',
      v_record.table_name || '_select_authorized',
      v_record.table_name,
      v_record.read_permission
    );

    execute format(
      'revoke all on table public.%I from authenticated',
      v_record.table_name
    );
    execute format(
      'grant select on table public.%I to authenticated',
      v_record.table_name
    );

    if v_record.insert_permission is not null then
      execute format(
        'drop policy if exists %I on public.%I',
        v_record.table_name || '_insert_authorized',
        v_record.table_name
      );

      execute format(
        'create policy %I on public.%I
         for insert to authenticated
         with check (
           private.claim_can_mutate(
             claim_id,
             organization_id,
             clinic_id,
             %L
           )
         )',
        v_record.table_name || '_insert_authorized',
        v_record.table_name,
        v_record.insert_permission
      );

      execute format(
        'grant insert on table public.%I to authenticated',
        v_record.table_name
      );
    end if;

    if v_record.update_permission is not null then
      execute format(
        'drop policy if exists %I on public.%I',
        v_record.table_name || '_update_authorized',
        v_record.table_name
      );

      execute format(
        'create policy %I on public.%I
         for update to authenticated
         using (
           private.claim_can_mutate(
             claim_id,
             organization_id,
             clinic_id,
             %L
           )
         )
         with check (
           private.claim_can_mutate(
             claim_id,
             organization_id,
             clinic_id,
             %L
           )
         )',
        v_record.table_name || '_update_authorized',
        v_record.table_name,
        v_record.update_permission,
        v_record.update_permission
      );

      execute format(
        'grant update on table public.%I to authenticated',
        v_record.table_name
      );
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 7. APPEND-ONLY CLAIM STATUS HISTORY
-- =============================================================================

do $$
begin
  if to_regclass('public.claim_status_history') is not null then
    drop policy if exists claim_status_history_select_authorized
      on public.claim_status_history;

    create policy claim_status_history_select_authorized
    on public.claim_status_history
    for select
    to authenticated
    using (
      private.claim_can_read(
        claim_id,
        organization_id,
        clinic_id,
        'claim.read',
        false
      )
      or private.claim_can_read(
        claim_id,
        organization_id,
        clinic_id,
        'claim.audit.read',
        false
      )
    );

    revoke all on table public.claim_status_history from authenticated;
    grant select on table public.claim_status_history to authenticated;
  end if;
end;
$$;

-- =============================================================================
-- 8. CLAIM REVIEW ASSIGNMENT AND HUMAN REVIEW
-- =============================================================================

drop policy if exists claim_reviews_select_authorized on public.claim_reviews;
drop policy if exists claim_reviews_insert_authorized on public.claim_reviews;
drop policy if exists claim_reviews_update_authorized on public.claim_reviews;
drop policy if exists claim_reviews_delete_authorized on public.claim_reviews;

create policy claim_reviews_select_authorized
on public.claim_reviews
for select
to authenticated
using (
  private.claim_can_read(
    claim_id,
    organization_id,
    clinic_id,
    'claim.review',
    false
  )
);

create policy claim_reviews_insert_authorized
on public.claim_reviews
for insert
to authenticated
with check (
  private.claim_can_mutate(
    claim_id,
    organization_id,
    clinic_id,
    'claim.assign'
  )
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

create policy claim_reviews_update_authorized
on public.claim_reviews
for update
to authenticated
using (
  review_status in (
    'pending',
    'assigned',
    'in_review',
    'waiting_information'
  )
  and private.claim_can_mutate(
    claim_id,
    organization_id,
    clinic_id,
    case
      when assigned_to is distinct from auth.uid()
        then 'claim.assign'
      else 'claim.review'
    end
  )
)
with check (
  review_status in (
    'pending',
    'assigned',
    'in_review',
    'waiting_information'
  )
  and (
    (
      assigned_to = auth.uid()
      and private.claim_has_permission(
        'claim.review',
        organization_id,
        clinic_id
      )
    )
    or private.claim_has_permission(
      'claim.assign',
      organization_id,
      clinic_id
    )
  )
);

revoke all on table public.claim_reviews from authenticated;
grant select, insert, update on table public.claim_reviews to authenticated;

-- =============================================================================
-- 9. DECISION AND PAYMENT SERVER-ONLY WRITE BOUNDARY
-- =============================================================================
--
-- Authenticated users may read records when authorized. They cannot directly
-- insert/update/delete decision or payment rows. Trusted service functions from
-- the Phase 3 functions migration perform these writes and enforce workflow.
-- =============================================================================

do $$
declare
  v_table text;
  v_tables text[] := array[
    'claim_decisions',
    'claim_decision_adjustments',
    'claim_payments',
    'claim_payment_allocations',
    'claim_payment_reconciliations',
    'claim_validation_runs',
    'claim_validation_results',
    'claim_policy_coverages',
    'claim_benefit_limit_results',
    'claim_exclusion_results',
    'claim_waiting_period_results',
    'claim_ai_assessments',
    'claim_ai_risk_signals',
    'claim_ai_explanations'
  ];
begin
  foreach v_table in array v_tables
  loop
    if to_regclass(format('public.%I', v_table)) is not null then
      execute format(
        'revoke insert, update, delete on table public.%I from authenticated',
        v_table
      );
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 10. NO PHYSICAL DELETE FOR APPLICATION USERS
-- =============================================================================

do $$
declare
  v_table text;
  v_tables text[] := array[
    'claims',
    'claim_status_history',
    'claim_parties',
    'claim_items',
    'claim_diagnoses',
    'claim_procedures',
    'claim_documents',
    'claim_evidence_requirements',
    'claim_evidence_results',
    'claim_validation_runs',
    'claim_validation_results',
    'claim_policy_coverages',
    'claim_benefit_limit_results',
    'claim_exclusion_results',
    'claim_waiting_period_results',
    'claim_ai_assessments',
    'claim_ai_risk_signals',
    'claim_ai_explanations',
    'claim_ai_review_outcomes',
    'claim_reviews',
    'claim_review_findings',
    'claim_decisions',
    'claim_decision_adjustments',
    'claim_payments',
    'claim_payment_allocations',
    'claim_payment_reconciliations',
    'claim_submissions'
  ];
begin
  foreach v_table in array v_tables
  loop
    if to_regclass(format('public.%I', v_table)) is not null then
      execute format(
        'revoke delete on table public.%I from authenticated',
        v_table
      );
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 11. SECURITY DOCUMENTATION
-- =============================================================================

comment on function private.claim_has_permission(text, uuid, uuid) is
  'RLS-safe wrapper around Core Foundation permission resolution for organization and clinic scope.';

comment on function private.claim_is_assignee(uuid) is
  'Returns true when auth.uid() is assigned to an active review for the claim.';

comment on function private.claim_can_read(uuid, uuid, uuid, text, boolean) is
  'Combines parent-claim tenant scope, permission checks, and assigned-only reviewer access.';

comment on function private.claim_can_mutate(uuid, uuid, uuid, text) is
  'Combines active parent-claim scope, permission checks, and reviewer assignment restrictions for writes.';
