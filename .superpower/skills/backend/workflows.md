# Backend Workflows

## Convert Requirement To Backend Service

1. Identify domain, actor, entity, workflow, and MVP boundary.
2. Define service responsibility and data dependencies.
3. Define validation, permission, transaction, audit, and error behavior.
4. Identify clinical, insurance, compliance, and AI boundaries.
5. Return backend handoff with risks and confidence.

## Convert User Story To API Contract

1. Parse actor, goal, action, and acceptance criteria.
2. Choose Server Action or API route.
3. Define request schema, response envelope, and error codes.
4. Map service function, repository calls, permission guard, and audit event.
5. Provide frontend and QA integration notes.

## Build Validated Server Action

1. Authenticate actor.
2. Parse and validate input with Zod.
3. Check RBAC, tenant scope, and consent where needed.
4. Call domain service.
5. Write audit event for material mutation.
6. Return typed success or error envelope.

## Build CRUD Service

1. Define entity ownership and lifecycle.
2. Define create, read, update, archive, and restore rules.
3. Validate status transitions and concurrency.
4. Separate repository access from service decisions.
5. Add audit events and tests.

## Build Claim Readiness Calculation Workflow

1. Load claim, visit, SOAP, diagnosis/ICD, evidence, and payer-rule inputs.
2. Validate permission and claim scope.
3. Evaluate documentation completeness, ICD consistency, evidence completeness, payer warnings, and risk.
4. Return readiness score, blockers, uncertainty, and reviewer handoff.
5. Audit recalculation and material reviewer actions.

## Build Evidence Package Workflow

1. Identify claim, required evidence, source records, and reviewer context.
2. Assemble available evidence with traceable source references.
3. Detect missing, stale, conflicting, or restricted evidence.
4. Generate package version and export metadata.
5. Audit package creation, update, export, and reviewer handoff.

## Build Audit Log Workflow

1. Identify material action and audit requirement.
2. Capture actor, timestamp, entity, reason, before, after, source, correlation ID, and outcome.
3. Write audit event in the same transaction when integrity requires it.
4. Redact sensitive data according to role and policy.

## Build Permission-Protected Operation

1. Authenticate actor.
2. Load scoped entity minimally.
3. Check organization, clinic, role, permission, ownership, consent, and status.
4. Deny safely with stable error code.
5. Proceed only through domain service.

## Build AI Service Integration

1. Define AI task, input references, and allowed output.
2. Call adapter with sanitized and authorized inputs.
3. Validate output schema and confidence.
4. Store decision-support result with disclaimer and review status.
5. Require human review for clinical, claim, compliance, or low-confidence cases.

## Backend Handoff Workflow

1. Return service contracts, API/Server Action schemas, validation, RBAC, audit, transactions, errors, and tests.
2. List Database, Frontend, QA, Compliance, Clinical AI, and Insurance AI dependencies.
3. State assumptions, missing information, risks, confidence, and next action.
