# Phase 4 Claim Test Plan

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure |
| Document | Phase 4 Claim Test Plan |
| File | `docs/database/PHASE-4-CLAIM-TEST-PLAN.md` |
| Phase | Phase 4 - Claim Architecture |
| Version | 0.2 |
| Document status | Ready for Review |
| Test execution status | Not Started |
| Created date | 2026-07-22 |
| Last updated | 2026-07-22 |
| Repository branch | `main` |
| Required reviewers | Product Owner, Claim Domain Owner, Database Architect, Security Lead, QA Lead |
| Implementation gate | ADR approval is satisfied as of 2026-07-22; blocked until Phase 4 implementation, deterministic fixtures, required test environments, and technical verification are available |
| Scope control | Documentation and test planning only |

## 2. Purpose and Scope

This document defines the Phase 4 Claim test strategy for Med AI NexSure. It is a concise, risk-based, and traceable plan for validating the target Claim architecture after implementation exists.

The plan covers:

- Workflow, payer decision, payment, Claim Readiness, evidence, and appeal separation
- Database schema, migration, backfill, and compatibility
- Controlled mutations
- RBAC and RLS
- Organization and clinic isolation
- Decision and payment reconciliation
- Concurrency, idempotency, and event ordering
- Audit and compliance
- Backend, API, frontend, dashboard, and regression coverage

This document does not implement tests, execute migrations, reset databases, modify SQL/RLS/application code, generate types, change fixtures, or report test results.

## 3. Source Documents

### Required Source Documents

| Source | Purpose | Evidence Classification |
| --- | --- | --- |
| `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md` | Target workflow and domain rules | Target specification |
| `docs/database/PHASE-4-CLAIM-IMPACT-ANALYSIS.md` | Existing-state findings, affected files, gaps, risks | Static repository analysis |
| `docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md` | ADR-001 through ADR-008 | Approved target direction; approval recorded on 2026-07-22 |
| `docs/database/PHASE-3-VALIDATION-REPORT.md` | Executed Phase 3 evidence | PASS/FAIL evidence only where explicitly recorded |
| `docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md` | Planned migration and cutover sequence | Planning artifact |

### Repository Artifacts to Inspect During Detailed Test Design

```text
supabase/migrations/**/*.sql
supabase/tests/**/*.sql
supabase/seed.sql
app/**/*
features/**/*
lib/**/*
components/**/*
```

### Source Precedence

1. Latest migration = current database facts
2. Executable code = current application behavior
3. Executed validation report = PASS/FAIL evidence
4. Approved ADR = target behavior
5. Pending ADR = blocker or conditional coverage

Static inspection must not be reported as executed validation.

## 4. Test Objectives

The Phase 4 test suite must prove that:

1. Workflow, decision, payment, readiness, evidence, and appeal remain separate domains.
2. Valid status combinations are accepted.
3. Invalid or contradictory combinations are rejected.
4. Only authorized actors may change workflow, decision, payment, refund, reversal, appeal, or reopen state.
5. Organization and clinic isolation cannot be bypassed.
6. Authoritative decision and payment records reconcile with Claim-level summaries.
7. Duplicate, delayed, retried, or concurrent events cannot corrupt state.
8. Every material mutation is auditable.
9. Legacy status migration is deterministic and non-destructive.
10. Backend, API, UI, and dashboards use the new model correctly.
11. Claim Readiness, ICD, evidence, payer rules, and cost validation remain compatible.
12. Phase 3 security coverage does not regress.

## 5. In-Scope Architecture

Coverage applies where the relevant object is approved or implemented.

| Architecture Item | Role in Model | Planned Coverage | Status |
| --- | --- | --- | --- |
| `claims.workflow_status` | Current workflow snapshot | Schema, transitions, backfill, API/UI | Planned |
| `claims.decision_status` | Current payer-decision summary | Authority, synchronization, reporting | Planned |
| `claims.payment_status` | Current payment summary | Transaction reconciliation, UI/dashboard | Planned |
| `claims.version` or approved state version | Optimistic concurrency | Stale update and concurrent mutation | Planned |
| `claim_workflow_events` or verified successor | Workflow history | Append-only events, ordering, audit | Blocked until implementation/authority confirmed |
| `claim_decisions` | Authoritative decision-round records | Finalization, supersession, current pointer | Planned |
| `claim_decision_adjustments` | Item/amount adjustment evidence | Partial approval consistency | Planned |
| `claim_lines` / existing Claim items | Claim item source | Decision and amount reconciliation | Planned |
| `claim_line_decisions` | Dedicated line outcomes | Conditional coverage | Deferred unless separately approved |
| `claim_payments` | Authoritative financial transaction | Payment, failure, refund/reversal extension | Planned |
| `claim_payment_allocations` | Payment allocation | Totals and Claim linkage | Planned |
| `claim_payment_reconciliations` | Reconciliation evidence | Variance and settlement validation | Planned |
| `claim_appeals` | Formal Appeal source | Appeal lifecycle and tenant isolation | Blocked until implemented |
| `audit_logs` | Compliance evidence | Actor/source/reason/version | Planned |

The test model must distinguish:

- Current-state snapshot
- Authoritative domain record
- Derived summary
- Audit history
- AI recommendation

AI remains Decision Support only and must not create authoritative Claim decisions or financial mutations.

## 6. Out-of-Scope and Deferred Coverage

| Capability | Coverage Status | Reason |
| --- | --- | --- |
| Dedicated `claim_line_decisions` | Deferred | ADR-004 Phase 4 MVP uses decision header plus item adjustments unless separately approved |
| Multi-currency settlement | Deferred | Currency/FX architecture is outside initial Phase 4 |
| Overpayment recovery workflow | Deferred | Recovery rules are not approved |
| Chargeback workflow | Deferred | Not in confirmed Phase 4 scope |
| Multi-level Appeal automation | Deferred | MVP Appeal scope only |
| AI autonomous adjudication | Not Applicable | Prohibited by architecture principles |
| Production webhook execution | Deferred | Integration protocols and environments are pending |
| Complex recovery/subrogation | Deferred | Future insurance workflow |
| Full accounting ledger | Deferred | Existing scope uses Claim payment records |
| Physical removal of legacy `claims.status` | Deferred | ADR-008 requires staged retirement |
| Production-data testing | Not Applicable | Test plan requires synthetic deterministic data only |

## 7. Risk-Based Test Strategy

| Risk ID | Risk | Priority | Required Coverage | Release Impact |
| --- | --- | --- | --- | --- |
| P4-RISK-001 | Cross-organization access | P0 | RLS, tenant-safe FK, function authorization, known-UUID bypass | NO-GO |
| P4-RISK-002 | Cross-clinic access | P0 | Clinic scope, membership, role scope, `WITH CHECK` | NO-GO |
| P4-RISK-003 | Unauthorized payer decision | P0 | Decision permission, service wrapper, generic update denial, AI denial | NO-GO |
| P4-RISK-004 | Unauthorized payment/refund/reversal | P0 | Finance authority, controlled operation, protected columns | NO-GO |
| P4-RISK-005 | Generic `claim.update` escalation | P0 | Direct-table bypass and protected-field tests | NO-GO |
| P4-RISK-006 | Incorrect legacy mapping | P0 | Deterministic backfill, exception report, before/after reconciliation | NO-GO |
| P4-RISK-007 | Multiple current decisions | P0 | Effective decision uniqueness, current pointer, supersession | NO-GO |
| P4-RISK-008 | Duplicate payment or refund | P0 | External event identity, idempotency, amount reconciliation | NO-GO |
| P4-RISK-009 | Out-of-order integration event | P0 | Source timestamp/order rule, stale event rejection/no-op | NO-GO |
| P4-RISK-010 | Lost concurrent update | P0 | Expected version, atomic update, retry behavior | NO-GO |
| P4-RISK-011 | Incorrect partial approval | P1 | Header amount and item adjustment reconciliation | Release blocker |
| P4-RISK-012 | Payment summary mismatch | P0 | Transaction/allocation/reconciliation/Claim summary equality | NO-GO |
| P4-RISK-013 | Missing audit event | P1 | Successful mutation evidence, failed-action behavior | Release blocker |
| P4-RISK-014 | Invalid reopen | P1 | Elevated permission, source/target rule, version, history preservation | Release blocker |
| P4-RISK-015 | Dashboard miscalculation | P1 | Independent KPI aggregation and mixed-state fixtures | Release blocker |
| P4-RISK-016 | API compatibility regression | P1 | DTO/schema compatibility, version conflict, legacy stage | Release blocker |
| P4-RISK-017 | Claim Readiness or payer-rule regression | P1 | Existing scoring/rule integration tests | Release blocker |
| P4-RISK-018 | Missing Appeal record for formal Appeal | P1 | Atomic Appeal creation and workflow synchronization | Release blocker |
| P4-RISK-019 | Financial rounding or currency error | P0 | Exact numeric, currency consistency, refund ceiling, tolerance | NO-GO |
| P4-RISK-020 | Phase 3 security regression | P0 | Existing permission, security, isolation, self-scope, audit suites | NO-GO |

All P0 and mandatory P1 tests must pass before Phase 4 closure.

## 8. Test Levels and Ownership

| Test Level | Coverage | Primary Owner | Supporting Owner |
| --- | --- | --- | --- |
| Database/pgTAP | Schema, constraints, RLS, functions, migration | Database QA | Database Architect |
| Security | RBAC, tenant isolation, mutation abuse | Security QA | Security Lead |
| Service/API | Commands, DTOs, Zod, versioning, idempotency | Backend QA | Backend Lead |
| Frontend | Filters, badges, actions, states, accessibility | Frontend QA | Frontend Lead |
| Integration | Payer, payment, event identity and ordering | Integration QA | Claim Domain Owner |
| UAT | Claim operations and business rules | Product/Business | Claim Domain Owner |
| Regression | Phase 3 and Phase 4 | QA Lead | All teams |
| Compliance Review | Audit evidence, least privilege, AI boundaries | Security QA | Security Lead |

## 9. Test Environment and Tooling

### Planned Environment

```text
Windows PowerShell
Docker Desktop
Local Supabase
PostgreSQL
Supabase CLI
pgTAP
Node.js
TypeScript strict mode
Next.js production build
```

### Environment Rules

- Use disposable Local Supabase only for migration/reset testing.
- Do not use production data.
- Record migration version, Git commit, Supabase CLI version, Node version, and test command.
- Treat unavailable environment or dependency as `Blocked`.
- Do not report static inspection as `Passed`.

### Planned Commands

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

## 10. Test Data Strategy

Use deterministic, minimal, synthetic fixtures.

### Required Tenant Model

```text
Organization Alpha
├── Clinic Alpha 1
├── Clinic Alpha 2
├── Claim Operator
├── Claim Reviewer
├── Adjudicator
├── Finance User
└── Auditor

Organization Beta
└── Equivalent users for cross-tenant tests
```

### Representative Claim Combinations

The final values must follow approved/implemented enums. Where wording below differs from implementation, test data must be adapted without changing the domain intent.

```text
draft + pending/not_decided + not_billable/not_paid
needs_review + pending/not_decided + not_billable/not_paid
ready_to_submit + pending/not_decided + not_billable/not_paid
submitted + pending/not_decided + not_billable/not_paid
payer_processing/under_review + pending/not_decided + not_billable/not_paid
decision_received/under_review + approved + payment_pending
decision_received/under_review + partially_approved + partially_paid
decision_received/under_review + rejected + not_billable/not_paid
appealed + rejected + not_billable/not_paid
closed + approved + paid
closed + rejected + not_billable/not_paid
cancelled + pending/not_decided + not_billable/not_paid
cancelled + voided + refunded
```

### Fixture Rules

- Fixed UUIDs
- Fixed timestamps
- Fixed exact numeric amounts
- Explicit approved currency
- No PHI
- Transaction rollback
- No random dependency
- Tenant-safe foreign keys
- Separate positive, negative, contradiction, and migration-exception fixtures
- Stable external event IDs and idempotency keys
- Explicit expected versions

## 11. Requirements and ADR Traceability

| ADR / Requirement | Risk | Test Area | Planned Test IDs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| ADR-001 Closed Semantics | P4-RISK-015 | Workflow, dashboard | P4-WF-004, P4-UI-004, P4-DASH-001 | P1 | Planned |
| ADR-002 Appeal Scope | P4-RISK-018 | Appeal, workflow, RLS | P4-APP-001–007 | P1 | Blocked pending implementation |
| ADR-003 Refund/Reversal Scope | P4-RISK-008, 012, 019 | Payment and reconciliation | P4-PAY-005–016, P4-IDEM-003–004 | P0/P1 | Blocked pending implementation and technical verification |
| ADR-004 Claim-Line Adjudication | P4-RISK-011 | Decision/item adjustment | P4-DEC-010–013 | P1 | Planned for MVP adjustment model; dedicated line decisions Deferred |
| ADR-005 Reopen Rules | P4-RISK-014 | Controlled mutation, audit | P4-REOPEN-001–008 | P1 | Blocked pending implementation |
| ADR-006 Payer Decision Authority | P4-RISK-003, 007, 009 | Decision, integration, security | P4-DEC-001–009, P4-IDEM-001–002 | P0 | Blocked pending implementation and technical verification |
| ADR-007 Payment Authority | P4-RISK-004, 008, 012, 019 | Payment, finance security | P4-PAY-001–016, P4-RBAC-006 | P0 | Blocked pending implementation and technical verification |
| ADR-008 Legacy Status Retirement | P4-RISK-006, 016 | Migration, API compatibility | P4-MIG-001–012, P4-LEG-001–010 | P0/P1 | Planned |
| Phase 3 Security Regression | P4-RISK-020 | RBAC/RLS/regression | P4-REG-001–006 | P0 | Planned |
| Claim Readiness Compatibility | P4-RISK-017 | Clinical/rule integration | P4-INT-001–010 | P1 | Planned |

All identifiers above are proposed unless equivalent repository IDs already exist.

## 12. Database and Migration Tests

### Planned Scenarios

| Test ID | Title | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-DB-001 | New state columns/types exist | P1 | Schema matches approved migration design | Planned |
| P4-DB-002 | Tenant keys and foreign keys are enforced | P0 | Cross-tenant references fail | Planned |
| P4-DB-003 | RLS is enabled on new tables | P0 | Every new tenant table has RLS enabled | Planned |
| P4-DB-004 | Required indexes exist | P1 | Queue, event, reconciliation, and lookup indexes are present | Planned |
| P4-DB-005 | Legacy status retained during transition | P1 | Initial migration does not remove legacy field | Planned |
| P4-MIG-001 | Clean reset applies all migrations | P0 | Local disposable reset completes | Blocked until migrations exist |
| P4-MIG-002 | Phase 3 baseline upgrades successfully | P0 | Existing schema upgrades without row loss | Blocked until migrations exist |
| P4-MIG-003 | Backfill is deterministic | P0 | Same source data produces same target states | Planned |
| P4-MIG-004 | Unknown legacy value is reported | P0 | Exception recorded; no silent coercion | Planned |
| P4-MIG-005 | No row loss | P0 | Before/after Claim row counts reconcile | Planned |
| P4-MIG-006 | Tenant ownership unchanged | P0 | Organization/clinic ownership remains identical | Planned |
| P4-MIG-007 | Financial totals unchanged | P0 | Before/after approved, paid, allocated, refunded totals reconcile | Planned |
| P4-MIG-008 | Invalid state combination rejected | P1 | Constraint/function rejects contradiction | Planned |
| P4-MIG-009 | Roll-forward repair validation | P1 | Repair migration resolves a simulated recoverable failure | Blocked until implementation exists |
| P4-MIG-010 | Migration rerun safety | P1 | Approved idempotent/backfill logic does not duplicate data | Planned |
| P4-MIG-011 | Null and unknown counts validated | P0 | Required target fields have no unexplained null/unknown values | Planned |
| P4-MIG-012 | Legacy/new distributions reconcile | P1 | Mapping report explains all source-to-target transitions | Planned |

### Required Before/After Evidence

- Row count
- Legacy status distribution
- New workflow distribution
- New decision distribution
- New payment distribution
- Null count
- Unknown-value count
- Organization/clinic ownership counts
- Approved, paid, allocated, refunded, reversed, and outstanding totals

## 13. Workflow Tests

| Test ID | Title | Priority | Core Expectation | Status |
| --- | --- | --- | --- | --- |
| P4-WF-001 | Valid forward transition | P1 | Approved transition succeeds atomically | Planned |
| P4-WF-002 | Valid controlled backward transition | P1 | Only approved elevated path succeeds | Blocked pending final transition matrix |
| P4-WF-003 | Invalid transition | P1 | Operation fails and rolls back | Planned |
| P4-WF-004 | Closed does not imply paid | P1 | Workflow closes without financial mutation | Planned |
| P4-WF-005 | Cancelled does not imply voided/refunded | P1 | Decision/payment remain evidence-based | Planned |
| P4-WF-006 | Readiness requirement enforced | P1 | `ready_to_submit` rule uses readiness evidence | Planned |
| P4-WF-007 | Readiness override audited | P1 | Authorized override requires reason and audit | Planned |
| P4-WF-008 | Required reason enforced | P1 | Material exception transition without reason fails | Planned |
| P4-WF-009 | Milestone timestamp recorded | P2 | Required timestamp is populated once per approved rule | Planned |
| P4-WF-010 | Version increments once | P0 | Successful mutation increments exactly once | Planned |
| P4-WF-011 | Workflow event recorded | P1 | Event has old/new state, actor, source, reason, version | Blocked until event authority exists |
| P4-WF-012 | Failed transition fully rolls back | P0 | No snapshot/event/audit partial write remains | Planned |
| P4-WF-013 | Terminal behavior enforced | P1 | Closed/cancelled cannot be changed generically | Planned |
| P4-WF-014 | Reopen follows ADR-005 | P1 | Only controlled reopen or revision path succeeds | Blocked until implementation exists |

## 14. Decision and Claim-Line Tests

### Claim-Level Decision

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-DEC-001 | Pending/not decided | P1 | No authoritative final outcome is inferred | Planned |
| P4-DEC-002 | Approved decision | P0 | Final authoritative record and snapshot agree | Planned |
| P4-DEC-003 | Partially approved | P1 | Approved/denied amounts reconcile | Planned |
| P4-DEC-004 | Rejected decision | P0 | Final outcome and reason are preserved | Planned |
| P4-DEC-005 | Voided decision | P1 | Void requires authoritative decision action | Planned |
| P4-DEC-006 | Corrected/superseded decision | P0 | Prior history remains; one current effective decision | Planned |
| P4-DEC-007 | Multiple decision rounds | P1 | Rounds remain ordered and traceable | Planned |
| P4-DEC-008 | Duplicate decision prevented | P0 | Same event/idempotency key does not duplicate | Planned |
| P4-DEC-009 | Older event protected | P0 | Older event cannot replace newer effective decision | Planned |
| P4-DEC-010 | Manual authority fallback | P0 | Only approved adjudicator role can finalize | Blocked pending authority implementation |
| P4-DEC-011 | AI cannot decide | P0 | AI service is denied authoritative mutation | Planned |
| P4-DEC-012 | Header amount equals approved adjustment model | P1 | Header and item adjustments reconcile | Planned |
| P4-DEC-013 | Adjustment model is not presented as complete line adjudication | P1 | API/UI semantics remain accurate | Planned |

### Dedicated Claim-Line Decisions

| Scenario | Status |
| --- | --- |
| All lines approved → approved | Deferred unless dedicated line decision ADR is approved |
| Mixed line outcomes → partially approved | Deferred unless dedicated line decision ADR is approved |
| No payable lines approved → rejected | Deferred unless dedicated line decision ADR is approved |
| Header totals equal authoritative line totals | Deferred unless dedicated line decision ADR is approved |
| Cross-tenant line decision denied | Deferred unless dedicated line decision table exists |

## 15. Payment, Refund, and Reconciliation Tests

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-PAY-001 | Single successful payment | P0 | Authoritative transaction and summary reconcile | Planned |
| P4-PAY-002 | Multiple payments | P0 | Net paid amount aggregates exactly | Planned |
| P4-PAY-003 | Partial payment | P1 | Correct partial status and outstanding amount | Planned |
| P4-PAY-004 | Full settlement | P0 | Paid status only when authoritative totals satisfy rule | Planned |
| P4-PAY-005 | Payment failure | P1 | Failure recorded; paid total unchanged | Planned |
| P4-PAY-006 | Allocation | P0 | Allocations equal authoritative applied amount | Planned |
| P4-PAY-007 | Reconciliation success | P0 | Reconciled state meets approved tolerance | Planned |
| P4-PAY-008 | Reconciliation mismatch | P0 | Mismatch remains unresolved and release-blocking as applicable | Planned |
| P4-PAY-009 | Partial refund | P0 | New refund transaction; original payment preserved | Blocked until implementation exists |
| P4-PAY-010 | Full refund | P0 | Refund does not overwrite original payment | Blocked until implementation exists |
| P4-PAY-011 | Reversal | P0 | Reversal references original transaction and preserves history | Blocked until implementation exists |
| P4-PAY-012 | Adjustment | P2 | Behavior follows approved Finance scope | Deferred unless approved |
| P4-PAY-013 | Duplicate payment/refund event | P0 | No double-counting or duplicate transaction | Planned |
| P4-PAY-014 | Refund greater than paid | P0 | Operation fails and rolls back | Blocked until implementation exists |
| P4-PAY-015 | Currency mismatch | P0 | Mutation fails | Planned |
| P4-PAY-016 | Zero/negative amount | P0 | Invalid financial mutation fails | Planned |
| P4-PAY-017 | Outstanding/net-paid calculation | P0 | Exact numeric result matches transaction evidence | Planned |
| P4-PAY-018 | Decision unchanged by refund/reversal | P0 | Decision snapshot remains unchanged | Planned |

Critical reconciliation assertion:

```text
Authoritative payment transactions
= payment allocations
= Claim-level payment summary
```

This assertion must be adapted to the approved refund/reversal net-settlement rules.

## 16. Appeal and Reopen Tests

### Appeal

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-APP-001 | Formal Appeal creation | P1 | Dedicated Appeal record created | Blocked until table/operation exists |
| P4-APP-002 | Appeal submission | P1 | Status/event/audit update atomically | Blocked |
| P4-APP-003 | Appeal acknowledgment | P2 | Payer acknowledgment preserved | Blocked |
| P4-APP-004 | Appeal processing | P1 | Owner/status/deadline behavior follows approved rule | Blocked |
| P4-APP-005 | Appeal decision | P1 | Outcome links authoritative decision | Blocked |
| P4-APP-006 | Evidence linkage | P1 | Appeal evidence is tenant-safe and auditable | Blocked |
| P4-APP-007 | Assigned reviewer | P2 | Unauthorized assignment denied | Blocked |
| P4-APP-008 | Workflow synchronization | P1 | `appealed` summary matches active Appeal | Blocked |
| P4-APP-009 | Tenant isolation | P0 | Cross-tenant read/write denied | Blocked |
| P4-APP-010 | Multiple rounds | P3 | Multi-round behavior | Deferred |

### Reopen

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-REOPEN-001 | Authorized elevated actor | P1 | Approved role can invoke controlled operation | Blocked |
| P4-REOPEN-002 | Missing permission | P0 | Operation denied | Blocked |
| P4-REOPEN-003 | Missing reason | P1 | Operation denied | Blocked |
| P4-REOPEN-004 | Stale version | P0 | Operation denied without state change | Blocked |
| P4-REOPEN-005 | History preserved | P0 | Workflow, decision, payment history remains intact | Blocked |
| P4-REOPEN-006 | Decision/payment not rewritten | P0 | Only workflow/revision behavior changes | Blocked |
| P4-REOPEN-007 | Direct reopen rejected | P0 | Generic update cannot reopen terminal Claim | Planned |
| P4-REOPEN-008 | Post-submission revision rule | P1 | Approved linked revision/resubmission rule enforced | Blocked |

## 17. RBAC and RLS Tests

Permission codes must be reconciled with actual repository naming before implementation.

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

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-RBAC-001 | Authorized action | P0 | Role performs only approved operation | Planned |
| P4-RBAC-002 | Missing permission | P0 | Operation denied | Planned |
| P4-RBAC-003 | Inactive/revoked role | P0 | Operation denied | Planned |
| P4-RBAC-004 | Wrong organization | P0 | Read/write denied | Planned |
| P4-RBAC-005 | Wrong clinic | P0 | Read/write denied | Planned |
| P4-RBAC-006 | Missing membership | P0 | Operation denied | Planned |
| P4-RBAC-007 | Assignment/self-scope | P1 | Scope matches approved role rules | Planned |
| P4-RBAC-008 | Generic update cannot decide/pay | P0 | Protected state remains unchanged | Planned |
| P4-RBAC-009 | Auditor read-only | P0 | Read succeeds; mutation fails | Planned |
| P4-RBAC-010 | Known UUID bypass | P0 | RLS still denies access | Planned |
| P4-RBAC-011 | JWT tenant tampering | P0 | Token claim tampering cannot bypass server authorization | Planned |
| P4-RBAC-012 | Tenant-safe FK | P0 | Cross-tenant reference fails | Planned |
| P4-RBAC-013 | Security-definer authorization | P0 | Function validates actor/tenant/permission safely | Planned |

Any cross-tenant access is a release blocker.

## 18. Controlled Mutation Tests

Planned operation names must be adapted to actual repository conventions.

```text
transition_claim_workflow
record_claim_decision
record_claim_payment
record_claim_refund
record_claim_reversal
submit_claim_appeal
close_claim
cancel_claim
reopen_claim
```

For each controlled mutation verify:

| Control | Expected Behavior |
| --- | --- |
| Authentication | Missing/invalid identity is rejected |
| Tenant and clinic scope | Cross-scope mutation is rejected |
| Permission | Explicit domain permission required |
| Current state | Unsupported source state rejected |
| Transition/business rule | Approved rule enforced |
| Expected version | Stale version rejected |
| Idempotency | Retry returns prior result or safe no-op |
| Reason and source | Required metadata enforced |
| Audit/domain event | Successful material action is recorded |
| Full rollback | Failed action leaves no partial state |

Direct-table bypass tests are mandatory for all protected Claim, decision, payment, refund, reversal, Appeal, and workflow fields.

## 19. Concurrency, Idempotency, and Event Ordering

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-CON-001 | Two actors use same version | P0 | Exactly one succeeds; stale mutation fails | Planned |
| P4-CON-002 | Version increments once | P0 | One successful mutation = one increment | Planned |
| P4-CON-003 | Concurrent payer decisions | P0 | One effective current decision remains | Planned |
| P4-CON-004 | Concurrent payment events | P0 | No lost/double-counted payment | Planned |
| P4-IDEM-001 | Duplicate decision event | P0 | No duplicate effective decision | Planned |
| P4-IDEM-002 | Delayed old decision event | P0 | Cannot replace newer decision | Planned |
| P4-IDEM-003 | Duplicate payment event | P0 | No double-counting | Planned |
| P4-IDEM-004 | Duplicate refund event | P0 | No double refund | Blocked until refund exists |
| P4-IDEM-005 | Superseding correction | P1 | Prior history preserved; current state corrected | Planned |
| P4-IDEM-006 | Retry returns prior result | P1 | Stable idempotent response | Planned |
| P4-IDEM-007 | No duplicate audit event | P1 | Retry does not duplicate success evidence | Planned |
| P4-IDEM-008 | Missing mandatory event identity | P0 | Integration mutation rejected | Blocked pending final event contract |

## 20. Audit and Compliance Tests

Material events must include:

- Claim and tenant IDs
- Actor and role
- Previous and new values
- Reason code and text
- Source system
- Correlation/external event ID
- Business timestamp
- Recorded timestamp
- Version before and after

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-AUD-001 | Successful workflow event | P1 | Required audit fields present | Planned |
| P4-AUD-002 | Successful decision event | P0 | Authority/source/supersession preserved | Planned |
| P4-AUD-003 | Successful payment/refund event | P0 | Amount/currency/source/reference preserved | Planned |
| P4-AUD-004 | Failed action | P1 | No false success event | Planned |
| P4-AUD-005 | Cross-tenant audit access | P0 | Denied | Planned |
| P4-AUD-006 | Auditor mutation | P0 | Denied | Planned |
| P4-AUD-007 | PHI in unrestricted metadata | P0 | Disallowed data is rejected or absent | Planned |
| P4-AUD-008 | AI recommendation distinction | P0 | AI evidence cannot be mistaken for authority | Planned |
| P4-AUD-009 | Audit retention | P2 | Verify documented retention where defined | Blocked if retention rule absent |

## 21. Clinical, Evidence, and Payer-Rule Integration Tests

The Phase 4 architecture must not break:

- SOAP completeness
- ICD-10 and procedure validation
- Prescription and treatment evidence
- Medical certificate
- Evidence package
- Payer rules
- Coverage validation
- Cost thresholds
- Fraud and anomaly alerts
- Claim Readiness
- Manual override audit

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-INT-001 | SOAP completeness remains available | P1 | Existing completeness behavior preserved | Planned |
| P4-INT-002 | ICD/procedure validation remains available | P1 | Existing coding validation preserved | Planned |
| P4-INT-003 | Prescription/treatment evidence remains linked | P1 | Evidence association preserved | Planned |
| P4-INT-004 | Medical certificate remains linked | P1 | Required evidence remains accessible | Planned |
| P4-INT-005 | Evidence package compatibility | P1 | Package generation/read paths remain valid | Planned |
| P4-INT-006 | Payer-rule compatibility | P1 | Rule outcome remains independent from payer decision | Planned |
| P4-INT-007 | Cost threshold compatibility | P1 | Alerts do not mutate authoritative decision/payment | Planned |
| P4-INT-008 | Fraud/anomaly compatibility | P1 | AI risk remains recommendation only | Planned |
| P4-INT-009 | Readiness permits ready-to-submit only | P1 | Readiness does not auto-submit or auto-approve | Planned |
| P4-INT-010 | Manual override is audited | P1 | Override reason/actor/event recorded | Planned |

Existing Claim Readiness scoring weights must not be changed by Phase 4 tests or implementation unless separately approved.

## 22. Backend and API Contract Tests

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-API-001 | Generated database types | P1 | Types reflect implemented schema and compile | Blocked until migration exists |
| P4-API-002 | Zod validation | P1 | New state and mutation inputs validated | Blocked until contract exists |
| P4-API-003 | DTO mapping | P1 | Separate workflow/decision/payment fields returned | Blocked until implementation exists |
| P4-API-004 | Version conflict | P0 | Stale write returns explicit conflict | Blocked |
| P4-API-005 | Permission error | P0 | Sanitized denial without tenant leak | Blocked |
| P4-API-006 | Idempotency contract | P0 | Retry-safe response | Blocked |
| P4-API-007 | Legacy compatibility | P1 | Approved transition-stage response remains usable | Blocked |
| P4-API-008 | No ambiguous `status: string` | P1 | New contracts expose separate state domains | Blocked |
| P4-API-009 | Generic update protection | P0 | API cannot write protected fields directly | Blocked |
| P4-API-010 | AI authority boundary | P0 | AI endpoint cannot record decision/payment authority | Planned |

## 23. Frontend and Dashboard Tests

### Frontend

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-UI-001 | Separate state badges | P1 | Workflow, decision, payment displayed independently | Blocked until UI exists |
| P4-UI-002 | Independent filters | P1 | Draft/Approved/Paid are not mixed in one status filter | Blocked |
| P4-UI-003 | Correct actions by permission | P0 | Unauthorized action hidden and server-denied | Blocked |
| P4-UI-004 | Closed but unpaid | P1 | UI shows Closed + Pending/Not Paid | Blocked |
| P4-UI-005 | Approved but unpaid | P1 | UI does not show paid | Blocked |
| P4-UI-006 | Timeline and audit | P1 | Material events displayed accurately | Blocked |
| P4-UI-007 | Loading/empty/error/forbidden | P2 | States render without ambiguity | Blocked |
| P4-UI-008 | Accessibility | P2 | Labels/actions meet approved accessibility checks | Blocked |
| P4-UI-009 | Bilingual direction | P2 | English-first 70%, Thai support 30% | Blocked |
| P4-UI-010 | AI recommendation label | P0 | AI not shown as authoritative outcome | Blocked |

### Dashboard

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-DASH-001 | Approved is not counted as paid | P1 | Decision and payment KPIs remain separate | Blocked |
| P4-DASH-002 | Closed is not counted as approved | P1 | Workflow and decision KPIs remain separate | Blocked |
| P4-DASH-003 | Outstanding approved amount | P1 | Exact approved less net settled calculation | Blocked |
| P4-DASH-004 | Partial payment aggregation | P1 | Partial values aggregate exactly | Blocked |
| P4-DASH-005 | Refund aggregation | P1 | Refund reduces net settlement without changing decision | Blocked |
| P4-DASH-006 | Tenant-scoped dashboard | P0 | No cross-tenant aggregation | Blocked |

## 24. Legacy Compatibility Tests

| Test ID | Scenario | Priority | Expected Result | Status |
| --- | --- | --- | --- | --- |
| P4-LEG-001 | Add new model | P1 | Additive migration preserves legacy behavior | Blocked until migration exists |
| P4-LEG-002 | Backfill | P0 | Deterministic and complete | Planned |
| P4-LEG-003 | Compatible reads | P1 | Approved clients continue during transition | Blocked |
| P4-LEG-004 | Switch writes | P0 | New writes use controlled operations | Blocked |
| P4-LEG-005 | Disable legacy writes | P0 | No application writes legacy status | Blocked |
| P4-LEG-006 | Reconcile legacy/new divergence | P0 | Divergence detected and blocked | Planned |
| P4-LEG-007 | Deprecate clients | P2 | Dependency inventory reaches zero | Blocked |
| P4-LEG-008 | Unknown legacy value | P0 | Exception recorded; cutover blocked | Planned |
| P4-LEG-009 | No indefinite dual-write | P1 | Dual-write has explicit end gate | Planned |
| P4-LEG-010 | Legacy field removal | P3 | Separate later migration only | Deferred |

## 25. Performance and Resilience Tests

Planned targets:

- Active Claim queue
- Pending decision queue
- Payment exception queue
- Assigned-user queue
- Claim detail and history
- Dashboard aggregation
- RLS-filtered queries
- External event lookup
- Payment reconciliation
- Migration backfill

When implementation exists, capture:

- Query plan
- Index usage
- Rows scanned
- Execution time
- N+1 behavior
- Trigger/function cost
- Retry behavior
- Lock contention
- Batch/backfill duration

Performance thresholds are an Open Decision until approved by Database Architect, Backend Lead, and Product Owner. Do not invent thresholds.

## 26. Regression Strategy

### Confirmed Phase 3 Coverage to Retain Where Present

- Claim permissions
- Claim security
- Tenant isolation
- Self-scope
- Audit
- Database lint

### Phase 4 Regression Groups

```text
Schema and migration
Workflow
Decision and item-adjustment adjudication
Payment and reconciliation
Appeal and reopen
Security and protected mutations
Concurrency and idempotency
API
UI and dashboard
Clinical/evidence/payer-rule compatibility
```

Run targeted tests first, followed by the complete Phase 3 + Phase 4 suite.

No existing assertion may be weakened merely to accommodate Phase 4 changes.

## 27. Test Execution Sequence

```text
1. Static review
2. Disposable Local Supabase reset
3. Database lint
4. Schema and migration tests
5. RBAC/RLS and tenant-isolation tests
6. Workflow tests
7. Decision and item-adjustment tests
8. Payment/refund/reconciliation tests
9. Appeal and reopen tests
10. Concurrency/idempotency/event-ordering tests
11. Audit/compliance tests
12. Clinical/evidence/payer-rule integration tests
13. API tests
14. Frontend and dashboard tests
15. Phase 3 + Phase 4 regression
16. TypeScript, lint, and build
17. Performance checks
18. Validation report
```

Stop immediately on any P0 failure.

## 28. Entry and Exit Criteria

### Entry Criteria

- Mandatory ADRs approved - satisfied on 2026-07-22 by Project Owner / Product Owner
- Phase 3 validation available
- Phase 4 implementation exists
- Local Supabase available
- Deterministic fixtures available
- Required permissions and policies implemented
- External event identity/order rules implemented
- Finance currency/reconciliation rules approved
- No unresolved P0 architecture decision

### Exit Criteria

- All P0 tests pass
- All mandatory P1 tests pass
- Migration and backfill pass
- RBAC/RLS and tenant isolation pass
- Decision/payment authority pass
- Financial reconciliation passes
- Concurrency/idempotency/event ordering pass
- Audit/compliance pass
- Claim Readiness and payer-rule compatibility pass
- Phase 3 regression passes
- TypeScript, lint, and build pass
- No open Critical or High defect
- Validation evidence recorded
- Release gate approved

## 29. Defect Management

### Severity

```text
Critical
High
Medium
Low
```

| Severity | Example | Required Action |
| --- | --- | --- |
| Critical | Cross-tenant access, unauthorized financial mutation, destructive migration, duplicate settlement | Immediate stop; NO-GO |
| High | Incorrect state, failed reconciliation, stale update succeeds, missing mandatory audit | Block release |
| Medium | Non-critical UI/reporting issue | Fix before production unless explicitly accepted |
| Low | Documentation/cosmetic issue | May be scheduled |

### Defect Evidence

Each defect must record:

- Test ID
- Environment
- Commit/migration
- Actor and tenant fixture
- Reproduction steps
- Expected result
- Actual result
- Security/financial impact
- Logs or SQL evidence
- Owner
- Disposition

A flaky test is treated as failed until determinism is proven.

## 30. Risks and Blockers

| Blocker ID | Blocker | Impact | Status |
| --- | --- | --- | --- |
| BLK-001 | ADR approval evidence recorded | Architecture expectations approved; implementation evidence still absent | Satisfied |
| BLK-002 | Phase 4 migrations not implemented | Database/migration tests cannot run | Blocked |
| BLK-003 | Formal Appeal model not implemented | Appeal tests cannot run | Blocked |
| BLK-004 | Refund/reversal operations not implemented | Financial exception tests cannot run | Blocked |
| BLK-005 | Secure payer/payment wrappers unavailable | Authority tests cannot run | Blocked |
| BLK-006 | External event contract pending | Idempotency/order tests incomplete | Blocked |
| BLK-007 | Finance currency/tolerance rules pending | Reconciliation expected results incomplete | Blocked |
| BLK-008 | Backend/API/UI cutover absent | Application tests cannot run | Blocked |
| BLK-009 | Performance thresholds undefined | Performance acceptance cannot be finalized | Open Decision |
| BLK-010 | Exact existing test inventory requires repository inspection | Existing-file update list may be incomplete | Not Verified |

## 31. Existing and Proposed Test Files

### Confirmed Existing Test Files

The exact repository inventory must be populated only after static inspection of `supabase/tests/**/*.sql`.

| Path | Current Coverage | Reusable Coverage | Required Update | Status |
| --- | --- | --- | --- | --- |
| Phase 3 Claim permission test file(s) | Claim permission enforcement | Base role/permission patterns | Extend for split authority permissions | Not Verified in this documentation-only revision |
| Phase 3 Claim security test file(s) | Claim security controls | Base protected-operation patterns | Extend for controlled mutations | Not Verified |
| Phase 3 tenant-isolation test file(s) | Organization isolation | Tenant fixture and denial patterns | Extend to events, Appeals, decisions, payments | Not Verified |
| Phase 3 self-scope test file(s) | User/assignment scope | Self-scope fixture patterns | Reassess elevated operations | Not Verified |
| Phase 3 Claim audit test file(s) | Audit evidence | Base audit assertion style | Add workflow/decision/payment/Appeal evidence | Not Verified |

Do not convert these rows to `Confirmed Existing File` until exact paths are inspected.

### Proposed Test Files

Names must be adjusted to repository conventions during implementation.

| Proposed File | Purpose | Priority | Dependencies | Main Scenarios | Fixture Requirements | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/tests/phase4_claim_schema_test.sql` | State schema, constraints, indexes | P1 | State migrations | Columns/types/FKs/indexes/RLS | Minimal Claims | Planned |
| `supabase/tests/phase4_claim_migration_test.sql` | Backfill and compatibility | P0 | Migration/backfill | Counts/distributions/nulls/totals | Legacy-state matrix | Planned |
| `supabase/tests/phase4_claim_workflow_test.sql` | Workflow transitions | P1 | Controlled operation | Valid/invalid/terminal/readiness | Workflow matrix | Planned |
| `supabase/tests/phase4_claim_decision_test.sql` | Claim decision authority | P0 | Decision wrapper | Finalize/supersede/idempotency | Decision rounds | Planned |
| `supabase/tests/phase4_claim_line_decision_test.sql` | Dedicated line decisions | P3 | Separate approved ADR | Line aggregation | Claim-line fixtures | Deferred |
| `supabase/tests/phase4_claim_payment_test.sql` | Payment/allocation/reconciliation | P0 | Payment implementation | Partial/full/failure/reconcile | Exact numeric financial fixtures | Planned |
| `supabase/tests/phase4_claim_refund_reversal_test.sql` | Refund/reversal | P0 | Refund/reversal implementation | Partial/full/refund ceiling/reversal | Original payment references | Blocked |
| `supabase/tests/phase4_claim_appeal_test.sql` | Formal Appeal | P1 | Appeal table/operation | Create/submit/decide/tenant isolation | Appeal fixtures | Blocked |
| `supabase/tests/phase4_claim_permissions_test.sql` | Permission inventory | P0 | RBAC migration | Allowed/denied/revoked roles | Role matrix | Planned |
| `supabase/tests/phase4_claim_security_test.sql` | Protected mutations | P0 | RLS/wrappers | Direct bypass/security-definer | Security actors | Planned |
| `supabase/tests/phase4_claim_tenant_isolation_test.sql` | Organization/clinic isolation | P0 | Tenant-safe schema | Known UUID, cross-clinic, cross-org | Alpha/Beta tenants | Planned |
| `supabase/tests/phase4_claim_concurrency_test.sql` | Optimistic locking | P0 | Versioned operations | Same-version writers | Parallel/stale fixtures | Planned |
| `supabase/tests/phase4_claim_idempotency_test.sql` | Retry and event identity | P0 | External event contract | Duplicate/delayed/out-of-order | Stable event IDs | Blocked |
| `supabase/tests/phase4_claim_audit_test.sql` | Audit/compliance | P1 | Audit implementation | Success/failure/AI distinction | Synthetic metadata | Planned |

No proposed test file is created by this documentation task.

## 32. Validation Commands

Commands are planned only and were not executed for this revision.

```powershell
cd D:\med-ai-nexsure-platform

git status --short
npx supabase status
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

Expected results must be recorded only after execution:

```text
Database migrations applied successfully
All required database tests passed
No schema errors found
TypeScript validation passed
No new blocking lint errors
Production build passed
Only intended files changed
```

## 33. Test Summary

| Test Area | Priority | Planned Coverage | Owner | Proposed Artifact | Blocker |
| --- | --- | --- | --- | --- | --- |
| Database schema | P1 | TBD after detailed test-case design | Database QA | `phase4_claim_schema_test.sql` | Migrations absent |
| Migration/backfill | P0 | TBD after detailed test-case design | Database QA | `phase4_claim_migration_test.sql` | Migrations absent |
| Workflow | P1 | TBD after detailed test-case design | Database QA / Backend QA | `phase4_claim_workflow_test.sql` | Transition implementation pending |
| Decision/item adjustment | P0/P1 | TBD after detailed test-case design | Database QA / Integration QA | `phase4_claim_decision_test.sql` | Secure authority path pending |
| Dedicated line adjudication | P3 | Deferred | Database QA | `phase4_claim_line_decision_test.sql` | Separate ADR required |
| Payment/reconciliation | P0 | TBD after detailed test-case design | Database QA / Integration QA | `phase4_claim_payment_test.sql` | Finance rules and implementation pending |
| Refund/reversal | P0 | TBD after detailed test-case design | Database QA / Security QA | `phase4_claim_refund_reversal_test.sql` | Operations absent |
| Appeal/reopen | P0/P1 | TBD after detailed test-case design | Database QA / Security QA | Appeal/reopen tests | Model/operations absent |
| RBAC/RLS | P0 | TBD after detailed test-case design | Security QA | Permission/security/isolation tests | Exact permission inventory pending |
| Concurrency/idempotency | P0 | TBD after detailed test-case design | Database QA / Integration QA | Concurrency/idempotency tests | Event contract pending |
| Audit/compliance | P1 | TBD after detailed test-case design | Security QA | `phase4_claim_audit_test.sql` | Implementation pending |
| Clinical/readiness integration | P1 | TBD after detailed test-case design | Backend QA / Product/Business | API/integration tests | Phase 4 implementation pending |
| Backend/API | P0/P1 | TBD after detailed test-case design | Backend QA | Repository-convention test files | API cutover absent |
| Frontend/dashboard | P1/P2 | TBD after detailed test-case design | Frontend QA | Repository-convention test files | UI cutover absent |
| Regression | P0 | Existing Phase 3 + new Phase 4 groups | QA Lead | Existing and proposed suites | Full implementation pending |
| Performance | P2 | TBD after thresholds approved | Database QA / Backend QA | Query-plan evidence | Thresholds undefined |

## 34. Approval Matrix

| Area | Product Owner | Claim Domain Owner | Database Architect | Security Lead | QA Lead |
| --- | --- | --- | --- | --- | --- |
| Test scope | ADR scope approved on 2026-07-22 | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| Workflow expectations | ADR direction approved on 2026-07-22 | Technical review pending | Technical review pending | Not Required | Technical review pending |
| Decision and item-adjustment expectations | ADR direction approved on 2026-07-22 | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| Payment/refund/reconciliation expectations | ADR direction approved on 2026-07-22 | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| Appeal and reopen expectations | ADR direction approved on 2026-07-22 | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| RBAC/RLS and tenant isolation | Not Required | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| Migration/backfill strategy | Not Required | Technical review pending | Technical review pending | Technical review pending | Technical review pending |
| API/UI compatibility | ADR direction approved on 2026-07-22 | Technical review pending | Not Required | Technical review pending | Technical review pending |
| Entry/exit/release gates | ADR direction approved on 2026-07-22 | Technical review pending | Technical review pending | Technical review pending | Technical review pending |

ADR-001 through ADR-008 are approved by Project Owner / Product Owner on 2026-07-22. This approval does not mark tests as implemented, run, passed, failed, or validated.

## 35. Validation Limitations

- Test planning only
- No migration or SQL changed
- No RLS policy changed
- No backend, frontend, or API changed
- No test code created
- No tests executed
- No database reset performed
- No fixture or seed changed
- No generated database types changed
- No production data accessed
- No commit or push performed by this documentation task
- Planned coverage depends on approved ADRs and actual Phase 4 implementation
- Exact existing test-file paths remain `Not Verified` until repository inspection records them
- Performance thresholds may remain pending
- Static inspection must not be reported as PASS
- Planned, Blocked, Deferred, and Not Applicable statuses do not represent execution results
- Phase 4 closure needs evidence in `PHASE-4-VALIDATION-REPORT.md`; no tests run..