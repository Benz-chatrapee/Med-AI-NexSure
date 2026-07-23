---
document_id: PHASE-4-INTEGRATION-BATCH-B-CONTRACT-DEFINITION
project: Med AI NexSure
phase: 4
batch_id: B
batch_title: Controlled Workflow Mutation Integration
batch_type: CONTROLLED_MUTATION
record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_authorization: YES
parent_contract: docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md
required_prior_closure: PHASE-4-INTEGRATION-BATCH-A-VALIDATION-CLOSURE
contract_profile: CONTROLLED_MUTATION_V1
approval_date: 2026-07-23
---

# PHASE 4 — INTEGRATION BATCH B CONTRACT DEFINITION

## 1. Document Control

| Field | Value |
|---|---|
| Project | Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform |
| Batch | Integration Batch B |
| Title | Controlled Workflow Mutation Integration |
| Batch Type | `CONTROLLED_MUTATION` |
| Contract Status | `APPROVED` |
| Implementation Authorization | `YES` |
| Parent Contract | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` |
| Required Prior Closure | Phase 4 Integration Batch A Validation Closure |
| Application Owner | `features/patient-claims/server` |
| Execution Boundary | `SERVER_ONLY_AUTHENTICATED_REST_RPC` |
| Database Capability | `public.transition_claim_workflow(...)` |
| Contract Profile | `CONTROLLED_MUTATION_V1` |
| Approval Date | `2026-07-23` |

> This document authorizes only Integration Batch B application implementation. It does not authorize SQL changes, database semantic changes, Batch C or later work, production deployment, or release approval.

---

## 2. Objective

Implement the first protected application command boundary for Phase 4 Claim workflow transitions.

The application must submit an authenticated workflow-transition intent to the existing database-controlled mutation function. The database remains authoritative for:

- current Claim workflow state;
- transition eligibility;
- organization and clinic scope;
- permission checks;
- optimistic concurrency;
- version increments;
- immutable workflow-event creation;
- idempotent replay;
- canonical mutation results.

The application must not duplicate, weaken, or bypass these controls.

---

## 3. Scope

### 3.1 In Scope

- server-only Claim workflow command service;
- authenticated REST RPC invocation;
- exact input/result mapping;
- safe application error normalization;
- optimistic-lock conflict handling;
- idempotent replay handling;
- unit tests for the command boundary;
- preservation of existing canonical Claim reads;
- TypeScript, lint, build, and regression validation.

### 3.2 Out of Scope

- SQL migrations or database functions;
- SQL tests;
- workflow-state additions or transition-matrix changes;
- direct updates to `claims.workflow_status`;
- decision, payment, appeal, or refund command integration;
- client-side privileged secrets;
- unrelated Claim UI redesign;
- Batch C or later integration;
- production deployment.

---

## 4. Repository Evidence Matrix

| Requirement | Classification | Confirmed State | Repository Evidence |
|---|---|---|---|
| Parent integration contract | `CONFIRMED` | Phase 4 application integration contract exists | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` |
| Batch A prior closure | `CONFIRMED` | Batch A application integration was closed before Batch B approval | `docs/application/PHASE-4-INTEGRATION-BATCH-A-VALIDATION.md`; repository commit `473e596` |
| Phase 4 database closure | `CONFIRMED` | Database contract validated and closed | `docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md` |
| Database regression | `CONFIRMED` | 26 files and 663 tests passed | Supabase database test execution dated `2026-07-23` |
| Database lint | `CONFIRMED` | No schema errors found | Supabase database lint execution dated `2026-07-23` |
| Workflow mutation RPC | `CONFIRMED` | Existing controlled mutation function | `supabase/migrations/20260722160000_phase4_claim_workflow_mutation.sql` |
| Workflow mutation tests | `CONFIRMED` | Functional behavior covered | `supabase/tests/phase4_claim_workflow_mutation_test.sql` |
| Workflow security tests | `CONFIRMED` | Grants, protected writes, and security boundary covered | `supabase/tests/phase4_claim_workflow_security_test.sql` |
| Generated RPC types | `CONFIRMED` | `transition_claim_workflow` exists in generated types | `lib/database.types.ts` |
| Existing canonical read owner | `CONFIRMED` | Server-only Claim read integration exists | `features/patient-claims/server/claim-query-service.ts` |
| Existing mapping owner | `CONFIRMED` | Canonical split-state mapping exists | `features/patient-claims/server/claim-mappers.ts` |
| Existing error boundary | `CONFIRMED` | Server-only Claim integration errors exist | `features/patient-claims/server/claim-integration-errors.ts` |
| Server REST pattern | `CONFIRMED` | Authenticated server REST integration pattern exists | `lib/database/supabase-rest.ts`; `lib/database/env.ts` |
| Browser RPC pattern | `CONFIRMED BUT NOT SELECTED` | Browser RPC exists for Core Foundation, but is not the approved Claim mutation boundary | `features/core-foundation/services/core-foundation-service.ts` |
| Exact Batch B owner | `CONFIRMED` | `features/patient-claims/server` | Repository structure and current Claim integration ownership |
| Exact implementation allowlist | `CONFIRMED` | Defined in Section 10 | This contract |
| Mandatory application test | `CONFIRMED` | Command-service unit test | Section 11 |

Evidence priority:

```text
validated database contract
> approved application integration contract
> generated database types
> current server integration patterns
> proposed implementation
```

---

## 5. Capability and Authority Model

### 5.1 Capability

```text
CONTROLLED CLAIM WORKFLOW TRANSITION
```

The application submits an intent. The database decides whether that intent becomes a canonical transition.

| Responsibility | Database | Server Command Boundary | UI/Caller |
|---|---:|---:|---:|
| Canonical current state | Owns | Reads | Displays |
| Transition validity | Owns | Does not duplicate | Requests |
| Tenant and clinic scope | Owns and enforces | Uses authenticated context | Must not fabricate |
| Permission decision | Owns via database permission controls | Does not override | Must not infer authority |
| Expected version | Compares | Supplies canonical version | Must not increment |
| Version increment | Owns | Consumes result | Must not set |
| Workflow event | Inserts atomically | Consumes event ID | Must not insert |
| Replay decision | Owns | Maps canonical result | Must not infer |
| Human confirmation | N/A | Coordinates command | Owns interaction |
| Error presentation | Emits safe signal | Normalizes | Displays safely |

### 5.2 Source of Truth

```text
claims.workflow_status
claims.version
claim_workflow_events
```

The application must not introduce a parallel workflow source of truth.

---

## 6. Exact RPC Contract

### 6.1 Operation Identity

| Field | Confirmed Value |
|---|---|
| Schema/function | `public.transition_claim_workflow` |
| Language | `plpgsql` |
| Security | `SECURITY DEFINER` |
| Fixed search path | `public, private, auth, pg_temp` |
| Execute grants | `authenticated`, `service_role` |
| Execute revoked from | `PUBLIC`, `anon` |
| Application transport | Authenticated Supabase REST RPC |
| REST endpoint | `POST /rest/v1/rpc/transition_claim_workflow` |

### 6.2 Exact Signature

```sql
public.transition_claim_workflow(
  p_claim_id uuid,
  p_target_status public.claim_workflow_state_domain,
  p_expected_version integer,
  p_reason_code text,
  p_reason_text text default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_occurred_at timestamptz default null
)
```

### 6.3 Inputs

| Parameter | Type | Application Rule |
|---|---|---|
| `p_claim_id` | `uuid` | Required; canonical Claim ID |
| `p_target_status` | `claim_workflow_state_domain` | Required; approved target action |
| `p_expected_version` | `integer` | Required; obtained from canonical Claim snapshot |
| `p_reason_code` | `text` | Required function argument; must be normalized and non-empty where required |
| `p_reason_text` | `text` | Optional generally; required for reason-required transitions |
| `p_source_system` | `text` | Use `internal` for authenticated human application action |
| `p_external_event_id` | `text` | Optional for internal action; required for external source |
| `p_correlation_id` | `uuid` | Optional but recommended for observability |
| `p_occurred_at` | `timestamptz` | Optional trusted event timestamp |

The application must not submit organization ID, clinic ID, actor authority, permission result, event sequence, version-after, or current workflow status as authoritative mutation values.

### 6.4 Canonical Result

```sql
returns table (
  claim_id uuid,
  previous_workflow_status public.claim_workflow_state_domain,
  workflow_status public.claim_workflow_state_domain,
  version integer,
  workflow_event_id uuid,
  state_updated_at timestamptz,
  idempotent_replay boolean
)
```

Required application result model:

```ts
export type ClaimWorkflowTransitionResult = {
  claimId: string;
  previousWorkflowStatus: ClaimWorkflowStatus;
  workflowStatus: ClaimWorkflowStatus;
  version: number;
  workflowEventId: string;
  stateUpdatedAt: string;
  idempotentReplay: boolean;
};
```

The service must return the database result as the canonical outcome. It must not synthesize a successful state transition when the RPC response is unavailable or invalid.

---

## 7. Trust and Execution Boundary

### 7.1 Approved Boundary

```text
SERVER_ONLY_AUTHENTICATED_REST_RPC
```

Approved implementation behavior:

1. Execute from `features/patient-claims/server`.
2. Use an authenticated user access token.
3. Use the Supabase URL and anon key through the existing server environment pattern.
4. Send:
   - `apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Authorization: Bearer <authenticated access token>`
   - `Content-Type: application/json`
5. Call only the controlled RPC endpoint.
6. Do not expose service-role credentials to client code.
7. Do not accept organization, clinic, actor, or permission assertions from the UI.

### 7.2 Database Trust Controls

| Control | Confirmed Behavior |
|---|---|
| Actor identity | Derived from `auth.uid()` |
| Claim ownership | Loaded from the locked Claim row |
| Tenant scope | Enforced from Claim organization and clinic |
| Authorization | Enforced by database permission checks |
| Row lock | Claim selected `FOR UPDATE` |
| Soft delete | Deleted Claims excluded |
| State mutation | Performed inside controlled function |
| Event mutation | Performed inside controlled function |
| Direct bypass | Protected direct updates/inserts denied |

### 7.3 Prohibited Boundary

Do not implement Batch B using:

- direct browser table updates;
- service-role keys in browser code;
- direct inserts to `claim_workflow_events`;
- direct updates to workflow/version audit columns;
- UI-generated tenant or permission authority;
- local-only state changes presented as committed success.

---

## 8. Version, Replay, and Atomicity

| Field | Contract |
|---|---|
| Version owner | Database |
| Version field | `claims.version` |
| Expected version | Required as `p_expected_version` |
| Successful mutation | Version increments exactly once |
| Version conflict | SQLSTATE `40001` |
| Replay identity | Organization + source system + external event ID |
| Matching replay | Return existing canonical result with `idempotent_replay = true` |
| Conflicting replay | Reject with SQLSTATE `23505` |
| Atomicity | Claim snapshot update and event insertion occur in one function transaction |

Application retry rules:

- `VERSION_CONFLICT`: reload canonical Claim; do not silently retry with a guessed version.
- Matching replay: accept returned canonical result as success.
- Replay identity conflict: do not treat as success.
- Network/transport failure: retry only through an operation identity that preserves idempotency.
- Unknown result: never display a fabricated successful transition.

---

## 9. Error Contract

### 9.1 Required Error Codes

Extend `ClaimIntegrationErrorCode` to include:

```ts
export type ClaimIntegrationErrorCode =
  | "configuration_error"
  | "invalid_claim_state"
  | "invalid_input"
  | "patient_not_found"
  | "permission_denied"
  | "query_failed"
  | "resource_not_found"
  | "tenant_scope_mismatch"
  | "transport_error"
  | "version_conflict"
  | "idempotency_conflict";
```

Existing codes may remain where required by the read service.

### 9.2 Database-to-Application Mapping

| Database Signal | Application Code | User-Safe Behavior |
|---|---|---|
| `22023` | `invalid_input` | Ask user to correct input |
| `42501` | `permission_denied` | Safe unavailable/access-denied message |
| `23514` | `invalid_claim_state` | Refresh state or correct transition/reason |
| `40001` | `version_conflict` | Reload canonical Claim |
| `23505` | `idempotency_conflict` | Stop automatic success/retry |
| HTTP `404` or empty valid result | `resource_not_found` | Safe not-found message |
| Network/non-2xx transport failure | `transport_error` | Controlled retry guidance |
| Missing environment/token | `configuration_error` | Server configuration message |
| Unmapped failure | `query_failed` | Generic safe failure |

The application must not expose SQL text, RLS internals, permission internals, secrets, access tokens, or PHI.

---

## 10. Exact File Allowlist

### 10.1 Create

```text
features/patient-claims/server/claim-workflow-command-service.ts
features/patient-claims/server/claim-workflow-command-service.test.ts
```

### 10.2 Modify

```text
features/patient-claims/server/claim-integration-errors.ts
```

### 10.3 Reuse Without Modification

```text
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-mappers.ts
lib/database/env.ts
lib/database/supabase-rest.ts
lib/database.types.ts
```

`lib/database.types.ts` already contains `transition_claim_workflow`; regeneration is not required for this batch unless implementation proves the checked-in type is stale. Any required regeneration must stop the batch and trigger contract reconciliation before modification.

### 10.4 Prohibited Files

```text
supabase/migrations/**
supabase/tests/**
docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md
docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md
docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md
unrelated feature modules
Batch C+ files
```

No file outside the exact allowlist may be modified without stopping implementation and reconciling this contract.

---

## 11. Implementation Contract

### 11.1 Command Service

Create a server-only module:

```ts
import "server-only";
```

Required service responsibilities:

- validate required input;
- obtain authenticated server Claim context;
- construct the exact RPC payload;
- call `POST /rest/v1/rpc/transition_claim_workflow`;
- map the one-row canonical result;
- normalize database and transport errors;
- preserve `idempotentReplay`;
- never update Claim tables directly;
- support dependency injection for unit testing.

Recommended public input:

```ts
export type TransitionClaimWorkflowInput = {
  claimId: string;
  targetStatus: ClaimWorkflowStatus;
  expectedVersion: number;
  reasonCode: string;
  reasonText?: string;
  correlationId?: string;
  occurredAt?: string;
};
```

Recommended service API:

```ts
export interface ClaimWorkflowCommandGateway {
  transition(
    input: TransitionClaimWorkflowInput,
    accessToken: string,
  ): Promise<ClaimWorkflowTransitionResult>;
}

export function createClaimWorkflowCommandService(
  options?: CreateClaimWorkflowCommandServiceOptions,
): {
  transitionClaimWorkflow(
    input: TransitionClaimWorkflowInput,
  ): Promise<ClaimWorkflowTransitionResult>;
}
```

Exact internal names may follow current repository conventions, but exported behavior and file scope must remain equivalent.

### 11.2 RPC Payload

For internal authenticated human action:

```json
{
  "p_claim_id": "<claim uuid>",
  "p_target_status": "<approved workflow status>",
  "p_expected_version": 1,
  "p_reason_code": "<reason code>",
  "p_reason_text": "<optional reason text>",
  "p_source_system": "internal",
  "p_external_event_id": null,
  "p_correlation_id": null,
  "p_occurred_at": null
}
```

The implementation must use actual typed values and must not include placeholder strings.

### 11.3 Context

The command service must use an authenticated server context equivalent to the existing Claim read context pattern:

```text
organizationId
clinicId
actorId
accessToken
```

Only `accessToken` is sent as transport authentication. Organization, clinic, and actor fields may be used for application consistency checks but must not be presented to the RPC as authoritative permission inputs.

---

## 12. Mandatory Test Traceability

Create:

```text
features/patient-claims/server/claim-workflow-command-service.test.ts
```

The test must mock `server-only` and inject the gateway/context.

| ID | Required Test | Expected Result |
|---|---|---|
| `B-T01` | Valid transition payload | Exact RPC arguments are sent |
| `B-T02` | Canonical result mapping | Snake-case RPC row maps to application result |
| `B-T03` | Expected version preservation | Version is sent unchanged; service does not increment |
| `B-T04` | Internal source enforcement | `p_source_system = internal` |
| `B-T05` | Missing Claim ID | `invalid_input` |
| `B-T06` | Missing reason code | `invalid_input` |
| `B-T07` | SQLSTATE `42501` | `permission_denied` |
| `B-T08` | SQLSTATE `23514` | `invalid_claim_state` |
| `B-T09` | SQLSTATE `40001` | `version_conflict` |
| `B-T10` | SQLSTATE `23505` | `idempotency_conflict` |
| `B-T11` | Transport failure | `transport_error` or approved generic integration error |
| `B-T12` | Matching replay result | Returns `idempotentReplay = true` |
| `B-T13` | Empty/invalid RPC result | Must not report success |
| `B-T14` | Existing read-service regression | Existing Claim query tests remain passing |
| `B-T15` | Server-only boundary | Module remains server-only and test mock is configured |

No database test modification is authorized.

---

## 13. Acceptance Criteria

```text
B-CTR-01 Exact RPC signature, grants, inputs, outputs, and authority are documented. PASS.
B-DEP-01 Batch A prior closure is confirmed. PASS.
B-TYPE-01 Generated RPC type exists. PASS.
B-OWN-01 Application owner is features/patient-claims/server. PASS.
B-BND-01 Execution boundary is SERVER_ONLY_AUTHENTICATED_REST_RPC. PASS.
B-SCOPE-01 Exact implementation allowlist is defined. PASS.
B-MUT-01 Application workflow transitions use only public.transition_claim_workflow. REQUIRED.
B-AUTH-01 Database remains authoritative for authorization and transition rules. REQUIRED.
B-CTX-01 UI cannot assert tenant, clinic, actor, or permission authority. REQUIRED.
B-CON-01 Canonical expected version is supplied unchanged. REQUIRED.
B-ATM-01 Application relies on database atomic state/event mutation. REQUIRED.
B-ERR-01 Errors are normalized without exposing internals. REQUIRED.
B-AUD-01 Canonical workflow event ID is preserved. REQUIRED.
B-HUM-01 Authoritative transition requires approved human action. REQUIRED.
B-AI-01 AI cannot independently invoke or authorize mutation. REQUIRED.
B-REF-01 Caller refreshes canonical Claim/timeline state after success. REQUIRED AT CALL-SITE INTEGRATION.
B-TEST-01 Mandatory command-service tests pass. REQUIRED.
B-REG-01 Existing Claim read integration tests remain passing. REQUIRED.
B-DB-01 Database schema, functions, grants, and SQL tests remain unchanged. REQUIRED.
```

---

## 14. Validation Commands

Run from repository root:

```powershell
git diff --check
git status --short
npx tsc --noEmit
npm run lint
npm run build
```

Run the exact application tests using the repository test runner, including:

```powershell
npx vitest run features/patient-claims/server/claim-workflow-command-service.test.ts
npx vitest run features/patient-claims/server/claim-query-service.test.ts
npx vitest run features/patient-claims/server/claim-mappers.test.ts
```

If the repository uses an equivalent test command, use the established package script and record the exact command and result.

Database regression is not required to be changed by this application-only batch. If implementation unexpectedly requires database modification, stop and invalidate the authorization.

Final repository checks:

```powershell
git diff --check
git status --short
git diff --stat
```

Stage only exact approved files:

```powershell
git add .\features\patient-claims\server\claim-workflow-command-service.ts
git add .\features\patient-claims\server\claim-workflow-command-service.test.ts
git add .\features\patient-claims\server\claim-integration-errors.ts
```

Do not use `git add .`.

---

## 15. Stop Conditions

Stop implementation and return to contract reconciliation if:

- an SQL migration or SQL test must change;
- `lib/database.types.ts` must be regenerated or modified;
- another feature module must be modified;
- a client-side privileged key is required;
- the authenticated server context cannot be obtained safely;
- the RPC signature differs from this contract;
- error behavior differs materially from the documented SQLSTATE mapping;
- a new workflow state or transition rule is required;
- direct Claim workflow table writes appear necessary;
- Batch C or later scope is required;
- a P0 security, PHI, tenant-isolation, or audit issue is found.

---

## 16. Human-in-the-Loop and AI Governance

- The mutation represents an authoritative operational Claim action.
- The user must explicitly confirm the action at the application interaction layer.
- AI may summarize, explain, or recommend a transition.
- AI must not autonomously invoke the transition.
- AI must not impersonate a Claim reviewer or authorized actor.
- AI must not supply fabricated reason codes, versions, tenant scope, or permissions.
- High-risk or ambiguous transitions must remain subject to human review.
- The canonical database result and workflow event are the audit evidence.

---

## 17. Approval Decision

| Area | Status |
|---|---|
| Phase 4 database readiness | `CONFIRMED` |
| Batch A prior closure | `CONFIRMED` |
| Exact RPC and signature | `CONFIRMED` |
| Database trust boundary | `CONFIRMED` |
| Generated RPC types | `CONFIRMED` |
| Version ownership | `CONFIRMED` |
| Replay behavior | `CONFIRMED` |
| Application owner | `CONFIRMED` |
| Server execution boundary | `CONFIRMED` |
| Exact file allowlist | `CONFIRMED` |
| Mandatory test target | `CONFIRMED` |
| Blocking decisions | `0` |
| P0 findings | `0` |
| Contract Status | `APPROVED` |
| Implementation Authorization | `YES` |

Approval is limited to the exact scope and file allowlist in this document.

---

## 18. Invalidation and Future Reuse

Reconciliation is required when changes affect:

- RPC name, signature, grants, or result;
- generated database types;
- workflow semantics;
- tenant, actor, or permission authority;
- version or replay behavior;
- authenticated server context;
- execution transport;
- application owner;
- file allowlist;
- test scope;
- Batch A closure;
- acceptance criteria.

Reusable contract profile:

```text
CONTROLLED_MUTATION_V1
```

---

## 19. Final Contract Summary

```text
Integration Batch: B
Batch Title: Controlled Workflow Mutation Integration
Batch Type: CONTROLLED_MUTATION
Contract Status: APPROVED
Implementation Authorization: YES
Required Prior Closure: Batch A Validation Closure — CONFIRMED
Exact RPC/Function: public.transition_claim_workflow — CONFIRMED
Execution Boundary: SERVER_ONLY_AUTHENTICATED_REST_RPC
Application Owner: features/patient-claims/server
Version Owner: DATABASE (claims.version)
Replay Behavior: IDEMPOTENT MATCH / CONFLICT REJECT
Create Files:
- features/patient-claims/server/claim-workflow-command-service.ts
- features/patient-claims/server/claim-workflow-command-service.test.ts
Modify Files:
- features/patient-claims/server/claim-integration-errors.ts
Database Changes: NOT AUTHORIZED
Blocking Open Decisions: 0
P0 Findings: 0
Implementation Ready: YES
Recommended Next Task: PHASE 4 — INTEGRATION BATCH B IMPLEMENTATION
```

Final status:

```text
APPROVED — Integration Batch B application implementation may proceed only within the exact server-only controlled-mutation contract and file allowlist defined above.
```
