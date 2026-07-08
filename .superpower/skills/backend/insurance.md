# Insurance Backend Rules

## Claim Readiness Scoring Service

- Calculate readiness from documentation completeness, ICD consistency, evidence completeness, payer warnings, policy uncertainty, and review status.
- Return score, blockers, risk level, missing evidence, warnings, and reviewer handoff.
- Readiness is advisory and not claim approval.

## Evidence Completeness Rules

- Evidence must be linked to source records, documents, timestamps, and entity IDs.
- Missing, stale, conflicting, restricted, or low-confidence evidence is represented explicitly.

## Missing Evidence Detection

- Detect absent required documents, incomplete SOAP support, missing diagnosis support, missing consent, and unsupported claim items.
- Do not fabricate evidence or imply evidence exists before it is linked.

## Payer Rule Validation

- Evaluate payer rules only from configured, traceable sources.
- Return uncertainty when rules are missing, stale, ambiguous, or conflicting.
- Never invent payer policies.

## Coverage Indicator Calculation

- Represent covered, not covered, partial, unknown, and needs review states.
- Include rule source, effective date, and uncertainty where available.

## Risk Level Calculation

- Risk levels should separate documentation risk, evidence risk, coding risk, payer policy risk, and operational risk.
- High and critical risk require reviewer review.

## Economic Alert Detection

- Economic alerts may flag potential financial impact, leakage, high-cost items, or missing support.
- Alerts must include assumptions and source data.
- Avoid definitive payment, savings, approval, or denial claims without validated source.

## Evidence Package Assembly

- Assemble package contents from traceable patient, visit, SOAP, claim, document, and audit references.
- Version packages and preserve generated timestamp, actor, and export status.

## Reviewer Handoff

- Provide reviewer notes, blockers, uncertainty, missing evidence, risk reasons, and recommended next actions.
- Preserve reviewer authority.

## Audit-Ready Decision Support

- Audit readiness recalculation, evidence changes, package generation, package export, payer warning dismissal, reviewer notes, and override decisions.

## Prohibited Autonomous Claim Approval Or Rejection

- Backend must never approve, deny, or finalize claims automatically.
- Backend must never fabricate policy, evidence, or reviewer decisions.
