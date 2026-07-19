begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'organizations',
        'clinics',
        'user_profiles',
        'roles',
        'permissions',
        'role_permissions',
        'user_roles',
        'organization_memberships',
        'clinic_memberships',
        'user_role_assignments'
      )
      and policyname in (
        'organizations_select_scoped',
        'clinics_select_scoped',
        'user_profiles_select_scoped',
        'user_profiles_update_own',
        'roles_select_scoped',
        'permissions_select_authenticated',
        'role_permissions_select_authenticated',
        'user_roles_select_scoped',
        'user_roles_manage_admin'
      )
  ),
  0,
  'legacy migration 003 policy family is removed from in-scope Core Foundation tables'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organizations'
      and cmd = 'SELECT'
  ),
  1,
  'organizations has one SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinics'
      and cmd = 'SELECT'
  ),
  1,
  'clinics has one SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and cmd = 'SELECT'
  ),
  1,
  'user_profiles has one SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  0,
  'user_profiles has no direct mutation policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and cmd = 'SELECT'
  ),
  1,
  'legacy user_roles has one compatibility SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  0,
  'legacy user_roles has no direct mutation policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and cmd = 'SELECT'
  ),
  1,
  'roles has one SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'permissions'
      and cmd = 'SELECT'
  ),
  1,
  'permissions has one SELECT policy'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_permissions'
      and cmd = 'SELECT'
  ),
  1,
  'role_permissions has one SELECT policy'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organizations'
      and policyname = 'organizations_select_own_scope'
      and qual like '%is_organization_member%'
  ),
  'organizations canonical policy uses hardened membership helper'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinics'
      and policyname = 'clinics_select_authorized_scope'
      and qual like '%has_clinic_access%'
      and qual like '%has_permission%'
  ),
  'clinics canonical policy uses hardened clinic and permission helpers'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'user_profiles_select_self_or_admin'
      and qual like '%auth.uid%'
      and qual like '%has_permission%'
  ),
  'user_profiles canonical policy separates self and scoped admin read'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and policyname = 'user_roles_select_self_or_admin'
      and qual like '%auth.uid%'
      and qual like '%has_permission%'
  ),
  'legacy user_roles compatibility policy is read-only and scoped'
);

select ok(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'organizations',
        'clinics',
        'user_profiles',
        'roles',
        'permissions',
        'role_permissions',
        'user_roles',
        'organization_memberships',
        'clinic_memberships',
        'user_role_assignments'
      )
      and cmd in ('ALL', 'DELETE')
  ),
  'in-scope Core Foundation tables have no ALL or DELETE policies'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organization_memberships'
      and policyname = 'mvp1_memberships_select'
  ),
  'organization_memberships replacement table keeps one scoped SELECT policy'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinic_memberships'
      and policyname = 'mvp1_clinic_memberships_select'
  ),
  'clinic_memberships replacement table keeps one scoped SELECT policy'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_role_assignments'
      and policyname = 'mvp1_role_assignments_select'
  ),
  'user_role_assignments replacement table keeps one scoped SELECT policy'
);

select * from finish();

rollback;
