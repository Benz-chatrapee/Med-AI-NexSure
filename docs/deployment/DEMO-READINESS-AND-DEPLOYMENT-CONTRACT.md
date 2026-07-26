---
document_id: DEMO-READINESS-AND-DEPLOYMENT-CONTRACT
project: Med AI NexSure
document_type: DEMO_READINESS_AND_DEPLOYMENT
record_state: READY_FOR_REVIEW
contract_status: PROPOSED
demo_status: NOT_STARTED
deployment_status: NOT_STARTED
deployment_authorization: NO
domain_authorization: NO
production_data_authorization: NO
created_date: 2026-07-25
repository_branch: main
phase_5_closure_commit: 0636eaf
blocking_decisions: 6
---

# Demo Readiness and Deployment Contract

## 1. Document Control

| Field | Value |
| --- | --- |
| Project | Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform |
| Document | Demo Readiness and Deployment Contract |
| File | `docs/deployment/DEMO-READINESS-AND-DEPLOYMENT-CONTRACT.md` |
| Record state | `READY_FOR_REVIEW` |
| Contract status | `PROPOSED` |
| Demo status | `NOT_STARTED` |
| Deployment status | `NOT_STARTED` |
| Deployment authorization | `NO` |
| Domain authorization | `NO` |
| Production data authorization | `NO` |
| Created date | `2026-07-25` |
| Repository branch | `main` |
| Phase 5 closure commit | `0636eaf` |
| Blocking decisions | `6` |

## 2. Contract Decision

```text
Record State: READY FOR REVIEW
Contract Status: PROPOSED
Demo Status: NOT STARTED
Deployment Status: NOT STARTED
Deployment Authorization: NO
Domain Authorization: NO
Production Data Authorization: NO
Blocking Decisions: 6
```

This Contract defines the evidence, security, validation, deployment, domain, and rollback gates required before Med AI NexSure may be used as a public competition demo.

This document does not authorize deployment, DNS changes, production migrations, production data loading, or public access.

## 3. Purpose

The purpose of this Contract is to prepare a stable, secure, auditable, and competition-ready demonstration environment after formal Phase 5 closure.

The deployment must demonstrate:

- clinical workflow support;
- Claim Readiness intelligence;
- canonical Claim workflow, decision, and payment separation;
- evidence completeness;
- payer-rule intelligence;
- audit-ready behavior;
- AI decision support with human oversight;
- tenant-aware access boundaries;
- controlled demo data;
- reliable application navigation.

The demo must not imply autonomous medical diagnosis, autonomous Claim approval, autonomous payer adjudication, autonomous payment settlement, real insurance coverage confirmation, or production clinical-use authorization.

## 4. Preconditions

Deployment work may begin only when:

```text
Phase 5: CLOSED
Working Tree: CLEAN
Main Branch: SYNCHRONIZED WITH ORIGIN
Production Build: PASS
Full Vitest Regression: PASS
TypeScript: PASS
Lint: PASS
Demo Scope: APPROVED
Hosting Target: APPROVED
Supabase Target: APPROVED
Environment Variable Inventory: APPROVED
Demo Data Strategy: APPROVED
Domain and DNS Plan: APPROVED
Rollback Plan: APPROVED
Deployment Authorization: YES
Blocking Decisions: 0
```

Confirmed baseline:

```text
Phase 5 closure commit: 0636eaf
Phase 5 closure readiness commit: 4535602
Batch D contract approval commit: 3e677a4
Full regression evidence: 24 test files / 98 tests passed
```

## 5. Deployment Principles

1. **Demo first, production later** — the first public environment is a controlled demonstration environment, not a production healthcare system.
2. **No real PHI** — real patient, provider, Claim, policy, payment, or clinical information must not be loaded.
3. **Least privilege** — demo users receive only the minimum role permissions needed for their scenario.
4. **Server-owned authority** — protected writes and privileged operations remain server-side.
5. **Human-in-the-loop AI** — AI output is advisory and must remain explainable and reviewable.
6. **No implicit state merging** — workflow, decision, payment, readiness, evidence, and review states remain independent.
7. **Rollback before release** — a tested rollback path must exist before public exposure.
8. **Evidence before approval** — deployment status may not be changed to `DEPLOYED` without recorded smoke-test evidence.

## 6. Demo Scope

### 6.1 In-scope capabilities

The competition demo may include:

- authentication and role-aware navigation;
- clinic and executive dashboards;
- patient list and patient detail;
- visit list and visit detail;
- SOAP documentation;
- AI clinical documentation assistance;
- prescription and pharmacy workflow;
- Claim Readiness assessment;
- evidence package preview;
- patient Claim workspace;
- Payer Rules configuration and impact preview;
- economic intelligence;
- audit and compliance views;
- user and organization administration;
- notification and search experiences.

### 6.2 In-scope Claim behavior

The demo may show:

```text
workflowStatus
decisionStatus
paymentStatus
readinessStatus
submissionReadinessStatus
evidenceStatus
payerRuleReviewStatus
legacyClaimPresentationStatus
```

Rules:

- readiness does not mean approval;
- approval does not mean payment;
- submission does not mean readiness;
- missing evidence does not mean rejection;
- payment state must not be inferred from decision state;
- unsupported states must render safely.

### 6.3 Out-of-scope capabilities

The public demo must not perform:

- real payer submission;
- real hospital integration;
- real policy validation;
- real financial settlement;
- real payment, refund, or reversal;
- real e-Claim transmission;
- production medical coding submission;
- autonomous Claim adjudication;
- autonomous medical decisions;
- real third-party webhook processing;
- unapproved production migrations.

## 7. Required Demo Routes

The final route inventory must be generated from the production build and verified manually.

Priority demo routes:

```text
/dashboard
/clinic-dashboard
/claim-readiness
/claim-readiness/[id]
/patients/[patientId]
/patients/[patientId]/claims
/visits
/visits/[visitId]
/visits/[visitId]/timeline
/visits/[visitId]/prescription
/prescription
/prescription-management
/ai-clinical-engine
/insurance-intelligence
/payer-rules
/payer-rules/[payerId]
/evidence-package
/economic-intelligence
/audit-compliance
/notification-center
/admin/users
/admin/settings/organization
```

The exact build output is the source of truth. Routes absent from the current repository must not be claimed as available.

## 8. Demo User Roles

| Demo role | Purpose | Access expectation |
| --- | --- | --- |
| Clinic Administrator | Organization, clinic, user, and operational administration | Administrative demo scope only |
| Doctor | Visit review, SOAP, diagnosis, treatment, and clinical support | Assigned clinical scope |
| Nurse / Clinic Staff | Queue, visit preparation, evidence, and operational workflow | Limited clinical operations |
| Pharmacist | Prescription and medication workflow | Pharmacy-related scope |
| Claim Reviewer | Claim readiness, evidence, workflow review, and payer-rule impact | Claim review scope |
| Auditor / Compliance | Audit trail and compliance review | Read-only audit scope |
| Executive | KPI, operational, Claim, and economic dashboards | Aggregated read-only scope |

Demo accounts must use synthetic identities, strong unique passwords, controlled credential distribution, and post-event rotation. Service-role credentials must never be exposed.

## 9. Demo Data Contract

### 9.1 Allowed data

Only synthetic or explicitly anonymized data may be used.

Required demo dataset characteristics:

- at least one complete Claim-ready journey;
- at least one needs-review journey;
- at least one not-ready or pending-evidence journey;
- approved-but-unpaid representation;
- submitted-but-not-ready representation;
- multiple departments and roles;
- masked identifiers;
- evidence completeness variation;
- cost and SLA alert variation;
- explainable AI recommendations;
- audit events covering key user actions.

### 9.2 Prohibited data

Do not load real patient names, national identifiers, medical record numbers, contact details, medical documents, insurer member numbers, Claim numbers, provider credentials, payment data, secrets, or production tokens.

### 9.3 Seed strategy

The approved strategy must identify one of:

```text
A. Existing controlled mock data
B. Supabase synthetic seed data
C. Hybrid demo data
```

Seed execution must be repeatable, documented, reversible, isolated from real environments, and validated against tenant ownership.

## 10. Environment Strategy

| Environment | Purpose | Public |
| --- | --- | --- |
| Local | Development and local validation | No |
| Preview | Pre-release review and smoke testing | Restricted |
| Demo / Production-like | Competition demonstration | Yes, after approval |

The public demo environment must not share credentials or data with unrelated development environments.

## 11. Environment Variables

The exact inventory must be confirmed from repository usage.

Expected categories include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

Rules:

- `.env.local` must not be committed;
- real values must not be added to documentation;
- `.env.example` may contain names and safe placeholders only;
- `SUPABASE_SERVICE_ROLE_KEY` must be server-side only;
- secrets must be stored in the hosting provider secret manager;
- preview and demo values must be separated;
- any AI provider keys must be server-side and usage-limited;
- unused variables must not be configured.

## 12. Supabase Demo Readiness

Before deployment, confirm:

1. The target Supabase project is explicitly designated for the demo.
2. Region and environment ownership are recorded.
3. Applied migrations match the approved repository migration history.
4. RLS is enabled where required.
5. Grants and function execution permissions match the validated design.
6. Service-role credentials are not exposed to the browser.
7. Authentication redirect URLs include preview and final domain URLs.
8. Demo users and role assignments are synthetic and verified.
9. Storage buckets, if used, enforce safe access rules.
10. Audit events are generated for controlled mutations.
11. Backup or project recovery capability is documented.
12. No destructive command is run without explicit authorization.

Required pre-deployment checks may include:

```powershell
npx supabase db lint
npx supabase db push --dry-run
```

Any real remote migration or reset requires separate explicit authorization.

## 13. Authentication and Authorization Checks

The demo must verify:

- login succeeds for each approved role;
- unauthorized routes are denied;
- tenant and clinic scope are enforced;
- self-scoped users cannot view unrelated data;
- admin-only functions are protected;
- Claim Reviewer permissions do not grant unrelated clinical administration;
- Auditor access remains read-only;
- Executive access uses aggregated or appropriately masked data;
- logout and session expiry behave safely;
- direct URL access does not bypass navigation permissions.

## 14. Hosting Contract

The hosting target must be explicitly approved before deployment.

The selected provider must support:

- Next.js 16 App Router;
- Node runtime compatible with repository requirements;
- server-side environment variables;
- preview deployments;
- custom domains;
- TLS;
- deployment logs;
- rollback to a previous deployment;
- build command `npm run build`.

The hosting configuration must not introduce unapproved package or application changes.

## 15. Domain and DNS Contract

Before DNS changes, record:

```text
Domain:
Registrar:
DNS provider:
Hosting provider:
Target hostname:
Production URL:
Preview URL:
DNS record type:
TLS status:
Rollback DNS value:
Responsible owner:
```

Rules:

- do not modify DNS before the hosted deployment is healthy;
- preserve the previous DNS configuration for rollback;
- use HTTPS;
- configure canonical hostname behavior consistently;
- configure authentication redirect URLs after the final hostname is known;
- verify no mixed-content or insecure-cookie behavior;
- do not claim the domain is active before DNS and TLS checks pass.

## 16. Build and Quality Gate

Required validation:

```powershell
npx vitest run
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git status -sb
```

Current Phase 5 closure evidence:

```text
Vitest: 24 test files / 98 tests passed
TypeScript: PASS
Lint: PASS
Production build: PASS
```

The validation must be rerun against the exact deployment commit.

## 17. Demo Smoke Test

### 17.1 General

- [ ] HTTPS loads without certificate warning
- [ ] No blank page or fatal runtime error
- [ ] Main navigation works
- [ ] Responsive layout works at desktop and mobile widths
- [ ] No sensitive environment values appear in browser output
- [ ] Browser console has no release-blocking errors
- [ ] Static assets load
- [ ] API routes return controlled responses
- [ ] Error pages render safely

### 17.2 Authentication

- [ ] Approved demo account can sign in
- [ ] Invalid credentials are rejected safely
- [ ] Logout works
- [ ] Protected routes redirect or deny access
- [ ] Role-based navigation is correct
- [ ] Direct route access is protected

### 17.3 Core demo journey

- [ ] Open dashboard
- [ ] Find synthetic patient
- [ ] Open visit
- [ ] Review SOAP and clinical data
- [ ] Review AI decision-support output
- [ ] Review prescription and evidence
- [ ] Open Claim Readiness
- [ ] Explain score and missing evidence
- [ ] Open Patient Claims
- [ ] Show workflow, decision, payment, and readiness separately
- [ ] Open Payer Rules
- [ ] Show independent workflow, decision, payment, readiness, and review filters
- [ ] Open audit evidence
- [ ] Return to executive view

### 17.4 State safety

- [ ] Approved can be displayed while unpaid
- [ ] Submitted can be displayed while not ready
- [ ] Pending evidence does not display as payer rejection
- [ ] Missing decision does not default to approved
- [ ] Missing payment does not default to paid
- [ ] AI recommendation is visibly advisory
- [ ] High-risk action requires human review

## 18. Security Gate

Before public release:

- [ ] No secrets committed to Git
- [ ] No service-role key in client bundle
- [ ] No real PHI in demo data
- [ ] RLS and tenant isolation verified
- [ ] Privileged APIs are server-only
- [ ] Redirect URLs are restricted appropriately
- [ ] Logs do not expose sensitive payloads
- [ ] Demo credentials are controlled
- [ ] Administrative routes are protected
- [ ] Dependency and build warnings reviewed
- [ ] AI endpoint usage controls considered
- [ ] Security owner signs off

## 19. Observability and Support

Record:

- deployment commit;
- deployment identifier;
- build timestamp;
- hosting logs;
- server/API errors;
- Supabase logs where available;
- authentication failures;
- AI endpoint failures;
- smoke-test results;
- incident owner;
- rollback decision.

Do not log full PHI or secrets.

## 20. Performance Gate

Minimum demo expectations:

- initial route loads without timeout;
- major navigation transitions complete reliably;
- dashboard data loads without blocking failure;
- the demo remains usable on typical competition Wi-Fi;
- heavy charts or tables do not freeze the page;
- no uncontrolled repeated API calls;
- production build has no release-blocking warning.

No unsupported SLA may be claimed.

## 21. Accessibility and Presentation Gate

Before submission:

- keyboard navigation works for critical flows;
- inputs and controls have visible labels;
- focus states remain visible;
- status is not conveyed by color alone;
- Thai and English labels remain understandable;
- empty, loading, error, and unavailable states are present;
- critical text remains readable on projected screens;
- demo data and disclaimers are visible;
- no broken text or placeholder content remains.

## 22. AI Governance Gate

The demo must display or clearly communicate:

```text
AI provides decision support only.
Human review is required.
AI output is not a final medical, Claim, coverage, or payment decision.
```

Confirm:

- confidence or rationale is shown where designed;
- high-risk output requires human review;
- AI cannot activate rules autonomously;
- AI cannot approve Claims autonomously;
- AI cannot initiate payment autonomously;
- override and human confirmation behavior remain auditable.

## 23. Competition Demo Script

The final demo script should target a concise end-to-end journey:

```text
1. Executive problem and value proposition
2. Clinic operational dashboard
3. Synthetic patient and visit
4. AI-assisted clinical documentation
5. Claim Readiness score and missing evidence
6. Payer-rule intelligence
7. Split workflow / decision / payment states
8. Evidence package and audit trail
9. Economic and executive insight
10. Human-in-the-loop and compliance summary
```

Required supporting material:

- 3โ€“5 minute primary demo path;
- backup static screenshots or recording;
- demo account instructions;
- known limitations;
- technical architecture summary;
- privacy and AI governance statement;
- contact and project information.

## 24. Rollback Plan

Rollback must be possible without new code development.

Required rollback options:

1. Redeploy the last known good hosting deployment.
2. Restore previous environment-variable values.
3. Restore previous DNS records.
4. Disable public access if security is uncertain.
5. Disable demo accounts.
6. Stop AI or external integrations independently where possible.
7. Restore approved synthetic data snapshot if demo data is damaged.
8. Record the incident and rollback evidence.

Rollback triggers include authentication failure, tenant-isolation failure, secret exposure, real data exposure, critical runtime failure, corrupted demo data, unsafe AI behavior, and domain or TLS failure.

## 25. Deployment Sequence

After approval only:

1. Confirm clean and synchronized `main`.
2. Record deployment commit.
3. Confirm hosting target.
4. Confirm Supabase demo target.
5. Confirm environment variable inventory.
6. Confirm synthetic data strategy.
7. Run full local validation.
8. Create preview deployment.
9. Configure preview authentication redirects.
10. Run preview smoke test.
11. Resolve only approved deployment blockers.
12. Approve public demo deployment.
13. Deploy the approved commit.
14. Run public URL smoke test.
15. Configure domain and DNS.
16. Verify TLS and canonical URL.
17. Rerun authentication and critical journey smoke tests.
18. Freeze demo data and credentials.
19. Record final deployment evidence.
20. Authorize competition use.

## 26. Stop Conditions

Stop deployment if:

- Contract is not `APPROVED`;
- deployment authorization is not `YES`;
- blockers are greater than zero;
- working tree is dirty;
- validation fails;
- deployment commit differs from validated commit;
- a secret appears in Git or client output;
- real PHI is detected;
- RLS or tenant isolation cannot be verified;
- required environment variables are unknown;
- remote migration is required but not separately approved;
- authentication redirects are incorrect;
- domain ownership or DNS authority is unconfirmed;
- rollback is unavailable;
- a smoke-test blocker occurs;
- a high-risk AI action appears autonomous.

## 27. Blocking Decisions

### DEP-DEC-01 — Hosting target

**Status:** OPEN — BLOCKING

Confirm hosting provider, project/account owner, repository integration, build/runtime settings, preview and production URLs, and rollback capability.

### DEP-DEC-02 — Supabase demo target

**Status:** OPEN — BLOCKING

Confirm existing or new Supabase project, project owner, region, remote migration state, authentication configuration, and backup/recovery plan.

### DEP-DEC-03 — Demo data strategy

**Status:** OPEN — BLOCKING

Choose existing mock data, synthetic Supabase seed, or hybrid. Confirm exact seed/reset procedure and data owner.

### DEP-DEC-04 — Domain and DNS plan

**Status:** OPEN — BLOCKING

Confirm domain name, registrar and DNS provider, target hosting hostname, approved DNS records, authentication redirect URLs, and rollback DNS values.

### DEP-DEC-05 — Demo accounts and credentials

**Status:** OPEN — BLOCKING

Confirm exact roles, account identifiers, credential owner, credential-sharing method, and rotation/disablement procedure.

### DEP-DEC-06 — Public demo scope and competition deadline

**Status:** OPEN — BLOCKING

Confirm competition submission deadline, required public URL date, required demo duration, routes included in the official demo, backup recording requirement, and final approvers.

## 28. Approval Gate

This Contract may be approved only when:

```text
DEP-DEC-01: CLOSED
DEP-DEC-02: CLOSED
DEP-DEC-03: CLOSED
DEP-DEC-04: CLOSED
DEP-DEC-05: CLOSED
DEP-DEC-06: CLOSED
Blocking Decisions: 0
Deployment Commit: IDENTIFIED
Hosting Target: CONFIRMED
Supabase Demo Target: CONFIRMED
Synthetic Data Strategy: CONFIRMED
Environment Variables: CONFIRMED
Domain and DNS: CONFIRMED
Smoke Test: DEFINED
Rollback: CONFIRMED
Security Review: APPROVED
```

Approval metadata must become:

```yaml
record_state: APPROVED_CONTRACT
contract_status: APPROVED
demo_status: READY_FOR_DEPLOYMENT
deployment_status: NOT_STARTED
deployment_authorization: YES
domain_authorization: YES
production_data_authorization: NO
blocking_decisions: 0
```

Production data authorization must remain `NO` for the competition demo.

## 29. Required Deployment Evidence

Create after deployment authorization:

```text
docs/deployment/DEMO-DEPLOYMENT-VALIDATION-REPORT.md
```

The report must include the approved Contract reference, deployment commit, hosting deployment identifier, preview URL, public URL, domain, environment inventory without secret values, Supabase target, validation results, smoke-test results, security findings, known limitations, rollback evidence, and final recommendation.

## 30. Recommended Next Prompt

```text
DEMO READINESS DECISION CLOSURE

Read:
docs/deployment/DEMO-READINESS-AND-DEPLOYMENT-CONTRACT.md

Close DEP-DEC-01 through DEP-DEC-06 using verified repository,
hosting, Supabase, domain, and competition evidence.

Modify only:
docs/deployment/DEMO-READINESS-AND-DEPLOYMENT-CONTRACT.md

Do not deploy, modify DNS, run remote migrations, expose secrets,
load production data, commit, or push.

Set deployment_authorization to YES only when all blockers are zero
and the Contract is explicitly approved.
```

## 31. Final Contract Summary

```text
Capability:
Controlled competition demo readiness, deployment, and domain integration

Record State:
READY FOR REVIEW

Contract Status:
PROPOSED

Demo Status:
NOT STARTED

Deployment Status:
NOT STARTED

Deployment Authorization:
NO

Domain Authorization:
NO

Production Data Authorization:
NO

Blocking Decisions:
6

Confirmed Baseline:
Phase 5 CLOSED at commit 0636eaf
Full regression 24 files / 98 tests PASS
TypeScript PASS
Lint PASS
Production build PASS

Next Required Action:
Close DEP-DEC-01 through DEP-DEC-06 before approving or executing deployment.
```
