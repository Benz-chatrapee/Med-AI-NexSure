# Migration Strategy

## Current Migrations

| File | Purpose |
| --- | --- |
| `001_core_schema.sql` | Extensions, enums, core tenant, clinical, prescription, inventory, audit tables |
| `002_rbac.sql` | Legacy RBAC tables and triggers |
| `003_rls_policies.sql` | Initial helper functions and RLS policies |
| `004_indexes.sql` | Core indexes for tenant, workflow, dashboard, and audit queries |
| `005_tenant_identity_memberships.sql` | Tenant-safe identity extensions and membership tables |
| `006_clinical_claim_settings_tables.sql` | Clinical, diagnosis, claim readiness, evidence, organization settings, integrations |
| `007_rbac_helpers_policies_indexes_seed.sql` | New RBAC helper functions, additional RLS policies, seed roles/permissions, indexes, storage buckets |

## Rules for Future Migrations

- Do not edit applied migrations.
- Add new migration files in timestamp/order sequence.
- Keep migrations additive unless a destructive change has explicit approval and rollback plan.
- Use UUID primary keys and tenant-safe foreign keys.
- Enable RLS in the same migration that introduces sensitive tables.
- Add indexes for tenant filters, foreign keys, workflow statuses, and time-based lookups.
- Avoid service-role-only assumptions for application workflows.
- Do not seed real PHI, PII, clinical facts, payer contracts, or production credentials.

## Review Required Before Next Schema Migration

- Align PostgreSQL 16 standard with current local PostgreSQL 17 config.
- Choose canonical RBAC model.
- Choose permission key style.
- Define storage object policies for private buckets.
- Add local SQL tests before replacing mock repositories with live Supabase queries.

## Rollback Guidance

Documentation-only change now:
- No rollback needed for database.

Future migrations:
- Prefer additive rollback via compatibility views, backfill reversal scripts, and feature flags.
- Do not drop regulated data without retention/legal approval.
- Preserve audit history during corrections.
