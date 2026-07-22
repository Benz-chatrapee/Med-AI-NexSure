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

---

## 30. Phase 4 Claim Gap Verification Update

**Confirmed Finding**

Verification date: 2026-07-22  
Verification type: static repository inspection only  
Readiness decision: **NOT READY**

This update closes multiple gaps that were still open in the earlier draft. It does not implement Phase 4.

### Evidence Base

| Path | Purpose | Finding | Impact |
|---|---|---|---|
| `docs/database/PHASE-3-VALIDATION-REPORT.md` | Phase 3 validation evidence | Phase 3 is `READY WITH CONDITIONS`; focused Claim isolation/self-scope tests are recorded as pass, but latest consolidated regression and app validation are not current | Phase 4 may use Phase 3 security evidence, but production readiness remains conditional |
| `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md` | Target Phase 4 design | Defines split workflow, decision, payment, appeal, line adjudication, concurrency, idempotency, RBAC, and RLS requirements | Architecture target is documentation only until implemented |
| `supabase/migrations/20260720082357_phase3_claim_core_tables.sql` | Claim core | Defines `claims`, `claim_status_history`, `claim_parties` | Confirms overloaded `claims.status` and existing lifecycle history |
| `supabase/migrations/20260720082359_phase3_claim_detail_tables.sql` | Claim details | Defines `claim_items`, diagnoses, procedures, documents | Confirms line items exist; dedicated `claim_line_decisions` not found |
| `supabase/migrations/20260720082438_phase3_claim_review_decision.sql` | Reviews and decisions | Defines `claim_reviews`, `claim_review_findings`, `claim_decisions`, `claim_decision_adjustments` | Confirms versioned human adjudication and item-level adjustments |
| `supabase/migrations/20260720082441_phase3_claim_payment.sql` | Payments | Defines `claim_payments`, `claim_payment_allocations`, `claim_payment_reconciliations` | Confirms payment header/event, allocation, reconciliation, idempotency, failure, reversal |
| `supabase/migrations/20260720082444_phase3_claim_functions.sql` | Controlled mutations | Defines `finalize_claim_decision`, `supersede_claim_decision`, `record_claim_payment`, `allocate_claim_payment`, `reconcile_claim_payment` | Confirms transaction-safe service-role functions; workflow, appeal, refund, reversal, close/cancel/reopen functions not found |
| `supabase/migrations/20260720082450_phase3_claim_permissions.sql` | RBAC | Defines Claim permission catalog and role mapping | Confirms create/read/update/submit/review/reopen/cancel/decide/payment/audit permissions; no `claim.appeal` or `claim.refund.record` found |
| `supabase/migrations/20260720082453_phase3_claim_rls.sql` | RLS | Enables RLS and restricts decision/payment writes | Confirms tenant/clinic scoping, assignment-aware helpers, server-only decision/payment writes |
| `supabase/tests/*.sql` | Database tests | Phase 3 Claim permissions/security/audit/self-scope/tenant isolation tests exist | Reviewed — Not Run |
| `features/payer-rules/components/payer-detail-page.tsx` | Payer rule detail | Uses one mixed `claimStatus` filter with workflow, decision, and payment values | Legacy UI impact confirmed |
| `features/visit-list/*` | Visit list | Uses `claimStatus` for readiness values | Readiness naming collision confirmed |
| `features/patient-claims/*` | Patient claims | Uses `ClaimStatus` union mixing readiness/workflow/decision values | Legacy UI impact confirmed |
| `features/claim-dashboard/*` | Dashboard | Uses readiness-style `claimStatus` in metrics/drilldown | Dashboard status collision confirmed |
| `lib/database.types.ts` | Generated DB types | Exposes `claims.status`, `claim_status_history`, decision/payment statuses as strings | Backend/type impact confirmed |

### Core Claim State

| Area | Evidence | Capability Status | Resolution |
|---|---|---|---|
| Tenant ownership | `organization_id`, `clinic_id`, tenant-safe FKs | Implemented | Closed by repository evidence |
| Current Claim status | `status text` with 19 allowed values | Implemented, overloaded | Closed by repository evidence |
| Decision pointer | `current_decision_id` tenant-safe FK | Implemented | Closed by repository evidence |
| Payment summary | `total_paid_amount`; no `payment_status`, `refunded_amount`, `net_paid_amount`, `outstanding_amount` on Claim | Partially Implemented | Still Open — business decision required |
| Assignment/owner | `created_by`, `updated_by`; review assignment in `claim_reviews.assigned_to`; no current owner on `claims` | Partially Implemented | Closed by repository evidence |
| Version/concurrency | `version integer not null default 1` | Implemented | Closed by repository evidence |
| Milestone timestamps | `submitted_at`, `closed_at` only | Partially Implemented | Still Open — business decision required |
| Soft deletion | `deleted_at`, `deleted_by` | Implemented | Closed by repository evidence |
| Audit columns | Created/updated/deleted fields and Phase 3 audit migration | Implemented | Closed by repository evidence |
| Constraints/indexes/RLS | Core constraints, Phase 3 indexes, RLS policies | Implemented for Phase 3 | Closed by repository evidence |

Authoritative source assessment:

| Domain | Source | Source Classification | Status |
|---|---|---|---|
| Workflow | `claims.status` + `claim_status_history` + functions writing legacy status | Duplicated source | Partially Implemented |
| Claim readiness | `claim_readiness_assessments` and `claim_readiness_items` | Domain record / derived value | Implemented |
| Payer decision | `claim_decisions`; `claims.current_decision_id`; `claims.status` mirrors outcome | Domain record + current pointer + duplicated snapshot | Partially Implemented |
| Payment settlement | `claim_payments`, allocations, reconciliations; `claims.total_paid_amount`; `claims.status` mirrors paid state | Transaction source plus summary | Partially Implemented |
| Appeal | No `claim_appeals` table found | Missing | Still Open — business decision required |
| Audit history | Claim audit migration and `claim_status_history` | Domain audit/event records | Partially Implemented |

### Payment Architecture

**Confirmed Finding**

`claim_payments` is both a payment transaction source of truth and a payment header/batch record. It records payment number/reference, payer/remittance references, idempotency key, lifecycle status, method, amounts, timestamps, failure/reversal/cancellation reasons, external source, and payload hash. `claim_payment_allocations` supports claim, claim-item, decision-adjustment, patient-responsibility, withholding, and other allocations. `claim_payment_reconciliations` stores expected versus received reconciliation outcomes.

| Value | Evidence | Synchronization Classification | Status |
|---|---|---|---|
| `payment_status` | Exists on `claim_payments`; proposed `claims.payment_status` absent | Transaction status implemented; Claim summary missing | Partially Implemented |
| `paid_amount` | `claims.total_paid_amount` updated by `record_claim_payment` when payment is received | Controlled function | Partially Implemented |
| `refunded_amount` | No Claim summary field found | Missing | Missing |
| `net_paid_amount` | Generated per `claim_payments` row; no Claim summary field | Transaction-level generated value | Partially Implemented |
| `outstanding_amount` | No stored Claim summary field found | Missing / derivable by query | Missing |

### Refund and Reversal Support

| Capability | Status | Evidence | Gap | Priority |
|---|---|---|---|---|
| Partial payment | Implemented | `record_claim_payment` supports cumulative payments and maps partial total to `partially_paid` | Summary still uses legacy `claims.status` | P1 |
| Payment failure | Partially Implemented | `claim_payments.payment_status = failed` and required failure fields exist | No controlled failure operation found | P2 |
| Partial refund | Missing | No refund table, refund status, or refund function found | Business and data model missing | P1 |
| Full refund | Missing | No refund operation found | Business and data model missing | P1 |
| Reversal | Partially Implemented | `payment_status = reversed`, reversal timestamps/reasons exist | No controlled reversal function or Claim summary sync found | P1 |
| Adjustment | Partially Implemented | `claim_decision_adjustments` and `claim_payments.adjustment_amount` exist | Payment adjustment semantics need confirmation | P2 |
| Overpayment | Partially Implemented | `record_claim_payment` rejects cumulative payment above payer responsibility | No explicit overpayment workflow | P2 |
| Reconciliation | Implemented | `claim_payment_reconciliations` plus `reconcile_claim_payment()` | Reviewed, not run | P2 |

| Proposed State | MVP Classification | Belongs As | Finding |
|---|---|---|---|
| `not_billable` | Required for MVP | Claim summary status + reason code | Missing on Claim |
| `pending` | Required for MVP | Claim summary status and payment transaction status | Transaction status exists; Claim summary missing |
| `partially_paid` | Required for MVP | Claim summary derived flag | Legacy `claims.status` only |
| `paid` | Required for MVP | Claim summary derived flag | Legacy `claims.status` only |
| `payment_failed` | Required before production | Claim summary status derived from latest failed transaction | Missing on Claim |
| `partially_refunded` | Required before production | Claim summary derived flag from refund transactions | Missing |
| `refunded` | Required before production | Claim summary derived flag from refund transactions | Missing |
| `reversed` | Required before production | Payment transaction status and Claim summary derived flag | Transaction status exists; summary/operation missing |

### Workflow History

**Confirmed Finding**

`claim_status_history` is an existing equivalent for legacy workflow history. It records previous/new status, reason code/text, actor, changed timestamp, correlation ID, tenant keys, sequence number, and metadata.

Limitations:

- It tracks overloaded legacy `claims.status`, not Phase 4 `workflow_status`.
- It lacks separate `occurred_at`, `effective_at`, `received_at`, and `recorded_at`.
- It has no `change_source` column, though functions write source metadata.
- No `transition_claim_workflow`, `submit_claim`, `close_claim`, `cancel_claim`, or `reopen_claim` function was found.

Classification: **Existing equivalent, but Phase 4 workflow history is Partially Implemented.**

### Decision and Claim-Line Architecture

**Confirmed Finding**

The repository implements multiple decisions per Claim through `claim_decisions.decision_version`, current decision pointer through `claims.current_decision_id`, supersession through `supersedes_decision_id` and `supersede_claim_decision()`, one active final decision per Claim through `claim_decisions_one_final_per_claim_uq`, header-level approved/rejected/patient/payer amounts, and item-level adjustment support through nullable `claim_decision_adjustments.claim_item_id`.

Assessment:

| Item | Status |
|---|---|
| `claim_decisions = authoritative history` | Implemented |
| `claims.current_decision_id = current pointer` | Implemented |
| `claims.decision_status = current snapshot` | Missing |
| Adjudication model | Both header and item-adjustment support, but no dedicated line-decision table |
| `partially_approved` calculation | Amount comparison in `claim_decisions` constraints, not full line aggregation |

Missing dedicated line adjudication remains **P1** because partial approval can be explained by amount comparison and adjustments, but not yet audited as a complete line-by-line adjudication record.

### Appeal Architecture

**Confirmed Finding**

No `claim_appeals`, `appeal_status`, `appeal_reason`, `appeal_deadline`, `reconsideration`, or `resubmission` implementation was found outside the Phase 4 specification.

Appeal architecture classification: **Required for Phase 4 / Missing**. `workflow_status = appealed` must not be treated as complete appeal support without a dedicated appeal entity.

### RBAC and RLS

| Action | Existing Permission | Scope Evidence | Gap | Priority |
|---|---|---|---|---|
| Create Claim | `claim.create` | Mapped to clinic staff, receptionist, admins, managers | Implemented | P2 |
| Read Claim | `claim.read` | RLS assignment restriction for standard reviewers | Implemented | P2 |
| Update mutable Claim | `claim.update` | Pre-submission direct update only | Column-level sensitive-field protection not proven | P1 |
| Submit Claim | `claim.submit` | Permission exists | No controlled submit function found | P1 |
| Review Claim | `claim.review` | Reviews/findings policies | Implemented | P2 |
| Appeal Claim | Missing | Not found | Required if appeals are in Phase 4 | P1 |
| Close Claim | No `claim.close` | Not found | Closure authority unresolved | P1 |
| Cancel Claim | `claim.cancel` | Permission exists | No controlled cancel function found | P1 |
| Reopen Claim | `claim.reopen` | Permission exists | No controlled reopen function found | P1 |
| Record decision | `claim.decide` | Service-role function exists | No secure authenticated wrapper found | P1 |
| Supersede decision | `claim.decision.supersede` | Service-role function exists | No secure authenticated wrapper found | P1 |
| Record payment | `claim.payment.record` | Finance roles | No secure authenticated wrapper found | P1 |
| Record refund | Missing | Not found | Required before production if refunds supported | P1 |
| Read audit | `claim.audit.read` | Auditor/compliance/senior roles | Implemented | P2 |

RLS is enabled on Claim-related Phase 3 tables when present. Authenticated users can read authorized decision/payment records, while direct insert/update/delete is revoked for decision and payment tables. Physical delete is revoked for application users. Private helper functions use fixed `search_path` and database membership/permission checks.

Potential unauthorized financial or decision mutation through exposed paths is **not confirmed**, because decision/payment writes are server-only. The remaining direct mutable Claim field ambiguity is **P1**, not P0, based on inspected RLS scope.

### Controlled Mutations

| Operation | Status | Permission | Tenant Check | Version | Audit/Event | Idempotency |
|---|---|---|---|---|---|---|
| `transition_claim_workflow` | Missing | Not found | Not found | Not found | Not found | Not found |
| `submit_claim` | Missing | `claim.submit` exists | Not found | Not found | Not found | Not found |
| `finalize_claim_decision` | Implemented server-only | `claim.decide` exists | Claim/review checked | Row lock + increments `claims.version`; no `expected_version` arg | Writes `claim_status_history`; audit trigger exists | No external event id |
| `supersede_claim_decision` | Implemented server-only | `claim.decision.supersede` exists | Same-tenant lineage checked | Row locks + increments version; no `expected_version` arg | Writes `claim_status_history`; audit trigger exists | No external event id |
| `record_claim_payment` | Implemented server-only | `claim.payment.record` exists | Current same-tenant decision checked | Row locks + increments version only for received payments; no `expected_version` arg | Writes `claim_status_history`; audit trigger exists | `idempotency_key` supported |
| `allocate_claim_payment` | Implemented server-only | `claim.payment.allocate` exists | Tenant-safe target checks | Payment row lock; no Claim version update | Audit trigger exists | No idempotency key |
| `reconcile_claim_payment` | Implemented server-only | `claim.payment.reconcile` exists | Payment row lock; tenant inherited | No Claim version update | Audit trigger exists | No idempotency key |
| `record_claim_refund` | Missing | Permission missing | Not found | Not found | Not found | Not found |
| `record_claim_reversal` | Missing | Reversal fields exist, permission missing | Not found | Not found | Not found | Not found |
| `submit_claim_appeal` | Missing | Permission missing | Not found | Not found | Not found | Not found |
| `close_claim` | Missing | Permission missing | Not found | Not found | Not found | Not found |
| `cancel_claim` | Missing | `claim.cancel` exists | Not found | Not found | Not found | Not found |
| `reopen_claim` | Missing | `claim.reopen` exists | Not found | Not found | Not found | Not found |

### Concurrency and Idempotency

| Control | Evidence | Status | Gap | Priority |
|---|---|---|---|---|
| Optimistic concurrency field | `claims.version` exists | Implemented | Not exposed as `expected_version` in functions | P1 |
| Row locking | Functions use `for update` | Implemented | Workflow/cancel/reopen absent | P1 |
| Duplicate decision prevention | One-final index, version lineage, supersession function | Partially Implemented | No external event ID ordering | P1 |
| Duplicate payment prevention | `idempotency_key`, unique payment reference, function duplicate handling | Implemented for `record_claim_payment` | No refund/reversal idempotency | P1 |
| Out-of-order event protection | Decision version lineage exists | Partially Implemented | No payer/payment `external_event_id`, `effective_at`, or sequence model | P1 |
| Decision correction | `supersede_claim_decision()` | Implemented | Still maps into legacy `claims.status` | P1 |

### Backend and Frontend Legacy Usage

| File | Usage Classification | Finding | Priority |
|---|---|---|---|
| `lib/database.types.ts` | Generated type / API DTO base | `claims.status`, `claim_status_history`, decision/payment statuses typed as `string`; no split Claim state fields | P1 |
| `features/payer-rules/components/payer-detail-page.tsx` | Filter/display legacy status | `claimStatus` mixes `Submitted`, `Pending Evidence`, `Under Review`, `Draft`, `Approved`, `Paid` | P1 |
| `features/visit-list/types.ts` | Claim Readiness | `claimStatus: ClaimReadinessStatus` actually means readiness | P2 |
| `features/visit-list/data.ts` | Mock readiness data | Values `Ready`, `Needs Review`, `Not Ready`, `Calculating` | P2 |
| `features/visit-list/visit-list-page.tsx` | Filter/display readiness | Filters and badges use readiness through `claimStatus` | P2 |
| `features/patient-claims/types/patient-claims.types.ts` | Mixed Claim status type | `ClaimStatus = draft/not_ready/needs_review/submitted/pending/approved/rejected` mixes readiness, workflow, and decision | P1 |
| `features/patient-claims/utils/patient-claims-utils.ts` | Filter/aggregate legacy status | Filters and KPI status mapping use single `claimStatus` | P1 |
| `features/patient-claims/components/patient-claims-workspace.tsx` | Display/filter legacy status | Uses one Status column and approved KPI filter | P1 |
| `features/claim-dashboard/*` | Dashboard readiness/status metrics | Uses `claimStatus` primarily for readiness queue composition | P1 |
| `features/executive-dashboard/domain/rules.ts` | Aggregate readiness | Counts `claimStatus` readiness values | P2 |
| `features/departments/data/department-dashboard.mock.ts` | Mock status collision | Uses `ready_for_submission`, `needs_review`, `draft` | P2 |

No application file writing `public.claims.status` through Supabase was confirmed in this static search. Current operational Claim writes appear concentrated in SQL migrations/functions and mock-backed frontend features.

### Tests, Fixtures, Seed Data, and Mocks

| Area | Evidence | Review Status |
|---|---|---|
| Claim schema and workflow | `phase3_claim_security_test.sql`, `phase3_claim_self_scope_test.sql`, `phase3_claim_tenant_isolation_test.sql` | Reviewed — Not Run |
| Decisions and adjustments | Phase 3 migrations and audit/security tests reference decision tables | Reviewed — Not Run |
| Claim-line decisions | `claim_items` exists; no `claim_line_decisions` test found | Not Found |
| Payment and reconciliation | Payment migration/functions; no dedicated Phase 4 payment state tests found | Reviewed — Not Run |
| Refund and reversal | Reversal fields exist; refund tests not found | Not Found |
| Appeal | No appeal tests found | Not Found |
| RBAC and RLS | Claim permissions/security/self-scope/tenant tests | Reviewed — Not Run |
| Audit | `phase3_claim_audit_test.sql` | Reviewed — Not Run |
| Concurrency | Row locks/version increments found; no `expected_version` test found | Reviewed — Not Run |
| Idempotency | Payment/review idempotency keys and indexes found; no latest executed test | Reviewed — Not Run |
| Event ordering | No external event ordering tests found | Not Found |
| Legacy backfill | No Phase 4 backfill tests found | Not Found |
| TypeScript tests | Claim/patient dashboard utility tests exist; no Phase 4 split-state tests | Reviewed — Not Run |

Static inspection is not reported as test PASS.

### Decision Resolution Matrix

| Decision | Evidence | Classification | Recommendation | Resolution |
|---|---|---|---|---|
| Is `closed` operational or financial? | Spec says operational; current `claims.status` overloads meanings | Open Decision | Treat as operational unless business requires settlement | Still Open — business decision required |
| Is payment transaction-based, summary-based, or both? | `claim_payments` plus `claims.total_paid_amount` | Confirmed Finding | Transaction source plus controlled Claim summary | Closed by repository evidence |
| Is `payment_status` stored, derived, or synchronized? | Only transaction status exists; Claim summary missing | Confirmed Finding | Add controlled/derived `claims.payment_status` summary | Still Open — business decision required |
| Are partial refund and reversal in MVP? | Reversal fields exist; refund missing | Open Decision | Confirm scope before implementation | Still Open — business decision required |
| Is Claim-line adjudication required? | `claim_items` and item adjustments exist; no line decision table | Recommendation | Required if partial approval must be line-auditable | Still Open — business decision required |
| How is `partially_approved` derived? | Amount comparison constraint | Confirmed Finding | Preserve amount comparison; add line aggregation if line decisions exist | Closed by repository evidence |
| Is a dedicated Appeal entity required? | No appeal table found; spec requires it | Recommendation | Add appeal entity if appeals remain in scope | Still Open — business decision required |
| Can organization roles access all clinics? | RLS requires `has_clinic_access`; org-wide behavior not separately proven | Not Verified | Add explicit org-wide clinic tests | Still Open — technical inspection required |
| Who records payer decisions? | `claim.decide`, reviewer roles, service-role function | Confirmed Finding | Secure wrapper must derive actor and enforce permission | Still Open — technical inspection required |
| Who records payment/refund/reversal? | Finance roles have payment permissions; refund/reversal missing | Confirmed Finding | Define refund/reversal authority | Still Open — business decision required |
| Can Claims be reopened? | `claim.reopen` exists; no function found | Confirmed Finding | Implement only with reason/version/audit/elevated permission | Still Open — business decision required |
| Is optimistic concurrency implemented? | `claims.version` and row locks exist; no `expected_version` args | Partially Implemented | Add expected-version controlled mutations | Still Open — technical inspection required |
| Are external events idempotent? | Payment idempotency exists; decision external event fields missing | Partially Implemented | Add external event IDs/order controls | Still Open — technical inspection required |
| What is decision source of truth? | `claim_decisions` + `claims.current_decision_id` | Confirmed Finding | Use decisions as authoritative history and pointer/snapshot for current state | Closed by repository evidence |
| What is payment source of truth? | Payment tables | Confirmed Finding | Use payment tables as transaction source; Claim summary as projection | Closed by repository evidence |
| When can legacy writes stop? | App and SQL still use legacy status | Open Decision | Stop after split-state migration, wrappers, backfill, UI/API cutover pass | Still Open — business decision required |
| When can legacy field be removed? | Constraints/RLS/functions still depend on `claims.status` | Open Decision | Remove only after no reads/writes/tests depend on it | Still Open — business decision required |

### Updated P0/P1 Risk Register

No open **P0** risk is confirmed by repository evidence in this static pass, because direct decision/payment table writes are revoked from authenticated users and sensitive functions are granted only to `service_role`.

| Risk | Priority | Evidence | Recommendation |
|---|---|---|---|
| `claims.status` remains overloaded and is still written by controlled decision/payment functions | P1 | SQL functions | Split workflow/decision/payment current-state columns |
| Direct pre-submission `claims_update_authorized` may permit changes to sensitive columns while status remains mutable | P1 | RLS update policy | Add controlled mutation or column protection for ownership, financial, pointer, version, milestones |
| No controlled workflow transition/submit/close/cancel/reopen functions found | P1 | Function search | Implement dedicated workflow operations |
| Appeal entity missing | P1 | No `claim_appeals` implementation | Add dedicated appeal table/workflow if in scope |
| Refund support missing; reversal operation missing | P1 | Payment table has reversal fields; no refund/reversal function | Decide scope and add transaction-safe operations |
| `expected_version` not accepted by existing functions | P1 | Function signatures | Add stale update rejection |
| Dedicated line adjudication missing | P1 | `claim_items` and adjustments only | Add `claim_line_decisions` or approve adjustment-only model |
| External event ordering incomplete | P1 | No decision/payment event sequence model | Add event IDs/effective timestamps |
| UI/backend generated types rely on single status semantics | P1 | `lib/database.types.ts`, payer rules, patient claims, dashboards | Plan API/UI split-state cutover |

### Entry Criteria Before Phase 4 Implementation

**Recommendation**

1. Business confirms `closed`, appeal, reopen, refund, reversal, and line-adjudication scope.
2. Architecture confirms Claim summary synchronization for decision and payment.
3. Secure backend wrappers are designed for service-role functions and actor derivation.
4. `expected_version` and external event idempotency/order strategy are approved.
5. Legacy `claims.status` read/write inventory is accepted.
6. Phase 4 pgTAP coverage is planned for split state, backfill, RLS, controlled mutations, concurrency, and idempotency.

### Validation Limitations

**Not Verified**

- Tests were reviewed but not run.
- Migrations were inspected but not executed.
- Local and production data were not queried.
- Query plans were not measured.
- Integrations were not executed.
- No destructive command was run.
- No implementation file, migration, SQL policy, backend, frontend, test, fixture, generated type, or seed data was changed.
- Static inspection cannot prove production data distributions, remote migration parity, application runtime behavior, or test PASS.

---

## Decision Summary

- Overall Impact: Major. Phase 4 affects Claim current state, legacy status constraints, controlled mutations, RBAC/RLS, service wrappers, generated types, frontend filters, dashboards, tests, and validation docs.
- Gaps Closed: Payment header/allocation/reconciliation confirmed; workflow history equivalent confirmed; decision source of truth confirmed; `claim_items` confirmed; Phase 3 RBAC/RLS and server-only decision/payment write boundary confirmed.
- Gaps Still Open: Appeal entity, refund model, reversal operation, split Claim status snapshots, workflow operations, expected-version API, external event ordering, line-decision model, secure service wrappers, legacy status cutover.
- P0 Risks: None confirmed by static repository evidence.
- P1 Risks: Overloaded status still authoritative; sensitive direct pre-submission update ambiguity; missing workflow/appeal/refund/reversal operations; missing expected-version checks; missing split-state UI/API cutover.
- Claim Source of Truth: `public.claims` remains the aggregate, but current state is overloaded and must be split.
- Workflow Source of Truth: `claims.status` + `claim_status_history` currently; Phase 4 `workflow_status` is missing.
- Decision Source of Truth: `claim_decisions` plus `claims.current_decision_id`; `claims.decision_status` snapshot is missing.
- Payment Source of Truth: `claim_payments`, `claim_payment_allocations`, and `claim_payment_reconciliations`; Claim payment summary is partial through `total_paid_amount`.
- Refund and Reversal: Reversal fields exist on payment rows; refund model and reversal/refund functions are missing.
- Appeal Architecture: Missing; required for Phase 4 if appeal workflow remains in scope.
- Claim-Line Adjudication: `claim_items` and decision adjustments exist; dedicated `claim_line_decisions` is missing.
- Concurrency: Row locks and `claims.version` exist; explicit `expected_version` stale-write rejection is missing.
- Idempotency: Payment idempotency exists; decision/refund/reversal external event idempotency is incomplete.
- Phase 4 Readiness: NOT READY.
- Required Business Decisions: Define closed semantics, refund/reversal MVP scope, appeal model, line adjudication requirement, reopen rules, payer decision authority, payment/refund/reversal authority, and legacy status retirement timeline.
- Recommended Next Prompt: Implement a Phase 4 design plan only, limited to split Claim state, workflow operations, appeal/refund/reversal decisions, expected-version/idempotency strategy, secure service wrappers, and pgTAP coverage. Do not write migrations until business decisions are approved.
