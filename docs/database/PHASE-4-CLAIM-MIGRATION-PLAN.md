---
document_id: PHASE-4-INTEGRATION-BATCH-B-CONTRACT-DEFINITION
project: Med AI NexSure
phase: 4
batch_id: B
batch_title: Controlled Workflow Mutation Integration
batch_type: CONTROLLED_MUTATION
record_state: DRAFT
contract_status: PROPOSED
implementation_authorization: NO
parent_contract: docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md
required_prior_closure: PHASE-4-INTEGRATION-BATCH-A-VALIDATION-CLOSURE
contract_profile: CONTROLLED_MUTATION_V1
---

# PHASE 4 — INTEGRATION BATCH B CONTRACT DEFINITION

## 1. Document Control

| Field | Value |
|---|---|
| Project | Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform |
| Batch | Integration Batch B |
| Title | Controlled Workflow Mutation Integration |
| Contract Status | `PROPOSED` |
| Implementation Authorization | `NO` |
| Parent Contract | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` |
| Required Prior Closure | Batch A Validation Closure |
| Application Target | `NOT VERIFIED` |
| Phase 4 Database Target | `NOT VERIFIED` |

> This document defines the application contract for Batch B only. It does not implement code, modify database semantics, authorize later batches, or approve deployment.

---

## 2. Purpose, Scope, and Non-Goals

### Purpose

Define the exact application boundary for an approved claim workflow transition while preserving:

- database-authoritative workflow state;
- organization and clinic isolation;
- trusted actor context;
- optimistic concurrency;
- atomic workflow event evidence;
- safe error handling;
- canonical post-mutation refresh;
- human confirmation;
- AI decision-support-only governance.

### In Scope

- exact workflow mutation RPC/function;
- mutation arguments and trusted execution context;
- caller and trust boundary;
- version conflict handling;
- canonical result handling;
- error normalization;
- immutable event behavior;
- application ownership;
- exact file scope;
- required tests;
- acceptance criteria;
- approval readiness.

### Out of Scope

- decision, payment, appeal, or refund mutations;
- new workflow states or transition rules;
- new database RPCs without separate approval;
- migrations or SQL-test changes;
- Phase 5;
- deployment or release approval.

---

## 3. Dependencies and Evidence Baseline

| Requirement | Required State | Actual State | Evidence |
|---|---|---|---|
| Phase 4 database contract | Approved and validated | `NOT VERIFIED` | |
| Parent integration contract | Approved | `NOT VERIFIED` | |
| Batch A closure | `PASS / COMPLETE` | `NOT VERIFIED` | |
| Workflow mutation capability | Available | `NOT VERIFIED` | |
| Generated database types | Current | `NOT VERIFIED` | |
| Blocking decisions | `0` | `NOT VERIFIED` | |
| P0 findings | `0` | `NOT VERIFIED` | |

Primary evidence:

- `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md`
- Batch A validation closure record
- `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md`
- `docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md`
- `lib/database.types.ts`

Evidence priority:

```text
approved database contract
> active application contract
> generated database signature
> current repository evidence
> proposed design
```

Do not invent RPCs, arguments, return fields, error codes, roles, transitions, or paths.

---

## 4. Capability and Authority Model

### Capability

```text
CONTROLLED CLAIM WORKFLOW TRANSITION
```

The client submits a **transition intent**. The database decides whether that intent becomes a canonical transition.

### Authority Matrix

| Responsibility | Database | Trusted Application Boundary | Client/UI |
|---|---:|---:|---:|
| Current canonical state | Owns | Reads | Displays |
| Transition validity | Owns | Invokes | Requests |
| Tenant and clinic authorization | Owns/enforces | Derives trusted context | Must not assert authority |
| Actor authorization | Owns/enforces | Supplies authenticated context | Must not impersonate |
| Version comparison | Owns | Supplies expected version | Must not fabricate |
| State update | Owns atomically | Invokes | Must not update directly |
| Workflow event insertion | Owns atomically | Refreshes timeline | Must not insert manually |
| Confirmation | N/A | Coordinates | Owns user interaction |
| Error presentation | Emits signal | Normalizes | Displays safely |

Application code must never directly update protected workflow-state fields.

---

## 5. Exact Mutation Interface

### Operation Identity

| Field | Value |
|---|---|
| Operation | Controlled workflow transition |
| Exact RPC/Function | `NOT VERIFIED` |
| Schema | `NOT VERIFIED` |
| Generated Signature | `NOT VERIFIED` |
| Availability | `NOT VERIFIED` |
| Direct protected update | `PROHIBITED` |

### Mutation Arguments

Use only confirmed generated/database arguments.

| Parameter | Type | Required | Source | Status |
|---|---|---|---|---|
| Claim identifier | `NOT VERIFIED` | `NOT VERIFIED` | Canonical claim read state | `NOT VERIFIED` |
| Target workflow state | `NOT VERIFIED` | `NOT VERIFIED` | Approved user action | `NOT VERIFIED` |
| Expected version | `NOT VERIFIED` | `NOT VERIFIED` | Canonical current state | `NOT VERIFIED` |
| Reason or note | `NOT VERIFIED` | `NOT VERIFIED` | Human input where supported | `NOT VERIFIED` |
| Other confirmed arguments | `NOT VERIFIED` | `NOT VERIFIED` | Approved contract only | `NOT VERIFIED` |

Do not add arguments not present in the approved database contract.

### Trusted Execution Context

These values may be derived from authenticated or server/database context and are not automatically RPC arguments:

| Context | Trusted Source | Status |
|---|---|---|
| Authenticated actor | Auth/session context | `NOT VERIFIED` |
| Organization | Trusted membership/context | `NOT VERIFIED` |
| Clinic | Trusted membership/context | `NOT VERIFIED` |
| Role/permission | Database/RBAC contract | `NOT VERIFIED` |
| Correlation identifier | Approved application boundary | `NOT VERIFIED` |

Browser-supplied tenant, clinic, actor, role, current state, audit fields, or permissions are never authoritative.

### Canonical Result

| Result Category | Requirement | Status |
|---|---|---|
| Canonical workflow state | Required | `NOT VERIFIED` |
| Updated version | Required when versioned | `NOT VERIFIED` |
| Operation receipt/status | Contract-dependent | `NOT VERIFIED` |
| Event reference | Contract-dependent | `NOT VERIFIED` |
| Canonical snapshot | Contract-dependent | `NOT VERIFIED` |

The application must consume the canonical database result. Speculative UI state must not replace it.

---

## 6. Trust Boundary and Security

| Field | Value |
|---|---|
| Trust Boundary | `NOT VERIFIED` |
| Execution Environment | `NOT VERIFIED` |
| Supabase Client Type | `NOT VERIFIED` |
| Authentication Source | `NOT VERIFIED` |
| Tenant Context Provider | `NOT VERIFIED` |
| Clinic Context Provider | `NOT VERIFIED` |
| Actor Context Provider | `NOT VERIFIED` |

Allowed boundary classifications:

```text
AUTHENTICATED CLIENT ALLOWED
SERVER BOUNDARY REQUIRED
EXISTING TRUSTED SERVICE
NOT VERIFIED
```

Boundary evidence must come from:

- RPC grants and security behavior;
- authenticated context usage;
- RLS/RBAC contract;
- current client/server execution model;
- absence of privileged secrets in client code.

Do not add a server wrapper without evidence. Do not allow browser execution when trusted server derivation is required.

---

## 7. Concurrency, Replay, and Atomicity

| Field | Value |
|---|---|
| Version owner | `NOT VERIFIED` |
| Version field | `NOT VERIFIED` |
| Expected version required | `NOT VERIFIED` |
| Conflict signal | `NOT VERIFIED` |
| Replay behavior | `NOT VERIFIED` |
| Retry policy | `NOT VERIFIED` |

Allowed replay values:

```text
REJECTED
IDEMPOTENT
NOT SUPPORTED
NOT VERIFIED
```

Rules:

- stale versions must not silently overwrite canonical state;
- the application must refresh canonical state before retry;
- the application must not fabricate or increment versions;
- state update and workflow event insertion must succeed or fail atomically;
- compensating direct writes are prohibited.

---

## 8. Result, Error, and Observability Contract

### Core Error Categories

| Category | Retry | User Surface |
|---|---|---|
| `UNAUTHENTICATED` | After authentication | Safe authentication message |
| `UNAUTHORIZED` | No | Safe access-denied message |
| `TENANT_SCOPE_DENIED` | No | Safe unavailable/access-denied message |
| `RESOURCE_NOT_FOUND` | No | Safe not-found message |
| `INVALID_INPUT` | After correction | Validation message |
| `INVALID_STATE` | After refresh/action change | Safe lifecycle message |
| `VERSION_CONFLICT` | After canonical refresh | Conflict/reload message |
| `TRANSPORT_ERROR` | Controlled retry | Temporary service message |
| `UNKNOWN_CONTRACT_ERROR` | No automatic success | Generic safe failure |

Contract-dependent categories:

```text
DUPLICATE_OR_REPLAY
DEPENDENCY_CONFLICT
```

### Signal Mapping

| Database Signal | Application Category | Evidence |
|---|---|---|
| `NOT VERIFIED` | `NOT VERIFIED` | |

Never expose raw SQL, secrets, security internals, or PHI.

Recommended non-PHI observability fields:

```text
correlation_id
operation
safe claim reference
safe actor reference
error category
application target
```

---

## 9. Audit, Human Confirmation, and Consistency

### Audit/Event Rules

| Requirement | Contract |
|---|---|
| Event insertion owner | Database |
| Atomic with state update | Required |
| Event immutability | Required |
| Actor source | Trusted context |
| Tenant ownership | Database-enforced |
| Previous/new state | Record where supported |
| Reason | Record only when approved |
| Client manual event insertion | Prohibited |

### Human and AI Governance

Authoritative workflow mutation requires explicit approved human action.

AI may explain or recommend but must not:

- invoke or authorize the mutation independently;
- impersonate an actor;
- assert tenant or clinic authority;
- bypass confirmation;
- suppress audit evidence.

### Post-Mutation Consistency

A successful UI operation is complete only after required canonical reads are reconciled:

- claim canonical state;
- workflow timeline/history;
- affected list or queue;
- affected readiness summary;
- available action presentation.

Exact cache keys remain implementation details unless already defined by repository convention.

---

## 10. Application Ownership and File Scope

### Ownership Matrix

| Responsibility | Owner Role | Existing Owner | Proposed Owner | Status |
|---|---|---|---|---|
| Workflow command model | Canonical owner | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Mutation execution | Execution owner | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Server boundary, if required | Execution owner | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| UI/form action | Caller | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Error normalization | Canonical owner | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Claim refresh | Consumer | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Timeline refresh | Consumer | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |
| Tests | Test owner | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` |

Owner roles:

```text
CANONICAL OWNER
EXECUTION OWNER
CALLER
CONSUMER
TEST OWNER
```

One responsibility may have multiple callers or consumers but only one canonical owner.

### Required Implementation Files

| Exact Path | Role | Responsibility | Status |
|---|---|---|---|
| `NOT VERIFIED` | `NOT VERIFIED` | | `NOT VERIFIED` |

### Conditional Files

Include only when evidence requires them, such as a server action or route handler.

| Exact Path | Condition | Responsibility | Status |
|---|---|---|---|
| `NOT VERIFIED` | | | `NOT VERIFIED` |

### Required Test Files

| Exact Path | Test Responsibility | Status |
|---|---|---|
| `NOT VERIFIED` | | `NOT VERIFIED` |

### Prohibited Files

```text
database migrations
SQL tests
Phase 4 database contract files
unrelated application modules
Batch C+ files
```

The implementation allowlist must be exact before approval.

---

## 11. Test Traceability

Validation profile:

```text
CONTROLLED_MUTATION_V1
```

| Acceptance Area | Required Test |
|---|---|
| Controlled mutation only | Service/repository mutation test |
| Invalid transition | Invalid-state test |
| Version conflict | Concurrency test |
| Unauthorized actor | Authorization test |
| Tenant/clinic isolation | Cross-tenant test |
| Canonical response | Result-mapping test |
| Timeline consistency | Event/timeline refresh test |
| Error safety | Error normalization test |
| Batch A regression | Read integration regression test |
| Type safety | TypeScript typecheck |
| Build integrity | Build where required |

Planned or skipped tests must not be reported as PASS.

---

## 12. Acceptance Criteria

```text
B-CTR-01
The exact approved workflow mutation RPC/function and generated signature are recorded.

B-MUT-01
All workflow state changes use only the approved controlled mutation.

B-AUTH-01
The database remains authoritative for transition validity, authorization, and canonical state.

B-CTX-01
Tenant, clinic, actor, and permission context come from trusted sources.

B-CON-01
The approved expected-version contract is used and stale state cannot silently overwrite data.

B-ATM-01
Workflow state update and event insertion succeed or fail atomically.

B-ERR-01
Errors are normalized safely without exposing SQL, PHI, secrets, or security internals.

B-AUD-01
Successful mutation preserves immutable workflow event evidence.

B-HUM-01
Authoritative workflow mutation requires explicit approved human action.

B-AI-01
AI cannot independently invoke, authorize, or bypass workflow mutation controls.

B-REF-01
Successful mutation reconciles canonical claim state and required timeline evidence.

B-SCOPE-01
Every implementation and test file is listed in the exact Batch B allowlist.

B-TEST-01
All mandatory Batch B tests pass.

B-REG-01
Batch A read integration remains valid.

B-DB-01
Phase 4 database semantics remain unchanged.
```

---

## 13. Open Decisions and Stop Conditions

### Open Decisions

| ID | Type | Decision | Blocking | Evidence | Required Resolution |
|---|---|---|---|---|---|
| `NOT VERIFIED` | `NOT VERIFIED` | | `YES` | | |

Decision types:

```text
CONTRACT
ARCHITECTURE
SECURITY
FILE OWNERSHIP
TEST SCOPE
BUSINESS
```

### Stop Conditions

Stop when:

- exact RPC/signature is unresolved;
- version ownership is unclear;
- trust boundary is contradictory;
- tenant, clinic, or actor authority is unresolved;
- new workflow semantics are required;
- database changes are required;
- unauthorized files are required;
- Batch A closure is missing or stale;
- P0 security/PHI risk exists;
- Batch C+ scope is required;
- mandatory tests cannot be identified.

Do not resolve these by assumption.

---

## 14. Approval Readiness

| Area | Status |
|---|---|
| Dependencies | `NOT VERIFIED` |
| Exact RPC/signature | `NOT VERIFIED` |
| Trust boundary | `NOT VERIFIED` |
| Version contract | `NOT VERIFIED` |
| Replay behavior | `NOT VERIFIED` |
| Canonical result | `NOT VERIFIED` |
| Error mapping | `NOT VERIFIED` |
| Audit/atomicity | `NOT VERIFIED` |
| Ownership | `NOT VERIFIED` |
| Exact file allowlist | `INCOMPLETE` |
| Test traceability | `INCOMPLETE` |
| Blocking decisions | `NOT VERIFIED` |
| Implementation authorization | `NO` |

Approval requires:

```text
all readiness areas complete
blocking decisions = 0
P0 findings = 0
exact allowlist complete
mandatory test scope complete
```

This contract does not approve itself.

---

## 15. Invalidation and Future Reuse

Reconciliation is required when changes affect:

- RPC signature or grants;
- generated database types;
- workflow transition semantics;
- trust boundary;
- version or replay behavior;
- tenant/clinic/actor authority;
- canonical result or error signals;
- ownership or file scope;
- mandatory tests;
- acceptance criteria;
- Batch A closure.

Reusable profile:

```text
CONTROLLED_MUTATION_V1
```

Future batches may reuse this structure by replacing only domain-specific capability, authority, error, file, test, and acceptance details.

Do not copy workflow-specific rules into decision, financial, appeal, or refund batches without evidence.

---

## 16. Final Contract Summary

```text
Integration Batch: B
Batch Title: Controlled Workflow Mutation Integration
Batch Type: CONTROLLED_MUTATION
Contract Status: PROPOSED
Implementation Authorization: NO
Required Prior Closure: Batch A Validation Closure
Exact RPC/Function: NOT VERIFIED
Trust Boundary: NOT VERIFIED
Version Owner: NOT VERIFIED
Replay Behavior: NOT VERIFIED
Application Owner: NOT VERIFIED
Exact File Allowlist: INCOMPLETE
Mandatory Test Scope: INCOMPLETE
Blocking Open Decisions: NOT VERIFIED
Implementation Ready: NO
Recommended Next Task: PHASE 4 — INTEGRATION BATCH B CONTRACT EVIDENCE COMPLETION
```

Final status:

```text
PROPOSED — Batch B requires repository evidence and separate approval before implementation.
```
