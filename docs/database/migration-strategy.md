# Migration Strategy

Source of truth: completed Core Foundation documents, `supabase/config.toml`, and migrations `001` through `007`.

## Existing Implementation

### Migration Files

| File | Existing purpose |
| --- | --- |
| `001_core_schema.sql` | Core enums, `pgcrypto`, core clinical/tenant tables, audit table, and `set_updated_at()` triggers |
| `002_rbac.sql` | Legacy RBAC tables, colon permission seed, title-case system roles, role-permission seed |
| `003_rls_policies.sql` | Initial RLS helper functions and colon-key policy family |
| `004_indexes.sql` | Tenant, workflow, lookup, dashboard, and audit indexes |
| `005_tenant_identity_memberships.sql` | Additive tenant profile, clinic profile, membership, and tenant-safe FK compatibility |
| `006_clinical_claim_settings_tables.sql` | Clinical expansion, diagnosis, claim readiness, evidence packages, settings, integrations |
| `007_rbac_helpers_policies_indexes_seed.sql` | Newer RBAC assignment table, dot-key helpers/policies/seeds, extra indexes, storage buckets |

### Migration Style

Existing:
- Additive migrations are used after the initial schema.
- `create table if not exists` appears in later migrations.
- Conditional `do $$` blocks protect repeated constraint and trigger creation.
- Seed/reference rows are inserted through `on conflict`.
- Tenant-safe composite references are introduced after compatible unique constraints exist.
- Private storage buckets are created conditionally if the `storage` schema exists.

## Identified Gaps

- Project standard says PostgreSQL 16, while local config currently sets database major version 17.
- `supabase/seed.sql` is configured but absent.
- `supabase/tests/` is absent.
- RLS policy families coexist instead of a single canonical policy generation.
- RBAC assignment models coexist: `user_roles` and `user_role_assignments`.
- No explicit migration rollback runbooks are committed.
- No storage object policies are included with bucket creation.

## Proposed Design

Future migrations should:
- Remain additive unless a destructive change is explicitly approved.
- Use `public.<object_name>` qualification for new public schema objects.
- Use UUID relational primary keys and separate business identifiers.
- Add tenant-safe FKs for clinic-scoped data.
- Enable RLS in the same migration that introduces sensitive tables.
- Add indexes for tenant scope, clinic scope, foreign keys, statuses, and time filters based on expected routes.
- Include fictional seed/reference data only when safe and necessary.
- Include a validation note or companion SQL test for RLS-sensitive changes.
- Preserve old RBAC and permission names until a compatibility migration and tests safely retire them.

Proposed migration priorities:
1. Align PostgreSQL version decision.
2. Canonicalize RBAC assignment and permission naming.
3. Add storage object policies.
4. Add SQL test files.
5. Add proposed clinical governance tables only after workflow review.

Related references:
- [Core Foundation Specification](core-foundation-spec.md)
- [Database Naming Convention](database-naming-convention.md)
