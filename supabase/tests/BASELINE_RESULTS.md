# Core Foundation Local DB Test Baseline

Framework selected: Supabase CLI `supabase test db` with pgTAP SQL tests in `supabase/tests`.

Selection evidence:
- `npx supabase test db --help` reports: "Run pgTAP tests on the local or linked database."
- `npx supabase db query "select name, installed_version, default_version from pg_available_extensions where name = 'pgtap';" --local` returned `pgtap` with default version `1.3.3`; it was available locally but not pre-installed before tests.

Seed strategy:
- `supabase/seed.sql` creates deterministic, synthetic organization and clinic fixtures only.
- The seed is idempotent through `on conflict (id) do update`.
- Auth user, user profile, membership, role assignment, patient, and clinical/RBAC behavior fixtures are created inside pgTAP transactions and rolled back. This avoids treating direct local `auth.users` inserts as production seed behavior.

Auth-context helper pattern exercised by tests:
1. Set local JWT context using `request.jwt.claim.sub` and `request.jwt.claim.role`.
2. Resolve `auth.uid()` through `public.current_user_profile_id()`.
3. Validate active organization membership through `public.is_organization_member(...)`.
4. Validate active clinic membership or allowed organization-wide role through `public.has_clinic_access(...)`.
5. Validate active role assignment and canonical permission through `public.has_permission(...)`.
6. Validate resource scope through RLS policies for organization, clinic, patient, RBAC, and audit resources.
7. Validate deny paths for cross-tenant, missing high-risk permission, legacy colon permission, and anon access.

Baseline result matrix:

| Test ID | Target behavior | Current result | Classification | Linked schema-review gap | Proposed migration group | Release blocking |
| --- | --- | --- | --- | --- | --- | --- |
| DB-TF-001 | Core tenant, RBAC, clinical, and audit tables exist | Pass | pass | GAP-01, GAP-02 | Schema-hardening migration | Yes |
| DB-TF-002 | Standard auth helpers exist and are `security definer` | Pass | pass | GAP-06 | Auth-helper hardening migration | Yes |
| DB-TF-003 | Standard helpers are executable by `authenticated` only | Pass for standardized helpers | pass | GAP-06, GAP-12 | Auth-helper grant migration | Yes |
| DB-TF-004 | `anon` has no direct privileges on protected core tables | Fail: `anon` has at least one direct protected-table privilege | expected_fail_current_gap | GAP-12 | Privilege/grant revocation migration | Yes |
| DB-TF-005 | RLS is enabled on protected core tables | Pass | pass | GAP-07, GAP-08 | RLS hardening migration | Yes |
| DB-TF-006 | Canonical dot permissions and compatibility colon permissions are visible for review | Pass | pass | GAP-03, GAP-04 | RBAC cleanup/compatibility migration | Yes |
| DB-TF-007 | Local seed creates deterministic synthetic organizations and clinics | Pass in transaction-scoped seed contract | pass | GAP-15 | Test foundation seed | No |
| DB-TF-008 | Local seed can be rerun idempotently | Pass | pass | GAP-15 | Test foundation seed | No |
| DB-TF-009 | Active profile and active organization membership resolve through `auth.uid()` | Pass | pass | GAP-06, GAP-08 | Auth-helper hardening migration | Yes |
| DB-TF-010 | Cross-organization membership is denied | Pass | pass | GAP-07, GAP-08 | RLS hardening migration | Yes |
| DB-TF-011 | Clinic-scoped role does not grant sibling-clinic access | Pass | pass | GAP-07, GAP-08 | RLS hardening migration | Yes |
| DB-TF-012 | Canonical permission grants expected scoped behavior | Pass | pass | GAP-04, GAP-06 | RBAC/helper migration | Yes |
| DB-TF-013 | Legacy colon permission is not accepted by standardized helper | Pass | pass | GAP-03, GAP-04 | RBAC cleanup migration | Yes |
| DB-TF-014 | Suspended organization membership is denied | Fail: suspended profile is still accepted by profile fallback | expected_fail_current_gap | GAP-08 | Auth-helper hardening migration | Yes |
| DB-TF-015 | Primary clinic fallback for suspended membership is documented as current-risk behavior | Pass, documents current risky fallback | pass | GAP-08 | Auth-helper hardening migration | Yes |
| DB-TF-016 | `anon` cannot execute authorization helpers | Pass | pass | GAP-06, GAP-12 | Auth-helper grant migration | Yes |
| DB-TF-017 | RLS exposes only authenticated user's organization and clinic | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-07, GAP-08, GAP-12 | Grant/RLS hardening migration | Yes |
| DB-TF-018 | RLS permits same-clinic patient read and denies cross-tenant read | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-07, GAP-08, GAP-12 | Grant/RLS hardening migration | Yes |
| DB-TF-019 | RLS permits same-clinic patient insert with `patient.create` | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-07, GAP-08, GAP-12 | Grant/RLS hardening migration | Yes |
| DB-TF-020 | RLS denies cross-tenant patient insert | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-07, GAP-08, GAP-12 | Grant/RLS hardening migration | Yes |
| DB-TF-021 | RBAC self-assignment visibility is scoped without `role.assign` | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-09, GAP-12 | RBAC/grant migration | Yes |
| DB-TF-022 | Audit logs are hidden without `audit.view` | Blocked before RLS: missing authenticated table grants | expected_fail_current_gap | GAP-10, GAP-12 | Audit/RLS/grant migration | Yes |
| DB-TF-023 | `anon` cannot read protected patient data | Pass | pass | GAP-12 | Privilege/grant revocation migration | Yes |

Current open risks:
- Baseline execution may surface expected failures tied to the current schema-review gaps; those failures should drive the next hardening migrations rather than be masked in tests.
- Direct `auth.users` inserts are limited to transaction-scoped pgTAP fixtures. If Supabase auth schema changes locally, fixture setup should move to a verified local auth fixture utility.
- No production schema, RLS, grant, or application behavior is changed by this test foundation.

## Migration 008 Result Update

Migration implemented: `supabase/migrations/008_core_foundation_auth_helpers_and_grants.sql`.

Post-migration result:

- `npx supabase db reset --local` applied migrations `001` through `008` and seeded `supabase/seed.sql`.
- `npx supabase test db supabase/tests --local` passed 73 pgTAP tests.
- Prior grant/helper expected failures DB-TF-004, DB-TF-014, DB-TF-017, DB-TF-018, DB-TF-019, DB-TF-020, DB-TF-021, and DB-TF-022 are now covered by passing tests.

Remaining next-phase risk:

- RLS policy-family hardening remains separate. The tests now prove the grant/helper layer allows approved authenticated operations to reach RLS, not that every current RLS policy is production-complete.
