-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Transaction Functions
-- Migration: 20260720082444_phase3_claim_functions.sql
-- =============================================================================
--
-- PURPOSE
--   Provide trusted, transaction-safe workflows for human claim decisions,
--   payment recording, payment allocation, and reconciliation.
--
-- FUNCTIONS
--   - public.finalize_claim_decision(...)
--   - public.supersede_claim_decision(...)
--   - public.record_claim_payment(...)
--   - public.allocate_claim_payment(...)
--   - public.reconcile_claim_payment(...)
--
-- SECURITY MODEL
--   - SECURITY DEFINER with a fixed safe search_path.
--   - EXECUTE is revoked from PUBLIC, anon, and authenticated.
--   - Grants are intentionally deferred to phase3_claim_permissions.sql.
--   - AI must never receive claim decision or payment execution permissions.
--
-- PERFORMANCE MODEL
--   - Lock the claim aggregate first to serialize critical workflows.
--   - Lock only the decision/payment rows required by each operation.
--   - Avoid repeated scans by aggregating once into local variables.
--   - Use unique business keys and optional idempotency keys for retry safety.
--   - Supporting workload indexes are added in phase3_claim_indexes.sql.
--
-- IMPORTANT
--   These functions validate data integrity and lifecycle rules. Permission and
--   tenant-membership checks must also be enforced when EXECUTE is granted.
-- =============================================================================

begin;

-- =============================================================================
-- 1. FINALIZE CLAIM DECISION
-- =============================================================================

create or replace function public.finalize_claim_decision(
  p_decision_id uuid,
  p_actor_id uuid,
  p_actor_role text,
  p_decided_at timestamptz default now()
)
returns public.claim_decisions
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_decision public.claim_decisions%rowtype;
  v_claim public.claims%rowtype;
  v_review public.claim_reviews%rowtype;
  v_next_status text;
  v_history_sequence integer;
begin
  if p_decision_id is null
     or p_actor_id is null
     or nullif(btrim(p_actor_role), '') is null then
    raise exception using
      errcode = '22023',
      message = 'Decision, actor, and actor role are required.';
  end if;

  if p_decided_at is null then
    raise exception using
      errcode = '22023',
      message = 'Decision timestamp is required.';
  end if;

  select *
    into v_decision
  from public.claim_decisions
  where id = p_decision_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Claim decision was not found.';
  end if;

  -- Claim lock is the serialization boundary for decision and payment flows.
  select *
    into v_claim
  from public.claims
  where id = v_decision.claim_id
    and organization_id = v_decision.organization_id
    and clinic_id = v_decision.clinic_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Decision does not belong to a valid tenant claim.';
  end if;

  select *
    into v_decision
  from public.claim_decisions
  where id = p_decision_id
  for update;

  if v_decision.decision_status <> 'draft' then
    raise exception using
      errcode = 'P0001',
      message = 'Only a draft decision can be finalized.';
  end if;

  if v_decision.decision_outcome is null then
    raise exception using
      errcode = '23514',
      message = 'Decision outcome is required before finalization.';
  end if;

  if v_decision.decision_outcome in (
       'approved',
       'partially_approved',
       'rejected'
     )
     and (
       v_decision.approved_amount is null
       or v_decision.rejected_amount is null
       or v_decision.patient_responsibility_amount is null
       or v_decision.payer_responsibility_amount is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'Financial decision amounts are incomplete.';
  end if;

  if v_decision.decision_outcome in (
       'partially_approved',
       'rejected',
       'request_information',
       'returned_for_correction'
     )
     and (
       v_decision.decision_reason_code is null
       or nullif(btrim(v_decision.decision_reason_text), '') is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'A structured reason is required for this outcome.';
  end if;

  select *
    into v_review
  from public.claim_reviews
  where id = v_decision.claim_review_id
    and organization_id = v_decision.organization_id
    and clinic_id = v_decision.clinic_id
    and claim_id = v_decision.claim_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Decision review does not belong to the same claim.';
  end if;

  if v_review.review_status in ('cancelled') then
    raise exception using
      errcode = 'P0001',
      message = 'A cancelled review cannot produce a final decision.';
  end if;

  if exists (
    select 1
    from public.claim_decisions d
    where d.claim_id = v_decision.claim_id
      and d.decision_status = 'final'
      and d.id <> v_decision.id
  ) then
    raise exception using
      errcode = '23505',
      message = 'The claim already has an active final decision. Use supersede_claim_decision().';
  end if;

  update public.claim_decisions
  set decision_status = 'final',
      decided_by = p_actor_id,
      decision_role_snapshot = btrim(p_actor_role),
      decided_at = p_decided_at,
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_decision.id
  returning * into v_decision;

  update public.claim_reviews
  set review_status = 'completed',
      started_at = coalesce(started_at, assigned_at, created_at),
      completed_at = p_decided_at,
      review_summary = coalesce(
        review_summary,
        v_decision.decision_summary,
        v_decision.decision_reason_text
      ),
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_review.id;

  v_next_status :=
    case v_decision.decision_outcome
      when 'approved' then 'approved'
      when 'partially_approved' then 'partially_approved'
      when 'rejected' then 'rejected'
      when 'request_information' then 'needs_information'
      when 'returned_for_correction' then 'needs_information'
      else null
    end;

  if v_next_status is null then
    raise exception using
      errcode = '23514',
      message = 'Unsupported decision outcome.';
  end if;

  select coalesce(max(sequence_number), 0) + 1
    into v_history_sequence
  from public.claim_status_history
  where claim_id = v_claim.id;

  if v_claim.status <> v_next_status then
    insert into public.claim_status_history (
      organization_id,
      clinic_id,
      claim_id,
      sequence_number,
      from_status,
      to_status,
      reason_code,
      reason_text,
      changed_by,
      changed_at,
      metadata
    )
    values (
      v_claim.organization_id,
      v_claim.clinic_id,
      v_claim.id,
      v_history_sequence,
      v_claim.status,
      v_next_status,
      v_decision.decision_reason_code,
      v_decision.decision_reason_text,
      p_actor_id,
      p_decided_at,
      jsonb_build_object(
        'source', 'finalize_claim_decision',
        'decision_id', v_decision.id,
        'decision_version', v_decision.decision_version
      )
    );
  end if;

  update public.claims
  set status = v_next_status,
      current_decision_id = v_decision.id,
      total_approved_amount =
        case
          when v_decision.decision_outcome in (
            'approved',
            'partially_approved',
            'rejected'
          )
          then v_decision.approved_amount
          else total_approved_amount
        end,
      version = version + 1,
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_claim.id;

  return v_decision;
end;
$function$;

comment on function public.finalize_claim_decision(uuid, uuid, text, timestamptz) is
  'Finalizes one draft human decision, completes its review, and atomically updates the claim lifecycle.';

-- =============================================================================
-- 2. SUPERSEDE CLAIM DECISION
-- =============================================================================

create or replace function public.supersede_claim_decision(
  p_previous_decision_id uuid,
  p_replacement_decision_id uuid,
  p_actor_id uuid,
  p_actor_role text,
  p_decided_at timestamptz default now()
)
returns public.claim_decisions
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_previous public.claim_decisions%rowtype;
  v_replacement public.claim_decisions%rowtype;
  v_claim public.claims%rowtype;
  v_review public.claim_reviews%rowtype;
  v_next_status text;
  v_history_sequence integer;
begin
  if p_previous_decision_id is null
     or p_replacement_decision_id is null
     or p_previous_decision_id = p_replacement_decision_id
     or p_actor_id is null
     or nullif(btrim(p_actor_role), '') is null then
    raise exception using
      errcode = '22023',
      message = 'Previous decision, replacement decision, actor, and actor role are required.';
  end if;

  select *
    into v_previous
  from public.claim_decisions
  where id = p_previous_decision_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Previous claim decision was not found.';
  end if;

  select *
    into v_claim
  from public.claims
  where id = v_previous.claim_id
    and organization_id = v_previous.organization_id
    and clinic_id = v_previous.clinic_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Previous decision does not belong to a valid tenant claim.';
  end if;

  select *
    into v_previous
  from public.claim_decisions
  where id = p_previous_decision_id
  for update;

  select *
    into v_replacement
  from public.claim_decisions
  where id = p_replacement_decision_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Replacement claim decision was not found.';
  end if;

  if v_previous.organization_id <> v_replacement.organization_id
     or v_previous.clinic_id <> v_replacement.clinic_id
     or v_previous.claim_id <> v_replacement.claim_id then
    raise exception using
      errcode = '23503',
      message = 'Replacement decision must belong to the same tenant claim.';
  end if;

  if v_previous.decision_status <> 'final' then
    raise exception using
      errcode = 'P0001',
      message = 'Only an active final decision can be superseded.';
  end if;

  if v_claim.current_decision_id is distinct from v_previous.id then
    raise exception using
      errcode = 'P0001',
      message = 'Previous decision is not the current active claim decision.';
  end if;

  if v_replacement.decision_status <> 'draft'
     or v_replacement.supersedes_decision_id is distinct from v_previous.id
     or v_replacement.decision_version <> v_previous.decision_version + 1 then
    raise exception using
      errcode = '23514',
      message = 'Replacement decision lineage or version is invalid.';
  end if;

  if v_replacement.decision_outcome is null then
    raise exception using
      errcode = '23514',
      message = 'Replacement decision outcome is required.';
  end if;

  if v_replacement.decision_outcome in (
       'approved',
       'partially_approved',
       'rejected'
     )
     and (
       v_replacement.approved_amount is null
       or v_replacement.rejected_amount is null
       or v_replacement.patient_responsibility_amount is null
       or v_replacement.payer_responsibility_amount is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'Replacement financial amounts are incomplete.';
  end if;

  if v_replacement.decision_outcome in (
       'partially_approved',
       'rejected',
       'request_information',
       'returned_for_correction'
     )
     and (
       v_replacement.decision_reason_code is null
       or nullif(btrim(v_replacement.decision_reason_text), '') is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'A structured replacement reason is required.';
  end if;

  select *
    into v_review
  from public.claim_reviews
  where id = v_replacement.claim_review_id
    and organization_id = v_replacement.organization_id
    and clinic_id = v_replacement.clinic_id
    and claim_id = v_replacement.claim_id
  for update;

  if not found or v_review.review_status = 'cancelled' then
    raise exception using
      errcode = 'P0001',
      message = 'Replacement review is invalid or cancelled.';
  end if;

  update public.claim_decisions
  set decision_status = 'superseded',
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_previous.id;

  update public.claim_decisions
  set decision_status = 'final',
      decided_by = p_actor_id,
      decision_role_snapshot = btrim(p_actor_role),
      decided_at = p_decided_at,
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_replacement.id
  returning * into v_replacement;

  update public.claim_reviews
  set review_status = 'completed',
      started_at = coalesce(started_at, assigned_at, created_at),
      completed_at = p_decided_at,
      review_summary = coalesce(
        review_summary,
        v_replacement.decision_summary,
        v_replacement.decision_reason_text
      ),
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_review.id;

  v_next_status :=
    case v_replacement.decision_outcome
      when 'approved' then 'approved'
      when 'partially_approved' then 'partially_approved'
      when 'rejected' then 'rejected'
      when 'request_information' then 'needs_information'
      when 'returned_for_correction' then 'needs_information'
      else null
    end;

  select coalesce(max(sequence_number), 0) + 1
    into v_history_sequence
  from public.claim_status_history
  where claim_id = v_claim.id;

  if v_claim.status <> v_next_status then
    insert into public.claim_status_history (
      organization_id,
      clinic_id,
      claim_id,
      sequence_number,
      from_status,
      to_status,
      reason_code,
      reason_text,
      changed_by,
      changed_at,
      metadata
    )
    values (
      v_claim.organization_id,
      v_claim.clinic_id,
      v_claim.id,
      v_history_sequence,
      v_claim.status,
      v_next_status,
      v_replacement.decision_reason_code,
      v_replacement.decision_reason_text,
      p_actor_id,
      p_decided_at,
      jsonb_build_object(
        'source', 'supersede_claim_decision',
        'previous_decision_id', v_previous.id,
        'replacement_decision_id', v_replacement.id,
        'replacement_version', v_replacement.decision_version
      )
    );
  end if;

  update public.claims
  set status = v_next_status,
      current_decision_id = v_replacement.id,
      total_approved_amount =
        case
          when v_replacement.decision_outcome in (
            'approved',
            'partially_approved',
            'rejected'
          )
          then v_replacement.approved_amount
          else total_approved_amount
        end,
      version = version + 1,
      updated_at = p_decided_at,
      updated_by = p_actor_id
  where id = v_claim.id;

  return v_replacement;
end;
$function$;

comment on function public.supersede_claim_decision(uuid, uuid, uuid, text, timestamptz) is
  'Atomically supersedes the current final decision with the next valid human decision version.';

-- =============================================================================
-- 3. RECORD CLAIM PAYMENT
-- =============================================================================

create or replace function public.record_claim_payment(
  p_claim_decision_id uuid,
  p_actor_id uuid,
  p_payment_reference text,
  p_gross_payment_amount numeric,
  p_currency_code text,
  p_withholding_amount numeric default 0,
  p_adjustment_amount numeric default 0,
  p_payment_status text default 'received',
  p_payment_method text default 'electronic_transfer',
  p_payer_reference text default null,
  p_remittance_reference text default null,
  p_idempotency_key text default null,
  p_received_at timestamptz default now(),
  p_value_date date default current_date,
  p_external_source text default 'manual',
  p_external_payload_hash text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.claim_payments
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_decision public.claim_decisions%rowtype;
  v_claim public.claims%rowtype;
  v_existing public.claim_payments%rowtype;
  v_payment public.claim_payments%rowtype;
  v_payment_number integer;
  v_net_amount numeric(18,2);
  v_received_total numeric(18,2);
  v_next_status text;
  v_history_sequence integer;
begin
  if p_claim_decision_id is null
     or p_actor_id is null
     or nullif(btrim(p_payment_reference), '') is null
     or nullif(btrim(p_currency_code), '') is null then
    raise exception using
      errcode = '22023',
      message = 'Decision, actor, payment reference, and currency are required.';
  end if;

  if p_gross_payment_amount is null
     or p_withholding_amount is null
     or p_adjustment_amount is null then
    raise exception using
      errcode = '22004',
      message = 'Payment amounts cannot be null.';
  end if;

  v_net_amount :=
    round(
      p_gross_payment_amount
      - p_withholding_amount
      + p_adjustment_amount,
      2
    );

  if p_gross_payment_amount < 0
     or p_withholding_amount < 0
     or v_net_amount < 0 then
    raise exception using
      errcode = '23514',
      message = 'Payment amounts are invalid.';
  end if;

  select *
    into v_decision
  from public.claim_decisions
  where id = p_claim_decision_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Claim decision was not found.';
  end if;

  select *
    into v_claim
  from public.claims
  where id = v_decision.claim_id
    and organization_id = v_decision.organization_id
    and clinic_id = v_decision.clinic_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Decision does not belong to a valid tenant claim.';
  end if;

  select *
    into v_decision
  from public.claim_decisions
  where id = p_claim_decision_id
  for update;

  if v_decision.decision_status <> 'final'
     or v_decision.decision_outcome not in (
       'approved',
       'partially_approved'
     ) then
    raise exception using
      errcode = 'P0001',
      message = 'Payment requires a final approved or partially approved human decision.';
  end if;

  if v_claim.current_decision_id is distinct from v_decision.id then
    raise exception using
      errcode = 'P0001',
      message = 'Payment must reference the current active claim decision.';
  end if;

  if upper(btrim(p_currency_code)) <> v_decision.currency_code
     or upper(btrim(p_currency_code)) <> v_claim.currency_code then
    raise exception using
      errcode = '22000',
      message = 'Payment currency does not match the claim decision.';
  end if;

  if p_payment_status not in ('pending', 'scheduled', 'processing', 'received') then
    raise exception using
      errcode = '22023',
      message = 'New payment status is not recordable through this function.';
  end if;

  if nullif(btrim(p_idempotency_key), '') is not null then
    select *
      into v_existing
    from public.claim_payments
    where organization_id = v_claim.organization_id
      and idempotency_key = btrim(p_idempotency_key)
    limit 1;

    if found then
      if v_existing.claim_decision_id = v_decision.id
         and v_existing.payment_reference = btrim(p_payment_reference)
         and v_existing.net_payment_amount = v_net_amount
         and v_existing.currency_code = upper(btrim(p_currency_code)) then
        return v_existing;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Idempotency key was already used for a different payment.';
    end if;
  end if;

  select coalesce(sum(net_payment_amount), 0)
    into v_received_total
  from public.claim_payments
  where claim_decision_id = v_decision.id
    and payment_status in ('received', 'processing', 'scheduled', 'pending');

  if v_received_total + v_net_amount
       > v_decision.payer_responsibility_amount then
    raise exception using
      errcode = '23514',
      message = 'Cumulative payment would exceed payer responsibility.';
  end if;

  select coalesce(max(payment_number), 0) + 1
    into v_payment_number
  from public.claim_payments
  where claim_id = v_claim.id;

  insert into public.claim_payments (
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    payment_number,
    payment_reference,
    payer_reference,
    remittance_reference,
    idempotency_key,
    payment_status,
    payment_method,
    currency_code,
    gross_payment_amount,
    withholding_amount,
    adjustment_amount,
    scheduled_at,
    processing_started_at,
    received_at,
    value_date,
    external_source,
    external_payload_hash,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_claim.organization_id,
    v_claim.clinic_id,
    v_claim.id,
    v_decision.id,
    v_payment_number,
    btrim(p_payment_reference),
    nullif(btrim(p_payer_reference), ''),
    nullif(btrim(p_remittance_reference), ''),
    nullif(btrim(p_idempotency_key), ''),
    p_payment_status,
    p_payment_method,
    upper(btrim(p_currency_code)),
    round(p_gross_payment_amount, 2),
    round(p_withholding_amount, 2),
    round(p_adjustment_amount, 2),
    case when p_payment_status = 'scheduled' then p_received_at else null end,
    case when p_payment_status = 'processing' then p_received_at else null end,
    case when p_payment_status = 'received' then p_received_at else null end,
    case when p_payment_status = 'received' then p_value_date else null end,
    p_external_source,
    nullif(btrim(p_external_payload_hash), ''),
    coalesce(p_metadata, '{}'::jsonb),
    now(),
    p_actor_id,
    now(),
    p_actor_id
  )
  returning * into v_payment;

  if p_payment_status = 'received' then
    v_received_total := v_received_total + v_payment.net_payment_amount;

    v_next_status :=
      case
        when v_received_total = v_decision.payer_responsibility_amount
          then 'paid'
        when v_received_total > 0
          then 'partially_paid'
        else 'payment_pending'
      end;

    select coalesce(max(sequence_number), 0) + 1
      into v_history_sequence
    from public.claim_status_history
    where claim_id = v_claim.id;

    if v_claim.status <> v_next_status then
      insert into public.claim_status_history (
        organization_id,
        clinic_id,
        claim_id,
        sequence_number,
        from_status,
        to_status,
        changed_by,
        changed_at,
        metadata
      )
      values (
        v_claim.organization_id,
        v_claim.clinic_id,
        v_claim.id,
        v_history_sequence,
        v_claim.status,
        v_next_status,
        p_actor_id,
        coalesce(p_received_at, now()),
        jsonb_build_object(
          'source', 'record_claim_payment',
          'payment_id', v_payment.id,
          'payment_number', v_payment.payment_number
        )
      );
    end if;

    update public.claims
    set status = v_next_status,
        total_paid_amount = v_received_total,
        version = version + 1,
        updated_at = now(),
        updated_by = p_actor_id
    where id = v_claim.id;
  end if;

  return v_payment;
end;
$function$;

comment on function public.record_claim_payment(
  uuid, uuid, text, numeric, text, numeric, numeric, text, text, text, text,
  text, timestamptz, date, text, text, jsonb
) is
  'Records a retry-safe payment against the current final approved decision and prevents cumulative overpayment.';

-- =============================================================================
-- 4. ALLOCATE CLAIM PAYMENT
-- =============================================================================

create or replace function public.allocate_claim_payment(
  p_claim_payment_id uuid,
  p_actor_id uuid,
  p_allocated_amount numeric,
  p_allocation_type text default 'claim',
  p_claim_item_id uuid default null,
  p_claim_decision_adjustment_id uuid default null,
  p_reason_code text default null,
  p_reason_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.claim_payment_allocations
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_payment public.claim_payments%rowtype;
  v_allocation public.claim_payment_allocations%rowtype;
  v_allocated_total numeric(18,2);
  v_allocation_number integer;
begin
  if p_claim_payment_id is null
     or p_actor_id is null
     or p_allocated_amount is null
     or p_allocated_amount <= 0 then
    raise exception using
      errcode = '22023',
      message = 'Payment, actor, and a positive allocation amount are required.';
  end if;

  select *
    into v_payment
  from public.claim_payments
  where id = p_claim_payment_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Claim payment was not found.';
  end if;

  if v_payment.payment_status in ('failed', 'reversed', 'cancelled') then
    raise exception using
      errcode = 'P0001',
      message = 'This payment status cannot be allocated.';
  end if;

  if (
       p_allocation_type = 'claim'
       and (
         p_claim_item_id is not null
         or p_claim_decision_adjustment_id is not null
       )
     )
     or (
       p_allocation_type = 'claim_item'
       and (
         p_claim_item_id is null
         or p_claim_decision_adjustment_id is not null
       )
     )
     or (
       p_allocation_type = 'decision_adjustment'
       and (
         p_claim_item_id is not null
         or p_claim_decision_adjustment_id is null
       )
     ) then
    raise exception using
      errcode = '23514',
      message = 'Allocation target does not match allocation type.';
  end if;

  if p_claim_item_id is not null
     and not exists (
       select 1
       from public.claim_items i
       where i.id = p_claim_item_id
         and i.organization_id = v_payment.organization_id
         and i.clinic_id = v_payment.clinic_id
         and i.claim_id = v_payment.claim_id
     ) then
    raise exception using
      errcode = '23503',
      message = 'Claim item does not belong to the payment claim.';
  end if;

  if p_claim_decision_adjustment_id is not null
     and not exists (
       select 1
       from public.claim_decision_adjustments a
       where a.id = p_claim_decision_adjustment_id
         and a.organization_id = v_payment.organization_id
         and a.clinic_id = v_payment.clinic_id
         and a.claim_id = v_payment.claim_id
         and a.claim_decision_id = v_payment.claim_decision_id
     ) then
    raise exception using
      errcode = '23503',
      message = 'Decision adjustment does not belong to the payment decision.';
  end if;

  select
    coalesce(sum(allocated_amount), 0),
    coalesce(max(allocation_number), 0) + 1
  into
    v_allocated_total,
    v_allocation_number
  from public.claim_payment_allocations
  where claim_payment_id = v_payment.id;

  if v_allocated_total + round(p_allocated_amount, 2)
       > v_payment.net_payment_amount then
    raise exception using
      errcode = '23514',
      message = 'Allocation total would exceed the payment net amount.';
  end if;

  insert into public.claim_payment_allocations (
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    claim_payment_id,
    claim_item_id,
    claim_decision_adjustment_id,
    allocation_number,
    allocation_type,
    currency_code,
    allocated_amount,
    reason_code,
    reason_text,
    metadata,
    created_at,
    created_by
  )
  values (
    v_payment.organization_id,
    v_payment.clinic_id,
    v_payment.claim_id,
    v_payment.claim_decision_id,
    v_payment.id,
    p_claim_item_id,
    p_claim_decision_adjustment_id,
    v_allocation_number,
    p_allocation_type,
    v_payment.currency_code,
    round(p_allocated_amount, 2),
    p_reason_code,
    nullif(btrim(p_reason_text), ''),
    coalesce(p_metadata, '{}'::jsonb),
    now(),
    p_actor_id
  )
  returning * into v_allocation;

  return v_allocation;
end;
$function$;

comment on function public.allocate_claim_payment(
  uuid, uuid, numeric, text, uuid, uuid, text, text, jsonb
) is
  'Allocates a payment to a tenant-safe target and prevents allocation beyond the net payment amount.';

-- =============================================================================
-- 5. RECONCILE CLAIM PAYMENT
-- =============================================================================

create or replace function public.reconcile_claim_payment(
  p_claim_payment_id uuid,
  p_actor_id uuid,
  p_expected_amount numeric default null,
  p_external_statement_reference text default null,
  p_external_statement_date date default null,
  p_variance_reason_code text default null,
  p_variance_reason_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.claim_payment_reconciliations
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_payment public.claim_payments%rowtype;
  v_reconciliation public.claim_payment_reconciliations%rowtype;
  v_expected numeric(18,2);
  v_variance numeric(18,2);
  v_status text;
  v_reconciliation_number integer;
begin
  if p_claim_payment_id is null or p_actor_id is null then
    raise exception using
      errcode = '22023',
      message = 'Payment and actor are required.';
  end if;

  select *
    into v_payment
  from public.claim_payments
  where id = p_claim_payment_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Claim payment was not found.';
  end if;

  if v_payment.payment_status <> 'received' then
    raise exception using
      errcode = 'P0001',
      message = 'Only a received payment can be reconciled.';
  end if;

  v_expected :=
    round(
      coalesce(p_expected_amount, v_payment.net_payment_amount),
      2
    );

  if v_expected < 0 then
    raise exception using
      errcode = '23514',
      message = 'Expected reconciliation amount cannot be negative.';
  end if;

  v_variance := round(v_payment.net_payment_amount - v_expected, 2);
  v_status := case when v_variance = 0 then 'matched' else 'mismatched' end;

  if v_variance <> 0
     and (
       p_variance_reason_code is null
       or nullif(btrim(p_variance_reason_text), '') is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'Variance reason is required for a mismatched reconciliation.';
  end if;

  select coalesce(max(reconciliation_number), 0) + 1
    into v_reconciliation_number
  from public.claim_payment_reconciliations
  where claim_payment_id = v_payment.id;

  insert into public.claim_payment_reconciliations (
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    claim_payment_id,
    reconciliation_number,
    reconciliation_status,
    currency_code,
    expected_amount,
    received_amount,
    variance_reason_code,
    variance_reason_text,
    external_statement_reference,
    external_statement_date,
    reconciled_by,
    reconciled_at,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_payment.organization_id,
    v_payment.clinic_id,
    v_payment.claim_id,
    v_payment.claim_decision_id,
    v_payment.id,
    v_reconciliation_number,
    v_status,
    v_payment.currency_code,
    v_expected,
    v_payment.net_payment_amount,
    case when v_variance <> 0 then p_variance_reason_code else null end,
    case
      when v_variance <> 0
      then nullif(btrim(p_variance_reason_text), '')
      else null
    end,
    nullif(btrim(p_external_statement_reference), ''),
    p_external_statement_date,
    p_actor_id,
    now(),
    coalesce(p_metadata, '{}'::jsonb),
    now(),
    p_actor_id,
    now(),
    p_actor_id
  )
  returning * into v_reconciliation;

  return v_reconciliation;
end;
$function$;

comment on function public.reconcile_claim_payment(
  uuid, uuid, numeric, text, date, text, text, jsonb
) is
  'Creates a matched or mismatched reconciliation record for a received payment.';

-- =============================================================================
-- 6. EXECUTION SECURITY BASELINE
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

commit;