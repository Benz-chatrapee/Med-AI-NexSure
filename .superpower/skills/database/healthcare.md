# Healthcare Database Rules

## Patient Identity Protection

- Store patient identity fields only where needed.
- Scope patient records by organization and clinic when applicable.
- Avoid exposing patient identifiers through audit metadata, dashboard views, or public IDs.

## PDPA Consent Storage

- Store consent type, status, granted_at, revoked_at, expires_at, source, and actor.
- Link consent to patient and organization.
- Preserve consent history rather than overwriting important changes.

## Clinical Note Versioning

- Version clinical notes when submitted, amended, or reviewed.
- Preserve author, reviewer, timestamp, status, and reason.
- Do not mutate submitted historical notes silently.

## SOAP Note Storage

- Store Subjective, Objective, Assessment, and Plan sections with visit linkage.
- Track completeness, status, version, created_by, updated_by, reviewed_by, and timestamps.
- Audit material edits and status transitions.

## ICD Diagnosis Storage

- Store diagnosis text, ICD code when validated, source, confidence if AI-suggested, reviewer, and status.
- Keep suggested, accepted, edited, and rejected states separate.
- Do not store AI suggestions as confirmed diagnoses without human review.

## Prescription And Medication Safety Data

- Store prescriptions and prescription items separately.
- Link safety warnings, overrides, allergy checks, and interaction checks to source prescription items.
- Overrides require actor, reason, and audit event.

## Allergy And Interaction Traceability

- Store allergy status, reaction, severity, verification date, source, and unknown status where applicable.
- Store interaction check result, severity, source, and reviewer action.

## Medical Certificate Records

- Store certificate version, visit, clinician, generated_at, issued_at, status, reason, and document reference.
- Audit generation, issuance, voiding, and export.

## Clinical AI Output Traceability

- Store AI task, input references, output, confidence, explanation, disclaimer, model metadata when allowed, and review status.
- Link to patient, visit, SOAP note, diagnosis, prescription, certificate, or claim as appropriate.

## Human Review Status Storage

- Use explicit statuses such as pending_review, accepted, edited, rejected, escalated.
- Store reviewer, reviewed_at, and reason.

## Clinical Audit Events

- Audit patient updates, consent changes, SOAP edits, ICD review, prescription safety override, certificate issuance, and AI output review.

## Prohibited Storage Assumptions

- Do not assume missing clinical data is negative evidence.
- Do not store unreviewed AI output as clinician-approved.
- Do not hard-delete regulated clinical history by default.
- Do not store unnecessary PHI in logs or AI metadata.
