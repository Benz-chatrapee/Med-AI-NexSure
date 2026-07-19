# ERD Overview

## 1. Document Control
Status: Populated for DB-DOC-BATCH-7-ARCHITECTURE. Source of truth: migrations `001` through `007` and completed database domain docs. Runtime effect: none.

## 2. Purpose
Provides the authoritative cross-domain ERD overview for Med AI NexSure, separating implemented relationships from planned and future design.

## 3. Scope
Domains covered: Identity and Authentication, Organization and Clinic, Patient, Visit, SOAP, Diagnosis and ICD, Prescription and Inventory, Medical Certificate, Insurance Coverage, Payer Rules, Claim Readiness, Evidence Package, Audit, AI, Storage, and Analytics.

## 4. ERD Legend
Mermaid relationships show verified database relationships where possible. Future relationships are labeled `Future` in the relationship text.

## 5. Entity Status Legend
Existing = implemented in migrations. Planned = documented design for near-term implementation. Future = not implemented. Review Required = decision not closed. Compatibility Sensitive = implemented or referenced name requiring controlled migration.

## 6. Domain Ownership Notation
Clinical domains own clinical truth. Insurance and claim readiness consume clinical source versions. Audit records events but does not own source state. AI output is advisory.

## 7. Tenant-boundary Notation
Tenant-bound records include `organization_id`; clinic-scoped records include `clinic_id`. Composite tenant-safe FK expectations use `(organization_id, clinic_id)` where implemented or planned.

## 8. Authoritative versus Derived Records
Authoritative: organizations, clinics, patients, visits, SOAP, diagnosis, prescriptions, inventory, audit, claim assessment rows, and evidence package rows. Derived: dashboards, readiness scores, AI suggestions, package summaries, and analytics.

## 9. Existing versus Future Relationships
Future certificate, clinical document, payer-rule, AI governance, analytics, and professional credential relationships are shown as Future. Do not implement from this document without migrations.

## 10. Core Foundation ERD
```mermaid
erDiagram
  organizations ||--o{ clinics : "Existing tenant owns"
  organizations ||--o{ user_profiles : "Existing profiles"
  organizations ||--o{ roles : "Existing scoped roles"
  permissions ||--o{ role_permissions : "Existing grants"
  roles ||--o{ role_permissions : "Existing grants"
  user_profiles ||--o{ user_roles : "Existing legacy assignments"
  user_profiles ||--o{ user_role_assignments : "Existing current assignments"
```

## 11. Patient and Visit ERD
```mermaid
erDiagram
  organizations ||--o{ patients : "Existing"
  clinics ||--o{ patients : "Existing"
  patients ||--o{ patient_clinic_registrations : "Existing"
  patients ||--o{ visits : "Existing"
  clinics ||--o{ visits : "Existing"
  visits ||--o{ visit_vitals : "Existing"
  user_profiles ||--o{ visits : "Existing attending"
```

## 12. SOAP and Clinical ERD
```mermaid
erDiagram
  visits ||--|| soap_notes : "Existing current note"
  soap_notes ||--o{ soap_note_versions : "Existing versions"
  user_profiles ||--o{ soap_notes : "Existing reviewer/AI acceptance"
  soap_notes ||--o{ soap_signatures : "Future"
  soap_notes ||--o{ soap_amendments : "Future"
```

## 13. Diagnosis and ICD ERD
```mermaid
erDiagram
  organizations ||--o{ diagnoses : "Existing catalogue"
  visits ||--o{ visit_diagnoses : "Existing"
  diagnoses ||--o{ visit_diagnoses : "Existing optional FK"
  visit_diagnoses ||--o{ diagnosis_versions : "Future"
  diagnosis_versions ||--o{ diagnosis_code_mappings : "Future"
  code_systems ||--o{ code_system_versions : "Future"
```

## 14. Prescription and Inventory ERD
```mermaid
erDiagram
  visits ||--o{ prescriptions : "Existing"
  prescriptions ||--o{ prescription_items : "Existing"
  inventory_items ||--o{ prescription_items : "Existing optional"
  inventory_items ||--o{ inventory_batches : "Existing"
  inventory_items ||--o{ stock_movements : "Existing ledger"
  prescriptions ||--o{ prescription_safety_alerts : "Future"
  prescriptions ||--o{ dispensing_events : "Future"
```

## 15. Medical Certificate ERD
```mermaid
erDiagram
  patients ||--o{ medical_certificates : "Future"
  visits ||--o{ medical_certificates : "Future"
  medical_certificates ||--o{ medical_certificate_versions : "Future"
  medical_certificates ||--o{ medical_certificate_exports : "Future"
  user_profiles ||--o{ medical_certificates : "Future signer"
```

## 16. Insurance and Claim Readiness ERD
```mermaid
erDiagram
  visits ||--o{ claim_readiness_assessments : "Existing"
  claim_readiness_assessments ||--o{ claim_readiness_items : "Existing"
  organizations ||--|| organization_claim_settings : "Existing"
  payer_rule_sets ||--o{ payer_rule_versions : "Future"
  payer_rule_versions ||--o{ claim_readiness_assessments : "Future source reference"
```

## 17. Evidence and Audit ERD
```mermaid
erDiagram
  visits ||--o{ evidence_packages : "Existing"
  evidence_packages ||--o{ evidence_items : "Future"
  evidence_packages ||--o{ evidence_manifests : "Future"
  organizations ||--o{ audit_logs : "Existing"
  clinics ||--o{ audit_logs : "Existing"
  user_profiles ||--o{ audit_logs : "Existing actor"
```

## 18. AI Governance ERD
```mermaid
erDiagram
  soap_notes ||--o{ soap_ai_suggestions : "Future advisory"
  visit_diagnoses ||--o{ diagnosis_ai_suggestions : "Future advisory"
  prescriptions ||--o{ medication_ai_suggestions : "Future advisory"
  ai_model_versions ||--o{ ai_suggestion_events : "Future governance"
```

AI suggestions are not authoritative clinical truth until an authorized human accepts or rejects them through governed workflow.

## 19. Storage Relationships
Existing private buckets: `organization-assets`, `patient-documents`, `evidence-files`, `medical-certificates`, `integration-files`. Future metadata rows should link bucket/object path/checksum to `clinical_documents`, `evidence_items`, certificate exports, or integration logs.

## 20. Analytics and Derived-data Relationships
Analytics and dashboards are derived from visits, claims, evidence, audit, inventory, and payer-rule records. Future summary tables or materialized views must preserve tenant filters and must not become clinical truth.

## 21. Cross-domain Relationships
Visit is the central clinical-to-insurance bridge. Claim readiness reads clinical and evidence versions. Evidence packages snapshot exact source versions. Audit logs reference targets by table and record ID but are not version tables.

## 22. Cardinality Rules
One organization has many clinics and profiles. One patient has many visits. One visit has one current SOAP note and many diagnoses, prescriptions, assessments, and evidence packages. One assessment has many dimension items.

## 23. Tenant-safe Composite Relationships
Existing tenant-safe clinic FK exists for clinic detail tables, memberships, registrations, vitals, diagnoses, claim readiness, and evidence packages. Review Required: some base clinical tables use single-column FKs plus tenant columns and need composite FK validation in future migrations.

## 24. High-risk Relationship Notes
Signing, dispensing, certificate issuance, export, readiness override, and professional credential decisions need permission, professional authority, source version, and audit consistency.

## 25. Compatibility-sensitive Relationships
`user_roles` versus `user_role_assignments`; colon versus dot permissions; existing enum states versus canonical state machines; free-text `rule_set_version`, `evidence_reference`, and `storage_reference`; future document tables referenced by UI but absent in migrations.

## 26. Review Required Decisions
Credential schema, payer-rule schema, clinical document metadata, storage object policies, analytics materialization, composite FK retrofits, and canonical migration from existing states to documented future states.

## Architecture Flow Explanations
| Flow | Source domain | Target domain | Owner | Identifiers | Tenant context | Dependency | Security boundary | Audit | Failure impact |
|---|---|---|---|---|---|---|---|---|---|
| Core identity and tenant | Auth/profile | Organization/clinic | Identity | `auth.users.id`, `user_profiles.id` | organization/clinic membership | read/write RBAC | RLS helpers | permission changes | access denied or overbroad access |
| Patient to visit | Patient | Visit | Clinical ops | patient UUID, visit UUID, business numbers | org/clinic | visit writes depend on patient | patient PHI RLS | create/update | invalid encounter |
| Visit to clinical records | Visit | SOAP/diagnosis/prescription | Clinical | visit UUID | org/clinic | clinical records depend on visit | clinical permissions | clinical review | incomplete record |
| SOAP to diagnosis/prescription | SOAP | Diagnosis/prescription | Clinical | SOAP version, diagnosis, prescription | org/clinic | plan/assessment context | professional authority | sign/amend/order | unsafe clinical truth |
| Visit to claim readiness | Visit | Claim readiness | Insurance | visit UUID, assessment version | org/clinic/claim case | source versions | claim permissions | claim_review | stale readiness |
| Clinical records to evidence | Clinical | Evidence | Evidence | source version IDs | org/clinic/claim case | immutable source references | minimum necessary | evidence_change/export | bad package |
| Versions to audit | Domain versions | Audit | Domain + compliance | record/version/correlation ID | org/clinic | transaction consistency | audit.view | audit event | untraceable change |
| Storage to metadata | Storage | Evidence/cert/docs | Evidence/storage | bucket/object/checksum | org/clinic path metadata | DB row and object | storage policy | export/download | orphan or leak |
| Operations to analytics | Operational | Analytics | Analytics | aggregate keys | tenant scoped | derived reads | aggregate-first | dashboard_viewed | misleading dashboard |
| Backup to restore | Backup | Restored env | Operations | snapshot/migration/storage IDs | environment/tenant | restore runbook | privileged ops | restore audit | data loss/reintro |
| Docs to QA gate | Docs | Release QA | QA | requirement IDs | n/a | checklist evidence | no code bypass | sign-off | release blocked |
