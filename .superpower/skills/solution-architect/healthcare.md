# Healthcare Architecture Guidance

## Patient Management Architecture

- Define patient profile, identifiers, consent status, access boundaries, and audit history.
- Minimize sensitive data exposure by module and role.
- Use RLS-ready boundaries for patient records.
- Audit create, update, merge, export, and sensitive view events.

## Visit Management Architecture

- Treat visits as the workflow anchor for SOAP notes, clinical summary, diagnosis, prescription, evidence, and claim readiness.
- Track visit status, clinician ownership, review state, and linked documents.
- Ensure visit updates produce audit events with before, after, actor, timestamp, and reason.

## SOAP Note Architecture

- Separate SOAP capture, validation, AI assistance, human review, and final clinician signoff.
- Preserve version history for generated and edited notes.
- Keep SOAP completeness traceable to claim readiness and evidence package workflows.

## Diagnosis and ICD Architecture

- AI may suggest ICD candidates only when supported by documentation and must provide explanation and confidence.
- The architecture must preserve clinician review before codes are treated as final.
- Do not invent ICD codes or unsupported diagnoses.
- Audit suggestion generation, selection, rejection, and override.

## Prescription Safety Architecture

- Support allergy, contraindication, duplicate therapy, and interaction warning architecture through governed rule/data sources.
- Treat warnings as decision support requiring clinician or pharmacist review based on severity.
- Audit warning display, acknowledgement, override, and review notes.

## Medical Certificate Architecture

- Generate certificate drafts only from documented visit facts and authorized clinician actions.
- Require human review and signoff.
- Audit draft generation, edits, export, and signature events.

## AI Clinical Summary Architecture

- Use only allowed clinical inputs.
- Capture prompt version, model version, input scope, output, confidence, explanation, disclaimer, and review status.
- Route low-confidence or high-risk output to clinician review.
- Preserve the boundary that AI never replaces licensed clinical judgment.

## Clinical Audit Trail

- Required fields include timestamp, actor, reason, entity, before, after, source module, correlation ID, and review status.
- Clinical changes, AI outputs, reviewer actions, safety warnings, exports, and overrides must be traceable.

## Clinical Safety Guardrails

- AI never diagnoses patients.
- AI never prescribes medication independently.
- AI never overrides physicians.
- AI may summarize, suggest, detect inconsistencies, and recommend documentation improvements.
- Include confidence and uncertainty where appropriate.

## Human Review Requirements

- Require clinician review for diagnosis, ICD finalization, prescription safety, medical certificate finalization, high-risk summaries, and low-confidence clinical AI output.
- Preserve reviewer identity, action, timestamp, and rationale.

## Sensitive Data Protection

- Use minimum necessary data for workflows and AI prompts.
- Apply role-based access and RLS-ready data boundaries.
- Avoid exposing PHI, PII, or PDPA protected information in logs, prompts, exports, or client-side state unless explicitly required and protected.
