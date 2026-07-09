# Claim Readiness Logic

## Score Components

| Component | Weight | Description |
|---|---:|---|
| SOAP Completeness | 25% | Clinical documentation completeness |
| Diagnosis & ICD | 20% | Diagnosis and ICD-10 consistency |
| Prescription/Procedure | 15% | Treatment evidence completeness |
| Evidence | 20% | Required documents and attachments |
| Insurance Rule | 10% | Payer rule compliance |
| Economic | 10% | Cost reasonableness and threshold |

## Status Threshold

| Score | Status | Meaning |
|---:|---|---|
| 85-100 | Ready | Claim appears complete for submission |
| 60-84 | Needs Review | Claim requires human review or missing minor evidence |
| 0-59 | Not Ready | Claim has major missing data or rule conflict |

## Risk Logic

| Condition | Risk |
|---|---|
| Complete data and no rule conflict | Low |
| Minor missing evidence | Medium |
| Missing ICD, inconsistent diagnosis, or cost alert | High |
| Critical rule conflict, exclusion, or unsafe claim | Critical |

## Reason Codes

| Code | Meaning |
|---|---|
| INS_READY_COMPLETE | Required claim data appears complete |
| INS_REVIEW_MINOR_EVIDENCE | Minor evidence gap requires review |
| INS_NOT_READY_MISSING_ICD | ICD-10 is missing |
| INS_HIGH_COST_THRESHOLD | Cost exceeds configured review threshold |
| INS_RULE_UNKNOWN | Payer rule is missing or unknown |
| INS_RULE_CONFLICT | Payer rule conflict detected |
| INS_POLICY_EXCLUSION | Possible exclusion requires human review |
| INS_AUDIT_REQUIRED | Sensitive or high-risk action requires audit review |

## Missing Evidence Severity

| Severity | Meaning |
|---|---|
| Low | Optional or non-blocking evidence gap |
| Medium | Required evidence gap that may be resolved by staff |
| High | Major evidence gap likely to block claim readiness |
| Critical | Evidence or rule conflict that may create compliance, safety, or claim-decision risk |

## Escalation Logic

- Low risk: no escalation unless user requests review.
- Medium risk: route to Claim Reviewer when required evidence is incomplete.
- High risk: route to Claim Reviewer and QA for testability or workflow validation.
- Critical risk: route to Claim Reviewer, Auditor, and Compliance Guard.

## Confidence Logic

- High: source data complete, payer rule version known, no conflicts.
- Medium: minor evidence gaps or non-critical unknowns.
- Low: missing payer rule, missing ICD, conflicting source data, or incomplete clinical documentation.

## Audit Note Rules

- Include decision-support-only statement.
- Include source data and rule version.
- Include timestamp and actor/requesting service.
- Include reason codes and recommended actions.
- Do not include unnecessary PHI, PII, secrets, or raw protected data.

## Human Review Trigger

Human review is required when status is Needs Review or Not Ready, risk is High or Critical, payer rule result is fail/unknown/conflict, evidence is missing with Medium or higher severity, or the agent confidence is Low.
