# Med AI NexSure UI Patterns

## Color System

| Token | Hex | Use |
| --- | --- | --- |
| Primary Enterprise Blue | `#1E3A8A` | Primary navigation and key actions |
| Deep Executive Blue | `#0F2A5F` | Executive headers and high-emphasis surfaces |
| AI Intelligent Blue | `#2563EB` | AI result accents and decision-support highlights |
| Soft Blue Background | `#EFF6FF` | Informational panels |
| Blue Border | `#BFDBFE` | AI/info borders |
| Luxury Azure Accent | `#38BDF8` | Secondary accent and focus support |
| Background | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Content surfaces |
| Border | `#E2E8F0` | Dividers and cards |
| Success | `#059669` | Complete/ready/low risk |
| Warning | `#D97706` | Needs review/medium risk |
| Danger | `#DC2626` | Missing/high risk/blocking |

## Enterprise Dashboard Layout

- Persistent sidebar, compact top navigation, main content, and optional right insight rail.
- KPI cards lead to drilldowns; no metric appears without source and timeframe.
- Executive views summarize trends while preserving clinical and claim decision boundaries.

## Sidebar Navigation

- Group by Patient, Visits, SOAP, Claims, Evidence, Audit, Compliance, Dashboard.
- Show active state, icons, collapsed mode, and permission-based visibility.

## Top Navigation

- Include organization, global search, notifications, user profile, and environment indicator.
- Avoid exposing PHI in global chrome unless role and context require it.

## Three-Panel Visit Detail Layout

- Left: patient and visit context.
- Center: SOAP, documentation, claim, or evidence work area.
- Right: AI suggestions, readiness, warnings, and audit summary.
- On mobile, collapse panels into ordered tabs with patient context first.

## Sticky Bottom Action Bar

- Use for save draft, submit for review, approve suggestion, dismiss, or request evidence.
- Keep disabled reasons visible.
- Do not cover validation errors or consent notices.

## Status Badge Pattern

- Use text plus color and icon.
- Values: Draft, In Review, Ready, Needs Evidence, Blocked, Submitted, Audited.

## Risk Indicator Pattern

- Show level, reason, impact, and action.
- Values: Low, Medium, High, Critical.
- Never rely on color alone.

## Confidence Score Pattern

- Show numeric or categorical confidence, explanation, evidence source, and review rule.
- Low confidence requires visible human-review action.

## Claim Readiness Score Pattern

- Show score, blockers, missing evidence count, documentation consistency, and payer warning count.
- Phrase as readiness support, not approval prediction.

## Evidence Checklist Pattern

- Group required, provided, missing, conflicting, stale, and reviewer-requested evidence.
- Each item includes source, timestamp, owner, and next action.

## Clinical Warning Pattern

- Use persistent, high-contrast warning surfaces for allergy, drug interaction, high-risk note, or low-confidence clinical AI.
- Include human review and do not allow silent dismissal.

## Audit Trail Pattern

- Show actor, timestamp, action, reason, before, after, and source.
- Filter by event type and entity.

## Bilingual UI Pattern

- English first for primary labels and workflow commands.
- Thai support may appear as helper text, warnings, or localized secondary labels.
- Do not mix languages inside critical clinical values or legal/audit records unless explicitly localized.
