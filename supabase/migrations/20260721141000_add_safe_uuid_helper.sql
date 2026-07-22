-- =============================================================================
-- Med AI NexSure
-- Add missing safe UUID conversion helper required by Phase 3 claim audit
-- File: supabase/migrations/20260721141000_add_safe_uuid_helper.sql
-- =============================================================================

begin;

create or replace function public.safe_uuid(
  p_value text
)
returns uuid
language plpgsql
immutable
parallel safe
as $function$
begin
  if p_value is null or btrim(p_value) = '' then
    return null;
  end if;

  return btrim(p_value)::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$function$;

comment on function public.safe_uuid(text) is
  'Safely converts text to UUID. Returns NULL for NULL, blank, or invalid UUID input.';

revoke all on function public.safe_uuid(text) from public;
grant execute on function public.safe_uuid(text) to authenticated;
grant execute on function public.safe_uuid(text) to service_role;

commit;
