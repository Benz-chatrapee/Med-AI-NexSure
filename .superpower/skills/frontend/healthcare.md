# Healthcare Frontend Rules

## Patient Privacy Display Rules

- Show minimum necessary patient data for the current task.
- Mask or hide sensitive identifiers when not required.
- Avoid PHI in toasts, logs, URLs, browser titles, and global navigation.

## PDPA Consent Visibility

- Display consent status where patient data is viewed, shared, exported, or used for AI assistance.
- Show missing, expired, restricted, or revoked consent as blocking or review-required states.

## SOAP Note UI

- Separate Subjective, Objective, Assessment, and Plan clearly.
- Track completeness, missing sections, unresolved contradictions, and last edited actor.
- Require audit-aware save behavior for material edits.

## Diagnosis And ICD Display

- ICD suggestions are suggestions only.
- Show source documentation, confidence, uncertainty, and reviewer action.
- Never invent or present unsupported codes as confirmed.

## Prescription Safety Display

- Display medication, dose, route, frequency, duration, prescriber, and safety flags.
- Prescription AI may highlight risks but never independently prescribe.

## Allergy Banner

- Keep allergy information persistent in clinical workflows.
- Include severity, reaction, last verified date, and unknown status when applicable.

## Drug Interaction Warning

- Use high-visibility warning treatment.
- Show interaction type, severity, source, and required clinician review.
- Require reason capture for override.

## Clinical AI Disclaimer

- State that AI assists documentation and review only.
- The authorized clinician remains responsible for clinical decisions.

## Human-In-The-Loop Confirmation

- Require explicit review for AI-generated summaries, ICD suggestions, medication risks, and high-risk warnings.
- Capture reviewer, timestamp, decision, and reason.

## Medical Certificate UI

- Show patient, visit, clinician, date range, restrictions, and issuance status.
- Require clinician confirmation and audit trail before final output.

## Clinical Audit Trail Visibility

- Show changes to SOAP notes, summaries, ICD suggestions, warnings, overrides, and generated documents.
- Include before/after values when clinically material.
