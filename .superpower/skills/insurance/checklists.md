# Insurance Checklists

## Claim Readiness Checklist
- SOAP note exists
- SOAP note is complete
- Diagnosis exists
- ICD-10 exists
- ICD aligns with diagnosis
- Prescription exists if treatment requires medication
- Procedure exists if claim type requires procedure
- Medical certificate exists if required
- Required attachments exist
- Payer rule has been evaluated
- Coverage indicator is calculated
- Cost threshold checked
- Missing evidence listed
- Risk level assigned
- Human reviewer rule applied
- Audit note generated

## Policy Rule Checklist
- Payer identified
- Product/plan identified where available
- Claim type identified
- Required evidence checked
- ICD rule checked
- Waiting period checked where available
- Exclusion checked where available
- Benefit limit checked where available
- Cost threshold checked
- Manual review trigger checked

## Safety Checklist
- No final approval/rejection by AI
- No clinical diagnosis made by Insurance Agent
- No unsupported coverage guarantee
- No hidden decision logic
- Explainability included
- Human review required for high-risk cases
- Audit trail suggested

## Evidence Package Checklist
- SOAP note included or explicitly marked missing
- Diagnosis included
- ICD-10 included or issue raised
- Prescription/procedure evidence included when applicable
- Medical certificate included when payer rule requires it
- Attachments, receipts, invoices, and summaries checked
- Evidence status and severity assigned
- Evidence source is traceable

## Coverage Indicator Checklist
- Coverage signal is advisory only
- Rule source and version are stated
- Unknown rules do not become coverage guarantees
- Limitations are visible
- Human review is triggered for unknown, conflicting, or high-risk rules

## Claim Risk Checklist
- Low, Medium, High, or Critical risk assigned
- Reason code assigned
- Risk source is traceable
- High/Critical escalations are routed to human reviewers
- Critical compliance or exclusion issues are routed to Auditor or Compliance Guard

## Audit Readiness Checklist
- Timestamp captured
- Actor or requesting service identified
- Source data listed
- Rule version listed or marked unknown
- Reason and recommended action stated
- Before/after state required for modifications
- Protected data is minimized and sanitized

## PDPA/Compliance Checklist
- No unnecessary PHI/PII in output
- No secrets or API keys exposed
- Consent/access constraints are respected
- Data scope follows RBAC/RLS
- Compliance ambiguity is escalated

## Integration with Claim Reviewer Checklist
- Claim reviewer receives score, status, breakdown, missing evidence, rule results, risk, and audit notes
- Reviewer can override or annotate AI recommendation
- Reviewer decision remains human-owned
- Reviewer action creates an audit log

## MVP Acceptance Checklist
- Claim Readiness Page fields are supported
- Visit Detail Insurance Panel fields are supported
- Evidence Package contents are supported
- Payer Rule Setting Mock rule types are supported
- Handoff to QA and Auditor is defined
