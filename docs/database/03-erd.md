# Entity Relationship Diagrams

Diagrams are separated by module to keep Mermaid blocks reviewable.

## Foundation

```mermaid
erDiagram
  organizations ||--o{ clinics : has
  organizations ||--|| organization_profiles : has
  organizations ||--o{ organization_addresses : has
  organizations ||--|| organization_branding : has
  clinics ||--o{ clinic_addresses : has
  clinics ||--o{ clinic_business_hours : has
  clinics ||--|| clinic_settings : has
```

## Identity and RBAC

```mermaid
erDiagram
  organizations ||--o{ user_profiles : owns
  clinics ||--o{ user_profiles : primary_clinic
  organizations ||--o{ organization_memberships : grants
  clinics ||--o{ clinic_memberships : grants
  user_profiles ||--o{ organization_memberships : member
  user_profiles ||--o{ clinic_memberships : member
  organizations ||--o{ roles : scopes
  permissions ||--o{ role_permissions : granted
  roles ||--o{ role_permissions : has
  user_profiles ||--o{ user_roles : assigned_legacy
  roles ||--o{ user_roles : assigned_legacy
  user_profiles ||--o{ user_role_assignments : assigned
  roles ||--o{ user_role_assignments : assigned
```

## Patients and Visits

```mermaid
erDiagram
  organizations ||--o{ patients : owns
  clinics ||--o{ patients : registers
  patients ||--o{ patient_clinic_registrations : has
  clinics ||--o{ patient_clinic_registrations : issues
  patients ||--o{ visits : has
  clinics ||--o{ visits : hosts
  visits ||--o{ visit_vitals : records
  user_profiles ||--o{ visits : attends
```

## Clinical Documentation

```mermaid
erDiagram
  visits ||--|| soap_notes : current_note
  soap_notes ||--o{ soap_note_versions : versions
  visits ||--o{ visit_diagnoses : has
  diagnoses ||--o{ visit_diagnoses : codes
  user_profiles ||--o{ soap_notes : reviews
  user_profiles ||--o{ visit_diagnoses : accepts
```

## Prescriptions and Inventory

```mermaid
erDiagram
  visits ||--o{ prescriptions : has
  prescriptions ||--o{ prescription_items : contains
  inventory_items ||--o{ prescription_items : dispenses
  inventory_items ||--o{ inventory_batches : has
  inventory_items ||--o{ stock_movements : ledger
  inventory_batches ||--o{ stock_movements : ledger
```

## Claim and Evidence

```mermaid
erDiagram
  visits ||--o{ claim_readiness_assessments : assessed
  claim_readiness_assessments ||--o{ claim_readiness_items : breaks_down
  visits ||--o{ evidence_packages : packages
  user_profiles ||--o{ claim_readiness_assessments : reviews
  user_profiles ||--o{ evidence_packages : approves
```

## Settings, Integrations, and Audit

```mermaid
erDiagram
  organizations ||--|| organization_operational_settings : configures
  organizations ||--|| organization_claim_settings : configures
  organizations ||--|| organization_clinical_settings : configures
  organizations ||--|| organization_security_settings : configures
  organizations ||--|| organization_compliance_settings : configures
  system_modules ||--o{ organization_module_settings : toggles
  organizations ||--o{ organization_module_settings : owns
  notification_event_types ||--o{ organization_notification_settings : configures
  integration_providers ||--o{ organization_integrations : connects
  organizations ||--o{ organization_setting_versions : versions
  organizations ||--o{ audit_logs : records
  clinics ||--o{ audit_logs : scopes
  user_profiles ||--o{ audit_logs : acts
```

## Proposed Future Tables

```mermaid
erDiagram
  visits ||--o{ visit_status_history : proposed
  visits ||--o{ medical_certificates : proposed
  patients ||--o{ clinical_documents : proposed
  prescriptions ||--o{ prescription_safety_alerts : proposed
  evidence_packages ||--o{ evidence_package_items : proposed
```
