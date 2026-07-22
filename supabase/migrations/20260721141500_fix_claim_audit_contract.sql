-- =============================================================================
-- Med AI NexSure
-- Phase 3: Align claim audit function with current audit_logs contract
-- File: supabase/migrations/20260721141500_fix_claim_audit_contract.sql
-- =============================================================================
--
-- Purpose
--   Align private.write_claim_audit() with the current public.audit_logs schema.
--
-- Audit mapping
--   action_type : controlled enum category
--   event_type  : must equal action_type::text for claim audit events
--   action      : detailed claim event such as claim.created or claim.approved
--
-- Current columns populated
--   actor_auth_user_id
--   actor_profile_id
--   resource_type
--   resource_id
--   action
--   before_state
--   after_state
--
-- Legacy columns remain populated for backward compatibility.
--
-- Preconditions
--   - public.audit_logs contains actor_role, changed_fields, request_id
--   - public.safe_uuid(text) exists
--   - private.write_claim_audit() exists
-- =============================================================================

begin;

do $migration$
declare
  v_function_oid oid;
  v_definition text;
  v_patched text;
begin
  select p.oid
    into v_function_oid
  from pg_proc p
  join pg_namespace n
    on n.oid = p.pronamespace
  where n.nspname = 'private'
    and p.proname = 'write_claim_audit'
    and pg_get_function_identity_arguments(p.oid) = '';

  if v_function_oid is null then
    raise exception
      'Expected function private.write_claim_audit() was not found';
  end if;

  v_definition := pg_get_functiondef(v_function_oid);
  v_patched := v_definition;

  -- Add current actor/resource/state columns while preserving legacy columns.
  v_patched := regexp_replace(
    v_patched,
    'actor_user_id,[[:space:]]*actor_role,[[:space:]]*action_type,[[:space:]]*target_table,',
    E'actor_user_id,\n    actor_auth_user_id,\n    actor_profile_id,\n    actor_role,\n    action_type,\n    event_type,\n    resource_type,\n    resource_id,\n    action,\n    before_state,\n    after_state,\n    target_table,',
    'n'
  );

  -- Replace the old actor/action/table values with the complete audit contract.
  --
  -- event_type intentionally mirrors action_type::text because
  -- ck_audit_logs_event_type only permits lifecycle events or action_type text.
  -- The detailed claim event remains in action.
  v_patched := regexp_replace(
    v_patched,
    E'v_actor_profile_id,[[:space:]]*nullif\\(current_setting\\(''request\\.jwt\\.claim\\.role'', true\\), ''''\\),[[:space:]]*v_action_type,[[:space:]]*tg_table_name,',
    E'v_actor_profile_id,\n    auth.uid(),\n    v_actor_profile_id,\n    nullif(current_setting(''request.jwt.claim.role'', true), ''''),\n    case\n      when tg_table_name = ''claim_reviews''\n        then ''claim_review''::public.audit_action_type\n      when tg_table_name in (''claim_documents'', ''claim_evidence_results'')\n        then ''evidence_change''::public.audit_action_type\n      when tg_op = ''INSERT''\n        then ''create''::public.audit_action_type\n      when tg_op = ''UPDATE''\n        then ''update''::public.audit_action_type\n      when tg_op = ''DELETE''\n        then ''delete''::public.audit_action_type\n      else\n        ''update''::public.audit_action_type\n    end,\n    case\n      when tg_table_name = ''claim_reviews''\n        then ''claim_review''\n      when tg_table_name in (''claim_documents'', ''claim_evidence_results'')\n        then ''evidence_change''\n      when tg_op = ''INSERT''\n        then ''create''\n      when tg_op = ''UPDATE''\n        then ''update''\n      when tg_op = ''DELETE''\n        then ''delete''\n      else\n        ''update''\n    end,\n    tg_table_name,\n    v_target_record_id,\n    v_action_type,\n    v_old_projection,\n    v_new_projection,\n    tg_table_name,',
    'n'
  );

  if v_patched = v_definition then
    raise exception
      'write_claim_audit(): expected function fragments were not found';
  end if;

  if strpos(v_patched, 'resource_type') = 0
     or strpos(v_patched, 'event_type') = 0
     or strpos(v_patched, 'actor_auth_user_id') = 0
     or strpos(v_patched, 'before_state') = 0
     or strpos(v_patched, 'after_state') = 0 then
    raise exception
      'write_claim_audit(): patched definition is incomplete';
  end if;

  execute v_patched;
end;
$migration$;

comment on function private.write_claim_audit() is
  'Writes claim audit events using enum action_type, constraint-compatible event_type, detailed action, current resource fields, and legacy compatibility fields.';

commit;
