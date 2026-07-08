# Solution Architect Examples

## Example 1: Claim Readiness Architecture

Input:

> Design architecture for Claim Readiness Score based on SOAP, Diagnosis, ICD, Prescription, Evidence, Insurance Rule, and Economic signals.

Expected Output:

- Architecture summary: readiness score is decision support for claim reviewers, not claim approval.
- Modules: visit, SOAP, diagnosis/ICD, prescription, evidence package, payer rules, readiness scoring, audit, reviewer workflow.
- Data flow: visit documentation feeds validation, payer rule evaluation, score generation, explanation, reviewer queue, and audit.
- Services: readiness calculation service, evidence completeness service, payer rule evaluation service, audit logging service.
- Audit points: score generated, rule executed, missing evidence detected, reviewer action, override.
- Human review points: low confidence, high risk, payer rule uncertainty, reviewer override.
- MVP scope: basic score, missing evidence list, explanation, audit log, reviewer status.

## Example 2: Evidence Package Architecture

Input:

> Design architecture for generating an Evidence Package for a visit.

Expected Output:

- Workflow: trigger from visit or claim readiness, collect evidence, check completeness, generate package, prepare export, handoff to reviewer.
- Required data: visit, SOAP, diagnosis, ICD suggestions, prescription, attachments, payer evidence rules, reviewer notes.
- Evidence completeness: required, optional, missing, incomplete, stale, conflicting.
- Export responsibility: backend package generation with access control and audit, frontend display/download action.
- Audit log: package generated, regenerated, exported, reviewed, missing evidence acknowledged.
- Reviewer handoff: queue item with package status, gaps, risk level, and action history.

## Example 3: AI Clinical Summary Architecture

Input:

> Design architecture for AI-generated SOAP summary.

Expected Output:

- Input boundary: visit documentation and allowed clinical notes only, with minimum necessary data.
- AI service: prompt/model versioned clinical summary service.
- Confidence logic: confidence and explanation stored with low-confidence routing.
- Review workflow: clinician reviews, edits, accepts, rejects, or requests regeneration.
- Disclaimer: AI output is decision support and does not replace licensed clinical judgment.
- Audit trail: input scope, output, confidence, prompt version, model version, review action, before, after.

## Example 4: Prescription Safety Architecture

Input:

> Design architecture for drug allergy and interaction warnings.

Expected Output:

- Data entities: patient allergies, medication orders, medication reference source, interaction rules, warnings, acknowledgements.
- Safety rules: allergies, contraindications, interactions, duplicate therapy, severity levels.
- Warning levels: informational, caution, serious, critical.
- Pharmacist review queue: serious and critical warnings routed for review when configured.
- Audit trail: warning generated, displayed, acknowledged, overridden, reviewed.
- Claim readiness impact: unresolved critical warnings may lower readiness and require explanation.

## Example 5: User Access and Audit Architecture

Input:

> Design architecture for role-based access and audit logging.

Expected Output:

- Roles: clinician, nurse, claim reviewer, compliance officer, administrator, auditor.
- Permissions: role-based module actions, least privilege, sensitive access controls.
- RLS consideration: patient, visit, claim, evidence, audit, and tenant boundaries.
- Access logs: sensitive view, create, update, export, delete, AI generation, reviewer action.
- Sensitive actions: PHI/PII access, evidence export, rule changes, override, clinical signoff.
- Compliance reporting: access history, audit event search, traceability, retention, exception reports.
