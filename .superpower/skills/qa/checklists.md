# QA Checklists

## Requirement Quality Checklist
| Criteria | Description | Status |
|---|---|---|
| Clear | Requirement is understandable | |
| Complete | Enough detail exists for design and testing | |
| Testable | QA can create test cases | |
| Traceable | Linked to epic, story, test, API, database, audit | |
| Prioritized | Has priority or MoSCoW value | |
| Safe | Does not introduce clinical/compliance risk | |
| Feasible | Can be implemented within MVP constraints | |
| Role-Aware | User role and permission are defined | |
| Auditable | Audit event expectations are defined | |

## Acceptance Criteria Checklist
- Criteria are observable and measurable.
- Positive, negative, boundary, and edge cases are included.
- Role and permission expectations are explicit.
- Audit event and version history expectations are explicit.
- AI, clinical, insurance, and compliance constraints are included when applicable.

## UI Checklist
- Correct layout, navigation, labels, validation, empty states, loading states, disabled states, error states, success states, and responsive behavior.
- Protected actions are hidden or disabled by role and still blocked server-side.

## API Checklist
- Method, route, auth, RBAC, validation, status codes, error envelope, pagination, filtering, sorting, idempotency, and audit events are verified.

## Database Checklist
- Tables, keys, constraints, indexes, enums, timestamps, soft delete/archive, versioning, referential integrity, and migration safety are verified.

## RLS / Permission Checklist
- Deny by default.
- Organization and clinic scope are enforced.
- Direct API and direct URL access are blocked when unauthorized.
- Admin, doctor, nurse, pharmacist, claim reviewer, auditor, executive, and disabled users are covered.

## Audit Log Checklist
- Sensitive action logs actor, timestamp, action, entity, reason, before, after, source, correlation ID, and outcome.
- Logs are immutable or append-only where required.
- Logs are sanitized and exclude secrets.

## Error Handling Checklist
- Validation, authorization, not found, conflict, dependency failure, AI unavailable, and system errors are distinguishable.
- Error messages are useful and non-sensitive.

## Empty State Checklist
- Empty screens explain the state without exposing hidden data.
- Primary action respects permissions.

## Loading State Checklist
- Loading states prevent duplicate submissions.
- Long-running AI, export, and evidence package jobs show progress or status.

## Validation Checklist
- Required fields, formats, enums, dates, ranges, duplicates, status transitions, tenant scope, and reason fields are validated.

## Accessibility Checklist
- Keyboard navigation, focus order, labels, contrast, table semantics, dialogs, alerts, and error association are checked.

## Security Checklist
- Authentication, authorization, RBAC, RLS, tenant scope, secret exposure, PHI/PII leakage, export access, and audit access are tested.

## Healthcare Workflow Checklist
- Patient identity, HN uniqueness, PDPA consent, visit lifecycle, SOAP completeness, diagnosis support, ICD review, prescription safety, allergy alerts, medical certificates, clinical summaries, disclaimers, human review, and audit trail are verified.

## Insurance Claim Workflow Checklist
- Claim readiness score, missing evidence, required documents, payer rules, coverage indicators, waiting periods, exclusions, benefit limits, diagnosis/ICD support, procedure support, cost thresholds, risk levels, reviewer handoff, and audit evidence are verified.

## AI Output Safety Checklist
- Output is grounded in evidence, includes confidence and explanation, avoids final medical or claim authority, includes disclaimer when needed, and is audit logged.

## Regression Checklist
- Impacted modules, roles, APIs, tables, RLS policies, audit events, AI prompts, dashboards, exports, and critical workflows are retested.

## Release Readiness Checklist
- No open Critical defects.
- No open P1 defects without approved workaround.
- Security, compliance, audit, RBAC/RLS, AI safety, clinical safety, claim readiness, regression, and UAT gates are complete.
