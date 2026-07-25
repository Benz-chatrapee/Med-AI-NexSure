# PHASE 5 — BATCH D FINAL REGRESSION AND CLOSURE READINESS

Read and follow:

docs/application/PHASE-5-BATCH-D-CONTRACT.md

Proceed only if:

record_state: APPROVED_CONTRACT
contract_status: APPROVED
implementation_authorization: YES
blocking_decisions: 0

Create or update only:

docs/application/PHASE-5-VALIDATION-AND-CLOSURE-READINESS-REPORT.md

Do not modify application code, tests, SQL, migrations, generated types, package files, Batch A–C contracts, or closure records.

## Required Validation

Run the exact Batch A tests:

npx vitest run 
features/patient-claims/server/claim-mappers.test.ts 
features/patient-claims/server/claim-query-service.test.ts 
features/patient-claims/server/claim-workflow-command-service.test.ts 
features/patient-claims/utils/patient-claims-utils.test.ts

Run the exact Batch B and C tests:

npx vitest run 
features/visit-list/visit-list-readiness.test.ts 
features/executive-dashboard/domain/rules.test.ts 
features/executive-dashboard/domain/validation.test.ts 
features/executive-dashboard/server/mock-repository.test.ts 
features/departments/schemas/department.schema.test.ts 
features/departments/utils/department-formatters.test.ts 
features/payer-rules/components/payer-detail-status-reconciliation.test.ts

Run full regression:

npx vitest run

Run repository validation:

npx tsc --noEmit
npm run lint
npm run build

Run semantic scan:

Get-ChildItem `
  .\features\patient-claims,`
.\features\visit-list,`
  .\features\executive-dashboard,`
.\features\departments,`  .\features\payer-rules`
-Recurse -File |
Select-String -Pattern '\bclaimStatus\b|All Claim Statuses|Claim status|Claim Status'

Classify every match as:

* authoritative prohibited use
* explicit compatibility presentation
* unrelated rule/config status
* documentation or test evidence

Do not require a globally empty result if a match is legitimate and explicitly classified.

Run Git validation:

git diff --check
git diff --stat
git diff --name-only
git status --short
git log -10 --oneline

## Required Report Content

The report must include:

1. Document Control
2. Validation Baseline
3. Repository and Commit Evidence
4. Batch A Validation
5. Batch B Validation
6. Batch C Validation
7. Full Regression Result
8. TypeScript Result
9. Lint Result
10. Production Build Result
11. Semantic Scan Findings
12. Security and Tenant Review
13. Scope Compliance
14. Remaining Risks
15. Closure Recommendation
16. Final Decision Summary

Use only:

READY
CONDITIONAL
NOT_READY

Do not claim PASS for commands not executed successfully.

## Constraints

Do not:

* modify application code
* modify tests
* modify SQL or migrations
* modify generated types
* modify package files
* repair failures outside this Contract
* create the formal Phase 5 Closure Record
* commit or push

If validation fails, record the exact failure and set the recommendation to CONDITIONAL or NOT_READY.

## Final Response

Report:

* exact file changed
* exact validation results
* semantic scan findings
* remaining blockers
* closure recommendation
* whether Phase 5 formal closure is authorized
