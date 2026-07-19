# Database Architecture

## Scope

This document describes the current local database architecture. It does not authorize schema changes.

## Core Principles

- UUID relational primary keys.
- Separate human-readable business identifiers such as `code`, `patient_code`, `visit_number`, `registration_number`, `sku`, and version numbers.
- Multi-tenant isolation by `organization_id`, with clinic-level narrowing by `clinic_id` where applicable.
- Default-deny posture using RLS on sensitive tables.
- Least privilege through RBAC permissions.
- Soft delete on mutable regulated tables using `deleted_at`, `deleted_by`, and `is_active`.
- Auditability through `audit_logs`, version tables, and actor columns.
- AI output is advisory and must be accepted, reviewed, edited, or rejected by a human before clinical or claim use.

## Supabase Local Configuration

Existing:
- API exposes `public` and `graphql_public`.
- Auth is enabled.
- Storage is enabled with a 50 MiB file size limit.
- Email auth signups are enabled locally.
- Seed is enabled and expects `./seed.sql`.
- Database migrations are enabled.

Review Required:
- `supabase/config.toml` sets `major_version = 17`; project standard requires PostgreSQL 16.
- `supabase/seed.sql` is not present in the repository.

## Schema Layers

### Foundation Layer

Existing:
- `organizations`
- `clinics`
- `user_profiles`
- `organization_profiles`
- `organization_addresses`
- `organization_branding`
- `clinic_addresses`
- `clinic_business_hours`
- `clinic_settings`

Purpose:
- Define tenant and facility boundaries.
- Store operational and profile metadata.
- Support tenant-safe foreign keys such as `(organization_id, clinic_id) -> clinics(organization_id, id)`.

### Identity and Access Layer

Existing:
- Supabase Auth `auth.users`
- `user_profiles`
- `organization_memberships`
- `clinic_memberships`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `user_role_assignments`

Purpose:
- Anchor identity to Auth.
- Represent organization and clinic membership.
- Grant role and permission access with organization and optional clinic scope.

Compatibility Sensitive:
- `user_roles` is used by older helper functions.
- `user_role_assignments` is used by newer helper functions.

### Clinical Operations Layer

Existing:
- `patients`
- `patient_clinic_registrations`
- `visits`
- `visit_vitals`
- `soap_notes`
- `soap_note_versions`
- `diagnoses`
- `visit_diagnoses`
- `prescriptions`
- `prescription_items`

Proposed:
- `visit_status_history`
- `prescription_safety_alerts`
- `medical_certificates`
- `clinical_documents`

### Inventory Layer

Existing:
- `inventory_items`
- `inventory_batches`
- `stock_movements`

Purpose:
- Maintain clinic inventory catalog, batch quantities, expiry dates, and movement ledger.

### Claim and Evidence Layer

Existing:
- `claim_readiness_assessments`
- `claim_readiness_items`
- `evidence_packages`

Proposed:
- `evidence_package_items`
- payer rule source/version tables
- claim submission records

### Settings, Integration, Notification Layer

Existing:
- `organization_operational_settings`
- `organization_claim_settings`
- `organization_clinical_settings`
- `organization_security_settings`
- `organization_compliance_settings`
- `system_modules`
- `organization_module_settings`
- `notification_event_types`
- `organization_notification_settings`
- `integration_providers`
- `organization_integrations`
- `organization_setting_versions`

### Audit Layer

Existing:
- `audit_logs`
- `soap_note_versions`
- `organization_setting_versions`
- claim readiness version columns
- evidence package version columns

## Application Integration

Existing source code references:
- `lib/auth/supabase-browser.ts` creates a browser client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `components/features/auth/reset-password-form.tsx` uses Supabase Auth for recovery session exchange, password update, and local sign-out.
- `lib/database/supabase-rest.ts` performs a server-side REST health check with sanitized errors.
- Most domain services use mock repositories and typed fixtures.

Security implication:
- The current app does not yet exercise the full database schema through route handlers or server actions. RLS tests must be added before replacing mock repositories with live queries.
