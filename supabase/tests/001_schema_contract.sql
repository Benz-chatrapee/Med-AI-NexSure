begin;

create extension if not exists pgtap with schema extensions;

select plan(33);

select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'clinics', 'clinics table exists');
select has_table('public', 'user_profiles', 'user_profiles table exists');
select has_table('public', 'organization_memberships', 'organization_memberships table exists');
select has_table('public', 'clinic_memberships', 'clinic_memberships table exists');
select has_table('public', 'user_role_assignments', 'user_role_assignments table exists');
select has_table('public', 'roles', 'roles table exists');
select has_table('public', 'permissions', 'permissions table exists');
select has_table('public', 'role_permissions', 'role_permissions table exists');
select has_table('public', 'patients', 'patients table exists');
select has_table('public', 'visits', 'visits table exists');
select has_table('public', 'audit_logs', 'audit_logs table exists');

select ok(
  exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'current_user_profile_id'),
  'current_user_profile_id helper exists'
);
select ok(
  exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'is_organization_member'),
  'is_organization_member helper exists'
);
select ok(
  exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'has_clinic_access'),
  'has_clinic_access helper exists'
);
select ok(
  exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'has_permission'),
  'has_permission helper exists'
);

select ok(
  exists (
    select 1
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('current_user_profile_id', 'is_organization_member', 'has_clinic_access', 'has_permission')
      and p.prosecdef
    having count(*) = 4
  ),
  'standard auth helpers are security definer'
);

select ok(
  exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'has_permission'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ),
  'authenticated can execute has_permission'
);

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in ('current_user_profile_id', 'is_organization_member', 'has_clinic_access', 'has_permission')
      and grantee in ('PUBLIC', 'anon')
  ),
  'standard auth helpers are not executable by PUBLIC or anon'
);

select ok(
  not exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and grantee = 'anon'
      and table_name in (
        'organizations', 'clinics', 'user_profiles', 'patients', 'visits',
        'soap_notes', 'prescriptions', 'audit_logs', 'user_role_assignments'
      )
  ),
  'anon has no direct privileges on core protected tables'
);

select ok(
  not exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and grantee = 'authenticated'
      and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES', 'DELETE')
      and table_name in (
        'organizations', 'clinics', 'user_profiles', 'patients', 'visits',
        'soap_notes', 'prescriptions', 'audit_logs', 'user_role_assignments',
        'roles', 'permissions', 'role_permissions', 'user_roles'
      )
  ),
  'authenticated has no unsafe direct table privileges on protected tables'
);

select ok(
  exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'patients'
      and grantee = 'authenticated'
      and privilege_type in ('SELECT', 'INSERT', 'UPDATE')
    having count(*) = 3
  ),
  'authenticated has approved patient DML grants needed to reach RLS'
);

select ok(
  not exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and grantee = 'authenticated'
      and table_name in ('roles', 'permissions', 'role_permissions', 'user_roles', 'user_role_assignments')
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
  ),
  'authenticated cannot directly mutate role and permission catalogues'
);

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in (
        'current_user_profile',
        'current_user_organization_id',
        'current_user_clinic_ids',
        'current_user_has_role',
        'current_user_has_permission',
        'current_user_profile_id',
        'is_organization_member',
        'has_clinic_access',
        'has_permission'
      )
      and grantee in ('PUBLIC', 'anon')
  ),
  'PUBLIC and anon cannot execute any Core authorization helper'
);

select ok(
  exists (
    select 1
    from pg_default_acl da
    join pg_namespace n on n.oid = da.defaclnamespace
    where n.nspname = 'public'
  ),
  'public schema has explicit default privileges for future objects'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'organizations', 'clinics', 'user_profiles', 'patients', 'visits',
        'soap_notes', 'prescriptions', 'audit_logs', 'organization_memberships',
        'clinic_memberships', 'user_role_assignments'
      )
      and c.relrowsecurity
    having count(*) = 11
  ),
  'RLS is enabled on core tenant, clinical, audit, and RBAC tables'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'mvp1_patients_select'
  ),
  'patients select policy exists'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and policyname = 'mvp1_patients_insert'
  ),
  'patients insert policy exists'
);
select ok(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'mvp1_audit_logs_insert'
  ),
  'audit log direct insert policy is removed'
);

select ok(
  exists (select 1 from public.permissions where permission_key = 'patient.view'),
  'canonical dot permission patient.view exists'
);
select ok(
  exists (select 1 from public.permissions where permission_key = 'patient:read'),
  'legacy colon permission patient:read still exists for compatibility review'
);
select ok(
  exists (select 1 from public.roles where organization_id is null and name = 'doctor'),
  'canonical doctor role exists'
);
select ok(
  exists (select 1 from public.roles where organization_id is null and name = 'Doctor'),
  'legacy Doctor role still exists for compatibility review'
);

select * from finish();

rollback;
