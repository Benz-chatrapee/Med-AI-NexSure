# Insurance Frontend Rules

## Claim Readiness UI

- Show readiness score, blocking issues, warnings, missing evidence, and reviewer next actions.
- Make clear that readiness is not claim approval.

## Evidence Checklist UI

- Organize evidence by claim requirement, document source, status, and freshness.
- Provide upload, link, request, mark reviewed, and escalate actions based on permissions.

## Missing Evidence UI

- Explain what is missing, why it matters, source requirement, owner, and next action.
- Do not fabricate evidence or imply evidence exists before upload/linking.

## Coverage Indicator UI

- Display known coverage status, uncertainty, rule source, and effective date when available.
- Use unknown or needs review when payer rules are missing.

## Payer Rule Warning UI

- Show warning, source, confidence, uncertainty, and reviewer action.
- Never invent payer policies.

## Claim Risk Level UI

- Show Low, Medium, High, or Critical with reasons and recommended review path.
- Separate documentation risk, evidence risk, coding risk, and policy risk.

## Economic Alert UI

- Display financial risk, potential impact, assumptions, and review owner.
- Avoid definitive savings, payment, or denial predictions without validated source.

## Evidence Package UI

- Show package contents, missing items, generated timestamp, reviewer, version, and export status.
- Preserve traceability to source notes, documents, claim, and audit log.

## Reviewer Decision Support UI

- Provide compare, review, request evidence, add note, escalate, and mark ready actions.
- Preserve reviewer authority and require reason capture for overrides.

## Audit-Ready Insurance Workflow UI

- Audit submission, evidence changes, readiness recalculation, payer warning dismissal, reviewer notes, and package export.
- Capture actor, timestamp, reason, before, after, and source.
