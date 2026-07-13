-- Med AI NexSure MVP 1 RLS preparation
-- Policies are active but intentionally simple for staged rollout and QA validation.

create or replace function current_user_profile()
returns user_profiles
language sql
stable
security definer
set search_path = public
as $$
  select up
  from user_profiles up
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
  limit 1;
$$;

create or replace function current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from user_profiles
  where id = auth.uid()
    and is_active = true
    and deleted_at is null
  limit 1;
$$;

create or replace function current_user_clinic_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct clinic_id) filter (where clinic_id is not null), array[]::uuid[])
  from (
    select primary_clinic_id as clinic_id
    from user_profiles
    where id = auth.uid()
      and primary_clinic_id is not null
      and is_active = true
      and deleted_at is null
    union
    select ur.clinic_id
    from user_roles ur
    where ur.user_id = auth.uid()
      and ur.clinic_id is not null
      and ur.is_active = true
      and ur.deleted_at is null
  ) scoped_clinics;
$$;

create or replace function current_user_has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.deleted_at is null
      and r.is_active = true
      and r.deleted_at is null
      and lower(r.name) = lower(role_name)
  );
$$;

create or replace function current_user_has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    join permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.deleted_at is null
      and rp.is_active = true
      and rp.deleted_at is null
      and p.is_active = true
      and p.deleted_at is null
      and p.permission_key = current_user_has_permission.permission_key
  );
$$;

alter table organizations enable row level security;
alter table clinics enable row level security;
alter table user_profiles enable row level security;
alter table patients enable row level security;
alter table visits enable row level security;
alter table soap_notes enable row level security;
alter table soap_note_versions enable row level security;
alter table prescriptions enable row level security;
alter table prescription_items enable row level security;
alter table inventory_items enable row level security;
alter table inventory_batches enable row level security;
alter table stock_movements enable row level security;
alter table audit_logs enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table user_roles enable row level security;
alter table role_permissions enable row level security;

create policy organizations_select_scoped
on organizations for select
to authenticated
using (
  id = current_user_organization_id()
  or current_user_has_permission('admin:manage_users')
);

create policy clinics_select_scoped
on clinics for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and (
    id = any(current_user_clinic_ids())
    or current_user_has_permission('admin:manage_users')
    or current_user_has_role('Executive')
  )
);

create policy user_profiles_select_scoped
on user_profiles for select
to authenticated
using (
  id = auth.uid()
  or (
    organization_id = current_user_organization_id()
    and current_user_has_permission('admin:manage_users')
  )
);

create policy user_profiles_update_own
on user_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy patients_select_clinic_scoped
on patients for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('patient:read')
);

create policy patients_insert_clinic_scoped
on patients for insert
to authenticated
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('patient:create')
);

create policy visits_select_clinic_scoped
on visits for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('visit:read')
);

create policy visits_update_clinic_scoped
on visits for update
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('visit:update')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('visit:update')
);

create policy soap_notes_select_scoped
on soap_notes for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('soap:read')
);

create policy soap_notes_write_scoped
on soap_notes for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('soap:update')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('soap:update')
);

create policy soap_note_versions_select_scoped
on soap_note_versions for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('soap:read')
);

create policy soap_note_versions_insert_scoped
on soap_note_versions for insert
to authenticated
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('soap:update')
);

create policy prescriptions_select_scoped
on prescriptions for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:read')
);

create policy prescriptions_write_scoped
on prescriptions for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:update')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:update')
);

create policy prescription_items_select_scoped
on prescription_items for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:read')
);

create policy prescription_items_write_scoped
on prescription_items for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:update')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('prescription:update')
);

create policy inventory_items_manage_scoped
on inventory_items for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
);

create policy inventory_batches_manage_scoped
on inventory_batches for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
);

create policy stock_movements_manage_scoped
on stock_movements for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
)
with check (
  organization_id = current_user_organization_id()
  and clinic_id = any(current_user_clinic_ids())
  and current_user_has_permission('inventory:manage')
);

create policy audit_logs_read_restricted
on audit_logs for select
to authenticated
using (
  organization_id = current_user_organization_id()
  and (
    clinic_id is null
    or clinic_id = any(current_user_clinic_ids())
    or current_user_has_role('Executive')
  )
  and current_user_has_permission('audit_log:read')
);

create policy audit_logs_insert_scoped
on audit_logs for insert
to authenticated
with check (
  organization_id = current_user_organization_id()
  and (
    clinic_id is null
    or clinic_id = any(current_user_clinic_ids())
  )
);

create policy roles_select_scoped
on roles for select
to authenticated
using (
  organization_id is null
  or organization_id = current_user_organization_id()
);

create policy permissions_select_authenticated
on permissions for select
to authenticated
using (true);

create policy user_roles_select_scoped
on user_roles for select
to authenticated
using (
  user_id = auth.uid()
  or (
    organization_id = current_user_organization_id()
    and current_user_has_permission('admin:manage_users')
  )
);

create policy user_roles_manage_admin
on user_roles for all
to authenticated
using (
  organization_id = current_user_organization_id()
  and current_user_has_permission('admin:manage_users')
)
with check (
  organization_id = current_user_organization_id()
  and current_user_has_permission('admin:manage_users')
);

create policy role_permissions_select_authenticated
on role_permissions for select
to authenticated
using (true);
