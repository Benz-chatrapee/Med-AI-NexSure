# PHASE 5 - BATCH F1 Doctor Dashboard Mutation Prerequisite Remediation Contract

## 1. Document Control

| Field | Value |
|---|---|
| Product | Med AI NexSure - Enterprise Healthcare & Insurance Intelligence Platform |
| Phase / Batch | PHASE 5 - BATCH F1 |
| Contract Name | Doctor Dashboard Mutation Prerequisite Remediation Contract |
| Parent Batch | PHASE 5 - BATCH F |
| Target Route | `/dashboard` |
| Target Module | `features/doctor-dashboard` |
| Scope Type | Evidence-based prerequisite remediation contract only |
| Record State | APPROVED_CONTRACT |
| Contract Status | APPROVED |
| Implementation Status | NOT_STARTED |
| Implementation Authorization | NO |
| Deployment Authorization | NO |

This contract defines the smallest prerequisite remediation required before any Doctor Dashboard controlled mutation implementation can be authorized. It does not implement, approve, deploy, migrate, seed, generate types, change RBAC/RLS/RPC/database objects, or modify application behavior.

Final contract state:

```text
record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_status: NOT_STARTED
implementation_authorization: NO
deployment_authorization: NO
```

## 2. Objective

Define the minimum evidence-based prerequisites that must be remediated before the future Doctor Dashboard mutation subset from Batch F can be authorized.

This F1 contract resolves only these Batch F blockers:

1. canonical claim id availability;
2. current canonical claim workflow state;
3. expected claim/workflow version;
4. server-side visit-to-claim mapping;
5. authorized organization and clinic mutation context;
6. Doctor Dashboard authenticated mutation server boundary;
7. reason-code input contract;
8. idempotency key / external event identity contract;
9. auditable mutation path.

F1 does not implement or authorize Mark / submit for human review, claim review handoff, readiness re-evaluation, reviewer assignment, or manual override.

## 3. Parent Batch F Dependency

Batch F dependency: `docs/application/PHASE-5-BATCH-F-DOCTOR-DASHBOARD-CONTROLLED-MUTATION-CONTRACT.md`.

Batch F states that claim workflow backend capability is supported through `public.transition_claim_workflow(...)`, but Doctor Dashboard implementation is blocked until prerequisite evidence exists for canonical claim context, server-side mapping, tenant context, mutation boundary, reason code, idempotency identity, and auditability.

F1 narrows Batch F to prerequisite remediation only. It does not reopen Batch E canonical reads and does not authorize Batch F mutation implementation.

## 4. Repository Evidence

| Evidence | Finding |
|---|---|
| `docs/application/PHASE-5-BATCH-F-DOCTOR-DASHBOARD-CONTROLLED-MUTATION-CONTRACT.md` | Parent contract classifies Mark / submit and claim review handoff as backend-supported through `transition_claim_workflow(...)` but blocked pending prerequisites. |
| `docs/application/PHASE-5-BATCH-E-DOCTOR-DASHBOARD-INTEGRATION-CONTRACT.md` | Batch E approved canonical read integration only and kept mutation paths disabled/display-only. |
| `docs/application/PHASE-5-BATCH-E-CLOSURE-RECORD.md` | Batch E is CLOSED / COMPLETE / PASS for canonical reads only. Mutation paths remain out of scope. |
| `docs/application/PHASE-5-BATCH-E0-SUPABASE-SERVER-AUTH-BOUNDARY-CONTRACT.md` | Reconciled E0 contract describes server-derived authenticated Supabase context, tenant scope, RBAC/RLS preservation, and safe unauthorized behavior. |
| `docs/application/PHASE-5-BATCH-E0-CLOSURE-RECORD.md` | E0 closure records authenticated Supabase App Router server boundary as CLOSED / COMPLETE / PASS. |
| `app/dashboard/page.tsx` | Existing dashboard route supports read/refresh/readiness/export server actions. No mutation server action evidence was found in inspected Batch F evidence. |
| `features/doctor-dashboard/types/doctor-dashboard.types.ts` | `DoctorWorklistVisit` exposes `id` as UI visit identity and readiness fields only. No canonical `claimId`, claim `workflowStatus`, claim `version`, or external event identity field exists. |
| `features/doctor-dashboard/server/repository.ts` | Reads `visits`, `patients`, `visit_diagnoses`, `claim_readiness_assessments`, and `claim_readiness_items`; projection maps `row.visitNumber || row.id` to worklist `id`. It does not read `claims` or project claim workflow context. |
| `features/doctor-dashboard/server/service.ts` | Enforces read validation, actor resolution, read permission, scope, safe errors, and sets all mutation availability flags to false. No mutation handler exists. |
| `features/doctor-dashboard/server/identity.ts` | Doctor Dashboard actor context is derived from `resolveServerSessionContext` and includes profile, organization, clinic, roles, and permissions. It does not expose an access token or mutation-specific claim context. |
| `features/doctor-dashboard/server/rbac.ts` | Read permissions include Doctor Dashboard/visit read and claim read. No Doctor Dashboard mutation permission check exists. |
| `features/doctor-dashboard/server/audit.ts` | `appendDoctorDashboardAuditEvent()` is a server-only no-op placeholder and is insufficient as a mutation audit path. |
| `features/patient-claims/server/claim-query-service.ts` | Existing claim query service reads `claims` including `visit_id`, `workflow_status`, and `version`, but through patient-claims context and demo default context. It is not a Doctor Dashboard visit-to-claim resolver. |
| `features/patient-claims/server/claim-workflow-command-service.ts` | Existing server-only command service validates claim workflow transition input and calls `transition_claim_workflow`. It requires authenticated access token context, but its default context is demo environment based. |
| `supabase/migrations/20260720082357_phase3_claim_core_tables.sql` and `lib/database.types.ts` | `claims` includes canonical claim id, `organization_id`, `clinic_id`, nullable `visit_id`, `workflow_status`, and `version`. Generated types confirm these fields. |
| `supabase/migrations/20260722160000_phase4_claim_workflow_mutation.sql` and generated function types | `transition_claim_workflow(...)` accepts `p_claim_id`, `p_target_status`, `p_expected_version`, reason fields, `p_external_event_id`, `p_correlation_id`, and writes canonical workflow event evidence. |
| `supabase/migrations/20260722140200_phase4_claim_workflow_events.sql` and generated types | `claim_workflow_events` stores organization, clinic, claim, source/target workflow status, claim version before/after, reason, correlation, and external event identity. |
| Existing RBAC/RLS evidence in migrations and docs | `public.has_permission(text, uuid, uuid)`, claim RLS/security tests, and direct protected-column restrictions exist for canonical claim workflow. F1 does not modify them. |

## 5. Prerequisite Inventory

| Prerequisite | Repository Evidence | Current State | Required Remediation | Status |
|---|---|---|---|---|
| Canonical claim id availability | `claims.id` and nullable `claims.visit_id` exist; Doctor Dashboard types/repository do not expose `claimId`. | Claim id exists globally but is absent from Doctor Dashboard projection. | Add server-derived canonical claim id to the authorized Doctor Dashboard mutation context only after implementation approval. | REMEDIATION_REQUIRED |
| Current canonical claim workflow state | `claims.workflow_status` exists and RPC returns workflow status; Doctor Dashboard does not read it. | Available globally, absent from Doctor Dashboard. | Server-read current claim workflow state for selected visit/claim before any mutation. | REMEDIATION_REQUIRED |
| Expected claim/workflow version | `claims.version` exists and RPC requires `p_expected_version`; Doctor Dashboard exposes readiness assessment version only. | Available globally, absent from Doctor Dashboard mutation context. | Server-read expected `claims.version`; do not use readiness version as workflow version. | REMEDIATION_REQUIRED |
| Server-side visit-to-claim mapping | `claims.visit_id` exists; Doctor Dashboard repository currently reads visits/readiness and not claims. | Mapping source exists globally, no approved Dashboard resolver exists. | Add server-side resolver from authorized canonical visit id to exactly one authorized claim where evidence supports it. | REMEDIATION_REQUIRED |
| Authorized organization and clinic mutation context | E0 and Doctor Dashboard identity/read service derive organization/clinic scope; RPC checks permission against claim tenant. | General context SATISFIED for reads; mutation-specific claim context not proven. | Reuse E0 actor context and verify mapped claim organization/clinic equals authorized Dashboard visit scope before RPC call. | REMEDIATION_REQUIRED |
| Doctor Dashboard authenticated mutation server boundary | E0 server auth exists; Doctor Dashboard has read/export server actions only; mutation availability is false. | No approved Dashboard mutation boundary found. | Define App Router server action/handler that derives actor and claim context server-side and calls approved command service/RPC. | REMEDIATION_REQUIRED |
| Reason-code input contract | RPC and command service require reason code; Doctor Dashboard UI/service has no workflow reason-code contract. | Backend requirement SATISFIED; Dashboard input contract NOT_FOUND. | Define allowed reason-code enum/source and required reason text rules per transition. | REMEDIATION_REQUIRED |
| Idempotency key / external event identity contract | RPC supports `p_external_event_id`; command service type currently has `correlationId` but no external event id field. | RPC capability SATISFIED; Dashboard/service contract incomplete. | Define server-created idempotency/external event identity and propagate it through command service/RPC. | REMEDIATION_REQUIRED |
| Auditable mutation path | RPC writes `claim_workflow_events`; Dashboard audit helper is no-op. | Canonical workflow event path exists; Dashboard audit path insufficient. | Require RPC event as canonical audit evidence and add/approve any Dashboard audit wrapper only through server-side audit path. | REMEDIATION_REQUIRED |

## 6. Canonical Claim Context Contract

The future implementation may authorize mutation only after the server derives this canonical claim context for the selected Dashboard visit:

| Field | Source Requirement | Status |
|---|---|---|
| `claimId` | `claims.id`, resolved server-side from authorized selected visit context. | REMEDIATION_REQUIRED |
| `claimOrganizationId` | `claims.organization_id`, must match authorized actor/visit organization. | REMEDIATION_REQUIRED |
| `claimClinicId` | `claims.clinic_id`, must match authorized actor/visit clinic. | REMEDIATION_REQUIRED |
| `claimVisitId` | `claims.visit_id`, must match the canonical selected visit id. | REMEDIATION_REQUIRED |
| `workflowStatus` | `claims.workflow_status`, not readiness status or visit status. | REMEDIATION_REQUIRED |
| `expectedVersion` | `claims.version`, not readiness assessment version. | REMEDIATION_REQUIRED |

Do not infer claim context from UI labels, readiness status, visit status, payer labels, patient name, visible visit number, or client-provided hidden fields.

## 7. Visit-to-Claim Mapping Contract

Required future remediation:

- resolve the selected Dashboard item to the canonical `visits.id` server-side;
- query only claims in the actor's authorized organization and clinic scope;
- require `claims.visit_id = visits.id`;
- require non-deleted claim rows;
- require exactly one eligible canonical claim for the mutation, or fail closed;
- if no claim or multiple eligible claims are found, return mutation unavailable without record-existence disclosure;
- never trust `DoctorWorklistVisit.id` alone, because current projection uses `visitNumber || id` for UI identity.

Current status: REMEDIATION_REQUIRED.

## 8. Authorization / Tenant Context

Satisfied evidence:

- E0 authenticated server boundary is CLOSED / COMPLETE / PASS.
- `resolveDoctorDashboardActor()` derives profile, organization, clinic, roles, and permissions from server session context.
- `transition_claim_workflow(...)` derives actor from `auth.uid()` and checks `public.has_permission(...)`.

Required future remediation:

- mutation must use a Dashboard server boundary, not browser database calls;
- mutation must derive actor, organization, clinic, and permission context server-side;
- mapped claim organization/clinic must match the selected authorized visit and actor scope;
- required permission must be `claim.review` or `claim.submit` according to the canonical transition;
- RLS and RPC authorization remain authoritative;
- no service-role or privileged browser credential path is authorized.

Current status: REMEDIATION_REQUIRED for mutation-specific context.

## 9. Server Mutation Boundary Contract

No Doctor Dashboard mutation server boundary is approved or implemented by F1.

The minimum future boundary must:

1. accept only selected visit intent, target action, reason input where required, and idempotency identity;
2. resolve authenticated actor through E0 server helpers;
3. re-read selected canonical visit and mapped claim server-side;
4. verify organization, clinic, RBAC permission, and RLS-preserved access;
5. reject unsupported workflow states and stale versions before or through the RPC;
6. call an approved canonical command path, preferably `transition_claim_workflow(...)` through a server-only wrapper;
7. perform read-after-mutation through Batch E canonical read projection;
8. return only safe, authorized Dashboard data and safe error envelopes.

Current status: REMEDIATION_REQUIRED.

## 10. Reason Code Contract

Repository evidence:

- `transition_claim_workflow(...)` requires `p_reason_code`.
- The RPC also requires reason text for transitions to `needs_review`, `appealed`, `closed`, `cancelled`, or from `needs_review`, `appealed`, `closed`.
- `features/patient-claims/server/claim-workflow-command-service.ts` validates non-empty `reasonCode`.
- No Doctor Dashboard reason-code enum, UI source, or validation contract for workflow mutation was found.

Required future remediation:

- define a small Doctor Dashboard workflow reason-code enum before implementation;
- require Thai user guidance for missing/invalid reason input;
- pass reason code/text only from validated server-side schema;
- do not reuse manual override outcome values as workflow reason codes unless separately approved;
- do not fabricate a default reason silently.

Current status: REMEDIATION_REQUIRED.

## 11. Idempotency Contract

Repository evidence:

- `transition_claim_workflow(...)` supports `p_external_event_id` and idempotent replay for matching event identity.
- `claim_workflow_events.external_event_id` and uniqueness evidence exist.
- Generated database function types include `p_external_event_id`.
- `features/patient-claims/server/claim-workflow-command-service.ts` currently exposes `correlationId` but not an `externalEventId` input field.

Required future remediation:

- define a Doctor Dashboard idempotency key / external event identity contract;
- generate or validate the identity server-side for each user intent;
- propagate the identity to `p_external_event_id` when invoking the RPC;
- return confirmed replay only when the RPC reports `idempotent_replay`;
- reject conflicts safely without duplicate mutation.

Current status: REMEDIATION_REQUIRED.

## 12. Audit Contract

Repository evidence:

- `transition_claim_workflow(...)` inserts `claim_workflow_events` with actor, tenant, claim, workflow state, version, reason, correlation, and timing metadata.
- `features/doctor-dashboard/server/audit.ts` is a no-op and is not sufficient for Dashboard-level mutation audit.

Minimum future audit requirement:

- canonical workflow event from RPC is required and is the primary audit evidence;
- Dashboard mutation wrapper must record or correlate actor, authorized tenant context, visit id, claim id, target action, reason, idempotency identity, result, and safe correlation id through an approved server-side audit path;
- no raw database errors, secrets, access tokens, or unnecessary PHI/PII may be logged or returned;
- failed and unauthorized attempts must be safely observable if an approved audit path exists.

Current status: REMEDIATION_REQUIRED.

## 13. Read-After-Mutation Dependency

Future implementation must re-read `/dashboard` through the Batch E canonical read path after any successful canonical mutation.

Current dependency status:

- Batch E canonical read integration: SATISFIED.
- Batch E read projection does not include claim workflow state/version: REMEDIATION_REQUIRED for mutation context and post-mutation UI result.

The UI must not fabricate success, workflow state, readiness change, reviewer assignment, claim submission, or audit result.

## 14. Error / Unauthorized Contract

Future implementation must fail closed for:

- unauthenticated session;
- expired or invalid session;
- missing profile;
- insufficient `claim.review` / `claim.submit` permission;
- unauthorized organization;
- unauthorized clinic;
- selected visit not found in authorized scope;
- no mapped canonical claim;
- multiple eligible mapped claims;
- uninitialized claim workflow state;
- unsupported transition;
- stale expected version;
- missing/invalid reason code or reason text;
- duplicate/idempotency conflict;
- upstream RPC rejection;
- safe audit failure where audit is required.

Errors must be safe, bilingual where user-facing helper text is needed, and must not disclose cross-tenant record existence, raw SQL/RLS details, secrets, access tokens, or sensitive patient/claim data.

## 15. Minimal Implementation Allowlist

F1 does not authorize implementation.

If a later approval authorizes prerequisite remediation, the smallest candidate allowlist is:

1. `app/dashboard/page.tsx`
2. `features/doctor-dashboard/types/doctor-dashboard.types.ts`
3. `features/doctor-dashboard/server/service.ts`
4. `features/doctor-dashboard/server/repository.ts`
5. `features/doctor-dashboard/server/rbac.ts`
6. `features/doctor-dashboard/server/audit.ts`
7. `features/doctor-dashboard/server/identity.ts`
8. `features/doctor-dashboard/domain/validation.ts`
9. `features/doctor-dashboard/server/service.test.ts`
10. `features/doctor-dashboard/server/repository.test.ts`
11. `features/doctor-dashboard/server/identity.test.ts`
12. `features/doctor-dashboard/domain/validation.test.ts`

Conditional reuse only, if separately approved:

- `features/patient-claims/server/claim-workflow-command-service.ts`
- `features/patient-claims/server/claim-workflow-command-service.test.ts`

Stop if implementation requires schema, migrations, generated types, RBAC/RLS/RPC changes, package changes, seeds, unrelated routes, or new database objects.

## 16. Forbidden Changes

F1 forbids:

- application code changes;
- tests changes;
- SQL, migrations, seeds, generated type changes;
- package or lockfile changes;
- existing contract or closure-record changes;
- RBAC/RLS/RPC/database-object changes;
- direct client/database mutation;
- service-role usage in browser code;
- mock mutation success paths;
- fabricated claim id, workflow state, version, reason, idempotency, or audit behavior;
- autonomous clinical, medication, claim, reviewer, readiness, override, or payment decisions.

During this F1 task, only this file may be modified:

- `docs/application/PHASE-5-BATCH-F1-DOCTOR-DASHBOARD-MUTATION-PREREQUISITE-CONTRACT.md`

## 17. Required Automated Tests

Future approved prerequisite remediation must include focused tests for:

- Dashboard mutation boundary rejects unauthenticated users;
- unauthorized role and missing `claim.review` / `claim.submit` are rejected;
- unauthorized organization and clinic are rejected without record-existence disclosure;
- selected visit resolves to canonical `visits.id` server-side;
- selected visit maps to exactly one authorized `claims` row;
- no mapped claim and multiple mapped claims fail closed;
- claim workflow state is read from `claims.workflow_status`;
- expected version is read from `claims.version`;
- readiness assessment version is not used as claim workflow version;
- reason code/text validation;
- idempotency key / external event identity propagation;
- stale version handling;
- safe RPC error mapping;
- canonical read-after-mutation dependency;
- audit/workflow event correlation;
- no service-role or raw token exposure;
- mutation availability remains disabled/unavailable until all prerequisites are satisfied.

No automated tests are implemented by F1.

## 18. Manual Verification Requirements

Future implementation must manually verify:

- authorized doctor sees only authorized dashboard visits;
- mutation controls remain unavailable when canonical claim context is missing;
- eligible visit maps to the expected canonical claim;
- workflow state/version shown or used by the server matches canonical claim state;
- invalid/stale/duplicate mutation attempts fail safely;
- successful future mutation persists after refresh through canonical read-after-mutation;
- browser network inspection shows no service-role key, secret, raw token, or direct table mutation;
- user-facing errors are safe and do not disclose cross-tenant records;
- Human-in-the-Loop review remains visible and authoritative.

No manual browser verification is performed by F1.

## 19. Acceptance Criteria

This F1 contract is acceptable when:

- every Batch F blocker is classified using repository evidence only;
- missing Doctor Dashboard claim context is not inferred;
- existing `transition_claim_workflow(...)` is reused as the canonical workflow capability;
- no new RPC/service/database object is proposed where the existing approved RPC is sufficient;
- direct client/database mutation remains forbidden;
- service-role browser usage remains forbidden;
- required remediation is limited to prerequisite context, validation, idempotency, audit, and server-boundary definition;
- Mark / submit, claim review handoff, readiness re-evaluation, reviewer assignment, and manual override remain unauthorized;
- implementation authorization remains `NO`;
- deployment authorization remains `NO`.

## 20. Blocking Issues

Blocking issues before Doctor Dashboard controlled mutation implementation authorization:

1. Doctor Dashboard projection does not expose canonical `claimId`.
2. Doctor Dashboard projection does not expose canonical `claims.workflow_status`.
3. Doctor Dashboard projection does not expose canonical `claims.version`.
4. Doctor Dashboard repository does not resolve selected visit to canonical claim.
5. Current UI worklist id may be visit number rather than canonical visit UUID.
6. Doctor Dashboard mutation-specific organization/clinic claim context is not yet proven.
7. No Doctor Dashboard mutation server action/handler is approved.
8. No Doctor Dashboard workflow reason-code input contract exists.
9. No Doctor Dashboard idempotency key / external event identity contract exists.
10. Patient-claims command service does not currently expose `externalEventId` despite RPC support.
11. Doctor Dashboard audit helper is a no-op and is insufficient for mutation audit.

## 21. Implementation Authorization

Implementation Authorization: NO.

F1 authorizes no implementation. A future implementation contract may only proceed after review explicitly approves:

- exact mutation subset;
- exact prerequisite remediation allowlist;
- server action interface;
- canonical visit-to-claim resolver;
- reason-code enum/source;
- idempotency/external event identity design;
- audit path;
- automated tests;
- manual verification plan.

## 22. Approval Gate

Approval Gate: APPROVED_CONTRACT.

F1 contract definition approved. Prerequisite remediation still requires separate implementation authorization.

Implementation authorization remains NO.

Deployment authorization remains NO.

```text
record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_status: NOT_STARTED
implementation_authorization: NO
deployment_authorization: NO
```
