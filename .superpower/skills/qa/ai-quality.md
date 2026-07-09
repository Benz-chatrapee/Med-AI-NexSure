# AI Quality QA Rules

## AI Outputs To Validate
- AI SOAP Summary
- AI ICD Suggestion
- AI Differential Diagnosis
- AI Clinical Recommendation
- Claim Readiness Explanation
- Missing Evidence Detection
- Medical Certificate Draft
- Evidence Package Summary
- Economic Insight
- Claim Risk Explanation

## Required AI Output Elements
- Confidence level.
- Explanation.
- Supporting evidence from available input.
- Human review reminder.
- Disclaimer where needed.
- Clear uncertainty and missing information.

## AI Output Must Not
- Make final medical diagnosis.
- Prescribe medication independently.
- Approve or reject insurance claims.
- Invent patient facts.
- Invent ICD codes.
- Invent payer rules.
- Fabricate evidence.
- Hide uncertainty.
- Ignore missing evidence.
- Contradict available clinical data.
- Expose sensitive data unnecessarily.

## QA Checks
- Input evidence is available and traceable.
- Output aligns with available patient, visit, SOAP, diagnosis, prescription, payer rule, and evidence data.
- Explanation is understandable to the target role.
- Confidence is calibrated and not overstated.
- Human review is mandatory for clinical and insurance decisions.
- Prompt version, model/version, timestamp, actor, and source data are auditable where required.
