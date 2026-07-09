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
# QA Workflows

## Requirement QA Workflow

1. Receive requirement/user story
2. Identify module and workflow
3. Check requirement quality
4. Check acceptance criteria
5. Check business rules
6. Check data rules
7. Check role/permission rules
8. Check error and edge cases
9. Identify test scenarios
10. Generate test cases
11. Identify blockers
12. Provide QA decision
13. Handoff to BA/PO/Frontend/Backend/Database

## Claim Readiness QA Workflow

1. Receive claim readiness requirement or output
2. Verify scoring components and weights total 100%
3. Verify status thresholds: Ready 85-100, Needs Review 60-84, Not Ready 0-59
4. Verify missing evidence, policy result, coverage indicator, risk, human review, and audit note
5. Generate tests for Ready, Needs Review, Not Ready, High Risk, and Critical cases
6. Block release for incorrect score, missing audit, or missing human review trigger

## Evidence Package QA Workflow

1. Identify required evidence by claim type and payer rule
2. Validate evidence statuses and severity
3. Test complete, missing, incomplete, expired, and not-required evidence
4. Verify protected-data minimization
5. Verify handoff to Evidence Package Agent and Claim Reviewer

## Policy Rule QA Workflow

1. Identify rule source and version
2. Test pass, review, fail, and unknown outcomes
3. Verify reason, action, severity, and audit note
4. Verify unknown/conflict outcomes require human review

## API QA Workflow

1. Review API contract and schemas
2. Test allowed roles and denied roles
3. Test valid, invalid, empty, and boundary payloads
4. Verify response body, status code, and audit behavior
5. Verify protected data is not leaked

## UI QA Workflow

1. Identify target page, role, and workflow
2. Test loading, empty, success, error, validation, and permission states
3. Verify score/status/risk/evidence displays
4. Verify reassessment and handoff actions
5. Verify audit feedback where visible

## UAT QA Workflow

1. Map business process to user scenarios
2. Confirm synthetic test data
3. Execute role-based acceptance scenarios
4. Capture pass/fail evidence
5. Record defects, blockers, and sign-off decision

## Regression QA Workflow

1. Identify changed module and impacted workflows
2. Select high-risk regression scenarios
3. Run claim, evidence, policy, audit, RBAC, and AI safety tests
4. Compare results against baseline
5. Report release recommendation

## Defect Triage Workflow

1. Receive defect evidence
2. Classify severity and priority
3. Identify impacted requirement, workflow, role, API, DB, audit, and compliance area
4. Recommend owner and retest scope
5. Block release when Critical or unresolved P1 risk exists

---
