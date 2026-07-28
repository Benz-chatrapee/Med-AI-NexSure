begin;

select plan(17);

create or replace function pg_temp.set_auth_user(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end;
$$;

create or replace function pg_temp.reset_auth()
returns void
language plpgsql
as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
end;
$$;

create or replace function pg_temp.try_update_readiness_assessment(p_assessment_id uuid)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  update public.claim_readiness_assessments
  set review_status = 'accepted'
  where id = p_assessment_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function pg_temp.try_delete_readiness_item(p_item_id uuid)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  delete from public.claim_readiness_items
  where id = p_item_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

select lives_ok(
  $$
    insert into public.organizations (id, name, code, is_active, lifecycle_status)
    values
      ('8e000000-0000-4000-8000-000000000001', 'Phase 5 Readiness Alpha', 'P5RLSA', true, 'active'),
      ('8e000000-0000-4000-8000-000000000002', 'Phase 5 Readiness Beta', 'P5RLSB', true, 'active')
    on conflict (id) do update
    set is_active = true,
        lifecycle_status = 'active',
        deleted_at = null;

    insert into public.clinics (id, organization_id, name, code, clinic_type, is_primary, is_active, lifecycle_status)
    values
      ('8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000001', 'Phase 5 Alpha One', 'P5RA1', 'clinic', true, true, 'active'),
      ('8e000000-0000-4000-8000-000000000102', '8e000000-0000-4000-8000-000000000001', 'Phase 5 Alpha Two', 'P5RA2', 'clinic', false, true, 'active'),
      ('8e000000-0000-4000-8000-000000000201', '8e000000-0000-4000-8000-000000000002', 'Phase 5 Beta One', 'P5RB1', 'clinic', true, true, 'active')
    on conflict (id) do update
    set is_active = true,
        lifecycle_status = 'active',
        deleted_at = null;
  $$,
  'tenant and clinic fixtures are created'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '8e000000-0000-4000-8000-000000000301', 'authenticated', 'authenticated', 'p5.readiness.doctor@example.invalid', 'x', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '8e000000-0000-4000-8000-000000000302', 'authenticated', 'authenticated', 'p5.readiness.other-doctor@example.invalid', 'x', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '8e000000-0000-4000-8000-000000000303', 'authenticated', 'authenticated', 'p5.readiness.reviewer@example.invalid', 'x', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.user_profiles (id, organization_id, primary_clinic_id, display_name, email, job_title, department, is_active)
values
  ('8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', 'Phase 5 Readiness Doctor', 'p5.readiness.doctor@example.invalid', 'Doctor', 'Clinical', true),
  ('8e000000-0000-4000-8000-000000000302', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', 'Phase 5 Other Doctor', 'p5.readiness.other-doctor@example.invalid', 'Doctor', 'Clinical', true),
  ('8e000000-0000-4000-8000-000000000303', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', 'Phase 5 Claim Reviewer', 'p5.readiness.reviewer@example.invalid', 'Reviewer', 'Claims', true)
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_profile_id, membership_status, is_active)
values
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000301', 'active', true),
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000302', 'active', true),
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000303', 'active', true)
on conflict (organization_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    is_active = true,
    deleted_at = null;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id, membership_status, is_active)
values
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000301', 'active', true),
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000302', 'active', true),
  ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000303', 'active', true)
on conflict (organization_id, clinic_id, user_profile_id) do update
set membership_status = excluded.membership_status,
    is_active = true,
    deleted_at = null;

insert into public.user_role_assignments (organization_id, clinic_id, user_profile_id, role_id, assignment_status, assignment_reason, assigned_at, is_active)
select v.organization_id, v.clinic_id, v.user_profile_id, r.id, 'active', 'Phase 5 readiness RLS fixture', now(), true
from (
  values
    ('8e000000-0000-4000-8000-000000000001'::uuid, '8e000000-0000-4000-8000-000000000101'::uuid, '8e000000-0000-4000-8000-000000000301'::uuid, 'doctor'::text),
    ('8e000000-0000-4000-8000-000000000001'::uuid, '8e000000-0000-4000-8000-000000000101'::uuid, '8e000000-0000-4000-8000-000000000302'::uuid, 'doctor'::text),
    ('8e000000-0000-4000-8000-000000000001'::uuid, '8e000000-0000-4000-8000-000000000101'::uuid, '8e000000-0000-4000-8000-000000000303'::uuid, 'claim_reviewer'::text)
) as v(organization_id, clinic_id, user_profile_id, role_name)
join public.roles r on r.organization_id is null and r.name = v.role_name
on conflict (organization_id, clinic_id, user_profile_id, role_id) do update
set assignment_status = excluded.assignment_status,
    is_active = true,
    deleted_at = null;

insert into public.patients (id, organization_id, clinic_id, patient_code, display_label, consent_status, is_active)
values
  ('8e000000-0000-4000-8000-000000000401', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', 'P5RLS-A1', 'Phase 5 Alpha Patient One', 'granted', true),
  ('8e000000-0000-4000-8000-000000000402', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000102', 'P5RLS-A2', 'Phase 5 Alpha Patient Two', 'granted', true),
  ('8e000000-0000-4000-8000-000000000403', '8e000000-0000-4000-8000-000000000002', '8e000000-0000-4000-8000-000000000201', 'P5RLS-B1', 'Phase 5 Beta Patient One', 'granted', true)
on conflict (id) do nothing;

insert into public.visits (
  id, organization_id, clinic_id, patient_id, visit_number, department,
  attending_user_id, visit_status, claim_status, started_at, created_by,
  updated_by, is_active, deleted_at
)
values
  ('8e000000-0000-4000-8000-000000000501', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000401', 'P5RLS-V-AUTH', 'Clinical', '8e000000-0000-4000-8000-000000000301', 'in_consultation', 'not_started', now(), '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000502', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000401', 'P5RLS-V-OTHER', 'Clinical', '8e000000-0000-4000-8000-000000000302', 'in_consultation', 'not_started', now(), '8e000000-0000-4000-8000-000000000302', '8e000000-0000-4000-8000-000000000302', true, null),
  ('8e000000-0000-4000-8000-000000000503', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000102', '8e000000-0000-4000-8000-000000000402', 'P5RLS-V-XCLINIC', 'Clinical', '8e000000-0000-4000-8000-000000000301', 'in_consultation', 'not_started', now(), '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000504', '8e000000-0000-4000-8000-000000000002', '8e000000-0000-4000-8000-000000000201', '8e000000-0000-4000-8000-000000000403', 'P5RLS-V-XORG', 'Clinical', '8e000000-0000-4000-8000-000000000301', 'in_consultation', 'not_started', now(), '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000505', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000401', 'P5RLS-V-DELETED', 'Clinical', '8e000000-0000-4000-8000-000000000301', 'in_consultation', 'not_started', now(), '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', false, now())
on conflict (id) do nothing;

insert into public.claim_readiness_assessments (
  id, organization_id, clinic_id, visit_id, assessment_version, total_score,
  readiness_status, review_status, rule_set_version, calculated_by_type,
  calculated_at, is_current, created_by, updated_by, is_active, deleted_at
)
values
  ('8e000000-0000-4000-8000-000000000601', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000501', 1, 90, 'ready', 'pending_review', 'p5-test', 'system', now(), true, '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000602', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000502', 1, 90, 'ready', 'pending_review', 'p5-test', 'system', now(), true, '8e000000-0000-4000-8000-000000000302', '8e000000-0000-4000-8000-000000000302', true, null),
  ('8e000000-0000-4000-8000-000000000603', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000102', '8e000000-0000-4000-8000-000000000503', 1, 90, 'ready', 'pending_review', 'p5-test', 'system', now(), true, '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000604', '8e000000-0000-4000-8000-000000000002', '8e000000-0000-4000-8000-000000000201', '8e000000-0000-4000-8000-000000000504', 1, 90, 'ready', 'pending_review', 'p5-test', 'system', now(), true, '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000605', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000505', 1, 90, 'ready', 'pending_review', 'p5-test', 'system', now(), true, '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', false, now())
on conflict (id) do nothing;

insert into public.claim_readiness_items (
  id, organization_id, clinic_id, assessment_id, dimension_code, weight,
  raw_score, weighted_score, item_status, reason_code, reason_text,
  evidence_reference, created_by, updated_by, is_active, deleted_at
)
values
  ('8e000000-0000-4000-8000-000000000701', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000601', 'soap', 100, 90, 90, 'complete', 'P5_READY', 'Ready fixture', 'test:ready', '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000702', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000602', 'soap', 100, 90, 90, 'complete', 'P5_OTHER', 'Other doctor fixture', 'test:other', '8e000000-0000-4000-8000-000000000302', '8e000000-0000-4000-8000-000000000302', true, null),
  ('8e000000-0000-4000-8000-000000000703', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000102', '8e000000-0000-4000-8000-000000000603', 'soap', 100, 90, 90, 'complete', 'P5_XCLINIC', 'Cross clinic fixture', 'test:xclinic', '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000704', '8e000000-0000-4000-8000-000000000002', '8e000000-0000-4000-8000-000000000201', '8e000000-0000-4000-8000-000000000604', 'soap', 100, 90, 90, 'complete', 'P5_XORG', 'Cross org fixture', 'test:xorg', '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', true, null),
  ('8e000000-0000-4000-8000-000000000705', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000605', 'soap', 100, 90, 90, 'complete', 'P5_DELETED', 'Deleted fixture', 'test:deleted', '8e000000-0000-4000-8000-000000000301', '8e000000-0000-4000-8000-000000000301', false, now())
on conflict (id) do nothing;

select pg_temp.set_auth_user('8e000000-0000-4000-8000-000000000301');
set local role authenticated;

select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000601'), 1, 'doctor with claim.read can select own assigned readiness assessment');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000701'), 1, 'doctor with claim.read can select item through authorized parent assessment visit');
select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000604'), 0, 'doctor with claim.read cannot select cross-organization readiness assessment');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000704'), 0, 'doctor with claim.read cannot select cross-organization readiness item');
select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000603'), 0, 'doctor with claim.read cannot select cross-clinic readiness assessment');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000703'), 0, 'doctor with claim.read cannot select cross-clinic readiness item');
select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000602'), 0, 'doctor with claim.read cannot select unauthorized same-clinic visit assessment by direct ID');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000702'), 0, 'doctor with claim.read cannot select unauthorized same-clinic visit item by direct ID');
select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000605'), 0, 'doctor with claim.read cannot select inactive/deleted readiness assessment');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000705'), 0, 'doctor with claim.read cannot select inactive/deleted readiness item');

select throws_ok(
  $$ insert into public.claim_readiness_assessments (organization_id, clinic_id, visit_id, assessment_version, total_score, readiness_status, review_status, rule_set_version, calculated_by_type)
     values ('8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101', '8e000000-0000-4000-8000-000000000501', 9, 90, 'ready', 'pending_review', 'p5-test', 'system') $$,
  '42501',
  'permission denied for table claim_readiness_assessments',
  'claim.read does not authorize readiness assessment insert'
);

select is(
  pg_temp.try_update_readiness_assessment('8e000000-0000-4000-8000-000000000601'),
  0,
  'claim.read does not authorize readiness assessment update'
);

select throws_ok(
  $$ select pg_temp.try_delete_readiness_item('8e000000-0000-4000-8000-000000000701') $$,
  '42501',
  'permission denied for table claim_readiness_items',
  'claim.read does not authorize readiness item delete'
);

select ok(
  not public.has_permission('claim.view', '8e000000-0000-4000-8000-000000000001', '8e000000-0000-4000-8000-000000000101'),
  'doctor still does not receive claim.view'
);

select pg_temp.reset_auth();
select pg_temp.set_auth_user('8e000000-0000-4000-8000-000000000303');
set local role authenticated;

select is((select count(*)::int from public.claim_readiness_assessments where id = '8e000000-0000-4000-8000-000000000602'), 1, 'claim reviewer claim.view compatibility can select readiness assessment');
select is((select count(*)::int from public.claim_readiness_items where id = '8e000000-0000-4000-8000-000000000702'), 1, 'claim reviewer claim.view compatibility can select readiness item');

select pg_temp.reset_auth();

select * from finish();

rollback;
