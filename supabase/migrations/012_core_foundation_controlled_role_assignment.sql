-- Core Foundation controlled role assignment and revocation workflow.
-- Scope: canonical user_role_assignments workflow, RBAC permissions, grants, and audit-ready metadata.

alter table public.user_role_assignments
  add column if not exists assignment_reason text,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references public.user_profiles(id),
  add column if not exists revocation_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_user_role_assignments_revocation_fields'
      and conrelid = 'public.user_role_assignments'::regclass
  ) then
    alter table public.user_role_assignments
      add constraint ck_user_role_assignments_revocation_fields
      check (
        (revoked_at is null and revoked_by is null)
        or (assignment_status = 'revoked' and revoked_at is not null and revoked_by is not null)
      );
  end if;
end $$;

create unique index if not exists uq_user_role_assignments_active_org_level
on public.user_role_assignments (organization_id, user_profile_id, role_id)
where clinic_id is null
  and assignment_status = 'active'
  and is_active = true
  and deleted_at is null;

create unique index if not exists uq_user_role_assignments_active_clinic_level
on public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
where clinic_id is not null
  and assignment_status = 'active'
  and is_active = true
  and deleted_at is null;

create index if not exists idx_user_role_assignments_revoked_at
on public.user_role_assignments (organization_id, revoked_at desc)
where assignment_status = 'revoked';

insert into public.permissions (permission_key, description, domain)
values
  ('role_assignment.read', 'Read controlled role assignment workflow state.', 'rbac'),
  ('role_assignment.assign', 'Assign roles through the controlled workflow.', 'rbac'),
  ('role_assignment.revoke', 'Revoke roles through the controlled workflow.', 'rbac'),
  ('role_assignment.manage_expiry', 'Set or change role assignment expiry through an approved workflow.', 'rbac'),
  ('role_assignment.assign_platform_role', 'Assign platform roles through explicit platform authority.', 'rbac')
on conflict (permission_key) do update
set description = excluded.description,
    domain = excluded.domain,
    is_active = true,
    deleted_at = null,
    updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'role_assignment.read',
  'role_assignment.assign',
  'role_assignment.revoke',
  'role_assignment.manage_expiry',
  'role_assignment.assign_platform_role'
)
where r.organization_id is null
  and r.name = 'platform_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'role_assignment.read',
  'role_assignment.assign',
  'role_assignment.revoke',
  'role_assignment.manage_expiry'
)
where r.organization_id is null
  and r.name = 'organization_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'role_assignment.read',
  'role_assignment.assign',
  'role_assignment.revoke',
  'role_assignment.manage_expiry'
)
where r.organization_id is null
  and r.name = 'clinic_admin'
on conflict (role_id, permission_id) do nothing;

create or replace function public.role_assignment_role_scope(p_role_name text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_role_name = 'platform_admin' then 'platform'
    when p_role_name in ('organization_admin', 'compliance_officer', 'auditor', 'executive') then 'organization'
    else 'clinic'
  end;
$$;

create or replace function public.has_role_assignment_permission(
  p_permission_key text,
  p_organization_id uuid,
  p_clinic_id uuid default null,
  p_platform_required boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and p_permission_key is not null
    and (
      p_organization_id is null
      or exists (
        select 1
        from public.organizations o
        where o.id = p_organization_id
          and o.lifecycle_status = 'active'
          and o.is_active = true
          and o.deleted_at is null
      )
    )
    and (
      p_clinic_id is null
      or exists (
        select 1
        from public.clinics c
        where c.organization_id = p_organization_id
          and c.id = p_clinic_id
          and c.lifecycle_status = 'active'
          and c.is_active = true
          and c.deleted_at is null
      )
    )
    and exists (
      select 1
      from public.user_profiles up
      join public.user_role_assignments ura on ura.user_profile_id = up.id
      join public.roles r on r.id = ura.role_id
      join public.role_permissions rp on rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and ura.assignment_status = 'active'
        and ura.is_active = true
        and ura.deleted_at is null
        and ura.assigned_at <= now()
        and (ura.expires_at is null or ura.expires_at > now())
        and (r.name = 'platform_admin' or ura.organization_id = p_organization_id)
        and (
          r.name = 'platform_admin'
          or ura.clinic_id is null
          or (p_clinic_id is not null and ura.clinic_id = p_clinic_id)
        )
        and (not p_platform_required or r.name = 'platform_admin')
        and r.is_active = true
        and r.deleted_at is null
        and rp.is_active = true
        and rp.deleted_at is null
        and p.permission_key = p_permission_key
        and p.is_active = true
        and p.deleted_at is null
    ),
    false
  );
$$;

create or replace function public.has_clinic_access(p_organization_id uuid, p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_organization_member(p_organization_id)
    and (
      p_clinic_id is null
      or exists (
        select 1
        from public.clinics c
        where c.organization_id = p_organization_id
          and c.id = p_clinic_id
          and c.lifecycle_status = 'active'
          and c.is_active = true
          and c.deleted_at is null
      )
    )
    and (
      p_clinic_id is null
      or exists (
        select 1
        from public.clinics c
        join public.user_profiles up on up.organization_id = c.organization_id
        join public.clinic_memberships cm
          on cm.user_profile_id = up.id
         and cm.organization_id = p_organization_id
         and cm.clinic_id = p_clinic_id
        where c.organization_id = p_organization_id
          and c.id = p_clinic_id
          and c.lifecycle_status = 'active'
          and c.is_active = true
          and c.deleted_at is null
          and up.id = auth.uid()
          and up.is_active = true
          and up.deleted_at is null
          and cm.membership_status = 'active'
          and cm.is_active = true
          and cm.deleted_at is null
      )
      or exists (
        select 1
        from public.user_profiles up
        join public.user_role_assignments ura
          on ura.user_profile_id = up.id
         and ura.organization_id = p_organization_id
        join public.roles r on r.id = ura.role_id
        where up.id = auth.uid()
          and up.is_active = true
          and up.deleted_at is null
          and ura.clinic_id is null
          and ura.assignment_status = 'active'
          and ura.is_active = true
          and ura.deleted_at is null
          and ura.assigned_at <= now()
          and (ura.expires_at is null or ura.expires_at > now())
          and r.is_active = true
          and r.deleted_at is null
      )
    ),
    false
  );
$$;

create or replace function public.has_permission(
  p_permission_key text,
  p_organization_id uuid,
  p_clinic_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    p_permission_key is not null
    and public.is_organization_member(p_organization_id)
    and public.has_clinic_access(p_organization_id, p_clinic_id)
    and exists (
      select 1
      from public.user_profiles up
      join public.user_role_assignments ura
        on ura.user_profile_id = up.id
       and ura.organization_id = p_organization_id
      join public.role_permissions rp on rp.role_id = ura.role_id
      join public.permissions p on p.id = rp.permission_id
      join public.roles r on r.id = ura.role_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and (ura.clinic_id is null or p_clinic_id is null or ura.clinic_id = p_clinic_id)
        and ura.assignment_status = 'active'
        and ura.is_active = true
        and ura.deleted_at is null
        and ura.assigned_at <= now()
        and (ura.expires_at is null or ura.expires_at > now())
        and rp.is_active = true
        and rp.deleted_at is null
        and p.is_active = true
        and p.deleted_at is null
        and r.is_active = true
        and r.deleted_at is null
        and p.permission_key = p_permission_key
    ),
    false
  );
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
  role_record public.roles%rowtype;
  target_profile public.user_profiles%rowtype;
  target_membership public.organization_memberships%rowtype;
  target_clinic_membership public.clinic_memberships%rowtype;
  role_scope text;
  inserted_assignment_id uuid;
begin
  actor_profile_id := auth.uid();

  if actor_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_target_profile_id is null or p_organization_id is null or p_role_id is null then
    raise exception 'target profile, organization, and role are required' using errcode = '23514';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'role assignment reason is required' using errcode = '23514';
  end if;

  if p_target_profile_id = actor_profile_id then
    raise exception 'self-assignment is not authorized' using errcode = '42501';
  end if;

  if p_effective_at is null or p_effective_at < now() - interval '1 minute' then
    raise exception 'role assignment effective time is invalid' using errcode = '23514';
  end if;

  if p_expires_at is not null and p_expires_at <= p_effective_at then
    raise exception 'role assignment expiry must be after effective time' using errcode = '23514';
  end if;

  perform 1
  from public.organizations o
  where o.id = p_organization_id
    and o.lifecycle_status = 'active'
    and o.is_active = true
    and o.deleted_at is null
  for update;

  if not found then
    raise exception 'organization is not operational for role assignment' using errcode = '42501';
  end if;

  select *
  into role_record
  from public.roles r
  where r.id = p_role_id
    and r.is_active = true
    and r.deleted_at is null
  for update;

  if role_record.id is null then
    raise exception 'role is not assignable' using errcode = '42501';
  end if;

  if role_record.organization_id is not null and role_record.organization_id <> p_organization_id then
    raise exception 'role organization scope is not authorized' using errcode = '42501';
  end if;

  role_scope := public.role_assignment_role_scope(role_record.name);

  if role_scope = 'platform' and not public.has_role_assignment_permission('role_assignment.assign_platform_role', p_organization_id, null, true) then
    raise exception 'platform role assignment is not authorized' using errcode = '42501';
  end if;

  if role_scope <> 'platform' and not public.has_role_assignment_permission('role_assignment.assign', p_organization_id, p_clinic_id, false) then
    raise exception 'role assignment is not authorized' using errcode = '42501';
  end if;

  if p_expires_at is not null and not public.has_role_assignment_permission('role_assignment.manage_expiry', p_organization_id, p_clinic_id, role_scope = 'platform') then
    raise exception 'role assignment expiry management is not authorized' using errcode = '42501';
  end if;

  if role_scope = 'organization' and p_clinic_id is not null then
    raise exception 'organization-scoped role assignment cannot include clinic scope' using errcode = '23514';
  end if;

  if role_scope = 'clinic' and p_clinic_id is null then
    raise exception 'clinic-scoped role assignment requires clinic scope' using errcode = '23514';
  end if;

  if p_clinic_id is not null then
    perform 1
    from public.clinics c
    where c.organization_id = p_organization_id
      and c.id = p_clinic_id
      and c.lifecycle_status = 'active'
      and c.is_active = true
      and c.deleted_at is null
    for update;

    if not found then
      raise exception 'clinic is not operational for role assignment' using errcode = '42501';
    end if;
  end if;

  select *
  into target_profile
  from public.user_profiles up
  where up.id = p_target_profile_id
    and up.organization_id = p_organization_id
    and up.is_active = true
    and up.deleted_at is null
  for update;

  if target_profile.id is null then
    raise exception 'target profile is not assignable' using errcode = '42501';
  end if;

  select *
  into target_membership
  from public.organization_memberships om
  where om.organization_id = p_organization_id
    and om.user_profile_id = p_target_profile_id
    and om.membership_status = 'active'
    and om.is_active = true
    and om.deleted_at is null
  for update;

  if target_membership.user_profile_id is null then
    raise exception 'target organization membership is not active' using errcode = '42501';
  end if;

  if p_clinic_id is not null then
    select *
    into target_clinic_membership
    from public.clinic_memberships cm
    where cm.organization_id = p_organization_id
      and cm.clinic_id = p_clinic_id
      and cm.user_profile_id = p_target_profile_id
      and cm.membership_status = 'active'
      and cm.is_active = true
      and cm.deleted_at is null
    for update;

    if target_clinic_membership.user_profile_id is null then
      raise exception 'target clinic membership is not active' using errcode = '42501';
    end if;
  end if;

  insert into public.user_role_assignments (
    organization_id,
    clinic_id,
    user_profile_id,
    role_id,
    assignment_status,
    assigned_at,
    assigned_by,
    expires_at,
    assignment_reason,
    created_by,
    updated_by,
    is_active
  )
  values (
    p_organization_id,
    p_clinic_id,
    p_target_profile_id,
    p_role_id,
    'active',
    p_effective_at,
    actor_profile_id,
    p_expires_at,
    btrim(p_reason),
    actor_profile_id,
    actor_profile_id,
    true
  )
  returning id into inserted_assignment_id;

  return inserted_assignment_id;
exception
  when unique_violation then
    raise exception 'active role assignment already exists'
      using errcode = '23505',
            constraint = 'uq_user_role_assignments_active';
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
  role_record public.roles%rowtype;
  role_scope text;
begin
  actor_profile_id := auth.uid();

  if actor_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_assignment_id is null then
    raise exception 'role assignment id is required' using errcode = '23514';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'role assignment revocation reason is required' using errcode = '23514';
  end if;

  select *
  into assignment_record
  from public.user_role_assignments ura
  where ura.id = p_assignment_id
  for update;

  if assignment_record.id is null then
    raise exception 'role assignment not found' using errcode = '42501';
  end if;

  if assignment_record.assignment_status = 'revoked' then
    raise exception 'role assignment is already revoked' using errcode = '23514';
  end if;

  if assignment_record.deleted_at is not null then
    raise exception 'role assignment not found' using errcode = '42501';
  end if;

  select *
  into role_record
  from public.roles r
  where r.id = assignment_record.role_id
  for update;

  if role_record.id is null or role_record.is_active = false or role_record.deleted_at is not null then
    raise exception 'role assignment role is not active' using errcode = '42501';
  end if;

  role_scope := public.role_assignment_role_scope(role_record.name);

  if actor_profile_id = assignment_record.user_profile_id then
    raise exception 'self-revocation of protected role assignment is not authorized' using errcode = '42501';
  end if;

  if role_scope = 'platform' and not public.has_role_assignment_permission('role_assignment.assign_platform_role', assignment_record.organization_id, null, true) then
    raise exception 'platform role revocation is not authorized' using errcode = '42501';
  end if;

  if role_scope <> 'platform' and not public.has_role_assignment_permission('role_assignment.revoke', assignment_record.organization_id, assignment_record.clinic_id, false) then
    raise exception 'role assignment revocation is not authorized' using errcode = '42501';
  end if;

  if role_scope = 'organization'
     and exists (
       select 1
       from public.user_role_assignments ura
       join public.roles r on r.id = ura.role_id
       where ura.user_profile_id = actor_profile_id
         and ura.organization_id = assignment_record.organization_id
         and ura.clinic_id is not null
         and ura.assignment_status = 'active'
         and ura.is_active = true
         and ura.deleted_at is null
         and r.name = 'clinic_admin'
     )
     and not exists (
       select 1
       from public.user_role_assignments ura
       join public.roles r on r.id = ura.role_id
       where ura.user_profile_id = actor_profile_id
         and ura.organization_id = assignment_record.organization_id
         and ura.clinic_id is null
         and ura.assignment_status = 'active'
         and ura.is_active = true
         and ura.deleted_at is null
         and r.name in ('organization_admin', 'platform_admin')
     ) then
    raise exception 'clinic administrator cannot revoke organization-scoped role assignment' using errcode = '42501';
  end if;

  update public.user_role_assignments
  set assignment_status = 'revoked',
      is_active = false,
      revoked_at = now(),
      revoked_by = actor_profile_id,
      revocation_reason = btrim(p_reason),
      updated_at = now(),
      updated_by = actor_profile_id
  where id = p_assignment_id;

  return p_assignment_id;
end;
$$;

revoke all on function public.role_assignment_role_scope(text) from public, anon, authenticated;
revoke all on function public.has_role_assignment_permission(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function public.revoke_role_assignment(uuid, text) from public, anon, authenticated;

grant execute on function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.revoke_role_assignment(uuid, text) to authenticated;
grant execute on function public.has_clinic_access(uuid, uuid) to authenticated;
grant execute on function public.has_permission(text, uuid, uuid) to authenticated;

revoke insert, update, delete on table public.user_role_assignments from public, anon, authenticated;
revoke insert, update, delete on table public.user_roles from public, anon, authenticated;

comment on table public.user_role_assignments
  is 'Authoritative Core Foundation role-assignment table. Normal writes must use assign_role and revoke_role_assignment.';

comment on table public.user_roles
  is 'Legacy compatibility role-assignment table. Not an authoritative write path for new role-assignment workflows.';

comment on function public.assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text)
  is 'Controlled role assignment workflow. Derives actor from auth.uid, validates tenant, clinic, lifecycle, role scope, dates, permissions, self-assignment denial, and duplicate active assignments. Audit event persistence is a follow-up task.';

comment on function public.revoke_role_assignment(uuid, text)
  is 'Controlled role revocation workflow. Derives actor from auth.uid, locks the assignment, preserves history, records revocation metadata, and denies unauthorized/self/cross-tenant revocations. Audit event persistence is a follow-up task.';
