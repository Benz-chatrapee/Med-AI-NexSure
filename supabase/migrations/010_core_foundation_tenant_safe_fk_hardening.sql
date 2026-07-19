-- Core Foundation tenant-safe relationship hardening.
-- Scope: constraints and indexes only; no lifecycle columns or role-assignment workflow changes.

do $$
begin
  if exists (
    select 1
    from public.organization_memberships om
    join public.user_profiles up on up.id = om.user_profile_id
    where om.organization_id <> up.organization_id
  ) then
    raise exception 'preflight failed: organization_memberships contains cross-organization profile references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.clinic_memberships cm
    join public.user_profiles up on up.id = cm.user_profile_id
    where cm.organization_id <> up.organization_id
  ) then
    raise exception 'preflight failed: clinic_memberships contains cross-organization profile references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.user_profiles up on up.id = ur.user_id
    where ur.organization_id <> up.organization_id
  ) then
    raise exception 'preflight failed: user_roles contains cross-organization profile references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_role_assignments ura
    join public.user_profiles up on up.id = ura.user_profile_id
    where ura.organization_id <> up.organization_id
  ) then
    raise exception 'preflight failed: user_role_assignments contains cross-organization profile references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.clinics c on c.id = ur.clinic_id
    where ur.clinic_id is not null
      and ur.organization_id <> c.organization_id
  ) then
    raise exception 'preflight failed: user_roles contains cross-organization clinic references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_role_assignments ura
    join public.clinics c on c.id = ura.clinic_id
    where ura.clinic_id is not null
      and ura.organization_id <> c.organization_id
  ) then
    raise exception 'preflight failed: user_role_assignments contains cross-organization clinic references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.organization_id is not null
      and ur.organization_id <> r.organization_id
  ) then
    raise exception 'preflight failed: user_roles contains cross-organization scoped role references'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where r.organization_id is not null
      and ura.organization_id <> r.organization_id
  ) then
    raise exception 'preflight failed: user_role_assignments contains cross-organization scoped role references'
      using errcode = '23514';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'uq_user_profiles_organization_id_id'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
      add constraint uq_user_profiles_organization_id_id unique (organization_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'uq_roles_organization_id_id'
      and conrelid = 'public.roles'::regclass
  ) then
    alter table public.roles
      add constraint uq_roles_organization_id_id unique (organization_id, id);
  end if;
end $$;

create unique index if not exists uq_user_roles_org_level_assignment
on public.user_roles (organization_id, user_id, role_id)
where clinic_id is null;

create unique index if not exists uq_user_role_assignments_org_level_assignment
on public.user_role_assignments (organization_id, user_profile_id, role_id)
where clinic_id is null;

create index if not exists idx_user_roles_organization_user_id
on public.user_roles (organization_id, user_id);

create index if not exists idx_user_roles_organization_clinic_id
on public.user_roles (organization_id, clinic_id);

create index if not exists idx_user_role_assignments_organization_user_profile_id
on public.user_role_assignments (organization_id, user_profile_id);

create index if not exists idx_user_role_assignments_organization_clinic_id
on public.user_role_assignments (organization_id, clinic_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_organization_memberships_user_profile_tenant'
      and conrelid = 'public.organization_memberships'::regclass
  ) then
    alter table public.organization_memberships
      add constraint fk_organization_memberships_user_profile_tenant
      foreign key (organization_id, user_profile_id)
      references public.user_profiles (organization_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_clinic_memberships_user_profile_tenant'
      and conrelid = 'public.clinic_memberships'::regclass
  ) then
    alter table public.clinic_memberships
      add constraint fk_clinic_memberships_user_profile_tenant
      foreign key (organization_id, user_profile_id)
      references public.user_profiles (organization_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_user_roles_clinic_tenant'
      and conrelid = 'public.user_roles'::regclass
  ) then
    alter table public.user_roles
      add constraint fk_user_roles_clinic_tenant
      foreign key (organization_id, clinic_id)
      references public.clinics (organization_id, id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_user_roles_user_profile_tenant'
      and conrelid = 'public.user_roles'::regclass
  ) then
    alter table public.user_roles
      add constraint fk_user_roles_user_profile_tenant
      foreign key (organization_id, user_id)
      references public.user_profiles (organization_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_user_role_assignments_clinic_tenant'
      and conrelid = 'public.user_role_assignments'::regclass
  ) then
    alter table public.user_role_assignments
      add constraint fk_user_role_assignments_clinic_tenant
      foreign key (organization_id, clinic_id)
      references public.clinics (organization_id, id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_user_role_assignments_user_profile_tenant'
      and conrelid = 'public.user_role_assignments'::regclass
  ) then
    alter table public.user_role_assignments
      add constraint fk_user_role_assignments_user_profile_tenant
      foreign key (organization_id, user_profile_id)
      references public.user_profiles (organization_id, id)
      on delete cascade;
  end if;
end $$;

create or replace function public.enforce_role_assignment_tenant_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  role_organization_id uuid;
begin
  select r.organization_id
  into role_organization_id
  from public.roles r
  where r.id = new.role_id;

  if role_organization_id is not null
     and role_organization_id <> new.organization_id then
    raise exception 'role assignment organization_id must match tenant-scoped role organization_id'
      using errcode = '23514',
            constraint = tg_name;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_roles_tenant_scope on public.user_roles;
create trigger trg_user_roles_tenant_scope
before insert or update of organization_id, role_id
on public.user_roles
for each row
execute function public.enforce_role_assignment_tenant_scope();

drop trigger if exists trg_user_role_assignments_tenant_scope on public.user_role_assignments;
create trigger trg_user_role_assignments_tenant_scope
before insert or update of organization_id, role_id
on public.user_role_assignments
for each row
execute function public.enforce_role_assignment_tenant_scope();

comment on constraint fk_organization_memberships_user_profile_tenant on public.organization_memberships
  is 'Ensures organization memberships can only reference profiles whose default organization matches the membership organization.';

comment on constraint fk_clinic_memberships_user_profile_tenant on public.clinic_memberships
  is 'Ensures clinic memberships can only reference profiles whose default organization matches the membership organization.';

comment on constraint fk_user_roles_clinic_tenant on public.user_roles
  is 'Legacy role assignments with a clinic scope must reference a clinic in the same organization.';

comment on constraint fk_user_roles_user_profile_tenant on public.user_roles
  is 'Legacy role assignments must reference a profile in the same organization.';

comment on constraint fk_user_role_assignments_clinic_tenant on public.user_role_assignments
  is 'Current role assignments with a clinic scope must reference a clinic in the same organization.';

comment on constraint fk_user_role_assignments_user_profile_tenant on public.user_role_assignments
  is 'Current role assignments must reference a profile in the same organization.';

comment on function public.enforce_role_assignment_tenant_scope()
  is 'Allows platform roles with organization_id null, and rejects tenant-scoped role assignment outside the role organization.';
