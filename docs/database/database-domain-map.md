# Database Domain Map

## Document Control
Status: Populated during DB-DOC-FINAL-CROSS-DOCUMENT-REVIEW. Runtime effect: none.

## Purpose
Defines authoritative ownership for Med AI NexSure database domains so cross-document references use one owner per business record.

## Domain Ownership Map
| Domain | Authoritative owner for | Existing objects | Planned/Future objects | Derived or advisory consumers | Key security boundary | Review Required |
|---|---|---|---|---|---|---|
| Core Foundation | tenant, clinic, RBAC, RLS helper foundations | `organizations`, `clinics`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_role_assignments` | canonical permission migration | all domains | platform/organization/clinic | platform admin separation |
| Identity and Authentication | authentication and application user profile | `auth.users`, `user_profiles` | identity lifecycle events | all user workflows | authenticated user and active profile | profile deactivation workflow |
| Organization and Clinic | tenant and care-location boundaries | organization/clinic detail and membership tables | department/care-team scopes | patient, visit, clinical, claim, evidence | organization and clinic | composite FK retrofit |
| Patient | patient identity and consent context | `patients`, `patient_clinic_registrations` | patient status history | visit, clinical, claim, analytics | PHI and clinic scope | patient business number strategy |
| Visit | encounter lifecycle | `visits`, `visit_vitals` | `visit_status_history` | SOAP, diagnosis, prescription, claim, evidence | assigned visit and clinic | canonical visit state migration |
| Clinical SOAP | SOAP clinical truth | `soap_notes`, `soap_note_versions` | signatures, amendments, AI suggestions | claim readiness, evidence | professional authority | signed-state enforcement |
| Diagnosis and ICD | clinical diagnosis and coding truth | `diagnoses`, `visit_diagnoses` | diagnosis/code versions, code systems | claim readiness, payer rules, evidence | clinical/coder scope | independent versioning |
| Prescription | medication order truth | `prescriptions`, `prescription_items` | prescription versions, safety alerts, dispensing events | claim readiness, evidence, inventory | prescriber/pharmacist separation | transactional dispensing |
| Inventory | stock truth | `inventory_items`, `inventory_batches`, `stock_movements` | stock reservations | prescription and analytics | clinic inventory scope | negative stock behavior |
| Medical Certificate | certificate lifecycle | private bucket only | certificate tables, versions, signatures, exports | evidence package | signing authority and export | legal template and signer model |
| Insurance Coverage | coverage interpretation | none | coverage/policy tables | claim readiness, analytics | claim-case scope | payer contract model |
| Payer Rules | payer rule interpretation | mock app types only | payer rule sets and versions | claim readiness | approval and versioning | rule activation workflow |
| Claim Readiness | advisory readiness assessments | `claim_readiness_assessments`, `claim_readiness_items`, `organization_claim_settings` | overrides and source references | evidence and dashboard | claim-case scope | immutable source references |
| Evidence | evidence packages and manifests | `evidence_packages` | `clinical_documents`, items, manifests, verifications, exports | payer submission, audit | storage + RLS | storage object policies |
| Audit and Compliance | audit events and compliance settings | `audit_logs`, `organization_compliance_settings`, `organization_setting_versions` | integrity controls and export logs | QA, incident response | audit-restricted | append-only hardening |
| AI Clinical | advisory AI artifacts | AI metadata columns on SOAP/diagnosis | AI model/prompt/policy/suggestion entities | clinical and claim users | invoking user permissions | governance schema |
| Storage | file-object lifecycle | private buckets | object metadata, storage policies, reconciliation | evidence/cert/docs | storage authorization | signed URL duration |
| Analytics | derived aggregates | none | materialized summaries/reporting tables | executives and operations | aggregate-only | refresh and RLS strategy |
| Backup and Recovery | backup and restore evidence | migrations and config in repo | restore evidence registry | operations/compliance | privileged operations | RPO/RTO |
| Observability | operational visibility | none | slow query/audit dashboards | QA/operations | restricted logs | tooling |

## Ownership Rules
- Insurance, payer rules, claim readiness, evidence, analytics, and AI do not own clinical truth.
- Storage paths do not confer authorization.
- Audit owns event traceability, not domain version state.
- Cross-domain writes require approved server workflow, transaction, RPC, or migration.

## Compatibility-sensitive Notes
Existing permission keys, state enums, role assignment tables, free-text source references, and storage bucket names are executable or operational contracts and require controlled migration.
