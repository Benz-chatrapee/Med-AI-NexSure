# Insurance QA Rules

## Claim Readiness Scoring
Validate calculation inputs, weights, status thresholds, recalculation triggers, missing data handling, and audit trail.

## Evidence Completeness
Verify SOAP, diagnosis, ICD, prescription/procedure, medical certificate, attachments, claim summary, and audit summary inclusion.

## Required Document Checklist
Validate required documents by claim type and payer rule source when available. Do not invent payer requirements.

## Payer Rule Validation
Verify rule source, version, effective date, applicability, uncertainty handling, and reviewer handoff.

## Coverage Indicator
Validate coverage is shown as decision support with evidence and uncertainty, not final approval.

## Waiting Period Rule
Validate waiting period calculations against known policy dates and source data.

## Exclusion Rule
Validate exclusion warnings are evidence-backed and routed for human review.

## Benefit Limit Warning
Validate benefit limit warnings, thresholds, currency handling, and reviewer handoff.

## Diagnosis and ICD Support
Validate diagnosis/ICD evidence consistency and highlight unsupported or missing codes.

## Procedure Support
Validate procedure evidence, required documentation, and consistency with claim reason.

## Medical Certificate Requirement
Validate presence, completeness, issuer authority, and date alignment of medical certificates.

## Cost Threshold Review
Validate high-cost thresholds, economic warnings, and audit evidence.

## Claim Risk Level
Validate Ready, Needs Review, Not Ready, and risk explanations from configured rules.

## Claim Reviewer Handoff
Validate handoff queue, reviewer notes, status change, assignment, and audit events.

## Audit Evidence for Claim Decision Support
Claim support actions must log actor, timestamp, rule version, inputs, output, reason, and reviewer action.

## Approval Boundary
The QA Agent must validate that Med AI NexSure does not automatically approve or reject insurance claims unless explicitly designed, authorized, reviewed, and audited.
