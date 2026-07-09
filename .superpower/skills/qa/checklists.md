# QA Checklists

## Functional QA
- Create works.
- Read works.
- Update works.
- Delete / archive works.
- Search works.
- Filter works.
- Sort works.
- Pagination works.
- Form validation covers required, invalid, boundary, and duplicate data.
- Error handling is clear and safe.
- Loading state appears.
- Empty state appears.
- Success state appears.
- Permission-based actions are hidden or blocked correctly.
- Data persists after refresh and navigation.
- Audit log is created for sensitive actions.

## UI QA
- Layout works on supported desktop and mobile viewports.
- Text fits containers.
- Buttons, menus, tabs, forms, dialogs, tables, and toasts behave consistently.
- Required states are visible.
- Error text avoids exposing sensitive data.
- Accessibility basics are present: labels, focus order, keyboard access, contrast.
- Role-specific actions are visible only when permitted.

## API QA
- Authentication is required where appropriate.
- Authorization checks role, organization, and clinic scope.
- Request validation rejects invalid data.
- Response schema matches contract.
- Error response is safe and actionable.
- Pagination, sorting, and filtering are deterministic.
- Sensitive fields are excluded unless required and authorized.
- Audit events are written for sensitive mutations.

## Database QA
- Tables, columns, constraints, indexes, and relationships support the requirement.
- Required fields, foreign keys, unique constraints, and enums are enforced.
- Soft delete/archive preserves auditability.
- Version history is retained where required.
- Supabase RLS policies prevent cross-organization and cross-clinic leakage.
- Seed and migration behavior is repeatable.

## RBAC QA
- Admin access is bounded by organization policy.
- Doctor access supports assigned clinical workflows.
- Nurse access supports delegated clinical workflows.
- Pharmacist access supports prescription-related workflows.
- Clinic Staff access supports non-clinical operational workflows.
- Clinic Admin / Manager access supports clinic operations.
- Claim Reviewer access supports claim review without clinical override.
- Auditor / Compliance access supports read and audit workflows.
- Executive access supports aggregate analytics without unnecessary PHI/PII.

## Security QA
- Authentication is enforced.
- Authorization is server-side.
- Organization scope is enforced.
- Clinic scope is enforced.
- Direct URL access cannot bypass permissions.
- API permission cannot be bypassed.
- Supabase RLS is enabled and tested.
- Sensitive data is not leaked in UI, API, logs, exports, or errors.
- Admin-only actions are protected.
- AI features require proper permission.

## Compliance QA
- PDPA consent is captured and respected.
- Audit logs include timestamp, actor, reason, before, and after.
- Version history is available for regulated records.
- Access history is recorded for sensitive views.
- AI output traceability links output to input evidence and prompt/version.
- Export logs are recorded.
- Evidence package actions are auditable.
- Soft delete/archive preserves records.
- User activity logs are available.
- Human review is required for clinical and insurance decisions.

## Audit Log QA
- Sensitive create/update/archive/export/access actions generate audit records.
- Audit records are immutable to non-authorized users.
- Before and after values are captured where appropriate.
- Actor, timestamp, reason, module, record ID, and organization scope are present.
- Audit records never expose secrets.

## AI Output QA
- Confidence level is present.
- Explanation is present.
- Supporting evidence from available input is cited.
- Missing evidence and uncertainty are visible.
- Human review reminder is present.
- Disclaimer is present where needed.
- Output does not diagnose, prescribe, approve claims, reject claims, invent facts, invent ICD codes, invent payer rules, or hide uncertainty.

## Regression QA
- Impacted modules are identified.
- Critical paths are retested.
- Role-specific workflows are retested.
- API contracts are retested.
- Database migration and RLS behavior are retested.
- AI output behavior is sampled where affected.
- Audit and compliance behavior is retested.

## UAT QA
- Business scenarios match real user roles.
- Acceptance criteria are mapped to scenarios.
- Test data avoids real PHI/PII unless approved and protected.
- Expected outcomes are business-readable.
- Sign-off criteria are explicit.

## Release QA
- Critical defects are closed.
- P1 defects are closed or have approved workaround.
- Security, compliance, audit, clinical safety, insurance scoring, and AI safety gates pass.
- Regression checklist is complete.
- UAT status is known.
- Release recommendation is documented.
