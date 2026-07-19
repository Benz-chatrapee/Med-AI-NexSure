# Claim Readiness Model

## 1. Document Control
Status: Populated for DB-DOC-BATCH-6-INSURANCE. Source of truth: migrations `006_clinical_claim_settings_tables.sql`, `007_rbac_helpers_policies_indexes_seed.sql`, existing clinical model docs, and mock-backed claim readiness application code. Runtime effect: none.

## 2. Purpose
Defines the advisory claim readiness data model. Claim readiness helps humans identify evidence, coding, clinical documentation, payer-rule, and economic gaps; it is not claim approval.

## 3. Scope
Existing: `claim_readiness_assessments`, `claim_readiness_items`, `organization_claim_settings`, `visits`, `soap_notes`, `soap_note_versions`, `visit_diagnoses`, `prescriptions`, `prescription_items`, `evidence_packages`, `audit_logs`, RLS helpers, `claim.view`, and `claim.review`. Future: payer-rule source/version tables, immutable clinical source-version reference tables, readiness overrides, and claim-case scope tables.

## 4. Current Repository State
Migration `006` creates claim readiness assessments and items. Migration `007` enables RLS and adds `mvp1_claim_select`, `mvp1_claim_review`, `mvp1_claim_items_select`, and `mvp1_claim_items_review`. Application feature `features/claim-readiness` is server-only but mock-backed; it validates capability names and writes in-memory audit events rather than database `audit_logs`.

## 5. Domain Ownership
Owner: Insurance and claim-readiness domain. Clinical truth remains owned by clinical domains documented in `soap-clinical-model.md`, `diagnosis-icd-model.md`, and `prescription-medication-model.md`.

## 6. Claim Readiness versus Claim Approval
`ready`, `needs_review`, and `not_ready` are advisory readiness statuses. They do not approve payment, guarantee coverage, or override payer adjudication.

## 7. Assessment Entity
Existing `claim_readiness_assessments` columns: UUID `id`, tenant scope, `visit_id`, `assessment_version`, `total_score`, `readiness_status`, `review_status`, `rule_set_version`, calculation/review actor fields, current flag, audit columns, soft delete, and activity flag.

## 8. Assessment Items
Existing `claim_readiness_items` columns: UUID `id`, tenant scope, `assessment_id`, `dimension_code`, `weight`, `raw_score`, `weighted_score`, `item_status`, `reason_code`, `reason_text`, `evidence_reference`, audit columns, soft delete, and activity flag.

## 9. Assessment Version
Existing: `assessment_version integer not null default 1` and unique `(visit_id, assessment_version)`. Recalculation must create or preserve version history and must not silently overwrite prior results.

## 10. Scoring-rule Version
Existing: `rule_set_version text not null default 'mvp1-default'` and `organization_claim_settings.scoring_model_version`. Future payer-rule version tables should replace free-text-only rule references.

## 11. SOAP Completeness
Existing item dimension: `soap`. Current schema can reference SOAP indirectly through visit and `evidence_reference`; Future references should point to immutable `soap_note_versions.id`.

## 12. Diagnosis and ICD Completeness
Existing item dimension: `diagnosis_icd`. Future claim assessments must reference immutable diagnosis and code mapping versions, not mutable `visit_diagnoses` alone.

## 13. Prescription and Procedure Completeness
Existing item dimension: `prescription_procedure`. Future assessment should reference prescription versions, prescription item versions, and procedure code mappings.

## 14. Evidence Completeness
Existing item dimension: `evidence`; `evidence_packages` exists as a visit-level package header. Future package manifests should identify exact source versions.

## 15. Insurance-rule Evaluation
Existing item dimension: `payer_rule` and mock payer-rule application features. No payer-rule database tables exist; payer logic is Future.

## 16. Economic Factors
Existing item dimension: `economic` and organization claim weights. App mock data includes cost variance and justification concepts; no durable economics table exists.

## 17. Risk Indicators
Existing `visits.risk_level` and app-level risk types support dashboard filtering. Future readiness risk should be derived from versioned rules, not hand-edited text.

## 18. Readiness Statuses
Canonical statuses: `ready`, `needs_review`, `not_ready`. Existing constraint maps score ranges: `ready` for `total_score >= 85`, `needs_review` for 60-84.99, and `not_ready` below 60.

## 19. Human Review
Existing `review_status` values: `pending_review`, `accepted`, `needs_changes`, `rejected`; reviewer columns exist. Human review is mandatory before high-risk use.

## 20. Override
Planned: override requires canonical permission, reason, actor, timestamp, original system score/status, adjusted score/status where allowed, and audit. Existing schema has review status but no override table or reason field.

## 21. Payer-rule Relationship
Existing `rule_set_version` is free text. Future payer-rule tables should include payer, rule set, version, status, effective dates, approval, simulation, and immutable rule snapshot references.

## 22. Visit Relationship
Existing `visit_id uuid not null references visits(id) on delete restrict`; tenant-safe clinic FK validates `(organization_id, clinic_id)` against clinics.

## 23. Clinical Version References
Planned: assessments must reference SOAP, diagnosis, ICD mapping, prescription, medical certificate, evidence, and payer-rule versions used at calculation time. Existing schema has no normalized source-version reference table.

## 24. Evidence Relationship
Existing `claim_readiness_items.evidence_reference text` and `evidence_packages.visit_id`. Future references should use typed FK/version IDs and manifest entries.

## 25. AI Assistance
AI may prioritize gaps, summarize evidence, or recommend next actions. It must not finalize readiness without authorized human workflow where required.

## 26. Audit Events
Existing audit enum includes `claim_review`, `evidence_change`, `dashboard_viewed`, `filters_applied`, `export`, and generic CRUD actions. Proposed events: `claim_readiness.calculated`, `claim_readiness.recalculated`, `claim_readiness.reviewed`, `claim_readiness.override_requested`, `claim_readiness.override_approved`, `claim_readiness.override_rejected`.

## 27. RLS Responsibility
Existing policies use `has_clinic_access` and `has_permission('claim.view'|'claim.review', organization_id, clinic_id)`. Claim reviewer access must remain claim-case scoped and minimum necessary.

## 28. Constraints
Existing constraints: PKs, tenant-safe clinic FKs, unique visit/version, total score 0-100, score/status consistency, review status check, unique assessment dimension, item weight 0-100, item scores 0-100, dimension code check, and deferred weight-total trigger.

## 29. Index Strategy
Existing: `idx_claim_readiness_visit` on `(visit_id, is_current)` where `deleted_at is null`. Planned: dashboard indexes on `(organization_id, clinic_id, is_current, readiness_status, calculated_at desc)` after query-plan validation.

## 30. Recalculation
Recalculation should create a new assessment version or preserve old version before setting a new current version. Prior results must remain retrievable.

## 31. Transactions
Assessment calculation writes assessment header, six dimension items, current flag update, and audit event in one transaction. The existing deferred trigger validates weights total 100 when six active items exist.

## 32. Concurrency
Review Required: no lock version or idempotency key exists. Future recalculation should protect `(visit_id, assessment_version)` allocation and current-version switching.

## 33. Failure Handling
If source versions, tenant scope, score validation, weight validation, authorization, or audit fails, no partial assessment should become current.

## 34. Retention
Assessments and items have soft delete fields. Historical assessments used for claim/evidence decisions should be retained according to compliance policy.

## 35. Future Extensions
Payer rules, payer-rule versions, readiness source references, readiness overrides, claim cases, immutable economic inputs, and SQL tests.

## 36. Compatibility-sensitive Items
App capabilities `claimReadiness.view` and `payerRule.view` differ from database keys `claim.view`; existing `rule_set_version` is free text; `evidence_reference` is free text; score thresholds are hard-coded in constraint.

## 37. Review Required Decisions
Canonical claim permission keys, payer-rule schema, override schema, immutable source-reference table, recalculation idempotency, and whether score thresholds remain fixed constraints or organization settings.

## Object Classification
| Classification | Items |
|---|---|
| Existing | `claim_readiness_assessments`, `claim_readiness_items`, `organization_claim_settings`, `idx_claim_readiness_visit`, claim RLS policies |
| Planned | override workflow, immutable source-version references, recalculation idempotency |
| Future | payer-rule tables, claim-case table, readiness materialized views |
| Review Required | threshold governance, permission normalization, current-version switching |
| Compatibility Sensitive | `claim.view`, app `claimReadiness.view`, `rule_set_version`, `evidence_reference` |

## Batch 6 Flow Notes
| Flow | Actor | Input | Permission | Context | Source versions | Transaction | State transition | Audit | Failure behavior | Output |
|---|---|---|---|---|---|---|---|---|---|---|
| Visit completion to readiness | System/human reviewer | Completed visit | `claim.view`/planned calculate | Org, clinic, visit | SOAP, diagnosis, prescription, evidence, rule version | Assessment + items + audit | none to `pending_review` | `claim_readiness.calculated` | no current result | readiness assessment |
| Recalculation | System/human reviewer | prior assessment and changed sources | planned calculate | same visit | new immutable source versions | new version + current switch | old current to historical | `claim_readiness.recalculated` | old current remains | new assessment |
| Human claim review | Claim reviewer | assessment | `claim.review` | claim-case scoped | assessment version | review update + audit | `pending_review` to review status | `claim_review` | review unchanged | review decision |
| Authorized override | Claim reviewer/compliance | reason and target | planned override permission | claim-case scoped | assessment version | override + audit | advisory status adjusted | override event | original preserved | override record |
| Dashboard query | Claim reviewer/executive | filters | `claim.view`/aggregate role | org/clinic or aggregate | current assessment only | read only | none | `dashboard_viewed` | denied or empty | scoped summary |
