# Audit and Versioning Strategy

## Audit Objectives

- Record who did what, when, where, why, and with what outcome.
- Preserve traceability for clinical, prescription, claim, evidence, RBAC, settings, and export actions.
- Avoid unnecessary PHI/PII in audit JSON payloads.
- Support PDPA-aware access review and incident investigation.

## Existing Audit Objects

Existing:
- `audit_logs`
- `soap_note_versions`
- `organization_setting_versions`
- claim readiness `assessment_version`
- evidence package `package_version`
- actor columns on mutable tables: `created_by`, `updated_by`, `deleted_by`

## Audit Event Coverage

Existing enum actions:
- create, read, update, delete, view, export, login, permission_change, clinical_review, claim_review, evidence_change, dashboard_viewed, filters_applied.

Required future audit actions:
- password reset requested
- password reset completed
- role assignment created/revoked
- AI suggestion accepted/rejected/edited
- clinical record signed/amended
- prescription alert overridden
- evidence package submitted
- storage object downloaded/shared

## Versioning Rules

Existing:
- SOAP note versions require positive version number and change reason.
- Claim readiness assessments use visit/version uniqueness.
- Evidence packages use visit/package version uniqueness.
- Organization setting versions snapshot setting rows with reason.

Proposed:
- Signed clinical records should become immutable except through controlled amendment.
- Amendments should create a new version, retain the previous version, require reason, actor, timestamp, and optional approval.
- Evidence package submission should create a package version snapshot with checksum and immutable storage reference.

## Retention

Existing:
- Compliance settings include audit and clinical record retention fields.

Gap:
- No purge/archive job exists.
- No backup/restore retention runbook exists.

## Audit Data Minimization

Use `old_value` and `new_value` only for minimized fields needed to explain a change. Avoid storing full SOAP notes, full document content, medication detail beyond needed identifiers, passwords, tokens, secrets, or raw payer documents in audit JSON.
