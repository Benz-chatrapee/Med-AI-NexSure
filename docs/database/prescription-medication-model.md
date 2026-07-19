# Prescription and Medication Model

## 1. Document Control
Status: Populated for DB-DOC-BATCH-5-CLINICAL. Source of truth: migrations `001`, `003`, `004`, `006`, and `007`. Runtime effect: none.

## 2. Purpose
Defines prescribing, medication safety, dispensing, and inventory relationships. AI cannot prescribe, verify, dispense, or approve overrides autonomously.

## 3. Scope
Existing: `prescriptions`, `prescription_items`, `inventory_items`, `inventory_batches`, `stock_movements`, `visits`, `user_profiles`, `audit_logs`, prescription and inventory policies. Future: `prescription_safety_alerts`, `medication_catalogue`, `medication_ingredients`, `medication_allergies`, `medication_interactions`, `prescription_versions`, `dispensing_events`, `dispensing_reversals`, `stock_reservations`.

## 4. Current Repository State
`prescriptions` stores the prescription header. `prescription_items` stores medication lines and has `dispensed_quantity` added by migration `006`. Inventory and stock movement tables exist. No durable `prescription_safety_alerts`, dispensing events, reversals, or medication catalogue tables exist.

## 5. Domain Ownership
Owner: Clinical prescribing plus pharmacy inventory operations. Prescribing and dispensing are separate authorities.

## 6. Prescription Header
Existing columns: `id uuid PK`, `organization_id`, `clinic_id`, `visit_id`, `prescribing_user_id`, `status prescription_status default 'draft'`, `safety_review_required boolean default true`, `safety_review_summary`, audit and soft-delete columns.

## 7. Prescription Items
Existing columns: `id`, tenant scope, `prescription_id`, optional `inventory_item_id`, `medication_label`, `dosage_text`, `frequency_text`, `duration_text`, `quantity`, `dispensed_quantity`, `safety_note`, audit and soft-delete columns.

## 8. Medication Catalogue Readiness
Existing `inventory_items` can supply item names, generic names, units, SKU, and clinic stock. Future `medication_catalogue` is needed for clinical drug identity independent of inventory SKU.

## 9. Generic and Brand Names
Existing: `inventory_items.generic_name`; `prescription_items.medication_label` is free text.

## 10. Dosage
Existing: `prescription_items.dosage_text text not null`. Structured dose-range validation is Future.

## 11. Route
Gap: no route column. Proposed structured `route_code` or route field.

## 12. Frequency
Existing: `frequency_text text not null`.

## 13. Duration
Existing: `duration_text text null`.

## 14. Quantity
Existing: `quantity numeric(12,2)` with check `quantity is null or quantity > 0`.

## 15. Unit
Existing unit is on `inventory_items.unit`; no prescription item unit column exists.

## 16. Instructions
Gap: no dedicated patient instruction column; instructions may be embedded in dosage/frequency/duration text. Proposed structured/signature instruction field.

## 17. Indication
Gap: no indication column or direct diagnosis FK on prescription items.

## 18. Prescriber Authority
Existing: `prescribing_user_id references user_profiles(id)` and role `doctor` has `prescription.create`. Review Required: professional license validation is not implemented.

## 19. Pharmacist Authority
Existing role `pharmacist` has `prescription.dispense`, `inventory.view`, and `inventory.adjust`. Pharmacists cannot alter unrelated SOAP or diagnosis content under current role permissions.

## 20. Nurse and Staff Access
Existing nurse has no prescription permissions; receptionist has no prescription permissions. Minimum necessary access is preserved by role mapping.

## 21. Prescription Lifecycle
Existing enum `prescription_status`: `draft`, `pending_review`, `approved_by_clinician`, `dispensed`, `cancelled`.

| Required state | Classification | Existing equivalent or gap |
|---|---|---|
| `draft` | Existing | `draft` |
| `ordered` | Proposed | Approximate `pending_review` |
| `verified` | Proposed | Approximate `approved_by_clinician` |
| `partially_dispensed` | Proposed | No enum value; `dispensed_quantity` enables readiness |
| `dispensed` | Existing | `dispensed` |
| `cancelled` | Existing | `cancelled` |
| `reversed` | Proposed | No enum value or reversal table |

## 22. Verification
Existing `approved_by_clinician` supports minimal verification status. Gap: no verifier field, timestamp, or professional authority table.

## 23. Dispensing
Existing `dispensed` status and `dispensed_quantity` support basic dispensing state. Current policy allows update with `prescription.create` or `prescription.dispense`.

## 24. Partial Dispensing Readiness
Existing `dispensed_quantity` check enforces nonnegative and not greater than `quantity` when quantity is present. No partial state exists.

## 25. Cancellation
Existing status `cancelled`. Proposed cancellation requires reason and audit.

## 26. Controlled Reversal
Future: `dispensing_reversals` and/or reversal state. Reversal must not erase original dispensing or stock movement.

## 27. Inventory Relationship
Existing: `prescription_items.inventory_item_id references inventory_items(id)`.

## 28. Batch and Expiry Relationship
Existing inventory batch table tracks `batch_number`, `expiry_date`, `quantity_on_hand`, and `unit_cost`. Prescription items do not currently point to selected batches.

## 29. Stock Movement
Existing: `stock_movements` records item, optional batch, movement type, quantity, reason, reference table and record id. Quantity must be nonzero.

## 30. Stock Reservation Readiness
Future: `stock_reservations`; no reservation or idempotency key exists.

## 31. Allergy Checks
Future: allergy source and `prescription_safety_alerts` required. Current schema has only `safety_review_required`, `safety_review_summary`, and item `safety_note`.

## 32. Interaction Checks
Future: medication ingredients/interactions and alert table.

## 33. Duplicate Therapy Checks
Future: requires medication identity beyond free-text labels.

## 34. Dose-range Checks
Future: structured dose, route, frequency, age/weight context, and rule version.

## 35. Safety Alerts
Proposed states: `generated`, `acknowledged`, `overridden`, `resolved`, `dismissed`. Not implemented as a table.

Future `prescription_safety_alerts` is the durable alert record. Required conceptual contract:

| Property | Requirement |
|---|---|
| Identity and scope | Alert ID, organization ID, clinic ID, patient ID, visit ID |
| Prescription links | Prescription ID and prescription item ID where applicable |
| Detection | Alert type, severity, source, rule or model version, detected timestamp, supporting evidence |
| Lifecycle | Status using the canonical alert states in `record-state-machines.md` |
| Human handling | Acknowledgement actor/time, override actor/time/reason/approval, resolution actor/time |
| Audit | Audit correlation ID and immutable original evidence |
| Deduplication | Planned uniqueness inputs: organization, clinic, patient, visit, prescription, item, alert type, severity, rule/model version, normalized evidence hash |

Alerts must not exist only in frontend state. Recalculation must not erase prior alerts, repeated evaluation must not create uncontrolled duplicates, acknowledgement does not equal override, and alerts linked to dispensed medication cannot be deleted by normal users.

## 36. Safety Override
Proposed: override requires reason, actor, timestamp, alert scope, patient/visit context, and audit. AI cannot approve overrides.

## 37. AI Medication Assistance
Existing no medication AI metadata table. Proposed assistance must remain advisory and separated until human accepted.

## 38. Audit Events
Existing enum supports `clinical_review`, `update`, `export`, and `evidence_change`; proposed events include `prescription.ordered`, `prescription.verified`, `prescription.dispensed`, `prescription.partially_dispensed`, `prescription.cancelled`, `dispensing.reversed`, `medication_alert.overridden`.

## 39. RLS Responsibility
Existing policies include `mvp1_prescriptions_select/insert/update`, `mvp1_inventory_select/insert/update`, `mvp1_inventory_batches_select/insert/update`, and `mvp1_stock_movements_select/insert`. Older policies use colon permissions.

## 40. Constraints
Existing: prescription PK/FKs; item PK/FKs; quantity positive; dispensed quantity bounded; inventory SKU unique per clinic; batch unique per item; batch quantity nonnegative; stock movement quantity nonzero.

## 41. Index Strategy
Existing prescription indexes on organization, clinic, visit, status, created_at; item indexes on organization, clinic, prescription, inventory item; inventory and stock movement indexes including batch expiry and item-time lookups.

## 42. Transaction Boundaries
Proposed dispensing transaction: verify prescription state, update item `dispensed_quantity`, insert `stock_movements`, update batch quantity if used, update prescription status, and insert audit log atomically.

## 43. Concurrency
Gap: no stock reservation, idempotency key, or lock version. Negative stock is prohibited at batch level by `quantity_on_hand >= 0`, but decrement logic is not implemented in database functions.

## 44. Idempotency
Future: dispensing events need idempotency keys to prevent duplicate stock movements on retry.

## 45. Failure Handling
If stock, RLS, authority, alert override, or audit insert fails, dispensing must fail as a unit.

## 46. Data Retention
Prescriptions and stock movements have soft-delete/audit fields; dispensing and reversal history should remain traceable and not be physically deleted in normal workflows.

## 47. Future Extensions
Medication catalogue, ingredients, allergy/interactions, durable alert table, prescription versions, dispensing events, reversals, reservations, structured dosing, and professional credential checks.

## 48. Compatibility-sensitive Items
`prescription_status` enum; `prescription.create` currently allows updates; `inventory_items` may be inventory SKU rather than medication identity; `stock_movements.reference_table` is free text; colon and dot permissions coexist.

## 49. Review Required Decisions
Canonical prescription and medication-safety lifecycle states are standardized in `record-state-machines.md`. Remaining Review Required items: negative stock enforcement transaction, professional authority source, controlled substance rules, partial dispense semantics, and exact safety-alert deduplication constraint.

## Key Flow Controls
| Flow | Actor | Input | Auth and permission | Authority | Transaction and audit | Failure behavior |
|---|---|---|---|---|---|---|
| Draft to order to verification | Prescriber, verifier | Visit, items, safety summary | `prescription.order.create`, `prescription.order.verify` | Verified prescriber/verifier credential required | Header/items/status + audit | Keep draft if validation fails |
| Safety alert acknowledgement or override | Clinician/pharmacist | Alert and reason | `prescription.safety_alert.acknowledge` or `prescription.safety_alert.override` | Human authority only; high severity requires verified scope | Alert state + audit | Alert remains active |
| Dispensing to stock movement | Pharmacist | Prescription, batch, quantity | `prescription.order.dispense`, `inventory.adjust` | Pharmacy credential and scope | Dispense + stock movement atomically | No partial stock write |
| Dispensing reversal | Pharmacist/compliance | Original event, reason | `prescription.order.reverse` | Pharmacy/compliance credential and scope | Reversal event + stock movement + audit | Original event retained |

## Decision Closure References
Canonical lifecycle: `record-state-machines.md`.

Canonical permissions: `prescription.order.read`, `prescription.order.create`, `prescription.order.update`, `prescription.order.cancel`, `prescription.order.verify`, `prescription.order.dispense`, `prescription.order.reverse`, `prescription.safety_alert.read`, `prescription.safety_alert.acknowledge`, `prescription.safety_alert.override`, `prescription.safety_alert.resolve`, `prescription.safety_alert.dismiss`.
