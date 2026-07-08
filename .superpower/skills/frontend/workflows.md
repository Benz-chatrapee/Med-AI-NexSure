# Frontend Workflows

## Convert Requirement To UI

1. Confirm user role, workflow goal, and MVP boundary.
2. Identify route, page layout, components, actions, and permissions.
3. Map data dependencies and API states.
4. Define healthcare, insurance, compliance, audit, and AI safety UI.
5. Return a testable frontend specification.

## Convert User Story To Page Design

1. Parse actor, need, outcome, and acceptance criteria.
2. Identify primary task and secondary tasks.
3. Choose layout pattern.
4. Define state matrix and validation behavior.
5. Confirm accessibility and responsive behavior.

## Convert API Contract To UI Integration

1. Map endpoint fields to UI fields.
2. Identify loading, success, empty, validation error, authorization error, and system error states.
3. Define mutation feedback, optimistic behavior, and rollback needs.
4. Confirm no duplicated backend business logic in UI.

## Build Form Workflow

1. Define fields, defaults, permissions, and validation.
2. Specify React Hook Form and Zod schema behavior.
3. Define save draft, submit, cancel, retry, and confirmation paths.
4. Add audit reason capture for material changes.
5. Specify accessibility and error focus behavior.

## Build Dashboard Workflow

1. Define metrics, sources, thresholds, and owners.
2. Build KPI cards, filters, trends, and drilldowns.
3. Add empty and stale-data states.
4. Ensure clinical and claim metrics are explainable and non-final.

## Build Detail Page Workflow

1. Identify entity, route, header context, tabs, related records, and actions.
2. Choose the three-panel layout when patient/visit context, working area, and decision support must be visible together.
3. Add audit trail and permission visibility.
4. Define responsive collapse behavior.

## Build Claim Readiness UI Workflow

1. Show readiness score, risk, blockers, missing evidence, and payer warnings.
2. Separate documentation issues from policy uncertainty.
3. Provide reviewer actions and human decision boundary.
4. Capture audit events for override, dismissal, and package submission.

## Build Evidence Package UI Workflow

1. Group evidence by requirement, source, status, and confidence.
2. Show missing, stale, conflicting, and reviewer-required evidence.
3. Provide upload/link/request actions.
4. Maintain traceability to visit, note, document, claim, and audit event.

## Build AI Clinical Result UI Workflow

1. Label the AI task and decision-support boundary.
2. Show summary, explanation, confidence, evidence, uncertainty, and timestamp.
3. Provide accept suggestion, request review, edit documentation, dismiss, and feedback actions as appropriate.
4. Require human review for low confidence, high risk, or clinical ambiguity.

## Frontend Handoff Workflow

1. Return pages, components, states, validation, data dependencies, and audit events.
2. List assumptions, missing information, risks, and confidence.
3. Identify Backend, Database, QA, Compliance, Clinical AI, and Insurance AI follow-ups.
4. Provide next action for implementation or specialist review.
