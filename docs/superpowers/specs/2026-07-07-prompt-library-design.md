# Med AI nexSure Prompt Library — Design Specification

## 1. Objective

Build the first production-capable Prompt Library for Med AI nexSure. The MVP lets an authenticated-equivalent team member create, find, view, edit, copy, and archive shared medical prompts. Authentication is mocked in this phase, but application boundaries and the database model must support Supabase Auth, RBAC, organizations, clinics, governance, audit, and approval workflows without redesigning the UI or service layer.

## 2. MVP Scope

### Included

- Shared team library; all mock users have equal capabilities.
- Create prompts.
- View the active current version of a prompt.
- Edit by creating an immutable new revision.
- Archive with a required reason; no hard delete path.
- Keyword, full-text, and partial-match search.
- Standard read-only medical categories.
- Category and tag filtering, server-side pagination, and sorting.
- Copy prompt content to the clipboard with success feedback.
- Mock identity/capability adapters replaceable by Supabase Auth and RBAC.

### Deferred UI

- Login, account management, Supabase Auth, and real RBAC.
- Category management.
- Version history, comparison, rollback, and audit-log screens.
- Archived-prompt recovery.
- Approval workflow UI.
- Updated-by and updated-date-range filters.
- Semantic/vector search.
- Infinite scrolling.

## 3. Approved Architecture

Use Next.js Server Components and Server Actions over an application service/repository layer backed by Supabase PostgreSQL.

```text
Server Components / Forms
        |
Server Actions
        |
Prompt Service + Identity/Capability Adapters
        |
Supabase Repository / PostgreSQL RPC Functions
        |
Tables, views, indexes, constraints, audit log
```

Server Components read library and detail data. Server Actions validate mutation inputs and call the prompt service. Business rules live in the service and database functions rather than React components. Version creation, current-version switching, concurrency checking, and audit insertion execute in one PostgreSQL transaction.

The identity adapter returns a stable mock actor in the MVP. The capability adapter grants all prompt capabilities. Replacing these adapters with Supabase session and RBAC implementations must not alter UI contracts.

## 4. Data Model

### `organizations`

Reserved tenant boundary with `id`, `code`, `name`, lifecycle timestamps, and archive metadata. Seed one default organization for the MVP.

### `clinics`

Optional child scope with `id`, `organization_id`, `code`, `name`, lifecycle timestamps, and archive metadata. A prompt may be organization-wide when `clinic_id` is null.

### `prompt_categories`

Read-only MVP taxonomy with stable `id`, `code`, `name`, `description`, `display_order`, and `is_active`. Seed these categories:

1. Clinical Documentation
2. Clinical Decision Support
3. Medical Coding
4. Claims & Utilization Review
5. Insurance Operations
6. Compliance & Governance
7. Patient Education
8. Research & Evidence

### `prompts`

The stable identity and lifecycle record:

- `id`
- `organization_id`, nullable `clinic_id`
- unique `prompt_code` within organization scope
- `owner_role`
- `current_version_id`
- `usage_count`, `last_used_at`
- `created_by`, `created_at`, `updated_by`, `updated_at`
- `archived_at`, `archived_by`, `archived_reason`
- `deleted_at`, `deleted_by`

Hard deletion is forbidden. MVP Archive sets archive metadata; `deleted_*` remains available for a distinct future soft-delete state.

### `prompt_versions`

Immutable revision content:

- `id`, `prompt_id`
- `version_major`, `version_minor`, human-readable `version_label`
- `is_current_version`
- `name`, `description`, `prompt_content`
- `category_id`, `tags`
- `status`: `active` or `inactive`
- `approval_status`, `approved_by`, `approved_at`
- `risk_level`, `compliance_note`
- `created_by`, `created_at`

The first revision is `1.0`. Each MVP edit increments the minor version (`1.1`, `1.2`, and so on). Major-version promotion is deferred. Existing revisions cannot be updated or deleted. A partial unique index enforces at most one `is_current_version = true` revision per prompt.

### `audit_logs`

Append-only events containing actor, action, entity type/id, organization/clinic scope, correlation ID, timestamp, and structured before/after or contextual metadata. Create, new-version, archive, and future restore actions write audit events.

### `prompt_embeddings`

Optional future semantic-search records keyed by prompt version and embedding model. Keeping embeddings outside core revision rows permits re-embedding without mutating immutable prompt history.

## 5. Database Operations and Invariants

- Create inserts the stable prompt, revision `1.0`, and audit record atomically.
- Edit accepts the revision/version the user loaded. If it is no longer current, the operation fails with a concurrency conflict and creates no rows.
- Successful edit clears the old `is_current_version`, inserts the next immutable revision, updates `prompts.current_version_id` and lifecycle metadata, and appends an audit event atomically.
- Archive requires a non-empty reason and writes `archived_at`, `archived_by`, and `archived_reason` plus an audit event.
- Application roles receive no hard-delete operation. Database permissions and triggers/functions protect immutable revisions.
- Foreign keys, checks, uniqueness constraints, and transaction boundaries enforce invariants independently of the UI.

## 6. Read Model and Search

The list reads through `v_active_current_prompts`, which joins prompt identity, the current revision, and category data and applies:

```sql
is_current_version = true
and status = 'active'
and archived_at is null
and deleted_at is null
```

Search covers prompt name, prompt code, category, description, prompt content, and tags. PostgreSQL full-text search uses a weighted generated/search vector with a GIN index. `pg_trgm` indexes support partial and fuzzy matching for terms such as `SOAP`, `ICD`, `claim`, and `evidence`. Search remains lexical in the MVP.

Query parameters are the canonical list state:

- `q`
- repeated or encoded `category`
- repeated or encoded `tag`
- `page`, `pageSize`
- `sort`: `updated`, `name`, `code`, or `version`
- `direction`: `asc` or `desc`

Defaults are page 1, a bounded page size, active/non-archived records, and last-updated descending. The repository whitelists sort fields and bounds page size.

## 7. Routes and UI

### Prompt Library

Use the approved Card Grid layout. The page includes global search, multi-select category filter, tag filter, sorting, pagination, and Add Prompt. Each card shows name, code, category, shortened description, tags, version, and last-updated time. Search and filters update URL parameters.

States include skeleton loading, empty library with Add Prompt, no search results with clear-filters action, recoverable error, and populated grid.

### Prompt Detail

Selecting a card opens a dedicated detail route. It displays all current MVP fields and actions for Copy Prompt, Edit, and Archive. Copy places only `prompt_content` on the clipboard and shows a success toast.

### Add and Edit

Both use dedicated pages rather than modal or drawer forms. Fields are prompt name, prompt code, category, description, prompt content, tags, and Active/Inactive status. Prompt code is editable on create and treated as the stable identity code afterward. Edit clearly labels its primary action **Save New Version** and submits the loaded revision ID for concurrency control.

### Archive

Archive opens a confirmation experience explaining that the prompt disappears from the active library. A reason is mandatory. The MVP has no archive browser or restore action.

### Authorization Presentation

Action visibility/disabled state is driven by capabilities (`prompt.create`, `prompt.update`, `prompt.archive`). The MVP capability adapter grants all three, preserving the UI contract for future RBAC.

## 8. Validation and Error Handling

- Validate required fields, lengths, enum values, tags, scope IDs, and prompt-code format at the action boundary and service boundary.
- Preserve submitted form values and show field-level errors after validation failure.
- Map expected failures to stable error codes: validation, duplicate code, not found, archived, concurrency conflict, forbidden, and transient database failure.
- On concurrency conflict, keep user input and explain that a newer revision exists; do not overwrite or auto-merge.
- Successful mutations revalidate affected routes and redirect to the relevant library/detail page.
- Unexpected errors are logged with correlation IDs while user-facing messages avoid leaking database details.

## 9. Security and Governance

RLS-ready tables include organization and clinic scope from the outset. During the mock-auth phase, server-only database access and service-layer scope enforcement are mandatory; no privileged Supabase key reaches the browser. Future Supabase Auth will supply actor and tenant claims to the same interfaces. Audit records are append-only, and prompt revision history is immutable.

Prompt content must not contain patient data by design; the UI should include a concise warning not to enter PHI/PII. A fuller compliance policy is deferred.

## 10. Testing Strategy

- Unit tests: schemas, query parsing, version incrementing, capability adapter, service rules, and error mapping.
- Database/integration tests: create transaction, immutable revisions, single-current constraint, optimistic concurrency, archive audit event, view filtering, search, partial matching, pagination, and transaction rollback.
- Component tests: forms preserve values and render validation/errors; cards and empty/loading states display correctly.
- End-to-end happy path: Add → Search/Filter → View → Edit/Save New Version → Copy → Archive.
- End-to-end contention path: two edits from the same original revision; the second receives a conflict and no revision is lost.

## 11. Success Criteria

- Team members can complete all MVP workflows without authentication UI.
- The main list never exposes inactive, archived, deleted, or historical revisions by default.
- No edit mutates an existing revision.
- No application or database path hard-deletes prompts or revisions.
- Search returns relevant partial and full-text matches across all approved fields.
- Concurrent editing cannot silently overwrite a newer revision.
- Identity and capability implementations can be replaced without changing UI components or prompt-service contracts.
