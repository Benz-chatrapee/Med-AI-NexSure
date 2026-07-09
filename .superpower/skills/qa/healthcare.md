# Healthcare QA Rules

## Patient Data Validation
Validate required demographics, contact fields, consent status, identifiers, safe error messages, and no unnecessary PHI exposure.

## HN Uniqueness
Verify duplicate HN detection within the correct organization/clinic scope and safe handling of concurrent creation.

## PDPA Consent
Validate consent capture, consent status display, restricted access when consent is absent or expired, and audit trail.

## Visit Lifecycle
Verify valid transitions: Waiting, In Consultation, Pharmacy, Completed, Pending Evidence, and Claim Review. Invalid skips or reversions require permission and audit reason.

## SOAP Completeness
Validate subjective, objective, assessment, plan, required fields, save/edit/autosave, version history, and completeness indicators.

## Diagnosis and ICD Validation
Confirm ICD suggestions are evidence-supported, clinician-reviewed, traceable, and never invented by QA or the AI.

## Medication Safety
Validate medication entry, duplicate medication warning, contraindication warning, dosage validation, and pharmacist review workflow.

## Allergy Alert
Verify allergy data triggers visible warnings, blocks unsafe workflow where required, and logs override reason if override is allowed.

## Medical Certificate
Validate source data, required fields, doctor authority, generated content, export, versioning, and audit log.

## Clinical Summary
Validate summaries are grounded in visit/SOAP evidence, include uncertainty and disclaimer, and require clinician review.

## Doctor Review Requirement
Clinical AI, ICD suggestion, prescription warning override, and medical certificate workflows require authorized clinician review where applicable.

## Clinical Disclaimer
AI outputs must state decision-support status and must not present final diagnosis, prescription, or medical authority.

## Human-in-the-Loop Behavior
Validate accept, reject, edit, and review actions are attributable to a human actor with timestamp and reason when required.

## Clinical Safety Escalation
Escalate unsafe AI output, missed allergy warning, missed interaction warning, incorrect patient data, or unsupported diagnosis as High or Critical.

## Audit Trail for Clinical Actions
Clinical material actions must log actor, timestamp, action, entity, reason, before, after, source, and outcome.
