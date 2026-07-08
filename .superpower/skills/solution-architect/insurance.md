# Insurance Architecture Guidance

## Claim Readiness Architecture

- Use SOAP, diagnosis, ICD suggestion, prescription, evidence, payer rules, and economic signals as traceable inputs.
- Separate readiness calculation from final claim decision.
- Provide score, status, explanation, missing evidence, risk level, confidence, and reviewer state.
- Audit score generation, rule results, changes, reviewer actions, and overrides.

## Evidence Package Architecture

- Collect visit-level clinical, insurance, administrative, and supporting documentation.
- Define required evidence by configured payer rule and claim type.
- Track completeness, missing evidence, freshness, conflicts, export status, and reviewer handoff.
- Audit package generation, regeneration, export, and reviewer actions.

## Payer Rule Setting Architecture

- Store payer rules as governed configuration with source, version, effective date, owner, and approval state.
- Do not invent payer policy content.
- Require review workflow for rule changes.
- Audit rule creation, update, activation, deactivation, and use in scoring.

## Insurance Intelligence Architecture

- Support coverage indicators, missing evidence detection, risk level calculation, claim alerts, and reviewer actions.
- Keep outputs explainable and traceable to source rules and documentation.
- Route uncertainty and exceptions to authorized claim reviewers.

## Coverage Indicator Architecture

- Represent coverage indicators as decision-support signals, not final coverage determinations.
- Include source, confidence, rule version, explanation, and last evaluation timestamp.
- Audit display and reviewer acknowledgement when material to claim workflow.

## Missing Evidence Detection

- Map evidence requirements to visit documents, SOAP fields, diagnosis/ICD data, prescription data, attachments, and payer rules.
- Return missing, incomplete, conflicting, and stale evidence states.
- Preserve explanation and remediation recommendation.

## Risk Level Calculation

- Use explainable criteria such as missing evidence severity, rule conflicts, documentation gaps, low-confidence AI outputs, and policy uncertainty.
- Keep final claim approval or rejection outside automated scoring.
- Audit risk calculation and reviewer override.

## Claim Reviewer Workflow

- Provide reviewer queue, case detail, readiness explanation, evidence gaps, rule results, notes, and action history.
- Support reviewer mark-as-reviewed, request-more-evidence, escalate, and override actions.
- Require reason capture for material reviewer decisions.

## Auditability for Claim Scoring

- Record input references, rule version, score, explanation, confidence, risk level, reviewer state, actor, timestamp, and correlation ID.
- Keep enough traceability to reproduce why a readiness result was shown.

## Exception Handling

- Route missing payer rules, conflicting evidence, low confidence, unavailable services, and policy ambiguity to manual review.
- Show safe degraded states rather than fabricating readiness.
- Preserve audit events for failed, partial, and retried evaluations.

## Human Review for Claim Decisions

AI can support claim readiness and evidence review but must not make final claim approval or rejection decisions without authorized human review.
