# Database Workflows

## Convert Requirement To Data Model

1. Identify domain, entities, relationships, lifecycle states, and tenant scope.
2. Identify PHI/PII, consent, audit, retention, and reporting needs.
3. Define tables, keys, constraints, indexes, RLS, and migration approach.
4. Return risks, assumptions, missing information, confidence, and handoff.

## Convert User Story To Schema Changes

1. Parse actor, action, data created/read/updated, and acceptance criteria.
2. Map fields to existing or new entities.
3. Define schema delta, validation constraints, RLS, indexes, and audit events.
4. Identify Backend and QA dependencies.

## Create Migration Workflow

1. Name migration by timestamp and purpose.
2. Apply schema changes additively where possible.
3. Backfill data separately when risky.
4. Add constraints after data compatibility is confirmed.
5. Add verification and rollback notes.

## Create Secure Table Workflow

1. Define table, columns, keys, timestamps, lifecycle, and tenant scope.
2. Add constraints and indexes.
3. Enable RLS.
4. Add policies for select, insert, update, and archive/delete where applicable.
5. Add audit hooks or audit event expectations.

## Create RLS Policy Workflow

1. Identify table sensitivity and access patterns.
2. Define actor role, organization, clinic, ownership, permission, and consent requirements.
3. Write operation-specific policies.
4. Test allowed and denied paths.
5. Coordinate service-role exceptions with Backend and Compliance.

## Create Audit Log Workflow

1. Identify material actions.
2. Define audit table fields and sensitive metadata rules.
3. Link actor, entity, source, correlation ID, before, after, reason, and outcome.
4. Keep audit records immutable.
5. Define indexes for investigation queries.

## Create Dashboard View Workflow

1. Identify KPI, timeframe, filters, and role scope.
2. Select source tables and aggregation rules.
3. Define secure view or materialized view strategy.
4. Add indexes or refresh strategy if needed.
5. Document freshness and limitations.

## Create Claim Readiness Schema Workflow

1. Model readiness assessment versions.
2. Model readiness items, blockers, missing evidence, payer warnings, and risk levels.
3. Link claim, visit, SOAP, diagnosis, evidence, payer rules, reviewer, and audit events.
4. Preserve decision-support boundary.

## Create Evidence Package Schema Workflow

1. Model package version, status, owner, source claim, and generated metadata.
2. Model package items with source entity, evidence type, status, and traceability.
3. Preserve missing, stale, conflicting, and restricted evidence states.
4. Audit creation, update, export, and reviewer handoff.

## Create Rollback-Safe Migration Workflow

1. Avoid destructive changes where possible.
2. Add new columns/tables first.
3. Backfill safely.
4. Switch application reads/writes.
5. Enforce constraints after verification.
6. Document rollback and data loss risk.

## Database Handoff Workflow

1. Return schema, relationships, RLS, constraints, indexes, views, audit, migrations, and tests.
2. List Backend, Frontend, QA, Compliance, Clinical AI, and Insurance AI dependencies.
3. State risks, assumptions, missing information, confidence, and next action.
