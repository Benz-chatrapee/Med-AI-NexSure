-- Core Foundation authorization helper and SQL grant hardening.
-- Scope: helper fail-closed behavior, explicit EXECUTE privileges, table grants.
-- RLS policy predicates are intentionally not redesigned in this migration.

create or replace function public.current_user_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = public
as $$
  select up
  from public.user_profiles up
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
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
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
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
      from public.user_profiles up
      join public.organization_memberships om
        on om.user_profile_id = up.id
       and om.organization_id = p_organization_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and om.membership_status = 'active'
        and om.is_active = true
        and om.deleted_at is null
    ),
    false
  );
$$;

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.organization_id
  from public.user_profiles up
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
    and public.is_organization_member(up.organization_id)
  limit 1;
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
        from public.user_profiles up
        join public.clinic_memberships cm
          on cm.user_profile_id = up.id
         and cm.organization_id = p_organization_id
         and cm.clinic_id = p_clinic_id
        where up.id = auth.uid()
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

create or replace function public.current_user_clinic_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct cm.clinic_id), array[]::uuid[])
  from public.user_profiles up
  join public.clinic_memberships cm on cm.user_profile_id = up.id
  where up.id = auth.uid()
    and up.is_active = true
    and up.deleted_at is null
    and public.is_organization_member(cm.organization_id)
    and cm.membership_status = 'active'
    and cm.is_active = true
    and cm.deleted_at is null;
$$;

create or replace function public.current_user_has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and role_name is not null
    and exists (
      select 1
      from public.user_profiles up
      join public.user_roles ur on ur.user_id = up.id
      join public.roles r on r.id = ur.role_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and public.is_organization_member(ur.organization_id)
        and (ur.clinic_id is null or public.has_clinic_access(ur.organization_id, ur.clinic_id))
        and ur.is_active = true
        and ur.deleted_at is null
        and r.name = role_name
        and r.is_active = true
        and r.deleted_at is null
    ),
    false
  );
$$;

create or replace function public.current_user_has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.uid() is not null
    and permission_key is not null
    and exists (
      select 1
      from public.user_profiles up
      join public.user_roles ur on ur.user_id = up.id
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      join public.roles r on r.id = ur.role_id
      where up.id = auth.uid()
        and up.is_active = true
        and up.deleted_at is null
        and public.is_organization_member(ur.organization_id)
        and (ur.clinic_id is null or public.has_clinic_access(ur.organization_id, ur.clinic_id))
        and ur.is_active = true
        and ur.deleted_at is null
        and rp.is_active = true
        and rp.deleted_at is null
        and p.permission_key = permission_key
        and p.is_active = true
        and p.deleted_at is null
        and r.is_active = true
        and r.deleted_at is null
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

revoke all on function public.current_user_profile() from public, anon, authenticated;
revoke all on function public.current_user_organization_id() from public, anon, authenticated;
revoke all on function public.current_user_clinic_ids() from public, anon, authenticated;
revoke all on function public.current_user_has_role(text) from public, anon, authenticated;
revoke all on function public.current_user_has_permission(text) from public, anon, authenticated;
revoke all on function public.current_user_profile_id() from public, anon, authenticated;
revoke all on function public.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function public.has_clinic_access(uuid, uuid) from public, anon, authenticated;
revoke all on function public.has_permission(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

grant execute on function public.current_user_profile() to authenticated;
grant execute on function public.current_user_organization_id() to authenticated;
grant execute on function public.current_user_clinic_ids() to authenticated;
grant execute on function public.current_user_has_role(text) to authenticated;
grant execute on function public.current_user_has_permission(text) to authenticated;
grant execute on function public.current_user_profile_id() to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_clinic_access(uuid, uuid) to authenticated;
grant execute on function public.has_permission(text, uuid, uuid) to authenticated;

revoke all on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

revoke all on all tables in schema public from public, anon, authenticated;

grant select on table
  public.organizations,
  public.clinics,
  public.user_profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.user_roles,
  public.organization_memberships,
  public.clinic_memberships,
  public.user_role_assignments,
  public.patients,
  public.visits,
  public.soap_notes,
  public.soap_note_versions,
  public.prescriptions,
  public.prescription_items,
  public.inventory_items,
  public.inventory_batches,
  public.stock_movements,
  public.audit_logs,
  public.patient_clinic_registrations,
  public.visit_vitals,
  public.diagnoses,
  public.visit_diagnoses,
  public.claim_readiness_assessments,
  public.claim_readiness_items,
  public.evidence_packages,
  public.organization_profiles,
  public.organization_addresses,
  public.organization_branding,
  public.clinic_addresses,
  public.clinic_business_hours,
  public.clinic_settings,
  public.organization_operational_settings,
  public.organization_clinical_settings,
  public.organization_claim_settings,
  public.organization_security_settings,
  public.organization_compliance_settings,
  public.system_modules,
  public.organization_module_settings,
  public.notification_event_types,
  public.organization_notification_settings,
  public.integration_providers,
  public.organization_integrations,
  public.organization_setting_versions
to authenticated;

grant insert, update on table public.patients to authenticated;
grant insert, update on table public.visits to authenticated;
grant insert, update on table public.soap_notes to authenticated;
grant insert on table public.soap_note_versions to authenticated;
grant insert, update on table public.prescriptions to authenticated;
grant insert, update on table public.prescription_items to authenticated;
grant insert, update on table public.inventory_items to authenticated;
grant insert, update on table public.inventory_batches to authenticated;
grant insert on table public.stock_movements to authenticated;
grant insert, update on table public.visit_vitals to authenticated;
grant insert, update on table public.visit_diagnoses to authenticated;
grant update on table public.claim_readiness_assessments to authenticated;
grant update on table public.claim_readiness_items to authenticated;
grant update on table public.organization_claim_settings to authenticated;
grant insert on table public.audit_logs to authenticated;

revoke all on all sequences in schema public from public, anon, authenticated;

alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;
