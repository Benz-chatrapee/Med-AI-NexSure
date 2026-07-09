# Compliance Audit Rules

## PDPA Audit Principles

- Log access, consent, export, disclosure, correction, and administrative actions involving patient data.
- Mark patient, clinical, consent, evidence, and export events with `pdpa_sensitive = true`.
- Minimize audit payloads and prefer record references over copied sensitive content.
- Restrict audit log access by role, tenant, clinic, purpose, and need to know.

## OIC Insurance Audit Principles

- Preserve claim readiness, evidence package, payer rule evaluation, reviewer action, export, and override traceability.
- Do not represent AI output or readiness score as claim approval, denial, coverage guarantee, or payment guarantee.
- Retain claim-related audit records according to organizational policy and dispute needs.

## Access Logging

- Log patient access and sensitive audit log access.
- Capture actor, role, organization, clinic, source module, target patient, purpose/source page when available, timestamp, IP address, user agent, request ID, and correlation ID.

## Consent Logging

- Log consent create and update actions with consent type, status, actor, patient reference, before/after status, timestamp, and source module.
- Do not store full signed consent artifacts in the audit event; reference the consent record.

## Data Minimization

- Store event facts, references, field names, masked summaries, and version IDs.
- Avoid raw clinical notes, full claim files, full AI prompts/outputs, identity documents, credentials, and export contents.

## Masking and Redaction

- Mask direct identifiers in broad audit views.
- Use role-specific reveal controls for authorized investigation views.
- Redact secrets and security credentials entirely.

## Retention Principle

- Apply retention by risk, event category, legal hold, claim dispute, and clinical record linkage.
- Preserve high-risk clinical, claim, consent, export, and security events for investigation readiness.
- Ordinary users must not delete audit events.

## Tamper Resistance

- Use append-only writes for material events.
- Record corrections as new events.
- Restrict update/delete privileges.
- Consider immutable storage, hash chaining, or write-once archive for regulated deployments.

## Separation of Duty

- Users who perform high-risk actions should not be the only approvers of related audit corrections or deletions.
- Administrative role changes and audit retention changes require privileged review and reason capture.

## Role-Based Access to Audit Logs

- Clinicians may view relevant clinical audit history for their permitted patients/visits.
- Claim reviewers may view claim and evidence audit history within assigned scope.
- Compliance and security reviewers may view broader audit data according to policy.
- Audit log views must respect organization, clinic, role, and patient data access boundaries.

## Export Audit

- Log all data exports, report generation, and PDF generation.
- Capture actor, reason/purpose, destination type, file/report reference, filter scope, patient/visit references, timestamp, and `DATA_EXPORT` tag.
- Do not log raw export contents.

## Security Alert Audit

- Log security alerts with severity, source, actor if known, affected entity, detection reason, and investigation status.
- Treat audit tampering, unauthorized patient access, repeated failed login, and privilege escalation attempts as high or critical risk.

## Investigation Support

- Audit logs must support filtering by patient, visit, actor, event category, severity, risk, compliance tag, source module, date range, correlation ID, and request ID.
- Investigation exports must themselves create audit events.

## Recommended Compliance Tags

- `PDPA`
- `OIC`
- `CLINICAL_SAFETY`
- `CLAIM_REVIEW`
- `AI_GOVERNANCE`
- `SECURITY`
- `ACCESS_CONTROL`
- `DATA_EXPORT`
- `FINANCIAL_IMPACT`
- `HUMAN_REVIEW`
