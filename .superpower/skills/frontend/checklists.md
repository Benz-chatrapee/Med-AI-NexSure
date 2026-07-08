# Frontend Checklists

## Page Readiness Checklist

- Requirement, route, user role, and success criteria are clear.
- MVP scope and out-of-scope items are explicit.
- Components, data dependencies, permissions, and actions are mapped.
- Loading, empty, no-result, error, success, and populated states are covered.
- Audit events are identified for material actions.

## Component Quality Checklist

- Component has a single clear purpose.
- Props are typed and minimal.
- Business logic is kept outside UI rendering.
- Reusable primitives follow existing Shadcn/UI and Tailwind patterns.
- Tests or test notes cover important states.

## Form Validation Checklist

- Fields have labels, descriptions, and error messages.
- Client validation aligns with server validation.
- Zod schema behavior is documented.
- Required reason capture exists for material clinical, claim, or audit changes.
- Submit, save draft, cancel, retry, and disabled states are defined.

## Accessibility Checklist

- Semantic HTML is used.
- Keyboard access and focus order are verified.
- Visible focus state exists.
- Error messages are associated with fields.
- Color is not the only meaning carrier.
- Dialogs trap focus and restore focus.

## Responsive Checklist

- Mobile, tablet, desktop, and wide desktop layouts are specified.
- Critical patient, visit, risk, and claim context remains visible.
- Tables degrade into readable summaries when needed.
- Sticky bars do not cover content or errors.
- Dynamic labels do not cause layout shift.

## Healthcare UI Safety Checklist

- Clinical AI is labeled as decision support.
- Confidence, uncertainty, and evidence are shown when appropriate.
- Allergies and high-risk warnings are persistent.
- Diagnosis, ICD, and medication displays avoid unsupported finality.
- Human review is required for high-risk or low-confidence cases.

## Insurance Claim Workflow Checklist

- Claim readiness is advisory.
- Missing evidence is actionable and traceable.
- Payer rules show source and uncertainty.
- Reviewer authority is preserved.
- No UI copy implies automatic approval or denial.

## AI Output Display Checklist

- Output has task label, timestamp, confidence, explanation, and source evidence.
- Missing information is visible.
- Human review and feedback actions are available.
- Unsafe or low-confidence outputs are blocked or clearly escalated.
- Audit event is defined for acceptance, override, or dismissal.

## Error/Empty/Loading State Checklist

- Empty state explains the next safe action.
- Error state separates validation, authorization, network, system, and AI unavailable cases.
- Loading state preserves layout and critical context.
- Toasts are not the only place for blocking errors.
- Sensitive data is redacted from user-facing error details.

## Code Review Checklist

- App Router conventions are followed.
- TypeScript types are explicit at boundaries.
- Tailwind classes are readable and consistent.
- Components are reusable without premature abstraction.
- Hooks own client state and effects.
- Accessibility and responsive checks are documented.
- Security, privacy, audit, and AI safety impacts are reviewed.
