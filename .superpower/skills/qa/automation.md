# QA Automation

## Unit Test Naming Convention

Use `should_<expected_behavior>_when_<condition>` for domain logic tests.

## Integration Test Naming Convention

Use `<workflow>.<integration_point>.spec.ts` for workflow integration tests.

## E2E Test Naming Convention

Use `<role>-<workflow>.e2e.ts` for Playwright flows.

## Mock Data Strategy

- Use synthetic patient, visit, payer, and claim data only.
- Do not use PHI, PII, secrets, passwords, or real payer policies.
- Include stable IDs for traceability.
- Include rule version for payer rule mocks.

## Claim Readiness Test Data

- Complete OPD claim.
- Missing medical certificate.
- Missing ICD.
- Cost above threshold.
- Policy exclusion or rule conflict.

## Payer Rule Mock

- Required Evidence Rule.
- ICD Requirement Rule.
- Coverage Rule.
- Cost Threshold Rule.
- Manual Review Trigger Rule.
- Rule version: `MVP-2026-07-09`.

## Edge Case Test Data

- Empty evidence list.
- Unknown payer rule.
- Conflicting diagnosis and ICD.
- Expired attachment.
- Unauthorized role.
- Audit persistence failure.

## Regression Test Set

- Claim readiness thresholds.
- Evidence package status.
- Payer rule pass/review/fail/unknown.
- RBAC/RLS access control.
- Audit event creation.
- AI output safety guardrails.

## CI Quality Gate

- Lint must pass.
- Typecheck should run when script exists.
- Unit/integration/E2E tests should run when scripts exist.
- Critical and P1 release blockers must be resolved or explicitly accepted by authorized human owner.

## Recommended Frameworks

- Unit: Vitest.
- Component: React Testing Library.
- E2E: Playwright.
- API: Supertest or native test client.
- Schema validation: Zod test.
- DB/RLS test: Supabase test strategy.
