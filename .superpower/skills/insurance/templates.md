# Insurance Templates

## Claim Readiness Assessment Template

### Visit Context
- Visit ID:
- Patient ID:
- Payer:
- Claim Type:
- Visit Type:
- Diagnosis:
- ICD Code:
- Procedure:
- Prescription:
- Evidence Available:

### Readiness Score
- Total Score:
- Status:
- Confidence:
- Risk Level:

### Score Breakdown
| Component | Weight | Score | Status | Reason |
|---|---:|---:|---|---|
| SOAP Completeness | 25% | | | |
| Diagnosis & ICD | 20% | | | |
| Prescription/Procedure | 15% | | | |
| Evidence | 20% | | | |
| Insurance Rule | 10% | | | |
| Economic | 10% | | | |

### Missing Evidence
| Evidence | Required | Available | Severity | Action |
|---|---|---|---|---|

### Policy Rule Result
| Rule | Result | Reason | Action |
|---|---|---|---|

### Claim Risk
- Risk Level:
- Risk Reason:
- Escalation Required:
- Escalate To:

### Recommended Actions
1.
2.
3.

### Human Review Required
- Yes/No:
- Reviewer Role:
- Reason:

### Audit Notes
- Decision Support Only:
- Source Data:
- Rule Version:
- Timestamp:

## Policy Rule Validation Template

| Rule ID | Rule Name | Result | Severity | Reason | Required Action | Rule Version | Audit Note |
|---|---|---|---|---|---|---|---|

## Missing Evidence Template

| Evidence | Status | Required | Severity | Source Checked | Recommended Action |
|---|---|---|---|---|---|

## Coverage Indicator Template

- Indicator:
- Supporting Rule:
- Source Data:
- Limitation:
- Confidence:
- Human Review Required:

## Claim Exception Template

- Exception ID:
- Trigger:
- Severity:
- Affected Claim Data:
- Reason Code:
- Required Human Role:
- Recommended Action:
- Audit Note:

## Handoff to QA Template

- Feature/Workflow:
- Insurance Output Under Review:
- Risk Area:
- Test Scenarios Needed:
- Acceptance Criteria Gap:
- Audit Evidence Needed:

## Handoff to Auditor Template

- Claim/Visit:
- Trigger:
- Risk Level:
- Audit Trail Required:
- Source Data:
- Rule Version:
- Recommended Audit Focus:

## Handoff to Product Owner Template

- Business Rule Gap:
- User Impact:
- Claim Workflow Impact:
- Decision Needed:
- MVP/Enterprise Phase:

## Handoff to Backend Template

- API/Service:
- Required Rule Logic:
- Data Inputs:
- Data Outputs:
- Audit Event:
- Error Handling:
