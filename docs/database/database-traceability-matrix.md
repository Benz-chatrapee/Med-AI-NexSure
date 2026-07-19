# Database Traceability Matrix

## Document Control
Status: Populated during DB-DOC-FINAL-CROSS-DOCUMENT-REVIEW. Runtime effect: none.

## Purpose
Maps high-risk database requirements to authoritative documentation, entities, permissions, authorization scope, RLS responsibility, audit events, tests, phase, and implementation status.

## Traceability Matrix
| Requirement | Authoritative document | Entity/table | Permission | Authorization scope | RLS responsibility | Audit event | Planned test | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|
| Tenant isolation | core-foundation-security-model.md | tenant-scoped tables | existing and canonical scoped keys | organization | every scoped policy | `permission_change`/security event | cross-organization negative RLS | Phase 1 | Existing with tests Review Required |
| Clinic isolation | rls-policy-design.md | clinic-scoped tables | scoped permissions | clinic | `has_clinic_access` policies | access audit where high risk | clinic A/B negative RLS | Phase 1-2 | Existing with tests Review Required |
| Privileged role assignment | rbac-design.md | `user_role_assignments` | `role.assign` future normalized key | organization/clinic | controlled function plus assignment-table grants | `role_assignment.created`, `role_assignment.revoked` | `008_controlled_role_assignment_workflow.sql`, `009_core_foundation_audit_events.sql` | Phase 1 | Existing with local tests |
| SOAP signing | soap-clinical-model.md | Future signatures + `soap_note_versions` | `clinical.soap.sign` | assigned visit + professional scope | Future SOAP sign policy | `soap.signed` | positive/negative signing test | Phase 3 | Planned/Future |
| Diagnosis confirmation | diagnosis-icd-model.md | `visit_diagnoses`, Future versions | `clinical.diagnosis.confirm` | assigned visit + professional scope | Future diagnosis policy | `diagnosis.confirmed` | confirmation authority test | Phase 4 | Planned/Future |
| Medication safety override | prescription-medication-model.md | Future `prescription_safety_alerts` | `prescription.safety_alert.override` | assigned visit/pharmacy scope | Future alert policy | `medication_alert.overridden` | high-severity override test | Phase 5 | Future |
| Dispensing | prescription-medication-model.md | `prescriptions`, `stock_movements` | `prescription.order.dispense` | clinic pharmacy scope | prescription/inventory policies | `prescription.dispensed` | atomic dispense + stock test | Phase 5 | Existing pieces, Planned workflow |
| Medical-certificate issuance | medical-certificate-model.md | Future certificate tables | `clinical.medical_certificate.issue` | assigned visit + signer credential | Future certificate policy | `certificate.issued` | issue/revoke negative tests | Phase 6 | Future |
| Claim-readiness override | claim-readiness-model.md | Future override entity | future `claim.readiness.override` | claim_case | Future claim override policy | `claim_readiness.override_approved` | override reason/audit test | Phase 8 | Planned |
| Evidence export | evidence-document-model.md | Future `evidence_exports` | future `claim.evidence.export` | claim_case | Future evidence/export policy | `export` | export authorization + audit | Phase 9 | Planned/Future |
| Audit export | audit-versioning-strategy.md | `audit_logs` + Future export log | future `audit.event.export` | audit_case | audit select/export policy | `export` | redacted audit export test | Phase 10 | Planned |
| AI acceptance and override | ai-clinical-governance.md | AI metadata/Future AI records | `clinical.soap.review`, `clinical.coding.review` | invoking user context | source table policies | AI accepted/rejected events | AI HITL tests | Phase 11 | Existing metadata, Future governance |
| Sensitive file download | storage-file-security.md | private buckets/Future metadata | future `claim.evidence.download` | claim_case/assigned visit | storage policies separate from RLS | `export`/download event | signed URL expiry/storage policy test | Phase 14 | Planned/Future |
| Break-glass readiness | core-foundation-security-model.md | Future break-glass log | future emergency key | audit_case | dedicated policy | security event | emergency access test | Phase 10 | Future |
| Backup restore | backup-restore-strategy.md | database, storage, migrations | privileged ops only | environment/tenant | post-restore RLS validation | restore audit | isolated restore drill | production gate | Planned/Review Required |

## Compatibility Mapping
| Existing key | Canonical target | Risk | Transition note |
|---|---|---|---|
| `soap:read`, `soap.view` | `clinical.soap.read` | mixed RLS semantics | dual-policy transition then retire legacy |
| `soap:update`, `soap.update` | `clinical.soap.update` plus sign/amend/void keys | generic update too broad | split actions by lifecycle |
| `prescription:read`, `prescription.view` | `prescription.order.read` | naming mismatch | seed canonical alias in migration |
| `prescription:update`, `prescription.create` | `prescription.order.create/update` | create/update conflated | split by state transition |
| `prescription.dispense` | `prescription.order.dispense` | reverse/verify absent | add separate verify/reverse |
| `claim.view`, app `claimReadiness.view` | future `claim.readiness.read` | app/database mismatch | normalize in implementation phase |
| `claim.review` | future `claim.readiness.review` | evidence sharing ambiguous | split readiness and evidence keys |
| none | `claim.evidence.export` | export high-risk absent | add with evidence export table |
| `audit.view` | `audit.event.read` or approved audit namespace | audit export absent | keep existing until namespace decision |

## Review Required
Canonical claim/evidence/audit permission namespace, break-glass schema, source-version reference shape, and executable test IDs remain Review Required.

## Phase 1 Migration 013 Traceability Update

| Requirement | Authoritative document | Entity/table | Permission | Authorization scope | RLS responsibility | Audit event | Implemented test | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|
| Organization lifecycle audit persistence | audit-event-catalogue.md | `organizations`, `audit_logs` | organization lifecycle permissions | organization | controlled function plus audit RLS select | `organization.lifecycle.*` | `009_core_foundation_audit_events.sql` | Phase 1 | Existing with local tests |
| Clinic lifecycle audit persistence | audit-event-catalogue.md | `clinics`, `audit_logs` | clinic lifecycle permissions | organization and clinic | controlled function plus audit RLS select | `clinic.lifecycle.*` | `009_core_foundation_audit_events.sql` | Phase 1 | Existing with local tests |
| Role-assignment audit persistence | audit-event-catalogue.md | `user_role_assignments`, `audit_logs` | `role.assign`, `role.revoke` | organization and optional clinic | controlled function plus audit RLS select | `role_assignment.created`, `role_assignment.revoked` | `009_core_foundation_audit_events.sql` | Phase 1 | Existing with local tests |
| Audit integrity for Core Foundation workflows | audit-versioning-strategy.md | `audit_logs` | `audit.view` for read only | organization and optional clinic | no runtime direct insert/update/delete; scoped select | implemented Core Foundation event catalogue | `001_schema_contract.sql`, `009_core_foundation_audit_events.sql` | Phase 1 | Existing with local tests |
