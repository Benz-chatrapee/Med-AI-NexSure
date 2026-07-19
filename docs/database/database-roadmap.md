# Database Roadmap

## 1. Document Control
Status: Populated for DB-DOC-DATABASE-DESIGN-SYSTEM. Source of truth: completed `docs/database/` files, Supabase migrations `001` through `007`, and repository source inspection. Runtime effect: none.

## 2. Purpose
Defines the phased database implementation roadmap for the full Med AI NexSure platform.

## 3. Vision
Med AI NexSure uses PostgreSQL/Supabase as a migration-first, tenant-safe, auditable data platform for healthcare and insurance decision support. Clinical truth remains human-owned; AI, analytics, claim readiness, and payer interpretation are advisory or derived.

## 4. Current Repository State
Existing implementation includes core tenant tables, Supabase Auth-linked profiles, RBAC/RLS helpers, patients, visits, SOAP notes and versions, diagnosis catalogue and visit diagnoses, prescriptions, inventory, claim readiness, evidence package headers, audit logs, organization settings, integration provider catalogues, private storage buckets, and indexes. Missing or Future areas include professional credentials, medical certificates, clinical document metadata, payer-rule tables, durable safety alerts, full evidence item manifests, analytics persistence, executable RLS tests, and storage object policies.

## 5. Target Database State
Target state separates authoritative domains from derived domains, normalizes lifecycle states and permission keys, adds professional-authority enforcement, references immutable source versions for claim/evidence, validates RLS and grants, and proves backup/restore before production approval.

## 6. Roadmap Principles
Roadmap statuses: `not_started`, `documentation_in_progress`, `documentation_ready`, `implementation_in_progress`, `implementation_ready`, `test_in_progress`, `test_ready`, `security_review_required`, `release_ready`, `blocked`, `deferred`. Documentation Ready does not mean Implementation Ready, Test Ready, Security Review Ready, or Production Ready.

## 7. Phase 1 — Core Foundation
Objective: tenant, clinic, auth profile, RBAC, RLS, audit primitives. Business value: safe multi-tenant base. Authoritative domain: Core Foundation. Entities: `organizations`, `clinics`, `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_role_assignments`, memberships. Prerequisites: migrations `001` to `007`. Downstream: every sensitive domain. Controls: default-deny RLS, grants, no `service_role` browser flow. Tests: RBAC/RLS positive and negative tests. Performance: membership/permission lookup indexes. Rollback: isolated migration rollback plan. Exit: schema/RLS tested. Current status: implementation_in_progress. Risks: mixed role/permission formats. Review Required: permission normalization and platform admin boundaries.

## 8. Phase 2 — Patient and Visit
Objective: PHI-safe patient, registration, visit, vitals. Value: clinical encounter base. Entities: `patients`, `patient_clinic_registrations`, `visits`, `visit_vitals`. Upstream: Core. Downstream: clinical, claim, evidence, analytics. Controls: patient/visit RLS, tenant-safe relationships. Audit: create/update/status events. Tests: tenant isolation and status checks. Performance: patient/visit indexes. Status: implementation_in_progress. Risks: `visit_status_history` absent. Review Required: business-number strategy and composite FK retrofits.

## 9. Phase 3 — Clinical Documentation
Objective: governed SOAP documentation. Entities: `soap_notes`, `soap_note_versions`; Future signatures/amendments/AI suggestions. Upstream: Core, Patient, Visit. Downstream: diagnosis, prescription, claim, evidence. Controls: `clinical.soap.*` target permissions, professional authority. Audit: signing/amendment consistency. Status: implementation_in_progress. Risks: existing enum lacks `signed`. Review Required: signature/amendment schema.

## 10. Phase 4 — Diagnosis and ICD
Objective: separate clinical diagnosis from coding. Entities: `diagnoses`, `visit_diagnoses`; Future diagnosis/code versions and code systems. Upstream: Visit and SOAP. Downstream: claims, evidence, analytics. Controls: diagnosis/coding permissions. Tests: AI acceptance and amendment. Status: implementation_in_progress. Risks: writes piggyback on SOAP permissions. Review Required: coder role and code-system governance.

## 11. Phase 5 — Prescription and Pharmacy
Objective: prescribing, medication line items, inventory links, dispensing readiness. Entities: `prescriptions`, `prescription_items`, `inventory_items`, `inventory_batches`, `stock_movements`; Future alerts/events/reversals. Upstream: Core, Visit, Diagnosis. Downstream: claim/evidence/analytics. Controls: prescriber/pharmacist separation. Tests: quantity, stock, concurrency. Status: implementation_in_progress. Risks: dispensing not transactional yet. Review Required: safety-alert schema and negative-stock behavior.

## 12. Phase 6 — Medical Certificate
Objective: certificate drafting, issuing, revocation, export. Entities: Future `medical_certificates`, versions, signatures, exports. Upstream: Patient, Visit, SOAP/Diagnosis, professional credentials. Downstream: evidence and storage. Controls: certificate issue/export permissions. Status: documentation_ready. Risks: only storage bucket exists. Review Required: legal templates and signer authority.

## 13. Phase 7 — Insurance Coverage and Payer Rules
Objective: payer, policy, coverage, and rule versions. Entities: Future payer/rule/coverage tables; app mock types exist. Upstream: Core, Patient, Visit, Clinical. Downstream: claim readiness and analytics. Controls: payer-rule approval and audit. Status: documentation_ready. Risks: no database schema. Review Required: payer contract model.

## 14. Phase 8 — Claim Readiness
Objective: advisory readiness scoring. Entities: `claim_readiness_assessments`, `claim_readiness_items`, `organization_claim_settings`; Future overrides/source refs. Upstream: Clinical, payer rules, evidence. Downstream: evidence package, dashboards. Controls: `claim.view`, `claim.review`, future override permission. Status: implementation_in_progress. Risks: free-text `rule_set_version` and `evidence_reference`. Review Required: immutable source-reference table.

## 15. Phase 9 — Evidence Package
Objective: evidence package assembly, verification, finalization, export. Entities: `evidence_packages`; Future documents/items/manifests/exports. Upstream: Clinical versions, claim readiness, storage. Downstream: payer workflows and audit. Controls: private storage plus DB RLS. Status: implementation_in_progress for package header, documentation_ready for full model. Risks: storage policies absent. Review Required: metadata schema and signed URL policy.

## 16. Phase 10 — Audit and Compliance
Objective: audit event traceability and compliance settings. Entities: `audit_logs`, `organization_compliance_settings`, version tables. Upstream: all high-risk domains. Downstream: QA, incident response, backup/restore. Controls: append-only planned, audit.view. Status: implementation_in_progress. Risks: audit JSON flexible; no append-only hardening. Review Required: event taxonomy and retention.

## 17. Phase 11 — AI Clinical Governance
Objective: advisory AI governance. Entities: existing AI metadata on SOAP/diagnosis; Future AI suggestions/model/prompt/policy records. Upstream: authorized clinical context. Downstream: SOAP, diagnosis, claim summaries. Controls: Human-in-the-Loop. Status: documentation_ready. Risks: prompt/policy version absent. Review Required: AI evidence reference schema.

## 18. Phase 12 — Executive and Economic Analytics
Objective: aggregate-first operational, claim, evidence, cost, and risk analytics. Entities: Future materialized summaries. Upstream: operational tables and audit. Downstream: executive dashboards. Controls: aggregate-first, no clinical truth mutation. Status: documentation_ready. Risks: app dashboards mock-backed. Review Required: materialization strategy.

## 19. Phase 13 — Integration and Interoperability
Objective: provider and payer integrations. Entities: `integration_providers`, `organization_integrations`; Future integration logs. Upstream: Core/settings. Downstream: payer, storage, audit. Controls: secret references only, no secrets in DB JSON. Status: implementation_in_progress. Risks: config JSON and secret reference governance. Review Required: integration credential handling.

## 20. Phase 14 — Storage and Document Security
Objective: private object storage with metadata, reconciliation, short-lived access. Entities: private buckets existing; Future storage metadata/policies. Upstream: Core, Evidence, Certificates, Documents. Controls: storage policies separate from table RLS. Status: implementation_in_progress for buckets, security_review_required for access. Risks: object policies absent. Review Required: storage path and signed URL rules.

## 21. Cross-phase Security Gates
Core RLS and grants precede PHI/clinical release. Professional credentials precede signing, diagnosis confirmation, prescription ordering, dispensing, and certificate issuance. Storage policies precede evidence export.

## 22. Cross-phase Testing Gates
Every phase requires schema, constraint, RLS, RBAC, audit, negative authorization, and data-quality tests before Test Ready.

## 23. Migration Gates
Migrations must be reversible by strategy, tenant-safe, non-destructive unless approved, and validated locally before staging.

## 24. Performance Gates
Use `performance-index-design.md`. Add indexes only from observed query plans; dashboards must avoid full scans.

## 25. Backup and Recovery Gates
Backup and restore validation must precede Production Ready. RPO/RTO remain Review Required.

## 26. Environment Promotion Gates
Local to staging to production requires documentation evidence, migration reset, RLS tests, grant tests, storage tests, backup/restore evidence, and sign-off.

## 27. Dependency Summary
Core precedes Patient/Visit; Patient/Visit precedes Clinical; Clinical precedes Claim/Evidence finalization; Audit/versioning spans all high-risk phases; Backup/restore gates production.

## 28. Critical-path Risks
Permission normalization, professional credential model, storage policies, immutable version references, audit immutability, payer-rule schema, and restore testing.

## 29. Definition of Ready
Documentation complete, dependencies identified, security model reviewed, migration strategy approved, tests designed, rollback documented, and Review Required items resolved or accepted.

## 30. Definition of Done
Migrations implemented, RLS/grants tested, app contracts updated, generated types refreshed, audit covered, backup/restore impact assessed, and release sign-off recorded.

## 31. Compatibility-sensitive Milestones
Retire `user_roles`, normalize permissions, migrate clinical state enums, add document metadata, formalize payer-rule versions, and enforce storage policies.

## 32. Review Required Decisions
RPO/RTO, credential schema, insurance coverage schema, payer-rule schema, storage access model, analytics persistence, audit append-only design, and tenant-specific restore support.

## Phase 1 Regression Closure Update

Task: DB-P1-FULL-CORE-FOUNDATION-REGRESSION

Phase 1 Core Foundation status is READY WITH NON-BLOCKING FOLLOW-UP after local-only validation:

- Migrations `001` through `013` apply locally from zero.
- Local seed applies successfully and is covered by seed-contract tests.
- DB lint passes with no schema errors.
- Full local DB test suite passes: 9 files, 229 tests.
- Tenant isolation, RLS/grants/helpers, tenant-safe FKs, lifecycle controls, controlled role assignment, and audit controls are covered by executable tests.
- Local TypeScript database types were regenerated from local Supabase.
- Application lint, TypeScript, and production build pass.
- No remote Supabase mutation, commit, or push was performed.

Non-blocking follow-ups before live Core Foundation UI rollout:

- Wire user-management and organization/clinic lifecycle UI to controlled RPCs.
- Add authorized audit-query UI/server integration using scoped `audit.view`.
- Keep Patient, Visit, Clinical, Claim, Evidence, Storage, AI, backup/restore, and production sign-off in their later roadmap phases.

## Design-system Flow Explanations
| Flow | Initiating phase/module | Dependencies | Security controls | Tests | Release gate | Failure behavior | Rollback/fallback | Output |
|---|---|---|---|---|---|---|---|---|
| Roadmap progression | Product/database governance | prior phase exit criteria | security gates | phase QA | Definition of Ready | block next phase | defer phase | approved roadmap |
| Docs to migration | Database implementation | docs and Review Required closure | review + least privilege | migration reset | migration gate | no migration | revise docs | migration plan |
| Core to Patient/Visit | Core Foundation | auth/RBAC/RLS | tenant isolation | RLS tests | security gate | deny PHI access | rollback migration | safe encounter base |
| Visit to Clinical | Visit | patient/visit scope | clinical permissions | clinical tests | clinical gate | incomplete clinical record | draft-only | SOAP/diagnosis/Rx |
| Clinical to Claim | Clinical docs | immutable source versions | claim scoped access | claim tests | claim gate | stale readiness | preserve old assessment | advisory readiness |
| Claim to Evidence | Claim readiness | source refs/storage | private storage | evidence tests | evidence gate | no export | regenerate package | evidence package |
| High-risk to Audit | all domains | audit table/versioning | audit.view, append-only planned | audit tests | audit gate | fail closed | preserve original | audit event |
| Ops to Analytics | operational domains | indexed scoped reads | aggregate-first | query tests | performance gate | no dashboard | cached/empty state | derived dashboard |
| Authorized data to AI | clinical/claim | user context | HITL, advisory only | AI tests | AI governance gate | no suggestion | human workflow | advisory output |
| DB/storage to restore | backup module | DB, storage, config | privileged restore | restore drill | recovery gate | isolated failure | previous backup | validated restore |
| Local to production | release management | all gates | env separation | full QA | sign-off | block release | staging rollback | promoted release |
