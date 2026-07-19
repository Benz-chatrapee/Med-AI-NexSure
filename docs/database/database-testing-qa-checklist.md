# Database Testing and QA Checklist

## 1. Document Control
Status: Populated for DB-DOC-BATCH-7-ARCHITECTURE. Commands listed here are planned validation methods unless explicitly reported as executed in a task report.

## 2. Purpose
Defines release-readiness checks for database documentation, migrations, schema, security, clinical safety, insurance readiness, evidence, audit, storage, performance, backup, restore, and application compatibility.

## 3. Canonical Statuses
Checklist statuses: `not_started`, `in_progress`, `passed`, `failed`, `blocked`, `not_applicable`, `review_required`. Never mark passed without evidence.

## 4. Safe Local Commands
| Command | Purpose | Expected result | Status |
|---|---|---|---|
| `npx supabase status` | Confirm local Supabase state | Services listed or clear stopped state | not_started |
| `npx supabase migration list` | Check migration visibility | Migrations listed in order | not_started |
| `npx supabase db reset` | Rebuild local database | Migrations apply; seed handling reviewed | not_started |
| `npx supabase db lint` | Static DB lint | No blocking lint findings | not_started |
| `git diff --check` | Whitespace/syntax hygiene | No whitespace errors | not_started |
| `git status --short` | Git hygiene | Only intended files changed | not_started |
| `npm run lint` | App lint when app code changes | Successful lint | not_applicable for docs-only |
| `npx tsc --noEmit` | TypeScript validation | Successful typecheck | not_applicable for docs-only |
| `npm run build` | Build validation | Successful build | not_applicable for docs-only |

## 5. Release Checklist
| check_id | category | check | expected evidence | command or validation method | owner | reviewer | status | severity if failed | blocking | related document | requirement ID | Review Required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DBQA-001 | Documentation | Required docs exist and non-empty | File list and sizes | `Get-ChildItem docs/database` | QA | Database | not_started | high | yes | README | DOC-01 | no |
| DBQA-002 | Naming | Names follow conventions | Naming review | Markdown review | Database | Security | not_started | medium | yes | database-naming-convention.md | NAM-01 | no |
| DBQA-003 | Architecture Consistency | ERDs match migrations | ERD review | compare to migrations | Solution Architect | Database | not_started | high | yes | erd-overview.md | ARCH-01 | no |
| DBQA-004 | Migration Safety | Migrations apply in order | reset log | `npx supabase db reset` | Database | QA | not_started | critical | yes | migration-strategy.md | MIG-01 | yes |
| DBQA-005 | Schema | Tables/enums/functions exist | schema introspection | psql information_schema queries | Database | QA | not_started | critical | yes | data-dictionary.md | SCH-01 | no |
| DBQA-006 | Columns and Types | Existing columns match dictionary | column report | information_schema.columns | Database | BA | not_started | high | yes | data-dictionary.md | SCH-02 | no |
| DBQA-007 | Primary Keys | UUID PKs present | PK query results | pg_catalog constraints | Database | QA | not_started | critical | yes | core-foundation-spec.md | PK-01 | no |
| DBQA-008 | Foreign Keys | Required FKs exist | FK report | pg_constraint query | Database | QA | not_started | critical | yes | erd-overview.md | FK-01 | no |
| DBQA-009 | Tenant-safe Composite Keys | Tenant-safe FKs validated | composite FK report | pg_constraint query | Database | Security | review_required | critical | yes | organization-clinic-spec.md | TEN-01 | yes |
| DBQA-010 | Unique Constraints | Business uniqueness present | uniqueness report | pg_constraint query | Database | QA | not_started | high | yes | data-dictionary.md | UQ-01 | no |
| DBQA-011 | Check Constraints | Status/range checks present | check report | pg_constraint query | Database | QA | not_started | high | yes | data-dictionary.md | CK-01 | no |
| DBQA-012 | Indexes | Existing indexes match inventory | index report | pg_indexes query | Database | QA | not_started | medium | no | performance-index-design.md | IDX-01 | no |
| DBQA-013 | Soft Delete | Regulated tables have soft delete | column report | information_schema | Database | Security | not_started | high | yes | clinical-data-governance.md | DEL-01 | yes |
| DBQA-014 | State Machines | Status values align to docs | enum/check review | compare enum/checks to record-state-machines.md | QA | Database | review_required | high | yes | record-state-machines.md | STA-01 | yes |
| DBQA-015 | RBAC | Role mappings enforce least privilege | role/permission matrix | SQL role tests | Security | QA | not_started | critical | yes | core-foundation-permission-matrix.md | RBAC-01 | yes |
| DBQA-016 | Permission Catalogue | No wildcard/mixed new keys | permission query | select permissions | Security | Database | review_required | high | yes | core-foundation-permission-matrix.md | PERM-01 | yes |
| DBQA-017 | Role Delegation | Admin does not imply clinical authority | negative test | RLS/RBAC scenario tests | Security | Clinical | review_required | critical | yes | rbac-design.md | RBAC-02 | yes |
| DBQA-018 | Professional Credential Readiness | Credential enforcement plan exists | docs and future tests | doc review | Clinical | Security | review_required | critical | yes | record-state-machines.md | CRED-01 | yes |
| DBQA-019 | RLS | Cross-tenant access denied | positive/negative SQL tests | authenticated test users, not service_role | Security | QA | not_started | critical | yes | rls-policy-design.md | RLS-01 | yes |
| DBQA-020 | SQL Grants | Function/table grants correct | grant report | information_schema.role_table_grants | Database | Security | not_started | critical | yes | core-foundation-security-model.md | GRANT-01 | yes |
| DBQA-021 | SECURITY DEFINER | Functions are reviewed | function list | pg_proc query | Security | Database | not_started | high | yes | core-foundation-security-model.md | FUNC-01 | no |
| DBQA-022 | Dynamic SQL | Dynamic SQL is justified | function review | code review of migrations | Security | Database | not_started | high | yes | migration-strategy.md | FUNC-02 | no |
| DBQA-023 | Seed Data | Fictional seed only | seed review | inspect `supabase/seed.sql` if present | QA | Security | review_required | high | yes | seed-data-strategy.md | SEED-01 | yes |
| DBQA-024 | Patient | Patient PHI scoped | RLS and constraint tests | SQL tests | QA | Security | not_started | critical | yes | patient-data-model.md | PAT-01 | no |
| DBQA-025 | Visit | Visit lifecycle protected | status tests | SQL tests | QA | Clinical | not_started | high | yes | visit-status-workflow.md | VIS-01 | yes |
| DBQA-026 | SOAP | Signed record rules planned/tested | state/version tests | SQL and workflow tests | QA | Clinical | review_required | critical | yes | soap-clinical-model.md | SOAP-01 | yes |
| DBQA-027 | Diagnosis and ICD | Diagnosis/code histories separated | version tests | planned SQL tests | QA | Clinical | review_required | critical | yes | diagnosis-icd-model.md | DX-01 | yes |
| DBQA-028 | Prescription and Inventory | Dispensing and stock atomicity | transaction tests | planned SQL tests | QA | Pharmacy | review_required | critical | yes | prescription-medication-model.md | RX-01 | yes |
| DBQA-029 | Medical Certificate | Issued cert immutable | future tests | planned SQL tests | QA | Security | review_required | critical | yes | medical-certificate-model.md | MC-01 | yes |
| DBQA-030 | Insurance and Claim Readiness | Readiness is advisory | constraint/RLS tests | SQL tests | QA | Insurance | not_started | high | yes | claim-readiness-model.md | CLAIM-01 | no |
| DBQA-031 | Evidence Package | Packages preserve versions | version/storage tests | SQL/storage tests | QA | Security | review_required | high | yes | evidence-document-model.md | EVID-01 | yes |
| DBQA-032 | Audit and Versioning | Audit distinct from versions | audit/version tests | SQL tests | QA | Security | review_required | critical | yes | audit-versioning-strategy.md | AUD-01 | yes |
| DBQA-033 | AI Governance | AI advisory only | AI acceptance tests | SQL/workflow tests | QA | Clinical | review_required | critical | yes | ai-clinical-governance.md | AI-01 | yes |
| DBQA-034 | Storage | Buckets private and policies tested | storage policy results | storage API tests | QA | Security | review_required | critical | yes | storage-file-security.md | STOR-01 | yes |
| DBQA-035 | Integration | Integrations do not store secrets | config review | schema/app review | Security | QA | review_required | high | yes | integration docs | INT-01 | yes |
| DBQA-036 | Performance | Query plans preserve RLS | EXPLAIN evidence | `EXPLAIN (ANALYZE, BUFFERS)` locally | Database | QA | not_started | medium | no | performance-index-design.md | PERF-01 | yes |
| DBQA-037 | Concurrency | No duplicate numbers/versions | concurrent tests | pgbench or scripted tests | QA | Database | review_required | high | yes | migration-strategy.md | CONC-01 | yes |
| DBQA-038 | Idempotency | Retries do not duplicate writes | idempotency tests | API/SQL tests | QA | Security | review_required | high | yes | evidence-document-model.md | IDEMP-01 | yes |
| DBQA-039 | Data Quality | Required constraints block invalid data | negative tests | SQL tests | QA | Database | not_started | high | yes | data-dictionary.md | DQ-01 | no |
| DBQA-040 | Observability | Audit/slow-query evidence captured | logs/report | local or provider reports | QA | Security | review_required | medium | no | audit-versioning-strategy.md | OBS-01 | yes |
| DBQA-041 | Backup | Backup evidence captured | backup job evidence | provider/local command evidence | Ops | Security | review_required | critical | yes | backup-restore-strategy.md | BAK-01 | yes |
| DBQA-042 | Restore | Restore is tested | restore validation packet | isolated restore drill | Ops | QA | review_required | critical | yes | backup-restore-strategy.md | RES-01 | yes |
| DBQA-043 | Environment Separation | No prod secrets/test PHI | env review | config and secret scan | Security | QA | not_started | critical | yes | 13-security-review.md | ENV-01 | yes |
| DBQA-044 | TypeScript and Generated Types | Types match schema | generated type diff | `npx supabase gen types typescript --local` then review | Frontend | Database | not_started | high | yes | data-dictionary.md | TYPE-01 | yes |
| DBQA-045 | Application Build | App compiles when contracts change | build output | `npm run build` | Frontend | QA | not_applicable | high | yes if app changed | AGENTS.md | APP-01 | no |
| DBQA-046 | Git Hygiene | Only intended files changed | git status | `git status --short`, `git diff --check` | QA | Owner | not_started | medium | yes | AGENTS.md | GIT-01 | no |
| DBQA-047 | Release Sign-off | Owners approve release | signed checklist | release review meeting/evidence | Product | Security | not_started | critical | yes | this document | REL-01 | yes |

## 6. Notes
`service_role` must not be used to prove normal-user RLS. Backup success does not prove restore success. Build success does not prove authorization correctness. Performance work cannot bypass security.

## Phase 1 Core Foundation Regression Evidence

Task: DB-P1-FULL-CORE-FOUNDATION-REGRESSION

Executed local commands:

| Check | Evidence | Result |
|---|---|---|
| Git status | `git status --short` executed before regression; existing Phase 1 files were modified/untracked from prior tasks. | Informational |
| Local status | `npx supabase status` requested but rejected by approval review due potential local secret-bearing output. | Documented limitation |
| Migration list | `npx supabase migration list --local` listed `001` through `013`. | Passed |
| DB lint | `npx supabase db lint --local` reported no schema errors. | Passed |
| Local reset | `npx supabase db reset --local` applied migrations `001` through `013` and seeded `supabase/seed.sql`. | Passed |
| DB tests | `npx supabase test db supabase/tests --local` reported 9 files, 229 tests, all successful. | Passed |
| Type generation | `npx supabase gen types typescript --local` generated local types in `lib/database.types.ts`; lifecycle, assignment, audit, and RPC fields were verified. | Passed |
| App lint | `npm run lint` exited 0. | Passed |
| TypeScript | `npx tsc --noEmit` exited 0. | Passed |
| Build | `npm run build` exited 0. | Passed |

QA finding classification:

| Severity | Finding | Blocking |
|---|---|---|
| Informational | UI integration for Core Foundation lifecycle, controlled role assignment, and audit remains mock/static or not wired to RPC/query flows. | No |
| Informational | Local Supabase status command was blocked by approval policy because it can reveal local URLs/keys. | No |

Release recommendation:

READY WITH NON-BLOCKING FOLLOW-UP for Phase 1 Core Foundation database regression.
