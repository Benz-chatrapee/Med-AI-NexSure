# Database Testing and QA Checklist

## Current State

Existing:
- Supabase migrations are present.
- `supabase/config.toml` enables migrations and seed loading.

Gaps:
- `supabase/tests/` is not present.
- `supabase/seed.sql` is not present even though config references it.

## Local Validation Commands

Run from repository root.

```bash
supabase --version
```

Expected:
- Supabase CLI version prints successfully.

```bash
supabase start
```

Expected:
- Local Supabase services start.
- Database, API, Auth, Studio, and Storage endpoints are printed.

```bash
supabase db reset
```

Expected:
- Migrations `001` through `007` apply in order.
- Current gap: command may fail or warn because `supabase/seed.sql` is configured but missing. If so, either add approved fictional seed data or temporarily disable seed in local-only validation after review.

```bash
supabase migration list
```

Expected:
- Local migration list shows applied migration files in order.

```bash
supabase db diff --local
```

Expected:
- No unexpected schema drift after reset.

## SQL QA Checklist

Schema:
- All required tables exist.
- All primary keys are UUID.
- Business identifiers are not primary keys.
- Tenant tables have `organization_id`.
- Clinic-scoped tables have `clinic_id`.
- Mutable regulated tables have soft-delete columns.

RLS:
- RLS is enabled for patient, clinical, prescription, claim, evidence, settings, RBAC, membership, and audit tables.
- Authenticated user from organization A cannot read organization B data.
- User with clinic A access cannot read clinic B patient/visit/claim rows.
- User without permission cannot mutate patient, visit, SOAP, prescription, inventory, claim, settings, or RBAC rows.

RBAC:
- Roles and permissions seed correctly.
- Role assignments honor active/suspended/revoked status.
- Expired assignments do not grant access.
- Administrative permissions do not imply clinical acceptance authority unless explicitly granted.

Clinical safety:
- AI SOAP or diagnosis output cannot be treated as final without human acceptance fields.
- Claim readiness status matches score constraints.
- Prescription dispensed quantity cannot exceed prescribed quantity.

Audit:
- Sensitive mutations write audit events in future live repositories.
- Audit logs cannot be read by unauthorized users.
- Audit JSON excludes passwords, tokens, secrets, and unnecessary PHI.

Storage:
- Buckets are private.
- Object download requires authorization.
- Signed URLs are short-lived.
- Object paths include tenant/clinic scope.

## Recommended Future SQL Tests

Proposed test files:
- `supabase/tests/rls_organization_isolation.sql`
- `supabase/tests/rls_clinic_isolation.sql`
- `supabase/tests/rbac_permission_matrix.sql`
- `supabase/tests/claim_readiness_constraints.sql`
- `supabase/tests/audit_access.sql`
- `supabase/tests/storage_policy_access.sql`

Do not add these tests without a separate implementation task because the current request is documentation-only.
