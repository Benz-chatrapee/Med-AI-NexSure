-- Med AI NexSure MVP 1 RBAC schema
-- Creates scoped roles, stable permissions, and role-permission assignments.

create table roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete restrict,
  name text not null,
  description text,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint roles_org_name_unique unique (organization_id, name)
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null,
  description text,
  domain text not null,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint permissions_key_unique unique (permission_key)
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  clinic_id uuid references clinics(id) on delete restrict,
  user_id uuid not null references user_profiles(id) on delete cascade,
  role_id uuid not null references roles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint user_roles_unique unique (organization_id, clinic_id, user_id, role_id)
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references user_profiles(id),
  is_active boolean not null default true,
  constraint role_permissions_unique unique (role_id, permission_id)
);

create trigger set_roles_updated_at before update on roles
  for each row execute function set_updated_at();
create trigger set_permissions_updated_at before update on permissions
  for each row execute function set_updated_at();
create trigger set_user_roles_updated_at before update on user_roles
  for each row execute function set_updated_at();
create trigger set_role_permissions_updated_at before update on role_permissions
  for each row execute function set_updated_at();

insert into permissions (permission_key, description, domain)
values
  ('patient:read', 'Read scoped patient records.', 'patient'),
  ('patient:create', 'Create patient records in authorized scope.', 'patient'),
  ('visit:read', 'Read scoped visits.', 'visit'),
  ('visit:update', 'Update scoped visits.', 'visit'),
  ('soap:read', 'Read scoped SOAP notes.', 'soap'),
  ('soap:update', 'Create or update SOAP drafts and reviews.', 'soap'),
  ('prescription:read', 'Read scoped prescriptions.', 'prescription'),
  ('prescription:update', 'Create or update prescriptions with clinician review.', 'prescription'),
  ('inventory:manage', 'Manage clinic inventory items, batches, and movements.', 'inventory'),
  ('claim_readiness:read', 'Read claim readiness decision-support outputs.', 'claim_readiness'),
  ('evidence_package:read', 'Read scoped evidence package metadata.', 'evidence_package'),
  ('audit_log:read', 'Read scoped audit logs.', 'audit'),
  ('admin:manage_users', 'Manage users, roles, and permissions.', 'admin')
on conflict (permission_key) do nothing;

insert into roles (organization_id, name, description, is_system_role)
values
  (null, 'Admin', 'System administrator with user and configuration management permissions.', true),
  (null, 'Doctor', 'Clinician responsible for visits, SOAP notes, prescriptions, and clinical review.', true),
  (null, 'Nurse', 'Clinical operations role supporting visits and documentation workflows.', true),
  (null, 'Pharmacist', 'Medication and inventory workflow role.', true),
  (null, 'Receptionist', 'Front desk role supporting patient and visit workflows.', true),
  (null, 'Claim Reviewer', 'Insurance claim readiness and evidence review role.', true),
  (null, 'Compliance Officer', 'Audit, compliance, and governance review role.', true),
  (null, 'Executive', 'Executive dashboard and operational oversight role.', true)
on conflict (organization_id, name) do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on (
  (r.name = 'Admin') or
  (r.name = 'Doctor' and p.permission_key in ('patient:read', 'visit:read', 'visit:update', 'soap:read', 'soap:update', 'prescription:read', 'prescription:update')) or
  (r.name = 'Nurse' and p.permission_key in ('patient:read', 'visit:read', 'visit:update', 'soap:read', 'prescription:read')) or
  (r.name = 'Pharmacist' and p.permission_key in ('prescription:read', 'inventory:manage')) or
  (r.name = 'Receptionist' and p.permission_key in ('patient:read', 'patient:create', 'visit:read', 'visit:update')) or
  (r.name = 'Claim Reviewer' and p.permission_key in ('visit:read', 'claim_readiness:read', 'evidence_package:read')) or
  (r.name = 'Compliance Officer' and p.permission_key in ('audit_log:read', 'claim_readiness:read', 'evidence_package:read')) or
  (r.name = 'Executive' and p.permission_key in ('visit:read', 'claim_readiness:read', 'evidence_package:read', 'audit_log:read'))
)
on conflict (role_id, permission_id) do nothing;
