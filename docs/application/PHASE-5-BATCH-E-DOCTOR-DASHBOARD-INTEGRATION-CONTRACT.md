# PHASE 5 - BATCH E Doctor Dashboard Canonical Read Integration Contract

## 1. Document Control

| Field | Value |
|---|---|
| Product | Med AI NexSure - Enterprise Healthcare & Insurance Intelligence Platform |
| Phase / Batch | PHASE 5 - BATCH E |
| Contract Name | Doctor Dashboard Canonical Read Integration Contract |
| Target Route | `/dashboard` |
| Target Module | `features/doctor-dashboard` |
| Record State | APPROVED_CONTRACT |
| Contract Status | APPROVED |
| Implementation Status | IMPLEMENTED - REPOSITORY EVIDENCE FOUND |
| Implementation Authorization | YES |
| Scope Type | Approved canonical read integration contract |

This contract defines the minimum evidence-based implementation required to replace Doctor Dashboard mock production reads with authenticated, tenant-scoped, RLS/RBAC-protected Supabase reads while preserving current UI and domain semantics. This approval authorizes the reconciled Batch E canonical read implementation contract only; it does not close Batch E, authorize deployment, or approve deferred mutation paths.

## 1A. Reconciliation Status

Reconciliation performed against current repository evidence after recovery of this historical proposed-state contract.

| Reconciliation Field | Current Evidence-Based State |
|---|---|
| Reconciliation Status | APPROVED |
| Recovered Historical Contract State | READY_FOR_REVIEW / PROPOSED / NOT_STARTED / Implementation Authorization NO |
| Current Implementation Evidence | IMPLEMENTED - repository files now contain Batch E Doctor Dashboard canonical read implementation evidence |
| Approval Evidence | EXPLICIT PRODUCT OWNER APPROVAL RECORDED IN THIS CONTRACT |
| Closure Evidence | NOT FOUND for Batch E Doctor Dashboard |
| Implementation Authorization | YES |
| Governance Gap | RESOLVED FOR CONTRACT APPROVAL ONLY |
| Next Authorized Action | Create separate Batch E closure evidence only after required validation is completed and recorded; do not claim Batch E closed or deployment-authorized from this approval |

Reconciliation decision: implementation evidence exists, and the Product Owner has explicitly approved the reconciled Batch E Doctor Dashboard Canonical Read Integration Contract. Batch E is approved for canonical read integration only and remains not closed.

## 1B. E0 Prerequisite Status

Source: `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.

| E0 Requirement | Evidence Result |
|---|---|
| E0 CLOSED | CONFIRMED - Record State CLOSED and Closure Status CLOSED |
| E0 APPROVED | CONFIRMED - Contract Status APPROVED |
| E0 implementation COMPLETE | CONFIRMED - Implementation Status COMPLETE and Implementation Authorization COMPLETE |
| E0 validation PASS | CONFIRMED - Validation Status PASS; targeted E0 tests, TypeScript, lint, build, and diff whitespace PASS |
| Batch E authenticated server boundary prerequisite | SATISFIED |

E0 only satisfies the authenticated-server-boundary prerequisite. The E0 closure record explicitly states: "Do not implement Batch E from this closure record." It does not approve Batch E Doctor Dashboard implementation.

## 1C. Recovered Contract Provenance

The recovered contract text below preserved a proposed future-state contract. Its historical state was:

```text
Record State: READY_FOR_REVIEW
Contract Status: PROPOSED
Implementation Status: NOT_STARTED
Implementation Authorization: NO
```

Historical proposed-state evidence is retained for traceability. Current repository evidence now shows implementation files exist, so this reconciliation records the implementation evidence separately from approval and closure evidence.

## 1D. Current Implementation Evidence

Repository evidence found during reconciliation:

| Evidence Area | Current Repository Finding |
|---|---|
| Canonical read route | `app/dashboard/page.tsx` calls `getDoctorDashboard({})`, server actions `refreshDashboard`, `getVisitReadiness`, and `exportSummary`, and no longer imports `doctorDashboardMock`. |
| Authenticated server boundary | `lib/auth/supabase-server.ts` and `lib/auth/server-session-context.ts` exist as E0 server-only authenticated Supabase/session helpers; `features/doctor-dashboard/server/identity.ts` derives Doctor Dashboard actor context from `resolveServerSessionContext`. |
| Server read service | `features/doctor-dashboard/server/service.ts` validates filters, resolves actor, enforces read permission and clinic scope, appends audit event placeholder, reads canonical dashboard data, returns a typed success/error envelope, and emits safe errors. |
| Canonical repository read | `features/doctor-dashboard/server/repository.ts` reads authorized `organizations`, `clinics`, `user_profiles`, `visits`, `patients`, `visit_diagnoses`, `claim_readiness_assessments`, and `claim_readiness_items`, then maps them into the existing `DoctorDashboardData` shape. |
| Approved Batch E allowlist recoverability | The recovered contract's 17-file allowlist is recoverable in Section 13. Current implementation evidence includes files from that allowlist plus server support files listed as proposed in Section 12. No formal approval evidence for that allowlist was found. |
| Current files modified for Batch E | `app/dashboard/page.tsx`; `features/doctor-dashboard/components/doctor-dashboard-page.tsx`; `features/doctor-dashboard/hooks/use-doctor-dashboard-filters.ts`; `features/doctor-dashboard/services/doctor-dashboard-service.ts`; `features/doctor-dashboard/types/doctor-dashboard.types.ts`; `features/doctor-dashboard/utils/doctor-dashboard.utils.ts`; `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts`; `features/doctor-dashboard/domain/validation.ts`; `features/doctor-dashboard/domain/validation.test.ts`; `features/doctor-dashboard/server/audit.ts`; `features/doctor-dashboard/server/errors.ts`; `features/doctor-dashboard/server/identity.ts`; `features/doctor-dashboard/server/identity.test.ts`; `features/doctor-dashboard/server/rbac.ts`; `features/doctor-dashboard/server/repository.ts`; `features/doctor-dashboard/server/repository.test.ts`; `features/doctor-dashboard/server/service.ts`; `features/doctor-dashboard/server/service.test.ts`. |
| Automated test evidence | `features/doctor-dashboard/server/identity.test.ts`, `features/doctor-dashboard/server/service.test.ts`, `features/doctor-dashboard/server/repository.test.ts`, `features/doctor-dashboard/domain/validation.test.ts`, and existing `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts` exist as focused Vitest evidence. No Batch E closure record proving these tests passed was found. |
| Authenticated empty-state behavior | `buildDoctorDashboardProjection(...)` returns zero-state KPIs, empty visits, null selected visit, empty readiness trend, and empty missing evidence when the authorized canonical visit set is empty; repository tests assert no mock/demo fallback strings. |
| No synthetic visit/readiness state | Repository tests assert no `Dr. Ananda`, `NexSure Rama 9 Clinic`, `VIS-001`, `no-authorized-visits`, `unauthorized-visits`, synthetic zero readiness score, or default Not Ready status appears in zero/no-readiness projection. |
| Authorization / tenant / clinic boundaries | `identity.ts`, `rbac.ts`, and `service.ts` derive actor context server-side, require visit/dashboard plus claim read permission, reject unauthorized clinic filters before repository reads, and constrain repository reads by actor organization and authorized clinic ids. |
| Deferred mutations | `features/doctor-dashboard/services/doctor-dashboard-service.ts` throws deferred mutation errors for mutation-like methods; `features/doctor-dashboard/server/service.ts` sets `mutationAvailability` flags to false; UI evidence shows deferred/disabled mutation actions remain out of scope. |

## 1E. Validation Evidence

Recovered E0 closure validation is PASS and satisfies only the E0 prerequisite. Current Batch E implementation test files exist, but no inspected Batch E approval or closure record proves a formal Batch E validation pass.

Validation evidence found:

- E0 targeted tests, TypeScript, lint, build, and `git diff --check`: PASS in E0 closure record.
- Batch E test files: present in repository evidence.
- Batch E validation pass record: NOT FOUND.

## 1F. Approval Evidence

Explicit Product Owner approval is recorded for PHASE 5 - BATCH E.

Approval decision:

```text
Product Owner decision: APPROVE PHASE 5 BATCH E.
Record State: APPROVED_CONTRACT
Contract Status: APPROVED
Implementation Authorization: YES
Closure Status: NOT RECORDED
Deployment Authorization: NO
```

Approval basis verified from the current contract and repository evidence:

- E0 prerequisite is SATISFIED by `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md`.
- Reconciliation has been completed against current repository evidence.
- No unresolved blocking decision exists for canonical read integration approval.
- Batch E scope remains canonical read integration only.
- Deferred mutations remain out of scope and require a separate approved contract.
- Tenant and clinic authorization boundaries remain preserved.
- Empty Selected Visit defect evidence is accounted for through authenticated empty-state behavior.
- No synthetic visit/readiness state remains in the verified empty path.

The following remain not approval evidence by themselves:

- existence of implemented Batch E files;
- existence of Batch E test files;
- E0 closure and approval;
- recovered proposed-state contract text;
- allowlist text in this contract without explicit approval state.

Formal approval is now explicitly recorded in this contract. Batch E closure evidence remains not recorded.

## 1G. Unresolved Governance Gap

Batch E Doctor Dashboard implementation appeared present in the repository before this contract contained approval/authorization/closure evidence. Approval has now been explicitly recorded, while closure evidence remains separate and not recorded:

```text
Previous Record State: REVIEW_REQUIRED
Previous Contract Status: PROPOSED / RECONCILED
Implementation Status: IMPLEMENTED - REPOSITORY EVIDENCE FOUND
Previous Implementation Authorization: NO
New Record State: APPROVED_CONTRACT
New Contract Status: APPROVED
New Implementation Authorization: YES
Closure Status: NOT RECORDED
```

Next authorized action: create a separate Batch E closure record only after required validation is completed and recorded. Do not mark Batch E closed or deployment-authorized from this approval.

## 2. Objective

Replace production Doctor Dashboard read dependencies on `doctorDashboardMock` with canonical Supabase-backed read projections that:

- authenticate the current Supabase user;
- authorize through trusted organization, clinic, membership, role, permission, and RLS context;
- project only Dashboard records the actor may read;
- preserve current KPI, filtering, search, readiness drill-down, worklist, export, and Human Review semantics;
- preserve claim readiness as decision support only, not claim approval, denial, submission, coverage confirmation, or payment evidence.

## 3. Repository Evidence

Evidence priority used for this completion pass:

1. Approved contracts, ADRs, and closure records
2. Database migrations and generated database types
3. Existing server query/mutation services
4. Existing Supabase client/server adapters
5. Tests
6. Feature implementation
7. Mocks only as presentation evidence, never authority

Confirmed evidence:

| Evidence | Finding |
|---|---|
| `docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md` | Approved claim-domain decisions keep workflow, payer decision, payment settlement, readiness, and evidence status independent. Payment evidence is authoritative in payment-domain records; readiness and payer decision must not imply payment. |
| `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md` | Confirms controlled mutation boundaries for `transition_claim_workflow(...)`, `record_claim_decision(...)`, and `record_claim_payment(...)`; these are claim/payment workflow contracts, not Doctor Dashboard read authorization. |
| `docs/database/claim-readiness-model.md` | Confirms claim readiness is advisory. Existing sources are `claim_readiness_assessments`, `claim_readiness_items`, `organization_claim_settings`, `visits`, SOAP, diagnoses, prescriptions, evidence packages, audit logs, RLS helpers, `claim.view`, and `claim.review`. Recalculation idempotency, readiness overrides, immutable source-version references, payer-rule tables, and claim-case scope are future/planned. |
| `docs/database/visit-data-model.md` | Confirms the implemented encounter source is `visits`; product language may say encounter, but the repository contract uses visit. Existing visit fields include `visit_number`, `department`, `payer_name`, `visit_status`, `claim_status`, `risk_level`, `started_at`, and `attending_user_id`. |
| `docs/database/04-data-dictionary.md` | Confirms `visits` is the encounter record and includes `department` and nullable `payer_name`. |
| `docs/database/user-profile-spec.md` | Confirms `user_profiles`, `organization_memberships`, `clinic_memberships`, and `user_role_assignments` as identity, membership, and role context. |
| `docs/database/rls-policy-design.md` | Confirms RLS scope uses memberships and role assignments, with organization/clinic policies for organizations, clinics, user profiles, visits, and other sensitive tables. |
| `docs/database/erd-overview.md` | Confirms dashboards are derived reads from operational records and must preserve tenant filters. |
| `docs/database/core-foundation-permission-matrix.md` | Confirms browser flows must not use `service_role`; high-risk actions need distinct permissions; `claim.readiness.calculate` and `claim.readiness.override` are proposed/future high-risk permissions rather than general dashboard-read authority. |
| `docs/database/core-foundation-schema-review.md` | Confirms no browser service-role key was found in static scan and the Supabase browser adapter uses anon key. |
| `supabase/migrations/001_core_schema.sql` | Confirms `visits` has `organization_id`, `clinic_id`, `patient_id`, `visit_number`, required `department`, `attending_user_id`, nullable `payer_name`, `visit_status`, `claim_status`, `risk_level`, and `started_at`. |
| `supabase/migrations/005_tenant_identity_memberships.sql` | Confirms `organization_memberships` and `clinic_memberships` exist and tenant-safe membership rows are part of the canonical access model. |
| `supabase/migrations/008_core_foundation_auth_helpers_and_grants.sql` | Confirms database helpers for current profile, organization membership, clinic access, and `public.has_permission(text, uuid, uuid)`; RLS/RBAC remains authoritative. |
| `supabase/migrations/006_clinical_claim_settings_tables.sql` | Confirms `claim_readiness_assessments` and `claim_readiness_items`, score constraints, status thresholds, current flag, and six readiness dimensions. |
| `supabase/migrations/20260720082438_phase3_claim_review_decision.sql` | Confirms `claim_reviews.assigned_to`, `claim_reviews.due_at`, review status, findings, and response due dates exist for claim-review records. These do not approve Doctor Dashboard reviewer-assignment mutations. |
| `supabase/migrations/20260722140200_phase4_claim_workflow_events.sql` | Confirms claim workflow events are append-only workflow evidence and not a general Doctor Dashboard write target. |
| `supabase/migrations/20260722161000_phase4_claim_decision_mutation.sql` | Confirms `record_claim_decision(...)` is a controlled payer-decision mutation and does not mutate payment state or implement Doctor Dashboard readiness re-evaluation. |
| `supabase/migrations/20260720082444_phase3_claim_functions.sql` | Confirms legacy claim payment functions exist, but payment mutation and reconciliation are payment-domain operations. |
| `lib/database.types.ts` | Confirms generated types for `visits`, `claim_readiness_assessments`, `claim_readiness_items`, `claim_reviews`, `claim_workflow_events`, `claims.payment_status`, and claim payment tables. Generated types are evidence only and must not be modified in Batch E. |
| `lib/auth/supabase-browser.ts` | Existing browser Supabase client uses anon key only and generated `Database` types; it is not a service-role client. |
| Search for App Router cookie-aware Supabase server helper | RECONCILED: recovered proposed-state evidence did not confirm this helper. Current E0 evidence confirms `lib/auth/supabase-server.ts` and `lib/auth/server-session-context.ts`; Batch E authenticated-server-boundary prerequisite is SATISFIED. |
| `features/executive-dashboard/server/service.ts` and `features/executive-dashboard/server/rbac.ts` | Existing dashboard server pattern validates filters, resolves actor, checks permission and scope, appends audit events, returns a typed success/error envelope, and uses safe error messages. Its repository is still mock-backed, so it is a server boundary pattern only, not canonical data-read evidence. |
| `app/dashboard/page.tsx` | RECONCILED: recovered proposed-state evidence showed `/dashboard` importing `doctorDashboardMock`. Current repository evidence shows `/dashboard` now calls `getDoctorDashboard`, `refreshDashboard`, `getVisitReadiness`, and `exportDoctorDashboard` through server boundaries and does not import `doctorDashboardMock`. |
| `features/doctor-dashboard/components/doctor-dashboard-page.tsx` | The page is a client component. It owns interactive state and calls `doctorDashboardService` for refresh, visit readiness, re-evaluation, reviewer assignment, manual override, claim-review handoff, and CSV export. |
| `features/doctor-dashboard/services/doctor-dashboard-service.ts` | RECONCILED: recovered proposed-state evidence showed the service was mock-backed. Current repository evidence shows the browser-facing compatibility service now throws canonical read boundary errors and deferred mutation errors rather than reading `doctorDashboardMock`. |
| `features/doctor-dashboard/data/doctor-dashboard.mock.ts` | Mock values define field vocabulary, current UI labels, readiness thresholds, sample states, audit text, and synthetic doctor/clinic/patient/visit records. Mock data is presentation evidence only. |
| `features/doctor-dashboard/types/doctor-dashboard.types.ts` | Defines the current UI contract: `DoctorDashboardData`, `DoctorKpi`, `DoctorWorklistVisit`, `VisitReadinessDetail`, `ReadinessStatus`, `RiskLevel`, `PriorityLevel`, `VisitStatus`, filters, audit event, and export result. |
| `features/doctor-dashboard/hooks/use-doctor-dashboard-filters.ts` | Current filters are client-side, seeded from mock default filters, and use deferred global search. |
| `features/doctor-dashboard/utils/doctor-dashboard.utils.ts` | Current readiness thresholds are 60 and 85; readiness weights are 25/20/15/20/10/10; sorting is priority then pending minutes; search covers patient name, HN, visit id, payer, diagnosis code, and diagnosis label. |
| `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts` | Existing Doctor Dashboard utility tests cover readiness thresholds, worklist filtering/sorting, KPI filters, handoff guard, and manual override validation. They do not cover authenticated canonical read integration. |
| `package.json` | `lint` and `build` scripts exist. There is no `test` script and no `typecheck` script; `vitest` exists as a dev dependency. |

## 4. Evidence Decision Register

| Decision / Blocker | Classification | Evidence-Based Resolution |
|---|---|---|
| Existing Next.js App Router plus Supabase server authentication/session pattern | SATISFIED BY E0 | Recovered proposed-state evidence marked this blocked. E0 closure now confirms approved server auth helpers and the Batch E authenticated-server-boundary prerequisite is SATISFIED. |
| Canonical authenticated user/profile/organization/clinic context | CONFIRMED | Canonical context is server/database-derived from Supabase Auth identity plus `user_profiles`, `organization_memberships`, `clinic_memberships`, `user_role_assignments`, `organizations`, `clinics`, and RLS helper functions such as `public.has_permission(text, uuid, uuid)`. Client-provided tenant or clinic ids are filters only and cannot be trusted authority. |
| Canonical Visit/encounter source required by Doctor Dashboard | CONFIRMED | `visits` is the canonical implemented encounter source. Use `visits.id` and `visits.visit_number` for identity/display, tenant and clinic FKs for scope, `patient_id` for patient join, `attending_user_id` for provider join, and `visit_status`, `claim_status`, `risk_level`, `started_at`, `department`, and nullable `payer_name` for visit-row projection. |
| Canonical department source, if Doctor Dashboard requires it | CONFIRMED | `visits.department` is an existing required text field and is sufficient for Batch E read projection/filter labels. No normalized department table is approved for this contract. Department must not be used as an authorization boundary unless a future contract approves department-scope enforcement. |
| Canonical payer source, if required | CONFIRMED | For Doctor Dashboard visit rows, `visits.payer_name` is the confirmed nullable payer presentation source. Claim-domain objects also contain payer references/snapshots, but Batch E must not introduce payer-master or payer-rule authority. Missing payer displays as unavailable/unable to verify. |
| SLA source and authority | CONFIRMED / LIMITED | `claim_reviews.due_at` and `claim_review_findings.response_due_at` are confirmed claim-review due-date sources. They are authoritative only for existing authorized claim-review records. They are not a general Doctor Dashboard task SLA source; overdue KPI may read claim-review due dates only where a linked review exists, otherwise show empty/unavailable rather than deriving from mock priority. |
| Payment source and whether Doctor Dashboard should read payment | NOT REQUIRED | Payment source exists in claim payment tables and `claims.payment_status`, but Phase 4 evidence keeps payment independent from readiness and payer decision. Doctor Dashboard Batch E canonical read cutover must not add payment status or read payment unless a future dashboard/payment contract approves it. |
| Mutation boundaries: readiness re-evaluation, claim review handoff, reviewer assignment, manual override | DEFERRED | Current Doctor Dashboard mutation-like calls are mock-only. `transition_claim_workflow(...)` and `record_claim_decision(...)` are controlled claim-domain paths, not generic dashboard actions. Readiness recalculation idempotency and override workflow are future/planned. Claim-review records support assignment fields, but no approved Doctor Dashboard assignment/handoff mutation boundary was confirmed. All mutation actions remain display-only/disabled pending future contract unless an approved controlled mutation reuse is explicitly documented later. |
| Existing test patterns suitable for Doctor Dashboard canonical read integration | CONFIRMED / LIMITED | Doctor Dashboard has utility tests, and adjacent dashboard/domain tests show Vitest patterns. There are no existing Doctor Dashboard authenticated server-read integration tests. Future implementation must add focused tests inside the allowlist and may use explicit `npx vitest ...` validation unless a separate package-script change is approved. |

Blockers before the recovered proposed-state evidence pass: 8.

Blockers closed by recovered proposed-state repository evidence: 6.

Blockers remaining after current reconciliation and approval: 0 blocking decisions for canonical read integration approval.

Open decisions remaining after current reconciliation and approval: deferred mutation paths remain out of scope and require a separate future contract.

Remaining blockers:

None for Batch E canonical read integration approval.

Deferred decisions:

1. Doctor Dashboard mutation actions require a separate future approved contract unless an approved controlled mutation reuse is later documented.

## 5. Scope / Non-Goals

### Exact Scope

Approve the reconciled implementation contract for replacing Doctor Dashboard production reads with Supabase reads while preserving the existing UI data shape.

### Non-Goals

This contract does not authorize schema changes, migrations, new entities, RLS/RBAC policy changes, RPC signature changes, claim mutations, payment reads, generated type changes, package changes, auth redesign, Dashboard redesign, unrelated refactoring, closure, deployment, commit, push, or auto-approval beyond the explicit canonical read approval recorded here.

## 6. Canonical Read Projection

Dashboard projection must return the existing `DoctorDashboardData` shape unless a separately approved contract changes that type. Domain states must remain independent unless approved logic explicitly links them.

| UI Field | Canonical Source / Contract |
|---|---|
| `lastUpdated` | Server read timestamp; no mock fallback. |
| `filters.doctor` default | Current Supabase user joined to `user_profiles`; do not hardcode `Dr. Ananda`. |
| `filters.clinic` default | Authorized `clinic_memberships` + `clinics`; unauthorized clinic filters return safe forbidden/error. |
| `filters.department` default | `visits.department` from authorized rows; label/filter only, not auth boundary. |
| organization name/id | Server-derived trusted organization scope from memberships/profile/organizations. |
| clinic name/id | Server-derived authorized clinic ids; client selection is constrained to authorized clinics. |
| `kpis.today-visits.value` | Count authorized `visits` for the requested/business date. |
| `kpis.clinical-notes-pending.value` | Count only source-linked SOAP/documentation gaps where canonical SOAP completeness is available; otherwise show unavailable/empty. |
| `kpis.ready-human-review.value` | Current `claim_readiness_assessments` mapped from advisory readiness; never claim approval. |
| `kpis.high-risk-gaps.value` | `visits.risk_level` plus current readiness/evidence gaps where available. |
| `kpis.overdue-actions.value` | `claim_reviews.due_at` / `claim_review_findings.response_due_at` only for linked authorized claim-review records; otherwise unavailable/empty. |
| `kpis.avg-readiness-time.value` | `visits.started_at` plus `claim_readiness_assessments.calculated_at`. |
| workflow distribution | `visits.visit_status`, and where needed `visits.claim_status` / current readiness status through explicit mapping. |
| visit identity | Prefer `visits.visit_number` for display; retain `visits.id` for stable lookup/authorization. |
| patient display fields | `patients` through `visits.patient_id`, minimum necessary only. |
| `visits[].encounterType` | NOT REQUIRED for Batch E; no production mapping is approved. |
| readiness score/status | Current `claim_readiness_assessments.total_score`, `readiness_status`, and `review_status`; advisory only. |
| blocking gaps / breakdown | `claim_readiness_items` and evidence package gaps where available; no fabricated gaps or breakdown. |
| risk | `visits.risk_level`, with safe unknown handling. |
| priority / pending minutes | Claim-review priority/due/status timestamps when linked, or explicit documented domain validation only; do not synthesize from mock color/priority. |
| payer name | `visits.payer_name` nullable text as visit-level context, not payer-rule authority. |
| diagnosis code/label | `visit_diagnoses` and diagnosis/ICD sources; AI suggestions remain non-final. |
| next action / primary gap | Latest readiness items, evidence gaps, or claim-review findings when linked. |
| confidence | Only if present in approved readiness/AI source; otherwise empty/review-required. |
| score change | Previous and latest readiness assessment versions. |
| doctor / department | `visits.attending_user_id -> user_profiles`; `visits.department`. |
| sources | SOAP, diagnosis, payer-rule text references, cost, and evidence package source records where available; missing immutable source-version references must be shown as limited traceability, not fabricated. |
| audit trail/activity | Tenant-scoped `audit_logs`, safe metadata only. |
| readiness charts | Current/historical readiness assessments; empty chart state when no data. |
| missing evidence / heatmap | Readiness/evidence/risk sources only; empty state if unavailable. |
| payer decision | NOT REQUIRED for Batch E unless already present in an authorized claim projection; use neutral unable-to-verify labels. |
| payment status | NOT REQUIRED for Batch E; do not add payment reads or payment UI behavior. |

## 7. Auth / Authorization / Tenant Isolation

- The initial read must resolve the current Supabase user server-side.
- Unauthenticated users must not receive dashboard data.
- Browser-provided user ids, organization ids, clinic ids, memberships, roles, or permissions are not trusted.
- Current reconciliation confirms the App Router cookie-aware Supabase server client prerequisite through E0 closure evidence. Batch E approval remains separate and unproven.
- Server code must derive actor profile and scope from trusted rows: `user_profiles`, `organization_memberships`, `clinic_memberships`, `user_role_assignments`, `organizations`, and `clinics`.
- Required permission must include an approved dashboard/read capability, or existing approved domain read capability such as `visit.view` plus `claim.view` where the projection reads claim readiness.
- Tenant and clinic filters must be constrained to active memberships and RBAC.
- RLS remains enabled and authoritative. No service-role bypass, no policy weakening, and no unrestricted reads are authorized.
- Tenant scope cannot be selected arbitrarily by the client. Client-selected clinic filters are accepted only after server-side membership and permission checks.
- Projection must include only records visible to the actor under organization, clinic, role, permission, RLS, and care/assignment scope.
- Cross-organization and cross-clinic aggregation is prohibited unless the actor has explicit approved cross-clinic read authority and the server constrains it to authorized clinics.
- Sensitive fields are minimum necessary for the Doctor Dashboard UI.
- Audit and export events must avoid unnecessary PHI/PII.
- No service-role credential may be exposed to browser code.

## 8. Server-Client Boundary

| Concern | Contract |
|---|---|
| Initial authenticated read | `app/dashboard/page.tsx` must stop importing `doctorDashboardMock` and call an authenticated server-side Doctor Dashboard read path only after server auth helper approval. |
| Server service | New server-only Doctor Dashboard read service/repository may be added under `features/doctor-dashboard/server/` following the executive dashboard envelope/RBAC/error pattern. |
| Client component | `DoctorDashboardPage` remains the primary client component for interaction state and current layout. |
| Refresh read | Refresh must call the same canonical read path as the initial read, with validated filters and trusted actor scope. |
| Client filtering | Global Search, visible count, table filter chips, and lightweight in-memory filtering may remain client-side only over already authorized records. |
| Server/database filtering | Date range, organization, clinic, doctor/attending provider, authorization scope, and large-result limiting must be server/database filters. Client filters must not expand scope. |
| Error handling | Canonical read failure must return a safe error/empty state. It must not silently fall back to mock data. |
| Export | Export Summary must use the canonical authorized dashboard projection currently visible to the user, not mock data. |

## 9. Mock Exit Strategy

- Production `/dashboard` reads must stop depending on `doctorDashboardMock`.
- `doctorDashboardMock` may remain only as an explicit non-authoritative fixture for demo, story, or tests.
- Default demo values such as `NexSure Rama 9 Clinic`, `Internal Medicine`, and `Dr. Ananda` must not be hardcoded in production logic.
- Mock data may be used as synthetic validation data only.
- Canonical read errors must surface a safe failure/empty state; no mock fallback is allowed.

## 10. UI / Interaction And Mutation Contract

No Dashboard redesign is authorized. Preserve current layout, cards, charts, filters, worklist, review panel, messages, navigation, visual language, and bilingual safety guidance.

Batch E is a canonical READ integration. Mutation implementation is not authorized merely because the UI contains buttons.

| Interaction | Canonical Behavior |
|---|---|
| Today's Visits KPI | Clears client filters as current behavior does, but counts only authorized canonical visits. |
| Global Search | Searches only authorized loaded records across patient display name, HN, visit id, payer, diagnosis code, and diagnosis label. |
| Filters | Readiness, risk, visit status, priority, and gap filters preserve current UI labels and apply only to authorized records. Date/clinic/doctor scope must be server-constrained. |
| Refresh | Re-reads canonical data with current filters/scope and updates `lastUpdated`. |
| Readiness drill-down | Loads source-linked readiness detail for the selected authorized visit. Unauthorized visit ids must not disclose record existence. |
| Review | Read-only selection/read-drill in Batch E. |
| Open Visit Detail | Keeps route behavior `/visits/{visitId}/prescription` unless a separate approved route contract changes it. The target route must independently enforce authorization. |
| Re-evaluate | Display-only/disabled pending future contract. Current Doctor Dashboard implementation is mock-only; readiness recalculation idempotency is future/planned. |
| Assign Reviewer | Display-only/disabled pending future contract. `claim_reviews.assigned_to` exists, but no approved Doctor Dashboard assignment mutation path was confirmed. |
| Request Manual Override | Display-only/disabled pending future contract. Readiness override workflow is future/planned and requires distinct permission, reason, actor, timestamp, and audit. |
| Mark Ready for Human Review / Send to Claim Review Queue | Display-only/disabled pending future contract. Claim workflow and payer decision controlled functions are not generic dashboard handoff approval. |
| Export Summary | Exports canonical authorized projection with minimum necessary fields and an export audit event where an approved audit path exists. |

Mutation classification:

| Mutation Path | Classification | Contract Result |
|---|---|---|
| Readiness re-evaluation | Separate contract required | Existing Doctor Dashboard path is mock-only. Existing readiness model says recalculation idempotency is planned. Do not implement in Batch E. |
| Claim review handoff | Separate contract required | Controlled claim workflow exists, but no approved Doctor Dashboard handoff mapping was confirmed. Keep disabled/display-only in Batch E. |
| Reviewer assignment | Separate contract required | `claim_reviews.assigned_to` exists, but no approved application mutation boundary for Doctor Dashboard assignment was confirmed. |
| Manual override | Separate contract required | Future readiness override permission/model is proposed. Existing UI schema is form validation only and not a mutation authority. |

## 11. Confirmed Existing Files

These files exist and are relevant evidence:

- `app/dashboard/page.tsx`
- `features/doctor-dashboard/components/doctor-dashboard-page.tsx`
- `features/doctor-dashboard/services/doctor-dashboard-service.ts`
- `features/doctor-dashboard/data/doctor-dashboard.mock.ts`
- `features/doctor-dashboard/types/doctor-dashboard.types.ts`
- `features/doctor-dashboard/hooks/use-doctor-dashboard-filters.ts`
- `features/doctor-dashboard/utils/doctor-dashboard.utils.ts`
- `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts`
- `features/doctor-dashboard/schemas/manual-override.schema.ts`
- `lib/auth/supabase-browser.ts`
- `lib/database.types.ts`
- `features/executive-dashboard/server/service.ts`
- `features/executive-dashboard/server/rbac.ts`
- `docs/database/user-profile-spec.md`
- `docs/database/visit-data-model.md`
- `docs/database/rls-policy-design.md`
- `docs/database/erd-overview.md`
- `docs/database/04-data-dictionary.md`
- `docs/database/claim-readiness-model.md`
- `docs/database/core-foundation-permission-matrix.md`
- `docs/database/core-foundation-schema-review.md`
- `docs/database/PHASE-4-CLAIM-ARCHITECTURE-DECISIONS.md`
- `docs/database/PHASE-4-CLAIM-WORKFLOW-SPEC.md`
- `docs/database/audit-versioning-strategy.md`
- `supabase/migrations/001_core_schema.sql`
- `supabase/migrations/005_tenant_identity_memberships.sql`
- `supabase/migrations/006_clinical_claim_settings_tables.sql`
- `supabase/migrations/008_core_foundation_auth_helpers_and_grants.sql`
- `supabase/migrations/20260720082438_phase3_claim_review_decision.sql`
- `supabase/migrations/20260722140200_phase4_claim_workflow_events.sql`
- `supabase/migrations/20260722161000_phase4_claim_decision_mutation.sql`
- `supabase/migrations/20260720082444_phase3_claim_functions.sql`
- `package.json`

## 12. Proposed New Files

Future implementation may add only these files if approved review accepts this allowlist:

- `features/doctor-dashboard/server/service.ts`
- `features/doctor-dashboard/server/repository.ts`
- `features/doctor-dashboard/server/rbac.ts`
- `features/doctor-dashboard/server/errors.ts`
- `features/doctor-dashboard/server/audit.ts`
- `features/doctor-dashboard/server/identity.ts`
- `features/doctor-dashboard/domain/validation.ts`
- `features/doctor-dashboard/server/service.test.ts`
- `features/doctor-dashboard/server/repository.test.ts`
- `features/doctor-dashboard/domain/validation.test.ts`

## 13. Exact Implementation Allowlist

Future implementation may modify/create only this allowlist:

1. `app/dashboard/page.tsx`
2. `features/doctor-dashboard/components/doctor-dashboard-page.tsx`
3. `features/doctor-dashboard/services/doctor-dashboard-service.ts`
4. `features/doctor-dashboard/types/doctor-dashboard.types.ts`
5. `features/doctor-dashboard/hooks/use-doctor-dashboard-filters.ts`
6. `features/doctor-dashboard/utils/doctor-dashboard.utils.ts`
7. `features/doctor-dashboard/server/service.ts`
8. `features/doctor-dashboard/server/repository.ts`
9. `features/doctor-dashboard/server/rbac.ts`
10. `features/doctor-dashboard/server/errors.ts`
11. `features/doctor-dashboard/server/audit.ts`
12. `features/doctor-dashboard/server/identity.ts`
13. `features/doctor-dashboard/domain/validation.ts`
14. `features/doctor-dashboard/server/service.test.ts`
15. `features/doctor-dashboard/server/repository.test.ts`
16. `features/doctor-dashboard/domain/validation.test.ts`
17. `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts`

Allowlist count: 17.

Removed as speculative from prior 18-file allowlist:

- `features/doctor-dashboard/schemas/manual-override.schema.ts` because mutation implementation is deferred and existing schema is not required for canonical read cutover.

No files were added to the allowlist without repository evidence.

## 14. Prohibited Files

Future implementation must not modify:

- `supabase/**`
- `lib/database.types.ts`
- `package.json`
- package lock files
- `.env*`
- `.openai/**`
- `.codex/**`
- `.agents/**`
- `docs/application/*` except this contract during contract review
- approved contracts, ADRs, closure records, and validation reports
- unrelated `app/**` routes
- unrelated `features/**` modules
- generated types
- tests outside the exact allowlist

## 15. Remaining Open Decisions

These remain deferred decisions outside Batch E canonical read integration approval:

1. Mutation paths for readiness re-evaluation, claim review handoff, reviewer assignment, and manual override require a separate approved contract, or an explicit later finding that maps each action to an existing approved controlled mutation path.

Closed decisions:

- Explicit Batch E Doctor Dashboard approval is recorded in this contract.
- Canonical user/profile/organization/clinic context is confirmed.
- Canonical visit/encounter source is confirmed as `visits`.
- Canonical department source for Batch E read labels is confirmed as `visits.department`.
- Canonical payer source for Batch E visit rows is confirmed as `visits.payer_name`.
- SLA source is confirmed only for linked claim-review records through `claim_reviews.due_at` and `claim_review_findings.response_due_at`.
- Payment is confirmed as a separate payment-domain source and is not required for Batch E Doctor Dashboard canonical read cutover.
- Existing Doctor Dashboard utility tests and adjacent Vitest patterns are confirmed, but canonical read integration tests are still required.

## 16. Stop Conditions

Future implementation must stop and record a blocker if it requires:

- schema or migration changes;
- RLS/RBAC changes;
- RPC or mutation signature changes;
- generated type changes;
- unavailable canonical data for required UI fields;
- architecture redesign;
- files outside the exact allowlist;
- hardcoded demo values in production logic;
- mock fallback on canonical read failure;
- service-role credentials in browser code;
- weakening tenant or clinic isolation;
- client-selected arbitrary tenant or clinic scope;
- enabling Doctor Dashboard mutations without an approved mutation contract.

## 17. Required Validation

Future implementation validation must include:

```powershell
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Relevant existing tests:

- `features/doctor-dashboard/utils/doctor-dashboard.utils.test.ts` covers utility behavior and manual override validation only.
- Adjacent dashboard and domain tests may guide structure only; they are not Doctor Dashboard canonical read validation.
- `vitest` is installed, but `package.json` has no `test` script. Future implementation may run explicit `npx vitest <allowed test files>` unless a separate package-script change is approved.

Minimum new tests required:

- Authenticated tenant context: server identity resolver rejects unauthenticated users and derives profile, organization, clinic, role, and permissions server-side.
- Organization isolation: cross-organization filter/request returns a safe forbidden envelope and no data.
- Clinic isolation: unauthorized clinic filter/request returns a safe forbidden envelope and no data.
- Canonical read mapping: repository maps `visits`, `patients`, `user_profiles`, current `claim_readiness_assessments`, and `claim_readiness_items` into the existing `DoctorDashboardData` shape without mock fallback.
- Search/filter behavior: global search, readiness, risk, visit status, priority, and gap filters apply only to already authorized records.
- Empty state: no authorized visits returns empty KPIs/charts/worklist without mock fallback.
- Unauthorized state: unauthenticated, missing profile, inactive membership, insufficient permission, cross-tenant, and cross-clinic cases do not disclose record existence.
- Mock removal from production path: `/dashboard` and production refresh/export paths do not import or call `doctorDashboardMock`.
- Readiness status threshold boundaries: 59, 60, 84, 85, plus clamping 0 and 100.
- Worklist sorting preserves priority then pending-time order.
- Export Summary uses canonical projection and excludes unauthorized records.
- Human Review actions remain disabled/display-only unless approved mutation paths exist.
- Safe errors do not expose raw database errors or sensitive internals.

Manual verification for future UI implementation:

- `/dashboard` loads for an authorized doctor after approved server auth helper exists.
- Unauthorized/cross-clinic records are absent.
- Refresh updates canonical `lastUpdated`.
- Worklist filters, KPI filters, readiness drill-down, Open Visit Detail, and Export Summary preserve current semantics.
- Re-evaluate, Assign Reviewer, Manual Override, and Send to Claim Review remain disabled/display-only unless separately approved.
- Desktop, tablet, and mobile layouts remain unchanged except for authenticated data/error states.

## 18. Approval Gate

This contract is approved.

Current repository evidence shows implementation exists, and approval is now explicitly recorded by Product Owner decision. Batch E canonical read integration approval includes:

- the exact implementation allowlist;
- the E0-satisfied server Supabase auth-client pattern as the Batch E prerequisite;
- the reconciled canonical read scope only;
- preservation of tenant/clinic authorization boundaries;
- preservation of Empty Selected Visit defect evidence and verified no-synthetic empty path;
- continued deferral of mutation paths for Re-evaluate, Assign Reviewer, Manual Override, and Claim Review handoff;
- validation scope and test requirements.

Approval transition:

```text
From: REVIEW_REQUIRED / PROPOSED / RECONCILED / Implementation Authorization NO
To: APPROVED_CONTRACT / APPROVED / Implementation Authorization YES
Closure Status: NOT RECORDED
Deployment Authorization: NO
```

Recovered historical final contract state:

```text
Record State: READY_FOR_REVIEW
Contract Status: PROPOSED
Implementation Status: NOT_STARTED
Implementation Authorization: NO
```

Reconciled approval governance state:

```text
Record State: APPROVED_CONTRACT
Contract Status: APPROVED
Implementation Status: IMPLEMENTED - REPOSITORY EVIDENCE FOUND
Implementation Authorization: YES
Closure Status: NOT RECORDED
Next Authorized Action: CREATE SEPARATE BATCH E CLOSURE EVIDENCE AFTER REQUIRED VALIDATION
```
