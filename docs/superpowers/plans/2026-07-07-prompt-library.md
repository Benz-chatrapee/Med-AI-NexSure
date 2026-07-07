# Med AI nexSure Prompt Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-capable Prompt Library MVP on Next.js 16 and Supabase with immutable revisions, full-text/partial search, Card Grid CRUD workflows, and archive-only deletion.

**Architecture:** Next.js Server Components read through a repository/service boundary; React 19 forms call Server Actions that re-authorize and delegate mutations to the service. Supabase PostgreSQL RPC functions own atomic versioning, optimistic concurrency, archive, and audit invariants. Mock identity and capability adapters are replaceable without changing UI contracts.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Supabase JS/SSR, PostgreSQL, Zod, Vitest, Testing Library, Playwright.

## Global Constraints

- Read relevant local Next.js 16 documentation under `node_modules/next/dist/docs/` before using an unfamiliar API; do not rely on older Next.js conventions.
- Main list uses `v_active_current_prompts` and returns only `is_current_version = true`, `status = 'active'`, `archived_at IS NULL`, and `deleted_at IS NULL`.
- Revisions are immutable; create starts at `1.0`, and each MVP edit increments the minor version exactly once.
- Archive is the only delete operation; no UI, service, RPC, policy, or repository API may hard-delete prompts or revisions.
- Every Server Action obtains identity and capabilities on the server even when the UI hides an unauthorized action.
- Supabase secrets stay server-only; no service-role key is exposed through `NEXT_PUBLIC_*` variables.
- Search covers name, code, category, description, content, and tags using GIN full-text search plus `pg_trgm` partial matching.
- Prompt Library uses Card Grid; Add/Edit use dedicated pages; editing is labeled `Save New Version`.
- Every implementation task follows red-green-refactor TDD and ends with a focused commit.

---

### Task 1: Test Harness, Dependencies, and Application Shell

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tests/app/home.test.tsx`
- Create: `.env.example`

**Interfaces:**
- Consumes: Next.js 16 App Router baseline.
- Produces: `npm test`, `npm run test:coverage`, `npm run test:e2e`; root redirect to `/prompts`; shared visual tokens and metadata.

- [ ] **Step 1: Install runtime and test dependencies**

Run:

```powershell
npm install @supabase/ssr @supabase/supabase-js zod
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Expected: lockfile updates and npm exits 0.

- [ ] **Step 2: Write the failing shell test**

Create `tests/app/home.test.tsx` asserting exported metadata title is `Med AI nexSure | Prompt Library` and that `Home()` redirects to `/prompts` by mocking `next/navigation.redirect`.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- tests/app/home.test.tsx`

Expected: FAIL because the scripts/config and new metadata/redirect do not exist.

- [ ] **Step 4: Add the test configuration and shell**

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

Configure Vitest for `jsdom`, `@/*` alias, and `vitest.setup.ts`. Update root metadata and Thai-capable typography, replace starter CSS with accessible enterprise healthcare tokens, and make `app/page.tsx` call `redirect('/prompts')`. Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`, each blank and documented.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/app/home.test.tsx; npm run lint`

Expected: test PASS and lint exits 0.

Commit: `chore: set up prompt library foundation`

---

### Task 2: Enterprise Supabase Schema and Database Invariants

**Files:**
- Create: `supabase/migrations/202607070001_prompt_library.sql`
- Create: `supabase/seed.sql`
- Create: `tests/database/prompt-library-schema.test.ts`

**Interfaces:**
- Consumes: approved data model.
- Produces: tables `organizations`, `clinics`, `prompt_categories`, `prompts`, `prompt_versions`, `audit_logs`, `prompt_embeddings`; view `v_active_current_prompts`; RPCs `search_active_prompts`, `create_prompt`, `create_prompt_version`, and `archive_prompt`.

- [ ] **Step 1: Write schema contract tests**

Read the migration as text and assert it contains: `pg_trgm`; all seven tables; RLS enablement; the active-current view predicates; a partial unique current-version index; GIN FTS and trigram indexes; immutable revision trigger; three RPC functions; and no `delete from prompts` or `delete from prompt_versions` statement.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/database/prompt-library-schema.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Implement the migration**

Use UUID primary keys and timestamptz audit fields. Define constrained enums or checks for active/inactive, approval status, and risk. Store tags as normalized `text[]`. Add generated weighted `tsvector` covering the six required search sources, GIN index for the vector, and `gin_trgm_ops` indexes for partial matching. Define the view with the four required predicates and `search_active_prompts` with scoped query, category/tag filters, whitelisted sorting, total count, and bounded pagination. Add a partial unique index on `prompt_versions(prompt_id) WHERE is_current_version`.

`create_prompt` must insert identity, revision `1.0`, set `current_version_id`, and append audit in one transaction. `create_prompt_version` must lock the prompt/current revision, compare the submitted revision ID, mark the former current false, insert minor+1, switch the pointer, and append audit. `archive_prompt` must require nonblank reason and append audit. Revoke direct mutation of revisions from application roles and reject revision UPDATE/DELETE through a trigger, allowing only controlled current-flag transition from the version RPC.

- [ ] **Step 4: Add seed taxonomy**

Seed one default organization and the eight approved category codes/names using idempotent inserts.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/database/prompt-library-schema.test.ts`

Expected: PASS.

Commit: `feat: add enterprise prompt database schema`

---

### Task 3: Domain Contracts, Query Parsing, Validation, and Identity

**Files:**
- Create: `features/prompts/domain/types.ts`
- Create: `features/prompts/domain/errors.ts`
- Create: `features/prompts/domain/schemas.ts`
- Create: `features/prompts/domain/query.ts`
- Create: `features/auth/identity.ts`
- Create: `features/auth/capabilities.ts`
- Create: `tests/features/prompts/domain.test.ts`
- Create: `tests/features/auth/adapters.test.ts`

**Interfaces:**
- Produces: `PromptListItem`, `PromptDetail`, `PromptFormValues`, `PromptQuery`, `ActionState`; `parsePromptQuery(searchParams)`; `promptFormSchema`; `getCurrentIdentity()`; `getPromptCapabilities(identity)`.

- [ ] **Step 1: Write failing domain tests**

Cover required fields, code format `^[A-Z0-9][A-Z0-9_-]{2,49}$`, nonempty content, deduplicated lowercase tags, allowed statuses, bounded `pageSize` (12 default, 48 maximum), sort whitelist, repeated categories/tags, invalid query fallback, mock identity stability, and all-three MVP capabilities.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/features/prompts/domain.test.ts tests/features/auth/adapters.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement minimal domain modules**

Define serializable types with ISO timestamp strings. Use Zod transforms to normalize tags and query parameters. Define stable errors `VALIDATION`, `DUPLICATE_CODE`, `NOT_FOUND`, `ARCHIVED`, `CONFLICT`, `FORBIDDEN`, and `DATABASE`. Mark identity modules `server-only`; return a fixed UUID actor and default organization UUID matching the seed. Capabilities are `{ create: true, update: true, archive: true }`.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/features/prompts/domain.test.ts tests/features/auth/adapters.test.ts; npm run lint`

Expected: PASS and lint exits 0.

Commit: `feat: add prompt domain contracts`

---

### Task 4: Supabase Repository and Prompt Service

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `features/prompts/server/repository.ts`
- Create: `features/prompts/server/service.ts`
- Create: `tests/features/prompts/service.test.ts`
- Create: `tests/features/prompts/repository.test.ts`

**Interfaces:**
- Consumes: Task 2 RPC/view names and Task 3 domain types.
- Produces: `listCategories(identity)`, `listPrompts(query, identity)`, `getPrompt(id, identity)`, `createPrompt(input, identity)`, `updatePrompt(id, expectedRevisionId, input, identity)`, `archivePrompt(id, reason, identity)`.

- [ ] **Step 1: Write failing service/repository tests**

Mock the repository port. Assert capability enforcement, tenant scoping, error mapping, create/update/archive delegation, expected-revision forwarding, view-only list reads, sanitized pagination range, whitelisted ordering, and search RPC/query parameter forwarding.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/features/prompts/service.test.ts tests/features/prompts/repository.test.ts`

Expected: FAIL with missing implementations.

- [ ] **Step 3: Implement server-only Supabase client and repository**

Create two explicit server-only factories: a cookie-aware `@supabase/ssr` user client for the future authenticated phase, and a service-role client used only by the mock-identity MVP repository. The latter must never be imported by Client Components and must always receive organization/clinic scope from the service. Repository listing calls `search_active_prompts`; category listing reads active taxonomy rows; repository mutations call only the three mutation RPCs. Map Postgres codes/custom RPC errors to domain errors; never expose raw messages to the UI.

- [ ] **Step 4: Implement service authorization and validation**

Re-validate all inputs in the service. Check capabilities before repository calls and require organization scope from identity. Preserve stable return/error contracts.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/prompts/service.test.ts tests/features/prompts/repository.test.ts; npm run lint`

Expected: PASS and lint exits 0.

Commit: `feat: add prompt service and Supabase repository`

---

### Task 5: Prompt Library Card Grid, Search, Filters, and Pagination

**Files:**
- Create: `app/prompts/page.tsx`
- Create: `app/prompts/loading.tsx`
- Create: `app/prompts/error.tsx`
- Create: `features/prompts/components/prompt-card.tsx`
- Create: `features/prompts/components/prompt-filters.tsx`
- Create: `features/prompts/components/pagination.tsx`
- Create: `features/prompts/components/library-states.tsx`
- Create: `tests/features/prompts/library.test.tsx`

**Interfaces:**
- Consumes: `parsePromptQuery`, `listPrompts`, and category data.
- Produces: `/prompts` Server Component and URL-driven Client Component controls.

- [ ] **Step 1: Write failing UI tests**

Test card metadata, PHI warning, Add Prompt link, category multi-select, tag/search controls, sort options, page links preserving query state, populated grid, empty library, no-results, loading skeleton, and recoverable error UI.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/features/prompts/library.test.tsx`

Expected: FAIL with missing components.

- [ ] **Step 3: Implement the Server Component page**

Treat `searchParams` as a Promise per Next.js 16. Parse once, fetch server-side, and render semantic headings, controls, result count, responsive card grid, and pagination. Cards show name, code, category, shortened description, tags, version, and last updated and link to `/prompts/[id]`.

- [ ] **Step 4: Implement URL controls and states**

Keep client boundaries narrow. Update URL parameters with `useRouter`, `usePathname`, and `useSearchParams`, reset page on filter changes, debounce text search, and preserve accessible labels/focus. Implement skeleton, add-first-prompt, clear-filters, and retry states.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/prompts/library.test.tsx; npm run lint`

Expected: PASS and lint exits 0.

Commit: `feat: build prompt library grid`

---

### Task 6: Create and Edit Dedicated Pages with Server Actions

**Files:**
- Create: `app/prompts/actions.ts`
- Create: `app/prompts/new/page.tsx`
- Create: `app/prompts/[id]/edit/page.tsx`
- Create: `features/prompts/components/prompt-form.tsx`
- Create: `features/prompts/components/submit-button.tsx`
- Create: `tests/features/prompts/actions.test.ts`
- Create: `tests/features/prompts/prompt-form.test.tsx`

**Interfaces:**
- Consumes: identity/capabilities, prompt service, form schema.
- Produces: `createPromptAction(previousState, formData)` and `updatePromptAction(id, expectedRevisionId, previousState, formData)` returning serializable `ActionState` on expected errors.

- [ ] **Step 1: Write failing action and form tests**

Cover server-side identity lookup, unauthorized rejection, validation field errors, preservation of submitted values, duplicate code, conflict message, service calls, `revalidatePath`, redirect, create label, edit label `Save New Version`, hidden expected revision ID, pending button, and category/status fields.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/features/prompts/actions.test.ts tests/features/prompts/prompt-form.test.tsx`

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement Server Actions**

Use `'use server'`, `useActionState` compatible signatures, `FormData`, server-side identity/capability checks, Zod validation, domain-error mapping, `revalidatePath('/prompts')`, detail-path revalidation for edits, and `redirect` only after success. Never trust actor, scope, or authorization values from hidden fields.

- [ ] **Step 4: Implement dedicated forms**

Use a focused Client Component only for `useActionState` and tag interaction. Render field-level errors with `aria-describedby`, retain submitted values, show the PHI/PII warning, and disable submission while pending. Prompt code is editable on create and read-only on edit.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/prompts/actions.test.ts tests/features/prompts/prompt-form.test.tsx; npm run lint`

Expected: PASS and lint exits 0.

Commit: `feat: add prompt create and versioned edit flows`

---

### Task 7: Prompt Detail, Clipboard Copy, and Archive Workflow

**Files:**
- Create: `app/prompts/[id]/page.tsx`
- Create: `app/prompts/[id]/not-found.tsx`
- Create: `features/prompts/components/copy-prompt-button.tsx`
- Create: `features/prompts/components/archive-prompt-dialog.tsx`
- Modify: `app/prompts/actions.ts`
- Create: `tests/features/prompts/prompt-detail.test.tsx`
- Create: `tests/features/prompts/archive-action.test.ts`

**Interfaces:**
- Consumes: `getPrompt`, `archivePrompt`, identity/capability adapters.
- Produces: prompt detail route, browser clipboard action, and `archivePromptAction(id, previousState, formData)`.

- [ ] **Step 1: Write failing detail/archive tests**

Test complete current metadata, content rendering, capability-driven Edit/Archive actions, not-found handling, clipboard call and success toast, archive impact text, required reason, actor lookup, audit-capable service delegation, error preservation, revalidation, and redirect.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/features/prompts/prompt-detail.test.tsx tests/features/prompts/archive-action.test.ts`

Expected: FAIL with missing components/actions.

- [ ] **Step 3: Implement detail and copy**

Await `params` per Next.js 16, fetch the current prompt, and call `notFound()` for missing/archived results. Keep clipboard access in a small Client Component, announce success through an `aria-live` toast, and copy only `prompt_content`.

- [ ] **Step 4: Implement archive confirmation and action**

Use an accessible dialog/form that explains removal from the active library and requires `archived_reason`. The Server Action re-authorizes, delegates to the archive RPC through the service, revalidates list/detail paths, and redirects to `/prompts` after success.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/prompts/prompt-detail.test.tsx tests/features/prompts/archive-action.test.ts; npm run lint`

Expected: PASS and lint exits 0.

Commit: `feat: add prompt detail copy and archive flows`

---

### Task 8: End-to-End Coverage, Operational Documentation, and Final Verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/prompt-library.spec.ts`
- Create: `tests/e2e/prompt-concurrency.spec.ts`
- Create: `tests/database/prompt-library.integration.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: complete Prompt Library.
- Produces: reproducible local setup, database migration instructions, and automated critical-path verification.

- [ ] **Step 1: Write failing E2E tests**

Implement Add → Search → Filter → View → Edit/Save New Version → Copy → Archive, then assert the archived prompt disappears. Implement two-page stale-edit contention and assert the second save reports a conflict without losing its form values. Add database integration cases that execute the RPCs against a disposable Supabase project and prove immutable history, one-current-version enforcement, archive audit insertion, active-view filtering, FTS/trigram matching, and transaction rollback.

- [ ] **Step 2: Run E2E to verify failure or environment blocker**

Run: `npm run test:e2e`

Expected before completion: FAIL until the application and disposable Supabase test project are configured. If credentials are absent, record this exact external prerequisite; do not replace Supabase with an in-memory production fallback.

- [ ] **Step 3: Document setup and operations**

Document required environment variables, applying migration/seed, running dev/test/lint/build/E2E, mock identity boundaries, archive-only semantics, immutable revisions, PHI prohibition, and the deferred feature list.

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: all unit/component/schema tests pass; lint and production build exit 0; E2E passes when the disposable Supabase environment is configured.

- [ ] **Step 5: Commit**

Commit: `test: cover prompt library workflows`
