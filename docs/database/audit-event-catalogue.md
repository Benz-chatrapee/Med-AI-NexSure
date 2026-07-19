# Core Foundation Audit Event Catalogue

## Document Control

Task: DB-P1-CORE-AUDIT-EVENT-IMPLEMENTATION
Status: Existing for Core Foundation Phase 1 lifecycle and controlled role-assignment workflows. Runtime effect: none.

## Scope

This catalogue defines the durable audit events implemented for Core Foundation organization lifecycle, clinic lifecycle, and controlled role-assignment workflows.

Out of scope for this catalogue: Patient, Visit, SOAP, Diagnosis, Prescription, Claim, Evidence, AI, export, break-glass, and storage audit events.

## Runtime Boundary

Core Foundation audit persistence is centralized through `append_core_audit_event(...)`, an internal `SECURITY DEFINER` function with fixed `search_path = public`.

Runtime roles do not receive direct `INSERT`, `UPDATE`, or `DELETE` privileges on `audit_logs`. Controlled workflow functions append events in the same transaction as the protected mutation. If audit append fails, the protected mutation rolls back.

## Implemented Events

| Event type | Resource type | Action | Actor | Scope | Before state | After state | Triggering workflow |
|---|---|---|---|---|---|---|---|
| `organization.lifecycle.suspended` | `organizations` | `update` | authenticated profile id | organization | `lifecycle_status` | `lifecycle_status` | `transition_organization_lifecycle(...)` |
| `organization.lifecycle.reactivated` | `organizations` | `update` | authenticated profile id | organization | `lifecycle_status` | `lifecycle_status` | `transition_organization_lifecycle(...)` |
| `organization.lifecycle.closed` | `organizations` | `update` | authenticated profile id | organization | `lifecycle_status` | `lifecycle_status` | `transition_organization_lifecycle(...)` |
| `organization.lifecycle.archived` | `organizations` | `update` | authenticated profile id | organization | `lifecycle_status` | `lifecycle_status` | `transition_organization_lifecycle(...)` |
| `clinic.lifecycle.suspended` | `clinics` | `update` | authenticated profile id | organization and clinic | `lifecycle_status` | `lifecycle_status` | `transition_clinic_lifecycle(...)` |
| `clinic.lifecycle.reactivated` | `clinics` | `update` | authenticated profile id | organization and clinic | `lifecycle_status` | `lifecycle_status` | `transition_clinic_lifecycle(...)` |
| `clinic.lifecycle.closed` | `clinics` | `update` | authenticated profile id | organization and clinic | `lifecycle_status` | `lifecycle_status` | `transition_clinic_lifecycle(...)` |
| `clinic.lifecycle.archived` | `clinics` | `update` | authenticated profile id | organization and clinic | `lifecycle_status` | `lifecycle_status` | `transition_clinic_lifecycle(...)` |
| `role_assignment.created` | `user_role_assignments` | `permission_change` | authenticated profile id | organization and optional clinic | none | assignment id, target profile, role, scope, status, dates | `assign_role(...)` |
| `role_assignment.revoked` | `user_role_assignments` | `permission_change` | authenticated profile id | organization and optional clinic | assignment id, target profile, role, scope, active status, dates | assignment id, target profile, role, scope, revoked status | `revoke_role_assignment(...)` |

## Required Columns

`audit_logs` now stores both legacy compatibility fields and normalized event fields:

- Legacy compatibility: `action_type`, `target_table`, `target_record_id`, `old_value`, `new_value`, `created_at`.
- Normalized event contract: `event_type`, `occurred_at`, `actor_auth_user_id`, `actor_profile_id`, `resource_type`, `resource_id`, `action`, `before_state`, `after_state`, `metadata`.
- Shared scope: `organization_id`, `clinic_id`, `reason`, `correlation_id`, `outcome`.

## Data Minimization

Audit payload JSON is limited to minimized workflow state. The implemented append boundary rejects prohibited secret-like keys and token-like values in `before_state`, `after_state`, and `metadata`.

Do not place passwords, tokens, API keys, authorization headers, raw clinical documents, unrestricted PHI, service credentials, or full signed clinical content in audit JSON.

## Access Model

| Operation | Runtime role behavior |
|---|---|
| Select audit events | `authenticated` users require scoped `audit.view` through RLS. |
| Append audit events | Internal controlled functions only. |
| Direct insert | Denied to `anon` and `authenticated`. |
| Update/delete | Denied to runtime roles. |
| Internal append helper execution | Not granted to `anon` or `authenticated`. |

## Local Validation

Implemented by `supabase/tests/009_core_foundation_audit_events.sql`.

Validated behavior:

- Organization lifecycle events are persisted with actor, tenant, reason, before state, after state, and success outcome.
- Clinic lifecycle events are persisted with organization and clinic scope.
- Role assignment creation and revocation events are persisted with target profile and role context.
- Direct runtime audit insert, update, and delete are denied.
- Anonymous audit append is denied.
- Scoped `audit.view` users can read only their organization events.
- Audit append failure rolls back the lifecycle or role-assignment mutation.
- Internal append function is `SECURITY DEFINER` with fixed `search_path = public`.
