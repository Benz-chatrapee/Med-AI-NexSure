# RBAC and RLS Security Design

## Security Objectives

- Default-deny access to tenant data.
- Organization isolation must not trust frontend tenant context.
- Clinic access is narrower than organization access.
- Administrative authority is not clinical authority.
- AI, clinical, prescription, and claim decisions require human review.
- Service-role credentials must not be used in normal browser flows.

## Current RBAC Model

Existing:
- `roles`: organization-scoped or system roles.
- `permissions`: stable permission keys and domains.
- `role_permissions`: grants permissions to roles.
- `user_roles`: legacy user-role assignment, scoped to organization and optional clinic.
- `user_role_assignments`: newer role assignment with assignment status, assigned actor, expiry, and soft delete.
- `organization_memberships` and `clinic_memberships`: membership scope.

Compatibility Sensitive:
- Migration `003` helper functions use `user_roles`.
- Migration `007` helper functions use `organization_memberships`, `clinic_memberships`, and `user_role_assignments`.
- Permission keys include colon style such as `patient:read` and dot style such as `patient.view`.

## Current RLS Helpers

Existing from migration `003`:
- `current_user_profile()`
- `current_user_organization_id()`
- `current_user_clinic_ids()`
- `current_user_has_role(role_name text)`
- `current_user_has_permission(permission_key text)`

Existing from migration `007`:
- `current_user_profile_id()`
- `is_organization_member(uuid)`
- `has_clinic_access(uuid, uuid)`
- `has_permission(text, uuid, uuid)`

## Current Policy Coverage

RLS is enabled on:
- Core tenant and clinical tables.
- RBAC tables.
- Membership and organization settings tables.
- Claim readiness and evidence package tables.
- Audit logs.

Policy themes:
- Organization and clinic rows are selected only when membership or permissions allow.
- Patient, visit, SOAP, diagnosis, prescription, inventory, claim, and evidence access is scoped by organization and clinic.
- Audit logs are readable by audit-authorized users and insertable by authenticated users within scope.
- Some catalogs are broadly readable by authenticated users: `permissions`, `role_permissions`, diagnosis catalog, module/event/provider catalogs.

## Current Gaps

- No local SQL tests for deny-by-default, cross-tenant denial, or cross-clinic denial.
- Private storage buckets exist, but object-level storage policies are not implemented in migrations.
- No explicit account-enumeration protection documentation for auth operations beyond UI behavior.
- No server-side live repository currently enforces permission checks for most feature workflows because many modules use mock data.
- Mixed RBAC models can create policy drift.

## Required Security Controls for Future Live Data Access

- Server actions and route handlers must verify authenticated user and derive tenant scope server-side.
- Browser code may use anon key only and must rely on RLS.
- Service role must be server-only and reserved for administrative maintenance, never normal user flows.
- Every clinical, claim, document, and prescription mutation must include audit context.
- Storage object paths should include organization and clinic scope and be validated against database membership.
- Signed URLs should be short-lived and generated only after authorization.

## Review Required Decisions

1. Canonical RBAC table: `user_roles` or `user_role_assignments`.
2. Canonical permission key format.
3. Storage policy design for `storage.objects`.
4. Whether catalog reads such as `permissions` and `role_permissions` should remain broad.
5. Required MFA/session controls for privileged roles.
