# AI Copilot Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Epic 13 AI Copilot Panel HTML prototype into a production-ready Next.js route at `/ai-copilot-panel`.

**Architecture:** Build a native React/TypeScript feature module using typed mock data, local UI state, Recharts, and prototype-matching CSS. Keep backend, database, auth, RBAC, and global design system untouched.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind-compatible CSS-in-JSX, Recharts.

## Global Constraints

- HTML Prototype is the visual source of truth.
- No redesign, layout changes, business logic changes, or API creation.
- Use English-first enterprise product copy with Thai helper and safety text.
- AI decision support must require authorized human review for clinical, claim, and compliance decisions.
- Validate with available project scripts: `npm run lint` and `npm run build`.
- `npm run typecheck` and `npm run test` are requested by the brief but are not defined in `package.json`; report that accurately.

---

### Task 1: Route And Feature Module

**Files:**
- Create: `app/ai-copilot-panel/page.tsx`
- Create: `components/features/ai-copilot-panel/ai-copilot-panel-page.tsx`
- Create: `components/features/ai-copilot-panel/ai-copilot-panel-content.ts`
- Create: `components/features/ai-copilot-panel/ai-copilot-panel-types.ts`
- Create: `components/features/ai-copilot-panel/ai-copilot-panel-utils.ts`

**Interfaces:**
- Produces: `AiCopilotPanelPage(): JSX.Element`
- Produces: typed arrays for nav, context, KPIs, charts, cases, audit events, package checklist, and AI cards.

- [x] Add route component that renders the feature page.
- [x] Add typed mock data matching the prototype labels, values, and statuses.
- [x] Add pure helpers for badge tone, score tone, case filtering, and sorting.
- [x] Add React UI preserving the three-column shell, fixed action bar, drawer, and toast interactions.

### Task 2: Visual Fidelity And Interaction

**Files:**
- Modify: `components/features/ai-copilot-panel/ai-copilot-panel-page.tsx`

**Interfaces:**
- Consumes: data and helpers from Task 1.
- Produces: interactive page with search, filters, chart click filtering, timeline filter, drawer, AI collapse, and mock audit toasts.

- [x] Convert prototype layout to semantic JSX.
- [x] Replace Chart.js canvases with Recharts charts.
- [x] Preserve cards, badges, tables, waterfall, progress bars, AI panel, disclaimer, and responsive rules.
- [x] Keep all safety and human-review language visible.

### Task 3: Validation

**Files:**
- Validate: `package.json`

**Commands:**
- `npm run lint`
- `npm run build`

- [ ] Run lint and fix issues.
- [ ] Run build and fix issues.
- [ ] Report unavailable `typecheck` and `test` scripts.
