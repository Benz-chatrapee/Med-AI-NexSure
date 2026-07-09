# Payer Rules

## Rule Types

- Required Evidence Rule
- ICD Requirement Rule
- Diagnosis-ICD Consistency Rule
- Procedure Requirement Rule
- Coverage Rule
- Waiting Period Rule
- Exclusion Rule
- Benefit Limit Rule
- Cost Threshold Rule
- Manual Review Trigger Rule

## Rule Result

Each rule must return:

- rule_id
- rule_name
- result: pass / review / fail / unknown
- reason
- required_action
- severity
- rule_version
- audit_note

## MVP Mock Payer Rules

### OPD Visit

- rule_id: MVP-OPD-001
- rule_name: OPD Required Evidence
- Applies when claim_type is OPD
- Requires SOAP Note, Diagnosis, ICD-10, Receipt, and Claim Summary
- Result is review when ICD-10 or receipt is missing
- Rule version: MVP-2026-07-09

### IPD Visit

- rule_id: MVP-IPD-001
- rule_name: IPD Required Evidence
- Applies when claim_type is IPD
- Requires SOAP Note, Diagnosis, ICD-10, Procedure/Discharge Summary where applicable, Invoice, and Claim Summary
- Result is review or fail when major evidence is missing
- Rule version: MVP-2026-07-09

### Accident Claim

- rule_id: MVP-ACC-001
- rule_name: Accident Claim Evidence
- Requires accident-related visit context, medical certificate where configured, receipt/invoice, and attachments
- Result is review when accident context or certificate is missing
- Rule version: MVP-2026-07-09

### Medical Certificate Required

- rule_id: MVP-CERT-001
- rule_name: Medical Certificate Requirement
- Requires medical certificate when payer rule or claim type requires certification
- Result is review when missing, fail when required for submission and unavailable
- Rule version: MVP-2026-07-09

### ICD Required

- rule_id: MVP-ICD-001
- rule_name: ICD Requirement
- Requires ICD-10 for claim readiness scoring
- Result is fail when missing
- Rule version: MVP-2026-07-09

### Attachment Required

- rule_id: MVP-ATT-001
- rule_name: Attachment Requirement
- Requires configured attachments for payer or claim type
- Result is review when missing or incomplete
- Rule version: MVP-2026-07-09

### Cost Above Threshold Requires Review

- rule_id: MVP-COST-001
- rule_name: Cost Threshold Manual Review
- Requires human review when total cost exceeds configured threshold
- Result is review and risk is High
- Rule version: MVP-2026-07-09
