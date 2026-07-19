# Naming Convention

## Current Conventions

Existing:
- Tables use lowercase snake_case plural names.
- Primary key column is `id uuid`.
- Foreign keys use `<entity>_id`.
- Tenant scope uses `organization_id` and, where clinic-specific, `clinic_id`.
- Business identifiers are separate from primary keys: `code`, `patient_code`, `visit_number`, `registration_number`, `sku`, `batch_number`, `module_key`, `event_key`, `provider_key`.
- Audit fields use `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `is_active`.
- Check constraints use prefixes like `ck_`.
- Unique constraints use prefixes like `uq_` or descriptive names ending in `_unique`.
- Indexes use `idx_`.
- Triggers use `set_` or `trg_`.

## Recommended Standard

- Use `public.<table_name>` in migrations for new objects.
- Use explicit names for constraints, indexes, policies, triggers, and functions.
- Use `timestamptz` for all event timestamps.
- Store human-readable identifiers as text and enforce uniqueness by tenant scope.
- Avoid `MAX()+1` identifiers. Generate business numbers through a controlled sequence/table/function only after concurrency rules are approved.
- Use compatibility names only with an explicit comment and migration rationale.

## Compatibility-Sensitive Names

| Name | Status | Guidance |
| --- | --- | --- |
| `user_roles` | Existing legacy assignment table | Keep until callers and policies are migrated |
| `user_role_assignments` | Existing newer assignment table | Candidate canonical assignment table |
| `clinic_users` | Business/UI term only | Map to `user_profiles` + `clinic_memberships` + role assignment |
| `clinical_documents` | Proposed table | Do not reference as existing |
| `visit_status_history` | Proposed table | Use for future append-only status events |
| `prescription_safety_alerts` | Proposed table | Use for future durable medication safety alerts |
| Colon permission keys | Existing doc/policy style | Review before adding new keys |
| Dot permission keys | Existing migration `007` seed style | Review before adding new keys |
