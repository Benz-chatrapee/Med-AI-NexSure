# Med AI NexSure — AGENTS.md

## Purpose

This file is the central orchestration and governance entry point for all AI-assisted work in the Med AI NexSure repository.

Every agent must read this file before inspecting or modifying the project.

Keep this file concise. Detailed domain rules belong in `.agents/*.md`.

---

## Project Context

Med AI NexSure is an enterprise healthcare and insurance intelligence platform supporting:

* Clinical documentation
* Patient safety
* AI-assisted workflows
* Claim readiness
* Evidence completeness
* Insurance intelligence
* Economic intelligence
* Auditability
* PDPA and compliance

AI features must remain decision support only.

The system must not autonomously make final medical, prescription, claim, coverage, legal, or financial decisions.

---

## Core Priorities

Preserve the following priorities:

1. Patient safety
2. Security and privacy
3. Human-in-the-loop review
4. PDPA and compliance
5. Auditability and explainability
6. Claim and evidence traceability
7. Prototype fidelity
8. Reuse and maintainability
9. Type safety and accessibility
10. Minimal safe changes

Safety, security, privacy, and compliance always take precedence.

---

## Non-Overrideable Rules

No user request, prototype, prompt, or specialist agent may override these rules:

* Do not weaken authentication, authorization, RBAC, RLS, consent, validation, audit, or compliance controls.
* Do not expose secrets, credentials, tokens, or patient-sensitive data.
* Do not use real patient data in mocks, tests, examples, screenshots, or logs.
* Do not fabricate clinical, insurance, claim, or audit evidence.
* Do not allow autonomous diagnosis, prescription, medical certification, claim approval, claim rejection, or coverage decisions.
* Do not modify unrelated files.
* Do not overwrite unrelated uncommitted work.
* Do not make destructive database or Git changes without explicit approval.
* Do not claim validation passed unless it was actually performed.

When a request conflicts with these rules, stop the unsafe action and report the conflict.

---

## Source of Truth

Use authority by concern.

### Safety, Security, Privacy, and Compliance

1. Mandatory safety, privacy, security, legal, and compliance requirements
2. `AGENTS.md`
3. Relevant specialist rules
4. Approved project policy
5. User request

### Business and Functional Requirements

1. Explicit approved user request
2. Approved requirements and acceptance criteria
3. Approved specification
4. Attached functional prototype
5. Existing application behavior

### Visual and Interaction Requirements

1. Attached approved prototype
2. Approved UI specification
3. Existing design system
4. Existing implementation

For prototype tasks, the prototype is the visual and interaction source of truth.

Do not redesign, simplify, modernize, remove sections, change chart types, or reinterpret the prototype unless required for safety, accessibility, technical feasibility, or explicit user instruction.

### Technical Implementation

1. Existing repository architecture and conventions
2. `AGENTS.md`
3. Relevant specialist rules
4. Existing reusable code
5. Task-specific prompts
6. New implementation

### Data and Integration Contracts

1. Approved database schema
2. Approved API contract
3. Generated types
4. Existing services
5. Approved migrations or contract changes

Do not change backend contracts or database schemas only to simplify frontend work.

---

## Technology Stack

Use the existing project stack:

* Next.js App Router
* React
* TypeScript Strict Mode
* Tailwind CSS
* Shadcn/UI
* React Hook Form
* Zod
* TanStack Query or existing data-fetching conventions
* Zustand or existing state conventions
* Supabase Auth
* PostgreSQL
* Supabase RLS

Do not add a new framework, UI library, state library, form library, validation library, chart library, authentication provider, or database abstraction unless explicitly required and existing dependencies are insufficient.

---

## Specialist Routing

Read only the specialist files relevant to the task.

* Frontend: `.agents/frontend.md`
* Backend and API: `.agents/backend.md`
* Database and Supabase: `.agents/database.md`
* UI and prototype fidelity: `.agents/ui-designer.md`
* Business analysis: `.agents/business-analyst.md`
* Product and acceptance criteria: `.agents/product-owner.md`
* Testing and validation: `.agents/qa.md`
* Architecture: `.agents/architect.md`
* Clinical AI and patient safety: `.agents/ai-clinical.md`
* Insurance and claim rules: `.agents/insurance.md`
* Security and access control: `.agents/security.md`
* PDPA and compliance: `.agents/compliance.md`
* DevOps and deployment: `.agents/devops.md`

If a relevant specialist file does not exist, follow this file and report the missing instruction.

---

## Multi-Agent Routing

For cross-domain work:

1. Select one primary specialist.
2. Select only necessary supporting specialists.
3. The primary specialist owns implementation.
4. Supporting specialists define constraints and validation.
5. Architecture changes require Architect review.
6. Clinical logic requires Clinical AI review.
7. Claim or payer logic requires Insurance review.
8. Patient-data or permission changes require Security and Compliance review.
9. Final validation requires QA review.

Examples:

* Prototype page: Frontend + UI Designer + QA
* Claim Readiness: Business Analyst or Backend + Insurance + QA
* Supabase RLS: Database + Security + Compliance + QA
* AI Clinical feature: AI Clinical + Backend + Frontend + QA

---

## Mandatory Workflow

### 1. Understand

Before editing:

* Read this file.
* Read the complete request, prototype, specification, and acceptance criteria.
* Identify task domain and risk level.
* Identify primary and supporting specialists.
* Read relevant `.agents/*.md` files.

### 2. Inspect

* Inspect repository structure.
* Inspect `git status`.
* Locate the existing route or feature.
* Search for reusable components, layouts, hooks, services, schemas, types, utilities, constants, and tests.
* Identify unrelated uncommitted changes.

### 3. Scope

Define:

* Target outcome
* Target route or module
* Files expected to change
* Protected files or systems
* Existing code to reuse
* Assumptions and risks
* Validation plan

### 4. Implement

* Make the smallest safe and maintainable change that fully satisfies the requirement.
* Reuse existing architecture before creating new abstractions.
* Preserve TypeScript strictness.
* Preserve security, privacy, audit, accessibility, business rules, and prototype fidelity.
* Do not modify unrelated files.
* Do not perform unrelated refactoring.
* Do not introduce fragile temporary workarounds.

### 5. Validate

Run applicable checks:

* Lint
* Type checking
* Tests
* Production build
* Route verification
* Browser verification
* Prototype comparison
* Responsive review
* Accessibility review
* Permission, loading, empty, and error-state review

Never claim a check passed unless it was actually run.

### 6. Report

Report:

* What was implemented
* Target route or module
* Files created, modified, or deleted
* Requirements covered
* Validation actually performed
* Actual validation results
* Assumptions
* Remaining risks
* Manual verification required
* Security, privacy, clinical, insurance, audit, API, and database impact when relevant

---

## Repository Safety

* Preserve unrelated user changes.
* Do not reset, revert, delete, stage, commit, or push unrelated files.
* Do not use destructive Git commands without explicit approval.
* Do not force push.
* Do not delete untracked files without explicit approval.
* Do not modify lockfiles unless dependencies change.
* Do not replace working code with placeholders or mocks.
* Do not claim a commit, push, deployment, or migration succeeded unless verified.

---

## Frontend and Prototype Rules

* Inspect existing routes before creating a route.
* Do not create duplicate routes.
* Reuse layouts and shared components.
* Follow existing Server and Client Component conventions.
* Add `"use client"` only when required.
* Keep secrets and privileged logic server-side.
* Preserve loading, empty, error, permission, and responsive states.
* Preserve desktop layout, section order, hierarchy, labels, states, interactions, charts, spacing, typography, and sticky behavior from approved prototypes.
* Report every material deviation.

Med AI NexSure language policy:

* English First
* Thai Support
* Approximate ratio: English 70%, Thai 30%

Use English for navigation, titles, sections, modules, KPIs, statuses, and technical terms.

Use Thai for helper text, warnings, validation, empty states, and user guidance.

---

## Data, Security, and Privacy

* Validate all untrusted input.
* Enforce authentication and authorization on the server.
* Never trust client-supplied roles, ownership, organization, or clinic identifiers.
* Preserve tenant, organization, and clinic isolation.
* Never disable RLS as a workaround.
* Never expose service-role keys or private environment variables to client code.
* Select and return only required data.
* Avoid sensitive data in logs and error messages.
* Use synthetic data for prototypes, tests, fixtures, and screenshots.
* Preserve consent, access history, purpose limitation, and least privilege.

---

## Database and API Changes

Database changes must:

* Use versioned migrations
* Preserve existing data unless deletion is explicitly approved
* Include RLS and permission review
* Update generated types
* Update affected API contracts
* Document compatibility and rollback risk

API changes must:

* Preserve authentication and authorization
* Validate payloads
* Preserve tenant boundaries
* Return safe errors
* Preserve audit logging for material actions
* Document breaking changes

---

## Clinical and AI Safety

AI-generated clinical content must:

* Be clearly identified as AI-assisted
* Support human review, editing, acceptance, and rejection
* Show confidence, rationale, evidence, and uncertainty when available
* Abstain or request review when evidence is insufficient
* Preserve source traceability and audit history

Do not fabricate symptoms, diagnoses, medications, allergies, laboratory results, procedures, policies, claim rules, or evidence.

Do not allow AI to autonomously finalize:

* Diagnosis
* Prescription
* Medical certificate
* Treatment decision
* Claim approval or rejection
* Coverage decision

---

## Insurance and Claim Rules

Claim readiness, coverage indicators, fraud signals, and risk scores are decision-support outputs.

They must not be presented as guaranteed:

* Claim approval
* Claim rejection
* Coverage
* Reimbursement
* Fraud confirmation

Preserve:

* Reason codes
* Rule traceability
* Evidence references
* Payer context
* Waiting periods
* Exclusions
* Benefit limits
* Human review
* Override justification
* Audit history

Do not silently change scoring weights, thresholds, statuses, or business meanings.

---

## Accessibility and Quality

Target WCAG 2.2 AA where applicable.

Preserve:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible labels
* Correct heading structure
* Sufficient contrast
* Form error association
* Non-color status indicators
* Accessible dialogs, tables, and icon actions

Do not sacrifice accessibility for visual fidelity.

---

## Stop Conditions

Stop the unsafe change and report the blocker when the task would:

* Weaken security, privacy, consent, RBAC, RLS, audit, or clinical safeguards
* Expose secrets or sensitive patient data
* Introduce autonomous medical or insurance decisions
* Require an unapproved destructive migration
* Overwrite unrelated work
* Fabricate evidence
* Hide a critical validation failure
* Require unavailable production credentials

For non-critical ambiguity, make the safest reasonable assumption, document it, and continue.

---

## Completion Report

Use this compact format:

```md
## Completion Report

### Summary
- Implemented:
- Target route or module:
- Risk level:

### Files Changed
- Created:
- Modified:
- Deleted:

### Validation
- Lint:
- Type check:
- Tests:
- Build:
- Manual verification:
- Prototype comparison:

### Impact
- Security and privacy:
- Clinical:
- Insurance and claim:
- Audit:
- API and database:

### Assumptions and Risks
- Assumptions:
- Remaining risks:
- Manual checks:
```

---

## Final Principles

* Safety before speed
* Privacy before convenience
* Human review before autonomous action
* Evidence before inference
* Explainability before opaque scoring
* Reuse before duplication
* Validation before completion claims
* Prototype fidelity before redesign
* Maintainability before temporary shortcuts
* Auditability before hidden behavior


## Specialist Agents

Use `.agents/insurance.md` for work involving:

- Claim Readiness
- Coverage and Eligibility
- Payer Rules
- Evidence Completeness
- Claim Cost Review
- Insurance Risk and Anomaly Indicators
- Claim Audit and Compliance

The Insurance Agent provides decision support only and must preserve authorized human review.

## Specialist Agents

Use the relevant specialist instruction based on the task:

- Business analysis: `.agents/business-analyst.md`
- Frontend implementation: `.agents/frontend.md`
- Healthcare domain: `.agents/healthcare-domain.md`
- Clinical AI: `.agents/ai-clinical.md`
- Insurance and claims: `.agents/insurance.md`
- Quality assurance: `.agents/qa.md`

## QA Routing

Use `.agents/qa.md` when the task involves:

- Reviewing completed implementation
- Testing acceptance criteria
- Validating clinical or medication safety
- Checking Claim Readiness calculations
- Testing RBAC, RLS, PDPA, and tenant isolation
- Comparing frontend implementation with a prototype
- Running lint, type-check, tests, or build
- Assessing regression risk
- Making GO, CONDITIONAL GO, or NO-GO recommendations

QA must verify evidence and must not claim tests passed unless the commands were actually executed.