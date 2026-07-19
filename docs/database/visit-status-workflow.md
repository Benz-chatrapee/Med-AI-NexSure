# Visit Status Workflow

Batch: DB-DOC-BATCH-4-PATIENT-VISIT  
Primary agent: Business Analyst and Healthcare Domain  
Reviewer: Database

## Purpose

Document current visit status implementation and the proposed status-transition model required for safe clinical operations. This file does not create a state machine, enum, trigger, or table.

## Existing Implementation

### Current Database Statuses

Existing `visit_status` enum values in `001_core_schema.sql`:

| Status | Classification | Notes |
| --- | --- | --- |
| `scheduled` | Existing | Closest current equivalent to task `draft` or pre-arrival scheduled state. |
| `checked_in` | Existing | Closest current equivalent to task `waiting`. |
| `in_consultation` | Existing | Active clinical consultation. |
| `completed` | Existing | Completed visit. |
| `cancelled` | Existing | Cancelled visit. |
| `no_show` | Existing | Patient did not attend. |
| `pharmacy` | Future | Required by task but not implemented in enum. |
| `reopened` | Future | Required by task but not implemented in enum. |
| `archived` | Future | Required by task but not implemented in enum. |

Existing RLS:
- Migration `003`: `visit:update`.
- Migration `007`: `visit.update_status`.

Existing audit support:
- `audit_logs.action_type` includes `update`, `clinical_review`, `claim_review`, and other workflow-adjacent events.
- No automatic visit status audit trigger exists.

Existing status history:
- `visit_status_history` is Future. No table, policy, index, or trigger exists.

## Identified Gaps

| Item | Classification | Gap |
| --- | --- | --- |
| Status transition enforcement | Planned | No trigger/function enforces valid transitions. |
| Append-only history | Future | `visit_status_history` is not implemented. |
| Reopening completed visits | Planned | No table or permission exists for reopening. |
| Cancellation reason | Planned | No reason field exists. |
| Pharmacy state | Future | No enum value or workflow table exists. |
| Archived state | Future | No enum value or retention workflow exists. |
| Approval requirements | Planned | No approval table exists. |

## Proposed Design

### Proposed Status Transition Matrix

| From | To | Initiating role | Required permission | Professional authority | Required validation | Reason | Approval | Transaction boundary | Audit event | Downstream effects | Reversible | Denial conditions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `draft` | `waiting` | receptionist, clinic_admin | Proposed `visit.create` or existing `visit.update_status` | Administrative, not clinical | Patient exists, clinic access, registration valid | Optional | No | Create/update visit and history together | `update` | Queue visible | Yes | No patient scope, duplicate active visit, missing registration |
| `scheduled` | `checked_in` | receptionist, nurse, clinic_admin | Existing `visit.update_status` / `visit:update` | Administrative intake | Appointment exists, patient identity checked | Optional | No | Visit update plus audit | `update` | Patient enters queue | Yes | Cross-clinic, inactive patient, missing consent policy |
| `waiting` / `checked_in` | `in_consultation` | doctor, nurse | Existing `visit.update_status` / `visit:update` | Clinical team authority | Provider assigned, patient present | Optional | No | Visit update plus audit | `clinical_review` or `update` | SOAP workspace enabled | Limited | No clinical access, wrong clinic, already completed |
| `in_consultation` | `pharmacy` | doctor | Proposed `prescription.create` plus `visit.update_status` | Licensed clinician | Prescription or medication plan present | Optional | No | Visit update, prescription update, audit | `clinical_review` | Pharmacy queue enabled | Yes | No clinician authority, incomplete SOAP if policy requires |
| `pharmacy` | `completed` | pharmacist, doctor | `prescription.dispense` or `visit.update_status` | Pharmacist/clinician authority | Dispense complete or no meds needed, clinical documentation complete | Optional | No | Visit update, prescription/audit updates | `update` | Claim readiness may calculate | Controlled reopen | Open safety alerts, incomplete required documentation |
| `in_consultation` | `completed` | doctor | Existing `visit.update_status` / `visit:update` | Clinician authority | SOAP reviewed, required evidence policy satisfied | Optional | No | Visit update plus audit | `clinical_review` | Claim readiness may calculate | Controlled reopen | Missing clinical review, unauthorized role |
| `scheduled` / `checked_in` / `waiting` | `cancelled` | receptionist, clinic_admin | Existing `visit.update_status` / `visit:update` | Administrative | No locked clinical record or approved override | Required | Maybe for late cancellation | Visit update plus audit | `update` | Queue removal, claim blocked | Limited | Completed visit, missing reason |
| `scheduled` / `waiting` | `no_show` | receptionist, clinic_admin | Existing `visit.update_status` / `visit:update` | Administrative | Time threshold or attendance rule met | Required | No | Visit update plus audit | `update` | Queue closure, claim not started | Limited | Patient checked in or clinical docs started |
| `completed` | `reopened` | doctor, clinic_admin with clinical approver | Proposed `clinical.amend` or `visit.reopen` | Clinical authority required | Completed visit exists, reason, no conflicting claim submission | Required | Yes | Reopen request, visit update, history, audit in transaction | `clinical_review` | Claim readiness invalidated/recalculated | Yes, back to completed | No reason, claim submitted, no clinical approver |
| `reopened` | `completed` | doctor | Proposed `clinical.amend` | Clinical authority | Amendment complete, SOAP/version updated | Required | Maybe | Visit update, version update, audit | `clinical_review` | Claim readiness recalculates | Controlled reopen | Missing amendment trail |
| `completed` | `archived` | compliance_officer, system job | Proposed `record.archive` | Compliance authority | Retention policy met, no active dispute | Required/system reason | Yes/system | Archive marker and audit | `update` | Hidden from active worklists | No ordinary reversal | Retention hold, active claim |

Compatibility Sensitive:
- Current enum does not contain `draft`, `waiting`, `pharmacy`, `reopened`, or `archived`.
- Current UI/mock data uses labels such as Waiting, Pending Evidence, Pharmacy, Completed, but database enum is narrower.

### Proposed Append-Only History

Proposed `visit_status_history` fields:
- `id uuid`
- `organization_id uuid`
- `clinic_id uuid`
- `visit_id uuid`
- `from_status text`
- `to_status text`
- `changed_by uuid`
- `changed_at timestamptz`
- `required_permission text`
- `reason text`
- `approval_by uuid`
- `approval_at timestamptz`
- `audit_log_id uuid`
- `metadata jsonb`

Append-only rule:
- No update or delete for normal application roles.
- Corrections require a superseding event, not mutation.

## Workflow Rules

- Claim readiness must not own or silently change visit state.
- Completed visits require controlled reopening.
- External creation requires idempotency.
- Administrative authority does not imply clinical authority.
- High-risk transitions require authorization, reason, audit, and transaction boundary.

## Dependencies

- [Visit Data Model](visit-data-model.md)
- [Core Foundation Permission Matrix](core-foundation-permission-matrix.md)
- [Patient Visit Test Plan](patient-visit-test-plan.md)
