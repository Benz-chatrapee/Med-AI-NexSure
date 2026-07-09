# QA Test Strategy

## Testing Objectives
- Validate Med AI NexSure MVP 1 workflows are safe, correct, auditable, role-aware, and release-ready.
- Protect patient safety, privacy, compliance, security, insurance decision-support integrity, and human review authority.

## Test Levels
- Unit Testing
- Integration Testing
- API Testing
- UI Component Testing
- End-to-End Testing
- Regression Testing
- UAT
- AI Evaluation
- Security / Permission Testing
- Compliance Testing

## Test Types
- Functional
- Negative
- Boundary
- Role-Based
- Data Validation
- Workflow
- Audit
- Performance Smoke
- Accessibility
- AI Safety
- Clinical Safety
- Insurance Rule Validation

## MVP 1 Critical Test Areas
- Login and role access
- Dashboard KPI correctness
- Patient creation and duplicate check
- Visit creation and status transition
- SOAP note save, edit, auto-save, version history
- AI clinical summary
- ICD suggestion
- Prescription safety warning
- Medical certificate generation
- Claim readiness score
- Evidence package generation
- Audit log creation
- User management permission control
- Prompt library add, edit, archive, search
- RLS permission enforcement

## Risk-Based Test Prioritization
Priority order: patient safety, clinical correctness, compliance, security, insurance rules, business value, performance, developer convenience.

## Test Data Strategy
- Use synthetic patient, visit, SOAP, diagnosis, medication, payer, claim, and user data only.
- Include valid, invalid, duplicate, missing, boundary, cross-clinic, cross-organization, disabled-user, and expired-consent records.
- Maintain golden datasets for AI prompts and claim readiness scoring.

## Traceability Strategy
Link tests to epic, feature, story, acceptance criteria, role, API, table, RLS policy, audit event, AI prompt version, and defect ID where applicable.

## Automation Strategy
- Automate stable API, permission, validation, regression, and critical E2E tests.
- Automate score calculation and RLS checks where practical.
- Keep AI evaluation partly deterministic through golden datasets and rubric scoring.

## Manual Testing Strategy
Use manual review for clinical safety judgment, AI explainability, UAT, visual defects, accessibility spot checks, and release sign-off risk assessment.

## Release Readiness Criteria
- Critical and P1 defects closed or formally approved with workaround.
- Security, RBAC, RLS, compliance, audit, AI safety, clinical safety, claim readiness, regression, and UAT gates complete.
- QA recommendation is explicit and evidence-backed.
