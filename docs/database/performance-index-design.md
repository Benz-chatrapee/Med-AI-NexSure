# Performance and Index Design

## 1. Document Control
Status: Populated for DB-DOC-BATCH-6-INSURANCE. Source of truth: migrations `004_indexes.sql`, `007_rbac_helpers_policies_indexes_seed.sql`, existing numbered performance doc, and Batch 6 query patterns. Runtime effect: none.

## 2. Purpose
Documents existing indexes and planned query-pattern-driven performance work without weakening RLS, grants, tenant filters, audit, or clinical safeguards.

## 3. Scope
Existing: core indexes on tenant, workflow, visit, SOAP, prescription, inventory, audit, claim readiness, and evidence packages. Planned/Future: composite indexes for live claim/evidence dashboards, materialized views, partitioning, JSONB/FTS indexes after measured need.

## 4. Existing Index Inventory
Existing notable indexes: `idx_patients_scope_active`, `idx_visits_dashboard_scope`, `idx_visits_patient_date`, `idx_soap_notes_visit_id`, `idx_soap_note_versions_soap_note_id`, `idx_prescriptions_visit_id`, `idx_prescription_items_prescription_id`, `idx_claim_readiness_visit`, `idx_evidence_packages_visit`, `idx_audit_logs_scope_time`, `idx_audit_logs_org_time`, and `idx_audit_logs_target_record`.

## 5. Expected Workloads
Operational workloads include patient search, clinic patient lists, visit queues, visit timelines, current SOAP lookup, SOAP version history, diagnosis/ICD lookup, prescription/dispensing lookup, claim readiness dashboard, missing evidence worklist, evidence package retrieval, audit timeline, payer-rule evaluation, and executive aggregate dashboards.

## 6. Patient Search
Existing indexes cover organization, clinic, created date, email-like user fields, and active patient scope. Planned search should use server-verified tenant filters and avoid unrestricted PHI search.

## 7. Clinic Patient Lists
Use `(organization_id, clinic_id, is_active) where deleted_at is null` patterns. Add sort-specific indexes only after query plans show need.

## 8. Visit Queue
Existing `idx_visits_dashboard_scope` supports organization, clinic, status, claim status, risk, and created date dashboard filters.

## 9. Visit Timeline
Existing `idx_visits_patient_date` supports patient visit chronology by `(organization_id, patient_id, started_at desc)`.

## 10. SOAP Current-version Lookup
Existing unique `soap_notes_visit_unique` and `idx_soap_notes_visit_id` support one current SOAP per visit.

## 11. SOAP Version History
Existing `idx_soap_note_versions_soap_note_id` and unique `(soap_note_id, version)` support version retrieval.

## 12. Diagnosis and ICD Lookup
Existing diagnosis catalogue has unique `(organization_id, code_system, diagnosis_code)` but no explicit indexes on `visit_diagnoses`. Planned index review: `(organization_id, clinic_id, visit_id)` and active code lookup.

## 13. Prescription and Dispensing Lookup
Existing prescription and item indexes cover organization, clinic, visit, status, prescription ID, inventory item ID, stock movement item/time, and batch expiry.

## 14. Claim-readiness Dashboard
Existing `idx_claim_readiness_visit` supports visit-current lookup. Planned dashboard index: `(organization_id, clinic_id, is_current, readiness_status, calculated_at desc) where deleted_at is null`.

## 15. Missing-evidence Queries
Existing claim item dimension/status lacks a dedicated index. Planned: `(organization_id, clinic_id, dimension_code, item_status)` after real query-plan validation.

## 16. Evidence-package Retrieval
Existing `idx_evidence_packages_visit` supports package history by visit and version descending.

## 17. Audit Timeline
Existing `idx_audit_logs_org_time`, `idx_audit_logs_target_record`, and `idx_audit_logs_scope_time` support organization time and target record timelines.

## 18. Payer-rule Evaluation
Payer-rule tables are Future. Current payer-rule application code is mock-backed; no database index exists.

## 19. Organization and Clinic Filters
All tenant data queries must include server-verified organization and clinic filters. Do not trust frontend-provided tenant IDs.

## 20. Soft-delete Filters
Prefer partial indexes with `deleted_at is null` for active-row queries. Partial indexes must not use volatile `now()`.

## 21. RLS Helper Performance
Existing RLS helpers `is_organization_member`, `has_clinic_access`, and `has_permission` run inside policies. Membership and role assignment lookup indexes exist; test policy overhead with representative role sizes.

## 22. Composite Index Design
Composite indexes should match equality filters first, then status filters, then sort/range columns. Avoid overlap with existing single-column indexes unless query plans justify.

## 23. Partial Index Design
Use partial indexes for active/current rows such as `deleted_at is null`, `is_active = true`, and `is_current = true`. Do not use volatile functions in predicates.

## 24. Foreign-key Indexes
FK columns used in joins require review. Existing indexes cover many core FKs, but `visit_diagnoses`, `claim_readiness_items.assessment_id`, and future evidence item references need explicit validation.

## 25. Covering Indexes
Covering indexes are Planned only for high-volume list screens after `EXPLAIN (ANALYZE, BUFFERS)` demonstrates heap access cost.

## 26. JSONB Indexing
Existing `audit_logs.old_value/new_value` and organization settings JSONB are not indexed. JSONB indexing is Planned only for bounded, schema-versioned, non-PHI keys.

## 27. Full-text Search
Full-text search is Future. Patient/clinical search must preserve minimum necessary access and avoid broad PHI exposure.

## 28. Keyset Pagination
Use keyset pagination for large chronological lists, especially audit timeline, visit timeline, stock movements, and package history.

## 29. Dashboard Aggregation
Dashboards should not repeatedly scan full operational tables. Use filtered current rows, summary tables, or materialized views when measured load requires.

## 30. Materialized-view Candidates
Future candidates: executive claim readiness summaries, evidence gap counts, payer-rule impact dashboards, and audit event daily aggregates. Refresh must preserve tenant isolation.

## 31. Partitioning Readiness
Future partition candidates: `audit_logs`, `stock_movements`, and high-volume version/event tables. No partitioning is implemented.

## 32. Write Amplification
Every new index increases write cost on clinical, claim, evidence, and audit workflows. Keep index budget tied to observed query patterns.

## 33. Index Budget
Start with existing indexes; add planned indexes only when tied to a route/query, expected cardinality, and validation method.

## 34. Query-plan Validation
Use local Supabase and PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` with fictional data. Do not invent benchmark numbers.

## 35. Slow-query Monitoring
Future: enable safe local/production observability for slow queries, RLS helper cost, dashboard scans, storage reconciliation, and audit timeline queries.

## 36. Review Required Decisions
Live repository query shapes, diagnosis indexes, claim dashboard composite index, missing-evidence index, materialized view refresh strategy, partition thresholds, and JSONB/FTS policy.

## Query-pattern Matrix
| Module | Query purpose | Org filter | Clinic filter | Patient/visit filter | Status filter | Date/range | Join path | Sort | Cardinality | Existing index | Proposed index | Status | Risk | Validation |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Patient | Search/list | yes | yes | optional patient | active | optional created | patients | created/name future | medium | `idx_patients_scope_active` | FTS/search index | Planned | PHI search | EXPLAIN with masked test data |
| Visit | Queue | yes | yes | optional patient | visit/claim/risk | created | visits | created desc | high | `idx_visits_dashboard_scope` | none until measured | Existing | broad scans | EXPLAIN |
| Visit | Timeline | yes | optional | patient | active | started | visits | started desc | medium | `idx_visits_patient_date` | none | Existing | missing started_at | EXPLAIN |
| SOAP | Current note | yes | yes | visit | status | none | visits to soap_notes | none | low | `idx_soap_notes_visit_id` | none | Existing | tenant FK not composite | EXPLAIN |
| SOAP | Version history | yes | yes | SOAP note | status | created | soap_notes to versions | version desc | low | `idx_soap_note_versions_soap_note_id` | `(soap_note_id, version desc)` | Planned | overlap | EXPLAIN |
| Diagnosis | Visit diagnosis | yes | yes | visit | coding/status future | none | visits to visit_diagnoses | created | medium | none verified | `(organization_id, clinic_id, visit_id)` | Planned | missing FK index | EXPLAIN |
| Prescription | Visit meds | yes | yes | visit/prescription | status | created | visits to prescriptions to items | created | medium | `idx_prescriptions_visit_id`, `idx_prescription_items_prescription_id` | none | Existing | N+1 items | EXPLAIN |
| Claim | Dashboard | yes | yes/aggregate | visit optional | readiness/current | calculated | visits to assessments | calculated desc | high | `idx_claim_readiness_visit` | `(organization_id, clinic_id, is_current, readiness_status, calculated_at desc) where deleted_at is null` | Planned | duplicate if workload small | EXPLAIN |
| Evidence | Missing evidence | yes | yes | assessment/visit | item status | created | assessments to items | severity future | high | none verified | `(organization_id, clinic_id, dimension_code, item_status)` | Planned | write cost | EXPLAIN |
| Evidence | Package retrieval | yes | yes | visit | package status | version | visits to evidence_packages | package_version desc | medium | `idx_evidence_packages_visit` | none | Existing | free text storage ref | EXPLAIN |
| Audit | Timeline | yes | optional | target record | action/outcome | created | audit_logs | created desc | high | `idx_audit_logs_org_time`, `idx_audit_logs_target_record` | partitioning future | Existing/Planned | volume growth | EXPLAIN |
| Payer | Rule evaluation | yes | optional | claim/visit | rule status | effective | future rules | effective desc | medium | none | payer-rule indexes | Future | schema absent | future EXPLAIN |

## Security Performance Rules
Performance optimization must not remove RLS predicates, bypass `has_permission`, broaden clinic access, expose PHI in indexes unnecessarily, or replace scoped queries with frontend-only filtering.
