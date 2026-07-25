---
document_id: PHASE-5-BATCH-C-CONTRACT
project: Med AI NexSure
phase: 5
batch: C
batch_title: Payer Rules Status Reconciliation
contract_type: APPLICATION_INTEGRATION
record_state: READY_FOR_REVIEW
contract_status: PROPOSED
implementation_status: NOT_STARTED
implementation_authorization: NO
created_date: 2026-07-25
branch: main
parent_contract: docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
prior_batch_closure: docs/application/PHASE-5-BATCH-B-CLOSURE-RECORD.md
application_changes_authorized: NO
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
deployment_authorization: NO
blocking_decisions: 2
---

# Phase 5 — Batch C Payer Rules Status Reconciliation Contract

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform |
| Phase | Phase 5 — Claim Application Integration |
| Batch | Batch C |
| Batch title | Payer Rules Status Reconciliation |
| Document | `docs/application/PHASE-5-BATCH-C-CONTRACT.md` |
| Record state | `READY_FOR_REVIEW` |
| Contract status | `PROPOSED` |
| Implementation status | `NOT_STARTED` |
| Implementation authorization | `NO` |
| Created date | 2026-07-25 |
| Repository branch | `main` |
| Parent contract | `docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md` |
| Required prior closure | `docs/application/PHASE-5-BATCH-B-CLOSURE-RECORD.md` |
| Blocking decisions | `2` |
| Database changes | Not authorized |
| Migration changes | Not authorized |
| Generated type changes | Not authorized |
| Deployment | Not authorized |

## 2. Contract Decision

```text
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Implementation Status: NOT STARTED
Implementation Authorization: NO
Blocking Decisions: 2

Application Changes: NOT AUTHORIZED
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Changes: NOT AUTHORIZED
Deployment: NOT AUTHORIZED
```

This document defines the proposed implementation boundary for:

```text
Phase 5 — Batch C
Payer Rules Status Reconciliation
```

No Agent may implement Batch C until all blocking decisions are closed, the exact allowlist and tests are confirmed, and the contract is explicitly approved with implementation authorization set to `YES`.

## 3. Purpose

Batch C will remove the overloaded Payer Rules `claimStatus` presentation model and replace it with explicit status dimensions.

The current Payer Rules case-selection model combines values from different business domains:

```text
Draft
Submitted
Pending Evidence
Under Review
Approved
Paid
```

These values do not belong to one authoritative status lifecycle. Batch C must reconcile them without changing Payer Rule evaluation logic, Claim database behavior, workflow mutations, payer decisions, payment processing, readiness scoring, or production integration.

## 4. Preconditions

Implementation may begin only when all entry gates pass:

```text
Phase 5 Master Contract: APPROVED
Phase 5 Batch A: CLOSED
Phase 5 Batch B: CLOSED
Batch C Contract: APPROVED
Batch C Implementation Authorization: YES
Blocking Decisions: 0
Exact File Allowlist: CONFIRMED
Required Tests: APPROVED
Working Tree: CLEAN
```

Confirmed repository history supplied for this contract:

```text
a5aacc3 docs(application): close phase 5 batch B
5de0ce3 refactor(claim-readiness): reconcile phase 5 batch B naming
84f8dae docs(application): approve phase 5 batch B contract
```

Batch C must not reopen Batch A or Batch B closed scope.

## 5. Repository Evidence Reviewed

### Confirmed documents

```text
docs/application/PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT.md
docs/application/PHASE-5-BATCH-A-CLOSURE-RECORD.md
docs/application/PHASE-5-BATCH-B-CLOSURE-RECORD.md
docs/database/PHASE-4-CLAIM-IMPACT-ANALYSIS.md
docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md
docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md
docs/database/PHASE-4-CLAIM-TEST-PLAN.md
```

### Confirmed application evidence

```text
features/payer-rules/components/payer-detail-page.tsx
```

Observed model:

```ts
type CaseSelectFilters = {
  claimStatus: string;
  readiness: string;
  cost: string;
  sla: string;
};
```

Observed case status field:

```ts
claimStatus:
  | "Submitted"
  | "Pending Evidence"
  | "Under Review"
  | "Draft"
  | "Approved"
  | "Paid";
```

Observed consumers include initial filter state, mock records, filtering, the `Claim status` label, worklist rendering, and status tone mapping.

### Evidence classification

| Finding | Classification |
| --- | --- |
| Payer Rules contains a single `claimStatus` field | Confirmed Repository Evidence |
| The field combines workflow, decision, payment, and readiness/review values | Confirmed Repository Evidence |
| Batch C is Payer Rules Status Reconciliation | Contract Decision |
| No production database integration is required | Contract Decision |
| No mutation behavior is required | Contract Decision |
| Exact current Payer Rules file inventory | Not Verified |
| Exact existing Payer Rules automated test inventory | Not Verified |

## 6. Confirmed Current State

Current value classification:

| Existing value | Proposed domain | Contract treatment |
| --- | --- | --- |
| `Draft` | Workflow | `workflowStatus` |
| `Submitted` | Workflow | `workflowStatus` |
| `Approved` | Decision | `decisionStatus` |
| `Paid` | Payment | `paymentStatus` |
| `Pending Evidence` | Readiness/evidence | Blocking decision required |
| `Under Review` | Review/workflow/decision presentation | Blocking decision required |

The current single-status model can create false implications such as `approved = paid`, `submitted = ready`, or `pending evidence = workflow status`.

## 7. Candidate Scope Assessment

### Full database-backed Payer Rules integration

**Deferred.** The Phase 5 master contract prohibits unapproved database integration, and no migration, generated type, RPC, or mutation requirement is established.

### Broad Payer Rules architecture refactor

**Deferred.** It exceeds the smallest safe Batch C scope and creates unnecessary regression risk.

### Payer Rules status presentation reconciliation

**Selected.** It directly satisfies the Phase 5 master contract, corrects a confirmed semantic collision, preserves mock behavior, and requires no database or package changes.

## 8. Selected Batch C Capability

```text
PAYER RULES CASE STATUS DIMENSION RECONCILIATION
```

Target dimensions:

```text
workflowStatus
decisionStatus
paymentStatus
readinessStatus or evidenceStatus
```

The exact fourth dimension and the classification of `Under Review` remain blocked pending evidence review.

## 9. Business and User Value

Batch C must make it clear that workflow progress is not payer approval, payer approval is not payment completion, payment completion is not submission readiness, and missing evidence is not a payer decision.

Expected value:

- safer case filtering;
- clearer Payer Rules impact analysis;
- fewer ambiguous operational interpretations;
- consistency with Phase 4 split-state semantics;
- reduced risk of incorrect financial assumptions.

## 10. Domain Semantics

Batch C must preserve independent concepts:

```text
workflowStatus
decisionStatus
paymentStatus
readinessStatus
submissionReadinessStatus
evidenceStatus
payerRuleReviewStatus
```

Only repository-supported fields required by the existing worklist may be introduced.

- `Draft` and `Submitted` belong to workflow presentation.
- `Approved` belongs to payer decision presentation.
- `Paid` belongs to payment presentation.
- `Pending Evidence` must remain separate from workflow, decision, and payment.
- `Under Review` must be assigned to one explicit domain or retained as a named non-authoritative presentation field.

Do not classify unsupported values by assumption.

## 11. Application Integration Boundary

Batch C is presentation and mock-model reconciliation only:

```text
Payer Rules UI
    ->
Payer Rules local types / presentation model
    ->
Existing mock case data and filter behavior
```

It must not introduce a new server mutation, database RPC, or direct Claim state write.

## 12. Source-of-Truth Boundary

1. Approved Phase 4 split-state semantics govern domain meaning.
2. The approved Phase 5 master contract governs Batch purpose.
3. Current Payer Rules code governs existing display behavior.
4. Mock records remain demonstration data only.
5. No database-backed authority is implied.

## 13. In-Scope Requirements

Batch C must:

1. Remove generic Payer Rules case `claimStatus` from the approved scope.
2. Split values into explicit status dimensions.
3. Replace the generic `Claim status` filter with independent filters where supported.
4. Replace the generic worklist status column with explicit status presentation.
5. Preserve all existing case records and totals.
6. Preserve search, readiness, cost, and SLA behavior.
7. Preserve Payer Rule configuration and evaluation behavior.
8. Preserve mock-only and route behavior.
9. Preserve responsive layout and badge semantics.
10. Ensure `Approved` does not imply `Paid`.
11. Ensure `Submitted` does not imply readiness.
12. Ensure unknown or unavailable dimensions render safely.
13. Add focused automated tests.

## 14. Out-of-Scope Requirements

Batch C must not:

- integrate production database Claim reads;
- create migrations, SQL tests, policies, functions, or RPCs;
- regenerate or manually edit generated database types;
- create workflow, decision, payment, or webhook mutations;
- modify Batch A or Batch B implementation;
- redesign the full Payer Rules module;
- change Payer Rule calculations, readiness thresholds, cost rules, or SLA rules;
- add package dependencies;
- deploy or release the application.

## 15. Confirmed Existing Files

Confirmed candidate:

```text
features/payer-rules/components/payer-detail-page.tsx
```

Expected responsibility:

- local status types;
- local mock cases;
- filter state and case filtering;
- labels, badges, tone mapping, and worklist rendering.

The following are inspection targets only and are not an implementation allowlist:

```text
features/payer-rules/**/*.ts
features/payer-rules/**/*.tsx
features/payer-rules/**/*.test.ts
features/payer-rules/**/*.test.tsx
app/payer-rules/**
```

## 16. Proposed New Files

Proposed test path, subject to current repository convention:

```text
features/payer-rules/components/payer-detail-status-reconciliation.test.ts
```

The test must prove status separation, independent filtering, independent approval/payment and submission/readiness combinations, and preservation of existing case totals.

## 17. Prohibited Files and Changes

Batch C must not modify:

```text
supabase/migrations/**
supabase/tests/**
lib/database.types.ts
package.json
package-lock.json
features/patient-claims/**
features/visit-list/**
features/executive-dashboard/**
features/departments/**
docs/application/PHASE-5-BATCH-A-CLOSURE-RECORD.md
docs/application/PHASE-5-BATCH-B-CLOSURE-RECORD.md
```

Wildcard implementation scope such as `features/**`, `app/**`, or `lib/**` is prohibited.

## 18. Security and Tenant Requirements

Batch C must not introduce service-role credentials, protected Claim writes, client-authoritative actor identity, weaker organization or clinic isolation, additional PHI exposure, or mock values used for permissions or financial authority.

Existing masking behavior must be preserved.

## 19. Loading, Empty, Error, and Unavailable States

- Preserve existing loading behavior.
- Independent filters may produce an empty worklist without error.
- No new server error path is expected.
- Missing decision or payment must render safely and must not default to `Approved` or `Paid`.
- Labels such as `Pending`, `Not Available`, or `Not Paid` may be used only when consistent with repository conventions.

## 20. Audit and Observability Requirements

Batch C adds no authoritative mutation and therefore requires no new audit event.

The implementation report must record exact changed files, status mapping, case-count preservation, validation results, semantic scan results, and any retained compatibility behavior.

## 21. Functional Acceptance Criteria

Batch C passes only when:

1. No generic Payer Rules case `claimStatus` remains in the approved scope.
2. Workflow, decision, payment, and readiness/evidence are independent.
3. Existing case count, search, cost, SLA, and readiness behavior remain unchanged.
4. Payer Rule configuration and evaluation remain unchanged.
5. Approved and paid can be represented independently.
6. Submitted and readiness can be represented independently.
7. Missing decision/payment values do not create false defaults.
8. UI remains responsive.
9. Focused and regression tests pass.
10. TypeScript, lint, and build pass.
11. Only approved files are changed.

## 22. Test Contract

Required scenarios:

1. `Draft` maps only to workflow.
2. `Submitted` maps only to workflow.
3. `Approved` maps only to decision.
4. `Paid` maps only to payment.
5. `Pending Evidence` maps only to the approved readiness/evidence domain.
6. `Under Review` maps only to the approved review domain.
7. Approved-but-unpaid remains representable.
8. Submitted-but-not-ready remains representable.
9. Each independent filter works.
10. Combined filters preserve existing AND behavior.
11. Existing mock case total is preserved.
12. Unknown or unavailable values render safely.

Run all existing Payer Rules tests; exact paths must be recorded before approval.

## 23. Regression Contract

Prove no regression to payer selection, rule-set selection, case search, readiness/cost/SLA filters, case counts, worklist rendering, impact preview, configuration, mock activity, routes, TypeScript, lint, or build.

Batch A and Batch B files must remain unchanged.

## 24. Validation Commands

Before approval, replace placeholders with exact existing test paths:

```powershell
npx vitest run `
  .\features\payer-rules\components\payer-detail-status-reconciliation.test.ts `
  <exact-existing-payer-rules-test-files>

npx tsc --noEmit
npm run lint
npm run build
```

Semantic scan:

```powershell
Get-ChildItem .\features\payer-rules -Recurse -File |
Select-String -Pattern '\bclaimStatus\b|All Claim Statuses|Claim status'
```

Git validation:

```powershell
git diff --check
git diff --stat
git diff --name-only
git status --short
```

Do not claim `PASS` for commands not executed successfully.

## 25. Implementation Sequence

After approval only:

1. Confirm a clean working tree.
2. Read the approved contract.
3. Re-inspect current Payer Rules files and confirm the allowlist.
4. Create focused tests first.
5. Confirm intended test failure.
6. Introduce explicit status-domain types.
7. Reconcile mock records, filters, columns, badges, and tone functions.
8. Preserve search, readiness, cost, SLA, counts, and rule behavior.
9. Run focused and regression tests.
10. Run TypeScript, lint, build, semantic scan, and final Git inspection.
11. Report evidence without committing or pushing unless separately instructed.

## 26. Stop Conditions

Stop if:

- the contract is not `APPROVED` or authorization is not `YES`;
- blocking decisions are greater than zero;
- the working tree is not clean;
- repository evidence materially differs;
- exact consumers or tests cannot be confirmed;
- database, generated-type, package, Batch A, or Batch B changes become necessary;
- Payer Rule logic, tenant behavior, or PHI behavior would change;
- status values cannot be classified without Product Owner decision;
- validation failure requires work outside the allowlist.

## 27. Blocking Decisions

### BC-DEC-01 — Classify `Pending Evidence` and `Under Review`

**Status:** OPEN — BLOCKING

Required decision:

- assign `Pending Evidence` to `readinessStatus` or `evidenceStatus`;
- assign `Under Review` to an explicit domain such as `payerRuleReviewStatus`, `decisionStatus`, or `workflowStatus`.

Recommended direction:

```text
Pending Evidence -> evidenceStatus
Under Review -> payerRuleReviewStatus
```

This keeps both as non-authoritative presentation concepts and avoids mixing them with canonical Claim workflow or payer decision.

### BC-DEC-02 — Confirm exact current Payer Rules allowlist and tests

**Status:** OPEN — BLOCKING

Inspect:

```text
features/payer-rules/**
app/payer-rules/**
```

Record exact files consuming mixed status, exact existing test paths, the proposed new test path, and whether the confirmed component file alone is sufficient.

## 28. Approval Gate

Batch C may be approved only when:

```text
BC-DEC-01: CLOSED
BC-DEC-02: CLOSED
Blocking Decisions: 0
Exact Existing Files: CONFIRMED
Proposed New Test Files: CONFIRMED
Acceptance Criteria: APPROVED
Validation Commands: EXACT
Required Review: COMPLETE
```

Approval must explicitly set:

```yaml
record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_status: NOT_STARTED
implementation_authorization: YES
blocking_decisions: 0
```

This contract-definition task must not make that update.

## 29. Recommended Implementation Prompt

```text
PHASE 5 — BATCH C IMPLEMENTATION

Read the approved contract first:
docs/application/PHASE-5-BATCH-C-CONTRACT.md

Proceed only when the contract is APPROVED, implementation_authorization is YES, blocking_decisions is 0, and the working tree is clean.

Implement only the exact approved Payer Rules allowlist using test-first development. Preserve Payer Rule behavior and case totals. Separate workflow, decision, payment, and evidence/review dimensions. Do not modify SQL, migrations, generated types, package files, Batch A, or Batch B. Do not commit or push unless explicitly instructed.

Run the exact approved tests, TypeScript, lint, build, semantic scan, and Git validation. Stop on contract drift, scope drift, database dependency, or validation failure outside the allowlist.
```

## 30. Final Contract Summary

```text
Batch: Phase 5 — Batch C
Capability: Payer Rules Status Reconciliation
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Implementation Status: NOT STARTED
Implementation Authorization: NO
Blocking Decisions: 2
Confirmed Candidate File: features/payer-rules/components/payer-detail-page.tsx
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Changes: NOT AUTHORIZED
Mutation Behavior: NOT AUTHORIZED
Deployment: NOT AUTHORIZED

Next Required Action:
Close BC-DEC-01 and BC-DEC-02 through repository evidence review and Product Owner decision.
```
