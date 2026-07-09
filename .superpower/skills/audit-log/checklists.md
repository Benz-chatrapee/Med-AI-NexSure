# Audit Log Agent Checklists

## Audit Log Completeness Checklist

- [ ] Actor is captured.
- [ ] Action is captured.
- [ ] Target entity is captured.
- [ ] Timestamp is captured.
- [ ] Organization and clinic scope are captured when applicable.
- [ ] Source module is captured.
- [ ] Request ID and correlation ID are captured.
- [ ] Before and after values are captured when applicable.
- [ ] Changed fields are captured for material mutations.
- [ ] Reason or note is captured for overrides, void actions, role changes, and permission changes.
- [ ] AI prompt ID and prompt version are captured when AI is involved.
- [ ] AI model, confidence, and reasoning summary are captured when AI is involved.
- [ ] Human review status is captured when AI is involved.
- [ ] Sensitive data is minimized.
- [ ] Event can be searched and filtered.
- [ ] Event can support compliance investigation.
- [ ] Event can support claim dispute review.
- [ ] Event can support evidence package generation.

## Clinical Audit Checklist

- [ ] SOAP creation and changes are logged.
- [ ] SOAP note versions are created for material edits.
- [ ] Diagnosis and ICD changes are logged.
- [ ] AI clinical suggestions are logged.
- [ ] Accepted and rejected AI outputs are logged.
- [ ] Prescription safety checks are logged.
- [ ] Critical drug interaction warnings are logged.
- [ ] Pharmacist review actions are logged.
- [ ] Medical certificate issue and void actions are logged.
- [ ] Human reviewer identity is captured.
- [ ] Clinical AI output includes decision-support disclaimer and human review requirement.
- [ ] Patient, visit, clinician, and reviewer linkage is present.

## Insurance Audit Checklist

- [ ] Claim readiness scoring is logged.
- [ ] Score components are logged as structured summaries.
- [ ] Missing evidence detection is logged.
- [ ] Payer rule evaluation is logged.
- [ ] Coverage warning is logged.
- [ ] Override action requires reason.
- [ ] Evidence package generation is logged.
- [ ] Evidence package export is logged.
- [ ] PDF generation is logged.
- [ ] Reviewer decision is logged.
- [ ] Payer rule create/update actions are logged with version and reason.

## PDPA and Privacy Checklist

- [ ] Patient access is logged.
- [ ] Consent changes are logged.
- [ ] Data export is logged.
- [ ] Sensitive fields are masked where appropriate.
- [ ] Raw clinical text is not unnecessarily stored in audit logs.
- [ ] Raw AI prompts and outputs are not stored when they contain unnecessary patient data.
- [ ] Access to audit logs is role-restricted.
- [ ] Audit log retention is defined.
- [ ] Audit log deletion is restricted.
- [ ] Audit log access itself is logged for sensitive records.

## Security Checklist

- [ ] Login and logout are logged.
- [ ] Failed login is logged with safe metadata.
- [ ] Role assignment and removal are logged.
- [ ] Permission changes are logged.
- [ ] System configuration changes are logged.
- [ ] Suspicious patient access is logged.
- [ ] Audit tampering attempts are logged as critical events.
- [ ] Secrets, tokens, passwords, and API keys are never logged.
- [ ] Service account actions are identifiable and scoped.

## QA Checklist

- [ ] Unit tests cover audit payload validation.
- [ ] Unit tests reject missing actor, target, category, timestamp, and correlation ID.
- [ ] Integration tests verify log creation after key clinical, insurance, AI, export, access, and permission actions.
- [ ] E2E tests verify audit trail visibility for authorized roles.
- [ ] Negative tests verify missing actor is rejected.
- [ ] Negative tests verify raw sensitive data is not stored.
- [ ] Permission tests verify only authorized roles can view logs.
- [ ] Regression tests verify audit logs are not broken by feature changes.
- [ ] Claim dispute scenarios can retrieve linked evidence and event history.
- [ ] Compliance investigation scenarios can filter by patient, visit, actor, category, severity, and date.
