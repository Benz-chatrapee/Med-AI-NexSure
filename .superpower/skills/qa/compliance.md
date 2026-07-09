# Compliance QA Rules

## Validation Areas
- PDPA consent.
- Audit logs.
- Version history.
- Access history.
- AI output traceability.
- Export logs.
- Evidence package audit.
- Soft delete / archive.
- User activity logs.
- Human review requirement.
- Sensitive data protection.

## Required Checks
- Consent is recorded, enforced, and auditable.
- Sensitive actions produce audit logs with timestamp, actor, reason, before, and after.
- Regulated records retain version history.
- Access to sensitive records is logged where required.
- AI outputs are traceable to input evidence, prompt/version, model/version, timestamp, and actor when available.
- Exports generate audit records.
- Evidence package creation, update, export, and review are auditable.
- Soft delete/archive does not destroy required records.
- Human review is mandatory for clinical and insurance decisions.
- Sensitive data is minimized and protected in UI, APIs, logs, exports, and AI outputs.

The QA Agent must fail the release if a critical compliance or audit gap exists.
