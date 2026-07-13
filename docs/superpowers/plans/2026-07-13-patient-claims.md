# Patient Claims Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a typed, accessible Patient Claims workspace at `/patients/[patientId]/claims`.

**Architecture:** Add an isolated `features/patient-claims` module with domain types, constants, mock data, services, utilities, tests, and one client workspace. Add route state files under `app/patients/[patientId]/claims` without modifying unrelated routes or global shell code.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React, Vitest, existing project scripts.

## Global Constraints

- Do not add dependencies.
- Do not modify global layout, shared shell, TypeScript config, ESLint config, or unrelated feature files.
- Do not use `any`, inline `onclick`, direct DOM manipulation, `dangerouslySetInnerHTML`, or raw exception display.
- Use mock data only; do not log PHI, PII, full policy numbers, API keys, or secrets.
- AI readiness is decision support only and never approves or rejects claims automatically.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after implementation.

---

### Task 1: Domain, Constants, Mocks, And Utilities

**Files:**
- Create: `features/patient-claims/types/patient-claims.types.ts`
- Create: `features/patient-claims/constants/patient-claims.constants.ts`
- Create: `features/patient-claims/data/patient-claims.mock.ts`
- Create: `features/patient-claims/utils/patient-claims-utils.ts`
- Create: `features/patient-claims/utils/patient-claims-utils.test.ts`

**Interfaces:**
- Produces `PatientClaimsDashboardData`, `PatientClaimsFilters`, `PatientClaim`, `filterPatientClaims`, `paginatePatientClaims`, `formatClaimCurrency`, and label mappings consumed by later tasks.

- [x] Write failing Vitest tests for claim filtering and pagination.
- [x] Run the tests and verify they fail before production utility code exists.
- [x] Implement domain types, constants, mock data, and utility functions.
- [x] Run targeted Vitest tests and verify they pass.

### Task 2: Service Layer

**Files:**
- Create: `features/patient-claims/services/patient-claims-service.ts`

**Interfaces:**
- Consumes mock dashboard data.
- Produces `getPatientClaimsDashboard(patientId)`, `getPatientClaims(patientId, filters)`, `getClaimDetail(claimId)`, and `recalculateClaimReadiness(patientId)`.

- [x] Implement typed mock service functions with simulated latency and normalized service error.
- [x] Ensure no raw PHI logging or full policy-number logging exists.

### Task 3: Workspace UI

**Files:**
- Create: `features/patient-claims/components/patient-claims-workspace.tsx`

**Interfaces:**
- Consumes `PatientClaimsDashboardData`.
- Uses service calls for detail loading and readiness recalculation.

- [x] Implement breadcrumb, page header, patient context, KPI grid, readiness overview, missing evidence, claim table, detail sheet, activity timeline, payer rules, empty states, and toast region.
- [x] Add local typed state for filters, selected claim, pagination, loading, and user-facing messages.
- [x] Preserve keyboard navigation, focus restoration, readable status labels, and responsive layout.

### Task 4: Route Files

**Files:**
- Create: `app/patients/[patientId]/claims/page.tsx`
- Create: `app/patients/[patientId]/claims/loading.tsx`
- Create: `app/patients/[patientId]/claims/error.tsx`
- Create: `app/patients/[patientId]/claims/not-found.tsx`

**Interfaces:**
- Consumes `getPatientClaimsDashboard`.
- Renders `PatientClaimsWorkspace`.

- [x] Add route metadata and server route.
- [x] Add loading, error, and not-found states matching project tone.

### Task 5: Validation

**Files:**
- No new files.

- [x] Run targeted tests.
- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build`.
- [x] Report exact results and `git status --short`.
