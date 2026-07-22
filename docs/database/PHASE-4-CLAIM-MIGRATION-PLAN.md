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
| Approval basis | ADR-001 through ADR-008 |
| Required reviewers | Product Owner, Claim Domain Owner, Database Architect, Security Lead, Finance Owner, Integration Owner, Backend Lead, QA Lead |
| Execution gate | Do not execute migrations until ADR approval evidence and all P1 dependencies are recorded |

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
| GATE-001 | ADR approval evidence | ADR-001 through ADR-008 are marked `Approved`, with approvers and approval date |
| GATE-002 | Payment source of truth | Existing `claim_payments`, allocations, and reconciliations are confirmed authoritative |
| GATE-003 | Decision authority | Payer integration and manual fallback authority are approved |
| GATE-004 | Payment authority | Payment integration and Finance fallback authority are approved |
| GATE-005 | External event strategy | Stable external event ID, idempotency key, source timestamp, and ordering rules are documented |
| GATE-006 | Currency rules | Claim currency, numeric scale, rounding, reconciliation tolerance, and refund ceiling are approved |
| GATE-007 | Appeal scope | Formal Appeal minimum fields and permissions are approved |
| GATE-008 | Reopen rules | Allowed source/target states, time limits, and revision rules are approved |
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

**Implementation gate:** Blocked until explicit ADR approval evidence and all P1 dependencies are recorded.

**Migration approach:** Additive schema → authoritative event/domain records → controlled operations → RBAC/RLS → deterministic backfill → validation guards → compatible reads → controlled writes → UI/API cutover → staged legacy retirement.

**P0 safeguards:** Tenant isolation, protected state columns, payment integrity, event idempotency, deterministic backfill, and authoritative decision/payment records.

**Deferred:** Dedicated line adjudication, multi-currency, advanced recovery, multi-level appeals, automated AI adjudication, production webhooks, full ledger, and physical legacy-column removal.

## 24. Change Log

| Date | Version | Change | Author |
| --- | --- | --- | --- |
| 2026-07-22 | 0.1 | Created Phase 4 Claim migration plan from ADR-001 through ADR-008, including gates, migration sequence, state mapping, controlled operations, security, backfill, cutover, validation, and exit criteria | AI-assisted Database Architecture Lead |
