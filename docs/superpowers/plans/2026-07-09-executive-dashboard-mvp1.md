# Executive Dashboard MVP 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Claim Readiness implementation into Executive Dashboard MVP 1 covering Claim Readiness, Evidence Package, and Payer Rule Setting.

**Architecture:** Reuse the current Next.js App Router route and `features/claim-readiness` feature boundary. The Orchestrator Agent coordinates domain summaries from specialist agents through the existing server service, backed by synthetic in-memory data for MVP 1.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind, existing server actions, existing feature folder structure.

## Global Constraints

- Follow `AGENTS.md`.
- AI provides decision support only; humans decide.
- Do not create duplicate feature files when existing implementation is available.
- Keep business logic out of UI components.
- Do not expose PHI, PII, secrets, or raw clinical note bodies.
- Important actions must be audit-supported.
- Run `npm run lint` and `npm run build`.

---

### Task 1: Domain Contracts

**Files:**
- Modify: `features/claim-readiness/domain/types.ts`
- Modify: `features/claim-readiness/domain/rules.ts`

**Interfaces:**
- Produces: `ExecutiveDashboardSummary`, `EvidencePackage`, `PayerRuleSetting`, `OrchestratorAgentOutput`
- Produces: `calculateExecutiveDashboardSummary(encounters, evidencePackages, payerRules)`

- [x] Add typed MVP contracts for evidence package, payer rule setting, orchestrator output, and dashboard summary.
- [x] Add pure calculation helper for executive KPIs.

### Task 2: Mock Repository and Service

**Files:**
- Modify: `features/claim-readiness/server/mock-repository.ts`
- Modify: `features/claim-readiness/server/service.ts`

**Interfaces:**
- Consumes: domain contracts from Task 1
- Produces: `getExecutiveDashboard()`

- [x] Add synthetic evidence packages and payer rule settings.
- [x] Add orchestrator agent output with BA, PO, Solution Architect, Frontend, Backend, Database, and QA structured results.
- [x] Add service method with capability check and audit event.

### Task 3: UI Extension

**Files:**
- Modify: `features/claim-readiness/components/readiness-shell.tsx`
- Modify: `features/claim-readiness/components/queue.tsx`
- Modify: `features/claim-readiness/components/detail.tsx`
- Modify: `app/claim-readiness/page.tsx`

**Interfaces:**
- Consumes: `ExecutiveDashboardSummary` and `ClaimReadinessDetail`

- [x] Display executive dashboard KPIs and orchestrator governance summary.
- [x] Display payer rule setting table in the dashboard.
- [x] Display evidence package readiness in detail view.

### Task 4: Documentation and Verification

**Files:**
- Modify: `docs/claim-readiness-mvp-implementation.md`

- [x] Update documentation with MVP 1 scope, architecture, database notes, testing, limitations, and agent outputs.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
