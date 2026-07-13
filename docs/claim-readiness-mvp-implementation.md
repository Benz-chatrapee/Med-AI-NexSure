# Executive Dashboard MVP 1 Implementation

## Orchestrator Summary

Executive Dashboard MVP 1 extends the existing Claim Readiness implementation into a synthetic, clinical-safe executive review workflow for claim readiness, evidence package readiness, and payer rule setting. It follows the approved design with a Next.js App Router UI, domain-owned scoring rules, server-side service coordination, mock identity/capability/audit adapters, synthetic repository data, and a documentation task mutation.

AI remains decision support only. The MVP does not call an AI model, approve claims, reject claims, submit claims, diagnose patients, prescribe medication, edit SOAP notes, finalize ICD coding, or modify claim records.

## Delivered Surface

- Executive Dashboard: `/claim-readiness`
- Encounter Readiness Detail: `/claim-readiness/[encounterId]`
- Executive KPIs for claim readiness, missing evidence, open tasks, evidence package completeness, and payer rule coverage
- Orchestrator Agent governance summary with structured specialist agent outputs
- Payer Rule Setting overview with status, strictness, required evidence, and human review requirement
- Evidence Package panel on encounter detail with required, linked, missing, and needs-review items
- Documentation task creation from an open readiness gap
- Balanced score and risk classification
- Score breakdown across evidence, SOAP, ICD, medical necessity, and payer risk
- Synthetic readiness gaps with severity, category, explanation, source, and suggested action
- Mock RBAC capability checks
- Audit-safe event adapter
- Loading, empty, not-found, and error states

## Specialist Coordination

The Orchestrator Agent coordinates all MVP outputs through the existing `claimReadinessService`. Every specialist output follows the required contract: Summary, Reasoning, Confidence, Deliverables, Risks, Recommendations, and Next Action.

### Business Analyst

- Confirmed MVP scope across claim readiness, evidence completeness, payer settings, audit, and dashboard metrics.
- Flagged that synthetic payer rules are not production policy representations.
- Recommended keeping score labels as readiness indicators, not approval decisions.

### Product Owner

- Prioritized executive visibility, review queues, and payer setting transparency for MVP 1.
- Confirm final labels for `Ready for Review`, `Needs Review`, `At Risk`, and `Blocked`.
- Confirm readiness score threshold acceptance for MVP demos.

### Solution Architect

- Preserve the feature boundary:
  - `features/claim-readiness/domain`
  - `features/claim-readiness/server`
  - `features/claim-readiness/components`
- Keep business rules outside UI components.
- Replace mock repository with Supabase repository behind the existing service boundary.

### Backend

- Maintain capability checks for dashboard and payer rule viewing.
- Keep dashboard audit events server-side.
- Add durable persistence for encounters, readiness results, gaps, tasks, and audit events.
- Convert server action failures into user-preserving form feedback.
- Add API endpoints if external consumers need REST access.

### Database

- Add Supabase tables and RLS policies for:
  - claim readiness results
  - evidence packages
  - evidence package items
  - payer rule settings
  - readiness gaps
  - documentation tasks
  - audit events
- Store source references instead of duplicating unnecessary PHI.

### Frontend

- Keep `/claim-readiness` as the first-screen executive dashboard.
- Display dense operational information for repeated review workflows.
- Extend filters to include task status, page size, sorting, and date ranges.
- Add field-level form errors for documentation task creation.
- Add accessible confirmation states after task creation.

### QA

- Validate scoring, risk classification, filtering, evidence package status, payer rule status, authorization, audit writes, and task creation.
- Confirm the UI never uses claim approval language.
- Confirm all test fixtures are synthetic and contain no real PHI/PII.

### Compliance Guard

- Review copy for decision-support wording.
- Verify audit metadata excludes clinical note bodies and raw sensitive text.
- Confirm human-in-the-loop boundary before any future claim submission workflow.

## Current Limitations

- Data is synthetic and in-memory.
- Server action errors currently surface through the route error boundary.
- Audit events are in-memory and intended as a contract stub.
- No Supabase migrations or RLS policies are included in this MVP slice.
- No automated test runner is configured in `package.json`.
- Payer rules are demo settings only and do not represent real payer policy.
- Evidence packages store synthetic source references only.

## Testing Notes

- Domain summary calculations are pure TypeScript functions.
- Current package scripts include lint and build, but no dedicated test runner.
- QA should manually review dashboard copy for human-in-the-loop wording until automated UI tests are introduced.

## Verification

Run:

```bash
npm run lint
npm run build
```
