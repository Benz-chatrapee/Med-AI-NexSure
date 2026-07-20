begin;

-- =========================================================
-- Med AI NexSure
-- Phase 2 Clinical Support Tables
----------------------------------

-- Tables:
--   1. visit_status_history
--   2. prescription_safety_alerts
--   3. clinical_documents
--------------------------

-- Design goals:
--   - Multi-tenant organization and clinic isolation
--   - Clinical safety and human verification
--   - Audit-ready workflow
--   - Optimized indexes for common operational queries
--   - Private Storage metadata management
-- =========================================================

-- =========================================================
-- 1. VISIT STATUS HISTORY
-- Append-only history of visit workflow transitions
-- =========================================================

create table if not exists public.visit_status_history (
id uuid primary key default gen_random_uuid(),

organization_id uuid not null
references public.organizations(id)
on update cascade
on delete restrict,

clinic_id uuid not null
references public.clinics(id)
on update cascade
on delete restrict,

visit_id uuid not null
references public.visits(id)
on update cascade
on delete cascade,

from_status public.visit_status,
to_status public.visit_status not null,

reason text,

changed_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

correlation_id uuid not null default gen_random_uuid(),

changed_at timestamptz not null default now(),

constraint visit_status_history_valid_transition
check (
from_status is null
or from_status is distinct from to_status
),

constraint visit_status_history_reason_length
check (
reason is null
or char_length(reason) <= 1000
)
);

comment on table public.visit_status_history is
'Append-only history of Med AI NexSure visit status transitions.';

comment on column public.visit_status_history.correlation_id is
'Correlation identifier for tracing the workflow and related audit events.';

comment on column public.visit_status_history.reason is
'Reason provided by the authorized user or workflow for the status transition.';

-- Query: visit timeline ordered newest first
create index if not exists idx_visit_status_history_visit_time
on public.visit_status_history (
visit_id,
changed_at desc
);

-- Query: organization and clinic operational history
create index if not exists idx_visit_status_history_scope_time
on public.visit_status_history (
organization_id,
clinic_id,
changed_at desc
);

-- Query: visits transitioning to a target status
create index if not exists idx_visit_status_history_to_status
on public.visit_status_history (
organization_id,
clinic_id,
to_status,
changed_at desc
);

-- =========================================================
-- 2. PRESCRIPTION SAFETY ALERTS
-- Medication safety findings requiring human review
-- =========================================================

create table if not exists public.prescription_safety_alerts (
id uuid primary key default gen_random_uuid(),

organization_id uuid not null
references public.organizations(id)
on update cascade
on delete restrict,

clinic_id uuid not null
references public.clinics(id)
on update cascade
on delete restrict,

prescription_id uuid not null
references public.prescriptions(id)
on update cascade
on delete cascade,

prescription_item_id uuid
references public.prescription_items(id)
on update cascade
on delete cascade,

alert_type text not null,

severity text not null,

alert_status text not null default 'open',

title text not null,

message text not null,

evidence jsonb not null default '{}'::jsonb,

source_type text not null default 'rule_engine',

source_reference text,

reviewed_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

reviewed_at timestamptz,

override_reason text,

correlation_id uuid not null default gen_random_uuid(),

is_active boolean not null default true,

created_at timestamptz not null default now(),

created_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

updated_at timestamptz not null default now(),

updated_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

deleted_at timestamptz,

deleted_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

constraint prescription_safety_alerts_type_check
check (
alert_type in (
'drug_allergy',
'cross_reactivity',
'drug_interaction',
'drug_disease_interaction',
'contraindication',
'duplicate_therapy',
'dose_limit',
'renal_dose',
'hepatic_dose',
'pregnancy',
'breastfeeding',
'pediatric',
'geriatric',
'high_alert_medication',
'route_mismatch',
'frequency_mismatch',
'duration_mismatch',
'diagnosis_medication_mismatch'
)
),

constraint prescription_safety_alerts_severity_check
check (
severity in (
'blocking',
'high',
'moderate',
'informational'
)
),

constraint prescription_safety_alerts_status_check
check (
alert_status in (
'open',
'acknowledged',
'resolved',
'overridden',
'dismissed'
)
),

constraint prescription_safety_alerts_source_check
check (
source_type in (
'rule_engine',
'drug_database',
'clinical_ai',
'physician',
'pharmacist',
'system'
)
),

constraint prescription_safety_alerts_review_consistency
check (
(
reviewed_at is null
and reviewed_by is null
)
or
(
reviewed_at is not null
and reviewed_by is not null
)
),

constraint prescription_safety_alerts_override_check
check (
alert_status <> 'overridden'
or (
reviewed_by is not null
and reviewed_at is not null
and nullif(btrim(override_reason), '') is not null
)
),

constraint prescription_safety_alerts_soft_delete_check
check (
(
deleted_at is null
and deleted_by is null
)
or
(
deleted_at is not null
and deleted_by is not null
)
),

constraint prescription_safety_alerts_text_length
check (
char_length(title) <= 250
and char_length(message) <= 4000
and (
override_reason is null
or char_length(override_reason) <= 2000
)
),

constraint prescription_safety_alerts_evidence_object
check (
jsonb_typeof(evidence) = 'object'
)
);

comment on table public.prescription_safety_alerts is
'Medication safety findings requiring physician or pharmacist review.';

comment on column public.prescription_safety_alerts.evidence is
'Structured minimum-necessary evidence. Do not store secrets or excessive PHI.';

comment on column public.prescription_safety_alerts.severity is
'Alert severity: blocking, high, moderate, or informational.';

comment on column public.prescription_safety_alerts.override_reason is
'Mandatory reason when an authorized professional overrides a safety alert.';

-- Query: safety findings by prescription
create index if not exists idx_prescription_safety_alerts_prescription_time
on public.prescription_safety_alerts (
prescription_id,
created_at desc
)
where deleted_at is null;

-- Query: safety findings by prescription item
create index if not exists idx_prescription_safety_alerts_item_time
on public.prescription_safety_alerts (
prescription_item_id,
created_at desc
)
where prescription_item_id is not null
and deleted_at is null;

-- Query: active clinic safety-review queue
create index if not exists idx_prescription_safety_alerts_open_queue
on public.prescription_safety_alerts (
organization_id,
clinic_id,
severity,
created_at desc
)
where is_active = true
and deleted_at is null
and alert_status in (
'open',
'acknowledged'
);

-- Query: blocking alerts before approval or dispensing
create index if not exists idx_prescription_safety_alerts_blocking
on public.prescription_safety_alerts (
prescription_id,
created_at desc
)
where is_active = true
and deleted_at is null
and severity = 'blocking'
and alert_status in (
'open',
'acknowledged'
);

-- Query: structured safety evidence
create index if not exists idx_prescription_safety_alerts_evidence_gin
on public.prescription_safety_alerts
using gin (
evidence jsonb_path_ops
);

-- =========================================================
-- 3. CLINICAL DOCUMENTS
-- Metadata only; binary files remain in private Storage
-- =========================================================

create table if not exists public.clinical_documents (
id uuid primary key default gen_random_uuid(),

organization_id uuid not null
references public.organizations(id)
on update cascade
on delete restrict,

clinic_id uuid not null
references public.clinics(id)
on update cascade
on delete restrict,

patient_id uuid not null
references public.patients(id)
on update cascade
on delete restrict,

visit_id uuid
references public.visits(id)
on update cascade
on delete set null,

document_type text not null,

document_status text not null default 'draft',

verification_status text not null default 'unverified',

source_type text not null default 'uploaded',

title text,

description text,

storage_bucket text not null default 'patient-documents',

storage_path text not null,

original_filename text not null,

mime_type text not null,

file_size_bytes bigint not null,

checksum_sha256 text,

uploaded_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

verified_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

verified_at timestamptz,

supersedes_document_id uuid
references public.clinical_documents(id)
on update cascade
on delete set null,

correlation_id uuid not null default gen_random_uuid(),

is_active boolean not null default true,

created_at timestamptz not null default now(),

created_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

updated_at timestamptz not null default now(),

updated_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

deleted_at timestamptz,

deleted_by uuid
references public.user_profiles(id)
on update cascade
on delete set null,

constraint clinical_documents_type_check
check (
document_type in (
'medical_certificate',
'lab_result',
'imaging_report',
'referral',
'consent',
'prescription',
'claim_evidence',
'clinical_note',
'other'
)
),

constraint clinical_documents_status_check
check (
document_status in (
'draft',
'active',
'superseded',
'voided',
'archived'
)
),

constraint clinical_documents_verification_check
check (
verification_status in (
'unverified',
'needs_review',
'verified',
'rejected'
)
),

constraint clinical_documents_source_check
check (
source_type in (
'uploaded',
'generated',
'external',
'scanned',
'system'
)
),

constraint clinical_documents_file_size_check
check (
file_size_bytes > 0
and file_size_bytes <= 52428800
),

constraint clinical_documents_storage_check
check (
nullif(btrim(storage_bucket), '') is not null
and nullif(btrim(storage_path), '') is not null
and nullif(btrim(original_filename), '') is not null
and nullif(btrim(mime_type), '') is not null
),

constraint clinical_documents_checksum_check
check (
checksum_sha256 is null
or checksum_sha256 ~ '^[0-9a-fA-F]{64}$'
),

constraint clinical_documents_verified_fields_check
check (
verification_status <> 'verified'
or (
verified_by is not null
and verified_at is not null
)
),

constraint clinical_documents_soft_delete_check
check (
(
deleted_at is null
and deleted_by is null
)
or
(
deleted_at is not null
and deleted_by is not null
)
),

constraint clinical_documents_title_length
check (
(
title is null
or char_length(title) <= 500
)
and (
description is null
or char_length(description) <= 4000
)
),

constraint clinical_documents_no_self_supersede
check (
supersedes_document_id is null
or supersedes_document_id <> id
),

constraint clinical_documents_storage_object_unique
unique (
storage_bucket,
storage_path
)
);

comment on table public.clinical_documents is
'Metadata for clinical documents stored in private Supabase Storage.';

comment on column public.clinical_documents.storage_path is
'Private object path. Generate short-lived signed URLs server-side only.';

comment on column public.clinical_documents.supersedes_document_id is
'Previous clinical document version replaced by this document.';

comment on column public.clinical_documents.checksum_sha256 is
'Optional SHA-256 checksum used for integrity and duplicate detection.';

-- Query: patient document timeline
create index if not exists idx_clinical_documents_patient_time
on public.clinical_documents (
patient_id,
created_at desc
)
where deleted_at is null;

-- Query: visit evidence and documents
create index if not exists idx_clinical_documents_visit_time
on public.clinical_documents (
visit_id,
created_at desc
)
where visit_id is not null
and deleted_at is null;

-- Query: active documents by tenant and document type
create index if not exists idx_clinical_documents_scope_type_time
on public.clinical_documents (
organization_id,
clinic_id,
document_type,
created_at desc
)
where is_active = true
and deleted_at is null;

-- Query: documents awaiting verification
create index if not exists idx_clinical_documents_verification_queue
on public.clinical_documents (
organization_id,
clinic_id,
verification_status,
created_at desc
)
where is_active = true
and deleted_at is null
and verification_status in (
'unverified',
'needs_review'
);

-- Query: document version chain
create index if not exists idx_clinical_documents_supersedes
on public.clinical_documents (
supersedes_document_id
)
where supersedes_document_id is not null;

-- =========================================================
-- ROW LEVEL SECURITY
---------------------

-- RLS is enabled now.
-- Policies must be added after verifying the repository's
-- existing RBAC helper functions and permission codes.
-------------------------------------------------------

-- With RLS enabled and no policies, authenticated clients
-- cannot access these tables. This is secure-by-default.
-- =========================================================

alter table public.visit_status_history
enable row level security;

alter table public.prescription_safety_alerts
enable row level security;

alter table public.clinical_documents
enable row level security;

-- Remove direct privileges inherited by PUBLIC.
revoke all
on table public.visit_status_history
from public;

revoke all
on table public.prescription_safety_alerts
from public;

revoke all
on table public.clinical_documents
from public;

commit;
