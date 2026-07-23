-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 6: Formal Claim Appeal Entity and Controlled Mutations
-- Migration: 20260722163000_phase4_claim_appeals.sql
-- =============================================================================

do $$
begin
  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_workflow_events') is null then
    raise exception 'Required table public.claim_workflow_events does not exist';
  end if;

  if to_regclass('public.claim_decisions') is null then
    raise exception 'Required table public.claim_decisions does not exist';
  end if;

  if to_regprocedure('public.transition_claim_workflow(uuid, public.claim_workflow_state_domain, integer, text, text, text, text, uuid, timestamptz)') is null then
    raise exception 'Required function public.transition_claim_workflow does not exist';
  end if;

  if to_regprocedure('public.record_claim_decision(uuid, public.claim_decision_state_domain, integer, text, text, numeric, numeric, text, timestamptz, text, text, uuid, jsonb)') is null then
    raise exception 'Required function public.record_claim_decision does not exist';
  end if;

  if to_regprocedure('public.record_claim_payment_settlement(uuid, integer, numeric, text, text, text, timestamptz, date, text, text, uuid, text, text, jsonb)') is null then
    raise exception 'Required function public.record_claim_payment_settlement does not exist';
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
values
  ('claim.appeal.view', 'Read formal claim appeal records within authorized tenant and clinic scope', 'claim'),
  ('claim.appeal.create', 'Create draft formal claim appeal records through approved workflows', 'claim'),
  ('claim.appeal.submit', 'Submit formal claim appeals through a controlled operation', 'claim'),
  ('claim.appeal.decide', 'Resolve formal claim appeals through a controlled operation', 'claim')
on conflict (permission_key) do update
set
  description = excluded.description,
  domain = excluded.domain;

do $$
declare
  v_role text;
  v_permission text;
  v_mapping jsonb := '{
    "admin": ["claim.appeal.view", "claim.appeal.create", "claim.appeal.submit", "claim.appeal.decide"],
    "system_admin": ["claim.appeal.view", "claim.appeal.create", "claim.appeal.submit", "claim.appeal.decide"],
    "claim_reviewer": ["claim.appeal.view", "claim.appeal.create", "claim.appeal.submit"],
    "senior_claim_reviewer": ["claim.appeal.view", "claim.appeal.create", "claim.appeal.submit", "claim.appeal.decide"],
    "compliance_officer": ["claim.appeal.view"]
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
    where lower(replace(r.name, ' ', '_')) = v_role
       or lower(coalesce(to_jsonb(r) ->> 'role_code', '')) = v_role
       or lower(coalesce(to_jsonb(r) ->> 'role_key', '')) = v_role
    on conflict (role_id, permission_id) do nothing;
  end loop;
end;
$$;

create table if not exists public.claim_appeals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  appeal_sequence integer not null,
  appeal_status text not null default 'submitted',
  appeal_reason_code text not null,
  appeal_reason_text text,
  submitted_by uuid not null,
  submitted_at timestamptz not null default now(),
  deadline_at timestamptz,
  owner_user_id uuid,
  payer_reference text,
  source_system text not null default 'internal',
  external_event_id text,
  correlation_id uuid,
  evidence_package_id uuid,
  outcome_decision_id uuid,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  deleted_at timestamptz,
  constraint claim_appeals_sequence_positive_chk
    check (appeal_sequence > 0),
  constraint claim_appeals_status_chk
    check (
      appeal_status in (
        'draft',
        'submitted',
        'under_review',
        'request_information',
        'approved',
        'partially_approved',
        'rejected',
        'withdrawn',
        'closed'
      )
    ),
  constraint claim_appeals_reason_code_not_blank_chk
    check (length(btrim(appeal_reason_code)) > 0),
  constraint claim_appeals_reason_text_not_blank_chk
    check (appeal_reason_text is null or length(btrim(appeal_reason_text)) > 0),
  constraint claim_appeals_source_system_not_blank_chk
    check (length(btrim(source_system)) > 0),
  constraint claim_appeals_external_event_id_not_blank_chk
    check (external_event_id is null or length(btrim(external_event_id)) > 0),
  constraint claim_appeals_payer_reference_not_blank_chk
    check (payer_reference is null or length(btrim(payer_reference)) > 0),
  constraint claim_appeals_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),
  constraint claim_appeals_resolution_fields_chk
    check (
      (appeal_status not in ('approved', 'partially_approved', 'rejected', 'withdrawn', 'closed') and resolved_at is null)
      or (appeal_status in ('approved', 'partially_approved', 'rejected', 'withdrawn', 'closed') and resolved_at is not null)
    ),
  constraint claim_appeals_claim_tenant_fk
    foreign key (organization_id, clinic_id, claim_id)
    references public.claims (organization_id, clinic_id, id)
    on delete restrict,
  constraint claim_appeals_submitted_by_fk
    foreign key (submitted_by) references public.user_profiles (id),
  constraint claim_appeals_owner_user_fk
    foreign key (owner_user_id) references public.user_profiles (id),
  constraint claim_appeals_created_by_fk
    foreign key (created_by) references public.user_profiles (id),
  constraint claim_appeals_updated_by_fk
    foreign key (updated_by) references public.user_profiles (id),
  constraint claim_appeals_outcome_decision_tenant_fk
    foreign key (organization_id, clinic_id, claim_id, outcome_decision_id)
    references public.claim_decisions (organization_id, clinic_id, claim_id, id)
    on delete restrict
);

create unique index if not exists claim_appeals_claim_sequence_uq
  on public.claim_appeals (
    organization_id,
    clinic_id,
    claim_id,
    appeal_sequence
  );

create unique index if not exists claim_appeals_external_identity_uq
  on public.claim_appeals (
    organization_id,
    source_system,
    external_event_id
  )
  where external_event_id is not null;

create index if not exists claim_appeals_status_queue_idx
  on public.claim_appeals (
    organization_id,
    clinic_id,
    appeal_status,
    deleted_at
  );

create index if not exists claim_appeals_owner_queue_idx
  on public.claim_appeals (
    organization_id,
    owner_user_id,
    appeal_status
  )
  where owner_user_id is not null;

create index if not exists claim_appeals_deadline_idx
  on public.claim_appeals (
    organization_id,
    deadline_at
  )
  where deadline_at is not null;

create index if not exists claim_appeals_outcome_decision_idx
  on public.claim_appeals (outcome_decision_id)
  where outcome_decision_id is not null;

alter table public.claim_appeals enable row level security;

drop policy if exists claim_appeals_select_authorized
  on public.claim_appeals;

create policy claim_appeals_select_authorized
on public.claim_appeals
for select
to authenticated
using (
  public.has_permission(
    'claim.appeal.view',
    claim_appeals.organization_id,
    claim_appeals.clinic_id
  )
  or public.has_permission(
    'claim.read',
    claim_appeals.organization_id,
    claim_appeals.clinic_id
  )
);

revoke all on table public.claim_appeals from anon;
revoke all on table public.claim_appeals from authenticated;
grant select on table public.claim_appeals to authenticated;
grant all on table public.claim_appeals to service_role;

create or replace function public.submit_claim_appeal(
  p_claim_id uuid,
  p_expected_version integer,
  p_appeal_reason_code text,
  p_appeal_reason_text text default null,
  p_deadline_at timestamptz default null,
  p_owner_user_id uuid default null,
  p_payer_reference text default null,
  p_evidence_package_id uuid default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  claim_id uuid,
  appeal_id uuid,
  appeal_sequence integer,
  previous_workflow_status public.claim_workflow_state_domain,
  workflow_status public.claim_workflow_state_domain,
  version integer,
  workflow_event_id uuid,
  state_updated_at timestamptz,
  idempotent_replay boolean
)
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_claim record;
  v_existing_appeal public.claim_appeals%rowtype;
  v_actor_id uuid := auth.uid();
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_reason_code text := nullif(btrim(p_appeal_reason_code), '');
  v_reason_text text := nullif(btrim(p_appeal_reason_text), '');
  v_payer_reference text := nullif(btrim(p_payer_reference), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_now timestamptz := now();
  v_next_sequence integer;
  v_appeal_id uuid := gen_random_uuid();
  v_event_id uuid := gen_random_uuid();
  v_workflow_changed boolean := false;
begin
  if p_claim_id is null
    or p_expected_version is null
    or v_source_system is null
    or v_reason_code is null
    or jsonb_typeof(v_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim appeal request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal is not authorized';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim appeal requires an event identity';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.status,
         c.version,
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
      message = 'Claim appeal is not authorized';
  end if;

  if v_external_event_id is not null then
    select *
    into v_existing_appeal
    from public.claim_appeals a
    where a.organization_id = v_claim.organization_id
      and a.source_system = v_source_system
      and a.external_event_id = v_external_event_id
    for update;

    if found then
      if v_existing_appeal.claim_id = p_claim_id
        and v_existing_appeal.appeal_reason_code = v_reason_code
        and coalesce(nullif(btrim(v_existing_appeal.appeal_reason_text), ''), '') = coalesce(v_reason_text, '')
        and v_existing_appeal.deadline_at is not distinct from p_deadline_at
        and v_existing_appeal.owner_user_id is not distinct from p_owner_user_id
        and coalesce(nullif(btrim(v_existing_appeal.payer_reference), ''), '') = coalesce(v_payer_reference, '')
        and v_existing_appeal.evidence_package_id is not distinct from p_evidence_package_id
        and v_existing_appeal.metadata = v_metadata then
        return query
        select
          v_existing_appeal.claim_id,
          v_existing_appeal.id,
          v_existing_appeal.appeal_sequence,
          v_claim.workflow_status,
          v_claim.workflow_status,
          v_claim.version,
          null::uuid,
          v_claim.state_updated_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim appeal event identity conflicts';
    end if;
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim appeal version conflict';
  end if;

  if v_claim.workflow_status::text not in ('under_review', 'appealed') then
    raise exception using
      errcode = '23514',
      message = 'Claim workflow is not eligible for appeal';
  end if;

  if not coalesce(
    public.has_permission(
      'claim.appeal.submit',
      v_claim.organization_id,
      v_claim.clinic_id
    ),
    false
  ) then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal is not authorized';
  end if;

  if p_owner_user_id is not null
    and not exists (
      select 1
      from public.user_profiles p
      where p.id = p_owner_user_id
        and p.organization_id = v_claim.organization_id
    ) then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal is not authorized';
  end if;

  if p_evidence_package_id is not null
    and not exists (
      select 1
      from public.evidence_packages e
      where e.id = p_evidence_package_id
        and e.organization_id = v_claim.organization_id
        and e.clinic_id = v_claim.clinic_id
    ) then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal is not authorized';
  end if;

  select coalesce(max(a.appeal_sequence), 0) + 1
  into v_next_sequence
  from public.claim_appeals a
  where a.claim_id = p_claim_id;

  v_workflow_changed := v_claim.workflow_status::text <> 'appealed';

  insert into public.claim_appeals (
    id,
    organization_id,
    clinic_id,
    claim_id,
    appeal_sequence,
    appeal_status,
    appeal_reason_code,
    appeal_reason_text,
    submitted_by,
    submitted_at,
    deadline_at,
    owner_user_id,
    payer_reference,
    source_system,
    external_event_id,
    correlation_id,
    evidence_package_id,
    metadata,
    created_at,
    created_by,
    updated_at,
    updated_by
  )
  values (
    v_appeal_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_next_sequence,
    'submitted',
    v_reason_code,
    v_reason_text,
    v_actor_id,
    v_now,
    p_deadline_at,
    p_owner_user_id,
    v_payer_reference,
    v_source_system,
    v_external_event_id,
    p_correlation_id,
    p_evidence_package_id,
    v_metadata || jsonb_build_object(
      'operation',
      'submit_claim_appeal',
      'expected_version',
      p_expected_version
    ),
    v_now,
    v_actor_id,
    v_now,
    v_actor_id
  );

  update public.claims c
  set workflow_status = 'appealed',
      version = c.version + 1,
      state_updated_at = v_now,
      state_updated_by = v_actor_id,
      updated_at = v_now,
      updated_by = v_actor_id
  where c.id = p_claim_id;

  if v_workflow_changed then
    insert into public.claim_workflow_events (
      id,
      organization_id,
      clinic_id,
      claim_id,
      from_workflow_status,
      to_workflow_status,
      sequence_number,
      claim_version_before,
      claim_version_after,
      actor_type,
      actor_user_id,
      actor_reference,
      source_system,
      external_event_id,
      correlation_id,
      reason_code,
      reason_text,
      occurred_at,
      received_at,
      recorded_at,
      metadata
    )
    select
      v_event_id,
      v_claim.organization_id,
      v_claim.clinic_id,
      p_claim_id,
      v_claim.workflow_status,
      'appealed'::public.claim_workflow_state_domain,
      coalesce(max(e.sequence_number), 0) + 1,
      v_claim.version,
      v_claim.version + 1,
      case when v_source_system = 'internal' then 'human' else 'integration' end,
      case when v_source_system = 'internal' then v_actor_id else null end,
      case when v_source_system = 'internal' then null else v_actor_id::text end,
      v_source_system,
      case
        when v_external_event_id is null then null
        else 'appeal:' || v_external_event_id
      end,
      p_correlation_id::text,
      v_reason_code,
      v_reason_text,
      v_now,
      case when v_source_system = 'internal' then null else v_now end,
      v_now,
      jsonb_build_object(
        'operation',
        'submit_claim_appeal',
        'appeal_id',
        v_appeal_id,
        'expected_version',
        p_expected_version
      )
    from public.claim_workflow_events e
    where e.claim_id = p_claim_id;
  else
    v_event_id := null;
  end if;

  return query
  select
    p_claim_id,
    v_appeal_id,
    v_next_sequence,
    v_claim.workflow_status,
    'appealed'::public.claim_workflow_state_domain,
    v_claim.version + 1,
    v_event_id,
    v_now,
    false;
end;
$$;

create or replace function public.resolve_claim_appeal(
  p_appeal_id uuid,
  p_expected_version integer,
  p_target_appeal_status text,
  p_reason_code text,
  p_reason_text text default null,
  p_outcome_decision_id uuid default null,
  p_resolved_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  claim_id uuid,
  appeal_id uuid,
  appeal_status text,
  workflow_status public.claim_workflow_state_domain,
  version integer,
  state_updated_at timestamptz,
  idempotent_replay boolean
)
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_claim record;
  v_appeal public.claim_appeals%rowtype;
  v_existing_appeal public.claim_appeals%rowtype;
  v_actor_id uuid := auth.uid();
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_target_status text := nullif(btrim(p_target_appeal_status), '');
  v_reason_code text := nullif(btrim(p_reason_code), '');
  v_reason_text text := nullif(btrim(p_reason_text), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_now timestamptz := now();
  v_resolved_at timestamptz := coalesce(p_resolved_at, now());
begin
  if p_appeal_id is null
    or p_expected_version is null
    or v_target_status is null
    or v_reason_code is null
    or v_source_system is null
    or jsonb_typeof(v_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim appeal resolution request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal resolution is not authorized';
  end if;

  if v_target_status not in ('under_review', 'request_information', 'approved', 'partially_approved', 'rejected', 'withdrawn', 'closed') then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim appeal status';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim appeal resolution requires an event identity';
  end if;

  select a.*
  into v_appeal
  from public.claim_appeals a
  where a.id = p_appeal_id
    and a.deleted_at is null
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal resolution is not authorized';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.version,
         c.state_updated_at,
         c.deleted_at
  into v_claim
  from public.claims c
  where c.id = v_appeal.claim_id
    and c.organization_id = v_appeal.organization_id
    and c.clinic_id = v_appeal.clinic_id
    and c.deleted_at is null
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal resolution is not authorized';
  end if;

  if v_external_event_id is not null then
    select *
    into v_existing_appeal
    from public.claim_appeals a
    where a.organization_id = v_claim.organization_id
      and a.source_system = v_source_system
      and a.external_event_id = v_external_event_id
    for update;

    if found then
      if v_existing_appeal.id = p_appeal_id
        and v_existing_appeal.appeal_status = v_target_status
        and v_existing_appeal.outcome_decision_id is not distinct from p_outcome_decision_id
        and coalesce(nullif(btrim(v_existing_appeal.metadata ->> 'resolution_reason_code'), ''), '') = v_reason_code
        and coalesce(nullif(btrim(v_existing_appeal.metadata ->> 'resolution_reason_text'), ''), '') = coalesce(v_reason_text, '') then
        return query
        select
          v_claim.id,
          p_appeal_id,
          v_existing_appeal.appeal_status,
          v_claim.workflow_status,
          v_claim.version,
          v_claim.state_updated_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim appeal event identity conflicts';
    end if;
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim appeal version conflict';
  end if;

  if v_appeal.appeal_status in ('approved', 'partially_approved', 'rejected', 'withdrawn', 'closed') then
    raise exception using
      errcode = '23514',
      message = 'Claim appeal is already resolved';
  end if;

  if not coalesce(
    public.has_permission(
      'claim.appeal.decide',
      v_claim.organization_id,
      v_claim.clinic_id
    ),
    false
  ) then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal resolution is not authorized';
  end if;

  if p_outcome_decision_id is not null
    and not exists (
      select 1
      from public.claim_decisions d
      where d.id = p_outcome_decision_id
        and d.organization_id = v_claim.organization_id
        and d.clinic_id = v_claim.clinic_id
        and d.claim_id = v_claim.id
        and d.decision_status = 'final'
    ) then
    raise exception using
      errcode = '42501',
      message = 'Claim appeal resolution is not authorized';
  end if;

  update public.claim_appeals a
  set appeal_status = v_target_status,
      outcome_decision_id = p_outcome_decision_id,
      resolved_at = case
        when v_target_status in ('approved', 'partially_approved', 'rejected', 'withdrawn', 'closed')
          then v_resolved_at
        else null
      end,
      source_system = v_source_system,
      external_event_id = coalesce(v_external_event_id, a.external_event_id),
      correlation_id = p_correlation_id,
      metadata = v_metadata || jsonb_build_object(
        'operation',
        'resolve_claim_appeal',
        'expected_version',
        p_expected_version,
        'resolution_reason_code',
        v_reason_code,
        'resolution_reason_text',
        v_reason_text
      ),
      updated_at = v_now,
      updated_by = v_actor_id
  where a.id = p_appeal_id;

  update public.claims c
  set version = c.version + 1,
      state_updated_at = v_now,
      state_updated_by = v_actor_id,
      updated_at = v_now,
      updated_by = v_actor_id
  where c.id = v_claim.id;

  return query
  select
    v_claim.id,
    p_appeal_id,
    v_target_status,
    v_claim.workflow_status,
    v_claim.version + 1,
    v_now,
    false;
end;
$$;

revoke all on function public.submit_claim_appeal(
  uuid,
  integer,
  text,
  text,
  timestamptz,
  uuid,
  text,
  uuid,
  text,
  text,
  uuid,
  jsonb
) from public, anon;

grant execute on function public.submit_claim_appeal(
  uuid,
  integer,
  text,
  text,
  timestamptz,
  uuid,
  text,
  uuid,
  text,
  text,
  uuid,
  jsonb
) to authenticated, service_role;

revoke all on function public.resolve_claim_appeal(
  uuid,
  integer,
  text,
  text,
  text,
  uuid,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) from public, anon;

grant execute on function public.resolve_claim_appeal(
  uuid,
  integer,
  text,
  text,
  text,
  uuid,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) to authenticated, service_role;

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
      'total_paid_amount',
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

comment on table public.claim_appeals is
  'Phase 4 Batch 6 formal Claim appeal source of truth. Workflow_status = appealed remains only an operational queue summary.';

comment on function public.submit_claim_appeal(
  uuid,
  integer,
  text,
  text,
  timestamptz,
  uuid,
  text,
  uuid,
  text,
  text,
  uuid,
  jsonb
) is
  'Phase 4 Batch 6 controlled appeal submit mutation. Derives actor from auth.uid(), locks the Claim, validates tenant/clinic permission and version, creates appeal evidence, writes workflow evidence when needed, and preserves decision/payment authority.';

comment on function public.resolve_claim_appeal(
  uuid,
  integer,
  text,
  text,
  text,
  uuid,
  timestamptz,
  text,
  text,
  uuid,
  jsonb
) is
  'Phase 4 Batch 6 controlled appeal resolve mutation. Derives actor from auth.uid(), locks Appeal and Claim, validates tenant/clinic permission and version, links optional same-Claim decision evidence, and preserves decision/payment authority.';
