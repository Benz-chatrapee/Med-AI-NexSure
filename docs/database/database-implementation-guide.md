# Database Implementation Guide

## Document Control
Status: Populated during DB-DOC-FINAL-CROSS-DOCUMENT-REVIEW. Runtime effect: none.

## Purpose
Provides the documentation-to-implementation bridge for future database work. This guide does not create migrations, schema, policies, tests, or application code.

## Implementation Flow
1. Confirm authoritative document and module owner.
2. Resolve Review Required decisions or record approved deferral.
3. Draft migration plan with rollback and compatibility notes.
4. Validate tenant boundaries, RLS, grants, and professional authority requirements.
5. Define audit events and domain versioning before high-risk writes.
6. Define positive and negative tests before implementation.
7. Implement migrations in a separate task.
8. Regenerate database types when schema changes.
9. Run local reset, RLS/RBAC, schema, storage, and application validations as applicable.
10. Promote through staging only after backup/restore and security gates are met.

## Required Evidence Before Migration
| Evidence | Required for |
|---|---|
| authoritative doc link | all migrations |
| dependency and ERD review | new tables/FKs |
| permission matrix entry | new protected action |
| RLS design | tenant or PHI/clinical/financial data |
| audit/versioning design | high-risk mutation |
| test plan | every migration |
| rollback strategy | every migration |
| backup/restore impact | production data changes |

## Prohibited Shortcuts
- Do not use frontend-provided `organization_id` or `clinic_id` as trusted authorization context.
- Do not use `service_role` in browser flows.
- Do not use `MAX()+1` for business identifiers.
- Do not store secrets, tokens, private keys, raw documents, or unrestricted PHI in JSONB metadata.
- Do not let claim, evidence, AI, analytics, or payer-rule workflows overwrite clinical truth.
- Do not treat documentation readiness as implementation readiness.

## Review Required
Final implementation sequence, migration ownership, local Supabase version alignment, generated type workflow, release evidence location, and production approval process remain Review Required.
