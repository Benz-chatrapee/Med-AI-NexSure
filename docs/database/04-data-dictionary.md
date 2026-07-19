# Data Dictionary

Source of truth: `supabase/migrations/*.sql`. Security classification values: Public, Internal, Confidential, PHI, Clinical, Financial, Credential, Audit.

## Shared Column Conventions

Most mutable business tables include `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `created_by uuid`, `updated_at timestamptz default now()`, `updated_by uuid`, `deleted_at timestamptz`, `deleted_by uuid`, and `is_active boolean default true`. These are Confidential/Audit columns unless the table-specific row is stricter. Tenant tables commonly include `organization_id uuid`; clinic-scoped tables also include `clinic_id uuid`.

`PK/FK/C/I` means primary key, foreign key, check constraint, or indexed/unique.

## Enums

| Type | Values | Classification |
| --- | --- | --- |
| `visit_status` | scheduled, checked_in, in_consultation, completed, cancelled, no_show | Clinical |
| `claim_status` | not_started, documentation_pending, ready_for_review, needs_review, blocked, submitted | Financial |
| `risk_level` | low, medium, high, critical | Clinical |
| `audit_action_type` | create, read, update, delete, view, export, login, permission_change, clinical_review, claim_review, evidence_change, dashboard_viewed, filters_applied | Audit |
| `stock_movement_type` | stock_in, stock_out, adjustment, return, waste, transfer | Confidential |
| `prescription_status` | draft, pending_review, approved_by_clinician, dispensed, cancelled | Clinical |
| `soap_status` | draft, submitted, reviewed, amended, archived | Clinical |

## Foundation Tables

### `organizations`

Purpose: tenant root. Security: Confidential.

| Column | Type | Nullable | Default | PK/FK/C/I | Description | Security |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | PK | Tenant identifier | Confidential |
| `name` | text | No | none | unique | Display name | Confidential |
| `legal_name` | text | Yes | none | - | Legal entity name | Confidential |
| `registration_number` | text | Yes | none | - | Business registration reference | Confidential |
| `country_code` | char(2) | No | `'TH'` | - | Country | Internal |
| `timezone` | text | No | `'Asia/Bangkok'` | - | Primary timezone | Internal |
| `code` | text | No | backfilled | unique partial index | Business code added in migration `005` | Internal |
| `organization_type` | text | No | `'healthcare_provider'` | - | Organization category | Internal |
| `locale` | text | No | `'en-TH'` | - | Locale | Internal |
| shared audit columns | mixed | mixed | mixed | trigger/index | Creation/update/soft-delete fields | Audit |

### `clinics`

Purpose: facility and clinic data boundary. Security: Confidential.

| Column | Type | Nullable | Default | PK/FK/C/I | Description | Security |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | PK, unique with `organization_id` | Clinic identifier | Confidential |
| `organization_id` | uuid | No | none | FK, indexed, unique with code/id | Tenant owner | Confidential |
| `name` | text | No | none | - | Clinic name | Confidential |
| `code` | text | No | none | unique `(organization_id, code)`, indexed | Business clinic code | Internal |
| `address_line` | text | Yes | none | - | Legacy address field | Confidential |
| `province` | text | Yes | none | - | Province | Confidential |
| `country_code` | char(2) | No | `'TH'` | - | Country | Internal |
| `phone` | text | Yes | none | - | Clinic contact | Confidential |
| `clinic_type` | text | No | `'clinic'` | - | Clinic category | Internal |
| `is_primary` | boolean | No | `false` | - | Primary clinic marker | Internal |
| shared audit columns | mixed | mixed | mixed | trigger/index | Lifecycle fields | Audit |

### Organization and Clinic Detail Tables

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `organization_profiles` | `id`, `organization_id`, `display_name`, `tax_identifier_reference`, `website_url`, `support_email`, `support_phone`, `metadata`, shared audit columns | PK; FK organization; unique organization | Extended organization profile | Confidential |
| `organization_addresses` | `id`, `organization_id`, `address_type`, `address_line1`, `address_line2`, `city`, `province`, `postal_code`, `country_code`, shared audit columns | PK; FK organization; check address type | Organization addresses | Confidential |
| `organization_branding` | `id`, `organization_id`, `logo_storage_path`, `primary_color`, `secondary_color`, shared audit columns | PK; FK organization; unique organization | Branding and asset reference | Internal |
| `clinic_addresses` | `id`, `organization_id`, `clinic_id`, `address_type`, `address_line1`, `address_line2`, `city`, `province`, `postal_code`, `country_code`, shared audit columns | PK; tenant-safe clinic FK; check type | Clinic addresses | Confidential |
| `clinic_business_hours` | `id`, `organization_id`, `clinic_id`, `day_of_week`, `opens_at`, `closes_at`, `is_closed`, shared audit columns | PK; tenant-safe clinic FK; day/time checks; unique clinic/day | Clinic operating hours | Internal |
| `clinic_settings` | `id`, `organization_id`, `clinic_id`, `default_visit_duration_minutes`, `appointment_buffer_minutes`, `settings_payload`, shared audit columns | PK; tenant-safe clinic FK; unique clinic; positive duration checks | Clinic operational settings | Confidential |

## Identity and RBAC Tables

### `user_profiles`

Purpose: app profile linked to Supabase Auth. Security: Confidential.

| Column | Type | Nullable | Default | PK/FK/C/I | Description | Security |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | uuid | No | none | PK, FK `auth.users(id)` | Auth user identifier | Credential |
| `organization_id` | uuid | No | none | FK, indexed | Tenant owner | Confidential |
| `primary_clinic_id` | uuid | Yes | none | FK, tenant-safe FK, indexed | Default clinic | Confidential |
| `display_name` | text | No | none | - | User display name | Confidential |
| `email` | text | No | none | unique, indexed | User email | Confidential |
| `job_title` | text | Yes | none | - | Job title | Internal |
| `department` | text | Yes | none | - | Department | Internal |
| shared audit columns | mixed | mixed | mixed | trigger | Lifecycle fields | Audit |

### RBAC and Membership Summary

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `roles` | `id`, `organization_id`, `name`, `description`, `is_system_role`, shared audit columns | PK; FK organization; unique organization/name; indexed | Role catalog | Confidential |
| `permissions` | `id`, `permission_key`, `description`, `domain`, shared audit columns | PK; unique permission key; indexed | Permission catalog | Internal |
| `role_permissions` | `id`, `role_id`, `permission_id`, shared audit columns | PK; FKs role/permission; unique role/permission; indexed | Role-permission grant | Confidential |
| `user_roles` | `id`, `organization_id`, `clinic_id`, `user_id`, `role_id`, shared audit columns | PK; FKs organization/clinic/user/role; unique organization/clinic/user/role; indexed | Legacy user role assignment | Confidential |
| `organization_memberships` | `id`, `organization_id`, `user_profile_id`, `membership_status`, `joined_at`, shared audit columns | PK; FKs; unique organization/user; status check; indexed | Organization membership | Confidential |
| `clinic_memberships` | `id`, `organization_id`, `clinic_id`, `user_profile_id`, `membership_status`, `joined_at`, shared audit columns | PK; tenant-safe clinic FK; unique organization/clinic/user; status check; indexed | Clinic membership | Confidential |
| `user_role_assignments` | `id`, `organization_id`, `clinic_id`, `user_profile_id`, `role_id`, `assignment_status`, `assigned_at`, `assigned_by`, `expires_at`, shared audit columns | PK; FKs; unique organization/clinic/user/role; status/date checks; active partial index | Newer role assignment model | Confidential |

## Clinical Operations Tables

### `patients`

Purpose: tenant-scoped patient identity. Security: PHI.

| Column | Type | Nullable | Default | PK/FK/C/I | Description | Security |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | PK | Patient identifier | PHI |
| `organization_id` | uuid | No | none | FK, indexed, unique with patient_code | Tenant owner | PHI |
| `clinic_id` | uuid | No | none | FK, indexed | Owning clinic | PHI |
| `patient_code` | text | No | none | unique organization/code | Business patient number | PHI |
| `display_label` | text | No | none | - | Patient label/name surrogate | PHI |
| `date_of_birth` | date | Yes | none | - | Date of birth | PHI |
| `sex_at_birth` | text | Yes | none | check | Demographic field | PHI |
| `consent_status` | text | No | `'unknown'` | check | Consent state | PHI |
| `consent_updated_at` | timestamptz | Yes | none | - | Last consent update | PHI |
| shared audit columns | mixed | mixed | mixed | trigger/index | Lifecycle fields | Audit |

### Patient, Visit, SOAP, Diagnosis Summary

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `patient_clinic_registrations` | `id`, `organization_id`, `clinic_id`, `patient_id`, `registration_number`, `registered_at`, `registration_status`, shared audit columns | PK; FK patient; tenant-safe clinic FK; unique registration number and patient per clinic; status check | Clinic registration | PHI |
| `visits` | `id`, `organization_id`, `clinic_id`, `patient_id`, `visit_number`, `department`, `attending_user_id`, `payer_name`, `visit_status`, `claim_status`, `risk_level`, `started_at`, `completed_at`, shared audit columns | PK; FKs patient/user; unique organization/visit number; enum checks; many indexes | Encounter record | Clinical |
| `visit_vitals` | `id`, `organization_id`, `clinic_id`, `visit_id`, `measured_at`, `temperature_c`, `systolic_bp`, `diastolic_bp`, `heart_rate_bpm`, `respiratory_rate_bpm`, `oxygen_saturation_percent`, `weight_kg`, `height_cm`, shared audit columns | PK; FK visit; tenant-safe clinic FK; positive/range checks | Visit observations | Clinical |
| `soap_notes` | `id`, `organization_id`, `clinic_id`, `visit_id`, `status`, `current_version`, `subjective`, `objective`, `assessment`, `plan`, `completeness_score`, `reviewed_by`, `reviewed_at`, `source_type`, `model_name`, `model_version`, `confidence`, `accepted_by`, `accepted_at`, `edited_after_generation`, shared audit columns | PK; FK visit/user; unique visit; completeness/confidence/AI acceptance checks; indexed | Current SOAP note | Clinical |
| `soap_note_versions` | `id`, `organization_id`, `clinic_id`, `soap_note_id`, `version`, `status`, `subjective`, `objective`, `assessment`, `plan`, `change_reason`, shared audit columns | PK; FK SOAP; unique SOAP/version; version positive; indexed | SOAP version history | Clinical |
| `diagnoses` | `id`, `organization_id`, `code_system`, `diagnosis_code`, `display_name`, `effective_from`, `effective_to`, shared audit columns | PK; FK organization; unique organization/code system/code; effective range check | Diagnosis catalog | Clinical |
| `visit_diagnoses` | `id`, `organization_id`, `clinic_id`, `visit_id`, `diagnosis_id`, `diagnosis_code`, `diagnosis_text`, `diagnosis_type`, `coding_status`, `source_type`, `model_name`, `model_version`, `confidence`, `accepted_by`, `accepted_at`, `edited_after_generation`, shared audit columns | PK; FK visit/diagnosis/user; tenant-safe clinic FK; type/status/source/confidence/AI acceptance checks | Visit ICD coding | Clinical |

Proposed but not existing:
- `visit_status_history`
- `clinical_documents`
- `medical_certificates`

## Prescription and Inventory Tables

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `prescriptions` | `id`, `organization_id`, `clinic_id`, `visit_id`, `prescribing_user_id`, `status`, `safety_review_required`, `safety_review_summary`, shared audit columns | PK; FKs visit/user; status enum; indexed | Prescription header | Clinical |
| `prescription_items` | `id`, `organization_id`, `clinic_id`, `prescription_id`, `inventory_item_id`, `medication_label`, `dosage_text`, `frequency_text`, `duration_text`, `quantity`, `dispensed_quantity`, `safety_note`, shared audit columns | PK; FKs prescription/inventory; quantity and dispensed checks; indexed | Medication line item | Clinical |
| `inventory_items` | `id`, `organization_id`, `clinic_id`, `sku`, `item_name`, `generic_name`, `unit`, `reorder_level`, shared audit columns | PK; unique clinic/SKU; reorder check; indexed | Inventory catalog | Confidential |
| `inventory_batches` | `id`, `organization_id`, `clinic_id`, `inventory_item_id`, `batch_number`, `expiry_date`, `quantity_on_hand`, `unit_cost`, shared audit columns | PK; FK inventory item; unique item/batch; quantity/cost checks; expiry index | Stock batch | Confidential |
| `stock_movements` | `id`, `organization_id`, `clinic_id`, `inventory_item_id`, `inventory_batch_id`, `movement_type`, `quantity`, `reason`, `reference_table`, `reference_record_id`, shared audit columns | PK; FKs item/batch; nonzero quantity check; movement/time indexes | Inventory movement ledger | Confidential |

Proposed but not existing:
- `prescription_safety_alerts`

## Claim and Evidence Tables

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `claim_readiness_assessments` | `id`, `organization_id`, `clinic_id`, `visit_id`, `assessment_version`, `total_score`, `readiness_status`, `review_status`, `rule_set_version`, `calculated_by_type`, `calculated_by_user_id`, `calculated_at`, `reviewed_by`, `reviewed_at`, `is_current`, shared audit columns | PK; FK visit/user; tenant-safe clinic FK; unique visit/version; score/status/review checks; indexed | Claim readiness score | Financial |
| `claim_readiness_items` | `id`, `organization_id`, `clinic_id`, `assessment_id`, `dimension_code`, `weight`, `raw_score`, `weighted_score`, `item_status`, `reason_code`, `reason_text`, `evidence_reference`, shared audit columns | PK; FK assessment; tenant-safe clinic FK; unique dimension; score/weight/dimension checks; weight-total trigger | Claim readiness dimension | Financial |
| `evidence_packages` | `id`, `organization_id`, `clinic_id`, `visit_id`, `package_version`, `package_status`, `completeness_score`, `storage_reference`, `checksum`, `generated_by`, `generated_at`, `approved_by`, `approved_at`, shared audit columns | PK; FK visit/user; tenant-safe clinic FK; unique visit/version; status/score checks; indexed | Evidence package header | Clinical |

Proposed but not existing:
- `evidence_package_items`

## Settings, Modules, Notifications, Integrations

| Table | Existing Columns | Keys and Constraints | Description | Security |
| --- | --- | --- | --- | --- |
| `organization_operational_settings` | `id`, `organization_id`, `settings_payload`, shared audit columns | PK; FK; unique organization | Operational settings | Confidential |
| `organization_claim_settings` | `id`, `organization_id`, `ready_threshold`, `needs_review_threshold`, six dimension weight columns, `settings_payload`, shared audit columns | PK; FK; unique organization; threshold and weight checks | Claim scoring settings | Financial |
| `organization_clinical_settings` | `id`, `organization_id`, `ai_assist_enabled`, `require_human_review`, `settings_payload`, shared audit columns | PK; FK; unique organization | Clinical AI settings | Clinical |
| `organization_security_settings` | `id`, `organization_id`, `session_timeout_minutes`, `mfa_required_for_privileged_roles`, `settings_payload`, shared audit columns | PK; FK; unique organization; timeout check | Security settings | Credential |
| `organization_compliance_settings` | `id`, `organization_id`, `audit_retention_days`, `clinical_record_retention_years`, `pdpa_request_sla_days`, `settings_payload`, shared audit columns | PK; FK; unique organization | Compliance settings | Audit |
| `system_modules` | `id`, `module_key`, `display_name`, `description`, shared audit columns | PK; unique module key | Module catalog | Internal |
| `organization_module_settings` | `id`, `organization_id`, `module_id`, `is_enabled`, `settings_payload`, shared audit columns | PK; FKs; unique organization/module | Module toggles | Confidential |
| `notification_event_types` | `id`, `event_key`, `display_name`, `description`, shared audit columns | PK; unique event key | Notification event catalog | Internal |
| `organization_notification_settings` | `id`, `organization_id`, `event_type_id`, `channel`, `is_enabled`, `recipient_scope`, `settings_payload`, shared audit columns | PK; FKs; unique organization/event/channel; channel check | Notification settings | Confidential |
| `integration_providers` | `id`, `provider_key`, `display_name`, `description`, shared audit columns | PK; unique provider key | Integration provider catalog | Internal |
| `organization_integrations` | `id`, `organization_id`, `provider_id`, `integration_status`, `configuration_reference`, `last_sync_at`, `settings_payload`, shared audit columns | PK; FKs; unique organization/provider; status check | Integration configuration | Credential |
| `organization_setting_versions` | `id`, `organization_id`, `setting_table`, `setting_record_id`, `version_no`, `snapshot`, `change_reason`, shared audit columns | PK; FK organization; unique setting/version; version check | Settings version history | Audit |

## Audit Table

### `audit_logs`

Purpose: durable security and business event record. Security: Audit.

| Column | Type | Nullable | Default | PK/FK/C/I | Description | Security |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | uuid | No | `gen_random_uuid()` | PK | Audit event id | Audit |
| `organization_id` | uuid | Yes | none | FK, indexed | Tenant scope | Audit |
| `clinic_id` | uuid | Yes | none | FK, indexed | Clinic scope | Audit |
| `actor_user_id` | uuid | Yes | none | FK, indexed | Acting user | Audit |
| `action_type` | audit_action_type | No | none | enum, indexed | Event action | Audit |
| `target_table` | text | No | none | indexed with target id | Target table name | Audit |
| `target_record_id` | uuid | Yes | none | indexed with target table | Target record | Audit |
| `reason` | text | Yes | none | - | User or system reason | Audit |
| `old_value` | jsonb | Yes | none | - | Minimized previous value | Audit |
| `new_value` | jsonb | Yes | none | - | Minimized new value | Audit |
| `ip_address` | inet | Yes | none | - | Request IP | Audit |
| `user_agent` | text | Yes | none | - | Client user agent | Audit |
| `correlation_id` | text | Yes | none | - | Request correlation id | Audit |
| `outcome` | text | No | `'success'` | check | success/failure/blocked | Audit |
| `created_at` | timestamptz | No | `now()` | indexed | Event time | Audit |

## Storage Buckets

Existing private buckets created in migration `007`:
- `organization-assets`
- `patient-documents`
- `evidence-files`
- `medical-certificates`
- `integration-files`

Gap:
- No storage object RLS policies were found in migrations.
