---
document_id: PHASE-5-BATCH-A-PATIENT-CLAIMS-CONTRACT
project: Med AI NexSure
phase: 5
batch: A
contract_type: APPLICATION_INTEGRATION
record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_status: NOT_STARTED
implementation_authorization: YES
created_date: 2026-07-24
approval_date: 2026-07-24
branch: main
parent_contract: docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
application_changes_authorized: YES
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
blocking_decisions: 0
---

# Phase 5 — Batch A Patient Claims Canonical Cutover Contract

## 1. Contract Decision

```text
Record State: APPROVED CONTRACT
Contract Status: APPROVED
Implementation Status: NOT STARTED
Implementation Authorization: YES

Application Changes: AUTHORIZED — APPROVED BATCH A ALLOWLIST ONLY
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Regeneration: NOT AUTHORIZED
Manual Generated-Type Editing: NOT AUTHORIZED
```

This document defines the evidence-based implementation boundary for Phase 5 Batch A only.

Batch A implementation is authorized only within the exact allowlist, decisions, tests, security boundaries, and stop conditions defined in this approved contract. This approval does not authorize deployment, database changes, generated-type changes, or work outside Batch A.

## 2. Objective

Cut over the Patient Claims application from authoritative use of the mixed compatibility field `claimStatus` to independent canonical dimensions:

```text
workflowStatus  → Claim lifecycle
decisionStatus  → adjudication outcome
paymentStatus   → financial settlement
readiness       → evidence and submission preparedness
```

Batch A must prevent workflow, decision, payment, and readiness semantics from being combined into one authoritative status.

## 3. Parent Authority and Preconditions

Parent authority:

```text
docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
```

Required preconditions before implementation:

```text
Phase 5 Master Contract: APPROVED
Phase 5 Batch A Contract: APPROVED
Batch A Implementation Authorization: YES
Exact File Allowlist: CONFIRMED
Required Tests: APPROVED
Working Tree: CLEAN
```

Phase 4 database contracts, migrations, RPC behavior, permissions, transition rules, and generated database types remain authoritative and immutable in this Batch.

## 4. Repository Evidence Reviewed

### Confirmed Existing Files

```text
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/server/claim-workflow-command-service.ts
features/patient-claims/server/claim-workflow-command-service.test.ts
features/patient-claims/server/claim-integration-errors.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
features/patient-claims/components/patient-claims-workspace.tsx
features/patient-claims/data/patient-claims.mock.ts
features/patient-claims/services/patient-claims-service.ts
lib/database.types.ts
package.json
```

### Confirmed Findings

1. `PatientClaim` still exposes `claimStatus` as a compatibility field.
2. `CanonicalPatientClaim` already exposes `workflowStatus`, `decisionStatus`, `paymentStatus`, versioning, tenant identifiers, financial fields, and canonical-support flags.
3. `claim-mappers.ts` validates raw workflow, decision, and payment values and maps unsupported values to `unknown`.
4. `claim-mappers.ts` derives `claimStatus` through `mapLegacyClaimStatus(...)`.
5. `claim-mappers.ts` derives `readinessScore` from workflow state, which mixes readiness and lifecycle semantics.
6. `summarizeClaims(...)` already counts approved and submitted claims from canonical dimensions, but still counts pending and not-ready claims from `claimStatus`.
7. `patient-claims-utils.ts` filters by the mixed `claimStatus` field.
8. `patient-claims-workspace.tsx` still renders a legacy status badge while also rendering canonical workflow, decision, and payment badges.
9. Mock data and tests still depend on `claimStatus`.
10. The controlled workflow command service is server-only and must remain unchanged unless a separately approved evidence finding requires a non-behavioral type adaptation.
11. `package.json` defines `dev`, `build`, `start`, and `lint` scripts. It does not define an `npm test` script.
12. Vitest is available and repository tests must be invoked with explicit Vitest commands.

## 5. Scope

### In Scope

Batch A may define and, after approval, implement:

* Canonical Patient Claims DTO usage
* Independent workflow, decision, payment, and readiness presentation
* Independent filter models and filter behavior
* KPI calculations based on the correct canonical dimension
* Safe handling of unsupported canonical state values
* Temporary compatibility isolation where explicitly approved
* Patient Claims mock and test alignment

### Out of Scope

Batch A must not:

* Change database schema, enums, migrations, functions, RPC signatures, permissions, RLS, or grants
* Regenerate or manually edit `lib/database.types.ts`
* Change Phase 4 transition or authorization behavior
* Add client-side authoritative writes
* Change actor identity or tenant-verification behavior
* Redesign unrelated dashboards or Claim modules
* Reconcile readiness naming outside Patient Claims
* Reconcile Payer Rules mixed-status models
* Remove legacy database column `claims.status`
* Start deployment or production release

## 6. Canonical Domain Contract

### 6.1 Authoritative Dimensions

```text
workflowStatus  = Database["public"]["Enums"]["claim_workflow_state"] | "unknown"
decisionStatus  = Database["public"]["Enums"]["claim_decision_state"] | "unknown"
paymentStatus   = Database["public"]["Enums"]["claim_payment_state"] | "unknown"
```

Generated Supabase types remain the source of truth.

Application code must not duplicate canonical database enum unions manually.

### 6.2 Readiness

Readiness must be represented separately from lifecycle state.

The current workflow-derived `readinessScore` is not accepted as an authoritative readiness calculation.

**Approved decision — BA-DEC-03**

1. Use verified Claim Readiness assessment data as the authoritative readiness source whenever it is available through the existing approved read boundary.
2. Until that source is available to the Patient Claims read model, retain readiness only as explicitly named presentation fallback data.
3. The fallback must be non-authoritative, must not control writes, permissions, decisions, payments, submission eligibility, or financial behavior, and must be covered by tests.
4. The fallback must be reviewed for removal when the verified readiness assessment is integrated into Patient Claims.

It must not imply that `submitted`, `payer_processing`, `decision_received`, `appealed`, or `closed` automatically means evidence readiness is 100%.

### 6.3 Unsupported Values

For read-only presentation:

```text
unsupported canonical value → unknown / unavailable
```

For authoritative actions:

```text
unsupported canonical value → action disabled / fail closed
```

Unknown decision or payment values must never be defaulted to an apparently valid business state.

## 7. Compatibility Contract

A temporary compatibility adapter may be retained only under these rules:

```text
Name: legacyClaimPresentationStatus
Purpose: display or temporary URL/filter translation only
Authoritative writes: prohibited
Permission decisions: prohibited
Financial calculations: prohibited
Claim decisions: prohibited
KPI authority: prohibited
```

The existing generic name `claimStatus` must not remain authoritative.

**Approved decision — BA-DEC-01: Isolate**

The temporary compatibility value must be renamed and isolated as:

```text
legacyClaimPresentationStatus
```

Governance record:

| Field | Approved value |
| --- | --- |
| Owner | Product Owner / Application Architect |
| Purpose | Temporary display and legacy URL/filter translation only |
| Affected consumers | Patient Claims DTO mapping, filters, mock fixtures, tests, and legacy badge presentation |
| Authoritative writes | Prohibited |
| Permission or security decisions | Prohibited |
| KPI authority | Prohibited |
| Claim or payer decisions | Prohibited |
| Payment or financial behavior | Prohibited |
| Required tests | One-way mapping, legacy URL translation, unsupported values, no KPI/write authority |
| Review condition | Review after all Patient Claims consumers use canonical dimensions |
| Removal target | Remove by Batch A completion when feasible; otherwise record an explicit follow-up cleanup item before Phase 5 closure |

No compatibility value may be persisted back to the database or used to infer workflow, decision, payment, or readiness authority.

## 8. Filter Contract

Patient Claims filters must become dimension-specific.

Required filter model:

```text
workflowStatus
decisionStatus
paymentStatus
readinessStatus
payer
risk
date range
query
```

Rules:

* `approved` must filter decision state only.
* `paid` must filter payment state only.
* `submitted` must filter workflow state only.
* `ready`, `needs_review`, and `not_ready` must filter readiness only.
* No combined filter may silently infer one dimension from another.
* Existing URL compatibility may be translated only through an explicitly tested adapter.

## 9. KPI Contract

Required KPI semantics:

| KPI | Authoritative source |
| --- | --- |
| Total Claims | Claim count |
| Approved Claims | `decisionStatus in (approved, partially_approved)` with labels distinguishing partial approval where shown |
| Submitted Claims | `workflowStatus in (submitted, payer_processing, decision_received, appealed, closed)`; this KPI represents claims that have entered or completed payer submission flow and does not imply readiness, approval, or payment |
| Pending Claims | `workflowStatus in (draft, collecting_data, validation_pending, needs_review, ready_to_submit, submitted, payer_processing, decision_received, appealed)`; excludes `closed` and `cancelled` |
| Not Ready Claims | Readiness status only |
| Total Claimed Amount | Claim financial field |
| Total Approved Amount | Approved amount field; must not imply payment |
| Paid Amount | Payment/settlement field only, when displayed |

The following must remain independently representable:

```text
approved but unpaid
partially approved and partially paid
closed but unpaid
rejected and unpaid
submitted but not readiness-complete
```

**Approved decision — BA-DEC-02**

`pendingClaims` is a workflow-only operational KPI. It must not be calculated from `decisionStatus`, `paymentStatus`, `legacyClaimPresentationStatus`, or readiness.

Approved pending workflow set:

```text
draft
collecting_data
validation_pending
needs_review
ready_to_submit
submitted
payer_processing
decision_received
appealed
```

Excluded workflow states:

```text
closed
cancelled
```

## 10. UI Presentation Contract

Patient Claims UI may display separate badges for:

* Workflow
* Decision
* Payment
* Readiness
* Risk

The UI must not use one badge as a substitute for all Claim state dimensions.

English-first labels and Thai support must be preserved.

Unsupported values must render as controlled `Unknown` or `Unavailable`, not as a valid default state.

## 11. Security and Integration Boundaries

Batch A must preserve:

```text
UI / route
    ↓
server query or command boundary
    ↓
generated Supabase client / approved RPC
    ↓
Phase 4 controlled database contract
```

Mandatory rules:

* No direct client mutation of protected Claim state columns
* No service-role key in client code
* No actor identity accepted from request payloads
* No unverified organization or clinic identifiers
* No duplication of transition authorization in UI code
* No PHI or sensitive Claim payload in logs or user-facing errors
* Existing workflow command service authorization and optimistic-lock behavior must not regress

## 12. Approved Exact File Allowlist

### Approved Existing Files to Modify

```text
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
features/patient-claims/components/patient-claims-workspace.tsx
features/patient-claims/data/patient-claims.mock.ts
```

### Conditional Existing Files

The following files are not part of the default change set. They may be modified only when implementation evidence proves that compilation or approved contract alignment requires a non-behavioral adjustment:

```text
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/server/claim-workflow-command-service.test.ts
```

Before changing either file, the implementation report must record the exact reason. Any required behavioral change, new dependency, trust-boundary change, or controlled-mutation change invalidates this approval and requires contract amendment.

### Read-Only Verification Files

```text
features/patient-claims/server/claim-workflow-command-service.ts
features/patient-claims/server/claim-integration-errors.ts
lib/database.types.ts
package.json
```

### Approved New Files

```text
None
```

A new compatibility adapter file may be added only by amending and re-approving this allowlist before implementation.

### Explicitly Forbidden Files

```text
supabase/migrations/**
supabase/tests/**
lib/database.types.ts
app/**
features outside features/patient-claims/**
package.json
package-lock.json
```

No wording such as “related files as needed” is permitted.

## 13. Required Tests

### Mapping

* All supported workflow states
* All supported decision states
* All supported payment states
* Unsupported workflow value
* Unsupported decision value
* Unsupported payment value
* Canonical action disabled when any canonical dimension is unsupported
* Compatibility adapter behavior, when retained

### Filters

* Independent workflow filter
* Independent decision filter
* Independent payment filter
* Independent readiness filter
* Combined filters use AND semantics without cross-dimension inference
* Legacy URL/filter translation, when retained

### KPIs

* Approved but unpaid
* Partially approved and partially paid
* Closed but unpaid
* Rejected and unpaid
* Submitted but not readiness-complete
* Readiness counts do not use workflow status
* Approved amount does not imply paid amount

### UI

* Independent badges render correctly
* Unknown state renders controlled unavailable presentation
* Legacy mixed status is not displayed as authoritative

### Regression

* Query-service tenant scope remains unchanged
* Workflow command service tests remain passing
* No direct protected-table mutation is introduced
* Existing error normalization remains unchanged

## 14. Validation Commands

Run only commands supported by repository evidence.

```powershell
npx vitest run features/patient-claims/server/claim-mappers.test.ts
npx vitest run features/patient-claims/server/claim-query-service.test.ts
npx vitest run features/patient-claims/utils/patient-claims-utils.test.ts
npx vitest run features/patient-claims/server/claim-workflow-command-service.test.ts
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git diff --stat
git diff --name-only
git status --short
```

Do not use `npm test`; no such repository script is defined.

Do not claim PASS for commands that were not executed successfully.

Database reset, lint, or database tests are not required because Batch A prohibits database and generated-type changes. If such changes appear in the diff, stop the Batch as a scope violation.

## 15. Closed Approval Decisions

| ID | Approved decision | Owner | Status |
| --- | --- | --- | --- |
| BA-DEC-01 | Retain a renamed, non-authoritative `legacyClaimPresentationStatus` adapter for temporary display and legacy URL/filter translation only | Product Owner / Application Architect | CLOSED |
| BA-DEC-02 | Define `pendingClaims` from the approved workflow-only pending set; exclude `closed` and `cancelled` | Product Owner / Claim Domain Owner | CLOSED |
| BA-DEC-03 | Use verified Claim Readiness assessment data when available; otherwise use an explicitly non-authoritative presentation fallback with tests and a removal review condition | Product Owner / Claim Domain Owner | CLOSED |

Blocking Decisions: `0`

## 16. Approval Gate

Required reviewers:

* Product Owner
* Claim Domain Owner
* Application Architect
* Security Reviewer
* QA Lead

Approval evidence:

1. BA-DEC-01 through BA-DEC-03 are closed.
2. The exact Batch A allowlist is confirmed.
3. Required tests and repository-supported commands are approved.
4. No unresolved P0/P1 security or domain-semantic blocker remains in this contract.
5. Implementation may start only from a clean working tree.
6. Implementation authorization is explicitly `YES`.
7. Approval is limited to Batch A and does not authorize deployment or release.

Approval Decision: `APPROVED`

Implementation Authorization: `YES`

## 17. Implementation Stop Conditions

Stop implementation and return the contract to review when any of the following occurs:

* A required change falls outside the approved or explicitly conditional allowlist.
* Database schema, enum, RPC, RLS, grant, migration, or generated-type changes become necessary.
* The verified readiness source cannot be integrated without changing an unapproved feature or database boundary.
* Compatibility behavior must control authoritative writes, permissions, KPIs, decisions, payments, or financial calculations.
* Controlled workflow command behavior, tenant verification, actor authority, optimistic locking, or error normalization would change.
* Required tests cannot be executed or a required validation command fails.
* The working tree contains unrelated changes that cannot be isolated.

## 18. Completion Gate

An authorized Batch A implementation is complete only when:

* Every changed file is within the approved allowlist.
* Canonical dimensions are independent in DTOs, mapping, filters, KPIs, and UI.
* Compatibility behavior is removed or isolated exactly as approved.
* Readiness is not inferred authoritatively from workflow.
* Controlled mutation behavior is unchanged.
* Required tests, TypeScript, lint, and build pass.
* Final diff contains no database, migration, generated-type, or unrelated feature changes.
* Completion evidence is recorded before Batch B begins.

## 19. Approval Record

| Field | Value |
| --- | --- |
| Document | `PHASE-5-BATCH-A-PATIENT-CLAIMS-CONTRACT` |
| Record State | `APPROVED CONTRACT` |
| Contract Status | `APPROVED` |
| Implementation Status | `NOT STARTED` |
| Implementation Authorization | `YES` |
| Application Changes | `AUTHORIZED — EXACT BATCH A ALLOWLIST ONLY` |
| Database Changes | `NOT AUTHORIZED` |
| Migration Changes | `NOT AUTHORIZED` |
| Generated-Type Changes | `NOT AUTHORIZED` |
| Blocking Decisions | `0` |
| Approval Date | `2026-07-24` |
| Required Review Roles | Product Owner; Claim Domain Owner; Application Architect; Security Reviewer; QA Lead |
| Deployment Authorization | `NO` |

```text
Approval Decision: APPROVED
Implementation Authorized: YES
Implementation Status: NOT STARTED

Recommended Next Task:
PHASE 5 — BATCH A IMPLEMENTATION
```

Implementation must remain within this exact contract. Batch B, Batch C, deployment, production release, database changes, and generated-type changes require separate approval.
