-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Workflow Indexes
-- Migration: 20260720082447_phase3_claim_indexes.sql
-- =============================================================================
--
-- PURPOSE
--   Add focused indexes for Phase 3 claim review, decision, payment, validation,
--   policy coverage, evidence, and AI workflows.
--
-- DESIGN PRINCIPLES
--   - Every index must support a confirmed query or integrity requirement.
--   - Tenant-leading columns are used for tenant-scoped queues and dashboards.
--   - Partial indexes are used for small active work sets.
--   - Existing primary-key and unique-constraint indexes are not duplicated.
--   - JSONB GIN indexes are intentionally excluded until query evidence exists.
--   - Indexes used by transactional functions are kept narrow.
--
-- IMPORTANT
--   CREATE INDEX CONCURRENTLY is not used because Supabase migrations run inside
--   a transaction. For large production tables, deploy equivalent indexes in a
--   separately approved non-transactional operation.
-- =============================================================================

begin;

-- =============================================================================
-- 1. INTEGRITY AND IDEMPOTENCY
-- =============================================================================

-- A claim may have only one active final decision.
create unique index claim_decisions_one_final_per_claim_uq
  on public.claim_decisions (claim_id)
  where decision_status = 'final';

-- Retry-safe review creation. Null keys remain unrestricted.
create unique index claim_reviews_idempotency_uq
  on public.claim_reviews (organization_id, idempotency_key)
  where idempotency_key is not null;

-- Retry-safe payment import/API callback handling.
create unique index claim_payments_idempotency_uq
  on public.claim_payments (organization_id, idempotency_key)
  where idempotency_key is not null;

-- =============================================================================
-- 2. CLAIM REVIEW WORK QUEUES
-- =============================================================================

-- Organization/clinic queue ordered by actionable priority and SLA.
create index claim_reviews_active_queue_idx
  on public.claim_reviews (
    organization_id,
    clinic_id,
    review_priority,
    due_at,
    created_at
  )
  include (
    claim_id,
    review_type,
    review_status,
    assigned_to
  )
  where review_status in (
    'pending',
    'assigned',
    'in_review',
    'waiting_information'
  );

-- Reviewer inbox. Partial index avoids completed/cancelled review rows.
create index claim_reviews_assignee_queue_idx
  on public.claim_reviews (
    assigned_to,
    due_at,
    created_at
  )
  include (
    organization_id,
    clinic_id,
    claim_id,
    review_type,
    review_priority,
    review_status
  )
  where assigned_to is not null
    and review_status in (
      'assigned',
      'in_review',
      'waiting_information'
    );

-- Claim review timeline.
create index claim_reviews_claim_timeline_idx
  on public.claim_reviews (
    claim_id,
    review_number desc
  )
  include (
    review_type,
    review_status,
    assigned_to,
    created_at,
    completed_at
  );

-- =============================================================================
-- 3. REVIEW FINDINGS
-- =============================================================================

-- Open findings for a review, ordered by severity and response deadline.
create index claim_review_findings_open_queue_idx
  on public.claim_review_findings (
    claim_review_id,
    severity,
    response_due_at,
    created_at
  )
  include (
    finding_category,
    finding_code,
    finding_status,
    requires_response
  )
  where finding_status in (
    'open',
    'acknowledged',
    'waiting_response'
  );

-- Tenant-level risk/compliance dashboard for unresolved high-risk findings.
create index claim_review_findings_tenant_high_risk_idx
  on public.claim_review_findings (
    organization_id,
    clinic_id,
    created_at desc
  )
  include (
    claim_id,
    claim_review_id,
    finding_category,
    finding_status
  )
  where severity in ('high', 'critical')
    and finding_status in (
      'open',
      'acknowledged',
      'waiting_response'
    );

-- Subject-level lookup for item/document/AI-related findings.
create index claim_review_findings_subject_idx
  on public.claim_review_findings (
    subject_type,
    subject_reference_id
  )
  include (
    claim_id,
    claim_review_id,
    finding_code,
    finding_status
  )
  where subject_reference_id is not null;

-- =============================================================================
-- 4. CLAIM DECISIONS AND ADJUSTMENTS
-- =============================================================================

-- Decision history and latest-version lookup.
-- The unique constraint on (claim_id, decision_version) already supports
-- ascending version lookups, but this covering index supports latest-first
-- history screens without heap access for common columns.
create index claim_decisions_claim_history_idx
  on public.claim_decisions (
    claim_id,
    decision_version desc
  )
  include (
    decision_status,
    decision_outcome,
    approved_amount,
    rejected_amount,
    payer_responsibility_amount,
    decided_at
  );

-- Human decision activity by tenant and date.
create index claim_decisions_tenant_activity_idx
  on public.claim_decisions (
    organization_id,
    clinic_id,
    decided_at desc
  )
  include (
    claim_id,
    decision_version,
    decision_outcome,
    decided_by
  )
  where decision_status in ('final', 'superseded');

-- Adjustment aggregation and line-level adjudication lookup.
create index claim_decision_adjustments_decision_idx
  on public.claim_decision_adjustments (
    claim_decision_id,
    adjustment_number
  )
  include (
    claim_item_id,
    adjustment_type,
    adjustment_amount,
    reason_code
  );

create index claim_decision_adjustments_item_idx
  on public.claim_decision_adjustments (
    claim_item_id,
    created_at
  )
  include (
    claim_id,
    claim_decision_id,
    adjustment_type,
    adjustment_amount
  )
  where claim_item_id is not null;

-- =============================================================================
-- 5. PAYMENT PROCESSING
-- =============================================================================

-- Supports record_claim_payment() cumulative-payment aggregation and payment
-- history for one decision.
create index claim_payments_decision_active_amount_idx
  on public.claim_payments (
    claim_decision_id,
    payment_status
  )
  include (
    net_payment_amount,
    payment_number,
    received_at
  )
  where payment_status in (
    'pending',
    'scheduled',
    'processing',
    'received'
  );

-- Claim payment timeline.
create index claim_payments_claim_timeline_idx
  on public.claim_payments (
    claim_id,
    payment_number desc
  )
  include (
    payment_status,
    net_payment_amount,
    currency_code,
    received_at,
    payment_reference
  );

-- Finance operations queue.
create index claim_payments_processing_queue_idx
  on public.claim_payments (
    organization_id,
    clinic_id,
    payment_status,
    scheduled_at,
    created_at
  )
  include (
    claim_id,
    claim_decision_id,
    net_payment_amount,
    currency_code,
    payment_reference
  )
  where payment_status in (
    'pending',
    'scheduled',
    'processing',
    'failed'
  );

-- Payer/remittance lookups.
create index claim_payments_payer_reference_idx
  on public.claim_payments (
    organization_id,
    payer_reference
  )
  include (
    claim_id,
    payment_status,
    net_payment_amount,
    received_at
  )
  where payer_reference is not null;

create index claim_payments_remittance_reference_idx
  on public.claim_payments (
    organization_id,
    remittance_reference
  )
  include (
    claim_id,
    payment_status,
    net_payment_amount,
    received_at
  )
  where remittance_reference is not null;

-- =============================================================================
-- 6. PAYMENT ALLOCATIONS
-- =============================================================================

-- Supports allocate_claim_payment() SUM and next allocation-number query.
create index claim_payment_allocations_payment_amount_idx
  on public.claim_payment_allocations (
    claim_payment_id,
    allocation_number
  )
  include (
    allocated_amount,
    allocation_type,
    claim_item_id,
    claim_decision_adjustment_id
  );

-- Item payment history.
create index claim_payment_allocations_item_idx
  on public.claim_payment_allocations (
    claim_item_id,
    created_at
  )
  include (
    claim_id,
    claim_payment_id,
    allocated_amount,
    currency_code
  )
  where claim_item_id is not null;

-- Adjustment settlement history.
create index claim_payment_allocations_adjustment_idx
  on public.claim_payment_allocations (
    claim_decision_adjustment_id,
    created_at
  )
  include (
    claim_id,
    claim_payment_id,
    allocated_amount,
    currency_code
  )
  where claim_decision_adjustment_id is not null;

-- =============================================================================
-- 7. PAYMENT RECONCILIATION
-- =============================================================================

-- Reconciliation work queue.
create index claim_payment_reconciliations_queue_idx
  on public.claim_payment_reconciliations (
    organization_id,
    clinic_id,
    reconciliation_status,
    created_at
  )
  include (
    claim_id,
    claim_payment_id,
    variance_amount,
    currency_code,
    external_statement_reference
  )
  where reconciliation_status in (
    'pending',
    'mismatched',
    'under_review',
    'disputed'
  );

-- Payment reconciliation timeline and next reconciliation number.
create index claim_payment_reconciliations_payment_idx
  on public.claim_payment_reconciliations (
    claim_payment_id,
    reconciliation_number desc
  )
  include (
    reconciliation_status,
    expected_amount,
    received_amount,
    variance_amount,
    reconciled_at
  );

-- External statement lookup.
create index claim_payment_reconciliations_statement_idx
  on public.claim_payment_reconciliations (
    organization_id,
    external_statement_reference
  )
  include (
    claim_payment_id,
    reconciliation_status,
    external_statement_date,
    variance_amount
  )
  where external_statement_reference is not null;

-- =============================================================================
-- 8. CLAIM STATUS HISTORY
-- =============================================================================

-- The existing unique constraint (claim_id, sequence_number) supports the
-- function's max(sequence_number) lookup. This covering index improves
-- latest-history screens and event timelines.
create index claim_status_history_claim_timeline_idx
  on public.claim_status_history (
    claim_id,
    changed_at desc
  )
  include (
    sequence_number,
    from_status,
    to_status,
    changed_by,
    reason_code
  );

-- Tenant operational status activity.
create index claim_status_history_tenant_activity_idx
  on public.claim_status_history (
    organization_id,
    clinic_id,
    changed_at desc
  )
  include (
    claim_id,
    from_status,
    to_status,
    changed_by
  );

-- =============================================================================
-- 9. EVIDENCE WORKFLOW
-- =============================================================================

create index claim_evidence_requirements_claim_idx
  on public.claim_evidence_requirements (
    claim_id,
    requirement_status,
    created_at
  );

create index claim_evidence_results_requirement_idx
  on public.claim_evidence_results (
    requirement_id,
    evaluated_at desc
  );

create index claim_evidence_waivers_claim_idx
  on public.claim_evidence_waivers (
    claim_id,
    created_at desc
  );

-- =============================================================================
-- 10. VALIDATION AND POLICY COVERAGE
-- =============================================================================

-- Latest validation run for a claim.
create index claim_validation_runs_claim_latest_idx
  on public.claim_validation_runs (
    claim_id,
    created_at desc
  )
  include (
    validation_stage,
    run_status,
    summary_status,
    started_at,
    completed_at,
    ruleset_version
  );

-- Blocking/high-severity result queue.
create index claim_validation_results_blocking_idx
  on public.claim_validation_results (
    organization_id,
    clinic_id,
    created_at
  )
  include (
    claim_id,
    claim_validation_run_id,
    severity,
    validation_status
  )
 
  include (
    claim_validation_result_id,
    override_status,
    overridden_by
  );

create index claim_policy_coverages_claim_idx
  on public.claim_policy_coverages (
    claim_id,
    evaluated_at desc
  );

create index claim_benefit_limit_results_coverage_idx
  on public.claim_benefit_limit_results (
    claim_policy_coverage_id,
    created_at
  );

create index claim_exclusion_results_coverage_idx
  on public.claim_exclusion_results (
    claim_policy_coverage_id,
    created_at
  );

create index claim_waiting_period_results_coverage_idx
  on public.claim_waiting_period_results (
    claim_policy_coverage_id,
    created_at
  );

-- =============================================================================
-- 11. AI ASSESSMENT AND HUMAN REVIEW SUPPORT
-- =============================================================================

-- Latest AI assessment per claim and model execution history.
create index claim_ai_assessments_claim_latest_idx
  on public.claim_ai_assessments (
    claim_id,
    assessment_number desc
  )
  include (
    assessment_status,
    risk_level,
    confidence_score,
    requires_human_review,
    completed_at
  );

-- Human-review queue for high-risk or low-confidence AI outputs.
create index claim_ai_assessments_review_queue_idx
  on public.claim_ai_assessments (
    organization_id,
    clinic_id,
    risk_level,
    created_at
  )
  include (
    claim_id,
    confidence_score,
    assessment_status
  )
  where requires_human_review = true;

create index claim_ai_risk_signals_assessment_idx
  on public.claim_ai_risk_signals (
    claim_ai_assessment_id,
    severity,
    created_at
  );

create index claim_ai_explanations_assessment_idx
  on public.claim_ai_explanations (
    claim_ai_assessment_id,
    explanation_order
  );

create index claim_ai_review_outcomes_assessment_idx
  on public.claim_ai_review_outcomes (
    claim_ai_assessment_id,
    reviewed_at desc
  );

commit;



