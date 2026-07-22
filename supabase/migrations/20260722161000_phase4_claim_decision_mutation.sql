-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 4: Controlled Claim Decision Mutation
-- Migration: 20260722161000_phase4_claim_decision_mutation.sql
-- =============================================================================

do $$
begin
  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_decisions') is null then
    raise exception 'Required table public.claim_decisions does not exist';
  end if;

  if to_regclass('public.claim_reviews') is null then
    raise exception 'Required table public.claim_reviews does not exist';
  end if;

  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception 'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;
end;
$$;

insert into public.permissions (
  permission_key,
  description,
  domain
)
values (
  'claim.decision.void',
  'Void the current authoritative claim decision through a controlled operation',
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
    "admin": ["claim.decision.void"],
    "system_admin": ["claim.decision.void"],
    "senior_claim_reviewer": ["claim.decision.void"]
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

alter table public.claim_decisions
  add column if not exists source_system text,
  add column if not exists external_event_id text,
  add column if not exists correlation_id uuid,
  add column if not exists payer_reference text;

update public.claim_decisions
set source_system = 'legacy'
where source_system is null;

alter table public.claim_decisions
  alter column source_system set default 'internal',
  alter column source_system set not null,
  add constraint claim_decisions_source_system_not_blank_chk
    check (length(btrim(source_system)) > 0),
  add constraint claim_decisions_external_event_id_not_blank_chk
    check (external_event_id is null or length(btrim(external_event_id)) > 0),
  add constraint claim_decisions_payer_reference_not_blank_chk
    check (payer_reference is null or length(btrim(payer_reference)) > 0);

create unique index if not exists claim_decisions_external_identity_uq
  on public.claim_decisions (
    organization_id,
    source_system,
    external_event_id
  )
  where external_event_id is not null;

alter table public.claim_decisions
  drop constraint if exists claim_decisions_final_fields_chk;

alter table public.claim_decisions
  add constraint claim_decisions_final_fields_chk
  check (
    decision_status <> 'final'
    or (
      (decision_outcome is not null or metadata ->> 'decision_snapshot' = 'voided')
      and decided_by is not null
      and decision_role_snapshot is not null
      and decided_at is not null
    )
  );

create or replace function public.record_claim_decision(
  p_claim_id uuid,
  p_target_decision_status public.claim_decision_state_domain,
  p_expected_version integer,
  p_reason_code text,
  p_reason_text text,
  p_approved_amount numeric default null,
  p_rejected_amount numeric default null,
  p_payer_reference text default null,
  p_decision_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  claim_id uuid,
  previous_decision_status public.claim_decision_state_domain,
  decision_status public.claim_decision_state_domain,
  version integer,
  decision_id uuid,
  current_decision_id uuid,
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
  v_existing_decision public.claim_decisions%rowtype;
  v_existing_snapshot public.claim_decision_state_domain;
  v_actor_id uuid := auth.uid();
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_reason_code text := nullif(btrim(p_reason_code), '');
  v_reason_text text := nullif(btrim(p_reason_text), '');
  v_payer_reference text := nullif(btrim(p_payer_reference), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_now timestamptz := now();
  v_decision_at timestamptz := coalesce(p_decision_at, now());
  v_created_at timestamptz;
  v_basis numeric(18,2);
  v_approved_amount numeric(18,2);
  v_rejected_amount numeric(18,2);
  v_decision_outcome text;
  v_previous_snapshot public.claim_decision_state_domain;
  v_required_permission text;
  v_next_decision_version integer;
  v_decision_id uuid := gen_random_uuid();
  v_review_id uuid;
  v_review_number integer;
begin
  if p_claim_id is null
    or p_target_decision_status is null
    or p_expected_version is null
    or v_source_system is null
    or jsonb_typeof(v_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim decision request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim decision is not authorized';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim decision requires an event identity';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.status,
         c.version,
         c.currency_code,
         c.total_claimed_amount,
         c.total_eligible_amount,
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
      message = 'Claim decision is not authorized';
  end if;

  v_previous_snapshot := coalesce(
    v_claim.decision_status,
    'not_decided'::public.claim_decision_state_domain
  );

  if v_claim.current_decision_id is not null then
    select *
    into v_current_decision
    from public.claim_decisions d
    where d.id = v_claim.current_decision_id
      and d.organization_id = v_claim.organization_id
      and d.clinic_id = v_claim.clinic_id
      and d.claim_id = v_claim.id
    for update;

    if not found then
      raise exception using
        errcode = '23503',
        message = 'Current claim decision is invalid';
    end if;

    if v_current_decision.decision_status <> 'final' then
      raise exception using
        errcode = '23514',
        message = 'Current claim decision is invalid';
    end if;
  end if;

  if v_external_event_id is not null then
    select *
    into v_existing_decision
    from public.claim_decisions d
    where d.organization_id = v_claim.organization_id
      and d.source_system = v_source_system
      and d.external_event_id = v_external_event_id
    for update;

    if found then
      v_existing_snapshot := coalesce(
        nullif(v_existing_decision.metadata ->> 'decision_snapshot', '')::public.claim_decision_state_domain,
        case v_existing_decision.decision_outcome
          when 'approved' then 'approved'::public.claim_decision_state_domain
          when 'partially_approved' then 'partially_approved'::public.claim_decision_state_domain
          when 'rejected' then 'rejected'::public.claim_decision_state_domain
          when 'request_information' then 'request_information'::public.claim_decision_state_domain
          else null
        end
      );

      if v_existing_decision.claim_id = p_claim_id
        and v_existing_snapshot::text = p_target_decision_status::text
        and v_existing_decision.approved_amount is not distinct from round(p_approved_amount, 2)
        and v_existing_decision.rejected_amount is not distinct from round(p_rejected_amount, 2)
        and v_existing_decision.currency_code = v_claim.currency_code
        and coalesce(nullif(btrim(v_existing_decision.decision_reason_code), ''), '') = coalesce(v_reason_code, '')
        and coalesce(nullif(btrim(v_existing_decision.decision_reason_text), ''), '') = coalesce(v_reason_text, '')
        and coalesce(nullif(btrim(v_existing_decision.payer_reference), ''), '') = coalesce(v_payer_reference, '')
        and v_existing_decision.decided_at = v_decision_at
        and v_existing_decision.source_system = v_source_system then
        return query
        select
          p_claim_id,
          v_previous_snapshot,
          v_existing_snapshot,
          v_claim.version,
          v_existing_decision.id,
          v_claim.current_decision_id,
          v_claim.state_updated_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim decision event identity conflicts';
    end if;
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim decision version conflict';
  end if;

  if p_target_decision_status::text = v_previous_snapshot::text then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim decision transition';
  end if;

  if v_previous_snapshot::text = 'not_decided'
    and p_target_decision_status::text = 'voided' then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim decision transition';
  end if;

  if p_target_decision_status::text <> 'voided'
    and v_claim.workflow_status::text not in ('submitted', 'under_review') then
    raise exception using
      errcode = '23514',
      message = 'Claim workflow is not eligible for decision mutation';
  end if;

  if p_target_decision_status::text = 'voided'
    and v_claim.current_decision_id is null then
    raise exception using
      errcode = '23514',
      message = 'Void requires a current claim decision';
  end if;

  v_required_permission :=
    case
      when p_target_decision_status::text = 'voided'
        then 'claim.decision.void'
      when v_claim.current_decision_id is not null
        then 'claim.decision.supersede'
      else 'claim.decide'
    end;

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
      message = 'Claim decision is not authorized';
  end if;

  if p_target_decision_status::text in (
    'partially_approved',
    'rejected',
    'request_information',
    'voided'
  )
  or (
    p_target_decision_status::text = 'approved'
    and v_previous_snapshot::text not in ('not_decided', 'request_information')
  ) then
    if v_reason_code is null or v_reason_text is null then
      raise exception using
        errcode = '23514',
        message = 'Claim decision requires a reason';
    end if;
  end if;

  if v_reason_code is not null
    and not exists (
      select 1
      from public.decision_reason_codes r
      where r.code = v_reason_code
    ) then
    raise exception using
      errcode = '23503',
      message = 'Claim decision reason is invalid';
  end if;

  v_basis := round(
    coalesce(v_claim.total_eligible_amount, v_claim.total_claimed_amount),
    2
  );

  if v_basis < 0 then
    raise exception using
      errcode = '23514',
      message = 'Claim decision amount basis is invalid';
  end if;

  v_approved_amount := round(p_approved_amount, 2);
  v_rejected_amount := round(p_rejected_amount, 2);

  if p_target_decision_status::text = 'approved' then
    if v_approved_amount is null
      or v_rejected_amount is null
      or v_approved_amount <> v_basis
      or v_rejected_amount <> 0 then
      raise exception using
        errcode = '23514',
        message = 'Claim decision amounts are invalid';
    end if;
  elsif p_target_decision_status::text = 'partially_approved' then
    if v_approved_amount is null
      or v_rejected_amount is null
      or v_approved_amount <= 0
      or v_rejected_amount <= 0
      or v_approved_amount + v_rejected_amount <> v_basis then
      raise exception using
        errcode = '23514',
        message = 'Claim decision amounts are invalid';
    end if;
  elsif p_target_decision_status::text = 'rejected' then
    if v_approved_amount is null
      or v_rejected_amount is null
      or v_approved_amount <> 0
      or v_rejected_amount <> v_basis then
      raise exception using
        errcode = '23514',
        message = 'Claim decision amounts are invalid';
    end if;
  elsif p_target_decision_status::text in ('request_information', 'voided') then
    if p_approved_amount is not null or p_rejected_amount is not null then
      raise exception using
        errcode = '23514',
        message = 'Claim decision amounts are invalid';
    end if;
  end if;

  if coalesce(v_approved_amount, 0) < 0
    or coalesce(v_rejected_amount, 0) < 0
    or coalesce(v_approved_amount, 0) > v_basis then
    raise exception using
      errcode = '23514',
      message = 'Claim decision amounts are invalid';
  end if;

  v_decision_outcome :=
    case p_target_decision_status::text
      when 'approved' then 'approved'
      when 'partially_approved' then 'partially_approved'
      when 'rejected' then 'rejected'
      when 'request_information' then 'request_information'
      when 'voided' then null
      else null
    end;

  select coalesce(max(d.decision_version), 0) + 1
  into v_next_decision_version
  from public.claim_decisions d
  where d.claim_id = p_claim_id;

  select coalesce(max(r.review_number), 0) + 1
  into v_review_number
  from public.claim_reviews r
  where r.claim_id = p_claim_id;

  v_created_at := least(v_now, v_decision_at);
  v_review_id := gen_random_uuid();

  insert into public.claim_reviews (
    id,
    organization_id,
    clinic_id,
    claim_id,
    review_number,
    review_type,
    review_status,
    review_priority,
    trigger_source,
    assigned_to,
    assigned_role_snapshot,
    assigned_at,
    started_at,
    completed_at,
    review_summary,
    completion_reason_code,
    completion_reason_text,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_review_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_review_number,
    'coverage',
    'completed',
    'normal',
    case when v_source_system = 'internal' then 'manual' else 'import' end,
    v_actor_id,
    'claim_decision_adjudicator',
    v_created_at,
    v_created_at,
    v_now,
    coalesce(v_reason_text, 'Claim decision recorded'),
    v_reason_code,
    v_reason_text,
    jsonb_build_object(
      'operation',
      'record_claim_decision',
      'source_system',
      v_source_system
    ),
    v_created_at,
    v_actor_id,
    v_now,
    v_actor_id
  );

  if v_claim.current_decision_id is not null then
    update public.claim_decisions
    set decision_status = 'superseded',
        updated_at = v_now,
        updated_by = v_actor_id
    where id = v_claim.current_decision_id;
  end if;

  insert into public.claim_decisions (
    id,
    organization_id,
    clinic_id,
    claim_id,
    claim_review_id,
    decision_version,
    decision_status,
    decision_outcome,
    currency_code,
    submitted_amount,
    approved_amount,
    rejected_amount,
    patient_responsibility_amount,
    payer_responsibility_amount,
    decision_reason_code,
    decision_reason_text,
    decision_summary,
    decided_by,
    decision_role_snapshot,
    decided_at,
    supersedes_decision_id,
    metadata,
    source_system,
    external_event_id,
    correlation_id,
    payer_reference,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_decision_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_review_id,
    v_next_decision_version,
    'final',
    v_decision_outcome,
    v_claim.currency_code,
    v_basis,
    v_approved_amount,
    v_rejected_amount,
    case
      when p_target_decision_status::text in ('approved', 'partially_approved') then 0
      when p_target_decision_status::text = 'rejected' then 0
      else null
    end,
    case
      when p_target_decision_status::text in ('approved', 'partially_approved') then v_approved_amount
      when p_target_decision_status::text = 'rejected' then 0
      else null
    end,
    v_reason_code,
    v_reason_text,
    v_reason_text,
    v_actor_id,
    'claim_decision_adjudicator',
    v_decision_at,
    v_claim.current_decision_id,
    v_metadata
      || jsonb_build_object(
        'operation',
        'record_claim_decision',
        'decision_snapshot',
        p_target_decision_status::text,
        'expected_version',
        p_expected_version
      ),
    v_source_system,
    v_external_event_id,
    p_correlation_id,
    v_payer_reference,
    v_created_at,
    v_actor_id,
    v_now,
    v_actor_id
  );

  update public.claims c
  set current_decision_id = v_decision_id,
      decision_status = p_target_decision_status,
      total_approved_amount = case
        when p_target_decision_status::text in (
          'approved',
          'partially_approved',
          'rejected'
        )
          then v_approved_amount
        else c.total_approved_amount
      end,
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
    p_target_decision_status,
    v_claim.version + 1,
    v_decision_id,
    v_decision_id,
    v_now,
    false;
end;
$$;

revoke all on function public.record_claim_decision(
  uuid,
  public.claim_decision_state_domain,
  integer,
  text,
  text,
  numeric,
  numeric,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) from public, anon;

grant execute on function public.record_claim_decision(
  uuid,
  public.claim_decision_state_domain,
  integer,
  text,
  text,
  numeric,
  numeric,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) to authenticated, service_role;

revoke insert, update, delete on table public.claim_decisions from authenticated;

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

comment on function public.record_claim_decision(
  uuid,
  public.claim_decision_state_domain,
  integer,
  text,
  text,
  numeric,
  numeric,
  text,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) is
  'Phase 4 Batch 4 controlled Claim decision mutation. Derives actor from auth.uid(), validates tenant/clinic permission, enforces Claim versioning and amount rules, inserts authoritative decision evidence, and atomically updates the split decision snapshot.';
