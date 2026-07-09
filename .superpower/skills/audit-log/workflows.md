# Audit Log Agent Workflows

## Workflow 1: Audit Log Design Review

1. Identify feature or workflow.
2. Identify critical user actions.
3. Identify critical system actions.
4. Identify AI-generated actions.
5. Define event categories.
6. Define required payload fields.
7. Define before and after capture.
8. Define severity and risk level.
9. Define retention and privacy handling.
10. Define QA test cases.
11. Produce handoff to Backend, Database, QA, and Compliance Guard.

Output: Audit Log Agent Output with event table, missing coverage, sensitive data handling, QA tests, and handoffs.

## Workflow 2: Clinical Audit Workflow

Use for SOAP, diagnosis, ICD, prescription, AI clinical summary, medical certificate, and human review.

1. Identify clinical record and linked patient, visit, clinician, and reviewer.
2. Separate user-authored clinical changes from AI-generated suggestions.
3. Log SOAP creation, SOAP update, and SOAP version creation.
4. Log diagnosis and ICD suggestion generation, acceptance, rejection, or manual update.
5. Log prescription creation/update and drug interaction check results.
6. Log pharmacist review and critical warning disposition.
7. Log medical certificate draft, issue, and void actions with reason.
8. Require human review status for clinical AI and high-risk alerts.
9. Mask raw clinical text in audit payloads; reference versioned clinical records instead.
10. Handoff clinical safety concerns to Compliance Guard and QA.

## Workflow 3: Insurance Audit Workflow

Use for claim readiness, payer rule evaluation, missing evidence, evidence package, export, override, and reviewer action.

1. Identify visit, claim context, payer rule version, evidence package, and reviewer role.
2. Log claim readiness calculation with component summary and correlation ID.
3. Log missing evidence detection with evidence type and source references.
4. Log payer rule evaluation with rule ID, rule version, result, and uncertainty.
5. Log coverage warnings and economic alerts without guaranteeing coverage or payment.
6. Log evidence package generation and export with PDF/report references.
7. Require reason and before/after state for overrides.
8. Record reviewer action as human decision support, not automatic claim approval.
9. Validate audit trail supports claim dispute and payer review.
10. Handoff implementation to Backend/Database and test cases to QA.

## Workflow 4: AI Audit Workflow

Use for prompt ID, prompt version, model, input reference, output summary, confidence, disclaimer, acceptance/rejection, and human review.

1. Identify AI feature, model, provider, prompt ID, and prompt version.
2. Capture input references to patient, visit, SOAP, claim, evidence, or payer rules without duplicating raw data.
3. Log `PROMPT_USED` when a material prompt is executed.
4. Log `AI_OUTPUT_GENERATED` with safe output summary, confidence, reasoning summary, and disclaimer status.
5. Mark `human_review_required` based on clinical, claim, privacy, or financial impact.
6. Log `AI_OUTPUT_ACCEPTED` or `AI_OUTPUT_REJECTED` when a human reviewer acts.
7. Preserve correlation ID across the UI action, backend request, AI call, and audit event.
8. Flag missing prompt version, model, confidence, or review status as AI governance gaps.

## Workflow 5: Security and Privacy Audit Workflow

Use for login, failed login, role change, permission change, data export, patient access, and suspicious activity.

1. Identify actor, role, tenant, clinic, session, IP address, user agent, and source module.
2. Log login, logout, failed login, session anomaly, and suspicious access events.
3. Log patient access with patient reference, purpose/source module, and role.
4. Log role assignment, role removal, and permission change with before/after state and reason.
5. Log data export and PDF generation with destination type and file/report reference.
6. Mark patient, consent, clinical, and export events as PDPA-sensitive.
7. Prohibit secrets, passwords, tokens, and raw export contents from audit payloads.
8. Escalate repeated failed logins, unauthorized access, or audit tampering as high or critical severity.
9. Handoff RLS, access control, and audit viewer restrictions to Database and Backend.
