---

document_id: PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT
project: Med AI NexSure
phase: 5
contract_type: APPLICATION_INTEGRATION
record_state: DRAFT
contract_status: PROPOSED
implementation_authorization: NO
created_date: 2026-07-24
branch: main
parent_closure: docs/database/PHASE-4-CLOSURE-RECORD.md
required_prior_closure: PHASE-4-CLOSURE-RECORD
database_changes_authorized: NO
migration_changes_authorized: NO
generated_type_regeneration_authorized: NO
generated_type_manual_edit_authorized: NO
application_changes_authorized: NO
master_contract_blocking_decisions: 0
batch_approval_pending_decisions: 5
-----------------------------------

# Phase 5 — Claim Application Integration Contract

## 1. Contract Decision

```text
Record State: DRAFT
Contract Status: PROPOSED
Implementation Authorization: NO

Application Changes: NOT AUTHORIZED
Database Changes: NOT AUTHORIZED
Migration Changes: NOT AUTHORIZED
Generated-Type Regeneration: NOT AUTHORIZED
Manual Generated-Type Editing: NOT AUTHORIZED
```

This document defines the proposed Phase 5 planning boundary only.

No Agent may implement Phase 5 from this draft.

Master Contract approval does not authorize an individual Batch. Each Batch requires its own explicit approval, implementation authorization, confirmed file allowlist, test scope, and completion gate.

## 2. Objective

Integrate the completed Phase 4 Claim split-state model into Med AI NexSure application types, server adapters, filters, KPIs, and UI presentation without recreating one overloaded Claim status.

Authoritative state dimensions:

```text
workflow_status → Claim lifecycle
decision_status → adjudication outcome
payment_status  → financial settlement
```

Separate application concepts:

```text
claim readiness
evidence completeness
submission readiness
payer-rule review
visit readiness
presentation grouping
```

These concepts must not be merged or treated as equivalent.

## 3. Dependency and Authority

Phase 5 depends on the formally closed Phase 4 baseline:

```text
Phase 4: CLOSED
Required Batches: 7/7 COMPLETE
Validation: 26 files / 663 tests / PASS
Further Phase 4 Implementation: NOT AUTHORIZED
```

Phase 5 must not modify closed Phase 4 migrations or database contracts.

Source-of-truth precedence:

1. Validated Phase 4 schema and controlled RPC contracts
2. Approved Phase 5 Batch contract
3. Generated Supabase types
4. Server validation adapters
5. Domain application types
6. UI presentation models
7. Mock data

When sources conflict, stop and report the evidence conflict. Do not resolve it by assumption.

## 4. Repository Evidence Gate

Before approving any Batch, inspect and record exact repository paths for:

* Generated Claim tables, enums, and RPC signatures
* Patient Claims types, mappers, queries, filters, KPIs, and UI consumers
* Existing server-only controlled mutation services
* Claim Readiness fields using `claimStatus`
* Payer Rules mixed-status presentation
* Relevant tests and repository validation scripts

The Batch allowlist must be derived from confirmed consumers, not estimated from naming or folder structure.

Broad `string` or `unknown` generated fields must be validated through application adapters. They must not be manually corrected in `lib/database.types.ts`.

## 5. Cross-Cutting Rules

All approved Phase 5 Batches must:

* Preserve independent workflow, decision, payment, and readiness semantics
* Keep generated database types read-only
* Validate raw rows and RPC results at server adapter boundaries
* Fail closed for unsupported values used by mutations, permissions, KPIs, decisions, or financial behavior
* Render unsupported read-only values as controlled `unknown` or `unavailable`
* Never default an unknown decision or payment state
* Preserve organization and clinic isolation
* Preserve server-only controlled mutation access
* Never accept actor identity from request payloads
* Never trust tenant identifiers without server verification
* Never duplicate database transition or authorization rules in client code
* Never write derived compatibility status back to the database
* Preserve human authority over Claim and financial decisions
* Preserve English-first and Thai-support UI conventions

Phase 5 must not change RPC signatures, transition semantics, permissions, database states, or direct-write protections.

## 6. Proposed Batches

### Batch A — Patient Claims Canonical Cutover

**Objective**

Replace authoritative use of derived `claimStatus` in Patient Claims with independent workflow, decision, payment, and readiness fields.

**Proposed allowlist**

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
```

This allowlist is provisional until all repository consumers of `claimStatus` are confirmed.

**Required outcomes**

* Domain DTOs expose independent canonical states
* Filters are dimension-specific
* KPI calculations do not equate approved with paid
* UI may show independent workflow, decision, payment, and readiness badges
* Unsupported states are handled safely
* Existing controlled mutation behavior is unchanged
* Compatibility status is removed or isolated in an explicitly named adapter
* No migration, RPC, or generated-type change

**Required tests**

* Canonical mapping for all three state dimensions
* Unsupported state handling
* Independent filters and KPIs
* Approved but unpaid
* Closed but unpaid
* Rejected and unpaid
* Partially approved and partially paid
* Compatibility behavior, when retained
* Mutation-service non-regression

### Batch B — Claim Readiness Naming Reconciliation

**Objective**

Rename application fields called `claimStatus` when they represent readiness, evidence completeness, or submission preparedness.

**Candidate areas**

```text
features/executive-dashboard
features/visit-list
features/departments
```

Exact paths and names must be confirmed through repository evidence before approval.

**Required outcomes**

* Readiness terminology is domain-accurate
* Existing readiness calculations and dashboard totals remain unchanged
* Mock and production naming remain aligned
* No mapping to workflow, decision, or payment state
* No database or mutation change

### Batch C — Payer Rules Status Reconciliation

**Objective**

Remove mixed workflow, readiness, decision, and payment values from one Payer Rules status model.

**Required outcomes**

* Status dimensions are modeled independently where evidence supports them
* Mock data identifies each status domain explicitly
* Approved does not imply paid
* Submitted does not imply ready
* Payer-rule logic remains unchanged
* No production database integration is implied
* No mutation behavior is added

## 7. Compatibility Governance

A temporary compatibility path is permitted only when its Batch contract records:

* Compatibility field or adapter
* Reason retained
* Affected consumers
* Owner
* Required tests
* Removal or review condition
* Target Batch or phase for removal

Compatibility fields must remain display, URL-translation, mock, or temporary fixture concerns only.

They must not control authoritative writes, decisions, payments, permissions, or financial calculations.

## 8. Batch Approval Gate

A Batch may begin implementation only when all are true:

```text
Master Contract Status: APPROVED
Batch Contract Status: APPROVED
Batch Implementation Authorization: YES
Prior Dependencies: COMPLETE
Exact File Allowlist: CONFIRMED
Required Tests: APPROVED
Working Tree: CLEAN
```

Required reviewers:

* Product Owner
* Claim Domain Owner
* Application Architect
* Security Reviewer
* QA Lead

If any condition is missing:

```text
RESULT: BLOCKED
REASON: PHASE 5 BATCH NOT AUTHORIZED
```

Do not update approval fields automatically and do not implement a different Batch.

## 9. Validation Strategy

Use repository-defined commands only.

Run in this order:

1. Tests directly covering changed files
2. Required feature regression tests
3. `npx tsc --noEmit`
4. `npm run lint`
5. Approved broader test command
6. `npm run build`
7. Final diff inspection

Required Git validation:

```powershell
git diff --check
git diff --stat
git diff --name-only
git status --short
```

Database validation is required only when a separately approved task regenerates types or changes database behavior:

```powershell
npx supabase db reset
npx supabase db lint
npx supabase test db
```

Do not claim PASS for commands not executed successfully.

## 10. Prohibited Scope

This Master Contract does not authorize:

* Application implementation
* Database migrations or Phase 4 migration edits
* Database enum, status, transition, permission, or RPC changes
* Manual generated-type edits
* Generated-type regeneration
* Legacy `claims.status` removal
* Client-side authoritative mutation
* Payer webhook integration
* Deployment or production release
* Broad dashboard redesign
* Refactoring outside an approved Batch allowlist

## 11. Pending Batch Decisions

These decisions do not block Master Contract definition but must be closed before the relevant Batch is Approved:

| Decision                            | Proposed direction                                          | Owner                                 |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| Patient Claims compatibility status | Retain only through a temporary named adapter when required | Product Owner / Application Architect |
| Independent filter UX               | Separate workflow, decision, payment, and readiness filters | Product Owner / UX                    |
| Readiness terminology               | Use explicit feature-consistent readiness names             | Product Owner / Domain Owner          |
| Payer Rules cutover depth           | Presentation reconciliation only unless separately approved | Product Owner                         |
| Generated-type regeneration         | Not required unless repository evidence proves a mismatch   | Database Architect / Backend Lead     |

## 12. Proposed Sequence

```text
1. Complete repository evidence review
2. Close pending Master Contract findings
3. Approve Phase 5 Master Contract
4. Define and approve Batch A
5. Implement and close Batch A
6. Define and approve Batch B
7. Implement and close Batch B
8. Define and approve Batch C
9. Implement and close Batch C
10. Run final Phase 5 regression
11. Create Phase 5 closure-readiness record
```

## 13. Required Implementation Report

Each authorized Batch must report:

* Contract and approval evidence
* Exact files inspected and changed
* Canonical behavior introduced
* Compatibility behavior retained
* Security boundaries preserved
* Commands executed and exact results
* Final diff and Git status
* Remaining risks
* Confirmation that no migration or generated type was manually edited

## 14. Final Record

```text
Document: PHASE-5-CLAIM-APPLICATION-INTEGRATION-CONTRACT
State: DRAFT
Contract Status: PROPOSED
Implementation Authorization: NO
Parent Closure: PHASE-4-CLOSURE-RECORD
Application Changes Authorized: NO
Database Changes Authorized: NO

Recommended Next Task:
PHASE 5 — CONTRACT EVIDENCE REVIEW AND APPROVAL CLOSURE
```

No Agent may begin implementation from this document.
