-- Core Foundation audit-event persistence.
-- Scope: lifecycle and controlled role-assignment workflows only.

alter table public.audit_logs
  add column if not exists occurred_at timestamptz not null default now(),
  add column if not exists event_type text,
  add column if not exists actor_auth_user_id uuid,
  add column if not exists actor_profile_id uuid references public.user_profiles(id),
  add column if not exists resource_type text,
  add column if not exists resource_id uuid,
  add column if not exists action text,
  add column if not exists before_state jsonb,
  add column if not exists after_state jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.audit_logs
set occurred_at = created_at
where occurred_at is null;

update public.audit_logs
set event_type = action_type::text,
    actor_auth_user_id = actor_user_id,
    actor_profile_id = actor_user_id,
    resource_type = target_table,
    resource_id = target_record_id,
    action = action_type::text,
    before_state = old_value,
    after_state = new_value
where event_type is null;

alter table public.audit_logs
  alter column event_type set not null,
  alter column resource_type set not null,
  alter column action set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_outcome_check'
      and conrelid = 'public.audit_logs'::regclass
  ) then
    alter table public.audit_logs drop constraint audit_logs_outcome_check;
  end if;

  alter table public.audit_logs
    add constraint audit_logs_outcome_check
    check (outcome in ('success', 'failure', 'blocked', 'denied', 'failed'));

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_audit_logs_event_type'
      and conrelid = 'public.audit_logs'::regclass
  ) then
    alter table public.audit_logs
      add constraint ck_audit_logs_event_type
      check (
        event_type in (
          'organization.lifecycle.suspended',
          'organization.lifecycle.reactivated',
          'organization.lifecycle.closed',
          'organization.lifecycle.archived',
          'clinic.lifecycle.suspended',
          'clinic.lifecycle.reactivated',
          'clinic.lifecycle.closed',
          'clinic.lifecycle.archived',
          'role_assignment.created',
          'role_assignment.revoked'
        )
        or event_type = action_type::text
      );
  end if;
end $$;

create index if not exists idx_audit_logs_occurred_at
on public.audit_logs (occurred_at desc);

create index if not exists idx_audit_logs_organization_occurred_at
on public.audit_logs (organization_id, occurred_at desc);

create index if not exists idx_audit_logs_clinic_occurred_at
on public.audit_logs (clinic_id, occurred_at desc);

create index if not exists idx_audit_logs_event_type_occurred_at
on public.audit_logs (event_type, occurred_at desc);

create index if not exists idx_audit_logs_resource
on public.audit_logs (resource_type, resource_id);

create index if not exists idx_audit_logs_correlation_id
on public.audit_logs (correlation_id)
where correlation_id is not null;

create or replace function public.audit_json_contains_prohibited_data(p_payload jsonb)
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    exists (
      select 1
      from jsonb_each_text(coalesce(p_payload, '{}'::jsonb)) as item(key, value)
      where lower(item.key) in (
        'password',
        'token',
        'jwt',
        'api_key',
        'apikey',
        'secret',
        'authorization',
        'auth_header',
        'access_token',
        'refresh_token'
      )
      or lower(item.value) like '%bearer %'
      or lower(item.value) like '%jwt%'
      or lower(item.value) like '%api_key%'
      or lower(item.value) like '%password%'
    ),
    false
  );
$$;

create or replace function public.append_core_audit_event(
  p_event_type text,
  p_outcome text,
  p_actor_profile_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_action text,
  p_reason text,
  p_before_state jsonb default null,
  p_after_state jsonb default null,
  p_metadata jsonb default '{}'::jsonb,
  p_correlation_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
  mapped_action public.audit_action_type;
begin
  if current_setting('app.audit_force_failure', true) = 'on' then
    raise exception 'forced audit append failure'
      using errcode = '23514';
  end if;

  if p_event_type is null
     or p_outcome is null
     or p_resource_type is null
     or p_action is null then
    raise exception 'audit event type, outcome, resource type, and action are required'
      using errcode = '23514';
  end if;

  if p_event_type not in (
    'organization.lifecycle.suspended',
    'organization.lifecycle.reactivated',
    'organization.lifecycle.closed',
    'organization.lifecycle.archived',
    'clinic.lifecycle.suspended',
    'clinic.lifecycle.reactivated',
    'clinic.lifecycle.closed',
    'clinic.lifecycle.archived',
    'role_assignment.created',
    'role_assignment.revoked'
  ) then
    raise exception 'unsupported core audit event type'
      using errcode = '23514';
  end if;

  if p_outcome not in ('success', 'denied', 'failed') then
    raise exception 'unsupported core audit outcome'
      using errcode = '23514';
  end if;

  if public.audit_json_contains_prohibited_data(p_before_state)
     or public.audit_json_contains_prohibited_data(p_after_state)
     or public.audit_json_contains_prohibited_data(p_metadata) then
    raise exception 'audit payload contains prohibited sensitive metadata'
      using errcode = '23514';
  end if;

  mapped_action := case
    when p_action in ('create', 'read', 'update', 'delete', 'view', 'export', 'login', 'permission_change', 'clinical_review', 'claim_review', 'evidence_change', 'dashboard_viewed', 'filters_applied')
      then p_action::public.audit_action_type
    when p_event_type like 'role_assignment.%'
      then 'permission_change'::public.audit_action_type
    else 'update'::public.audit_action_type
  end;

  insert into public.audit_logs (
    organization_id,
    clinic_id,
    actor_user_id,
    actor_auth_user_id,
    actor_profile_id,
    action_type,
    event_type,
    target_table,
    target_record_id,
    resource_type,
    resource_id,
    action,
    reason,
    old_value,
    new_value,
    before_state,
    after_state,
    metadata,
    correlation_id,
    outcome,
    created_at,
    occurred_at
  )
  values (
    p_organization_id,
    p_clinic_id,
    p_actor_profile_id,
    p_actor_profile_id,
    p_actor_profile_id,
    mapped_action,
    p_event_type,
    p_resource_type,
    p_resource_id,
    p_resource_type,
    p_resource_id,
    p_action,
    nullif(btrim(coalesce(p_reason, '')), ''),
    p_before_state,
    p_after_state,
    p_before_state,
    p_after_state,
    coalesce(p_metadata, '{}'::jsonb),
    nullif(btrim(coalesce(p_correlation_id, '')), ''),
    p_outcome,
    now(),
    now()
  )
  returning id into audit_id;

  return audit_id;
end;
$$;

alter function public.transition_organization_lifecycle(uuid, text, text)
  rename to transition_organization_lifecycle_without_audit;

alter function public.transition_clinic_lifecycle(uuid, text, text)
  rename to transition_clinic_lifecycle_without_audit;

alter function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text)
  rename to assign_role_without_audit;

alter function public.revoke_role_assignment(uuid, text)
  rename to revoke_role_assignment_without_audit;

create or replace function public.transition_organization_lifecycle(
  p_organization_id uuid,
  p_target_status text,
  p_reason text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  previous_status text;
  final_status text;
  event_type text;
begin
  actor_profile_id := auth.uid();

  select o.lifecycle_status
  into previous_status
  from public.organizations o
  where o.id = p_organization_id;

  final_status := public.transition_organization_lifecycle_without_audit(p_organization_id, p_target_status, p_reason);

  event_type := case final_status
    when 'suspended' then 'organization.lifecycle.suspended'
    when 'active' then 'organization.lifecycle.reactivated'
    when 'closed' then 'organization.lifecycle.closed'
    when 'archived' then 'organization.lifecycle.archived'
  end;

  perform public.append_core_audit_event(
    event_type,
    'success',
    actor_profile_id,
    p_organization_id,
    null,
    'organizations',
    p_organization_id,
    'update',
    p_reason,
    jsonb_build_object('lifecycle_status', previous_status),
    jsonb_build_object('lifecycle_status', final_status),
    jsonb_build_object('workflow', 'organization_lifecycle'),
    null
  );

  return final_status;
end;
$$;

create or replace function public.transition_clinic_lifecycle(
  p_clinic_id uuid,
  p_target_status text,
  p_reason text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  clinic_organization_id uuid;
  previous_status text;
  final_status text;
  event_type text;
begin
  actor_profile_id := auth.uid();

  select c.organization_id, c.lifecycle_status
  into clinic_organization_id, previous_status
  from public.clinics c
  where c.id = p_clinic_id;

  final_status := public.transition_clinic_lifecycle_without_audit(p_clinic_id, p_target_status, p_reason);

  event_type := case final_status
    when 'suspended' then 'clinic.lifecycle.suspended'
    when 'active' then 'clinic.lifecycle.reactivated'
    when 'closed' then 'clinic.lifecycle.closed'
    when 'archived' then 'clinic.lifecycle.archived'
  end;

  perform public.append_core_audit_event(
    event_type,
    'success',
    actor_profile_id,
    clinic_organization_id,
    p_clinic_id,
    'clinics',
    p_clinic_id,
    'update',
    p_reason,
    jsonb_build_object('lifecycle_status', previous_status),
    jsonb_build_object('lifecycle_status', final_status),
    jsonb_build_object('workflow', 'clinic_lifecycle'),
    null
  );

  return final_status;
end;
$$;

create or replace function public.assign_role(
  p_target_profile_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid,
  p_role_id uuid,
  p_effective_at timestamptz default now(),
  p_expires_at timestamptz default null,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  assignment_id uuid;
  role_name text;
begin
  actor_profile_id := auth.uid();

  select r.name
  into role_name
  from public.roles r
  where r.id = p_role_id;

  assignment_id := public.assign_role_without_audit(
    p_target_profile_id,
    p_organization_id,
    p_clinic_id,
    p_role_id,
    p_effective_at,
    p_expires_at,
    p_reason
  );

  perform public.append_core_audit_event(
    'role_assignment.created',
    'success',
    actor_profile_id,
    p_organization_id,
    p_clinic_id,
    'user_role_assignments',
    assignment_id,
    'permission_change',
    p_reason,
    null,
    jsonb_build_object(
      'assignment_id', assignment_id,
      'target_profile_id', p_target_profile_id,
      'role_id', p_role_id,
      'role_name', role_name,
      'organization_id', p_organization_id,
      'clinic_id', p_clinic_id,
      'assignment_status', 'active',
      'assigned_at', p_effective_at,
      'expires_at', p_expires_at
    ),
    jsonb_build_object('workflow', 'role_assignment'),
    null
  );

  return assignment_id;
end;
$$;

create or replace function public.revoke_role_assignment(
  p_assignment_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  assignment_record public.user_role_assignments%rowtype;
  role_name text;
  revoked_assignment_id uuid;
begin
  actor_profile_id := auth.uid();

  select ura.*
  into assignment_record
  from public.user_role_assignments ura
  where ura.id = p_assignment_id;

  select r.name
  into role_name
  from public.roles r
  where r.id = assignment_record.role_id;

  revoked_assignment_id := public.revoke_role_assignment_without_audit(p_assignment_id, p_reason);

  perform public.append_core_audit_event(
    'role_assignment.revoked',
    'success',
    actor_profile_id,
    assignment_record.organization_id,
    assignment_record.clinic_id,
    'user_role_assignments',
    p_assignment_id,
    'permission_change',
    p_reason,
    jsonb_build_object(
      'assignment_id', p_assignment_id,
      'target_profile_id', assignment_record.user_profile_id,
      'role_id', assignment_record.role_id,
      'role_name', role_name,
      'organization_id', assignment_record.organization_id,
      'clinic_id', assignment_record.clinic_id,
      'assignment_status', assignment_record.assignment_status,
      'assigned_at', assignment_record.assigned_at,
      'expires_at', assignment_record.expires_at
    ),
    jsonb_build_object(
      'assignment_id', p_assignment_id,
      'target_profile_id', assignment_record.user_profile_id,
      'role_id', assignment_record.role_id,
      'role_name', role_name,
      'organization_id', assignment_record.organization_id,
      'clinic_id', assignment_record.clinic_id,
      'assignment_status', 'revoked'
    ),
    jsonb_build_object('workflow', 'role_assignment'),
    null
  );

  return revoked_assignment_id;
end;
$$;

drop policy if exists audit_logs_insert_scoped on public.audit_logs;
drop policy if exists mvp1_audit_logs_insert on public.audit_logs;

revoke insert, update, delete on table public.audit_logs from public, anon, authenticated;
revoke all on function public.audit_json_contains_prohibited_data(jsonb) from public, anon, authenticated;
revoke all on function public.append_core_audit_event(text, text, uuid, uuid, uuid, text, uuid, text, text, jsonb, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.transition_organization_lifecycle_without_audit(uuid, text, text) from public, anon, authenticated;
revoke all on function public.transition_clinic_lifecycle_without_audit(uuid, text, text) from public, anon, authenticated;
revoke all on function public.assign_role_without_audit(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function public.revoke_role_assignment_without_audit(uuid, text) from public, anon, authenticated;
revoke all on function public.transition_organization_lifecycle(uuid, text, text) from public, anon, authenticated;
revoke all on function public.transition_clinic_lifecycle(uuid, text, text) from public, anon, authenticated;
revoke all on function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function public.revoke_role_assignment(uuid, text) from public, anon, authenticated;

grant execute on function public.transition_organization_lifecycle(uuid, text, text) to authenticated;
grant execute on function public.transition_clinic_lifecycle(uuid, text, text) to authenticated;
grant execute on function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.revoke_role_assignment(uuid, text) to authenticated;

comment on function public.append_core_audit_event(text, text, uuid, uuid, uuid, text, uuid, text, text, jsonb, jsonb, jsonb, text)
  is 'Internal Core Foundation audit append boundary for implemented lifecycle and role-assignment workflows. Not granted to runtime roles.';
