# Backend API And Service Design Rules

## REST-Like Naming Conventions

- Use nouns for resources: `/api/patients`, `/api/visits`, `/api/claims`, `/api/evidence-packages`.
- Use nested routes only when ownership is meaningful: `/api/claims/[claimId]/readiness`.
- Use command routes sparingly for workflow actions: `/api/claims/[claimId]/submit-for-review`.
- Keep route behavior predictable and idempotent where possible.

## Server Action Conventions

- Name actions by command intent: `saveSoapNoteAction`, `recalculateClaimReadinessAction`.
- Validate inputs inside the action.
- Call domain services for business logic.
- Return response envelopes suitable for frontend state handling.
- Do not expose service-role clients or raw database details.

## Request Validation With Zod

- Define schemas close to the service boundary or shared validation module.
- Validate IDs, enums, dates, strings, arrays, status transitions, and reason fields.
- Use schema refinement for cross-field rules.
- Map validation failures to stable error codes.

## Response Envelope Format

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

## Error Response Format

```json
{
  "success": false,
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Pagination Format

```json
{
  "page": 1,
  "pageSize": 25,
  "total": 100,
  "hasNextPage": true
}
```

## Sorting Format

- Accept explicit allowlisted fields only.
- Use `{ "sortBy": "createdAt", "sortDirection": "desc" }`.
- Reject unknown fields instead of passing them to queries.

## Filtering Format

- Accept allowlisted filters with typed values.
- Validate date ranges, status arrays, role filters, and search text.
- Apply tenant, consent, and permission filters server-side regardless of request filters.

## Permission Guard Format

```ts
{
  actorId: "user-id",
  organizationId: "org-id",
  clinicId: "clinic-id",
  permission: "claim.readiness.recalculate",
  entityType: "claim",
  entityId: "claim-id"
}
```

## Audit Log Trigger Format

- Trigger Name:
- Event Type:
- Entity:
- Actor:
- Reason Required:
- Before Snapshot:
- After Snapshot:
- Transaction Required:

## Optimistic Concurrency Handling

- Use version, `updatedAt`, or explicit revision tokens for editable records.
- Return conflict errors when the submitted version is stale.
- Do not silently overwrite SOAP notes, claim readiness outputs, evidence packages, or reviewer decisions.

## Idempotency Rules

- Use idempotency keys for retryable package generation, exports, external AI calls, and payment/claim-adjacent commands.
- Replaying the same command must not duplicate audit events or generated packages unless versioning requires it.

## AI Output Storage Rules

- Store task type, input references, output schema version, confidence, explanation, disclaimer, timestamp, provider/model metadata when permitted, and human review status.
- Store references to sensitive inputs instead of full PHI where possible.
- Do not treat AI output as final clinical, legal, or claim decision.

## Clinical Disclaimer Handling

- Backend response for clinical AI includes a disclaimer field or disclaimer key.
- Disclaimer states AI assists documentation and review only; authorized clinicians decide.
- Low confidence or high-risk outputs include `requiresHumanReview: true`.

## Insurance Rule Evaluation Response Format

```json
{
  "success": true,
  "data": {
    "readinessScore": 82,
    "riskLevel": "medium",
    "blockingIssues": [],
    "missingEvidence": [],
    "payerWarnings": [],
    "uncertainty": [],
    "requiresReviewerReview": true
  },
  "meta": {
    "calculatedAt": "2026-07-08T00:00:00.000Z",
    "sourceVersion": "v1"
  },
  "error": null
}
```
