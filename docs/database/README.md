# Med AI NexSure Database Documentation

This folder documents the current Supabase/PostgreSQL database design for Med AI NexSure. It is based on the local repository state: `supabase/config.toml`, migrations `001` through `007`, existing database connection code, application routes, and mock-backed feature modules.

## Reading Order

1. [Database Roadmap](00-database-roadmap.md)
2. [Architecture](01-architecture.md)
3. [Module Overview](02-module-overview.md)
4. [ERD](03-erd.md)
5. [Data Dictionary](04-data-dictionary.md)
6. [Naming Convention](05-naming-convention.md)
7. [Migration Strategy](06-migration-strategy.md)
8. [Seed Data Strategy](07-seed-data-strategy.md)
9. [RBAC and RLS Security Design](08-rbac-rls-security-design.md)
10. [Performance and Index Design](09-performance-index-design.md)
11. [Audit and Versioning Strategy](10-audit-versioning-strategy.md)
12. [Backup and Restore Strategy](11-backup-restore-strategy.md)
13. [Database Testing and QA Checklist](12-database-testing-qa-checklist.md)
14. [Security Review](13-security-review.md)

## Current State Summary

Existing implementation:
- Migration-first Supabase schema with UUID primary keys, soft-delete columns on mutable business tables, tenant-scoped `organization_id` and `clinic_id`, RBAC tables, RLS helper functions and policies, audit logs, claim readiness, evidence packages, organization settings, and private storage buckets.
- Application database usage is limited. Most feature modules currently use typed mock repositories or static data. Real Supabase usage is present in the reset-password flow and server-side database health check.

Identified gaps:
- The task standard says PostgreSQL 16, while `supabase/config.toml` currently specifies database major version `17`. Treat PostgreSQL 16 as the product target until the local config is reviewed.
- `supabase/seed.sql` and `supabase/tests/` are not present.
- Storage buckets are created as private, but storage object policies are not defined in the inspected migrations.
- `visit_status_history`, `clinical_documents`, `medical_certificates`, and `prescription_safety_alerts` are product modules, but not current database tables.
- RBAC has both legacy `user_roles` and newer `user_role_assignments`; permission keys use both colon and dot naming styles.

Future design is labeled explicitly in each document. Do not treat proposed tables as implemented until migrations exist.
