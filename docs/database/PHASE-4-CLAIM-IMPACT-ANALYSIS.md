# PHASE-4-CLAIM-IMPACT-ANALYSIS

## Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform

**Document Type:** Repository Impact Analysis  
**Phase:** Phase 4 — Claim Workflow Refactor  
**Status:** Draft for Review  
**Primary Scope:** Claim workflow, decision, payment, readiness, RBAC, RLS, migration planning, backend, frontend, and validation impact

---

## Scope Control

**Confirmed Finding**

This task is strictly **impact analysis only**.

Do not:

- Create or edit migrations
- Modify SQL policies or functions
- Change backend or frontend code
- Generate database types
- Run destructive database commands
- Implement the proposed architecture

Every substantive statement in this report is classified as one of:

- **Confirmed Finding**
- **Recommendation**
- **Open Decision**
- **Not Verified**

For affected files, this report separates:

- **Confirmed Existing Files**
- **Proposed New Files**

This document does not claim that any Phase 4 implementation, migration, backfill, test execution, or production rollout has occurred.

---

## 1. Executive Summary

**Confirmed Finding**

Phase 3 already provides a dedicated `public.claims` aggregate together with decision and payment-related tables.

However, the current `public.claims.status` column is overloaded. It mixes three separate business domains:

1. Operational workflow
2. Payer adjudication decision
3. Payment settlement

Examples currently stored in one field include:

```text
draft
submitted
approved
rejected
payment_pending
partially_paid
paid
closed
```

Phase 4 must preserve the existing Phase 3 Claim architecture and refactor the current-state model into:

```text
workflow_status
decision_status
payment_status
payment_reason_code
```

The existing `status` column must remain temporarily for compatibility and must not be removed before migration validation and application cutover are complete.

---

## 2. Repository Inspection Summary

**Confirmed Finding**

The following repository areas were inspected:

```text
supabase/migrations/001_core_schema.sql
supabase/migrations/006_clinical_claim_settings_tables.sql
supabase/migrations/20260720082357_phase3_claim_core_tables.sql
supabase/migrations/20260720082438_phase3_claim_review_decision.sql
supabase/migrations/20260720082441_phase3_claim_payment.sql
supabase/migrations/20260721142000_fix_claim_self_scope_update_policy.sql
features/payer-rules/components/payer-detail-page.tsx
features/visit-list/data.ts
features/visit-list/types.ts
features/visit-list/visit-list-page.tsx
```

The inspection confirms that Claim-related terminology is currently used across multiple domains and requires controlled separation.

---

## 3. Existing Claim Domain Architecture

**Confirmed Finding**

Phase 3 already contains a dedicated Claim aggregate.

Primary migrations:

```text
20260720082357_phase3_claim_core_tables.sql
20260720082438_phase3_claim_review_decision.sql
20260720082441_phase3_claim_payment.sql
20260721142000_fix_claim_self_scope_update_policy.sql
```

Existing architecture includes at least:

```text
claims
claim_parties
claim_reviews
claim_decisions
claim_decision_adjustments
claim_payments
claim_payment_allocations
claim_payment_reconciliations
```

Phase 4 must extend and refactor this architecture rather than create duplicate Claim, decision, or payment tables.

---

## 4. Legacy Visit-Level Claim Status

**Confirmed Finding**

The original core schema defines:

```sql
create type claim_status as enum (
  'not_started',
  'documentation_pending',
  'ready_for_review',
  'needs_review',
  'blocked',
  'submitted'
);
```

This enum is used on the `visits` table:

```sql
claim_status claim_status not null default 'not_started'
```

### Interpretation

`visits.claim_status` appears to represent visit-level Claim preparation progress rather than the authoritative Claim aggregate.

Likely meanings:

| Legacy Visit Status | Likely Meaning |
|---|---|
| `not_started` | Claim preparation not started |
| `documentation_pending` | Documentation incomplete |
| `ready_for_review` | Ready for Claim review |
| `needs_review` | Manual review required |
| `blocked` | Claim preparation blocked |
| `submitted` | Submission stage reached |

### Phase 4 Impact

`visits.claim_status` must remain independent from the new Claim workflow, decision, and payment snapshots.

Possible future rename:

```text
claim_preparation_status
```

or:

```text
visit_claim_readiness_status
```

No rename should occur until all backend and frontend references are inventoried and migrated.

---

## 5. Current `public.claims` Schema

**Confirmed Finding**

The Phase 3 Claim aggregate contains:

```text
id
organization_id
clinic_id
claim_number
claim_type_code
patient_id
visit_id
payer_id
payer_reference
policy_reference
member_reference
status
service_start_date
service_end_date
currency_code
total_claimed_amount
total_eligible_amount
total_approved_amount
total_paid_amount
risk_level
current_ai_assessment_id
current_decision_id
version
submitted_at
closed_at
created_at
created_by
updated_at
updated_by
deleted_at
deleted_by
```

The table already includes:

- Tenant ownership
- Claim business number
- Patient and Visit linkage
- Payer references
- Monetary totals using PostgreSQL `numeric`
- Current decision pointer
- Optimistic concurrency through `version`
- Audit fields
- Soft deletion
- Service date validation
- Financial amount validation

---

## 6. Overloaded `claims.status`

**Confirmed Finding**

The current `claims.status` check constraint includes:

```text
draft
collecting_evidence
pending_validation
validation_failed
needs_information
ready_for_submission
submitted
submission_failed
under_review
pending_medical_review
pending_claim_assessor
approved
partially_approved
rejected
payment_pending
partially_paid
paid
cancelled
closed
```

These values belong to different domains.

### Workflow-Oriented Values

```text
draft
collecting_evidence
pending_validation
validation_failed
needs_information
ready_for_submission
submitted
submission_failed
under_review
pending_medical_review
pending_claim_assessor
cancelled
closed
```

### Decision-Oriented Values

```text
approved
partially_approved
rejected
```

### Payment-Oriented Values

```text
payment_pending
partially_paid
paid
```

### Confirmed Architectural Problem

The existing model allows one field to represent:

```text
workflow state
payer outcome
payment settlement
```

This creates ambiguity and makes valid combinations impossible to represent directly.

Example:

```text
workflow_status = decision_received
decision_status = approved
payment_status = pending
```

The current single `status` field cannot represent this state without losing information.

---

## 7. Current Financial Constraints

**Confirmed Finding**

The Claim table contains financial constraints such as:

```text
total_claimed_amount >= 0
total_eligible_amount >= 0
total_approved_amount >= 0
total_paid_amount >= 0
total_eligible_amount <= total_claimed_amount
total_approved_amount <= total_eligible_amount
total_paid_amount <= total_approved_amount
```

Additional constraints currently depend on the overloaded `status`, including logic for:

```text
approved
partially_approved
payment_pending
partially_paid
paid
rejected
```

### Phase 4 Impact

Status-dependent financial constraints must be refactored to depend on:

```text
decision_status
payment_status
```

They must no longer depend on legacy `claims.status` after cutover.

---

## 8. Existing Claim Decision Architecture

**Confirmed Finding**

Phase 3 already provides `public.claim_decisions`.

Existing fields include:

```text
organization_id
clinic_id
claim_id
claim_review_id
decision_version
decision_status
decision_outcome
currency_code
submitted_amount
approved_amount
rejected_amount
patient_responsibility_amount
payer_responsibility_amount
decision_reason_code
decision_reason_text
decision_summary
decided_by
decision_role_snapshot
decided_at
supersedes_decision_id
metadata
created_at
created_by
updated_at
updated_by
```

### Decision Record Lifecycle

`claim_decisions.decision_status` supports:

```text
draft
final
superseded
cancelled
```

### Decision Outcome

`claim_decisions.decision_outcome` supports:

```text
approved
partially_approved
rejected
request_information
returned_for_correction
```

### Existing Strengths

The existing model supports:

- Versioned decisions
- Decision supersession
- Final decision validation
- Human adjudication
- Reason codes
- Financial balance checks
- Tenant-safe foreign keys
- Current decision pointer
- Decision adjustments
- Human-in-the-Loop controls

### Phase 4 Decision Mapping

`claim_decisions.decision_status` is the lifecycle of the decision record.

It must not be copied directly into `claims.decision_status`.

Target Claim snapshot mapping:

```text
final + approved → approved
final + partially_approved → partially_approved
final + rejected → rejected
no authoritative final decision → pending
invalidated authoritative decision → voided
```

The following outcomes should affect workflow rather than final Claim decision state:

```text
request_information
returned_for_correction
```

---

## 9. Existing Claim Payment Architecture

**Confirmed Finding**

Phase 3 already provides payment structures.

Known components include:

```text
claim_payments
claim_payment_allocations
claim_payment_reconciliations
```

### Payment Allocations

`claim_payment_allocations` supports allocation to:

```text
claim
claim_item
decision_adjustment
patient_responsibility
withholding
other
```

Existing fields include:

```text
claim_id
claim_decision_id
claim_payment_id
claim_item_id
claim_decision_adjustment_id
allocation_number
allocation_type
currency_code
allocated_amount
reason_code
reason_text
metadata
```

### Payment Reconciliation

`claim_payment_reconciliations` supports:

```text
pending
matched
mismatched
under_review
resolved
disputed
cancelled
```

Existing fields include:

```text
expected_amount
received_amount
variance_amount
variance_reason_code
variance_reason_text
external_statement_reference
external_statement_date
reconciled_by
reconciled_at
resolved_by
resolved_at
resolution_code
resolution_text
```

### Phase 4 Payment Impact

Phase 4 must preserve the existing payment model.

The primary change is to introduce a current Claim payment snapshot:

```text
payment_status
payment_reason_code
```

The snapshot should be derived or maintained transactionally from payment and reconciliation records.

Phase 4 must not create duplicate payment allocation or reconciliation tables.

---

## 10. Claim Readiness Is a Separate Domain

**Confirmed Finding**

The repository contains dedicated Claim Readiness constraints in:

```text
supabase/migrations/006_clinical_claim_settings_tables.sql
```

Observed constraints include:

```text
ck_claim_readiness_status
ck_claim_readiness_review_status
```

This confirms that Claim Readiness is independent from:

```text
workflow_status
decision_status
payment_status
```

Claim Readiness must remain a prerequisite or decision-support signal.

It must not become the authoritative payer decision or payment state.

---

## 11. Evidence Package Status Is a Separate Domain

**Confirmed Finding**

The repository contains an Evidence Package lifecycle with values such as:

```text
draft
review_needed
complete
approved
submitted
superseded
```

These values belong to the Evidence Package domain.

They must not be mapped automatically to Claim workflow, payer decision, or payment settlement states.

---

## 12. Frontend Status Collision Findings

**Confirmed Finding**

### 12.1 Visit List

Affected files:

```text
features/visit-list/data.ts
features/visit-list/types.ts
features/visit-list/visit-list-page.tsx
```

Current property:

```ts
claimStatus: ClaimReadinessStatus;
```

Observed values:

```text
Ready
Needs Review
Not Ready
Calculating
```

This property represents Claim Readiness.

Recommended future name:

```ts
claimReadinessStatus
```

### 12.2 Payer Rules

Affected file:

```text
features/payer-rules/components/payer-detail-page.tsx
```

Observed mixed filter values:

```text
Draft
Approved
Paid
```

These belong to different domains:

| Existing Value | Correct Domain |
|---|---|
| `Draft` | Workflow |
| `Approved` | Decision |
| `Paid` | Payment |

The single `claimStatus` filter must eventually be replaced by:

```text
workflowStatus
decisionStatus
paymentStatus
```

Recommended independent filters:

```text
Workflow Status
Decision Status
Payment Status
```

---

## 13. Existing Self-Scoped Draft Update Policy

**Confirmed Finding**

Existing policy:

```sql
claims_self_update_own_draft
```

The policy allows update only when:

- Actor is authenticated
- Claim was created by the actor
- Claim is not deleted
- Claim remains `status = 'draft'`
- Actor is an organization member
- Actor has clinic access
- Actor has `claim.update`

The policy includes both:

```text
USING
WITH CHECK
```

### Existing Strength

The resulting row must remain a draft.

This prevents generic update from directly transitioning the legacy Claim status out of `draft`.

### Security Gap to Address

The policy does not by itself prove that protected non-status columns cannot be changed while the Claim remains a draft.

Phase 4 must inspect and protect:

```text
organization_id
clinic_id
current_decision_id
decision_status
payment_status
financial totals
assignment fields
version
milestone timestamps
```

Sensitive mutations must use dedicated operations and permissions.

---

## 14. Tenant Isolation Findings

**Confirmed Finding**

Phase 3 uses tenant-safe composite foreign keys.

Example pattern:

```sql
foreign key (organization_id, clinic_id, claim_id)
references public.claims(organization_id, clinic_id, id)
```

This pattern reduces cross-tenant relation errors.

Phase 4 must preserve the same approach for:

```text
claim_workflow_events
claim_decisions
claim_payment_transactions
claim_appeals
claim_line_decisions
```

RLS must continue to validate:

- Authenticated user
- Active organization membership
- Clinic access
- Permission
- Self or assignment scope where applicable
- Soft-delete rules

---

## 15. Target Phase 4 Current-State Model

**Recommendation**

Add to `public.claims`:

```text
workflow_status
decision_status
payment_status
payment_reason_code
```

Preserve existing:

```text
version
current_decision_id
submitted_at
closed_at
```

Evaluate adding:

```text
payer_acknowledged_at
decision_received_at
appealed_at
cancelled_at
first_payment_at
fully_paid_at
```

The current state must be queryable without scanning full event history.

---

## 16. Target State Definitions

**Recommendation**

### Workflow Status

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

### Decision Status

```text
pending
approved
partially_approved
rejected
voided
```

### Payment Status

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

If refund and reversal states are deferred from MVP, the schema must preserve a safe future extension path.

---

## 17. Preliminary Legacy Mapping

**Recommendation**

This mapping is provisional and must be validated against actual current decision and payment records.

| Legacy `claims.status` | Workflow | Decision | Payment | Notes |
|---|---|---|---|---|
| `draft` | `draft` | `pending` | `not_billable` | Pre-submission |
| `collecting_evidence` | `collecting_data` | `pending` | `not_billable` | Evidence collection |
| `pending_validation` | `validation_pending` | `pending` | `not_billable` | Validation queue |
| `validation_failed` | `needs_review` | `pending` | `not_billable` | Requires reason |
| `needs_information` | `collecting_data` | `pending` | `not_billable` | More evidence required |
| `ready_for_submission` | `ready_to_submit` | `pending` | `not_billable` | Readiness passed |
| `submitted` | `submitted` | `pending` | `not_billable` | Awaiting payer |
| `submission_failed` | `needs_review` | `pending` | `not_billable` | Technical failure |
| `under_review` | `payer_processing` | `pending` | `not_billable` | Payer processing |
| `pending_medical_review` | `needs_review` | `pending` | `not_billable` | Medical review |
| `pending_claim_assessor` | `payer_processing` | `pending` | `not_billable` | Assessor queue |
| `approved` | `decision_received` | `approved` | `pending` | Validate current decision |
| `partially_approved` | `decision_received` | `partially_approved` | `pending` | Validate current decision |
| `rejected` | `decision_received` | `rejected` | `not_billable` | Validate zero payable amount |
| `payment_pending` | `decision_received` | From current decision | `pending` | Do not infer decision from status alone |
| `partially_paid` | From workflow history | From current decision | `partially_paid` | Validate payment records |
| `paid` | From workflow history | From current decision | `paid` | Validate settlement |
| `cancelled` | `cancelled` | `pending` or current decision | `not_billable` or derived | Do not auto-void |
| `closed` | `closed` | From current decision | From transactions | Operationally complete only |

### Conservative Mapping Rules

- Unknown decision → `pending`
- No payable amount → `not_billable`
- Ambiguous state → manual review
- Do not infer `approved`, `paid`, `refunded`, or `voided` without evidence
- Preserve tenant ownership and financial totals

---

## 18. Required Phase 4 Database Changes

**Recommendation**

Phase 4 is expected to require:

1. Add controlled current-state columns
2. Add payment reason code
3. Add milestone timestamps where required
4. Add workflow event history if no equivalent authoritative table exists
5. Add controlled workflow transition function
6. Add decision snapshot synchronization
7. Add payment snapshot synchronization
8. Add cross-dimension validation
9. Add or refine RBAC permissions
10. Add or refine RLS policies
11. Add backfill logic
12. Add unmapped-row validation
13. Add indexes
14. Preserve temporary legacy compatibility
15. Stop legacy status writes after application cutover

The existing `status` column must not be dropped in the first migration.

---

## 19. Required Backend Impact

**Recommendation**

Affected areas are expected to include:

```text
lib/database.types.ts
Claim domain models
Claim repositories
Claim services
Server actions
API DTOs
Zod schemas
Query filters
Mappers
Mock data
Tests
```

Ambiguous types such as:

```ts
status: string;
```

must be replaced with explicit domain types.

Target model:

```ts
interface ClaimState {
  workflowStatus: ClaimWorkflowStatus;
  decisionStatus: ClaimDecisionStatus;
  paymentStatus: ClaimPaymentStatus;
  paymentReasonCode?: ClaimPaymentReasonCode | null;
  version: number;
}
```

---

## 20. Required Frontend Impact

**Recommendation**

Frontend changes are expected in:

```text
Claim list
Claim detail
Payer rules
Dashboards
Filters
Badges
Analytics
Visit list readiness naming
Mock data
```

Required display separation:

```text
Workflow
Decision
Payment
```

Claim Readiness must remain separately displayed.

Do not place all values into one mixed status dropdown.

---

## 21. Migration Risks

**Confirmed Finding**

### High Risks

- Incorrect legacy mapping
- Approved Claims incorrectly treated as paid
- Closed Claims incorrectly treated as settled
- Payment states inferred without transaction evidence
- Decision outcome inferred without current final decision
- Cross-tenant ownership changes during backfill
- Existing constraints still referencing legacy `status`
- Application continuing to write legacy status
- Duplicate event processing
- Lost updates during concurrent state changes

### Mitigations

- Forward-only migration
- Add nullable fields first
- Backfill conservatively
- Validate unmapped rows
- Preserve legacy status temporarily
- Use optimistic concurrency
- Use idempotency keys
- Use tenant-safe foreign keys
- Add targeted pgTAP tests
- Search and remove legacy writes after cutover

---

## 22. Security Risks

**Confirmed Finding**

- Generic `claim.update` changing protected fields
- Self-scope update changing tenant or clinic ownership
- Generic update recording decision or payment state
- AI service receiving authoritative permissions
- Cross-clinic access through known Claim UUID
- Missing `WITH CHECK` protection
- Direct table update bypassing controlled operations
- Audit history mutation

Required controls:

```text
Dedicated operations
Dedicated permissions
RLS
Column-level restrictions
Immutable ownership enforcement
Audit events
Expected version
Reason codes
```

---

## 23. Recommended Work Packages

**Recommendation**

### Work Package 1 — Database Architecture

- Finalize state definitions
- Confirm Claim payment header structure
- Confirm workflow event gap
- Design forward-only migration
- Design legacy mapping
- Add RLS and RBAC impact
- Add database tests

### Work Package 2 — Backend Contracts

- Regenerate Supabase types
- Add explicit Claim state models
- Add Zod schemas
- Update repository and service methods
- Add controlled mutation handling
- Add concurrency and idempotency support

### Work Package 3 — Frontend and Analytics

- Separate status badges
- Separate filters
- Rename readiness properties
- Update dashboards
- Remove mixed status assumptions

### Work Package 4 — Validation and Documentation

- Run database reset
- Run database lint
- Run targeted pgTAP
- Run full database tests
- Run TypeScript
- Run lint
- Run build
- Search for remaining legacy references
- Update validation report

---

## 24. Open Decisions

**Open Decision**

The following still require confirmation before migration implementation:

1. Full `claim_payments` table definition
2. Refund and reversal support
3. Payment failure semantics
4. Current authoritative payment summary rules
5. Whether a workflow event table already exists
6. Whether appeal tables already exist
7. Existing Claim assignment model
8. Existing permission codes for decision and payment recording
9. Exact application files writing `claims.status`
10. Whether terminal Claim reopen is required in MVP

---


## 25. Affected File Inventory

### Confirmed Existing Files

**Confirmed Finding**

| File | Confirmed Impact |
|---|---|
| `supabase/migrations/001_core_schema.sql` | Defines legacy `claim_status` enum on `visits` |
| `supabase/migrations/006_clinical_claim_settings_tables.sql` | Contains Claim Readiness and Evidence Package status constraints |
| `supabase/migrations/20260720082357_phase3_claim_core_tables.sql` | Defines `public.claims` with overloaded `status` |
| `supabase/migrations/20260720082438_phase3_claim_review_decision.sql` | Defines versioned Claim decision architecture |
| `supabase/migrations/20260720082441_phase3_claim_payment.sql` | Defines payment allocation and reconciliation architecture |
| `supabase/migrations/20260721142000_fix_claim_self_scope_update_policy.sql` | Defines self-scoped draft Claim update policy |
| `features/payer-rules/components/payer-detail-page.tsx` | Contains mixed Claim status filter values |
| `features/visit-list/data.ts` | Uses `claimStatus` as Claim Readiness mock data |
| `features/visit-list/types.ts` | Types `claimStatus` as `ClaimReadinessStatus` |
| `features/visit-list/visit-list-page.tsx` | Filters and displays Claim Readiness through `claimStatus` |
| `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md` | Existing Phase 4 architecture specification |
| `docs/database/PHASE-4-CLAIM-IMPACT-ANALYSIS.md` | Current impact analysis document |

### Proposed New Files

**Recommendation**

The following paths are proposed for later implementation planning only. Their existence has not been confirmed:

| Proposed File | Purpose |
|---|---|
| `supabase/migrations/<timestamp>_phase4_claim_state_refactor.sql` | Additive three-state migration |
| `supabase/tests/phase4_claim_state_test.sql` | State mapping and constraint tests |
| `supabase/tests/phase4_claim_workflow_test.sql` | Workflow transition tests |
| `supabase/tests/phase4_claim_security_test.sql` | RBAC/RLS tests |
| `supabase/tests/phase4_claim_payment_state_test.sql` | Payment summary and idempotency tests |
| `docs/database/PHASE-4-VALIDATION-REPORT.md` | Executed validation evidence after implementation |

The exact filenames, timestamps, and split strategy remain an **Open Decision** until repository conventions and work-package boundaries are approved.

---

## 26. Validation Status

**Not Verified**


No implementation validation is claimed by this document.

| Validation Area | Status |
|---|---|
| Repository inspection | PARTIAL |
| Phase 4 migration | NOT RUN |
| Legacy backfill | NOT RUN |
| RLS validation | NOT RUN |
| RBAC validation | NOT RUN |
| pgTAP tests | NOT RUN |
| Supabase DB reset | NOT RUN |
| Supabase DB lint | NOT RUN |
| TypeScript | NOT RUN |
| ESLint | NOT RUN |
| Build | NOT RUN |

---

## 27. Readiness Decision

**Recommendation**

```text
Status: PARTIAL
```

The repository contains sufficient evidence to confirm the overloaded Claim status problem and the existence of mature Phase 3 decision and payment structures.

Phase 4 migration implementation should begin only after the remaining payment header, workflow event, appeal, permission, and application-write paths are confirmed.

---

## 28. Decision Summary

### Overall Impact

**Recommendation**

**Major.** The refactor affects the Claim current-state schema, financial constraints, authorization boundaries, service contracts, frontend filters, dashboards, fixtures, and tests. A staged backward-compatible migration is recommended.

### P0/P1 Risks

**Confirmed Finding**

- **P0:** Generic update paths may expose protected Claim fields unless controlled mutations and ownership protection are introduced.
- **P0:** Incorrect legacy mapping could corrupt decision or payment meaning.
- **P1:** Existing financial constraints are coupled to overloaded `claims.status`.
- **P1:** Frontend code uses `claimStatus` for both readiness and mixed lifecycle states.
- **P1:** Decision and payment current-state synchronization rules are not yet confirmed.

### Phase 4 Readiness

**Recommendation**

**PARTIAL.** Phase 4 architecture work may continue, but implementation should not begin until payment-header behavior, workflow-event coverage, appeal scope, permission ownership, and application write paths are confirmed.

### Required Business Decisions

**Open Decision**

- Is `closed` operational completion only, or must it require settlement?
- Are refund, partial refund, and reversal in MVP scope?
- Is `payment_status` stored, derived, or transactionally synchronized?
- Are Claim-line decisions mandatory in Phase 4?
- Is Claim reopening allowed?
- Which role may record authoritative payer decisions?
- Which role or integration is authoritative for payments and refunds?
- When should the legacy `status` column become read-only and later be removed?

### Recommended Next Prompt

**Recommendation**

Use a repository-inspection prompt limited to the unresolved gaps:

```text
Inspect the existing Phase 3 Claim payment header, workflow-event,
appeal, RBAC permission, backend write-path, and frontend status usages.

Do not modify code or migrations.

Update PHASE-4-CLAIM-IMPACT-ANALYSIS.md with only:
- confirmed findings
- open decisions
- confirmed existing files
- proposed new files
- P0/P1 risks
- Phase 4 entry criteria
```

---

## 29. Classification Legend

- **Confirmed Finding** — Directly supported by inspected repository evidence.
- **Recommendation** — Proposed target behavior or implementation approach.
- **Open Decision** — Requires business or technical approval.
- **Not Verified** — Not executed, not inspected, or insufficient evidence.
