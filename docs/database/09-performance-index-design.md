# Performance and Index Design

## Existing Index Categories

Tenant scope:
- `organization_id`
- `clinic_id`
- `(organization_id, clinic_id, is_active)` partial indexes where `deleted_at is null`

Foreign keys:
- Patient, visit, user, role, permission, inventory item, inventory batch, claim assessment, evidence package references.

Workflow filters:
- `visit_status`
- `claim_status`
- `risk_level`
- SOAP status
- prescription status
- stock movement type

Time filters:
- `created_at`
- `started_at`
- audit time indexes

Dashboard composites:
- `idx_visits_dashboard_scope`
- `idx_visits_patient_date`
- `idx_claim_readiness_visit`
- `idx_evidence_packages_visit`
- `idx_inventory_batches_item_expiry`
- `idx_stock_movements_item_time`
- `idx_audit_logs_org_time`
- `idx_audit_logs_target_record`

## Query Design Rules

- Every application query for tenant data must include server-verified organization scope.
- Clinic-scoped data should include both `organization_id` and `clinic_id`.
- Use current-row filters such as `deleted_at is null`, `is_active = true`, and `is_current = true`.
- Avoid broad dashboard queries without date windows.
- Avoid loading JSON payloads when list screens need only summaries.

## Future Optimization

Proposed:
- Add indexes only after observing real query plans.
- Add reporting views for dashboards once live repositories replace mock data.
- Consider materialized views for executive dashboards if read volume exceeds write freshness requirements.
- Consider partitioning `audit_logs` by time if write volume grows substantially.

## Review Required

- RLS helper functions must stay stable and efficient because they execute inside policy checks.
- Additional indexes on proposed tables should be designed with expected route queries, not upfront guesswork.
