-- =============================================================================
-- Med AI NexSure
-- Phase 3: Fix claim self-scoped update policy
-- =============================================================================

begin;

alter table public.claims enable row level security;

grant select, update on table public.claims to authenticated;

drop policy if exists claims_self_update_own_draft
  on public.claims;

create policy claims_self_update_own_draft
on public.claims
as permissive
for update
to authenticated
using (
  auth.uid() is not null
  and created_by = auth.uid()
  and deleted_at is null
  and status = 'draft'
  and public.is_organization_member(organization_id)
  and public.has_clinic_access(organization_id, clinic_id)
  and public.has_permission(
    'claim.update',
    organization_id,
    clinic_id
  )
)
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and deleted_at is null
  and status = 'draft'
  and public.is_organization_member(organization_id)
  and public.has_clinic_access(organization_id, clinic_id)
  and public.has_permission(
    'claim.update',
    organization_id,
    clinic_id
  )
);

comment on policy claims_self_update_own_draft
on public.claims is
  'Allows users with claim.update to update only their own non-deleted draft claims within active organization and clinic scope.';

commit;
