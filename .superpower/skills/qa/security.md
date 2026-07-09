# Security QA Rules

## Validation Areas
- Authentication.
- Authorization.
- Role-based access control.
- Organization scope.
- Clinic scope.
- Direct URL access.
- API permission.
- Supabase RLS.
- Sensitive data exposure.
- Error message leakage.
- Admin-only actions.
- AI permission control.

## Roles To Validate
- Admin
- Doctor
- Nurse
- Pharmacist
- Clinic Staff
- Clinic Admin / Manager
- Claim Reviewer
- Auditor / Compliance
- Executive

## Required Checks
- Protected routes require authentication.
- Server-side checks enforce role, organization, and clinic scope.
- Direct URLs cannot access unauthorized records.
- APIs reject unauthorized requests.
- Supabase RLS prevents cross-organization and cross-clinic access.
- Error messages do not leak PHI, PII, PDPA protected information, secrets, stack traces, or policy internals.
- AI features are available only to authorized roles and log sensitive actions.
