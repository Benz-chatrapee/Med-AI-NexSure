# Med AI NexSure — Frontend Prompt

## Purpose

Implement or modify frontend pages in the existing Med AI NexSure repository using the smallest safe change.

Preserve:

* Prototype fidelity
* Existing architecture
* Clinical safety
* Claim readiness
* Human review
* Auditability
* PDPA and RBAC
* Accessibility
* Maintainable code

## Instruction Priority

Follow this order:

1. Current user request
2. `AGENTS.md`
3. `.agents/frontend.md`
4. Relevant specialist agents
5. This prompt
6. Attached prototype or specification
7. Existing repository conventions

## Required Process

Before editing:

1. Read `AGENTS.md`.
2. Read `.agents/frontend.md`.
3. Read relevant specialist files when applicable:

   * `.agents/ui-designer.md`
   * `.agents/architect.md`
   * `.agents/business-analyst.md`
   * `.agents/healthcare-domain.md`
   * `.agents/ai-clinical.md`
   * `.agents/insurance.md`
   * `.agents/qa.md`
4. Inspect the target route and feature folder.
5. Inspect the current Git working tree.
6. Search for reusable components, hooks, services, schemas, types, utilities, and design tokens.
7. Review the prototype, screenshot, HTML, or requirements.
8. Implement only the requested scope.
9. Run validation before reporting completion.

## Project Context

Med AI NexSure is an enterprise healthcare and insurance intelligence platform supporting:

* Patient and Visit Management
* SOAP Documentation
* AI Clinical Assistance
* Diagnosis and ICD Coding
* Prescription Safety
* Medical Certificates
* Claim Readiness
* Missing Evidence
* Evidence Packages
* Insurance and Payer Rules
* Economic Intelligence
* Audit and Compliance
* User and Role Management
* Operational and Executive Dashboards

The system provides decision support only.

AI must not make final clinical, treatment, coverage, or claim decisions.

## Tech Stack

Use the existing repository stack only:

* Next.js App Router
* React
* TypeScript Strict Mode
* Tailwind CSS
* Shadcn/UI
* React Hook Form
* Zod
* TanStack Query
* Zustand
* Supabase
* Existing toast and chart libraries

Do not introduce a new framework, UI library, styling system, form library, state library, chart library, or data-fetching library unless explicitly required.

## Architecture Rules

* Use Server Components by default.
* Add `"use client"` only when interactivity requires it.
* Keep `page.tsx` small and focused on route composition.
* Place domain UI in the relevant `features` folder.
* Keep business logic outside JSX.
* Reuse existing components before creating new ones.
* Do not duplicate routes, components, types, services, or schemas.
* Do not modify backend contracts, database schemas, authentication, authorization, or RLS unless explicitly requested.
* Do not refactor or rename unrelated files.

Typical structure:

```text
app/
  <route>/
    page.tsx
    loading.tsx
    error.tsx

features/
  <domain>/
    components/
    hooks/
    services/
    schemas/
    types/
    utils/
    constants/
```

Follow the actual repository structure when it differs.

## Prototype Fidelity

When a prototype is provided, treat it as the visual and functional source of truth.

Preserve:

* Layout
* Full-screen behavior
* Section order
* Information hierarchy
* Typography
* Spacing
* Cards and panels
* Tables
* Forms
* Tabs
* Status badges
* Buttons
* Sticky actions
* Filters
* Labels
* States
* Interactions
* Responsive intent

Do not:

* Redesign
* Simplify
* Modernize
* Reinterpret
* Remove required sections
* Replace the layout with a generic dashboard
* Change approved wording without a requirement

Fix only the differences required to match the prototype.

## Design Direction

Use existing design tokens first.

Approved Med AI NexSure direction:

* Primary: `#1E3A8A`
* Deep Blue: `#0F2A5F`
* AI Blue: `#2563EB`
* Accent: `#38BDF8`
* Background: `#F8FAFC`
* Soft Background: `#EFF6FF`
* Surface: `#FFFFFF`
* Border: `#E2E8F0`
* Primary Text: `#0F172A`
* Secondary Text: `#64748B`
* Success: `#059669`
* Warning: `#D97706`
* Danger: `#DC2626`

The interface should feel:

* Enterprise-grade
* Healthcare-aware
* Insurance-aware
* Trustworthy
* Structured
* Data-rich
* Audit-ready
* AI-enabled but not experimental

Avoid excessive gradients, glass effects, decorative animation, consumer-app styling, and low-information cards.

## Language Policy

Use approximately:

* English 70%
* Thai 30%

Use English for:

* Navigation
* Titles
* Section headings
* KPIs
* Module names
* Table columns
* Clinical, insurance, claim, compliance, and technical terms

Use Thai for:

* Helper text
* Warnings
* Validation
* Empty states
* User guidance
* Confirmation messages

Example:

```text
Claim Readiness
ประเมินความพร้อมของข้อมูลก่อนส่งเคลม
```

## Component Rules

* Use typed, focused, reusable components.
* Avoid large monolithic components.
* Use meaningful file and component names.
* Reuse Shadcn/UI components where available.
* Do not modify shared components for one page without checking all usages.
* Avoid `any`, unsafe assertions, and unnecessary non-null assertions.
* Handle `null`, `undefined`, and optional data safely.
* Do not invent API fields or domain data.

## Required UI States

Implement applicable states:

* Loading
* Success
* Empty
* Error
* Not Found
* Read-only
* Disabled
* Permission Denied
* Mutation Pending
* Mutation Success
* Mutation Failure

Do not leave blank pages, cards, or tables.

Use:

* Skeletons for initial loading
* Local indicators for mutations
* Clear empty-state guidance
* Retry actions where appropriate
* Safe, non-technical user errors

Do not expose stack traces, SQL errors, secrets, internal identifiers, or sensitive medical and claim information.

## Forms

Use existing form patterns, preferably React Hook Form and Zod.

Forms must include:

* Labels
* Required indicators
* Validation messages
* Helper text
* Loading and disabled states
* Duplicate-submit prevention
* Error and success feedback
* Safe default values

Preserve entered values after recoverable errors.

Use confirmation dialogs for destructive or high-impact actions.

## Accessibility

Maintain WCAG 2.2 AA principles where practical.

Ensure:

* Semantic HTML
* Logical heading structure
* Keyboard navigation
* Visible focus states
* Accessible labels
* Accessible icon buttons
* Table headers
* Dialog focus handling
* Sufficient contrast
* Status communication beyond color
* Meaningful error and success announcements

## Responsive Rules

Preserve the desktop prototype while keeping the page usable on smaller screens.

* Prevent unintended page overflow.
* Allow horizontal table scrolling when necessary.
* Stack secondary panels on smaller screens.
* Keep critical actions reachable.
* Preserve clinical, claim, warning, and compliance information.
* Do not hide essential data to force a mobile layout.

## RBAC and Security

Respect existing roles, permissions, and access scopes.

Possible roles include:

* Admin
* Doctor
* Nurse
* Pharmacist
* Clinic Staff
* Clinic Admin
* Clinic Manager
* Claim Reviewer
* Auditor
* Compliance Officer
* Executive

Rules:

* Do not rely on frontend hiding as the only security control.
* Reuse existing permission utilities.
* Do not expose unauthorized data.
* Do not bypass authentication, authorization, or RLS.
* Do not place sensitive data in URLs, console logs, local storage, toast messages, or client analytics.
* Do not render untrusted HTML without sanitization.

## Clinical Safety

AI output must be clearly separated from confirmed clinical data.

Where available, show:

* AI label
* Confidence
* Reasoning
* Supporting evidence
* Generated time
* Review status
* Human action

Use wording such as:

```text
AI Suggestion
Review required before confirmation.
```

Do not imply:

* Final diagnosis by AI
* Automatic treatment approval
* Automatic prescription approval

Critical alerts must remain prominent, including:

* Allergy conflicts
* Drug interactions
* Duplicate medication
* Dosage warnings
* Missing diagnosis
* Documentation inconsistency

## Insurance and Claim Safety

Claim and coverage output must be presented as decision support.

Allowed concepts:

* Readiness assessment
* Coverage indicator
* Risk signal
* Evidence gap
* Review recommendation
* Payer-rule validation

Do not imply:

* Final claim approval
* Final rejection
* Guaranteed coverage
* Guaranteed reimbursement

Preserve:

* Human review
* Reason codes
* Missing evidence
* Payer-rule references
* Status history
* Override reason
* Reviewer and timestamp where authorized
* Audit trail

## Claim Readiness

Support applicable information:

* Score
* Status
* Breakdown
* Missing evidence
* SOAP completeness
* Diagnosis and ICD consistency
* Prescription or procedure completeness
* Insurance rule alignment
* Economic justification
* Risk level
* Review recommendation
* Assessment time
* Reviewer status

MVP status mapping:

* Ready: `85–100`
* Needs Review: `60–84`
* Not Ready: `0–59`

Do not duplicate score logic inside presentation components.

Use existing services or domain utilities.

## Evidence Package

Evidence Package UI may include:

* SOAP
* Diagnosis
* ICD
* Prescription
* Procedure
* Medical Certificate
* Attachments
* Claim Summary
* Economic Summary
* Audit Summary

Clearly show:

* Included evidence
* Missing evidence
* Status
* Version
* Generated by
* Generated time
* Validation result
* Review status
* Export status

Do not mark a package complete when required evidence is missing.

## Auditability

Preserve applicable fields:

* Created by and time
* Updated by and time
* Reviewed by and time
* Previous and new values
* Change reason
* Version
* Source
* Status history

Do not fabricate audit data.

High-impact actions should collect a reason when required.

## Tables and Dashboards

Tables should support applicable:

* Search
* Filters
* Sorting
* Pagination
* Row actions
* Loading
* Empty
* Error
* Responsive scrolling
* Accessible headers

Dashboards must support decisions, not decoration.

Use suitable visualizations:

* KPI cards for current metrics
* Line charts for trends
* Bars for comparison
* Stacked bars for status composition
* Donuts for limited categories
* Heatmaps for risk concentration
* Pareto charts for prioritized causes
* Tables for operational work
* Timelines for activity history

Charts should include titles, labels, units, tooltips, legends when needed, loading states, and empty states.

## Scope and Git Safety

Make the smallest safe change.

Before editing:

```bash
git status
git diff
```

Protect existing uncommitted work.

Do not use destructive commands such as:

```bash
git reset --hard
git clean -fd
git checkout -- .
```

Do not stage, commit, or modify unrelated files.

When a target file already contains changes:

1. Inspect the diff.
2. Preserve compatible work.
3. Apply a focused change.
4. Report conflicts or assumptions.

## Validation

Use actual repository scripts.

Run applicable commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Do not claim success unless the command was executed and passed.

Distinguish failures caused by the current task from pre-existing failures.

## Required Completion Report

Report:

### Summary

What was implemented.

### Files Created

List new files or `None`.

### Files Modified

List changed files.

### Reused Modules

List important reused components, hooks, services, schemas, types, utilities, and design tokens.

### Functional Changes

Describe user-visible behavior.

### Prototype Fidelity

State what now matches and any remaining differences.

### Validation

Report each command separately:

```text
npm run lint: Passed / Failed / Not available
npm run typecheck: Passed / Failed / Not available
npm run test: Passed / Failed / Not configured
npm run build: Passed / Failed / Not run
```

### Risks or Limitations

State mocks, missing integrations, unresolved permissions, prototype ambiguity, pre-existing failures, or remaining risks.

### Unrelated Changes

Confirm that unrelated work was left untouched.

## Task Template

### Task Name

`[Task name]`

### Objective

`[Exact frontend result]`

### Target Route

`[Route]`

### Target Feature

`[Feature folder]`

### Prototype or Reference

`[HTML, screenshot, image, markdown, or specification]`

### Required Changes

1. `[Change 1]`
2. `[Change 2]`
3. `[Change 3]`

### Required States

`[Loading, Empty, Error, Permission Denied, Not Found, etc.]`

### User Roles

`[Authorized roles]`

### Data Source

`[Existing service, API, Supabase, or mock data]`

### Out of Scope

* `[Excluded item 1]`
* `[Excluded item 2]`

### Acceptance Criteria

1. Match the approved prototype or requirements.
2. Preserve existing architecture and design system.
3. Reuse existing modules where possible.
4. Modify only required files.
5. Preserve TypeScript Strict Mode.
6. Handle applicable UI states.
7. Preserve accessibility and responsive behavior.
8. Respect RBAC, PDPA, and sensitive-data rules.
9. Preserve human review and auditability.
10. Present AI, clinical, coverage, and claim output as decision support.
11. Run available validation commands.
12. Report results honestly.

## Final Instruction

Implement the requested task completely.

Prioritize:

1. Correctness
2. Patient and claim safety
3. Prototype fidelity
4. Access control
5. Auditability
6. Reuse
7. Accessibility
8. Responsive behavior
9. Maintainability
10. Minimal change

Do not redesign the approved prototype.

Do not modify unrelated files.

Do not present AI-assisted output as a final clinical, insurance, coverage, or claim decision.
