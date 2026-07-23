# Phase 4 Claim Migration Plan

> **For agentic workers:** Implement this plan task-by-task. Use test-first validation, review each migration independently, and do not proceed past an approval or validation gate that has not passed.

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure |
| Document | Phase 4 Claim Migration Plan |
| File | `docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md` |
| Phase | Phase 4 - Claim Architecture |
| Version | 0.1 |
| Plan status | Ready for Review |
| Implementation status | Not Started |
| Created date | 2026-07-22 |
| Last updated | 2026-07-22 |
| Repository branch | `main` |
| Approval basis | ADR-001 through ADR-008 approved by Project Owner / Product Owner |
| ADR approval evidence | Satisfied |
| ADR approval date | 2026-07-22 |
| ADR approval authority | Project Owner / Product Owner |
| Migration readiness | NOT READY - ADR approval is satisfied, but remaining technical P1 gates require verification before migration execution |
| Required reviewers | Product Owner, Claim Domain Owner, Database Architect, Security Lead, Finance Owner, Integration Owner, Backend Lead, QA Lead |
| Execution gate | Do not execute migrations until remaining technical P1 dependencies are recorded and repository baseline validation passes |

## 2. Goal

Migrate the current overloaded Claim status model into independent workflow, payer-decision, and payment state domains without losing tenant isolation, auditability, financial integrity, backward compatibility, or existing Claim history.

## 3. Architecture Summary

Phase 4 uses additive, forward-only PostgreSQL migrations. The existing `claims.status` column remains temporarily for compatibility while new state snapshots and authoritative domain records are introduced or strengthened.

The target model separates:

- `claims.workflow_status`
- `claims.decision_status`
- `claims.payment_status`
- Claim readiness and evidence status
- Authoritative `claim_decisions`
- Authoritative payment, allocation, and reconciliation records
- Dedicated formal Appeal records
- Controlled workflow, decision, payment, refund, reversal, reopen, and appeal operations

No generic Claim update path may authoritatively mutate payer decisions, payments, refunds, reversals, formal appeals, or terminal-state reopen transitions.

## 4. Approved ADR Direction

| ADR | Approved Direction Applied by This Plan |
| --- | --- |
| ADR-001 | `closed` means operational completion. Payment state remains independent. |
| ADR-002 | Every formal appeal requires a dedicated Appeal record. `workflow_status = appealed` is a summary only. |
| ADR-003 | Payment transactions are authoritative. Payment failure is in MVP. Refund and reversal must be distinguishable and supported before production. |
| ADR-004 | Phase 4 MVP uses `claim_decisions` plus existing item adjustments. Dedicated `claim_line_decisions` is deferred to a separately approved work package. |
| ADR-005 | Terminal Claims cannot be reopened by generic update. Reopen requires a dedicated elevated operation. Post-submission correction prefers linked revision or resubmission. |
| ADR-006 | Trusted payer integration is the primary decision authority. Authorized human adjudication is a controlled fallback. AI remains recommendation only. |
| ADR-007 | Payment/reconciliation integration is the primary financial authority. Authorized Finance is a controlled fallback. |
| ADR-008 | Legacy `claims.status` retirement is staged. Immediate removal and indefinite dual-write are prohibited. |

## 5. Global Constraints

1. PostgreSQL and Supabase migrations must be forward-only.
2. Use UUID primary keys with `gen_random_uuid()`.
3. Preserve `organization_id` and `clinic_id` on all Claim-domain records.
4. Use tenant-safe composite foreign keys where the current repository pattern requires them.
5. Use exact numeric types for financial amounts.
6. One Claim uses one approved currency in Phase 4 MVP.
7. AI is Decision Support only.
8. Do not bypass RLS for authenticated application workflows.
9. Service-role functions must be contained behind secure domain operations.
10. Every material mutation must preserve actor, source, reason, timestamp, version, and audit evidence.
11. Duplicate or out-of-order external events must not corrupt current state.
12. Do not remove `claims.status` in the initial Phase 4 migration.
13. Do not introduce `claim_line_decisions` in the initial Phase 4 migration.
14. Do not create a second payment source of truth.
15. No production deployment until database tests, TypeScript generation, application validation, and rollback-forward checks pass.

## 6. Preconditions and Entry Gate

The implementation lead must verify and record all items below before creating the first migration.

| ID | Required Evidence | Pass Condition |
| --- | --- | --- |
| GATE-001 | ADR approval evidence | Satisfied - ADR-001 through ADR-008 are approved by Project Owner / Product Owner on 2026-07-22 |
| GATE-002 | Payment source of truth | Existing `claim_payments`, allocations, and reconciliations require implementation-time verification before migration execution |
| GATE-003 | Decision authority | Approved direction recorded; payer integration identity, manual fallback controls, and event strategy require technical verification |
| GATE-004 | Payment authority | Approved direction recorded; payment integration identity, Finance fallback controls, refund/reversal permissions, and reconciliation rules require technical verification |
| GATE-005 | External event strategy | Stable external event ID, idempotency key, source timestamp, and ordering rules remain required before migration execution |
| GATE-006 | Currency rules | Claim currency, numeric scale, rounding, reconciliation tolerance, and refund ceiling remain required before migration execution |
| GATE-007 | Appeal scope | Approved direction recorded; formal Appeal minimum fields, permissions, RLS, and operation design require technical verification |
| GATE-008 | Reopen rules | Approved direction recorded; allowed source/target states, time limits, and revision rules require technical verification |
| GATE-009 | Repository baseline | Local Supabase starts successfully and Phase 3 regression tests pass |
| GATE-010 | Working tree | `git status --short` is clean before migration work begins |

Recommended validation commands:

```powershell
git status --short
npx supabase status
npx supabase db lint
npx tsc --noEmit
npm run lint
```

Expected entry result:

```text
No schema errors found
TypeScript validation passes
Existing Phase 3 database tests pass
Working tree clean
```

## 7. Current-to-Target State Model

### 7.1 Workflow Status

Target values:

```text
draft
collecting_data
validation_pending
needs_review
ready_to_submit
submitted
under_review
appealed
closed
cancelled
```

Rules:

- `closed` is operational completion only.
- `appealed` requires a dedicated formal Appeal record.
- `cancelled` does not automatically void a payer decision.
- Generic Claim update cannot reopen `closed` or `cancelled`.
- Workflow changes do not write payment status.
- Workflow changes do not create or overwrite payer decisions.

### 7.2 Decision Status

Target values:

```text
not_decided
approved
partially_approved
rejected
request_information
voided
```

Rules:

- `claim_decisions` remains authoritative.
- `claims.current_decision_id` points to the effective decision.
- `claims.decision_status` is a synchronized current snapshot.
- Decision lifecycle status such as `draft`, `final`, `superseded`, and `cancelled` remains separate from decision outcome.
- AI cannot authoritatively set decision status.
- Generic Claim update cannot authoritatively set decision status.

### 7.3 Payment Status

Target values:

```text
not_paid
payment_pending
partially_paid
paid
payment_failed
partially_refunded
refunded
reversed
```

Rules:

- Payment tables and reconciliation records are authoritative.
- Claim payment status is derived or transactionally synchronized.
- A refund never overwrites the original successful payment.
- A reversal preserves the original transaction and reversal reason.
- Duplicate external events cannot double-count.
- Payment mutation requires approved currency and amount validation.
- AI and generic Claim update cannot set financial state.

## 8. Legacy Status Mapping

The backfill must use explicit deterministic mapping. Unmapped values must fail validation and must not be silently coerced.

| Legacy `claims.status` | Target Workflow | Target Decision | Target Payment | Mapping Notes |
| --- | --- | --- | --- | --- |
| `draft` | `draft` | `not_decided` | derive from payment records | No payer decision implied |
| `collecting_evidence` | `collecting_data` | `not_decided` | derive | Evidence collection remains separate |
| `pending_validation` | `validation_pending` | `not_decided` | derive | No payer decision implied |
| `validation_failed` | `needs_review` | `not_decided` | derive | Preserve validation evidence |
| `needs_information` | `needs_review` | `request_information` only when authoritative final decision exists; otherwise `not_decided` | derive | Do not fabricate payer outcome |
| `ready_for_submission` | `ready_to_submit` | `not_decided` | derive | Submission readiness only |
| `submitted` | `submitted` | `not_decided` | derive | Submission does not imply review |
| `submission_failed` | `needs_review` | `not_decided` | derive | Preserve submission error |
| `under_review` | `under_review` | `not_decided` | derive | Payer review in progress |
| `pending_medical_review` | `under_review` | `not_decided` | derive | Preserve review reason separately |
| `pending_claim_assessor` | `under_review` | `not_decided` | derive | Preserve queue/owner separately |
| `approved` | derive workflow from history; default `under_review` until verified | `approved` only when final authoritative decision exists | derive | Never infer from legacy value alone without decision evidence |
| `partially_approved` | derive workflow from history; default `under_review` until verified | `partially_approved` only when final authoritative decision exists | derive | Amount validation required |
| `rejected` | derive workflow from history; default `under_review` until verified | `rejected` only when final authoritative decision exists | derive | Preserve reason codes |
| `payment_pending` | derive workflow | derive from current decision | `payment_pending` only when transaction/reconciliation evidence supports it | No decision inference |
| `partially_paid` | derive workflow | derive | `partially_paid` from authoritative payment totals | Validate amount consistency |
| `paid` | derive workflow | derive | `paid` from authoritative payment totals | Never trust legacy value alone |
| `cancelled` | `cancelled` | derive from decision history | derive from payment records | Cancellation does not imply void/refund |
| `closed` | `closed` | derive | derive | Operational closure only |

Backfill policy:

1. Prefer authoritative domain records over legacy status.
2. Use current final `claim_decisions` for decision snapshot.
3. Use payment transactions, allocations, and reconciliations for payment snapshot.
4. Use verified workflow history where authority is confirmed.
5. Place ambiguous rows in a migration exception report.
6. Do not invent `approved`, `paid`, `refunded`, `reversed`, or `voided`.
7. Block cutover while any unmapped or contradictory Claim remains unresolved.

## 9. Proposed Migration Files

Create migrations in this order.

| Sequence | File | Responsibility |
| --- | --- | --- |
| 1 | `supabase/migrations/20260722140000_phase4_claim_state_types.sql` | Create new workflow, decision, payment, event-source, refund/reversal, and appeal enums or validated domains |
| 2 | `supabase/migrations/20260722140100_phase4_claim_state_columns.sql` | Add new Claim snapshot columns, versioning metadata, currency rules, and required indexes |
| 3 | `supabase/migrations/20260722140200_phase4_claim_workflow_events.sql` | Create or normalize authoritative workflow-event history and transition constraints |
| 4 | `supabase/migrations/20260722140300_phase4_claim_appeals.sql` | Add dedicated formal Appeal records, tenant-safe foreign keys, indexes, RLS, and audit support |
| 5 | `supabase/migrations/20260722140400_phase4_claim_payment_extensions.sql` | Extend existing payment model for failure, refund, reversal, event identity, currency consistency, and reconciliation integrity |
| 6 | `supabase/migrations/20260722140500_phase4_claim_controlled_operations.sql` | Add controlled workflow, close, reopen, appeal, payer-decision, payment, refund, and reversal operations |
| 7 | `supabase/migrations/20260722140600_phase4_claim_rbac_rls.sql` | Add permissions, grants, policy changes, protected-column controls, and service-role containment |
| 8 | `supabase/migrations/20260722140700_phase4_claim_state_backfill.sql` | Backfill new snapshots using authoritative records and record migration exceptions |
| 9 | `supabase/migrations/20260722140800_phase4_claim_legacy_compatibility.sql` | Add compatibility views/functions and prohibit uncontrolled legacy writes after cutover |
| 10 | `supabase/migrations/20260722140900_phase4_claim_validation_guards.sql` | Add consistency assertions, invariant checks, and post-backfill validation functions |

Do not create the legacy-column removal migration during the initial Phase 4 delivery.

## 10. Target Schema Changes

### 10.1 `claims`

Add:

```sql
workflow_status
decision_status
payment_status
state_version
state_updated_at
state_updated_by
currency_code
legacy_status_migration_state
```

Required properties:

- `workflow_status` is not null after backfill.
- `decision_status` is not null after backfill.
- `payment_status` is not null after backfill.
- `state_version` starts at `1` and increments on controlled state changes.
- `currency_code` follows approved MVP currency rules.
- Existing `version` behavior must be reconciled with `state_version`; do not create conflicting optimistic-lock semantics.
- Add selective indexes for tenant queues and state filtering.
- Do not allow generic authenticated updates to protected state columns.

Recommended indexes:

```text
(organization_id, workflow_status, deleted_at)
(organization_id, clinic_id, workflow_status, deleted_at)
(organization_id, decision_status, deleted_at)
(organization_id, payment_status, deleted_at)
(organization_id, submitted_at)
(current_decision_id)
```

### 10.2 Workflow Events

Use an existing authoritative Claim workflow-history table if repository verification proves it is complete. Otherwise create a dedicated successor.

Minimum fields:

```text
id
organization_id
clinic_id
claim_id
from_workflow_status
to_workflow_status
event_type
event_source
external_event_id
idempotency_key
reason_code
reason_text
actor_user_id
occurred_at
received_at
expected_version
resulting_version
metadata
created_at
```

Constraints:

- Tenant-safe Claim reference.
- Unique external event identity per integration source where supplied.
- Unique idempotency key per operation scope.
- No PHI/PII in unrestricted metadata.
- `from_workflow_status` may be null only for initial state creation.
- Event records are append-only for authenticated users.

### 10.3 Formal Appeals

Create `claim_appeals` with minimum fields:

```text
id
organization_id
clinic_id
claim_id
appeal_sequence
appeal_status
appeal_reason_code
appeal_reason_text
submitted_by
submitted_at
deadline_at
owner_user_id
payer_reference
external_event_id
evidence_package_id
outcome_decision_id
resolved_at
created_at
created_by
updated_at
updated_by
deleted_at
```

Minimum appeal statuses:

```text
draft
submitted
under_review
request_information
approved
partially_approved
rejected
withdrawn
closed
```

Rules:

- Every formal appeal has one record.
- `(claim_id, appeal_sequence)` is unique within tenant scope.
- Appeal outcome references an authoritative Claim decision when applicable.
- Multi-level automated appeals remain deferred.
- Cross-tenant and unauthorized cross-clinic access is denied.

### 10.4 Payment Extensions

Reuse existing payment tables.

Add or verify:

```text
transaction_type
transaction_status
original_payment_id
external_event_id
idempotency_key
source_system
source_occurred_at
failure_code
failure_message
reversal_reason_code
refund_reason_code
currency_code
effective_at
```

Recommended transaction types:

```text
payment
refund
reversal
adjustment
```

Recommended transaction statuses:

```text
pending
succeeded
failed
reversed
cancelled
```

Financial rules:

- Amounts use exact numeric types.
- Refund amount cannot exceed refundable settled amount.
- Reversal must reference the original transaction.
- Claim, payment, allocation, refund, reversal, and reconciliation currency must match.
- Duplicate event processing returns the existing result or performs a no-op.
- Financial totals are reproducible from authoritative transactions.

## 11. Controlled Operations

The exact function names may follow existing repository conventions, but the implementation must provide one controlled operation for each authority boundary.

| Operation | Required Permission | Core Behavior |
| --- | --- | --- |
| Transition workflow | `claim.transition` or approved equivalent | Validate transition, tenant, clinic, version, reason, actor, event identity |
| Close Claim | `claim.close` | Set workflow only; never set decision or payment |
| Reopen Claim | `claim.reopen` | Elevated action; preserve decision/payment history; enforce reason and approved target |
| Submit formal Appeal | `claim.appeal.submit` | Create Appeal record and workflow event atomically |
| Resolve Appeal | `claim.appeal.decide` | Link authoritative decision and update Appeal summary |
| Record payer decision | `claim.decide` | Create/finalize decision, update pointer and snapshot atomically |
| Supersede decision | `claim.decision.supersede` | Preserve prior decision; update current pointer safely |
| Record payment | `claim.payment.record` | Insert authoritative transaction; update summary atomically |
| Record refund | `claim.payment.refund` | Reference original payment; enforce refund ceiling |
| Record reversal | `claim.payment.reverse` | Preserve original transaction; record reason and source |
| Reconcile payment | `claim.payment.reconcile` | Validate allocation, currency, variance, and reconciliation evidence |

Every controlled operation must:

1. Resolve actor from authenticated context or approved integration context.
2. Validate organization and clinic scope.
3. Validate explicit permission.
4. Validate expected version.
5. Validate idempotency and external event identity.
6. Reject unsupported transitions.
7. Write authoritative records first.
8. Synchronize current snapshots in the same transaction.
9. Write audit and workflow evidence.
10. Return sanitized errors without leaking cross-tenant existence.

## 12. RBAC and RLS Plan

### 12.1 Permission Inventory

Add only permissions not already present:

```text
claim.transition
claim.close
claim.reopen
claim.appeal.view
claim.appeal.create
claim.appeal.submit
claim.appeal.decide
claim.decide
claim.decision.supersede
claim.payment.view
claim.payment.record
claim.payment.refund
claim.payment.reverse
claim.payment.reconcile
```

Before insertion, inspect existing permission codes and reuse exact existing names where equivalent.

### 12.2 RLS Requirements

For every new table:

- Enable RLS.
- Enforce active organization membership.
- Enforce clinic access where `clinic_id` is populated.
- Exclude soft-deleted rows from normal access.
- Separate read permission from write permission.
- Prevent generic Claim editors from mutating protected columns.
- Restrict formal Appeal and financial records to least-privilege roles.
- Deny cross-tenant references through both policy and foreign-key design.
- Add `WITH CHECK` rules for every authenticated insert/update.
- Keep service-role-only functions non-executable by authenticated users unless wrapped securely.

### 12.3 Protected Claim Columns

Authenticated generic update paths must not directly change:

```text
workflow_status
decision_status
payment_status
current_decision_id
total_paid_amount
submitted_at
closed_at
state_version
state_updated_at
state_updated_by
currency_code
```

Authorized changes must occur through controlled operations.

## 13. Backfill Procedure

### Stage 1: Snapshot

- Export row counts by organization and legacy status.
- Record counts of final Claim decisions.
- Record counts and totals of payments, allocations, and reconciliations.
- Record Claims with missing tenant or clinic consistency.
- Record Claims with conflicting decision pointers.
- Record Claims with currency inconsistency.

### Stage 2: Decision Backfill

For each active Claim:

1. Resolve effective final decision through `current_decision_id` and final decision records.
2. Validate tenant-safe pointer.
3. Map decision outcome to target snapshot.
4. Set `not_decided` when no authoritative final decision exists.
5. Record conflicting or multiple-effective decisions as exceptions.

### Stage 3: Payment Backfill

For each active Claim:

1. Aggregate successful authoritative payments.
2. Subtract valid refunds and reversals only when implemented and evidenced.
3. Compare against allocation and reconciliation data.
4. Derive payment snapshot.
5. Reject negative impossible totals.
6. Record duplicate references, currency mismatch, or reconciliation variance as exceptions.

### Stage 4: Workflow Backfill

1. Use verified authoritative workflow history where available.
2. Otherwise map from legacy status using the approved mapping.
3. Use decision/payment records only to detect contradictions, not to fabricate workflow state.
4. Preserve `closed` as operational closure.
5. Require a formal Appeal record before finalizing `appealed`.

### Stage 5: Validation

The migration must produce a machine-queryable exception report containing:

```text
organization_id
clinic_id
claim_id
legacy_status
proposed_workflow_status
proposed_decision_status
proposed_payment_status
exception_code
exception_detail
detected_at
resolved_at
resolved_by
```

Cutover is blocked while unresolved P0/P1 exceptions remain.

## 14. Compatibility and Cutover Strategy

### Release A: Additive Database Model

- Add enums/domains, columns, tables, indexes, and operations.
- Keep existing application reads and writes unchanged.
- Backfill in a controlled environment.
- Validate invariants.

### Release B: Compatible Reads

- Generate updated TypeScript database types.
- Add backend DTOs exposing separate workflow, decision, and payment state.
- Preserve legacy status in compatibility response where required.
- Update internal dashboards to read the new fields behind a controlled rollout.

### Release C: Controlled Writes

- Switch workflow writes to controlled transition operations.
- Switch decision writes to decision operations.
- Switch payment writes to payment/reconciliation operations.
- Block protected-column updates from generic Claim update.
- Stop application writes to legacy `claims.status`.

### Release D: Frontend and Reporting Cutover

- Display workflow, decision, and payment separately.
- Rename readiness fields that are incorrectly presented as Claim status.
- Split mixed filters such as Draft/Approved/Paid into domain-specific filters.
- Update exports, dashboards, queue metrics, and audit screens.
- Monitor mismatch reports.

### Release E: Legacy Deprecation

- Mark `claims.status` deprecated and read-only.
- Remove backend/frontend dependencies.
- Validate zero legacy writes over an approved observation window.
- Create a later separately approved migration to remove the column and obsolete enum.

## 15. Application Impact Plan

Expected application areas to inspect and update:

```text
generated database types
Claim repository/service layer
Claim API routes or server actions
Claim workflow commands
Claim decision commands
Payment and reconciliation services
Claim list filters
Payer detail filters
Claim readiness UI
Claim detail UI
Executive and operational dashboards
Audit and compliance views
Test fixtures and mocks
```

Rules:

- Do not replace readiness status with workflow status.
- Do not show `approved` as a workflow stage.
- Do not show `paid` as a workflow stage.
- UI must label each domain explicitly.
- API contracts must not expose one ambiguous `status` as the only state.
- Compatibility DTOs must have a retirement date and owner.

## 16. Test Strategy

A separate `docs/database/PHASE-4-CLAIM-TEST-PLAN.md` must provide detailed test cases. At minimum, implementation must cover:

### Schema and Migration

- New migrations apply from a clean local database.
- New migrations apply over the current Phase 3 schema.
- Backfill is deterministic and idempotent.
- No unmapped legacy status remains.
- No invalid enum value is introduced.
- Generated database types compile.

### Workflow

- Valid transitions pass.
- Invalid transitions fail.
- Closure does not set payment.
- Closure does not create a payer decision.
- Reopen requires elevated permission, reason, and expected version.
- Generic update cannot reopen terminal Claims.
- Formal appeal creates an Appeal record and workflow event atomically.

### Decision

- Only trusted integration or authorized adjudicator can finalize decisions.
- Generic editor and AI cannot finalize decisions.
- Duplicate payer events do not duplicate decisions.
- Out-of-order decisions cannot replace a newer effective decision.
- Supersession preserves prior history.
- Current pointer and snapshot match the authoritative decision.

### Payment

- Duplicate payment event does not double-count.
- Failed payment does not increase paid total.
- Refund preserves original payment.
- Refund ceiling is enforced.
- Reversal preserves original transaction.
- Currency mismatch fails.
- Reconciliation variance follows approved tolerance.
- Claim payment summary equals authoritative records.

### Security

- Cross-organization access fails.
- Unauthorized cross-clinic access fails.
- Self-scoped roles cannot use elevated operations.
- `WITH CHECK` prevents tenant reassignment.
- Protected Claim columns cannot be updated directly.
- Service-role-only functions are not executable by authenticated users.

### Application

- TypeScript passes.
- Build passes.
- Existing Claim pages render.
- Workflow, decision, payment, readiness, and evidence labels remain separate.
- Legacy compatibility response is tested until retirement.

## 17. Validation Commands

Run from:

```powershell
cd D:\med-ai-nexsure-platform
```

Recommended sequence:

```powershell
git status --short
npx supabase start
npx supabase db reset
npx supabase db lint
npx supabase test db
npx supabase gen types typescript --local > lib/database.types.ts
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git status --short
```

Expected result:

```text
All database tests successful
No schema errors found
TypeScript validation passes
Lint contains no new blocking errors
Production build passes
Only intended files are modified
```

If the repository uses a different database test command, record the exact command and output in the Phase 4 validation report.

## 18. Rollback-Forward Strategy

Supabase/PostgreSQL migrations are treated as forward-only.

Do not rely on destructive rollback scripts in production. Correct failed or partially applied migrations with a new repair migration.

Required protections:

- Additive schema changes before constraints become mandatory.
- Backfill before setting `NOT NULL`.
- Validate data before adding strict constraints.
- Create indexes with deployment-safe strategy where supported.
- Preserve legacy status until all cutover gates pass.
- Preserve authoritative decision and payment history.
- Make backfill idempotent.
- Make external event handling idempotent.
- Store exception records for unresolved rows.
- Do not delete or rewrite financial transactions to repair summaries.

## 19. Migration Execution Tasks

### Task 1: Baseline and Approval Verification

**Files:**
- Modify: `docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md`
- Read: `docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md`
- Read: `docs/database/PHASE-4-CLAIM-IMPACT-ANALYSIS.md`
- Read: `docs/database/PHASE-3-VALIDATION-REPORT.md`

- [ ] Confirm ADR-001 through ADR-008 are approved.
- [ ] Record role-specific approval evidence.
- [ ] Confirm all P1 dependencies.
- [ ] Run Phase 3 regression baseline.
- [ ] Record baseline row counts and financial totals.
- [ ] Commit documentation evidence.

Suggested commit:

```powershell
git add docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md
git commit -m "docs(database): approve phase 4 claim migration baseline"
```

### Task 2: State Types and Claim Columns

**Files:**
- Create: `supabase/migrations/20260722140000_phase4_claim_state_types.sql`
- Create: `supabase/migrations/20260722140100_phase4_claim_state_columns.sql`
- Create: `supabase/tests/phase4_claim_state_schema_test.sql`

- [ ] Write failing schema tests.
- [ ] Create state types/domains.
- [ ] Add nullable snapshot columns and indexes.
- [ ] Add version and currency fields.
- [ ] Run schema tests.
- [ ] Run `npx supabase db lint`.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140000_phase4_claim_state_types.sql `
        supabase/migrations/20260722140100_phase4_claim_state_columns.sql `
        supabase/tests/phase4_claim_state_schema_test.sql
git commit -m "feat(claims): add phase 4 split state schema"
```

### Task 3: Workflow Events and Appeals

**Files:**
- Create: `supabase/migrations/20260722140200_phase4_claim_workflow_events.sql`
- Create: `supabase/migrations/20260722140300_phase4_claim_appeals.sql`
- Create: `supabase/tests/phase4_claim_workflow_test.sql`
- Create: `supabase/tests/phase4_claim_appeal_test.sql`

- [ ] Verify whether existing workflow history is authoritative.
- [ ] Extend or create one authoritative workflow-event structure.
- [ ] Add formal Appeal table.
- [ ] Add tenant-safe foreign keys and indexes.
- [ ] Add append-only and RLS tests.
- [ ] Verify every formal appeal produces a record.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140200_phase4_claim_workflow_events.sql `
        supabase/migrations/20260722140300_phase4_claim_appeals.sql `
        supabase/tests/phase4_claim_workflow_test.sql `
        supabase/tests/phase4_claim_appeal_test.sql
git commit -m "feat(claims): add workflow events and formal appeals"
```

### Task 4: Payment, Refund, and Reversal Extensions

**Files:**
- Create: `supabase/migrations/20260722140400_phase4_claim_payment_extensions.sql`
- Create: `supabase/tests/phase4_claim_payment_test.sql`
- Create: `supabase/tests/phase4_claim_payment_idempotency_test.sql`

- [ ] Write failing payment authority tests.
- [ ] Add or refine transaction type/status fields.
- [ ] Add original-payment reference.
- [ ] Add external event and idempotency constraints.
- [ ] Add currency consistency and refund ceiling rules.
- [ ] Test payment failure, partial payment, refund, and reversal.
- [ ] Test duplicate and out-of-order events.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140400_phase4_claim_payment_extensions.sql `
        supabase/tests/phase4_claim_payment_test.sql `
        supabase/tests/phase4_claim_payment_idempotency_test.sql
git commit -m "feat(claims): extend payment refund and reversal model"
```

### Task 5: Controlled Domain Operations

**Files:**
- Create: `supabase/migrations/20260722140500_phase4_claim_controlled_operations.sql`
- Create: `supabase/tests/phase4_claim_operations_test.sql`
- Create: `supabase/tests/phase4_claim_reopen_test.sql`
- Create: `supabase/tests/phase4_claim_decision_authority_test.sql`

- [ ] Write failing authority and transition tests.
- [ ] Add workflow transition operation.
- [ ] Add close and elevated reopen operations.
- [ ] Add secure payer-decision wrapper.
- [ ] Add payment/refund/reversal wrappers.
- [ ] Add appeal submit/resolve operations.
- [ ] Add expected-version and idempotency behavior.
- [ ] Run tests and commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140500_phase4_claim_controlled_operations.sql `
        supabase/tests/phase4_claim_operations_test.sql `
        supabase/tests/phase4_claim_reopen_test.sql `
        supabase/tests/phase4_claim_decision_authority_test.sql
git commit -m "feat(claims): add controlled claim state operations"
```

### Task 6: RBAC and RLS

**Files:**
- Create: `supabase/migrations/20260722140600_phase4_claim_rbac_rls.sql`
- Create: `supabase/tests/phase4_claim_permissions_test.sql`
- Create: `supabase/tests/phase4_claim_tenant_isolation_test.sql`
- Create: `supabase/tests/phase4_claim_protected_fields_test.sql`

- [ ] Inventory existing permission codes.
- [ ] Add only missing permissions.
- [ ] Add or update role mappings.
- [ ] Add RLS for workflow events and appeals.
- [ ] Protect Claim state and financial columns.
- [ ] Test tenant isolation and self scope.
- [ ] Test service-role containment.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140600_phase4_claim_rbac_rls.sql `
        supabase/tests/phase4_claim_permissions_test.sql `
        supabase/tests/phase4_claim_tenant_isolation_test.sql `
        supabase/tests/phase4_claim_protected_fields_test.sql
git commit -m "security(claims): enforce phase 4 authority and isolation"
```

### Task 7: Backfill and Validation Guards

**Files:**
- Create: `supabase/migrations/20260722140700_phase4_claim_state_backfill.sql`
- Create: `supabase/migrations/20260722140900_phase4_claim_validation_guards.sql`
- Create: `supabase/tests/phase4_claim_backfill_test.sql`
- Create: `supabase/tests/phase4_claim_consistency_test.sql`

- [ ] Create deterministic mapping tests.
- [ ] Create migration exception reporting.
- [ ] Backfill decision snapshot.
- [ ] Backfill payment snapshot.
- [ ] Backfill workflow snapshot.
- [ ] Add consistency validation functions.
- [ ] Validate zero unresolved blocking exceptions.
- [ ] Add `NOT NULL` constraints only after validation.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140700_phase4_claim_state_backfill.sql `
        supabase/migrations/20260722140900_phase4_claim_validation_guards.sql `
        supabase/tests/phase4_claim_backfill_test.sql `
        supabase/tests/phase4_claim_consistency_test.sql
git commit -m "feat(claims): backfill and validate split claim state"
```

### Task 8: Legacy Compatibility and Write Cutover

**Files:**
- Create: `supabase/migrations/20260722140800_phase4_claim_legacy_compatibility.sql`
- Modify: exact backend/API files discovered in the approved impact inventory
- Modify: `lib/database.types.ts`
- Create or modify: application tests discovered in the repository inventory

- [ ] Add temporary compatibility read behavior.
- [ ] Generate database types.
- [ ] Switch backend reads to split states.
- [ ] Switch backend writes to controlled operations.
- [ ] Stop application writes to legacy status.
- [ ] Keep legacy field readable only where approved.
- [ ] Run TypeScript, lint, build, and integration tests.
- [ ] Commit.

Suggested commit:

```powershell
git add supabase/migrations/20260722140800_phase4_claim_legacy_compatibility.sql `
        lib/database.types.ts
git add <approved-backend-and-test-files>
git commit -m "refactor(claims): cut over application claim state handling"
```

The exact backend and test file list must come from the repository impact inventory before this task begins. Do not guess or broaden scope during implementation.

### Task 9: Frontend and Dashboard Cutover

**Files:**
- Modify: exact frontend files identified in the approved impact inventory
- Modify: related frontend tests

- [ ] Separate workflow, decision, and payment labels.
- [ ] Preserve Claim readiness as a separate domain.
- [ ] Split mixed filters.
- [ ] Update dashboards and exports.
- [ ] Add compatibility handling for staged rollout.
- [ ] Run UI tests and production build.
- [ ] Commit.

Suggested commit:

```powershell
git add <approved-frontend-and-test-files>
git commit -m "refactor(claims): separate workflow decision and payment UI"
```

### Task 10: Phase 4 Validation Report

**Files:**
- Create: `docs/database/PHASE-4-VALIDATION-REPORT.md`

- [ ] Record migration list and checksums.
- [ ] Record database test results.
- [ ] Record tenant isolation results.
- [ ] Record financial integrity results.
- [ ] Record TypeScript, lint, and build results.
- [ ] Record known limitations and deferred items.
- [ ] Confirm legacy writes are stopped.
- [ ] Confirm implementation readiness.
- [ ] Commit and push.

Suggested commit:

```powershell
git add docs/database/PHASE-4-VALIDATION-REPORT.md
git commit -m "docs(database): finalize phase 4 claim validation report"
git push origin main
```

## 20. Exit Criteria

Phase 4 database migration is complete only when all conditions pass:

- ADR-001 through ADR-008 have approval evidence.
- All migrations apply successfully from clean local state.
- All migrations apply successfully over the Phase 3 baseline.
- No schema lint error exists.
- All Phase 3 and Phase 4 database tests pass.
- Tenant and clinic isolation pass.
- Protected state/financial fields cannot be updated generically.
- Decision and payment authority tests pass.
- Duplicate/out-of-order event tests pass.
- Backfill has zero unresolved P0/P1 exceptions.
- New Claim state snapshots match authoritative records.
- Generated TypeScript types compile.
- Frontend and backend read separate state domains.
- Application no longer writes legacy `claims.status`.
- Production build passes.
- Validation report is complete.
- Working tree is clean and commit is pushed.

## 21. Deferred Work

The following are explicitly outside the initial Phase 4 migration:

- Dedicated `claim_line_decisions`
- Multi-currency settlement
- Overpayment recovery workflow
- Chargeback workflow
- Multi-level appeal automation
- Automated AI adjudication
- Production webhook execution
- Complex recovery and subrogation
- Full accounting ledger
- Physical removal of legacy `claims.status`

Each deferred item requires a separate approved ADR or implementation phase.

## 22. Risks and Mitigations

| Risk | Priority | Mitigation |
| --- | --- | --- |
| Legacy status maps incorrectly | P0 if data corruption occurs | Authoritative-record-first backfill, exception table, no silent coercion |
| Generic update changes protected state | P0 | Controlled operations, protected columns, RLS/RBAC tests |
| Duplicate payment or payer event | P0 | External event identity, idempotency constraint, atomic operation |
| Cross-tenant mutation | P0 | Tenant-safe FK, RLS `USING` and `WITH CHECK`, isolation tests |
| Payment summary drifts | P0 | Transaction authority, reconciliation validation, consistency tests |
| Decision pointer conflicts | P1 | Supersession rules, current-pointer validation, expected version |
| Workflow closure implies paid | P1 | Independent fields, operation tests, UI separation |
| Appeal exists only as workflow state | P1 | Dedicated formal Appeal record requirement |
| Indefinite legacy dual-write | P1 | Explicit write cutoff and later removal gate |
| Application cutover misses a reader/writer | P1 | Approved impact inventory, search verification, build/test gate |
| Migration partially succeeds | P1 | Forward-only repair migration, idempotent backfill, staged constraints |

## 23. Required Summary

**Approved architecture direction:** Split workflow, decision, and payment state; formal appeals use dedicated records; payments remain transaction-authoritative; Phase 4 MVP retains header decision plus item adjustments; terminal reopen is controlled; payer and payment authorities are distinct; legacy status retirement is staged.

**Implementation gate:** ADR approval evidence is satisfied as of 2026-07-22. Migration execution remains blocked until remaining technical P1 dependencies are recorded and repository baseline validation passes.

**Migration approach:** Additive schema → authoritative event/domain records → controlled operations → RBAC/RLS → deterministic backfill → validation guards → compatible reads → controlled writes → UI/API cutover → staged legacy retirement.

**P0 safeguards:** Tenant isolation, protected state columns, payment integrity, event idempotency, deterministic backfill, and authoritative decision/payment records.

**Deferred:** Dedicated line adjudication, multi-currency, advanced recovery, multi-level appeals, automated AI adjudication, production webhooks, full ledger, and physical legacy-column removal.

## 24. Change Log

| Date | Version | Change | Author |
| --- | --- | --- | --- |
| 2026-07-22 | 0.1 | Created Phase 4 Claim migration plan | AI-assisted Database Architecture Lead |
| 2026-07-22 | 0.2 | Recorded ADR approval evidence; migration execution still blocked by technical gates | AI-assisted Documentation Lead                                |

## 25. Pre-Batch 3 Workflow Contract Reconciliation

This section reconciles the approved workflow contract with actual Batch 1 and Batch 2 implementation facts. No Batch 3 SQL or tests are created by this documentation update.

### 25.1 Implemented Workflow-State Contract

**Status:** `Confirmed`

| Contract item | Actual value |
| --- | --- |
| Type name | `public.claim_workflow_state` |
| Domain name | `public.claim_workflow_state_domain` |
| Domain constraint | `claim_workflow_state_domain_chk` |
| Schema | `public` |
| Representation | PostgreSQL enum wrapped by a PostgreSQL domain |
| Workflow values in declaration order | `draft`, `collecting_data`, `validation_pending`, `needs_review`, `ready_to_submit`, `submitted`, `under_review`, `appealed`, `closed`, `cancelled` |
| Claim column name | `claims.workflow_status` |
| Column type | `public.claim_workflow_state_domain` |
| Nullability | Nullable in Batch 1 |
| Default | No Batch 1 default |
| Legacy status column | `claims.status` remains present and unchanged |
| Legacy status constraint | `claims_status_chk` |
| `claims.version` | `integer not null`; no competing `claims.state_version` exists |

**Conflict:** The approved Workflow Spec references `payer_processing` and `decision_received`, but those values are not implemented. The approved decision/payment baseline names `pending` and `not_billable` are also not implemented; Batch 1 uses `not_decided` and `not_paid` / `payment_pending`. Batch 3 cannot safely implement transitions requiring missing values without a prior approved reconciliation migration or approved terminology decision.

### 25.2 Authoritative Transition Matrix

Only implemented workflow values are listed. Targets not listed are forbidden by default. Same-state transitions are forbidden.

| Source State | Allowed Targets | Permission | Actor Category | Reason | Version Check | Event Required | Milestone | Terminal/Reopen | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `draft` | `collecting_data`, `cancelled` | `claim.update`; `claim.cancel` for cancellation | human | Required for `cancelled`; optional otherwise | `expected_version` required | Yes | None | Not terminal before target | READY WITH FOLLOW-UP |
| `collecting_data` | `validation_pending`, `needs_review`, `cancelled` | `claim.update`; `claim.review`; `claim.cancel` | human, system | Required for `needs_review` and `cancelled` | `expected_version` required | Yes | None | Not terminal before target | READY WITH FOLLOW-UP |
| `validation_pending` | `collecting_data`, `needs_review`, `ready_to_submit`, `cancelled` | `claim.review`; `claim.submit` for `ready_to_submit` if approved as submission readiness | human, system | Required for `needs_review` and `cancelled`; readiness evidence required for `ready_to_submit` | `expected_version` required | Yes | None | Not terminal before target | READY WITH FOLLOW-UP |
| `needs_review` | `collecting_data`, `validation_pending`, `ready_to_submit`, `cancelled` | `claim.review`; `claim.submit` for `ready_to_submit` if approved | human | Required for review outcome and cancellation | `expected_version` required | Yes | None | Not terminal before target | READY WITH FOLLOW-UP |
| `ready_to_submit` | `submitted`, `needs_review`, `cancelled` | `claim.submit`; `claim.review`; `claim.cancel` | human, system | Required for rollback to `needs_review` and cancellation | `expected_version` required | Yes | `submitted_at` when target is `submitted` | Not terminal before target | READY WITH FOLLOW-UP |
| `submitted` | `under_review`, `cancelled` | `claim.review`; `claim.cancel` | human, integration, system | Required for cancellation; source reference recommended for integration | `expected_version` required | Yes | None verified | Not terminal before target | READY WITH FOLLOW-UP |
| `submitted` | Missing approved target `decision_received` | Not verified | integration, system | Required | `expected_version` required | Yes | Not verified | Not terminal before target | Conflict |
| `under_review` | `appealed`, `closed`, `cancelled` | `claim.review`; `claim.cancel` | human, integration | Required for `appealed`, `closed`, and `cancelled` | `expected_version` required | Yes | None verified | `closed` and `cancelled` terminal after target | READY WITH FOLLOW-UP |
| `under_review` | Missing approved target `decision_received` / `payer_processing` semantic split | Not verified | integration, system | Required | `expected_version` required | Yes | Not verified | Not terminal before target | Conflict |
| `appealed` | `under_review`, `closed` | `claim.review`; appeal-specific permission not verified | human, integration | Required | `expected_version` required | Yes | None verified | `closed` terminal after target | READY WITH FOLLOW-UP |
| `closed` | Dedicated reopen target not verified | `claim.reopen` exists; target-specific authority not verified | human | Required reason code and reason text | `expected_version` required | Yes | None verified | Terminal reopen only | NOT READY |
| `cancelled` | Dedicated reopen target not verified | `claim.reopen` exists; target-specific authority not verified | human | Required reason code and reason text | `expected_version` required | Yes | None verified | Terminal reopen only | NOT READY |

Transition matrix status: `NOT READY` because approved target states are missing and exact transition permission authority is incomplete.

### 25.3 Proposed Batch 3 Function Contract

**Status:** `NOT READY` until permission authority and state-name conflicts are resolved.

| Contract item | Proposed exact contract |
| --- | --- |
| Objective | Implement one controlled workflow transition RPC using actual Batch 1/2 schema while preserving ADR terminal/reopen rules and immutable workflow history. |
| Exact migration filename | `supabase/migrations/20260722140500_phase4_claim_controlled_operations.sql` |
| Exact functional test filename | `supabase/tests/phase4_claim_workflow_transition_test.sql` |
| Exact security test filename | `supabase/tests/phase4_claim_workflow_security_test.sql` |
| Function name | `public.transition_claim_workflow` |
| Signature | `public.transition_claim_workflow(p_claim_id uuid, p_target_workflow_status public.claim_workflow_state_domain, p_expected_version integer, p_reason_code text default null, p_reason_text text default null, p_source_system text default 'med_ai_nexsure', p_external_event_id text default null, p_correlation_id text default null, p_occurred_at timestamptz default now(), p_metadata jsonb default '{}'::jsonb)` |
| Return type | `claim_id uuid`, `workflow_status public.claim_workflow_state_domain`, `version integer`, `event_id uuid`, `sequence_number integer`, `recorded_at timestamptz` |
| Security mode | `security definer` only if hardened; otherwise `security invoker` is preferred but may not be sufficient for atomic event insert because ordinary direct insert is denied |
| Safe search path | `set search_path = public, private, pg_temp` |
| EXECUTE roles | `authenticated` after permission checks; `service_role` for trusted backend/integration execution. Do not grant to `anon` or `public`. |
| Authorization helper/source | `public.has_permission(text, uuid, uuid)` and existing private Claim helpers where suitable |
| Tenant and clinic validation | Lock Claim by `p_claim_id`; validate membership and clinic access using the locked Claim row, not caller-supplied tenant values |
| Assignment/self-scope behavior | Self-scope only for approved draft mutation behavior; elevated transitions require explicit permission independent of assignment |
| Expected version rule | `p_expected_version` must equal locked `claims.version`; stale version returns conflict and writes nothing |
| Row-lock strategy | `select ... from public.claims where id = p_claim_id and deleted_at is null for update` before validation, sequence allocation, snapshot update, and event insert |
| Transition validation source | Static transition matrix in the function for Batch 3, using implemented values only, until an approved transition registry exists |
| Sequence allocation | `coalesce(max(sequence_number), 0) + 1` for the locked Claim inside the same transaction |
| Idempotency behavior | For `(organization_id, source_system, external_event_id)` when supplied, equivalent retry returns the recorded result or no-op; conflicting payload is rejected |
| Snapshot update | Update only `claims.workflow_status`, `claims.state_updated_at`, `claims.state_updated_by`, and `claims.version` |
| Event insertion | Insert one `claim_workflow_events` row with before/after state, before/after version, actor/source/reason/timestamps, sequence, metadata, and correlation |
| Milestone behavior | Set `submitted_at` only for first successful transition to `submitted`; other milestones are `Not Verified` in current Batch 1/2 schema |
| Error behavior | Sanitized not-found/unauthorized, denied, invalid transition, stale version, duplicate conflict, invalid actor/source, and rollback-on-event-failure behavior |
| Audit behavior | Workflow event is mandatory; existing audit trigger behavior is not enough alone for Batch 3 transition evidence |

Required operation order: resolve actor -> locate and lock Claim -> validate tenant/clinic/permission -> validate source state and expected version -> validate transition -> allocate event sequence -> update snapshot/version/milestone -> insert event -> return sanitized result.

Snapshot update and event insertion must be atomic. No partial write is allowed.

### 25.4 Version, Event Mapping, Idempotency, Security, and Errors

| Area | Contract | Status |
| --- | --- | --- |
| Version/concurrency | `claims.version` is the sole optimistic-lock counter; input uses `p_expected_version`; success increments once; stale version changes nothing; event stores `claim_version_before` and `claim_version_after`; sequence allocation occurs inside the Claim lock. | READY WITH FOLLOW-UP |
| Manual idempotency | Manual transitions may omit `external_event_id`; optimistic locking prevents duplicate state changes; same-state retry must not insert an event. | READY WITH FOLLOW-UP |
| Integration idempotency | Use `source_system` and `external_event_id`; equivalent duplicate returns prior result/no-op; conflicting duplicate rejects; retry does not increment version or insert another event; ordering uses `sequence_number`, not timestamp alone. | NOT READY |
| Security | Authenticate actor, validate organization/clinic scope, require explicit transition permission, restrict EXECUTE, protect direct Claim-state updates, deny direct event mutation, preserve service-role exception, keep AI non-authoritative. | NOT READY |
| Error handling | Sanitized not-found/unauthorized, denied, invalid transition, stale version, duplicate equivalent no-op, duplicate conflicting conflict, invalid actor/source denied, event insert failure full rollback. | READY WITH FOLLOW-UP |

| Concept | Actual Column | Required | Population Rule | Gap |
| --- | --- | --- | --- | --- |
| Claim ID | `claim_id` | Yes | Locked Claim `id` | None |
| Organization | `organization_id` | Yes | Locked Claim `organization_id` | None |
| Clinic | `clinic_id` | Yes | Locked Claim `clinic_id` | None |
| From status | `from_workflow_status` | Initial event may be null; transition event required | Current locked `claims.workflow_status` before update | Batch 1 leaves snapshot nullable |
| To status | `to_workflow_status` | Yes | `p_target_workflow_status` after validation | None |
| Sequence | `sequence_number` | Yes | Next integer per locked Claim | Batch 2 does not allocate |
| Version before | `claim_version_before` | Yes | Locked `claims.version` before update | None |
| Version after | `claim_version_after` | Yes | `claims.version + 1` | None |
| Actor type | `actor_type` | Yes | `human`, `integration`, `system`, or `migration` | Actor resolution not implemented |
| Actor user/reference | `actor_user_id`, `actor_reference` | Conditional | Human requires `actor_user_id`; non-human may use `actor_reference` | Integration identity rules not verified |
| Source system | `source_system` | Yes | Nonblank function input or controlled default | Exact source registry not verified |
| Reason | `reason_code`, `reason_text` | Conditional | Required for material exception, cancellation, close, appeal, and reopen | Reason-code registry not implemented |
| External event ID | `external_event_id` | Required for integration idempotency | Integration source event identity | Optional in Batch 2 |
| Correlation ID | `correlation_id` | Recommended | Request or integration correlation | Optional in Batch 2 |
| Occurred/effective time | `occurred_at` | Yes | Business event time; default only for user action | No separate `effective_at` column |
| Recorded time | `recorded_at`, `created_at` | Yes | Database timestamp | None |
| Metadata | `metadata` | Yes | JSON object with non-authoritative supplemental data only | No schema beyond JSON object |

### 25.5 Batch 3 Exact Contract and Readiness

| Item | Exact value |
| --- | --- |
| Objective | Implement controlled Claim workflow transitions using actual Batch 1 split-state and Batch 2 workflow-event schema only. |
| Exact migration filename | `supabase/migrations/20260722140500_phase4_claim_controlled_operations.sql` |
| Exact functional test filename | `supabase/tests/phase4_claim_workflow_transition_test.sql` |
| Exact security test filename | `supabase/tests/phase4_claim_workflow_security_test.sql` |
| Exact function name and signature | `public.transition_claim_workflow(p_claim_id uuid, p_target_workflow_status public.claim_workflow_state_domain, p_expected_version integer, p_reason_code text default null, p_reason_text text default null, p_source_system text default 'med_ai_nexsure', p_external_event_id text default null, p_correlation_id text default null, p_occurred_at timestamptz default now(), p_metadata jsonb default '{}'::jsonb)` |
| Required reusable helpers | `public.has_permission(text, uuid, uuid)`; existing private Claim scope helpers where compatible |
| Allowed transition source | Static Batch 3 matrix above until a transition registry is approved |
| Acceptance criteria | Valid transitions update snapshot, increment version once, insert exactly one event, preserve tenant/clinic scope, reject invalid/stale/unauthorized/duplicate-conflicting operations, and return sanitized results |
| Required regressions | Batch 1 schema contract; Batch 2 workflow-history contract; Phase 3 Claim permissions/security/tenant-isolation/self-scope/audit suites by repository convention |
| Explicit exclusions | No Batch 3 SQL in this task; no decision/payment/appeal implementation; no backfill; no generated types; no frontend/backend/API changes |

| Contract Area | Evidence | Status | Blocker/Follow-up |
| --- | --- | --- | --- |
| Workflow values | Batch 1 migration and schema test | READY WITH FOLLOW-UP | Conflict with Workflow Spec names |
| Transition matrix | Approved spec plus implemented values | NOT READY | `payer_processing` and `decision_received` missing; `claim.transition` / `claim.close` missing |
| Permission authority | Phase 3 permission migration and Batch 2 RLS | NOT READY | No verified transition-specific permission |
| Function signature | Proposed exact Batch 3 contract | READY WITH FOLLOW-UP | Security mode and grants need implementation review |
| Version/locking | `claims.version`; Batch 2 version columns | READY WITH FOLLOW-UP | Batch 3 row lock and stale-write logic absent |
| Event mapping | Batch 2 `claim_workflow_events` columns | READY WITH FOLLOW-UP | `effective_at` absent; integration identity optional |
| Sequence/idempotency | `sequence_number`; unique external identity | NOT READY | Sequence allocation and equivalent-payload retry not implemented |
| Snapshot/milestones | Batch 1 snapshot columns; `submitted_at` exists | READY WITH FOLLOW-UP | Snapshot nullable; only `submitted_at` milestone verified for proposed use |
| Direct mutation protection | Batch 2 event grants; Phase 3 Claim update policies | NOT READY | New Batch 1 state-column direct update protection not proven |
| Test scope | Existing Batch 1/2 tests; proposed exact Batch 3 tests | READY WITH FOLLOW-UP | Tests are planned, not run; Batch 3 files absent |

Overall readiness: `NOT READY`.

`READY WITH CONDITIONS` is not appropriate because unresolved follow-ups affect authorization, optimistic locking, atomicity, event identity, and history integrity.

---

## 26. Pre-Batch 3 Approved Implementation Contract

**Status:** Approved
**Decision Date:** 2026-07-22
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Pre-Batch 3 Decision Closure

This section supersedes earlier `NOT READY` reconciliation language for Batch 3 design closure. Open design blockers: `0`. Remaining gaps are implementation work inside the approved Batch 3 migration and test scope.

### 26.1 Objective

Implement controlled Claim workflow transitions using the actual Batch 1 split-state schema and Batch 2 workflow-event schema.

### 26.2 Exact Files for Batch 3

| Artifact | Exact path |
| --- | --- |
| Migration filename | `supabase/migrations/20260722140300_phase4_claim_controlled_workflow_mutations.sql` |
| Functional test filename | `supabase/tests/phase4_claim_workflow_mutations_test.sql` |
| Security test filename | `supabase/tests/phase4_claim_workflow_mutations_security_test.sql` |

The migration timestamp is the next unused repository timestamp after `20260722140200_phase4_claim_workflow_events.sql`.

### 26.3 Function Contract

Function:

```text
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

Return:

```text
claim_id uuid
previous_workflow_status public.claim_workflow_state_domain
workflow_status public.claim_workflow_state_domain
version integer
workflow_event_id uuid
state_updated_at timestamptz
idempotent_replay boolean
```

Security: `SECURITY DEFINER`, fixed safe `search_path`, schema-qualified objects, EXECUTE denied to `PUBLIC` and `anon`, EXECUTE granted only to approved authenticated/service roles, actor and tenant derived from trusted context.

### 26.4 Transition Matrix

All unlisted transitions are forbidden. Same-state transitions are forbidden. `cancelled` is terminal in Batch 3.

| Source | Target | Permission | Actor | Reason |
| --- | --- | --- | --- | --- |
| `draft` | `collecting_data` | `claim.update` | Human/service | Optional |
| `collecting_data` | `validation_pending` | `claim.submit` | Human/service | Optional |
| `validation_pending` | `needs_review` | `claim.review` | Reviewer/service | Required |
| `validation_pending` | `ready_to_submit` | `claim.review` | Reviewer/service | Optional |
| `needs_review` | `validation_pending` | `claim.review` | Reviewer | Required |
| `ready_to_submit` | `submitted` | `claim.submit` | Human/integration | Optional |
| `submitted` | `under_review` | `claim.review` | Integration/reviewer fallback | Optional |
| `under_review` | `appealed` | `claim.review` | Reviewer | Required |
| `under_review` | `closed` | `claim.review` | Reviewer | Required |
| `appealed` | `under_review` | `claim.review` | Reviewer/integration | Required |
| `closed` | `needs_review` | `claim.reopen` | Authorized reviewer | Required |
| Any non-terminal allowed state | `cancelled` | `claim.cancel` | Authorized user | Required |

Do not create `claim.transition` or `claim.close`; `claim.review` is the approved MVP authority for operational closure.

### 26.5 Locking, Idempotency, and Sequence

Required order:

```text
resolve actor
-> locate and lock Claim
-> validate tenant, clinic, membership, and permission
-> validate current state and expected version
-> validate transition
-> check idempotency
-> allocate sequence
-> update snapshot/version/milestone
-> insert workflow event
-> return sanitized result
```

`claims.version` is the sole optimistic-lock counter and remains `integer`. Do not introduce `state_version`. Success increments version exactly once; stale version changes nothing; failed transition inserts no event.

External integration transitions require `source_system` and `external_event_id`. Use the actual Batch 2 uniqueness scope `organization_id + source_system + external_event_id`. Equivalent payload retry returns prior result with `idempotent_replay = true`; conflicting retry fails with no data change.

Sequence allocation occurs inside the locked Claim transaction:

```text
coalesce(max(sequence_number) for the Claim, 0) + 1
```

### 26.6 Permissions and Direct-Update Protection

Batch 3 must restrict ordinary direct updates to:

```text
workflow_status
version
state_updated_at
state_updated_by
workflow milestone fields
```

Preserve already-authorized non-state Claim updates. Restrict direct workflow-event INSERT/UPDATE/DELETE for authenticated users. Repository-compatible mechanism: protected column privileges plus controlled function execution, without redesigning unrelated Claim RLS/RBAC.

### 26.7 Acceptance Criteria and Regression Tests

Acceptance criteria:

- D1-D6 are implemented exactly.
- Allowed transitions update snapshot, increment version once, and insert exactly one event.
- Invalid, same-state, stale, unauthorized, cross-tenant, cross-clinic, and conflicting-idempotency attempts write nothing.
- Equivalent external retry returns the prior result with replay flag true.
- Direct protected state-column updates and direct event mutations are rejected.
- Error responses are sanitized and do not leak PHI, tenant existence, policy internals, or raw SQL.

Regression tests:

```text
supabase/tests/phase4_claim_schema_test.sql
supabase/tests/phase4_claim_workflow_history_test.sql
supabase/tests/phase3_claim_permissions_test.sql
supabase/tests/phase3_claim_security_test.sql
supabase/tests/phase3_claim_tenant_isolation_test.sql
supabase/tests/phase3_claim_self_scope_test.sql
supabase/tests/phase3_claim_audit_test.sql
```

### 26.8 Exclusions and Readiness

Exclusions: no decision/payment/appeal implementation, no appeal entity, no backfill, no generated types, no frontend/backend/API changes, no fixtures, no seed data, and no legacy-status removal.

Batch 3 readiness: `READY FOR BATCH 3`.

---

## 27. Batch 4 Approved Implementation Contract - Controlled Claim Decision Mutations

**Batch name:** Phase 4 Batch 4 - Controlled Claim Decision / Adjudication Mutations
**Objective:** Implement one controlled split-state Claim decision mutation path that preserves `claim_decisions` as authoritative evidence, updates `claims.current_decision_id` and `claims.decision_status` atomically, and prevents unauthorized direct adjudication writes.

### 27.1 Prerequisites

| Prerequisite | Required evidence |
| --- | --- |
| Batch 1 state types | `20260722140000_phase4_claim_state_types.sql` applied. |
| Batch 1 state columns | `20260722140100_phase4_claim_state_columns.sql` applied. |
| Batch 2 workflow events | `20260722140200_phase4_claim_workflow_events.sql` applied. |
| Batch 3 workflow mutation | `20260722160000_phase4_claim_workflow_mutation.sql` applied. |
| Phase 3 decision object | `public.claim_decisions`, `public.claim_decision_adjustments`, `claims.current_decision_id`, and `claim_decisions_one_final_per_claim_uq` exist. |
| Authorization helper | `public.has_permission(text, uuid, uuid)` exists. |

### 27.2 Exact Allowed Files for Batch 4 Implementation

Batch 4 implementation may create or modify only these implementation artifacts:

```text
supabase/migrations/20260722161000_phase4_claim_decision_mutation.sql
supabase/tests/phase4_claim_decision_mutation_test.sql
supabase/tests/phase4_claim_decision_security_test.sql
```

This documentation closure task does not create those files.

### 27.3 Exact Function Signature and Return

Function:

```text
public.record_claim_decision(
  p_claim_id uuid,
  p_target_decision_status public.claim_decision_state_domain,
  p_expected_version integer,
  p_reason_code text,
  p_reason_text text,
  p_approved_amount numeric default null,
  p_rejected_amount numeric default null,
  p_payer_reference text default null,
  p_decision_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
```

Return one row:

```text
claim_id uuid
previous_decision_status public.claim_decision_state_domain
decision_status public.claim_decision_state_domain
version integer
decision_id uuid
current_decision_id uuid
state_updated_at timestamptz
idempotent_replay boolean
```

Security and grants:

| Item | Contract |
| --- | --- |
| Security mode | `SECURITY DEFINER` |
| Search path | `set search_path = public, private, auth, pg_temp` |
| EXECUTE denied | `PUBLIC`, `anon` |
| EXECUTE granted | `authenticated`, `service_role` |
| Authorization helper | `public.has_permission(text, uuid, uuid)` using locked Claim tenant and clinic |

### 27.4 Authoritative Decision Object

`public.claim_decisions` is the authoritative decision evidence table. It is reused, not duplicated.

Batch 4 may add these exact columns to `public.claim_decisions`:

```text
source_system text
external_event_id text
correlation_id uuid
```

Batch 4 must add a partial uniqueness control for external decision events:

```text
organization_id + source_system + external_event_id
where external_event_id is not null
```

### 27.5 Decision Transition Matrix

All unlisted transitions are forbidden. Same-state requests are invalid unless they are verified idempotent replays.

| Current Snapshot | Requested Decision | Allowed | Prior Record Action | New Record | Snapshot Result | Reason Required |
| --- | --- | --- | --- | --- | --- | --- |
| `not_decided` | `approved` | Yes | None | Final decision v1 | `approved` | No |
| `not_decided` | `partially_approved` | Yes | None | Final decision v1 | `partially_approved` | Yes |
| `not_decided` | `rejected` | Yes | None | Final decision v1 | `rejected` | Yes |
| `not_decided` | `request_information` | Yes | None | Final decision v1 | `request_information` | Yes |
| `not_decided` | `voided` | No | None | None | No change | Yes |
| Any current value | Same requested value | Replay only | None | None | Unchanged | Existing requirement applies |
| `approved`, `partially_approved`, `rejected`, `request_information`, `voided` | `approved` | Yes | Supersede current | Final replacement | `approved` | Required unless current is `request_information` |
| `approved`, `partially_approved`, `rejected`, `request_information`, `voided` | `partially_approved` | Yes | Supersede current | Final replacement | `partially_approved` | Yes |
| `approved`, `partially_approved`, `rejected`, `request_information`, `voided` | `rejected` | Yes | Supersede current | Final replacement | `rejected` | Yes |
| `approved`, `partially_approved`, `rejected`, `request_information`, `voided` | `request_information` | Yes | Supersede current | Final replacement | `request_information` | Yes |
| `approved`, `partially_approved`, `rejected`, `request_information`, `voided` | `voided` | Yes | Supersede current | Final void evidence | `voided` | Yes |

`request_information` is an intermediate adjudication outcome and does not mean final approval, rejection, payment, closure, or appeal. `voided` preserves prior evidence and does not delete rows.

### 27.6 Workflow Eligibility and Coupling

Decision mutation must not directly mutate `claims.workflow_status`.

| Decision Status | Required Workflow Eligibility | Direct Workflow Change | Follow-up Workflow Transition | Workflow Event |
| --- | --- | --- | --- | --- |
| `approved` | `submitted` or `under_review`; not terminal; not pre-submission | None | Optional controlled closure through `transition_claim_workflow` | None |
| `partially_approved` | `submitted` or `under_review`; not terminal; not pre-submission | None | Optional appeal or closure through `transition_claim_workflow` | None |
| `rejected` | `submitted` or `under_review`; not terminal; not pre-submission | None | Optional appeal or closure through `transition_claim_workflow` | None |
| `request_information` | `submitted` or `under_review`; not terminal | None | Optional controlled workflow movement if product flow requires it | None |
| `voided` | Existing current authoritative decision required; Claim not soft-deleted | None | Optional workflow action through `transition_claim_workflow` | None |

### 27.7 Permissions

| Decision Action | Permission | Status |
| --- | --- | --- |
| Read decision | `claim.read` | Existing |
| Create/adjudicate first decision | `claim.decide` | Existing |
| Partial approval | `claim.decide` | Existing |
| Rejection | `claim.decide` | Existing |
| Request information | `claim.decide` for decision row creation | Existing |
| Supersede/correct decision | `claim.decision.supersede` | Existing |
| Void current decision | `claim.decision.void` | New in Batch 4 |
| Decision audit | `claim.audit.read` | Existing |

Generic `claim.update` and workflow permissions do not authorize decision mutation.

### 27.8 Version, Locking, and Idempotency

Version model: global Claim lock using `claims.version`.

Required operation order:

```text
resolve actor
-> locate and lock Claim where deleted_at is null
-> lock current decision when present
-> validate tenant, clinic, membership, and permission
-> check external idempotency identity when supplied
-> validate current snapshot and expected version
-> validate transition
-> validate amounts and currency
-> allocate decision_version
-> supersede prior current decision when present
-> insert new final decision
-> update claims.current_decision_id, claims.decision_status, totals, version, and state metadata
-> return sanitized result
```

Idempotency identity for external adjudication:

```text
organization_id + source_system + external_event_id
```

Equivalent payload fields:

```text
claim_id
decision_status
approved_amount
rejected_amount
currency_code
reason_code
normalized reason_text
payer_reference
decision_at
source_system
```

Equivalent replay returns the prior result with `idempotent_replay = true`, no new decision, no snapshot change, and no version increment. Conflicting replay fails with no data change.

### 27.9 Amount and Currency Validation

| Area | Contract |
| --- | --- |
| Requested amount basis | `coalesce(claims.total_eligible_amount, claims.total_claimed_amount)` |
| Currency | Derived from `claims.currency_code`; caller does not provide currency |
| Approved | `approved_amount = basis`, `rejected_amount = 0` |
| Partially approved | `approved_amount > 0`, `rejected_amount > 0`, sum equals basis |
| Rejected | `approved_amount = 0`, `rejected_amount = basis` |
| Request information | Amounts must be null |
| Voided | Amounts must be null |
| Over approval | Forbidden |
| Financial types | PostgreSQL `numeric`, rounded to scale 2 |
| Payment impact | None; payment status and payment rows remain unchanged |

### 27.10 Decision Supersession, Void, and Direct-Write Protection

Batch 4 must preserve:

```text
decision record
+ supersession/current pointer
+ claims.decision_status
+ authoritative version increment
+ audit evidence
commit or roll back together
```

Direct-write protection:

- Ordinary roles must not directly insert `claim_decisions`.
- Ordinary roles must not update finalized `claim_decisions`.
- Ordinary roles must not delete `claim_decisions`.
- Ordinary roles must not update `claims.decision_status`.
- Ordinary roles must not update `claims.current_decision_id`.
- Privileged service/database recovery remains available outside ordinary application roles.

### 27.11 Regression Scope and Acceptance Criteria

Regression scope:

```text
supabase/tests/phase4_claim_schema_test.sql
supabase/tests/phase4_claim_workflow_history_test.sql
supabase/tests/phase4_claim_workflow_mutation_test.sql
supabase/tests/phase4_claim_workflow_security_test.sql
supabase/tests/phase3_claim_permissions_test.sql
supabase/tests/phase3_claim_security_test.sql
supabase/tests/phase3_claim_tenant_isolation_test.sql
supabase/tests/phase3_claim_self_scope_test.sql
supabase/tests/phase3_claim_audit_test.sql
```

Acceptance criteria:

- `public.record_claim_decision` exists with the exact signature and return contract.
- `claim_decisions` remains the authoritative evidence table.
- Valid decisions insert a new final decision row, update pointer/snapshot/totals/version atomically, and preserve tenant and clinic scope.
- Invalid, same-state non-replay, stale, unauthorized, cross-tenant, cross-clinic, soft-deleted Claim, conflicting-idempotency, invalid amount, and invalid currency attempts write nothing.
- Equivalent external replay returns the prior result without incrementing version.
- Payment status and workflow status are not mutated by decision mutation.
- Direct protected decision and Claim snapshot writes are denied to ordinary authenticated users.
- AI/system actors without explicit adjudication authority cannot finalize decisions.
- Error messages are tenant-safe and sanitized.

### 27.12 Explicit Exclusions

Batch 4 excludes:

```text
workflow mutation changes
payment/refund/reversal mutation changes
appeal entity implementation
dedicated claim_line_decisions
legacy status removal
backend/API/frontend/generated type changes
fixtures or seed data unless separately approved
database reset or validation execution in this documentation closure task
```

Batch 4 readiness: `READY FOR BATCH 4`.

---

## 28. Batch 5 Approved Implementation Contract - Controlled Claim Payment Settlement Mutations

**Batch name:** Phase 4 Batch 5 - Controlled Claim Payment Settlement Mutations
**Objective:** Implement one controlled split-state Claim payment mutation path that reuses existing `claim_payments`, preserves payment records as authoritative financial evidence, updates `claims.payment_status` and `claims.total_paid_amount` atomically, and prevents unauthorized direct payment-summary writes.

### 28.1 Evidence-Based Selection

| Area | Classification | Evidence |
| --- | --- | --- |
| Batch 1 split payment snapshot | Confirmed Implemented | `20260722140100_phase4_claim_state_columns.sql` adds nullable `claims.payment_status public.claim_payment_state_domain`. |
| Batch 3/4 non-payment preservation | Confirmed Implemented | `transition_claim_workflow` and `record_claim_decision` do not authoritatively mutate payment state. |
| Existing payment source of truth | Confirmed Implemented | Phase 3 provides `claim_payments`, `claim_payment_allocations`, `claim_payment_reconciliations`, `record_claim_payment`, payment idempotency indexes, RLS, and service-role function grants. |
| Split payment synchronization | Implementation Gap | Existing `record_claim_payment` updates legacy `claims.status` and `claims.total_paid_amount`; no Phase 4 controlled split `claims.payment_status` mutation was found. |
| Refund/reversal operations | Documented but Not Implemented | Reversal fields exist on `claim_payments`; no `record_claim_refund` or `record_claim_reversal` function was verified. |
| Formal appeal entity | Documented but Not Implemented | Approved by ADR-002 but dependent on workflow/decision evidence; not safer than closing payment summary after decision mutation. |

Batch 5 is selected because payment summary control is the next highest-priority valid Phase 4 dependency after split states, workflow mutation, and decision mutation. It closes the financial-current-state gap without combining appeal or legacy backfill scope.

### 28.2 Exact Batch 5 Contract

| Contract Field | Value | Applicability |
| --- | --- | --- |
| Batch name | Phase 4 Batch 5 - Controlled Claim Payment Settlement Mutations | CONFIRMED |
| Objective | Reuse authoritative Phase 3 payment records and add one controlled Phase 4 function that records payment outcomes, synchronizes `claims.payment_status` and `claims.total_paid_amount`, increments `claims.version`, and protects direct financial summary writes. | CONFIRMED |
| Prerequisites | Batch 1 state types/columns, Batch 2 workflow events, Batch 3 workflow mutation, Batch 4 decision mutation, Phase 3 payment tables/functions/indexes/RLS, `public.has_permission(text, uuid, uuid)`, and existing `claim.payment.record`. | CONFIRMED |
| Allowed files | `supabase/migrations/20260722162000_phase4_claim_payment_mutation.sql`; `supabase/tests/phase4_claim_payment_mutation_test.sql`; `supabase/tests/phase4_claim_payment_security_test.sql`. | CONFIRMED |
| Migration filename | `supabase/migrations/20260722162000_phase4_claim_payment_mutation.sql` | CONFIRMED |
| Test filenames | `supabase/tests/phase4_claim_payment_mutation_test.sql`; `supabase/tests/phase4_claim_payment_security_test.sql` | CONFIRMED |
| Authoritative objects | `public.claim_payments`, `public.claim_payment_allocations`, `public.claim_payment_reconciliations`, `public.claims.payment_status`, `public.claims.total_paid_amount`, `public.claims.version`. | CONFIRMED |
| Functions/mutation paths | New `public.record_claim_payment_settlement(...)`; existing `public.record_claim_payment(...)` remains legacy/Phase 3 evidence and must not be broadened without explicit compatibility review. | CONFIRMED |
| Permissions | Existing `claim.payment.record`; existing `claim.payment.allocate`; existing `claim.payment.reconcile`; new `claim.payment.reverse` only for reversal support inside this batch; no refund operation in Batch 5. | CONFIRMED |
| Tenant/security behavior | Actor from `auth.uid()`; tenant and clinic from locked Claim; `public.has_permission(...)`; no `PUBLIC` or `anon` execute; ordinary authenticated users cannot directly update payment snapshot/version/totals or write payment tables outside controlled paths. | CONFIRMED |
| Version/locking | Lock Claim by `p_claim_id` and `deleted_at is null`; use `claims.version` as the sole optimistic lock; success increments once; stale request writes nothing. | CONFIRMED |
| Idempotency | External payments require existing or new idempotency identity in `claim_payments`; equivalent retry returns prior result with `idempotent_replay = true`; conflicting retry fails with no data change. | CONFIRMED |
| Transaction boundary | Payment record, payment summary, Claim total, Claim version, and audit evidence commit or roll back together. | CONFIRMED |
| Direct-write protection | Deny ordinary direct updates to `claims.payment_status`, `claims.total_paid_amount`, `claims.version`, `state_updated_at`, and `state_updated_by`; deny ordinary direct payment table writes unless already controlled by Phase 3 RLS/service-role boundaries. | CONFIRMED |
| Audit requirements | Existing Claim/payment audit triggers plus typed payment row evidence; no failed operation writes authoritative payment evidence. | CONFIRMED |
| Regression scope | Batch 1 schema, Batch 2 workflow history, Batch 3 workflow mutation/security, Batch 4 decision mutation/security, Phase 3 permissions/security/tenant/self-scope/audit, and existing Phase 3 payment function behavior. | CONFIRMED |
| Acceptance criteria | Function exists with exact contract; valid received/failed/reversed payments update only payment snapshot and totals; decision/workflow snapshots remain unchanged; duplicate external events do not double-count; invalid amounts/currency/status/version/authorization write nothing; direct protected writes are denied. | CONFIRMED |
| Out of scope | Formal appeals, refund lifecycle, payment allocation redesign, reconciliation redesign, legacy `claims.status` removal, backend/API/frontend/generated type changes, fixtures, seed data, and database reset in the contract task. | CONFIRMED |
| Stop conditions | Missing Phase 3 payment objects; missing `claim.payment.record`; incompatible existing `record_claim_payment` behavior; unresolved refund ceiling requirement if refund is requested; inability to protect payment snapshot/totals without weakening existing Claim update behavior. | CONFIRMED |

### 28.3 Function Contract

```text
public.record_claim_payment_settlement(
  p_claim_id uuid,
  p_expected_version integer,
  p_payment_amount numeric,
  p_payment_status text default 'received',
  p_payment_reference text default null,
  p_payer_reference text default null,
  p_received_at timestamptz default null,
  p_value_date date default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_reason_code text default null,
  p_reason_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
```

Return:

```text
claim_id uuid
previous_payment_status public.claim_payment_state_domain
payment_status public.claim_payment_state_domain
version integer
payment_id uuid
total_paid_amount numeric
state_updated_at timestamptz
idempotent_replay boolean
```

Payment status mapping:

| Payment evidence | Claim payment snapshot |
| --- | --- |
| no payable approved amount or rejected/request-information/void decision | `not_paid` |
| accepted pending/scheduled/processing payment evidence | `payment_pending` |
| received amount greater than 0 and less than approved amount | `partially_paid` |
| received amount equals approved amount | `paid` |
| failed payment attempt with outstanding approved amount | `payment_failed` |
| reversed payment evidence | `reversed` |

Batch 5 must not implement `partially_refunded` or `refunded`; those remain a later refund lifecycle batch because refund ceiling and production exception rules require their own primary responsibility.

### 28.4 Readiness

Open design blockers: `0`

Implementation dependencies are known and fit one primary database responsibility.

Batch 5 readiness: `READY FOR BATCH 5`

---

## 29. Batch 6 Proposed Implementation Contract - Formal Claim Appeal Entity and Controlled Appeal Mutations

**Batch name:** Phase 4 Batch 6 - Formal Claim Appeal Entity and Controlled Appeal Mutations
**Status:** Approved
**Objective:** Implement the smallest independently deployable formal Appeal domain by adding a dedicated `claim_appeals` source of truth and controlled submit/resolve mutation paths that preserve workflow, payer decision, payment, evidence, tenant, RLS, and audit boundaries.

### 29.1 Evidence-Based Selection

| Area | Classification | Evidence |
| --- | --- | --- |
| ADR-002 appeal source of truth | Approved Decision | ADR-002 states every formal appeal requires a dedicated Appeal record and `workflow_status = appealed` is only a summary. |
| Current implementation gap | Confirmed Finding | Batch 5 impact analysis reports no `claim_appeals` table found and formal appeals deferred as a separate domain. |
| Workflow dependency | Confirmed Finding | Batch 3 provides `public.transition_claim_workflow` and an implemented `appealed` workflow value. |
| Decision dependency | Confirmed Finding | Batch 4 provides `public.record_claim_decision` and preserves decision authority separately from workflow. |
| Payment dependency | Confirmed Finding | Batch 5 contract keeps payment mutation independent and excludes formal appeals. |
| Refund/reversal alternative | Open Decision | Refund ceiling, refund semantics, and broad reversal ordering remain unresolved; refund/reversal is not selected for Batch 6. |

Batch 6 is selected as the next proposed Phase 4 contract because formal Appeal scope is already approved by ADR-002, has a distinct source-of-truth responsibility, and is less blocked than refund/reversal lifecycle work.

### 29.2 Scope

| Contract Field | Value | Classification |
| --- | --- | --- |
| Business objective | Preserve formal appeal cases as auditable, tenant-scoped records instead of relying on `claims.workflow_status = appealed` alone. | Recommendation |
| In scope | `claim_appeals` table; appeal status domain or constrained values; appeal sequence; submit and resolve controlled functions; RLS/RBAC; tenant-safe relationships; workflow-event linkage; optional outcome decision reference. | Recommendation |
| Out of scope | Refund lifecycle, reversal lifecycle, payment allocation redesign, legacy `claims.status` removal, dedicated `claim_line_decisions`, backend/API/frontend/generated type changes, fixtures, seed data, and database reset. | Recommendation |
| Dependencies | Batch 1 state types/columns; Batch 2 workflow events; Batch 3 workflow mutation; Batch 4 decision mutation; Batch 5 payment boundary; Phase 3 RBAC/RLS helpers; `public.has_permission(text, uuid, uuid)`. | Confirmed Finding |
| Entry criteria | Batch 1-5 implementation files exist; `claims.workflow_status` supports `appealed`; `claim_workflow_events` exists; `public.transition_claim_workflow` exists; `claim_decisions` and `claims.current_decision_id` exist; `public.has_permission(...)` exists. | Recommendation |
| Exit criteria | Appeal table and controlled functions are implemented and tested; all blocking Open Decisions for Batch 6 are zero; tenant isolation, direct-write protection, stale-version behavior, atomic rollback, and evidence immutability are covered by tests. | Recommendation |

### 29.3 Domain and Source of Truth

| Concept | Contract | Classification |
| --- | --- | --- |
| Formal appeal | A payer-facing or reviewer-controlled challenge to a prior payer decision, represented by one durable appeal case record. | Approved Decision |
| Authoritative object | `public.claim_appeals` is the authoritative object for appeal reason, sequence, owner, submission, deadline, payer reference, evidence, and outcome linkage. | Recommendation |
| Workflow summary | `claims.workflow_status = appealed` is a current operational summary only and must not store appeal-specific facts. | Approved Decision |
| Decision boundary | Appeal outcome may reference an authoritative `claim_decisions` row when a payer decision exists; the appeal operation must not fabricate approval, rejection, payment, refund, or reversal. | Recommendation |
| Payment boundary | Appeal mutation must not change `claims.payment_status`, `claims.total_paid_amount`, `claim_payments`, allocations, or reconciliations. | Recommendation |
| Tenant ownership | Appeal records inherit `organization_id` and `clinic_id` from the locked parent Claim and must reject caller-supplied tenant authority. | Recommendation |

### 29.4 Proposed Database Objects

Proposed table: `public.claim_appeals`.

Minimum justified fields:

```text
id
organization_id
clinic_id
claim_id
appeal_sequence
appeal_status
appeal_reason_code
appeal_reason_text
submitted_by
submitted_at
deadline_at
owner_user_id
payer_reference
external_event_id
evidence_package_id
outcome_decision_id
resolved_at
created_at
created_by
updated_at
updated_by
deleted_at
```

Minimum appeal statuses:

```text
draft
submitted
under_review
request_information
approved
partially_approved
rejected
withdrawn
closed
```

Constraints and invariants:

- `organization_id`, `clinic_id`, and `claim_id` must reference the parent Claim with tenant-safe keys.
- `(organization_id, clinic_id, claim_id, appeal_sequence)` must be unique.
- `appeal_sequence` must be allocated while the Claim row is locked.
- Submitted appeals require `appeal_reason_code` and `submitted_by`.
- Outcome statuses require `outcome_decision_id` when an authoritative decision exists.
- `deleted_at` is only for administrative recovery or cancellation scope explicitly approved by RLS; resolved appeal evidence must not be hard-deleted by ordinary actors.
- Metadata, if any, must not be a substitute for core appeal fields and must not contain unrestricted PHI/PII.

Minimum indexes:

```text
(organization_id, clinic_id, appeal_status, deleted_at)
(organization_id, claim_id, appeal_sequence)
(organization_id, owner_user_id, appeal_status)
(organization_id, deadline_at) where deadline_at is not null
(outcome_decision_id) where outcome_decision_id is not null
```

### 29.5 Controlled Mutations

Proposed functions:

```text
public.submit_claim_appeal(
  p_claim_id uuid,
  p_expected_version integer,
  p_appeal_reason_code text,
  p_appeal_reason_text text default null,
  p_deadline_at timestamptz default null,
  p_owner_user_id uuid default null,
  p_payer_reference text default null,
  p_evidence_package_id uuid default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
```

Return:

```text
claim_id uuid
appeal_id uuid
appeal_sequence integer
previous_workflow_status public.claim_workflow_state_domain
workflow_status public.claim_workflow_state_domain
version integer
workflow_event_id uuid
state_updated_at timestamptz
idempotent_replay boolean
```

```text
public.resolve_claim_appeal(
  p_appeal_id uuid,
  p_expected_version integer,
  p_target_appeal_status text,
  p_reason_code text,
  p_reason_text text default null,
  p_outcome_decision_id uuid default null,
  p_resolved_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
```

Return:

```text
claim_id uuid
appeal_id uuid
appeal_status text
workflow_status public.claim_workflow_state_domain
version integer
state_updated_at timestamptz
idempotent_replay boolean
```

Required operation model:

```text
authenticate
-> resolve trusted actor and tenant from locked Claim/Appeal
-> authorize
-> validate ownership and current state
-> validate expected Claim version
-> validate appeal operation
-> create or update appeal evidence
-> write workflow event only when workflow_status changes
-> update canonical Claim workflow snapshot when applicable
-> return canonical result
```

Submit behavior:

- Authorized actor requires `claim.appeal.submit` or an approved equivalent.
- Claim must not be soft-deleted.
- Claim workflow should be `under_review` or another approved post-decision review state; pre-submission and terminal states require explicit rejection unless a later approved rule allows them.
- Success creates one appeal record, sets workflow to `appealed` through the same transition authority or equivalent atomic logic, writes workflow evidence, increments `claims.version` once, and does not mutate decision or payment snapshots.

Resolve behavior:

- Authorized actor requires `claim.appeal.decide` or an approved equivalent.
- Resolution must preserve appeal evidence and may link `outcome_decision_id` to an existing authoritative decision in the same tenant/clinic/Claim.
- Resolution must not create a payer decision unless separately orchestrated through `public.record_claim_decision`.
- Resolution must not change payment state.

### 29.6 Security, Audit, Concurrency, and Idempotency

Security:

- `claim_appeals` SELECT requires Claim read or appeal read permission within organization/clinic scope.
- Ordinary INSERT/UPDATE/DELETE must be denied except through controlled functions or narrow administrative recovery paths.
- Functions use `SECURITY DEFINER`, fixed `search_path = public, private, auth, pg_temp`, schema-qualified objects, no EXECUTE to `PUBLIC` or `anon`, and EXECUTE only for approved `authenticated` and `service_role`.
- Caller must not provide authoritative actor, organization, clinic, current state, appeal sequence, or resulting Claim version.

Audit and immutable evidence:

- Each submit/resolve action records actor, permission boundary, source, reason, request identity, timestamps, and correlation ID.
- Failed operations write no appeal evidence, no workflow event, and no Claim snapshot change.
- Direct hard delete of submitted/resolved appeals by ordinary users is prohibited.

Concurrency and idempotency:

- Use `claims.version` as the sole optimistic lock for appeal submit/resolve operations.
- Success increments `claims.version` exactly once.
- Stale expected version fails with no data change.
- External appeal events use `organization_id + source_system + external_event_id` when supplied.
- Equivalent replay returns the prior result with `idempotent_replay = true`; conflicting replay fails with no data change.

### 29.7 Proposed Files and Execution Order

Allowed implementation artifacts for a future Batch 6 implementation:

```text
supabase/migrations/20260722163000_phase4_claim_appeals.sql
supabase/tests/phase4_claim_appeal_test.sql
supabase/tests/phase4_claim_appeal_security_test.sql
```

This contract-definition task does not create those files.

Future implementation order:

1. Create appeal status domain/table and `claim_appeals`.
2. Add minimal appeal permissions and grants.
3. Add RLS and direct-write protection.
4. Add controlled submit and resolve functions.
5. Add functional and security pgTAP tests.
6. Rerun Batch 1-5 regression tests.

### 29.8 Open Decisions

| Decision | Why required | Options | Recommended option | Decision owner | Implementation blocker |
| --- | --- | --- | --- | --- | --- |
| Exact appeal submit eligibility | Prevent invalid appeals before a payer decision or from terminal states | Restrict to `under_review`; allow selected post-decision states; allow elevated terminal reopen plus appeal | Restrict Batch 6 submit to `under_review` and already appealed-compatible workflows; require later rule for terminal exceptions | Claim Domain Owner | NO |
| Appeal outcome to workflow mapping | Avoid silently closing or reopening Claims on appeal resolution | No workflow change; move `appealed -> under_review`; move `appealed -> closed` for final outcomes | No automatic closure; keep workflow change explicit or limited to `appealed -> under_review` after request-information | Claim Domain Owner / Product Owner | NO |
| Appeal permissions naming | Reuse existing permission names where equivalent | Add `claim.appeal.view/create/submit/decide`; reuse `claim.review`; mix model | Add precise appeal permissions if no exact existing names are found | Security Lead | NO |
| Multi-round appeal scope | Decide whether Batch 6 handles only one appeal or multiple sequences | Single appeal only; multiple sequenced appeals; full multi-level automation | Multiple sequenced records with no multi-level automation | Product Owner / Claim Domain Owner | NO |

Blocking Open Decisions: `0`

### 29.9 Readiness

Batch 6 contract readiness: `READY FOR BATCH 6`.

Approval status: `Approved`.

Approval date: `2026-07-23`.

Approval reference: `Phase 4 Batch 6 Contract Approval Closure`.

Migration implementation authorization: `YES`.

---

## 30. Proposed Batch 7 Contract - Controlled Claim Refund Lifecycle Mutations

**Batch name:** Phase 4 Batch 7 - Controlled Claim Refund Lifecycle Mutations
**Status:** Ready for Owner Approval
**Objective:** Define the smallest independently deployable financial-exception contract after Batch 1-6 by adding controlled refund evidence and Claim payment summary synchronization without changing workflow, payer decision, appeal, legacy status, application code, generated types, migrations, or tests in this contract task.
**Contract completeness:** COMPLETE
**Contract approval:** APPROVED
**Approval date:** 2026-07-23
**Approver role:** Project Owner
**Approval source:** Explicit Project Owner instruction
**Approval reference:** Phase 4 Batch 7 Owner Approval Recording
**Implementation gate:** READY
**Implementation authorization:** YES
**Semantic contract changed during approval:** NO

### 30.1 Repository Evidence and Candidate Selection

| Candidate | Evidence strength | Dependency readiness | Open-decision count | Duplication risk | Selection |
| --- | --- | --- | --- | --- | --- |
| Controlled Claim Refund Lifecycle Mutations | Strong. ADR-003 states partial and full refund are required before production; Batch 1 already defines `partially_refunded` and `refunded`; Batch 5 explicitly excludes refund lifecycle; static search found no `record_claim_refund` function. | Ready after Batch 1-6 validation; relies on split payment status, payment settlement authority, and independent appeal boundary. | 0 blocking when scope is limited to refund only and refund ceiling is defined as settled-paid minus prior successful refunds. | Low; reuses `claim_payments` instead of creating a duplicate payment source of truth. | Selected |
| Broader reversal lifecycle | Medium. Reversal fields and `claim.payment.reverse` exist, and Batch 5 can record reversed settlement evidence; no standalone `record_claim_reversal` function exists. | Partially ready, but broad event ordering and reversal automation remain separate concerns. | Non-blocking for refund-only Batch 7. | Medium if it duplicates Batch 5 reversal handling. | Deferred |
| Legacy split-state backfill and cutover | Strong as a Phase 4 responsibility, but ADR-008 requires staged retirement and application/type integration inventory. | Not ready until refund exception state is stable and cutover inventory is accepted. | Blocking for cutover, not for Batch 7 refund contract. | Medium/high because readers and writers may diverge. | Deferred |

Confirmed Finding: Batch 6 runtime validation is recorded as `PASS` in the Phase 4 test plan with Batch 7 analysis prerequisite `SATISFIED`. Repository migrations and tests exist through Batch 6, including `20260722163000_phase4_claim_appeals.sql`, `phase4_claim_appeal_test.sql`, and `phase4_claim_appeal_security_test.sql`.

Recommendation: Select exactly one Batch 7 responsibility: controlled refund lifecycle mutation. The selected scope closes the remaining production-required refund gap from ADR-003 while preserving the already implemented Batch 5 settlement and reversal evidence boundary.

### 30.2 Identity and Scope

| Contract Field | Value |
| --- | --- |
| Proposed title | Phase 4 Batch 7 - Controlled Claim Refund Lifecycle Mutations |
| Business objective | Preserve partial and full refunds as auditable financial exception evidence and synchronize `claims.payment_status` without overwriting original payment, decision, workflow, or appeal history. |
| Single primary responsibility | Controlled refund recording and refund-derived Claim payment summary synchronization. |
| In scope | Refund evidence in existing payment authority model; `partially_refunded` and `refunded` summary states; refund ceiling; idempotency; tenant/clinic/RBAC/RLS contract; direct-write protection; functional/security regression contract. |
| Out of scope | New payment gateway integration, broad standalone reversal automation, overpayment recovery, chargebacks, accounting ledger, payment allocation redesign, reconciliation redesign, workflow mutation, decision mutation, appeal mutation, legacy `claims.status` removal, backend/API/frontend/generated type changes, seed data, fixtures, database reset, SQL tests, and implementation. |
| Dependencies | Validated Batch 1 split payment status; Batch 3 controlled workflow independence; Batch 4 decision independence; Batch 5 `record_claim_payment_settlement`; Batch 6 appeal independence; Phase 3 `claim_payments`, allocations, reconciliations, payment references, exact numeric amounts, tenant-safe keys, audit, RBAC/RLS helpers, and `public.has_permission(text, uuid, uuid)`. |
| Entry criteria | Batch 1-6 migrations/tests present; Batch 6 runtime validation recorded PASS; `claims.payment_status` supports `partially_refunded` and `refunded`; at least one successful settled payment exists for the Claim; refund actor has approved finance authority; refund amount, currency, reason, expected version, and idempotency identity are supplied where required. |
| Exit criteria | Future implementation provides exactly one controlled refund path; original payment evidence remains unchanged; refund ceiling is enforced; Claim payment summary and totals are transactionally synchronized; unauthorized, stale, cross-tenant, duplicate, over-refund, currency-mismatch, and AI-authority cases write nothing; blocking Open Decisions equal zero. |

### 30.3 Domain Ownership

| Concept | Business Meaning | Existing Source of Truth | Tenant Ownership | Authority Owner | Lifecycle | Relationship to Batch 1-6 |
| --- | --- | --- | --- | --- | --- | --- |
| Original payment | Settled payment evidence received from payer or authorized finance fallback. | `public.claim_payments` and related allocation/reconciliation records. | Inherited from locked Claim and payment row. | Payment/reconciliation integration or authorized Finance. | Preserved immutable financial evidence after settlement. | Batch 5 records payment settlement and may record minimal reversal evidence. |
| Refund | Funds returned after a successful payment, represented as distinct negative financial evidence. | Reuse `public.claim_payments` as transaction evidence unless implementation proves a materially separate refund object is required for lifecycle, authority, or immutability. | Derived from locked parent Claim and original payment; caller-supplied tenant values are not trusted. | Authorized Finance or trusted payment integration only. | Requested/recorded as refund evidence; successful refund contributes to `partially_refunded` or `refunded`; failed attempts must not change settled totals. | Extends Batch 5 payment authority without mutating workflow, decision, or appeal state. |
| Refund ceiling | Maximum refundable amount for a Claim. | Derived from successful settled payments minus prior successful refunds for the same Claim and currency. | Same Claim tenant scope. | Database-controlled financial invariant. | Recomputed inside locked transaction before insert/update. | Uses Batch 5 payment summary and exact numeric model. |
| Claim payment summary | Current operational payment state for queues and dashboards. | `claims.payment_status` and `claims.total_paid_amount` as synchronized summary; payment rows remain authoritative. | Locked Claim organization/clinic. | Controlled payment/refund functions only. | Updated atomically after authoritative refund evidence. | Preserves split-state model from Batch 1 and controlled payment boundary from Batch 5. |

Canonical state and immutable evidence:

- Original successful payment rows must not be overwritten by refund recording.
- Refund rows or refund evidence are financial history, not payer decision history.
- `claims.workflow_status`, `claims.decision_status`, `claims.current_decision_id`, `claim_decisions`, and `claim_appeals` must remain unchanged by the refund mutation.

### 30.4 Proposed Objects and Mutations

Proposed mutation:

```text
public.record_claim_refund(
  p_claim_id uuid,
  p_original_payment_id uuid,
  p_expected_version integer,
  p_refund_amount numeric,
  p_reason_code text,
  p_reason_text text,
  p_refunded_at timestamptz default null,
  p_source_system text default 'internal',
  p_external_event_id text default null,
  p_correlation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
```

Return contract:

```text
claim_id uuid
refund_payment_id uuid
original_payment_id uuid
previous_payment_status public.claim_payment_state_domain
payment_status public.claim_payment_state_domain
version integer
total_paid_amount numeric
refunded_amount numeric
net_paid_amount numeric
state_updated_at timestamptz
idempotent_replay boolean
```

Required behavior:

1. Resolve actor from `auth.uid()` or approved integration context.
2. Lock the Claim by `p_claim_id` and `deleted_at is null`.
3. Validate organization and clinic from the locked Claim and original payment.
4. Validate approved refund permission, recommended as `claim.payment.refund` unless an exact existing equivalent is found.
5. Validate `p_expected_version = claims.version`.
6. Validate original payment belongs to the same tenant, clinic, Claim, currency, and successful settled payment evidence.
7. Validate `p_refund_amount > 0`, rounded to approved scale, and not greater than refundable settled amount.
8. Validate `p_reason_code` and nonblank `p_reason_text`.
9. Validate idempotency for external events using `organization_id + source_system + external_event_id` when supplied.
10. Insert or record authoritative refund evidence before updating the Claim summary.
11. Set `claims.payment_status` to `partially_refunded` when net settled amount remains above zero and below prior settled amount.
12. Set `claims.payment_status` to `refunded` when refundable settled amount is fully refunded.
13. Update `claims.total_paid_amount` only according to the approved repository meaning: if it represents gross received amount, preserve gross and return net separately; if it represents current net settlement, update it to net settled amount. The implementation must stop if this semantic cannot be verified.
14. Increment `claims.version` exactly once on successful non-replay refund.
15. Commit refund evidence, summary update, version update, and audit evidence together or roll all back.

Replay behavior:

- Equivalent external retry returns the prior refund result with `idempotent_replay = true`, no new refund evidence, and no version increment.
- Conflicting retry with the same external identity fails with no data change.
- Internal human duplicate without external identity relies on optimistic locking and the refund ceiling.

### 30.5 Security and Tenant Contract

- Preserve Supabase Auth, organization isolation, clinic isolation, RBAC, RLS, least privilege, optimistic locking, atomicity, immutable evidence, sanitized errors, AI non-authority, and Human-in-the-Loop accountability.
- Refund execution must be limited to `authenticated` and `service_role` where repository convention supports it; no EXECUTE to `PUBLIC` or `anon`.
- Use `SECURITY DEFINER` only with fixed safe `search_path = public, private, auth, pg_temp`, schema-qualified objects, and no caller-trusted organization, clinic, actor, or role values.
- Ordinary users must not directly insert refund evidence, update original settled payment rows into refunds, delete financial evidence, or directly update `claims.payment_status`, `claims.total_paid_amount`, `claims.version`, `state_updated_at`, or `state_updated_by`.
- Cross-tenant, cross-clinic, missing-permission, stale-version, missing-original-payment, over-refund, currency mismatch, and idempotency-conflict errors must not reveal PHI, tenant existence, internal policy names, or raw SQL diagnostics.
- AI/system recommendation context may flag refund review needs but must not record, approve, or finalize refunds.

### 30.6 Migration Contract

| Item | Contract |
| --- | --- |
| Migration responsibility | Add the controlled refund mutation and only the minimal supporting permission, constraints, indexes, grants, or comments required to preserve the existing payment source of truth and summary synchronization. |
| Proposed file path | `supabase/migrations/20260722164000_phase4_claim_refund_mutation.sql` |
| Dependency order | Must run after `20260722163000_phase4_claim_appeals.sql` and must not modify Batch 1-6 migration history. |
| Allowed files for future implementation | `supabase/migrations/20260722164000_phase4_claim_refund_mutation.sql`; `supabase/tests/phase4_claim_refund_mutation_test.sql`; `supabase/tests/phase4_claim_refund_security_test.sql`; tightly scoped updates to existing Phase 4 schema/payment regression tests only when existing assertions must recognize approved refund behavior. |
| Prohibited files in this contract task | All SQL migrations, SQL tests, database objects, generated types, application code, fixtures, seed files, commits, and pushes. |
| Forward-only correction strategy | Any implementation mistake is corrected by a later migration; applied Batch 1-6 migrations are never rewritten. |
| Implementation stop conditions | `claims.total_paid_amount` semantic cannot be verified; existing payment table cannot safely represent refund evidence; refund ceiling cannot be calculated from authoritative rows; tenant-safe original payment linkage is missing; required permission model cannot be enforced without weakening existing RLS; refund behavior requires payment allocation/reconciliation redesign. |
| Validation gates | `git diff --check`; Supabase reset/lint/test for refund files and Batch 1-6 regressions; direct-write denial tests; no workflow/decision/appeal mutation from refund; no legacy status removal. |

### 30.7 Acceptance Criteria and Open Decisions

| Acceptance Criterion | Status |
| --- | --- |
| One responsibility selected | Satisfied - controlled refund lifecycle mutation only. |
| Scope and exclusions explicit | Satisfied. |
| Source of truth and authority boundaries defined | Satisfied - reuse payment evidence; no duplicate financial table unless implementation stop condition is hit. |
| Tenant and security behavior complete | Satisfied for contract. |
| Mutation and rollback behavior defined | Satisfied. |
| Migration and test responsibilities explicit | Satisfied. |
| Blocking Open Decisions | 0 |

Open Decisions:

| Issue | Options | Recommendation | Owner | Blocking |
| --- | --- | --- | --- | --- |
| Broader reversal automation after Batch 5 minimal reversed settlement evidence | Keep Batch 5-only reversal evidence; add standalone reversal orchestration; combine with refund | Defer standalone reversal orchestration until repository evidence shows Batch 5 reversal handling is insufficient. | Finance Owner / Database Architect | NO |
| Whether `claims.total_paid_amount` remains gross received or becomes net settled after refund | Gross received; net settled; separate generated/read model | Verify implementation semantics before SQL; stop if not verifiable. | Finance Owner / Database Architect | NO for contract, YES for implementation if unresolved |

Blocking Open Decisions: `0`

Contract readiness: `APPROVED - Batch 7 contract is complete and owner-approved`.

### 30.8 Contract Approval Closure

| Gate | Result | Evidence |
| --- | --- | --- |
| Business purpose and non-goals | COMPLETE | Section 30.2 defines refund lifecycle purpose and excludes gateway integration, reversal automation, chargeback, accounting ledger, reconciliation redesign, workflow, decision, appeal, legacy status removal, app code, generated types, migrations, and tests from this contract task. |
| Refund eligibility and authority | COMPLETE | Sections 30.2-30.5 require a successful settled original payment, Finance or trusted payment integration authority, and `claim.payment.refund` or exact equivalent permission. |
| Refund lifecycle and transitions | COMPLETE | Section 30.4 defines a single controlled refund mutation with partial/full summary effects and replay behavior. No unapproved states are added. |
| Source payment and refund sources of truth | COMPLETE | Section 30.3 reuses `public.claim_payments` and related records; no duplicate payment truth is approved. |
| Tenant, RBAC, and RLS behavior | COMPLETE | Section 30.5 requires locked tenant/clinic derivation, controlled function-only mutation, restricted grants, direct-write denial, and sanitized errors. |
| Amount and currency integrity | COMPLETE | Section 30.4 requires positive exact numeric refund amount, approved rounding, same-currency original payment validation, and refund ceiling enforcement. |
| Controlled mutation boundaries | COMPLETE | Refund mutation cannot change workflow, decision, appeal, original settlement history, legacy status, or unrelated Batch 1-6 behavior. |
| Optimistic locking and concurrency | COMPLETE | `claims.version`, Claim row lock, stale-version rejection, and single success increment are required. |
| Replay and idempotency | COMPLETE | External retry identity and equivalent/conflicting replay behavior are defined per refund mutation. |
| Immutable history and audit evidence | COMPLETE | Original payment evidence is preserved; refund evidence, summary update, version update, and audit evidence are atomic. |
| Atomic rollback behavior | COMPLETE | Failed mutation must write no partial refund evidence, summary change, version increment, or audit side effect. |
| Migration and test responsibilities | COMPLETE | Section 30.6 defines future migration/test files, allowed files, prohibited files, dependency order, stop conditions, and validation gates. |
| Recorded approval evidence | APPROVED | Explicit Project Owner instruction recorded approval on 2026-07-23 with approval reference `Phase 4 Batch 7 Owner Approval Recording`. |

Contract Completeness Status: `COMPLETE`

Contract Approval Status: `APPROVED`

Implementation Gate Status: `READY`

Migration Implementation Authorized: `YES`

Semantic Contract Changed During Approval: `NO`

Implementation gate decision: Batch 7 migration and SQL-test implementation is authorized only for the approved refund lifecycle scope.

---

## 31. Phase 4 Completion-Readiness Decision

| Field | Value |
| --- | --- |
| Phase | Phase 4 |
| Decision | READY |
| Decision date | 2026-07-23 |
| Analyzed commit | `9785951e6d457a59a034d2622cad41e28c2fad23` |
| Branch | `main` |
| Validated target | `ab84c83fb781df4336d50964d93012df0af92fde` |
| Active required batches | 7/7 complete |
| Completion evidence reference | `docs/database/PHASE-4-CLAIM-TEST-PLAN.md` Section 44, Batch 7 Runtime Validation Closure |
| Required validation status | PASS |
| Blocking open decisions | 0 |
| Blocking technical issues | 0 |
| Blocking security issues | 0 |
| Material contract contradictions | 0 |
| Formal closure task readiness | YES |
| Record action | RECORDED |
| Recommended next action | Create the separate formal Phase 4 closure record. |

### 31.1 Evidence Basis

The active Phase 4 required batch set is Batch 1 through Batch 7:

| Batch | Required scope | Completion evidence | Required validation |
| --- | --- | --- | --- |
| Batch 1 | Split-state schema | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 2 | Workflow history | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 3 | Controlled workflow mutation | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 4 | Controlled decision mutation | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 5 | Controlled payment settlement mutation | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 6 | Formal claim appeal entity and controlled appeal mutations | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |
| Batch 7 | Controlled claim refund lifecycle mutation | Runtime validation closure in `PHASE-4-CLAIM-TEST-PLAN.md` Section 44 | PASS |

The validated target is `ab84c83fb781df4336d50964d93012df0af92fde`. The analyzed commit is later only because the Batch 7 validation closure documentation was recorded in `docs/database/PHASE-4-CLAIM-TEST-PLAN.md`; no post-validation migration, SQL test, database object, application implementation, Phase 4 contract, or required validation-scope change was identified.

Material advisories and deferred scope remain as approved exclusions or separate future work: dedicated `claim_line_decisions`, full accounting ledger, multi-currency settlement, overpayment recovery, chargeback workflow, multi-level appeal automation, physical removal of legacy `claims.status`, production deployment, Phase 5 authorization, and any Batch 8 scope definition.

### 31.2 Readiness Boundary

This decision means only:

```text
Formal Closure Task Readiness: YES
```

It does not create business approval, owner sign-off, release approval, Batch 8 authorization, Phase 5 authorization, deployment approval, or production readiness.

### 31.3 Repository Scope

| Scope item | Result |
| --- | --- |
| Initial changed files | NONE |
| Pre-existing changes | NONE |
| Migrations modified by this decision task | NO |
| SQL tests modified by this decision task | NO |
| Implementation modified by this decision task | NO |
| Semantic contract changed | NO |
| Formal closure record created | NO |
| Later-phase scope defined | NO |
| Pre-existing changes discarded | NO |

Phase 4 Completion-Readiness Decision: `READY`

Formal Closure Task Readiness: `YES`
