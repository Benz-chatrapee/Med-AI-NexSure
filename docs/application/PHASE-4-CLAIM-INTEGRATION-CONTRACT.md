# Phase 4 Claim Integration Contract

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure |
| Document | Phase 4 Claim Integration Contract |
| File | `docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md` |
| Contract Status | APPROVED — INITIAL BATCH ONLY |
| Technical Integration Approval | APPROVED |
| Named Owner Sign-off | NOT RECORDED |
| Approval Date | 2026-07-23 |
| Implementation Gate | OPEN |
| Implementation Authorization | INITIAL BATCH ONLY |
| Authorized Initial Batch | Integration Batch A — Canonical Split-State Read Integration |

| Contract Task Type | APPLICATION CONTRACT DEFINITION AND READ-ONLY REPOSITORY ANALYSIS |
| Created Date | 2026-07-23 |
| Application Commit | `aaf31aab8a7535fc93ccc1ed54ecba0e607d2c8d` (recorded baseline; ZIP contains no `.git`) |
| Phase 4 Validated Target | `ab84c83fb781df4336d50964d93012df0af92fde` |
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

## 15. Scope Inventory Baseline

Confirmed Finding: Repository inventory traced each database capability to the current execution point, canonical owner, caller/consumer, and test owner where present. The uploaded inventory ZIP does not contain `.git`; commit and branch values therefore use the active contract and Phase 4 closure records rather than a fresh Git command.

```text
Application Commit: aaf31aab8a7535fc93ccc1ed54ecba0e607d2c8d
Phase 4 Validated Target: ab84c83fb781df4336d50964d93012df0af92fde
Branch: main
Writable Allowlist: docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md
```

Confirmed Finding: No application call to any Phase 4 controlled RPC was found. No direct application update to protected Claim state columns was found.

Confirmed Finding: Current Claim-facing application paths are mock-backed. The primary Demo surfaces are `features/claim-dashboard/**`, `features/patient-claims/**`, and `features/claim-readiness/**`.

## 16. Read Ownership Matrix

| Capability | Canonical Owner | Owner Role | Data Source | Boundary | Callers/Consumers | Gap | Demo | Confidence | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claim list/read worklist | `features/claim-dashboard/services/claim-dashboard-service.ts` | CANONICAL OWNER | `claimWorklistMock` | CLIENT | `features/claim-dashboard/hooks/use-claim-dashboard.ts` → dashboard component | EXTENSION REQUIRED | YES | HIGH | Service returns mock rows; hook calls it in a client component. |
| Patient Claim list | `features/patient-claims/services/patient-claims-service.ts` | CANONICAL OWNER | `patientClaimsDashboard` mock | MIXED | `app/patients/[patientId]/claims/page.tsx`; client workspace | EXTENSION REQUIRED | YES | HIGH | Server page loads dashboard; client workspace also imports service for detail/recalculation. |
| Claim detail | `features/patient-claims/services/patient-claims-service.ts` | CANONICAL OWNER | `patientClaimDetails` mock | CLIENT | `features/patient-claims/components/patient-claims-workspace.tsx` | BOUNDARY CONFLICT | YES | HIGH | Client component invokes `getClaimDetail`; a database-backed implementation cannot remain an unrestricted client service. |
| Claim readiness | `features/claim-readiness/server/service.ts` | CANONICAL OWNER | `features/claim-readiness/server/mock-repository.ts` | SERVER | readiness pages and `app/claim-readiness/actions.ts` | EXTENSION REQUIRED | YES | HIGH | Existing server-only service, identity, capability, audit, and action pattern is established. |
| Workflow history | Proposed `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | `claim_workflow_events` | SERVER | Claim detail page/workspace | OWNER MISSING | YES | HIGH | Database source exists; no current application query owner exists. |
| Audit timeline | `features/core-foundation/services/core-foundation-service.ts` for generic audit reads; proposed Claim composition owner below | COMPATIBILITY ADAPTER | `audit_logs` plus domain histories | SERVER | Claim detail timeline | EXTENSION REQUIRED | YES | MEDIUM | Generic audit service exists, but Claim-specific combined history composition does not. |
| Decision read | Proposed `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | `claims.current_decision_id`, `claim_decisions` | SERVER | Claim detail/workspace | OWNER MISSING | YES | HIGH | No application match for `claim_decisions` or `decision_status`. |
| Payment read | Proposed `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | `claims.payment_status`, `claim_payments` | SERVER | Claim detail/workspace | OWNER MISSING | YES | HIGH | No application match for payment settlement state. |
| Appeal read | Proposed `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | `claim_appeals` | SERVER | Claim detail/workspace | OWNER MISSING | NO | HIGH | Database source exists; no application owner exists. |
| Refund read | Proposed `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | refund rows in `claim_payments` and Claim totals | SERVER | Claim detail/workspace | OWNER MISSING | NO | HIGH | Database source exists; no application owner exists. |

Required Contract: `features/patient-claims/types/patient-claims.types.ts` becomes the canonical application read-model owner for the patient Claim surface, but its legacy `ClaimStatus` must be retained only as a temporary compatibility adapter. It must add explicit split-state fields and `version` before any controlled mutation UI is enabled.

Required Contract: `features/claim-dashboard/types/claim-dashboard.types.ts` remains the Claim worklist presentation owner, but `ClaimWorkflowStatus` must map from the generated workflow enum rather than remain an independent authoritative status vocabulary.

## 17. Mutation Ownership Matrix

| Operation | RPC | Database | Current Execution Point | Canonical Application Owner | Caller | Trust Boundary | Version Provider | Context Providers | Refresh Owner | Status | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workflow transition | `transition_claim_workflow` | AVAILABLE | None | Proposed `features/patient-claims/server/claim-command-service.ts` | Proposed `app/patients/[patientId]/claims/actions.ts` → workspace | SERVER BOUNDARY REQUIRED | Claim detail `version` | Server-authenticated actor; database-derived tenant/clinic | Server action revalidation + returned snapshot | RESOLVED | HIGH |
| Claim decision | `record_claim_decision` | AVAILABLE | None | Proposed `features/patient-claims/server/claim-command-service.ts` | Same server action owner | SERVER BOUNDARY REQUIRED | Claim detail `version` | Same | Claim detail, decision history, audit | RESOLVED | HIGH |
| Payment settlement | `record_claim_payment_settlement` | AVAILABLE | None | Proposed `features/patient-claims/server/claim-command-service.ts` | Trusted Finance/server integration through same action/service boundary | SERVER BOUNDARY REQUIRED | Claim detail `version` | Same; payer event identity server-validated | Claim detail, payment history, audit | RESOLVED | HIGH |
| Appeal submit/resolve | `submit_claim_appeal` / `resolve_claim_appeal` | AVAILABLE | None | Proposed `features/patient-claims/server/claim-command-service.ts` | Same server action owner | SERVER BOUNDARY REQUIRED | Claim detail `version` | Same | Claim detail, appeal history, workflow history, audit | RESOLVED | HIGH |
| Refund | `record_claim_refund` | AVAILABLE | None | Proposed `features/patient-claims/server/claim-command-service.ts` | Trusted Finance/server integration through same action/service boundary | SERVER BOUNDARY REQUIRED | Claim detail `version` | Same; original payment selected from authorized server read | Claim detail, payment/refund history, audit | RESOLVED | HIGH |

Required Contract: Although database grants may permit `authenticated` execution, the current repository has no approved browser Supabase mutation pattern and no safe client authority/context provider. All Demo-critical controlled mutations therefore use the established Next.js server boundary pattern: `app/**/actions.ts` → `features/**/server/service.ts` → database RPC.

Required Contract: Client input may supply business form values and the last-read `expectedVersion`; it must not be authoritative for actor ID, organization ID, clinic ID, role, permissions, source-system authority, or original payment ownership.

## 18. Layer and File Ownership

| Responsibility | Existing Owner | Proposed Owner | Status | Role | Callers | Tests | Demo | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical read model | `features/patient-claims/types/patient-claims.types.ts` | Same file | EXISTING FILE NEEDS EXTENSION | CANONICAL OWNER | patient page/workspace | `features/patient-claims/utils/patient-claims-utils.test.ts` plus proposed mapper test | YES | HIGH |
| Worklist presentation model | `features/claim-dashboard/types/claim-dashboard.types.ts` | Same file | EXISTING FILE NEEDS EXTENSION | COMPATIBILITY ADAPTER | dashboard hook/component | existing selector tests | YES | HIGH |
| Status presentation mapping | patient-claims constants/utils and claim-dashboard mock config | Same files | EXISTING FILE NEEDS EXTENSION | COMPATIBILITY ADAPTER | Claim UI | existing utility/selector tests | YES | HIGH |
| Claim query execution | Mock patient service | `features/patient-claims/server/claim-query-service.ts` | PROPOSED NEW FILE | CANONICAL OWNER | server page and actions | `features/patient-claims/server/claim-query-service.test.ts` | YES | HIGH |
| Database row → domain mapping | None | `features/patient-claims/server/claim-mappers.ts` | PROPOSED NEW FILE | CANONICAL OWNER | query service | `features/patient-claims/server/claim-mappers.test.ts` | YES | HIGH |
| Controlled command execution | None | `features/patient-claims/server/claim-command-service.ts` | PROPOSED NEW FILE | CANONICAL OWNER | server actions | `features/patient-claims/server/claim-command-service.test.ts` | YES | HIGH |
| Server transport boundary | Existing nearby pattern `app/claim-readiness/actions.ts` | `app/patients/[patientId]/claims/actions.ts` | PROPOSED NEW FILE | CANONICAL OWNER | patient Claim workspace | `app/patients/[patientId]/claims/actions.test.ts` if repository test tooling supports action tests | YES | HIGH |
| Error normalization | Existing Claim readiness error pattern | `features/patient-claims/server/claim-integration-errors.ts` | PROPOSED NEW FILE | CANONICAL OWNER | query/command service and actions | command/action tests | YES | HIGH |
| UI orchestration | `features/patient-claims/components/patient-claims-workspace.tsx` | Same file | EXISTING FILE NEEDS EXTENSION | CONSUMER | Patient Claim route | component test owner NOT VERIFIED | YES | HIGH |
| Initial route query | `app/patients/[patientId]/claims/page.tsx` | Same file | EXISTING FILE NEEDS EXTENSION | CALLER | query service | query service tests | YES | HIGH |
| Claim dashboard | `features/claim-dashboard/**` | Existing service/types/hook/component | EXISTING FILE NEEDS EXTENSION | CONSUMER / ADAPTER | dashboard route | selector tests | YES | HIGH |
| Post-mutation refresh | None for Claims | `app/patients/[patientId]/claims/actions.ts` | PROPOSED NEW FILE | CANONICAL OWNER | workspace | action/service tests | YES | HIGH |

### Confirmed Existing Files

```text
app/patients/[patientId]/claims/page.tsx
app/claim-readiness/actions.ts
features/patient-claims/components/patient-claims-workspace.tsx
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
features/claim-dashboard/components/claim-dashboard-page.tsx
features/claim-dashboard/hooks/use-claim-dashboard.ts
features/claim-dashboard/services/claim-dashboard-service.ts
features/claim-dashboard/types/claim-dashboard.types.ts
features/claim-dashboard/utils/claim-dashboard-selectors.test.ts
features/claim-readiness/server/service.ts
features/claim-readiness/server/identity.ts
features/claim-readiness/server/capabilities.ts
features/core-foundation/services/core-foundation-service.ts
lib/database.types.ts
lib/auth/supabase-browser.ts
```

### Proposed New Files

```text
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-command-service.ts
features/patient-claims/server/claim-command-service.test.ts
features/patient-claims/server/claim-integration-errors.ts
app/patients/[patientId]/claims/actions.ts
```

Recommendation: Do not create separate service trees for workflow, decision, payment, appeal, and refund. One Claim command owner preserves a single protected-write boundary while each exported operation remains independently typed and tested.

## 19. Ownership Conflicts and Unsafe Patterns

| Path | Capability | Pattern | Risk | Severity | Owner Impact | Required Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| `features/patient-claims/services/patient-claims-service.ts` | Claim list/detail/readiness | Mock service is imported by both server route and client workspace | A real DB implementation could accidentally expose server/database access to the browser | P1 | BOUNDARY CONFLICT | Retain as temporary mock adapter or retire after server query/actions own execution. |
| `features/patient-claims/types/patient-claims.types.ts` | Claim status | Single `ClaimStatus` collapses workflow, readiness, decision outcomes | Incorrect filters/actions and loss of Phase 4 semantics | P1 | LEGACY ASSUMPTION | Add split states; keep `claimStatus` display adapter only. |
| `features/claim-dashboard/types/claim-dashboard.types.ts` | Worklist status | Independent uppercase workflow vocabulary includes values not equal to canonical enum | Mapping drift and unsupported mutations | P1 | LEGACY ASSUMPTION | Explicit one-way presentation mapping from canonical workflow/readiness states. |
| `features/claim-dashboard/services/claim-dashboard-service.ts` | Claim worklist/actions | Mock-only operations are callable from client | False success and no audit/authorization | P1 | OWNER MISSING | Demo implementation must replace authoritative actions with server action → command service. |
| `features/claim-readiness/server/identity.ts` | Actor/tenant context | Hard-coded mock actor | Cannot be reused as production authority | P1 | CONTEXT GAP | Claim integration must resolve authenticated actor from the real server auth/session source; mock identity may remain Demo fixture only when explicitly gated. |
| `features/claim-readiness/server/audit.ts` | Audit | In-memory manual audit events | Not authoritative Phase 4 audit evidence | P2 | COMPATIBILITY ADAPTER | Claim mutations rely on database-created audit/history; UI only reads it. |
| `features/patient-claims/components/patient-claims-workspace.tsx` | Claim detail/recalculate | Client directly imports mock service | Prevents server-only query ownership and consistent refresh | P1 | CALLER BOUNDARY | Replace with initial server data and server actions. |

Confirmed Finding: No P0 issue was found in the inspected scope. No direct protected Claim write or privileged browser RPC exists today.

## 20. Implementation Batch Inventory

### Integration Batch A — Canonical Split-State Read Integration

- Objective: Replace mock Claim list/detail ownership for the patient Claim Demo surface with a server-owned, tenant-scoped canonical read model.
- Dependencies: Phase 4 generated types and validated database contract.
- Exact existing files: `app/patients/[patientId]/claims/page.tsx`, `features/patient-claims/components/patient-claims-workspace.tsx`, `features/patient-claims/services/patient-claims-service.ts`, `features/patient-claims/types/patient-claims.types.ts`, `features/patient-claims/constants/patient-claims.constants.ts`, `features/patient-claims/utils/patient-claims-utils.ts`, `features/patient-claims/utils/patient-claims-utils.test.ts`.
- Exact proposed files: `features/patient-claims/server/claim-query-service.ts`, `features/patient-claims/server/claim-query-service.test.ts`, `features/patient-claims/server/claim-mappers.ts`, `features/patient-claims/server/claim-mappers.test.ts`, `features/patient-claims/server/claim-integration-errors.ts`.
- Tests: mapper split-state/version tests; query tenant/clinic filter tests; legacy adapter tests; unknown-state safe failure tests.
- Acceptance: `INV-READ-01`, `INV-CTX-01`, no direct DB row coupling in UI, no authoritative legacy status.
- Exclusions: controlled writes, dashboard-wide migration, appeal/refund UI.
- Demo-critical: YES.

### Integration Batch B — Workflow Controlled Mutation

- Objective: Add the first protected Claim command boundary using `transition_claim_workflow`.
- Dependencies: Batch A read model supplies `version` and canonical Claim identity.
- Exact existing files: `features/patient-claims/components/patient-claims-workspace.tsx`, `app/patients/[patientId]/claims/page.tsx`.
- Exact proposed files: `features/patient-claims/server/claim-command-service.ts`, `features/patient-claims/server/claim-command-service.test.ts`, `app/patients/[patientId]/claims/actions.ts`.
- Tests: successful transition; invalid transition; stale version; unauthorized; cross-tenant/clinic; error normalization; refresh behavior.
- Acceptance: exact RPC only, server-owned actor/context, protected columns never directly updated, history refreshed.
- Exclusions: decision, payment, appeal, refund.
- Demo-critical: YES.

### Integration Batch C — Decision Controlled Mutation

- Objective: Extend the existing command owner with `record_claim_decision`.
- Dependencies: A and B.
- Exact existing files: command service, action file, workspace, read model/mapper/query files created in A/B.
- Exact proposed files: none.
- Tests: approved/partial/rejected paths, stale version, unauthorized, replay, decision/history refresh.
- Exclusions: payment and downstream financial mutation.
- Demo-critical: YES for reviewer Demo.

### Integration Batch D — Payment Settlement Controlled Mutation

- Objective: Extend the trusted command boundary with `record_claim_payment_settlement`.
- Dependencies: A–C and Finance capability/context resolution.
- Exact existing files: command service, action file, workspace, read/query files.
- Exact proposed files: none unless a dedicated trusted integration route is separately approved.
- Tests: settlement, idempotent replay, conflicting replay, over/invalid amount contract errors, stale version, authorization, refresh.
- Exclusions: refund, gateway integration, reconciliation redesign.
- Demo-critical: NO unless settlement is part of the judged Demo scenario.

### Integration Batch E — Appeal and Refund Controlled Mutations

- Objective: Extend the same command boundary with appeal submit/resolve and refund lifecycle calls.
- Dependencies: A–D; original payment and appeal reads available.
- Exact existing files: command service, action file, workspace, read/query files.
- Exact proposed files: none.
- Tests: appeal submit/resolve, refund partial/full, original-payment validation, over-refund rejection, replay, stale version, authorization, refresh.
- Exclusions: chargebacks, reversal automation, ledger redesign.
- Demo-critical: NO; production-required for complete Phase 4 application coverage.

## 21. Demo-Critical Allowlist

Required Contract: The exact Demo-critical implementation scope is limited to Integration Batches A–C and these paths:

```text
app/patients/[patientId]/claims/page.tsx
app/patients/[patientId]/claims/actions.ts
features/patient-claims/components/patient-claims-workspace.tsx
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-command-service.ts
features/patient-claims/server/claim-command-service.test.ts
features/patient-claims/server/claim-integration-errors.ts
```

Required Contract: Batch A should be approved and implemented separately from Batch B/C. This inventory does not authorize edits.

## 22. Production Scope

| Scope | Classification | Blocks Demo |
| --- | --- | --- |
| Payment settlement UI/integration | PRODUCTION-REQUIRED unless selected for Demo | NO |
| Appeal and refund UI/integration | PRODUCTION-REQUIRED | NO |
| Claim dashboard migration from mocks | PRODUCTION-REQUIRED; Demo enhancement | NO |
| Real authenticated actor/capability provider | PRODUCTION-REQUIRED; required before any non-fixture deployment | NO for explicitly isolated mock Demo, otherwise YES |
| Cache/query library introduction | DEFERRED BACKLOG; current repository has no confirmed TanStack Claim owner | NO |
| Removal of legacy status types | DEFERRED BACKLOG after consumers migrate | NO |
| Reference/config RLS advisories | SECURITY BACKLOG owned outside this application inventory | NO for Phase 4 closure; review before production |

## 23. Inventory Acceptance Criteria

```text
INV-OWN-01 — every Demo-critical responsibility has one canonical owner: SATISFIED
INV-READ-01 — every Demo-critical read path has an exact source and owner: SATISFIED
INV-MUT-01 — every Demo-critical mutation has an exact caller and trust boundary: SATISFIED
INV-CTX-01 — version, tenant, clinic, and actor providers are identified: SATISFIED; real auth implementation remains an implementation prerequisite
INV-FILE-01 — Demo implementation uses an exact file allowlist: SATISFIED
INV-DUP-01 — no unresolved duplicate authoritative owner remains: SATISFIED; mock adapters have explicit retirement/extension path
INV-TEST-01 — each implementation batch has an identified test owner and scope: SATISFIED
```

## 24. Remaining Decisions

| Decision | Blocking | Evidence | Minimum Safe Resolution |
| --- | --- | --- | --- |
| Exact real authenticated actor/session implementation used by Claim command service | NO for contract approval; YES before production implementation | Current inspected Claim readiness identity is mock-only; no Claim auth owner was found | Integration Batch A/B implementation must bind to the repository's actual server auth helper or stop. |
| Whether payment settlement is part of the judged Demo | NO | Current Demo scope is not explicit in inspected files | Product Owner selects before Batch D; does not block A–C. |
| Component-level test harness for patient Claim workspace | NO | Repository contains utility/service tests but no confirmed component test convention in uploaded scope | Use service/action tests; add component test only if project tooling supports it. |

Blocking Ownership Decisions: 0

Blocking Caller-Boundary Decisions: 0

## 25. Inventory Approval Gate

```text
Read Ownership: RESOLVED
Mutation Ownership: RESOLVED
Trust Boundaries: RESOLVED
Demo File Scope: COMPLETE
Inventory Status: COMPLETE
Inventory Approval Gate: SATISFIED
Ready for Contract Approval: YES
Owner Approval: PENDING
Implementation Authorization: NO
```

Required Contract: This inventory does not approve the contract and does not authorize application implementation.

## 26. Technical Integration Approval

### Approval Decision

```text
Decision: APPROVED
Record Action: UPDATED
Contract Status: APPROVED
Technical Integration Approval: APPROVED
Named Owner Sign-off: NOT RECORDED
Implementation Gate: OPEN
Implementation Authorization: INITIAL BATCH ONLY
Approval Date: 2026-07-23
Application Commit Reviewed: 48f2ec7
Phase 4 Validated Target: ab84c83fb781df4336d50964d93012df0af92fde
```

Required Contract: This is a technical integration approval only. It is not business, clinical, compliance, security-certification, release, production-deployment, or Phase 5 approval.

### Gate Results

```text
Contract Gate: PASS
Inventory Gate: PASS
Security Gate: PASS
Scope Gate: PASS
Initial Batch Gate: PASS
Blocking Open Decisions: 0
Blocking Ownership Decisions: 0
Blocking Caller-Boundary Decisions: 0
P0 Security Findings: 0
```

### Authorized Initial Scope

```text
Authorized Initial Batch: Integration Batch A — Canonical Split-State Read Integration
Authorized Scope Reference: Section 20, Integration Batch A
Approved File Allowlist Reference: Section 21, limited to Batch A files only
Acceptance Criteria Reference: Sections 20 and 23
```

Authorized existing files:

```text
app/patients/[patientId]/claims/page.tsx
features/patient-claims/components/patient-claims-workspace.tsx
features/patient-claims/services/patient-claims-service.ts
features/patient-claims/types/patient-claims.types.ts
features/patient-claims/constants/patient-claims.constants.ts
features/patient-claims/utils/patient-claims-utils.ts
features/patient-claims/utils/patient-claims-utils.test.ts
```

Authorized proposed files:

```text
features/patient-claims/server/claim-query-service.ts
features/patient-claims/server/claim-query-service.test.ts
features/patient-claims/server/claim-mappers.ts
features/patient-claims/server/claim-mappers.test.ts
features/patient-claims/server/claim-integration-errors.ts
```

Required test scope:

```text
canonical split-state mapping
tenant and clinic filtering
version propagation
legacy adapter one-way behavior
unknown-state safe failure
server-owned read execution
no UI coupling to authoritative database row status
```

Explicit exclusions:

```text
Integration Batches B–E
controlled mutations
application writes to protected Claim state
database migrations or SQL-test changes
generated database type changes
Phase 5
deployment or production release
```

Stop conditions:

- Stop if the active application state materially changes read ownership, generated types, database RPC signatures, tenant/actor authority, or the Batch A allowlist.
- Stop if the actual server authentication or tenant/clinic context provider cannot be traced during implementation.
- Stop if Batch A requires a file outside its approved allowlist or any database semantic change.

### Approval Evidence Set

```text
Contract Path: docs/application/PHASE-4-CLAIM-INTEGRATION-CONTRACT.md
Application Commit Reviewed: 48f2ec7
Phase 4 Validated Target: ab84c83fb781df4336d50964d93012df0af92fde
Inventory Gate Reference: Section 25
Authorized Initial Batch: Section 20, Integration Batch A
Approved File Allowlist Reference: Section 21, limited to Batch A
Acceptance Criteria Reference: Sections 20 and 23
```

### Approval Invalidation Rule

Approval review is required again when a later change affects database RPC signatures or grants, generated database types, read-model ownership, mutation callers or trust boundaries, version ownership, tenant or actor authority, authorized batch scope, approved file allowlist, required tests, acceptance criteria, or blocking-decision status. Documentation-only changes do not invalidate approval unless they change scope, meaning, authority, evidence ownership, or approval status.

### Remaining Non-blocking Items

| Item | Classification | Evidence | Future Review Point |
| --- | --- | --- | --- |
| Real authenticated actor/session binding | Production prerequisite | Section 24; no Claim-specific auth owner was confirmed in the inventory snapshot | Re-verify during Batch A/B implementation; stop before authoritative mutation work if unresolved |
| Payment settlement in judged Demo | Product scope decision | Section 24 | Decide before Integration Batch D |
| Component-level patient Claim test harness | Test-tooling decision | Section 24 | Revisit during UI implementation if repository tooling supports it |

Required Contract: Approval is idempotent for the same contract, reviewed application state, validated target, authorized initial batch, allowlist, and approval decision. An equivalent active approval requires no duplicate record.
