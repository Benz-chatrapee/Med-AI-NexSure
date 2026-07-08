# Database Checklists

## Table Readiness Checklist

- Table purpose and owner domain are clear.
- Primary key, foreign keys, timestamps, status, and lifecycle fields are defined.
- Tenant scope is explicit.
- Sensitive fields are identified.
- Audit, retention, archive, and versioning needs are covered.

## Migration Readiness Checklist

- Migration is additive where possible.
- Existing data impact is understood.
- Backfill and validation steps are separated when risky.
- Rollback note exists.
- Verification query exists.

## RLS Checklist

- RLS is enabled for sensitive and tenant-scoped tables.
- Policies enforce organization, clinic, role, permission, and ownership where applicable.
- Consent scope is considered for patient data.
- Insert/update `with check` policies match read scope.
- Denied and allowed scenarios are testable.

## Index Checklist

- Foreign keys are indexed where needed.
- Common filters and joins are covered.
- Composite indexes match high-frequency scoped queries.
- Dashboard/reporting views are considered.
- Write-heavy table index cost is reviewed.

## Constraint Checklist

- Required fields are `not null`.
- Foreign keys protect relationships.
- Unique constraints prevent duplicate assignments or versions.
- Check constraints protect statuses and scores.
- Existing data is compatible before constraint enforcement.

## Audit Checklist

- Immutable audit table exists or is specified.
- Actor, timestamp, action, entity, reason, before, after, source, correlation ID, and outcome are represented.
- Sensitive metadata is minimized.
- Material healthcare, insurance, AI, and reviewer actions are auditable.

## Healthcare Data Checklist

- Patient identity data is minimized and protected.
- Consent records are modeled.
- SOAP notes and clinical documents are versioned.
- Diagnosis, ICD, prescription, allergy, interaction, and AI output traceability exists.
- Human review status is stored.

## Insurance Data Checklist

- Claim readiness assessments are versioned.
- Missing evidence and evidence package items are traceable.
- Payer rule configuration and evaluation results have provenance.
- Risk, coverage, and economic alerts are decision support.
- Reviewer workflow state is explicit.

## Performance Checklist

- Query paths are known.
- Dashboard views avoid repeated expensive joins where possible.
- Indexes support tenant-scoped queries.
- Large table growth is considered.
- Audit/event table write volume is considered.

## Data Integrity Checklist

- Relationship cardinality is enforced.
- Lifecycle status transitions are constrained where possible.
- Version uniqueness is protected.
- Soft delete/archive behavior is consistent.
- No duplicated source of truth exists without clear reason.

## Code Review Checklist

- Naming conventions are followed.
- RLS and tenant scope are not skipped.
- Migrations are safe and reversible enough for the risk.
- Constraints and indexes are justified.
- Healthcare, insurance, audit, and compliance rules are represented.

## Supabase Deployment Checklist

- Migration order is correct.
- RLS policies are included.
- Seed data is environment-safe.
- Verification queries are ready.
- Rollback notes and backup requirements are documented.
