# Patient and Visit Test Plan

Batch: DB-DOC-BATCH-4-PATIENT-VISIT  
Primary agent: QA  
Reviewer: Database and Security Compliance

## Purpose

Define validation coverage for Patient and Visit database behavior. This is documentation only; no executable SQL tests are created in this task.

## Existing Implementation

Existing validation assets:
- Migrations `001` through `007`.
- RLS policies for `patients`, `visits`, `visit_vitals`, and related clinical tables.
- Constraints for patient consent, patient sex-at-birth, visit number uniqueness, visit enum values, and vitals ranges.
- Indexes for patient and visit tenant/clinic/status/date lookups.

Repository gaps:
- `supabase/tests/` is absent.
- `supabase/seed.sql` is absent though configured.
- `visit_status_history` is not implemented.
- Duplicate prevention beyond unique `patient_code` is not implemented.
- Patient merge workflow is not implemented.

## Test Matrix

| Test area | Classification | Type | Positive cases | Negative cases | Expected evidence |
| --- | --- | --- | --- | --- | --- |
| Tenant isolation | Deferred executable SQL | RLS | Org A user reads Org A patient/visit | Org A user reads Org B patient/visit | SELECT allowed/denied |
| Clinic isolation | Deferred executable SQL | RLS | Clinic A user reads Clinic A patient/visit | Clinic A user reads Clinic B without org-level role | SELECT allowed/denied |
| Patient registration | Deferred executable SQL | Constraint/RLS | Authorized `patient.create` inserts patient and registration | Unauthorized user inserts patient | Insert success/denial |
| Duplicate patient code | Deferred executable SQL | Constraint | Unique `patient_code` by organization | Duplicate `(organization_id, patient_code)` | Unique constraint failure |
| Duplicate registration number | Deferred executable SQL | Constraint | Unique clinic registration | Duplicate `(organization_id, clinic_id, registration_number)` | Unique constraint failure |
| Duplicate prevention beyond names | Deferred design test | Workflow | Multiple demographic/contact signals checked | Same name alone triggers auto merge | Review queue, no auto merge |
| Patient merge readiness | Deferred design test | Workflow/security | Authorized merge request with reason/audit | Unapproved merge or no reason | Denial/audit evidence |
| Consent readiness | Deferred executable SQL | Constraint/workflow | Valid consent status values | Unsupported consent status | Check constraint failure |
| Soft deletion | Deferred executable SQL | Lifecycle | Soft-delete marks inactive | Hard delete clinical history | Restricted by policy/design |
| Visit creation | Deferred executable SQL | RLS/constraint | Authorized `visit.create` creates scoped visit | Frontend-forged clinic id | RLS denial |
| Visit-number uniqueness | Deferred executable SQL | Constraint | Unique per organization | Duplicate `(organization_id, visit_number)` | Unique constraint failure |
| Status enum | Deferred executable SQL | Constraint | Existing enum values accepted | Non-enum status inserted | Enum failure |
| Status transitions | Deferred design test | Workflow | Allowed transition with permission/reason | Invalid transition | Denial and audit |
| Completed visit reopening | Deferred design test | Workflow/security | Reopen with clinical authority, reason, approval | Admin-only reopen without clinician | Denial |
| Cancellation/no-show | Deferred design test | Workflow | Authorized cancellation/no-show reason | Completed visit cancellation without reopen | Denial |
| Status history protection | Future | Append-only | Insert transition event | Update/delete history row | Denial after table exists |
| RLS/RBAC | Deferred executable SQL | Security | Role permission matches matrix | Privilege escalation | Denial |
| Audit events | Deferred executable SQL/design | Audit | High-risk action writes audit | Sensitive action without audit | Failure |
| Concurrency | Deferred executable SQL | Transaction | Parallel unique visit/patient creation handled | Race creates duplicate business number | Unique/idempotency behavior |
| Idempotency | Future | Workflow | External creation replay returns same visit | Replay creates duplicate visit | Unique external ref after implementation |

## Required Local Commands

These commands are expected for future executable test implementation:

| Command | Classification | Expected result |
| --- | --- | --- |
| `supabase start` | Executable local command | Local services start. |
| `supabase db reset` | Executable local command | Migrations apply; current seed-file gap may need review. |
| `supabase migration list` | Executable local command | Migrations `001` through `007` listed. |
| `supabase db diff --local` | Executable local command | No unexpected schema drift. |

## Detailed Test Cases

### Patient Registration

Positive:
1. Active clinic-scoped user has `patient.create`.
2. Server derives organization/clinic from `auth.uid()`.
3. Insert `patients` with valid `consent_status`.
4. Insert `patient_clinic_registrations` with unique registration number.
5. Audit event is written when audit integration exists.

Negative:
- Insert with unsupported consent status.
- Insert duplicate patient code in same organization.
- Insert duplicate clinic registration number.
- Insert using forged `organization_id` or `clinic_id`.

### Duplicate and Merge Readiness

Current executable coverage:
- Unique `patient_code` per organization.
- Unique registration number per organization/clinic.

Deferred design coverage:
- Duplicate detection must not rely only on patient names.
- Merge must require authorization, reason, audit, and transaction boundary.
- Soft deletion must not remove clinical history.

### Visit Creation

Positive:
1. Active user has `visit.create` or legacy `visit:update`/creation pathway as applicable.
2. Patient exists in same organization and allowed clinic/registration scope.
3. Visit number is unique in organization.
4. Insert `visits` with valid enum status.

Negative:
- Duplicate visit number in same organization.
- Patient from another organization.
- Clinic id outside user access.
- Missing patient relation.

### Visit Status Transitions

Deferred until transition enforcement exists:
- Validate each transition in [Visit Status Workflow](visit-status-workflow.md).
- Require permission, role/professional authority, reason when required, transaction boundary, and audit event.
- Deny claim readiness from silently changing visit state.

### Completed Visit Reopening

Deferred design test:
- Completed visit can reopen only through controlled workflow.
- Requires clinical authority, reason, approval if policy requires, audit event, and claim readiness invalidation/recalculation.
- Deny administrative-only reopen when clinical authority is required.

## Identified Gaps

- No executable SQL tests exist yet.
- No fixture seed users exist for patient/visit RLS tests.
- `visit_status_history`, idempotency keys, patient merge tables, and duplicate candidate tables are not implemented.
- Current RLS policy coexistence makes expected behavior compatibility-sensitive.

## Proposed Design

Proposed future test files:
- Proposed: `supabase/tests/patient_registration_rls.sql`
- Proposed: `supabase/tests/patient_duplicate_constraints.sql`
- Proposed: `supabase/tests/patient_merge_readiness.sql`
- Proposed: `supabase/tests/visit_creation_rls.sql`
- Proposed: `supabase/tests/visit_status_workflow.sql`
- Proposed: `supabase/tests/visit_reopen_audit.sql`
- Proposed: `supabase/tests/patient_visit_concurrency.sql`

Every executable test must use fictional data only and must not require remote Supabase.

## Dependencies

- [Patient Data Model](patient-data-model.md)
- [Visit Data Model](visit-data-model.md)
- [Visit Status Workflow](visit-status-workflow.md)
- [Core Foundation Test Plan](core-foundation-test-plan.md)
