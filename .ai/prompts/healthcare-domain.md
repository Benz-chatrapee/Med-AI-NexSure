# Med AI NexSure — Healthcare Domain Rules

## Purpose

Define healthcare-domain rules for all AI agents and development work in Med AI NexSure.

The platform must support safe, explainable, auditable, privacy-aware, and claim-ready healthcare workflows.

This file does not replace:

* Professional medical judgment
* Clinical governance
* Payer contracts
* Organizational policy
* Applicable laws and regulations

---

## Platform Context

Med AI NexSure is an enterprise healthcare and insurance intelligence platform covering:

* Patient and visit management
* SOAP documentation
* AI Clinical assistance
* Diagnosis and ICD coding
* Prescription safety
* Medical certificates
* Claim Readiness
* Missing Evidence detection
* Evidence Packages
* Insurance Intelligence
* Economic Intelligence
* Audit and Compliance

The platform is a **Decision Support System**, not an autonomous clinical or claim decision maker.

---

## Core Priorities

Apply these priorities in order:

1. Patient safety
2. Clinical correctness
3. Human oversight
4. Privacy and authorization
5. Evidence completeness
6. Claim readiness
7. Explainability
8. Auditability
9. Operational efficiency

When safety conflicts with speed, automation, cost, or convenience, prioritize safety.

---

## Decision-Support Boundary

AI may:

* Summarize clinical records
* Detect missing or conflicting information
* Suggest ICD codes
* Identify possible medication risks
* Draft clinical or claim documents
* Calculate readiness and completeness scores
* Recommend next actions
* Prioritize cases for review

AI must not:

* Make a final diagnosis
* Prescribe or change medication
* Approve or reject claims
* Issue or sign medical certificates
* Override authorized professionals
* Fabricate clinical facts or evidence
* Present uncertain output as confirmed fact
* Bypass required review or authorization

Material clinical, medication, certification, and claim decisions require authorized human review.

---

## Human-in-the-Loop

Human review is required when output may affect:

* Diagnosis
* Treatment
* Medication
* Allergy or interaction management
* Medical certificate issuance
* Claim submission
* Claim approval or rejection
* High-risk or high-cost classification
* Compliance escalation

Clearly distinguish:

* Source Data
* AI Draft
* Needs Review
* Reviewed
* Approved
* Rejected
* Finalized
* Superseded

Record reviewer, decision, timestamp, reason, and version when applicable.

---

## Clinical Workflow

Standard visit flow:

1. Patient Registration
2. Consent and identity verification
3. Visit Creation
4. Waiting
5. In Consultation
6. SOAP Documentation
7. Diagnosis and ICD Coding
8. Treatment or Prescription
9. Pharmacy Review
10. Medical Certificate when required
11. Visit Completion
12. Claim Readiness Assessment
13. Missing Evidence Resolution
14. Evidence Package Generation
15. Claim Review or Submission
16. Audit Logging

Core visit statuses:

* Waiting — รอพบแพทย์
* In Consultation — กำลังตรวจรักษา
* Pharmacy — รอรับยา
* Completed — เสร็จสิ้น
* Pending Evidence — รอเอกสารเพิ่มเติม
* Claim Review — รอตรวจสอบเคลม

Do not skip mandatory stages unless an approved exception exists.

---

## Patient Identity and Consent

Patient records should include:

* Patient ID
* HN
* Full name
* Date of birth
* Legally permitted identity reference
* Contact information
* Organization and clinic scope

Before creating a patient, check possible duplicates using:

* National identifier
* HN
* Name and date of birth
* Phone number
* Email

Potential duplicates require human review and must not be merged automatically.

Consent records should include:

* Consent type and purpose
* Status
* Version
* Granted, withdrawn, or expiration date
* Collection channel
* Supporting evidence
* Recorded-by user

Consent statuses:

* Pending
* Granted
* Declined
* Withdrawn
* Expired

Apply least-privilege access, purpose limitation, organization scope, clinic scope, and audit logging.

---

## Clinical Documentation

Clinical records must be:

* Accurate
* Complete
* Timely
* Attributable
* Consistent
* Version-controlled
* Auditable

Always distinguish:

* Patient-reported information
* Clinician observations
* Test results
* Clinical assessment
* Treatment plan
* AI-generated suggestions

Do not convert uncertainty into fact.

Examples:

* “Patient reports chest discomfort” must not become “Patient has heart disease.”
* “Possible infection” must not become “Confirmed infection.”
* “Rule out appendicitis” must not become “Appendicitis diagnosed.”

---

## SOAP Documentation

### Subjective

May include:

* Chief complaint
* Symptom history
* Onset, duration, and severity
* Aggravating and relieving factors
* Associated symptoms
* Medical, medication, allergy, family, and social history

### Objective

May include:

* Vital signs
* Physical examination
* Laboratory results
* Imaging
* Clinical measurements
* Clinician observations

### Assessment

May include:

* Primary diagnosis
* Differential diagnosis
* Clinical impression
* Severity
* Risk factors
* Coding considerations

### Plan

May include:

* Medication
* Procedure
* Investigation
* Referral
* Patient education
* Follow-up
* Warning signs
* Activity restrictions

AI should detect:

* Missing SOAP sections
* Insufficient detail
* Contradictions
* Missing allergy information
* Unsupported assessment
* Treatment without documented indication
* Diagnosis without supporting evidence
* Missing follow-up or precautions

AI must not invent information to complete a SOAP note.

---

## AI Clinical Summary

An AI Clinical Summary must:

* Use documented source data only
* Preserve uncertainty
* Highlight relevant symptoms, findings, diagnosis, treatment, and follow-up
* Include important allergies and medication context
* Identify missing information
* Avoid unsupported conclusions
* Remain labeled as AI-generated until reviewed

Recommended structure:

1. Presenting Problem
2. Relevant History
3. Significant Findings
4. Assessment
5. Treatment
6. Follow-up
7. Documentation Gaps

---

## Diagnosis and ICD Coding

AI may suggest ICD codes but must provide:

* Suggested code and description
* Coding system and version
* Supporting evidence
* Confidence
* Missing documentation
* Alternatives when appropriate
* Reason review is required

Differentiate:

* Confirmed diagnosis
* Suspected diagnosis
* Differential diagnosis
* Symptom or sign
* Historical condition
* Ruled-out condition

AI must not:

* Upcode severity
* Choose a code for reimbursement advantage
* Infer unsupported complications
* Convert symptoms into confirmed disease
* Submit final coding automatically

Final coding requires review by an authorized clinician or coder.

---

## Clinical Consistency

Check consistency between:

* Chief complaint
* SOAP note
* Diagnosis
* ICD code
* Procedure
* Prescription
* Laboratory or imaging results
* Medical certificate
* Claim information

Possible findings include:

* Medication without documented indication
* Procedure without supporting diagnosis
* ICD code inconsistent with assessment
* Certificate inconsistent with visit findings
* Severe diagnosis with limited evidence
* Claim diagnosis different from finalized diagnosis
* Medication conflicting with a documented allergy

Present findings as review signals, not confirmed error or fraud.

---

## Medication Safety

Prescription records should include:

* Medication name
* Generic name
* Strength
* Dose
* Route
* Frequency
* Duration
* Quantity
* Indication
* Prescriber
* Instructions

Safety checks should include:

* Allergy
* Drug interaction
* Drug-condition interaction
* Duplicate therapy
* Dose and frequency
* Duration
* Age-related risk
* Pregnancy-related risk when documented
* Renal or hepatic risk when documented
* High-risk medication
* Formulary or coverage constraints

Safety levels:

* Safe
* Warning
* Critical

Critical findings require immediate authorized review.

Alert overrides must record:

* Authorized user
* Reason
* Clinical justification
* Timestamp
* Audit record

AI must not independently start, stop, replace, or adjust medication.

The absence of recorded allergy information must not be interpreted as “No Known Allergies.”

---

## Medical Certificate

AI may generate a draft medical certificate containing:

* Patient information
* Encounter date
* Clinical statement
* Diagnosis where permitted
* Rest period
* Work or activity restriction
* Follow-up
* Clinician and organization
* Issue date
* Certificate identifier

AI must not:

* Fabricate a diagnosis
* Backdate a certificate
* Extend rest without evidence
* Sign for a clinician
* Automatically issue a final certificate

Lifecycle:

* Draft
* Reviewed
* Issued
* Reissued
* Voided

All issue, reissue, and void actions require audit history.

---

## Claim Readiness

Claim Readiness measures whether a case is sufficiently documented and consistent for claim processing.

It does not equal claim approval.

Recommended scoring:

* SOAP completeness: 25%
* Diagnosis and ICD consistency: 20%
* Prescription or procedure documentation: 15%
* Required evidence: 20%
* Insurance rule alignment: 10%
* Economic reasonableness: 10%

Statuses:

* Ready: 85–100 — พร้อมส่งเคลม
* Needs Review: 60–84 — ต้องตรวจสอบ
* Not Ready: 0–59 — ยังไม่พร้อม

Output must include:

* Total score
* Status
* Category breakdown
* Missing evidence
* Conflicts
* Risk indicators
* Rule findings
* Recommended next action
* Evidence sources
* Timestamp and version

A high score does not guarantee claim approval.

A low score does not prove claim invalidity.

---

## Missing Evidence

Detect missing evidence based on:

* Visit type
* Diagnosis
* Procedure
* Medication
* Payer rules
* Claim type
* Cost and risk
* Organizational policy

Examples:

* Incomplete SOAP
* Missing diagnosis or ICD code
* Missing prescription details
* Missing procedure note
* Missing certificate
* Missing laboratory or imaging result
* Missing attachment
* Missing consent
* Missing claim summary
* Missing cost justification
* Missing authorization or review

Each finding should include:

* Evidence item
* Required or recommended status
* Reason
* Source rule
* Severity
* Responsible role
* Recommended action

When evidence exists but cannot be verified, use **Unable to Verify**, not **Missing**.

---

## Evidence Completeness

Recommended scoring:

* SOAP: 25%
* Diagnosis and ICD: 25%
* Prescription or treatment: 15%
* Medical certificate: 15%
* Attachments: 10%
* Claim summary: 10%

Statuses:

* Complete: 90–100
* Review Needed: 70–89
* Incomplete: 0–69

Evidence Completeness and Claim Readiness are separate measures.

A complete case may still require review due to:

* Inconsistency
* Coverage uncertainty
* Clinical ambiguity
* High cost
* Missing approval
* High-risk treatment

---

## Evidence Package

An Evidence Package may contain:

* Patient and visit summary
* SOAP note
* Diagnosis and ICD
* Procedures
* Prescriptions
* Laboratory and imaging evidence
* Medical certificate
* Attachments
* Claim Readiness summary
* Missing Evidence summary
* Payer rule findings
* Economic summary
* Human review history
* Audit summary

The package must identify:

* Included and missing documents
* Document versions
* Source records
* Document status
* Generated timestamp
* Generated-by user or system
* Review status
* Package version

Never present an incomplete package as complete.

---

## Insurance and Payer Rules

Evaluate payer rules only from reliable, current, and versioned configurations.

Rules may include:

* Required evidence
* Eligible services
* Waiting period
* Exclusion
* Benefit limit
* Pre-authorization
* Referral
* Provider network
* ICD and procedure rules
* Cost threshold
* Documentation requirements

Recommended results:

* Likely Covered
* Review Required
* Likely Not Covered
* Unable to Determine

Avoid definitive coverage conclusions without authoritative payer confirmation.

Each result should include:

* Rule
* Rule version
* Source
* Effective date
* Outcome
* Explanation
* Missing data
* Human review requirement

---

## Economic Intelligence

Economic Intelligence may provide:

* Total visit cost
* Medication and procedure cost
* Expected cost range
* Benchmark comparison
* Cost variance
* Cost outlier
* Cost justification status
* High-cost indicator

Economic findings must support review and documentation.

They must not automatically deny clinically necessary care.

A cost outlier does not automatically indicate waste or fraud.

---

## Risk and Fraud Indicators

AI may identify review indicators such as:

* Duplicate claims
* Repeated services
* Unusual cost
* Diagnosis-procedure mismatch
* Inconsistent dates
* Duplicate patient identity
* Reused documentation
* Missing authorization
* Unusual medication patterns
* Frequent resubmission

Each finding should include:

* Indicator
* Supporting evidence
* Confidence
* Severity
* Possible benign explanation
* Recommended reviewer
* Recommended action

Treat findings as risk indicators, not confirmed fraud.

Do not use protected or irrelevant personal characteristics for risk decisions.

---

## Confidence and Explainability

Use confidence levels:

* High
* Medium
* Low
* Unable to Determine

Confidence should reflect:

* Data completeness
* Data consistency
* Source reliability
* Rule certainty
* Model certainty
* Data freshness

Material AI output should explain:

1. What was identified
2. Why it was identified
3. Supporting evidence
4. Missing information
5. Confidence
6. Recommended action
7. Required reviewer

Do not rely on explanations such as “the model predicted this.”

---

## Source Traceability and Versioning

AI outputs should reference source records, including:

* SOAP version
* Diagnosis record
* Prescription
* Laboratory result
* Attachment
* Payer rule version
* Cost record
* Review record

When source data changes, dependent assessments should become:

* Outdated
* Recalculation Required
* Superseded

Preserve version history for:

* SOAP notes
* Diagnoses
* Prescriptions
* Medical certificates
* Claim Readiness assessments
* Evidence Packages
* Payer rules
* AI summaries

Do not silently overwrite finalized records.

---

## Audit and Compliance

Audit important actions, including:

* Patient record access
* Record creation or update
* Consent changes
* SOAP, diagnosis, or prescription changes
* Alert overrides
* Certificate issue or void
* AI suggestion acceptance or rejection
* Claim Readiness calculation
* Evidence Package generation
* Claim status change
* Role or permission change
* Data export
* Sensitive data access

Audit records should include:

* User and role
* Organization
* Action
* Entity and identifier
* Timestamp
* Previous and new values
* Reason
* Source
* Correlation ID

Audit logs must be protected from unauthorized modification.

---

## Role-Based Access

Apply least-privilege access.

### Doctor

* Review and approve clinical records
* Confirm diagnosis and treatment
* Approve medical certificates
* Review AI Clinical suggestions

### Nurse

* Record observations
* Support visit workflow
* Escalate clinical concerns

### Pharmacist

* Review prescriptions
* Resolve medication alerts
* Record dispense status

### Clinic Staff

* Manage registration and visit administration
* Upload authorized documents
* Support evidence collection

### Claim Reviewer

* Review Claim Readiness
* Review evidence and consistency
* Request missing information

### Auditor or Compliance

* Review access history
* Review audit trails
* Investigate exceptions

### Administrator

* Manage users, roles, and configuration
* Must not automatically receive unnecessary clinical access

---

## Data Quality and Safety Escalation

Validate:

* Required fields
* Date and time logic
* Numeric ranges
* Code formats
* Duplicates
* Status consistency
* Missing references
* Organization scope
* Data freshness

Safety-critical examples:

* Severe allergy conflict
* Critical drug interaction
* Dangerous dose
* High-risk symptom
* Patient identity mismatch
* Critical test result
* Unauthorized clinical change
* Suspected privacy breach

For critical findings:

1. Display severity clearly
2. Show supporting evidence
3. Recommend immediate action
4. Identify responsible role
5. Require acknowledgment when appropriate
6. Create an audit record

Do not claim escalation occurred unless it was actually executed.

---

## AI Output Format

Use this structure when applicable:

### Finding

Concise issue or recommendation.

### Evidence

Supporting source data.

### Confidence

High, Medium, Low, or Unable to Determine.

### Risk or Impact

Clinical, claim, compliance, or operational effect.

### Missing Information

Required information not available.

### Recommended Action

Practical next step.

### Human Review

Required reviewer or approver.

### Disclaimer

State that AI output is decision support only.

---

## Prohibited Behavior

Never:

* Invent patient data
* Invent payer rules
* Invent test results
* Hide missing evidence
* Bypass authorization
* Bypass human review
* Change finalized records silently
* Ignore critical alerts
* Present suggestions as confirmed orders
* Present probability as certainty
* Approve claims autonomously
* Sign for clinicians
* Expose patient information unnecessarily
* Use production patient data in examples

---

## Error Handling

Healthcare errors must be safe and actionable.

Show:

* What failed
* Affected record
* Whether data was saved
* Whether retry is safe
* Recommended action
* Correlation ID

When AI assessment fails:

* Preserve source records
* Show **Assessment Unavailable**
* Do not generate placeholder scores
* Allow authorized retry
* Record the failure

---

## UI and Language

Healthcare interfaces must:

* Display patient context clearly
* Highlight allergies and critical risks
* Separate AI suggestions from verified data
* Show confidence and evidence
* Show ownership and review status
* Avoid relying on color alone
* Support accessibility and keyboard navigation

Language policy:

* English First
* Thai Support
* Approximately 70% English and 30% Thai

Use English for:

* Navigation
* Page titles
* Module names
* Clinical, AI, insurance, and compliance terms
* KPIs and statuses

Use Thai for:

* Helper text
* User guidance
* Validation
* Warnings
* Empty states
* Operational explanations

---

## Testing Requirements

Test at minimum:

* Normal workflow
* Missing and conflicting information
* Unauthorized access
* Cross-organization access
* Duplicate patient
* Allergy and interaction alerts
* Low-confidence AI output
* AI failure or timeout
* Human approval and rejection
* Version history
* Audit logging
* Finalized record protection

Claim Readiness boundaries:

* 0
* 59
* 60
* 84
* 85
* 100

Evidence Completeness boundaries:

* 0
* 69
* 70
* 89
* 90
* 100

Safety-critical workflows require functional tests, not only visual tests.

---

## Definition of Done

A healthcare feature is complete only when:

* Clinical workflow is correct
* Safety risks are addressed
* Authorization is enforced
* Human review is included where required
* AI output is labeled and explainable
* Confidence and evidence are shown
* Missing information is handled safely
* Audit and version history are preserved
* Validation and error states are implemented
* Privacy requirements are respected
* Critical scenarios are tested
* No autonomous clinical or claim decision is introduced

---

## Agent Rules

For every healthcare task:

1. Identify the user role and workflow.
2. Identify patient-safety impact.
3. Identify the authoritative source.
4. Identify required human review.
5. Preserve uncertainty.
6. Avoid unrelated changes.
7. Reuse existing types, schemas, services, and components.
8. Record important assumptions.
9. Implement the smallest safe change.
10. Escalate safety, privacy, compliance, and authorization conflicts.

When uncertain, choose a safe, reviewable, reversible, and auditable approach.

---

## Disclaimer

> AI-generated decision support. This output may be incomplete or inaccurate and must be reviewed by an authorized healthcare professional before use in diagnosis, treatment, medication, certification, or claim decisions.

> ข้อมูลจาก AI ใช้เพื่อสนับสนุนการตัดสินใจเท่านั้น ต้องได้รับการตรวจสอบจากบุคลากรทางการแพทย์หรือผู้มีอำนาจก่อนนำไปใช้จริง

---

## Final Principle

Med AI NexSure must make healthcare workflows safer, clearer, more complete, claim-ready, and auditable.

When uncertain:

* Do not fabricate
* Show the evidence
* Show the uncertainty
* Require human review
* Preserve the audit trail
* Prioritize patient safety
