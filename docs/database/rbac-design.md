# RBAC Design

Source of truth: migrations `002_rbac.sql`, `003_rls_policies.sql`, `007_rbac_helpers_policies_indexes_seed.sql`, and completed Core Foundation documents.

## Existing Implementation

### RBAC Tables

| Table | Columns | Constraints and indexes |
| --- | --- | --- |
| `roles` | `id`, `organization_id`, `name`, `description`, `is_system_role`, audit columns | PK; FK organization; unique `(organization_id, name)`; `idx_roles_organization_id` |
| `permissions` | `id`, `permission_key`, `description`, `domain`, audit columns | PK; unique `permission_key`; `idx_permissions_permission_key` |
| `role_permissions` | `id`, `role_id`, `permission_id`, audit columns | PK; FKs role and permission; unique `(role_id, permission_id)`; indexes on role and permission |
| `user_roles` | `id`, `organization_id`, `clinic_id`, `user_id`, `role_id`, `assigned_at`, `assigned_by`, audit columns | PK; FKs organization, clinic, user profile, role; unique `(organization_id, clinic_id, user_id, role_id)`; lookup indexes |
| `user_role_assignments` | `id`, `organization_id`, `clinic_id`, `user_profile_id`, `role_id`, `assignment_status`, `assigned_at`, `assigned_by`, `expires_at`, audit columns | PK; FKs; unique `(organization_id, clinic_id, user_profile_id, role_id)`; status/date checks; `idx_user_role_assignments_active` |

### Permission Families

Migration `002` seeds colon-style permissions:

| Domain | Permissions |
| --- | --- |
| patient | `patient:read`, `patient:create` |
| visit | `visit:read`, `visit:update` |
| soap | `soap:read`, `soap:update` |
| prescription | `prescription:read`, `prescription:update` |
| inventory | `inventory:manage` |
| claim/evidence | `claim_readiness:read`, `evidence_package:read` |
| audit/admin | `audit_log:read`, `admin:manage_users` |

Migration `007` seeds dot-style permissions:

| Domain | Permissions |
| --- | --- |
| organization | `organization.view`, `organization.update`, `organization.manage_security` |
| clinic | `clinic.view`, `clinic.create`, `clinic.update` |
| patient | `patient.view`, `patient.create`, `patient.update` |
| visit | `visit.view`, `visit.create`, `visit.update_status` |
| soap | `soap.view`, `soap.create`, `soap.update`, `soap.approve_ai_content` |
| prescription | `prescription.view`, `prescription.create`, `prescription.dispense` |
| inventory | `inventory.view`, `inventory.adjust` |
| claim | `claim.view`, `claim.review` |
| audit/rbac | `audit.view`, `user.invite`, `role.assign` |

### Current Role Matrix

| Role family | Roles |
| --- | --- |
| Migration `002` title-case roles | `Admin`, `Doctor`, `Nurse`, `Pharmacist`, `Receptionist`, `Claim Reviewer`, `Compliance Officer`, `Executive` |
| Migration `007` snake-case roles | `platform_admin`, `organization_admin`, `clinic_admin`, `doctor`, `nurse`, `pharmacist`, `receptionist`, `claim_reviewer`, `compliance_officer`, `auditor`, `executive` |

Migration `007` role summary:

| Role | Permission summary |
| --- | --- |
| `platform_admin`, `organization_admin` | Full seeded dot-permission set |
| `clinic_admin` | Clinic, patient, visit, SOAP view, prescription view, inventory view, claim view |
| `doctor` | Patient/visit view, SOAP create/update/AI approval, prescription view/create |
| `nurse` | Patient view, visit view/status update, SOAP view |
| `pharmacist` | Prescription view/dispense, inventory view/adjust |
| `receptionist` | Clinic view, patient create/update/view, visit create/view |
| `claim_reviewer` | Visit view, claim view/review |
| `compliance_officer` | Organization view, claim view, audit view |
| `auditor` | Audit view |
| `executive` | Organization view, clinic view, claim view, audit view |

## Identified Gaps

- Two role assignment models coexist.
- Two permission namespaces coexist.
- Two role naming conventions coexist.
- `platform_admin` and `organization_admin` currently receive the same seeded permissions.
- `soap.approve_ai_content` exists but RLS update policies for SOAP/diagnosis use `soap.update`.
- No executable permission matrix SQL tests exist.

## Proposed Design

Proposed:
- Canonicalize on dot-style permissions and snake-case roles if migration `007` is selected as the future policy family.
- Canonicalize on `user_role_assignments` after compatibility migration and tests.
- Preserve legacy `user_roles` and colon permissions until all policies and application code no longer depend on them.
- Add high-risk permissions for future workflows only as Proposed until migrations exist: `clinical.sign`, `clinical.amend`, `document.download`, `evidence.approve`, `audit.export`, `prescription.override_safety_alert`.

Related references:
- [Core Foundation Permission Matrix](core-foundation-permission-matrix.md)
- [User Profile Specification](user-profile-spec.md)
