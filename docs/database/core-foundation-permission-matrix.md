# Core Foundation Permission Matrix

Source of truth: seeded roles and permissions in migrations `002_rbac.sql` and `007_rbac_helpers_policies_indexes_seed.sql`.

## Existing Implementation

### Permission Catalog from Migration `002`

| Permission | Domain | Description |
| --- | --- | --- |
| `patient:read` | patient | Read scoped patient records. |
| `patient:create` | patient | Create patient records in authorized scope. |
| `visit:read` | visit | Read scoped visits. |
| `visit:update` | visit | Update scoped visits. |
| `soap:read` | soap | Read scoped SOAP notes. |
| `soap:update` | soap | Create or update SOAP drafts and reviews. |
| `prescription:read` | prescription | Read scoped prescriptions. |
| `prescription:update` | prescription | Create or update prescriptions with clinician review. |
| `inventory:manage` | inventory | Manage clinic inventory items, batches, and movements. |
| `claim_readiness:read` | claim_readiness | Read claim readiness decision-support outputs. |
| `evidence_package:read` | evidence_package | Read scoped evidence package metadata. |
| `audit_log:read` | audit | Read scoped audit logs. |
| `admin:manage_users` | admin | Manage users, roles, and permissions. |

### System Roles from Migration `002`

| Role | System role | Description |
| --- | --- | --- |
| `Admin` | true | System administrator with user and configuration management permissions. |
| `Doctor` | true | Clinician responsible for visits, SOAP notes, prescriptions, and clinical review. |
| `Nurse` | true | Clinical operations role supporting visits and documentation workflows. |
| `Pharmacist` | true | Medication and inventory workflow role. |
| `Receptionist` | true | Front desk role supporting patient and visit workflows. |
| `Claim Reviewer` | true | Insurance claim readiness and evidence review role. |
| `Compliance Officer` | true | Audit, compliance, and governance review role. |
| `Executive` | true | Executive dashboard and operational oversight role. |

### Role-Permission Matrix from Migration `002`

| Role | Permissions |
| --- | --- |
| `Admin` | All seeded migration `002` permissions |
| `Doctor` | `patient:read`, `visit:read`, `visit:update`, `soap:read`, `soap:update`, `prescription:read`, `prescription:update` |
| `Nurse` | `patient:read`, `visit:read`, `visit:update`, `soap:read`, `prescription:read` |
| `Pharmacist` | `prescription:read`, `inventory:manage` |
| `Receptionist` | `patient:read`, `patient:create`, `visit:read`, `visit:update` |
| `Claim Reviewer` | `visit:read`, `claim_readiness:read`, `evidence_package:read` |
| `Compliance Officer` | `audit_log:read`, `claim_readiness:read`, `evidence_package:read` |
| `Executive` | `visit:read`, `claim_readiness:read`, `evidence_package:read`, `audit_log:read` |

### Permission Catalog from Migration `007`

| Permission | Domain | Description |
| --- | --- | --- |
| `organization.view` | organization | View organization configuration. |
| `organization.update` | organization | Update organization configuration. |
| `organization.manage_security` | organization | Manage organization security settings. |
| `clinic.view` | clinic | View authorized clinics. |
| `clinic.create` | clinic | Create clinics. |
| `clinic.update` | clinic | Update clinics. |
| `patient.view` | patient | View patients. |
| `patient.create` | patient | Register patients. |
| `patient.update` | patient | Update patients. |
| `visit.view` | visit | View visits. |
| `visit.create` | visit | Create visits. |
| `visit.update_status` | visit | Update visit workflow status. |
| `soap.view` | soap | View SOAP notes. |
| `soap.create` | soap | Create SOAP notes. |
| `soap.update` | soap | Update SOAP notes. |
| `soap.approve_ai_content` | soap | Accept or reject AI-assisted SOAP content. |
| `prescription.view` | prescription | View prescriptions. |
| `prescription.create` | prescription | Create prescriptions. |
| `prescription.dispense` | prescription | Dispense prescriptions. |
| `inventory.view` | inventory | View inventory. |
| `inventory.adjust` | inventory | Adjust inventory through controlled workflows. |
| `claim.view` | claim | View claim readiness and evidence packages. |
| `claim.review` | claim | Review claim readiness outputs. |
| `audit.view` | audit | View audit logs. |
| `user.invite` | rbac | Invite users. |
| `role.assign` | rbac | Assign roles. |

### System Roles from Migration `007`

| Role | System role | Description |
| --- | --- | --- |
| `platform_admin` | true | Platform administrator for controlled system administration. |
| `organization_admin` | true | Organization administrator for tenant configuration and access. |
| `clinic_admin` | true | Clinic administrator for clinic-scoped operations. |
| `doctor` | true | Doctor responsible for clinical documentation and review. |
| `nurse` | true | Nurse responsible for vitals and visit support. |
| `pharmacist` | true | Pharmacist responsible for prescription dispensing and inventory. |
| `receptionist` | true | Receptionist responsible for registration and visit creation. |
| `claim_reviewer` | true | Reviewer for claim readiness and evidence packages. |
| `compliance_officer` | true | Compliance officer for audit and governance review. |
| `auditor` | true | Auditor with read-only audit access. |
| `executive` | true | Executive oversight role. |

### Role-Permission Matrix from Migration `007`

| Role | Permissions |
| --- | --- |
| `platform_admin` | `organization.view`, `organization.update`, `organization.manage_security`, `clinic.view`, `clinic.create`, `clinic.update`, `patient.view`, `patient.create`, `patient.update`, `visit.view`, `visit.create`, `visit.update_status`, `soap.view`, `soap.create`, `soap.update`, `soap.approve_ai_content`, `prescription.view`, `prescription.create`, `prescription.dispense`, `inventory.view`, `inventory.adjust`, `claim.view`, `claim.review`, `audit.view`, `user.invite`, `role.assign` |
| `organization_admin` | Same set as `platform_admin` in migration `007` |
| `clinic_admin` | `clinic.view`, `clinic.update`, `patient.view`, `patient.create`, `patient.update`, `visit.view`, `visit.create`, `visit.update_status`, `soap.view`, `prescription.view`, `inventory.view`, `claim.view` |
| `doctor` | `patient.view`, `visit.view`, `soap.view`, `soap.create`, `soap.update`, `soap.approve_ai_content`, `prescription.view`, `prescription.create` |
| `nurse` | `patient.view`, `visit.view`, `visit.update_status`, `soap.view` |
| `pharmacist` | `prescription.view`, `prescription.dispense`, `inventory.view`, `inventory.adjust` |
| `receptionist` | `clinic.view`, `patient.view`, `patient.create`, `patient.update`, `visit.view`, `visit.create` |
| `claim_reviewer` | `visit.view`, `claim.view`, `claim.review` |
| `compliance_officer` | `organization.view`, `claim.view`, `audit.view` |
| `auditor` | `audit.view` |
| `executive` | `organization.view`, `clinic.view`, `claim.view`, `audit.view` |

### Permission Usage in RLS

| Domain | Migration `003` permission style | Migration `007` permission style |
| --- | --- | --- |
| Organization | `admin:manage_users` for broad admin behavior | `organization.view`, `organization.update`, `organization.manage_security` |
| Clinic | role or admin exception | `clinic.view`, `clinic.create`, `clinic.update` |
| Patient | `patient:read`, `patient:create` | `patient.view`, `patient.create`, `patient.update` |
| Visit | `visit:read`, `visit:update` | `visit.view`, `visit.create`, `visit.update_status` |
| SOAP | `soap:read`, `soap:update` | `soap.view`, `soap.create`, `soap.update`, `soap.approve_ai_content` |
| Prescription | `prescription:read`, `prescription:update` | `prescription.view`, `prescription.create`, `prescription.dispense` |
| Inventory | `inventory:manage` | `inventory.view`, `inventory.adjust` |
| Claim/Evidence | `claim_readiness:read`, `evidence_package:read` | `claim.view`, `claim.review` |
| Audit | `audit_log:read` | `audit.view` |
| RBAC | `admin:manage_users` | `user.invite`, `role.assign` |

## Identified Gaps

- Permission keys have two incompatible naming formats.
- Roles have two naming formats: title case from migration `002` and snake case from migration `007`.
- `platform_admin` and `organization_admin` receive the same permissions in migration `007`; operational separation may need refinement.
- `clinic_admin` has broad clinical visibility but no explicit `role.assign`; this may be intentional but should be confirmed.
- `doctor` has `soap.approve_ai_content`, but RLS policies currently gate diagnosis/SOAP mutation on `soap.update`, not directly on `soap.approve_ai_content`.
- `Compliance Officer` in migration `002` can read claim/evidence and audit; migration `007` `compliance_officer` can read organization, claim, and audit but not evidence as a separate permission because evidence uses `claim.view`.

## Proposed Design

- Use one canonical permission namespace for all future policies: `module.resource.action`, with lower-case snake_case segments separated by dots.
- Use lowercase snake_case role names for future system roles, while preserving legacy title-case roles through compatibility mapping until retired.
- Split `platform_admin` from `organization_admin` if platform-level cross-tenant administration is introduced. Platform authority must not imply clinical authority inside tenant workflows without explicit scoped assignment.
- Add explicit permissions for high-risk actions; sign, issue, dispense, reverse, acknowledge, override, and export are separate permissions and must not be treated as generic update.
- Add SQL tests that assert each role can perform only the operations listed in the canonical matrix.

## Decision Closure: Canonical Clinical Permission Keys

Status: Planned for future migrations and policies. Existing executable seed data is not changed by this document.

### Clinical SOAP

| Canonical key | Purpose | Professional authority |
|---|---|---|
| `clinical.soap.read` | Read scoped SOAP records | Clinical care relationship or authorized review |
| `clinical.soap.create` | Create SOAP draft | Clinical contributor scope |
| `clinical.soap.update` | Update mutable SOAP draft | Clinical contributor scope |
| `clinical.soap.review` | Review SOAP before signing | Reviewer scope |
| `clinical.soap.sign` | Sign immutable SOAP version | Verified signing scope |
| `clinical.soap.amend` | Amend signed SOAP through controlled version | Verified amendment scope |
| `clinical.soap.void` | Void SOAP record while retaining history | Clinical/compliance scope |

### Diagnosis and Coding

| Canonical key | Purpose | Professional authority |
|---|---|---|
| `clinical.diagnosis.read` | Read scoped diagnoses | Clinical care relationship or authorized review |
| `clinical.diagnosis.create` | Create provisional diagnosis | Clinical contributor scope |
| `clinical.diagnosis.update` | Update provisional diagnosis | Clinical contributor scope |
| `clinical.diagnosis.confirm` | Confirm clinical diagnosis | Verified clinician scope |
| `clinical.diagnosis.amend` | Amend confirmed diagnosis | Verified clinician scope |
| `clinical.diagnosis.mark_error` | Mark entered-in-error | Verified clinician/compliance scope |
| `clinical.coding.read` | Read diagnosis code mappings | Coder/clinical/claim scope |
| `clinical.coding.assign` | Assign code mapping | Coder or verified clinician scope |
| `clinical.coding.review` | Review AI/imported mapping | Coder or verified clinician scope |
| `clinical.coding.override` | Override mapping recommendation | Coder or verified clinician scope |

### Prescription and Medication Safety

| Canonical key | Purpose | Professional authority |
|---|---|---|
| `prescription.order.read` | Read prescriptions | Care/pharmacy relationship |
| `prescription.order.create` | Order prescription | Verified prescriber scope |
| `prescription.order.update` | Update mutable draft/order | Verified prescriber scope |
| `prescription.order.cancel` | Cancel non-dispensed prescription | Prescriber/cancellation scope |
| `prescription.order.verify` | Verify prescription for dispensing | Pharmacist/verifier scope |
| `prescription.order.dispense` | Dispense medication | Pharmacist scope |
| `prescription.order.reverse` | Reverse dispensing | Pharmacist/compliance scope |
| `prescription.safety_alert.read` | Read safety alerts | Care/pharmacy relationship |
| `prescription.safety_alert.acknowledge` | Acknowledge alert | Workflow participant |
| `prescription.safety_alert.override` | Override safety alert | Verified prescriber/pharmacist as applicable |
| `prescription.safety_alert.resolve` | Resolve alert | Authorized reviewer |
| `prescription.safety_alert.dismiss` | Dismiss non-applicable alert | Authorized reviewer |

### Medical Certificate

| Canonical key | Purpose | Professional authority |
|---|---|---|
| `clinical.medical_certificate.read` | Read scoped certificates | Care relationship or authorized review |
| `clinical.medical_certificate.create` | Create draft certificate | Clinical contributor scope |
| `clinical.medical_certificate.review` | Review draft before issue | Reviewer scope |
| `clinical.medical_certificate.issue` | Issue signed certificate | Verified signing scope |
| `clinical.medical_certificate.revoke` | Revoke issued certificate | Signing/compliance scope |
| `clinical.medical_certificate.reissue` | Reissue or supersede certificate | Verified signing scope |
| `clinical.medical_certificate.export` | Export/download certificate | Explicit export authority |

### Claim, Evidence, Audit, and AI

| Canonical key | Purpose | Professional authority |
|---|---|---|
| `claim.readiness.read` | Read scoped claim readiness assessments | Claim-case scope |
| `claim.readiness.calculate` | Calculate or recalculate readiness | System or authorized claim workflow |
| `claim.readiness.review` | Human review of readiness | Claim reviewer scope |
| `claim.readiness.override` | Override advisory readiness outcome | Claim reviewer/compliance scope with reason |
| `claim.evidence.read` | Read scoped evidence package metadata | Claim-case scope |
| `claim.evidence.create` | Create or regenerate evidence package | Claim/evidence workflow scope |
| `claim.evidence.verify` | Verify evidence item/package | Claim reviewer/evidence scope |
| `claim.evidence.finalize` | Finalize package manifest | Claim reviewer/evidence scope |
| `claim.evidence.export` | Export or download evidence package | Explicit high-risk export scope |
| `audit.event.read` | Read audit events | Audit case or compliance scope |
| `audit.event.export` | Export redacted audit events | Audit export scope |
| `ai.suggestion.read` | Read scoped AI advisory artifacts | Invoking user's source-data scope |
| `ai.suggestion.review` | Accept or reject AI suggestion | Human reviewer scope |
| `ai.suggestion.override` | Override AI recommendation | Domain-specific authority |
| `ai.governance.manage` | Manage model/prompt/policy governance | AI governance/security scope |

Rules: no wildcard permissions; no mixed naming styles in new work; business-distinct actions use separate keys; browser flows must not use `service_role`.

### Compatibility Mapping

| Existing key | Canonical key | Compatibility risk | Proposed transition approach | Review Required |
|---|---|---|---|---|
| `soap:read`, `soap.view` | `clinical.soap.read` | RLS drift between old and new policies | Seed new key, dual-check during transition, retire old policies | Migration ordering |
| `soap:update`, `soap.update` | `clinical.soap.update` | Generic update currently covers draft, diagnosis writes, and amendment-like actions | Split create/update/review/sign/amend/void permissions | Policy split |
| `soap.create` | `clinical.soap.create` | Domain prefix mismatch | Map and re-seed | Low |
| `soap.approve_ai_content` | `clinical.soap.review` or future AI-specific review key | AI acceptance may differ from clinical review | Decide whether AI review remains SOAP-specific | Scope |
| `prescription:read`, `prescription.view` | `prescription.order.read` | Domain naming mismatch | Map read policies | Low |
| `prescription:update`, `prescription.create` | `prescription.order.create`, `prescription.order.update` | Create/update/order authority conflated | Split order creation and update states | Prescriber policy |
| `prescription.dispense` | `prescription.order.dispense` | Missing verify/reverse separation | Keep dispense mapping, add verify/reverse | Pharmacy scope |
| `inventory:manage`, `inventory.adjust` | keep inventory-specific future keys | Stock authority may be conflated with dispensing | Require both dispensing and inventory movement authority where needed | Negative stock rules |
| none | `prescription.safety_alert.*` | Alerts not durable today | Add table and permissions together | Alert RLS |
| none | `clinical.diagnosis.*`, `clinical.coding.*` | Diagnosis writes currently piggyback on SOAP update | Add diagnosis/coding policies | Clinical/coder separation |
| none | `clinical.medical_certificate.*` | Certificate metadata table absent | Add table, policies, storage policies | Export scope |
| `claim.view` | `claim.readiness.read`, `claim.evidence.read` | Readiness and evidence are conflated | Split claim/evidence read policies | Claim-case scope |
| `claim.review` | `claim.readiness.review` | Review and override are not separated | Add override and evidence verification permissions | Override governance |
| `audit.view` | `audit.event.read` | Audit export is absent | Keep read mapping; add export key separately | Audit export policy |
| none | `ai.*` | AI governance tables absent | Add with AI governance schema and HITL tests | AI scope |

## Migration 012 Role Assignment Workflow Permissions

Task: DB-P1-CONTROLLED-ROLE-ASSIGNMENT-WORKFLOW

New controlled RBAC permissions:

| Permission | Domain | Assigned roles | Notes |
|---|---|---|---|
| `role_assignment.read` | rbac | `platform_admin`, `organization_admin`, `clinic_admin` | Read workflow-visible assignment state. |
| `role_assignment.assign` | rbac | `platform_admin`, `organization_admin`, `clinic_admin` | Assign roles within delegated scope only. |
| `role_assignment.revoke` | rbac | `platform_admin`, `organization_admin`, `clinic_admin` | Revoke roles within delegated scope only. |
| `role_assignment.manage_expiry` | rbac | `platform_admin`, `organization_admin`, `clinic_admin` | Set expiry during controlled assignment. |
| `role_assignment.assign_platform_role` | rbac | `platform_admin` only | Required for protected platform-role assignment and revocation. |

Scope rules:

- `platform_admin` may assign platform roles only through the controlled workflow.
- `organization_admin` may assign organization-scoped and clinic-scoped roles inside its active organization, but not platform roles.
- `clinic_admin` may assign and revoke clinic-scoped roles only for its authorized active clinic.
- `role.assign` remains a compatibility/read-policy key; it is not sufficient for the new controlled write workflow.
