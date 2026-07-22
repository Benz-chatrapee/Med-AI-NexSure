-- =============================================================================
-- Med AI NexSure
-- Phase 4 Batch 1: Claim Split-State Types
-- Migration: 20260722140000_phase4_claim_state_types.sql
-- =============================================================================
-- Scope:
--   - Create approved workflow, decision, and payment state enums.
--   - Create domains over those enums with explicit value checks.
--   - Do not alter public.claims in this migration.
-- =============================================================================

begin;

create type public.claim_workflow_state as enum (
  'draft',
  'collecting_data',
  'validation_pending',
  'needs_review',
  'ready_to_submit',
  'submitted',
  'under_review',
  'appealed',
  'closed',
  'cancelled'
);

create domain public.claim_workflow_state_domain
  as public.claim_workflow_state
  constraint claim_workflow_state_domain_chk
    check (
      value in (
        'draft',
        'collecting_data',
        'validation_pending',
        'needs_review',
        'ready_to_submit',
        'submitted',
        'under_review',
        'appealed',
        'closed',
        'cancelled'
      )
    );

create type public.claim_decision_state as enum (
  'not_decided',
  'approved',
  'partially_approved',
  'rejected',
  'request_information',
  'voided'
);

create domain public.claim_decision_state_domain
  as public.claim_decision_state
  constraint claim_decision_state_domain_chk
    check (
      value in (
        'not_decided',
        'approved',
        'partially_approved',
        'rejected',
        'request_information',
        'voided'
      )
    );

create type public.claim_payment_state as enum (
  'not_paid',
  'payment_pending',
  'partially_paid',
  'paid',
  'payment_failed',
  'partially_refunded',
  'refunded',
  'reversed'
);

create domain public.claim_payment_state_domain
  as public.claim_payment_state
  constraint claim_payment_state_domain_chk
    check (
      value in (
        'not_paid',
        'payment_pending',
        'partially_paid',
        'paid',
        'payment_failed',
        'partially_refunded',
        'refunded',
        'reversed'
      )
    );

comment on type public.claim_workflow_state is
  'Phase 4 Batch 1 Claim operational workflow state enum. Does not represent payer decision or payment settlement.';

comment on domain public.claim_workflow_state_domain is
  'Validated domain for Claim workflow snapshot columns.';

comment on type public.claim_decision_state is
  'Phase 4 Batch 1 Claim payer decision snapshot enum. Authoritative decision records remain in claim_decisions.';

comment on domain public.claim_decision_state_domain is
  'Validated domain for Claim decision snapshot columns.';

comment on type public.claim_payment_state is
  'Phase 4 Batch 1 Claim payment settlement snapshot enum. Authoritative payment records remain in claim_payments and related tables.';

comment on domain public.claim_payment_state_domain is
  'Validated domain for Claim payment snapshot columns.';

commit;
