# Med AI NexSure — Backend Rules

## Purpose

Backend rules for **Med AI NexSure**, an enterprise healthcare and insurance intelligence platform.

Priority: **patient safety, privacy, tenant isolation, auditability, claim readiness, and minimal safe changes**.

AI is **decision support only**. It must not autonomously diagnose, prescribe, approve medication, approve/reject claims, determine coverage, or finalize regulated decisions.

## Core Rules

- Follow `AGENTS.md` and existing repository patterns first.
- Use the existing stack only: Next.js App Router, TypeScript Strict Mode, Supabase Auth, PostgreSQL, RLS, Zod, and existing AI/integration abstractions.
- Reuse existing routes, services, schemas, types, repositories, tables, policies, and utilities.
- Make the smallest safe change; do not modify unrelated behavior.
- Keep business rules server-side, typed, validated, tenant-aware, versioned, and auditable.
- Never trust client-provided tenant, clinic, role, ownership, permission, score, status, price, or calculated result.
- Deny access by default and preserve finalized clinical, claim, consent, evidence, AI, and audit history.

## Architecture

```text
Route Handler / Server Action
→ Auth + Permission + Tenant Scope
→ Zod Validation
→ Application Service
→ Domain Policy
→ Repository / Adapter
→ Database / External Service
→ Audit + Observability
```

- Route handlers parse, validate, authorize, call one use case, and map responses.
- Application services coordinate workflows, transactions, repositories, and integrations.
- Domain policies contain pure, testable rules with reasons and evidence.
- Repositories encapsulate queries and tenant scope.
- Adapters isolate AI, payer, hospital, storage, document, and messaging providers.
- Prefer feature ownership under `features/<domain>/server`.

## API and Validation

- Validate route params, query, body, form data, file metadata, environment variables, and external responses.
- Use stable error codes, safe messages, UUIDs, and ISO 8601 UTC timestamps where compatible.
- Never expose raw SQL errors, stack traces, secrets, service credentials, or unnecessary internal identifiers.
- Enforce pagination and maximum limits on list endpoints.
- Use idempotency for retryable operations such as visit creation, AI runs, claim evaluation, evidence generation, exports, and webhooks.
- Use transactions and optimistic concurrency when data must remain consistent.

## Authentication, RBAC, Tenancy, and RLS

Every protected operation must:

1. Resolve authenticated user and active profile.
2. Resolve organization and clinic scope from trusted server data.
3. Verify account status, permission, role, and resource scope.
4. Execute within tenant boundaries.
5. Audit sensitive access or changes.

Typical roles: Admin, Doctor, Nurse, Pharmacist, Clinic Staff, Clinic Manager, Claim Reviewer, Auditor/Compliance, Executive.

- Prefer granular permissions such as `patient.read`, `soap.sign`, `claim_readiness.override`, `evidence_package.generate`, `audit.read`, and `payer_rule.manage`.
- Enable RLS on tenant-owned and sensitive tables.
- Separate read, insert, update, and delete policies.
- Backend authorization does not replace RLS; RLS does not replace backend authorization.
- Do not use service-role access in normal user-facing flows. Isolate and audit approved privileged operations.

## Database and Record Integrity

- Use version-controlled migrations; never edit an applied production migration.
- Prefer additive and backward-compatible changes.
- Use explicit foreign keys, constraints, indexes from verified query patterns, UUIDs, `timestamptz`, and `numeric/decimal` for money.
- Use JSONB only for validated metadata, immutable snapshots, or structured AI output.
- Do not hard-delete finalized clinical, claim, consent, evidence, or audit records.
- Store author/reviewer, timestamps, versions, previous state, amendment reason, and rule/model version where relevant.
- Backfill large datasets in controlled batches and verify RLS, constraints, indexes, and generated types.

Core domains include patients, consents, visits, SOAP, diagnoses, prescriptions, medical certificates, claim readiness, evidence packages, payer rules, economic data, AI runs/feedback, users/roles, and audit/access logs.

## Clinical and Workflow Safety

- Distinguish draft, reviewed, signed, amended, voided, and finalized states.
- Never silently overwrite finalized records.
- Keep AI-generated content separate from human-authored content.
- Require human confirmation before AI output enters an official record.
- Define valid state transitions server-side and audit actor, old state, new state, time, and reason.

Default visit flow:

```text
Waiting → In Consultation → Pharmacy → Completed
        → Claim Readiness → Audit Log
```

Additional states may include `Pending Evidence`, `Claim Review`, and `Cancelled`.

## Claim, Evidence, Prescription, and Payer Rules

### Claim Readiness

Advisory only; never present it as insurer approval.

```text
SOAP 25% | Diagnosis/ICD 20% | Prescription/Procedure 15%
Evidence 20% | Insurance Rules 10% | Economic 10%

Ready 85–100 | Needs Review 60–84 | Not Ready 0–59
```

- Calculate from trusted server-side records.
- Store total, component scores, reasons, missing evidence, source versions, and scoring version.
- Authorized overrides require justification and must preserve original and overridden results.

### Evidence Package

May include SOAP, diagnosis/ICD, prescription/treatment, medical certificate, attachments, claim summary, economic summary, and audit summary.

- Generate from authorized server data.
- Store immutable, versioned snapshots with included items and source versions.
- Never overwrite a finalized package; create a new version.
- Audit generation, view, download, export, and sharing.

### Prescription Safety

Check allergies, interactions, duplicate therapy, dose, contraindications, and pharmacist-review requirements.

```text
Safe | Warning | Critical
```

Critical results require authorized human review and justification. AI alone must never approve medication safety.

### Payer and Economic Rules

- Version required evidence, ICD rules, waiting periods, exclusions, benefit limits, coverage indicators, cost thresholds, and risk matrices.
- Apply rules by effective date and store the exact version used.
- Coverage indicators are advisory only.
- Store currency explicitly, use decimal calculations, version benchmarks, and explain outliers.
- High cost alone is not fraud and must not trigger adverse action without evidence and human review.

## AI Governance

```text
Authorization → Data Minimization → Versioned Prompt
→ Model Gateway → Schema Validation → Safety Checks
→ Persistence → Human Review → Audit
```

- Minimize PHI/PII sent to external providers.
- Never send secrets, credentials, or unnecessary identifiers.
- Validate structured output with Zod; reject malformed or unsupported output.
- Separate extracted facts, generated text, and inferred suggestions.
- Store model, model version, prompt version, parameters, latency, token usage, confidence, source references, and status.
- Support bounded timeout, retry, fallback, and explicit failure states.
- Require acceptance/rejection before applying AI suggestions to official records.
- Test normal, incomplete, ambiguous, and adversarial inputs.
- Model or prompt changes require controlled rollout and safety, quality, latency, and cost review.

## Audit, PDPA, and Security

Audit sensitive authentication, patient access, consent, clinical amendments, medication decisions, claim assessments, evidence usage, payer-rule changes, role changes, AI runs/reviews, exports, and sharing.

Audit records must be append-only and include enough context to reconstruct the action:

```text
actor | role | tenant | action | resource | before/after
reason | requestId | timestamp
```

- Never log passwords, tokens, secrets, or unnecessary full clinical content.
- Use correlation/request IDs across API, database, AI, integration, and audit events.
- Collect and process only necessary data for a defined purpose.
- Track consent type, version, status, timestamp, and actor.
- Enforce retention, correction, restriction, export, archive, and deletion workflows without violating medical, insurance, legal, or audit retention.
- Use parameterized queries, approved secret storage, secure sessions/cookies, rate limits, signed time-limited file URLs, and upload validation.
- Protect against broken access control, SQL injection, XSS, CSRF, SSRF, path traversal, insecure uploads, and webhook spoofing.

## Testing and Change Workflow

Before editing:

1. Read `AGENTS.md`, this file, and relevant feature rules.
2. Inspect current routes, schemas, services, repositories, migrations, RLS, and tests.
3. Trace authentication, tenant scope, workflow, audit, and AI safety impact.
4. Define the smallest safe change.

Required tests:

- Unit: policies, scoring, transitions, permissions, validation.
- Integration: repositories, transactions, constraints, RLS, APIs, adapters.
- End-to-end: clinical workflow, claim readiness, evidence package, override, audit, and cross-tenant denial.

Always test invalid input, unauthorized roles, cross-tenant access, duplicates, concurrency conflicts, missing evidence, AI timeout/invalid output, and critical medication alerts.

Run repository scripts such as:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
```

Do not claim validation passed unless it was actually executed successfully.

## Prohibited

Do not:

- Disable or bypass authentication, authorization, RLS, audit, validation, or safety controls.
- Allow AI to finalize clinical, medication, claim, fraud, or coverage decisions.
- Present AI output as human-authored or claim readiness as approval.
- Trust client-calculated scores, statuses, prices, permissions, or tenant scope.
- Expose service-role credentials to browser code.
- Hard-delete or overwrite finalized regulated records.
- Store money as floating point.
- Log secrets or unnecessary sensitive data.
- Create duplicate APIs, services, schemas, tables, or rule implementations.
- Change scoring weights, payer rules, workflow states, or contracts without explicit requirements.
- Bypass failing tests or modify unrelated files.

## Definition of Done

A backend task is complete when:

- Requested behavior works with minimal unrelated change.
- Inputs, outputs, and external responses are validated.
- Business rules execute server-side.
- Auth, permissions, tenant isolation, and RLS are enforced.
- Sensitive actions are audited and PDPA/security requirements are met.
- AI remains advisory, traceable, validated, and human-reviewed.
- Success, failure, permission, tenant, and edge cases are tested.
- Required checks, migrations, generated types, and backward compatibility are verified.
- The final report states actual changes, validation results, assumptions, and remaining risks.

> Secure, tenant-aware, auditable, human-supervised healthcare and insurance backend changes only.