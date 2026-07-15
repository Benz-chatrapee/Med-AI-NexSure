# Med AI NexSure — Frontend Rules

## Purpose

Frontend standard for **Med AI NexSure**, an enterprise healthcare and insurance intelligence platform.

Priorities: patient safety, claim readiness, auditability, PDPA/RBAC/RLS, human-in-the-loop AI, prototype fidelity, maintainability, and minimal safe changes.

## 1. Source of Truth

When instructions conflict, follow:

1. User request
2. `AGENTS.md`
3. Approved HTML prototype
4. Existing repository behavior and architecture
5. Existing shared components and design tokens
6. This file

The prototype is the **Visual and Functional Source of Truth**. Preserve layout, hierarchy, labels, statuses, tables, charts, filters, interactions, spacing, typography, colors, navigation, and sticky actions.

Do not redesign, simplify, modernize, or replace it with a generic template unless explicitly requested.

## 2. Approved Stack

Use the existing repository stack only:

- Next.js App Router
- React
- TypeScript Strict Mode
- Tailwind CSS
- Shadcn/UI
- React Hook Form + Zod
- TanStack Query
- Zustand
- Supabase
- Existing chart and toast libraries

Do not add dependencies unless explicitly required and existing tools cannot satisfy the task.

## 3. Change Discipline

Before editing:

1. Read the task, prototype, `AGENTS.md`, and relevant specialist rules.
2. Inspect the route, layout, feature module, components, types, hooks, services, schemas, and utilities.
3. Reuse existing code and identify the smallest safe change.

Rules:

- Modify only required files.
- Do not duplicate routes, components, types, schemas, services, or utilities.
- Do not rewrite working code without necessity.
- Preserve APIs, database schemas, authentication, RBAC, RLS, and shared behavior.
- Do not change unrelated files or behavior.

## 4. Architecture

Follow the repository structure. Prefer feature-based organization:

```text
app/<route>/page.tsx
features/<feature>/{components,hooks,services,schemas,types,constants,utils}
components/{ui,layout,shared}
lib/
```

- Keep `page.tsx` focused on composition and data coordination.
- Prefer Server Components.
- Use `"use client"` only for the smallest interactive component.
- Reuse existing layouts and route groups.
- Add `loading.tsx`, `error.tsx`, or `not-found.tsx` only when appropriate.
- Never expose secrets or server-only logic to the client.

## 5. TypeScript and Components

- Strict Mode is mandatory.
- Do not use `any`; use `unknown` plus validation.
- Type props, forms, API responses, domain models, and statuses.
- Reuse domain types and handle status unions exhaustively.
- Avoid unsafe assertions and duplicate types.
- Prefer small, focused, accessible components.
- Use Shadcn/UI primitives before creating custom primitives.
- Avoid premature abstraction and wrappers without domain value.

## 6. Design and Layout

Product qualities: clinical, trustworthy, enterprise-grade, AI-native, compliance-first, operationally clear, and executive-ready.

Use existing tokens first. Reference palette:

```text
Primary #1E3A8A   Deep #0F2A5F   AI #2563EB
Background #F8FAFC   Surface #FFFFFF   Border #E2E8F0
Text #0F172A   Muted #64748B
Success #059669   Warning #D97706   Danger #DC2626
```

Status meaning:

- Green: complete, approved, safe, ready
- Amber: pending, warning, review required
- Red: critical, rejected, unsafe, not ready
- Blue: active, informational, AI-assisted
- Gray: draft, disabled, inactive

Do not rely on color alone.

Preserve full-screen desktop prototypes. Avoid unnecessary narrow containers. Keep key actions visible, prevent clipping, and allow dense tables to scroll. Maintain desktop hierarchy while supporting tablet and mobile.

## 7. Language and Statuses

Use **English First, Thai Support** (approximately 70/30).

- English: navigation, titles, sections, KPI labels, table headers, healthcare, insurance, AI, audit, and compliance terms.
- Thai: helper text, warnings, validation, empty states, confirmations, and user guidance.

Centralize status labels and colors:

```text
Waiting / รอพบแพทย์
In Consultation / กำลังตรวจรักษา
Pharmacy / รอรับยา
Completed / เสร็จสิ้น
Pending Evidence / รอเอกสารเพิ่มเติม
Claim Review / อยู่ระหว่างตรวจสอบเคลม
Ready / พร้อมส่งเคลม
Needs Review / ต้องตรวจสอบ
Not Ready / ยังไม่พร้อม
Approved / อนุมัติแล้ว
Rejected / ไม่อนุมัติ
Draft / ฉบับร่าง
```

## 8. Forms, Data, and States

- Use React Hook Form + Zod.
- Validate client and server inputs where applicable.
- Prevent duplicate submissions and preserve entered values on errors.
- Use accessible labels and actionable messages.
- Use Server Components for initial data, TanStack Query for remote client state, Zustand for limited shared UI state, local state for local concerns, and URL parameters for shareable filters/sort/pagination.
- Do not duplicate server data across state systems.
- Keep API logic outside large presentation components.

Every data-driven page must handle loading, empty, error, permission-denied, missing-data, and disabled states without exposing sensitive internals.

## 9. Tables and Charts

Tables should support only required features: search, filters, sorting, pagination, selection, bulk actions, status badges, and drill-down.

- Keep identifiers and important actions visible.
- Format dates and numbers consistently.
- Preserve horizontal scrolling when needed.
- Keep row actions accessible.

Charts must answer a business question and include a title, metric, units, time range, readable labels, loading state, and empty state.

Preferred mapping:

- Trend: line/area
- Comparison: bar
- Composition/readiness: donut or stacked bar
- Missing evidence: Pareto
- Risk: heatmap
- Queue: horizontal bar
- Cost distribution: histogram or box plot

Do not change prototype chart types without explicit instruction.

## 10. AI, Clinical, and Insurance Safety

AI is **Decision Support, not Decision Maker**.

AI output should provide, when available:

- Confidence
- Explanation or rationale
- Evidence/source references
- Human review
- Accept, edit, reject, or override action
- Audit trail
- Clear AI-generated labeling

Critical clinical, medication, claim, financial, and compliance decisions require authorized human confirmation.

The UI must not imply replacement of doctors, pharmacists, claim reviewers, auditors, compliance officers, or authorized approvers.

Clearly display uncertainty, missing evidence, rule conflicts, critical warnings, overrides, reasons, and reviewer identity.

## 11. Security, Privacy, and Audit

- Enforce least privilege and organization/clinic scope.
- Respect backend authorization and Supabase RLS.
- Never expose keys, tokens, secrets, private APIs, or unauthorized PHI/PII.
- Do not place sensitive data in URLs or logs.
- Validate and sanitize external input.
- Frontend visibility is not authorization.

Audit-sensitive actions include create, update, delete, approve, reject, override, export, role/access changes, account lock, AI acceptance/rejection, claim review, and evidence generation.

Record or display actor, action, timestamp, reason, before/after values, source, and AI involvement where required.

Use contextual confirmation for destructive or sensitive actions; explain impact, reversibility, and required reason.

## 12. Accessibility and Performance

Target WCAG 2.2 AA:

- Semantic HTML and logical headings
- Keyboard access and visible focus
- Accessible labels, dialogs, menus, and tables
- Sufficient contrast
- Meaning not conveyed by color alone
- Reasonable touch targets
- Accessible summaries for complex charts when practical

Performance rules:

- Minimize client components and re-renders.
- Lazy-load heavy interactive modules when useful.
- Paginate or virtualize large datasets.
- Prevent layout shift.
- Do not optimize at the cost of correctness or maintainability.

## 13. Validation

Run only available repository commands, typically:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Also verify:

- Route renders without console or hydration errors.
- Desktop matches the prototype.
- Responsive layout remains usable.
- Forms and all states work.
- Keyboard navigation works.
- Status labels and colors are correct.
- No unrelated behavior changed.

Never claim a check passed unless it was executed successfully.

## 14. Definition of Done

The task is complete when:

- Requested behavior is implemented and matches the prototype.
- Existing architecture and contracts are preserved.
- Code is typed, accessible, and reusable where justified.
- Loading, empty, error, success, and permission states are handled.
- AI remains human-reviewed and auditable.
- Sensitive data remains protected.
- No unrelated files were changed.
- Relevant validation passes.

Completion report must list:

1. Summary
2. Files created/modified
3. Reused components
4. Validation commands and results
5. Known limitations or pre-existing issues left untouched

## 15. Prohibited

Do not:

- Redesign approved prototypes
- Add unnecessary dependencies
- Use `any` or disable TypeScript/lint rules without justification
- Duplicate routes or domain code
- Change backend contracts, database schemas, auth, RBAC, or RLS without instruction
- Hide critical warnings or auto-approve AI decisions
- Expose secrets or sensitive data
- Modify unrelated files
- Claim unexecuted tests passed
- Commit or push unrelated changes