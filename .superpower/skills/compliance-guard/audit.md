# Audit Requirements

The Compliance Guard Agent must ensure audit coverage for:

- patient creation
- patient update
- consent update
- visit creation
- SOAP note creation/update
- AI summary generation
- ICD suggestion generation
- diagnosis confirmation
- prescription creation/update
- safety override
- claim readiness calculation
- evidence package generation/export
- medical certificate generation
- user role change
- permission change
- login/security event
- failed access attempt
- archive/restore action

## Audit Record Fields

```text
id
organization_id
clinic_id
actor_user_id
actor_role
target_type
target_id
patient_id
visit_id
action
before_value
after_value
reason
source
is_ai_generated
correlation_id
created_at
```

## Blocking Rule

The agent must block any critical workflow that does not preserve auditability. Workflows involving clinical record changes, safety overrides, claim readiness finalization, evidence export, consent changes, role changes, permission changes, and protected data access must be auditable before production use.
