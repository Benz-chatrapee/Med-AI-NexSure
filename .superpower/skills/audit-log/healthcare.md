# Healthcare Audit Rules

## SOAP Note Audit Rules

- Log `SOAP_CREATE` when a SOAP note is first created.
- Log `SOAP_UPDATE` for every material field change.
- Log `SOAP_VERSION_CREATE` when a version snapshot is created.
- Capture clinician, patient, visit, changed fields, source module, reason when available, and correlation ID.
- Store before/after as field-level summaries or version references, not full raw note text unless explicitly approved.

## Clinical Note Versioning Rules

- Material edits must create a traceable version or link to a versioned source record.
- Audit events must identify prior version, new version, editor, timestamp, and changed fields.
- Corrections must be additive and traceable.

## Diagnosis Audit Rules

- Log diagnosis creation and updates with clinician identity and visit linkage.
- Log before/after diagnosis references and changed fields.
- Require human review for AI-assisted diagnosis or ICD suggestions.
- Do not treat AI suggestions as final diagnosis.

## ICD Suggestion Audit Rules

- Log `ICD_SUGGESTION_GENERATED` with model, prompt ID/version, source reference, confidence, and human review requirement.
- Log `ICD_ACCEPTED` or `ICD_REJECTED` with reviewer ID, role, reason when available, and final human disposition.
- Do not invent ICD codes or log unsupported mappings as facts.

## Prescription Audit Rules

- Log prescription creation and update with prescriber identity.
- Log drug, dose, route, frequency, and duration changes as masked or structured summaries according to privacy policy.
- Require heightened severity for medication changes that affect safety review.

## Drug Interaction Audit Rules

- Log `DRUG_INTERACTION_CHECK` for prescription safety checks.
- Log critical warnings with severity, interaction category, source reference, and reviewer disposition.
- Do not suppress critical warnings without audit event and reason.

## Pharmacist Review Audit Rules

- Log `PHARMACIST_REVIEW` with pharmacist identity, review status, warning disposition, and timestamp.
- Capture whether review confirmed, escalated, or requested clarification.

## Medical Certificate Audit Rules

- Log draft, issue, and void actions.
- Voiding requires reason, actor, prior certificate status, new status, timestamp, and reviewer/clinician authority.
- Generated certificates and PDFs must have references and audit linkage.

## AI Clinical Disclaimer Audit Rules

- Clinical AI outputs must record decision-support disclaimer status.
- Missing disclaimer on material clinical AI output is an AI governance and clinical safety gap.
- Human review requirement must be explicit.

## Human-in-the-Loop Audit Requirements

- Clinical AI, ICD suggestions, prescription warnings, medical certificates, and high-risk clinical changes require human reviewer traceability.
- Log reviewer identity, role, action, timestamp, and accepted/rejected/escalated status.

## Prohibited Sensitive Data Logging

- Do not store unnecessary raw SOAP text, full medical history, national IDs, phone numbers, addresses, free-text patient identifiers, full AI prompts, or full AI outputs in audit payloads.
- Use source record references, changed field names, masked summaries, and version IDs.

## Required Linkage

Clinical audit events should link to patient, visit, clinician, reviewer, source module, request ID, and correlation ID.

## Examples

### 1. SOAP Updated

- Event category: `SOAP_UPDATE`
- Actor: `usr_clinician_102`
- Target entity: `soap_note: soap_demo_20260709_001`
- Required payload: patient ID, visit ID, changed fields, prior version reference, new version reference, source module, correlation ID, risk `HIGH`, severity `HIGH`, `PDPA` and `CLINICAL_SAFETY` tags.
- Note: Do not store full SOAP text in the audit payload.

### 2. ICD Suggestion Accepted

- Event category: `ICD_ACCEPTED`
- Actor: `usr_physician_204`
- Target entity: `icd_suggestion: icd_sug_demo_001`
- Required payload: patient ID, visit ID, ICD suggestion reference, AI model, prompt ID, prompt version, confidence, human reviewer ID, human review status `accepted`, risk `HIGH`, severity `HIGH`.
- Note: Acceptance is a human clinician action, not an autonomous AI decision.

### 3. Drug Interaction Warning Triggered

- Event category: `DRUG_INTERACTION_CHECK`
- Actor: `system_drug_safety`
- Target entity: `prescription: rx_demo_001`
- Required payload: patient ID, visit ID, interaction category, severity summary, source module, correlation ID, human review required, risk `CRITICAL`, severity `CRITICAL`.
- Note: Do not include unnecessary clinical narrative; reference the prescription and warning record.

### 4. Medical Certificate Voided

- Event category: `MEDICAL_CERTIFICATE_VOIDED`
- Actor: `usr_clinician_305`
- Target entity: `medical_certificate: mc_demo_001`
- Required payload: patient ID, visit ID, before status `issued`, after status `voided`, reason, source module, request ID, correlation ID, risk `HIGH`, severity `HIGH`, tags `PDPA`, `CLINICAL_SAFETY`.
- Note: Voiding must be additive and preserve the original issue audit event.
