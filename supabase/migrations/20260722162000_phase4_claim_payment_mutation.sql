-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 5: Controlled Claim Payment Settlement Mutation
-- Migration: 20260722162000_phase4_claim_payment_mutation.sql
-- =============================================================================

do $$
begin
  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_payments') is null then
    raise exception 'Required table public.claim_payments does not exist';
  end if;

  if to_regclass('public.claim_payment_allocations') is null then
    raise exception 'Required table public.claim_payment_allocations does not exist';
  end if;

  if to_regclass('public.claim_payment_reconciliations') is null then
    raise exception 'Required table public.claim_payment_reconciliations does not exist';
  end if;

  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception 'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;

  if to_regprocedure(
    'public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)'
  ) is null then
    raise exception 'Required Batch 4 function public.record_claim_decision does not exist';
  end if;
end;
$$;

insert into public.permissions (
  permission_key,
  description,
  domain
)
values (
  'claim.payment.reverse',
  'Record a payment reversal through a controlled claim payment operation',
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
    "admin": ["claim.payment.reverse"],
    "system_admin": ["claim.payment.reverse"]
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

create or replace function public.record_claim_payment_settlement(
  p_claim_id uuid,
  p_expected_version integer,
  p_payment_amount numeric,
  p_payment_status text default 'received',
  p_payment_reference text default null,
  p_payer_reference text default null,
  p_received_at timestamptz default null,
  p_value_date date default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_reason_code text default null,
  p_reason_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  claim_id uuid,
  previous_payment_status public.claim_payment_state_domain,
  payment_status public.claim_payment_state_domain,
  version integer,
  payment_id uuid,
  total_paid_amount numeric,
  state_updated_at timestamptz,
  idempotent_replay boolean
)
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_claim record;
  v_current_decision public.claim_decisions%rowtype;
  v_existing_payment public.claim_payments%rowtype;
  v_actor_id uuid := auth.uid();
  v_payment_status text := lower(nullif(btrim(coalesce(p_payment_status, 'received')), ''));
  v_payment_reference text := nullif(btrim(p_payment_reference), '');
  v_payer_reference text := nullif(btrim(p_payer_reference), '');
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_reason_code text := nullif(btrim(p_reason_code), '');
  v_reason_text text := nullif(btrim(p_reason_text), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_now timestamptz := now();
  v_event_at timestamptz := coalesce(p_received_at, now());
  v_payment_amount numeric(18,2);
  v_created_at timestamptz;
  v_payment_number integer;
  v_payment_id uuid := gen_random_uuid();
  v_previous_snapshot public.claim_payment_state_domain;
  v_next_snapshot public.claim_payment_state_domain;
  v_required_permission text := 'claim.payment.record';
  v_settled_total numeric(18,2);
  v_approved_amount numeric(18,2);
  v_external_source text;
begin
  if p_claim_id is null
    or p_expected_version is null
    or p_payment_amount is null
    or v_payment_status is null
    or v_source_system is null
    or jsonb_typeof(v_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim payment settlement request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim payment settlement is not authorized';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim payment settlement requires an event identity';
  end if;

  if v_payment_status not in (
    'pending',
    'scheduled',
    'processing',
    'received',
    'failed',
    'reversed'
  ) then
    raise exception using
      errcode = '22023',
      message = 'Unsupported claim payment settlement status';
  end if;

  v_payment_amount := round(p_payment_amount, 2);

  if v_payment_amount < 0 then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement amount is invalid';
  end if;

  if v_payment_status = 'received' and v_payment_amount <= 0 then
    raise exception using
      errcode = '23514',
      message = 'Received claim payment settlement requires a positive amount';
  end if;

  if v_payment_status in ('failed', 'reversed')
    and (v_reason_code is null or v_reason_text is null) then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement requires a reason';
  end if;

  if v_payment_status = 'reversed' then
    v_required_permission := 'claim.payment.reverse';
  end if;

  if v_reason_code is not null
    and not exists (
      select 1
      from public.decision_reason_codes r
      where r.code = v_reason_code
    ) then
    raise exception using
      errcode = '23503',
      message = 'Claim payment settlement reason is invalid';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.version,
         c.currency_code,
         c.total_approved_amount,
         c.total_paid_amount,
         c.current_decision_id,
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
      message = 'Claim payment settlement is not authorized';
  end if;

  v_previous_snapshot := coalesce(
    v_claim.payment_status,
    'not_paid'::public.claim_payment_state_domain
  );

  if not coalesce(
    public.has_permission(
      v_required_permission,
      v_claim.organization_id,
      v_claim.clinic_id
    ),
    false
  ) then
    raise exception using
      errcode = '42501',
      message = 'Claim payment settlement is not authorized';
  end if;

  if v_claim.current_decision_id is null
    or v_claim.decision_status::text not in ('approved', 'partially_approved') then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement requires payable decision evidence';
  end if;

  select *
  into v_current_decision
  from public.claim_decisions d
  where d.id = v_claim.current_decision_id
    and d.organization_id = v_claim.organization_id
    and d.clinic_id = v_claim.clinic_id
    and d.claim_id = v_claim.id
    and d.decision_status = 'final'
    and d.decision_outcome in ('approved', 'partially_approved')
  for update;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement requires payable decision evidence';
  end if;

  if v_current_decision.currency_code <> v_claim.currency_code then
    raise exception using
      errcode = '22000',
      message = 'Claim payment settlement currency is invalid';
  end if;

  v_approved_amount := round(
    coalesce(
      v_current_decision.payer_responsibility_amount,
      v_current_decision.approved_amount,
      v_claim.total_approved_amount,
      0
    ),
    2
  );

  if v_approved_amount <= 0 then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement requires payable decision evidence';
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
    into v_existing_payment
    from public.claim_payments p
    where p.organization_id = v_claim.organization_id
      and p.idempotency_key = v_external_event_id
    for update;

    if found then
      if v_existing_payment.claim_id = p_claim_id
        and v_existing_payment.claim_decision_id = v_current_decision.id
        and v_existing_payment.payment_status = v_payment_status
        and v_existing_payment.net_payment_amount = v_payment_amount
        and v_existing_payment.currency_code = v_claim.currency_code
        and coalesce(nullif(btrim(v_existing_payment.payment_reference), ''), '') = coalesce(v_payment_reference, '')
        and coalesce(nullif(btrim(v_existing_payment.payer_reference), ''), '') = coalesce(v_payer_reference, '')
        and coalesce(nullif(btrim(v_existing_payment.external_source), ''), '') = v_external_source then
        return query
        select
          p_claim_id,
          v_previous_snapshot,
          coalesce(v_claim.payment_status, v_previous_snapshot),
          v_claim.version,
          v_existing_payment.id,
          v_claim.total_paid_amount,
          v_claim.state_updated_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim payment settlement event identity conflicts';
    end if;
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim payment settlement version conflict';
  end if;

  select coalesce(sum(p.net_payment_amount), 0)
  into v_settled_total
  from public.claim_payments p
  where p.claim_id = p_claim_id
    and p.claim_decision_id = v_current_decision.id
    and p.payment_status = 'received';

  if v_payment_status = 'received'
    and v_settled_total + v_payment_amount > v_approved_amount then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement would exceed approved amount';
  end if;

  if v_payment_status in ('pending', 'scheduled', 'processing')
    and v_payment_amount > v_approved_amount then
    raise exception using
      errcode = '23514',
      message = 'Claim payment settlement would exceed approved amount';
  end if;

  if v_payment_status = 'reversed' and v_settled_total <= 0 then
    raise exception using
      errcode = '23514',
      message = 'Claim payment reversal requires prior settled payment evidence';
  end if;

  select coalesce(max(p.payment_number), 0) + 1
  into v_payment_number
  from public.claim_payments p
  where p.claim_id = p_claim_id;

  v_payment_reference := coalesce(
    v_payment_reference,
    format('P4PAY-%s-%s', replace(p_claim_id::text, '-', ''), v_payment_number)
  );

  v_created_at := least(v_now, v_event_at);

  insert into public.claim_payments (
    id,
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    payment_number,
    payment_reference,
    payer_reference,
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
    failed_at,
    reversed_at,
    failure_code,
    failure_reason,
    reversal_reason_code,
    reversal_reason_text,
    external_source,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_payment_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_current_decision.id,
    v_payment_number,
    v_payment_reference,
    v_payer_reference,
    v_external_event_id,
    v_payment_status,
    'electronic_transfer',
    v_claim.currency_code,
    v_payment_amount,
    0,
    0,
    case when v_payment_status = 'scheduled' then v_event_at else null end,
    case when v_payment_status = 'processing' then v_event_at else null end,
    case when v_payment_status = 'received' then v_event_at else null end,
    case when v_payment_status = 'received' then coalesce(p_value_date, v_event_at::date) else null end,
    case when v_payment_status = 'failed' then v_event_at else null end,
    case when v_payment_status = 'reversed' then v_event_at else null end,
    case when v_payment_status = 'failed' then v_reason_code else null end,
    case when v_payment_status = 'failed' then v_reason_text else null end,
    case when v_payment_status = 'reversed' then v_reason_code else null end,
    case when v_payment_status = 'reversed' then v_reason_text else null end,
    v_external_source,
    v_metadata
      || jsonb_build_object(
        'operation',
        'record_claim_payment_settlement',
        'source_system',
        v_source_system,
        'correlation_id',
        p_correlation_id,
        'expected_version',
        p_expected_version,
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

  if v_payment_status = 'received' then
    v_settled_total := v_settled_total + v_payment_amount;
  end if;

  v_next_snapshot := case
    when v_payment_status in ('pending', 'scheduled', 'processing')
      then 'payment_pending'::public.claim_payment_state_domain
    when v_payment_status = 'failed'
      then 'payment_failed'::public.claim_payment_state_domain
    when v_payment_status = 'reversed'
      then 'reversed'::public.claim_payment_state_domain
    when v_settled_total = 0
      then 'not_paid'::public.claim_payment_state_domain
    when v_settled_total < v_approved_amount
      then 'partially_paid'::public.claim_payment_state_domain
    when v_settled_total = v_approved_amount
      then 'paid'::public.claim_payment_state_domain
    else 'partially_paid'::public.claim_payment_state_domain
  end;

  update public.claims c
  set payment_status = v_next_snapshot,
      total_paid_amount = v_settled_total,
      version = c.version + 1,
      state_updated_at = v_now,
      state_updated_by = v_actor_id,
      updated_at = v_now,
      updated_by = v_actor_id
  where c.id = p_claim_id;

  return query
  select
    p_claim_id,
    v_previous_snapshot,
    v_next_snapshot,
    v_claim.version + 1,
    v_payment_id,
    v_settled_total,
    v_now,
    false;
end;
$$;

revoke all on function public.record_claim_payment_settlement(
  uuid,
  integer,
  numeric,
  text,
  text,
  text,
  timestamptz,
  date,
  text,
  text,
  uuid,
  text,
  text,
  jsonb
) from public, anon;

grant execute on function public.record_claim_payment_settlement(
  uuid,
  integer,
  numeric,
  text,
  text,
  text,
  timestamptz,
  date,
  text,
  text,
  uuid,
  text,
  text,
  jsonb
) to authenticated, service_role;

revoke insert, update, delete on table public.claim_payments from authenticated;
revoke insert, update, delete on table public.claim_payment_allocations from authenticated;
revoke insert, update, delete on table public.claim_payment_reconciliations from authenticated;

do $$
declare
  v_columns text;
begin
  revoke update on public.claims from authenticated;

  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
  into v_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'claims'
    and column_name not in (
      'id',
      'organization_id',
      'clinic_id',
      'claim_number',
      'workflow_status',
      'decision_status',
      'payment_status',
      'version',
      'current_decision_id',
      'total_approved_amount',
      'total_paid_amount',
      'state_updated_at',
      'state_updated_by',
      'legacy_status_migration_state',
      'submitted_at',
      'closed_at',
      'deleted_at',
      'deleted_by',
      'created_at',
      'created_by'
    );

  if v_columns is null then
    raise exception 'No safe public.claims columns remain grantable for authenticated updates';
  end if;

  execute format(
    'grant update (%s) on public.claims to authenticated',
    v_columns
  );
end;
$$;

comment on function public.record_claim_payment_settlement(
  uuid,
  integer,
  numeric,
  text,
  text,
  text,
  timestamptz,
  date,
  text,
  text,
  uuid,
  text,
  text,
  jsonb
) is
  'Phase 4 Batch 5 controlled Claim payment settlement mutation. Derives actor from auth.uid(), validates tenant/clinic payment permission, enforces Claim versioning and payment amount rules, inserts authoritative payment evidence, and atomically updates only the split payment snapshot and paid total.';
