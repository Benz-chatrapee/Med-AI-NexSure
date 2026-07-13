# Prescription Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visit-aware, typed Prescription Management workspace with clinical safety, inventory, pharmacist review, and audit-ready traceability.

**Architecture:** Keep routes thin and place prescription behavior in `features/prescription`. Domain rules are pure and tested. UI uses React Hook Form, Zod, TanStack Query, lucide-react, and the existing Tailwind design language while preserving `/prescription-management`.

**Tech Stack:** Next.js App Router, React, TypeScript strict, Tailwind CSS, React Hook Form, Zod, TanStack Query, lucide-react, Vitest.

## Global Constraints

- Do not delete or overwrite existing components until the replacement is verified.
- Keep backward compatibility.
- No `any`, no unsafe HTML rendering, no autonomous clinical approval language.
- AI/rule checks are decision support only; clinician/pharmacist review remains required.
- Run lint, type-check, build, and tests.

---

### Task 1: Domain Rules

**Files:**
- Create: `features/prescription/domain/types.ts`
- Create: `features/prescription/domain/rules.ts`
- Create: `features/prescription/domain/rules.test.ts`

**Interfaces:**
- Produces: `evaluatePrescriptionSafety`, `validatePrescriptionItems`, `calculateStockReadiness`, `canSubmitPrescription`.

- [x] Write failing tests for empty items, missing fields, zero quantity, stock risks, allergy contraindication, justification, role permissions, submitted read-only behavior.
- [x] Implement finite union types and pure rule functions.
- [ ] Run `npm test -- features/prescription/domain/rules.test.ts`.

### Task 2: Service Boundary

**Files:**
- Create: `features/prescription/server/mock-repository.ts`
- Create: `features/prescription/server/service.ts`
- Create: `features/prescription/hooks/use-prescription.ts`

**Interfaces:**
- Produces: typed async prescription service and query hooks.

- [ ] Return mock prescription details by visit id.
- [ ] Add typed medication search, inventory lookup, draft save, submit, and audit fetch functions.
- [ ] Use TanStack Query keys and mutations.

### Task 3: Form and Feature UI

**Files:**
- Create: `features/prescription/components/prescription-workspace.tsx`
- Create: `features/prescription/prescription-page.tsx`
- Create: route loading/error files.
- Modify: `app/prescription-management/page.tsx`.

**Interfaces:**
- Consumes: domain rules, service hooks, Zod schema.
- Produces: route-compatible prescription page.

- [ ] Build header, workflow, patient context, KPI cards, medication builder, safety panel, inventory panel, pharmacist review, audit timeline.
- [ ] Use React Hook Form `useFieldArray` and Zod schema validation.
- [ ] Add confirmation dialog for submit and accessible feedback.

### Task 4: Verification

**Files:**
- Modify only if verification exposes issues.

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
