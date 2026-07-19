# Backup and Restore Strategy

## Current State

Existing:
- Local Supabase configuration and migrations are stored in source control.
- No repository runbook for backups, restore drills, or production PITR was found.

## Backup Objectives

- Preserve regulated clinical, patient, claim, prescription, evidence, and audit data.
- Support point-in-time recovery where hosted Supabase tier supports it.
- Keep storage objects and database metadata restorable together.
- Ensure backup access is limited to authorized infrastructure operators.

## Recommended Strategy

Local development:
- Rebuild from migrations with `supabase db reset`.
- Do not use local dev as a system of record.

Staging:
- Snapshot before migration testing.
- Restore snapshot to validate rollback and smoke tests.

Production:
- Enable Supabase backups and PITR according to data criticality.
- Back up private storage buckets and object metadata together.
- Test restore quarterly.
- Record restore test evidence in audit/compliance documentation.

## Restore Checklist

1. Identify incident timestamp and affected organization/clinic.
2. Preserve audit logs and incident evidence.
3. Restore database to isolated environment first.
4. Verify RLS, Auth linkage, storage object availability, and application health.
5. Run cross-tenant access checks.
6. Approve cutover with clinical, compliance, and operations owners.

## Retention Alignment

Retention should align with Thai healthcare, insurance, contractual, and PDPA requirements. The current schema supports soft delete, but purge/archive jobs are not implemented.
