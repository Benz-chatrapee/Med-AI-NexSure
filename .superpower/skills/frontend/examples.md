# Frontend Examples

## Patient List Page

- Route: `/patients`
- Shows patient name, masked identifier, consent status, latest visit, claim status, and action menu.
- Empty state: no patients match filters; offer clear filters and create/import actions based on permission.

## Visit Detail Page

- Uses three-panel layout.
- Left: patient context, allergies, consent, visit metadata.
- Center: SOAP note and documentation tasks.
- Right: AI summary, claim readiness, missing evidence, and audit snapshot.

## SOAP Note Page

- Four SOAP sections with completeness indicators.
- Inline validation flags missing objective evidence or unresolved assessment/plan inconsistency.
- Save draft and submit for review capture actor and timestamp.

## AI Clinical Summary Panel

- Displays summary, source notes, confidence, uncertainty, timestamp, disclaimer, and clinician review action.
- Low confidence state shows request review instead of accept suggestion.

## Claim Readiness Panel

- Shows readiness score, blockers, missing evidence, ICD consistency, payer warnings, and reviewer actions.
- Copy says "Ready for reviewer assessment" instead of "Claim approved."

## Evidence Package Page

- Groups evidence by required, provided, missing, stale, and conflicting.
- Shows package version, generated time, reviewer, export permission, and audit history.

## Prescription Safety Panel

- Shows allergy banner, medication list, interaction warnings, severity, source, and clinician review action.
- Override requires reason and audit event.

## Dashboard KPI Card

- Title: "Claims Needing Evidence"
- Metric: count and trend over selected timeframe.
- Drilldown: filtered claims table.
- Empty state: no claims currently missing evidence.

## Audit Log Table

- Columns: timestamp, actor, event, entity, reason, before, after, source.
- Filters: actor, entity, event type, date range.
- Sensitive values are masked according to role.

## Empty State Example

Title: "No evidence linked yet"

Message: "This claim has no linked supporting documents. Add evidence or request documents before reviewer assessment."

Action: "Add Evidence"

## Error State Example

Title: "Readiness check unavailable"

Message: "The claim readiness service could not be reached. Existing claim data is unchanged."

Actions: "Retry" and "Continue manual review"
