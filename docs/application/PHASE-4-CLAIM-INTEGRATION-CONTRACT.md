# Phase 4 Claim Integration Contract

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure |
| Document | Phase 4 Claim Integration Contract |
| File | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` |
| Contract Status | PROPOSED |
| Owner Approval | PENDING |
| Implementation Authorization | NO |
| Contract Task Type | APPLICATION CONTRACT DEFINITION AND READ-ONLY REPOSITORY ANALYSIS |
| Created Date | 2026-07-23 |
| Analyzed Commit | `aaf31aab8a7535fc93ccc1ed54ecba0e607d2c8d` |
| Branch | `main` |
| Pre-existing Changes | `lib/database.types.ts` modified before this task |
| Writable Allowlist | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` only |

Confirmed Finding: Required repository safety checks were performed before editing: `git rev-parse HEAD`, `git branch --show-current`, `git status --short --untracked-files=all`, and `git diff --check`. `git status` showed a pre-existing modification to `lib/database.types.ts`; this task did not discard it.

## 2. Purpose, Scope, and Non-goals

Required Contract: This document defines the application integration contract for the approved Phase 4 Claim database architecture. It is implementation-ready guidance only; it does not approve, start, or perform application implementation.

Required Contract: Application code must preserve split Claim state: `workflow_status`, `decision_status`, and `payment_status`.

Required Contract: Non-goals are visual redesign, new database APIs, a generic workflow framework, deployment architecture, Phase 5 features, implementation work, migrations, generated type generation, test execution, commits, and pushes.

## 3. Active Evidence Baseline

Confirmed Finding: `docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md` records Phase 4 closure as complete, database validation ready for integration, generated database types current, no blocking security findings, and no blocking technical issues for the database phase.

Confirmed Finding: `docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md` Section 31 records Phase 4 readiness as `READY`, required validation status as `PASS`, blocking open decisions as `0`, and formal closure task readiness as `YES`.

Confirmed Finding: `lib/database.types.ts` exposes generated enums and RPC signatures for the Phase 4 application-facing contract. Generated signatures override duplicated handwritten types.

Confirmed Finding: Exact repository search found current application consumers using legacy or mock status concepts in `features/payer-rules/components/payer-detail-page.tsx`, `features/visit-list/types.ts`, `features/visit-list/visit-list-page.tsx`, and `features/patient-claims/utils/patient-claims-utils.ts`. No direct application protected writes were confirmed by the inspected search evidence.

Required Contract: Repository evidence overrides the expected baseline. The baseline for this contract is:

```text
Phase 4 Database Contract Resolved: YES
Database Validation Ready for Integration: YES
Generated Database Types Current: YES
Direct Protected Writes Found: NO
Blocking Security Findings: 0
Blocking Integration Findings:
1. Split claim-state read model
2. Controlled mutation boundaries
```

## 4. Application-Facing Interfaces

### READ CONTRACT

Confirmed Finding: The generated `claims` row type includes application-readable current snapshots and ownership/version fields: `id`, `organization_id`, `clinic_id`, `workflow_status`, `decision_status`, `payment_status`, `version`, `state_updated_at`, `state_updated_by`, `current_decision_id`, `total_claimed_amount`, `total_eligible_amount`, `total_approved_amount`, `total_paid_amount`, `currency_code`, `submitted_at`, `closed_at`, `cancelled_at`, `created_at`, `updated_at`, and legacy `status`.

Confirmed Finding: Generated enums expose `claim_workflow_state`, `claim_decision_state`, and `claim_payment_state`.

Required Contract: Application readers must treat `claims.workflow_status`, `claims.decision_status`, and `claims.payment_status` as separate canonical snapshots. Legacy `claims.status`, where present, is non-authoritative for Phase 4 claim state.

### CONTROLLED MUTATION CONTRACT

Confirmed Finding: Generated database types expose these controlled RPCs:

```text
public.transition_claim_workflow
public.record_claim_decision
public.record_claim_payment_settlement
public.submit_claim_appeal
public.resolve_claim_appeal
public.record_claim_refund
```

Required Contract: Application code must not directly update protected Phase 4 state columns. Protected direct writes include direct ordinary updates to `claims.workflow_status`, `claims.decision_status`, `claims.payment_status`, `claims.current_decision_id`, `claims.total_approved_amount`, `claims.total_paid_amount`, `claims.version`, `claims.state_updated_at`, and `claims.state_updated_by`.

### HISTORY/AUDIT CONTRACT

Confirmed Finding: Generated database types expose `claim_workflow_events`, `claim_decisions`, `claim_payments`, `claim_appeals`, and `audit_logs`.

Required Contract: Claim detail history must compose domain-specific evidence from workflow events, decision rows, payment/refund rows, appeal rows, and audit logs. A generic UI timeline may present a combined view, but it must not treat the combined presentation as the source of truth.

### INTERNAL DATABASE ONLY

Required Contract: Triggers, grants, RLS helper internals, indexes, and protected-column enforcement mechanics remain internal database controls unless an application-facing signature exposes them.

### NOT VERIFIED

Not Verified: No existing application repository/service abstraction was confirmed as the accepted owner for the new integration calls.

## 5. Canonical Read Models

### CLAIM READ MODEL

| Name | TypeScript Type | Required/Nullable | Authoritative Source | Derivation Owner | Legacy Compatibility | Security Visibility |
| --- | --- | --- | --- | --- | --- | --- |
| `claimId` | `string` | required | `claims.id` | DATABASE CANONICAL | none | tenant/clinic scoped |
| `organizationId` | `string` | required | `claims.organization_id` | DATABASE CANONICAL | none | server-authoritative |
| `clinicId` | `string` | required | `claims.clinic_id` | DATABASE CANONICAL | none | server-authoritative |
| `workflowStatus` | `Database["public"]["Enums"]["claim_workflow_state"]` | required | `claims.workflow_status` | DATABASE CANONICAL | legacy adapter may map for display only | claim read permission |
| `decisionStatus` | `Database["public"]["Enums"]["claim_decision_state"]` | required | `claims.decision_status` | DATABASE CANONICAL | legacy adapter must not collapse into workflow | claim read permission |
| `paymentStatus` | `Database["public"]["Enums"]["claim_payment_state"]` | required | `claims.payment_status` | DATABASE CANONICAL | legacy adapter must not collapse into decision | claim/payment read permission |
| `version` | `number` | required | `claims.version` | DATABASE CANONICAL | none | required before mutation |
| `stateUpdatedAt` | `string` | required | `claims.state_updated_at` | DATABASE CANONICAL | none | claim read permission |
| `currentDecisionId` | `string \| null` | nullable | `claims.current_decision_id` | DATABASE CANONICAL | none | claim/decision read permission |
| `appealSummary` | `{ currentAppealId?: string; appealStatus?: string; appealSequence?: number } \| null` | nullable | `claim_appeals` | SERVER-DERIVED | never synthetic DB column | claim appeal read permission |
| `refundSummary` | `{ refundedAmount: number; netPaidAmount: number } \| null` | nullable | `record_claim_refund` result and payment evidence | SERVER-DERIVED | never synthetic DB column | payment read permission |
| `claimSummary` | `{ totalClaimedAmount: number; totalEligibleAmount: number \| null; totalApprovedAmount: number \| null; totalPaidAmount: number; currencyCode: string }` | required | `claims` financial summary fields | DATABASE CANONICAL / DATABASE-DERIVED | legacy display allowed only as non-authoritative | claim/payment read permission |
| `capabilities` | `Record<string, boolean>` | required | server policy evaluation or approved capability source | SERVER-DERIVED | UI hint only | must not replace authorization |
| `legacyStatus` | `string \| null` | nullable | `claims.status` when selected | LEGACY ADAPTER | temporary one-way adapter | non-authoritative |

Required Contract: Unknown canonical states must fail safely, remain observable, and trigger sanitized logging. UI badges may show an unknown/unsupported state but must disable authoritative mutation actions until refreshed or resolved.

### HISTORY/AUDIT READ MODEL

| Name | TypeScript Type | Required/Nullable | Authoritative Source | Derivation Owner | Legacy Compatibility | Security Visibility |
| --- | --- | --- | --- | --- | --- | --- |
| `workflowEvents` | `ClaimWorkflowEvent[]` | required collection | `claim_workflow_events` | DATABASE CANONICAL | legacy status history is adapter-only if used | claim audit/read permission |
| `decisionHistory` | `ClaimDecision[]` | required collection | `claim_decisions` | DATABASE CANONICAL | none | decision/audit read permission |
| `paymentHistory` | `ClaimPayment[]` | required collection | `claim_payments` | DATABASE CANONICAL | none | payment read permission |
| `appealHistory` | `ClaimAppeal[]` | required collection | `claim_appeals` | DATABASE CANONICAL | none | appeal read permission |
| `auditEvents` | `AuditLog[]` | required collection | `audit_logs` | DATABASE CANONICAL | none | audit read permission |

Recommendation: Claim detail screens should fetch the claim snapshot and history/audit evidence as separate read concerns so list views remain fast and detail views remain traceable.

## 6. Controlled Mutation Contracts

| Operation | Status | Exact RPC/function | Required Version | Canonical Return | Refresh After Success |
| --- | --- | --- | --- | --- | --- |
| Workflow transition | AVAILABLE | `public.transition_claim_workflow` | `claims.version` | `claim_id`, `previous_workflow_status`, `workflow_status`, `version`, `workflow_event_id`, `state_updated_at`, `idempotent_replay` | claim detail, queues/lists, workflow history, audit |
| Claim decision | AVAILABLE | `public.record_claim_decision` | `claims.version` | `claim_id`, `previous_decision_status`, `decision_status`, `version`, `decision_id`, `current_decision_id`, `state_updated_at`, `idempotent_replay` | claim detail, decision history, queues/lists, audit |
| Payment settlement | AVAILABLE | `public.record_claim_payment_settlement` | `claims.version` | `claim_id`, `payment_id`, `previous_payment_status`, `payment_status`, `version`, `total_paid_amount`, `state_updated_at`, `idempotent_replay` | claim detail, payment history, financial summary, queues/lists, audit |
| Appeal submit | AVAILABLE | `public.submit_claim_appeal` | `claims.version` | `appeal_id`, `appeal_sequence`, `claim_id`, `previous_workflow_status`, `workflow_status`, `workflow_event_id`, `version`, `state_updated_at`, `idempotent_replay` | claim detail, appeal history, workflow history, audit |
| Appeal resolve | AVAILABLE | `public.resolve_claim_appeal` | `claims.version` | `appeal_id`, `appeal_status`, `claim_id`, `workflow_status`, `version`, `state_updated_at`, `idempotent_replay` | claim detail, appeal history, audit |
| Refund lifecycle | AVAILABLE | `public.record_claim_refund` | `claims.version` | `claim_id`, `refund_payment_id`, `original_payment_id`, `previous_payment_status`, `payment_status`, `version`, `total_paid_amount`, `refunded_amount`, `net_paid_amount`, `state_updated_at`, `idempotent_replay` | claim detail, payment/refund history, financial summary, queues/lists, audit |

Required Contract: Each mutation must be treated as one atomic database result. Application code must not define client-side write chains to complete a mutation.

Required Contract: The database derives tenant, clinic, actor, current state, currency, current decision/payment lineage, and new version. The caller must not provide these as authoritative inputs.

Required Contract: Manual approval, rejection, partial approval, void, supersession, terminal workflow movement, appeal submission/resolution, settlement, and refund require human confirmation or an approved trusted integration authority.

Open Decision (NON-BLOCKING): The exact application owner file for each mutation boundary is not verified. Minimum safe resolution is to inspect existing repository/service/server action patterns before implementation and reuse the narrowest existing owner.

## 7. Error Contract

| Error Class | Database Signal | Application Category | Retry Behavior | User-Safe Presentation | Logging Rule | PHI Restriction | UI Response |
| --- | --- | --- | --- | --- | --- | --- |
| AUTHENTICATION | missing/invalid auth context | AUTHENTICATION | retry after login | "Session expired. Please sign in again." | security event, no token | no PHI | redirect or auth modal |
| AUTHORIZATION | permission denied/sanitized denial | AUTHORIZATION | no automatic retry | "You do not have permission for this action." | actor, action, claim id if visible | no policy internals | disable action after refresh |
| TENANT_SCOPE | not found or denied under RLS | TENANT_SCOPE | no automatic retry | "Record is unavailable or outside your access." | sanitized tenant-scope denial | no tenant existence leak | return to safe list |
| DOMAIN_VALIDATION | invalid state, amount, reason, unsupported transition | DOMAIN_VALIDATION | retry after user correction | Thai helper text explaining required correction | field/category only | no PHI in reason echo unless already user-entered | keep form data |
| STATE_CONFLICT | invalid current state for requested operation | STATE_CONFLICT | refresh then retry if still allowed | "Claim state changed. Review latest status." | old/new category when visible | no raw row dump | refresh claim detail |
| VERSION_CONFLICT | stale expected version | VERSION_CONFLICT | refresh then retry | "ข้อมูลถูกเปลี่ยนแล้ว กรุณาตรวจสอบข้อมูลล่าสุด" | claim id, expected/current version if safe | no PHI | reload canonical read model |
| REPLAY | idempotent or conflicting external identity | REPLAY | equivalent replay no retry; conflict requires investigation | "Duplicate event detected." | source system and external id hash/reference | no payload PHI | show canonical result or block conflict |
| FINANCIAL_INTEGRITY | over-refund, currency mismatch, invalid amount | FINANCIAL_INTEGRITY | retry only after finance correction | "Payment amount cannot be accepted." | finance integrity event | no raw payment details beyond visible claim | block submit and refresh |
| TRANSPORT | network/timeout | TRANSPORT | safe retry allowed | "Connection issue. Please try again." | endpoint/category/status | no payload logging | retry button |
| UNKNOWN | unexpected sanitized database/app error | UNKNOWN | no blind retry for mutations | "ไม่สามารถดำเนินการได้ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ" | correlation id, stack server-side only | no raw SQL/PHI | stop mutation, keep screen stable |

Required Contract: Raw SQL errors, security internals, secrets, unrestricted metadata, and PHI must not be exposed to users.

## 8. Layer Responsibilities

| Layer | Owns | Must Not Own | Inputs | Outputs | Security Boundary |
| --- | --- | --- | --- | --- | --- |
| Generated database types | exact table/RPC/enums | business decisions or UI labels | Supabase generated schema | typed rows/RPC signatures | none by itself |
| Domain model | application naming and split-state DTOs | database authorization | generated types | read models and mutation DTOs | server-side validation where used |
| Repository/service | composing reads and invoking RPCs | protected direct writes | claim id, expected version, mutation input | canonical result or normalized error | server-side preferred |
| Server action/API boundary | auth session, confirmation checks, error normalization | database semantic changes | form/API input | safe action result | application trust boundary when used |
| Query integration | read fetch, refresh orchestration | speculative canonical state | filters and claim id | current read model/history | respects RLS/server auth |
| Mutation integration | one atomic RPC call per operation | client-side write chains | confirmed mutation payload | canonical RPC result | no direct protected updates |
| UI | display, user confirmation, disabled/empty/error states | authorization finality or state authority | read model/capabilities | user intent | UI hints only |
| Error mapping | normalized categories and copy | raw SQL exposure | sanitized errors | user-safe messages/log metadata | server-side logs |
| History/audit presentation | traceable timeline display | source-of-truth mutation | domain evidence rows | merged display timeline | read permission gated |

## 9. Authorization and Tenant Boundaries

Required Contract: Tenant, clinic, and actor authority must be server/database authoritative. Callers must not provide organization, clinic, role, actor, current status, current decision pointer, current payment summary, or new version as trusted mutation input.

Required Contract: Capability flags are UI hints only. Database authorization remains required for every authoritative mutation.

Required Contract: AI may recommend review, missing evidence, fraud/cost risks, or readiness actions. AI must not execute authoritative workflow transitions, payer decisions, payment settlement, appeal resolution, refunds, reversals, claim closure, or claim approval.

## 10. Consistency and Refresh Rules

Required Contract: Every mutation result is one atomic database result and should be used immediately to update the local detail view while still invalidating stale related reads.

| Mutation | Data Invalidated | Canonical Response Usage | Refresh Requirements |
| --- | --- | --- | --- |
| Workflow transition | claim snapshot, queues, workflow history, audit | replace workflow status/version/event id | detail + list/queue + workflow history |
| Claim decision | claim snapshot, decision history, queues, audit | replace decision status/version/current decision id | detail + decision history + list/queue |
| Payment settlement | claim snapshot, payment history, financial summaries, queues, audit | replace payment status/version/total paid | detail + payment history + list/queue |
| Submit appeal | claim snapshot, appeal history, workflow history when changed, audit | replace workflow status/version and add appeal summary | detail + appeal/workflow history |
| Resolve appeal | appeal history, claim snapshot version, audit | replace appeal status/version | detail + appeal history |
| Refund | claim snapshot, payment/refund history, financial summaries, queues, audit | replace payment status/version/refund/net fields | detail + payment/refund history + list/queue |

Recommendation: Do not define exact cache keys until affected consumers and current query conventions are inspected during implementation.

Required Contract: Client speculative state must never replace canonical split-state truth. Version-conflict recovery must refresh the read model before allowing another submit.

## 11. Legacy Compatibility

| Path | Current Behavior | Contract Conflict | Temporary Compatibility Rule | Retirement Condition | Priority |
| --- | --- | --- | --- | --- | --- |
| `features/payer-rules/components/payer-detail-page.tsx` | Mock `claimStatus` mixes Submitted, Pending Evidence, Under Review, Draft, Approved, Paid | collapses workflow, readiness, decision, and payment statuses | TEMPORARY ADAPTER; display/demo only, not authoritative | replace with split read model fields and separate filters | PRODUCTION-REQUIRED |
| `features/visit-list/types.ts` | `claimStatus` means Claim readiness status | name collides with legacy claim status but is readiness-only | SAFE TO RETAIN short-term if relabeled internally during integration | rename/adapter when real claim integration starts | DEFERRED BACKLOG |
| `features/visit-list/visit-list-page.tsx` | filter label "Claim status" filters readiness values | misleading UI label for Phase 4 claim state | TEMPORARY ADAPTER; must not drive claim workflow/decision/payment | rename to Claim Readiness or bind to readiness DTO | DEMO-CRITICAL if this route enters demo |
| `features/patient-claims/utils/patient-claims-utils.ts` | filters and KPI mapping use single `claimStatus` values | single status cannot represent Phase 4 canonical state | TEMPORARY ADAPTER; one-way map from split states only | replace filters/KPIs with split fields | PRODUCTION-REQUIRED |

Confirmed Finding: No inspected application file directly writes protected Phase 4 state.

Not Verified: A full active application inventory for all claim routes/services was not completed beyond exact-match consumers and direct dependencies.

## 12. Demo-Critical Scope

Required Contract: Demo scope may reduce breadth but must not reduce tenant isolation, authorization, protected-write controls, financial integrity, immutable evidence, or human accountability.

Demo-critical implementation allowlist for a later implementation task:

```text
Exact claim read model owner file: unresolved until existing patterns are inspected
Exact mutation integration owner file: unresolved until existing patterns are inspected
Exact UI consumer files: only confirmed affected files may be authorized by a separate implementation task
No migrations
No generated type edits
No SQL tests
No direct protected writes
```

Open Decision (BLOCKING): Exact implementation file ownership is unresolved for demo-critical integration. Minimum safe resolution is a separate implementation-scope task that inspects existing claim service/server action/query owners and records an exact file allowlist before coding.

## 13. Production-Required Scope

Required Contract: Production integration must provide split-state domain DTOs, read composition, controlled mutation calls, normalized error mapping, history/audit reads, capability hints, legacy adapter retirement, version-conflict UX, human confirmation, and test coverage for protected-write boundaries.

Recommendation: Production should include focused tests for read model mapping, mutation payload construction, normalized errors, stale-version recovery, and legacy adapter one-way behavior.

## 14. Deferred Backlog

Recommendation: Deferred backlog items include dedicated `claim_line_decisions`, full accounting ledger, multi-currency settlement, overpayment recovery, chargeback workflow, multi-level appeal automation, physical removal of legacy `claims.status`, broad reversal orchestration, and production deployment approval.

## 15. Existing and Proposed Files

### CONFIRMED EXISTING FILES

```text
docs/database/PHASE-4-VALIDATION-AND-CLOSURE-RECORD.md
docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md
docs/database/PHASE-4-CLAIM-MIGRATION-PLAN.md
lib/database.types.ts
features/payer-rules/components/payer-detail-page.tsx
features/visit-list/types.ts
features/visit-list/visit-list-page.tsx
features/patient-claims/utils/patient-claims-utils.ts
```

### PROPOSED NEW FILES

Open Decision (BLOCKING): No new implementation file is proposed by this contract because ownership is not verified.

### UNRESOLVED FILE OWNERSHIP

Open Decision (BLOCKING): The application owner for domain model, repository/service, server action/API boundary, query integration, mutation integration, and error mapping is unresolved.

## 16. Implementation Allowlist

Required Contract: This contract authorizes no implementation.

Required Contract: The exact Demo-critical implementation allowlist for a future task must be recorded before edits and must not use broad directory wildcards when exact files are known.

Current contract-task writable allowlist:

```text
docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md
```

## 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-READ-001 | Claim read model exposes `workflowStatus`, `decisionStatus`, and `paymentStatus` as separate canonical fields. |
| AC-READ-002 | Legacy `claims.status` and `claimStatus` adapters are explicitly non-authoritative. |
| AC-READ-003 | Unknown split states fail safely, remain observable, and disable authoritative mutation actions. |
| AC-MUT-001 | Workflow changes call `transition_claim_workflow` and do not directly update protected columns. |
| AC-MUT-002 | Decision changes call `record_claim_decision` and do not modify payment state. |
| AC-MUT-003 | Payment settlement calls `record_claim_payment_settlement` and does not modify workflow or decision state. |
| AC-MUT-004 | Appeal submit/resolve uses `submit_claim_appeal` or `resolve_claim_appeal` only. |
| AC-MUT-005 | Refunds use `record_claim_refund` and preserve original payment evidence. |
| AC-SEC-001 | Tenant, clinic, actor, role, and permission are never trusted from client-provided values. |
| AC-SEC-002 | Capability flags are UI hints and never replace database authorization. |
| AC-SEC-003 | AI cannot execute authoritative claim, decision, payment, appeal, refund, reversal, or closure actions. |
| AC-HIST-001 | Mutation success refreshes affected history/audit evidence. |
| AC-HIST-002 | Failed or unauthorized mutation does not create authoritative history evidence. |
| AC-LEGACY-001 | Single-status UI filters are one-way adapters from split state or readiness only. |
| AC-LEGACY-002 | Legacy adapters include explicit retirement conditions. |
| AC-TEST-001 | Required application tests pass in the later implementation task. |
| AC-DB-001 | Database semantics, migrations, SQL tests, and generated types remain unchanged unless separately authorized. |

## 18. Open Decisions

| Classification | Decision | Evidence | Affected Contract Area | Minimum Safe Resolution | Owner |
| --- | --- | --- | --- | --- | --- |
| BLOCKING | Exact application owner files for read model, mutation integration, and error mapping are unresolved. | No existing repository/service/server action owner was confirmed by exact-match inspection. | Demo-critical scope; Existing and Proposed Files; Implementation Allowlist | Inspect current app architecture and record exact future file allowlist before implementation. | Solution Architect / Backend Lead / Frontend Lead |
| BLOCKING | Approved caller boundary is not tied to a confirmed application implementation layer. | Database RPCs are confirmed; app boundary owner is not verified. | Controlled Mutation Contracts; Authorization | Select existing server action/API/repository boundary or record why direct authenticated RPC is approved and safe. | Security Reviewer / Backend Lead |
| NON-BLOCKING | Exact cache/query keys are not defined. | Current repository conventions for affected claim consumers were not confirmed. | Consistency and Refresh Rules | Define only after inspecting actual query integration in implementation task. | Frontend Lead / QA Lead |
| NON-BLOCKING | Full claim route inventory beyond exact-match consumers is incomplete. | Exact search found mock/readiness consumers and no protected writes, but not every possible route was manually read. | Legacy Compatibility | Perform broader implementation inventory before production integration. | QA Lead |

## 19. Stop Conditions

Required Contract: Implementation must stop when an RPC or return contract is unresolved, version ownership is unclear, trust boundary is contradictory, tenant or actor authority is unclear, status mapping requires a new business decision, database semantic changes are required, an unauthorized file is needed, a P0 security issue is found, generated types contradict the active database contract, or a direct protected write is required.

## 20. Approval Status

Contract Status: PROPOSED

Owner Approval: PENDING

Implementation Authorization: NO

Blocking Open Decisions: 2

Non-blocking Open Decisions: 2
