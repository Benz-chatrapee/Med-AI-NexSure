# Security Review

## Review Summary

The schema is directionally strong for a healthcare and insurance platform: UUID keys, tenant scope, RLS, RBAC, audit logging, soft deletes, AI acceptance checks, and private storage buckets are present. The main risks are policy/model drift, missing executable RLS tests, missing storage object policies, and app modules still using mock repositories rather than live server-side authorization paths.

## Strengths

- `user_profiles.id` anchors to Supabase Auth.
- Tenant and clinic scope are represented on sensitive tables.
- RLS is enabled on core sensitive objects.
- Audit logs include actor, scope, action, target, reason, request metadata, outcome, and timestamp.
- Claim readiness score/status constraints prevent inconsistent readiness status.
- AI SOAP and diagnosis acceptance constraints require human acceptance fields for accepted/reviewed AI output.
- Private buckets are created for documents, evidence, certificates, organization assets, and integrations.
- Browser Supabase usage found uses anon key and Auth client behavior, not service role.

## Risks and Gaps

High:
- PostgreSQL version mismatch: project standard says 16; local Supabase config says 17.
- No `supabase/tests/` for RLS and authorization regression.
- Storage buckets have no object policy definitions in migrations.
- RBAC assignment and permission naming are split across old and new models.

Medium:
- Mock-backed application modules may hide authorization gaps until live queries are introduced.
- Audit log insertion policy allows authenticated scoped inserts; future live services should control event shape.
- Clinical documents, certificates, visit status history, and prescription safety alerts are product concepts without normalized tables.

Low:
- Broad authenticated reads of some catalogs may be acceptable but should be explicitly approved.
- Seed is enabled, but seed file is missing.

## Required Controls Before Production Data

- Align PostgreSQL version.
- Add RLS SQL tests and run them in CI.
- Implement private storage object policies.
- Canonicalize RBAC assignment and permission key strategy.
- Add server-side repositories or route handlers that derive tenant scope from Auth, never from client-provided organization or clinic IDs alone.
- Add audit write helpers with strict minimization.
- Add backup, restore, and retention runbooks.

## Data Protection Classification

PHI:
- patient identity, demographics, consent, visits, vitals, SOAP content, diagnoses, prescriptions, clinical documents.

Financial/Insurance:
- claim readiness, payer name, evidence package status, claim-related settings.

Credential/Security:
- Auth identity, security settings, role assignments, integration configuration references.

Audit:
- audit logs, version records, actor columns, correlation metadata.

## Human-in-the-Loop Controls

Existing:
- AI SOAP and diagnosis metadata include acceptance fields.
- Claim readiness requires review status and is not claim approval.

Required future controls:
- Durable override reason for AI, claim, prescription, and evidence decisions.
- Clinical signing and amendment workflow.
- Prescription safety alert acknowledgement and override workflow.
- Evidence package approval workflow before external claim submission.
