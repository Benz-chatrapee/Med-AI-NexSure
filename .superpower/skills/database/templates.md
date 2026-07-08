# Database Templates

## Table Design Template

- Table Name:
- Purpose:
- Owner Domain:
- Tenant Scope:
- Columns:
- Primary Key:
- Foreign Keys:
- Constraints:
- Indexes:
- RLS Policies:
- Audit Events:
- Retention/Archive Rule:

## SQL Migration Template

- Migration Name:
- Purpose:
- Up Changes:
- Data Backfill:
- Constraint Enforcement:
- RLS Changes:
- Index Changes:
- Verification Query:
- Rollback Note:
- Risk:

## RLS Policy Template

- Table:
- Policy Name:
- Operation:
- Roles:
- Tenant Scope:
- Permission Requirement:
- Consent Requirement:
- Using Expression:
- With Check Expression:
- Tests:

## Index Template

- Index Name:
- Table:
- Columns:
- Type:
- Query Supported:
- Cardinality:
- Write Impact:
- Migration Safety:

## Constraint Template

- Constraint Name:
- Table:
- Type:
- Columns:
- Rule:
- Existing Data Check:
- Error Impact:

## View Template

- View Name:
- Purpose:
- Source Tables:
- Columns:
- Filters:
- Security/RLS Consideration:
- Refresh Strategy:
- Indexing Needs:

## Audit Log Table Template

- Table Name:
- Event Types:
- Actor Reference:
- Entity Reference:
- Reason:
- Before:
- After:
- Source:
- Correlation ID:
- Retention:

## Trigger Template

- Trigger Name:
- Table:
- Timing:
- Event:
- Function:
- Purpose:
- Safety Notes:
- Audit Impact:

## Seed Data Template

- Seed Name:
- Environment:
- Tables:
- Data Classification:
- PHI/PII Present:
- Idempotency:
- Rollback:

## Rollback Note Template

- Migration:
- Rollback Strategy:
- Data Loss Risk:
- Backup Required:
- Manual Steps:
- Verification:

## Data Dictionary Template

- Table:
- Column:
- Type:
- Nullable:
- Description:
- Source:
- Sensitive:
- Retention:
- Example:

## Entity Relationship Template

- Entity:
- Related Entity:
- Relationship:
- Cardinality:
- Foreign Key:
- Delete Behavior:
- Notes:
