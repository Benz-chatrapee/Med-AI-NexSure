-- =============================================================================
-- Phase 5 Batch E - Doctor Dashboard readiness least-privilege reads
-- =============================================================================
-- Allows canonical claim.read holders to read readiness outputs only through an
-- authorized active visit, while preserving legacy claim.view compatibility for
-- reviewer/admin readiness paths.

create schema if not exists private;

do $$
begin
  if to_regprocedure('public.has_permission(text,uuid,uuid)') is null then
    raise exception 'Required helper public.has_permission(text, uuid, uuid) does not exist';
  end if;

  if to_regclass('public.claim_readiness_assessments') is null then
    raise exception 'Required table public.claim_readiness_assessments does not exist';
  end if;

  if to_regclass('public.claim_readiness_items') is null then
    raise exception 'Required table public.claim_readiness_items does not exist';
  end if;

  if to_regclass('public.visits') is null then
    raise exception 'Required table public.visits does not exist';
  end if;
end;
$$;

create or replace function private.readiness_visit_can_read(
  p_visit_id uuid,
  p_organization_id uuid,
  p_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = private, public, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and p_visit_id is not null
    and p_organization_id is not null
    and p_clinic_id is not null
    and public.has_permission('claim.read', p_organization_id, p_clinic_id)
    and exists (
      select 1
      from public.visits v
      where v.id = p_visit_id
        and v.organization_id = p_organization_id
        and v.clinic_id = p_clinic_id
        and v.attending_user_id = auth.uid()
        and v.is_active = true
        and v.deleted_at is null
    );
$$;

revoke all on function private.readiness_visit_can_read(uuid, uuid, uuid)
  from public, anon;
grant execute on function private.readiness_visit_can_read(uuid, uuid, uuid)
  to authenticated, service_role;

drop policy if exists mvp1_claim_select
  on public.claim_readiness_assessments;

create policy mvp1_claim_select
on public.claim_readiness_assessments
for select
to authenticated
using (
  (
    public.has_clinic_access(organization_id, clinic_id)
    and public.has_permission('claim.view', organization_id, clinic_id)
  )
  or (
    is_active = true
    and deleted_at is null
    and private.readiness_visit_can_read(
      visit_id,
      organization_id,
      clinic_id
    )
  )
);

drop policy if exists mvp1_claim_items_select
  on public.claim_readiness_items;

create policy mvp1_claim_items_select
on public.claim_readiness_items
for select
to authenticated
using (
  (
    public.has_clinic_access(organization_id, clinic_id)
    and public.has_permission('claim.view', organization_id, clinic_id)
  )
  or (
    is_active = true
    and deleted_at is null
    and exists (
      select 1
      from public.claim_readiness_assessments cra
      where cra.id = claim_readiness_items.assessment_id
        and cra.organization_id = claim_readiness_items.organization_id
        and cra.clinic_id = claim_readiness_items.clinic_id
        and cra.is_active = true
        and cra.deleted_at is null
        and private.readiness_visit_can_read(
          cra.visit_id,
          cra.organization_id,
          cra.clinic_id
        )
    )
  )
);

comment on function private.readiness_visit_can_read(uuid, uuid, uuid) is
  'Allows claim.read readiness access only through an active, non-deleted visit assigned to auth.uid() in the caller organization and clinic scope.';

comment on policy mvp1_claim_select on public.claim_readiness_assessments is
  'Preserves legacy claim.view readiness reads and adds least-privilege claim.read reads for active assigned visits.';

comment on policy mvp1_claim_items_select on public.claim_readiness_items is
  'Preserves legacy claim.view readiness item reads and derives claim.read item visibility from the authorized parent assessment visit.';
