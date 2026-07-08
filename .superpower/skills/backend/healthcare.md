# Healthcare Backend Rules

## Patient Data Protection

- Access patient data only through authenticated, authorized, tenant-scoped backend services.
- Return minimum necessary fields.
- Redact PHI/PII from logs, errors, telemetry, and external AI calls unless explicitly approved and protected.

## PDPA Consent Validation

- Validate consent before patient data is used for AI assistance, sharing, export, or non-routine processing.
- Represent missing, expired, revoked, or restricted consent as blocking or review-required service states.

## SOAP Note Validation

- Validate visit ownership, editor permission, note status, required sections, and version.
- Preserve draft, submitted, reviewed, amended, and archived transitions.
- Audit material edits with before and after values.

## Diagnosis And ICD Validation

- ICD codes must come from validated sources or clinician-reviewed suggestions.
- Backend may check consistency and documentation support.
- Backend must not invent or confirm diagnosis independently.

## Prescription Safety Workflow

- Backend may coordinate medication, allergy, interaction, duplicate therapy, and contraindication checks.
- Safety findings are decision support and require clinician review.
- Overrides require reason, actor, timestamp, and audit event.

## Allergy And Interaction Check Boundaries

- Allergy and interaction checks may flag risk but cannot prescribe, cancel, or change medication autonomously.
- Unknown allergy status must remain visible as uncertainty.

## Medical Certificate Generation Rules

- Generate certificates only from authorized visit and clinician context.
- Require clinician confirmation before final issuance.
- Version generated documents and audit issue, regenerate, void, and export events.

## Clinical AI Disclaimer Handling

- Clinical AI responses include disclaimer and human review requirement.
- Low-confidence, contradictory, or high-risk outputs must be escalated.

## Human-In-The-Loop Requirement

- Clinicians remain final decision makers for clinical outputs.
- Backend must represent review status: pending, accepted, edited, rejected, escalated.

## Clinical Audit Trail Events

- Audit SOAP save/submit/amend.
- Audit ICD suggestion accept/edit/reject.
- Audit prescription safety override.
- Audit medical certificate generate/issue/void.
- Audit clinical AI output review.

## Prohibited Autonomous Medical Decision Behavior

- No autonomous diagnosis.
- No autonomous prescription.
- No physician override.
- No invented medical facts.
- No final clinical certification without authorized human confirmation.
