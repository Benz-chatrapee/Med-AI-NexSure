# Patient Claims Workspace Design

## Requirement

Build a production-ready Patient Claims workspace for Med AI NexSure at `/patients/[patientId]/claims`. The page supports patient claim history, readiness assessment, missing evidence management, status tracking, risk and TAT monitoring, payer rule visibility, evidence package workflow, claim detail review, and audit-ready activity visibility.

The feature is decision support only. It must not approve, reject, diagnose, prescribe, fabricate evidence, expose secrets, or bypass human review.

## Scope

In scope:
- Patient context summary with clinical alert priority and future masking support.
- Six KPI cards that filter claim history.
- Claim readiness score, accessible breakdown, recalculation stub, and decision support disclaimer.
- Missing evidence list with typed severity and clear actions.
- Claim history search, filters, chips, pagination, empty state, and accessible row actions.
- Claim detail sheet with evidence checklist, recommendation, loading/error/empty states, and focus restoration.
- Recent claim activity timeline with audit-ready metadata.
- Primary payer rules with advisory copy.
- Typed mock service and route state files.

Out of scope:
- Real backend integration.
- Automatic claim approval or rejection.
- Global app shell replacement.
- New third-party dependencies.
- Changes to unrelated features or shared configuration.

## Architecture

The route is implemented as a Next.js App Router page at `app/patients/[patientId]/claims/page.tsx`. The route remains a server component that loads typed dashboard data from `features/patient-claims/services/patient-claims-service.ts` and renders a client workspace component.

The feature module is isolated under `features/patient-claims/`. Domain types, labels, mock data, service functions, and filtering utilities are separated from presentation code. UI state remains local to the workspace because it is route-scoped.

## Components

`PatientClaimsWorkspace` owns interactive client state: filters, pagination, selected claim, sheet visibility, recalculation loading, and toast messages. Focus restoration is handled with a ref to the triggering claim button.

Small helper components inside the workspace handle repeated UI patterns such as KPI cards, badges, progress bars, empty states, sheet rows, and timeline items. This keeps the implementation scoped while avoiding over-fragmenting the new feature.

## Data Flow

1. `page.tsx` receives `patientId` from route params.
2. `getPatientClaimsDashboard(patientId)` returns typed mock dashboard data.
3. `PatientClaimsWorkspace` derives filtered and paginated claims from local filters.
4. KPI cards update the status filter.
5. Search and filters update local typed filter state.
6. Claim detail is loaded through `getClaimDetail(claimId)` when a row action is selected.
7. Recalculate readiness calls `recalculateClaimReadiness(patientId)` and displays a user-friendly result.

## Error Handling

Services normalize user-facing failures as `PatientClaimsServiceError`. UI does not display raw exceptions or stack traces. Route-level failures are handled by `error.tsx`. Section-level failures show readable messages and retry-capable actions where appropriate.

No PHI or full policy number is logged to the console.

## Accessibility

The workspace uses semantic navigation, `<main>`, `<section>`, ordered headings, accessible table headers, labeled form controls, `aria-pressed` for KPI filters, `aria-live` for status messages, readable badge text, and progress elements with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.

The claim detail sheet uses dialog semantics, Escape handling, close button labeling, backdrop close, and focus restoration to the triggering button.

## Responsive Design

Desktop uses full-width enterprise layout with six KPI columns when space allows. Tablet wraps KPI and content panels. Mobile stacks patient context and actions, keeps touch targets usable, uses horizontal table scrolling, and presents the sheet at near-full width.

## Security And Compliance

Mock data is synthetic. Policy number display is masked in summary views. Clinical alerts use text and icon priority, not color alone. AI readiness and recommendations are advisory only and require human review. Sensitive actions are prepared for future audit payloads.

## Testing

Automated tests cover the pure filtering and pagination behavior in `features/patient-claims/utils/patient-claims-utils.test.ts`. Validation commands are:
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Limitations

The first implementation uses typed mock services with simulated latency. URL search param syncing is not included unless it can be added without expanding scope. Real permission masking, audit submission, payer policy refresh, and backend mutations are integration follow-ups.

## Future Improvements

- Replace mock service with authenticated API calls.
- Add URL-synced filters if route conventions stabilize.
- Add real permission masking for patient and policy data.
- Add audit event creation for opening details and triggering claim workflows.
- Add server-backed pagination and debounced API search.
