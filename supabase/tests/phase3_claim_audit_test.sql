-- =============================================================================
-- Med AI NexSure
-- Phase 3 Claim Audit Test
-- File: supabase/tests/phase3_claim_audit_test.sql
-- =============================================================================
--
-- Validates confirmed production contracts from:
--   - public.audit_logs
--   - private.claim_audit_projection(jsonb)
--   - private.claim_audit_changed_fields(jsonb, jsonb)
--   - private.claim_audit_safe_reason(text)
--   - private.classify_claim_audit_event(text, text, jsonb, jsonb, text)
--   - private.write_claim_audit()
--   - claims audit trigger
--
-- Fixture-dependent workflow scenarios such as cross-tenant audit reads,
-- actor resolution from real personas, and transaction-coupled approval
-- events must be validated in fixture-backed integration tests.
--
-- This test is deterministic, creates no permanent objects, and rolls back.
-- =============================================================================

begin;

set local search_path = public, extensions, auth, pg_temp;

select plan(38);

-- =============================================================================
-- 1. Audit infrastructure
-- =============================================================================

select has_table(
  'public',
  'audit_logs',
  'public.audit_logs exists'
);

select has_column(
  'public',
  'audit_logs',
  'organization_id',
  'audit_logs.organization_id exists'
);

select has_column(
  'public',
  'audit_logs',
  'action_type',
  'audit_logs.action_type exists'
);

select has_column(
  'public',
  'audit_logs',
  'target_table',
  'audit_logs.target_table exists'
);

select has_column(
  'public',
  'audit_logs',
  'target_record_id',
  'audit_logs.target_record_id exists'
);

select has_column(
  'public',
  'audit_logs',
  'old_value',
  'audit_logs.old_value exists'
);

select has_column(
  'public',
  'audit_logs',
  'new_value',
  'audit_logs.new_value exists'
);

select has_column(
  'public',
  'audit_logs',
  'metadata',
  'audit_logs.metadata exists'
);

-- =============================================================================
-- 2. Helper contracts
-- =============================================================================

select has_function(
  'private',
  'claim_audit_projection',
  array['jsonb'],
  'private.claim_audit_projection(jsonb) exists'
);

select function_returns(
  'private',
  'claim_audit_projection',
  array['jsonb'],
  'jsonb',
  'claim_audit_projection returns jsonb'
);

select has_function(
  'private',
  'claim_audit_changed_fields',
  array['jsonb', 'jsonb'],
  'private.claim_audit_changed_fields(jsonb, jsonb) exists'
);

select function_returns(
  'private',
  'claim_audit_changed_fields',
  array['jsonb', 'jsonb'],
  'text[]',
  'claim_audit_changed_fields returns text[]'
);

select has_function(
  'private',
  'claim_audit_safe_reason',
  array['text'],
  'private.claim_audit_safe_reason(text) exists'
);

select has_function(
  'private',
  'classify_claim_audit_event',
  array['text', 'text', 'jsonb', 'jsonb', 'text'],
  'private.classify_claim_audit_event(...) exists'
);

select has_function(
  'private',
  'write_claim_audit',
  array[]::text[],
  'private.write_claim_audit() exists'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = 'write_claim_audit'
      and p.prosecdef
  ),
  'private.write_claim_audit is SECURITY DEFINER'
);

select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = 'write_claim_audit'
      and exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) cfg
        where cfg like 'search_path=%'
      )
  ),
  'private.write_claim_audit defines a search_path'
);

-- =============================================================================
-- 3. Trigger and index contracts
-- =============================================================================

select has_trigger(
  'public',
  'claims',
  'trg_claims_aiud_write_claim_audit',
  'claims audit trigger exists'
);

select is(
  (
    select count(*)::bigint
    from pg_trigger t
    join pg_class c
      on c.oid = t.tgrelid
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'claims'
      and t.tgname = 'trg_claims_aiud_write_claim_audit'
      and not t.tgisinternal
  ),
  1::bigint,
  'claims audit trigger exists exactly once'
);

select ok(
  not exists (
    select 1
    from pg_trigger t
    join pg_class c
      on c.oid = t.tgrelid
    join pg_namespace n
      on n.oid = c.relnamespace
    join pg_proc p
      on p.oid = t.tgfoid
    join pg_namespace pn
      on pn.oid = p.pronamespace
    where n.nspname = 'public'
      and c.relname = 'audit_logs'
      and pn.nspname = 'private'
      and p.proname = 'write_claim_audit'
      and not t.tgisinternal
  ),
  'audit_logs does not audit itself through write_claim_audit'
);

select has_index(
  'public',
  'audit_logs',
  'audit_logs_claim_timeline_idx',
  'claim audit timeline index exists'
);

select has_index(
  'public',
  'audit_logs',
  'audit_logs_claim_action_idx',
  'claim audit action index exists'
);

select has_index(
  'public',
  'audit_logs',
  'audit_logs_claim_correlation_idx',
  'claim audit correlation index exists'
);

-- =============================================================================
-- 4. Append-only security boundary
-- =============================================================================

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'insert'
  ),
  'authenticated cannot insert arbitrary audit records'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'update'
  ),
  'authenticated cannot update audit records'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.audit_logs',
    'delete'
  ),
  'authenticated cannot delete audit records'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'private.write_claim_audit()',
    'execute'
  ),
  'authenticated cannot execute the internal audit writer'
);

select ok(
  not has_function_privilege(
    'anon',
    'private.write_claim_audit()',
    'execute'
  ),
  'anon cannot execute the internal audit writer'
);

-- =============================================================================
-- 5. Safe payload, changed-field calculation, and PHI minimization
-- =============================================================================

select is(
  private.claim_audit_projection(
    jsonb_build_object(
      'status', 'submitted',
      'review_status', 'pending',
      'patient_name', 'Sensitive Patient',
      'national_id', '1234567890123',
      'soap_note', 'private clinical narrative',
      'signed_url', 'https://example.invalid/private',
      'access_token', 'secret-token',
      'raw_prompt', 'private prompt'
    )
  ),
  jsonb_build_object(
    'status', 'submitted',
    'review_status', 'pending'
  ),
  'safe projection excludes PHI, signed URLs, tokens, and prompts'
);

select is(
  private.claim_audit_projection(
    jsonb_build_object(
      'decision_type', 'approved',
      'reason_code', 'MEDICALLY_NECESSARY',
      'approved_amount', 1500,
      'document_content', 'binary-content',
      'ocr_text', 'sensitive OCR text',
      'raw_response', 'sensitive AI response'
    )
  ),
  jsonb_build_object(
    'decision_type', 'approved',
    'approved_amount', 1500,
    'reason_code', 'MEDICALLY_NECESSARY'
  ),
  'decision projection excludes document and raw AI content'
);

select is(
  private.claim_audit_changed_fields(
    '{"status":"draft","risk_level":"low"}'::jsonb,
    '{"status":"submitted","risk_level":"low"}'::jsonb
  ),
  array['status']::text[],
  'changed-fields helper reports only changed allowlisted fields'
);

select is(
  private.claim_audit_safe_reason(
    E'  reviewed\tand\napproved  '
  ),
  'reviewed and approved',
  'reason sanitizer removes control characters and trims text'
);

select is(
  length(
    private.claim_audit_safe_reason(
      repeat('a', 600)
    )
  ),
  500,
  'reason sanitizer limits text to 500 characters'
);

-- =============================================================================
-- 6. Event classification
-- =============================================================================

select is(
  private.classify_claim_audit_event(
    'claims',
    'INSERT',
    '{}'::jsonb,
    '{"status":"draft"}'::jsonb,
    'claim'
  ),
  'claim.created',
  'claim INSERT is classified as claim.created'
);

select is(
  private.classify_claim_audit_event(
    'claims',
    'UPDATE',
    '{"status":"draft"}'::jsonb,
    '{"status":"submitted"}'::jsonb,
    'claim'
  ),
  'claim.submitted',
  'draft-to-submitted is classified as claim.submitted'
);

select is(
  private.classify_claim_audit_event(
    'claims',
    'UPDATE',
    '{"status":"submitted","deleted_at":null}'::jsonb,
    '{"status":"submitted","deleted_at":"2026-07-21T12:00:00Z"}'::jsonb,
    'claim'
  ),
  'claim.soft_deleted',
  'deleted_at transition is classified as claim.soft_deleted'
);

select is(
  private.classify_claim_audit_event(
    'claim_decisions',
    'INSERT',
    '{}'::jsonb,
    '{"decision_type":"approved"}'::jsonb,
    'claim.decision'
  ),
  'claim.approved',
  'approved decision is classified as claim.approved'
);

select is(
  private.classify_claim_audit_event(
    'claim_reviews',
    'UPDATE',
    '{"review_status":"in_progress"}'::jsonb,
    '{"review_status":"completed"}'::jsonb,
    'claim.review'
  ),
  'claim.review_completed',
  'completed review is classified as claim.review_completed'
);

select * from finish();

rollback;
