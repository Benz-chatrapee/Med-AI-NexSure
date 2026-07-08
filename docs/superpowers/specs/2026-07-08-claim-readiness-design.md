# Claim Readiness Module — Design Specification

## 1. Objective

Build the MVP for a Clinical-first Pre-Submission Claim Readiness Review module in Med AI nexSure. The module helps Doctor and Clinical Team users identify documentation gaps before a claim is submitted, reducing preventable rejection risk while preserving clinical safety, auditability, and human review.

The MVP focuses on a Patient Encounter Queue and Encounter Readiness Detail workflow. It uses a hybrid architecture: production-ready domain, service, and repository contracts backed by synthetic mock data first, with a clear path to a future Supabase-backed implementation.

## 2. Business Problem

Clinical documentation may be incomplete or misaligned with claim requirements when a claim is prepared. Missing evidence, incomplete SOAP notes, weak medical necessity justification, ICD mismatches, and payer-specific risk signals can cause avoidable claim delays, rework, rejection, and poor customer experience.

## 3. Business Goal and Success Metrics

### Goal

Give clinical users a clear pre-submission readiness view so documentation gaps can be addressed before the claim moves to submission or claim reviewer workflows.

### Expected Outcomes

- Fewer claims sent forward with obvious missing evidence.
- Faster clinical documentation correction before claim submission.
- Better traceability of why a documentation task was created.
- Safer handoff from clinical workflow to future claim reviewer workflow.

### MVP KPIs

- Average claim readiness score across queue.
- Count of blocked encounters.
- Missing evidence count.
- Open documentation task count.
- Percentage of at-risk encounters with at least one documentation task created.
- Time from gap detection to task creation.

## 4. MVP Scope

### Included

- Patient Encounter Queue for encounters nearing claim submission.
- Balanced readiness score and risk level.
- Score breakdown across evidence, SOAP, ICD, medical necessity, and payer rejection risk.
- Encounter Readiness Detail page.
- Gap list with severity, category, explanation, suggested action, and source/evidence context.
- Create Documentation Task from a readiness gap.
- Mock identity, capability, repository, and audit adapter contracts.
- Synthetic data only; no real PHI/PII.
- Server-side query parsing for search, filtering, sorting, and pagination.
- Loading, empty, no-result, error, and populated UI states.

### Deferred

- Real Supabase-backed tables, RLS policies, and migrations.
- Real payer submission.
- Claim approval or rejection workflow.
- Claim Reviewer Workbench.
- AI model calls and generated text drafting.
- Direct editing of SOAP notes, ICD codes, diagnosis, encounter, or claim records.
- Real PHI/PII usage.
- Export and bulk operations.

## 5. Primary Users and Stakeholders

### Primary User

Doctor / Clinical Team.

They use the module to see which encounters need documentation improvement before claim submission.

### Future Users

- Claim Reviewer.
- Insurance Officer.
- Compliance Officer.
- Clinic Admin.
- Executive Viewer.
- Auditor.

## 6. Approved Architecture

Use Next.js App Router, React, TypeScript, and Tailwind CSS. Reads should use Server Components. Mutations should use Server Actions with server-side identity, capability, tenant scope, validation, and audit checks.

```text
app/claim-readiness
        |
Server Component Pages
        |
Server Actions
        |
features/claim-readiness/server
        |
Claim Readiness Service
        |
Repository Interface
        |
Mock Repository now / Supabase Repository later
        |
features/claim-readiness/domain
```

### Module Boundaries

- `app/claim-readiness/page.tsx`: Patient Encounter Queue route.
- `app/claim-readiness/[encounterId]/page.tsx`: Encounter Readiness Detail route.
- `app/claim-readiness/actions.ts`: Server Actions for documentation task creation and future task updates.
- `features/claim-readiness/domain/`: Types, schemas, scoring rules, risk classification, query parsing, task validation, and pure business rules.
- `features/claim-readiness/server/`: Server-only service, repository interface, mock repository, identity adapter, capability adapter, and audit adapter.
- `features/claim-readiness/components/`: Queue, score summary, score breakdown, gap list, and documentation task UI components.
- `tests/claim-readiness/`: Unit, service, component, and future E2E coverage.

Business rules must live in domain and service layers rather than React components.

## 7. Data Flow

1. `app/claim-readiness/page.tsx` receives URL query params such as `q`, `risk`, `payer`, `department`, `taskStatus`, `page`, `pageSize`, and `sort`.
2. The route awaits `searchParams` because Next.js 16 route params and search params are promises.
3. The page calls `claimReadinessService.listEncounterReadiness()`.
4. The service resolves actor identity and capabilities through mock adapters.
5. The service enforces organization and clinic scope.
6. The repository returns synthetic encounter readiness records.
7. Domain rules calculate balanced score and risk level when needed.
8. The queue displays priority, score, risk, payer, missing evidence count, top gap, and action to review.
9. The detail route loads one encounter readiness record with gaps and existing documentation tasks.
10. A Server Action validates `createDocumentationTask` input, checks capability, creates the task through the service, appends a mock audit event, and revalidates affected routes.

## 8. Domain Model

### `ClaimReadinessEncounter`

Represents a synthetic encounter approaching claim submission.

Core fields:

- `id`
- `organizationId`
- `clinicId`
- `encounterCode`
- `patientLabel`
- `department`
- `primaryDoctorName`
- `payerName`
- `encounterDate`
- `claimDraftStatus`
- `readinessScore`
- `riskLevel`
- `missingEvidenceCount`
- `topGapSummary`
- `lastReviewedAt`
- `taskSummary`

### `ReadinessScore`

Contains total score and dimension scores.

Dimensions:

- `evidenceCompleteness`
- `soapCompleteness`
- `icdValidity`
- `medicalNecessity`
- `payerRejectionRisk`

### `ReadinessGap`

Represents one explainable gap or risk signal.

Core fields:

- `id`
- `encounterId`
- `category`
- `severity`
- `title`
- `explanation`
- `suggestedAction`
- `source`
- `relatedEvidence`
- `status`

### `DocumentationTask`

Represents a workflow task created from a readiness gap.

Core fields:

- `id`
- `organizationId`
- `clinicId`
- `encounterId`
- `gapId`
- `title`
- `category`
- `priority`
- `assignedRole`
- `reason`
- `status`
- `createdBy`
- `createdAt`
- `updatedBy`
- `updatedAt`

Creating a documentation task must not modify clinical or claim records.

### `ClaimReadinessAuditEvent`

Append-only safe metadata for important actions.

Core fields:

- `id`
- `organizationId`
- `clinicId`
- `actorId`
- `module`
- `action`
- `entityType`
- `entityId`
- `timestamp`
- `riskLevel`
- `metadata`
- `correlationId`

Audit metadata must avoid unnecessary PHI.

## 9. Scoring Rules

The MVP uses a Balanced Score. Scores are decision-support signals, not claim approval or rejection decisions.

| Dimension | Weight |
| --- | ---: |
| Evidence Completeness | 25% |
| SOAP Completeness | 25% |
| ICD Validity | 20% |
| Medical Necessity | 20% |
| Payer Rejection Risk | 10% |

### Risk Levels

| Risk Level | Score Range | Meaning |
| --- | ---: | --- |
| `ready` | 85-100 | Appears ready for next review step |
| `needs_review` | 70-84 | Minor gaps should be reviewed |
| `at_risk` | 50-69 | Meaningful documentation or payer risk exists |
| `blocked` | 0-49 | Major gaps should block claim progression until reviewed |

UI copy must avoid the word `Approved`. Use `Ready for Review` rather than `Approved`.

## 10. Routes and UI

### Patient Encounter Queue

Route: `/claim-readiness`

Primary purpose: help clinical users identify which encounters need documentation work before claim submission.

Key UI:

- Page title: `Claim Readiness`
- KPI row:
  - `Average Readiness`
  - `Blocked Encounters`
  - `Missing Evidence`
  - `Tasks Open`
- Filter bar:
  - Search by patient label or encounter code.
  - Risk level.
  - Payer.
  - Department.
  - Encounter date.
  - Task status.
- Main data view:
  - Encounter.
  - Synthetic patient label.
  - Doctor / department.
  - Payer.
  - Readiness score.
  - Risk level.
  - Missing evidence count.
  - Top gap.
  - Last reviewed.
  - `Review` action.

Required states:

- Loading skeleton.
- Empty queue.
- No search results with clear filters action.
- Recoverable error.
- Populated list.

### Encounter Readiness Detail

Route: `/claim-readiness/[encounterId]`

Primary purpose: explain why the encounter is or is not claim-ready and let users create documentation tasks from specific gaps.

Layout:

- Header with encounter summary, payer, status, and task action.
- Readiness summary with total score and risk level.
- Clinical-safe warning: `Readiness signals support review only and do not approve or reject claims.`
- Score breakdown by dimension.
- Gap panel with severity, category, explanation, suggested action, source, related evidence, and `Create Documentation Task`.
- Documentation Tasks panel showing open, in-progress, and resolved tasks.

### Create Documentation Task

Triggered from a specific gap.

Required fields:

- Task title.
- Gap category.
- Priority.
- Assigned role.
- Reason.

Thai helper text:

`งานนี้เป็นคำแนะนำเพื่อให้ทีมตรวจทานเอกสาร ไม่ใช่การแก้ไขเวชระเบียนอัตโนมัติ`

## 11. Security and RBAC

The MVP uses mock identity and capability adapters, but contracts must support real Supabase Auth and RBAC later.

Capabilities:

- `claimReadiness.view`
- `claimReadiness.review`
- `documentationTask.create`
- `documentationTask.update`
- `audit.view`

Every read and write must be scoped by:

- `organizationId`
- `clinicId`
- `actorId`
- `role`
- capability

Never trust actor IDs, role IDs, organization IDs, clinic IDs, task status, or permission flags supplied by the browser.

## 12. Compliance and Audit

Important actions append audit events:

- View readiness detail.
- Create documentation task.
- Change task status.
- Mark gap reviewed.
- Future export or copy of claim-related summaries.

Audit metadata should include:

- Action.
- Module.
- Entity type and ID.
- Organization and clinic scope.
- Actor.
- Timestamp.
- Risk level.
- Gap category.
- Before/after task status when applicable.
- Correlation ID.

Audit records must be append-only and must not contain unnecessary PHI.

## 13. AI Governance

The MVP does not call an AI model. Readiness explanations are rules-based or mock signals.

Future AI integration must:

- Store input source, output, confidence, explanation, risk, reviewer action, and timestamp.
- Require human review before use in clinical or claim workflows.
- Never submit claims.
- Never approve or reject claims.
- Never edit SOAP notes, ICD codes, diagnoses, encounters, claims, or clinical records.
- Use language such as `Suggested Action`, `Risk Signal`, and `Needs Review`.

## 14. Design Language

Use the Med AI nexSure enterprise UX direction:

- Calm, professional, trustworthy, intelligent, compliance-aware, clinically safe, and insurance-ready.
- English for navigation, titles, KPI labels, buttons, table headers, module names, and enterprise terms.
- Thai for concise helper text, warnings, empty states, operational explanations, and user guidance.
- Healthcare blue-first palette, high readability, restrained visual hierarchy, subtle shadows, and rounded surfaces.
- Dense but organized enterprise data views rather than marketing-style pages.
- No neon colors, playful styling, excessive animation, or low-contrast elements.
- Accessible focus, keyboard navigation, semantic HTML, accessible names, field error association, and `aria-live` where relevant.

## 15. Query Parameters

The queue uses URL query parameters as canonical state:

- `q`
- `risk`
- `payer`
- `department`
- `taskStatus`
- `page`
- `pageSize`
- `sort`
- `direction`

Defaults:

- Page 1.
- Bounded page size.
- Sort by risk priority and last reviewed date.
- Descending for priority views.

The service must whitelist sort fields and bound page size.

## 16. Error Handling

Expected domain error codes:

- `validation_error`
- `not_found`
- `forbidden`
- `tenant_scope_mismatch`
- `task_already_exists`
- `gap_resolved`
- `transient_failure`

User-facing errors must avoid internal stack traces, raw SQL errors, tokens, and sensitive data.

Documentation task forms must preserve user-entered values after expected validation errors.

## 17. Testing Strategy

### Unit Tests

- Balanced score calculation.
- Risk level classification.
- Query parsing, filtering, sorting, and pagination boundaries.
- Task creation validation.
- Permission checks.
- Gap severity ordering.
- Safe domain error mapping.

### Component Tests

- Queue populated, empty, no-result, loading, and error states.
- Score breakdown rendering.
- Gap list and task panel.
- Documentation task validation and error association.
- Clinical-safe warning visibility.

### Service Tests

- Service calls repository interface rather than hard-coded data access.
- Mock repository returns tenant-scoped synthetic data.
- No documentation task creation without capability.
- Task creation appends audit-safe metadata.
- Task creation does not mutate clinical record entities.

### Future E2E Tests

- Doctor opens queue.
- Filters blocked encounters.
- Opens detail.
- Creates documentation task from missing evidence gap.
- Sees task appear with audit-safe metadata.

## 18. Roadmap

### Phase 1: Discovery

Validate user workflow, score dimensions, and synthetic data shape.

Exit criteria: approved design spec.

### Phase 2: Domain and Service Contracts

Create types, schemas, scoring rules, repository interface, mock identity, mock capability, mock repository, and mock audit adapter.

Exit criteria: unit tests pass for scoring, query parsing, validation, and permissions.

### Phase 3: Queue UI

Build Patient Encounter Queue with KPIs, filters, states, and synthetic records.

Exit criteria: accessible queue renders populated, empty, no-result, loading, and error states.

### Phase 4: Detail UI and Task Creation

Build Encounter Readiness Detail, gap panels, score breakdown, task panel, and Server Action for task creation.

Exit criteria: task creation validates input, checks permissions, appends audit event, and revalidates routes.

### Phase 5: Verification and Documentation

Run focused tests, lint, and build. Document remaining Supabase migration needs.

Exit criteria: verification passes or skipped external checks are explicitly reported.

## 19. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation | Residual Risk |
| --- | --- | --- | --- | --- |
| Users treat readiness score as claim approval | Medium | High | Avoid approval language, show decision-support warning, require human review | Low |
| Mock repository diverges from future Supabase model | Medium | Medium | Define repository contracts and tenant fields now | Medium |
| Clinical users expect direct record editing | Medium | Medium | Position documentation tasks as workflow flags only | Low |
| Payer rejection risk appears too authoritative | Medium | High | Label payer checks as risk signals and show confidence/source | Medium |
| Sensitive data leaks into fixtures | Low | High | Use synthetic labels only and scan fixtures before commit | Low |
| Scope grows into Claim Reviewer Workbench | Medium | Medium | Keep reviewer workflow deferred and document phase boundary | Low |

## 20. Quality Gates

- Business Review: module targets preventable pre-submission rejection risk.
- Product Review: primary workflow is Doctor / Clinical Team using Patient Encounter Queue.
- Architecture Review: follows feature/domain/server/components boundaries.
- Security Review: capability and tenant contracts included.
- Compliance Review: audit-safe metadata and no real PHI.
- Clinical Safety Review: decision support only; no autonomous clinical or claim action.
- Insurance Review: readiness and rejection risk are visible but not final decisions.
- UX Review: all required states and warnings included.
- Testing Review: scoring, task validation, permission behavior, and rendering states covered.
- Deployment Readiness Review: future Supabase migration path documented.

## 21. Success Criteria

- Clinical users can identify at-risk encounters before claim submission.
- Balanced readiness score and breakdown explain why an encounter needs review.
- Users can create documentation tasks from specific gaps.
- No workflow edits clinical records, ICD codes, diagnoses, encounters, or claims automatically.
- No UI language implies claim approval or rejection.
- Synthetic data contains no real PHI/PII.
- Service and repository contracts can be replaced with Supabase-backed implementations without rewriting UI components.
