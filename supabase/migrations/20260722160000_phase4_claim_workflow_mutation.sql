-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 3: Controlled Claim Workflow Mutation
-- Migration: 20260722160000_phase4_claim_workflow_mutation.sql
-- =============================================================================

do $$
begin
  if to_regclass('public.claims') is null then
    raise exception 'Required table public.claims does not exist';
  end if;

  if to_regclass('public.claim_workflow_events') is null then
    raise exception 'Required table public.claim_workflow_events does not exist';
  end if;

  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception 'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;
end;
$$;

create or replace function public.transition_claim_workflow(
  p_claim_id uuid,
  p_target_status public.claim_workflow_state_domain,
  p_expected_version integer,
  p_reason_code text,
  p_reason_text text default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_occurred_at timestamptz default null
)
returns table (
  claim_id uuid,
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
  v_existing_event record;
  v_actor_id uuid := auth.uid();
  v_source_system text := nullif(btrim(coalesce(p_source_system, 'internal')), '');
  v_reason_code text := nullif(btrim(p_reason_code), '');
  v_reason_text text := nullif(btrim(p_reason_text), '');
  v_external_event_id text := nullif(btrim(p_external_event_id), '');
  v_required_permission text;
  v_requires_reason boolean := false;
  v_now timestamptz := now();
  v_occurred_at timestamptz := coalesce(p_occurred_at, now());
  v_source_status_text text;
  v_target_status_text text := p_target_status::text;
  v_next_sequence integer;
  v_event_id uuid := gen_random_uuid();
begin
  if p_claim_id is null
    or p_target_status is null
    or p_expected_version is null
    or v_source_system is null then
    raise exception using
      errcode = '22023',
      message = 'Invalid claim workflow transition request';
  end if;

  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'Claim workflow transition is not authorized';
  end if;

  if v_source_system <> 'internal' and v_external_event_id is null then
    raise exception using
      errcode = '22023',
      message = 'External claim workflow transition requires an event identity';
  end if;

  select c.id,
         c.organization_id,
         c.clinic_id,
         c.workflow_status,
         c.decision_status,
         c.payment_status,
         c.status,
         c.version,
         c.submitted_at,
         c.closed_at,
         c.deleted_at
  into v_claim
  from public.claims c
  where c.id = p_claim_id
    and c.deleted_at is null
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Claim workflow transition is not authorized';
  end if;

  if v_claim.workflow_status is null then
    raise exception using
      errcode = '23514',
      message = 'Claim workflow transition source state is not initialized';
  end if;

  v_source_status_text := v_claim.workflow_status::text;

  if v_external_event_id is not null then
    select e.*
    into v_existing_event
    from public.claim_workflow_events e
    where e.organization_id = v_claim.organization_id
      and e.source_system = v_source_system
      and e.external_event_id = v_external_event_id
    for update;

    if found then
      if v_existing_event.claim_id = p_claim_id
        and v_existing_event.to_workflow_status::text = p_target_status::text
        and v_existing_event.claim_version_before = p_expected_version
        and coalesce(nullif(btrim(v_existing_event.reason_code), ''), '') = coalesce(v_reason_code, '')
        and coalesce(nullif(btrim(v_existing_event.reason_text), ''), '') = coalesce(v_reason_text, '')
        and (p_occurred_at is null or v_existing_event.occurred_at = p_occurred_at) then
        return query
        select
          v_existing_event.claim_id,
          v_existing_event.from_workflow_status,
          v_existing_event.to_workflow_status,
          v_existing_event.claim_version_after,
          v_existing_event.id,
          v_existing_event.recorded_at,
          true;
        return;
      end if;

      raise exception using
        errcode = '23505',
        message = 'Claim workflow transition event identity conflicts';
    end if;
  end if;

  if v_source_status_text = v_target_status_text then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim workflow transition';
  end if;

  if v_source_status_text = 'cancelled' then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim workflow transition';
  end if;

  v_required_permission :=
    case
      when v_source_status_text = 'draft'
        and v_target_status_text = 'collecting_data'
        then 'claim.update'
      when v_source_status_text = 'collecting_data'
        and v_target_status_text = 'validation_pending'
        then 'claim.submit'
      when v_source_status_text = 'validation_pending'
        and v_target_status_text in ('needs_review', 'ready_to_submit')
        then 'claim.review'
      when v_source_status_text = 'needs_review'
        and v_target_status_text = 'validation_pending'
        then 'claim.review'
      when v_source_status_text = 'ready_to_submit'
        and v_target_status_text = 'submitted'
        then 'claim.submit'
      when v_source_status_text = 'submitted'
        and v_target_status_text = 'under_review'
        then 'claim.review'
      when v_source_status_text = 'under_review'
        and v_target_status_text in ('appealed', 'closed')
        then 'claim.review'
      when v_source_status_text = 'appealed'
        and v_target_status_text = 'under_review'
        then 'claim.review'
      when v_source_status_text = 'closed'
        and v_target_status_text = 'needs_review'
        then 'claim.reopen'
      when v_source_status_text <> 'cancelled'
        and v_target_status_text = 'cancelled'
        then 'claim.cancel'
      else null
    end;

  v_requires_reason :=
    (
      v_target_status_text in ('needs_review', 'appealed', 'closed', 'cancelled')
      or v_source_status_text in ('needs_review', 'appealed', 'closed')
    );

  if v_required_permission is null then
    raise exception using
      errcode = '23514',
      message = 'Invalid claim workflow transition';
  end if;

  if v_requires_reason and (v_reason_code is null or v_reason_text is null) then
    raise exception using
      errcode = '23514',
      message = 'Claim workflow transition requires a reason';
  end if;

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
      message = 'Claim workflow transition is not authorized';
  end if;

  if v_claim.version <> p_expected_version then
    raise exception using
      errcode = '40001',
      message = 'Claim workflow version conflict';
  end if;

  select coalesce(max(e.sequence_number), 0) + 1
  into v_next_sequence
  from public.claim_workflow_events e
  where e.claim_id = p_claim_id;

  update public.claims c
  set workflow_status = p_target_status,
      version = c.version + 1,
      state_updated_at = v_now,
      state_updated_by = v_actor_id,
      submitted_at = case
        when v_target_status_text = 'submitted'
          then coalesce(c.submitted_at, v_now)
        else c.submitted_at
      end,
      closed_at = case
        when v_target_status_text = 'closed'
          then coalesce(c.closed_at, v_now)
        else c.closed_at
      end,
      updated_at = v_now,
      updated_by = v_actor_id
  where c.id = p_claim_id;

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
  values (
    v_event_id,
    v_claim.organization_id,
    v_claim.clinic_id,
    p_claim_id,
    v_claim.workflow_status,
    p_target_status,
    v_next_sequence,
    v_claim.version,
    v_claim.version + 1,
    case when v_source_system = 'internal' then 'human' else 'integration' end,
    case when v_source_system = 'internal' then v_actor_id else null end,
    case when v_source_system = 'internal' then null else v_actor_id::text end,
    v_source_system,
    v_external_event_id,
    p_correlation_id::text,
    v_reason_code,
    v_reason_text,
    v_occurred_at,
    case when v_source_system = 'internal' then null else v_now end,
    v_now,
    jsonb_build_object(
      'operation',
      'transition_claim_workflow',
      'expected_version',
      p_expected_version
    )
  );

  return query
  select
    p_claim_id,
    v_claim.workflow_status,
    p_target_status,
    v_claim.version + 1,
    v_event_id,
    v_now,
    false;
end;
$$;

revoke all on function public.transition_claim_workflow(
  uuid,
  public.claim_workflow_state_domain,
  integer,
  text,
  text,
  text,
  text,
  uuid,
  timestamptz
) from public, anon;

grant execute on function public.transition_claim_workflow(
  uuid,
  public.claim_workflow_state_domain,
  integer,
  text,
  text,
  text,
  text,
  uuid,
  timestamptz
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
      'version',
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

comment on function public.transition_claim_workflow(
  uuid,
  public.claim_workflow_state_domain,
  integer,
  text,
  text,
  text,
  text,
  uuid,
  timestamptz
) is
  'Phase 4 Batch 3 controlled Claim workflow transition. Derives actor from auth.uid(), validates tenant/clinic permission, enforces versioning, writes one workflow event, and returns a sanitized mutation result.';
