-- Core Foundation RLS policy hardening.
-- Scope: consolidate in-scope tenant, identity, membership, and RBAC policies.
-- Out of scope: tenant-safe FK hardening, lifecycle states, controlled role-assignment workflows.

alter table public.organizations enable row level security;
alter table public.clinics enable row level security;
alter table public.user_profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.clinic_memberships enable row level security;
alter table public.user_role_assignments enable row level security;

drop policy if exists organizations_select_scoped on public.organizations;
drop policy if exists clinics_select_scoped on public.clinics;
drop policy if exists user_profiles_select_scoped on public.user_profiles;
drop policy if exists user_profiles_update_own on public.user_profiles;
drop policy if exists roles_select_scoped on public.roles;
drop policy if exists permissions_select_authenticated on public.permissions;
drop policy if exists role_permissions_select_authenticated on public.role_permissions;
drop policy if exists user_roles_select_scoped on public.user_roles;
drop policy if exists user_roles_manage_admin on public.user_roles;

drop policy if exists mvp1_organizations_select on public.organizations;
drop policy if exists mvp1_clinics_select on public.clinics;

drop policy if exists organizations_select_own_scope on public.organizations;
drop policy if exists clinics_select_authorized_scope on public.clinics;
drop policy if exists user_profiles_select_self_or_admin on public.user_profiles;
drop policy if exists roles_select_catalog_scope on public.roles;
drop policy if exists permissions_select_catalog_scope on public.permissions;
drop policy if exists role_permissions_select_catalog_scope on public.role_permissions;
drop policy if exists user_roles_select_self_or_admin on public.user_roles;

create policy organizations_select_own_scope
on public.organizations
for select
to authenticated
using (
  public.is_organization_member(id)
);

create policy clinics_select_authorized_scope
on public.clinics
for select
to authenticated
using (
  public.has_clinic_access(organization_id, id)
  and public.has_permission('clinic.view', organization_id, id)
);

create policy user_profiles_select_self_or_admin
on public.user_profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_permission('role.assign', organization_id, primary_clinic_id)
);

create policy roles_select_catalog_scope
on public.roles
for select
to authenticated
using (
  organization_id is null
  or public.is_organization_member(organization_id)
);

create policy permissions_select_catalog_scope
on public.permissions
for select
to authenticated
using (
  is_active = true
  and deleted_at is null
);

create policy role_permissions_select_catalog_scope
on public.role_permissions
for select
to authenticated
using (
  is_active = true
  and deleted_at is null
  and exists (
    select 1
    from public.roles r
    where r.id = role_permissions.role_id
      and r.is_active = true
      and r.deleted_at is null
      and (r.organization_id is null or public.is_organization_member(r.organization_id))
  )
);

create policy user_roles_select_self_or_admin
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_permission('role.assign', organization_id, clinic_id)
);
