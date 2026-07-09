# QA Workflows

## Patient To Visit Workflow
Validate patient identity, PDPA consent, duplicate prevention, visit creation, visit ownership, role access, clinic scope, status transitions, and audit logs.

## SOAP Documentation Workflow
Validate subjective, objective, assessment, and plan completeness; draft/save/submit behavior; version history; human review; AI summary traceability; and audit events.

## AI Clinical Workflow
Validate input evidence, prompt/version traceability, confidence, explanation, uncertainty, disclaimers, human review reminders, and safety boundaries. AI must support clinicians and must not make final clinical decisions.

## Diagnosis And ICD Workflow
Validate diagnosis entry, ICD-10 suggestion linkage, evidence support, confidence, alternatives, clinician confirmation, change history, and audit logs. AI must not invent ICD codes.

## Prescription Safety Workflow
Validate medication data, allergies, contraindications, drug interaction alerts, severity, clinician acknowledgement, pharmacist visibility, and audit events. Missing critical alerts are release blockers.

## Medical Certificate Workflow
Validate visit linkage, clinical evidence, date ranges, authorized issuer, draft generation, human review, finalization, export logs, and version history.

## Claim Readiness Workflow
Validate this path:
Completed Visit -> Claim Readiness Score -> Missing Evidence -> Payer Rule Result -> Evidence Package -> Claim Review.

Checks:
- Completed visit contains required clinical documentation.
- Claim readiness score uses approved weights.
- Missing evidence detection identifies absent or weak documentation.
- Payer rule results cite configured rules and avoid invented policy.
- Evidence package includes required documents, summaries, audit trail, and version history.
- Claim reviewer can review but cannot automatically approve claims through AI.

## Evidence Package Workflow
Validate package completeness, evidence sources, missing evidence, generated summaries, export permissions, reviewer notes, package versioning, and package audit trail.

## Insurance Review Workflow
Validate reviewer queue, risk level, coverage indicators, waiting period, exclusions, benefit limits, claim alerts, reviewer decision support, and handoff to authorized human decision makers.

## Audit And Compliance Workflow
Validate sensitive actions produce audit logs with timestamp, actor, reason, before, after, module, record ID, organization, and clinic scope. Validate PDPA consent, access history, export logs, and human review requirements.

## User Management Workflow
Validate user invitation, role assignment, role change, deactivation, clinic membership, organization scope, admin-only actions, RLS impact, and audit logs.

## Release QA Workflow
Validate scope, requirements traceability, test coverage, open defects, regression results, UAT status, security, compliance, audit, AI safety, clinical safety, insurance scoring, demo readiness, and final release recommendation.
