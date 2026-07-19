# Module Overview

## Organizations and Clinics

Existing:
- `organizations`, `clinics`, organization profile/address/branding tables, clinic address/business-hours/settings tables.
- Tenant root is organization. Clinic is an operational and data-access boundary.

Gaps:
- Organization and clinic lifecycle workflows are not fully represented as state history tables.

## Authentication and User Profiles

Existing:
- Supabase Auth anchors `user_profiles.id`.
- `organization_memberships` and `clinic_memberships` model access scope.
- Reset password uses Supabase Auth client in the browser.

Gaps:
- No server-side user provisioning or invitation table found.
- No SQL tests for account isolation.

## RBAC and Permissions

Existing:
- `roles`, `permissions`, `role_permissions`, `user_roles`, `user_role_assignments`.
- Helper functions and RLS policies use membership and permission checks.

Gaps:
- Two role-assignment models coexist.
- Permission keys use colon and dot patterns.

## Patients and Clinic Registrations

Existing:
- `patients` stores tenant-scoped patient identifiers and consent status.
- `patient_clinic_registrations` maps patients to clinic registration numbers.

Gaps:
- No patient merge/split audit table.
- No field-level minimization layer in database.

## Visits and Visit Status History

Existing:
- `visits` stores current `visit_status`, `claim_status`, `risk_level`, timestamps, payer, department, and attending user.
- `visit_vitals` stores measured clinical observations.

Proposed:
- `visit_status_history` should record append-only transitions with actor, reason, previous status, next status, and timestamp.

## SOAP Notes and Version History

Existing:
- `soap_notes` stores current SOAP sections.
- `soap_note_versions` stores versioned content and change reason.
- AI metadata columns exist on `soap_notes`.

Gaps:
- Database does not prevent every invalid status transition.
- Signed/locked clinical record amendment policy should be formalized.

## Diagnoses and ICD Coding

Existing:
- `diagnoses` is an organization-scoped code catalog.
- `visit_diagnoses` supports human, AI, and import sources with confidence and acceptance fields.

Safety rule:
- AI-coded diagnosis is advisory until accepted by a human.

## Prescriptions and Medication Safety

Existing:
- `prescriptions`, `prescription_items`, inventory links, safety review summary, dispensed quantity constraints.

Proposed:
- `prescription_safety_alerts` for durable alerts and override reasons.

## Inventory and Stock Movements

Existing:
- `inventory_items`, `inventory_batches`, `stock_movements`.
- Stock movements are append-friendly and indexed by item and time.

Gaps:
- No hard database trigger updates batch quantity from stock movement entries.

## Medical Certificates

Existing:
- Application route and feature data exist.

Proposed:
- `medical_certificates` table with visit, patient, clinician, certificate number, status, issued timestamp, signed content hash, storage reference, amendment reason, and audit fields.

## Claim Readiness

Existing:
- `claim_readiness_assessments` and `claim_readiness_items`.
- Weight total trigger enforces six readiness dimensions totaling 100.

Safety rule:
- Claim readiness is not claim approval.

## Clinical Documents and Evidence Packages

Existing:
- `evidence_packages`.
- Private storage buckets include `patient-documents` and `evidence-files`.
- Patient document UI currently uses mocked upload flow.

Proposed:
- `clinical_documents` metadata table and `evidence_package_items`.
- Storage object policies must enforce organization and clinic scope.

## Audit Logs

Existing:
- `audit_logs` records actor, action, target, reason, old/new JSON, IP, user agent, correlation ID, outcome, and timestamp.

Gaps:
- No audit-write helper or immutable audit trigger found.

## Analytics and Dashboards

Existing:
- Dashboard features are mock/service backed.
- Indexes support operational dashboards on visits, claims, inventory, and audit logs.

Proposed:
- Views/materialized views after query patterns are measured and RLS implications are reviewed.
