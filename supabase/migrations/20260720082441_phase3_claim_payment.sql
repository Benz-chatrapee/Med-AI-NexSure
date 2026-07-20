-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Payment & Reconciliation
-- Migration: 20260720082441_phase3_claim_payment.sql
-- =============================================================================
--
-- PURPOSE
--   Create claim payment, payment allocation, and reconciliation tables for
--   Med AI NexSure.
--
-- RESPONSIBILITY
--   - public.claim_payments
--   - public.claim_payment_allocations
--   - public.claim_payment_reconciliations
--   - Tenant-safe financial references
--   - Partial payment support
--   - Payment and reconciliation lifecycle separation
--   - Financial amount integrity
--
-- DOMAIN BOUNDARIES
--   claim_payments
--     Records payer remittance/payment events for an approved claim decision.
--
--   claim_payment_allocations
--     Allocates a payment to claim-level, claim-item, or decision-adjustment
--     targets.
--
--   claim_payment_reconciliations
--     Records expected-versus-received comparison and reconciliation outcomes.
--
-- OUT OF SCOPE
--   - Payment gateway or bank API execution
--   - RLS policies
--   - Permission grants
--   - Application indexes
--   - Audit event triggers
--   - Payment posting functions and workflow triggers
--   - Automatic claim status transitions
--
-- REQUIRED EXISTING OBJECTS
--   public.claims(organization_id, clinic_id, id)
--   public.claim_items(organization_id, clinic_id, claim_id, id)
--   public.claim_decisions(organization_id, clinic_id, claim_id, id)
--   public.claim_decision_adjustments(
--     organization_id, clinic_id, claim_id, claim_decision_id, id
--   )
--   public.user_profiles(id)
--   public.decision_reason_codes(code)
--
-- GOVERNANCE
--   - AI is decision support only and must not authorize or execute payment.
--   - Only an authorized human-approved final claim decision may be paid.
--   - Final-decision status and cumulative payment limits are enforced later by
--     trusted transactional functions because CHECK constraints cannot inspect
--     or aggregate rows from other tables.
-- =============================================================================

begin;

-- =============================================================================
-- 1. REQUIRED PARENT IDENTITY KEYS
-- =============================================================================
--
-- These composite unique keys support tenant-safe foreign keys. They are
-- integrity constraints, not workload indexes.
--

alter table public.claim_decision_adjustments
  add constraint claim_decision_adjustments_claim_identity_uq
  unique (
    organization_id,
    clinic_id,
    claim_id,
    claim_decision_id,
    id
  );

-- =============================================================================
-- 2. CLAIM PAYMENTS
-- =============================================================================

create table public.claim_payments (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_decision_id uuid not null,

  payment_number integer not null,
  payment_reference text not null,
  payer_reference text,
  remittance_reference text,
  idempotency_key text,

  payment_status text not null default 'pending',
  payment_method text not null default 'electronic_transfer',

  currency_code char(3) not null,

  gross_payment_amount numeric(18,2) not null,
  withholding_amount numeric(18,2) not null default 0,
  adjustment_amount numeric(18,2) not null default 0,
  net_payment_amount numeric(18,2)
    generated always as (
      gross_payment_amount
      - withholding_amount
      + adjustment_amount
    ) stored,

  scheduled_at timestamptz,
  processing_started_at timestamptz,
  received_at timestamptz,
  value_date date,

  failed_at timestamptz,
  reversed_at timestamptz,
  cancelled_at timestamptz,

  failure_code text,
  failure_reason text,
  reversal_reason_code text,
  reversal_reason_text text,
  cancellation_reason_code text,
  cancellation_reason_text text,

  external_source text not null default 'manual',
  external_payload_hash text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_payments_number_chk
    check (payment_number > 0),

  constraint claim_payments_reference_not_blank_chk
    check (btrim(payment_reference) <> ''),

  constraint claim_payments_payer_reference_not_blank_chk
    check (
      payer_reference is null
      or btrim(payer_reference) <> ''
    ),

  constraint claim_payments_remittance_reference_not_blank_chk
    check (
      remittance_reference is null
      or btrim(remittance_reference) <> ''
    ),

  constraint claim_payments_idempotency_key_not_blank_chk
    check (
      idempotency_key is null
      or btrim(idempotency_key) <> ''
    ),

  constraint claim_payments_status_chk
    check (
      payment_status in (
        'pending',
        'scheduled',
        'processing',
        'received',
        'failed',
        'reversed',
        'cancelled'
      )
    ),

  constraint claim_payments_method_chk
    check (
      payment_method in (
        'electronic_transfer',
        'bank_transfer',
        'cheque',
        'cash',
        'credit_note',
        'offset',
        'other'
      )
    ),

  constraint claim_payments_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_payments_amounts_chk
    check (
      gross_payment_amount >= 0
      and withholding_amount >= 0
      and net_payment_amount >= 0
    ),

  constraint claim_payments_scheduled_state_chk
    check (
      payment_status <> 'scheduled'
      or scheduled_at is not null
    ),

  constraint claim_payments_processing_state_chk
    check (
      payment_status <> 'processing'
      or processing_started_at is not null
    ),

  constraint claim_payments_received_state_chk
    check (
      (
        payment_status = 'received'
        and received_at is not null
      )
      or
      (
        payment_status <> 'received'
        and received_at is null
      )
    ),

  constraint claim_payments_failed_state_chk
    check (
      (
        payment_status = 'failed'
        and failed_at is not null
        and failure_code is not null
        and failure_reason is not null
      )
      or
      (
        payment_status <> 'failed'
        and failed_at is null
      )
    ),

  constraint claim_payments_reversed_state_chk
    check (
      (
        payment_status = 'reversed'
        and reversed_at is not null
        and reversal_reason_code is not null
        and reversal_reason_text is not null
      )
      or
      (
        payment_status <> 'reversed'
        and reversed_at is null
      )
    ),

  constraint claim_payments_cancelled_state_chk
    check (
      (
        payment_status = 'cancelled'
        and cancelled_at is not null
        and cancellation_reason_code is not null
        and cancellation_reason_text is not null
      )
      or
      (
        payment_status <> 'cancelled'
        and cancelled_at is null
      )
    ),

  constraint claim_payments_failure_reason_not_blank_chk
    check (
      failure_reason is null
      or btrim(failure_reason) <> ''
    ),

  constraint claim_payments_reversal_reason_not_blank_chk
    check (
      reversal_reason_text is null
      or btrim(reversal_reason_text) <> ''
    ),

  constraint claim_payments_cancellation_reason_not_blank_chk
    check (
      cancellation_reason_text is null
      or btrim(cancellation_reason_text) <> ''
    ),

  constraint claim_payments_external_source_chk
    check (
      external_source in (
        'manual',
        'payer_file',
        'payer_api',
        'bank_file',
        'bank_api',
        'migration',
        'other'
      )
    ),

  constraint claim_payments_payload_hash_not_blank_chk
    check (
      external_payload_hash is null
      or btrim(external_payload_hash) <> ''
    ),

  constraint claim_payments_time_order_chk
    check (
      (scheduled_at is null or scheduled_at >= created_at)
      and (
        processing_started_at is null
        or processing_started_at >= created_at
      )
      and (received_at is null or received_at >= created_at)
      and (failed_at is null or failed_at >= created_at)
      and (reversed_at is null or reversed_at >= created_at)
      and (cancelled_at is null or cancelled_at >= created_at)
      and updated_at >= created_at
    ),

  constraint claim_payments_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_payments_decision_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id
    )
    references public.claim_decisions(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payments_claim_tenant_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id
    )
    references public.claims(
      organization_id,
      clinic_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payments_failure_code_fk
    foreign key (failure_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payments_reversal_reason_code_fk
    foreign key (reversal_reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payments_cancellation_reason_code_fk
    foreign key (cancellation_reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payments_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payments_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payments_claim_number_uq
    unique (claim_id, payment_number),

  constraint claim_payments_reference_uq
    unique (organization_id, payment_reference),

  constraint claim_payments_claim_identity_uq
    unique (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      id
    )
);

comment on table public.claim_payments is
  'Payer payment/remittance event for a human-approved claim decision. AI cannot authorize or execute payment.';

comment on column public.claim_payments.net_payment_amount is
  'Stored generated amount: gross payment minus withholding plus signed adjustment.';

comment on column public.claim_payments.idempotency_key is
  'Optional retry-safe request key. Partial uniqueness is added in the indexes migration.';

comment on column public.claim_payments.external_payload_hash is
  'Hash or digest for external source traceability; raw sensitive financial payloads must not be stored here.';

-- =============================================================================
-- 3. CLAIM PAYMENT ALLOCATIONS
-- =============================================================================

create table public.claim_payment_allocations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_decision_id uuid not null,
  claim_payment_id uuid not null,

  claim_item_id uuid,
  claim_decision_adjustment_id uuid,

  allocation_number integer not null,
  allocation_type text not null default 'claim',

  currency_code char(3) not null,
  allocated_amount numeric(18,2) not null,

  reason_code text,
  reason_text text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,

  constraint claim_payment_allocations_number_chk
    check (allocation_number > 0),

  constraint claim_payment_allocations_type_chk
    check (
      allocation_type in (
        'claim',
        'claim_item',
        'decision_adjustment',
        'patient_responsibility',
        'withholding',
        'other'
      )
    ),

  constraint claim_payment_allocations_target_chk
    check (
      (
        allocation_type = 'claim'
        and claim_item_id is null
        and claim_decision_adjustment_id is null
      )
      or
      (
        allocation_type = 'claim_item'
        and claim_item_id is not null
        and claim_decision_adjustment_id is null
      )
      or
      (
        allocation_type = 'decision_adjustment'
        and claim_item_id is null
        and claim_decision_adjustment_id is not null
      )
      or
      (
        allocation_type in (
          'patient_responsibility',
          'withholding',
          'other'
        )
        and num_nonnulls(
          claim_item_id,
          claim_decision_adjustment_id
        ) <= 1
      )
    ),

  constraint claim_payment_allocations_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_payment_allocations_amount_chk
    check (allocated_amount > 0),

  constraint claim_payment_allocations_reason_pair_chk
    check (
      num_nonnulls(reason_code, reason_text) in (0, 2)
    ),

  constraint claim_payment_allocations_reason_text_not_blank_chk
    check (
      reason_text is null
      or btrim(reason_text) <> ''
    ),

  constraint claim_payment_allocations_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_payment_allocations_payment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      claim_payment_id
    )
    references public.claim_payments(
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payment_allocations_item_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_item_id
    )
    references public.claim_items(
      organization_id,
      clinic_id,
      claim_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payment_allocations_adjustment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      claim_decision_adjustment_id
    )
    references public.claim_decision_adjustments(
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payment_allocations_reason_code_fk
    foreign key (reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payment_allocations_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payment_allocations_payment_number_uq
    unique (claim_payment_id, allocation_number),

  constraint claim_payment_allocations_payment_identity_uq
    unique (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      claim_payment_id,
      id
    )
);

comment on table public.claim_payment_allocations is
  'Allocation of a payment to a claim, claim item, or decision adjustment. Aggregate limits are enforced by trusted functions.';

-- =============================================================================
-- 4. CLAIM PAYMENT RECONCILIATIONS
-- =============================================================================

create table public.claim_payment_reconciliations (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  clinic_id uuid not null,
  claim_id uuid not null,
  claim_decision_id uuid not null,
  claim_payment_id uuid not null,

  reconciliation_number integer not null,
  reconciliation_status text not null default 'pending',

  currency_code char(3) not null,

  expected_amount numeric(18,2) not null,
  received_amount numeric(18,2) not null,
  variance_amount numeric(18,2)
    generated always as (
      received_amount - expected_amount
    ) stored,

  variance_reason_code text,
  variance_reason_text text,

  external_statement_reference text,
  external_statement_date date,

  reconciled_by uuid,
  reconciled_at timestamptz,

  resolved_by uuid,
  resolved_at timestamptz,
  resolution_code text,
  resolution_text text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,

  constraint claim_payment_reconciliations_number_chk
    check (reconciliation_number > 0),

  constraint claim_payment_reconciliations_status_chk
    check (
      reconciliation_status in (
        'pending',
        'matched',
        'mismatched',
        'under_review',
        'resolved',
        'disputed',
        'cancelled'
      )
    ),

  constraint claim_payment_reconciliations_currency_chk
    check (currency_code ~ '^[A-Z]{3}$'),

  constraint claim_payment_reconciliations_amounts_chk
    check (
      expected_amount >= 0
      and received_amount >= 0
    ),

  constraint claim_payment_reconciliations_matched_chk
    check (
      reconciliation_status <> 'matched'
      or variance_amount = 0
    ),

  constraint claim_payment_reconciliations_mismatch_chk
    check (
      reconciliation_status not in (
        'mismatched',
        'under_review',
        'disputed'
      )
      or variance_amount <> 0
    ),

  constraint claim_payment_reconciliations_variance_reason_pair_chk
    check (
      num_nonnulls(
        variance_reason_code,
        variance_reason_text
      ) in (0, 2)
    ),

  constraint claim_payment_reconciliations_variance_reason_required_chk
    check (
      variance_amount = 0
      or (
        variance_reason_code is not null
        and variance_reason_text is not null
      )
    ),

  constraint claim_payment_reconciliations_variance_text_not_blank_chk
    check (
      variance_reason_text is null
      or btrim(variance_reason_text) <> ''
    ),

  constraint claim_payment_reconciliations_external_reference_not_blank_chk
    check (
      external_statement_reference is null
      or btrim(external_statement_reference) <> ''
    ),

  constraint claim_payment_reconciliations_reconciled_pair_chk
    check (
      num_nonnulls(reconciled_by, reconciled_at) in (0, 2)
    ),

  constraint claim_payment_reconciliations_reconciled_state_chk
    check (
      reconciliation_status = 'pending'
      or reconciled_at is not null
    ),

  constraint claim_payment_reconciliations_resolution_pair_chk
    check (
      num_nonnulls(
        resolved_by,
        resolved_at,
        resolution_code,
        resolution_text
      ) in (0, 4)
    ),

  constraint claim_payment_reconciliations_resolved_state_chk
    check (
      reconciliation_status <> 'resolved'
      or resolved_at is not null
    ),

  constraint claim_payment_reconciliations_resolution_text_not_blank_chk
    check (
      resolution_text is null
      or btrim(resolution_text) <> ''
    ),

  constraint claim_payment_reconciliations_time_order_chk
    check (
      (reconciled_at is null or reconciled_at >= created_at)
      and (
        resolved_at is null
        or reconciled_at is null
        or resolved_at >= reconciled_at
      )
      and updated_at >= created_at
    ),

  constraint claim_payment_reconciliations_metadata_object_chk
    check (jsonb_typeof(metadata) = 'object'),

  constraint claim_payment_reconciliations_payment_claim_fk
    foreign key (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      claim_payment_id
    )
    references public.claim_payments(
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      id
    )
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_variance_reason_code_fk
    foreign key (variance_reason_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_resolution_code_fk
    foreign key (resolution_code)
    references public.decision_reason_codes(code)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_reconciled_by_fk
    foreign key (reconciled_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_resolved_by_fk
    foreign key (resolved_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_created_by_fk
    foreign key (created_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_updated_by_fk
    foreign key (updated_by)
    references public.user_profiles(id)
    on update restrict
    on delete restrict,

  constraint claim_payment_reconciliations_payment_number_uq
    unique (claim_payment_id, reconciliation_number),

  constraint claim_payment_reconciliations_payment_identity_uq
    unique (
      organization_id,
      clinic_id,
      claim_id,
      claim_decision_id,
      claim_payment_id,
      id
    )
);

comment on table public.claim_payment_reconciliations is
  'Expected-versus-received reconciliation record for a claim payment.';

comment on column public.claim_payment_reconciliations.variance_amount is
  'Stored generated value equal to received_amount minus expected_amount.';

-- =============================================================================
-- 5. DEFERRED CURRENT PAYMENT REFERENCE
-- =============================================================================
--
-- Add only when the core claims table already includes current_payment_id.
-- This block intentionally checks the catalog to keep the migration compatible
-- with repositories where that deferred column has not yet been added.
--

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'claims'
      and column_name = 'current_payment_id'
  ) then
    alter table public.claims
      add constraint claims_current_payment_claim_fk
      foreign key (
        organization_id,
        clinic_id,
        id,
        current_payment_id
      )
      references public.claim_payments(
        organization_id,
        clinic_id,
        claim_id,
        id
      )
      on update restrict
      on delete restrict;
  end if;
end
$$;

commit;