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

## 16. Pre-Batch 3 Contract Reconciliation Notes

These notes reconcile approved ADR direction with the implemented Phase 4 Batch 1 split-state schema and Batch 2 workflow-history schema. They do not change ADR decision text, rationale, version, approval status, or implementation status.

### 16.1 Implemented State Contract

**Confirmed**

| Area | Actual implementation |
| --- | --- |
| Workflow type | `public.claim_workflow_state` |
| Workflow domain | `public.claim_workflow_state_domain` with constraint `claim_workflow_state_domain_chk` |
| Workflow values in declaration order | `draft`, `collecting_data`, `validation_pending`, `needs_review`, `ready_to_submit`, `submitted`, `under_review`, `appealed`, `closed`, `cancelled` |
| Decision type | `public.claim_decision_state` |
| Decision domain | `public.claim_decision_state_domain` with constraint `claim_decision_state_domain_chk` |
| Decision values in declaration order | `not_decided`, `approved`, `partially_approved`, `rejected`, `request_information`, `voided` |
| Payment type | `public.claim_payment_state` |
| Payment domain | `public.claim_payment_state_domain` with constraint `claim_payment_state_domain_chk` |
| Payment values in declaration order | `not_paid`, `payment_pending`, `partially_paid`, `paid`, `payment_failed`, `partially_refunded`, `refunded`, `reversed` |
| Claim columns | `claims.workflow_status`, `claims.decision_status`, `claims.payment_status`, `claims.state_updated_at`, `claims.state_updated_by`, `claims.legacy_status_migration_state` |
| Split-state nullability | All Batch 1 split-state and state metadata columns are nullable |
| Split-state defaults | No Batch 1 default exists for `workflow_status`, `decision_status`, or `payment_status` |
| Legacy status | `claims.status` remains present with constraint `claims_status_chk` unchanged |
| Version | `claims.version` remains `integer not null`; no `claims.state_version` exists |

### 16.2 Conflicts Against Approved Workflow Spec

**Conflict**

The implemented Batch 1 enum values do not exactly match the approved Workflow Spec state names. The following approved-spec values are not implemented in Batch 1:

```text
payer_processing
decision_received
pending
not_billable
```

The following implemented values are not named in the approved Workflow Spec target sets:

```text
under_review
not_decided
request_information
not_paid
payment_pending
```

Batch 3 must use actual implemented values for SQL object references. Because target transition behavior in the Workflow Spec depends on missing states, any Batch 3 transition that requires `payer_processing`, `decision_received`, `pending`, or `not_billable` is a `Conflict` until the ADR/spec or Batch 1 schema is reconciled by an approved follow-up.

### 16.3 Workflow History Contract

**Confirmed**

Batch 2 introduced `public.claim_workflow_events` with typed workflow columns, tenant-safe Claim foreign key, per-Claim sequence uniqueness, forward version check, RLS, and no ordinary authenticated insert/update/delete grants.

Actual Batch 2 event columns used for workflow history are:

```text
id
organization_id
clinic_id
claim_id
from_workflow_status
to_workflow_status
sequence_number
claim_version_before
claim_version_after
actor_type
actor_user_id
actor_reference
source_system
external_event_id
correlation_id
reason_code
reason_text
occurred_at
received_at
recorded_at
created_at
metadata
supersedes_event_id
```

**READY WITH FOLLOW-UP:** The table supports append-only workflow history foundations, but Batch 2 explicitly does not allocate sequences concurrently, mutate Claim snapshots, create transition functions, backfill history, or implement automatic triggers.

### 16.4 Security and Authority Notes

**Confirmed**

Existing exact relevant permission codes include:

```text
claim.read
claim.update
claim.submit
claim.review
claim.reopen
claim.cancel
claim.decide
claim.decision.supersede
claim.payment.record
claim.payment.allocate
claim.payment.reconcile
claim.audit.read
```

Existing authorization helpers include `public.has_permission(text, uuid, uuid)` and private Claim helper functions in the Phase 3 RLS migration. `claim_workflow_events` uses `public.has_permission(...)` for read access. Direct writes to `claim_workflow_events` are restricted to `service_role`.

**Conflict / Open Decision**

No verified `claim.transition` or `claim.close` permission exists. No verified Batch 3 workflow transition permission authority exists that safely authorizes all proposed workflow transitions. Generic `claim.update` is insufficient for workflow-state transitions unless an approved controlled operation explicitly narrows its use.

### 16.5 ADR Traceability Impact

| ADR | Reconciliation impact |
| --- | --- |
| ADR-001 | `closed` exists as implemented workflow value, but no `claim.close` permission or controlled close operation is verified. |
| ADR-002 | `appealed` exists as implemented workflow value, but dedicated Appeal entity implementation remains out of scope and absent from Batch 1/2 evidence. |
| ADR-003 | Payment summary states exist with implemented names, but `not_billable` from the spec is not implemented; use `not_paid` only if approved as equivalent. |
| ADR-004 | No change; dedicated line decisions remain deferred. |
| ADR-005 | `claim.reopen` permission exists, but no controlled reopen operation or allowed target contract is verified. |
| ADR-006 | Decision states exist with implemented names, but payer decision event identity remains outside workflow-history coverage. |
| ADR-007 | Payment permissions exist for record/allocate/reconcile; refund/reversal workflow authority remains unverified. |
| ADR-008 | Legacy `claims.status` remains unchanged and split-state columns are nullable with no defaults or backfill. |

Pre-Batch 3 readiness from ADR reconciliation: superseded by Section 17 decision closure. Design blockers are closed; remaining items are Batch 3 implementation gaps.

## 17. Pre-Batch 3 Decision Closure

**Status:** Approved
**Decision Date:** 2026-07-22
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Pre-Batch 3 Decision Closure

This section closes the six remaining Batch 3 design blockers. It extends ADR traceability without reopening ADR-001 through ADR-008.

### 17.1 D1 - Authoritative State Contract

Approved: use actual Batch 1 state values as authoritative.

| Domain | Authoritative values |
| --- | --- |
| Workflow | `draft`, `collecting_data`, `validation_pending`, `needs_review`, `ready_to_submit`, `submitted`, `under_review`, `appealed`, `closed`, `cancelled` |
| Decision | `not_decided`, `approved`, `partially_approved`, `rejected`, `request_information`, `voided` |
| Payment | `not_paid`, `payment_pending`, `partially_paid`, `paid`, `payment_failed`, `partially_refunded`, `refunded`, `reversed` |

Mappings: `payer_processing -> under_review`; `decision_received -> decision_status`; decision `pending -> not_decided`; payment `pending -> payment_pending`; `not_billable -> not_paid` with reason context.

### 17.2 D2 - Transition and Permission Matrix

Approved: Batch 3 uses the following matrix. All unlisted and same-state transitions are forbidden. `cancelled` is terminal.

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

Closure authority is `claim.review`. Reopen from `closed` targets `needs_review` and does not rewrite decision or payment history. Do not create `claim.transition` or `claim.close` in Batch 3.

### 17.3 D3 - Controlled Function Contract

Approved function: `public.transition_claim_workflow`.

Inputs:

```text
p_claim_id uuid
p_target_status public.claim_workflow_state_domain
p_expected_version integer
p_reason_code text
p_reason_text text default null
p_source_system text default 'internal'
p_external_event_id text default null
p_correlation_id uuid default null
p_occurred_at timestamptz default null
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

Security: `SECURITY DEFINER`, fixed safe `search_path`, schema-qualified objects, no EXECUTE to `PUBLIC` or `anon`, EXECUTE only for approved authenticated/service roles, and actor/tenant derived from trusted context.

Atomic order: resolve actor -> lock Claim -> validate tenant/clinic/membership/permission -> validate current state and expected version -> validate transition -> check idempotency -> allocate sequence -> update snapshot/version/milestone -> insert workflow event -> return sanitized result.

### 17.4 D4 - Version and Direct-Update Protection

Approved: `claims.version` is the sole optimistic-lock counter. `claims.version` is implemented as `integer`; no `state_version` is allowed. Successful transition increments once. Stale versions and failed transitions write nothing and insert no event.

Batch 3 must restrict ordinary direct updates to protected state columns while preserving already-authorized non-state Claim updates. Direct workflow-event INSERT/UPDATE/DELETE remains restricted. Repository-compatible mechanism: column-level privileges and controlled function execution, plus RLS/RBAC tests, without redesigning unrelated Claim RLS.

### 17.5 D5 - Idempotency Contract

Internal human transition: `external_event_id` optional; optimistic locking prevents duplicate state mutation; repeated same-state request creates no event.

External integration transition: `source_system` and `external_event_id` required. Use actual Batch 2 uniqueness scope `organization_id + source_system + external_event_id`.

Equivalent payload compares `claim_id`, `target_workflow_status`, `expected_version`, normalized `reason_code`, normalized `reason_text`, `source_system`, and `occurred_at`. Equivalent retry returns the prior result with `idempotent_replay = true`, no version increment, and no new event. Conflicting retry fails with no data change.

### 17.6 D6 - Sequence Allocation

Approved: per-Claim monotonic sequencing.

```text
lock Claim row
-> validate expected version
-> check idempotency
-> calculate next sequence as coalesce(max(sequence_number), 0) + 1
-> update Claim
-> insert event
```

Batch 2 already provides `claim_workflow_events_claim_sequence_uq` on `(claim_id, sequence_number)`, which remains the final duplicate safeguard.

### 17.7 Blocker Closure Matrix

| Blocker | Approved Resolution | Repository Gap | Batch 3 Action | Status |
| --- | --- | --- | --- | --- |
| State names | D1 | Earlier docs used legacy terms | Use Batch 1 values and legacy mappings | Closed |
| Transition permissions/close authority | D2 | Function not implemented yet | Implement matrix with existing `claim.update`, `claim.submit`, `claim.review`, `claim.reopen`, `claim.cancel` | Closed |
| Function contract | D3 | `public.transition_claim_workflow` absent | Create controlled function in Batch 3 | Closed |
| Version/direct-update protection | D4 | Protected state-column updates not proven | Add column/function privileges and tests | Closed |
| Idempotency | D5 | Equivalent-payload replay not implemented | Implement with Batch 2 external identity scope | Closed |
| Sequence allocation | D6 | Allocator function absent | Allocate while Claim row is locked | Closed |

Open design blockers: `0`

### 17.8 Batch 3 Readiness

`READY FOR BATCH 3`

Remaining gaps are implementable inside the approved Batch 3 migration/tests and do not require another business decision.

---

## 18. Phase 4 Batch 4 Claim Decision Contract Closure

**Status:** Approved
**Decision Date:** 2026-07-22
**Approved By:** Project Owner / Product Owner
**Approval Reference:** Phase 4 Batch 4 Claim Decision Contract Closure

This section closes the controlled Claim decision/adjudication mutation design contract. It extends ADR-004 and ADR-006 without reopening ADR-001 through ADR-008.

### 18.1 Repository Evidence

| Evidence | Classification | Architectural impact |
| --- | --- | --- |
| `public.claim_decisions` exists with tenant-safe Claim FK, `decision_version`, lifecycle `decision_status`, adjudication `decision_outcome`, numeric amounts, reason fields, actor fields, timestamps, and supersession lineage. | Confirmed Finding | Use `claim_decisions` as authoritative decision evidence. |
| `claims.current_decision_id` exists and references `claim_decisions` with tenant scope. | Confirmed Finding | Use it as current-decision pointer. |
| `claims.decision_status public.claim_decision_state_domain` exists and accepts `not_decided`, `approved`, `partially_approved`, `rejected`, `request_information`, `voided`. | Confirmed Finding | Use it as the current decision snapshot. |
| `claim_decisions_one_final_per_claim_uq` exists. | Confirmed Finding | Preserve one active final decision per Claim. |
| Existing `finalize_claim_decision` and `supersede_claim_decision` write legacy `claims.status`. | Implementation Gap | Batch 4 must use a new controlled split-state decision function rather than broadening legacy behavior. |
| `claim_decisions` has no typed `source_system` or `external_event_id`. | Implementation Gap | Batch 4 may add exact external event identity fields and uniqueness. |
| Existing authenticated direct writes to `claim_decisions` are revoked; service-role functions exist. | Confirmed Finding | Preserve server-controlled decision mutation boundary. |

### 18.2 Approved Decision Model

Approved:

```text
Append-only authoritative decision records
claims.current_decision_id points to the active decision
finalized decision rows are immutable
correction creates a superseding decision record
business voiding does not delete prior evidence
```

`public.claim_decisions` is authoritative decision evidence. It is not merely a draft/work table, not a Claim snapshot, and not only audit history. Draft rows are preparatory; a row becomes authoritative only when finalized by the controlled operation.

### 18.3 Void and Request-Information Semantics

| Status | Approved meaning |
| --- | --- |
| `request_information` | Intermediate adjudication outcome requiring human follow-up or additional evidence. It is a decision snapshot value, not approval, rejection, payment, closure, or appeal. |
| `voided` | Business invalidation of a prior current authoritative decision. Voiding creates a new current evidence row and supersedes the prior current row; it does not delete or soft-delete prior evidence. |

Soft delete must not substitute for voiding. Normal application actors must not delete finalized decision rows.

### 18.4 Workflow Coupling Decision

Approved boundary:

```text
Decision mutation does not directly mutate workflow_status.
Workflow changes use public.transition_claim_workflow.
```

Batch 4 must not update workflow through unrestricted table writes. If an application workflow needs a decision change and a workflow change, it must orchestrate separate controlled calls or wait for a later approved orchestration function.

### 18.5 Function and Authority Decision

Approved function:

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

Return:

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

Security decision: `SECURITY DEFINER`, fixed `search_path = public, private, auth, pg_temp`, no EXECUTE to `PUBLIC` or `anon`, EXECUTE only to `authenticated` and `service_role`, actor derived from trusted context, tenant and clinic derived from the locked Claim.

### 18.6 Permission Decision

| Decision action | Permission |
| --- | --- |
| Read decision | `claim.read` |
| Create/adjudicate first decision | `claim.decide` |
| Partial approval | `claim.decide` |
| Rejection | `claim.decide` |
| Request information | `claim.decide` for the authoritative decision record; existing `claim.request_information` may remain workflow/review-support authority |
| Supersede/correct decision | `claim.decision.supersede` |
| Void current decision | `claim.decision.void` |
| Decision audit | `claim.audit.read` |

`claim.decision.void` is explicitly approved as a new Batch 4 permission because no exact existing void permission is verified. Generic `claim.update` and generic workflow permission do not authorize adjudication. AI cannot be an authoritative adjudicator.

### 18.7 Version, Idempotency, Amount, and Direct-Write Decisions

| Area | Approved decision |
| --- | --- |
| Version model | Use global Claim lock with `claims.version`; no decision-specific competing version counter. |
| Expected version | `p_expected_version` must equal locked `claims.version`; success increments once; stale requests write nothing. |
| Idempotency identity | External adjudication requires `organization_id + source_system + external_event_id`. |
| Idempotency payload | Compare typed stored fields only: `claim_id`, `decision_status`, `approved_amount`, `rejected_amount`, `currency_code`, `reason_code`, normalized `reason_text`, `payer_reference`, `decision_at`, `source_system`. |
| Requested amount basis | `coalesce(claims.total_eligible_amount, claims.total_claimed_amount)`. |
| Currency source | `claims.currency_code`; caller must not provide authoritative currency. |
| Rounding | Use exact numeric values rounded to scale 2 in PostgreSQL before validation and insert. |
| Payment coupling | Decision status must not alter payment status or payment records. |
| Direct-write protection | Ordinary roles may not directly insert `claim_decisions`, update finalized decisions, delete decisions, update `claims.decision_status`, or update `claims.current_decision_id`. |

### 18.8 Batch 4 Readiness

Open design blockers: `0`

Remaining items are implementation gaps that are allowed inside Batch 4:

1. Add `claim.decision.void`.
2. Add typed decision event identity fields and uniqueness.
3. Implement `public.record_claim_decision`.
4. Protect direct decision snapshot and current-pointer updates.
5. Add planned functional and security tests.

Batch 4 readiness: `READY FOR BATCH 4`.

---

## 19. Phase 4 Batch 5 Payment Settlement Contract Traceability

**Status:** Confirmed Finding / Recommendation
**Decision Date:** 2026-07-22
**Approval Impact:** This section does not change ADR-001 through ADR-008 text, approval status, rationale, or implementation status.

### 19.1 Confirmed Findings

| Evidence | Classification | Architectural impact |
| --- | --- | --- |
| `claims.payment_status public.claim_payment_state_domain` exists from Batch 1. | Confirmed Finding | A payment current-state snapshot is available but requires controlled synchronization. |
| `public.transition_claim_workflow` does not mutate `claims.payment_status`. | Confirmed Finding | Workflow and payment remain independent per ADR-001 and ADR-003. |
| `public.record_claim_decision` does not mutate `claims.payment_status`, `claims.total_paid_amount`, `claim_payments`, allocations, or reconciliations. | Confirmed Finding | Decision and payment remain independent. |
| Phase 3 payment objects exist: `claim_payments`, `claim_payment_allocations`, and `claim_payment_reconciliations`. | Confirmed Finding | Batch 5 must reuse these objects as financial evidence. |
| Existing Phase 3 `record_claim_payment` accepts payment status and idempotency data but predates the Phase 4 split payment snapshot. | Confirmed Finding | A Phase 4 wrapper or replacement controlled path is required rather than relying on legacy status side effects. |
| Refund and reversal are documented as production-required exception capabilities, but a controlled refund function was not verified. | Not Verified / Implementation Gap | Refund must not be folded into Batch 5 unless refund ceiling and exception rules are closed. |

### 19.2 Recommendation

Batch 5 should implement controlled Claim payment settlement mutation before appeal or refund/reversal lifecycle work.

Approved ADR alignment:

| ADR | Batch 5 traceability |
| --- | --- |
| ADR-001 | Payment settlement remains independent from operational closure. |
| ADR-003 | Payment transactions remain authoritative; Claim payment status is only a current summary. |
| ADR-006 | Payer decision mutation remains separate and does not imply payment. |
| ADR-007 | Payment/reconciliation authority controls financial mutation; AI has no authority. |
| ADR-008 | Legacy status remains staged and is not removed by Batch 5. |

### 19.3 Open Decisions

| Open Decision | Impact | Recommended handling |
| --- | --- | --- |
| Refund ceiling and partial/full refund semantics | Required before implementing `partially_refunded` or `refunded` | Defer to a later refund/reversal batch. |
| Reversal operation authority and external ordering | Required before broad reversal automation | Allow Batch 5 to record only the minimal `reversed` settlement evidence if existing Phase 3 fields support it; otherwise stop. |
| Legacy `claims.status` retirement timing | Required before final cutover | Keep legacy status unchanged in Batch 5. |

### 19.4 Batch 5 Readiness Recommendation

`READY FOR BATCH 5`

This readiness applies only to the controlled payment settlement contract. It is not proof that Batch 5 migrations or tests have been executed.

---

## 20. Phase 4 Batch 6 Formal Appeal Contract Traceability

**Status:** Approved
**Decision Date:** 2026-07-23
**Approval Reference:** Phase 4 Batch 6 Contract Approval Closure
**Approval Impact:** This section does not change ADR-001 through ADR-008 text, approval status, rationale, or implementation status.

### 20.1 Confirmed Findings

| Evidence | Classification | Architectural impact |
| --- | --- | --- |
| ADR-002 is approved and requires every formal appeal to have a dedicated Appeal record. | Approved Decision | Batch 6 may define `claim_appeals` without reopening the appeal source-of-truth decision. |
| Existing docs state `workflow_status = appealed` is summary only. | Approved Decision | Workflow state cannot be the authoritative appeal object. |
| Batch 3 provides the controlled workflow boundary and `appealed` workflow value. | Confirmed Finding | Appeal submit can coordinate with workflow without inventing generic Claim update behavior. |
| Batch 4 preserves payer decision mutation as a separate controlled function. | Confirmed Finding | Appeal resolution may reference decisions but must not create payer decisions implicitly. |
| Batch 5 excludes formal appeals. | Confirmed Finding | Formal Appeal remains an open Phase 4 capability gap after payment settlement. |
| Refund ceiling and refund/reversal exception semantics remain unresolved. | Open Decision | Refund/reversal should not be selected as Batch 6 without a separate decision-closure task. |

### 20.2 Recommendation

Batch 6 should define the Formal Claim Appeal Entity and controlled appeal mutations.

Approved ADR alignment:

| ADR | Batch 6 traceability |
| --- | --- |
| ADR-001 | Appeal workflow does not imply financial settlement or closure. |
| ADR-002 | Dedicated `claim_appeals` is the appeal source of truth. |
| ADR-004 | Appeal does not introduce dedicated claim-line decisions. |
| ADR-005 | Terminal reopen remains a separate elevated operation. |
| ADR-006 | Appeal outcome may reference payer decision evidence but AI cannot decide appeals. |
| ADR-007 | Appeal mutation does not alter payment authority. |
| ADR-008 | Legacy `claims.status` remains staged and is not removed by Batch 6. |

### 20.3 Proposed Decisions

| Decision | Classification | Rationale |
| --- | --- | --- |
| `public.claim_appeals` is the authoritative object for formal appeal facts. | Recommendation | It preserves appeal reason, sequence, owner, deadline, evidence, payer reference, and outcome linkage. |
| `claims.workflow_status = appealed` remains a summary only. | Approved Decision | Prevents lossy appeal handling and preserves workflow/domain separation. |
| Appeal submit and resolve use controlled functions. | Recommendation | Appeal mutation is sensitive and must enforce tenant, clinic, permission, expected version, audit, and rollback behavior. |
| Appeal mutation must not mutate payment snapshots or records. | Recommendation | Preserves ADR-003 and ADR-007 financial authority. |
| Appeal resolution does not create payer decisions directly. | Recommendation | Any authoritative decision remains under the Batch 4 decision function or trusted payer integration. |

### 20.4 Open Decisions

| Decision | Why it is required | Options | Recommended option | Decision owner | Implementation blocker |
| --- | --- | --- | --- | --- | --- |
| Exact appeal submit eligibility | Avoid invalid formal appeals from pre-submission or terminal states | Restrict to `under_review`; allow selected post-decision workflows; allow elevated terminal exceptions | Restrict Batch 6 to `under_review` and already appeal-compatible states | Claim Domain Owner | NO |
| Appeal outcome workflow mapping | Avoid implicit closure or reopen side effects | No workflow change; move back to `under_review`; close on final appeal outcome | Keep closure explicit; allow only narrow reviewed mapping if approved | Product Owner / Claim Domain Owner | NO |
| Appeal permission names | Preserve least privilege and reuse existing RBAC where possible | Add exact appeal permissions; reuse `claim.review`; hybrid | Add exact appeal permissions when no exact existing names are found | Security Lead | NO |
| Multi-round appeal depth | Bound MVP scope | Single appeal; sequenced appeals; full multi-level automation | Sequenced appeal records, no multi-level automation | Product Owner | NO |

Batch 6 readiness recommendation: `READY FOR BATCH 6`.
