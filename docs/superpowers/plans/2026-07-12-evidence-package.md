# Evidence Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Epic 11 Evidence Package HTML prototype into a production-ready Next.js/TypeScript frontend that preserves the prototype's layout, behavior, and English-first enterprise copy.

**Architecture:** Keep the existing `/evidence-package` route and rebuild the feature component as a client-side React dashboard with typed mock data, derived filtering state, Recharts visualizations, document tabs, PDF blocking behavior, and audit-style UI feedback. Styling remains scoped inside the Evidence Package component to avoid system-wide theme changes.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind-compatible scoped CSS, Recharts, existing project scripts.

## Global Constraints

- HTML prototype is the visual source of truth.
- Do not redesign, reorder business information, or change business logic.
- English first, Thai support copy where helpful.
- Use type-safe mock data only; do not create backend APIs.
- Preserve patient safety, explainable AI, compliance, audit, privacy, and security cues.
- Scope edits to the Evidence Package frontend feature.
- Validate with real project commands only.

---

### Task 1: Typed Data And Display Logic

**Files:**
- Modify: `components/features/evidence-package/evidence-package-page.tsx`

**Interfaces:**
- Produces: `EvidenceCase`, `QuickFilter`, `DocumentTab`, mock arrays, status helpers, and filtering helpers used by the page render.

- [ ] Replace untyped tuple-heavy data with typed constants for navigation, cases, KPI labels, evidence weights, charts, activity, and document tabs.
- [ ] Add derived helpers for status classes, missing-evidence checks, score breakdown, quick filtering, and KPI summaries.
- [ ] Keep prototype values, order, colors, labels, and Thai support copy aligned with the source HTML.
- [ ] Run `npm run lint` after implementation.

### Task 2: Production Dashboard UI

**Files:**
- Modify: `components/features/evidence-package/evidence-package-page.tsx`

**Interfaces:**
- Consumes: typed data and helpers from Task 1.
- Produces: complete Evidence Package dashboard at `/evidence-package`.

- [ ] Rebuild the page with sidebar, topbar, filter bar, selected case context, alert banner, KPI cards, charts, heatmap, worklist table, detail grid, PDF preview, AI recommendation, recent activity, and compliance table.
- [ ] Use semantic HTML for `header`, `main`, `section`, `aside`, `table`, `thead`, `tbody`, and accessible form labels.
- [ ] Implement local React state for selected case, filters, quick filter, active document tab, toast message, and update timestamp.
- [ ] Preserve desktop grid behavior and responsive stacking from the prototype.
- [ ] Use Recharts for the line, doughnut-equivalent pie, bar, pareto, aging, and cost charts.

### Task 3: Interactions And Validation

**Files:**
- Modify: `components/features/evidence-package/evidence-package-page.tsx`

**Interfaces:**
- Consumes: page state and helpers from Tasks 1 and 2.
- Produces: working search/filter/reset, quick filters, row selection, tab switching, CSV export, refresh, PDF gating, toast, and audit action behavior.

- [ ] Wire top filters to the worklist filters through Apply and Reset actions.
- [ ] Add quick filtering from KPI cards, chart clicks, heatmap cells, and active filter clear.
- [ ] Disable Generate PDF when selected evidence is missing; show the same blocking reason as the prototype.
- [ ] Keep CSV export client-only with the filtered rows.
- [ ] Keep audit feedback as visible UI state without creating backend audit writes.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Report missing `typecheck` and `test` scripts if they remain absent from `package.json`.

### Self-Review

- Spec coverage: The plan covers visual fidelity, typed frontend structure, mock data, interactions, responsive behavior, accessibility, and validation.
- Placeholder scan: No placeholders remain.
- Type consistency: The planned interfaces are contained in the feature component and do not affect external contracts.
