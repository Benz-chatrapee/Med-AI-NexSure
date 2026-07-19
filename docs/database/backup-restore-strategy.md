# Backup and Restore Strategy

## 1. Document Control
Status: Populated for DB-DOC-BATCH-7-ARCHITECTURE. Documentation only. RPO/RTO values are Review Required until formally approved.

## 2. Purpose
Defines practical backup and restore operations for PostgreSQL/Supabase data, private storage objects, migrations, configuration, and verification evidence.

## 3. Scope
Includes local, automated test, staging, and production environments. Does not invent provider capabilities or include secrets.

## 4. Environment-specific Strategy
Each environment has different data criticality. Local and test are rebuildable from migrations; staging validates releases; production requires provider-backed backup and restore operations approved by operations, security, clinical, and compliance owners.

## 5. Local Environment
Use migrations and fictional seed data only. Local reset is validation, not a backup strategy.

## 6. Automated Test Environment
Rebuild from migrations per pipeline. Preserve test logs, migration output, and generated schema evidence when required for release sign-off.

## 7. Staging Environment
Take snapshots or provider-supported backups before migration rehearsal. Restore to isolated staging before release approval.

## 8. Production Environment
Production backup capability, PITR, storage backup, retention, RPO, and RTO require formal provider and business approval. Do not document production credentials.

## 9. Database Backup
Back up PostgreSQL schema, data, functions, RLS policies, grants, auth-linked application profile data, and migration history using approved provider tooling.

## 10. Supabase Storage or Object Storage Backup
Back up private buckets and object metadata consistently with database rows: `patient-documents`, `evidence-files`, `medical-certificates`, `organization-assets`, and `integration-files`.

## 11. Configuration Backup
Preserve reviewed configuration such as Supabase local config, environment variable names, migration settings, storage bucket definitions, and deployment configuration. Do not store secrets in docs.

## 12. Migration Preservation
Migrations are source-controlled. Restore validation must confirm migration order and schema version match the intended restore point.

## 13. Seed Preservation
`supabase/seed.sql` is referenced by current QA docs as absent. Seed data must be fictional and environment-specific.

## 14. Backup Frequency Categories
Review Required: production frequency. Suggested categories for approval: continuous/PITR where supported, daily full logical/snapshot, pre-migration snapshot, and monthly restore rehearsal artifact.

## 15. Retention Categories
Review Required: retention by data class. Categories: operational, clinical, audit, evidence export, storage object, configuration, and release evidence retention.

## 16. Encryption
Backups must be encrypted at rest and in transit using provider-approved controls. Key access must be restricted and audited.

## 17. Access Control
Only authorized infrastructure/security operators can access backups. Access to restored data must maintain minimum necessary controls.

## 18. Backup Integrity
Capture backup job ID, timestamp, source environment, checksum or provider integrity evidence, migration version, storage manifest, and operator approval.

## 19. Restore Authorization
Production restore requires incident/change record, clinical/compliance approval when PHI is affected, security approval, operations owner, and audit entry.

## 20. Restore Runbook
1. Declare incident and restore objective.
2. Identify restore point and affected data classes.
3. Restore to isolated environment first.
4. Reconcile database and storage objects.
5. Validate RLS, grants, functions, role mappings, and storage policies.
6. Validate clinical, evidence, audit, and version integrity.
7. Approve cutover or targeted remediation.
8. Record evidence and sign-off.

## 21. Point-in-time Recovery Readiness
PITR is Review Required because provider/tier capability is not verified in repository. Do not claim PITR exists until environment evidence is available.

## 22. Full Restore
Full restore should rebuild database and storage for a target environment, then run post-restore validation before user access.

## 23. Partial Restore
Partial restore is high risk. Use isolated restore plus controlled data extraction; never bypass tenant isolation or audit.

## 24. Tenant-specific Restore Limitations
Tenant-specific restore may not be safely possible without architecture support for tenant-scoped export/import, object manifests, FK closure, and audit reconciliation. Mark Review Required.

## 25. Object-storage Reconciliation
Compare database metadata to storage objects for missing rows, missing objects, checksum mismatch, orphan objects, and stale signed URLs.

## 26. Audit-log Integrity
Post-restore audit logs must remain intact. Restore operations themselves require audit evidence. Audit deletion or truncation is not acceptable normal recovery behavior.

## 27. Clinical-record Integrity
Validate patients, visits, SOAP, diagnosis, prescriptions, certificates when implemented, and signed/amended records against expected versions.

## 28. Version-history Integrity
Validate `soap_note_versions`, claim assessment versions, evidence package versions, organization setting versions, and Future clinical version tables.

## 29. Post-restore RLS Validation
Run positive and negative authenticated RLS checks for organization, clinic, patient, visit, SOAP, prescription, claim, evidence, audit, and settings access.

## 30. Post-restore Grant Validation
Confirm grants on RLS helper functions and tables match migrations. Do not use `service_role` to prove normal-user access.

## 31. Post-restore Authorization Validation
Validate seeded/current roles, permissions, memberships, `user_role_assignments`, and compatibility with legacy `user_roles`.

## 32. Deleted-data Reintroduction Risk
Restores can reintroduce deleted or revoked data. Validate `deleted_at`, revocations, suspensions, and consent state before returning data to active use.

## 33. External Integration Reconciliation
Reconcile payer integrations, webhook state, storage references, and any exported packages. Integration credentials must be reattached securely outside documentation.

## 34. Restore Testing Schedule
Review Required: minimum schedule. Recommended categories: pre-release staging restore, quarterly production-like restore drill, and incident-triggered restore rehearsal.

## 35. Evidence and Sign-off
Store restore evidence: commands or provider job IDs, timestamps, operator, reviewer, validation results, exceptions, and sign-off.

## 36. Failure Handling
If restore validation fails, keep environment isolated, preserve evidence, block cutover, notify owners, and open remediation.

## 37. Compatibility-sensitive Dependencies
Supabase version, PostgreSQL major version, migration order, auth user/profile linkage, private bucket names, RLS helper grants, storage policies, and canonical permission keys.

## 38. Review Required Decisions
RPO, RTO, production backup frequency, retention, PITR availability, object-storage backup tooling, tenant restore support, restore approvers, and sign-off repository.

## Object Classification
| Classification | Items |
|---|---|
| Existing | migrations, local Supabase config, private buckets, soft-delete columns |
| Planned | restore runbook, post-restore RLS/grant/auth validation |
| Future | automated backup evidence registry, restore drill automation |
| Review Required | RPO/RTO, PITR, tenant restore, retention |
| Compatibility Sensitive | migration order, auth/profile IDs, bucket names, RLS helper grants |
