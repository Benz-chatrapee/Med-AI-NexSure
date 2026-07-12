# Audit Compliance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Audit & Compliance frontend page from the supplied HTML prototype with high visual fidelity.

**Architecture:** Add a thin Next.js App Router route that renders one focused feature component. Keep mock data type-safe and local to the feature, and scope CSS under an audit-specific shell so existing pages are not affected.

**Tech Stack:** Next.js App Router, TypeScript, React, scoped CSS, existing project scripts.

## Global Constraints

- Treat the HTML prototype as the visual source of truth.
- Do not redesign, reorder content, change layout, or change business logic.
- Use English-first enterprise UI copy with Thai support text.
- Do not add backend, database, authentication, RBAC, or API changes.
- Preserve accessibility through semantic headings, tables, labels, and focus states.
- Desktop layout must match the prototype; smaller screens may stack content.
- Use only scripts present in `package.json`: `npm run lint` and `npm run build`.

---

### Task 1: Audit & Compliance Route and Feature

**Files:**
- Create: `app/audit-compliance/page.tsx`
- Create: `components/features/audit-compliance/audit-compliance-page.tsx`

**Interfaces:**
- Produces: `AuditCompliancePage(): JSX.Element`
- Consumes: no backend or shared business APIs

- [ ] **Step 1: Create the App Router page**

```tsx
import { AuditCompliancePage } from "@/components/features/audit-compliance/audit-compliance-page";

export default function AuditCompliance() {
  return <AuditCompliancePage />;
}
```

- [ ] **Step 2: Implement typed local content**

Define readonly arrays for navigation groups, KPI cards, governance modules, audit log rows, consent statuses, alerts, and timeline items. Use union types for audit actions and risk status so badge rendering remains type-safe.

- [ ] **Step 3: Render the prototype structure**

Create the sidebar, hero, KPI grid, main card, modules grid, table, side stack, consent card, alerts, and timeline in the same order as the HTML prototype.

- [ ] **Step 4: Add scoped CSS**

Port the prototype CSS under `.audit-compliance-shell` and related prefixed class names. Keep colors, spacing, shadows, borders, typography scale, grid ratios, and responsive breakpoint aligned with the prototype.

- [ ] **Step 5: Run validation**

Run: `npm run lint`
Expected: command exits successfully.

Run: `npm run build`
Expected: command exits successfully.

Record that `npm run typecheck` and `npm run test` are not available unless scripts are added later.

## Self-Review

- Spec coverage: route, feature component, visual fidelity, typed mock data, scoped CSS, responsive layout, accessibility, and validation are covered.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: `AuditCompliancePage` is the only exported component consumed by the route.
