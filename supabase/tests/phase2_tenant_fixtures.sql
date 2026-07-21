-- Med AI NexSure - Phase 2 Tenant Isolation Fixtures
-- LOCAL SUPABASE TEST DATABASE ONLY

begin;

set local statement_timeout = '30s';
set local lock_timeout = '10s';
set local idle_in_transaction_session_timeout = '60s';

-- 1) Fail-fast schema validation

do $$
declare
  missing_objects text;
begin
  with required(table_name, column_name) as (
    values
      ('organizations','id'),('organizations','code'),('organizations','name'),('organizations','organization_type'),('organizations','lifecycle_status'),('organizations','is_active'),
      ('clinics','id'),('clinics','organization_id'),('clinics','code'),('clinics','name'),('clinics','clinic_type'),('clinics','lifecycle_status'),('clinics','is_active'),
      ('user_profiles','id'),('user_profiles','organization_id'),('user_profiles','primary_clinic_id'),('user_profiles','display_name'),('user_profiles','email'),('user_profiles','is_active'),
      ('organization_memberships','organization_id'),('organization_memberships','user_profile_id'),('organization_memberships','membership_status'),
      ('clinic_memberships','organization_id'),('clinic_memberships','clinic_id'),('clinic_memberships','user_profile_id'),
      ('user_role_assignments','id'),('user_role_assignments','organization_id'),('user_role_assignments','clinic_id'),('user_role_assignments','user_profile_id'),('user_role_assignments','role_id'),('user_role_assignments','assignment_status'),
      ('patients','id'),('patients','organization_id'),('patients','clinic_id'),('patients','patient_code'),('patients','display_label'),
      ('visits','id'),('visits','organization_id'),('visits','clinic_id'),('visits','patient_id'),('visits','visit_number'),('visits','department'),('visits','visit_status'),
      ('prescriptions','id'),('prescriptions','organization_id'),('prescriptions','clinic_id'),('prescriptions','visit_id'),
      ('visit_status_history','id'),('prescription_safety_alerts','id'),('clinical_documents','id')
  ), missing as (
    select r.table_name || '.' || r.column_name as object_name
    from required r
    left join information_schema.columns c
      on c.table_schema='public' and c.table_name=r.table_name and c.column_name=r.column_name
    where c.column_name is null
  )
  select string_agg(object_name, ', ' order by object_name)
  into missing_objects
  from missing;

  if missing_objects is not null then
    raise exception 'Phase 2 fixture preflight failed. Missing objects: %', missing_objects;
  end if;

  if not exists (
    select 1 from public.roles
    where lower(name)='organization_admin'
      and coalesce(is_active,true)
      and deleted_at is null
  ) then
    raise exception 'Phase 2 fixture preflight failed: active organization_admin role not found';
  end if;
end
$$;

-- 2) Local auth users. Password for all users: LocalTest!2026

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
)
values
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001','authenticated','authenticated','phase2.user.a@nexsure.local',crypt('LocalTest!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"display_name":"Phase 2 User A"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000002','authenticated','authenticated','phase2.user.b@nexsure.local',crypt('LocalTest!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"display_name":"Phase 2 User B"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000003','authenticated','authenticated','phase2.user.c@nexsure.local',crypt('LocalTest!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"display_name":"Phase 2 User C"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000004','authenticated','authenticated','phase2.user.d@nexsure.local',crypt('LocalTest!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"display_name":"Phase 2 User D"}',now(),now())
on conflict (id) do update set
  email=excluded.email,
  encrypted_password=excluded.encrypted_password,
  email_confirmed_at=excluded.email_confirmed_at,
  raw_app_meta_data=excluded.raw_app_meta_data,
  raw_user_meta_data=excluded.raw_user_meta_data,
  updated_at=now();

-- 3) Organizations and clinics

insert into public.organizations (id,code,name,organization_type,lifecycle_status,is_active)
values
  ('10000000-0000-0000-0000-000000000001','PHASE2-ORG-A','Phase 2 Test Organization A','healthcare_provider','active',true),
  ('10000000-0000-0000-0000-000000000002','PHASE2-ORG-B','Phase 2 Test Organization B','healthcare_provider','active',true)
on conflict (id) do update set
  code=excluded.code,
  name=excluded.name,
  organization_type=excluded.organization_type,
  lifecycle_status=excluded.lifecycle_status,
  is_active=true,
  deleted_at=null,
  updated_at=now();

insert into public.clinics (id,organization_id,code,name,clinic_type,lifecycle_status,is_active)
values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PHASE2-CLINIC-A','Phase 2 Test Clinic A','clinic','active',true),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','PHASE2-CLINIC-B','Phase 2 Test Clinic B','clinic','active',true),
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','PHASE2-CLINIC-C','Phase 2 Test Clinic C','clinic','active',true)
on conflict (id) do update set
  organization_id=excluded.organization_id,
  code=excluded.code,
  name=excluded.name,
  clinic_type=excluded.clinic_type,
  lifecycle_status=excluded.lifecycle_status,
  is_active=true,
  deleted_at=null,
  updated_at=now();

-- 4) Users and memberships

insert into public.user_profiles (id,organization_id,primary_clinic_id,display_name,email,job_title,department,is_active)
values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Phase 2 User A','phase2.user.a@nexsure.local','Organization Administrator','Administration',true),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Phase 2 User B','phase2.user.b@nexsure.local','Organization Administrator','Administration',true),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','Phase 2 User C','phase2.user.c@nexsure.local','Organization Administrator','Administration',true),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Phase 2 User D','phase2.user.d@nexsure.local','Restricted Test User','Operations',true)
on conflict (id) do update set
  organization_id=excluded.organization_id,
  primary_clinic_id=excluded.primary_clinic_id,
  display_name=excluded.display_name,
  email=excluded.email,
  job_title=excluded.job_title,
  department=excluded.department,
  is_active=true,
  deleted_at=null,
  updated_at=now();

insert into public.organization_memberships (organization_id,user_profile_id,membership_status)
values
  ('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','active'),
  ('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','active'),
  ('10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','active'),
  ('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000004','active')
on conflict (organization_id,user_profile_id) do update set
  membership_status='active',deleted_at=null,updated_at=now();

insert into public.clinic_memberships (organization_id,clinic_id,user_profile_id)
values
  ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000004')
on conflict (organization_id,clinic_id,user_profile_id) do update set
  deleted_at=null,updated_at=now();

-- 5) Role assignments. User D intentionally has no Phase-2 role.

with admin_role as (
  select id
  from public.roles
  where lower(name)='organization_admin'
    and coalesce(is_active,true)
    and deleted_at is null
  order by (organization_id is null) desc, created_at
  limit 1
), fixtures as (
  select * from (values
    ('33000000-0000-0000-0000-000000000001'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'20000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000001'::uuid,'Phase 2 tenant fixture A'),
    ('33000000-0000-0000-0000-000000000002'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'20000000-0000-0000-0000-000000000002'::uuid,'30000000-0000-0000-0000-000000000002'::uuid,'Phase 2 tenant fixture B'),
    ('33000000-0000-0000-0000-000000000003'::uuid,'10000000-0000-0000-0000-000000000002'::uuid,'20000000-0000-0000-0000-000000000003'::uuid,'30000000-0000-0000-0000-000000000003'::uuid,'Phase 2 tenant fixture C')
  ) v(id,organization_id,clinic_id,user_profile_id,reason)
)
insert into public.user_role_assignments (id,organization_id,clinic_id,user_profile_id,role_id,assignment_status,assignment_reason,assigned_at)
select f.id,f.organization_id,f.clinic_id,f.user_profile_id,r.id,'active',f.reason,now()
from fixtures f cross join admin_role r
on conflict (id) do update set
  organization_id=excluded.organization_id,
  clinic_id=excluded.clinic_id,
  user_profile_id=excluded.user_profile_id,
  role_id=excluded.role_id,
  assignment_status='active',
  assignment_reason=excluded.assignment_reason,
  assigned_at=now(),
  expires_at=null,
  revoked_at=null;

-- 6) Clinical domain records

insert into public.patients (id,organization_id,clinic_id,patient_code,display_label,consent_status,date_of_birth,sex_at_birth,is_active)
values
  ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','PH2-A-0001','Phase 2 Patient A','granted','1985-01-01','female',true),
  ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','PH2-B-0001','Phase 2 Patient B','granted','1986-02-02','male',true),
  ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','PH2-C-0001','Phase 2 Patient C','granted','1987-03-03','female',true)
on conflict (id) do update set
  organization_id=excluded.organization_id,
  clinic_id=excluded.clinic_id,
  patient_code=excluded.patient_code,
  display_label=excluded.display_label,
  consent_status=excluded.consent_status,
  date_of_birth=excluded.date_of_birth,
  sex_at_birth=excluded.sex_at_birth,
  is_active=true,
  deleted_at=null,
  updated_at=now();

insert into public.visits (id,organization_id,clinic_id,patient_id,visit_number,department,visit_status,is_active)
values
  ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','VN-PH2-A-0001','General Medicine','in_consultation',true),
  ('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','VN-PH2-B-0001','General Medicine','in_consultation',true),
  ('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000003','VN-PH2-C-0001','General Medicine','in_consultation',true)
on conflict (id) do update set
  organization_id=excluded.organization_id,
  clinic_id=excluded.clinic_id,
  patient_id=excluded.patient_id,
  visit_number=excluded.visit_number,
  department=excluded.department,
  visit_status=excluded.visit_status,
  is_active=true,
  deleted_at=null,
  updated_at=now();

insert into public.prescriptions (id,organization_id,clinic_id,visit_id,prescribing_user_id,safety_review_required,safety_review_summary,is_active)
values
  ('60000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',true,'Phase 2 safety fixture A',true),
  ('60000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',true,'Phase 2 safety fixture B',true),
  ('60000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003',true,'Phase 2 safety fixture C',true)
on conflict (id) do update set
  organization_id=excluded.organization_id,
  clinic_id=excluded.clinic_id,
  visit_id=excluded.visit_id,
  prescribing_user_id=excluded.prescribing_user_id,
  safety_review_required=true,
  safety_review_summary=excluded.safety_review_summary,
  is_active=true,
  deleted_at=null,
  updated_at=now();

insert into public.visit_status_history (id,organization_id,clinic_id,visit_id,from_status,to_status,reason,changed_by,correlation_id)
values
  ('70000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001',null,'in_consultation','Phase 2 fixture A','30000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002',null,'in_consultation','Phase 2 fixture B','30000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003',null,'in_consultation','Phase 2 fixture C','30000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.prescription_safety_alerts (id,organization_id,clinic_id,prescription_id,alert_type,severity,alert_status,title,message,evidence,source_type,source_reference,correlation_id,created_by,updated_by)
values
  ('80000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','drug_interaction','blocking','open','Phase 2 Blocking Alert A','Local tenant-isolation test alert.','{"fixture":"A"}','rule_engine','PHASE2-A','81000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000002','drug_interaction','high','open','Phase 2 Alert B','Local tenant-isolation test alert.','{"fixture":"B"}','rule_engine','PHASE2-B','81000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000003','dose_limit','moderate','open','Phase 2 Alert C','Local tenant-isolation test alert.','{"fixture":"C"}','rule_engine','PHASE2-C','81000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003')
on conflict (id) do update set
  alert_type=excluded.alert_type,
  severity=excluded.severity,
  alert_status=excluded.alert_status,
  title=excluded.title,
  message=excluded.message,
  evidence=excluded.evidence,
  source_type=excluded.source_type,
  source_reference=excluded.source_reference,
  is_active=true,
  deleted_at=null,
  deleted_by=null,
  updated_at=now(),
  updated_by=excluded.updated_by;

insert into public.clinical_documents (id,organization_id,clinic_id,patient_id,visit_id,document_type,document_status,verification_status,source_type,title,description,storage_bucket,storage_path,original_filename,mime_type,file_size_bytes,checksum_sha256,uploaded_by,correlation_id,created_by,updated_by)
values
  ('90000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','claim_evidence','active','unverified','uploaded','Phase 2 Document A','Local tenant-isolation fixture.','patient-documents','10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000001/40000000-0000-0000-0000-000000000001/phase2-a.pdf','phase2-a.pdf','application/pdf',1024,repeat('a',64),'30000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001'),
  ('90000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','claim_evidence','active','unverified','uploaded','Phase 2 Document B','Local tenant-isolation fixture.','patient-documents','10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000002/40000000-0000-0000-0000-000000000002/phase2-b.pdf','phase2-b.pdf','application/pdf',1024,repeat('b',64),'30000000-0000-0000-0000-000000000002','91000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002'),
  ('90000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','claim_evidence','active','unverified','uploaded','Phase 2 Document C','Local tenant-isolation fixture.','patient-documents','10000000-0000-0000-0000-000000000002/20000000-0000-0000-0000-000000000003/40000000-0000-0000-0000-000000000003/phase2-c.pdf','phase2-c.pdf','application/pdf',1024,repeat('c',64),'30000000-0000-0000-0000-000000000003','91000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003')
on conflict (id) do update set
  organization_id=excluded.organization_id,
  clinic_id=excluded.clinic_id,
  patient_id=excluded.patient_id,
  visit_id=excluded.visit_id,
  document_type=excluded.document_type,
  document_status=excluded.document_status,
  verification_status=excluded.verification_status,
  source_type=excluded.source_type,
  title=excluded.title,
  description=excluded.description,
  storage_bucket=excluded.storage_bucket,
  storage_path=excluded.storage_path,
  original_filename=excluded.original_filename,
  mime_type=excluded.mime_type,
  file_size_bytes=excluded.file_size_bytes,
  checksum_sha256=excluded.checksum_sha256,
  uploaded_by=excluded.uploaded_by,
  is_active=true,
  deleted_at=null,
  deleted_by=null,
  updated_at=now(),
  updated_by=excluded.updated_by;

-- 7) Validation

do $$
declare
  users_count integer;
  history_count integer;
  alerts_count integer;
  documents_count integer;
begin
  select count(*) into users_count from public.user_profiles where id::text like '30000000-%';
  select count(*) into history_count from public.visit_status_history where id::text like '70000000-%';
  select count(*) into alerts_count from public.prescription_safety_alerts where id::text like '80000000-%';
  select count(*) into documents_count from public.clinical_documents where id::text like '90000000-%';

  if users_count<>4 or history_count<>3 or alerts_count<>3 or documents_count<>3 then
    raise exception 'Fixture validation failed: users=%, history=%, alerts=%, documents=%', users_count, history_count, alerts_count, documents_count;
  end if;

  raise notice 'PASS: Phase 2 tenant fixtures created (users=%, history=%, alerts=%, documents=%)', users_count, history_count, alerts_count, documents_count;
end
$$;

commit;

