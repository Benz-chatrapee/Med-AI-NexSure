# Seed Data Strategy

Source of truth: completed Core Foundation documents, `supabase/config.toml`, and migrations `002` and `007`.

## Existing Implementation

Existing seed behavior:
- `supabase/config.toml` has seed loading enabled and references `./seed.sql`.
- `supabase/seed.sql` is not present.
- Migration `002` seeds colon-format permissions, title-case roles, and role-permission mappings.
- Migration `007` seeds dot-format permissions, snake-case roles, role-permission mappings, system modules, notification event types, integration providers, and private storage buckets.

### Seeded Permission Families

| Migration | Permission style | Role style |
| --- | --- | --- |
| `002_rbac.sql` | colon keys, for example `patient:read` | title case, for example `Claim Reviewer` |
| `007_rbac_helpers_policies_indexes_seed.sql` | dot keys, for example `patient.view` | snake case, for example `claim_reviewer` |

### Seeded Non-RBAC Catalogs

Migration `007` seeds:
- `system_modules`: `clinical_documentation`, `claim_readiness`, `evidence_packages`, `inventory`, `audit_compliance`
- `notification_event_types`: `claim.needs_review`, `evidence.incomplete`, `inventory.low_stock`, `audit.security_event`
- `integration_providers`: `supabase_storage`, `payer_api_generic`, `webhook_generic`
- private storage buckets: `organization-assets`, `patient-documents`, `evidence-files`, `medical-certificates`, `integration-files`

## Identified Gaps

- The configured `supabase/seed.sql` file is missing.
- No repeatable fictional actor seed exists for RLS tests.
- No safe fixture set exists for patients, visits, SOAP notes, claim readiness, or evidence packages.
- Seeded RBAC generations coexist, so test fixtures must choose which permission family they are validating.
- There is no documented local seed reset verification result.

## Proposed Design

Proposed `seed.sql` content, if approved in a future task:
- Fictional organization and two fictional clinics.
- Fictional Supabase Auth-linked users created through an approved local workflow.
- Organization and clinic memberships for each fixture user.
- Role assignments using the selected canonical RBAC model.
- Fictional patients with safe labels and consent states.
- Fictional visits with non-real clinical text.
- SOAP notes and versions containing synthetic text only.
- Diagnosis examples using demo codes only if clearly marked fictional.
- Claim readiness examples covering `ready`, `needs_review`, and `not_ready`.
- Evidence package rows without real documents or PHI-bearing storage objects.

Seed rules:
- No real PHI, PII, clinical facts, payer contracts, credentials, tokens, or production identifiers.
- Use deterministic business identifiers for tests, but do not use `MAX()+1`.
- Keep seed data small, focused, and safe to reset.
- Separate reference seed data from test fixture data when possible.

Related references:
- [Core Foundation Permission Matrix](core-foundation-permission-matrix.md)
- [Core Foundation Test Plan](core-foundation-test-plan.md)
