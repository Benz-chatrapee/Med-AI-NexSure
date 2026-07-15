# Med AI NexSure — Database Engineering Rules

## 1. Purpose

This document defines the database architecture, engineering standards, security rules, and implementation constraints for the **Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform**.

The database must support:

- Multi-tenant healthcare organizations and clinics
- Clinical workflows and patient visits
- AI-assisted clinical decision support
- Claim readiness and evidence management
- Insurance and payer-rule validation
- Economic intelligence and cost analysis
- Prescription safety
- Auditability, traceability, and regulatory compliance
- Role-based and organization-scoped access control

The database is a regulated enterprise data layer. Correctness, security, auditability, and data isolation take priority over development speed.

---

## 2. Technology Baseline

Use the existing project database stack only:

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)
- SQL migrations
- PostgreSQL functions, triggers, views, and constraints

Do not introduce another database, ORM, migration framework, queue, cache, or search engine unless it already exists in the repository and is explicitly required.

---

## 3. Core Database Principles

### 3.1 Source of Truth

- PostgreSQL is the authoritative system of record for transactional platform data.
- Business-critical calculations must be reproducible from stored data.
- AI-generated content must never overwrite clinician-authored or reviewer-approved records.
- AI output must be stored separately with model, version, confidence, status, and reviewer metadata.

### 3.2 Multi-Tenant Isolation

- Every tenant-owned table must contain `organization_id`.
- Clinic-scoped records should also contain `clinic_id` where applicable.
- RLS must prevent access across organizations.
- Client-provided organization identifiers must never be trusted without authorization checks.
- Service-role access must be limited to controlled backend operations.

### 3.3 Data Integrity

Prefer database-enforced integrity through:

- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Not-null constraints
- Typed enums or constrained text values
- Transactions
- Idempotent operations

Do not rely only on frontend validation.

### 3.4 Auditability

All sensitive and business-critical changes must be traceable.

Audit records should identify:

- Organization
- Clinic
- User
- Action
- Entity type
- Entity ID
- Previous value when appropriate
- New value when appropriate
- Timestamp
- Request or correlation ID when available
- Source such as user, system, API, migration, or AI agent

Audit logs must be append-only for normal application roles.

### 3.5 Human-in-the-Loop

AI is decision support, not the final decision maker.

Store AI lifecycle states such as:

- `pending`
- `generated`
- `review_required`
- `accepted`
- `edited`
- `rejected`
- `failed`

Reviewer decisions must retain reviewer identity, timestamp, and justification where required.

---

## 4. Naming Conventions

### 4.1 General

- Use `snake_case` for tables, columns, indexes, constraints, functions, and views.
- Use plural table names, for example `patients`, `visits`, and `audit_logs`.
- Use singular entity names in foreign-key columns, for example `patient_id`.
- Use descriptive names; avoid unclear abbreviations.

### 4.2 Primary Keys

Use UUID primary keys:

```sql
id uuid primary key default gen_random_uuid()
```

Do not use sequential identifiers for externally exposed records unless required by a business numbering scheme.

### 4.3 Standard Columns

Tenant-owned transactional tables should normally include:

```sql
id uuid primary key default gen_random_uuid(),
organization_id uuid not null,
clinic_id uuid,
created_at timestamptz not null default now(),
created_by uuid,
updated_at timestamptz not null default now(),
updated_by uuid
```

Use `deleted_at` only when soft deletion is justified.

### 4.4 Boolean Columns

Use positive names:

- `is_active`
- `is_locked`
- `is_required`
- `is_ai_generated`

Avoid ambiguous names such as `status_flag`.

### 4.5 Status Columns

Use explicit names:

- `visit_status`
- `claim_readiness_status`
- `review_status`
- `evidence_status`

Do not reuse a generic `status` column when multiple state dimensions exist.

### 4.6 Indexes

Use the following format:

```text
idx_<table>_<column_or_purpose>
```

Examples:

```text
idx_visits_organization_clinic_date
idx_claim_readiness_visit
idx_audit_logs_entity
```

### 4.7 Constraints

Use:

```text
pk_<table>
fk_<table>_<referenced_table>
uq_<table>_<columns>
ck_<table>_<rule>
```

---

## 5. Core Domain Model

## 5.1 Organization and Access

### `organizations`

Represents a tenant or healthcare organization.

Recommended fields:

- `id`
- `code`
- `name`
- `organization_type`
- `timezone`
- `locale`
- `is_active`
- audit timestamps

### `clinics`

Represents a clinic, branch, hospital unit, or service location.

Recommended fields:

- `id`
- `organization_id`
- `code`
- `name`
- `clinic_type`
- `address`
- `phone`
- `is_active`
- audit timestamps

### `user_profiles`

Extends `auth.users` with application-level user information.

Recommended fields:

- `id`, referencing `auth.users.id`
- `organization_id`
- `default_clinic_id`
- `employee_code`
- `display_name`
- `first_name`
- `last_name`
- `professional_license_no`
- `job_title`
- `is_active`
- `is_locked`
- `last_active_at`

### `roles`

Defines business roles such as:

- Admin
- Doctor
- Nurse
- Pharmacist
- Clinic Staff
- Clinic Admin
- Claim Reviewer
- Auditor
- Executive

### `permissions`

Defines granular application permissions.

Example permission keys:

- `patient.read`
- `patient.write`
- `visit.manage`
- `soap.sign`
- `prescription.review`
- `claim.review`
- `audit.read`
- `user.manage`
- `ai.use`

### `user_roles`

Maps users to roles with organization and optional clinic scope.

### `role_permissions`

Maps roles to permissions.

### `user_clinic_access`

Defines explicit clinic access when a user can access more than one clinic.

---

## 5.2 Patient Domain

### `patients`

Recommended fields:

- `id`
- `organization_id`
- `primary_clinic_id`
- `hn`
- `national_id_hash`
- `passport_no_hash`
- `title`
- `first_name`
- `last_name`
- `date_of_birth`
- `sex_at_birth`
- `phone`
- `email`
- `address`
- `blood_type`
- `allergy_summary`
- `is_active`
- audit timestamps

Requirements:

- `hn` must be unique within the appropriate organization or clinic scope.
- Sensitive identifiers should be encrypted, tokenized, or irreversibly hashed depending on the use case.
- Searchable normalized fields should not expose raw sensitive values.

### `patient_identifiers`

Stores multiple identifiers and issuing authorities when required.

### `patient_contacts`

Stores emergency contacts and related-person information.

### `patient_consents`

Stores PDPA and clinical consent records.

Recommended fields:

- `patient_id`
- `consent_type`
- `consent_version`
- `consent_status`
- `granted_at`
- `revoked_at`
- `captured_by`
- `evidence_url` or controlled storage reference

### `patient_allergies`

Stores structured allergy records.

### `patient_conditions`

Stores long-term medical conditions and relevant history.

---

## 5.3 Visit and Clinical Workflow

### `visits`

Recommended fields:

- `id`
- `organization_id`
- `clinic_id`
- `patient_id`
- `visit_number`
- `visit_type`
- `visit_status`
- `chief_complaint`
- `assigned_doctor_id`
- `assigned_nurse_id`
- `started_at`
- `completed_at`
- `claim_required`
- audit timestamps

Supported visit statuses:

- `waiting`
- `in_consultation`
- `pharmacy`
- `completed`
- `pending_evidence`
- `claim_review`
- `cancelled`

Store status history separately rather than relying only on the current status.

### `visit_status_history`

Recommended fields:

- `visit_id`
- `from_status`
- `to_status`
- `changed_by`
- `changed_at`
- `reason`

### `soap_notes`

Recommended fields:

- `visit_id`
- `subjective`
- `objective`
- `assessment`
- `plan`
- `completeness_score`
- `version_no`
- `note_status`
- `authored_by`
- `signed_by`
- `signed_at`
- `is_current_version`

Do not overwrite signed clinical notes. Create a new version and retain the previous version.

### `soap_note_versions`

Use when version history is separated from the primary `soap_notes` record.

### `visit_diagnoses`

Recommended fields:

- `visit_id`
- `diagnosis_type`
- `icd10_code`
- `icd9_code`
- `description`
- `is_primary`
- `coding_status`
- `entered_by`
- `verified_by`

### `clinical_observations`

Stores vital signs, measurements, and structured observations.

### `clinical_documents`

Stores metadata for clinical attachments. Binary files should be stored in controlled object storage, not directly in large database columns unless explicitly required.

---

## 5.4 Prescription and Medication Safety

### `prescriptions`

Recommended fields:

- `visit_id`
- `prescriber_id`
- `prescription_status`
- `safety_level`
- `review_status`
- `reviewed_by`
- `reviewed_at`
- `justification`

### `prescription_items`

Recommended fields:

- `prescription_id`
- `medication_id`
- `medication_name`
- `strength`
- `dosage`
- `route`
- `frequency`
- `duration`
- `quantity`
- `instructions`

### `medications`

Maintains the medication master.

### `medication_interactions`

Stores drug-drug interaction rules and severity.

### `prescription_safety_checks`

Stores the result of allergy, interaction, duplicate therapy, dose, and contraindication checks.

Recommended fields:

- `prescription_id`
- `prescription_item_id`
- `check_type`
- `severity`
- `rule_code`
- `message`
- `source`
- `review_status`
- `reviewed_by`
- `reviewed_at`

---

## 5.5 Medical Certificates

### `medical_certificates`

Recommended fields:

- `visit_id`
- `certificate_number`
- `certificate_status`
- `diagnosis_summary`
- `recommendation`
- `rest_start_date`
- `rest_end_date`
- `issued_by`
- `issued_at`
- `signed_at`
- `voided_at`
- `void_reason`
- `version_no`

Statuses:

- `draft`
- `issued`
- `voided`
- `reissued`

Every reissue or void operation must be auditable.

---

## 5.6 AI Clinical Intelligence

### `ai_generation_runs`

Tracks every AI execution.

Recommended fields:

- `organization_id`
- `clinic_id`
- `patient_id`
- `visit_id`
- `agent_type`
- `task_type`
- `provider`
- `model_name`
- `model_version`
- `prompt_version`
- `input_reference`
- `output_reference`
- `confidence_score`
- `execution_status`
- `started_at`
- `completed_at`
- `error_code`
- `error_message`
- `correlation_id`

Do not store unnecessary raw sensitive prompts or responses. Store the minimum data required for traceability and controlled review.

### `ai_clinical_summaries`

Stores AI-generated visit summaries separately from clinician-authored notes.

### `ai_icd_suggestions`

Recommended fields:

- `visit_id`
- `suggested_code`
- `description`
- `confidence_score`
- `reasoning_summary`
- `review_status`
- `reviewed_by`
- `reviewed_at`

### `ai_review_decisions`

Stores user decisions for AI outputs.

Recommended fields:

- `ai_generation_run_id`
- `decision`
- `reviewer_id`
- `reviewed_at`
- `edited_output`
- `reason`

---

## 5.7 Claim Readiness

### `claim_readiness_assessments`

Recommended fields:

- `visit_id`
- `assessment_version`
- `total_score`
- `claim_readiness_status`
- `risk_level`
- `calculated_at`
- `calculated_by_type`
- `calculated_by_user_id`
- `rule_set_version`
- `is_current`

Default score bands:

- `ready`: 85–100
- `needs_review`: 60–84
- `not_ready`: 0–59

Default scoring dimensions:

- SOAP completeness: 25%
- Diagnosis and ICD: 20%
- Prescription or procedure: 15%
- Evidence completeness: 20%
- Insurance rule alignment: 10%
- Economic justification: 10%

Store the score breakdown. Do not store only the final score.

### `claim_readiness_items`

Recommended fields:

- `assessment_id`
- `dimension_code`
- `weight`
- `raw_score`
- `weighted_score`
- `item_status`
- `reason_code`
- `reason_text`
- `evidence_reference`

### `missing_evidence_items`

Recommended fields:

- `visit_id`
- `assessment_id`
- `evidence_type`
- `severity`
- `is_required`
- `resolution_status`
- `assigned_to`
- `resolved_by`
- `resolved_at`

### `claim_reviews`

Stores reviewer decisions independently from automated assessments.

---

## 5.8 Evidence Package

### `evidence_packages`

Recommended fields:

- `visit_id`
- `package_version`
- `package_status`
- `completeness_score`
- `generated_by`
- `generated_at`
- `approved_by`
- `approved_at`
- `storage_reference`
- `checksum`

Evidence completeness dimensions:

- SOAP: 25%
- Diagnosis and ICD: 25%
- Prescription or treatment: 15%
- Medical certificate: 15%
- Attachments: 10%
- Claim summary: 10%

Default status bands:

- `complete`: 90–100
- `review_needed`: 70–89
- `incomplete`: 0–69

### `evidence_package_items`

Recommended fields:

- `evidence_package_id`
- `evidence_type`
- `entity_type`
- `entity_id`
- `document_version`
- `item_status`
- `checksum`

Package versions must be immutable after approval or submission.

---

## 5.9 Insurance and Payer Rules

### `payers`

Recommended fields:

- `organization_id`
- `payer_code`
- `payer_name`
- `payer_type`
- `is_active`

### `insurance_policies`

Stores patient or visit-related policy information where permitted.

### `payer_rule_sets`

Recommended fields:

- `payer_id`
- `name`
- `version`
- `effective_from`
- `effective_to`
- `rule_set_status`
- `published_by`
- `published_at`

### `payer_rules`

Recommended rule categories:

- Required evidence
- ICD rule
- Coverage rule
- Waiting period
- Exclusion
- Benefit limit
- Cost threshold
- Risk matrix

Recommended fields:

- `payer_rule_set_id`
- `rule_code`
- `rule_category`
- `priority`
- `condition_json`
- `action_json`
- `message_template`
- `is_active`

JSON rules must have a documented schema and version. Do not store uncontrolled business logic as arbitrary JSON.

### `payer_rule_evaluations`

Stores evaluation results per visit, assessment, and rule version.

---

## 5.10 Economic Intelligence

### `visit_cost_summaries`

Recommended fields:

- `visit_id`
- `currency_code`
- `medication_cost`
- `procedure_cost`
- `service_cost`
- `other_cost`
- `total_cost`
- `benchmark_cost`
- `expected_min_cost`
- `expected_max_cost`
- `cost_variance`
- `cost_status`

### `visit_cost_items`

Stores cost-line details.

### `cost_benchmarks`

Recommended fields:

- `organization_id`
- `clinic_id`
- `diagnosis_group`
- `procedure_group`
- `payer_id`
- `effective_from`
- `effective_to`
- `benchmark_value`
- `lower_bound`
- `upper_bound`
- `sample_size`
- `methodology_version`

### `economic_alerts`

Recommended fields:

- `visit_id`
- `alert_type`
- `severity`
- `metric_name`
- `observed_value`
- `expected_value`
- `reason`
- `alert_status`
- `reviewed_by`
- `reviewed_at`

---

## 5.11 Audit and Compliance

### `audit_logs`

Recommended fields:

- `id`
- `organization_id`
- `clinic_id`
- `actor_user_id`
- `actor_type`
- `action`
- `entity_type`
- `entity_id`
- `previous_data jsonb`
- `new_data jsonb`
- `metadata jsonb`
- `ip_address`
- `user_agent`
- `correlation_id`
- `created_at`

Rules:

- Insert-only for application users.
- No normal client update or delete policy.
- Sensitive values must be redacted.
- Do not log passwords, access tokens, secret keys, or full protected identifiers.

### `access_logs`

Stores sensitive-record access when read auditing is required.

### `compliance_alerts`

Stores PDPA, access, retention, consent, and policy exceptions.

### `data_retention_rules`

Defines retention periods by entity type and jurisdiction.

---

## 6. Relationships and Ownership

Key ownership rules:

```text
organization
├── clinics
├── users and roles
├── patients
│   └── visits
│       ├── SOAP notes
│       ├── diagnoses
│       ├── prescriptions
│       ├── medical certificates
│       ├── AI outputs
│       ├── claim readiness assessments
│       ├── evidence packages
│       ├── payer-rule evaluations
│       └── cost summaries
└── audit and compliance records
```

Requirements:

- A visit must belong to the same organization as its patient and clinic.
- Clinical child records must inherit organization and clinic scope from the visit.
- Cross-tenant relationships must be prevented by constraints, triggers, or controlled functions.
- Avoid polymorphic references unless the benefit clearly outweighs referential-integrity limitations.

---

## 7. Row Level Security

RLS must be enabled on all exposed tenant and sensitive tables.

### 7.1 Required RLS Concepts

Policies should evaluate:

- Authenticated user ID
- Active user profile
- Organization membership
- Clinic access
- Role and permission
- Record sensitivity
- Operation type: select, insert, update, delete

### 7.2 Helper Functions

Use stable security helper functions to avoid duplicating complex logic in every policy.

Recommended functions:

```text
current_user_profile_id()
current_organization_id()
user_has_organization_access(organization_id)
user_has_clinic_access(clinic_id)
user_has_permission(permission_key)
user_can_access_patient(patient_id)
user_can_access_visit(visit_id)
```

Security requirements:

- Review all `security definer` functions carefully.
- Set a safe `search_path` explicitly.
- Do not accept unchecked tenant IDs from the client.
- Avoid recursive RLS policy dependencies.

### 7.3 Policy Expectations

- Users may read only records in authorized organizations and clinics.
- Clinical writes require the corresponding workflow permission.
- Signed or approved records cannot be modified through ordinary update policies.
- Auditors may receive read-only access based on scope.
- Executives may receive aggregate access without unnecessary patient-level detail.
- AI execution services must have narrowly scoped backend access.

---

## 8. Database Functions and Transactions

Use PostgreSQL functions or controlled RPC operations when a workflow requires atomic updates.

Examples:

- Create patient with consent
- Create visit and initial status history
- Transition visit status
- Sign a SOAP note
- Approve a medical certificate
- Calculate and publish claim readiness
- Generate an evidence package version
- Resolve a missing-evidence item
- Apply payer rules
- Record an AI review decision

Requirements:

- Validate tenant and clinic scope inside the transaction.
- Use explicit error codes or structured errors where practical.
- Make retryable operations idempotent.
- Prevent partial workflow completion.
- Write audit records in the same transaction for critical changes.

---

## 9. Views and Reporting

Views should support read models without weakening security.

Recommended views:

- `v_dashboard_kpi_summary`
- `v_dashboard_queue_snapshot`
- `v_dashboard_case_worklist`
- `v_dashboard_recent_activity`
- `v_claim_readiness_worklist`
- `v_evidence_package_worklist`
- `v_economic_dashboard_worklist`
- `v_prescription_review_queue`
- `v_compliance_alert_worklist`

Rules:

- Views must preserve tenant filtering.
- Do not expose sensitive columns unnecessarily.
- Avoid `select *` in production views.
- Document expected columns and consumers.
- Use materialized views only when freshness and refresh strategy are defined.

---

## 10. Indexing and Performance

Create indexes based on actual query patterns.

Common composite indexes:

```sql
(organization_id, clinic_id, created_at desc)
(organization_id, patient_id)
(organization_id, visit_status, created_at desc)
(visit_id, is_current)
(assessment_id, dimension_code)
(entity_type, entity_id, created_at desc)
```

Guidelines:

- Index foreign keys used in joins.
- Index tenant scope columns used in every query.
- Use partial indexes for active, current, unresolved, or pending records when beneficial.
- Avoid excessive indexes on high-write tables.
- Validate plans with `explain analyze` for important queries.
- Paginate large worklists using stable cursor-based pagination when practical.

---

## 11. JSONB Usage

Use relational columns for data that is queried, constrained, joined, or reported regularly.

Use JSONB only for:

- Versioned rule payloads
- Provider-specific metadata
- Non-critical extensible attributes
- Audit snapshots
- AI metadata that does not require relational querying

Requirements:

- Document JSON schemas.
- Store schema or payload version.
- Add check constraints where feasible.
- Add GIN indexes only for validated query requirements.
- Do not place the core patient, visit, claim, or prescription model into unstructured JSON.

---

## 12. Data Security and Privacy

### 12.1 Sensitive Data

Treat the following as protected:

- Patient identifiers
- Contact information
- Clinical notes
- Diagnosis information
- Prescription information
- Insurance policy information
- AI prompts and outputs containing clinical data
- Audit records containing sensitive context

### 12.2 Security Rules

- Apply least privilege.
- Encrypt data in transit and at rest using platform-supported controls.
- Avoid storing secrets in database tables.
- Redact sensitive fields in logs.
- Use controlled storage references for files.
- Separate public identifiers from internal primary keys where appropriate.
- Restrict bulk exports.
- Record sensitive record access when required.

### 12.3 PDPA and Regulatory Readiness

The data model should support:

- Consent history
- Purpose of processing
- Access traceability
- Data correction
- Data retention
- Legal hold where required
- Controlled deletion or anonymization
- Export of a patient’s applicable data

Deletion must not destroy records that must be retained for legal, clinical, insurance, or audit purposes.

---

## 13. Soft Delete, Archival, and Retention

Do not add `deleted_at` to every table by default.

Use soft deletion for entities such as configurable master data when recovery is needed.

Use immutable history or status transitions for:

- Signed clinical notes
- Issued medical certificates
- Claim assessments
- Evidence packages
- Payer rule versions
- Audit logs

Retention and archival processes must be explicit, documented, and testable.

---

## 14. Migration Rules

All schema changes must be delivered through version-controlled migrations.

### Required Practices

- Migrations must be deterministic.
- Prefer backward-compatible changes.
- Add new nullable columns before making them required when existing data is present.
- Backfill data explicitly.
- Add constraints after successful backfill.
- Create indexes concurrently when operational constraints require it and the platform supports it.
- Do not edit an already-applied shared migration.
- Never drop production data without explicit approval and a recovery plan.
- Include rollback guidance for high-risk changes.

### Migration Naming

Use the repository’s existing naming convention. When no convention exists, use:

```text
YYYYMMDDHHMMSS_description.sql
```

Example:

```text
20260714103000_create_claim_readiness_tables.sql
```

---

## 15. Seed and Mock Data

- Keep development seed data separate from production migrations.
- Never include real patient or employee information.
- Use clearly synthetic identifiers and clinical examples.
- Seed data must respect foreign keys and tenant scope.
- Provide deterministic records when automated tests depend on them.

---

## 16. Error Handling

Database errors exposed to the application should be safe and actionable.

Use clear categories such as:

- Authorization denied
- Validation failed
- Record not found
- Conflict or duplicate
- Invalid workflow transition
- Immutable record
- Rule evaluation failed
- Internal processing error

Do not expose raw database internals, secrets, SQL text, or protected data to end users.

---

## 17. Testing Requirements

Database changes should be validated through:

- Migration execution from a clean database
- Schema and constraint tests
- RLS tests for every role and tenant boundary
- Function and transaction tests
- Status-transition tests
- Audit-log tests
- Claim scoring tests
- Payer-rule version tests
- Evidence package immutability tests
- AI review lifecycle tests
- Performance checks for critical worklists

Minimum RLS scenarios:

1. Authorized user can access permitted organization and clinic data.
2. User cannot access another organization’s records.
3. Clinic-scoped user cannot access an unauthorized clinic.
4. Read-only roles cannot modify records.
5. Disabled or locked users cannot access protected data.
6. Signed or approved records cannot be changed through ordinary updates.
7. Service operations cannot exceed their intended scope.

---

## 18. Claim Readiness Calculation Rules

Claim readiness calculations must be versioned and explainable.

Each assessment must retain:

- Scoring model version
- Rule-set version
- Input references
- Dimension scores
- Weights
- Reasons
- Missing evidence
- Final score
- Final status
- Calculation timestamp
- Calculation source

Do not silently recalculate historical assessments when scoring logic changes. Create a new assessment version.

---

## 19. AI Data Governance

Every AI output must support traceability.

Required metadata where applicable:

- Agent or task type
- Model provider
- Model and version
- Prompt version
- Input data references
- Output version
- Confidence score
- Safety or guardrail result
- Processing timestamp
- Reviewer status
- Reviewer identity
- Reviewer decision
- Failure details

AI-generated recommendations must be distinguishable from verified clinical or claim decisions in both schema and queries.

---

## 20. Prohibited Practices

Do not:

- Disable RLS to make development easier.
- Use the service-role key in browser code.
- Trust a client-supplied `organization_id` without authorization validation.
- Store passwords, API keys, or secrets in application tables.
- Hard-delete signed clinical or approved audit records.
- Overwrite historical clinical versions.
- Store only a final AI output without execution metadata.
- Store only a final claim score without breakdown and rule version.
- Use unrestricted `security definer` functions.
- Add cross-tenant foreign-key relationships.
- Use `select *` in stable APIs or reporting views.
- introduce schema changes outside migrations.
- Put business-critical structured data into uncontrolled JSONB.
- Log full sensitive payloads without redaction.

---

## 21. Implementation Workflow

Before modifying the database:

1. Read this file and the repository’s `AGENTS.md`.
2. Inspect existing migrations, schemas, functions, policies, and views.
3. Identify existing tables and naming patterns.
4. Confirm tenant and clinic ownership rules.
5. Identify frontend and backend consumers.
6. Design the smallest safe schema change.
7. Define constraints, indexes, RLS, audit behavior, and migration order.
8. Implement through migration files only.
9. Run database and application validation.
10. Document assumptions and unresolved integration dependencies.

---

## 22. Definition of Done

A database change is complete only when:

- The migration runs successfully from a clean state.
- Existing data is handled safely.
- Constraints enforce expected integrity.
- RLS is enabled and tested.
- Tenant and clinic isolation are verified.
- Required indexes exist.
- Critical workflows are transactional.
- Audit records are generated where required.
- AI and claim logic remain versioned and explainable.
- No sensitive data is exposed through views or errors.
- Type generation or application database types are updated when used by the project.
- Lint, typecheck, tests, and build pass for affected application code.
- The change does not modify unrelated schemas or behavior.

---

## 23. Recommended Initial Table Set

For the Med AI NexSure MVP, prioritize:

```text
organizations
clinics
user_profiles
roles
permissions
user_roles
role_permissions
user_clinic_access
patients
patient_consents
patient_allergies
visits
visit_status_history
soap_notes
visit_diagnoses
prescriptions
prescription_items
prescription_safety_checks
medical_certificates
ai_generation_runs
ai_clinical_summaries
ai_icd_suggestions
ai_review_decisions
claim_readiness_assessments
claim_readiness_items
missing_evidence_items
evidence_packages
evidence_package_items
payers
payer_rule_sets
payer_rules
payer_rule_evaluations
visit_cost_summaries
visit_cost_items
cost_benchmarks
economic_alerts
audit_logs
access_logs
compliance_alerts
```

Implement modules incrementally. Do not create unused tables without a confirmed workflow or consumer.

---

## 24. Final Engineering Standard

Every database change must preserve the following principles:

- Secure by default
- Tenant-isolated
- Clinically traceable
- Claim explainable
- AI auditable
- Transactionally safe
- Version controlled
- Backward compatible where practical
- Minimal in scope
- Ready for regulated enterprise use