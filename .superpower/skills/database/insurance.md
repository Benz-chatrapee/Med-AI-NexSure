# Insurance Database Rules

## Claim Readiness Assessment Storage

- Store readiness assessments as versioned decision-support records.
- Include score, risk level, status, calculated_at, calculated_by, source version, and reviewer status.
- Link to claim, visit, SOAP note, diagnosis, evidence, and payer rule inputs where applicable.

## Missing Evidence Storage

- Store missing evidence as readiness items or evidence requirements with type, source requirement, severity, owner, status, and resolution timestamp.
- Never imply evidence exists before it is linked.

## Evidence Package Versioning

- Store package version, status, generated_at, generated_by, source claim/visit, export status, and reviewer handoff.
- Store package items with source entity, evidence type, status, and traceability.

## Payer Rule Configuration

- Store payer rule source, effective dates, version, status, and jurisdiction/market where applicable.
- Preserve rule history and avoid overwriting active historical context.

## Rule Evaluation Result Storage

- Store result, confidence/uncertainty, source rule, evaluated_at, input references, and reviewer action.
- Use unknown or needs_review when rules are missing or ambiguous.

## Coverage Indicator Storage

- Store covered, partial, not_covered, unknown, or needs_review states.
- Link coverage state to payer rule source and effective date.

## Risk Level Storage

- Store risk level and reason categories such as documentation, evidence, coding, payer policy, and operational risk.
- High or critical risk should require reviewer workflow state.

## Economic Benchmark Storage

- Store economic benchmarks, visit cost summaries, assumptions, source version, and calculation timestamp.
- Avoid definitive payment or savings claims without validated source.

## Claim Reviewer Workflow Storage

- Store reviewer assignments, notes, status, reviewed_at, reason, override decisions, and escalation state.
- Preserve reviewer authority and audit trail.

## Audit-Ready Claim Traceability

- Link readiness, evidence, payer rule results, risk, economic alerts, reviewer notes, and package exports to audit events.

## Prohibited Autonomous Claim Approval Storage

- Do not store automatic approval or denial as final without reviewer action.
- Do not fabricate policy, evidence, or reviewer decisions.
