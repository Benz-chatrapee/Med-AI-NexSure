-- Med AI NexSure
-- Phase 3: Claim Processing Reference Types
-- File: 20260720082354_phase3_claim_reference_types.sql
--
-- Scope:
--   - Configurable claim reference tables only
--   - Initial seed data for MVP
--
-- Out of scope:
--   - Core claim tables
--   - Functions and triggers
--   - Index strategy beyond PK/unique constraints
--   - RBAC/RLS policies
--   - Audit integration
--
-- Design:
--   - Use text + check constraints in transactional tables for workflow states
--   - Use lookup/config tables only where organization/payer configuration may evolve
--   - Keep all codes lowercase snake_case
--   - Use synthetic reference data only

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Common updated_at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at()
is 'Sets updated_at to the current timestamp before row update.';

-- ---------------------------------------------------------------------------
-- Claim types
-- ---------------------------------------------------------------------------

create table if not exists public.claim_types (
  code text primary key,
  name_en text not null,
  name_th text,
  description text,
  requires_admission boolean not null default false,
  supports_stp boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint claim_types_code_format_chk
    check (code ~ '^[a-z][a-z0-9_]*$'),

  constraint claim_types_name_en_not_blank_chk
    check (btrim(name_en) <> ''),

  constraint claim_types_name_th_not_blank_chk
    check (name_th is null or btrim(name_th) <> ''),

  constraint claim_types_display_order_chk
    check (display_order >= 0)
);

comment on table public.claim_types
is 'Configurable claim categories used by Med AI NexSure claim processing.';

comment on column public.claim_types.code
is 'Stable lowercase snake_case business code.';

drop trigger if exists trg_claim_types_set_updated_at on public.claim_types;

create trigger trg_claim_types_set_updated_at
before update on public.claim_types
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Validation categories
-- ---------------------------------------------------------------------------

create table if not exists public.validation_categories (
  code text primary key,
  name_en text not null,
  name_th text,
  description text,
  default_severity text not null default 'medium',
  is_blocking_by_default boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint validation_categories_code_format_chk
    check (code ~ '^[a-z][a-z0-9_]*$'),

  constraint validation_categories_name_en_not_blank_chk
    check (btrim(name_en) <> ''),

  constraint validation_categories_name_th_not_blank_chk
    check (name_th is null or btrim(name_th) <> ''),

  constraint validation_categories_default_severity_chk
    check (default_severity in ('info', 'low', 'medium', 'high', 'critical')),

  constraint validation_categories_display_order_chk
    check (display_order >= 0)
);

comment on table public.validation_categories
is 'Reference categories for deterministic, manual, and AI-assisted claim validation findings.';

drop trigger if exists trg_validation_categories_set_updated_at
  on public.validation_categories;

create trigger trg_validation_categories_set_updated_at
before update on public.validation_categories
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Decision reason codes
-- ---------------------------------------------------------------------------

create table if not exists public.decision_reason_codes (
  code text primary key,
  category text not null,
  name_en text not null,
  name_th text,
  description text,
  applies_to text not null default 'all',
  is_blocking boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint decision_reason_codes_code_format_chk
    check (code ~ '^[a-z][a-z0-9_]*$'),

  constraint decision_reason_codes_category_chk
    check (
      category in (
        'data',
        'coverage',
        'evidence',
        'clinical',
        'coding',
        'financial',
        'duplicate',
        'risk',
        'administrative',
        'payment',
        'other'
      )
    ),

  constraint decision_reason_codes_name_en_not_blank_chk
    check (btrim(name_en) <> ''),

  constraint decision_reason_codes_name_th_not_blank_chk
    check (name_th is null or btrim(name_th) <> ''),

  constraint decision_reason_codes_applies_to_chk
    check (
      applies_to in (
        'all',
        'information_request',
        'review',
        'partial_approval',
        'rejection',
        'payment',
        'override'
      )
    ),

  constraint decision_reason_codes_display_order_chk
    check (display_order >= 0)
);

comment on table public.decision_reason_codes
is 'Standardized claim review, decision, payment, and override reason codes.';

drop trigger if exists trg_decision_reason_codes_set_updated_at
  on public.decision_reason_codes;

create trigger trg_decision_reason_codes_set_updated_at
before update on public.decision_reason_codes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: claim types
-- ---------------------------------------------------------------------------

insert into public.claim_types (
  code,
  name_en,
  name_th,
  description,
  requires_admission,
  supports_stp,
  display_order
)
values
  (
    'opd',
    'Outpatient',
    'ผู้ป่วยนอก',
    'Outpatient medical claim.',
    false,
    true,
    10
  ),
  (
    'ipd',
    'Inpatient',
    'ผู้ป่วยใน',
    'Inpatient medical claim requiring admission.',
    true,
    false,
    20
  ),
  (
    'day_case',
    'Day Case',
    'ผู้ป่วยรับไว้รักษาแบบไม่ค้างคืน',
    'Same-day admission or procedure claim.',
    true,
    false,
    30
  ),
  (
    'dental',
    'Dental',
    'ทันตกรรม',
    'Dental treatment claim.',
    false,
    true,
    40
  ),
  (
    'accident',
    'Accident',
    'อุบัติเหตุ',
    'Accident-related medical claim.',
    false,
    false,
    50
  ),
  (
    'emergency',
    'Emergency',
    'ฉุกเฉิน',
    'Emergency treatment claim.',
    false,
    false,
    60
  ),
  (
    'maternity',
    'Maternity',
    'การคลอดและการตั้งครรภ์',
    'Maternity-related medical claim.',
    true,
    false,
    70
  ),
  (
    'preventive',
    'Preventive Care',
    'การดูแลเชิงป้องกัน',
    'Preventive or health screening claim.',
    false,
    true,
    80
  ),
  (
    'other',
    'Other',
    'อื่น ๆ',
    'Other configured claim type.',
    false,
    false,
    999
  )
on conflict (code) do update
set
  name_en = excluded.name_en,
  name_th = excluded.name_th,
  description = excluded.description,
  requires_admission = excluded.requires_admission,
  supports_stp = excluded.supports_stp,
  display_order = excluded.display_order,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Seed: validation categories
-- ---------------------------------------------------------------------------

insert into public.validation_categories (
  code,
  name_en,
  name_th,
  description,
  default_severity,
  is_blocking_by_default,
  display_order
)
values
  (
    'data_sufficiency',
    'Data Sufficiency',
    'ความครบถ้วนของข้อมูล',
    'Checks required fields, identifiers, dates, and source completeness.',
    'high',
    true,
    10
  ),
  (
    'eligibility',
    'Eligibility',
    'สิทธิ์การใช้บริการ',
    'Checks patient, policy, member, provider, and service eligibility.',
    'high',
    true,
    20
  ),
  (
    'coverage',
    'Coverage',
    'ความคุ้มครอง',
    'Checks waiting period, exclusions, network, preauthorization, and benefit eligibility.',
    'high',
    true,
    30
  ),
  (
    'evidence',
    'Evidence Completeness',
    'ความครบถ้วนของหลักฐาน',
    'Checks mandatory clinical, administrative, financial, and policy evidence.',
    'high',
    true,
    40
  ),
  (
    'clinical_consistency',
    'Clinical Consistency',
    'ความสอดคล้องทางการแพทย์',
    'Checks consistency among complaint, findings, diagnosis, treatment, and timeline.',
    'medium',
    false,
    50
  ),
  (
    'prescription',
    'Prescription Review',
    'การตรวจสอบใบสั่งยา',
    'Checks medication appropriateness, duplication, quantity, and safety indicators.',
    'medium',
    false,
    60
  ),
  (
    'coding',
    'Medical Coding',
    'รหัสทางการแพทย์',
    'Checks diagnosis, procedure, coding version, specificity, and coding support.',
    'medium',
    false,
    70
  ),
  (
    'drg',
    'DRG Plausibility',
    'ความสมเหตุสมผลของ DRG',
    'Checks DRG and relative-weight plausibility when authorized grouper results are available.',
    'medium',
    false,
    80
  ),
  (
    'financial',
    'Financial Validation',
    'การตรวจสอบด้านการเงิน',
    'Checks quantities, prices, contract rates, calculations, and benefit allocation.',
    'high',
    true,
    90
  ),
  (
    'duplicate',
    'Duplicate Detection',
    'การตรวจหารายการซ้ำ',
    'Checks duplicate claim, invoice, item, and related submission candidates.',
    'high',
    true,
    100
  ),
  (
    'temporal',
    'Temporal Consistency',
    'ความสอดคล้องของลำดับเวลา',
    'Checks event, document, treatment, admission, discharge, and submission chronology.',
    'medium',
    false,
    110
  ),
  (
    'fraud_risk',
    'Fraud, Waste and Abuse Risk',
    'ความเสี่ยงด้านทุจริตและการใช้สิทธิ์ไม่เหมาะสม',
    'Stores risk indicators and anomalies requiring investigation.',
    'high',
    false,
    120
  ),
  (
    'administrative',
    'Administrative Validation',
    'การตรวจสอบด้านธุรการ',
    'Checks forms, signatures, references, and operational requirements.',
    'medium',
    false,
    130
  )
on conflict (code) do update
set
  name_en = excluded.name_en,
  name_th = excluded.name_th,
  description = excluded.description,
  default_severity = excluded.default_severity,
  is_blocking_by_default = excluded.is_blocking_by_default,
  display_order = excluded.display_order,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Seed: decision reason codes
-- ---------------------------------------------------------------------------

insert into public.decision_reason_codes (
  code,
  category,
  name_en,
  name_th,
  description,
  applies_to,
  is_blocking,
  display_order
)
values
  (
    'missing_mandatory_information',
    'data',
    'Missing Mandatory Information',
    'ข้อมูลบังคับไม่ครบ',
    'Required claim or clinical information is missing.',
    'information_request',
    true,
    10
  ),
  (
    'missing_mandatory_evidence',
    'evidence',
    'Missing Mandatory Evidence',
    'เอกสารหรือหลักฐานบังคับไม่ครบ',
    'One or more payer-required documents are missing.',
    'information_request',
    true,
    20
  ),
  (
    'policy_inactive_on_service_date',
    'coverage',
    'Policy Inactive on Service Date',
    'กรมธรรม์ไม่มีผลในวันที่รับบริการ',
    'The policy was not active on the service date.',
    'rejection',
    true,
    30
  ),
  (
    'waiting_period_not_satisfied',
    'coverage',
    'Waiting Period Not Satisfied',
    'ยังไม่พ้นระยะเวลารอคอย',
    'The claim is within an applicable waiting period.',
    'rejection',
    true,
    40
  ),
  (
    'policy_exclusion_matched',
    'coverage',
    'Policy Exclusion Matched',
    'เข้าข้อยกเว้นตามกรมธรรม์',
    'A configured policy exclusion applies.',
    'rejection',
    true,
    50
  ),
  (
    'preauthorization_missing',
    'coverage',
    'Preauthorization Missing',
    'ไม่มีการอนุมัติล่วงหน้า',
    'Required preauthorization was not found.',
    'review',
    true,
    60
  ),
  (
    'clinical_documentation_insufficient',
    'clinical',
    'Clinical Documentation Insufficient',
    'ข้อมูลทางการแพทย์ไม่เพียงพอ',
    'Clinical documentation does not sufficiently support adjudication.',
    'information_request',
    true,
    70
  ),
  (
    'medical_necessity_questionable',
    'clinical',
    'Medical Necessity Questionable',
    'ความจำเป็นทางการแพทย์ต้องตรวจสอบ',
    'Medical necessity requires human medical review.',
    'review',
    false,
    80
  ),
  (
    'diagnosis_treatment_mismatch',
    'clinical',
    'Diagnosis and Treatment Mismatch',
    'การวินิจฉัยและการรักษาไม่สอดคล้อง',
    'Submitted diagnosis does not clearly support the treatment or prescription.',
    'review',
    false,
    90
  ),
  (
    'coding_not_supported',
    'coding',
    'Coding Not Supported',
    'รหัสทางการแพทย์ไม่มีหลักฐานรองรับ',
    'Submitted diagnosis or procedure code lacks supporting documentation.',
    'review',
    false,
    100
  ),
  (
    'potential_upcoding',
    'coding',
    'Potential Upcoding Indicator',
    'พบตัวบ่งชี้ความเสี่ยง Upcoding',
    'Severity or complexity may exceed documented clinical evidence.',
    'review',
    false,
    110
  ),
  (
    'duplicate_claim_candidate',
    'duplicate',
    'Duplicate Claim Candidate',
    'พบรายการเคลมที่อาจซ้ำ',
    'A possible duplicate claim requires resolution.',
    'review',
    true,
    120
  ),
  (
    'duplicate_invoice_candidate',
    'duplicate',
    'Duplicate Invoice Candidate',
    'พบใบแจ้งหนี้ที่อาจซ้ำ',
    'A possible duplicate invoice requires resolution.',
    'review',
    true,
    130
  ),
  (
    'charge_not_supported',
    'financial',
    'Charge Not Supported',
    'รายการค่าใช้จ่ายไม่มีหลักฐานรองรับ',
    'A billed line lacks a supporting order, service, or document.',
    'partial_approval',
    false,
    140
  ),
  (
    'charge_above_allowed_rate',
    'financial',
    'Charge Above Allowed Rate',
    'ค่าใช้จ่ายสูงกว่าอัตราที่กำหนด',
    'A billed amount exceeds the configured contract or fee schedule.',
    'partial_approval',
    false,
    150
  ),
  (
    'benefit_limit_exceeded',
    'financial',
    'Benefit Limit Exceeded',
    'เกินวงเงินผลประโยชน์',
    'The eligible amount exceeds the configured benefit limit.',
    'partial_approval',
    false,
    160
  ),
  (
    'high_risk_indicator_requires_review',
    'risk',
    'High-Risk Indicator Requires Review',
    'พบความเสี่ยงสูง ต้องให้เจ้าหน้าที่ตรวจสอบ',
    'A high-risk anomaly blocks automated processing.',
    'review',
    true,
    170
  ),
  (
    'manual_review_required_by_rule',
    'administrative',
    'Manual Review Required by Rule',
    'กฎกำหนดให้เจ้าหน้าที่ตรวจสอบ',
    'Configured payer or organization rule requires human review.',
    'review',
    true,
    180
  ),
  (
    'approved_after_human_review',
    'administrative',
    'Approved After Human Review',
    'อนุมัติหลังการตรวจสอบโดยเจ้าหน้าที่',
    'The claim was approved after human review.',
    'all',
    false,
    190
  ),
  (
    'override_with_authorized_reason',
    'administrative',
    'Authorized Override',
    'ปรับผลโดยผู้มีอำนาจพร้อมเหตุผล',
    'An authorized reviewer overrode a rule or recommendation with a recorded reason.',
    'override',
    false,
    200
  )
on conflict (code) do update
set
  category = excluded.category,
  name_en = excluded.name_en,
  name_th = excluded.name_th,
  description = excluded.description,
  applies_to = excluded.applies_to,
  is_blocking = excluded.is_blocking,
  display_order = excluded.display_order,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- Reference tables are read-only for application users.
-- Write access remains migration/service controlled until Phase 3 RBAC/RLS
-- migrations explicitly define administration workflows.

grant select on table public.claim_types to authenticated;
grant select on table public.validation_categories to authenticated;
grant select on table public.decision_reason_codes to authenticated;

revoke insert, update, delete, truncate
  on table public.claim_types
  from anon, authenticated;

revoke insert, update, delete, truncate
  on table public.validation_categories
  from anon, authenticated;

revoke insert, update, delete, truncate
  on table public.decision_reason_codes
  from anon, authenticated;

comment on table public.decision_reason_codes
is 'Standard reason catalog. Final decision authority remains with deterministic STP rules, authorized human reviewers, or external payer outcomes; AI recommendations are non-binding.';

commit;