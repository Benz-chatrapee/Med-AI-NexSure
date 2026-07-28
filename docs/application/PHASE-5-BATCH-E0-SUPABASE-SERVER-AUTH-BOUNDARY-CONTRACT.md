# PHASE 5 - BATCH E0 Authenticated Supabase App Router Server Boundary Contract

## 1. Document Control

| Field | Value |
|---|---|
| Product | Med AI NexSure - Enterprise Healthcare & Insurance Intelligence Platform |
| Phase / Batch | PHASE 5 - BATCH E0 |
| Contract Name | Authenticated Supabase App Router Server Boundary Contract |
| Artifact Type | RECONSTRUCTED / RECONCILED |
| Downstream Dependency | PHASE 5 - BATCH E Doctor Dashboard Canonical Read Integration |
| Target Boundary | Next.js App Router server-side Supabase authenticated session boundary |
| Record State | CLOSED |
| Contract Status | APPROVED |
| Implementation Status | COMPLETE |
| Validation Status | PASS |
| Closure Status | CLOSED |
| Implementation Authorization | COMPLETE |
| Deployment Authorization | NO |
| E0 prerequisite for Batch E | SATISFIED |
| Scope Type | Reconstructed contract with reconciled governance |

This reconstructed contract preserves the recovered historical proposed E0 server-auth boundary while normalizing the top-level metadata to the current reconciled governance state supported by `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`. It is not the original approved E0 contract revision.

## 2. Objective

Establish an authenticated Next.js App Router server boundary for Supabase-backed server reads so downstream Batch E can:

- derive authenticated user identity on the server;
- propagate authenticated Supabase user context to server-side Supabase requests;
- derive organization, clinic, membership, role, and permission context from trusted server/database evidence;
- preserve RLS/RBAC as authoritative;
- prevent browser exposure of service-role credentials or secret keys;
- reject unauthenticated, expired, invalid, cross-organization, and cross-clinic access safely.

## 3. Repository Evidence

Evidence priority used for this contract:

1. Existing package and lockfile dependencies
2. Existing auth/database adapters
3. Existing server-side query/command service patterns
4. Existing route/login implementation
5. Relevant tests
6. Phase 5 Batch E contract dependency

Confirmed evidence:

| Evidence | Finding |
|---|---|
| `package.json` | Confirms `@supabase/supabase-js` `^2.110.7`. No `@supabase/ssr` dependency is declared. Scripts include `lint` and `build`; no `test` or `typecheck` script exists. |
| `package-lock.json` | Confirms installed `@supabase/supabase-js` version `2.110.7`. No `@supabase/ssr` package entry was confirmed. |
| Repository search across `app/`, `lib/`, and `features/` | No confirmed `next/headers`, `cookies()`, `headers()`, or `createServerClient` cookie-aware App Router pattern was found. |
| `lib/auth/supabase-browser.ts` | Existing browser Supabase client uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, generated `Database` types, and browser auth persistence. It is client-only and not a trusted server session boundary. |
| `lib/database/env.ts` | Existing server-only helper returns Supabase URL and anon key. It does not read request cookies/headers, derive a user, or create authenticated request-scoped Supabase context. |
| `lib/database/supabase-rest.ts` | Existing server-only health check uses anon key configuration and does not establish user session context. |
| `features/patient-claims/server/claim-query-service.ts` | Existing server query service accepts/injects a context with actor, organization, clinic, and optional access token; default context is demo environment based. It demonstrates tenant assertion and REST `Authorization: Bearer` propagation but does not establish request cookie/session auth. |
| `features/patient-claims/server/claim-workflow-command-service.ts` | Existing command service requires an access token for REST RPC calls and uses demo environment context by default. It is not an App Router authenticated user-session boundary. |
| `features/patient-claims/server/claim-query-service.test.ts` | Existing Vitest pattern verifies trusted organization/clinic scope is passed to queries and rejects rows outside tenant/clinic scope. |
| `features/patient-claims/server/claim-workflow-command-service.test.ts` | Existing Vitest pattern verifies access-token propagation and missing-token handling for server-side command services. |
| `app/login/page.tsx` and `features/authentication/components/login-form.tsx` | Current login UI is demo/navigation oriented; without injected `onSubmit`, it routes to `/dashboard`. No confirmed Supabase Auth sign-in, cookie setting, callback, or server session establishment was found. |
| `features/core-foundation/services/core-foundation-service.ts` | Existing service uses `createSupabaseBrowserClient()` and therefore is browser/client oriented, not a server auth boundary. |
| `docs/application/PHASE-5-BATCH-E-DOCTOR-DASHBOARD-INTEGRATION-CONTRACT.md` | Batch E identifies authenticated App Router Supabase server boundary as a blocking prerequisite and requires a separately approved prerequisite contract before implementation may begin. |

## 4. Current Auth Pattern

Confirmed existing auth/database pattern:

- Browser Supabase access exists through `lib/auth/supabase-browser.ts`.
- Server-only environment configuration exists through `lib/database/env.ts`.
- Server query/command services can accept an injected context and propagate an access token to Supabase REST calls.
- Existing server service tests use dependency injection to validate context propagation and tenant scope.
- Login UI exists, but current default behavior is demo navigation and not confirmed Supabase Auth session establishment.

Missing auth boundary:

- No confirmed cookie-aware authenticated Supabase App Router server client.
- No confirmed `next/headers`, `cookies()`, `headers()`, or App Router request-cookie session extraction.
- No confirmed server-side `auth.getUser()` pattern tied to a request session.
- No confirmed mechanism that turns a browser-authenticated Supabase session into a trusted server-side Supabase request context.
- No confirmed server helper that returns authenticated user, profile, organization, clinic, memberships, roles, and permissions from trusted server/database sources.

## 5. Required Contract Decisions

| Decision | Classification | Contract |
|---|---|---|
| Authenticated App Router Supabase server boundary | BLOCKED UNTIL IMPLEMENTED BY THIS PREREQUISITE | Current evidence does not establish the boundary. Batch E Doctor Dashboard implementation cannot begin until this E0 contract is separately approved and implemented. |
| `@supabase/ssr` | CANDIDATE ONLY | `@supabase/ssr` is not present. It may be considered in a later approved implementation if dependency review approves it, but this contract does not prescribe it. |
| Server-derived user identity | REQUIRED | Server-side auth helper must derive the current Supabase Auth user from the request/session context and must not accept user id from the client as authority. |
| Organization/clinic/member/role context | REQUIRED | Server-side identity context must derive profile, organization, clinic, memberships, roles, and permissions from trusted database/RLS-backed reads. Client-provided tenant or clinic ids are filters only. |
| Supabase request auth propagation | REQUIRED | Server-side Supabase requests must execute with the authenticated user's access token/session context so existing RLS/RBAC applies as the user, not as service-role. |
| Unauthorized and expired session behavior | REQUIRED | Missing, expired, invalid, or unverifiable sessions must return a safe unauthenticated/forbidden result and no domain data. |
| Tenant isolation | REQUIRED | Server boundary must reject cross-organization and cross-clinic requests before returning data, and RLS/RBAC remains defense in depth. |
| Existing RLS/RBAC | CONFIRMED AUTHORITY | No RLS, RBAC, SQL, migration, generated type, RPC, or claim workflow changes are authorized by E0. |
| Browser credential exposure | PROHIBITED | No service-role key, secret key, privileged token, raw session token, or server-only credential may be exposed to browser code, logs, serialized props, client components, or exported bundles. |

## 6. Trust Boundary Contract

The E0 boundary must create a server-only module that:

1. Reads the current request's authenticated Supabase session/user through an approved App Router-compatible mechanism.
2. Verifies the session server-side before any domain read.
3. Creates a request-scoped Supabase server client or REST gateway that sends authenticated user context to Supabase.
4. Resolves a normalized server identity context:

```text
authUserId
profileId
organizationIds
activeOrganizationId
clinicIds
activeClinicId
roles
permissions
sessionExpiresAt or equivalent validity signal
```

5. Derives organization and clinic context from trusted database rows, not from client input.
6. Treats client organization/clinic/doctor filters as requested scope only; each requested scope must be checked against the trusted identity context.
7. Returns safe typed results for unauthenticated, forbidden, configuration, and upstream Supabase failures.
8. Keeps domain-specific read mapping outside this boundary unless needed for boundary verification tests.

## 7. Unauthorized / Expired Session Behavior

| Scenario | Required Behavior |
|---|---|
| No session/cookie/token | Return safe unauthenticated result; do not query domain data. |
| Expired session | Return safe unauthenticated or session-expired result; do not attempt client-trusted recovery in server read path. |
| Invalid session | Return safe unauthenticated result; do not disclose whether target records exist. |
| Missing profile | Return safe forbidden/configuration result; do not create profile rows. |
| Inactive/suspended/revoked membership | Return safe forbidden result. |
| Unauthorized organization filter | Return safe forbidden result and no data. |
| Unauthorized clinic filter | Return safe forbidden result and no data. |
| Supabase configuration missing | Return safe configuration error; do not fall back to mock or demo identity. |

## 8. Tenant Isolation Expectations

- Organization and clinic scope must be server-derived from `user_profiles`, `organization_memberships`, `clinic_memberships`, `user_role_assignments`, `organizations`, `clinics`, and existing RLS/RBAC helpers/policies.
- The server boundary may expose only an authorized, minimal identity/scope object to downstream server services.
- Downstream services must not receive raw arbitrary client tenant context.
- RLS/RBAC remains authoritative even after server prechecks.
- Cross-tenant and cross-clinic requests must fail closed and must not disclose record existence.
- Department, payer, doctor, patient, visit, claim, or dashboard filters cannot expand authorized organization/clinic scope.

## 9. Scope / Non-Goals

### Exact Scope

Define the authentication/session infrastructure required before Batch E canonical read integration may begin.

### Non-Goals

This contract does not authorize:

- Doctor Dashboard canonical read implementation;
- Doctor Dashboard mutation implementation;
- login UI redesign;
- database schema changes;
- RLS/RBAC changes;
- RPC signature changes;
- migrations;
- generated type changes;
- package changes unless separately approved;
- broader unrelated auth redesign;
- service-role usage in browser code;
- claim workflow, payer decision, payment, readiness recalculation, reviewer assignment, or manual override behavior.

## 10. Proposed Implementation Allowlist

Future implementation may modify/create only this smallest evidence-based allowlist, after approval:

1. `lib/auth/supabase-server.ts`
2. `lib/auth/server-session-context.ts`
3. `lib/auth/server-session-context.test.ts`
4. `lib/auth/supabase-server.test.ts`
5. `lib/database/env.ts`

Allowlist rationale:

- `lib/auth/supabase-server.ts` is the missing server-only Supabase authenticated boundary helper.
- `lib/auth/server-session-context.ts` separates trusted identity/scope resolution from client components and domain services.
- Tests sit next to the new auth boundary to validate session, identity propagation, tenant scope, and credential exposure rules.
- `lib/database/env.ts` may need a narrow extension for server-auth-safe configuration validation only. It must not introduce service-role exposure.

Do not add Doctor Dashboard, patient-claims, login, package, SQL, migration, generated type, or existing contract files to solve this prerequisite unless a separate approved contract changes scope.

## 11. Prohibited Files

Future implementation must not modify:

- `app/**`
- `features/**`
- `supabase/**`
- `lib/database.types.ts`
- `package.json`
- `package-lock.json`
- lock files
- `.env*`
- `.openai/**`
- `.codex/**`
- `.agents/**`
- existing contracts, ADRs, closure records, and validation reports
- generated types
- tests outside the exact allowlist

During this contract-definition task, only this file may be modified:

- `docs/application/PHASE-5-BATCH-E0-SUPABASE-SERVER-AUTH-BOUNDARY-CONTRACT.md`

## 12. Test Contract

Future implementation must include exact tests for:

| Test Area | Required Assertion |
|---|---|
| Authenticated request | A valid request/session returns authenticated user id and creates a user-context Supabase request boundary. |
| Unauthenticated request | Missing session returns safe unauthenticated result and performs no domain query. |
| Expired/invalid session | Expired or invalid session returns safe unauthenticated/session-expired result and does not disclose records. |
| Identity propagation | Server Supabase request receives authenticated user context, not service-role context and not client-provided user id. |
| Profile resolution | Auth user maps to active `user_profiles` row; missing/inactive profile returns safe forbidden/configuration result. |
| Organization isolation | Requested organization outside trusted memberships is rejected before returning data. |
| Clinic isolation | Requested clinic outside trusted clinic memberships is rejected before returning data. |
| Role/permission derivation | Roles and permissions are derived from trusted assignment rows/RLS-backed reads and are not accepted from client input. |
| Browser credential exposure prevention | Server-only helpers are not importable from client modules; no service-role key or raw token is serialized to client-visible output. |
| Configuration failure | Missing Supabase URL/anon key returns safe configuration error without demo fallback. |

Recommended test pattern:

- Use Vitest, matching existing `features/patient-claims/server/*.test.ts` dependency-injection style.
- Mock `server-only` where needed for isolated tests.
- Use injected cookie/session/client adapters rather than live Supabase network calls.
- Keep tests inside the exact allowlist.

## 13. Required Validation

Future implementation validation must include:

```powershell
npx tsc --noEmit
npm run lint
npm run build
npx vitest lib/auth/server-session-context.test.ts lib/auth/supabase-server.test.ts
git diff --check
```

Notes:

- `package.json` has no `test` script; explicit `npx vitest ...` is the approved validation form unless a separate package-script contract is approved.
- Do not claim database, RLS, or browser-route validation passed unless it is actually run.

## 14. Stop Conditions

Stop and record a blocker if implementation would require:

- database schema change;
- RLS/RBAC change;
- RPC signature change;
- migration;
- generated type change;
- package dependency or lockfile change without separate approval;
- broader unrelated auth redesign;
- service-role or secret-key exposure;
- undocumented client-trusted tenant context;
- changing login UX/workflow beyond the minimum server-auth boundary;
- changing Doctor Dashboard, claim, payment, readiness, or mutation behavior.

## 15. Open Decisions

Open decisions requiring approval before implementation:

1. Approved App Router session mechanism for Supabase server auth.
2. Whether a new dependency such as `@supabase/ssr` is approved, or whether an existing `@supabase/supabase-js` plus explicit cookie/session adapter approach is approved.
3. Exact server helper interface names and result envelope shape.
4. Whether E0 may modify `lib/database/env.ts`, or whether configuration changes must be limited to new `lib/auth/**` files.

## 16. Blocking Decisions

Blocking decisions:

1. Current repository evidence does not establish a trusted authenticated Supabase server session boundary for Next.js App Router.
2. Batch E Doctor Dashboard canonical read integration cannot begin until E0 is approved and implemented.

Non-blocking for E0:

- Doctor Dashboard mutation paths remain outside this contract.
- Database/RLS/RBAC schema changes are not needed and are prohibited.

## 17. Approval Gate

This contract is proposed only.

Implementation may begin only after authorized review approves:

- the exact implementation allowlist;
- the chosen App Router Supabase server-auth mechanism;
- whether any package/dependency change is allowed;
- the server identity-context interface;
- the test plan and validation commands.

Final contract state:

```text
Record State: READY_FOR_REVIEW
Contract Status: PROPOSED
Implementation Status: NOT_STARTED
Implementation Authorization: NO
```

## 18. Historical Recovery and Governance Reconciliation

### 18.1 Recovery Provenance

This file is a reconstructed reconciliation artifact, not the original approved contract artifact.

Recovered source:

```text
Git blob: 30dbfc0c1953d030de3fa51cf73e74f1d256cc90
Recovered content: PHASE 5 - BATCH E0 Authenticated Supabase App Router Server Boundary Contract
```

The original recovered state from the Git blob was:

```text
Record State: READY_FOR_REVIEW
Contract Status: PROPOSED
Implementation Status: NOT_STARTED
Implementation Authorization: NO
```

The original approved contract revision was not recoverable from Git history during this reconciliation. This reconstructed file must not be cited as the original approved artifact, and it does not invent an approval reviewer, approval date, signature, or approving commit hash.

### 18.2 Recovered Historical Proposed State

The recovered Git blob documents a proposed E0 server-auth boundary contract only. Its explicit historical state was:

| Governance Field | Recovered Value |
|---|---|
| Record State | READY_FOR_REVIEW |
| Contract Status | PROPOSED |
| Implementation Status | NOT_STARTED |
| Implementation Authorization | NO |
| Scope Type | Contract-definition only |

The recovered contract stated that implementation could begin only after authorized review approved the implementation allowlist, App Router Supabase server-auth mechanism, dependency decision, identity-context interface, and test plan.

### 18.3 Approval Evidence

Approval evidence is limited to `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.

The closure record states:

| Evidence Field | Closure Record Value |
|---|---|
| Record State | CLOSED |
| Contract Status | APPROVED |
| Contract Precondition Result | PASS |
| Implementation Authorization precondition | YES |
| Blocking Decisions | 0 |

This reconciliation treats E0 contract approval as evidenced by the closure record only. It does not recover or assert the missing approved contract revision itself.

### 18.4 Implementation Evidence

Implementation evidence is limited to `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.

The closure record states:

| Evidence Field | Closure Record Value |
|---|---|
| Implementation Status | COMPLETE |
| Implementation Authorization | COMPLETE |
| Approved implementation allowlist count | 6 |

The closure record identifies these exact files as validated E0 implementation scope:

1. `package.json`
2. `package-lock.json`
3. `lib/auth/supabase-server.ts`
4. `lib/auth/server-session-context.ts`
5. `lib/auth/supabase-server.test.ts`
6. `lib/auth/server-session-context.test.ts`

This reconstructed contract does not reopen E0 implementation and does not authorize additional code, package, SQL, migration, RLS/RBAC, RPC, generated type, route, Doctor Dashboard, Batch E, or snippet changes.

### 18.5 Validation Evidence

Validation evidence is limited to `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.

The closure record states:

| Validation | Closure Record Result |
|---|---|
| Targeted E0 tests: `npx vitest lib/auth/supabase-server.test.ts lib/auth/server-session-context.test.ts` | PASS - 2 test files passed, 11 tests passed |
| TypeScript: `npx tsc --noEmit` | PASS |
| Lint: `npm run lint` | PASS - 0 errors, 16 warnings outside E0 scope |
| Build: `npm run build` | PASS |
| Diff whitespace: `git diff --check` | PASS |

The closure record also states security validation passed for server-derived authenticated identity, trusted organization/clinic/role/permission derivation, RLS/RBAC authority, no privileged credential exposure, and fail-closed unauthenticated/invalid/expired/unauthorized paths.

### 18.6 Closure Evidence

Closure evidence is limited to `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.

The closure record states:

| Closure Field | Closure Record Value |
|---|---|
| Closure Gate Result | PASS |
| Record State | CLOSED |
| Contract Status | APPROVED |
| Implementation Status | COMPLETE |
| Validation Status | PASS |
| Closure Status | CLOSED |
| Blocking Issues | 0 |
| Deployment Authorization | NO |

The closure record also states:

```text
Phase 5 Batch E authenticated-server-boundary prerequisite = SATISFIED.
```

### 18.7 Reconstructed Current Governance State

Based only on the recovered proposed Git blob and the explicit E0 closure record, the reconciled current governance state is:

| Governance Field | Reconciled Current State | Evidence |
|---|---|---|
| Contract Status | APPROVED | E0 closure record |
| Implementation Status | COMPLETE | E0 closure record |
| Validation Status | PASS | E0 closure record |
| Closure Status | CLOSED | E0 closure record |
| Implementation Authorization precondition | YES | E0 closure record |
| E0 prerequisite for Batch E | SATISFIED | E0 closure record |
| Deployment Authorization | NO | E0 closure record |

This reconstructed current governance state may be used to confirm that E0 is closed and that Batch E's E0 prerequisite is satisfied. It must not be used as evidence that the original approved E0 contract revision was recovered.

### 18.8 Reconciliation Restrictions

This reconciliation:

- does not reopen E0 implementation;
- does not modify or authorize Batch E implementation;
- does not modify application code, tests, SQL, migrations, RLS/RBAC, RPCs, generated types, package files, the Batch E contract, the E0 closure record, or `supabase/snippets/**`;
- does not invent approval dates, reviewers, commit hashes, signatures, or approval artifacts not present in repository evidence.

### 18.9 Remaining Evidence Gaps

The following evidence gaps remain unresolved:

1. The original approved E0 contract revision is not recoverable from Git history.
2. No approval reviewer, approval date, signature, or approving commit hash is evidenced by the recovered Git blob or E0 closure record.
3. The reconstructed file preserves the recovered proposed contract and reconciles current governance from closure evidence, but it is not the original approved artifact.
