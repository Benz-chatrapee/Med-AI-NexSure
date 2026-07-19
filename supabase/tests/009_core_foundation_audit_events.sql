begin;

create extension if not exists pgtap with schema extensions;

select plan(37);

insert into public.organizations (
  id, name, legal_name, registration_number, country_code, timezone, code, organization_type, locale, is_active, lifecycle_status
)
values
  ('00000000-0000-4000-8000-000000002101', 'Audit Alpha Hospital', 'Audit Alpha Hospital Co., Ltd.', 'TEST-AUDIT-ALPHA', 'TH', 'Asia/Bangkok', 'AUDIT_ALPHA', 'healthcare_provider', 'en-TH', true, 'active'),
  ('00000000-0000-4000-8000-000000002102', 'Audit Beta Clinic', 'Audit Beta Clinic Co., Ltd.', 'TEST-AUDIT-BETA', 'TH', 'Asia/Bangkok', 'AUDIT_BETA', 'healthcare_provider', 'th-TH', true, 'active')
on conflict (id) do nothing;

insert into public.clinics (id, organization_id, name, code, clinic_type, is_primary, is_active, lifecycle_status)
values
  ('00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002101', 'Audit Alpha Main Clinic', 'AUDIT_ALPHA_MAIN', 'hospital', true, true, 'active'),
  ('00000000-0000-4000-8000-000000002202', '00000000-0000-4000-8000-000000002102', 'Audit Beta Main Clinic', 'AUDIT_BETA_MAIN', 'clinic', true, true, 'active')
on conflict (id) do nothing;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
)
values
  ('00000000-0000-4000-8000-000000002301', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'audit.alpha.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000002302', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'audit.alpha.target@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000002303', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'audit.alpha.auditor@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000002304', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'audit.platform.admin@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false),
  ('00000000-0000-4000-8000-000000002305', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'audit.normal.user@example.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false)
on conflict (id) do nothing;

insert into public.user_profiles (id, organization_id, primary_clinic_id, display_name, email, job_title, department)
values
  ('00000000-0000-4000-8000-000000002301', '00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', 'Audit Alpha Admin', 'audit.alpha.admin@example.invalid', 'Admin', 'Operations'),
  ('00000000-0000-4000-8000-000000002302', '00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', 'Audit Alpha Target', 'audit.alpha.target@example.invalid', 'Doctor', 'Clinical'),
  ('00000000-0000-4000-8000-000000002303', '00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', 'Audit Alpha Auditor', 'audit.alpha.auditor@example.invalid', 'Auditor', 'Compliance'),
  ('00000000-0000-4000-8000-000000002304', '00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', 'Audit Platform Admin', 'audit.platform.admin@example.invalid', 'Platform', 'Operations'),
  ('00000000-0000-4000-8000-000000002305', '00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', 'Audit Normal User', 'audit.normal.user@example.invalid', 'Doctor', 'Clinical')
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002301', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002302', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002303', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002304', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002305', 'active')
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status)
values
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002301', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002302', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002303', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002304', 'active'),
  ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002305', 'active')
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    deleted_at = null,
    is_active = true;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id)
select v.organization_id, v.clinic_id, v.user_profile_id, r.id
from (
  values
    ('00000000-0000-4000-8000-000000002101'::uuid, null::uuid, '00000000-0000-4000-8000-000000002301'::uuid, 'organization_admin'::text),
    ('00000000-0000-4000-8000-000000002101'::uuid, null::uuid, '00000000-0000-4000-8000-000000002303'::uuid, 'auditor'::text),
    ('00000000-0000-4000-8000-000000002101'::uuid, null::uuid, '00000000-0000-4000-8000-000000002304'::uuid, 'platform_admin'::text),
    ('00000000-0000-4000-8000-000000002101'::uuid, '00000000-0000-4000-8000-000000002201'::uuid, '00000000-0000-4000-8000-000000002305'::uuid, 'doctor'::text)
) as v(organization_id, clinic_id, user_profile_id, role_name)
join public.roles r on r.organization_id is null and r.name = v.role_name
on conflict do nothing;

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'event_type'
  ),
  'audit_logs has event_type column'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'actor_auth_user_id'
  ),
  'audit_logs has actor_auth_user_id column'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'metadata'
  ),
  'audit_logs has metadata column'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000002101'::uuid, 'suspended', 'Audit suspension reason') $$,
  'authorized organization lifecycle transition creates audited mutation'
);

reset role;

select is(
  (select count(*)::integer from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  1,
  'organization lifecycle transition creates one audit event'
);
select is(
  (select actor_profile_id from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  '00000000-0000-4000-8000-000000002301'::uuid,
  'organization lifecycle audit actor profile is recorded'
);
select is(
  (select organization_id from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  '00000000-0000-4000-8000-000000002101'::uuid,
  'organization lifecycle audit tenant is recorded'
);
select is(
  (select old_value ->> 'lifecycle_status' from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  'active',
  'organization lifecycle audit records before status'
);
select is(
  (select new_value ->> 'lifecycle_status' from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  'suspended',
  'organization lifecycle audit records after status'
);
select is(
  (select reason from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  'Audit suspension reason',
  'organization lifecycle audit reason is recorded'
);
select is(
  (select outcome from public.audit_logs where event_type = 'organization.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002101'),
  'success',
  'organization lifecycle audit outcome is success'
);

update public.organizations
set lifecycle_status = 'active',
    is_active = true
where id = '00000000-0000-4000-8000-000000002101';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.transition_clinic_lifecycle('00000000-0000-4000-8000-000000002201'::uuid, 'suspended', 'Audit clinic suspension') $$,
  'authorized clinic lifecycle transition creates audited mutation'
);

reset role;
select is(
  (select event_type from public.audit_logs where event_type = 'clinic.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002201'),
  'clinic.lifecycle.suspended',
  'clinic lifecycle audit event type is recorded'
);
select is(
  (select clinic_id from public.audit_logs where event_type = 'clinic.lifecycle.suspended' and target_record_id = '00000000-0000-4000-8000-000000002201'),
  '00000000-0000-4000-8000-000000002201'::uuid,
  'clinic lifecycle audit clinic scope is recorded'
);

update public.clinics
set lifecycle_status = 'active',
    is_active = true
where id = '00000000-0000-4000-8000-000000002201';

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000002302'::uuid, '00000000-0000-4000-8000-000000002101'::uuid, null::uuid, (select id from public.roles where name = 'compliance_officer' and organization_id is null), now(), null::timestamptz, 'Audit role assignment') $$,
  'role assignment workflow creates audited mutation'
);

reset role;
select is(
  (select count(*)::integer from public.audit_logs where event_type = 'role_assignment.created' and organization_id = '00000000-0000-4000-8000-000000002101'),
  1,
  'role assignment creates one audit event'
);
select is(
  (select new_value ->> 'target_profile_id' from public.audit_logs where event_type = 'role_assignment.created' and organization_id = '00000000-0000-4000-8000-000000002101'),
  '00000000-0000-4000-8000-000000002302',
  'role assignment audit records target profile id'
);
select is(
  (select new_value ->> 'role_name' from public.audit_logs where event_type = 'role_assignment.created' and organization_id = '00000000-0000-4000-8000-000000002101'),
  'compliance_officer',
  'role assignment audit records role name'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$ select public.revoke_role_assignment((select id from public.user_role_assignments where user_profile_id = '00000000-0000-4000-8000-000000002302' and role_id = (select id from public.roles where name = 'compliance_officer' and organization_id is null)), 'Audit role revocation') $$,
  'role revocation workflow creates audited mutation'
);

reset role;
select is(
  (select count(*)::integer from public.audit_logs where event_type = 'role_assignment.revoked' and organization_id = '00000000-0000-4000-8000-000000002101'),
  1,
  'role revocation creates one audit event'
);
select is(
  (select old_value ->> 'assignment_status' from public.audit_logs where event_type = 'role_assignment.revoked' and organization_id = '00000000-0000-4000-8000-000000002101'),
  'active',
  'role revocation audit records old status'
);
select is(
  (select new_value ->> 'assignment_status' from public.audit_logs where event_type = 'role_assignment.revoked' and organization_id = '00000000-0000-4000-8000-000000002101'),
  'revoked',
  'role revocation audit records new status'
);

select throws_ok(
  $$ select public.append_core_audit_event('role_assignment.created', 'success', '00000000-0000-4000-8000-000000002301'::uuid, '00000000-0000-4000-8000-000000002101'::uuid, null::uuid, 'user_role_assignments', gen_random_uuid(), 'permission_change', 'Bad metadata', null::jsonb, '{}'::jsonb, '{"password":"nope"}'::jsonb, null::text) $$,
  '23514',
  null,
  'prohibited metadata key is rejected'
);
select throws_ok(
  $$ select public.append_core_audit_event('role_assignment.created', 'success', '00000000-0000-4000-8000-000000002301'::uuid, '00000000-0000-4000-8000-000000002101'::uuid, null::uuid, 'user_role_assignments', gen_random_uuid(), 'permission_change', 'Bad token', null::jsonb, '{}'::jsonb, '{"note":"bearer abc"}'::jsonb, null::text) $$,
  '23514',
  null,
  'token-like metadata values are rejected'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002305', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ insert into public.audit_logs (organization_id, actor_user_id, action_type, target_table, outcome) values ('00000000-0000-4000-8000-000000002101', '00000000-0000-4000-8000-000000002305', 'update', 'organizations', 'success') $$,
  '42501',
  'permission denied for table audit_logs',
  'normal authenticated user cannot insert audit logs directly'
);
select throws_ok(
  $$ update public.audit_logs set reason = 'tampered' where organization_id = '00000000-0000-4000-8000-000000002101' $$,
  '42501',
  'permission denied for table audit_logs',
  'normal authenticated user cannot update audit logs'
);
select throws_ok(
  $$ delete from public.audit_logs where organization_id = '00000000-0000-4000-8000-000000002101' $$,
  '42501',
  'permission denied for table audit_logs',
  'normal authenticated user cannot delete audit logs'
);
select is(
  (select count(*)::integer from public.audit_logs),
  0,
  'normal user without audit.view cannot read raw audit events'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select throws_ok(
  $$ select public.append_core_audit_event('role_assignment.created', 'success', null::uuid, null::uuid, null::uuid, 'x', null::uuid, 'permission_change', 'anon', null::jsonb, '{}'::jsonb, '{}'::jsonb, null::text) $$,
  '42501',
  'permission denied for function append_core_audit_event',
  'anon cannot execute internal audit append function'
);
select throws_ok(
  $$ insert into public.audit_logs (organization_id, action_type, target_table, outcome) values ('00000000-0000-4000-8000-000000002101', 'update', 'organizations', 'success') $$,
  '42501',
  'permission denied for table audit_logs',
  'anon cannot insert audit logs'
);

reset role;
select public.append_core_audit_event(
  'organization.lifecycle.suspended',
  'success',
  '00000000-0000-4000-8000-000000002304',
  '00000000-0000-4000-8000-000000002102',
  null,
  'organizations',
  '00000000-0000-4000-8000-000000002102',
  'update',
  'Synthetic beta event',
  '{"lifecycle_status":"active"}',
  '{"lifecycle_status":"suspended"}',
  '{}',
  null
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002303', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is(
  (select count(*)::integer from public.audit_logs where organization_id = '00000000-0000-4000-8000-000000002101'),
  4,
  'organization auditor can read own organization audit events'
);
select is(
  (select count(*)::integer from public.audit_logs where organization_id = '00000000-0000-4000-8000-000000002102'),
  0,
  'organization auditor cannot read another organization audit events'
);

reset role;
select set_config('app.audit_force_failure', 'on', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002304', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.transition_organization_lifecycle('00000000-0000-4000-8000-000000002102'::uuid, 'suspended', 'Forced audit failure') $$,
  '23514',
  null,
  'lifecycle mutation rolls back when audit append fails'
);
reset role;
select is(
  (select lifecycle_status from public.organizations where id = '00000000-0000-4000-8000-000000002102'),
  'active',
  'organization lifecycle remains unchanged after audit failure'
);

select set_config('app.audit_force_failure', 'on', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002301', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select throws_ok(
  $$ select public.assign_role('00000000-0000-4000-8000-000000002302'::uuid, '00000000-0000-4000-8000-000000002101'::uuid, '00000000-0000-4000-8000-000000002201'::uuid, (select id from public.roles where name = 'doctor' and organization_id is null), now(), null::timestamptz, 'Forced role audit failure') $$,
  '23514',
  null,
  'role assignment rolls back when audit append fails'
);
reset role;
select is(
  (select count(*)::integer from public.user_role_assignments where user_profile_id = '00000000-0000-4000-8000-000000002302' and clinic_id = '00000000-0000-4000-8000-000000002201' and role_id = (select id from public.roles where name = 'doctor' and organization_id is null)),
  0,
  'role assignment row is absent after audit failure rollback'
);

select ok(
  exists (
    select 1
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname = 'append_core_audit_event'
      and p.prosecdef
      and p.proconfig @> array['search_path=public']
  ),
  'internal audit append function is security definer with fixed public search_path'
);

select * from finish();

rollback;
