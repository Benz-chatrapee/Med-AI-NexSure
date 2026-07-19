# Database Naming Convention

Source of truth: completed Core Foundation documents and Supabase migrations `001` through `007`.

## Existing Implementation

### Object Naming Patterns

| Object type | Existing pattern | Examples |
| --- | --- | --- |
| Tables | lowercase snake_case, plural nouns | `organizations`, `clinics`, `user_profiles`, `soap_note_versions`, `claim_readiness_assessments` |
| Primary keys | `id uuid` | `organizations.id`, `patients.id`, `audit_logs.id` |
| Foreign keys | `<referenced_entity>_id` | `organization_id`, `clinic_id`, `patient_id`, `visit_id`, `role_id` |
| Business identifiers | separate text or version fields | `code`, `patient_code`, `visit_number`, `registration_number`, `sku`, `assessment_version`, `package_version` |
| Constraints | descriptive; mixed prefix usage | `patients_org_code_unique`, `ck_visit_diagnoses_status`, `uq_user_role_assignments` |
| Indexes | `idx_<table>_<columns_or_purpose>` | `idx_visits_dashboard_scope`, `idx_audit_logs_scope_time` |
| Triggers | `set_<table>_updated_at` or `trg_<purpose>` | `set_patients_updated_at`, `trg_claim_readiness_weights_total` |
| Functions | snake_case verb/noun | `set_updated_at()`, `has_permission()`, `assert_claim_readiness_weights()` |
| Policies | descriptive or `mvp1_` prefixed | `patients_select_clinic_scoped`, `mvp1_patients_select` |
| Storage buckets | lowercase kebab-case | `patient-documents`, `evidence-files`, `medical-certificates` |

### Core Naming Rules Already Reflected in Migrations

- UUID primary keys are used for relational identity.
- Business numbers are separate from relational primary keys.
- Tenant scope uses `organization_id`.
- Clinic scope uses `clinic_id`.
- Soft delete fields use `deleted_at`, `deleted_by`, and `is_active`.
- Actor/audit fields use `created_by`, `updated_by`, `created_at`, and `updated_at`.
- Versioned records use explicit version columns such as `version`, `assessment_version`, `package_version`, and `version_no`.
- Supabase Auth identity is represented by `user_profiles.id -> auth.users.id`.

### Compatibility-Sensitive Names

| Name | Status | Note |
| --- | --- | --- |
| `user_roles` | Existing | Legacy assignment table used by migration `003` helpers. |
| `user_role_assignments` | Existing | Newer assignment table used by migration `007` helpers. |
| Colon permission keys | Existing | Migration `002`, for example `patient:read`. |
| Dot permission keys | Existing | Migration `007`, for example `patient.view`. |
| Title-case role names | Existing | Migration `002`, for example `Claim Reviewer`. |
| Snake-case role names | Existing | Migration `007`, for example `claim_reviewer`. |
| `clinic_users` | Not a table | Business/UI term; current database implementation uses `user_profiles`, `clinic_memberships`, and role assignments. |

## Identified Gaps

- Constraint names are not fully standardized; both suffix style (`patients_org_code_unique`) and prefix style (`uq_user_role_assignments`) exist.
- Permission key naming is split between colon and dot formats.
- Role names are split between title case and lowercase snake_case.
- Some proposed product concepts are not implemented as tables: `clinical_documents`, `visit_status_history`, `medical_certificates`, and `prescription_safety_alerts`.
- Storage bucket object paths are not documented in migrations.

## Proposed Design

Use these standards for future migrations only after review:

| Area | Proposed convention |
| --- | --- |
| Tables | lowercase snake_case plural nouns |
| Columns | lowercase snake_case |
| Primary key | `id uuid primary key default gen_random_uuid()` |
| Tenant key | `organization_id uuid not null` where tenant-scoped |
| Clinic key | `clinic_id uuid` or `clinic_id uuid not null` where clinic-scoped |
| Unique constraints | `uq_<table>_<columns_or_purpose>` |
| Check constraints | `ck_<table>_<rule>` |
| Foreign keys | `fk_<table>_<referenced_table_or_purpose>` |
| Indexes | `idx_<table>_<columns_or_purpose>` |
| RLS policies | `<table>_<operation>_<scope_or_permission>` or canonical `mvp1_<table>_<operation>` until policy family is retired |
| Permissions | dot format, for example `patient.view`, if migration `007` is selected as canonical |
| Roles | lowercase snake_case, for example `claim_reviewer`, if migration `007` is selected as canonical |
| Storage paths | `organization_id/clinic_id/domain/yyyy/mm/<object_id>` or a reviewed equivalent |

Proposed table names must be labeled Proposed until migrations exist:
- Proposed: `clinical_documents`
- Proposed: `visit_status_history`
- Proposed: `medical_certificates`
- Proposed: `prescription_safety_alerts`

Related references:
- [Core Foundation Specification](core-foundation-spec.md)
- [Core Foundation Permission Matrix](core-foundation-permission-matrix.md)
