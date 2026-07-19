# Core Foundation Security Model

Source of truth: Supabase migrations `003_rls_policies.sql`, `005_tenant_identity_memberships.sql`, and `007_rbac_helpers_policies_indexes_seed.sql`.

## Existing Implementation

### Security Principles Implemented

- Supabase Auth user id anchors `user_profiles.id`.
- Organization tenant scope is represented by `organization_id`.
- Clinic scope is represented by `clinic_id`.
- Mutable business tables use soft-delete fields.
- RLS is enabled on core clinical, RBAC, audit, membership, and settings tables.
- Helper functions are `security definer`, stable, and use `set search_path = public`.
- Migration `007` revokes helper execution from `public` and grants execution to `authenticated`.

### RLS Helper Functions

#### Migration `003` Helpers

| Function | Purpose | Uses |
| --- | --- | --- |
| `current_user_profile()` | Returns active profile row for `auth.uid()` | user profile lookup |
| `current_user_organization_id()` | Returns active user's organization id | tenant filtering |
| `current_user_clinic_ids()` | Returns primary clinic and clinic ids from active `user_roles` | clinic filtering |
| `current_user_has_role(role_name text)` | Checks active role by name through `user_roles` | executive/admin exceptions |
| `current_user_has_permission(permission_key text)` | Checks active permission through `user_roles`, `role_permissions`, and `permissions` | policy predicates |

#### Migration `007` Helpers

| Function | Purpose | Grant |
| --- | --- | --- |
| `current_user_profile_id()` | Returns active user profile id | `authenticated` |
| `is_organization_member(uuid)` | Checks `organization_memberships` or active `user_profiles.organization_id` | `authenticated` |
| `has_clinic_access(uuid, uuid)` | Checks clinic membership, primary clinic, or organization-level active role assignment | `authenticated` |
| `has_permission(text, uuid, uuid)` | Checks organization membership, clinic access, active non-expired `user_role_assignments`, active role, active permission | `authenticated` |

Compatibility Sensitive:
- Migration `003` policies use colon permission keys and `user_roles`.
- Migration `007` policies use dot permission keys and `user_role_assignments`.

### RLS Enabled Tables

Migration `003` enables RLS on:

| Area | Tables |
| --- | --- |
| Tenant and identity | `organizations`, `clinics`, `user_profiles` |
| Clinical | `patients`, `visits`, `soap_notes`, `soap_note_versions`, `prescriptions`, `prescription_items` |
| Inventory | `inventory_items`, `inventory_batches`, `stock_movements` |
| Audit | `audit_logs` |
| RBAC | `roles`, `permissions`, `user_roles`, `role_permissions` |

Migration `007` additionally enables RLS on:

| Area | Tables |
| --- | --- |
| Organization and clinic profile | `organization_profiles`, `organization_addresses`, `organization_branding`, `clinic_addresses`, `clinic_business_hours`, `clinic_settings` |
| Membership and assignment | `organization_memberships`, `clinic_memberships`, `user_role_assignments` |
| Clinical expansion | `patient_clinic_registrations`, `visit_vitals`, `diagnoses`, `visit_diagnoses` |
| Claims and evidence | `claim_readiness_assessments`, `claim_readiness_items`, `evidence_packages` |
| Settings and integrations | `organization_operational_settings`, `organization_clinical_settings`, `organization_claim_settings`, `organization_security_settings`, `organization_compliance_settings`, `system_modules`, `organization_module_settings`, `notification_event_types`, `organization_notification_settings`, `integration_providers`, `organization_integrations`, `organization_setting_versions` |

### RLS Policies from Migration `003`

| Policy | Table | Operation | Access condition summary |
| --- | --- | --- | --- |
| `organizations_select_scoped` | `organizations` | select | current organization or `admin:manage_users` |
| `clinics_select_scoped` | `clinics` | select | same organization and clinic access, admin, or Executive |
| `user_profiles_select_scoped` | `user_profiles` | select | self, or same organization with `admin:manage_users` |
| `user_profiles_update_own` | `user_profiles` | update | self only |
| `patients_select_clinic_scoped` | `patients` | select | organization, clinic, `patient:read` |
| `patients_insert_clinic_scoped` | `patients` | insert | organization, clinic, `patient:create` |
| `visits_select_clinic_scoped` | `visits` | select | organization, clinic, `visit:read` |
| `visits_update_clinic_scoped` | `visits` | update | organization, clinic, `visit:update` |
| `soap_notes_select_scoped` | `soap_notes` | select | organization, clinic, `soap:read` |
| `soap_notes_write_scoped` | `soap_notes` | all | organization, clinic, `soap:update` |
| `soap_note_versions_select_scoped` | `soap_note_versions` | select | organization, clinic, `soap:read` |
| `soap_note_versions_insert_scoped` | `soap_note_versions` | insert | organization, clinic, `soap:update` |
| `prescriptions_select_scoped` | `prescriptions` | select | organization, clinic, `prescription:read` |
| `prescriptions_write_scoped` | `prescriptions` | all | organization, clinic, `prescription:update` |
| `prescription_items_select_scoped` | `prescription_items` | select | organization, clinic, `prescription:read` |
| `prescription_items_write_scoped` | `prescription_items` | all | organization, clinic, `prescription:update` |
| `inventory_items_manage_scoped` | `inventory_items` | all | organization, clinic, `inventory:manage` |
| `inventory_batches_manage_scoped` | `inventory_batches` | all | organization, clinic, `inventory:manage` |
| `stock_movements_manage_scoped` | `stock_movements` | all | organization, clinic, `inventory:manage` |
| `audit_logs_read_restricted` | `audit_logs` | select | organization, clinic/Executive, `audit_log:read` |
| `audit_logs_insert_scoped` | `audit_logs` | insert | organization and optional clinic access |
| `roles_select_scoped` | `roles` | select | system role or same organization |
| `permissions_select_authenticated` | `permissions` | select | any authenticated user |
| `user_roles_select_scoped` | `user_roles` | select | self or organization admin |
| `user_roles_manage_admin` | `user_roles` | all | organization admin |
| `role_permissions_select_authenticated` | `role_permissions` | select | any authenticated user |

### RLS Policies from Migration `007`

Before creating `mvp1_*` policies, migration `007` drops existing policies whose names match `mvp1_%`.

| Policy | Table | Operation | Permission style |
| --- | --- | --- | --- |
| `mvp1_organizations_select` | `organizations` | select | organization membership |
| `mvp1_clinics_select` | `clinics` | select | `clinic.view` |
| `mvp1_patients_select` | `patients` | select | `patient.view` |
| `mvp1_patients_insert` | `patients` | insert | `patient.create` |
| `mvp1_patients_update` | `patients` | update | `patient.update` |
| `mvp1_visits_select` | `visits` | select | `visit.view` |
| `mvp1_visits_insert` | `visits` | insert | `visit.create` |
| `mvp1_visits_update` | `visits` | update | `visit.update_status` |
| `mvp1_soap_select` | `soap_notes` | select | `soap.view` |
| `mvp1_soap_insert` | `soap_notes` | insert | `soap.create` |
| `mvp1_soap_update` | `soap_notes` | update | `soap.update` |
| `mvp1_prescriptions_select` | `prescriptions` | select | `prescription.view` |
| `mvp1_prescriptions_insert` | `prescriptions` | insert | `prescription.create` |
| `mvp1_prescriptions_update` | `prescriptions` | update | `prescription.create` or `prescription.dispense` |
| `mvp1_inventory_select` | `inventory_items` | select | `inventory.view` |
| `mvp1_inventory_insert` | `inventory_items` | insert | `inventory.adjust` |
| `mvp1_inventory_update` | `inventory_items` | update | `inventory.adjust` |
| `mvp1_inventory_batches_select` | `inventory_batches` | select | `inventory.view` |
| `mvp1_inventory_batches_insert` | `inventory_batches` | insert | `inventory.adjust` |
| `mvp1_inventory_batches_update` | `inventory_batches` | update | `inventory.adjust` |
| `mvp1_stock_movements_select` | `stock_movements` | select | `inventory.view` |
| `mvp1_stock_movements_insert` | `stock_movements` | insert | `inventory.adjust` |
| `mvp1_claim_select` | `claim_readiness_assessments` | select | `claim.view` |
| `mvp1_claim_review` | `claim_readiness_assessments` | update | `claim.review` |
| `mvp1_evidence_select` | `evidence_packages` | select | `claim.view` |
| `mvp1_claim_items_select` | `claim_readiness_items` | select | `claim.view` |
| `mvp1_claim_items_review` | `claim_readiness_items` | update | `claim.review` |
| `mvp1_visit_vitals_select` | `visit_vitals` | select | `visit.view` |
| `mvp1_visit_vitals_insert` | `visit_vitals` | insert | `visit.update_status` |
| `mvp1_visit_vitals_update` | `visit_vitals` | update | `visit.update_status` |
| `mvp1_visit_diagnoses_select` | `visit_diagnoses` | select | `soap.view` |
| `mvp1_visit_diagnoses_insert` | `visit_diagnoses` | insert | `soap.update` |
| `mvp1_visit_diagnoses_update` | `visit_diagnoses` | update | `soap.update` |
| `mvp1_diagnoses_select` | `diagnoses` | select | organization membership |
| `mvp1_org_settings_select` | `organization_claim_settings` | select | `organization.view` |
| `mvp1_org_settings_update` | `organization_claim_settings` | update | `organization.update` |
| settings select policies | settings tables | select | `organization.view` |
| `mvp1_clinic_memberships_select` | `clinic_memberships` | select | organization and clinic access |
| `mvp1_memberships_select` | `organization_memberships` | select | organization membership |
| `mvp1_role_assignments_select` | `user_role_assignments` | select | self or `role.assign` |
| `mvp1_audit_logs_select` | `audit_logs` | select | `audit.view` |
| `mvp1_audit_logs_insert` | `audit_logs` | insert | organization member and optional clinic access |

### Access Flow

```mermaid
flowchart TD
  A[Supabase Auth auth.uid] --> B[user_profiles active row]
  B --> C[Organization membership]
  C --> D[Clinic access]
  D --> E[Active role assignment]
  E --> F[Role permissions]
  F --> G[RLS policy allows row]
```

## Identified Gaps

- Two RLS generations coexist. Migration `007` only drops prior `mvp1_%` policies, not the migration `003` policy names, so both policy families can be active.
- Permission keys are split between colon format and dot format.
- `user_roles` and `user_role_assignments` both grant access in different helper functions.
- No SQL-based RLS regression tests exist in `supabase/tests/`.
- Storage buckets are private but object-level policies are not defined.
- Some policies grant broad authenticated reads of catalog tables such as `permissions` and `role_permissions`.

## Proposed Design

- Canonicalize on one RBAC assignment model and one permission key format before live domain repositories depend on RLS.
- Prefer `user_role_assignments` for future access because it includes assignment status, expiry, assigned actor, and soft delete.
- Replace or retire older migration `003` policies after a compatibility migration and test suite confirm equivalent behavior.
- Add storage object RLS policies for `organization-assets`, `patient-documents`, `evidence-files`, `medical-certificates`, and `integration-files`.
- Add RLS tests for anonymous denial, authenticated no-profile denial, cross-organization denial, cross-clinic denial, role assignment expiry, suspended memberships, and least-privilege mutation checks.
