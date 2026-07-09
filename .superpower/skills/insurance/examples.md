# Insurance Examples

## Example 1: Ready Claim

### Input
- Visit: OPD synthetic visit V-1001
- Payer: MVP Payer A
- Diagnosis: Acute upper respiratory infection
- ICD: J06.9
- Evidence: SOAP, diagnosis, ICD, prescription, receipt, claim summary
- Rule Version: MVP-2026-07-09

### Analysis
All required OPD evidence is available. Payer rule passes. Cost is below threshold.

### Score
- Total: 92
- Status: Ready
- Confidence: High

### Missing Evidence
None.

### Policy Result
MVP-OPD-001 pass.

### Risk Level
Low.

### Recommended Action
Proceed to human claim reviewer for normal submission review.

### Handoff
Claim Reviewer.

## Example 2: Needs Review Because Medical Certificate Is Missing

### Input
- Visit: Accident synthetic visit V-1002
- Payer: MVP Payer A
- Diagnosis: Contusion
- ICD: S00.9
- Evidence: SOAP, diagnosis, ICD, receipt
- Rule Version: MVP-2026-07-09

### Analysis
Accident claim rule requires a medical certificate. Evidence gap is material but resolvable.

### Score
- Total: 74
- Status: Needs Review
- Confidence: Medium

### Missing Evidence
Medical Certificate, severity Medium, action: request certificate from authorized clinician.

### Policy Result
MVP-CERT-001 review.

### Risk Level
Medium.

### Recommended Action
Request medical certificate and rerun assessment.

### Handoff
Claim Reviewer and Evidence Package Agent.

## Example 3: Not Ready Because ICD Is Missing

### Input
- Visit: OPD synthetic visit V-1003
- Payer: MVP Payer A
- Diagnosis: Hypertension follow-up
- ICD: Missing
- Evidence: SOAP, diagnosis, prescription, receipt
- Rule Version: MVP-2026-07-09

### Analysis
ICD-10 is required for readiness scoring and payer validation.

### Score
- Total: 55
- Status: Not Ready
- Confidence: Low

### Missing Evidence
ICD-10, severity High, action: route to authorized clinical coder/reviewer.

### Policy Result
MVP-ICD-001 fail.

### Risk Level
High.

### Recommended Action
Obtain reviewed ICD-10 before claim submission review.

### Handoff
Claim Reviewer, Clinical AI/ICD Suggestion Agent, and QA Agent for workflow validation.

## Example 4: High Risk Because Cost Exceeds Threshold

### Input
- Visit: IPD synthetic visit V-1004
- Payer: MVP Payer B
- Diagnosis: Pneumonia
- ICD: J18.9
- Evidence: SOAP, diagnosis, ICD, invoice, claim summary, economic summary
- Cost: Above configured MVP threshold
- Rule Version: MVP-2026-07-09

### Analysis
Core evidence is present, but cost threshold rule requires manual review.

### Score
- Total: 78
- Status: Needs Review
- Confidence: Medium

### Missing Evidence
No missing required evidence identified.

### Policy Result
MVP-COST-001 review.

### Risk Level
High.

### Recommended Action
Route to Claim Reviewer for cost review and attach economic summary.

### Handoff
Claim Reviewer and Auditor if financial audit policy applies.

## Example 5: Critical Because Policy Exclusion or Rule Conflict

### Input
- Visit: Synthetic visit V-1005
- Payer: MVP Payer C
- Diagnosis: Source diagnosis conflicts with configured exclusion rule
- ICD: Provided but inconsistent with rule context
- Evidence: SOAP, diagnosis, ICD, invoice, attachments
- Rule Version: MVP-2026-07-09

### Analysis
Policy exclusion or rule conflict is detected. AI cannot make a final payer decision.

### Score
- Total: 42
- Status: Not Ready
- Confidence: Low

### Missing Evidence
Clarifying payer-policy documentation, severity Critical.

### Policy Result
Exclusion/rule conflict requires human review.

### Risk Level
Critical.

### Recommended Action
Stop automated readiness progression and escalate for manual review.

### Handoff
Claim Reviewer, Auditor, Compliance Guard, and Product Owner for rule clarification.
