# Core Foundation Runtime Test Plan

## 1. Document Control

Task: DB-P1-CORE-REVIEW-GAP-CLOSURE
Status: Planned runtime test suite. Runtime effect: none.

Test statuses: Planned, Ready to Implement, Blocked, Review Required. No tests are marked Passed because no executable suite exists yet.

## 2. Purpose

Define the executable local Supabase test suite required to verify Core Foundation RBAC, RLS, SQL grants, authorization helpers, tenant isolation, failure behavior, concurrency, and seed safety.

This document closes the test-suite design and harness-plan gap identified in `docs/database/core-foundation-schema-review.md`. It does not create SQL test files.

## 3. Scope

In scope:

- Local Supabase database tests under future `supabase/tests/`.
- Core Foundation schemas, grants, RLS, helper functions, membership, RBAC, tenant isolation, seed idempotency, and failure behavior.
- Synthetic fixtures only.

Out of scope:

- Creating `supabase/tests/` files, migrations, seeds, application tests, app code, generated types, or configuration changes.

## 4. Current Test-suite Status

| Area | Current repository evidence | Status |
|---|---|---|
| `supabase/tests/` | Directory absent. | Blocked |
| `supabase/seed.sql` | File absent while config references `./seed.sql`. | Blocked |
| Migrations | `001` through `007` exist. | Ready to Implement |
| RLS policies | Legacy and `mvp1_*` policies exist. | Review Required |
| Grant tests | No executable grant tests. | Blocked |
| Helper tests | No executable helper tests. | Blocked |
| Framework | No committed SQL test framework detected. | Review Required |
| Local Supabase | CLI commands are available; service state must be checked per run. | Review Required |

## 5. Test Framework Decision

Recommendation: use database-level SQL tests for RLS, grants, constraints, and helper functions, executed against local Supabase after migrations.

Framework decision:

| Option | Fit | Status | Notes |
|---|---|---|---|
| Supabase SQL tests in `supabase/tests/` | Best repository fit because Supabase CLI and migrations exist. | Planned | Use transaction-wrapped assertions and explicit auth context helpers. |
| pgTAP | Useful if extension is available. | Review Required | Do not assume installed; verify extension support before marking Ready. |
| Transaction-wrapped SQL assertions | Strong fallback. | Planned | Can validate RLS/grants without adding dependencies. |
| Application integration tests | Secondary only. | Planned | Use where SQL cannot verify browser/server secret boundaries. |

Do not install pgTAP or add test dependencies in this task.

## 6. Local Supabase Prerequisites

Required before running future tests:

- Local Supabase CLI available.
- `npx supabase status` confirms local service state.
- `npx supabase migration list` lists migrations `001` through `007`.
- `npx supabase db lint` passes.
- Local reset applies migrations and handles missing `supabase/seed.sql` decision.
- Test runner can set authenticated context without using `service_role` for normal RLS assertions.

## 7. Test-data Strategy

Use synthetic data only. No real names, real emails, national IDs, license numbers, PHI, payer credentials, access tokens, service-role keys, or production UUIDs.

Fixture rules:

- Deterministic aliases and documented UUIDs only in future test files.
- Tenant-safe fixture naming: `org_alpha`, `org_beta`, `clinic_alpha_one`, `clinic_alpha_two`, `clinic_beta_one`.
- Every fixture row must be cleaned up transactionally or namespaced for safe reset.
- Negative tests must avoid relying on data leakage to diagnose failures.

## 8. Test Identity Strategy

Synthetic users:

| Fixture user | Purpose | Status |
|---|---|---|
| platform administrator | Platform-scope control and platform-role assignment denial tests. | Planned |
| organization administrator Alpha | Org Alpha admin tests. | Planned |
| organization administrator Beta | Org Beta isolation tests. | Planned |
| clinic administrator Alpha One | Clinic admin scope tests. | Planned |
| doctor Alpha One | Clinical read/write permission tests. | Planned |
| nurse Alpha One | Visit support permission tests. | Planned |
| pharmacist Alpha One | Prescription/inventory permission tests. | Planned |
| clinic staff Alpha Two | Cross-clinic denial tests. | Planned |
| claim reviewer with claim-case scope | Claim read/review tests. | Planned |
| auditor | Read-only audit tests. | Planned |
| executive aggregate-only | Executive direct PHI denial tests. | Planned |
| inactive user | Inactive profile denial tests. | Planned |
| expired-role user | Role expiry tests. | Planned |
| revoked-membership user | Revoked membership denial tests. | Planned |
| user without profile | Missing profile fail-closed tests. | Planned |

## 9. Tenant Fixture Strategy

Every test must specify:

- organization context.
- clinic context.
- auth identity.
- membership state.
- role assignment state.
- permission state.
- expected visible rows.

Tenant fixtures must include one cross-organization and one cross-clinic denial for each major table group.

## 10. Organization Fixtures

| Fixture | Purpose | Status |
|---|---|---|
| Organization Alpha | Primary allowed tenant. | Planned |
| Organization Beta | Cross-tenant denial tenant. | Planned |
| Organization Suspended | Lifecycle denial once lifecycle status exists. | Blocked |
| Organization Soft Deleted | Soft-delete visibility tests. | Planned |

## 11. Clinic Fixtures

| Fixture | Organization | Purpose | Status |
|---|---|---|---|
| Clinic Alpha One | Alpha | Primary allowed clinic. | Planned |
| Clinic Alpha Two | Alpha | Same-org cross-clinic denial. | Planned |
| Clinic Beta One | Beta | Cross-org clinic denial. | Planned |
| Clinic Suspended | Alpha | Suspended clinic denial. | Blocked |
| Clinic Soft Deleted | Alpha | Soft-delete visibility. | Planned |

## 12. User-profile Fixtures

| Fixture | Expected behavior | Status |
|---|---|---|
| Active profile | Can evaluate memberships and assignments. | Planned |
| Missing profile | Fails closed. | Planned |
| Inactive profile | Fails closed. | Planned |
| Soft-deleted profile | Fails closed. | Planned |
| Profile with default org only | Compatibility fallback test. | Review Required |
| Profile with multiple memberships | Multi-organization semantics. | Review Required |

## 13. Membership Fixtures

| Fixture | Expected behavior | Status |
|---|---|---|
| Active organization membership | Allows org-scoped helper checks. | Planned |
| Suspended organization membership | Denies access. | Planned |
| Revoked organization membership | Denies access. | Planned |
| Active clinic membership | Allows clinic-scoped helper checks. | Planned |
| Suspended clinic membership | Denies access. | Planned |
| Revoked clinic membership | Denies access. | Planned |
| Cross-org clinic membership attempt | Rejected by tenant-safe constraints after hardening. | Blocked |

## 14. Role and Permission Fixtures

Validate both current permission generations until canonicalization:

- Legacy colon keys from migration `002`.
- Dot keys from migration `007`.
- Canonical future keys from `core-foundation-permission-matrix.md` only after seed migration.

Fixture states:

| State | Purpose | Status |
|---|---|---|
| Active role assignment | Positive permission tests. | Planned |
| Missing permission | Negative permission tests. | Planned |
| Expired assignment | Stale-session denial. | Planned |
| Revoked assignment | Revocation denial. | Planned |
| Inactive role | Role status denial. | Planned |
| Duplicate assignment | Constraint/idempotency tests. | Planned |
| Scope mismatch | Cross-org/cross-clinic RBAC denial. | Planned |

## 15. Helper-function Tests

| test_id | category | risk | precondition | actor | authentication state | organization context | clinic context | role | permission | operation | expected result | expected SQLSTATE or failure class | expected visible rows | expected audit behavior | cleanup | severity | blocking status | implementation dependency | evidence required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| AUTH-HLP-001 | helper | auth.uid resolution | Active Alpha user exists | doctor Alpha One | authenticated | Alpha | Alpha One | doctor | `patient.view` | call approved current-user helper | returns user/profile id | none | 1 | none | transaction rollback | Critical | Planned | helper grants | result row |
| AUTH-HLP-002 | helper | null auth.uid fail-open | no authenticated context | anonymous | anonymous | none | none | none | none | call helper | false/null fail closed | permission denied or null | 0 | none | rollback | Critical | Planned | test auth context helper | failure evidence |
| AUTH-HLP-003 | helper | inactive profile | inactive profile fixture | inactive user | authenticated | Alpha | Alpha One | doctor | `patient.view` | call `has_permission` | false | none | 0 | none | rollback | Critical | Planned | fixtures | boolean false |
| AUTH-HLP-004 | helper | missing membership | profile without membership | user without membership | authenticated | Alpha | Alpha One | none | none | call membership helper | false | none | 0 | none | rollback | High | Planned | fixtures | boolean false |
| AUTH-HLP-005 | helper | expired assignment | expired-role fixture | expired-role user | authenticated | Alpha | Alpha One | doctor | `patient.view` | call permission helper | false | none | 0 | none | rollback | Critical | Planned | assignment fixture | boolean false |
| AUTH-HLP-006 | helper | wrong organization | Alpha user | doctor Alpha One | authenticated | Beta | Beta One | doctor | `patient.view` | call permission helper | false | none | 0 | none | rollback | Critical | Planned | fixtures | boolean false |
| AUTH-HLP-007 | helper | wrong clinic | Alpha One doctor | doctor Alpha One | authenticated | Alpha | Alpha Two | doctor | `patient.view` | call clinic helper | false | none | 0 | none | rollback | Critical | Planned | fixtures | boolean false |
| AUTH-HLP-008 | helper | public execute | anonymous | anonymous | anonymous | none | none | none | none | execute sensitive helper | denied | permission denied | 0 | none | rollback | High | Planned | grant migration | SQLSTATE |
| AUTH-HLP-009 | helper | search_path hijack | malicious temp object setup | authenticated user | authenticated | Alpha | Alpha One | doctor | `patient.view` | call SECURITY DEFINER helper | safe result | none | expected | none | rollback | High | Review Required | framework supports temp schema | proof of fixed search_path |
| AUTH-HLP-010 | helper | recursion behavior | policy helper reads protected tables | authenticated user | authenticated | Alpha | Alpha One | doctor | `patient.view` | select through RLS | no recursion failure/fail-open | none or controlled error | expected | none | rollback | High | Planned | policy inventory | result and logs |

## 16. RLS Tests

| test_id | category | risk | precondition | actor | authentication state | organization context | clinic context | role | permission | operation | expected result | failure class | expected visible rows | audit behavior | cleanup | severity | blocking status | dependency | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| RLS-ORG-001 | RLS | cross-org read | Alpha and Beta org rows | Alpha user | authenticated | Alpha | none | org admin | `organization.view` | select organizations | Alpha only | none | 1 | none | rollback | Critical | Planned | policies | row count |
| RLS-ORG-002 | RLS | other org access | Beta row exists | Alpha org admin | authenticated | Beta | none | org admin | `organization.view` | select Beta organization | denied/0 rows | none | 0 | none | rollback | Critical | Planned | policies | row count |
| RLS-ORG-003 | RLS | tenant mutation | Alpha profile | Alpha user | authenticated | Alpha | Alpha One | doctor | none | update `organization_id` | denied | RLS/check violation | 0 changed | audit denied if implemented | rollback | Critical | Blocked | column-safe policy | SQLSTATE |
| RLS-ORG-004 | RLS | suspended org | suspended org exists | suspended org member | authenticated | Suspended | clinic | admin | permission | create visit | denied | policy denial | 0 | audit blocked if implemented | rollback | High | Blocked | lifecycle migration | SQLSTATE |
| RLS-CLN-001 | RLS | own clinic read | Alpha One data | doctor Alpha One | authenticated | Alpha | Alpha One | doctor | `patient.view` | select patients | allowed | none | own clinic rows | none | rollback | Critical | Planned | fixtures | row count |
| RLS-CLN-002 | RLS | unrelated clinic read | Alpha Two data | doctor Alpha One | authenticated | Alpha | Alpha Two | doctor | `patient.view` | select patients | denied/0 rows | none | 0 | none | rollback | Critical | Planned | fixtures | row count |
| RLS-CLN-003 | RLS | cross-org clinic admin | Beta clinic data | clinic admin Alpha One | authenticated | Beta | Beta One | clinic_admin | `clinic.view` | select clinics | denied/0 rows | none | 0 | none | rollback | Critical | Planned | fixtures | row count |
| RLS-CLN-004 | RLS | revoked membership | revoked fixture | revoked user | authenticated | Alpha | Alpha One | staff | `patient.view` | select patients | denied/0 rows | none | 0 | none | rollback | Critical | Planned | fixtures | row count |
| RLS-COMP-001 | RLS | permissive OR risk | dual policies active | Alpha user | authenticated | Alpha | Alpha One | role with legacy only | legacy permission | select Core table | matches intended matrix only | none | expected | none | rollback | Critical | Planned | dual-policy inventory | row count |
| RLS-DEL-001 | RLS | delete denial | Core row exists | normal user | authenticated | Alpha | Alpha One | doctor | update permission | delete row | denied | insufficient privilege/RLS | 0 changed | none | rollback | High | Planned | grants | SQLSTATE |

## 17. Grant Tests

| test_id | category | risk | precondition | actor | authentication state | organization context | clinic context | role | permission | operation | expected result | failure class | expected visible rows | audit behavior | cleanup | severity | blocking status | dependency | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| GRANT-001 | grant | anon table access | Core tables exist | anon | anonymous | none | none | none | none | select `organizations` | denied | insufficient privilege or 0 via API | 0 | none | none | Critical | Planned | grant migration | SQLSTATE/result |
| GRANT-002 | grant | authenticated overgrant | active user | authenticated | authenticated | Alpha | Alpha One | doctor | none | update `permissions` | denied | insufficient privilege/RLS | 0 | none | rollback | Critical | Planned | grants | SQLSTATE |
| GRANT-003 | grant | public function execute | helper exists | public | anonymous | none | none | none | none | execute helper | denied | permission denied | 0 | none | none | High | Planned | helper revoke | SQLSTATE |
| GRANT-004 | grant | approved helper execute | active user | authenticated | authenticated | Alpha | Alpha One | doctor | `patient.view` | execute `has_permission` | allowed | none | 1 boolean | none | rollback | High | Planned | helper grant | result |
| GRANT-005 | grant | schema usage | roles exist | anon/authenticated | mixed | mixed | mixed | mixed | mixed | resolve Core objects | only approved roles resolve | permission denied as applicable | n/a | none | none | High | Review Required | schema grant decision | privilege report |
| GRANT-006 | grant | default privileges | test object in sandbox schema | migration owner | migration | n/a | n/a | n/a | n/a | inspect default privileges | fail-closed | none | n/a | none | cleanup test object | High | Review Required | default privilege migration | privilege report |
| GRANT-007 | grant | service role browser exposure | app source scanned | browser bundle | unauthenticated | none | none | none | none | static scan env vars | no service role | secret exposure if found | 0 | security finding | none | Critical | Planned | app scan | scan output |

## 18. Negative Authorization Tests

Blocking negative tests:

| test_id | Scenario | Expected result | Status |
|---|---|---|---|
| NEG-AUTH-001 | Anonymous access to Core tables. | Denied. | Planned |
| NEG-AUTH-002 | Authenticated user without `user_profiles`. | Denied/fail closed. | Planned |
| NEG-AUTH-003 | Inactive `user_profiles`. | Denied/fail closed. | Planned |
| NEG-AUTH-004 | Missing auth user relationship. | Denied or FK prevents profile. | Planned |
| NEG-AUTH-005 | User changes `organization_id`. | Denied. | Blocked |
| NEG-AUTH-006 | Revocation during active session. | Database state wins over stale JWT. | Planned |
| NEG-AUTH-007 | Tenant admin assigns platform role. | Denied. | Blocked |
| NEG-AUTH-008 | User assigns role to self. | Denied. | Blocked |
| NEG-AUTH-009 | User grants permission to own role. | Denied. | Blocked |

## 19. Concurrency Tests

| test_id | Scenario | Expected result | Status |
|---|---|---|---|
| CONC-001 | Duplicate organization code creation. | One succeeds, one fails unique constraint. | Planned |
| CONC-002 | Duplicate clinic code in same organization. | One succeeds, one fails unique constraint. | Planned |
| CONC-003 | Duplicate organization membership. | One succeeds, duplicate rejected/idempotent. | Planned |
| CONC-004 | Duplicate role assignment. | One succeeds, duplicate rejected/idempotent. | Planned |
| CONC-005 | Simultaneous assignment and revocation. | Final state deterministic and auditable. | Review Required |
| CONC-006 | Expiration-boundary permission check. | Permission denied at/after expiry. | Planned |
| CONC-007 | Revocation during active session. | New helper evaluation denies access. | Planned |

## 20. Idempotency Tests

| test_id | Scenario | Expected result | Status |
|---|---|---|---|
| IDEMP-001 | Re-run role/permission seed inserts. | No duplicate semantic permissions or roles. | Planned |
| IDEMP-002 | Re-run membership compatibility backfill. | No duplicate memberships. | Planned |
| IDEMP-003 | Re-run legacy-to-new assignment backfill. | No duplicate assignments. | Planned |
| IDEMP-004 | Re-run storage bucket seed. | Buckets remain private. | Planned |
| IDEMP-005 | Retry controlled role assignment future workflow. | Idempotent or conflict-safe response. | Blocked |

## 21. Seed Tests

| test_id | Requirement | Expected evidence | Status |
|---|---|---|---|
| SEED-001 | No real PHI. | Scan seed/migration fixtures for real-looking names/identifiers. | Planned |
| SEED-002 | No real credentials. | Scan for tokens, passwords, service keys. | Planned |
| SEED-003 | Deterministic approved IDs. | Fixture ID inventory. | Review Required |
| SEED-004 | Canonical permission keys. | Permission catalogue matches approved matrix. | Planned |
| SEED-005 | Idempotent execution. | Re-run seed safely in local reset/test transaction. | Planned |
| SEED-006 | No excessive privileges. | Platform and organization admin split verified. | Review Required |
| SEED-007 | Missing `supabase/seed.sql` handled. | Decision: create seed, disable seed, or configure test fixture path. | Blocked |

## 22. Cleanup and Isolation

Required cleanup model:

- Prefer transaction-wrapped tests with rollback.
- Where transaction wrapping cannot cover auth/storage setup, use deterministic fixture prefixes and explicit teardown.
- Never delete non-fixture rows by broad criteria.
- Do not run mutating tests against remote databases.
- Separate `service_role` setup from normal-user RLS assertions.

## 23. Test Execution Order

Proposed future files under `supabase/tests/`:

| Order | File | Purpose | Status |
|---:|---|---|---|
| 001 | `001_test_helpers.sql` | Assertion helpers, auth context utilities, cleanup guards. | Planned |
| 002 | `002_core_fixtures.sql` | Synthetic organizations, clinics, users, memberships, roles. | Planned |
| 003 | `003_identity_tests.sql` | Auth/profile/missing/inactive identity tests. | Planned |
| 004 | `004_membership_tests.sql` | Organization and clinic membership tests. | Planned |
| 005 | `005_rbac_tests.sql` | Role, permission, assignment, expiry, revocation tests. | Planned |
| 006 | `006_authorization_helper_tests.sql` | Helper function behavior and grants. | Planned |
| 007 | `007_rls_organization_tests.sql` | Organization isolation RLS. | Planned |
| 008 | `008_rls_clinic_tests.sql` | Clinic isolation RLS. | Planned |
| 009 | `009_grant_tests.sql` | Schema/table/function grant tests. | Planned |
| 010 | `010_privilege_escalation_tests.sql` | Self-assignment, permission escalation, platform-role denial. | Planned |
| 011 | `011_concurrency_tests.sql` | Duplicate and race-condition tests. | Review Required |
| 012 | `012_seed_idempotency_tests.sql` | Seed and catalog idempotency tests. | Planned |

Actual conventions must be confirmed after the test framework decision.

## 24. Failure Diagnostics

Every failed test should report:

- test ID.
- actor and auth state.
- expected versus actual SQLSTATE/failure class.
- expected versus actual visible row count.
- active organization/clinic context.
- role and permission fixtures.
- relevant policy/helper name.
- whether `service_role` was used only for setup.
- cleanup result.

No test should expose PHI, credentials, service-role tokens, or raw secret values.

## 25. CI Readiness

CI readiness is Review Required until:

- test framework is approved.
- local Supabase startup/reset behavior is stable.
- missing `supabase/seed.sql` decision is closed.
- tests can run without real secrets.
- failure logs are sanitized.
- runtime duration is acceptable.
- generated types update is placed after schema hardening, not before.

## 26. Test Coverage Matrix

| Coverage area | Primary tests | Status |
|---|---|---|
| Anonymous access | NEG-AUTH-001, GRANT-001 | Planned |
| Authenticated without profile | NEG-AUTH-002, AUTH-HLP-002 | Planned |
| Inactive profile | NEG-AUTH-003, AUTH-HLP-003 | Planned |
| Active authenticated user | AUTH-HLP-001, RLS-CLN-001 | Planned |
| Organization isolation | RLS-ORG-001, RLS-ORG-002 | Planned |
| Organization admin cross-tenant denial | RLS-ORG-002 | Planned |
| Tenant field mutation | RLS-ORG-003, NEG-AUTH-005 | Blocked |
| Suspended organization | RLS-ORG-004 | Blocked |
| Clinic isolation | RLS-CLN-001, RLS-CLN-002, RLS-CLN-003 | Planned |
| Revoked clinic membership | RLS-CLN-004 | Planned |
| Suspended clinic | future lifecycle tests | Blocked |
| Valid permission | AUTH-HLP-001, GRANT-004 | Planned |
| Missing permission | AUTH-HLP-004 | Planned |
| Expired role assignment | AUTH-HLP-005, CONC-006 | Planned |
| Revoked role assignment | RBAC fixture tests | Planned |
| Inactive role | RBAC fixture tests | Planned |
| Duplicate role assignment | CONC-004 | Planned |
| Self-assignment | NEG-AUTH-008 | Blocked |
| Permission self-assignment | NEG-AUTH-009 | Blocked |
| Tenant admin platform role assignment | NEG-AUTH-007 | Blocked |
| Helper null/fail closed | AUTH-HLP-002 | Planned |
| SECURITY DEFINER safety | AUTH-HLP-008, AUTH-HLP-009 | Review Required |
| RLS USING/WITH CHECK | RLS-ORG-003 and table-specific tests | Planned |
| Multiple-policy composition | RLS-COMP-001 | Planned |
| Grants | GRANT-001 through GRANT-007 | Planned |
| Concurrency | CONC-001 through CONC-007 | Review Required |
| Seed idempotency | SEED-001 through SEED-007 | Planned/Blocked |

## 27. Blocking Tests

These tests are release blocking for Core Foundation hardening:

| test_id | Blocking reason | Current status |
|---|---|---|
| RLS-ORG-001 | Proves own-organization access is scoped. | Planned |
| RLS-ORG-002 | Proves cross-organization denial. | Planned |
| RLS-CLN-002 | Proves cross-clinic denial. | Planned |
| RLS-COMP-001 | Proves dual permissive policy families do not widen access. | Planned |
| NEG-AUTH-008 | Proves role self-assignment denial. | Blocked |
| NEG-AUTH-009 | Proves permission self-assignment denial. | Blocked |
| GRANT-001 | Proves anon table access denial. | Planned |
| GRANT-003 | Proves public helper EXECUTE denial. | Planned |
| AUTH-HLP-005 | Proves expired assignments fail closed. | Planned |
| SEED-007 | Resolves missing seed file behavior. | Blocked |

## 28. Review Required Decisions

| Decision | Why it matters | Owner |
|---|---|---|
| Test framework: pgTAP versus SQL assertions | Determines file syntax and CI command. | Database + QA |
| Auth context helper pattern | Required to simulate `auth.uid()` correctly. | Database |
| Fixture setup method | Determines whether future tests need `service_role` setup. | Database + Security |
| Missing `supabase/seed.sql` | Current config references a missing file. | Database |
| Canonical RBAC model | Tests differ for `user_roles` versus `user_role_assignments`. | Database + Security |
| Lifecycle status migration | Suspended organization/clinic tests are blocked. | Product + Compliance |
| Role assignment workflow | Self-assignment tests are blocked without an approved workflow. | Security + Product |
| CI local Supabase strategy | Needed before marking runtime tests CI-ready. | DevOps + QA |

## High and Critical Risk Traceability

| Risk | Grant requirement | Runtime test ID | Required migration group | Expected evidence | Blocking release gate |
|---|---|---|---|---|---|
| SEC-01 dual RLS policy families | Grants must not broaden access while policies coexist. | RLS-COMP-001 | RLS policy alignment | Row counts for legacy and `mvp1` paths. | No cross-tenant widening. |
| SEC-02 self-assignment | No direct browser grants for assignment/catalog mutation. | NEG-AUTH-008, NEG-AUTH-009 | Membership and assignment alignment | Permission denied and audit evidence. | Self-grant impossible. |
| SEC-03 caller-supplied tenant context | Table grants plus RLS must reject forged tenant fields. | RLS-ORG-003 | Tenant-safe constraints, helper hardening | SQLSTATE/RLS denial. | Tenant field mutation denied. |
| SEC-04 stale inactive/expired access | Helper EXECUTE limited and helper rechecks DB state. | AUTH-HLP-003, AUTH-HLP-005 | Helper hardening | Boolean false/zero rows. | Revoked/expired access denied. |
| SEC-05 public helper execute | Public EXECUTE revoked. | GRANT-003, AUTH-HLP-008 | SQL grant alignment | Permission denied. | No public helper execution. |
| SEC-06 tenant fields editable | Authenticated table privileges do not allow tenant mutation. | NEG-AUTH-005 | RLS policy alignment | SQLSTATE/RLS denial. | Tenant scope immutable to normal users. |
| SEC-07 missing tenant-safe FKs | Grants do not compensate for integrity gaps. | RLS-CLN-003, future FK tests | Tenant-safe constraints | Invalid relationship rejected. | Cross-tenant references blocked. |
| SEC-08 no executable tests | Grant and RLS tests required. | Full suite | Core Foundation database tests | Local test report. | No release without tests. |
| SEC-09 missing lifecycle statuses | Grants cannot authorize suspended entities. | RLS-ORG-004, suspended clinic test | Schema and lifecycle hardening | Suspended access denied. | Suspended org/clinic blocked. |
| SEC-10 broad audit insert | Audit table grants and policies must be append-only and scoped. | future AUD-GRANT-001 | Helper/RLS/grant alignment | Update/delete denied; insert scoped. | Audit integrity preserved. |

## Implementation Order

Recommended next sequence:

1. Approve grant model.
2. Approve runtime test framework.
3. Create test harness and fixtures.
4. Create baseline tests that fail against current gaps.
5. Implement schema hardening migrations.
6. Implement tenant-safe constraints.
7. Harden authorization helpers.
8. Implement RLS alignment.
9. Implement grants.
10. Align seed data.
11. Run full local database test suite.
12. Run `npx supabase db lint`.
13. Regenerate types.
14. Validate application compatibility.

Use test-first sequencing. Do not implement any step in this documentation task.

Core Foundation grant model and runtime database test plan were documented. No executable database or application code was added or modified.

## Migration 008 Runtime Test Update

Task: DB-P1-AUTH-HELPER-GRANT-HARDENING

Implemented executable test coverage:

- `supabase/tests/001_schema_contract.sql` validates helper existence, SECURITY DEFINER metadata, safe function/table grants, RLS enablement, permission catalogue compatibility, and default-privilege hardening.
- `supabase/tests/002_seed_contract.sql` validates deterministic local seed fixtures and seed idempotency.
- `supabase/tests/003_auth_context_helpers.sql` validates active profile resolution, organization membership, clinic membership, wrong org/clinic denial, missing high-risk permission denial, legacy permission denial in standardized helper, suspended/revoked membership denial, inactive profile denial, expired assignment denial, and anon helper execution denial.
- `supabase/tests/004_rls_baseline.sql` validates that authenticated operations now reach RLS for approved grants, including organization/clinic/patient read, patient insert, cross-tenant insert denial, self-assignment read scoping, audit read denial without permission, permission-catalogue mutation denial, and anon patient-table denial.

Red/green evidence:

- Pre-migration red run failed for grant overexposure, missing authenticated DML grants, public/anon helper execution exposure, suspended/revoked/inactive helper fallback behavior, and authenticated operations blocked before RLS.
- Post-migration local run passed: `npx supabase test db supabase/tests --local` reported 4 files, 73 tests, all successful.

Previously blocked tests unblocked:

- Authenticated organization, clinic, patient, RBAC assignment, and audit assertions now reach RLS/table behavior rather than failing at missing base table grants.
- Patient insert with an approved `patient.create` role reaches the existing `WITH CHECK` policy and succeeds for the authorized clinic.
- Cross-tenant patient insert reaches RLS and is denied by the existing policy.

Remaining planned coverage:

- Full RLS policy-family consolidation, legacy policy retirement, tenant-safe FK hardening, lifecycle status tests, role self-assignment controlled workflow tests, and platform-role assignment denial remain outside migration `008`.

## Migration 009 Runtime Test Update

Task: DB-P1-RLS-POLICY-HARDENING

Implemented executable test coverage:

- `supabase/tests/005_rls_policy_consolidation.sql` validates removal of the legacy migration `003` policy family from in-scope Core Foundation tables.
- The test validates that `organizations`, `clinics`, `user_profiles`, `roles`, `permissions`, `role_permissions`, and legacy `user_roles` each have one canonical SELECT policy.
- The test validates that `user_profiles` and legacy `user_roles` have no direct INSERT, UPDATE, DELETE, or ALL policies.
- The test validates canonical policy predicates for organization membership, clinic access plus `clinic.view`, self-or-admin profile read, and self-or-admin role-assignment read.
- The test validates that replacement table policies on `organization_memberships`, `clinic_memberships`, and `user_role_assignments` remain present.

Red/green evidence:

- Pre-migration red run failed 10 of 18 assertions because legacy policies still existed, SELECT policy counts were duplicated, direct mutation policies remained, and canonical policy names were absent.
- Post-migration local run passed: `npx supabase test db supabase/tests --local` reported 5 files, 91 tests, all successful.

Previously blocked tests unblocked:

- Policy-family consolidation is now executable and passing for in-scope Core Foundation tables.
- Direct mutation-policy absence is now executable and passing for `user_profiles` and legacy `user_roles`.
- Canonical Core Foundation policy names and helper composition are now executable and passing.

Remaining blocked coverage:

- Tenant-safe foreign-key violation tests remain blocked until composite FK hardening is implemented.
- Suspended organization and clinic lifecycle denial tests remain blocked until lifecycle statuses are constrained and enforced.
- Controlled role-assignment workflow tests remain blocked until the workflow, audit model, and server-side authorization path are implemented.
- Professional credential and clinical authority tests remain outside Core Foundation Phase 1 RLS policy hardening.

## Migration 010 Runtime Test Update

Task: DB-P1-TENANT-SAFE-FK-HARDENING

Implemented executable test coverage:

- `supabase/tests/006_tenant_safe_fk_integrity.sql` validates preflight zero-count checks for existing mismatched memberships and role assignments.
- The test validates same-tenant organization membership, clinic membership, current role assignment, and legacy `user_roles` compatibility inserts.
- The test validates rejection of cross-organization organization memberships, cross-organization clinic memberships, cross-organization current assignments, cross-clinic organization mismatches, organization-scoped role assignment into another organization, duplicate organization-level current assignments, cross-organization legacy `user_roles`, and orphan role-permission mappings.

Red/green evidence:

- Pre-migration red run failed 7 of 18 assertions because cross-tenant membership and assignment rows were accepted, organization-scoped role mismatch was accepted, and duplicate organization-level assignment with `clinic_id null` was accepted.
- Post-migration local run passed: `npx supabase test db supabase/tests --local` reported 6 files, 109 tests, all successful.

Regression coverage retained:

- Authorization helper tests from `003_auth_context_helpers.sql` remain passing.
- Grant and RLS baseline tests from `001_schema_contract.sql`, `004_rls_baseline.sql`, and `005_rls_policy_consolidation.sql` remain passing.

Remaining blocked coverage:

- Suspended organization and clinic lifecycle denial tests remain blocked until lifecycle statuses are constrained and enforced.
- Controlled role-assignment workflow tests remain blocked until an approved workflow and audit model exist.
- Professional credential and clinical authority tests remain outside this phase.

## Migration 011 Runtime Test Update

Task: DB-P1-LIFECYCLE-CONTROLS-HARDENING

Implemented executable test coverage:

- `supabase/tests/007_core_foundation_lifecycle_controls.sql` validates default lifecycle states, allowed values, allowed transitions, denied transitions, reason requirements, direct-update denial, anonymous execution denial, function security metadata, and helper fail-closed behavior.
- The test validates organization active to suspended, suspended to active through platform recovery, active to closed, and closed to archived.
- The test validates clinic active to suspended, suspended to active, active to closed, and closed to archived.
- The test validates active to archived, closed to suspended, archived to active, empty reason, unauthorized actor, cross-organization actor, and cross-clinic actor denials.
- The test validates organization-overrides-clinic behavior through helper denial for an active clinic inside a suspended organization.

Red/green evidence:

- Pre-migration red run failed because `lifecycle_status` columns and transition functions were absent.
- Post-migration local run passed: `npx supabase test db supabase/tests --local` reported 7 files, 148 tests, all successful.

Regression coverage retained:

- Schema, seed, authorization-helper, grant, RLS baseline, RLS policy consolidation, and tenant-safe FK tests remain passing.

Remaining blocked coverage:

- Full lifecycle audit-event emission remains blocked until DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION.
- Controlled role-assignment workflow tests remain blocked until the workflow exists.
- Downstream Patient, Visit, Clinical, Claim, Evidence, and AI lifecycle enforcement remains later-phase scope.

## Migration 012 Runtime Test Update

Task: DB-P1-CONTROLLED-ROLE-ASSIGNMENT-WORKFLOW

Implemented executable test coverage:

- `supabase/tests/008_controlled_role_assignment_workflow.sql` validates controlled assignment and revocation behavior.
- Assignment tests cover organization-scoped success, clinic-scoped success, persisted target/role/scope, actor derivation, reason requirement, duplicate active assignment rejection, inactive target rejection, missing membership rejection, self-assignment denial, unauthorized actor denial, platform-role escalation denial, invalid dates, and lifecycle denial for suspended, closed, and archived organizations and clinics.
- Revocation tests cover authorized revocation, historical row preservation, revoked authorization denial, database-generated revocation metadata, actor-derived `revoked_by`, reason requirement, repeated revocation failure, cross-tenant denial, and clinic-admin organization-scope denial.
- Security tests cover direct insert/update/delete denial, anonymous function denial, SECURITY DEFINER metadata, fixed search path, and minimal EXECUTE grants.

Red/green evidence:

- Pre-migration red run failed because `assign_role(...)` and `revoke_role_assignment(...)` were absent.
- Post-migration focused run passed: `npx supabase test db supabase/tests/008_controlled_role_assignment_workflow.sql --local` reported 1 file, 43 tests, all successful.

Regression coverage retained:

- Schema, seed, authorization-helper, grant, RLS baseline, RLS policy consolidation, tenant-safe FK, and lifecycle tests remain in the full suite.

Remaining planned coverage:

- Durable audit-event assertions remain blocked until DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION.
- Concurrent two-session race testing remains a future harness enhancement; duplicate active assignment is enforced by filtered unique indexes and tested sequentially.

## Migration 013 Runtime Test Update

Task: DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION

Implemented executable test coverage:

- `supabase/tests/009_core_foundation_audit_events.sql` validates durable audit-event persistence for organization lifecycle, clinic lifecycle, role assignment creation, and role assignment revocation.
- The test validates actor profile capture, tenant and clinic scope, reason capture, before and after state, normalized event type, resource identity, and success outcome.
- The test validates direct audit insert, update, and delete denial for runtime roles.
- The test validates anonymous denial for the internal audit append helper.
- The test validates scoped `audit.view` read access and cross-organization audit invisibility.
- The test validates fail-closed transaction behavior when audit append fails after a protected lifecycle or role-assignment mutation starts.
- The test validates that `append_core_audit_event(...)` is `SECURITY DEFINER` with fixed `search_path = public`.

Red/green evidence:

- Pre-migration red run failed because normalized audit columns were absent.
- Post-migration focused run passed: `npx supabase test db supabase/tests/009_core_foundation_audit_events.sql --local` reported 1 file, 37 tests, all successful.
- Full local DB suite passed: `npx supabase test db --local` reported 9 files, 229 tests, all successful.

Previously blocked coverage unblocked:

- Lifecycle audit-event emission is now executable and passing.
- Controlled role-assignment audit-event persistence is now executable and passing.
- Direct runtime audit mutation denial is now executable and passing.

Remaining planned coverage:

- Full Phase 1 regression and phase-exit review remain after audit implementation.
- Cross-domain audit events, audit exports, tamper-evidence controls, and retention automation remain later-phase work.
