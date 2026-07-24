---
document_id: PHASE-5-BATCH-B-READINESS-NAMING-CONTRACT
project: Med AI NexSure
phase: 5
batch: B
contract_type: APPLICATION_INTEGRATION
record_state: READY_FOR_REVIEW
contract_status: PROPOSED
implementation_status: NOT_STARTED
implementation_authorization: NO
created_date: 2026-07-24
branch: main
parent_contract: docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
prior_batch_closure: docs/application/PHASE-5-BATCH-A-CLOSURE-RECORD.md
application_changes_authorized: NO
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
blocking_decisions: 2
---

# Phase 5 — Batch B Claim Readiness Naming Reconciliation Contract

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

This document defines the evidence-based implementation boundary for:

```text
Phase 5 — Batch B
Claim Readiness Naming Reconciliation
```

No Agent may implement Batch B until this contract is explicitly approved and `Implementation Authorization` is changed to `YES`.

## 2. Objective

Rename application fields, filters, labels, mock properties, and presentation paths called `claimStatus` when repository evidence proves that they represent Claim Readiness, evidence completeness, or submission preparedness rather than:

```text
workflowStatus
decisionStatus
paymentStatus
```

Batch B must preserve existing readiness calculations, readiness thresholds, dashboard totals, filtering behavior, queue behavior, and presentation outcomes.

Batch B is naming and semantic reconciliation only.

## 3. Dependency Gate

Required prior evidence:

```text
Phase 5 Master Contract: APPROVED
Phase 5 Batch A: CLOSED
Batch A Validation: PASS
Batch A Database Changes: NONE
Batch A Migration Changes: NONE
Batch A Generated-Type Changes: NONE
```

Batch B must not reopen or modify Batch A implementation unless a separately approved contract amendment explicitly authorizes it.

## 4. Repository Evidence Reviewed

The Batch B evidence package contained:

```text
docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
docs/application/PHASE-5-BATCH-A-CLOSURE-RECORD.md
features/executive-dashboard/**
features/visit-list/**
features/departments/**
package.json
tsconfig.json
```

Repository-defined scripts confirmed:

```json
{
  "build": "next build",
  "lint": "eslint"
}
```

The repository does not define a generic `npm test` script. Batch B tests must use exact Vitest paths through `npx vitest run`.

## 5. Confirmed Evidence Findings

### 5.1 Visit List

Confirmed paths:

```text
features/visit-list/types.ts
features/visit-list/data.ts
features/visit-list/visit-list-page.tsx
```

Confirmed evidence:

* `claimStatus` is typed as `ClaimReadinessStatus`.
* Values are `Ready`, `Needs Review`, `Not Ready`, and `Calculating`.
* Filtering compares the readiness selection directly with `visit.claimStatus`.
* UI presentation displays a score out of 100 with the explicit helper text `Not claim approval`.
* `claimStatus` therefore represents readiness presentation, not workflow, payer adjudication, or payment.

Required semantic direction:

```text
claimStatus → readinessStatus
claimScore  → readinessScore
```

`Calculating` is a presentation state and must remain explicitly supported if retained.

### 5.2 Executive Dashboard

Confirmed paths include:

```text
features/executive-dashboard/types/executive-dashboard.types.ts
features/executive-dashboard/components/executive-dashboard.tsx
features/executive-dashboard/data/executive-dashboard-mock.ts
features/executive-dashboard/domain/rules.ts
features/executive-dashboard/domain/types.ts
features/executive-dashboard/domain/validation.ts
features/executive-dashboard/constants/executive-dashboard.constants.ts
features/executive-dashboard/server/mock-repository.ts
features/executive-dashboard/server/service.ts
features/executive-dashboard/services/executive-dashboard-service.ts
```

Confirmed evidence:

* `claimStatus` is typed with `ClaimReadinessStatus`.
* Filter options are `ready`, `needs_review`, and `not_ready`.
* Readiness composition drill-down writes to `claimStatus`.
* Dashboard rule calculations count ready, needs-review, and not-ready cases through `claimStatus`.
* Mock repository totals and worklist behavior use `claimStatus` as readiness.
* One service path already compares `item.readinessStatus` with `filters.claimStatus`, confirming semantic naming inconsistency across layers.

Required semantic direction:

```text
claimStatus filter → readinessStatus
CaseWorklistItem.claimStatus → readinessStatus
supportedFilter.claimStatus → supportedFilter.readinessStatus
```

Dashboard behavior and totals must remain unchanged.

### 5.3 Departments

Confirmed paths include:

```text
features/departments/types/department.types.ts
features/departments/data/department-dashboard.mock.ts
features/departments/components/department-operational-intelligence-page.tsx
features/departments/schemas/department.schema.ts
features/departments/schemas/department.schema.test.ts
features/departments/services/department-service.ts
features/departments/hooks/use-department-dashboard.ts
features/departments/hooks/use-department-filters.ts
features/departments/utils/department-formatters.ts
features/departments/utils/department-formatters.test.ts
features/departments/utils/department-status.ts
```

Confirmed evidence:

* Worklist rows already carry `readinessScore`.
* The UI already has a separate readiness filter using `ClaimReadinessStatus`.
* A table column named `Claim Status` renders `item.claimStatus`.
* Mock data derives `claimStatus` from readiness score thresholds.
* Current values include `draft`, `needs_review`, `ready_for_submission`, and `submitted`.
* These values mix readiness, preparation, and submission presentation and are not Phase 4 canonical workflow values.
* Department formatters correctly implement the Med AI NexSure thresholds:
  * Ready: 85–100
  * Needs Review: 60–84
  * Not Ready: 0–59

Required semantic direction:

The field must no longer be called generic `claimStatus`.

The exact replacement depends on the decision in Section 14:

```text
Option 1: readinessStatus
Option 2: submissionReadinessStatus
```

It must not be renamed to `workflowStatus`, `decisionStatus`, or `paymentStatus`.

## 6. Source-of-Truth Rules

Batch B naming precedence:

1. Existing verified readiness score and readiness thresholds
2. Existing `ClaimReadinessStatus` domain types
3. Existing feature calculation behavior
4. Approved Batch B names
5. UI labels and mock data

Batch B must not derive readiness from:

```text
workflowStatus
decisionStatus
paymentStatus
legacyClaimPresentationStatus
```

Batch B must not infer Claim approval or payment from readiness.

## 7. Required Outcomes

### 7.1 Visit List

Required outcomes:

* Rename readiness properties to explicit readiness names.
* Preserve all displayed scores and statuses.
* Preserve the `Calculating` presentation state.
* Preserve search, sorting, filters, permissions, and actions.
* Keep clear helper copy that readiness is not Claim approval.
* Do not add payer decision or payment semantics.

### 7.2 Executive Dashboard

Required outcomes:

* Rename readiness filter and worklist properties consistently.
* Rename readiness drill-down payloads consistently.
* Preserve ready, needs-review, and not-ready totals.
* Preserve executive KPI calculations and chart composition.
* Preserve authorization, organization/clinic scoping, server validation, audit, and export behavior.
* Do not introduce canonical Claim workflow, decision, or payment integration in this Batch.

### 7.3 Departments

Required outcomes:

* Replace generic `claimStatus` with an approved readiness-specific name.
* Rename the UI column from `Claim Status` to domain-accurate wording.
* Preserve readiness score thresholds and readiness filter behavior.
* Preserve queue status as a separate concern.
* Preserve submission/presentation values only when explicitly governed by the approved name.
* Do not map `submitted` or `ready_for_submission` to Phase 4 workflow authority.
* Preserve department KPIs, worklist counts, charts, SLA, evidence, and cost behavior.

## 8. Naming Standard

Approved general naming conventions:

```text
readinessScore
readinessStatus
readinessFilter
readinessComposition
claimReadyPercentage
averageReadinessScore
```

Prohibited generic naming for readiness data:

```text
claimStatus
status
claim_state
payerStatus
approvalStatus
```

Exceptions require an explicit domain qualifier and documented reason.

UI labels should use:

```text
Claim Readiness
Readiness Status
Readiness Score
Submission Readiness
```

UI labels must not imply:

```text
Claim Approved
Payer Approved
Payment Complete
```

unless the underlying field is an approved decision or payment dimension.

## 9. Compatibility Governance

Batch B should perform a direct internal rename where all affected consumers are included in the exact allowlist.

A compatibility alias is permitted only if:

* A confirmed external consumer cannot be changed in Batch B.
* The alias is one-way and read-only.
* The alias is explicitly named as legacy.
* It does not control writes, permissions, readiness authority, workflow, decisions, or payment.
* The contract amendment records its owner and removal condition.

No compatibility alias is currently approved by this proposed contract.

## 10. Proposed Exact File Allowlist

### 10.1 Visit List

```text
features/visit-list/types.ts
features/visit-list/data.ts
features/visit-list/visit-list-page.tsx
```

### 10.2 Executive Dashboard

```text
features/executive-dashboard/types/executive-dashboard.types.ts
features/executive-dashboard/components/executive-dashboard.tsx
features/executive-dashboard/data/executive-dashboard-mock.ts
features/executive-dashboard/domain/rules.ts
features/executive-dashboard/domain/types.ts
features/executive-dashboard/domain/validation.ts
features/executive-dashboard/constants/executive-dashboard.constants.ts
features/executive-dashboard/server/mock-repository.ts
features/executive-dashboard/server/service.ts
features/executive-dashboard/services/executive-dashboard-service.ts
```

### 10.3 Departments

```text
features/departments/types/department.types.ts
features/departments/data/department-dashboard.mock.ts
features/departments/components/department-operational-intelligence-page.tsx
features/departments/schemas/department.schema.ts
features/departments/schemas/department.schema.test.ts
features/departments/services/department-service.ts
features/departments/hooks/use-department-dashboard.ts
features/departments/hooks/use-department-filters.ts
features/departments/utils/department-formatters.ts
features/departments/utils/department-formatters.test.ts
features/departments/utils/department-status.ts
```

No other file may be modified without contract amendment and approval.

## 11. Explicitly Forbidden Files

```text
features/patient-claims/**
features/payer-rules/**
lib/database.types.ts
supabase/migrations/**
supabase/tests/**
app/**
package.json
package-lock.json
tsconfig.json
```

Existing routes may consume the changed feature modules but must not be edited in Batch B unless repository evidence later proves compilation requires an exact route-level import rename and the contract is amended first.

## 12. Test Contract

Batch B must use test-first implementation.

### 12.1 Existing tests to preserve

```text
features/departments/schemas/department.schema.test.ts
features/departments/utils/department-formatters.test.ts
```

Required assertions include:

* 85 maps to `ready`.
* 84 maps to `needs_review`.
* 59 maps to `not_ready`.
* Schema validation accepts the approved renamed property.
* Schema validation rejects missing or unsupported readiness values where the current contract requires strict input.

### 12.2 Required new tests

Create exact feature tests only when a relevant test file does not currently exist.

Candidate new files, subject to approval:

```text
features/visit-list/visit-list-readiness.test.ts
features/executive-dashboard/domain/rules.test.ts
features/executive-dashboard/domain/validation.test.ts
features/executive-dashboard/server/mock-repository.test.ts
```

Required behavior:

* Visit List filtering uses readiness status.
* `Calculating` remains supported where score is unavailable.
* Executive Dashboard readiness totals remain unchanged.
* Executive Dashboard drill-down and filter validation use readiness naming.
* Department readiness thresholds remain unchanged.
* Department queue status remains independent.
* No readiness value is interpreted as payer approval or payment.
* No generic `claimStatus` identifier remains in approved Batch B feature code unless explicitly documented.

The final approved contract must confirm exact new test paths before implementation authorization.

## 13. Validation Contract

Run exact affected tests first:

```powershell
npx vitest run `
  .\features\departments\schemas\department.schema.test.ts `
  .\features\departments\utils\department-formatters.test.ts `
  <approved-new-test-paths>
```

Then run:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Final scope validation:

```powershell
git diff --check
git diff --stat
git diff --name-only
git status --short
```

Semantic scan:

```powershell
Get-ChildItem `
  .\features\executive-dashboard,`
  .\features\visit-list,`
  .\features\departments `
  -Recurse -File |
Select-String -Pattern '\bclaimStatus\b'
```

Do not claim PASS for a command not executed successfully.

## 14. Approval Decisions Required

### BB-DEC-01 — Department replacement name

Choose one:

**Option A — `readinessStatus`**

Use when the field is strictly derived from the Med AI NexSure readiness thresholds.

**Option B — `submissionReadinessStatus`**

Use when the field intentionally preserves preparation/submission presentation values such as:

```text
draft
needs_review
ready_for_submission
submitted
```

Recommended direction:

```text
Option B — submissionReadinessStatus
```

Rationale:

The current Department field contains `ready_for_submission` and `submitted`, which are broader than the standard three-value readiness classification. The explicit `submissionReadinessStatus` name avoids falsely presenting these values as the canonical Claim workflow.

Owner:

```text
Product Owner / Claim Domain Owner
```

### BB-DEC-02 — New test files

Confirm whether Batch B may create the proposed tests:

```text
features/visit-list/visit-list-readiness.test.ts
features/executive-dashboard/domain/rules.test.ts
features/executive-dashboard/domain/validation.test.ts
features/executive-dashboard/server/mock-repository.test.ts
```

Recommended direction:

```text
APPROVE
```

Rationale:

Executive Dashboard and Visit List currently have no tests in the provided evidence package. A naming cutover without behavioral regression tests would not satisfy Batch B closure quality.

Owner:

```text
Application Architect / QA Lead
```

Blocking Decisions:

```text
2
```

## 15. Security and Architecture Constraints

Batch B must preserve:

* Existing server and client boundaries
* Existing organization and clinic scoping
* Existing RBAC behavior
* Existing audit behavior
* Existing export permissions
* Existing server validation
* Existing queue status semantics
* Existing cost and SLA semantics
* Existing human review requirements

Batch B must not:

* Add direct database writes
* Add controlled workflow mutations
* Add payer decisions
* Add payment behavior
* Change tenant identity
* Accept actor identity from request data
* Expose service credentials
* Change PHI masking
* Log sensitive patient data
* Change database or generated types

## 16. Stop Conditions

Stop and return this contract to review if:

* A required change falls outside the proposed allowlist.
* The rename requires database schema, generated type, RPC, RLS, migration, or grant changes.
* The existing Department field cannot be classified without changing business behavior.
* Existing dashboard totals change after a naming-only modification.
* Required tests cannot be created or executed.
* A generic `claimStatus` consumer is discovered outside the evidence package.
* Visit List or Department behavior relies on `claimStatus` as authoritative Claim workflow or payer decision.
* The working tree contains unrelated changes.

## 17. Approval Gate

Batch B implementation may begin only when all are true:

```text
Master Contract Status: APPROVED
Batch A Closure: CLOSED
Batch B Contract Status: APPROVED
Batch B Implementation Authorization: YES
BB-DEC-01: CLOSED
BB-DEC-02: CLOSED
Blocking Decisions: 0
Exact File Allowlist: APPROVED
Exact Test Paths: APPROVED
Working Tree: CLEAN
```

Required reviewers:

* Product Owner
* Claim Domain Owner
* Application Architect
* Security Reviewer
* QA Lead

No conditional approval is permitted.

## 18. Completion Gate

Batch B may close only when:

* All approved generic readiness `claimStatus` names are removed or explicitly governed.
* Readiness totals and thresholds remain unchanged.
* Queue, workflow, decision, and payment semantics remain independent.
* Exact tests pass.
* TypeScript passes.
* Lint passes.
* Production build passes.
* Final diff contains only approved files.
* Database, migration, RPC, and generated-type changes are absent.
* No unresolved P0/P1 blocker remains.
* A Batch B Closure Record is created and approved.

## 19. Final Record

```text
Document: PHASE-5-BATCH-B-READINESS-NAMING-CONTRACT
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Implementation Status: NOT STARTED
Implementation Authorization: NO
Blocking Decisions: 2

Application Changes Authorized: NO
Database Changes Authorized: NO
Migration Changes Authorized: NO
Generated-Type Changes Authorized: NO

Recommended Next Task:
PHASE 5 — BATCH B DECISION CLOSURE AND APPROVAL
```

No Agent may begin Phase 5 Batch B implementation from this proposed contract.
