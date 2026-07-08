# Business Analyst Checklists

## Requirement Quality Checklist

- Clear: requirement is understandable by all stakeholders.
- Complete: requirement has enough detail for design and development.
- Testable: QA can create test cases from it.
- Traceable: requirement can link to epic, story, test, API, database, and audit log.
- Prioritized: requirement has MoSCoW or business priority for Product Owner review.
- Safe: requirement does not violate clinical, compliance, PDPA, OIC, or insurance governance rules.
- Feasible: requirement is practical for MVP delivery.
- Consistent: requirement does not conflict with other workflows or rules.
- Auditable: requirement supports audit trail and evidence review where needed.

## BRD Checklist

- Business problem and objective are stated.
- Scope and out-of-scope boundaries are explicit.
- Stakeholders and user roles are identified.
- Requirements are grouped by workflow or capability.
- Risks, assumptions, dependencies, and constraints are documented.
- Audit, compliance, privacy, and AI governance needs are included.

## User Story Checklist

- Story follows As a / I want / So that.
- Actor is specific.
- Outcome is business or user value.
- Story is small enough for delivery planning.
- Clinical or claim authority remains with a human.

## Acceptance Criteria Checklist

- Uses Given / When / Then.
- Covers success, empty, error, override, and low-confidence states.
- Includes audit behavior for important actions.
- Is measurable and QA-ready.
- Does not require invented medical facts, payer rules, or evidence.

## Workflow Checklist

- Trigger, actor, input, action, output, state change, exception, and audit event are defined.
- Current state and future state are separated.
- Human review points are visible.
- AI decision-support boundaries are explicit.
- Cross-module impacts are identified.

## Handoff Checklist

- Downstream owner is named.
- Each handoff contains only that agent's responsibility.
- Open questions and missing information are explicit.
- Confidence and risk level are included.
- No final specialist decision is made by the Business Analyst.

## MVP Readiness Checklist

- Requirement supports MVP scope.
- Business value is clear.
- Delivery risk is manageable.
- Safety and compliance controls are included.
- QA can validate the requirement.
- Product Owner can prioritize it.
