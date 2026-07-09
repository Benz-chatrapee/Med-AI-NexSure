# QA Workflows

## Requirement QA Review Workflow
- Trigger: New or changed requirement.
- Input: Requirement, roles, data, workflow, audit expectations.
- Steps: Check clarity, completeness, testability, traceability, priority, safety, feasibility, roles, and auditability.
- Output: QA review summary and gaps.
- Quality Gate: Requirement is testable and safe.
- Handoff: Product Owner or Business Analyst.

## User Story QA Review Workflow
- Trigger: Story enters refinement.
- Input: Story, personas, acceptance criteria, business rules.
- Steps: Validate INVEST quality, roles, permissions, data, edge cases, audit, and compliance.
- Output: Story QA notes.
- Quality Gate: Story can produce tests.
- Handoff: Product Owner.

## Acceptance Criteria Review Workflow
- Trigger: AC created or updated.
- Input: Acceptance criteria.
- Steps: Confirm observable outcomes, pass/fail criteria, negative cases, boundary cases, and audit expectations.
- Output: AC review.
- Quality Gate: Criteria are measurable.
- Handoff: Product Owner and BA.

## Test Case Generation Workflow
- Trigger: Approved story or feature.
- Input: Requirement, AC, roles, test data, risks.
- Steps: Create positive, negative, boundary, edge, role, audit, compliance, AI, healthcare, and insurance tests.
- Output: Test cases and scenarios.
- Quality Gate: Critical risks covered.
- Handoff: QA execution or automation.

## API Testing Workflow
- Trigger: API contract ready.
- Input: Endpoint contract, roles, schema, audit event.
- Steps: Test auth, validation, status codes, permission, tenant scope, error envelope, and audit.
- Output: API test matrix.
- Quality Gate: Unauthorized and invalid access fail safely.
- Handoff: Backend and QA.

## UI Testing Workflow
- Trigger: UI implementation ready.
- Input: Wireframe, AC, role matrix.
- Steps: Test rendering, validation, states, accessibility, permissions, workflow completion, and audit-triggering actions.
- Output: UI test matrix.
- Quality Gate: Critical paths pass by role.
- Handoff: Frontend.

## Database Testing Workflow
- Trigger: Schema or migration ready.
- Input: Schema, constraints, seed data.
- Steps: Verify constraints, relationships, indexes, soft delete/archive, timestamps, versioning, and data integrity.
- Output: Database test matrix.
- Quality Gate: Invalid data is rejected.
- Handoff: Database Agent.

## RLS Permission Testing Workflow
- Trigger: RLS policy added or changed.
- Input: Policy, roles, tenant model, sample users.
- Steps: Test allowed and denied access by role, organization, clinic, owner, and disabled status.
- Output: RLS matrix.
- Quality Gate: Deny-by-default holds.
- Handoff: Database and Security/Compliance.

## AI Output Evaluation Workflow
- Trigger: AI prompt, model, or output feature ready.
- Input: Prompt, evidence, output, expected constraints.
- Steps: Score groundedness, safety, clinical accuracy, claim relevance, explainability, compliance, confidence, and audit logging.
- Output: AI evaluation report.
- Quality Gate: No hallucination or final-authority claim.
- Handoff: AI Clinical, Insurance, Compliance.

## Clinical Safety Testing Workflow
- Trigger: Clinical workflow or AI clinical feature changes.
- Input: Clinical requirement, patient data rules, clinician review flow.
- Steps: Validate disclaimers, human review, contraindication warnings, allergies, unsafe outputs, and audit trail.
- Output: Clinical safety checklist.
- Quality Gate: Patient safety risk is blocked.
- Handoff: Clinical AI and Compliance.

## Claim Readiness Testing Workflow
- Trigger: Claim readiness or payer logic changes.
- Input: Scoring rules, evidence rules, payer rules, reviewer flow.
- Steps: Validate score, status, missing evidence, rule warnings, risk level, and human handoff.
- Output: Claim readiness test checklist.
- Quality Gate: No automatic unauthorized approval/rejection.
- Handoff: Insurance Agent.

## Evidence Package Testing Workflow
- Trigger: Evidence package generation changes.
- Input: Required documents, source records, export format.
- Steps: Validate included SOAP, diagnosis, ICD, prescriptions, medical certificate, attachments, claim summary, audit summary, and PDF export.
- Output: Evidence package checklist.
- Quality Gate: Package is complete and traceable.
- Handoff: Backend, Frontend, Audit.

## Regression Testing Workflow
- Trigger: Release candidate or high-risk change.
- Input: Change list and impacted areas.
- Steps: Select critical path tests, retest affected modules, verify defects, and record evidence.
- Output: Regression suite result.
- Quality Gate: No release blockers remain.
- Handoff: DevOps and Product Owner.

## UAT Support Workflow
- Trigger: Feature ready for business validation.
- Input: Role scenarios, business data, acceptance criteria.
- Steps: Prepare scripts, support execution, collect sign-off and issues.
- Output: UAT checklist and results.
- Quality Gate: Business-critical scenarios pass or have approved deferral.
- Handoff: Product Owner and Business Users.

## Release Sign-off Workflow
- Trigger: Release candidate ready.
- Input: Test results, defect list, regression, UAT, security, compliance, audit evidence.
- Steps: Review gates, risks, workarounds, unresolved defects, and sign-off criteria.
- Output: QA sign-off report.
- Quality Gate: Pass, Pass With Conditions, Needs Review, or Block Release.
- Handoff: Orchestrator, Product Owner, DevOps.

## Defect Triage Workflow
- Trigger: Defect found.
- Input: Defect evidence and reproduction steps.
- Steps: Classify severity, assign priority, identify owner, assess impact, recommend fix path, define retest scope.
- Output: Triaged defect report.
- Quality Gate: Critical and High defects have owners and timelines.
- Handoff: Responsible specialist agent.
