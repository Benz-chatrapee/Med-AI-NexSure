# Database Access Grant Model

## 1. Document Control

Task: DB-P1-CORE-REVIEW-GAP-CLOSURE
Status: Planned grant model for Core Foundation hardening. Runtime effect: none.

Allowed object statuses: Existing Compliant, Existing Non-compliant, Existing Compatibility Sensitive, Missing, Planned, Review Required.

## 2. Purpose

Define the authoritative SQL privilege, schema access, table access, sequence access, function execution, and service-role boundary for Med AI NexSure Core Foundation.

This document closes the grant-model documentation gap identified in `docs/database/core-foundation-schema-review.md`. It does not create executable `GRANT` or `REVOKE` SQL.

## 3. Scope

In scope:

- Schemas: `public`, `auth`, `storage`, and any verified internal/private schema.
- Supabase roles: `anon`, `authenticated`, `service_role`, `postgres` or migration owner.
- Core Foundation tables: `organizations`, `clinics`, `user_profiles`, `clinic_users`, `roles`, `permissions`, `role_permissions`, `user_roles`.
- Compatibility tables: `organization_memberships`, `clinic_memberships`, `user_role_assignments`.
- Authorization helper functions, RLS policies, SQL grants, and browser/server access boundaries.

Out of scope:

- Writing migrations, functions, policies, grants, tests, seeds, generated types, application code, or configuration.

## 4. Current Repository Evidence

| Evidence | Current finding | Status |
|---|---|---|
| `supabase/config.toml` | API exposes `public` and `graphql_public`; commented setting notes new entities are not auto-exposed without explicit grants. | Existing Compatibility Sensitive |
| `supabase/migrations/003_rls_policies.sql` | Creates five SECURITY DEFINER helper functions and RLS policies but no explicit helper-function `REVOKE`/`GRANT` statements. | Existing Compatibility Sensitive |
| `supabase/migrations/007_rbac_helpers_policies_indexes_seed.sql` | Creates four newer SECURITY DEFINER helpers, revokes public execute, and grants execute to `authenticated`. | Existing Compliant |
| RLS policies | Core tables have legacy policies from `003`; `007` adds `mvp1_*` policies without dropping legacy policy names. | Existing Compatibility Sensitive |
| Table grants | No explicit table-level grant or revoke migration was verified for Core Foundation tables. | Review Required |
| Default privileges | No `ALTER DEFAULT PRIVILEGES` statement was found in reviewed migrations. | Review Required |
| `supabase/seed.sql` | Missing while `supabase/config.toml` lists `./seed.sql`. | Missing |
| `supabase/tests/` | Missing. Grant assertions are not executable yet. | Missing |
| Browser access | `lib/auth/supabase-browser.ts` creates a Supabase browser client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`. | Existing Compliant |
| Server health access | `lib/database/supabase-rest.ts` is server-only and uses anon/publishable key for health check, not service role. | Existing Compliant |
| Service-role browser scan | Scoped search found no browser service-role usage. | Existing Compliant |
| Generated types | No generated Supabase `Database` schema type was verified in scoped evidence. | Review Required |

## 5. PostgreSQL Privilege Principles

SQL privileges and RLS are separate enforcement layers. A role must have the SQL privilege to attempt an operation, and RLS must also allow the row-level operation.

Required principles:

- Fail closed by default.
- Grant schema `USAGE` only when a role must resolve objects.
- Grant table privileges only for approved workflows.
- Revoke public function EXECUTE on sensitive helpers.
- Grant helper EXECUTE explicitly to the minimum runtime role.
- Keep migration ownership separate from runtime access.
- Do not use `service_role` to prove normal-user authorization.
- Do not rely on frontend visibility as authorization.
- Do not let default privileges silently reopen access after explicit revocation.

## 6. Supabase Role Model

| Role | Purpose | Expected use | Status |
|---|---|---|---|
| `anon` | Unauthenticated API role | Public-only, non-sensitive reads where explicitly approved. | Planned |
| `authenticated` | Logged-in user API role | Approved browser/server user workflows, constrained by grants and RLS. | Planned |
| `service_role` | Privileged backend role that bypasses RLS | Server-only controlled operations, never browser. | Existing Compatibility Sensitive |
| `postgres` or migration owner | Schema/migration owner | Applies migrations, owns functions where appropriate, manages grants. | Review Required |
| Custom roles | None verified | Add only with explicit architecture approval. | Missing |

## 7. anon Role

Expected Core Foundation access: no sensitive Core Foundation table access.

| Object class | Expected `anon` privilege | Rationale | Status |
|---|---|---|---|
| `public` schema | Review Required; normally no Core object usage except explicitly public endpoints. | Avoid object discovery and accidental exposure. | Review Required |
| Core Foundation tables | None. | Tenant, identity, RBAC, audit, and clinical boundaries are sensitive. | Planned |
| Core helper functions | None. | Helpers depend on authenticated identity and tenant context. | Planned |
| Storage buckets | None for Core private buckets. | Buckets are private; object policies are separate. | Planned |
| Auth schema | Supabase-managed only. | Do not grant direct app SQL access. | Existing Compliant |

## 8. authenticated Role

Expected Core Foundation access: only privileges required for approved client workflows, always paired with RLS and helper checks.

Current repository evidence shows policies on many tables but only newer helper EXECUTE grants. Table privileges need an explicit migration and tests before production readiness.

| Object class | Expected `authenticated` privilege | Rationale | Status |
|---|---|---|---|
| Tenant readable tables | Minimal `SELECT` only where RLS applies. | Allows scoped reads through policies. | Planned |
| Patient/visit/clinical writes | Only approved operation-specific privileges. | Avoid broad mutation from browser. | Planned |
| RBAC catalog writes | None from normal user paths. | Prevent privilege escalation. | Planned |
| Role assignment writes | None except approved controlled workflow/function. | Prevent role self-assignment. | Planned |
| Helper functions | EXECUTE only on approved helpers. | Centralized RLS predicate support. | Existing Compliant for `007`, Compatibility Sensitive for `003` |

## 9. service_role

`service_role` remains server-only and must never be exposed to browser code, logs, docs examples with real keys, local fixtures, or generated client bundles.

Expected use:

- Controlled backend maintenance.
- Server-only administrative workflows after authorization.
- Migration/test setup only when explicitly separated from user-RLS tests.

Prohibited use:

- Browser clients.
- Normal-user RLS proof.
- Convenience bypass for tenant isolation.
- Evidence export or clinical write workflows without application-level authorization and audit.

## 10. Database Owner and Migration Owner

Migration ownership and runtime ownership must be distinguished.

| Owner concept | Expected responsibility | Status |
|---|---|---|
| Migration owner | Applies schema, policies, grants, revokes, default privileges. | Review Required |
| Function owner | Owns SECURITY DEFINER helpers with controlled search path and minimal privileges. | Review Required |
| Runtime roles | `anon`, `authenticated`, and `service_role` consume explicit grants only. | Planned |
| Application users | Never map to direct PostgreSQL owners. | Existing Compliant |

Required future evidence: function owner inventory, table owner inventory, and default privilege inventory after local reset.

## 11. Schema USAGE

| Schema | Current evidence | Expected access | Status |
|---|---|---|---|
| `public` | API config exposes `public`; migrations create app objects here. | `authenticated` receives only required `USAGE`; `anon` is Review Required and should not receive Core access by default. | Review Required |
| `auth` | `user_profiles.id` references `auth.users(id)`; no direct grants reviewed. | Runtime roles do not receive direct table access; Supabase Auth manages access. | Existing Compliant |
| `storage` | Buckets are inserted in migration `007` when schema exists; object policies absent. | Storage access controlled by storage policies and server workflows. | Existing Compatibility Sensitive |
| private/internal | None verified. | Create only with architecture approval; no public access by default. | Missing |

## 12. Table Privileges

RLS does not replace table privilege review. The target model is minimum privilege:

- `anon`: no Core Foundation table privileges.
- `authenticated`: minimal `SELECT`, `INSERT`, `UPDATE`, or `DELETE` only where approved and RLS enforced.
- `service_role`: server-only unrestricted operational access, never used for normal-user tests.
- migration owner: full DDL/DML required for migrations.

Normal users must not mutate `roles`, `permissions`, `role_permissions`, or `user_roles` through broad table grants. Future role assignment should use a controlled server function or policy set that denies self-assignment and platform-role escalation.

## 13. Sequence Privileges

Core Foundation uses UUID primary keys generated by `gen_random_uuid()`. No application-owned sequences were verified for Core Foundation tables.

| Object | Current privilege | Expected privilege | Status |
|---|---|---|---|
| Core Foundation sequences | None verified | No runtime sequence privilege required unless future serial objects are introduced. | Existing Compliant |
| Future sequences | Missing | Must be explicitly granted or denied and tested. | Planned |

## 14. Function EXECUTE Privileges

| Function | Current privilege evidence | Expected privilege | Role receiving privilege | Status | Required migration | Required test |
|---|---|---|---|---|---|---|
| `current_user_profile()` | No explicit revoke/grant found in `003`. | Revoke from `public`; grant only if retained. | `authenticated` only if needed. | Existing Compatibility Sensitive | Grant hardening migration. | GRANT-FN-003-01 |
| `current_user_organization_id()` | No explicit revoke/grant found in `003`. | Revoke from `public`; grant only if retained. | `authenticated` only if needed. | Existing Compatibility Sensitive | Grant hardening migration. | GRANT-FN-003-02 |
| `current_user_clinic_ids()` | No explicit revoke/grant found in `003`. | Revoke from `public`; retire or compatibility-wrap. | `authenticated` only if needed. | Existing Compatibility Sensitive | Helper migration. | GRANT-FN-003-03 |
| `current_user_has_role(text)` | No explicit revoke/grant found in `003`. | Revoke from `public`; retire or compatibility-wrap. | `authenticated` only if needed. | Existing Compatibility Sensitive | Helper migration. | GRANT-FN-003-04 |
| `current_user_has_permission(text)` | No explicit revoke/grant found in `003`. | Revoke from `public`; retire or compatibility-wrap. | `authenticated` only if needed. | Existing Compatibility Sensitive | Helper migration. | GRANT-FN-003-05 |
| `current_user_profile_id()` | `007` revokes public and grants `authenticated`. | Keep explicit authenticated EXECUTE. | `authenticated`. | Existing Compliant | None unless owner changes. | GRANT-FN-007-01 |
| `is_organization_member(uuid)` | `007` revokes public and grants `authenticated`. | Keep explicit authenticated EXECUTE. | `authenticated`. | Existing Compliant | None unless fallback changes. | GRANT-FN-007-02 |
| `has_clinic_access(uuid, uuid)` | `007` revokes public and grants `authenticated`. | Keep explicit authenticated EXECUTE. | `authenticated`. | Existing Compliant | None unless null-clinic behavior changes. | GRANT-FN-007-03 |
| `has_permission(text, uuid, uuid)` | `007` revokes public and grants `authenticated`. | Keep explicit authenticated EXECUTE. | `authenticated`. | Existing Compliant | None unless canonical key changes. | GRANT-FN-007-04 |
| `set_updated_at()` | Trigger function; no explicit runtime grant needed for API use. | No public EXECUTE unless required by trigger execution semantics. | Migration owner/table owner. | Review Required | Function privilege inventory. | GRANT-FN-TRG-01 |
| `assert_claim_readiness_weights()` | Constraint trigger helper; no explicit runtime grant reviewed. | No public EXECUTE unless required. | Migration owner/table owner. | Review Required | Function privilege inventory. | GRANT-FN-TRG-02 |

## 15. SECURITY DEFINER Functions

Requirements:

- Fixed `search_path`.
- Controlled owner.
- Explicit EXECUTE grants.
- No trust in caller-supplied tenant context without `auth.uid()` membership checks.
- No recursive RLS dependency that can fail open.
- Null and inactive-user behavior fails closed.

Current status:

- `003` helpers are SECURITY DEFINER and set `search_path = public`, but explicit EXECUTE grants are not present.
- `007` helpers are SECURITY DEFINER, set `search_path = public`, and have explicit public revoke/authenticated grant.
- Owner was not verified by static file review and needs runtime introspection.

## 16. RLS and Grant Interaction

RLS policies are row filters. SQL grants are object gates. A secure operation needs both.

Examples:

- A user with `SELECT` on `patients` but no matching RLS row sees no rows.
- A user with matching RLS policy but no table `SELECT` cannot read the table.
- `service_role` bypasses RLS and must be tested separately from normal users.
- Multiple permissive RLS policies combine with OR semantics, so legacy and `mvp1_*` policy coexistence is compatibility-sensitive.

## 17. Default Privileges

No `ALTER DEFAULT PRIVILEGES` statement was verified in migrations. Future grant migration must explicitly set default privileges for migration owners so new tables, sequences, and functions are not silently exposed.

Required future checks:

- Default table privileges for `anon`, `authenticated`, `service_role`.
- Default function EXECUTE privileges, especially public EXECUTE defaults.
- Default sequence privileges if sequences are introduced.
- Post-restore privilege drift.

## 18. Revocation Strategy

Planned revocation strategy:

| Step | Purpose | Status |
|---|---|---|
| Inventory current grants | Establish baseline after local reset. | Planned |
| Revoke public helper EXECUTE | Prevent unauthenticated direct helper use. | Existing Compliant for `007`; Planned for `003` |
| Revoke Core table access from `anon` | Deny sensitive Core Foundation object access. | Planned |
| Grant minimal authenticated access | Allow only approved RLS-backed workflows. | Planned |
| Separate service_role checks | Confirm server-only usage. | Planned |
| Set default privileges | Prevent future object exposure drift. | Planned |
| Add grant tests | Make revocation enforceable in CI/local validation. | Planned |

## 19. Core Foundation Access Matrix

| Object | anon | authenticated | service_role | migration_owner | Expected RLS | Allowed operations | Prohibited operations | Justification | Test ID |
|---|---|---|---|---|---|---|---|---|---|
| `organizations` | none | scoped `SELECT`; no direct browser mutation | server-only | full DDL/DML | yes | Read own organization through RLS | Cross-org read; tenant lifecycle mutation | Tenant root is sensitive. | GRANT-TBL-001 |
| `clinics` | none | scoped `SELECT`; future controlled writes | server-only | full DDL/DML | yes | Read assigned clinics | Cross-clinic read; unrelated clinic mutation | Clinic boundary controls PHI workflows. | GRANT-TBL-002 |
| `user_profiles` | none | self/scoped `SELECT`; column-safe update only after hardening | server-only | full DDL/DML | yes | Read self; approved profile updates | Tenant scope mutation | Identity joins must fail closed. | GRANT-TBL-003 |
| `clinic_users` | none | none | none | none | n/a | None | Any access | Table is Missing; use `clinic_memberships` pending decision. | GRANT-TBL-004 |
| `roles` | none | scoped `SELECT` only if needed | server-only controlled | full DDL/DML | yes | Read role catalogue needed for UI | Mutate system/tenant roles from browser | Role mutation is privilege-sensitive. | GRANT-TBL-005 |
| `permissions` | none | scoped/catalog `SELECT` only if approved | server-only controlled | full DDL/DML | yes | Read permission catalogue only where needed | Create/update/delete permissions | Permission mutation can escalate access. | GRANT-TBL-006 |
| `role_permissions` | none | `SELECT` only if approved | server-only controlled | full DDL/DML | yes | Read role mappings if UI needs them | Mutate grants | Grant mapping is privilege-sensitive. | GRANT-TBL-007 |
| `user_roles` | none | self/scoped `SELECT` only during compatibility | server-only controlled | full DDL/DML | yes | Read own legacy assignments | Direct browser assignment; self-assignment | Legacy assignment model is compatibility-sensitive. | GRANT-TBL-008 |
| `organization_memberships` | none | scoped `SELECT` | server-only controlled | full DDL/DML | yes | Read own/org memberships through RLS | Direct browser membership mutation | Membership is authoritative tenant access. | GRANT-TBL-009 |
| `clinic_memberships` | none | scoped `SELECT` | server-only controlled | full DDL/DML | yes | Read assigned clinic memberships | Direct browser membership mutation | Clinic access must be revocable. | GRANT-TBL-010 |
| `user_role_assignments` | none | self/scoped `SELECT`; controlled assignment workflow later | server-only controlled | full DDL/DML | yes | Read own/current assignments | Self-assignment; platform-role grant | Canonical future assignment model. | GRANT-TBL-011 |
| helper functions `003` | none | only if retained | server-only | full manage | n/a | Compatibility execution if needed | Public execute | Older helpers lack expiry/membership model. | GRANT-FN-003 |
| helper functions `007` | none | `EXECUTE` | server-only | full manage | n/a | RLS predicates | Public execute | Newer helpers check membership and expiry. | GRANT-FN-007 |

## 20. Browser versus Server Access

| Access path | Current evidence | Expected boundary | Status |
|---|---|---|---|
| Browser Supabase client | Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. | Browser can only use anon/publishable key and RLS-backed workflows. | Existing Compliant |
| Server health check | Uses anon/publishable key from server-only module. | Health checks must not require service role. | Existing Compliant |
| Service-role operations | No scoped browser usage found. | Server-only, audited, and never bundled. | Existing Compliant |
| Direct browser Core table access | Not verified beyond scoped search. | Allowed only after grant/RLS tests prove least privilege. | Review Required |

## 21. Service-role Restrictions

Rules:

- Store only in server-only environment, never `NEXT_PUBLIC_*`.
- Never log, print, include in docs examples, or expose in browser bundles.
- Use only for controlled backend workflows with separate authorization and audit.
- Do not use to validate normal-user RLS tests.
- Treat local CLI status output as sensitive and avoid copying keys into reports.

## 22. Audit and Administrative Access

Auditors remain read-only. Executives do not receive direct unrestricted PHI table access.

| Role concept | Expected access | Status |
|---|---|---|
| Auditor | Scoped `audit_logs` read only; no role/permission mutation. | Planned |
| Compliance officer | Scoped audit/claim evidence review without unrestricted PHI mutation. | Planned |
| Executive | Aggregate or scoped read; no direct broad PHI table access. | Planned |
| Organization admin | Tenant administration only; no platform-role assignment; no professional authority by default. | Planned |
| Platform admin | Platform administration only; clinical authority requires separate professional scope. | Review Required |

## 23. Compatibility-sensitive Existing Grants

| Area | Compatibility risk | Status |
|---|---|---|
| `003` helper EXECUTE | No explicit public revoke/grant found. | Existing Compatibility Sensitive |
| Legacy policies | Use `user_roles` and colon permissions. | Existing Compatibility Sensitive |
| `mvp1_*` policies | Use `user_role_assignments` and dot permissions while legacy policies remain active. | Existing Compatibility Sensitive |
| Broad catalogue select policies | `permissions` and `role_permissions` select is allowed for all authenticated users. | Existing Compatibility Sensitive |
| `user_roles_manage_admin` | Legacy admin can manage assignments without explicit self-assignment/platform-role denial. | Existing Non-compliant |
| Default privileges | Not documented or tested. | Review Required |

## 24. Planned Grant Migration

Conceptual migration requirements only:

| Group | Requirement | Dependency | Required test |
|---|---|---|---|
| Grant inventory | Capture schemas, tables, functions, owners, grants, default privileges. | Local reset. | GRANT-INV-001 |
| Public revocation | Revoke public execute on sensitive helpers and table access on Core objects. | Inventory. | GRANT-PUB-001 |
| Authenticated grants | Grant minimal table/function privileges required for RLS-backed workflows. | Canonical policy model. | GRANT-AUTH-001 |
| Service-role boundary | Document server-only use and separate tests from RLS tests. | App secret review. | GRANT-SVC-001 |
| Default privileges | Set fail-closed defaults for future objects. | Migration owner decision. | GRANT-DEF-001 |
| Compatibility cleanup | Retire or compatibility-wrap legacy helper/policy grants. | RBAC model decision. | GRANT-COMPAT-001 |

## 25. Grant Test Requirements

Every grant test must record:

- actor role: `anon`, `authenticated`, `service_role`, or migration owner.
- schema privilege result.
- table privilege result.
- function EXECUTE result.
- RLS result where applicable.
- expected SQLSTATE or failure class.
- evidence query.
- cleanup.

Minimum grant tests:

| Test ID | Requirement | Status |
|---|---|---|
| GRANT-001 | `anon` cannot access Core Foundation tables. | Planned |
| GRANT-002 | `authenticated` has only required table privileges. | Planned |
| GRANT-003 | `authenticated` cannot mutate permission catalogue. | Planned |
| GRANT-004 | `public` cannot execute sensitive helpers. | Planned |
| GRANT-005 | `authenticated` can execute approved helpers. | Planned |
| GRANT-006 | default privileges do not expose new Core objects. | Planned |
| GRANT-007 | service role is absent from browser/client configuration. | Planned |
| GRANT-008 | migration owner can apply grant migrations. | Planned |

## 26. Security Risks

| Risk ID | Severity | Risk | Preventive control | Detective control | Runtime test |
|---|---|---|---|---|---|
| GRISK-01 | Critical | Legacy and `mvp1_*` permissive RLS policies may widen access. | One canonical policy family per table. | Policy inventory after migration. | RLS-COMP-001 |
| GRISK-02 | Critical | Role or permission self-assignment. | Controlled assignment workflow and deny self-grant. | Audit role/permission changes. | RBAC-ESC-001 |
| GRISK-03 | High | Public EXECUTE on older SECURITY DEFINER helpers. | Revoke public and grant explicitly. | Function privilege inventory. | GRANT-FN-003 |
| GRISK-04 | High | Table grants give `authenticated` broader access than policies intend. | Minimal grants by table and operation. | Grant matrix test. | GRANT-AUTH-001 |
| GRISK-05 | High | Default privileges reopen access after future migrations. | Explicit default privilege migration. | Default privilege audit. | GRANT-DEF-001 |
| GRISK-06 | High | Service role appears in browser flow. | Secret naming and build review. | Static scan and runtime env check. | GRANT-SVC-001 |
| GRISK-07 | High | Tenant fields editable by normal users. | Column-safe update route or policy. | Audit tenant field mutations. | RLS-MUT-001 |

## 27. Review Required Decisions

| Decision | Why it blocks implementation | Owner |
|---|---|---|
| Exact table privileges for `authenticated` | RLS policies exist, but table grants are not documented/tested. | Database + Security |
| Whether `anon` receives any `public` schema usage | Core Foundation should be private by default. | Security |
| Canonical RBAC assignment model | Grants/policies differ between `user_roles` and `user_role_assignments`. | Database + Security |
| Legacy helper retirement timeline | Older helpers lack explicit grant hardening and assignment expiry. | Database |
| Default privilege owner | Needs migration owner and runtime owner decision. | Database + DevOps |
| Role/permission administration path | Must deny self-assignment and platform-role escalation. | Security + Product |
| `clinic_users` replacement | Table is missing; likely replaced by `clinic_memberships`. | Database + Product |

## 28. Migration 008 Implemented Grant Model

Task: DB-P1-AUTH-HELPER-GRANT-HARDENING

Implemented migration: `supabase/migrations/008_core_foundation_auth_helpers_and_grants.sql`.

Schema grants:

- `public` schema privileges are revoked from `public`, `anon`, and `authenticated`.
- `USAGE` on `public` is granted back to `anon` and `authenticated` for object resolution only.

Function grants:

- Sensitive Core authorization helpers are revoked from `public`, `anon`, and `authenticated`, then explicitly granted only to `authenticated`.
- Helpers covered: `current_user_profile()`, `current_user_organization_id()`, `current_user_clinic_ids()`, `current_user_has_role(text)`, `current_user_has_permission(text)`, `current_user_profile_id()`, `is_organization_member(uuid)`, `has_clinic_access(uuid, uuid)`, and `has_permission(text, uuid, uuid)`.
- `set_updated_at()` is revoked from runtime roles because it is a trigger helper, not an approved runtime RPC.

Table grants:

- `anon` receives no Core Foundation table privileges.
- `authenticated` receives `SELECT` on RLS-protected tenant, identity, membership, RBAC read, clinical, claim, settings, and audit tables needed by existing policies.
- `authenticated` receives direct DML only where existing policies already define RLS checks: selected patient, visit, SOAP, prescription, inventory, claim-review, organization-claim-settings, visit-vital, visit-diagnosis, and audit insert/update operations.
- `authenticated` does not receive direct mutation privileges on `roles`, `permissions`, `role_permissions`, `user_roles`, or `user_role_assignments`.

Default privileges:

- Default privileges in `public` are explicitly revoked for future tables, sequences, and functions from `public`, `anon`, and `authenticated`.
- Migration-owner identity remains `postgres` in the local environment; owner strategy for hosted environments remains Review Required before production rollout.

Validation evidence:

- `npx supabase test db supabase/tests --local` passed 73 pgTAP tests after migration `008`.
- Grant tests verify anon table denial, no unsafe authenticated privilege classes, approved authenticated DML to reach RLS, no direct RBAC catalogue mutation, restricted helper execution, and explicit default privilege entries.

Remaining Review Required:

- Service-role operational workflows are still server-only by policy and were not used for normal-user assertions.
- RLS policy hardening remains separate because this migration intentionally avoids policy predicate redesign.
