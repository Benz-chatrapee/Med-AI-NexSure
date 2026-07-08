# Backend Checklists

## API Readiness Checklist

- Endpoint or Server Action purpose is clear.
- Request and response schemas are defined.
- Response envelope is consistent.
- Authentication, authorization, and tenant scope are enforced.
- Error codes and audit events are defined.

## Service Logic Checklist

- Business logic is inside a domain service.
- Repository and adapter responsibilities are separated.
- Inputs and outputs are typed.
- Side effects are explicit.
- Domain invariants and status transitions are validated.

## Validation Checklist

- All browser input is treated as untrusted.
- Zod schemas validate IDs, enums, dates, text, and reason fields.
- Cross-field and status-transition rules are covered.
- Server validation aligns with frontend validation but does not rely on it.
- Sensitive values are sanitized before logging.

## RBAC Checklist

- Actor identity is verified.
- Organization, clinic, role, permission, ownership, and entity scope are checked.
- PDPA consent scope is checked where patient data is used.
- Deny-by-default behavior is defined.
- Database RLS expectations are coordinated with Database Agent.

## Audit Logging Checklist

- Important mutation has event type, actor, timestamp, reason, before, after, source, and outcome.
- Audit write is part of the transaction when required.
- AI output acceptance, rejection, override, and dismissal are auditable.
- Claim readiness and evidence package changes are traceable.
- Logs do not expose PHI, PII, secrets, or raw errors.

## Error Handling Checklist

- Validation, authorization, not found, conflict, dependency, AI unavailable, and system errors are distinct.
- Human-readable messages are safe and non-sensitive.
- Error details are role-safe.
- Correlation ID is included.
- Retry guidance is only offered when safe.

## Transaction Checklist

- Multi-step material changes run atomically.
- Version checks or optimistic concurrency are defined.
- Idempotency is used for retryable commands.
- Rollback behavior is known.
- Audit timing is explicit.

## Healthcare Safety Checklist

- Patient data access is scoped and consent-aware.
- SOAP, diagnosis, ICD, prescription, allergy, and certificate workflows preserve clinician authority.
- Clinical AI is decision support only.
- Unsupported medical facts or ICD codes are rejected.
- Clinical audit trail events are defined.

## Insurance Rule Checklist

- Claim readiness is advisory.
- Evidence completeness is traceable.
- Payer rule source and uncertainty are represented.
- Reviewer authority is preserved.
- No automatic claim approval or rejection exists.

## AI Integration Checklist

- AI task and adapter boundary are explicit.
- Input references are traceable.
- Output schema, confidence, explanation, disclaimer, and human review rule are defined.
- Low-confidence and high-risk outputs require escalation.
- AI outputs do not directly finalize records.

## Test Readiness Checklist

- Unit tests cover validation and service rules.
- Permission tests cover allowed and denied roles.
- Transaction tests cover partial failure.
- Audit tests verify event contents.
- Healthcare, insurance, and AI safety edge cases are covered.

## Code Review Checklist

- Business logic is not duplicated.
- Secrets and service-role clients are not exposed.
- Error handling is stable and safe.
- Audit and RBAC are present for important actions.
- Transaction and concurrency risks are addressed.
- Documentation and handoff are updated.
