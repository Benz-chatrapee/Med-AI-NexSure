# Audit Log Agent Examples

All examples use fake IDs and avoid real patient data.

## 1. Patient Record Viewed

- Scenario: A clinician opens a permitted patient record from Patient Management.
- Event category: `PATIENT_ACCESS`
- Actor: `usr_clinician_001`
- Target entity: `patient: pat_demo_001`
- Required audit payload: organization ID, clinic ID, actor user ID, actor role, target patient ID, source module `Patient Management`, source page, IP address, user agent, request ID, correlation ID, risk `LOW`, severity `INFO`, `pdpa_sensitive: true`, tags `PDPA`, `ACCESS_CONTROL`.
- Risk level: `LOW`
- Severity: `INFO`
- QA validation notes: Verify patient access creates an event and respects tenant/RBAC filters in audit views.

## 2. SOAP Note Updated

- Scenario: A physician updates assessment and plan fields during a visit.
- Event category: `SOAP_UPDATE`
- Actor: `usr_physician_002`
- Target entity: `soap_note: soap_demo_001`
- Required audit payload: patient ID, visit ID, changed fields, before version ID, after version ID, source module `SOAP Note`, correlation ID, human review status `reviewed_by_clinician`, risk `HIGH`, severity `HIGH`, tags `PDPA`, `CLINICAL_SAFETY`.
- Risk level: `HIGH`
- Severity: `HIGH`
- QA validation notes: Verify full SOAP text is not duplicated in audit payload and version references resolve.

## 3. AI SOAP Summary Generated

- Scenario: AI generates a SOAP summary draft for clinician review.
- Event category: `AI_OUTPUT_GENERATED`
- Actor: `system_ai_clinical`
- Target entity: `ai_output: aiout_demo_001`
- Required audit payload: patient ID, visit ID, AI model `med-summary-demo-model`, prompt ID `prompt_soap_summary`, prompt version `v1.2.0`, confidence `0.78`, safe reasoning summary, human review required `true`, human review status `pending`, source module `AI Clinical Engine`, correlation ID, risk `HIGH`, severity `NOTICE`, tags `AI_GOVERNANCE`, `CLINICAL_SAFETY`, `HUMAN_REVIEW`.
- Risk level: `HIGH`
- Severity: `NOTICE`
- QA validation notes: Verify prompt version and model are required and raw prompt text is not stored.

## 4. ICD Suggestion Accepted

- Scenario: A clinician accepts an ICD suggestion after review.
- Event category: `ICD_ACCEPTED`
- Actor: `usr_physician_003`
- Target entity: `icd_suggestion: icd_sug_demo_001`
- Required audit payload: patient ID, visit ID, suggested ICD reference, AI model, prompt ID, prompt version, confidence, reviewer ID, human review status `accepted`, source module `Diagnosis and ICD Suggestion`, correlation ID, risk `HIGH`, severity `HIGH`, tags `AI_GOVERNANCE`, `CLINICAL_SAFETY`, `HUMAN_REVIEW`.
- Risk level: `HIGH`
- Severity: `HIGH`
- QA validation notes: Verify acceptance is unavailable without authenticated clinician reviewer.

## 5. Prescription Drug Interaction Warning

- Scenario: Drug safety service detects a critical interaction during prescription creation.
- Event category: `DRUG_INTERACTION_CHECK`
- Actor: `system_drug_safety`
- Target entity: `prescription: rx_demo_001`
- Required audit payload: patient ID, visit ID, interaction warning ID, interaction category, criticality, source module `Prescription and Drug Safety`, human review required `true`, correlation ID, risk `CRITICAL`, severity `CRITICAL`, tags `CLINICAL_SAFETY`, `HUMAN_REVIEW`.
- Risk level: `CRITICAL`
- Severity: `CRITICAL`
- QA validation notes: Verify critical warning cannot be dismissed without reviewer action and reason.

## 6. Claim Readiness Score Calculated

- Scenario: Claim readiness service calculates readiness after SOAP and evidence review.
- Event category: `CLAIM_READINESS_CALCULATED`
- Actor: `system_claim_readiness`
- Target entity: `claim_readiness: cr_demo_001`
- Required audit payload: patient reference, visit ID, score `84`, component summary, missing evidence count, payer rule version references, source module `Claim Readiness`, correlation ID, risk `MEDIUM`, severity `NOTICE`, tags `CLAIM_REVIEW`, `OIC`.
- Risk level: `MEDIUM`
- Severity: `NOTICE`
- QA validation notes: Verify recalculation creates a distinct event and score is not labeled as approval.

## 7. Evidence Package PDF Exported

- Scenario: Claim reviewer exports an evidence package PDF for authorized review.
- Event category: `EVIDENCE_PACKAGE_EXPORTED`
- Actor: `usr_claim_reviewer_004`
- Target entity: `evidence_package: ep_demo_001`
- Required audit payload: patient reference, visit ID, PDF report ID, destination type `authorized_internal_review`, export reason, source module `Evidence Package`, IP address, request ID, correlation ID, `pdpa_sensitive: true`, risk `HIGH`, severity `HIGH`, tags `PDPA`, `OIC`, `DATA_EXPORT`, `CLAIM_REVIEW`.
- Risk level: `HIGH`
- Severity: `HIGH`
- QA validation notes: Verify export requires permission and generated PDF event is linked.

## 8. User Role Changed

- Scenario: Admin assigns a claim reviewer role to a user.
- Event category: `ROLE_ASSIGNED`
- Actor: `usr_admin_005`
- Target entity: `user_role_assignment: ura_demo_001`
- Required audit payload: target user ID, before roles, after roles, reason, actor role `admin`, source module `User Management`, request ID, correlation ID, risk `HIGH`, severity `HIGH`, tags `ACCESS_CONTROL`, `SECURITY`.
- Risk level: `HIGH`
- Severity: `HIGH`
- QA validation notes: Verify reason is required and only authorized administrators can assign roles.

## 9. Failed Login Detected

- Scenario: A login attempt fails due to invalid credentials.
- Event category: `FAILED_LOGIN`
- Actor: `anonymous_or_unknown`
- Target entity: `auth_login_attempt: login_demo_001`
- Required audit payload: attempted username hash or masked identifier, IP address, user agent, source module `Authentication`, request ID, correlation ID, failure reason code, risk `MEDIUM`, severity `WARNING`, tags `SECURITY`.
- Risk level: `MEDIUM`
- Severity: `WARNING`
- QA validation notes: Verify password and raw credential values are never logged.

## 10. Payer Rule Updated

- Scenario: Insurance configuration owner updates a payer rule threshold.
- Event category: `PAYER_RULE_UPDATED`
- Actor: `usr_insurance_admin_006`
- Target entity: `payer_rule: payer_rule_demo_001`
- Required audit payload: payer rule ID, prior version, new version, changed fields, before value summary, after value summary, reason, source module `Payer Rule Setting`, request ID, correlation ID, risk `HIGH`, severity `HIGH`, tags `OIC`, `CLAIM_REVIEW`, `FINANCIAL_IMPACT`.
- Risk level: `HIGH`
- Severity: `HIGH`
- QA validation notes: Verify rule updates create immutable version references and do not affect historical evaluations silently.
