# Database Roadmap

## Objective

Keep the database migration-first, tenant-safe, auditable, and ready for healthcare and insurance workflows where AI is advisory and Human-in-the-Loop review is mandatory.

## Baseline

Existing:
- PostgreSQL via Supabase Local.
- `pgcrypto` for UUID generation.
- Public schema business tables with Supabase Auth anchoring `user_profiles.id` to `auth.users.id`.
- RLS enabled for core, RBAC, clinical, claim, settings, and audit tables.
- Private Supabase Storage buckets created by migration `007`.

Review Required:
- Product standard: PostgreSQL 16.
- Local config: `major_version = 17` in `supabase/config.toml`.

## Roadmap Phases

### Phase 1: Current MVP Foundation

Existing:
- Organizations, clinics, user profiles.
- Patients, visits, SOAP notes, prescriptions, inventory, audit logs.
- RBAC core: `roles`, `permissions`, `user_roles`, `role_permissions`.
- Tenant membership extension: `organization_memberships`, `clinic_memberships`, `user_role_assignments`.
- Claim readiness and evidence package tables.
- Organization settings and integration metadata.

Identified gaps:
- No executable SQL tests.
- No seed file despite seed being enabled in config.
- No storage object policies.
- Mixed RBAC assignment models and permission naming styles.

### Phase 2: Clinical Safety Hardening

Proposed:
- `visit_status_history` for append-only visit state transitions.
- `prescription_safety_alerts` for interaction, duplicate therapy, contraindication, allergy, dose, and inventory warnings.
- `clinical_documents` for metadata linked to private storage objects.
- Controlled amendment rules for signed SOAP notes, certificates, diagnoses, and evidence packages.

### Phase 3: Claims and Evidence Expansion

Existing:
- `claim_readiness_assessments`
- `claim_readiness_items`
- `evidence_packages`

Proposed:
- `evidence_package_items`
- payer rule source/version tables
- claim submission handoff records
- rule execution logs that distinguish missing, invalid, unverified, and accepted evidence.

### Phase 4: Analytics and Recovery

Proposed:
- Materialized views or reporting views only after real query patterns are measured.
- Point-in-time recovery runbooks.
- RLS regression tests for cross-tenant and cross-clinic access.
- Audit retention and archive process.

## Compatibility-Sensitive Decisions

| Item | Current State | Recommendation |
| --- | --- | --- |
| PostgreSQL version | Config uses 17; standard says 16 | Review and align before production |
| RBAC assignments | `user_roles` and `user_role_assignments` both exist | Select canonical table, document compatibility plan |
| Permission keys | Colon and dot styles both exist | Select one canonical style for new work |
| Clinic users | Business term; implemented as memberships/profile/roles | Keep business term in UI, avoid new table unless migration approved |
| Medical certificates | App route exists; no table | Proposed table after workflow and retention requirements are approved |
