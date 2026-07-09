# Audit Log Agent Templates

## 1. Audit Event Definition Template

# Audit Event Definition

## Event Name
Use a clear name such as `SOAP Note Updated` or `Evidence Package Exported`.

## Event Category
Use one canonical category from the Audit Log Agent catalog.

## Trigger
Describe the exact user action, system job, AI call, or security event that creates the audit event.

## Actor
Identify the actor type and required actor fields: user, system job, AI service, integration, or administrator.

## Target Entity
Identify entity type and ID. Include patient, visit, claim, evidence package, prompt, payer rule, or role references when applicable.

## Required Fields
List mandatory payload fields, including tenant scope, actor, event, target, source, request ID, correlation ID, risk, severity, and timestamp.

## Optional Fields
List contextual fields such as page, component, user agent, IP address, session ID, AI metadata, changed fields, or compliance tags.

## Before / After Capture
State whether before and after values are required. Use masked field-level summaries for sensitive values.

## Risk Level
`LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.

## Severity
`INFO`, `NOTICE`, `WARNING`, `HIGH`, or `CRITICAL`.

## Retention Requirement
Define retention category, legal hold behavior, and whether claim dispute or clinical documentation retention applies.

## Compliance Tags
Use tags such as `PDPA`, `OIC`, `CLINICAL_SAFETY`, `CLAIM_REVIEW`, `AI_GOVERNANCE`, `SECURITY`, `ACCESS_CONTROL`, `DATA_EXPORT`, `FINANCIAL_IMPACT`, `HUMAN_REVIEW`.

## Example Payload

```json
{
  "event_category": "SOAP_UPDATE",
  "event_action": "update",
  "actor_user_id": "usr_clinician_001",
  "actor_role": "clinician",
  "target_entity_type": "soap_note",
  "target_entity_id": "soap_20260709_001",
  "target_patient_id": "pat_demo_001",
  "target_visit_id": "vis_demo_001",
  "changed_fields": ["assessment", "plan"],
  "source_module": "SOAP Note",
  "correlation_id": "corr_demo_001",
  "risk_level": "HIGH",
  "severity": "HIGH",
  "pdpa_sensitive": true,
  "compliance_tags": ["PDPA", "CLINICAL_SAFETY", "HUMAN_REVIEW"]
}
```

## 2. Audit Review Template

# Audit Review

## Feature / Module
Name the module and feature under review.

## Workflow Reviewed
Describe the user, system, AI, export, and reviewer workflow.

## Critical Actions
List actions that change clinical, insurance, access, privacy, AI, or compliance state.

## Missing Audit Events
List missing event categories and trigger points.

## Sensitive Data Risk
Describe PHI, PII, PDPA, clinical text, claim data, financial data, or credential exposure risks.

## Traceability Risk
Describe gaps in actor, target, timestamp, source, correlation ID, before/after, or review trail.

## Compliance Risk
Describe PDPA, OIC, clinical safety, AI governance, security, or audit retention risk.

## Recommendation
Provide required audit events, payload fields, masking rules, and severity/risk levels.

## Required Backend Changes
List service, API, validation, transaction, and event trigger changes.

## Required Database Changes
List tables, columns, indexes, constraints, retention, RLS, and immutability needs.

## Required QA Tests
List unit, integration, E2E, RBAC, negative, and regression tests.

## 3. AI Output Audit Template

# AI Output Audit

## AI Feature
Name the AI feature, module, and workflow.

## Prompt Used
Reference prompt ID only. Do not include raw patient-sensitive prompt text.

## Prompt Version
Record immutable prompt version.

## Input Reference
Reference source record IDs, not raw clinical or claim text.

## Output Summary
Summarize output at a safe level.

## Confidence
Record numeric confidence or explicit `not_provided` when the provider does not supply confidence.

## Human Review Requirement
State whether review is required and why.

## Accepted / Rejected By
Record reviewer user ID and role when disposition occurs.

## Final Human Decision
Record final disposition without making the AI the final clinical or claim authority.

## Audit Notes
Capture uncertainty, missing information, disclaimers, and follow-up requirements.

## 4. Claim Audit Template

# Claim Audit Trace

## Visit ID
Reference visit ID.

## Patient Reference
Use patient ID or masked reference only.

## Claim Readiness Score
Record score and component summary.

## Evidence Package Status
Record generated, pending, exported, regenerated, or invalidated.

## Missing Evidence
List missing evidence types without raw clinical content.

## Rule Evaluation
Reference payer rule IDs, versions, and evaluation result.

## Override History
Record reviewer, reason, before score/status, after score/status, and timestamp.

## Export History
Record export actor, destination type, file reference, and generated PDF/report IDs.

## Reviewer Action
Record reviewer action and human decision authority.

## Final Audit Summary
Summarize traceability, risks, and unresolved gaps.
