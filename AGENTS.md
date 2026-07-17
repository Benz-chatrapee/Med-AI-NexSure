# Med AI NexSure — Agent Governance
## 1. Purpose
This file defines mandatory project-level rules for AI-assisted work in the Med AI NexSure repository.
Every implementation task must be assessed by the Orchestrator before editing.
The Orchestrator must select only the minimum number of specialist agents required.
For trivial, low-risk changes, the Orchestrator may use a concise plan.
Detailed role instructions belong in `.agents/*.md`.
## 2. Project Overview
Med AI NexSure is an enterprise healthcare and insurance intelligence platform supporting clinical workflow, AI-assisted documentation, diagnosis and ICD coding, prescription safety, claim readiness, evidence completeness, insurance intelligence, economic intelligence, audit and compliance, and user access management.
The platform is decision support, not an autonomous medical decision-maker.
All clinical and insurance decisions must support Human-in-the-Loop review.
## 3. Core Principles
All implementations must preserve:
- Enterprise-grade reliability and clinical safety
- Human review, explainable AI, and traceable decisions
- Auditability and PDPA-aware data handling
- Least-privilege access and multi-tenant isolation
- Evidence-based claim readiness
- No autonomous diagnosis, medication decision, or claim decision
- No unauthorized exposure of sensitive data
AI may recommend, summarize, classify, or prioritize.
AI must not silently finalize high-risk decisions.
## 4. Technology Stack
Use the existing stack unless the task explicitly requires otherwise.
### Frontend
- Next.js App Router, React, and TypeScript strict mode
- Tailwind CSS and Shadcn/UI
- React Hook Form and Zod
- Sonner
- Zustand or TanStack Query when appropriate
### Backend and Data
- Next.js Route Handlers and Server Actions when appropriate
- Supabase, PostgreSQL, and Supabase Auth
- Row Level Security and SQL migrations
### Quality
- ESLint and TypeScript validation
- Production build validation
- Tests when configured
- Manual route and responsive checks
Do not add dependencies unless necessary, justified, and not already covered by the existing stack.
## 5. Project Structure
Follow the existing architecture.
```text
app/          Next.js routes and page composition
features/     Domain modules and business logic
components/   Shared reusable UI
lib/          Utilities, clients, and configuration
docs/         Product and prototype documentation
.agents/      Orchestrator and specialist instructions
```
Rules:
- Keep `page.tsx` focused on composition.
- Keep domain logic inside feature modules.
- Reuse existing components before creating new ones.
- Avoid monolithic components and split by responsibility.
- Keep feature types, schemas, hooks, and services near the feature.
- Do not duplicate constants, schemas, types, or business rules.
## 6. Architecture Rules
Before creating files, inspect the existing implementation.
Prefer:
1. Reuse
2. Extension
3. Small focused additions
4. New abstractions only when clearly needed
Do not:
- Replace working architecture without instruction
- Rewrite unrelated modules
- Create duplicate services or API contracts
- Introduce unnecessary global state
- Place business logic in presentational components
- Place privileged data operations in browser code
Route files should remain thin.
Business rules should be explicit, reusable, and testable.
Data access should follow existing centralized patterns.
## 7. TypeScript Rules
Preserve TypeScript strictness.
Never use:
- `any`
- `@ts-ignore`
- `@ts-nocheck`
- Unsafe assertions used only to silence errors
Prefer:
- Explicit domain types and reusable interfaces
- Discriminated unions and narrowed status types
- Typed API responses and form schemas
- Exhaustive state handling
- Runtime validation for external input
Do not weaken types to make a build pass.
## 8. Design System
All interfaces must follow the Med AI NexSure enterprise design language.
### Core Colors
- Primary `#1E3A8A`, Deep Blue `#0F2A5F`, AI Blue `#2563EB`
- Accent `#38BDF8`, Soft Background `#EFF6FF`
- App Background `#F8FAFC`, Surface `#FFFFFF`, Border `#E2E8F0`
- Primary Text `#0F172A`, Secondary Text `#64748B`
- Success `#059669`, Warning `#D97706`, Danger `#DC2626`
### Visual Direction
Use:
- Enterprise-grade, full-screen responsive layouts where appropriate
- Clear hierarchy and compact but readable spacing
- Accessible contrast and strong data readability
- Sticky actions for important forms and detail pages
Avoid:
- Flashy gradients and decorative clutter
- Excessive rounded cards or consumer-app styling
- Unrelated redesign
- Color-only status communication
## 9. Language Policy
Use approximately English 70% and Thai 30%.
Use English for navigation, page titles, section titles, KPI labels, module names, technical terms, table headers, and status names.
Use Thai for helper text, validation, warnings, empty states, user guidance, and contextual explanations.
Do not mix languages randomly inside one label.
## 10. Approved Prototype Policy
When a task references an approved prototype, screenshot, design file, HTML file, or approved page, preserve:
- Layout and information architecture
- Section order and business terminology
- Component hierarchy and intended interactions
- Routes, navigation, and existing business logic
Do not:
- Redesign the page or remove approved sections
- Rename approved labels without instruction
- Replace components unnecessarily
- Change visual direction
- Modify unrelated pages
- Introduce workflows outside scope
Only make explicitly requested changes.
## 11. Orchestrator Governance
Before implementation, read:
```text
AGENTS.md
.agents/orchestrator.md
```
The Orchestrator must:
- Identify the objective, Epic, module, and route when available
- Inspect only relevant files
- Identify approved prototypes and protected behavior
- Select the minimum required agents
- Define execution order and expected files to change
- Define task-appropriate validation
Planning must be proportional to complexity and risk.
Detailed task routing belongs in `.agents/orchestrator.md`.
## 12. Specialist Agents
Available specialist files may include:
```text
.agents/business-analyst.md
.agents/product-owner.md
.agents/solution-architect.md
.agents/ui-designer.md
.agents/frontend.md
.agents/backend.md
.agents/database.md
.agents/security-compliance.md
.agents/qa-tester.md
```
Use only agents required for the task.
Typical routing:
- UI-only or approved prototype: UI Designer, Frontend, QA
- Requirements: Business Analyst, Product Owner
- Backend API: Backend, Security when sensitive, QA
- Database migration: Database, Security, QA
- Full-stack: only relevant roles
Do not select all agents by default.
## 13. Change Control
### Before Editing
- Run `git status`.
- Inspect relevant files and confirm scope.
- Identify protected files, protected behavior, and expected files to change.
### During Editing
- Make the smallest viable change.
- Reuse existing components and follow existing patterns.
- Preserve routes, API contracts, and strict TypeScript.
- Avoid unrelated refactoring, unnecessary dependencies, and duplicate components.
- Avoid exposing secrets or bypassing authorization and RLS.
### After Editing
- Review changed files.
- Run `git diff` and `git status`.
- Confirm unrelated files were not modified.
- Compare results with the objective and approved prototype.
- Report unresolved issues honestly.
## 14. Frontend Standards
Frontend implementation must:
- Follow App Router conventions.
- Keep `page.tsx` focused on composition.
- Split large UI into feature components.
- Reuse Shadcn/UI and shared components.
- Use semantic HTML and accessible labels.
- Support keyboard navigation and visible focus.
- Include loading, error, empty, disabled, and validation states.
- Support desktop, tablet, and mobile.
- Avoid overflow and unnecessary client components.
- Use server components where appropriate.
Forms should use React Hook Form and Zod where consistent with the project.
Prevent duplicate submissions.
Preserve entered data after recoverable errors.
Confirm destructive actions.
## 15. Backend Standards
Backend implementation must:
- Validate all input.
- Verify authentication and authorization.
- Enforce organization and clinic scope.
- Avoid trusting client-provided roles or ownership.
- Use consistent, sanitized error handling.
- Log important security and business events.
- Preserve idempotency when relevant.
- Keep business logic separate from UI code.
- Avoid privileged database access from client code.
Never expose service-role credentials or raw database errors to users.
## 16. Database Standards
Database changes must:
- Use migrations.
- Include primary keys, foreign keys, and appropriate unique constraints.
- Include useful check constraints, timestamps, and indexes.
- Enforce tenant isolation and validate RLS.
- Avoid unrestricted policies.
- Avoid destructive changes without explicit instruction.
- Preserve existing data unless required.
- Include rollback considerations.
Verify referenced columns have compatible unique constraints.
Do not disable RLS as a shortcut.
## 17. Security and Compliance
Apply least privilege.
Never rely only on client-side permission checks.
Enforce authorization at the server or database layer.
Always involve Security guidance when work affects authentication, authorization, RBAC, RLS, password recovery, tokens, sessions, patient data, clinical data, insurance data, medical documents, file access, audit logs, or tenant isolation.
Sensitive actions may require:
- Audit logging
- Confirmation and rate limiting
- Session and ownership validation
- Sanitized errors
- Account-enumeration protection
Never commit secrets or `.env` files.
## 18. Clinical and Insurance Safety
AI-related implementations must:
- Identify AI-generated suggestions.
- Allow human review, correction, or rejection.
- Preserve source evidence and explanations when available.
- Record important user actions.
- Avoid confirmed-diagnosis presentation.
- Avoid autonomous medication or claim decisions.
- Warn when evidence is incomplete.
Claim-related implementations must:
- Preserve evidence traceability.
- Distinguish missing, invalid, and unverified evidence.
- Explain readiness scores.
- Preserve payer and policy context.
- Allow manual review and record override reasons.
- Preserve audit history.
Claim readiness is not claim approval.
## 19. Accessibility
All interfaces must:
- Use semantic HTML and labeled fields.
- Support keyboard navigation and visible focus.
- Name icon-only actions.
- Maintain sufficient contrast.
- Avoid color-only status communication.
- Present validation clearly.
Accessibility is part of the Definition of Done.
## 20. Validation Strategy
Inspect available scripts first:
```bash
npm run
```
Run only validation relevant to changed files.
For application code, use applicable commands:
```bash
npm run lint
npx tsc --noEmit
npm run build
```
Run tests only when a real test script and framework are configured:
```bash
npm run test
```
Rules:
- Do not run scripts not defined in `package.json`.
- A missing script is not a code failure.
- Do not claim tests passed without a test setup.
- Do not claim validation passed unless it ran successfully.
- Documentation-only changes do not require a build.
- UI-only changes do not require database validation.
- Database-only changes do not require frontend validation unless contracts changed.
- Manually verify routes when practical.
- Verify responsiveness for UI changes.
## 21. Git Rules
Before editing:
```bash
git status
```
After editing:
```bash
git diff
git status
```
Do not:
- Commit unrelated files.
- Delete uncommitted user work.
- Reset without explicit instruction.
- Force-push or rewrite history.
- Commit secrets, `.env` files, or unnecessary generated files.
Do not commit or push automatically unless explicitly requested.
## 22. Definition of Done
A task is complete only when:
- The requested outcome is implemented.
- Scope remains within the request.
- Existing architecture is preserved.
- Prototype fidelity is preserved when applicable.
- No unrelated Epic is changed.
- No unnecessary dependency is added.
- No duplicate component or service is introduced.
- TypeScript strictness is preserved.
- Security controls remain intact.
- Acceptance criteria are met.
- Applicable validation passes.
- Manual route verification is completed when practical.
- Responsive behavior is verified for UI work.
- Changed files and remaining issues are reported.
## 23. Instruction Priority
When instructions conflict, follow:
1. Explicit user instruction
2. `AGENTS.md`
3. `.agents/orchestrator.md`
4. Relevant specialist file
5. Existing project conventions
Security, privacy, tenant isolation, and clinical safety must never be bypassed.
## 24. Final Reporting
The final response should include:
### Completed
Describe the implemented result.
### Agents Used
List only agents actually used.
### Files Changed
List only files actually modified.
### Validation Results
Report only checks actually performed: lint, TypeScript, tests, build, manual verification, responsive verification, and prototype fidelity.
### Remaining Issues
State unresolved issues honestly.
If none, write:
`None`