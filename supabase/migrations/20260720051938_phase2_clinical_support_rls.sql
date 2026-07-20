begin;

-- =========================================================
-- Med AI NexSure
-- Phase 2 Clinical Support RLS
--
-- Uses current RBAC helpers:
--   public.has_clinic_access(organization_id, clinic_id)
--   public.has_permission(permission_key, organization_id, clinic_id)
--
-- Security model:
--   - Organization and clinic tenant isolation
--   - Permission-based access
--   - Parent-record scope validation
--   - Append-only visit status history
--   - No physical DELETE for clinical records
-- =========================================================


-- =========================================================
-- 1. TABLE PRIVILEGES
-- RLS policies do not grant SQL privileges by themselves.
-- =========================================================

revoke all
on table public.visit_status_history
from anon, authenticated;

revoke all
on table public.prescription_safety_alerts
from anon, authenticated;

revoke all
on table public.clinical_documents
from anon, authenticated;


-- Visit history is append-only.
grant select, insert
on table public.visit_status_history
to authenticated;


-- Safety alerts may be reviewed or soft-deleted through UPDATE.
grant select, insert, update
on table public.prescription_safety_alerts
to authenticated;


-- Clinical documents may be uploaded, verified, superseded,
-- archived, or soft-deleted through UPDATE.
grant select, insert, update
on table public.clinical_documents
to authenticated;


-- =========================================================
-- 2. ENABLE AND FORCE RLS
-- =========================================================

alter table public.visit_status_history
  enable row level security;

alter table public.visit_status_history
  force row level security;

alter table public.prescription_safety_alerts
  enable row level security;

alter table public.prescription_safety_alerts
  force row level security;

alter table public.clinical_documents
  enable row level security;

alter table public.clinical_documents
  force row level security;


-- =========================================================
-- 3. DROP POLICIES SAFELY
-- Allows local reset/replay without duplicate policy errors.
-- =========================================================

drop policy if exists phase2_visit_status_history_select
on public.visit_status_history;

drop policy if exists phase2_visit_status_history_insert
on public.visit_status_history;

drop policy if exists phase2_prescription_safety_alerts_select
on public.prescription_safety_alerts;

drop policy if exists phase2_prescription_safety_alerts_insert
on public.prescription_safety_alerts;

drop policy if exists phase2_prescription_safety_alerts_update
on public.prescription_safety_alerts;

drop policy if exists phase2_clinical_documents_select
on public.clinical_documents;

drop policy if exists phase2_clinical_documents_insert
on public.clinical_documents;

drop policy if exists phase2_clinical_documents_update
on public.clinical_documents;


-- =========================================================
-- 4. VISIT STATUS HISTORY
--
-- SELECT:
--   User must have clinic access and visit.view permission.
--
-- INSERT:
--   User must have clinic access and visit.update_status.
--   The referenced visit must belong to the same
--   organization and clinic.
--
-- UPDATE/DELETE:
--   Intentionally not granted and no policies exist.
-- =========================================================

create policy phase2_visit_status_history_select
on public.visit_status_history
for select
to authenticated
using (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and public.has_permission(
    'visit.view',
    organization_id,
    clinic_id
  )
  and exists (
    select 1
    from public.visits v
    where v.id = visit_status_history.visit_id
      and v.organization_id =
        visit_status_history.organization_id
      and v.clinic_id =
        visit_status_history.clinic_id
  )
);


create policy phase2_visit_status_history_insert
on public.visit_status_history
for insert
to authenticated
with check (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and public.has_permission(
    'visit.update_status',
    organization_id,
    clinic_id
  )
  and exists (
    select 1
    from public.visits v
    where v.id = visit_status_history.visit_id
      and v.organization_id =
        visit_status_history.organization_id
      and v.clinic_id =
        visit_status_history.clinic_id
  )
  and (
    changed_by is null
    or changed_by = auth.uid()
  )
);


-- =========================================================
-- 5. PRESCRIPTION SAFETY ALERTS
--
-- SELECT:
--   prescription.view
--
-- INSERT:
--   prescription.create or prescription.dispense
--
-- UPDATE:
--   prescription.create or prescription.dispense
--
-- DELETE:
--   No physical delete policy.
--   Use deleted_at/deleted_by through UPDATE.
-- =========================================================

create policy phase2_prescription_safety_alerts_select
on public.prescription_safety_alerts
for select
to authenticated
using (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and public.has_permission(
    'prescription.view',
    organization_id,
    clinic_id
  )
  and exists (
    select 1
    from public.prescriptions p
    where p.id =
      prescription_safety_alerts.prescription_id
      and p.organization_id =
        prescription_safety_alerts.organization_id
      and p.clinic_id =
        prescription_safety_alerts.clinic_id
  )
  and (
    prescription_item_id is null
    or exists (
      select 1
      from public.prescription_items pi
      where pi.id =
        prescription_safety_alerts.prescription_item_id
        and pi.prescription_id =
          prescription_safety_alerts.prescription_id
        and pi.organization_id =
          prescription_safety_alerts.organization_id
        and pi.clinic_id =
          prescription_safety_alerts.clinic_id
    )
  )
);


create policy phase2_prescription_safety_alerts_insert
on public.prescription_safety_alerts
for insert
to authenticated
with check (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'prescription.create',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'prescription.dispense',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.prescriptions p
    where p.id =
      prescription_safety_alerts.prescription_id
      and p.organization_id =
        prescription_safety_alerts.organization_id
      and p.clinic_id =
        prescription_safety_alerts.clinic_id
  )
  and (
    prescription_item_id is null
    or exists (
      select 1
      from public.prescription_items pi
      where pi.id =
        prescription_safety_alerts.prescription_item_id
        and pi.prescription_id =
          prescription_safety_alerts.prescription_id
        and pi.organization_id =
          prescription_safety_alerts.organization_id
        and pi.clinic_id =
          prescription_safety_alerts.clinic_id
    )
  )
  and (
    created_by is null
    or created_by = auth.uid()
  )
  and reviewed_by is null
  and reviewed_at is null
  and deleted_at is null
  and deleted_by is null
);


create policy phase2_prescription_safety_alerts_update
on public.prescription_safety_alerts
for update
to authenticated
using (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'prescription.create',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'prescription.dispense',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.prescriptions p
    where p.id =
      prescription_safety_alerts.prescription_id
      and p.organization_id =
        prescription_safety_alerts.organization_id
      and p.clinic_id =
        prescription_safety_alerts.clinic_id
  )
)
with check (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'prescription.create',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'prescription.dispense',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.prescriptions p
    where p.id =
      prescription_safety_alerts.prescription_id
      and p.organization_id =
        prescription_safety_alerts.organization_id
      and p.clinic_id =
        prescription_safety_alerts.clinic_id
  )
  and (
    prescription_item_id is null
    or exists (
      select 1
      from public.prescription_items pi
      where pi.id =
        prescription_safety_alerts.prescription_item_id
        and pi.prescription_id =
          prescription_safety_alerts.prescription_id
        and pi.organization_id =
          prescription_safety_alerts.organization_id
        and pi.clinic_id =
          prescription_safety_alerts.clinic_id
    )
  )
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
  and (
    reviewed_by is null
    or reviewed_by = auth.uid()
  )
  and (
    deleted_by is null
    or deleted_by = auth.uid()
  )
);


-- =========================================================
-- 6. CLINICAL DOCUMENTS
--
-- No dedicated clinical-document permission exists yet.
-- Existing permissions are composed as follows:
--
-- SELECT:
--   patient.view, soap.view, or claim.view
--
-- INSERT:
--   soap.update or claim.review
--
-- UPDATE:
--   soap.update or claim.review
--
-- DELETE:
--   No physical delete policy.
-- =========================================================

create policy phase2_clinical_documents_select
on public.clinical_documents
for select
to authenticated
using (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'patient.view',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'soap.view',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'claim.view',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.patients p
    where p.id = clinical_documents.patient_id
      and p.organization_id =
        clinical_documents.organization_id
      and p.clinic_id =
        clinical_documents.clinic_id
  )
  and (
    visit_id is null
    or exists (
      select 1
      from public.visits v
      where v.id = clinical_documents.visit_id
        and v.patient_id =
          clinical_documents.patient_id
        and v.organization_id =
          clinical_documents.organization_id
        and v.clinic_id =
          clinical_documents.clinic_id
    )
  )
);


create policy phase2_clinical_documents_insert
on public.clinical_documents
for insert
to authenticated
with check (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'soap.update',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'claim.review',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.patients p
    where p.id = clinical_documents.patient_id
      and p.organization_id =
        clinical_documents.organization_id
      and p.clinic_id =
        clinical_documents.clinic_id
  )
  and (
    visit_id is null
    or exists (
      select 1
      from public.visits v
      where v.id = clinical_documents.visit_id
        and v.patient_id =
          clinical_documents.patient_id
        and v.organization_id =
          clinical_documents.organization_id
        and v.clinic_id =
          clinical_documents.clinic_id
    )
  )
  and (
    uploaded_by is null
    or uploaded_by = auth.uid()
  )
  and (
    created_by is null
    or created_by = auth.uid()
  )
  and verified_by is null
  and verified_at is null
  and deleted_at is null
  and deleted_by is null
);


create policy phase2_clinical_documents_update
on public.clinical_documents
for update
to authenticated
using (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'soap.update',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'claim.review',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.patients p
    where p.id = clinical_documents.patient_id
      and p.organization_id =
        clinical_documents.organization_id
      and p.clinic_id =
        clinical_documents.clinic_id
  )
)
with check (
  public.has_clinic_access(
    organization_id,
    clinic_id
  )
  and (
    public.has_permission(
      'soap.update',
      organization_id,
      clinic_id
    )
    or public.has_permission(
      'claim.review',
      organization_id,
      clinic_id
    )
  )
  and exists (
    select 1
    from public.patients p
    where p.id = clinical_documents.patient_id
      and p.organization_id =
        clinical_documents.organization_id
      and p.clinic_id =
        clinical_documents.clinic_id
  )
  and (
    visit_id is null
    or exists (
      select 1
      from public.visits v
      where v.id = clinical_documents.visit_id
        and v.patient_id =
          clinical_documents.patient_id
        and v.organization_id =
          clinical_documents.organization_id
        and v.clinic_id =
          clinical_documents.clinic_id
    )
  )
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
  and (
    verified_by is null
    or verified_by = auth.uid()
  )
  and (
    deleted_by is null
    or deleted_by = auth.uid()
  )
);


-- =========================================================
-- 7. POLICY COMMENTS
-- =========================================================

comment on policy phase2_visit_status_history_select
on public.visit_status_history is
  'Allows authorized clinic users with visit.view to read visit workflow history.';

comment on policy phase2_visit_status_history_insert
on public.visit_status_history is
  'Allows authorized clinic users with visit.update_status to append workflow history.';

comment on policy phase2_prescription_safety_alerts_select
on public.prescription_safety_alerts is
  'Allows authorized users with prescription.view to read medication safety alerts.';

comment on policy phase2_prescription_safety_alerts_insert
on public.prescription_safety_alerts is
  'Allows prescription creators or dispensers to create safety findings.';

comment on policy phase2_prescription_safety_alerts_update
on public.prescription_safety_alerts is
  'Allows authorized clinical users to review, resolve, override, or soft-delete alerts.';

comment on policy phase2_clinical_documents_select
on public.clinical_documents is
  'Allows authorized patient, clinical, or claim users to read document metadata.';

comment on policy phase2_clinical_documents_insert
on public.clinical_documents is
  'Allows authorized clinical or claim users to create document metadata.';

comment on policy phase2_clinical_documents_update
on public.clinical_documents is
  'Allows authorized clinical or claim users to verify, supersede, archive, or soft-delete metadata.';

commit;