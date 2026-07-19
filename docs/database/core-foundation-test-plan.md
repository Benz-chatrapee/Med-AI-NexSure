# Core Foundation Test Plan

Source of truth: current Supabase migrations and repository state. This is a documentation-only test plan; no SQL tests were created in this task.

## Existing Implementation

### Current Validation Assets

Existing:
- Supabase migrations `001` through `007`.
- `supabase/config.toml` with migrations enabled.
- RLS helper functions and policies.
- Seed inserts inside migrations `002` and `007`.

Gaps in repository:
- `supabase/tests/` is absent.
- `supabase/seed.sql` is absent while config lists `./seed.sql`.
- No committed SQL test harness for RLS, grants, constraints, indexes, or seed role matrices.

### Local Validation Commands

Run from repository root.

| Command | Purpose | Expected result |
| --- | --- | --- |
| `git status --short` | Confirm working tree before/after documentation work | Shows documentation changes only |
| `supabase --version` | Verify CLI availability | CLI version prints |
| `supabase start` | Start local Supabase | API, DB, Auth, Studio, and Storage services start |
| `supabase db reset` | Apply migrations from scratch | Migrations apply in order; may fail or warn if configured `supabase/seed.sql` remains missing |
| `supabase migration list` | Check migration application state | `001` through `007` appear in order |
| `supabase db diff --local` | Check schema drift after reset | No unexpected diff |

Do not run application lint, TypeScript, tests, or build for documentation-only work.

## Required SQL Test Coverage

### Schema Existence Tests

Verify existing core tables:
- `organizations`, `clinics`, `user_profiles`
- `patients`, `visits`, `soap_notes`, `soap_note_versions`
- `prescriptions`, `prescription_items`
- `inventory_items`, `inventory_batches`, `stock_movements`
- `audit_logs`
- `roles`, `permissions`, `user_roles`, `role_permissions`
- compatibility additions: `organization_memberships`, `clinic_memberships`, `user_role_assignments`

Expected:
- Every table exists in `public`.
- Every listed table has `id uuid` primary key, except Auth-owned `auth.users`.
- Tenant-scoped tables have `organization_id`.
- Clinic-scoped tables have `clinic_id`.

### Constraint Tests

| Object | Test case | Expected result |
| --- | --- | --- |
| `organizations.name` | Insert duplicate name | Fails unique constraint |
| `organizations.code` | Insert duplicate active code after migration `005` | Fails partial unique index |
| `clinics(organization_id, code)` | Duplicate clinic code in same organization | Fails unique constraint |
| `user_profiles.email` | Duplicate email | Fails unique constraint |
| `patients.consent_status` | Insert unsupported status | Fails check constraint |
| `patients.sex_at_birth` | Insert unsupported value | Fails check constraint |
| `visits(organization_id, visit_number)` | Duplicate visit number in same organization | Fails unique constraint |
| `soap_notes.visit_id` | Insert second SOAP note for same visit | Fails unique constraint |
| `soap_note_versions.version` | Insert version 0 | Fails positive check |
| `inventory_items.reorder_level` | Insert negative reorder level | Fails check |
| `inventory_batches.quantity_on_hand` | Insert negative quantity | Fails check |
| `prescription_items.quantity` | Insert zero or negative non-null quantity | Fails check |
| `stock_movements.quantity` | Insert zero movement quantity | Fails check |
| `audit_logs.outcome` | Insert unsupported outcome | Fails check |
| `user_role_assignments.assignment_status` | Insert unsupported status | Fails check |
| `user_role_assignments.expires_at` | Expiry before assignment | Fails check |

### RLS and Authorization Tests

Test actors:
- Anonymous session.
- Authenticated user without active `user_profiles`.
- Active user in organization A clinic A.
- Active user in organization A clinic B.
- Active user in organization B.
- Organization admin.
- Clinic-scoped doctor.
- Auditor/compliance role.

| Scenario | Expected result |
| --- | --- |
| Anonymous selects patient rows | Denied |
| Authenticated user without profile selects tenant rows | Denied |
| Organization A user reads organization B patients | Denied |
| Clinic A user reads Clinic B patients without org-level role | Denied |
| User with `patient.view` reads own clinic patients | Allowed |
| User with `patient.create` inserts own clinic patient | Allowed |
| User without `patient.update` updates patient | Denied |
| Doctor with SOAP permissions reads and updates SOAP in clinic scope | Allowed |
| Pharmacist reads prescriptions and adjusts inventory per matrix | Allowed |
| Claim reviewer reads claim/evidence rows when claim tables exist | Allowed |
| Auditor reads audit rows with `audit.view` or `audit_log:read` depending policy generation | Allowed |
| Non-auditor reads audit rows | Denied |
| Expired `user_role_assignments` grants permission | Denied |
| Suspended membership grants access | Denied |

### Permission Matrix Tests

Validate both seeded generations until canonicalization:
- Migration `002` colon-key roles and permissions exist.
- Migration `007` dot-key roles and permissions exist.
- Role-permission mappings match `core-foundation-permission-matrix.md`.
- Policies using dot keys have at least one role that can satisfy each required permission.
- Policies using colon keys have at least one role that can satisfy each required permission.

### Index Presence Tests

Verify key indexes exist:
- `idx_clinics_organization_id`
- `idx_clinics_active_scope`
- `idx_user_profiles_organization_id`
- `idx_user_profiles_primary_clinic_id`
- `idx_user_profiles_email`
- `idx_roles_organization_id`
- `idx_permissions_permission_key`
- `idx_user_roles_*`
- `idx_role_permissions_*`
- patient, visit, SOAP, prescription, inventory, stock movement, and audit indexes from `004`
- `idx_organizations_code_active`
- `idx_clinics_org_code_active`
- `idx_organization_memberships_lookup`
- `idx_clinic_memberships_lookup`
- `idx_user_role_assignments_active`

### Trigger Tests

| Table group | Test | Expected result |
| --- | --- | --- |
| Core mutable tables | Update a row after a short delay | `updated_at` changes |
| RBAC tables | Update role/permission/assignment rows | `updated_at` changes |
| Membership/profile extension tables | Update rows | `updated_at` changes |

## Identified Gaps

- No executable test files exist yet.
- No fixture seed file exists for repeatable RLS actor setup.
- Current policy coexistence can make expected RLS behavior harder to reason about because permissive policies combine by default.
- PostgreSQL version mismatch should be resolved before using test results as production-readiness evidence.

## Proposed Design

Create focused SQL test files under `supabase/tests/` in a future implementation task:
- `core_schema_objects.sql`
- `core_constraints.sql`
- `core_rbac_seed_matrix.sql`
- `core_rls_organization_isolation.sql`
- `core_rls_clinic_isolation.sql`
- `core_audit_access.sql`
- `core_indexes.sql`

Each test file should:
- Use fictional data only.
- Create isolated organizations, clinics, users, memberships, roles, and permissions.
- Set authenticated context in the supported Supabase local test style.
- Assert both allowed and denied behavior.
- Avoid relying on production credentials or real PHI.

## Full Core Foundation Regression Evidence

Task: DB-P1-FULL-CORE-FOUNDATION-REGRESSION

Executable test suite status:

- `supabase/tests/001_schema_contract.sql` passed.
- `supabase/tests/002_seed_contract.sql` passed.
- `supabase/tests/003_auth_context_helpers.sql` passed.
- `supabase/tests/004_rls_baseline.sql` passed.
- `supabase/tests/005_rls_policy_consolidation.sql` passed.
- `supabase/tests/006_tenant_safe_fk_integrity.sql` passed.
- `supabase/tests/007_core_foundation_lifecycle_controls.sql` passed.
- `supabase/tests/008_controlled_role_assignment_workflow.sql` passed.
- `supabase/tests/009_core_foundation_audit_events.sql` passed.

Latest local result:

- Command: `npx supabase test db supabase/tests --local`
- Result: 9 files, 229 tests, all successful.
- Failed: 0.
- Skipped: 0 reported by the runner.

Historical gaps in this document are closed for Phase 1 Core Foundation database regression. Later-domain Patient, Visit, Clinical, Claim, Evidence, Storage, AI, and backup/restore coverage remains outside Phase 1 Core Foundation exit.
