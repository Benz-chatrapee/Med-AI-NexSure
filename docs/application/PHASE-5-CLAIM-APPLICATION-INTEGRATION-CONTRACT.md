---
document_id: PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT
project: Med AI NexSure
phase: 5
contract_type: APPLICATION_INTEGRATION
record_state: FINAL
contract_status: APPROVED
implementation_authorization: NO
approval_scope: MASTER_CONTRACT_ONLY
created_date: 2026-07-24
approved_date: 2026-07-24
branch: main
parent_closure: docs/database/PHASE-4-CLOSURE-RECORD.md
required_prior_closure: PHASE-4-CLOSURE-RECORD
evidence_review_status: PASS
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
application_changes_authorized: NO
master_contract_blocking_decisions: 0
batch_approval_pending_decisions: 5
---

# Phase 5 — Claim Application Integration Contract

## 1. Approval Decision

```text
Record State: FINAL
Contract Status: APPROVED
Evidence Review: PASS
Approval Scope: MASTER CONTRACT ONLY
Implementation Authorization: NO

Application Changes: NOT AUTHORIZED
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Regeneration: NOT AUTHORIZED
Manual Generated-Type Editing: NOT AUTHORIZED
```

This document approves the Phase 5 planning and governance boundary only. It does not authorize implementation of Batch A, B, or C.

Each Batch requires a separate approved Batch contract, exact file allowlist, approved tests, clean working tree, and explicit implementation authorization.

## 2. Objective

Integrate the closed Phase 4 Claim split-state model into Med AI NexSure application types, server adapters, filters, KPIs, and UI presentation without recreating a single overloaded Claim status.

Authoritative state dimensions:

```text
workflow_status -> Claim lifecycle
decision_status -> adjudication outcome
payment_status  -> financial settlement
```

Separate non-authoritative concepts:

```text
claim readiness
evidence completeness
submission readiness
payer-rule review
visit readiness
presentation grouping
```

These concepts must remain semantically independent.

## 3. Dependency and Authority

Phase 5 depends on the formally closed Phase 4 baseline.

Confirmed repository evidence:

```text
Phase 4 Closure: APPROVED / CLOSED
Required Batches: 7/7 COMPLETE
Validation: 26 files / 663 tests / PASS
Blocking Open Decisions: 0
Further Phase 4 Implementation: NOT AUTHORIZED
```

Authoritative references:

```text
docs/database/PHASE-4-CLOSURE-RECORD.md
docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md
docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md
docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md
docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md
docs/database/PHASE-4-CLAIM-TEST-PLAN.md
```

Phase 5 must not edit closed Phase 4 migrations, SQL tests, RPC signatures, transition rules, permissions, or database state semantics.

Source-of-truth precedence:

1. Validated Phase 4 schema and controlled RPC contracts
2. Approved Phase 5 Batch contract
3. Generated Supabase types
4. Server validation adapters
5. Domain application types
6. UI presentation models
7. Mock data

When sources conflict, stop and report the conflict. Do not resolve it by assumption.

## 4. Repository Evidence Review

### 4.1 Confirmed by Repository Evidence

The review confirmed:

- `lib/database.types.ts` contains Claim split-state table fields and generated enums for workflow, decision, and payment state.
- Generated RPC signatures exist for controlled workflow, decision, settlement, refund, and appeal operations.
- Several generated RPC arguments and result fields are typed as `unknown`; server adapters must validate them before application use.
- `features/patient-claims/server/claim-mappers.ts` is server-only and validates canonical state values.
- `features/patient-claims/server/claim-workflow-command-service.ts` provides a server-side controlled workflow mutation boundary.
- `features/patient-claims/server/claim-integration-errors.ts` provides an application-facing integration error boundary.
- Patient Claims already exposes canonical workflow, decision, and payment fields while retaining a non-authoritative compatibility `claimStatus`.
- Patient Claims summary and filter logic still consumes compatibility `claimStatus` in some paths.
- Visit List uses `claimStatus` for readiness presentation, not payer adjudication.
- Department worklist uses `claimStatus` for readiness/submission presentation.
- Payer Rules currently mixes workflow, evidence/readiness, decision, and payment values in one presentation field.
- Vitest is installed and existing Patient Claims tests import from `vitest`.
- `package.json` contains `build` and `lint` scripts but no repository `test` script.

### 4.2 Contract Requirements

Before any Batch implementation, its contract must:

- Record all exact consumers found by repository search.
- Replace provisional directory-level scope with exact file paths.
- Define test commands using the installed runner, such as explicit `npx vitest run <paths>` commands.
- Never claim or require `npm test` unless a separate approved change adds that script.
- Keep `lib/database.types.ts` read-only unless a separately approved regeneration task exists.
- Preserve controlled server-only mutation services and their security behavior.

### 4.3 Open Decisions

No open decision blocks this Master Contract. Five Batch-level decisions remain and must be closed before their applicable Batch is approved:

1. Compatibility status retention and removal condition.
2. Independent filter UX.
3. Exact readiness terminology.
4. Payer Rules reconciliation depth.
5. Whether generated-type regeneration is needed based on evidence.

### 4.4 Risks

- Compatibility `claimStatus` can reintroduce overloaded semantics if allowed to remain authoritative.
- Derived readiness values can be mistaken for payer approval or payment state.
- Generated `unknown` RPC fields can bypass type safety without server validation.
- Broad directory allowlists could permit unrelated refactoring.
- Mock-only Payer Rules status values could be misrepresented as production database integration.

### 4.5 Contradictions

No material contradiction blocks Master Contract approval.

The initial draft's validation wording was too broad because the repository has no `npm test` script. This contract replaces that assumption with explicit Vitest commands defined per Batch.

## 5. Cross-Cutting Rules

All Phase 5 Batches must:

- Preserve independent workflow, decision, payment, and readiness semantics.
- Keep generated database types read-only.
- Validate raw rows and RPC results at server adapter boundaries.
- Fail closed for unsupported values used by mutations, permissions, KPIs, decisions, or financial behavior.
- Render unsupported read-only values as controlled `unknown` or `unavailable`.
- Never default an unknown decision or payment state to a valid business state.
- Preserve organization and clinic isolation.
- Preserve server-only controlled mutation access.
- Never accept actor identity from request payloads.
- Never trust tenant identifiers without server verification.
- Never duplicate database transition or authorization rules in client code.
- Never write a derived compatibility status to the database.
- Preserve human authority over Claim and financial decisions.
- Preserve English-first and Thai-support UI conventions.
- Avoid PHI, secrets, or sensitive payloads in logs and normalized errors.

Phase 5 must not change RPC signatures, transition semantics, permissions, database states, direct-write protections, or closed migration behavior.

## 6. Batch A — Patient Claims Canonical Cutover

### Objective

Remove authoritative dependence on compatibility `claimStatus` and use independent workflow, decision, payment, and readiness fields throughout Patient Claims.

### Evidence-Confirmed Candidate Files

```text
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/data/patient-claims.mock.ts
features/patient-claims/server/claim-integration-errors.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/server/claim-workflow-command-service.ts
features/patient-claims/server/claim-workflow-command-service.test.ts
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
features/patient-claims/components/patient-claims-workspace.tsx
```

This is an evidence-confirmed candidate set, not an implementation allowlist. The Batch A contract must reduce it to the exact files required.

### Required Outcomes

- Domain DTOs expose independent canonical states.
- Readiness is represented separately from workflow, decision, and payment.
- Filters are dimension-specific.
- KPIs do not equate approved with paid.
- Unsupported states are handled safely.
- Controlled mutation behavior remains unchanged.
- Compatibility status is removed or isolated in an explicitly named non-authoritative adapter.
- No migration, RPC, or generated-type change occurs.

### Required Tests

- Canonical mapping of all three state dimensions.
- Unsupported state handling.
- Independent filters and KPIs.
- Approved but unpaid.
- Closed but unpaid.
- Rejected and unpaid.
- Partially approved and partially paid.
- Compatibility behavior when temporarily retained.
- Workflow command-service non-regression.
- Error normalization and fail-closed behavior.

## 7. Batch B — Readiness Naming Reconciliation

### Objective

Rename application fields called `claimStatus` when repository evidence shows that they represent readiness, evidence completeness, or submission preparedness.

### Evidence-Confirmed Candidate Areas

```text
features/visit-list/data.ts
features/visit-list/types.ts
features/visit-list/visit-list-page.tsx
features/departments/types/department.types.ts
features/departments/data/department-dashboard.mock.ts
features/departments/components/department-operational-intelligence-page.tsx
features/executive-dashboard/**  # exact consumers must be confirmed in the Batch contract
```

### Required Outcomes

- Readiness terminology is domain-accurate.
- Existing readiness calculations and dashboard totals remain unchanged.
- Mock and production naming remain aligned.
- Readiness is not mapped to workflow, decision, or payment state.
- No database or mutation behavior changes.

## 8. Batch C — Payer Rules Status Reconciliation

### Objective

Remove the mixed workflow, evidence/readiness, decision, and payment values from the Payer Rules presentation model.

### Evidence-Confirmed Candidate File

```text
features/payer-rules/components/payer-detail-page.tsx
```

The Batch C contract must inspect all Payer Rules types, mock data, services, and tests before finalizing its allowlist.

### Required Outcomes

- Status dimensions are modeled independently where repository evidence supports them.
- Mock data identifies each status domain explicitly.
- Approved does not imply paid.
- Submitted does not imply ready.
- Payer-rule logic remains unchanged.
- No production database integration is implied.
- No mutation behavior is added.

## 9. Compatibility Governance

A temporary compatibility path is permitted only when the Batch contract records:

- Compatibility field or adapter.
- Reason retained.
- Affected consumers.
- Owner.
- Required tests.
- Removal or review condition.
- Target Batch or phase for removal.

Compatibility fields may support display, URL translation, mocks, or temporary fixtures only. They must not control authoritative writes, decisions, payments, permissions, tenant checks, or financial calculations.

## 10. Security and Integration Boundary

Approved application flow:

```text
UI / Route Handler
        ->
Server Application Service or Command Adapter
        ->
Generated Supabase Client / Approved RPC
        ->
Controlled Database Mutation
```

No approved Batch may bypass:

- Authentication.
- Authorization.
- Organization and clinic isolation.
- Transition validation.
- Optimistic version checks.
- Idempotency controls.
- Audit or immutable workflow-event creation.

Client code must not use service-role credentials or directly mutate protected Claim state tables.

## 11. Error and Type Contract

Each mutation Batch must normalize verified failures into stable application categories, including where applicable:

```text
unauthenticated
forbidden
tenant_mismatch
not_found
invalid_transition
stale_version
duplicate_event_or_idempotent_replay
validation_failure
unexpected_database_failure
```

Do not invent database error codes. Map only verified repository behavior.

Generated database enums and rows remain the database type source of truth. Generated `unknown` RPC values must be validated in an isolated server boundary before conversion to application domain types.

Unsafe broad casts are prohibited. Nullable rows and RPC empty-result behavior must be handled explicitly.

## 12. Batch Approval Gate

A Batch may begin implementation only when all are true:

```text
Master Contract Status: APPROVED
Batch Contract Status: APPROVED
Batch Implementation Authorization: YES
Prior Dependencies: COMPLETE
Exact File Allowlist: CONFIRMED
Required Tests and Commands: APPROVED
Working Tree: CLEAN
```

Required reviewers:

- Product Owner
- Claim Domain Owner
- Application Architect
- Security Reviewer
- QA Lead

If any condition is missing:

```text
RESULT: BLOCKED
REASON: PHASE 5 BATCH NOT AUTHORIZED
```

## 13. Validation Strategy

Use repository-supported commands only.

Minimum Batch validation sequence:

1. Run explicit Vitest files covering changed behavior.
2. Run required feature regression tests.
3. Run TypeScript validation.
4. Run lint.
5. Run build when the Batch changes production TypeScript or UI behavior.
6. Inspect the final diff and working tree.

Approved command forms:

```powershell
npx vitest run <exact-test-paths>
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git diff --stat
git diff --name-only
git status --short
```

`npm test` is not approved because the current `package.json` has no `test` script.

Database validation is required only for a separately approved task that changes database behavior or regenerates types:

```powershell
npx supabase db reset
npx supabase db lint
npx supabase test db
```

Do not claim PASS for commands not executed successfully.

## 14. Prohibited Scope

This Master Contract does not authorize:

- Application implementation.
- Database migrations or edits to closed Phase 4 migrations.
- Database enum, state, transition, permission, or RPC changes.
- Manual generated-type edits.
- Generated-type regeneration.
- Legacy `claims.status` removal.
- Client-side authoritative mutation.
- Payer webhook integration.
- Deployment or production release.
- Broad dashboard redesign.
- Refactoring outside an approved Batch allowlist.
- Weakening, deleting, or skipping existing tests.

## 15. Pending Batch Decisions

| Decision | Approved planning direction | Required owner |
| --- | --- | --- |
| Patient Claims compatibility status | Retain only through a named non-authoritative adapter when required | Product Owner / Application Architect |
| Independent filter UX | Separate workflow, decision, payment, and readiness filters | Product Owner / UX |
| Readiness terminology | Use explicit feature-consistent readiness names | Product Owner / Claim Domain Owner |
| Payer Rules cutover depth | Presentation reconciliation only unless separately approved | Product Owner |
| Generated-type regeneration | Not required unless repository evidence proves a mismatch | Database Architect / Backend Lead |

These decisions must be closed in the applicable Batch contract. They do not authorize implementation and do not block this Master Contract approval.

## 16. Approved Sequence

```text
1. Phase 5 Master Contract evidence review and approval closure — COMPLETE
2. Define Batch A exact contract and allowlist
3. Approve and authorize Batch A
4. Implement, validate, and close Batch A
5. Define, approve, implement, validate, and close Batch B
6. Define, approve, implement, validate, and close Batch C
7. Run final Phase 5 regression
8. Create Phase 5 closure-readiness record
9. Obtain separate deployment/release authorization
```

## 17. Approval Record

| Field | Decision |
| --- | --- |
| Evidence Review | PASS |
| Master Contract | APPROVED |
| Master Contract Blocking Decisions | 0 |
| Batch-Level Pending Decisions | 5 |
| Application Implementation | NOT AUTHORIZED |
| Database or Migration Changes | NOT AUTHORIZED |
| Generated-Type Changes | NOT AUTHORIZED |
| Batch A Authorization | NO |
| Batch B Authorization | NO |
| Batch C Authorization | NO |
| Approval Date | 2026-07-24 |
| Required Review Roles | Product Owner, Claim Domain Owner, Application Architect, Security Reviewer, QA Lead |

Approval means the planning boundary is evidence-based and may be used to create Batch contracts. It does not mean the listed reviewer roles have provided external organizational sign-off unless separately recorded by the Product Owner.

## 18. Final Record

```text
Document: PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT
State: FINAL
Contract Status: APPROVED
Evidence Review: PASS
Approval Scope: MASTER CONTRACT ONLY
Implementation Authorization: NO
Parent Closure: PHASE-4-CLOSURE-RECORD
Application Changes Authorized: NO
Database Changes Authorized: NO
Migration Changes Authorized: NO
Generated-Type Changes Authorized: NO

Next Authorized Task:
PHASE 5 — BATCH A CONTRACT DEFINITION

Next Task Scope:
Documentation and repository evidence review only.
No implementation until Batch A is separately APPROVED and explicitly AUTHORIZED.
```
