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
# QA Checklists

## Requirement Quality Checklist

| Criteria | Description |
|---|---|
| Clear | อ่านแล้วเข้าใจตรงกัน |
| Complete | มีข้อมูลพอสำหรับออกแบบและพัฒนา |
| Testable | QA สามารถเขียน test case ได้ |
| Traceable | เชื่อมกับ Epic, Story, API, DB, Test ได้ |
| Prioritized | มี priority เช่น Must/Should/Could |
| Safe | ไม่ขัด clinical, insurance, compliance |
| Feasible | ทำได้ใน MVP หรือระบุ phase ชัดเจน |

## Functional QA Checklist
- Main happy path exists
- Alternative path exists
- Empty state defined
- Error state defined
- Loading state defined
- Validation rule defined
- Permission rule defined
- Audit log rule defined
- API contract defined
- Data persistence rule defined

## Insurance QA Checklist
- Claim Readiness score tested
- Score breakdown tested
- Ready status tested
- Needs Review status tested
- Not Ready status tested
- Missing Evidence tested
- Payer Rule tested
- Coverage Indicator tested
- Risk Level tested
- Human Review trigger tested
- Audit note tested

## Healthcare QA Checklist
- AI does not diagnose
- AI does not prescribe
- AI does not override clinicians
- Clinical summaries cite source data
- ICD suggestions require human review
- Prescription safety warnings are visible
- Clinical audit trail is created

## AI Output QA Checklist
- Output is grounded in source data
- Confidence is stated where appropriate
- Missing information is explicit
- No invented medical facts, ICD codes, payer rules, or evidence
- Human review is recommended for low confidence or high risk
- Explainability is included

## Compliance QA Checklist
- PDPA-aware data handling is documented
- Sensitive actions create audit logs
- Data minimization is applied
- Protected data is not exposed in logs or examples
- Compliance escalation is defined

## PDPA QA Checklist
- Synthetic data used in tests
- Consent/access assumptions documented
- Role and data-scope restrictions tested
- Export/download activity audited
- Protected identifiers minimized

## RBAC QA Checklist
- Authorized role can access intended workflow
- Unauthorized role is denied
- Cross-tenant or cross-clinic access is denied
- Denied access does not leak protected data
- Permission failures are audited

## API QA Checklist
- Request schema validated
- Response schema validated
- Role permissions validated
- Error responses are safe
- Idempotency/retry behavior considered where relevant
- Audit event emitted for sensitive action

## Database QA Checklist
- Required fields and constraints validated
- RLS policy tested
- Audit table/event persistence tested
- Soft delete/archive behavior tested where applicable
- Migration rollback risk identified

## Frontend QA Checklist
- Loading, empty, success, error, and permission states tested
- Forms validate required fields
- Tables and score displays match API data
- No sensitive data is exposed outside role scope
- Accessibility and responsive behavior are checked

## UAT QA Checklist
- User role and workflow are clear
- Acceptance criteria map to UAT scenarios
- Business reviewer is identified
- Pass/fail evidence is captured
- Open issues have severity and owner

## Regression QA Checklist
- Claim readiness score thresholds covered
- Evidence package covered
- Payer rule pass/review/fail/unknown covered
- Audit log covered
- RBAC/RLS covered
- AI output safety covered

---
