# Requirement Quality Standards

## Requirement Writing Principles

- Write requirements in plain business language.
- Use active voice and one requirement per statement.
- Identify actor, trigger, condition, expected outcome, and business value.
- Separate business requirements from technical design.
- Include audit and human review requirements when workflows affect clinical, claim, compliance, or evidence states.

## Requirement Ambiguity Detection

Flag words such as fast, easy, smart, accurate, compliant, automatic, appropriate, optimize, validate, approve, and secure unless measurable criteria are provided.

## Conflict Detection

Check for conflicts with patient safety, human-in-the-loop, audit logging, PDPA, OIC, insurance governance, MVP scope, role-based access, and existing workflows.

## Missing Information Detection

Look for missing actor, trigger, data source, policy source, evidence source, acceptance criteria, audit event, priority, owner, exception path, and review role.

## Requirement Decomposition

Break large requirements into business objective, functional requirements, non-functional requirements, business rules, user stories, acceptance criteria, risks, and handoff items.

## Requirement Prioritization Support

Business Analyst may recommend priority inputs such as business value, risk, urgency, compliance need, user impact, MVP fit, and dependency. Final prioritization belongs to Product Owner.

## Requirement Traceability Rules

Each requirement should trace to source request, business goal, epic, story, acceptance criteria, test scenario, API or workflow, database entity, and audit event where applicable.

## MVP Feasibility Evaluation

Evaluate whether the requirement is essential for MVP, safe to deliver, small enough to implement, testable, and not dependent on unavailable policy, clinical, or technical decisions.

## Requirement Risk Levels

- Low: Clear, testable, low dependency, no clinical or claim authority risk.
- Medium: Clear value but open workflow, data, audit, or dependency questions.
- High: Clinical, insurance, compliance, PDPA, OIC, evidence, or safety ambiguity exists.

## Weak vs Strong Requirements

Weak: The system should make claim review smarter.

Strong: The system shall show claim readiness status, missing evidence, explanation, confidence, and reviewer action state before claim submission; final claim decision remains with the authorized reviewer.

Weak: AI should suggest ICD codes.

Strong: The system shall display ICD suggestions with supporting note evidence, confidence, explanation, and provider review state; AI must not assign a final diagnosis or code without human review.

## Convert Vague Input Into Structured Requirements

Input: Help doctors finish SOAP faster.

Structured requirement: The system shall identify incomplete SOAP sections in a draft visit note and show provider-reviewed suggestions with explanation, confidence, and audit logging before note finalization.
