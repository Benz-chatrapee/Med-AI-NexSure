# Data Dictionary

## 1. Document Control
Status: Populated for DB-DOC-BATCH-7-ARCHITECTURE. Source of truth: `supabase/migrations/*.sql`, completed database docs, and app mock types where explicitly noted. Runtime effect: none.

## 2. Purpose
Provides the architecture-level data dictionary. Existing columns are verified from migrations; Future columns/entities are conceptual only.

## 3. Scope
Covers Core Foundation, Patient, Visit, SOAP, Diagnosis and ICD, Prescription, Inventory, Medical Certificate, Insurance Coverage, Payer Rules, Claim Readiness, Evidence Package, Audit, AI, Storage, and Analytics.

## 4. Data Dictionary Conventions
Shared mutable table columns usually include `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, and `is_active`. Tenant records use `organization_id`; clinic-scoped records use `clinic_id`.

## 5. Status Classification
Every row below is Existing, Planned, Future, Review Required, Deprecated, or Compatibility Sensitive.

## 6. Data Classification
Public, Internal, Confidential, PHI, Restricted Clinical PHI, Financial, Credential, Audit, Security, and Derived Analytics.

## 7. Core Foundation
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Organization | `organizations` | Yes | `id uuid PK default gen_random_uuid()`, `name text not null`, `legal_name`, `registration_number`, `country_code char(2) default 'TH'`, `timezone text default 'Asia/Bangkok'`, `code`, `organization_type`, `locale`, shared audit | unique name; `code` active index; RLS organization select | Confidential | migrations `001`, `005`, `007` | platform tenant admin scope |
| Existing | Organization | `clinics` | Yes | `id`, `organization_id`, `name`, `code`, legacy address/contact, `clinic_type`, `is_primary`, shared audit | unique org/code; unique `(organization_id,id)`; RLS clinic select | Confidential | `001`, `005`, `007` | multi-clinic restore |
| Existing | Identity | `user_profiles` | Yes | `id uuid PK FK auth.users`, `organization_id`, `primary_clinic_id`, display/email/job/department, shared audit | unique email; tenant-safe primary clinic FK; RLS own/admin | Credential/Confidential | `001`, `005`, `007` | profile lifecycle |
| Existing | RBAC | `roles`, `permissions`, `role_permissions` | Yes | role catalog, permission catalog, grants, shared audit | unique names/keys/grants; RLS read | Security | `002`, `007` | permission normalization |
| Compatibility Sensitive | RBAC | `user_roles`, `user_role_assignments` | Yes | legacy and current role assignment tables | both unique assignment contracts; active index on new table | Security | `002`, `007` | migration/retirement plan |

## 8. Patient
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Patient | `patients` | Yes | `id`, `organization_id`, `clinic_id`, `patient_code`, `display_label`, `date_of_birth`, `sex_at_birth`, `consent_status`, `consent_updated_at`, shared audit | unique org/patient code; consent/sex checks; active scope index; RLS patient policies | PHI | `001`, `004`, `007` | business number generation |
| Existing | Patient | `patient_clinic_registrations` | Yes | `id`, tenant scope, `patient_id`, `registration_number`, `registered_at`, `registration_status`, shared audit | tenant-safe clinic FK; unique registration and patient per clinic; status check | PHI | `006`, `007` | transfer workflow |

## 9. Visit
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Visit | `visits` | Yes | `id`, tenant scope, `patient_id`, `visit_number`, `department`, `attending_user_id`, `payer_name`, `visit_status`, `claim_status`, `risk_level`, timestamps, shared audit | unique org/visit number; enum states; dashboard indexes; RLS visit policies | Restricted Clinical PHI/Financial | `001`, `004`, `007` | visit status history absent |
| Existing | Visit | `visit_vitals` | Yes | tenant scope, `visit_id`, measured time, vitals fields, shared audit | tenant-safe clinic FK; BP/range checks; RLS vitals policies | Restricted Clinical PHI | `006`, `007` | vitals versioning |

## 10. SOAP
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| Existing | SOAP | `soap_notes` | Yes current record | tenant scope, `visit_id`, `status`, `current_version`, SOAP sections, completeness, reviewer, AI metadata, shared audit | unique visit; score/AI checks; indexes; RLS SOAP policies | Restricted Clinical PHI | `001`, `006`, `007` | existing enum; canonical in `record-state-machines.md` |
| Existing | SOAP | `soap_note_versions` | Yes history | tenant scope, `soap_note_id`, `version`, `status`, SOAP sections, `change_reason`, shared audit | unique SOAP/version; positive version; indexes | Restricted Clinical PHI | `001`, `004` | version history |
| Future | SOAP | `soap_signatures`, `soap_amendments`, `soap_ai_suggestions` | No | conceptual signer/amendment/advisory AI records | future typed FKs/RLS/audit | Restricted Clinical PHI | `soap-clinical-model.md` | canonical SOAP states |

## 11. Diagnosis and ICD
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| Existing | Diagnosis | `diagnoses` | Yes catalogue | `organization_id`, `code_system`, `diagnosis_code`, `display_name`, effective dates, shared audit | unique org/system/code; effective range; RLS select | Clinical/Internal | `006`, `007` | catalogue active |
| Existing | Diagnosis | `visit_diagnoses` | Yes current coding row | tenant scope, `visit_id`, optional `diagnosis_id`, code/text/type/status/source/AI acceptance, shared audit | type/status/source/confidence checks; tenant-safe clinic FK; RLS via SOAP permissions | Restricted Clinical PHI | `006`, `007` | canonical diagnosis states future |
| Future | Coding | `diagnosis_versions`, `diagnosis_code_mappings`, `code_systems`, `code_system_versions` | Yes when implemented | independent diagnosis and code mapping versions | future FKs/RLS/audit | Clinical/Financial | `diagnosis-icd-model.md` | canonical diagnosis states |

## 12. Prescription
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| Existing | Prescription | `prescriptions` | Yes | tenant scope, `visit_id`, `prescribing_user_id`, `status`, safety fields, shared audit | status enum; indexes; RLS prescription policies | Restricted Clinical PHI | `001`, `004`, `007` | existing enum; canonical future |
| Existing | Prescription | `prescription_items` | Yes | tenant scope, `prescription_id`, optional `inventory_item_id`, medication/dose/frequency/duration/quantity, `dispensed_quantity`, safety note, shared audit | quantity and dispensed checks; indexes | Restricted Clinical PHI | `001`, `006` | line history future |
| Future | Medication safety | `prescription_safety_alerts`, `dispensing_events`, `dispensing_reversals` | Yes when implemented | durable alerts and dispensing history | future permissions/audit | Restricted Clinical PHI | `prescription-medication-model.md` | canonical safety/prescription states |

## 13. Inventory
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Inventory | `inventory_items` | Yes | tenant scope, SKU, item/generic name, unit, reorder level, shared audit | unique clinic/SKU; reorder check; RLS inventory | Confidential | `001`, `004`, `007` | medication catalogue separation |
| Existing | Inventory | `inventory_batches` | Yes | tenant scope, item, batch number, expiry, quantity, cost, shared audit | unique item/batch; quantity/cost checks; expiry indexes | Confidential | `001`, `004`, `007` | dispensing transaction |
| Existing | Inventory | `stock_movements` | Yes ledger | tenant scope, item/batch, movement type, quantity, reason, reference table/id, shared audit | nonzero quantity; movement indexes; RLS stock | Confidential/Audit | `001`, `004`, `007` | free-text reference |

## 14. Medical Certificate
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Future | Clinical certificate | `medical_certificates`, versions, signatures, templates, exports | Yes when implemented | patient/visit/signer/credential/issue/validity/purpose/status/template/export fields | future typed columns, no unrestricted JSONB | Restricted Clinical PHI | `medical-certificate-model.md` | legal templates and signer credentials |

## 15. Insurance Coverage
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Future | Insurance | coverage and policy entities | Yes when implemented | payer, coverage, benefit, exclusion, eligibility, version | future RLS/audit | Financial/PHI | app mock payer types | schema and payer contracts |

## 16. Payer Rules
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Future | Payer rules | payer/rule-set/version entities | Yes when implemented | payer code, rule set, evidence rules, ICD/cost/risk rules, approval state, effective dates | future versioned rules | Financial/Internal | payer-rule mock service/types | approval and versioning |

## 17. Claim Readiness
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| Existing | Claim readiness | `claim_readiness_assessments` | Derived advisory | tenant scope, `visit_id`, version, score/status/review, rule set version, calculated/review actors, current flag, shared audit | unique visit/version; score/status checks; RLS claim | Financial | `006`, `007` | statuses `ready`, `needs_review`, `not_ready` |
| Existing | Claim readiness | `claim_readiness_items` | Derived advisory | tenant scope, assessment, dimension, weight/scores/status/reason/evidence ref, shared audit | dimension uniqueness; weight/score checks; deferred total trigger | Financial | `006` | review status future |

## 18. Evidence Package
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Lifecycle |
|---|---|---|---|---|---|---|---|---|
| Existing | Evidence | `evidence_packages` | Yes package header | tenant scope, `visit_id`, package version/status, completeness, storage reference, checksum, generated/approved actors, shared audit | unique visit/version; status/score checks; RLS select | Restricted Clinical PHI/Financial | `006`, `007` | package status check |
| Future | Evidence | `clinical_documents`, `evidence_items`, `evidence_manifests`, `evidence_exports` | Yes when implemented | typed source refs, storage metadata, verification, manifest, export rows | future RLS/storage policies/audit | Restricted Clinical PHI | `evidence-document-model.md` | storage policies |

## 19. Audit
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Audit | `audit_logs` | Yes event record | `id`, optional tenant/clinic/actor, `action_type`, target table/record, reason, `old_value`, `new_value`, IP, user agent, correlation, outcome, created time | outcome check; audit indexes; RLS select/insert | Audit/Security | `001`, `004`, `007` | append-only hardening |

JSONB `old_value/new_value`: allowed minimized before/after fields; prohibited secrets, tokens, keys, unrestricted PHI, raw documents, and full signed clinical content. Schema versioning is Planned.

## 20. AI
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Clinical AI metadata | SOAP/diagnosis AI columns | No advisory | `source_type`, `model_name`, `model_version`, `confidence`, acceptance actor/time, edited flag | confidence and acceptance checks | Restricted Clinical PHI | `006` | prompt/policy/evidence refs |
| Future | AI governance | AI suggestion/model/version entities | No advisory | model, prompt, policy, evidence, recommendation, human decision | future RLS/audit | Clinical/Security | AI docs | governance schema |

## 21. Storage
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Storage | private buckets | Object store | `organization-assets`, `patient-documents`, `evidence-files`, `medical-certificates`, `integration-files` | buckets private | PHI/Confidential | `007` | object policies absent |

## 22. Analytics
| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Future | Analytics | dashboards/materialized summaries | Derived | aggregate org/clinic/period/status metrics | future tenant-safe refresh | Derived Analytics | performance docs | aggregate-first design |

## 23. Compatibility-sensitive Objects
`user_roles` vs `user_role_assignments`; `soap_status`, `prescription_status`, and app statuses vs canonical state machines; `claim.view` vs app capabilities; storage bucket names; JSONB metadata contracts; free-text `rule_set_version`, `evidence_reference`, `storage_reference`.

## 24. Review Required Decisions
Professional credentials, payer-rule schema, insurance coverage schema, medical certificates, clinical documents, storage policies, analytics materialization, audit immutability, and tenant-specific restore support.

## 25. Migration 010 Core Foundation Integrity Update

Task: DB-P1-TENANT-SAFE-FK-HARDENING

New Core Foundation constraints and indexes:

| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Identity | `user_profiles` | Yes | Existing columns unchanged | `uq_user_profiles_organization_id_id` supports tenant-safe child FKs | Credential/Confidential | migration `010` | multi-organization profile semantics |
| Existing | RBAC | `roles` | Yes | Existing columns unchanged | `uq_roles_organization_id_id` supports tenant-scope relationship checks | Security | migration `010` | platform vs tenant role governance |
| Existing | Membership | `organization_memberships` | Yes | Existing columns unchanged | `fk_organization_memberships_user_profile_tenant` enforces profile organization match | Security | migration `010` | membership workflow |
| Existing | Membership | `clinic_memberships` | Yes | Existing columns unchanged | `fk_clinic_memberships_user_profile_tenant`; existing clinic tenant FK retained | Security | migration `010` | membership workflow |
| Compatibility Sensitive | RBAC | `user_roles` | Yes legacy | Existing columns unchanged | tenant-safe clinic/profile FKs; `uq_user_roles_org_level_assignment`; role-scope trigger | Security | migration `010` | legacy retirement plan |
| Existing | RBAC | `user_role_assignments` | Yes current | Existing columns unchanged | tenant-safe clinic/profile FKs; `uq_user_role_assignments_org_level_assignment`; role-scope trigger | Security | migration `010` | controlled assignment workflow |

Runtime validation:

- Local preflight counts were zero for cross-organization membership/profile mismatches, role-assignment/profile mismatches, and tenant-scoped role mismatches.
- `supabase/tests/006_tenant_safe_fk_integrity.sql` validates valid same-tenant rows and invalid cross-tenant rows.
- Lifecycle status, professional authority, and controlled assignment workflow fields were not added.

## 26. Migration 011 Core Foundation Lifecycle Update

Task: DB-P1-LIFECYCLE-CONTROLS-HARDENING

New Core Foundation lifecycle fields:

| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Organization | `organizations` | Yes | `lifecycle_status text not null default 'active'` | `ck_organizations_lifecycle_status`; `idx_organizations_lifecycle_status`; controlled transition function | Confidential/Security | migration `011` | lifecycle audit events |
| Existing | Clinic | `clinics` | Yes | `lifecycle_status text not null default 'active'` | `ck_clinics_lifecycle_status`; `idx_clinics_organization_lifecycle_status`; controlled transition function | Confidential/Security | migration `011` | lifecycle audit events |
| Existing | RBAC | `permissions` | Yes | lifecycle permission keys | organization and clinic lifecycle permission keys seeded | Security | migration `011` | platform/tenant approval model |

Allowed lifecycle values: `active`, `suspended`, `closed`, `archived`.

Operational helper behavior:

- `is_organization_member` requires the organization lifecycle to be `active`.
- `has_clinic_access` requires the organization lifecycle and clinic lifecycle to be `active`.
- `has_permission` inherits lifecycle denial from the membership and clinic helpers.

Audit limitation:

- Transition reason and actor identity are available at the controlled function boundary, but durable audit events are not emitted until the audit workflow task.

## 27. Migration 012 Controlled Role Assignment Update

Task: DB-P1-CONTROLLED-ROLE-ASSIGNMENT-WORKFLOW

Updated Core Foundation RBAC entries:

| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | RBAC | `user_role_assignments` | Yes | Existing assignment columns plus `assignment_reason`, `revoked_at`, `revoked_by`, `revocation_reason` | active duplicate-prevention indexes; revocation metadata check; controlled functions only for writes | Security/Audit | migration `012` | durable audit events |
| Compatibility Sensitive | RBAC | `user_roles` | No for new writes | Legacy assignment columns unchanged | direct mutation remains revoked | Security | migration `012` | retirement timeline |
| Existing | RBAC | `permissions` | Yes | role-assignment workflow permissions | seeded idempotently | Security | migration `012` | permission namespace cleanup |

Controlled function entries:

| Function | Purpose | Data classification | Runtime access |
|---|---|---|---|
| `assign_role(uuid, uuid, uuid, uuid, timestamptz, timestamptz, text)` | Creates active role assignments after tenant, clinic, lifecycle, date, self-assignment, and platform-role checks. | Security/Audit | `authenticated` EXECUTE only |
| `revoke_role_assignment(uuid, text)` | Revokes active assignments while preserving history and recording revocation metadata. | Security/Audit | `authenticated` EXECUTE only |

Audit limitation:

- The workflow captures reason and before/after context at the function boundary, but does not yet persist `role_assignment.created`, `role_assignment.revoked`, `role_assignment.denied`, `role_assignment.expired`, or `privilege_escalation.denied` events.

## 28. Migration 013 Core Foundation Audit Events Update

Task: DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION

Updated Audit entries:

| Status | Owner | Table/entity | Authoritative | Columns or attributes | Constraints/index/RLS | Classification | Source | Review Required |
|---|---|---|---|---|---|---|---|---|
| Existing | Audit | `audit_logs` | Yes | Existing legacy fields plus `occurred_at`, `event_type`, `actor_auth_user_id`, `actor_profile_id`, `resource_type`, `resource_id`, `action`, `before_state`, `after_state`, `metadata` | normalized event check; outcome check; tenant/time, clinic/time, event/time, resource, and correlation indexes; RLS select; direct runtime mutation revoked | Audit/Security | migration `013` | export, retention, tamper evidence |

Implemented Core Foundation event types:

- `organization.lifecycle.suspended`
- `organization.lifecycle.reactivated`
- `organization.lifecycle.closed`
- `organization.lifecycle.archived`
- `clinic.lifecycle.suspended`
- `clinic.lifecycle.reactivated`
- `clinic.lifecycle.closed`
- `clinic.lifecycle.archived`
- `role_assignment.created`
- `role_assignment.revoked`

Controlled function entries:

| Function | Purpose | Data classification | Runtime access |
|---|---|---|---|
| `append_core_audit_event(...)` | Internal append boundary for implemented Core Foundation lifecycle and role-assignment events. | Audit/Security | Not granted to `anon` or `authenticated` |
| `transition_organization_lifecycle(...)` | Performs controlled organization lifecycle mutation and appends audit event atomically. | Confidential/Security/Audit | `authenticated` EXECUTE only |
| `transition_clinic_lifecycle(...)` | Performs controlled clinic lifecycle mutation and appends audit event atomically. | Confidential/Security/Audit | `authenticated` EXECUTE only |
| `assign_role(...)` | Creates controlled role assignment and appends audit event atomically. | Security/Audit | `authenticated` EXECUTE only |
| `revoke_role_assignment(...)` | Revokes controlled role assignment and appends audit event atomically. | Security/Audit | `authenticated` EXECUTE only |
