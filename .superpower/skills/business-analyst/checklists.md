# Business Analyst Checklists

## Intake Checklist

- Request has a clear business objective.
- Primary users and decision makers are identified.
- Workflow and affected objects are identified.
- MVP fit is stated.
- Assumptions are explicit.
- Missing information is explicit.
- Clinical, insurance, compliance, security, and audit impacts are considered.

## Requirement Checklist

- Requirement is written from a user or stakeholder perspective.
- Business outcome is explicit.
- Acceptance criteria are observable and testable.
- AI behavior is explainable.
- Confidence is required when AI generates recommendations.
- Human review is preserved for clinical or claim-impacting outputs.
- No automatic diagnosis, prescribing, claim approval, or policy invention is
  allowed.

## Audit Checklist

- Important actions produce audit logs.
- Audit logs include timestamp, actor, reason, before state, and after state.
- Reviewer overrides are logged.
- AI-generated outputs are traceable.
- Logs are sanitized and do not expose PHI, PII, PDPA protected information, or
  secrets.

## Quality Gate Checklist

- Patient safety reviewed.
- Clinical correctness dependencies identified.
- Compliance requirements identified.
- Security and privacy risks identified.
- Insurance rule assumptions identified.
- Documentation needs identified.
- Downstream handoff is structured.
- Confidence level matches uncertainty.

## Confidence Checklist

- Use `high` only when the request is clear, in MVP scope, and does not depend on
  unresolved clinical, payer policy, coding, or compliance details.
- Use `medium` when the request is mostly clear but includes open workflow, role,
  data, or implementation questions.
- Use `low` when clinical facts, payer policy, ICD details, evidence rules, or
  compliance requirements are missing or ambiguous.
