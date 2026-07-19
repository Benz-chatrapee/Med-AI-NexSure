# Core Foundation Schema Review

Task: DB-P1-CORE-SCHEMA-REVIEW
Status vocabulary: Existing Compliant, Existing Non-compliant, Existing Compatibility Sensitive, Missing, Planned, Future, Review Required

## 1. Executive Summary

The Core Foundation schema is partially implemented through Supabase migrations `001_core_schema.sql` through `007_rbac_helpers_policies_indexes_seed.sql`. The core tenant root, clinic boundary, application identity, legacy RBAC catalog, newer membership tables, newer role assignment table, RLS helpers, RLS policies, grants, constraints, indexes, and seed catalog inserts are present.

Implementation readiness is Review Required. The foundation is not ready for production tenant isolation until compatibility and security gaps are remediated. The highest-risk gaps are overlapping RBAC assignment models, overlapping RLS policy generations, split permission-key formats, missing explicit write policies for membership and assignment administration, no self-assignment denial control, no executable RLS test suite, and insufficient tenant-safe composite foreign keys across several cross-tenant relationships.

Tenant isolation is directionally implemented, but not yet proven. Newer helpers derive identity from `auth.uid()` and check active membership, clinic access, active assignments, and expiry. Older helpers also remain active and depend on `user_roles`, colon permissions, and implicit function grants. Because PostgreSQL RLS policies are permissive by default, coexistence of policy families must be treated as Existing Compatibility Sensitive with High security impact.

No executable database or application code was changed by this review.

## 2. Evidence Reviewed

Read fully:

| Evidence | Status | Notes |
|---|---|---|
| `AGENTS.md` | Existing Compliant | Governance and database/security constraints reviewed. |
| `.agents/orchestrator.md` | Existing Compliant | Database plus Compliance, QA for final matrix. |
| `.agents/database.md` | Existing Compliant | Database engineering rules reviewed. |
| `.agents/compliance.md` | Existing Compliant | Security, PDPA, audit, RBAC, RLS priorities reviewed. |
| `.agents/qa.md` | Existing Compliant | Test-gap classification and release risk reviewed. |
| `docs/database/core-foundation-spec.md` | Existing Compliant | Approved foundation inventory and known gaps reviewed. |
| `docs/database/core-foundation-security-model.md` | Existing Compliant | Helper, RLS, and policy drift reviewed. |
| `docs/database/core-foundation-permission-matrix.md` | Existing Compliant | Permission catalog, canonical mapping, and role matrix reviewed. |
| `docs/database/record-state-machines.md` | Existing Compliant | Lifecycle vocabulary and professional authority boundary reviewed. |
| `docs/database/database-access-grant-model.md` | Missing | Requested source file was not present in `docs/database/`. |

Repository evidence:

| Evidence | Status | Notes |
|---|---|---|
| `supabase/migrations/001_core_schema.sql` | Existing Compliant | Core tables, enums, trigger function. |
| `supabase/migrations/002_rbac.sql` | Existing Compatibility Sensitive | Legacy roles, permissions, and `user_roles`. |
| `supabase/migrations/003_rls_policies.sql` | Existing Compatibility Sensitive | Legacy helpers and policies. |
| `supabase/migrations/004_indexes.sql` | Existing Compliant | Core lookup, join, tenant, and dashboard indexes. |
| `supabase/migrations/005_tenant_identity_memberships.sql` | Existing Compatibility Sensitive | Adds memberships and tenant-safe additions while preserving legacy profile assumptions. |
| `supabase/migrations/006_clinical_claim_settings_tables.sql` | Existing Compatibility Sensitive | Adds related clinical/claim tables referenced by Core policies. |
| `supabase/migrations/007_rbac_helpers_policies_indexes_seed.sql` | Existing Compatibility Sensitive | Adds newer helpers, assignments, dot permissions, policies, indexes, seed inserts, storage buckets. |
| `supabase/seed.sql` | Missing | No standalone seed file exists. |
| `supabase/tests/` | Missing | No SQL test suite exists. |
| Generated Supabase types | Review Required | No generated type file was verified in the allowed evidence pass. |
| Application references | Existing Compatibility Sensitive | App is mostly mock/static; browser Supabase client exists; user-management roles and permission labels use app-local constants. |

## 3. Current Object Inventory

| Object | Type | Status | Evidence |
|---|---|---|---|
| `organizations` | table | Existing Compatibility Sensitive | Present in `001`, extended in `005`; lacks constrained lifecycle statuses beyond `is_active`, `deleted_at`. |
| `clinics` | table | Existing Compatibility Sensitive | Present in `001`, extended in `005`; tenant-safe `(organization_id, id)` exists. |
| `user_profiles` | table | Existing Compatibility Sensitive | Application identity is one-to-one with `auth.users`; `organization_id` remains a default/legacy owner-like context. |
| `clinic_users` | table | Missing | Approved review scope mentions it, but repository uses `clinic_memberships` instead. |
| `roles` | table | Existing Compatibility Sensitive | System roles exist in title case and snake case; `organization_id` nullable for system roles. |
| `permissions` | table | Existing Compatibility Sensitive | Colon and dot permission keys coexist. |
| `role_permissions` | table | Existing Compatibility Sensitive | Unique role/permission exists; broad authenticated select exists. |
| `user_roles` | table | Existing Compatibility Sensitive | Legacy role assignment table used by `003` helpers and policies. |
| `organization_memberships` | table | Existing Compatibility Sensitive | Newer explicit membership exists with active/suspended/revoked/invited statuses. |
| `clinic_memberships` | table | Existing Compatibility Sensitive | Newer explicit clinic membership exists with tenant-safe clinic FK. |
| `user_role_assignments` | table | Existing Compatibility Sensitive | Newer assignment model exists with status and expiry but no manage policies. |
| `current_user_*` helpers from `003` | functions | Existing Compatibility Sensitive | Security definer, fixed search path, use `user_roles`; no explicit revoke/grant block found. |
| `current_user_profile_id`, `is_organization_member`, `has_clinic_access`, `has_permission` | functions | Existing Compatibility Sensitive | Newer helpers granted only to authenticated, but accept tenant parameters and require tests. |
| RLS policies | policies | Existing Compatibility Sensitive | Legacy and `mvp1_*` policies coexist on shared tables. |
| SQL grants | grants | Existing Non-compliant | Newer helper grants exist; table grants and older helper grants are not explicitly aligned in reviewed migrations. |
| Indexes | indexes | Existing Compatibility Sensitive | Core indexes exist; some tenant-safe and expiry filters are incomplete. |
| Constraints | constraints | Existing Compatibility Sensitive | Core uniqueness and checks exist; several tenant-safe relationship checks are missing. |
| Triggers | triggers | Existing Compliant | `set_updated_at()` triggers exist on mutable tables. |
| Seed records | migration seed inserts | Existing Compatibility Sensitive | Seed catalog inserts are in migrations; standalone seed file is missing. |
| Database tests | tests | Missing | `supabase/tests/` absent. |

## 4. Domain Ownership Decisions

| Question | Decision | Status |
|---|---|---|
| Which table owns application identity? | `user_profiles` owns application identity; `auth.users` owns authentication. | Existing Compliant |
| Which object owns organization membership? | Target is `organization_memberships`; `user_profiles.organization_id` remains compatibility/default context. | Existing Compatibility Sensitive |
| Which object owns clinic membership? | Target is `clinic_memberships`; `primary_clinic_id` and legacy `user_roles.clinic_id` remain compatibility paths. | Existing Compatibility Sensitive |
| Which object owns role assignment? | Target should be `user_role_assignments`; `user_roles` remains legacy and active. | Review Required |
| Does `user_profiles.organization_id` represent ownership, membership, or default context? | In current schema it behaves as a tenant/default context and fallback membership; target should treat membership as explicit. | Existing Compatibility Sensitive |
| Are `clinic_users` and `user_roles` overlapping? | `clinic_users` is Missing. `clinic_memberships` and `user_roles` overlap for clinic access. | Existing Compatibility Sensitive |
| Can a user belong to multiple organizations or clinics? | Multiple memberships are possible through `organization_memberships` and `clinic_memberships`; `user_profiles.organization_id` still limits default context. | Existing Compatibility Sensitive |
| Are ownership boundaries consistent? | Partially. Tenant roots exist, but relationship constraints and helper/policy drift need hardening. | Review Required |

## 5. Organization and Clinic Lifecycle

`organizations` and `clinics` currently use `is_active`, `deleted_at`, and `deleted_by`; canonical lifecycle values `active`, `suspended`, `closed`, `archived`, and `soft_deleted` are not constrained status fields. Memberships use `active`, `suspended`, `revoked`, plus `invited` for organization membership.

| Lifecycle requirement | Current state | Status | Gap |
|---|---|---|---|
| Active permits normal authorization | Helpers check active profile and active memberships/assignments. | Existing Compliant | Must be covered by tests. |
| Suspended organization/clinic fails closed | No explicit organization/clinic `suspended` state exists. | Missing | Add lifecycle status constraints and helper checks. |
| Closed organization/clinic preserves history | `deleted_at` supports soft deletion; no closed/archive vocabulary exists. | Planned | Closure semantics and audit requirements need migration. |
| Suspended clinics cannot create visits | No explicit clinic suspended state; insert policies check access and permission only. | Missing | Add lifecycle check to helpers or insert policies. |
| Lifecycle changes require audit | Audit table exists; no lifecycle audit trigger/helper verified. | Missing | Add controlled lifecycle function or audit trigger. |
| Lifecycle values constrained | Only membership statuses and booleans are constrained. | Existing Non-compliant | Add constrained organization/clinic status vocabulary. |

## 6. Identity and Membership Review

| Requirement | Current state | Status |
|---|---|---|
| `auth.users` is authentication source of truth | `user_profiles.id` references `auth.users(id)` with `on delete cascade`. | Existing Compliant |
| `user_profiles` is application identity | Present and used by helpers. | Existing Compliant |
| Auth user/profile relationship is one-to-one | PK/FK on `user_profiles.id`. | Existing Compliant |
| Missing-profile behavior fails closed | Helper selects active profile by `auth.uid()`; no row means false/null policy behavior. | Existing Compliant |
| Inactive profile behavior fails closed | Helpers require `is_active = true` and `deleted_at is null`. | Existing Compliant |
| Deleted auth user behavior defined | `on delete cascade` removes profile and cascades membership/assignment where configured. | Existing Compatibility Sensitive |
| Email not relational identity | FKs use UUIDs; email has a unique constraint but no reviewed FK usage. | Existing Compliant |
| Profile metadata avoids secrets/PHI | Core profile has email and professional-like fields; no secret columns found. | Existing Compatibility Sensitive |
| Membership explicit and revocable | `organization_memberships` and `clinic_memberships` have statuses; legacy fallback still exists. | Existing Compatibility Sensitive |

Stale-session cases:

| Case | Current behavior | Status |
|---|---|---|
| Profile deactivated after login | Helpers re-read database state by `auth.uid()`. | Existing Compliant |
| Clinic membership revoked after login | Newer helper checks membership status; older helper can still use `primary_clinic_id` or legacy `user_roles`. | Existing Compatibility Sensitive |
| Role expires after login | Newer helper checks `expires_at`; legacy helper has no expiry. | Existing Compatibility Sensitive |
| Organization suspended after login | No organization suspended state exists. | Missing |

## 7. Identifier Review

| Identifier | Current state | Status |
|---|---|---|
| UUID primary keys | Core tables use UUID PKs with `gen_random_uuid()` or `auth.users` UUID. | Existing Compliant |
| `organization_code` | Implemented as `organizations.code`; partial unique where `deleted_at is null`. | Existing Compatibility Sensitive |
| `clinic_code` | Implemented as `clinics.code`; unique `(organization_id, code)`. | Existing Compliant |
| `role_code` | Missing; `roles.name` is used as identifier. | Existing Compatibility Sensitive |
| `permission_code` | Implemented as `permissions.permission_key`. | Existing Compatibility Sensitive |
| Business IDs separate from UUIDs | Organization, clinic, patient, visit identifiers are separate. | Existing Compliant |
| Uniqueness scope explicit | Mostly explicit; roles with `organization_id null` depend on NULL uniqueness behavior and insert `where not exists`. | Existing Compatibility Sensitive |
| Immutable/controlled identifiers | No immutable trigger/control found. | Missing |
| No `MAX()+1` strategy | No `MAX()+1` pattern found in migrations. | Existing Compliant |
| Concurrent creation safe | UUID safe; business code generation/backfill is migration-only and not workflow-safe for future creates. | Review Required |
| Identifiers not reused | Partial unique `organizations.code` permits reuse after soft delete. | Existing Compatibility Sensitive |
| Frontend values cannot establish ownership | RLS checks tenant scope, but insert policies still accept row tenant fields subject to helper checks. | Existing Compatibility Sensitive |

## 8. Tenant-safe Relationship Review

| Relationship | Current state | Status | Gap |
|---|---|---|---|
| Clinic to organization | `clinics.organization_id -> organizations.id`; `(organization_id,id)` unique added. | Existing Compliant | None. |
| Profile to auth user | `user_profiles.id -> auth.users.id`. | Existing Compliant | None. |
| Profile primary clinic | Tenant-safe FK `(organization_id, primary_clinic_id) -> clinics(organization_id,id)`. | Existing Compliant | None. |
| Clinic membership to user and clinic | Tenant-safe clinic FK and user FK exist. | Existing Compliant | No composite FK tying profile to same organization. |
| Legacy `user_roles` to user, role, organization, clinic | Single-column FKs exist. | Existing Non-compliant | No tenant-safe composite FK for clinic, user profile organization, or role organization/system role compatibility. |
| `user_role_assignments` to user, role, organization, clinic | Single-column FKs exist. | Existing Non-compliant | No tenant-safe composite FK for clinic, user profile organization, or role organization/system role compatibility. |
| Role permission to role and permission | FKs and uniqueness exist. | Existing Compatibility Sensitive | No authority workflow prevents tenant role granting platform/system-like permissions. |
| Patient/visit/clinical children | Many tenant fields exist; several FKs do not enforce same organization/clinic as parent. | Existing Non-compliant | Needs composite FK or trigger hardening. |

Preflight checks before tenant-safe constraints: duplicate memberships/assignments, profiles whose `organization_id` conflicts with memberships, role assignments whose role belongs to another organization, clinic IDs whose organization differs from row `organization_id`, patient/visit/clinical child rows with cross-tenant parent references, null tenant boundaries, and orphaned FKs.

## 9. RBAC and Assignment Scope Review

Canonical permission format is `module.resource.action`. Current implementation is split:

| Existing style | Examples | Status |
|---|---|---|
| Colon legacy | `patient:read`, `admin:manage_users`, `audit_log:read` | Existing Compatibility Sensitive |
| Dot MVP1 | `patient.view`, `visit.update_status`, `role.assign` | Existing Compatibility Sensitive |
| Canonical future | `clinical.soap.sign`, `claim.evidence.export`, `audit.event.read` | Planned |

| Requirement | Current state | Status |
|---|---|---|
| Platform, organization, clinic scope | Organization and clinic scopes exist; platform/department/care_team/claim_case/audit_case are not modeled. | Existing Compatibility Sensitive |
| System roles vs tenant-defined roles | `roles.is_system_role`; system roles use `organization_id null`. | Existing Compatibility Sensitive |
| Platform roles cannot be assigned by tenant admins | No explicit assignment policy/function prevents it. | Missing |
| Role self-assignment denied | No explicit denial policy/function found. | Missing |
| Permission self-assignment denied | No write policy exists for `role_permissions`, but no controlled admin flow was verified. | Review Required |
| Start and expiry dates | Newer `user_role_assignments` has `assigned_at` and `expires_at`. Legacy `user_roles` has no expiry. | Existing Compatibility Sensitive |
| Revocation state and reason | Assignment status exists; no revocation reason column. | Existing Non-compliant |
| Active assignment state | `assignment_status`, `is_active`, `deleted_at` exist in newer model. | Existing Compliant |
| Organization and clinic scope consistency | Helpers check access; constraints incomplete. | Existing Compatibility Sensitive |
| No wildcard permissions | No wildcard keys found. | Existing Compliant |
| Admin authority does not imply professional authority | Not enforced; credentials/scope are Future. | Existing Non-compliant |

Compatibility mapping for conflicting existing permission keys:

| Existing key | Target canonical key | Status |
|---|---|---|
| `patient:read`, `patient.view` | `patient.record.read` or approved patient-domain canonical key | Review Required |
| `patient:create`, `patient.create` | `patient.record.create` | Review Required |
| `patient.update` | `patient.record.update` | Review Required |
| `visit:read`, `visit.view` | `clinical.visit.read` | Review Required |
| `visit:update`, `visit.update_status` | `clinical.visit.update_status` | Review Required |
| `soap:read`, `soap.view` | `clinical.soap.read` | Existing Compatibility Sensitive |
| `soap:update`, `soap.update` | `clinical.soap.update` plus future sign/amend/void split | Existing Compatibility Sensitive |
| `prescription:read`, `prescription.view` | `prescription.order.read` | Existing Compatibility Sensitive |
| `prescription:update`, `prescription.create` | `prescription.order.create/update` | Existing Compatibility Sensitive |
| `claim_readiness:read`, `claim.view` | `claim.readiness.read` and `claim.evidence.read` | Existing Compatibility Sensitive |
| `audit_log:read`, `audit.view` | `audit.event.read` | Existing Compatibility Sensitive |
| `admin:manage_users`, `role.assign`, `user.invite` | split user/role/permission admin keys | Existing Compatibility Sensitive |

## 10. Professional-authority Boundary

RBAC permission is not proof of professional authority. Current Core Foundation can identify a user, organization, clinic, role, permission, and active assignment, but it does not enforce professional credential verification, issuing authority, credential expiry, suspension/revocation, or professional scope.

| Future concept | Current readiness | Status |
|---|---|---|
| `professional_credentials` | No table, FK, policy, or helper. | Future |
| Credential verification status | No table or status. | Future |
| Issuing authority | No table or column. | Future |
| Expiration | Only role assignment expiry exists. | Future |
| Suspension/revocation | Membership and assignment statuses exist; not professional credential status. | Future |
| Professional scope | No action-specific clinical scope table. | Future |

High-risk clinical actions such as SOAP signing, diagnosis confirmation, prescribing, dispensing verification, medical certificate issuance, and medication safety overrides are not production-ready until professional authority controls are added in a later phase.

## 11. Authorization-helper Review

| Helper | Purpose | Arguments | Return | Security | Grants | Tables read | Behavior and risks | Status |
|---|---|---:|---|---|---|---|---|---|
| `current_user_profile()` | Return active profile row | none | `user_profiles` | SECURITY DEFINER, `search_path=public` | No explicit revoke/grant found | `user_profiles` | Derives from `auth.uid()`, inactive/deleted fail closed; composite return type may expose columns if executable. | Existing Compatibility Sensitive |
| `current_user_organization_id()` | Return active profile org | none | `uuid` | SECURITY DEFINER, `search_path=public` | No explicit revoke/grant found | `user_profiles` | Fails null on missing/inactive; uses profile org as tenant source. | Existing Compatibility Sensitive |
| `current_user_clinic_ids()` | Return primary and legacy role clinics | none | `uuid[]` | SECURITY DEFINER, `search_path=public` | No explicit revoke/grant found | `user_profiles`, `user_roles` | Ignores `clinic_memberships`; no role expiry. | Existing Compatibility Sensitive |
| `current_user_has_role(text)` | Check legacy role name | role name | `boolean` | SECURITY DEFINER, `search_path=public` | No explicit revoke/grant found | `user_roles`, `roles` | Role-name based; no org/clinic argument; no expiry. | Existing Compatibility Sensitive |
| `current_user_has_permission(text)` | Check legacy permission | permission key | `boolean` | SECURITY DEFINER, `search_path=public` | No explicit revoke/grant found | `user_roles`, `role_permissions`, `permissions` | Uses legacy assignment and colon keys; no expiry or tenant argument. | Existing Compatibility Sensitive |
| `current_user_profile_id()` | Return active profile UUID | none | `uuid` | SECURITY DEFINER, `search_path=public` | Public revoked, authenticated granted | `user_profiles` | Fails null on missing/inactive. | Existing Compliant |
| `is_organization_member(uuid)` | Check org membership or active profile fallback | organization ID | `boolean` | SECURITY DEFINER, `search_path=public` | Public revoked, authenticated granted | `organization_memberships`, `user_profiles` | Accepts tenant arg but derives user from `auth.uid()`; fallback to profile org is compatibility sensitive. | Existing Compatibility Sensitive |
| `has_clinic_access(uuid, uuid)` | Check clinic access | organization ID, clinic ID | `boolean` | SECURITY DEFINER, `search_path=public` | Public revoked, authenticated granted | `clinic_memberships`, `user_profiles`, `user_role_assignments`, `roles` | `p_clinic_id is null` returns true; org-level active assignment grants all clinics. Needs test coverage. | Existing Compatibility Sensitive |
| `has_permission(text, uuid, uuid)` | Check permission in scope | key, org ID, clinic ID | `boolean` | SECURITY DEFINER, `search_path=public` | Public revoked, authenticated granted | memberships, assignments, roles, role_permissions, permissions | Checks active membership, clinic access, active non-expired assignment, active permission. Compatibility-sensitive because caller supplies tenant and key. | Existing Compatibility Sensitive |
| `assert_claim_readiness_weights()` | Enforce six readiness weights total 100 | trigger | `trigger` | INVOKER/default, `search_path=public` | Not applicable | `claim_readiness_items` | Not an auth helper; included because it is a SECURITY-relevant integrity trigger. | Existing Compliant |

Required hardening: explicitly revoke/grant older helpers, retire legacy helpers after migration, test null behavior, test expired/revoked access, avoid exposing composite profile helper broadly, and ensure helper owners are controlled by migration role.

## 12. RLS and Grant Review

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Status | Risk |
|---|---|---|---|---|---|---|---|
| `organizations` | enabled | legacy and `mvp1` select | none | none | none | Existing Compatibility Sensitive | Dual policies; suspended lifecycle missing. |
| `clinics` | enabled | legacy and `mvp1` select | none | none | none | Existing Compatibility Sensitive | Dual policies; no suspended clinic check. |
| `user_profiles` | enabled | self/admin legacy | none | self update | none | Existing Non-compliant | Users can update own profile; tenant fields may be protected only by WITH CHECK `id=auth.uid()`, not column-level restrictions. |
| `organization_memberships` | enabled | `mvp1` select | none | none | none | Existing Compatibility Sensitive | Read only; no controlled mutation flow in DB. |
| `clinic_memberships` | enabled | `mvp1` select | none | none | none | Existing Compatibility Sensitive | Read only; no controlled mutation flow in DB. |
| `roles` | enabled | legacy select | none | none | none | Existing Compatibility Sensitive | No tenant-defined role mutation policy verified. |
| `permissions` | enabled | broad authenticated select | none | none | none | Existing Compatibility Sensitive | Catalogue visibility may be acceptable but must be approved. |
| `role_permissions` | enabled | broad authenticated select | none | none | none | Existing Compatibility Sensitive | Permission catalogue mapping visible to all authenticated users. |
| `user_roles` | enabled | self/admin legacy | admin all legacy | admin all legacy | admin all legacy | Existing Non-compliant | Legacy admin policy can manage assignments; no self-assignment/platform-role denial. |
| `user_role_assignments` | enabled | self or `role.assign` | none | none | none | Existing Compatibility Sensitive | New model cannot be managed via RLS; likely server-only missing function. |
| `audit_logs` | enabled | legacy and `mvp1` select | legacy and `mvp1` insert | none | none | Existing Compatibility Sensitive | Insert allowed by authenticated org member; append-only for normal users is good, but write details are not controlled through an audit helper. |

SQL grants: newer helper function grants are explicit. No table-level grant alignment was found in reviewed migrations. Older helper functions do not include explicit revoke from `public`, which is High risk until confirmed by database introspection.

Explicit checks:

| Check | Result | Status |
|---|---|---|
| Users cannot change tenant scope | Not guaranteed for `user_profiles_update_own`; other table policies use WITH CHECK. | Existing Non-compliant |
| Users cannot assign themselves roles | Not explicitly enforced. | Missing |
| Tenant admins cannot access another tenant | Intended by helpers; unproven due dual policies. | Existing Compatibility Sensitive |
| Clinic admins cannot access unrelated clinics | Intended by clinic helpers; unproven due fallback paths. | Existing Compatibility Sensitive |
| Normal users cannot mutate permission catalogues | No write policies found. | Existing Compliant |
| Auditors remain read-only | Seeded `auditor` only has `audit.view`; needs RLS tests. | Existing Compatibility Sensitive |
| `service_role` server-only | No browser service-role key found in allowed static scan; Supabase browser uses anon key. | Existing Compliant |
| Sensitive functions not executable by public | Newer helpers yes; older helpers Review Required. | Existing Compatibility Sensitive |

## 13. Constraint and Data-cleanup Review

| Constraint area | Current state | Status | Preflight checks |
|---|---|---|---|
| Organization-code uniqueness | Partial unique `(code) where deleted_at is null`. | Existing Compatibility Sensitive | Duplicate active codes, null codes, soft-deleted code reuse. |
| Clinic-code uniqueness | Unique `(organization_id, code)`. | Existing Compliant | Duplicate org/code, null org/code, orphan orgs. |
| Profile-to-auth uniqueness | PK/FK `id -> auth.users(id)`. | Existing Compliant | Orphan profiles, deleted auth users, duplicate email. |
| Role-code/name uniqueness | Unique `(organization_id, name)`; NULL org system roles need extra care. | Existing Compatibility Sensitive | Duplicate system role names, tenant roles shadowing system roles. |
| Permission-code uniqueness | Unique `permission_key`. | Existing Compliant | Duplicate colon/dot semantic equivalents. |
| Role-permission uniqueness | Unique `(role_id, permission_id)`. | Existing Compliant | Orphan role/permission links, disabled links. |
| Clinic-membership uniqueness | Unique `(organization_id, clinic_id, user_profile_id)`. | Existing Compliant | Cross-org profile memberships, revoked duplicates after soft delete. |
| Role-assignment uniqueness | Unique in both assignment tables. | Existing Compatibility Sensitive | Duplicate legacy/new assignments, conflicting statuses, null clinic uniqueness behavior. |
| Valid lifecycle values | Membership and assignment statuses constrained; org/clinic lifecycle missing. | Existing Non-compliant | Invalid booleans are impossible; missing lifecycle rows need mapping. |
| Effective dates | New role assignment `expires_at > assigned_at`; no `starts_at`. | Existing Non-compliant | Expired active assignments, null assigned_at, contradictory status/date. |
| Tenant-safe relationships | Partial. | Existing Non-compliant | Cross-tenant clinics, profiles, roles, visits, clinical child rows. |
| Soft-delete consistency | `deleted_at`, `deleted_by`, `is_active` coexist without consistency check. | Existing Compatibility Sensitive | Rows with `deleted_at` and `is_active=true`; deleted_by null when deleted. |

## 14. Index Review

| Access pattern | Evidence | Status | Gap |
|---|---|---|---|
| Organization lookup | `idx_organizations_code_active`, unique code partial. | Existing Compliant | None. |
| Clinic lookup | `idx_clinics_organization_id`, `idx_clinics_active_scope`, `idx_clinics_org_code_active`. | Existing Compliant | None. |
| Auth user to profile | PK on `user_profiles.id`; org/email indexes. | Existing Compliant | None. |
| Active membership | `idx_organization_memberships_lookup`, `idx_clinic_memberships_lookup` where `deleted_at is null`. | Existing Compatibility Sensitive | Does not include `membership_status` or `is_active` predicate. |
| Active role assignment | `idx_user_role_assignments_active` where `deleted_at is null and is_active = true`. | Existing Compatibility Sensitive | Does not include `assignment_status` or `expires_at`; clinic null scope queries may need separate index. |
| Permission lookup | Unique `permissions.permission_key`, `idx_permissions_permission_key`. | Existing Compliant | Index overlaps unique constraint. |
| Role-permission joins | `idx_role_permissions_role_id`, `idx_role_permissions_permission_id`. | Existing Compliant | None. |
| RLS helpers | Membership, role assignment, permission indexes exist. | Existing Compatibility Sensitive | Legacy `user_roles` lacks active partial composite matching helper. |
| Soft-delete filters | Several partial indexes use `deleted_at is null`. | Existing Compatibility Sensitive | Not consistent across all Core tables. |
| Effective-date filters | No role-expiry-focused index. | Missing | Add index support for active non-expired assignments if query plans require. |

## 15. Seed Review

Seed data is implemented through migrations `002` and `007`, not `supabase/seed.sql`.

| Seed requirement | Current state | Status |
|---|---|---|
| Determinism | Permission/role inserts use fixed keys/names; UUIDs generated. | Existing Compatibility Sensitive |
| Idempotency | `on conflict` and `where not exists` used. | Existing Compliant |
| Canonical role and permission keys | Two catalogs exist; canonical future keys are not fully seeded. | Existing Compatibility Sensitive |
| Development-only identities | No standalone seed identities found. | Existing Compliant |
| No real PHI | No PHI seed file exists; migration comments warn synthetic/demo-safe. | Existing Compliant |
| No real credentials | No credentials found in reviewed seed inserts. | Existing Compliant |
| No excessive privileges | `platform_admin` and `organization_admin` share same broad permission set. | Existing Non-compliant |

## 16. Test-gap Matrix

| Test area | Current state | Classification | Required test |
|---|---|---|---|
| Organization isolation | No SQL tests found. | Missing | Cross-org select/insert/update denial. |
| Clinic isolation | No SQL tests found. | Missing | Cross-clinic denial for clinic-scoped users. |
| Inactive profiles | No SQL tests found. | Missing | Active session with deactivated profile fails closed. |
| Revoked memberships | No SQL tests found. | Missing | Revoked org/clinic membership loses access. |
| Expired assignments | No SQL tests found. | Missing | `expires_at <= now()` denies permissions. |
| Role self-assignment | No policy/function exists. | Blocked | Add controlled assignment path, then test self-denial. |
| Permission escalation | No write path exists for new model; legacy admin all exists. | Review Required | Tenant admin cannot grant self/platform/system permissions. |
| Admin scope | No SQL tests found. | Missing | Platform vs org vs clinic admin boundaries. |
| Anonymous denial | No SQL tests found. | Missing | Anonymous cannot read/mutate Core tables. |
| RLS policy composition | Dual policies exist. | Missing | Confirm permissive composition does not widen access. |
| Helper failure behavior | No SQL tests found. | Missing | Null tenant, no profile, inactive profile, deleted rows. |
| SECURITY DEFINER safety | No lint/test evidence. | Missing | Verify owner, grants, search_path, no recursive RLS. |
| Grants | No table grant tests found. | Missing | Authenticated and anon grants align with RLS. |
| Duplicate assignment | Unique constraints exist; no tests found. | Missing | Duplicate legacy/new assignment rejected or normalized. |
| Concurrency | UUID and unique constraints exist; no tests found. | Missing | Concurrent business identifier and assignment creation. |
| Seed idempotency | Migration conflict handling exists; no tests found. | Existing Incomplete | Re-run migration/seed catalog idempotency in local DB. |

## 17. Application Compatibility

Allowed static scan found:

| Area | Evidence | Status | Compatibility note |
|---|---|---|---|
| Browser Supabase client | `lib/auth/supabase-browser.ts` creates a browser client with anon key. | Existing Compliant | No service-role browser usage found in allowed scan. |
| Server-only access | `docs/database/README.md` references limited server-side database health/reset-password usage. | Review Required | Exact server files were not exhaustively reviewed to avoid unrelated modules. |
| Hard-coded roles | `features/user-management/constants/create-user-options.ts` uses roles such as `clinic_admin`, `organization_admin`, `doctor`. | Existing Compatibility Sensitive | App role constants may not map exactly to DB seeded roles. |
| Hard-coded permission keys | User management and evidence mock modules use local permission strings. | Existing Compatibility Sensitive | Needs mapping before live DB authorization. |
| `user_profiles.organization_id` assumptions | Docs and helpers use profile organization fallback. | Existing Compatibility Sensitive | Transition to explicit memberships needs app compatibility plan. |
| `clinic_users` assumptions | No table; user-management feature has UI concepts for clinic users. | Review Required | Needs mapping to `clinic_memberships`. |
| Generated types | Not verified. | Review Required | Regenerate after schema migration, then update consumers. |

Do not modify application code in this phase.

## 18. Security Risk Register

| ID | Severity | Risk | Preventive control | Detective control | Required test | Migration dependency |
|---|---|---|---|---|---|---|
| SEC-01 | Critical | Dual RLS policy families may widen access because policies are permissive. | Retire or wrap legacy policies after compatibility migration. | RLS policy inventory and cross-tenant regression tests. | Cross-org/clinic denial with both legacy and mvp1 permissions. | Groups 3, 5, 8 |
| SEC-02 | Critical | Role or permission self-assignment not explicitly denied. | Controlled assignment function/policies preventing self-grant and platform/system role grant by tenant admins. | Audit role/permission changes. | Self-assignment and permission escalation denial. | Groups 3, 4, 5, 8 |
| SEC-03 | High | Caller-supplied tenant context in helpers can be misused if policies pass user-editable row fields. | Tenant-safe constraints plus helper checks derived from `auth.uid()`. | Detect mismatched row tenant IDs. | Insert/update with another tenant's org/clinic ID. | Groups 2, 4, 5 |
| SEC-04 | High | Inactive or expired access can remain valid through legacy helpers. | Canonicalize on `user_role_assignments`; remove legacy helper dependency. | Access reconciliation report for legacy active roles. | Expired assignment and revoked membership denial. | Groups 3, 4, 5 |
| SEC-05 | High | Older SECURITY DEFINER helpers lack explicit public revoke evidence. | Explicit revoke public and grant only required role. | Function privilege inventory. | Anonymous/public execute denial. | Groups 4, 6, 8 |
| SEC-06 | High | Tenant fields may be editable by normal users through own-profile update. | Column-safe update function or restrictive policy preventing tenant-scope mutation. | Audit profile tenant field changes. | User cannot change own organization/default clinic. | Groups 2, 5, 8 |
| SEC-07 | High | Missing tenant-safe composite FKs permit cross-tenant references. | Add composite FKs or validation triggers after cleanup. | Orphan/cross-tenant preflight queries. | Cross-tenant role/profile/clinic/visit child insert rejected. | Groups 2, 8 |
| SEC-08 | High | No executable RLS/grant tests. | Add Supabase SQL tests. | CI/local db lint/test evidence. | Full test-gap matrix. | Group 8 |
| SEC-09 | High | Missing org/clinic lifecycle statuses allow suspended/closed entities to act as active. | Add constrained lifecycle status and helper checks. | Lifecycle audit reports. | Suspended clinic cannot create visits. | Groups 1, 4, 5, 8 |
| SEC-10 | High | Audit insert is broad and no immutable audit helper/trigger is verified. | Controlled audit-write function and append-only policies. | Audit integrity checks. | Normal user cannot update/delete audit logs; insert scope sanitized. | Groups 4, 5, 8 |

## 19. Implementation Gap Matrix

| ID | Object | Current state | Target state | Status | Severity | Security impact | Data-cleanup need | Application impact | Proposed migration | Required test | Rollback concern |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GAP-01 | `database-access-grant-model.md` | Requested doc absent | Source doc added or task reference corrected | Missing | Medium | Grant requirements ambiguous | None | None | Documentation prerequisite | Evidence checklist | None |
| GAP-02 | `organizations`, `clinics` | Boolean active/soft delete only | Constrained lifecycle status and helper enforcement | Existing Non-compliant | High | Suspended/closed entities may retain access | Map active/deleted rows | App status labels | Group 1 | Lifecycle denial | Status rollback mapping |
| GAP-03 | `user_profiles.organization_id` | Fallback membership/default context | Explicit membership is authoritative; profile org is default context only | Existing Compatibility Sensitive | High | Cross-tenant ambiguity | Reconcile memberships vs profile org | User context assumptions | Group 3 | Multi-org user access | Backward compatibility |
| GAP-04 | `user_roles` and `user_role_assignments` | Both active | Single canonical assignment model | Existing Compatibility Sensitive | Critical | Access drift and stale permissions | Duplicate/conflict reconciliation | Role consumers | Group 3 | Legacy vs canonical parity | Consumer breakage |
| GAP-05 | Permission keys | Colon and dot keys coexist | Canonical `module.resource.action` plus compatibility map | Existing Compatibility Sensitive | High | Wrong permission could allow/deny actions | Map role permissions | Hard-coded keys | Group 7 | Permission parity | Policy rollback |
| GAP-06 | RLS policies | Legacy and `mvp1_*` coexist | One tested policy family per table | Existing Compatibility Sensitive | Critical | Permissive policy widening | Policy inventory | None if compatible | Group 5 | Cross-tenant denial | Access outage |
| GAP-07 | Older helpers | SECURITY DEFINER with no explicit grant block | Public revoked; authenticated-only if still needed | Existing Compatibility Sensitive | High | Function execution exposure | Function privilege inventory | None | Group 4/6 | Public execute denial | Legacy policy dependency |
| GAP-08 | Role assignment admin | Legacy admin all; new model read-only | Controlled assign/revoke path, no self-grant | Missing | Critical | Privilege escalation | Existing assignment audit | User management | Group 3/4/5 | Self-assignment denial | Admin workflow blocked |
| GAP-09 | Tenant-safe FKs | Partial | Composite tenant-safe constraints for Core relationships | Existing Non-compliant | High | Cross-tenant references | Cross-tenant preflight | Possible data fixes | Group 2 | Invalid FK rejection | Existing bad data |
| GAP-10 | Profile self update | Own update by ID only | Column-safe profile update | Existing Non-compliant | High | Tenant scope mutation | Profile tenant-change audit | Profile settings | Group 5 | Tenant field update denial | UX update changes |
| GAP-11 | `clinic_users` | Missing | Confirm replacement by `clinic_memberships` | Review Required | Medium | Model confusion | None | User-management terminology | Group 3 | Contract tests | None |
| GAP-12 | Professional authority | Not modeled | Future credential/scope references | Future | High | RBAC mistaken for clinical authority | None now | Clinical actions later | Future phase | Professional-action denial | Future dependency |
| GAP-13 | Standalone seed | `supabase/seed.sql` absent | Deterministic dev/test seed or migration-only decision | Missing | Medium | Test setup ambiguity | None | Local dev | Group 7 | Seed idempotency | Seed rollback |
| GAP-14 | Database tests | `supabase/tests/` absent | Executable RLS/grant/constraint tests | Missing | Critical | Isolation unproven | Test fixtures | CI/local Supabase | Group 8 | Full matrix | None |
| GAP-15 | Generated types | Not verified | Types generated after canonical schema | Review Required | Medium | App contract drift | None | Type consumers | After migrations | Typecheck | Code churn |

## 20. Proposed Migration Sequence

Use migration numbers after the latest repository migration `007_rbac_helpers_policies_indexes_seed.sql`; the next conceptual migration should start after `007` using the repository timestamp convention.

| Group | Purpose | Dependency | Data cleanup | Compatibility risk | Rollback limitation | Required tests | Blocking decision |
|---|---|---|---|---|---|---|---|
| 1. Schema and lifecycle hardening | Add org/clinic lifecycle status and consistency checks. | `001`, `005` | Map `is_active/deleted_at` to status. | Medium | Status backfill cannot be blindly reversed. | Suspended/closed denial. | Status vocabulary. |
| 2. Tenant-safe constraints | Add composite FKs/checks for profile, role, assignment, visit/child consistency. | Group 1 | Cross-tenant/orphan cleanup. | High | Bad existing data may block rollback. | Invalid tenant references rejected. | Constraint scope for system roles. |
| 3. Membership and assignment alignment | Canonicalize explicit memberships and `user_role_assignments`; define `user_roles` compatibility. | Group 2 | Duplicate/conflicting assignments. | Critical | Retiring legacy table/policies affects consumers. | Membership revocation, expiry, parity. | Canonical assignment table. |
| 4. Authorization helper hardening | Replace legacy helper use; revoke public; fail closed. | Group 3 | Function dependency inventory. | High | Policies depending on old helpers may fail. | Helper null/revoked/expired behavior. | Helper names and compatibility wrappers. |
| 5. RLS policy alignment | Drop or supersede legacy policies; add missing manage policies/functions. | Group 4 | Policy inventory. | Critical | Incorrect policy can lock out users. | Cross-tenant, self-assignment, least privilege. | Admin management pattern. |
| 6. SQL grant alignment | Explicit table/function grants for anon/authenticated/service. | Group 5 | Privilege inventory. | High | Over-revoke may break app access. | Grant matrix tests. | Missing access grant model doc. |
| 7. Seed catalogue alignment | Seed canonical permissions/roles and compatibility mappings. | Group 5/6 | Duplicate semantic permissions. | High | Key changes affect hard-coded app constants. | Seed idempotency, role matrix. | Canonical permission catalogue. |
| 8. Core Foundation database tests | Add executable Supabase tests for RLS, grants, constraints, seeds. | Groups 1-7 | Synthetic fixtures. | Low | Tests can be rolled back independently. | Full matrix. | Local Supabase availability. |

## 21. Review Required Decisions

| Decision | Why it is required | Owner |
|---|---|---|
| Choose canonical role assignment table | `user_roles` and `user_role_assignments` both grant access. | Database + Security |
| Define `user_profiles.organization_id` semantics | Current fallback blocks clean multi-organization membership semantics. | Solution Architect if unresolved |
| Confirm `clinic_users` replacement | Table is missing; `clinic_memberships` appears to be intended replacement. | Database + Product |
| Approve lifecycle vocabulary | Org/clinic states affect authentication, visit creation, and history. | Product + Compliance |
| Approve grant model | Requested grant model doc is absent. | Security + Database |
| Split platform and organization admin | Seeded permission sets are identical in `007`. | Security + Product |
| Decide compatibility window for colon/dot keys | Policies and app constants may depend on current keys. | Database + Frontend |
| Define professional authority phase boundary | Core can reference future credentials but must not imply clinical authority. | Compliance + Clinical |

## 22. Implementation Readiness

Readiness: Review Required.

The schema is suitable as a static MVP foundation prototype, not as a production-ready access-control foundation. Implementation may proceed only after the Review Required decisions are closed and the migration sequence begins with data preflight checks. No high-risk clinical, claim, medication, certificate, evidence export, or audit workflows should rely on the current Core Foundation without the RLS, helper, grant, and test hardening described above.

## 23. Phase 1 Exit Criteria

Phase 1 should exit only when:

| Criterion | Required status |
|---|---|
| Canonical membership and role assignment decision closed | Existing Compliant |
| Org/clinic lifecycle status constrained and enforced | Existing Compliant |
| Legacy/current RLS policy overlap removed or proven safe | Existing Compliant |
| Helper functions fail closed with explicit grants | Existing Compliant |
| Self-assignment and permission escalation denied | Existing Compliant |
| Tenant-safe constraints added after clean preflight | Existing Compliant |
| Canonical permission catalogue seeded | Existing Compliant |
| SQL grants documented and tested | Existing Compliant |
| Supabase SQL test suite exists | Existing Compliant |
| Generated types refreshed after schema changes | Existing Compliant |

## 24. Recommended Next Task

Recommended next task: DB-P1-CORE-SCHEMA-HARDENING-PLAN.

Goal: close Review Required decisions and prepare non-mutating preflight SQL for duplicate, null, orphan, cross-tenant, lifecycle, assignment, permission, grant, and policy inventory checks. Do not create migration files until those preflight results are reviewed.

Phase 1 Core Foundation schema review completed. No executable database or application code was added or modified.

## 25. Migration 008 Implementation Update

Task: DB-P1-AUTH-HELPER-GRANT-HARDENING

Migration implemented: `supabase/migrations/008_core_foundation_auth_helpers_and_grants.sql`.

Runtime effect:

- Existing Core authorization helper names and signatures were retained for compatibility.
- Migration `003` helpers were hardened with explicit fail-closed active profile, active organization membership, active clinic membership, and active role/permission checks where supported by current tables.
- Migration `007` helpers were hardened to remove profile-only and primary-clinic fallbacks that allowed suspended or revoked memberships to pass.
- Sensitive helper `EXECUTE` was revoked from `public` and `anon`; `authenticated` receives explicit `EXECUTE`.
- Unsafe inherited table privileges for `anon` and `authenticated` were revoked.
- `authenticated` receives minimum RLS-backed table operations needed by existing approved policies.
- `authenticated` cannot directly mutate `roles`, `permissions`, `role_permissions`, `user_roles`, or `user_role_assignments`.
- Default privileges for future public schema tables, sequences, and functions were explicitly revoked from runtime roles.

Local validation evidence:

- Pre-migration pgTAP red run failed for unsafe grants, missing authenticated DML, public/anon helper execution exposure, and helper fail-open membership fallback.
- `npx supabase db reset --local` applied migrations `001` through `008` and seeded `supabase/seed.sql`.
- `npx supabase test db supabase/tests --local` passed 73 tests after migration `008`.

Remaining RLS gaps:

- Legacy migration `003` policies and `mvp1_*` policies still coexist and remain compatibility-sensitive because PostgreSQL permissive policies combine with OR semantics.
- This task did not redesign RLS policy logic, tenant-safe composite constraints, role-assignment administration workflows, or organization/clinic lifecycle statuses.

Recommended next task: DB-P1-RLS-POLICY-HARDENING.

## 26. Migration 009 RLS Policy Hardening Update

Task: DB-P1-RLS-POLICY-HARDENING

Migration implemented: `supabase/migrations/009_core_foundation_rls_policy_hardening.sql`.

Runtime effect:

- Core Foundation RLS remains enabled on `organizations`, `clinics`, `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `organization_memberships`, `clinic_memberships`, and `user_role_assignments`.
- Legacy migration `003` policy names were removed from the in-scope Core Foundation tables.
- The overlapping `mvp1_organizations_select` and `mvp1_clinics_select` policies were replaced by one canonical policy per table.
- Replacement membership and role-assignment SELECT policies on `organization_memberships`, `clinic_memberships`, and `user_role_assignments` were retained for compatibility.
- `user_profiles` and legacy `user_roles` are read-only to authenticated users through RLS; direct profile mutation and direct role assignment mutation are not exposed.
- Catalog read access is restricted to active permissions, active role-permission rows, and visible global or member-organization roles.

Canonical Core Foundation policies:

| Table | Policy | Operation | Scope summary |
|---|---|---|---|
| `organizations` | `organizations_select_own_scope` | SELECT | Active organization membership through hardened helper. |
| `clinics` | `clinics_select_authorized_scope` | SELECT | Active clinic access plus `clinic.view`. |
| `user_profiles` | `user_profiles_select_self_or_admin` | SELECT | Self profile or scoped `role.assign` administrator. |
| `roles` | `roles_select_catalog_scope` | SELECT | Global roles or roles in member organizations. |
| `permissions` | `permissions_select_catalog_scope` | SELECT | Active, non-deleted permissions only. |
| `role_permissions` | `role_permissions_select_catalog_scope` | SELECT | Active mappings for active visible roles. |
| `user_roles` | `user_roles_select_self_or_admin` | SELECT | Self assignments or scoped `role.assign` administrator. |

Local validation evidence:

- Pre-migration pgTAP red run failed because the legacy policy family still existed, policy counts were duplicated, and mutation policies remained on `user_profiles` and `user_roles`.
- `npx supabase db reset --local` applied migrations `001` through `009` and seeded `supabase/seed.sql`.
- `npx supabase test db supabase/tests --local` passed 91 tests after migration `009`.

Remaining gaps:

- Tenant-safe foreign keys remain a separate schema-hardening task.
- Organization and clinic lifecycle states remain a separate lifecycle-control task.
- Controlled role-assignment workflows remain a separate authorization workflow task.
- Out-of-scope clinical, claim, inventory, settings, and audit policies still require their own domain RLS hardening pass.

Recommended next task: DB-P1-TENANT-SAFE-FK-HARDENING.

## 27. Migration 010 Tenant-safe FK Hardening Update

Task: DB-P1-TENANT-SAFE-FK-HARDENING

Migration implemented: `supabase/migrations/010_core_foundation_tenant_safe_fk_hardening.sql`.

Runtime effect:

- Added immediate precondition checks that stop the migration if existing Core Foundation memberships or role assignments contain cross-organization profile, clinic, or tenant-scoped role references.
- Added parent uniqueness for `user_profiles(organization_id, id)` and `roles(organization_id, id)`.
- Added tenant-safe profile foreign keys for `organization_memberships`, `clinic_memberships`, legacy `user_roles`, and current `user_role_assignments`.
- Added tenant-safe clinic foreign keys for legacy `user_roles` and current `user_role_assignments`.
- Added partial unique indexes to close PostgreSQL NULL semantics for organization-level role assignments where `clinic_id is null`.
- Added a role-assignment tenant-scope trigger that permits platform roles with `roles.organization_id is null` and rejects organization-scoped roles assigned outside their owning organization.

Relationship review result:

| Relationship | Result |
|---|---|
| `clinics -> organizations` | Existing single-column FK and `(organization_id, id)` parent uniqueness retained. |
| `user_profiles -> auth.users` | Existing PK/FK retained; new `(organization_id, id)` uniqueness supports tenant-safe children. |
| `clinic_users` | Table remains absent; `clinic_memberships` is the verified replacement. |
| `organization_memberships -> user_profiles` | New composite FK requires same organization as profile. |
| `clinic_memberships -> clinics/user_profiles` | Existing clinic tenant FK retained; new profile tenant FK added. |
| `roles -> organizations` | Existing nullable organization FK retained for platform roles; new `(organization_id, id)` uniqueness added. |
| `role_permissions -> roles/permissions` | Existing FKs and uniqueness retained; orphan role-permission inserts remain rejected. |
| `user_roles -> clinics/user_profiles/roles` | New tenant-safe clinic and profile FKs plus role-scope trigger added. |
| `user_role_assignments -> clinics/user_profiles/roles` | New tenant-safe clinic and profile FKs plus role-scope trigger added. |

Preflight result:

- Local preflight found zero mismatched organization membership profile references.
- Local preflight found zero mismatched clinic membership profile references.
- Local preflight found zero mismatched legacy or current role-assignment profile references.
- Local preflight found zero mismatched legacy or current role-assignment tenant-scoped role references.
- No data cleanup was performed.

Remaining gaps:

- Organization and clinic lifecycle states remain separate.
- Controlled role-assignment workflows and audit paths remain separate.
- Professional authority remains separate.
- Domain RLS outside Core Foundation remains separate.

## 28. Migration 011 Lifecycle Controls Update

Task: DB-P1-LIFECYCLE-CONTROLS-HARDENING

Migration implemented: `supabase/migrations/011_core_foundation_lifecycle_controls.sql`.

Runtime effect:

- Added `lifecycle_status` to `organizations` and `clinics`.
- Backfilled existing rows to `active`, `suspended`, or `archived` from existing `is_active` and `deleted_at` compatibility fields.
- Added CHECK constraints for `active`, `suspended`, `closed`, and `archived`.
- Added controlled transition functions for organization and clinic lifecycle changes.
- Seeded lifecycle permission keys and mapped them to `platform_admin`, `organization_admin`, and `clinic_admin` according to scope.
- Updated Core Foundation authorization helpers so normal operational access requires active organization lifecycle and active clinic lifecycle where clinic scope is used.

Security result:

- Normal authenticated users cannot directly update organization or clinic lifecycle status because table update grants remain unavailable.
- Tenant admins cannot alter another organization.
- Tenant organization admins cannot reactivate suspended organizations; platform recovery is explicit.
- Clinic lifecycle transitions are blocked when the owning organization is not active.
- Historical organization and clinic rows remain preserved after suspend, close, and archive transitions.

Remaining gaps:

- Full lifecycle audit-event emission remains a separate audit workflow task.
- Controlled role-assignment workflow remains separate.
- Downstream domain RLS and insert/update policies still need lifecycle-specific enforcement tests beyond the Core helper layer.

## 29. Migration 012 Controlled Role Assignment Update

Task: DB-P1-CONTROLLED-ROLE-ASSIGNMENT-WORKFLOW

Migration implemented: `supabase/migrations/012_core_foundation_controlled_role_assignment.sql`.

Runtime effect:

- Canonical write path is `user_role_assignments` through controlled functions.
- Legacy `user_roles` remains available for compatibility reads only; it is not used by new workflow writes.
- `assign_role(...)` validates actor, target profile, active memberships, role scope, tenant and clinic scope, lifecycle state, dates, self-assignment denial, duplicate active assignment denial, and platform-role authority.
- `revoke_role_assignment(...)` locks the assignment, validates actor authority, preserves historical rows, records revoked metadata, and fails repeated revocation deterministically.
- New role-assignment permissions are seeded without granting platform-role assignment authority to tenant or clinic administrators.

Security result:

- Direct assignment-table inserts, updates, deletes, role changes, target changes, and scope changes are denied to normal authenticated users.
- Platform-role escalation by tenant and clinic administrators is denied.
- Suspended, closed, and archived organizations or clinics block normal role-assignment workflow operations.
- The controlled functions are SECURITY DEFINER with fixed `search_path = public` and minimal authenticated EXECUTE grants.

Remaining gaps:

- Full audit-event persistence remains separate.
- Professional credential authority remains outside Core Foundation Phase 1.
- Application user-management UI still uses mock/local role data and will need RPC integration before live writes.

## 30. Migration 013 Core Foundation Audit Events Update

Task: DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION

Migration implemented: `supabase/migrations/013_core_foundation_audit_events.sql`.

Runtime effect:

- Added normalized audit-event columns to `audit_logs` while retaining legacy compatibility columns.
- Added `append_core_audit_event(...)` as the internal Core Foundation append boundary.
- Wrapped organization lifecycle, clinic lifecycle, assignment, and revocation workflow functions so successful protected mutations persist audit events in the same transaction.
- Removed direct runtime audit insert policy exposure and revoked direct insert, update, and delete table privileges from `anon` and `authenticated`.
- Added indexes for event time, tenant/time, clinic/time, event type/time, resource identity, and correlation id.
- Added JSON payload guardrails for prohibited secret-like keys and token-like values.

Security result:

- Organization and clinic lifecycle changes are durably audited.
- Controlled role assignment creation and revocation are durably audited.
- Runtime users cannot directly forge, alter, or delete audit rows.
- Audit append failure rolls back the protected lifecycle or role-assignment mutation.

Remaining gaps:

- Full Phase 1 regression and phase-exit review remain separate.
- Domain audit events outside Core Foundation remain future phase work.
- Audit export, retention automation, tamper-evidence controls, and break-glass audit design remain later-phase governance work.

## 31. Full Core Foundation Regression Update

Task: DB-P1-FULL-CORE-FOUNDATION-REGRESSION

Validation result:

- Local migration list showed migrations `001` through `013` present with no duplicate migration numbers found in repository filenames.
- `npx supabase db lint --local` passed with no schema errors.
- `npx supabase db reset --local` rebuilt the local database from zero, applied migrations `001` through `013` in order, and seeded `supabase/seed.sql`.
- `npx supabase test db supabase/tests --local` passed 9 files and 229 tests.
- `npx supabase gen types typescript --local` generated local TypeScript database types in `lib/database.types.ts`.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed.

Phase 1 readiness:

- Core Foundation database implementation is READY WITH NON-BLOCKING FOLLOW-UP.
- No High or Critical Core Foundation database security findings remained after local regression.
- Application UI integration remains mock/static for Core Foundation lifecycle, controlled role-assignment RPCs, and audit queries; this is a follow-up integration task, not a database Phase 1 blocker.
- `npx supabase status` was not executed because the approval reviewer rejected it due potential local secret-bearing output.
