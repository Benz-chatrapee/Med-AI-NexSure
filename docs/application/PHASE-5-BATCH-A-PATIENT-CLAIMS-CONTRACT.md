---
document_id: PHASE-5-BATCH-A-PATIENT-CLAIMS-CONTRACT
project: Med AI NexSure
phase: 5
batch: A
contract_type: APPLICATION_INTEGRATION
record_state: READY_FOR_REVIEW
contract_status: PROPOSED
implementation_status: NOT_STARTED
implementation_authorization: NO
created_date: 2026-07-24
branch: main
parent_contract: docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
application_changes_authorized: NO
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
blocking_decisions: 3
---

# Phase 5 — Batch A Patient Claims Canonical Cutover Contract

## 1. Contract Decision

```text
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Implementation Status: NOT STARTED
Implementation Authorization: NO

Application Changes: NOT AUTHORIZED
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Regeneration: NOT AUTHORIZED
Manual Generated-Type Editing: NOT AUTHORIZED
```

This document defines the evidence-based implementation boundary for Phase 5 Batch A only.

No Agent may implement Batch A until this contract is explicitly approved and `Implementation Authorization` is changed to `YES` by the required reviewers.

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

The current workflow-derived `readinessScore` is not accepted as an authoritative readiness calculation. Batch A must either:

1. map readiness from an existing verified readiness source, or
2. retain it as explicitly named presentation-only fallback data with tests and a removal condition.

It must not imply that `submitted`, `under_review`, `appealed`, or `closed` automatically means evidence readiness is 100%.

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

Before implementation approval, reviewers must choose one direction:

* **Option A — Remove:** remove compatibility status from production DTOs and migrate all Patient Claims consumers.
* **Option B — Isolate:** rename and isolate it as an explicitly non-authoritative presentation adapter.

Any retained adapter must record owner, affected consumers, tests, review condition, and target removal Batch or phase.

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
| Submitted Claims | Approved workflow states explicitly defined by Product/Domain Owner |
| Pending Claims | Exact workflow or decision definition approved before implementation |
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

## 12. Proposed Exact File Allowlist

### Approved Existing Files to Modify — Pending Contract Approval

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

The following may be modified only when repository evidence proves compilation or contract alignment requires it, without changing controlled mutation behavior:

```text
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/server/claim-workflow-command-service.test.ts
```

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

## 15. Approval Decisions Required

| ID | Decision | Required owner | Blocking |
| --- | --- | --- | --- |
| BA-DEC-01 | Remove `claimStatus` or retain renamed presentation-only adapter | Product Owner / Application Architect | Yes |
| BA-DEC-02 | Exact business definition of `pendingClaims` KPI | Product Owner / Claim Domain Owner | Yes |
| BA-DEC-03 | Verified readiness source or approved presentation-only fallback | Product Owner / Claim Domain Owner | Yes |

Implementation must remain blocked until all three decisions are closed in this document.

## 16. Approval Gate

Required reviewers:

* Product Owner
* Claim Domain Owner
* Application Architect
* Security Reviewer
* QA Lead

Approval may be granted only when:

1. BA-DEC-01 through BA-DEC-03 are closed.
2. The exact allowlist is confirmed.
3. Tests are approved and executable.
4. No P0/P1 security or domain-semantic blocker remains.
5. Working tree is clean.
6. Implementation authorization is explicitly changed to `YES`.

No conditional approval is permitted.

## 17. Completion Gate

An authorized Batch A implementation is complete only when:

* Every changed file is within the approved allowlist.
* Canonical dimensions are independent in DTOs, mapping, filters, KPIs, and UI.
* Compatibility behavior is removed or isolated exactly as approved.
* Readiness is not inferred authoritatively from workflow.
* Controlled mutation behavior is unchanged.
* Required tests, TypeScript, lint, and build pass.
* Final diff contains no database, migration, generated-type, or unrelated feature changes.
* Completion evidence is recorded before Batch B begins.

## 18. Final Record

```text
Document: PHASE-5-BATCH-A-PATIENT-CLAIMS-CONTRACT
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Implementation Status: NOT STARTED
Implementation Authorization: NO
Blocking Decisions: 3

Approval Decision: PENDING
Implementation Authorized: NO

Recommended Next Task:
PHASE 5 — BATCH A DECISION CLOSURE AND APPROVAL
```

No Agent may begin Batch A implementation from this document.
