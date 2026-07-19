-- Core Foundation organization and clinic lifecycle controls.
-- Scope: lifecycle states, controlled transition functions, helper integration, and grants.

alter table public.organizations
  add column if not exists lifecycle_status text not null default 'active';

alter table public.clinics
  add column if not exists lifecycle_status text not null default 'active';

update public.organizations
set lifecycle_status = case
  when deleted_at is not null then 'archived'
  when is_active = false then 'suspended'
  else 'active'
end
where lifecycle_status is null;

update public.clinics
set lifecycle_status = case
  when deleted_at is not null then 'archived'
  when is_active = false then 'suspended'
  else 'active'
end
where lifecycle_status is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ck_organizations_lifecycle_status'
      and conrelid = 'public.organizations'::regclass
  ) then
    alter table public.organizations
      add constraint ck_organizations_lifecycle_status
      check (lifecycle_status in ('active', 'suspended', 'closed', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ck_clinics_lifecycle_status'
      and conrelid = 'public.clinics'::regclass
  ) then
    alter table public.clinics
      add constraint ck_clinics_lifecycle_status
      check (lifecycle_status in ('active', 'suspended', 'closed', 'archived'));
  end if;
end $$;

create index if not exists idx_organizations_lifecycle_status
on public.organizations (lifecycle_status)
where deleted_at is null;

create index if not exists idx_clinics_organization_lifecycle_status
on public.clinics (organization_id, lifecycle_status)
where deleted_at is null;

insert into public.permissions (permission_key, description, domain)
values
  ('organization.lifecycle.read', 'Read organization lifecycle state', 'organization'),
  ('organization.lifecycle.suspend', 'Suspend organization operations', 'organization'),
  ('organization.lifecycle.reactivate', 'Reactivate suspended organization through controlled recovery', 'organization'),
  ('organization.lifecycle.close', 'Close organization operations', 'organization'),
  ('organization.lifecycle.archive', 'Archive closed organization', 'organization'),
  ('clinic.lifecycle.read', 'Read clinic lifecycle state', 'clinic'),
  ('clinic.lifecycle.suspend', 'Suspend clinic operations', 'clinic'),
  ('clinic.lifecycle.reactivate', 'Reactivate suspended clinic through controlled recovery', 'clinic'),
  ('clinic.lifecycle.close', 'Close clinic operations', 'clinic'),
  ('clinic.lifecycle.archive', 'Archive closed clinic', 'clinic')
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
  'organization.lifecycle.read',
  'organization.lifecycle.suspend',
  'organization.lifecycle.reactivate',
  'organization.lifecycle.close',
  'organization.lifecycle.archive',
  'clinic.lifecycle.read',
  'clinic.lifecycle.suspend',
  'clinic.lifecycle.reactivate',
  'clinic.lifecycle.close',
  'clinic.lifecycle.archive'
)
where r.organization_id is null
  and r.name = 'platform_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'organization.lifecycle.read',
  'organization.lifecycle.suspend',
  'organization.lifecycle.close',
  'organization.lifecycle.archive',
  'clinic.lifecycle.read',
  'clinic.lifecycle.suspend',
  'clinic.lifecycle.reactivate',
  'clinic.lifecycle.close',
  'clinic.lifecycle.archive'
)
where r.organization_id is null
  and r.name = 'organization_admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'clinic.lifecycle.read',
  'clinic.lifecycle.suspend',
  'clinic.lifecycle.reactivate',
  'clinic.lifecycle.close',
  'clinic.lifecycle.archive'
)
where r.organization_id is null
  and r.name = 'clinic_admin'
on conflict (role_id, permission_id) do nothing;

create or replace function public.is_lifecycle_transition_allowed(
  p_current_status text,
  p_target_status text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_current_status, p_target_status) in (
    ('active', 'suspended'),
    ('suspended', 'active'),
    ('active', 'closed'),
    ('suspended', 'closed'),
    ('closed', 'archived')
  );
$$;

create or replace function public.has_lifecycle_permission(
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
    and p_organization_id is not null
    and exists (
      select 1
      from public.user_profiles up
      join public.user_role_assignments ura
        on ura.user_profile_id = up.id
      join public.roles r on r.id = ura.role_id
      join public.role_permissions rp on rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and (r.name = 'platform_admin' or ura.organization_id = p_organization_id)
        and ura.assignment_status = 'active'
        and ura.is_active = true
        and ura.deleted_at is null
        and (ura.expires_at is null or ura.expires_at > now())
        and (ura.clinic_id is null or p_clinic_id is null or ura.clinic_id = p_clinic_id)
        and r.is_active = true
        and r.deleted_at is null
        and (not p_platform_required or r.name = 'platform_admin')
        and rp.is_active = true
        and rp.deleted_at is null
        and p.permission_key = p_permission_key
        and p.is_active = true
        and p.deleted_at is null
    ),
    false
  );
$$;

create or replace function public.lifecycle_permission_for_status(
  p_subject text,
  p_target_status text
)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_subject = 'organization' and p_target_status = 'active' then 'organization.lifecycle.reactivate'
    when p_subject = 'organization' and p_target_status = 'suspended' then 'organization.lifecycle.suspend'
    when p_subject = 'organization' and p_target_status = 'closed' then 'organization.lifecycle.close'
    when p_subject = 'organization' and p_target_status = 'archived' then 'organization.lifecycle.archive'
    when p_subject = 'clinic' and p_target_status = 'active' then 'clinic.lifecycle.reactivate'
    when p_subject = 'clinic' and p_target_status = 'suspended' then 'clinic.lifecycle.suspend'
    when p_subject = 'clinic' and p_target_status = 'closed' then 'clinic.lifecycle.close'
    when p_subject = 'clinic' and p_target_status = 'archived' then 'clinic.lifecycle.archive'
    else null
  end;
$$;

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
  current_status text;
  required_permission text;
begin
  if auth.uid() is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  if p_organization_id is null or p_target_status is null then
    raise exception 'organization and target lifecycle status are required'
      using errcode = '23514';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'lifecycle transition reason is required'
      using errcode = '23514';
  end if;

  select o.lifecycle_status
  into current_status
  from public.organizations o
  where o.id = p_organization_id
  for update;

  if current_status is null then
    raise exception 'organization not found'
      using errcode = '42501';
  end if;

  required_permission := public.lifecycle_permission_for_status('organization', p_target_status);

  if not public.has_lifecycle_permission(required_permission, p_organization_id, null, p_target_status = 'active') then
    raise exception 'organization lifecycle transition is not authorized'
      using errcode = '42501';
  end if;

  if not public.is_lifecycle_transition_allowed(current_status, p_target_status) then
    raise exception 'organization lifecycle transition from % to % is not allowed', current_status, p_target_status
      using errcode = '23514';
  end if;

  update public.organizations
  set lifecycle_status = p_target_status,
      is_active = (p_target_status = 'active'),
      updated_at = now()
  where id = p_organization_id;

  return p_target_status;
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
  clinic_organization_id uuid;
  current_status text;
  organization_status text;
  required_permission text;
begin
  if auth.uid() is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  if p_clinic_id is null or p_target_status is null then
    raise exception 'clinic and target lifecycle status are required'
      using errcode = '23514';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'lifecycle transition reason is required'
      using errcode = '23514';
  end if;

  select c.organization_id, c.lifecycle_status, o.lifecycle_status
  into clinic_organization_id, current_status, organization_status
  from public.clinics c
  join public.organizations o on o.id = c.organization_id
  where c.id = p_clinic_id
  for update of c;

  if current_status is null then
    raise exception 'clinic not found'
      using errcode = '42501';
  end if;

  if organization_status <> 'active' then
    raise exception 'clinic lifecycle transition is blocked by organization lifecycle status'
      using errcode = '42501';
  end if;

  required_permission := public.lifecycle_permission_for_status('clinic', p_target_status);

  if not public.has_lifecycle_permission(required_permission, clinic_organization_id, p_clinic_id, false) then
    raise exception 'clinic lifecycle transition is not authorized'
      using errcode = '42501';
  end if;

  if not public.is_lifecycle_transition_allowed(current_status, p_target_status) then
    raise exception 'clinic lifecycle transition from % to % is not allowed', current_status, p_target_status
      using errcode = '23514';
  end if;

  update public.clinics
  set lifecycle_status = p_target_status,
      is_active = (p_target_status = 'active'),
      updated_at = now()
  where id = p_clinic_id;

  return p_target_status;
end;
$$;

create or replace function public.current_user_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = public
as $$
  select up
  from public.user_profiles up
  join public.organizations o on o.id = up.organization_id
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
    and o.lifecycle_status = 'active'
    and o.is_active = true
    and o.deleted_at is null
  limit 1;
$$;

create or replace function public.current_user_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.id
  from public.user_profiles up
  join public.organizations o on o.id = up.organization_id
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
    and o.lifecycle_status = 'active'
    and o.is_active = true
    and o.deleted_at is null
  limit 1;
$$;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and p_organization_id is not null
    and exists (
      select 1
      from public.organizations o
      join public.user_profiles up on up.organization_id = o.id
      join public.organization_memberships om
        on om.user_profile_id = up.id
       and om.organization_id = p_organization_id
      where o.id = p_organization_id
        and o.lifecycle_status = 'active'
        and o.is_active = true
        and o.deleted_at is null
        and up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and om.membership_status = 'active'
        and om.is_active = true
        and om.deleted_at is null
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

revoke all on function public.is_lifecycle_transition_allowed(text, text) from public, anon, authenticated;
revoke all on function public.has_lifecycle_permission(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.lifecycle_permission_for_status(text, text) from public, anon, authenticated;
revoke all on function public.transition_organization_lifecycle(uuid, text, text) from public, anon, authenticated;
revoke all on function public.transition_clinic_lifecycle(uuid, text, text) from public, anon, authenticated;

grant execute on function public.transition_organization_lifecycle(uuid, text, text) to authenticated;
grant execute on function public.transition_clinic_lifecycle(uuid, text, text) to authenticated;

grant execute on function public.current_user_profile() to authenticated;
grant execute on function public.current_user_profile_id() to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_clinic_access(uuid, uuid) to authenticated;
grant execute on function public.has_permission(text, uuid, uuid) to authenticated;

comment on column public.organizations.lifecycle_status
  is 'Core Foundation lifecycle state: active, suspended, closed, or archived. Normal operational helpers only allow active.';

comment on column public.clinics.lifecycle_status
  is 'Core Foundation lifecycle state: active, suspended, closed, or archived. Organization lifecycle overrides clinic lifecycle.';

comment on function public.transition_organization_lifecycle(uuid, text, text)
  is 'Controlled organization lifecycle transition boundary. Derives actor from auth.uid, validates transition and permission, requires reason, and does not emit audit events yet.';

comment on function public.transition_clinic_lifecycle(uuid, text, text)
  is 'Controlled clinic lifecycle transition boundary. Derives actor from auth.uid, validates transition and permission, requires reason, and does not emit audit events yet.';
