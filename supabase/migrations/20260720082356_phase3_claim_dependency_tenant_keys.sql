-- =============================================================================
-- Med AI NexSure
-- Phase 3: Claim Dependency Tenant Keys
-- Migration: 20260720082356_phase3_claim_dependency_tenant_keys.sql
-- =============================================================================
--
-- PURPOSE
--   Ensure tenant-safe parent keys exist before the Phase 3 claim core and
--   detail migrations are applied.
--
-- REQUIRED ORDER
--   20260720082354_phase3_claim_reference_types.sql
--   20260720082356_phase3_claim_dependency_tenant_keys.sql
--   20260720082357_phase3_claim_core_tables.sql
--   20260720082359_phase3_claim_detail_tables.sql
--
-- NOTES
--   - Existing UNIQUE or PRIMARY KEY constraints are detected by column order.
--   - Constraint names may differ across earlier migrations.
--   - No COMMENT ON CONSTRAINT statements are used because an existing matching
--     constraint may have a different name.
-- =============================================================================

begin;

-- =============================================================================
-- 1. CLINICS: unique (organization_id, id)
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.clinics'::regclass
      and c.contype in ('p', 'u')
      and (
        select array_agg(a.attname::text order by u.ordinality)
        from unnest(c.conkey) with ordinality as u(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = u.attnum
      ) = array['organization_id', 'id']::text[]
  ) then
    alter table public.clinics
      add constraint clinics_organization_id_id_uq
      unique (organization_id, id);
  end if;
end
$$;

-- =============================================================================
-- 2. PATIENTS: unique (organization_id, id)
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.patients'::regclass
      and c.contype in ('p', 'u')
      and (
        select array_agg(a.attname::text order by u.ordinality)
        from unnest(c.conkey) with ordinality as u(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = u.attnum
      ) = array['organization_id', 'id']::text[]
  ) then
    alter table public.patients
      add constraint patients_organization_id_id_uq
      unique (organization_id, id);
  end if;
end
$$;

-- =============================================================================
-- 3. VISITS: unique (organization_id, clinic_id, patient_id, id)
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.visits'::regclass
      and c.contype in ('p', 'u')
      and (
        select array_agg(a.attname::text order by u.ordinality)
        from unnest(c.conkey) with ordinality as u(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = u.attnum
      ) = array[
        'organization_id',
        'clinic_id',
        'patient_id',
        'id'
      ]::text[]
  ) then
    alter table public.visits
      add constraint visits_organization_clinic_patient_id_uq
      unique (organization_id, clinic_id, patient_id, id);
  end if;
end
$$;

commit;