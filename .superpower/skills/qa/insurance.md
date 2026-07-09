# Insurance QA Rules

## Validation Areas
- Claim readiness scoring.
- Missing evidence detection.
- Evidence package completeness.
- Payer rule result.
- Coverage indicator.
- Waiting period rule.
- Exclusion rule.
- Benefit limit rule.
- Risk level.
- Claim alert.
- Claim reviewer workflow.

## Claim Readiness Scoring
- SOAP completeness: 25%
- Diagnosis & ICD: 20%
- Prescription / Procedure: 15%
- Evidence: 20%
- Insurance Rule: 10%
- Economic: 10%

## Claim Readiness Status
- Ready: 85-100
- Needs Review: 60-84
- Not Ready: 0-59

## Evidence Package Completeness
- Complete: 90-100
- Review Needed: 70-89
- Incomplete: 0-69

## Required Checks
- Scores use approved weights and explain each component.
- Missing evidence is specific, actionable, and traceable.
- Payer rule results use configured rules only.
- Coverage, waiting period, exclusion, benefit limit, and risk indicators do not make final claim decisions.
- Claim reviewer workflow keeps human review mandatory.
