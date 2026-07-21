-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Permissions and Role Mapping
-- Migration: 20260720082450_phase3_claim_permissions.sql
-- =============================================================================
--
-- PURPOSE
--   Register claim-domain permissions and map them to existing RBAC roles.
--
-- SECURITY
--   - Reuse Core Foundation RBAC tables.
--   - Deny by default.
--   - Claim reviewers do not execute payment workflows.
--   - Finance roles do not approve or supersede claim decisions.
--   - AI/system agents receive no human decision or payment permissions.
--   - Sensitive claim functions remain server-only.
--
-- NOTE
--   Do not add BEGIN/COMMIT. Supabase migrations are transactional.
-- =============================================================================

-- =============================================================================
-- 1. VALIDATE REQUIRED RBAC SCHEMA
-- =============================================================================

do $$
begin
  if to_regclass('public.permissions') is null then
    raise exception 'Required table public.permissions does not exist';
  end if;

  if to_regclass('public.roles') is null then
    raise exception 'Required table public.roles does not exist';
  end if;

  if to_regclass('public.role_permissions') is null then
    raise exception 'Required table public.role_permissions does not exist';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'permissions'
      and column_name = 'permission_key'
  ) then
    raise exception 'Expected public.permissions.permission_key';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'permissions'
      and column_name = 'description'
  ) then
    raise exception 'Expected public.permissions.description';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'permissions'
      and column_name = 'domain'
  ) then
    raise exception 'Expected public.permissions.domain';
  end if;
end;
$$;

-- =============================================================================
-- 2. CLAIM PERMISSION CATALOG
-- =============================================================================

insert into public.permissions (
  permission_key,
  description,
  domain
)
values
  ('claim.read', 'Read authorized claims', 'claim'),
  ('claim.create', 'Create claims in an authorized clinic', 'claim'),
  ('claim.update', 'Update mutable claim information', 'claim'),
  ('claim.submit', 'Submit claims for validation and review', 'claim'),
  ('claim.assign', 'Assign or reassign claim reviewers', 'claim'),
  ('claim.review', 'Review assigned claims', 'claim'),
  ('claim.approve', 'Approve claims through a human workflow', 'claim'),
  ('claim.reject', 'Reject claims through a human workflow', 'claim'),
  ('claim.request_information', 'Request additional claim information', 'claim'),
  ('claim.override', 'Override an eligible result with a documented reason', 'claim'),
  ('claim.reopen', 'Reopen an eligible claim', 'claim'),
  ('claim.cancel', 'Cancel an eligible claim', 'claim'),
  ('claim.export', 'Export authorized claim data', 'claim'),
  ('claim.delete', 'Soft-delete an eligible claim', 'claim'),
  ('claim.decide', 'Finalize an authorized human claim decision', 'claim'),
  ('claim.decision.supersede', 'Supersede the current final claim decision', 'claim'),
  ('claim.payment.record', 'Record a payment against an approved claim decision', 'claim'),
  ('claim.payment.allocate', 'Allocate a claim payment to authorized targets', 'claim'),
  ('claim.payment.reconcile', 'Reconcile a received claim payment', 'claim'),
  ('claim.evidence.read', 'Read authorized claim evidence', 'claim'),
  ('claim.evidence.upload', 'Upload authorized claim evidence', 'claim'),
  ('claim.evidence.verify', 'Verify claim evidence', 'claim'),
  ('claim.clinical.read', 'Read minimum-necessary clinical claim data', 'claim'),
  ('claim.medical_coding.read', 'Read claim medical coding', 'claim'),
  ('claim.medical_coding.update', 'Update authorized claim medical coding', 'claim'),
  ('claim.fraud.read', 'Read claim fraud and risk signals', 'claim'),
  ('claim.fraud.review', 'Review claim fraud and risk signals', 'claim'),
  ('claim.fraud.override', 'Override a fraud warning with a documented reason', 'claim'),
  ('claim.cost.read', 'Read claim cost validation information', 'claim'),
  ('claim.cost.review', 'Review claim cost anomalies', 'claim'),
  ('claim.cost.override', 'Override a cost warning with a documented reason', 'claim'),
  ('claim.audit.read', 'Read authorized claim audit history', 'claim'),
  ('claim.audit.export', 'Export authorized claim audit records', 'claim')
on conflict (permission_key) do update
set
  description = excluded.description,
  domain = excluded.domain;

-- =============================================================================
-- 3. ROLE-PERMISSION MAPPING
-- =============================================================================

do $$
declare
  v_role_column text;
  v_role text;
  v_permissions jsonb;
  v_permission text;

  v_mapping jsonb := '{
    "admin": ["claim.*"],
    "system_admin": ["claim.*"],

    "organization_admin": [
      "claim.read","claim.create","claim.update","claim.submit","claim.assign",
      "claim.review","claim.request_information","claim.cancel","claim.export",
      "claim.evidence.read","claim.evidence.upload","claim.evidence.verify",
      "claim.clinical.read","claim.medical_coding.read","claim.fraud.read",
      "claim.cost.read","claim.audit.read"
    ],

    "clinic_admin": [
      "claim.read","claim.create","claim.update","claim.submit","claim.assign",
      "claim.review","claim.request_information","claim.evidence.read",
      "claim.evidence.upload","claim.evidence.verify","claim.clinical.read",
      "claim.medical_coding.read"
    ],

    "clinic_manager": [
      "claim.read","claim.create","claim.update","claim.submit","claim.assign",
      "claim.review","claim.request_information","claim.evidence.read",
      "claim.evidence.upload","claim.evidence.verify","claim.clinical.read",
      "claim.medical_coding.read"
    ],

    "clinic_staff": [
      "claim.read","claim.create","claim.update","claim.submit",
      "claim.evidence.read","claim.evidence.upload"
    ],

    "receptionist": [
      "claim.read","claim.create","claim.update","claim.submit",
      "claim.evidence.read","claim.evidence.upload"
    ],

    "doctor": [
      "claim.read","claim.evidence.read","claim.evidence.upload",
      "claim.clinical.read","claim.medical_coding.read"
    ],

    "nurse": [
      "claim.read","claim.evidence.read","claim.evidence.upload",
      "claim.clinical.read"
    ],

    "pharmacist": [
      "claim.read","claim.evidence.read","claim.clinical.read"
    ],

    "claim_reviewer": [
      "claim.read","claim.review","claim.request_information","claim.decide",
      "claim.evidence.read","claim.evidence.verify","claim.clinical.read",
      "claim.medical_coding.read","claim.fraud.read","claim.cost.read"
    ],

    "senior_claim_reviewer": [
      "claim.read","claim.assign","claim.review","claim.approve","claim.reject",
      "claim.request_information","claim.override","claim.reopen","claim.cancel",
      "claim.decide","claim.decision.supersede","claim.evidence.read",
      "claim.evidence.verify","claim.clinical.read","claim.medical_coding.read",
      "claim.fraud.read","claim.cost.read","claim.audit.read"
    ],

    "medical_coder": [
      "claim.read","claim.review","claim.evidence.read","claim.clinical.read",
      "claim.medical_coding.read","claim.medical_coding.update"
    ],

    "fraud_analyst": [
      "claim.read","claim.review","claim.evidence.read","claim.fraud.read",
      "claim.fraud.review","claim.fraud.override","claim.audit.read"
    ],

    "finance_officer": [
      "claim.read","claim.cost.read",
      "claim.payment.record","claim.payment.allocate"
    ],

    "finance_manager": [
      "claim.read","claim.cost.read","claim.cost.review","claim.cost.override",
      "claim.payment.record","claim.payment.allocate",
      "claim.payment.reconcile","claim.audit.read"
    ],

    "auditor": [
      "claim.read","claim.evidence.read","claim.clinical.read",
      "claim.medical_coding.read","claim.fraud.read","claim.cost.read",
      "claim.audit.read","claim.audit.export"
    ],

    "compliance_officer": [
      "claim.read","claim.evidence.read","claim.clinical.read",
      "claim.medical_coding.read","claim.fraud.read","claim.cost.read",
      "claim.audit.read","claim.audit.export"
    ],

    "executive": [
      "claim.read","claim.cost.read"
    ]
  }'::jsonb;
begin
  -- Core Foundation schema stores the role identifier in public.roles.name.
  v_role_column := 'name';

  for v_role, v_permissions in
    select key, value
    from jsonb_each(v_mapping)
  loop
    if v_permissions = '["claim.*"]'::jsonb then
      execute format(
        'insert into public.role_permissions (role_id, permission_id)
         select r.id, p.id
         from public.roles r
         cross join public.permissions p
         where r.%I = $1
           and p.domain = ''claim''
         on conflict (role_id, permission_id) do nothing',
        v_role_column
      )
      using v_role;
    else
      for v_permission in
        select jsonb_array_elements_text(v_permissions)
      loop
        execute format(
          'insert into public.role_permissions (role_id, permission_id)
           select r.id, p.id
           from public.roles r
           join public.permissions p
             on p.permission_key = $2
           where r.%I = $1
           on conflict (role_id, permission_id) do nothing',
          v_role_column
        )
        using v_role, v_permission;
      end loop;
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 4. SENSITIVE FUNCTION EXECUTION BASELINE
-- =============================================================================
--
-- These functions accept actor IDs from the caller. Keep them unavailable to
-- browser-authenticated users until secure wrappers derive the actor from
-- auth.uid() and validate tenant, clinic, permission, assignment, and workflow.
-- =============================================================================

revoke all on function public.finalize_claim_decision(
  uuid, uuid, text, timestamptz
) from public, anon, authenticated;

revoke all on function public.supersede_claim_decision(
  uuid, uuid, uuid, text, timestamptz
) from public, anon, authenticated;

revoke all on function public.record_claim_payment(
  uuid, uuid, text, numeric, text, numeric, numeric, text, text, text, text,
  text, timestamptz, date, text, text, jsonb
) from public, anon, authenticated;

revoke all on function public.allocate_claim_payment(
  uuid, uuid, numeric, text, uuid, uuid, text, text, jsonb
) from public, anon, authenticated;

revoke all on function public.reconcile_claim_payment(
  uuid, uuid, numeric, text, date, text, text, jsonb
) from public, anon, authenticated;

grant execute on function public.finalize_claim_decision(
  uuid, uuid, text, timestamptz
) to service_role;

grant execute on function public.supersede_claim_decision(
  uuid, uuid, uuid, text, timestamptz
) to service_role;

grant execute on function public.record_claim_payment(
  uuid, uuid, text, numeric, text, numeric, numeric, text, text, text, text,
  text, timestamptz, date, text, text, jsonb
) to service_role;

grant execute on function public.allocate_claim_payment(
  uuid, uuid, numeric, text, uuid, uuid, text, text, jsonb
) to service_role;

grant execute on function public.reconcile_claim_payment(
  uuid, uuid, numeric, text, date, text, text, jsonb
) to service_role;
