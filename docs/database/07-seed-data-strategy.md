# Seed Data Strategy

## Current State

Existing:
- `supabase/config.toml` enables seed loading from `./seed.sql`.
- Migration `007` seeds permissions, roles, role-permission mappings, and storage buckets.

Gap:
- `supabase/seed.sql` is not present.

## Seed Data Rules

- Fictional data only.
- No real PHI, PII, clinical facts, payer contracts, credentials, tokens, or production identifiers.
- Use deterministic demo organizations, clinics, users, patients, visits, and claims only when needed for local QA.
- Seed role and permission catalogs before assigning users.
- Seed Auth users through approved local Supabase workflows; do not hardcode real passwords in committed SQL.
- Keep seed data small and scenario-focused.

## Recommended Seed Scenarios

Proposed:
- One demo organization with two clinics.
- One organization admin, one clinic admin, one doctor, one nurse, one pharmacist, one claim reviewer, one compliance officer.
- Fictional patients with explicit consent status.
- Visits covering scheduled, in consultation, completed, cancelled, and documentation pending states.
- SOAP notes with draft, reviewed, and amended examples.
- Claim readiness assessments covering ready, needs review, and not ready.
- Evidence packages with draft and approved states.
- Inventory items with near-expiry and low-stock cases.

## Expected Validation

After a future `seed.sql` is added:

```bash
supabase db reset
```

Expected:
- Migrations apply in order.
- Seed completes without PHI.
- Demo users can validate allowed and denied RLS scenarios.
