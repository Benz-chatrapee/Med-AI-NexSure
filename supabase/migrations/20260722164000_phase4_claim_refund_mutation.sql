-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 7: Controlled Claim Refund Lifecycle Mutation
-- Migration: 20260722164000_phase4_claim_refund_mutation.sql
-- =============================================================================

do $$
begin
  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_payments') is null then
    raise exception 'Required table public.claim_payments does not exist';
  end if;

  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception 'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;

  if to_regprocedure(
    'public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)'
  ) is null then
    raise exception 'Required Batch 5 function public.record_claim_payment_settlement does not exist';
  end if;
end;
$$;

insert into public.permissions (
  permission_key,
  description,
  domain
)
values (
  'claim.payment.refund',
  'Record a Claim refund through the controlled refund lifecycle operation',
  'claim'
)
on conflict (permission_key) do update
set
  description = excluded.description,
  domain = excluded.domain;

do $$
declare
  v_role text;
  v_permission text;
  v_mapping jsonb := '{
    "admin": ["claim.payment.refund"],
    "system_admin": ["claim.payment.refund"]
  }'::jsonb;
begin
  for v_role, v_permission in
    select key, jsonb_array_elements_text(value)
    from jsonb_each(v_mapping)
  loop
    insert into public.role_permissions (role_id, permission_id)
    select r.id, p.id
    from public.roles r
    join public.permissions p
      on p.permission_key = v_permission
    where r.name = v_role
    on conflict (role_id, permission_id) do nothing;
  end loop;
end;
$$;

alter table public.claim_payments
  drop constraint claim_payments_status_chk,
  add constraint claim_payments_status_chk
    check (
      payment_status in (
        'pending',
        'scheduled',
        'processing',
        'received',
        'failed',
        'reversed',
        'cancelled',
        'refund'
      )
    );

create index claim_payments_refund_original_idx
  on public.claim_payments (
    organization_id,
    clinic_id,
    claim_id,
    ((metadata ->> 'original_payment_id'))
  )
  where payment_status = 'refund';

create or replace function public.record_claim_refund(
  p_claim_id uuid,
  p_original_payment_id uuid,
  p_expected_version integer,
  p_refund_amount numeric,
  p_reason_code text,
  p_reason_text text,
  p_refunded_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  claim_id uuid,
  refund_payment_id uuid,
  original_payment_id uuid,
  previous_payment_status public.claim_payment_state_domain,
  payment_status public.claim_payment_state_domain,
  version integer,
  total_paid_amount numeric,
  refunded_amount numeric,
  net_paid_amount numeric,
  state_updated_at timestamptz,
  idempotent_replay boolean
)
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_claim record;
  v_original_payment public.claim_payments%rowtype;
  v_existing_refund public.claim_payments%rowtype;
  v_actor_id uuid := auth.uid();
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_reason_code text := nullif(btrim(p_reason_code), '');
  v_reason_text text := nullif(btrim(p_reason_text), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_refunded_at timestamptz := coalesce(p_refunded_at, now());
  v_now timestamptz := now();
  v_created_at timestamptz;
  v_refund_amount numeric(18,2);
  v_gross_paid numeric(18,2);
  v_prior_refunded numeric(18,2);
  v_refunded_total numeric(18,2);
  v_net_paid numeric(18,2);
  v_payment_number integer;
  v_refund_payment_id uuid := gen_random_uuid();
  v_previous_snapshot public.claim_payment_state_domain;
  v_next_snapshot public.claim_payment_state_domain;
  v_external_source text;
begin
  if p_claim_id is null
    or p_original_payment_id is null
    or p_expected_version is null
    or p_refund_amount is null
    or v_reason_code is null
    or v_reason_text is null
    or v_source_system is null
    or jsonb_typeof(v_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim refund request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim refund is not authorized';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim refund requires an event identity';
  end if;

  v_refund_amount := round(p_refund_amount, 2);

  if v_refund_amount <= 0 then
    raise exception using
      errcode = '23514',
      message = 'Claim refund amount is invalid';
  end if;

  if not exists (
    select 1
    from public.decision_reason_codes r
    where r.code = v_reason_code
  ) then
    raise exception using
      errcode = '23503',
      message = 'Claim refund reason is invalid';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.version,
         c.currency_code,
         c.total_paid_amount,
         c.state_updated_at,
         c.deleted_at
  into v_claim
  from public.claims c
  where c.id = p_claim_id
    and c.deleted_at is null
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Claim refund is not authorized';
  end if;

  v_previous_snapshot := coalesce(
    v_claim.payment_status,
    'not_paid'::public.claim_payment_state_domain
  );

  if not coalesce(
    public.has_permission(
      'claim.payment.refund',
      v_claim.organization_id,
      v_claim.clinic_id
    ),
    false
  ) then
    raise exception using
      errcode = '42501',
      message = 'Claim refund is not authorized';
  end if;

  select *
  into v_original_payment
  from public.claim_payments p
  where p.id = p_original_payment_id
    and p.organization_id = v_claim.organization_id
    and p.clinic_id = v_claim.clinic_id
    and p.claim_id = v_claim.id
    and p.payment_status = 'received'
    and p.net_payment_amount > 0
    and p.currency_code = v_claim.currency_code
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Claim refund is not authorized';
  end if;

  v_external_source := case
    when v_source_system = 'internal' then 'manual'
    when v_source_system in (
      'manual',
      'payer_file',
      'payer_api',
      'bank_file',
      'bank_api',
      'migration',
      'other'
    ) then v_source_system
    else 'other'
  end;

  if v_external_event_id is not null then
    select *
    into v_existing_refund
    from public.claim_payments p
    where p.organization_id = v_claim.organization_id
      and p.idempotency_key = v_external_event_id
    for update;

    if found then
      if v_existing_refund.claim_id = p_claim_id
        and v_existing_refund.payment_status = 'refund'
        and v_existing_refund.net_payment_amount = v_refund_amount
        and v_existing_refund.currency_code = v_claim.currency_code
        and coalesce(nullif(btrim(v_existing_refund.external_source), ''), '') = v_external_source
        and v_existing_refund.metadata ->> 'original_payment_id' = p_original_payment_id::text
        and v_existing_refund.metadata ->> 'reason_code' = v_reason_code
        and nullif(btrim(v_existing_refund.metadata ->> 'reason_text'), '') = v_reason_text then
        select
          coalesce(sum(p.net_payment_amount), 0)
        into v_gross_paid
        from public.claim_payments p
        where p.claim_id = p_claim_id
          and p.organization_id = v_claim.organization_id
          and p.clinic_id = v_claim.clinic_id
          and p.payment_status = 'received';

        select
          coalesce(sum(p.net_payment_amount), 0)
        into v_refunded_total
        from public.claim_payments p
        where p.claim_id = p_claim_id
          and p.organization_id = v_claim.organization_id
          and p.clinic_id = v_claim.clinic_id
          and p.payment_status = 'refund';

        v_net_paid := greatest(v_gross_paid - v_refunded_total, 0);

        return query
        select
          p_claim_id,
          v_existing_refund.id,
          p_original_payment_id,
          v_previous_snapshot,
          coalesce(v_claim.payment_status, v_previous_snapshot),
          v_claim.version,
          v_claim.total_paid_amount,
          v_refunded_total,
          v_net_paid,
          v_claim.state_updated_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim refund event identity conflicts';
    end if;
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim refund version conflict';
  end if;

  select coalesce(sum(p.net_payment_amount), 0)
  into v_gross_paid
  from public.claim_payments p
  where p.claim_id = p_claim_id
    and p.organization_id = v_claim.organization_id
    and p.clinic_id = v_claim.clinic_id
    and p.payment_status = 'received'
    and p.currency_code = v_claim.currency_code;

  select coalesce(sum(p.net_payment_amount), 0)
  into v_prior_refunded
  from public.claim_payments p
  where p.claim_id = p_claim_id
    and p.organization_id = v_claim.organization_id
    and p.clinic_id = v_claim.clinic_id
    and p.payment_status = 'refund'
    and p.currency_code = v_claim.currency_code;

  if v_gross_paid <= 0
    or v_prior_refunded + v_refund_amount > v_gross_paid then
    raise exception using
      errcode = '23514',
      message = 'Claim refund would exceed refundable amount';
  end if;

  select coalesce(max(p.payment_number), 0) + 1
  into v_payment_number
  from public.claim_payments p
  where p.claim_id = p_claim_id;

  v_created_at := least(v_now, v_refunded_at);

  insert into public.claim_payments (
    id,
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    payment_number,
    payment_reference,
    idempotency_key,
    payment_status,
    payment_method,
    currency_code,
    gross_payment_amount,
    withholding_amount,
    adjustment_amount,
    received_at,
    value_date,
    external_source,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_refund_payment_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_original_payment.claim_decision_id,
    v_payment_number,
    format('P4REF-%s-%s', replace(p_claim_id::text, '-', ''), v_payment_number),
    v_external_event_id,
    'refund',
    'electronic_transfer',
    v_claim.currency_code,
    v_refund_amount,
    0,
    0,
    null,
    v_refunded_at::date,
    v_external_source,
    v_metadata
      || jsonb_build_object(
        'operation',
        'record_claim_refund',
        'source_system',
        v_source_system,
        'correlation_id',
        p_correlation_id,
        'expected_version',
        p_expected_version,
        'original_payment_id',
        p_original_payment_id,
        'refunded_at',
        v_refunded_at,
        'reason_code',
        v_reason_code,
        'reason_text',
        v_reason_text
      ),
    v_created_at,
    v_actor_id,
    v_now,
    v_actor_id
  );

  v_refunded_total := v_prior_refunded + v_refund_amount;
  v_net_paid := greatest(v_gross_paid - v_refunded_total, 0);
  v_next_snapshot := case
    when v_net_paid = 0
      then 'refunded'::public.claim_payment_state_domain
    else 'partially_refunded'::public.claim_payment_state_domain
  end;

  update public.claims c
  set payment_status = v_next_snapshot,
      total_paid_amount = v_net_paid,
      version = c.version + 1,
      state_updated_at = v_now,
      state_updated_by = v_actor_id,
      updated_at = v_now,
      updated_by = v_actor_id
  where c.id = p_claim_id;

  return query
  select
    p_claim_id,
    v_refund_payment_id,
    p_original_payment_id,
    v_previous_snapshot,
    v_next_snapshot,
    v_claim.version + 1,
    v_net_paid,
    v_refunded_total,
    v_net_paid,
    v_now,
    false;
end;
$$;

revoke all on function public.record_claim_refund(
  uuid,
  uuid,
  integer,
  numeric,
  text,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) from public, anon;

grant execute on function public.record_claim_refund(
  uuid,
  uuid,
  integer,
  numeric,
  text,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) to authenticated, service_role;

revoke insert, update, delete on table public.claim_payments from authenticated;

comment on function public.record_claim_refund(
  uuid,
  uuid,
  integer,
  numeric,
  text,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) is
  'Phase 4 Batch 7 controlled Claim refund mutation. Derives actor and tenant scope from trusted context, validates refund permission, original settled payment evidence, optimistic version, refund ceiling, idempotent external replay, and atomically writes refund evidence while synchronizing payment summary only.';
