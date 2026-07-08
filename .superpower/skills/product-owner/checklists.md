# Product Owner Checklists

## Requirement Quality Checklist

- Clear business problem.
- Identified users and decision makers.
- Traceable source requirement.
- Testable outcome.
- MVP fit stated.
- Assumptions and missing information listed.
- Clinical, insurance, compliance, audit, security, and AI impacts assessed.

## Definition of Ready

- User story follows As a / I want / So that.
- Acceptance criteria use Given / When / Then.
- Dependencies are identified.
- Data, workflow, and review states are known.
- Compliance and audit requirements are understood.
- QA can write test scenarios without guessing.

## Definition of Done

- Requirement satisfied.
- Acceptance criteria passed.
- Product scope unchanged or approved.
- Human review preserved for clinical and claim-impacting outputs.
- Audit behavior verified.
- Documentation updated.
- Risks and limitations recorded.

## Epic Checklist

- Objective is clear.
- Business value is measurable.
- Success metrics are defined.
- Dependencies are listed.
- Risks are owned.
- Features are traceable to the epic.

## Feature Checklist

- Business goal is explicit.
- User value is clear.
- Functional scope is bounded.
- Constraints are documented.
- Priority is justified.
- Handoff owners are identified.

## User Story Checklist

- Role is specific.
- Capability is user-facing or business-relevant.
- Outcome is measurable.
- Story is small enough for sprint planning.
- Story does not prescribe implementation details owned by specialist agents.

## Sprint Planning Checklist

- Sprint goal supports release goal.
- Stories meet Definition of Ready.
- Dependencies are sequenced.
- Risks have owners.
- QA scenarios are known.
- Compliance and audit stories are included.

## Release Checklist

- Release scope is approved.
- Must Have items are complete.
- Known limitations are documented.
- Rollback or disablement plan exists.
- Compliance, security, QA, and documentation gates pass.

## Healthcare Checklist

- Patient safety reviewed.
- Clinical decision authority remains with clinician.
- SOAP, ICD, evidence, and clinical summary impacts assessed.
- AI confidence and explanation are visible where relevant.
- PDPA and privacy constraints considered.

## Insurance Checklist

- Claim decision authority remains with authorized reviewer.
- Coverage, benefit, waiting period, and medical necessity assumptions are explicit.
- Policy source uncertainty is visible.
- Claim readiness and evidence package expectations are testable.

## Compliance Checklist

- Important actions produce audit logs.
- Audit logs include timestamp, actor, reason, before, and after.
- No silent modification.
- Required review points are explicit.
- Regulatory assumptions are routed to Compliance.

## Security Checklist

- No secrets, passwords, PHI, PII, or PDPA protected data in examples or logs.
- Role-based access expectations are identified.
- Sensitive exports and evidence packages require access control.
- Logs are sanitized.

## AI Governance Checklist

- AI role is decision support only.
- Human authority is explicit.
- Confidence is required for AI recommendations.
- Explanation and source traceability are required where feasible.
- Low confidence routes to human or specialist review.
