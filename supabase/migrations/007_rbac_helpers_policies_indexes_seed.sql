-- Med AI NexSure MVP 1 standardized RBAC helpers, policies, indexes, seeds, and storage prep.

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  clinic_id uuid references public.clinics(id) on delete restrict,
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assignment_status text not null default 'active',
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.user_profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_user_role_assignments unique (organization_id, clinic_id, user_profile_id, role_id),
  constraint ck_user_role_assignments_status check (assignment_status in ('active', 'suspended', 'revoked')),
  constraint ck_user_role_assignments_dates check (expires_at is null or expires_at > assigned_at)
);

insert into public.user_role_assignments (
  organization_id, clinic_id, user_profile_id, role_id, assigned_at, assigned_by,
  created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, is_active
)
select
  ur.organization_id, ur.clinic_id, ur.user_id, ur.role_id, ur.assigned_at, ur.assigned_by,
  ur.created_at, ur.created_by, ur.updated_at, ur.updated_by, ur.deleted_at, ur.deleted_by, ur.is_active
from public.user_roles ur
on conflict (organization_id, clinic_id, user_profile_id, role_id) do nothing;

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
  select exists (
    select 1
    from public.organization_memberships om
    where om.user_profile_id = auth.uid()
      and om.organization_id = p_organization_id
      and om.membership_status = 'active'
      and om.is_active = true
      and om.deleted_at is null
  )
  or exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.organization_id = p_organization_id
      and up.is_active = true
      and up.deleted_at is null
  );
$$;

create or replace function public.has_clinic_access(p_organization_id uuid, p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_clinic_id is null
    or exists (
      select 1
      from public.clinic_memberships cm
      where cm.user_profile_id = auth.uid()
        and cm.organization_id = p_organization_id
        and cm.clinic_id = p_clinic_id
        and cm.membership_status = 'active'
        and cm.is_active = true
        and cm.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      where up.id = auth.uid()
        and up.organization_id = p_organization_id
        and up.primary_clinic_id = p_clinic_id
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_role_assignments ura
      join public.roles r on r.id = ura.role_id
      where ura.user_profile_id = auth.uid()
        and ura.organization_id = p_organization_id
        and ura.clinic_id is null
        and ura.assignment_status = 'active'
        and ura.is_active = true
        and ura.deleted_at is null
        and (ura.expires_at is null or ura.expires_at > now())
        and r.is_active = true
        and r.deleted_at is null
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
  select public.is_organization_member(p_organization_id)
    and public.has_clinic_access(p_organization_id, p_clinic_id)
    and exists (
      select 1
      from public.user_role_assignments ura
      join public.role_permissions rp on rp.role_id = ura.role_id
      join public.permissions p on p.id = rp.permission_id
      join public.roles r on r.id = ura.role_id
      where ura.user_profile_id = auth.uid()
        and ura.organization_id = p_organization_id
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
    );
$$;

revoke all on function public.current_user_profile_id() from public;
revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_clinic_access(uuid, uuid) from public;
revoke all on function public.has_permission(text, uuid, uuid) from public;
grant execute on function public.current_user_profile_id() to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_clinic_access(uuid, uuid) to authenticated;
grant execute on function public.has_permission(text, uuid, uuid) to authenticated;

alter table public.organization_profiles enable row level security;
alter table public.organization_addresses enable row level security;
alter table public.organization_branding enable row level security;
alter table public.clinic_addresses enable row level security;
alter table public.clinic_business_hours enable row level security;
alter table public.clinic_settings enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.clinic_memberships enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.patient_clinic_registrations enable row level security;
alter table public.visit_vitals enable row level security;
alter table public.diagnoses enable row level security;
alter table public.visit_diagnoses enable row level security;
alter table public.claim_readiness_assessments enable row level security;
alter table public.claim_readiness_items enable row level security;
alter table public.evidence_packages enable row level security;
alter table public.organization_operational_settings enable row level security;
alter table public.organization_clinical_settings enable row level security;
alter table public.organization_claim_settings enable row level security;
alter table public.organization_security_settings enable row level security;
alter table public.organization_compliance_settings enable row level security;
alter table public.system_modules enable row level security;
alter table public.organization_module_settings enable row level security;
alter table public.notification_event_types enable row level security;
alter table public.organization_notification_settings enable row level security;
alter table public.integration_providers enable row level security;
alter table public.organization_integrations enable row level security;
alter table public.organization_setting_versions enable row level security;

do $$
declare
  v record;
begin
  for v in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like 'mvp1_%'
  loop
    execute format('drop policy if exists %I on %I.%I', v.policyname, v.schemaname, v.tablename);
  end loop;
end $$;

create policy mvp1_organizations_select on public.organizations for select to authenticated
using (public.is_organization_member(id));

create policy mvp1_clinics_select on public.clinics for select to authenticated
using (public.has_clinic_access(organization_id, id) and public.has_permission('clinic.view', organization_id, id));

create policy mvp1_patients_select on public.patients for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('patient.view', organization_id, clinic_id));

create policy mvp1_patients_insert on public.patients for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('patient.create', organization_id, clinic_id));

create policy mvp1_patients_update on public.patients for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('patient.update', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('patient.update', organization_id, clinic_id));

create policy mvp1_visits_select on public.visits for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.view', organization_id, clinic_id));

create policy mvp1_visits_insert on public.visits for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.create', organization_id, clinic_id));

create policy mvp1_visits_update on public.visits for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.update_status', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.update_status', organization_id, clinic_id));

create policy mvp1_soap_select on public.soap_notes for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.view', organization_id, clinic_id));

create policy mvp1_soap_insert on public.soap_notes for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.create', organization_id, clinic_id));

create policy mvp1_soap_update on public.soap_notes for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.update', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.update', organization_id, clinic_id));

create policy mvp1_prescriptions_select on public.prescriptions for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('prescription.view', organization_id, clinic_id));

create policy mvp1_prescriptions_insert on public.prescriptions for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('prescription.create', organization_id, clinic_id));

create policy mvp1_prescriptions_update on public.prescriptions for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and (public.has_permission('prescription.create', organization_id, clinic_id) or public.has_permission('prescription.dispense', organization_id, clinic_id)))
with check (public.has_clinic_access(organization_id, clinic_id) and (public.has_permission('prescription.create', organization_id, clinic_id) or public.has_permission('prescription.dispense', organization_id, clinic_id)));

create policy mvp1_inventory_select on public.inventory_items for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.view', organization_id, clinic_id));

create policy mvp1_inventory_insert on public.inventory_items for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id));

create policy mvp1_inventory_update on public.inventory_items for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id));

create policy mvp1_inventory_batches_select on public.inventory_batches for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.view', organization_id, clinic_id));

create policy mvp1_inventory_batches_insert on public.inventory_batches for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id));

create policy mvp1_inventory_batches_update on public.inventory_batches for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id));

create policy mvp1_stock_movements_select on public.stock_movements for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.view', organization_id, clinic_id));

create policy mvp1_stock_movements_insert on public.stock_movements for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('inventory.adjust', organization_id, clinic_id));

create policy mvp1_claim_select on public.claim_readiness_assessments for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.view', organization_id, clinic_id));

create policy mvp1_claim_review on public.claim_readiness_assessments for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.review', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.review', organization_id, clinic_id));

create policy mvp1_evidence_select on public.evidence_packages for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.view', organization_id, clinic_id));

create policy mvp1_claim_items_select on public.claim_readiness_items for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.view', organization_id, clinic_id));

create policy mvp1_claim_items_review on public.claim_readiness_items for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.review', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('claim.review', organization_id, clinic_id));

create policy mvp1_visit_vitals_select on public.visit_vitals for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.view', organization_id, clinic_id));

create policy mvp1_visit_vitals_insert on public.visit_vitals for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.update_status', organization_id, clinic_id));

create policy mvp1_visit_vitals_update on public.visit_vitals for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.update_status', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('visit.update_status', organization_id, clinic_id));

create policy mvp1_visit_diagnoses_select on public.visit_diagnoses for select to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.view', organization_id, clinic_id));

create policy mvp1_visit_diagnoses_insert on public.visit_diagnoses for insert to authenticated
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.update', organization_id, clinic_id));

create policy mvp1_visit_diagnoses_update on public.visit_diagnoses for update to authenticated
using (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.update', organization_id, clinic_id))
with check (public.has_clinic_access(organization_id, clinic_id) and public.has_permission('soap.update', organization_id, clinic_id));

create policy mvp1_diagnoses_select on public.diagnoses for select to authenticated
using (public.is_organization_member(organization_id));

create policy mvp1_org_settings_select on public.organization_claim_settings for select to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('organization.view', organization_id));

create policy mvp1_org_settings_update on public.organization_claim_settings for update to authenticated
using (public.has_permission('organization.update', organization_id))
with check (public.has_permission('organization.update', organization_id));

create policy mvp1_operational_settings_select on public.organization_operational_settings for select to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('organization.view', organization_id));

create policy mvp1_clinical_settings_select on public.organization_clinical_settings for select to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('organization.view', organization_id));

create policy mvp1_security_settings_select on public.organization_security_settings for select to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('organization.view', organization_id));

create policy mvp1_compliance_settings_select on public.organization_compliance_settings for select to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('organization.view', organization_id));

create policy mvp1_clinic_memberships_select on public.clinic_memberships for select to authenticated
using (public.is_organization_member(organization_id) and public.has_clinic_access(organization_id, clinic_id));

create policy mvp1_memberships_select on public.organization_memberships for select to authenticated
using (public.is_organization_member(organization_id));

create policy mvp1_role_assignments_select on public.user_role_assignments for select to authenticated
using (user_profile_id = auth.uid() or public.has_permission('role.assign', organization_id, clinic_id));

create policy mvp1_audit_logs_select on public.audit_logs for select to authenticated
using (organization_id is not null and public.has_permission('audit.view', organization_id, clinic_id));

create policy mvp1_audit_logs_insert on public.audit_logs for insert to authenticated
with check (organization_id is not null and public.is_organization_member(organization_id) and (clinic_id is null or public.has_clinic_access(organization_id, clinic_id)));

insert into public.permissions (permission_key, description, domain)
values
  ('organization.view', 'View organization configuration.', 'organization'),
  ('organization.update', 'Update organization configuration.', 'organization'),
  ('organization.manage_security', 'Manage organization security settings.', 'organization'),
  ('clinic.view', 'View authorized clinics.', 'clinic'),
  ('clinic.create', 'Create clinics.', 'clinic'),
  ('clinic.update', 'Update clinics.', 'clinic'),
  ('patient.view', 'View patients.', 'patient'),
  ('patient.create', 'Register patients.', 'patient'),
  ('patient.update', 'Update patients.', 'patient'),
  ('visit.view', 'View visits.', 'visit'),
  ('visit.create', 'Create visits.', 'visit'),
  ('visit.update_status', 'Update visit workflow status.', 'visit'),
  ('soap.view', 'View SOAP notes.', 'soap'),
  ('soap.create', 'Create SOAP notes.', 'soap'),
  ('soap.update', 'Update SOAP notes.', 'soap'),
  ('soap.approve_ai_content', 'Accept or reject AI-assisted SOAP content.', 'soap'),
  ('prescription.view', 'View prescriptions.', 'prescription'),
  ('prescription.create', 'Create prescriptions.', 'prescription'),
  ('prescription.dispense', 'Dispense prescriptions.', 'prescription'),
  ('inventory.view', 'View inventory.', 'inventory'),
  ('inventory.adjust', 'Adjust inventory through controlled workflows.', 'inventory'),
  ('claim.view', 'View claim readiness and evidence packages.', 'claim'),
  ('claim.review', 'Review claim readiness outputs.', 'claim'),
  ('audit.view', 'View audit logs.', 'audit'),
  ('user.invite', 'Invite users.', 'rbac'),
  ('role.assign', 'Assign roles.', 'rbac')
on conflict (permission_key) do update
set description = excluded.description,
    domain = excluded.domain;

insert into public.roles (organization_id, name, description, is_system_role)
select v.organization_id, v.name, v.description, v.is_system_role
from (values
  (null::uuid, 'platform_admin', 'Platform administrator for controlled system administration.', true),
  (null::uuid, 'organization_admin', 'Organization administrator for tenant configuration and access.', true),
  (null::uuid, 'clinic_admin', 'Clinic administrator for clinic-scoped operations.', true),
  (null::uuid, 'doctor', 'Doctor responsible for clinical documentation and review.', true),
  (null::uuid, 'nurse', 'Nurse responsible for vitals and visit support.', true),
  (null::uuid, 'pharmacist', 'Pharmacist responsible for prescription dispensing and inventory.', true),
  (null::uuid, 'receptionist', 'Receptionist responsible for registration and visit creation.', true),
  (null::uuid, 'claim_reviewer', 'Reviewer for claim readiness and evidence packages.', true),
  (null::uuid, 'compliance_officer', 'Compliance officer for audit and governance review.', true),
  (null::uuid, 'auditor', 'Auditor with read-only audit access.', true),
  (null::uuid, 'executive', 'Executive oversight role.', true)
) as v(organization_id, name, description, is_system_role)
where not exists (
  select 1
  from public.roles r
  where r.organization_id is not distinct from v.organization_id
    and r.name = v.name
);

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on
  (r.name in ('platform_admin', 'organization_admin') and p.permission_key in (
    'organization.view','organization.update','organization.manage_security','clinic.view','clinic.create','clinic.update',
    'patient.view','patient.create','patient.update','visit.view','visit.create','visit.update_status',
    'soap.view','soap.create','soap.update','soap.approve_ai_content','prescription.view','prescription.create','prescription.dispense',
    'inventory.view','inventory.adjust','claim.view','claim.review','audit.view','user.invite','role.assign'
  ))
  or (r.name = 'clinic_admin' and p.permission_key in ('clinic.view','clinic.update','patient.view','patient.create','patient.update','visit.view','visit.create','visit.update_status','soap.view','prescription.view','inventory.view','claim.view'))
  or (r.name = 'doctor' and p.permission_key in ('patient.view','visit.view','soap.view','soap.create','soap.update','soap.approve_ai_content','prescription.view','prescription.create'))
  or (r.name = 'nurse' and p.permission_key in ('patient.view','visit.view','visit.update_status','soap.view'))
  or (r.name = 'pharmacist' and p.permission_key in ('prescription.view','prescription.dispense','inventory.view','inventory.adjust'))
  or (r.name = 'receptionist' and p.permission_key in ('clinic.view','patient.view','patient.create','patient.update','visit.view','visit.create'))
  or (r.name = 'claim_reviewer' and p.permission_key in ('visit.view','claim.view','claim.review'))
  or (r.name = 'compliance_officer' and p.permission_key in ('organization.view','claim.view','audit.view'))
  or (r.name = 'auditor' and p.permission_key in ('audit.view'))
  or (r.name = 'executive' and p.permission_key in ('organization.view','clinic.view','claim.view','audit.view'))
on conflict (role_id, permission_id) do nothing;

insert into public.system_modules (module_key, display_name)
values
  ('clinical_documentation', 'Clinical Documentation'),
  ('claim_readiness', 'Claim Readiness'),
  ('evidence_packages', 'Evidence Packages'),
  ('inventory', 'Inventory'),
  ('audit_compliance', 'Audit and Compliance')
on conflict (module_key) do update set display_name = excluded.display_name;

insert into public.notification_event_types (event_key, display_name)
values
  ('claim.needs_review', 'Claim Needs Review'),
  ('evidence.incomplete', 'Evidence Incomplete'),
  ('inventory.low_stock', 'Inventory Low Stock'),
  ('audit.security_event', 'Security Audit Event')
on conflict (event_key) do update set display_name = excluded.display_name;

insert into public.integration_providers (provider_key, display_name, provider_type)
values
  ('supabase_storage', 'Supabase Storage', 'storage'),
  ('payer_api_generic', 'Generic Payer API', 'payer'),
  ('webhook_generic', 'Generic Webhook', 'webhook')
on conflict (provider_key) do update set display_name = excluded.display_name, provider_type = excluded.provider_type;

create index if not exists idx_organizations_code_active on public.organizations (code) where deleted_at is null;
create index if not exists idx_clinics_org_code_active on public.clinics (organization_id, code) where deleted_at is null;
create index if not exists idx_organization_memberships_lookup on public.organization_memberships (organization_id, user_profile_id) where deleted_at is null;
create index if not exists idx_clinic_memberships_lookup on public.clinic_memberships (organization_id, clinic_id, user_profile_id) where deleted_at is null;
create index if not exists idx_user_role_assignments_active on public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id) where deleted_at is null and is_active = true;
create index if not exists idx_visits_patient_date on public.visits (organization_id, patient_id, started_at desc);
create index if not exists idx_claim_readiness_visit on public.claim_readiness_assessments (visit_id, is_current) where deleted_at is null;
create index if not exists idx_evidence_packages_visit on public.evidence_packages (visit_id, package_version desc) where deleted_at is null;
create index if not exists idx_inventory_batches_item_expiry on public.inventory_batches (inventory_item_id, expiry_date, quantity_on_hand) where deleted_at is null and quantity_on_hand > 0;
create index if not exists idx_stock_movements_item_time on public.stock_movements (inventory_item_id, created_at desc);
create index if not exists idx_audit_logs_org_time on public.audit_logs (organization_id, created_at desc);
create index if not exists idx_audit_logs_target_record on public.audit_logs (target_table, target_record_id, created_at desc);

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values
      ('organization-assets', 'organization-assets', false),
      ('patient-documents', 'patient-documents', false),
      ('evidence-files', 'evidence-files', false),
      ('medical-certificates', 'medical-certificates', false),
      ('integration-files', 'integration-files', false)
    on conflict (id) do update set public = false;
  end if;
end $$;
