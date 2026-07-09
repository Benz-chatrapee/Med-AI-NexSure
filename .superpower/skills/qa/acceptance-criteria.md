# Acceptance Criteria Guidance

## Principles

- Use Given / When / Then.
- Criteria must be testable.
- Include happy path.
- Include negative case.
- Include empty state.
- Include validation.
- Include permission/RBAC.
- Include audit log.
- Include edge case.
- For Insurance, include scoring, missing evidence, policy rule, risk, and human review.

## Insurance Example

```gherkin
Scenario: Claim readiness is Ready when all required evidence is complete
Given a completed visit with complete SOAP note
And diagnosis and ICD-10 are provided
And required prescription and medical certificate are available
And payer rules pass
When the user runs Claim Readiness assessment
Then the system should calculate a readiness score between 85 and 100
And the claim status should be Ready
And the score breakdown should be displayed
And an audit log should be created
```

## QA Review Rules

- Flag AC that cannot be tested with observable behavior.
- Flag AC that lacks actor, trigger, expected result, or audit expectation.
- Flag AC that lets AI approve/reject claims or make final clinical decisions.
- Recommend a concrete rewrite instead of silently changing the requirement.
