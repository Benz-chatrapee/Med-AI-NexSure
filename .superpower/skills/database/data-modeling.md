# Database Data Modeling Rules

## Naming Convention

- Use `snake_case` for tables, columns, indexes, constraints, views, functions, and policies.
- Use clear domain names instead of abbreviations unless the abbreviation is standard, such as ICD.

## Table Naming

- Use plural nouns: `patients`, `visits`, `soap_notes`.
- Use join table names with both entities: `user_roles`, `evidence_package_items`.
- Use suffixes for purpose: `_items`, `_results`, `_summaries`, `_logs`.

## Column Naming

- Primary key: `id`.
- Foreign key: `<entity>_id`.
- Timestamps: `created_at`, `updated_at`, `archived_at`, `deleted_at`, `reviewed_at`.
- Actor references: `created_by`, `updated_by`, `reviewed_by`.
- Booleans: `is_active`, `has_warning`, `requires_review`.

## Primary Key Strategy

- Use UUID primary keys by default.
- Generate IDs server-side or database-side consistently.
- Avoid business identifiers as primary keys.

## Foreign Key Strategy

- Add foreign keys for core relationships.
- Use restrictive delete behavior for healthcare, claim, evidence, AI, and audit records.
- Prefer archive over delete for regulated data.

## Timestamp Strategy

- Use timezone-aware timestamps.
- Include `created_at` and `updated_at` on mutable tables.
- Include action timestamps such as `submitted_at`, `reviewed_at`, `generated_at`, and `exported_at` where useful.

## Soft Delete/Archive Strategy

- Prefer `archived_at` and `archived_by` for regulated records.
- Hard delete only for explicit, approved, non-regulated cleanup.
- Keep audit history even when records are archived.

## Versioning Strategy

- Version SOAP notes, medical certificates, claim readiness assessments, evidence packages, payer rule configurations, and AI output schema versions.
- Use parent entity plus `version` unique constraints where needed.

## Audit Trail Strategy

- Store immutable audit events in `audit_logs`.
- Link audit events to actor, entity type, entity ID, reason, before, after, source, correlation ID, and outcome.
- Minimize sensitive metadata.

## Multi-Tenant Organization/Clinic Scoping

- Include `organization_id` on tenant-scoped tables.
- Include `clinic_id` where workflows are clinic-specific.
- Use composite indexes for organization/clinic/status/date query paths.

## RBAC Schema Principles

- Core entities: `roles`, `permissions`, `user_roles`.
- Permissions should be stable strings.
- User role assignment should be scoped by organization and optionally clinic.

## RLS Policy Principles

- Enable RLS on sensitive and tenant-scoped tables.
- Use organization, clinic, role, ownership, and consent checks.
- Keep policies readable and testable.

## Clinical Data Separation

- Separate patient identity, consent, visits, SOAP notes, diagnoses, prescriptions, certificates, and AI outputs.
- Do not store unsupported clinical conclusions as confirmed records.

## AI Output Traceability

- Store AI task, input references, output, confidence, explanation, model/provider metadata when allowed, disclaimer, and review status.
- Link AI outputs to patient, visit, claim, evidence package, or related entity through references.

## Claim Readiness Traceability

- Store readiness assessments as versioned decision-support records.
- Store readiness items for blockers, warnings, missing evidence, and documentation issues.
- Link to source visit, SOAP note, diagnosis, evidence, payer rule, and reviewer.

## Evidence Package Versioning

- Store package versions with generated timestamp, actor, status, source claim, and export metadata.
- Store item-level source references and evidence status.

## Dashboard View Strategy

- Use views for stable dashboard contracts.
- Use materialized views only when freshness and refresh strategy are defined.
- Preserve RLS and sensitive-data boundaries.

## Indexing Strategy

- Index foreign keys, tenant scope, status, timestamps, and high-frequency dashboard filters.
- Use composite indexes matching actual query predicates.
- Review write cost before indexing audit/event-heavy tables.

## Migration Ordering Strategy

1. Create types/tables.
2. Add nullable columns.
3. Backfill data.
4. Add constraints.
5. Add indexes.
6. Enable RLS and policies.
7. Add views/triggers.
8. Verify and document rollback.

## Recommended Core Entities

- `organizations`
- `clinics`
- `user_profiles`
- `roles`
- `permissions`
- `user_roles`
- `patients`
- `patient_consents`
- `visits`
- `soap_notes`
- `visit_diagnoses`
- `prescriptions`
- `prescription_items`
- `medical_certificates`
- `claim_readiness_assessments`
- `claim_readiness_items`
- `evidence_packages`
- `evidence_package_items`
- `payer_rules`
- `insurance_rule_results`
- `visit_cost_summaries`
- `economic_alerts`
- `ai_outputs`
- `audit_logs`
