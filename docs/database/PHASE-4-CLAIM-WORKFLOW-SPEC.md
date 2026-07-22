# PHASE-4-CLAIM-WORKFLOW-SPEC

## Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform

**Document Type:** Database and Domain Architecture Specification
**Phase:** Phase 4 — Core Claim Workflow
**Status:** Draft for Implementation
**Primary Domains:** Claim Workflow, Payer Decision, Payment Settlement, Appeal, Audit, RBAC, RLS
**Platform:** PostgreSQL / Supabase / Next.js / TypeScript
**Language Direction:** English-first with Thai supporting explanations

---

## 1. Purpose

This document defines the Phase 4 Claim Workflow architecture for Med AI NexSure.

Phase 4 replaces any overloaded Claim `status` model with three independent but validated state dimensions:

```text
workflow_status
decision_status
payment_status
```

The design follows this authoritative model:

```text
Current state
+ domain events
+ authority
+ financial transactions
+ tenant security
+ auditability
```

The specification covers:

- Claim lifecycle and state transitions
- Current-state storage on `public.claims`
- Workflow events
- Payer adjudication decisions
- Payment transactions
- Appeals
- Claim-line adjudication
- Financial aggregation
- Cross-dimension consistency
- Concurrency and idempotency
- RBAC and RLS
- Backend contracts
- UI and analytics impact
- Migration and validation strategy

This document is a design specification. It must not be treated as proof that migrations, tests, or validation commands have already been executed.

---

## 2. Business Objective

A Claim must not use one status field to represent:

1. Internal operational workflow
2. Payer adjudication outcome
3. Financial settlement

The following is a valid business state:

```text
workflow_status = decision_received
decision_status = approved
payment_status = pending
```

This means the payer approved the Claim, but payment has not yet been received.

The architecture must not assume:

```text
approved = paid
closed = approved
closed = financially settled
rejected = workflow completed
cancelled = decision voided
```

The system must support independent states while preventing contradictory combinations.

---

## 3. Scope

### 3.1 In Scope

- Claim current-state architecture
- Workflow lifecycle
- Payer decision lifecycle
- Payment lifecycle
- Appeal lifecycle
- Claim-line adjudication
- Claim financial aggregation
- Claim readiness integration
- Controlled mutation functions
- Concurrency control
- External event idempotency
- RBAC permissions
- RLS policies
- Auditability
- Migration and backfill
- Backend and frontend contract changes
- Database and application test requirements

### 3.2 Out of Scope Unless Confirmed by Repository

- New payer integration protocols
- New payment gateway implementation
- New accounting ledger
- New readiness scoring weights
- Automatic AI adjudication
- Destructive removal of legacy Claim status during initial cutover
- Business rules not supported by repository evidence

---

## 4. Design Principles

The Claim architecture must follow these principles:

1. **Separate state domains**
   Workflow, decision, and payment states are independent.

2. **Current state for operational queries**
   Current-state fields remain on `claims` for queues, filters, and dashboards.

3. **Domain events for history**
   Workflow, payer decision, payment, and appeal histories are stored separately.

4. **Database remains authoritative**
   TypeScript and Zod validation supplement, but do not replace, database integrity.

5. **Tenant isolation by default**
   Organization and clinic access are enforced through database membership and RLS.

6. **Human-in-the-Loop**
   AI may recommend but must not approve, reject, pay, refund, reverse, or close Claims.

7. **No lost updates**
   Optimistic concurrency and row locking protect sensitive multi-actor workflows.

8. **External events are idempotent**
   Duplicate payer or payment events must not create duplicate history or amounts.

9. **Forward-only migration**
   Previously applied migrations must not be rewritten.

10. **Audit every material change**
    Sensitive changes require actor, source, reason, timestamps, and correlation context.

---

## 5. Repository Inspection Requirements

Before implementation, inspect the actual repository.

Review at minimum:

```text
supabase/migrations/**/*.sql
supabase/tests/**/*.sql
supabase/seed.sql
lib/database.types.ts
features/**/*
app/**/*
docs/database/**/*
docs/architecture/**/*
docs/product/**/*
```

Search globally for:

```text
claim.status
claim_status
claimStatus
workflow_status
decision_status
payment_status
approved
partially_approved
rejected
submitted
paid
refunded
closed
cancelled
```

The implementation must identify:

- Current Claim table and status definitions
- Existing enums and constraints
- Claim line-item structures
- Claim assignments
- Claim readiness logic
- Payer decision records
- Payment or reconciliation records
- Appeal records
- Audit history
- RLS policies and helper functions
- RBAC permissions
- API DTOs and service methods
- UI filters, badges, and dashboards
- Existing pgTAP conventions and fixtures

When documentation conflicts with code, the latest applicable migration is the source of truth.

No table, column, policy, function, permission, or status may be invented without repository inspection.

---

## 6. Claim Current-State Model

The `public.claims` table must maintain efficient current-state fields.

### 6.1 Required State Columns

```text
workflow_status
decision_status
payment_status
payment_reason_code
version
```

### 6.2 Milestone Timestamps

Where applicable:

```text
submitted_at
payer_acknowledged_at
decision_received_at
appealed_at
closed_at
cancelled_at
first_payment_at
fully_paid_at
```

### 6.3 Operational Purpose

These columns support:

- Claim work queues
- Claim list filters
- Operational dashboards
- SLA reports
- Current assignment views
- Fast tenant-scoped queries

The application must not derive current status by scanning full event history for every list request.

---

## 7. Controlled State Definitions

## 7.1 Workflow Status

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
closed
cancelled
```

`workflow_status` represents operational lifecycle only.

It must not contain:

- Payer decision outcome
- Payment settlement outcome
- Detailed review reason
- Fraud risk result
- Missing evidence reason

---

## 7.2 Decision Status

```text
pending
approved
partially_approved
rejected
voided
```

`decision_status` represents the current authoritative payer adjudication result.

Rules:

- `pending` means no final effective payer decision exists.
- `approved` means all eligible payable lines are approved.
- `partially_approved` means at least one payable amount is approved and at least one line is rejected, excluded, reduced, or adjusted.
- `rejected` means no payable line is approved.
- `voided` means a previous authoritative decision was invalidated or reversed.

A pre-submission cancellation must not automatically set `decision_status = voided`.

---

## 7.3 Payment Status

```text
not_billable
pending
partially_paid
paid
payment_failed
partially_refunded
refunded
reversed
```

If `partially_refunded` or `reversed` are deferred from MVP, the database design must preserve a safe future extension path.

### Payment Reason Codes

`not_billable` must include a supporting `payment_reason_code`, for example:

```text
pre_submission
rejected
cancelled
zero_approved_amount
non_reimbursable
voided
```

---

## 8. Domain Event Architecture

The target model uses current state plus authoritative domain events.

Required event tables:

```text
claim_workflow_events
claim_decisions
claim_payment_transactions
claim_appeals
```

A single generic text history table must not be the sole source of truth for all Claim domains.

---

## 9. Claim Workflow Events

### 9.1 Table Purpose

`claim_workflow_events` records every successful workflow transition.

### 9.2 Required Fields

```text
id
claim_id
organization_id
clinic_id
previous_status
new_status
reason_code
reason_text
occurred_at
recorded_at
changed_by
change_source
correlation_id
metadata
```

### 9.3 Event Rules

- One event per successful transition
- No event for failed transitions
- Actor and source must be recorded
- Previous and new status must be preserved
- Reason code is required for material exceptions
- Terminal-state reopen requires a dedicated event
- Organization and clinic ownership must match the parent Claim

---

## 10. Claim Decisions

### 10.1 Table Purpose

`claim_decisions` stores authoritative payer adjudication rounds.

### 10.2 Required Fields

```text
id
claim_id
organization_id
clinic_id
decision_sequence
decision_type
decision_status
approved_amount
rejected_amount
decision_date
effective_at
received_at
recorded_at
payer_reference
reason_codes
is_current
supersedes_decision_id
source_system
external_event_id
recorded_by
metadata
```

### 10.3 Decision Rules

- Multiple adjudication rounds must be preserved
- Only one effective current decision should exist per Claim
- New decisions may supersede earlier decisions
- `voided` requires a prior authoritative decision
- Older out-of-order events must not overwrite newer effective decisions
- Corrections, reversals, and supersessions must be explicit
- `claims.decision_status` is a current-state snapshot of the effective decision
- The payer integration or explicitly authorized adjudication role is authoritative

---

## 11. Claim Payment Transactions

### 11.1 Table Purpose

`claim_payment_transactions` stores financial transactions rather than only a summary status.

### 11.2 Supported Transaction Types

```text
payment
refund
reversal
adjustment
```

### 11.3 Required Fields

```text
id
claim_id
organization_id
clinic_id
transaction_type
transaction_status
amount
currency_code
payment_reference
external_event_id
occurred_at
received_at
recorded_at
source_system
recorded_by
metadata
```

### 11.4 Payment Rules

- Multiple payments must be supported
- Partial payments must be supported
- Refunds and reversals must not overwrite prior transactions
- Duplicate external events must not double-count amounts
- Currency consistency must be enforced
- Payment summary must be recalculated transactionally
- Payment and refund amounts must use PostgreSQL `numeric`
- Floating-point types are prohibited

`claims.payment_status` is a derived or transactionally maintained summary.

---

## 12. Claim Appeals

### 12.1 Table Purpose

`claim_appeals` stores appeal cases independently from workflow summary state.

### 12.2 Required Fields

```text
id
claim_id
organization_id
clinic_id
appeal_sequence
appeal_status
appeal_reason_code
appeal_reason_text
submitted_at
acknowledged_at
decision_received_at
appeal_deadline
assigned_to
payer_reference
supporting_evidence
created_by
created_at
updated_at
```

### 12.3 Appeal Rules

- Multiple appeal rounds may be preserved
- `workflow_status = appealed` is only a summary
- Appeal records remain authoritative for appeal-specific data
- Appeal sequencing must be concurrency-safe
- Supporting evidence must reference approved document structures
- Organization and clinic ownership must match the parent Claim

---

## 13. Claim-Line Decision Model

Repository inspection must determine whether Claims contain:

- Service lines
- Medication lines
- Procedure lines
- Diagnosis lines
- Benefit lines

Where line-level adjudication exists, implement or preserve:

```text
claim_lines
claim_line_decisions
```

### 13.1 Claim-Level Aggregation

```text
approved
= all eligible payable lines are approved

partially_approved
= approved amount is greater than zero
  and at least one line is rejected, excluded, reduced, or adjusted

rejected
= no payable line is approved

pending
= no final effective decision exists

voided
= current effective decision has been invalidated
```

Claim-level `partially_approved` must not depend only on manual status selection when line decisions are authoritative.

---

## 14. Financial Amount Model

Repository inspection must identify and distinguish existing financial columns.

Required semantic model:

```text
submitted_amount
eligible_amount
approved_amount
rejected_amount
paid_amount
refunded_amount
net_paid_amount
outstanding_amount
currency_code
```

Recommended derived semantics:

```text
net_paid_amount = paid_amount - refunded_amount

outstanding_amount =
greatest(approved_amount - net_paid_amount, 0)
```

### 14.1 Payment Summary Rules

```text
not_billable
= no payable amount currently exists

pending
= payable amount exists and net paid amount is zero

partially_paid
= net paid amount is greater than zero
  and less than payable amount

paid
= net paid amount has settled the current payable amount

payment_failed
= latest authoritative payment attempt failed
  and settlement remains outstanding

partially_refunded
= part of a previously settled amount was refunded

refunded
= applicable paid amount was fully refunded

reversed
= an authoritative payment transaction was reversed
```

### 14.2 Required Financial Considerations

- Rounding tolerance
- Currency consistency
- Multiple payments
- Partial payments
- Refunds
- Reversals
- Adjustments
- Overpayments
- Withholding
- Copayment
- Zero approved amount

Unsupported assumptions must not be implemented without approved business rules.

---

## 15. Cross-Dimension Consistency Rules

The system must allow valid independent combinations and reject contradictions.

### 15.1 Pre-Submission Workflow

For:

```text
draft
collecting_data
validation_pending
needs_review
ready_to_submit
```

Expected baseline:

```text
decision_status = pending
payment_status = not_billable
```

Recommended payment reason:

```text
payment_reason_code = pre_submission
```

---

### 15.2 Submitted and Payer Processing

For:

```text
submitted
payer_processing
```

Expected baseline:

```text
decision_status = pending
```

Payment normally remains `not_billable` until a payable amount exists.

---

### 15.3 Decision Received

When:

```text
workflow_status = decision_received
```

The effective decision should normally be one of:

```text
approved
partially_approved
rejected
voided
```

---

### 15.4 Approved or Partially Approved

Valid payment states may include:

```text
pending
partially_paid
paid
payment_failed
partially_refunded
refunded
reversed
```

---

### 15.5 Rejected

Normal payment state:

```text
not_billable
```

Exception:

- Earlier payment may require refund or reversal

---

### 15.6 Cancelled

Valid examples:

```text
cancelled + pending + not_billable
cancelled + voided + not_billable
cancelled + voided + refunded
```

Pre-submission cancellation must not automatically void a decision.

---

### 15.7 Closed

Definition:

```text
closed = operational processing is complete
```

Valid examples:

```text
closed + approved + paid
closed + approved + pending
closed + partially_approved + partially_paid
closed + rejected + not_billable
closed + voided + refunded
```

If payment completion is required before closure, it must be implemented as an explicit configurable closure rule.

---

## 16. Workflow Transition Matrix

### 16.1 Baseline Transitions

| From | Allowed To |
|---|---|
| `draft` | `collecting_data`, `cancelled` |
| `collecting_data` | `validation_pending`, `needs_review`, `cancelled` |
| `validation_pending` | `collecting_data`, `needs_review`, `ready_to_submit`, `cancelled` |
| `needs_review` | `collecting_data`, `validation_pending`, `ready_to_submit`, `cancelled` |
| `ready_to_submit` | `submitted`, `needs_review`, `cancelled` |
| `submitted` | `payer_processing`, `decision_received`, `cancelled` under approved rules |
| `payer_processing` | `decision_received`, `appealed` where supported |
| `decision_received` | `appealed`, `closed` |
| `appealed` | `payer_processing`, `decision_received`, `closed` |
| `closed` | No ordinary transition |
| `cancelled` | No ordinary transition |

### 16.2 Reopening Terminal Claims

Reopening `closed` or `cancelled` requires:

- Dedicated operation
- Explicit permission
- Reason code
- Reason text
- Audit event
- Expected version
- Concurrency validation
- Elevated authority

### 16.3 Invalid Direct Updates

The system must reject unrestricted direct updates between arbitrary states.

For MVP, transitions should be enforced by a controlled database function or domain service.

A future transition registry may support:

```text
from_status
to_status
required_permission
requires_reason
requires_readiness
requires_decision
is_active
```

---

## 17. Reason Code Architecture

Every material action must support controlled reason codes.

Applicable domains:

- Workflow transition
- Needs review
- Validation override
- Cancellation
- Decision rejection
- Decision void
- Payment failure
- Refund
- Reversal
- Reopen
- Manual override
- Fraud review

Example reason codes:

```text
missing_document
missing_medical_certificate
icd_mismatch
coverage_uncertain
duplicate_claim
payer_rejection
benefit_limit_exceeded
payment_reconciliation_failed
payment_reversed
claim_withdrawn
manual_override
fraud_review_required
```

Store both:

```text
reason_code
reason_text
```

`reason_code` supports analytics.
`reason_text` provides context.

The platform must not rely only on unrestricted free text.

---

## 18. Authority and Source of Truth

| State Domain | Authoritative Source |
|---|---|
| Workflow | Med AI NexSure workflow services and authorized users |
| Decision | Payer integration or explicitly authorized adjudication role |
| Payment | Payment/reconciliation integration or authorized finance role |
| AI recommendation | Decision-support record only |

Required source metadata:

```text
source_system
source_reference
external_event_id
authority_type
change_source
```

Suggested `change_source` values:

```text
user
system
payer_integration
payment_integration
migration
admin_override
ai_recommendation
```

AI may recommend:

- `needs_review`
- Missing evidence
- Fraud risk
- Cost anomalies
- ICD mismatch
- Payer-rule concerns

AI must not independently set:

```text
decision_status = approved
decision_status = rejected
payment_status = paid
payment_status = refunded
payment_status = reversed
```

Human-in-the-Loop, explainability, confidence, and override auditing must be preserved.

---

## 19. Time Semantics

Business event timing must distinguish:

```text
occurred_at
effective_at
received_at
recorded_at
```

Definitions:

- `occurred_at`: when the source event happened
- `effective_at`: when the business decision became effective
- `received_at`: when Med AI NexSure received the event
- `recorded_at`: when the database stored the event

These timestamps support:

- SLA measurement
- Payer turnaround analysis
- Integration delay monitoring
- Payment settlement timing
- Audit investigation

`created_at` alone is not sufficient.

---

## 20. Concurrency and Versioning

Add optimistic concurrency to `claims`:

```text
version bigint not null default 1
```

Controlled status changes must accept:

```text
expected_version
```

The update must:

1. Match the current version
2. Perform the validated mutation
3. Increment `version`
4. Return the updated Claim

A zero-row update must return a clear concurrency conflict.

Use row locking where necessary for:

- Payment aggregation
- Decision supersession
- Appeal sequencing
- Terminal workflow transitions
- Multi-record state changes

This protects against lost updates between:

- Claim reviewer
- Clinic user
- Payer integration
- Payment integration
- Validation service
- Admin override

---

## 21. Idempotency and Event Ordering

External payer and payment events may be duplicated or arrive out of order.

Evaluate uniqueness constraints such as:

```text
unique (organization_id, source_system, external_event_id)
unique (claim_id, payer_reference)
unique (organization_id, payment_reference)
```

Final names and scopes must follow the actual repository schema.

Duplicate events must:

- Not create duplicate transactions
- Not create duplicate history
- Not double-count amounts
- Not increment version for identical payloads
- Return the previously recorded result

Older events must not overwrite newer effective decisions unless explicitly marked as:

- Correction
- Reversal
- Supersession

---

## 22. Claim Readiness Integration

Claim Readiness remains independent from workflow, decision, and payment.

Recommended transition rule:

```text
Claim may transition to ready_to_submit
only when mandatory readiness rules pass
or an authorized override is recorded
```

Passing readiness must not automatically submit the Claim.

A readiness override must record:

- Actor
- Permission
- Reason code
- Reason text
- Previous assessment
- Audit event
- Timestamp
- Correlation identifier

Existing readiness scoring weights must not change unless explicitly requested.

---

## 23. RBAC Requirements

Repository conventions must be inspected and reused.

Recommended sensitive permissions:

```text
claim.create
claim.read
claim.update
claim.submit
claim.review
claim.appeal
claim.close
claim.cancel
claim.reopen
claim.decision.record
claim.payment.record
claim.refund.record
claim.audit.read
```

Equivalent existing permission codes must be reused rather than duplicated.

### 23.1 Security Rules

- Generic `claim.update` must not allow payer decision recording
- Generic `claim.update` must not allow payment settlement
- Audit users may inspect history but not mutate state
- Only authorized roles may submit, appeal, close, cancel, reopen, record decisions, or record payments
- Terminal-state overrides require elevated permission and a reason
- AI service roles must not receive adjudication or payment authority

---

## 24. RLS Requirements

Apply tenant and clinic isolation to:

```text
claims
claim_workflow_events
claim_decisions
claim_line_decisions
claim_payment_transactions
claim_appeals
status reason records
audit records
```

Every RLS path must validate:

- Authenticated user
- Active user profile
- Organization membership
- Clinic membership or valid organization-wide scope
- Active role assignment
- Required permission
- Claim assignment or self-scope where required
- Soft-deletion rules
- Audit access rules

Mutable JWT `organization_id` or `clinic_id` must not be trusted without database membership validation.

Use `WITH CHECK` to prevent unauthorized mutation of:

```text
organization_id
clinic_id
workflow_status
decision_status
payment_status
assigned_to
```

RLS must not be disabled or replaced by application-only checks.

---

## 25. Controlled Mutation Operations

Prefer explicit operations:

```text
transition_claim_workflow(...)
record_claim_decision(...)
record_claim_payment(...)
record_claim_refund(...)
record_claim_reversal(...)
submit_claim_appeal(...)
close_claim(...)
cancel_claim(...)
reopen_claim(...)
```

Each operation must:

1. Validate authenticated actor
2. Validate organization and clinic scope
3. Validate required permission
4. Load and lock the target Claim where necessary
5. Validate `expected_version`
6. Validate current state and requested transition
7. Validate cross-dimension consistency
8. Update only the state dimension owned by the operation
9. Update milestone timestamps
10. Increment Claim version
11. Record the domain event
12. Record reason and source
13. Preserve idempotency
14. Return the updated result
15. Fail with a clear error for invalid actions

Do not create one unrestricted generic function that mutates all three state dimensions.

---

## 26. Migration Strategy

Create a new forward-only migration.

Do not rewrite previously applied migrations.

### 26.1 Recommended Sequence

```text
1. Inventory all legacy Claim statuses
2. Create new enums or controlled constraints
3. Add nullable new state columns
4. Add version and milestone timestamps
5. Create event and transaction tables
6. Backfill with explicit mapping
7. Produce unmapped-row validation query
8. Validate cross-dimension combinations
9. Add defaults
10. Add NOT NULL constraints
11. Add indexes and uniqueness constraints
12. Update functions, triggers, and RLS
13. Update application reads and writes
14. Stop legacy status writes
15. Remove legacy status in a later migration
```

The legacy `status` column must not be dropped immediately.

Temporary compatibility must follow one direction:

```text
new state model → temporary legacy compatibility
```

Legacy writes must not overwrite the new model.

---

## 27. Legacy Mapping Requirements

Inspect all real legacy values and produce an explicit mapping.

For every legacy value, define:

```text
workflow_status
decision_status
payment_status
payment_reason_code
manual_review_required
```

### 27.1 Conservative Mapping Principles

- Unknown decision → `pending`
- No payable amount → `not_billable`
- Ambiguous status → manual review
- Do not infer `approved`, `paid`, or `refunded` without evidence
- Preserve organization, clinic, assignment, financial amounts, and audit timestamps

### 27.2 Pre-Backfill Evidence

Capture:

- Row count
- Legacy status distribution
- Null count
- Unknown-value count

### 27.3 Post-Backfill Validation

Verify:

- No unmapped rows
- No invalid combinations
- No tenant ownership changes
- No lost Claim records
- No altered financial amounts
- No unexpected nulls

Repair must use roll-forward migrations rather than destructive rollback.

---

## 28. Indexing and Performance

Evaluate indexes for:

```text
(organization_id, workflow_status)
(organization_id, decision_status)
(organization_id, payment_status)
(organization_id, clinic_id, workflow_status)
(assigned_to, workflow_status)
(claim_id, is_current)
(claim_id, occurred_at)
(source_system, external_event_id)
(payment_reference)
```

Consider partial indexes for:

```text
workflow_status not in ('closed', 'cancelled')
workflow_status = 'needs_review'
payment_status in ('pending', 'partially_paid', 'payment_failed')
decision_status = 'pending'
```

Performance rules:

- Use current-state fields for list queries
- Use event tables for history
- Avoid full history scans for dashboards
- Avoid duplicate indexes
- Avoid expensive cross-tenant trigger scans
- Avoid excessive JSON filtering
- Prefer set-based authorization checks where practical

---

## 29. Backend and Type Safety

Update:

- Generated Supabase types
- Domain models
- Repository and service methods
- API DTOs
- Server actions
- Query filters
- Mappers
- Mock data
- Tests

Do not retain ambiguous definitions such as:

```ts
status: string;
```

Use explicit types:

```ts
interface ClaimState {
  workflowStatus: ClaimWorkflowStatus;
  decisionStatus: ClaimDecisionStatus;
  paymentStatus: ClaimPaymentStatus;
  paymentReasonCode?: ClaimPaymentReasonCode | null;
  version: number;
}
```

Add strict Zod schemas for:

- Workflow state
- Decision state
- Payment state
- Transition command
- Decision input
- Payment transaction input
- Refund input
- Reversal input
- Expected version
- Idempotency key

Database constraints and functions remain authoritative.

---

## 30. UI and Analytics

Display the three states separately.

Recommended Claim list presentation:

```text
Workflow: Payer Processing
Decision: Approved
Payment: Pending
```

Use:

- Primary workflow badge
- Separate decision badge
- Separate payment badge
- Accessible labels
- Tooltips when space is limited

Create independent filters:

```text
Workflow Status
Decision Status
Payment Status
```

Do not combine all values into one mixed status filter.

### 30.1 Workflow Metrics

```text
Draft
Collecting Data
Validation Pending
Needs Review
Ready to Submit
Submitted
Payer Processing
Appealed
Closed
```

### 30.2 Decision Metrics

```text
Pending Decision
Approval Rate
Partial Approval Rate
Rejection Rate
Average Decision Time
```

### 30.3 Payment Metrics

```text
Payment Pending
Partially Paid
Paid
Payment Failed
Refunded
Outstanding Approved Amount
Average Settlement Time
```

Dashboards must not calculate:

```text
approved = paid
closed = approved
```

Use English approximately 70% and Thai supporting explanation approximately 30%.

Color must not be the only status indicator.

---

## 31. Test Requirements

Tests must be deterministic and follow existing repository conventions.

Use:

- Fixed UUIDs
- Fixed timestamps
- Transaction rollback
- Exact pgTAP plans

### 31.1 Schema and Migration Tests

Verify:

- New state fields exist
- Controlled types exist
- Defaults are correct
- Required fields are non-null
- Legacy values map correctly
- No unmapped rows remain
- Claim ownership is preserved
- Financial amounts are preserved
- Event tables exist
- Required indexes exist

### 31.2 Workflow Tests

Verify:

- Valid transitions succeed
- Invalid transitions fail
- Terminal states cannot reopen without explicit action
- Readiness is required for `ready_to_submit`
- Failed transition creates no event
- Stale `expected_version` fails

### 31.3 Decision Tests

Verify:

- Multiple decision rounds are preserved
- One effective current decision exists
- New decision supersedes earlier decision
- `voided` requires a prior authoritative decision
- Approved decision can coexist with pending payment
- Claim-line aggregation is correct

### 31.4 Payment Tests

Verify:

- Partial payment
- Full payment
- Multiple payments
- Payment failure
- Partial refund
- Full refund
- Reversal
- Duplicate event idempotency
- Amount consistency
- Currency consistency
- Out-of-order event protection

### 31.5 Security Tests

Verify:

- Same-tenant authorized operation succeeds
- Cross-organization access fails
- Cross-clinic access fails
- Missing membership fails
- Missing permission fails
- JWT tampering fails
- Known Claim UUID does not bypass RLS
- Auditor cannot mutate
- Generic Claim editor cannot record decision
- Generic Claim editor cannot record payment
- Cross-tenant event insertion fails

### 31.6 Audit Tests

Verify:

- Previous and new values are recorded
- Actor, source, reason, and timestamps are recorded
- `occurred_at`, `received_at`, and `recorded_at` are preserved
- Failed operation creates no audit event
- Duplicate external event creates no duplicate history

---

## 32. Suggested Work Packages

### Work Package 1 — Architecture and Database

- Inspect repository
- Produce impact map
- Confirm states and legacy values
- Design events and transitions
- Create migration
- Add RLS and RBAC
- Add pgTAP tests

### Work Package 2 — Backend and Contracts

- Regenerate database types
- Update domain models
- Update Zod schemas
- Update services and APIs
- Add concurrency handling
- Add idempotency handling

### Work Package 3 — Frontend and Analytics

- Update Claim list
- Update Claim detail
- Separate badges and filters
- Update dashboards
- Remove mixed-status assumptions

### Work Package 4 — Validation and Documentation

- Run targeted database tests
- Run full database tests
- Run TypeScript
- Run lint
- Run build
- Search for legacy references
- Update documentation
- Produce validation report

Each work package must be completed and validated before moving to the next.

---

## 33. Validation Commands

Use actual repository-supported commands.

Where available:

```powershell
npx supabase status
npx supabase db reset
npx supabase db lint
npx supabase test db
npx supabase gen types typescript --local > lib/database.types.ts
npx tsc --noEmit
npm run lint
npm run build
```

Run targeted Claim tests before the full suite.

Search for remaining legacy usage:

```powershell
Get-ChildItem -Recurse -File |
  Select-String -Pattern "\bclaim_status\b|\bclaim\.status\b|\bclaimStatus\b"
```

Exclude generated files and dependency directories where appropriate.

Do not report a command as successful unless it was actually executed successfully.

---

## 34. Required Deliverables

### 34.1 Impact Analysis

Document:

- Current schema
- Legacy statuses
- Affected migrations
- Affected backend files
- Affected frontend files
- Affected tests
- Affected documentation
- Security risks
- Migration risks

### 34.2 Final Architecture

Provide:

- Current-state model
- Event tables
- Decision model
- Payment transaction model
- Appeal model
- Claim-line aggregation
- Transition matrix
- Cross-dimension rules
- Authority matrix

### 34.3 Complete Implementation

Provide or apply:

- Runnable migration
- Constraints
- Functions
- RLS
- RBAC
- Backend changes
- Frontend changes
- Tests
- Documentation

Placeholders, pseudocode, ellipses, or partial implementation are not acceptable for the implementation work package.

### 34.4 Legacy Mapping

Provide the actual mapping discovered and applied.

### 34.5 Changed Files

List every modified file with a concise reason.

### 34.6 Validation Report

Report:

- Commands executed
- Tests planned
- Tests passed
- Tests failed
- Database lint result
- TypeScript result
- Lint result
- Build result
- Remaining issues
- Readiness decision

Allowed result labels:

```text
PASS
FAIL
PARTIAL
BLOCKED
NOT RUN
NOT APPLICABLE
```

No validation result may be fabricated.

---

## 35. Restrictions

Do not:

- Keep one overloaded Claim status as the authoritative model
- Assume approved means paid
- Assume closed means financially settled
- Automatically void a decision when a pre-submission Claim is cancelled
- Store only current status without event history
- Use one generic text event table as the sole authoritative model
- Allow generic `claim.update` to record decisions or payments
- Allow AI to approve, reject, pay, refund, reverse, or close
- Trust JWT tenant claims without database membership validation
- Disable RLS
- Use floating-point financial amounts
- Permit lost updates
- Process duplicate external events twice
- Drop legacy status before cutover validation
- Rewrite applied historical migrations
- Weaken existing tenant-isolation tests
- Modify unrelated modules
- Fabricate test output
- Mark implementation complete after analysis only

---

## 36. Definition of Done

Phase 4 Claim Workflow is complete only when:

- Workflow, decision, and payment states are independent
- Current state and domain events are separated
- Multiple decisions are supported
- Multiple payment transactions are supported
- Claim-line decision aggregation is defined
- Reason codes are controlled
- Authority and source of truth are enforced
- Concurrency is implemented
- Idempotency is implemented
- Financial amounts and payment summaries are consistent
- Valid state combinations are accepted
- Contradictory combinations are rejected
- Tenant isolation remains enforced
- Clinic isolation remains enforced
- Sensitive mutations require explicit permission
- Status changes are fully auditable
- Legacy data is mapped without loss
- Backend no longer depends on one Claim status
- Frontend no longer depends on one Claim status
- Filters use the three state dimensions
- Dashboards use the three state dimensions
- Database tests pass
- Application validation passes
- Legacy references are removed or explicitly deprecated
- Documentation is complete
- Validation evidence is complete
- No unrelated files are changed

---

## 37. Implementation Readiness

Before implementation begins, the following must be confirmed from the repository:

- Existing Claim table name
- Existing legacy status values
- Existing Claim line structure
- Existing financial columns
- Existing Claim readiness integration
- Existing permission codes
- Existing RLS helper functions
- Existing audit model
- Existing payer and payment integration tables
- Existing pgTAP fixture conventions

Until repository inspection is completed, these items remain:

```text
Status: NOT RUN
```

No implementation or validation success is claimed by this specification.

---

## 38. Pre-Batch 3 Decision Closure Contract

**Status:** Approved
**Decision Date:** 2026-07-22
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Pre-Batch 3 Decision Closure

This section is the authoritative Batch 3 controlled workflow mutation contract. Earlier references in this document to `payer_processing`, `decision_received`, decision `pending`, payment `pending`, or `not_billable` are legacy terminology unless explicitly mapped below.

### 38.1 Authoritative State Values

Workflow uses the actual Batch 1 `public.claim_workflow_state_domain` values:

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

Decision uses `public.claim_decision_state_domain`:

```text
not_decided
approved
partially_approved
rejected
request_information
voided
```

Payment uses `public.claim_payment_state_domain`:

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

Legacy terminology mapping:

| Legacy term | Authoritative Batch 3 meaning |
| --- | --- |
| `payer_processing` | Use `under_review` |
| `decision_received` | Not a workflow state; represented by `decision_status` |
| decision `pending` | Use `not_decided` |
| payment `pending` | Use `payment_pending` |
| `not_billable` | Use `not_paid` with reason context where required |

### 38.2 Transition and Permission Matrix

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

Rules:

- Reopen from `closed` targets `needs_review`.
- Reopen does not rewrite decision or payment history.
- Appeal entity implementation remains out of scope for Batch 3.
- `claim.review` is the approved MVP authority for operational closure.
- Batch 3 does not create `claim.transition` or `claim.close`.

### 38.3 Controlled Function and Data Protection

Batch 3 approves exactly one controlled mutation function:

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

Return one row:

```text
claim_id uuid
previous_workflow_status public.claim_workflow_state_domain
workflow_status public.claim_workflow_state_domain
version integer
workflow_event_id uuid
state_updated_at timestamptz
idempotent_replay boolean
```

Required operation order:

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

`claims.version` is the sole optimistic-lock counter. Do not introduce `state_version`. A successful transition increments `claims.version` exactly once; stale versions and failed transitions change nothing and insert no event. Controlled mutation is the only supported application path for `workflow_status`, `version`, `state_updated_at`, `state_updated_by`, and workflow milestone fields. Ordinary direct updates to protected state columns and direct authenticated `claim_workflow_events` writes must be restricted.

### 38.4 Idempotency, Sequence, and Error Contract

Internal human transitions may omit `external_event_id`; optimistic locking prevents duplicate mutation. External integration transitions require `source_system` and `external_event_id` and use the implemented Batch 2 uniqueness scope `organization_id + source_system + external_event_id`.

Equivalent payload comparison normalizes:

```text
claim_id
target_workflow_status
expected_version
reason_code
reason_text after null/whitespace normalization
source_system
occurred_at
```

Equivalent retries return the prior result with `idempotent_replay = true`, without version increment or new event. Conflicting retries fail with no data change.

Sequence allocation is per Claim and monotonic inside the locked Claim transaction:

```text
next_sequence = coalesce(max(sequence_number) for the Claim, 0) + 1
```

Error behavior:

| Condition | Result | Data Change |
| --- | --- | --- |
| Missing/inaccessible Claim | Sanitized not-found/denied | None |
| Missing permission | Denied without tenant leakage | None |
| Invalid transition | Domain validation error | None |
| Same-state transition | Invalid transition | None |
| Stale version | Version conflict | None |
| Equivalent external retry | Prior result, replay flag true | None |
| Conflicting external retry | Idempotency conflict | None |
| Event insertion failure | Full rollback | None |

Open design blockers: `0`.

---

## 39. Phase 4 Batch 4 Claim Decision Contract Closure

**Status:** Approved
**Decision Date:** 2026-07-22
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Phase 4 Batch 4 Claim Decision Contract Closure

This section is the authoritative Batch 4 controlled Claim decision/adjudication mutation contract. It uses actual Batch 1 through Batch 3 objects and closes the decision design contract without creating SQL, tests, backend, frontend, generated types, seed data, fixtures, or Git history.

### 39.1 Evidence Classification and Readiness

| Area | Classification | Finding |
| --- | --- | --- |
| Authoritative decision object | Confirmed Finding | `public.claim_decisions` is the authoritative adjudication record. |
| Split decision snapshot | Confirmed Finding | `public.claims.decision_status public.claim_decision_state_domain` exists and is nullable from Batch 1. |
| Current decision pointer | Confirmed Finding | `public.claims.current_decision_id` has a tenant-safe FK to `public.claim_decisions`. |
| Existing decision functions | Confirmed Finding | `finalize_claim_decision` and `supersede_claim_decision` exist but update legacy `claims.status`, not split `claims.decision_status`. |
| Direct decision writes | Confirmed Finding | Authenticated direct INSERT/UPDATE/DELETE on `claim_decisions` is revoked by Phase 3 RLS. |
| External decision identity | Implementation Gap | `claim_decisions` has no typed `source_system` or `external_event_id`; Batch 4 may add them. |
| Authenticated decision wrapper | Implementation Gap | Existing decision functions accept actor inputs and are service-role only; Batch 4 may add one secure wrapper deriving actor from trusted context. |
| Decision snapshot synchronization | Implementation Gap | Batch 4 may synchronize `claims.decision_status`, `current_decision_id`, Claim totals, version, and audit atomically. |

Batch 4 readiness: `READY FOR BATCH 4`.

### 39.2 Authoritative Decision Object

| Contract item | Exact value |
| --- | --- |
| Table purpose | Versioned authoritative human or trusted-payer adjudication rounds for one Claim. |
| Primary key | `claim_decisions.id uuid primary key default gen_random_uuid()` |
| Organization and clinic ownership | `organization_id uuid not null`, `clinic_id uuid not null`; tenant-safe Claim FK `(organization_id, clinic_id, claim_id)` references `claims`. |
| Claim foreign key | `claim_id uuid not null`; `claim_decisions_claim_tenant_fk`. |
| Decision status column/type | `decision_status text` with values `draft`, `final`, `superseded`, `cancelled`; this is record lifecycle, not Claim snapshot. |
| Adjudication outcome column/type | `decision_outcome text` with values `approved`, `partially_approved`, `rejected`, `request_information`, `returned_for_correction`. Batch 4 maps only implemented split snapshot values. |
| Amount and currency columns | `currency_code char(3)`, `submitted_amount numeric(18,2)`, `approved_amount numeric(18,2)`, `rejected_amount numeric(18,2)`, `patient_responsibility_amount numeric(18,2)`, `payer_responsibility_amount numeric(18,2)`. |
| Actor/source columns | Existing actor columns are `decided_by`, `decision_role_snapshot`, `decided_at`, `created_by`, `updated_by`. Batch 4 adds typed source evidence for adjudication events. |
| External identity | Not implemented on `claim_decisions`; Batch 4 adds `source_system text` and `external_event_id text`. |
| Timestamps | `decided_at`, `created_at`, `updated_at`; Batch 4 uses `p_decision_at` for business time and database `now()` for recorded/update timestamps. |
| Soft-delete columns | None on `claim_decisions`; finalized evidence is preserved by lifecycle/supersession, not soft delete. Parent `claims.deleted_at` blocks new Batch 4 decisions. |
| Version/order fields | `decision_version integer not null`; unique `(claim_id, decision_version)`. |
| Current-decision linkage | `claims.current_decision_id` points to the effective current decision; `claim_decisions_one_final_per_claim_uq` allows one `final` decision per Claim. |
| Item/line relationship | `claim_decision_adjustments.claim_item_id` links adjustments to `claim_items`; dedicated `claim_line_decisions` remains deferred by ADR-004. |
| RLS and grants | RLS enabled; authenticated users may read by Claim scope; authenticated direct decision writes are revoked; service-role existing functions are granted. |
| Object classification | Authoritative decision evidence, not a draft-only work table, snapshot, or generic audit table. Draft rows are not authoritative until finalized. |

### 39.3 Approved Append-Only Decision Model

Approved model:

```text
append-only authoritative decision records
claims.current_decision_id points to the active decision
finalized decision rows are immutable
correction creates a superseding decision record
business voiding does not delete prior evidence
```

| Behavior | Approved rule |
| --- | --- |
| Initial decision | Create and finalize the first authoritative decision with `decision_version = 1`, `supersedes_decision_id = null`, and `claims.current_decision_id = new decision id`. |
| Supersession | A correction creates a new decision with `decision_version = previous + 1` and `supersedes_decision_id = previous current decision id`; prior final row becomes `superseded`. |
| Current pointer | Successful mutation updates `claims.current_decision_id` to the new authoritative decision unless the new snapshot is `voided`, where the void decision is the current evidence. |
| Void behavior | Voiding creates a new authoritative decision row with `decision_outcome = null`, lifecycle `final`, metadata reason context, and split snapshot `voided`; prior evidence is superseded, not deleted. |
| Correction behavior | Correction is supersession; it must include a reason and expected version and must not update a finalized row in place. |
| Resubmission behavior | Resubmission after request-information or rejection uses workflow mutation separately; a later payer response creates a new superseding decision. |
| Soft-delete behavior | Soft-deleted Claims reject decision mutation; `claim_decisions` rows are not soft-deleted by ordinary application actors. |
| Decision order/version | Use `decision_version = coalesce(max(decision_version), 0) + 1` inside the locked Claim transaction. |

### 39.4 Decision Status Transition Matrix

`request_information` is an intermediate adjudication outcome requiring human follow-up. It is stored in `claims.decision_status` but does not mean approved, rejected, paid, or closed.

All unlisted transitions are forbidden. Same-state requests are invalid unless they are verified idempotent replays.

| Current Snapshot | Requested Decision | Allowed | Prior Record Action | New Record | Snapshot Result | Reason Required |
| --- | --- | --- | --- | --- | --- | --- |
| `not_decided` | `approved` | Yes | None | Final decision v1 | `approved` | No |
| `not_decided` | `partially_approved` | Yes | None | Final decision v1 | `partially_approved` | Yes |
| `not_decided` | `rejected` | Yes | None | Final decision v1 | `rejected` | Yes |
| `not_decided` | `request_information` | Yes | None | Final decision v1 with nonfinancial outcome | `request_information` | Yes |
| `not_decided` | `voided` | No | None | None | No change | Yes |
| `approved` | `approved` | Replay only | None | None | `approved` | No |
| `approved` | `partially_approved` | Yes | Supersede current | Final replacement | `partially_approved` | Yes |
| `approved` | `rejected` | Yes | Supersede current | Final replacement | `rejected` | Yes |
| `approved` | `request_information` | Yes | Supersede current | Final replacement | `request_information` | Yes |
| `approved` | `voided` | Yes | Supersede current | Final void evidence | `voided` | Yes |
| `partially_approved` | `approved` | Yes | Supersede current | Final replacement | `approved` | Yes |
| `partially_approved` | `partially_approved` | Replay only | None | None | `partially_approved` | Yes |
| `partially_approved` | `rejected` | Yes | Supersede current | Final replacement | `rejected` | Yes |
| `partially_approved` | `request_information` | Yes | Supersede current | Final replacement | `request_information` | Yes |
| `partially_approved` | `voided` | Yes | Supersede current | Final void evidence | `voided` | Yes |
| `rejected` | `approved` | Yes | Supersede current | Final replacement | `approved` | Yes |
| `rejected` | `partially_approved` | Yes | Supersede current | Final replacement | `partially_approved` | Yes |
| `rejected` | `rejected` | Replay only | None | None | `rejected` | Yes |
| `rejected` | `request_information` | Yes | Supersede current | Final replacement | `request_information` | Yes |
| `rejected` | `voided` | Yes | Supersede current | Final void evidence | `voided` | Yes |
| `request_information` | `approved` | Yes | Supersede current | Final replacement | `approved` | No |
| `request_information` | `partially_approved` | Yes | Supersede current | Final replacement | `partially_approved` | Yes |
| `request_information` | `rejected` | Yes | Supersede current | Final replacement | `rejected` | Yes |
| `request_information` | `request_information` | Replay only | None | None | `request_information` | Yes |
| `request_information` | `voided` | Yes | Supersede current | Final void evidence | `voided` | Yes |
| `voided` | `approved` | Yes | Supersede current void | Final replacement | `approved` | Yes |
| `voided` | `partially_approved` | Yes | Supersede current void | Final replacement | `partially_approved` | Yes |
| `voided` | `rejected` | Yes | Supersede current void | Final replacement | `rejected` | Yes |
| `voided` | `request_information` | Yes | Supersede current void | Final replacement | `request_information` | Yes |
| `voided` | `voided` | Replay only | None | None | `voided` | Yes |

`approved` and `partially_approved` do not mean paid. Decision mutation must not silently alter `claims.payment_status`, `claims.total_paid_amount`, or payment records.

### 39.5 Workflow Coupling

Approved boundary:

```text
Decision mutation does not directly mutate workflow_status.
Workflow changes use public.transition_claim_workflow.
```

| Decision Status | Required Workflow Eligibility | Direct Workflow Change | Follow-up Workflow Transition | Workflow Event |
| --- | --- | --- | --- | --- |
| `approved` | Claim must not be `draft`, `collecting_data`, `validation_pending`, `ready_to_submit`, `closed`, or `cancelled`; expected workflow is `submitted` or `under_review`. | None | If operations need closure, call `transition_claim_workflow(..., 'closed', ...)` separately. | None from decision function |
| `partially_approved` | Same as `approved`. | None | Optional workflow closure or appeal through workflow function. | None from decision function |
| `rejected` | Same as `approved`. | None | Optional `under_review -> appealed` or `under_review -> closed` through workflow function. | None from decision function |
| `request_information` | Claim must be `submitted` or `under_review`; not terminal. | None | Use `transition_claim_workflow` only if operations require `needs_review` or another approved workflow state. | None from decision function |
| `voided` | Requires existing current authoritative decision; parent Claim must not be soft-deleted. | None | Use workflow function separately for reopen, appeal, closure, or cancellation if required. | None from decision function |

Batch 4 does not atomically change workflow and decision together. Any application orchestration requiring both must call the decision function and workflow function as separate controlled operations with fresh versions, or introduce a later approved orchestration function.

### 39.6 Controlled Function Contract

Approved Batch 4 function:

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

Caller inputs: `p_claim_id`, `p_target_decision_status`, `p_expected_version`, `p_reason_code`, `p_reason_text`, `p_approved_amount`, `p_rejected_amount`, `p_payer_reference`, `p_decision_at`, `p_source_system`, `p_external_event_id`, `p_correlation_id`, `p_metadata`.

Derived values: organization, clinic, actor identity from `auth.uid()`, current decision, current Claim version, submitted/requested amount basis from `claims.total_eligible_amount` then `claims.total_claimed_amount`, currency from `claims.currency_code`, and next `decision_version`.

Database-generated values: decision ID, recorded timestamps, new Claim version, audit identifiers through existing audit triggers/events.

| Contract item | Exact value |
| --- | --- |
| Security mode | `SECURITY DEFINER` |
| Safe search path | `set search_path = public, private, auth, pg_temp` |
| EXECUTE roles | `authenticated`, `service_role`; not `PUBLIC` or `anon` |
| Authorization helper | `public.has_permission(text, uuid, uuid)` with locked Claim organization and clinic |
| Required permissions | `claim.decide` for approved, partially approved, rejected, request-information; `claim.decision.supersede` for replacing an existing current decision; `claim.decision.void` for voiding |
| Locking order | Lock Claim by `p_claim_id` and `deleted_at is null`; lock current decision if present; then inspect idempotency identity |
| Idempotency order | For external identity, find existing `claim_decisions` row by `organization_id + source_system + external_event_id` after the Claim lock and before version validation side effects |
| Insert/supersession | Insert a new final decision row; mark prior current final as `superseded` when present |
| Snapshot update | Update `claims.current_decision_id`, `claims.decision_status`, `claims.total_approved_amount` for financial outcomes, `claims.version`, `claims.state_updated_at`, `claims.state_updated_by`, `claims.updated_at`, `claims.updated_by` |
| Audit behavior | Existing Claim audit trigger plus authoritative decision row; no failed operation writes evidence |
| Error categories | Sanitized not authorized/not found, missing permission, invalid transition, stale version, idempotency conflict, invalid amount/currency, missing reason, soft-deleted Claim, unsupported actor/source, rollback on any insert/update failure |

The caller must not provide actor, organization, clinic, current status, decision version/order, or new Claim version as authoritative input.

### 39.7 Authorization Contract

| Decision Action | Existing Permission | Verified Helper | Status |
| --- | --- | --- | --- |
| Decision read | `claim.read` | RLS uses `private.claim_can_read` and `public.has_permission` | Confirmed Finding |
| Decision create/adjudicate | `claim.decide` | `public.has_permission(text, uuid, uuid)` | Confirmed Finding |
| Partial approval | `claim.decide` | `public.has_permission(text, uuid, uuid)` | Approved Decision |
| Rejection | `claim.decide` | `public.has_permission(text, uuid, uuid)` | Approved Decision |
| Request information | `claim.request_information` exists; Batch 4 uses `claim.decide` for adjudication record creation | `public.has_permission(text, uuid, uuid)` | Approved Decision |
| Void/supersede | `claim.decision.supersede` exists; `claim.decision.void` is new | `public.has_permission(text, uuid, uuid)` | Implementation Gap |
| Decision audit | `claim.audit.read` | RLS/audit helper pattern | Confirmed Finding |

Generic `claim.update` and workflow permissions do not authorize adjudication. Cross-tenant failures return sanitized denial. AI cannot be the authoritative adjudicator.

### 39.8 Version, Idempotency, Amount, and Direct-Write Contract

Version model: `claims.version` is the sole optimistic-lock counter. Success increments it exactly once. Stale expected version writes no decision, no snapshot, and no audit evidence beyond database error handling. Decision row, supersession/current pointer, `claims.decision_status`, version increment, and audit evidence commit or roll back together.

Idempotency identity: external adjudication uses `organization_id + source_system + external_event_id`. Batch 4 adds typed `source_system` and `external_event_id` columns to `claim_decisions` plus a partial unique index. Equivalent payload compares only stored typed columns: `claim_id`, `decision_status`, `approved_amount`, `rejected_amount`, `currency_code`, `reason_code`, normalized `reason_text`, `payer_reference`, `decision_at`, and `source_system`. Exclude database IDs, recorded timestamps, actor display names, unrestricted metadata, and decision sequence.

Amount and currency rules:

| Area | Rule |
| --- | --- |
| Requested amount basis | `coalesce(claims.total_eligible_amount, claims.total_claimed_amount)` |
| Approved amount | Required and greater than or equal to 0 for `approved` and `partially_approved`; null for `request_information` and `voided`; zero for `rejected`. |
| Rejected amount | Stored, not derived; required and greater than or equal to 0 for `approved`, `partially_approved`, and `rejected`; null for `request_information` and `voided`. |
| Approved invariant | `approved_amount = requested amount basis` and `rejected_amount = 0`. |
| Partial invariant | `approved_amount > 0`, `rejected_amount > 0`, and `approved_amount + rejected_amount = requested amount basis`. |
| Rejected invariant | `approved_amount = 0` and `rejected_amount = requested amount basis`. |
| Rounding | Store numeric values rounded to scale 2 using PostgreSQL `round(value, 2)` before comparison and insert. |
| Currency | Always derived from `claims.currency_code`; caller currency is not accepted. |
| Mismatch behavior | No caller currency exists; decision row currency must equal locked Claim currency. |
| Over-approval | Forbidden: approved amount must not exceed requested amount basis. |
| Void/request-information amounts | Amount fields must be null and must not change payment status. |
| Item relationship | Existing item adjustments support partial approval evidence; dedicated line decisions remain out of scope. |
| Stored totals | `claims.total_approved_amount` is updated only for approved, partially approved, and rejected outcomes; payment totals are untouched. |

Direct-write protection: ordinary application roles must not directly insert `claim_decisions`, update finalized `claim_decisions`, delete `claim_decisions`, update `claims.decision_status`, or update `claims.current_decision_id`. Batch 4 controlled path is authorized function execution plus restricted protected-column updates, restricted direct decision writes, and append-only finalized evidence. Privileged service/database recovery remains available outside ordinary application roles.

---

## 40. Phase 4 Batch 5 Payment Settlement Clarification

**Status:** Confirmed Finding / Recommendation
**Decision Date:** 2026-07-22

Batch 5 clarifies the payment workflow boundary after Batch 1 through Batch 4.

### 40.1 Approved Boundary

Payment mutation is independent from workflow and payer decision mutation.

```text
workflow mutation does not set payment_status
decision mutation does not set payment_status
payment mutation does not set workflow_status or decision_status
```

Payment records remain authoritative financial evidence. `claims.payment_status` is only the current operational payment summary.

### 40.2 Batch 5 Scope

Batch 5 should implement a controlled payment settlement path that:

- reuses `claim_payments`, `claim_payment_allocations`, and `claim_payment_reconciliations`;
- updates `claims.payment_status` and `claims.total_paid_amount` atomically;
- uses `claims.version` for optimistic locking;
- requires payment authority through `claim.payment.record`;
- preserves tenant and clinic scope;
- prevents direct ordinary updates to payment summary and financial totals;
- rejects duplicate/conflicting external payment events;
- records payment evidence without representing readiness or decision status as claim approval.

### 40.3 Out of Scope

Batch 5 does not implement formal appeals, refund lifecycle, legacy `claims.status` removal, backend/API/frontend cutover, generated types, fixtures, seed data, or database reset.

Refund and reversal remain distinguishable requirements. Refund behavior is deferred to a later financial-exception batch unless the Batch 5 implementation encounters a blocking dependency that requires a narrower decision-closure task first.
