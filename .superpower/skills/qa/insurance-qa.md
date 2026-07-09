# Insurance QA

## Claim Readiness QA Matrix

| Case | Input Condition | Expected Score | Expected Status | Expected Risk |
|---|---|---:|---|---|
| Complete claim | All data complete | 85-100 | Ready | Low |
| Missing minor evidence | Missing optional attachment | 60-84 | Needs Review | Medium |
| Missing ICD | No ICD-10 | 0-59 | Not Ready | High |
| Cost threshold alert | Cost above threshold | 60-84 | Needs Review | High |
| Policy exclusion | Exclusion matched | 0-59 | Not Ready | Critical |

## Required Test Areas

- Score calculation
- Score threshold
- Missing evidence
- Payer rule pass/review/fail/unknown
- Coverage indicator
- Cost threshold
- Risk level
- Manual review
- Audit log
- Human-in-the-loop

## QA Blockers

- Claim readiness score does not match configured weights or thresholds.
- AI approves, rejects, submits, denies, or guarantees a claim.
- High/Critical risk does not require human review.
- Missing evidence is hidden or not severity-classified.
- Payer rule lacks source or version and is treated as final.
- Sensitive action lacks audit log.

## Traceability Expectations

Each insurance QA output should map scenario to requirement, user story, API or service, database/audit event, role, payer rule version, and expected evidence.
