# Executive Dashboard Backend MVP 1

## Summary

The Executive Dashboard backend provides synthetic, decision-support-only data for executive operations, claim readiness, economic intelligence, missing evidence, risk and compliance, AI recommendations, recent activity, and case worklists.

No PHI, PII, Supabase queries, real clinical decisions, claim approvals, claim denials, prescriptions, diagnoses, or final financial decisions are implemented.

## Service Architecture

- API route: `app/api/executive-dashboard/route.ts`
- Service: `features/executive-dashboard/server/service.ts`
- Repository: `features/executive-dashboard/server/mock-repository.ts`
- RBAC: `features/executive-dashboard/server/rbac.ts`
- Identity: `features/executive-dashboard/server/identity.ts`
- Audit adapter: `features/executive-dashboard/server/audit.ts`
- Domain types: `features/executive-dashboard/domain/types.ts`
- Domain rules: `features/executive-dashboard/domain/rules.ts`
- Validation: `features/executive-dashboard/domain/validation.ts`

## Repository Architecture

The MVP repository is an in-memory synthetic mock repository. It returns safe visit IDs, clinic labels, organization labels, payer names, readiness scores, evidence counts, economic estimates, alerts, recommendations, and timeline events.

The repository does not connect to Supabase or any external clinical, insurance, or financial source.

## Type Definitions

The backend defines:

- `ExecutiveDashboardSummary`
- `ExecutiveKPI`
- `QueueSnapshot`
- `ClaimReadinessSummary`
- `EconomicSummary`
- `MissingEvidenceSummary`
- `ComplianceAlert`
- `ActivityItem`
- `CaseWorklistItem`

Supporting types include filters, RBAC actor, permissions, response envelope, risk levels, claim status, evidence categories, AI recommendations, and audit actions.

## Validation Rules

Validated filters:

- `organizationId`
- `clinicId`
- `department`
- `payer`
- `riskLevel`
- `claimStatus`
- `dateFrom`
- `dateTo`

Invalid enum values return `VALIDATION_ERROR`. Invalid date ranges are rejected. Browser input is treated as untrusted.

## RBAC

Supported roles:

- Executive
- Clinic Manager
- Auditor
- Claim Reviewer
- Admin

The MVP mock actor is scoped to `org-nexsure-demo` and authorized clinic IDs. Service logic verifies permission and tenant scope server-side before returning dashboard data.

## Audit Events

Documented and implemented MVP audit events:

- Dashboard Viewed
- Filters Applied

Documented for next workflow phase:

- Export Requested
- Detail Viewed

Audit records include action, actor, organization, clinic, reason, before, after, timestamp, and correlation ID.

## API Contract

Endpoint:

```http
GET /api/executive-dashboard
```

Optional query parameters:

```text
organizationId
clinicId
department
payer
riskLevel
claimStatus
dateFrom
dateTo
```

Success envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "correlationId": "exec-dashboard-...",
    "generatedAt": "2026-07-09T00:00:00.000Z"
  },
  "error": null
}
```

Error envelope:

```json
{
  "success": false,
  "data": null,
  "meta": {
    "correlationId": "exec-dashboard-...",
    "generatedAt": "2026-07-09T00:00:00.000Z"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payer filter."
  }
}
```

## Security Notes

- No PHI or PII is returned.
- No secrets are logged or exposed.
- Actor permissions and tenant scope are checked server-side.
- Error messages are safe and non-sensitive.
- Synthetic data is explicitly marked in the response.

## Compliance Notes

- AI recommendations are decision support only.
- Economic metrics are estimates only.
- Claim readiness does not approve or deny claims.
- Clinical signals do not diagnose or prescribe.
- Durable audit persistence is required before production use.

## Verification Steps

Run:

```bash
npm run lint
npm run build
```

