# Phase 4 Claim Architecture Decisions

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure |
| Document | Phase 4 Claim Architecture Decisions |
| File | `docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md` |
| Phase | Phase 4 - Claim Architecture |
| Version | 0.2 |
| Overall ADR status | Approved |
| Implementation status | Not Started |
| Created date | 2026-07-22 |
| Last updated | 2026-07-22 |
| Repository branch | `main` |
| Repository commit | `6ff0621` |
| Required approvers | Project Owner / Product Owner approval recorded for ADR-001 through ADR-008; role-specific technical reviews remain required where applicable |
| Implementation gate | Blocked until all remaining P1 technical dependency decisions and verification gates are resolved |
| Approval date | 2026-07-22 |
| Approval authority | Project Owner / Product Owner |
| Approval reference | Explicit Phase 4 approval dated 2026-07-22 |

## 2. Purpose and Scope

This document records the Phase 4 Claim architecture decisions required before implementation begins. It is based on `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md`, `docs/database/PHASE-4-CLAIM-IMPACT-ANALYSIS.md`, `docs/database/PHASE-3-VALIDATION-REPORT.md`, and static repository findings from Claim migrations, generated database types, tests, and frontend references.

Scope is architecture documentation only. No migration, SQL, RLS, backend, frontend, API, test, fixture, seed, generated type, Git history, or production configuration change is made by this document.

Evidence classifications used here:

| Classification | Meaning |
| --- | --- |
| Confirmed Finding | Verified in repository implementation or validation report |
| Business Requirement | Supplied by product/domain authority in the Phase 4 request or specification |
| Recommendation | Proposed technical direction awaiting approval |
| Not Verified | Evidence is unavailable, incomplete, or not executed |

ADR records in this document now use `Approved`. Implementation statuses are tracked separately as `Not Started`, `Planned`, `In Progress`, `Implemented`, `Validated`, or `Deferred`.

## 3. Architecture Principles

1. Workflow, payer decision, payment settlement, readiness, and evidence status are independent domains.
2. `approved` does not mean `paid`.
3. `closed` does not implicitly mean financially settled.
4. `cancelled` does not automatically mean decision `voided`.
5. Payer decisions require an authoritative payer or controlled adjudication source.
6. Payment state requires transaction or reconciliation evidence.
7. AI is Decision Support only and cannot authoritatively approve, reject, pay, refund, or reverse Claims.
8. Organization and clinic isolation must remain enforced.
9. Sensitive mutations require explicit RBAC permissions.
10. Material changes require tenant-safe audit evidence.
11. Current snapshots and authoritative domain records must not conflict.
12. Legacy status retirement must be staged and non-destructive.
13. Financial amounts must use exact numeric types.
14. Duplicate or out-of-order external events must not corrupt state.

## 4. Source-of-Truth Matrix

| Domain | Authoritative Source | Current Snapshot | Authorized Writer | Audit Source | Status |
| --- | --- | --- | --- | --- | --- |
| Workflow | Current: overloaded `claims.status`; a workflow history structure was reported during repository inspection but its full schema and authority require explicit verification. Target: `claims.workflow_status` plus controlled workflow events | Current: overloaded `claims.status`; Target: `claims.workflow_status` | Med AI NexSure workflow operation with explicit permission | Verified workflow event/history table or approved successor | Partially Implemented / History Authority Not Verified |
| Claim Readiness | Existing readiness rules and assessments | Readiness-specific fields/views, not Claim decision or payment state | Authorized readiness/review operation | Existing readiness/audit records where implemented | Confirmed Finding |
| Payer Decision | `claim_decisions` plus `claims.current_decision_id` | Target: `claims.decision_status`; currently missing | Trusted payer integration or explicitly authorized adjudication role | `claim_decisions`, `claim_status_history`, audit trigger | Partially Implemented |
| Payment | `claim_payments`, `claim_payment_allocations`, `claim_payment_reconciliations` | `claims.total_paid_amount`; target `claims.payment_status` missing | Payment/reconciliation integration or authorized finance role | Payment tables and audit trigger | Partially Implemented |
| Appeal | Target dedicated `claim_appeals`; repository implementation not found | `workflow_status = appealed` summary only | Authorized appeal operation | Dedicated appeal record plus workflow event | Missing / Approved Scope |
| AI Recommendation | Decision-support records only | AI assessment pointer or recommendation state | AI service may recommend only | AI assessment/recommendation audit where implemented | Non-authoritative |

AI Recommendation must never be an authoritative source for payer decision or payment.

## 5. Decision Summary

| ADR | Decision | Final Direction | ADR Status | Implementation Status | Owner | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| ADR-001 | Closed Semantics | `closed` means operational completion; payment remains independent | Approved | Not Started | Product Owner / Claim Domain Owner | Phase 4 |
| ADR-002 | Appeal Scope | Every formal appeal requires a dedicated Appeal record; workflow `appealed` is summary only | Approved | Not Started | Claim Domain Owner | Phase 4 |
| ADR-003 | Refund and Reversal MVP Scope | Transactions are authoritative; refund/reversal remain distinguishable history | Approved | Not Started | Product Owner / Finance Owner | Phase 4 |
| ADR-004 | Claim-Line Adjudication Scope | Phase 4 MVP uses current Claim decision header plus item adjustments; dedicated line decisions are deferred to a separately approved work package | Approved | Not Started | Claim Domain Owner / Database Architect | Phase 4 |
| ADR-005 | Claim Reopen Rules | No ordinary terminal reopen; dedicated elevated action only, with post-submission cases preferring linked revision or resubmission | Approved | Not Started | Security Lead / Claim Domain Owner | Phase 4 |
| ADR-006 | Payer Decision Authority | Trusted payer integration primary; controlled adjudication fallback; AI recommendation only | Approved | Not Started | Claim Domain Owner / Security Lead | Phase 4 |
| ADR-007 | Payment Authority | Payment/reconciliation integration primary; controlled finance fallback; AI has no authority | Approved | Not Started | Finance Owner / Security Lead | Phase 4 |
| ADR-008 | Legacy Status Retirement | Staged retirement; no indefinite dual-write and no immediate removal | Approved | Not Started | Database Architect / Product Owner | Phase 4 |

## 6. Architecture Decision Records

### ADR-001 - Closed Semantics

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Product Owner / Claim Domain Owner
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-001 (Proposed), P4-REQ-002 (Proposed)
**Related Risks:** P4-RISK-001, P4-RISK-002
**Related Tests:** P4-TEST-WF-001 (Proposed), P4-TEST-PAY-001 (Proposed)
**Repository Evidence:** Confirmed Finding - `claims.status` currently includes `closed`, decision states, and payment states, while payment is represented separately in `claim_payments`. Not Verified - the full schema and authority of the reported workflow history structure have not yet been independently validated in this ADR.

#### Context

The current overloaded `claims.status` cannot represent operational closure independently from payer decision and payment settlement. Phase 4 requires a clear rule so dashboards, queues, and settlement workflows do not infer `paid` from `closed`.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Operational closure | `closed` means operational processing complete | Preserves independent payment state | Requires separate financial exception handling | Users may expect closed to mean fully settled |
| Financial closure | `closed` requires full financial settlement | Simple for finance dashboards | Blocks valid operational closure with pending payment | Overloads workflow with payment state |
| Operational plus derived settlement indicator | `closed` remains workflow; payment summary shows settlement | Best domain separation | Requires UI/API changes | More fields to validate |

#### Proposed Decision

Approved decision: `closed = operational processing complete`. Payment exceptions, appeals, and unresolved tasks do not automatically block closure unless an approved configurable closure rule explicitly requires them.

#### Rationale

This preserves correctness, auditability, and maintainability by preventing workflow status from silently carrying financial meaning. It supports valid states such as `closed + approved + pending` while preserving Human-in-the-Loop review for exceptions.

#### Consequences

**Positive**
- Claims can be operationally closed without fabricating payment evidence.
- Financial dashboards can use payment records and summaries directly.
- Closure audit remains distinct from settlement audit.

**Trade-offs**
- UI must display workflow, decision, and payment separately.
- Business stakeholders must approve any closure blockers.

#### Data and Source-of-Truth Impact

Workflow closure is authoritative in workflow events/current workflow snapshot. Payment settlement remains authoritative in payment transactions and reconciliation records.

#### Security, Privacy, and Compliance Impact

Closure requires explicit permission, tenant and clinic validation, reason/audit metadata where material, and no PHI/PII copied into unrestricted metadata. AI cannot close Claims authoritatively.

#### Implementation Impact

Add or update workflow state columns/functions, closure rules, UI badges, API DTOs, tests, and audit events. Do not write payment status during closure except through validated payment logic.

#### Acceptance Criteria

- `closed + approved + pending` is valid when approved by rules.
- Closure never sets payment to `paid`.
- Closure event records actor, source, reason when required, timestamp, and version.
- Tests prove closure and payment status remain independent.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve operational closure semantics | Product Owner / Claim Domain Owner | Phase 4 | P1 | Pending |
| Define closure blockers, if any | Claim Domain Owner | Phase 4 | P1 | Pending |
| Add closure tests to Phase 4 plan | QA Lead | Phase 4 | P1 | Planned |

### ADR-002 - Appeal Scope

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Claim Domain Owner
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-003 (Proposed)
**Related Risks:** P4-RISK-003
**Related Tests:** P4-TEST-APP-001 (Proposed)
**Repository Evidence:** Confirmed Finding - no `claim_appeals`, appeal status, appeal reason, or appeal deadline implementation was found outside the Phase 4 specification.

#### Context

The Phase 4 workflow includes `appealed`, but a workflow state alone cannot preserve appeal reason, owner, deadline, evidence, payer reference, or outcome.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Workflow summary only | Use `workflow_status = appealed` without dedicated record | Minimal MVP scope | Weak auditability | Appeal evidence and deadlines may be lost |
| Dedicated MVP Appeal record | Store appeal case data and use workflow as summary | Auditable and extensible | Requires table, RLS, APIs, UI | More implementation work |
| Full multi-round lifecycle | Complete appeal case management | Enterprise-complete | Larger scope | May delay Phase 4 |

#### Proposed Decision

Approved decision: every formal appeal must create a dedicated MVP Appeal record. `workflow_status = appealed` is a summary only and must never be the sole source for appeal reason, ownership, deadline, evidence, payer reference, or outcome. Informal rework and `request_information` are not classified as appeals. Defer full multi-round appeal automation unless explicitly approved for Phase 4.

#### Rationale

This balances MVP delivery with healthcare claim audit needs. It prevents lossy appeal handling while avoiding a full appeal product implementation before scope is approved.

#### Consequences

**Positive**
- Appeal-specific facts are auditable.
- Workflow queues remain simple.
- Future multi-round appeals have a safe extension path.

**Trade-offs**
- MVP requires a new appeal domain record and RLS policies.
- Scope boundaries must be explicit.

#### Data and Source-of-Truth Impact

Appeal records are authoritative for appeal details. Claim workflow is only the current operational summary.

#### Security, Privacy, and Compliance Impact

Appeal data may contain sensitive clinical and payer evidence. RLS must enforce organization/clinic scope, appeal permission, evidence access, and audit retention. AI cannot submit or decide appeals authoritatively.

#### Implementation Impact

If approved, Phase 4 must add `claim_appeals`, controlled appeal operations, tenant-safe foreign keys, RLS/RBAC, audit events, backend contracts, UI states, and tests.

#### Acceptance Criteria

- Every formal appeal creates a dedicated Appeal record.
- `workflow_status = appealed` does not carry appeal deadline or outcome by itself.
- Appeal records preserve sequence, reason, owner, evidence references, payer reference, and outcome.
- Cross-tenant and cross-clinic appeal access is denied.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve MVP appeal entity scope | Claim Domain Owner | Phase 4 | P1 | Pending |
| Confirm whether multi-round appeals are deferred | Product Owner | Phase 4 | P2 | Pending |
| Define appeal permissions | Security Lead | Phase 4 | P1 | Pending |

### ADR-003 - Refund and Reversal MVP Scope

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Product Owner / Finance Owner
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-004 (Proposed), P4-REQ-005 (Proposed)
**Related Risks:** P4-RISK-004, P4-RISK-005
**Related Tests:** P4-TEST-PAY-002 (Proposed), P4-TEST-PAY-003 (Proposed)
**Repository Evidence:** Confirmed Finding - `claim_payments`, allocations, reconciliations, payment references, idempotency-related structures, and failure-related fields exist. Not Verified - a complete authoritative refund and reversal transaction workflow was not confirmed.

#### Context

Payment state must be transaction-based. Refunds, reversals, failures, adjustments, and overpayments affect financial state differently and must not overwrite payment history.

For this ADR:
- `refund` means returning funds after a successful payment.
- `reversal` means voiding or reversing a prior transaction while preserving the original transaction record.
- `payment_failed` means a payment attempt did not complete successfully.
- `adjustment` means an approved financial correction that is not automatically equivalent to a refund or reversal.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Summary statuses only | Store only Claim-level payment state | Easy to query | Poor audit trail | Silent financial overwrite |
| Transaction authority with summary | Store payment/refund/reversal transactions and maintain summary | Auditable and queryable | More constraints/functions | Requires precise finance rules |
| Defer all negative flows | MVP supports payments only | Smaller MVP | Blocks production exception handling | Refund/reversal data may be handled outside system |

#### Proposed Decision

Approved decision: transactions are authoritative; Claim payment status is a current summary. Refund and reversal must remain distinguishable in audit history.

| Capability | MVP Classification | Belongs As |
| --- | --- | --- |
| `payment_failed` | Included in MVP | Transaction status plus derived Claim summary |
| partial refund | Required before production | Payment transaction type and derived status |
| full refund | Required before production | Payment transaction type and derived status |
| reversal | Required before production | Payment transaction type/status and reason code |
| adjustment | Deferred unless finance approves MVP use | Transaction or allocation adjustment with reason code |
| overpayment | Deferred | Exception workflow and reconciliation reason |

#### Rationale

Financial correctness requires exact numeric amounts, immutable history, idempotency, and reconciliation evidence. Claim summaries are useful but cannot replace transaction records.

#### Consequences

**Positive**
- Duplicate or reversed payments can be audited.
- Payment summary can be rebuilt from authoritative records.
- Refund and reversal reporting remains accurate.

**Trade-offs**
- Finance scope and permissions must be approved.
- More tests are required for idempotency and amount consistency.

#### Data and Source-of-Truth Impact

Payment tables are authoritative. `claims.payment_status` and totals are transactionally maintained or derived projections.

#### Security, Privacy, and Compliance Impact

Financial mutations require finance-specific permissions, idempotency keys, amount/currency validation, reconciliation evidence, and audit metadata. Generic Claim editors and AI must not record payment, refund, reversal, or adjustment authority.

#### Implementation Impact

Add/refine payment summary, refund/reversal operations, permissions, idempotency, amount/currency constraints, backend DTOs, UI states, and pgTAP tests. Existing payment tables must be reused, not duplicated.

#### Acceptance Criteria

- Payment, refund, and reversal do not overwrite prior transactions.
- Duplicate external payment events do not double-count.
- Claim payment summary matches authoritative transactions.
- AI and generic Claim update cannot mutate financial state.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve refund/reversal MVP classification | Product Owner / Finance Owner | Phase 4 | P1 | Pending |
| Define finance permissions and fallback process | Security Lead / Finance Owner | Phase 4 | P1 | Pending |
| Define reconciliation and currency rules | Finance Owner / Database Architect | Phase 4 | P1 | Pending |

### ADR-004 - Claim-Line Adjudication Scope

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Claim Domain Owner / Database Architect
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-006 (Proposed)
**Related Risks:** P4-RISK-006
**Related Tests:** P4-TEST-DEC-001 (Proposed), P4-TEST-LINE-001 (Proposed)
**Repository Evidence:** Confirmed Finding - `claim_items` and item-level decision adjustments exist; no dedicated `claim_line_decisions` table was found.

#### Context

Partial approval can currently be represented by decision amount comparisons and adjustments, but full enterprise adjudication often requires line-level outcomes.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Header-only decision | One Claim-level decision | Fastest implementation | Weak line audit | Hard to explain partial approvals |
| Line-only decision | All outcomes live on lines | Detailed adjudication | More complex aggregation | Header summaries can drift |
| Hybrid line decisions with Claim aggregate | Lines are authoritative; Claim status is aggregate | Enterprise-grade audit and reporting | Largest MVP scope | Requires robust aggregation tests |

#### Proposed Decision

Approved Phase 4 MVP option: preserve `claim_decisions` as the authoritative decision-round header and use existing item-level adjustments for explainable partial approval. Do not introduce a dedicated `claim_line_decisions` table in the initial Phase 4 migration. Dedicated line adjudication is deferred to a separately approved work package with its own schema, aggregation, RLS, API, UI, and test scope. The MVP adjustment model must not be represented as complete line adjudication.

#### Rationale

Hybrid line decisions support traceability, explainability, payer evidence, and accurate partial approval reporting. A temporary adjustment-only model may be acceptable only with explicit approval and clear limitations.

#### Consequences

**Positive**
- Partial approvals become auditable per line.
- Claim-level summaries can be tested against line outcomes.
- Payer explanations are easier to preserve.

**Trade-offs**
- Requires new schema, constraints, aggregation logic, and tests if included in MVP.
- Existing decision adjustments must be mapped carefully.

#### Data and Source-of-Truth Impact

Phase 4 MVP: `claim_decisions` is authoritative for the decision round, while existing item adjustments provide limited item-level explanation. `claims.decision_status` is the current Claim-level snapshot. Future dedicated line decisions require a separate ADR and migration.

#### Security, Privacy, and Compliance Impact

Line adjudication may expose service, diagnosis, medication, and benefit details. RLS must enforce tenant/clinic scope and payer decision permission. AI may recommend line review but cannot authoritatively adjudicate.

#### Implementation Impact

For Phase 4 MVP, document and enforce the limits of header decision plus item adjustments. Do not add `claim_line_decisions` in the initial migration. Create a separate future work package before implementing dedicated line adjudication.

#### Acceptance Criteria

- `partially_approved` Claim-level amount and adjustment rules are explicit and tested.
- Item adjustments are not presented as complete authoritative line adjudication.
- A future line-decision model cannot be introduced without a separate approved ADR.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve header decision plus item-adjustment MVP scope | Claim Domain Owner | Phase 4 | P1 | Pending |
| Document adjustment-model limitations | Database Architect | Phase 4 | P1 | Pending |
| Create future line-adjudication work package | Product Owner / Database Architect | Future Claim Phase | P2 | Deferred |
| Add Claim-level amount and adjustment tests | QA Lead | Phase 4 | P1 | Planned |

### ADR-005 - Claim Reopen Rules

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Security Lead / Claim Domain Owner
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-007 (Proposed)
**Related Risks:** P4-RISK-007
**Related Tests:** P4-TEST-WF-002 (Proposed), P4-TEST-SEC-001 (Proposed)
**Repository Evidence:** Confirmed Finding - `claim.reopen` permission exists; no controlled `reopen_claim` function was found.

#### Context

Terminal states such as `closed` and `cancelled` must not be casually reopened because decision and payment histories may already exist.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Ordinary status update | Generic update moves terminal Claim back to workflow | Easy | Unsafe | History and payments can be corrupted |
| Dedicated reopen action | Elevated function with reason/version/audit | Safe and auditable | Requires workflow design | More operational friction |
| New Claim/revision preferred | Create linked revision instead of reopening | Clean history | More user workflow | May be too heavy for simple corrections |

#### Proposed Decision

Approved decision: no direct ordinary reopen. Reopen requires dedicated action, elevated permission, reason code and text, audit history preservation, version check, protected external payer references, and no rewriting of payment or decision history.

Allowed source states and targets require technical verification before implementation. Default approved direction: `closed -> needs_review` or `appealed` through a controlled action. A pre-submission cancelled Claim may be reopened only under an approved rule. A post-submission cancellation must create a linked Claim revision or resubmission rather than resetting the original Claim to `draft`. External payer references and history must never be silently reused or rewritten.

#### Rationale

Terminal-state reopening is a high-risk clinical, financial, and audit operation. Explicit controls preserve traceability and prevent silent state corruption.

#### Consequences

**Positive**
- Terminal mutations are reviewable and auditable.
- Payer and payment histories remain immutable.
- Cross-tenant mutation attempts stay controlled.

**Trade-offs**
- Users need a dedicated workflow.
- Business must define time limits and revision preference.

#### Data and Source-of-Truth Impact

Reopen changes workflow state only. Decision and payment authoritative records remain unchanged. New review/appeal/revision records may be required for follow-up work.

#### Security, Privacy, and Compliance Impact

Requires elevated RBAC, RLS `WITH CHECK`, expected version, actor/source/reason/timestamp, and tenant-safe audit. AI cannot reopen Claims.

#### Implementation Impact

Add controlled `reopen_claim` operation, permission enforcement, transition tests, audit records, backend action/API, UI confirmation, and stale-version handling.

#### Acceptance Criteria

- Generic `claim.update` cannot reopen terminal Claims.
- Reopen requires reason code, reason text, permission, tenant/clinic scope, and expected version.
- Decision/payment history is never rewritten.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve allowed reopen states and time limits | Claim Domain Owner | Phase 4 | P1 | Pending |
| Decide reopen versus new revision preference | Product Owner | Phase 4 | P1 | Pending |
| Define security tests | Security Lead / QA Lead | Phase 4 | P1 | Planned |

### ADR-006 - Payer Decision Authority

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Claim Domain Owner / Security Lead
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-008 (Proposed)
**Related Risks:** P4-RISK-008
**Related Tests:** P4-TEST-DEC-002 (Proposed), P4-TEST-SEC-002 (Proposed)
**Repository Evidence:** Confirmed Finding - `claim.decide`, service-role `finalize_claim_decision`, `supersede_claim_decision`, `claim_decisions`, and current decision pointer exist; secure authenticated wrapper and external event ID strategy are not verified.

#### Context

Payer decisions alter claim liability and must come from an authoritative payer or controlled adjudicator. Generic Claim editing and AI recommendations are not acceptable decision authorities.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Payer integration only | Only trusted payer events record decisions | Strong authority | Blocks manual exception handling | Operational delays |
| Authorized adjudicator only | Human adjudication role records decisions | Works without integration | More manual controls | Source may be less authoritative |
| Integration with controlled fallback | Payer integration primary; authorized adjudicator fallback | Balanced and auditable | Requires clear permissions/source metadata | Misuse if fallback is too broad |

#### Proposed Decision

Approved decision: primary authority is trusted payer integration. Fallback is an explicitly authorized adjudication role. AI is recommendation only. Generic Claim editor is prohibited from setting decision status.

Decision records must include permission, source reference, payer reference, external event ID where available, effective time, idempotency, supersession, and override audit.

#### Rationale

This preserves payer authority, human exception handling, and auditability while preventing unauthorized or AI-originated adjudication.

#### Consequences

**Positive**
- Decision lineage and supersession remain traceable.
- Manual fallback remains possible under control.
- AI decision support remains clearly non-authoritative.

**Trade-offs**
- Backend wrappers must derive actor and enforce permissions.
- Integration event ordering needs explicit design.

#### Data and Source-of-Truth Impact

`claim_decisions` is authoritative. `claims.current_decision_id` points to the effective decision, and `claims.decision_status` is the current snapshot after Phase 4.

#### Security, Privacy, and Compliance Impact

Requires adjudication permission, tenant/clinic scope, service-role containment, sanitized errors, audit events, source metadata, idempotency, and Human-in-the-Loop controls. AI cannot approve, reject, partially approve, or void.

#### Implementation Impact

Add secure authenticated wrappers or domain services, external event metadata, expected-version behavior, current decision snapshot synchronization, RLS/RBAC tests, API contracts, and UI labeling.

#### Acceptance Criteria

- Generic `claim.update` cannot record payer decisions.
- Unauthorized users and cross-tenant actors cannot create or supersede decisions.
- Current decision pointer and snapshot match authoritative decision record.
- Duplicate/out-of-order events cannot corrupt current decision.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve payer authority and manual fallback | Claim Domain Owner / Security Lead | Phase 4 | P1 | Pending |
| Define mandatory external event ID, idempotency, and ordering rules | Database Architect / Integration Owner | Phase 4 | P1 | Pending |
| Design secure service wrapper | Backend Lead / Security Lead | Phase 4 | P1 | Planned |

### ADR-007 - Payment Authority

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Finance Owner / Security Lead
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-009 (Proposed)
**Related Risks:** P4-RISK-009
**Related Tests:** P4-TEST-PAY-004 (Proposed), P4-TEST-SEC-003 (Proposed)
**Repository Evidence:** Confirmed Finding - `claim.payment.record`, `record_claim_payment`, `claim_payments`, allocations, reconciliations, payment references, idempotency key, and finance role mappings exist; refund/reversal authority is incomplete.

#### Context

Payment state must be based on transaction or reconciliation evidence. Generic Claim editing and AI recommendations cannot record financial settlement.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Integration only | Payment/reconciliation events are sole authority | Strong source control | Manual exception handling blocked | Operational delays |
| Finance role only | Authorized finance users record payments | Works without integration | Manual errors possible | Less external proof |
| Integration with controlled fallback | Integration primary; finance fallback | Balanced and auditable | Requires strong RBAC/idempotency | Fallback can be abused if broad |

#### Proposed Decision

Approved decision: payment/reconciliation integration is primary authority; authorized finance role is controlled fallback. Generic Claim editor is prohibited. AI has no authoritative financial mutation rights.

Payments require permissions, payment reference, idempotency, amount/currency checks, reconciliation evidence where applicable, duplicate prevention, and audit.

#### Rationale

Exact financial state requires authoritative transaction evidence, not UI status selection. The repository already has transaction and reconciliation structures that should be extended rather than duplicated.

#### Consequences

**Positive**
- Payment history is immutable and reconcilable.
- Duplicate events can be handled safely.
- Financial mutation scope is least-privilege.

**Trade-offs**
- Finance workflows require explicit approval.
- Refund/reversal paths must be designed before production.

#### Data and Source-of-Truth Impact

Payment tables and reconciliation records are authoritative. `claims.payment_status` is a summary/projection and must not conflict with transaction history.

#### Security, Privacy, and Compliance Impact

Requires finance-specific RBAC, tenant/clinic validation, transaction idempotency, exact numeric checks, source metadata, and audit events. AI cannot pay, refund, reverse, or reconcile.

#### Implementation Impact

Add/refine payment, refund, reversal, and reconciliation operations; secure wrappers; summary synchronization; generated types; backend DTOs; UI states; RLS and idempotency tests.

#### Acceptance Criteria

- Generic `claim.update` cannot record payment state.
- Duplicate payment references or idempotency keys do not double-count.
- One Claim uses one approved currency for Phase 4 MVP unless a later ADR explicitly enables multi-currency.
- Amount, currency consistency, rounding scale, tolerance, and refund ceiling constraints are enforced.
- Claim payment summary equals authoritative transactions/reconciliation.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve integration and finance fallback authority | Finance Owner / Security Lead | Phase 4 | P1 | Pending |
| Approve refund/reversal permissions | Finance Owner | Phase 4 | P1 | Pending |
| Define reconciliation exit criteria, currency consistency, rounding scale, tolerance, and refund ceiling | Finance Owner / Database Architect | Phase 4 | P1 | Pending |

### ADR-008 - Legacy Status Retirement

**ADR Status:** Approved
**Implementation Status:** Not Started
**Owner:** Database Architect / Product Owner
**Version:** 0.1
**Drafted Date:** 2026-07-22
**Decision Date:** 2026-07-22
**Effective Date:** 2026-07-22
**Review Date:** Before Phase 4 implementation begins
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Explicit Phase 4 approval dated 2026-07-22
**Implementation Phase:** Phase 4 and later migration phase
**Supersedes:** None
**Superseded By:** None
**Related Requirements:** P4-REQ-010 (Proposed)
**Related Risks:** P4-RISK-010
**Related Tests:** P4-TEST-MIG-001 (Proposed), P4-TEST-APP-001 (Proposed)
**Repository Evidence:** Confirmed Finding - `claims.status`, generated database types, SQL functions, RLS/policies, and frontend references still depend on single/mixed status semantics.

#### Context

The legacy status field is overloaded but still used by schema constraints, functions, generated types, and UI features. Immediate removal would be unsafe, while indefinite dual-write would preserve ambiguity.

#### Options Considered

| Option | Description | Benefits | Trade-offs | Risk |
| --- | --- | --- | --- | --- |
| Immediate removal | Drop legacy field during Phase 4 | Clean model quickly | Breaks app and data migration | High release risk |
| Indefinite dual-write | Maintain old and new forever | Compatibility | Permanent ambiguity | Drift and data corruption |
| Staged retirement | Add new model, backfill, cut over, later remove | Safe migration | More phases | Requires monitoring |
| Permanent retention | Keep legacy field read-only indefinitely | Historical compatibility | Ongoing complexity | Future misuse |

#### Proposed Decision

Approved decision: staged retirement.

Required stages:

1. Add new model.
2. Backfill and verify.
3. Deploy compatible reads.
4. Switch writes.
5. Stop legacy writes.
6. Monitor and reconcile.
7. Deprecate external use.
8. Remove in a later migration.

Required gates: no unmapped values, no backend legacy writes, no frontend dependency, APIs migrated, dashboards migrated, tests updated, security validation passed, and roll-forward repair available. Indefinite dual-write is prohibited.

#### Rationale

Staged retirement protects existing data, preserves backward compatibility during cutover, and avoids permanent split-brain status semantics.

#### Consequences

**Positive**
- Migration is tenant-safe and reversible through roll-forward repair.
- Legacy consumers can be inventoried and migrated.
- New model becomes authoritative after gates pass.

**Trade-offs**
- Requires temporary compatibility layer and monitoring.
- Removal waits for a later migration.

#### Data and Source-of-Truth Impact

During transition, new workflow/decision/payment fields become target source for current state. Legacy `claims.status` must not overwrite the new model after write switch.

#### Security, Privacy, and Compliance Impact

Backfill and cutover must preserve organization/clinic scope, RLS behavior, auditability, and financial amounts. No destructive migration or RLS bypass is allowed.

#### Implementation Impact

Plan forward-only migrations, backfill validation, compatible API/UI reads, write cutover, legacy reference removal, generated type updates, dashboards, tests, and later removal migration.

#### Acceptance Criteria

- No unmapped legacy values remain after backfill.
- Legacy writes are stopped before deprecation.
- New model tests pass before external deprecation.
- Legacy field is removed only in a later approved migration.

#### Follow-up Actions

| Action | Owner | Phase | Priority | Status |
| --- | --- | --- | --- | --- |
| Approve staged retirement strategy | Database Architect / Product Owner | Phase 4 | P1 | Pending |
| Inventory all legacy readers/writers | Backend Lead / Frontend Lead | Phase 4 | P1 | Planned |
| Define migration gates and rollback-forward repair | Database Architect / QA Lead | Phase 4 | P1 | Pending |

## 7. Cross-Decision Consistency

| Check | Related ADRs | Result | Required Action |
| --- | --- | --- | --- |
| Closure does not override payment | ADR-001, ADR-003, ADR-007 | Consistent | Approve operational closure and transaction payment authority |
| Appeal decisions follow decision supersession | ADR-002, ADR-006 | Pending | Define appeal outcome relationship to `claim_decisions` |
| Refund does not rewrite payer decision | ADR-003, ADR-006, ADR-007 | Consistent | Keep refund/reversal in payment domain |
| MVP adjustment semantics match Claim summary | ADR-004, ADR-006 | Pending | Approve header decision plus item-adjustment MVP and defer dedicated line adjudication |
| Reopen preserves history | ADR-001, ADR-005, ADR-006, ADR-007 | Consistent | Add dedicated reopen operation and tests |
| Decision and payment authority are separate | ADR-006, ADR-007 | Consistent | Enforce distinct permissions and writer paths |
| Legacy retirement waits for all dependencies | ADR-008 and all mandatory ADRs | Consistent | Treat Phase 4 implementation as blocked until approval |
| AI remains non-authoritative | ADR-001 through ADR-008 | Consistent | Preserve Decision Support labeling and permission exclusions |
| Tenant isolation applies to every domain | ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-008 | Pending | Extend RLS/RBAC tests for new records and operations |

Security and tenant isolation take precedence over convenience or backward compatibility.

## 8. Requirements and Test Traceability

| ADR | Requirement ID | Risk ID | Required Test | Exit Criterion | Status |
| --- | --- | --- | --- | --- | --- |
| ADR-001 | P4-REQ-001 (Proposed) | P4-RISK-001 | P4-TEST-WF-001: closure preserves independent payment state | `closed + approved + pending` accepted when business rules allow | Proposed |
| ADR-001 | P4-REQ-002 (Proposed) | P4-RISK-002 | P4-TEST-PAY-001: closure never writes `paid` | Closure mutation leaves payment summary unchanged | Proposed |
| ADR-002 | P4-REQ-003 (Proposed) | P4-RISK-003 | P4-TEST-APP-001: appeal record required for auditable appeal fields | Appeal reason, deadline, owner, evidence, and outcome are persisted when used | Proposed |
| ADR-003 | P4-REQ-004 (Proposed) | P4-RISK-004 | P4-TEST-PAY-002: refund/reversal preserve transaction history | Prior payment rows are not overwritten | Proposed |
| ADR-003 | P4-REQ-005 (Proposed) | P4-RISK-005 | P4-TEST-PAY-003: duplicate external events do not double-count | Replayed event returns prior result or no-op | Proposed |
| ADR-004 | P4-REQ-006 (Proposed) | P4-RISK-006 | P4-TEST-LINE-001: item adjustments and approved amounts remain consistent with Claim decision | Claim snapshot matches authoritative header decision and documented MVP adjustment rules | Proposed |
| ADR-005 | P4-REQ-007 (Proposed) | P4-RISK-007 | P4-TEST-SEC-001: terminal reopen requires elevated permission and reason | Generic update cannot reopen; controlled operation audits actor/source/reason | Proposed |
| ADR-006 | P4-REQ-008 (Proposed) | P4-RISK-008 | P4-TEST-DEC-002: payer decision authority enforced | Generic editor and AI cannot record final decisions | Proposed |
| ADR-007 | P4-REQ-009 (Proposed) | P4-RISK-009 | P4-TEST-SEC-003: payment authority enforced | Generic editor and AI cannot record payment/refund/reversal | Proposed |
| ADR-008 | P4-REQ-010 (Proposed) | P4-RISK-010 | P4-TEST-MIG-001: staged legacy migration gates pass | No unmapped values, no legacy writes, compatible reads, security validation | Proposed |

Repository Phase 3 tests are recorded as PASS where evidenced in `PHASE-3-VALIDATION-REPORT.md`; Phase 4 tests above are proposed and not run.

## 9. Dependencies and Assumptions

| ID | Type | Description | Owner | Impact if False | Status |
| --- | --- | --- | --- | --- | --- |
| DEP-001 | Dependency | Payment source-of-truth remains existing `claim_payments`, allocations, and reconciliations | Database Architect | Duplicate payment model risk | Confirmed Finding |
| DEP-002 | Dependency | Current payment summary strategy is approved before migration | Finance Owner | Payment dashboards may drift | Pending |
| DEP-003 | Dependency | Claim-line records remain available through existing `claim_items` or approved successor | Database Architect | Line adjudication cannot be implemented safely | Confirmed Finding / Pending Scope |
| DEP-004 | Dependency | Payer integration or adjudicator source metadata is available | Claim Domain Owner | Decision authority cannot be audited | Pending |
| DEP-005 | Dependency | Finance role ownership and permissions are approved | Security Lead / Finance Owner | Payment fallback cannot be enabled | Pending |
| DEP-006 | Assumption | Appeal lifecycle in MVP requires dedicated record only for auditable appeal data | Claim Domain Owner | Appeal workflow may be under- or over-built | Pending |
| DEP-007 | Dependency | Stable external event identifiers, idempotency keys, source timestamps, and ordering rules are available for payer and payment events | Integration Owner | Duplicate or out-of-order events may corrupt decision/payment state | Not Verified / P1 Blocker |
| DEP-008 | Constraint | Phase 4 MVP uses one approved currency per Claim; currency consistency, rounding scale, reconciliation tolerance, and refund ceiling must be exact and tenant-safe | Finance Owner | Financial summaries may be incorrect | Pending / P1 Blocker |
| DEP-009 | Constraint | Legacy `claims.status` remains temporarily during cutover | Database Architect | Immediate removal may break code and data | Confirmed Finding |
| DEP-010 | Assumption | Phase 3 RLS/RBAC patterns remain the baseline for Phase 4 | Security Lead | New tables may bypass validated security model | Confirmed Finding |

## 10. Deferred and Out-of-Scope Items

| Capability | Reason Deferred | Target Phase | Dependency | Risk |
| --- | --- | --- | --- | --- |
| Multi-currency settlement | Currency and FX rules not approved | Future finance phase | Finance policy and reconciliation rules | Incorrect settlement reporting |
| Overpayment recovery | Recovery workflow not approved | Future finance phase | Overpayment business rules | Manual off-system handling |
| Chargeback | Not in current repository evidence | Future finance phase | Payer/payment integration | Missing exception visibility |
| Multi-level appeals | MVP appeal scope pending | Future claim phase | Appeal case model | Scope expansion risk |
| Automated AI adjudication | Prohibited by platform principle | Out of scope | Human-in-the-Loop governance | Unsafe autonomous decisioning |
| Cross-payer settlement | No approved settlement model | Future integration phase | Multi-payer finance rules | Incorrect attribution |
| Production webhook execution | Integration protocols not approved | Future integration phase | Payer/payment webhook authority | Duplicate/out-of-order events |
| Complex recovery/subrogation | Advanced insurance workflow not approved | Future insurance phase | Legal/claim recovery rules | Compliance exposure |
| Full accounting ledger | Existing scope uses Claim payment records, not ledger | Future finance/accounting phase | Accounting product decision | Reconciliation gaps |

## 11. Approval Matrix

| ADR | Required Approver(s) | Required Technical Reviewer(s) | Final Status |
| --- | --- | --- | --- |
| ADR-001 | Product Owner, Claim Domain Owner | Database Architect, Security Lead | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-002 | Product Owner, Claim Domain Owner | Security Lead, Database Architect | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-003 | Product Owner, Finance Owner | Database Architect, Security Lead | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-004 | Claim Domain Owner, Product Owner | Database Architect, Backend Lead | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-005 | Claim Domain Owner, Security Lead | Database Architect, Backend Lead | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-006 | Claim Domain Owner, Security Lead | Integration Owner, Backend Lead, Database Architect | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-007 | Finance Owner, Security Lead | Integration Owner, Backend Lead, Database Architect | Approved by Project Owner / Product Owner on 2026-07-22 |
| ADR-008 | Database Architect, Product Owner | Backend Lead, Security Lead, QA Lead | Approved by Project Owner / Product Owner on 2026-07-22 |

ADR-001 through ADR-008 are approved for architecture direction only. This approval does not mark implementation, migration readiness, test execution, or validation as complete.

## 12. Blocking Actions

| ADR | Remaining Technical Evidence | Owner | Priority | Blocking Impact |
| --- | --- | --- | --- | --- |
| ADR-001 | Verify closure blockers and workflow implementation rules before migration execution | Product Owner / Claim Domain Owner | P1 | Phase 4 workflow implementation blocker |
| ADR-002 | Verify Appeal table fields, permissions, RLS, and operation design before implementation | Claim Domain Owner | P1 | Appeal workflow and schema blocker |
| ADR-003 | Verify refund/reversal/failure/adjustment/overpayment technical rules before payment migration execution | Product Owner / Finance Owner | P1 | Payment schema and operations blocker |
| ADR-004 | Verify item-adjustment coverage and decision snapshot synchronization before test closure | Claim Domain Owner / Product Owner | P1 | Decision semantics and test-scope blocker |
| ADR-005 | Verify reopen source/target states, permissions, time limits, and revision preference before implementation | Security Lead / Claim Domain Owner | P1 | Terminal workflow mutation blocker |
| ADR-006 | Verify payer decision writer identity, manual fallback controls, and external event strategy before implementation | Claim Domain Owner / Security Lead | P1 | Decision write-path blocker |
| ADR-007 | Verify payment authority, finance fallback controls, refund/reversal permissions, and reconciliation rules before implementation | Finance Owner / Security Lead | P1 | Financial mutation blocker |
| ADR-008 | Verify staged retirement gates, baseline validation, and cutover inventory before migration execution | Database Architect / Product Owner | P1 | Migration/cutover blocker |

No confirmed P0 blocker is recorded by static repository evidence. This does not prove that no P0 issue exists because migrations, RLS behavior, controlled mutations, integration ordering, and application paths were not executed dynamically during this ADR task. ADR approval blockers are closed; the technical P1 blockers above remain active until verified.

## 13. Architecture Guardrails

- No overloaded Claim status as final source of truth.
- No generic `claim.update` for payer decisions or payment mutations.
- No cross-tenant or unauthorized cross-clinic state mutation.
- No AI authoritative payer or financial decision.
- No duplicate payment/refund processing.
- No silent decision overwrite.
- No direct terminal-state reopening.
- No formal appeal without a dedicated Appeal record.
- No authoritative external decision/payment mutation without stable event identity and idempotency control.
- No Claim-level payment summary without authoritative transaction or reconciliation evidence.
- No current snapshot that conflicts with authoritative history.
- No legacy removal before retirement gates pass.
- No sensitive state transition without actor, source, reason, timestamp, and audit evidence.
- No PHI/PII copied into unrestricted metadata.

## 14. Validation Limitations

- Architecture documentation only.
- No migration was created or executed.
- No SQL/RLS was changed.
- No backend/frontend was modified.
- No tests were executed for this ADR task.
- No local or production data was changed.
- Repository findings depend on inspected files and the Phase 4 impact analysis.
- ADR-001 through ADR-008 are approved by Project Owner / Product Owner as of 2026-07-22; technical readiness still requires the remaining verification gates in this document.
- Static review did not prove the absence of P0 security, integrity, or integration defects.
- Approved architecture does not mean implementation validation passed.
- Phase 3 validation evidence is recorded in `PHASE-3-VALIDATION-REPORT.md`, but latest consolidated regression and application validation remain not run in that report.

## 15. Change Log

| Date | Version | Change | Author |
| --- | --- | --- | --- |
| 2026-07-22 | 0.1 | Created mandatory Phase 4 Claim ADRs, approval matrix, blockers, guardrails, traceability, dependencies, assumptions, and deferred scope | AI-assisted Technical Documentation Lead |
| 2026-07-22 | 0.2 | Revised approval terminology, evidence precision, formal appeal rule, payment definitions, Phase 4 MVP adjudication scope, reopen rules, role-specific approvals, event identity, currency/reconciliation controls, and P0 validation caveat | AI-assisted Technical Documentation Lead |
| 2026-07-22 | 0.3 | Recorded Project Owner / Product Owner approval for ADR-001 through ADR-008 and retained unresolved technical P1 gates | AI-assisted Technical Documentation Lead |
