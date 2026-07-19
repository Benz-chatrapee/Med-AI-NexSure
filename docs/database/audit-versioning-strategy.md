# Audit and Versioning Strategy

## 1. Document Control
Status: Populated for DB-DOC-BATCH-6-INSURANCE. Source of truth: migrations `001`, `006`, `007`, numbered audit strategy, and Batch 5 clinical docs. Runtime effect: none.

## 2. Purpose
Defines how audit logs and domain version history support clinical, insurance, evidence, RBAC, storage, and dashboard traceability.

## 3. Scope
Existing: `audit_logs`, `soap_note_versions`, `organization_setting_versions`, `claim_readiness_assessments.assessment_version`, `evidence_packages.package_version`, actor columns, audit RLS, and indexes. Future: domain-specific version tables, audit integrity controls, export logs, payer-rule versions, evidence manifests.

## 4. Audit versus Domain History
Audit events answer who did what and why. Domain version tables preserve authoritative record history. Audit log is not a substitute for SOAP, diagnosis, prescription, certificate, claim, evidence, or payer-rule version tables.

## 5. Append-only Audit Events
Existing `audit_logs` has no update/delete policy in migration `007`; authenticated users can insert scoped rows and select with `audit.view`. Normal roles must not update or delete audit events. True immutability is Planned, not implemented.

## 6. Record Versioning Principles
Signed clinical versions, claim assessment versions, evidence package versions, and payer-rule versions must remain preserved. Changes after finalization use amendment, supersession, revocation, reissue, recalculation, or regeneration.

## 7. SOAP Versioning
Existing `soap_note_versions` stores section copies, status, version, and change reason. Signed-state immutability is Planned.

## 8. Diagnosis Versioning
Future `diagnosis_versions` preserves diagnosis text, status, designation, author, reviewer, confirmation timestamp, and amendment reason.

## 9. ICD Mapping Versioning
Future `diagnosis_code_mapping_versions` preserves code system, code-system version, code, confidence, reviewer, and override reason independently from diagnosis text.

## 10. Prescription Versioning
Future `prescription_versions` and dispensing event tables preserve ordering, verification, dispensing, and reversal history.

## 11. Medical-certificate Versioning
Future certificate version/signature/export tables preserve issued content hash, template version, signer, revocation, supersession, and reissue.

## 12. Claim-assessment Versioning
Existing `assessment_version` and unique `(visit_id, assessment_version)` preserve assessment history. Future source-reference tables should link each assessment to immutable clinical/rule/evidence versions.

## 13. Evidence-package Versioning
Existing `package_version`, storage reference, and checksum support package versioning. Future manifests should identify exact item and source versions.

## 14. Payer-rule Versioning
Application payer-rule features are mock-backed. Future payer-rule version tables must preserve rules used for simulations and readiness calculations.

## 15. AI Model, Prompt, and Policy Versioning
Existing SOAP/diagnosis AI metadata has `model_name`, `model_version`, and confidence. Future AI records should include prompt/policy version and evidence references. AI remains decision support only.

## 16. Before and After State
Existing `audit_logs.old_value` and `new_value` are JSONB. Use minimized fields only; do not store full clinical records, full documents, raw payer contracts, credentials, tokens, or unrestricted PHI.

## 17. Redaction
Audit snapshots must be redacted before insert. Redaction responsibility belongs to server/database workflows that create the audit event.

## 18. Sensitive-data Restrictions
Prohibited in generic audit JSON: secrets, access tokens, private signing keys, full SOAP text, raw identity documents, unrestricted document contents, and full signed certificate content.

## 19. Correlation IDs
Existing `correlation_id text` supports tracing. High-risk workflows should require correlation ID across domain write, version write, storage action, and audit event.

## 20. Transaction Consistency
High-risk mutations must write domain change, version row, and audit row in one transaction. If audit fails, the high-risk mutation should fail.

## 21. High-risk Mutation Handling
High-risk actions include SOAP signing/amendment, diagnosis confirmation/amendment, prescription verification/dispensing/reversal, safety override, certificate issue/revoke/reissue/export, claim readiness override, evidence finalization/export, and role assignment.

## 22. Audit Failure Handling
For high-risk writes, fail closed. For low-risk view events, application may degrade with a security alert only if policy permits and no PHI is exposed.

## 23. Integrity Controls
Planned: append-only enforcement, hash chaining or signed audit batches, privileged break-glass logging, retention lock, and export integrity checks.

## 24. Access Controls
Existing `mvp1_audit_logs_select` requires `audit.view`; insert requires organization membership and clinic access. Audit exports should require a separate future export permission.

## 25. Retention
Audit and domain version retention must align with healthcare, insurance, payer, and PDPA-aware policies. Purge/archive jobs are not implemented.

## 26. Query Patterns
Existing indexes support organization/time and target-record lookups. Common patterns: patient/visit timeline, claim case timeline, target record audit, security review, export audit, and dashboard activity.

## 27. Testing
Planned tests: audit insert on high-risk action, blocked audit update/delete by normal roles, redaction validation, correlation ID propagation, RLS access by role, and domain-version/audit consistency.

## 28. Future Extensions
Audit integrity table, domain version tables, export logs, payer-rule versions, evidence manifests, storage access logs, and partitioning.

## 29. Compatibility-sensitive Items
Existing enum `audit_action_type` lacks specific domain event values; app-level mock audit actions differ from database enum; audit JSON fields are flexible; no database append-only trigger exists.

## 30. Review Required Decisions
Audit event taxonomy, redaction schema, immutable audit enforcement, export permission key, retention period, partitioning threshold, and hash-chain strategy.

## Object Classification
| Classification | Items |
|---|---|
| Existing | `audit_logs`, `soap_note_versions`, `organization_setting_versions`, assessment/package versions, audit RLS, audit indexes |
| Planned | high-risk transaction/audit consistency, redaction checks, export audit |
| Future | diagnosis/prescription/certificate/payer-rule/evidence manifest version tables, integrity controls |
| Review Required | retention, append-only enforcement, event taxonomy |
| Compatibility Sensitive | `audit_action_type`, `old_value`, `new_value`, app mock audit actions |

## Batch 6 Flow Notes
| Flow | Actor | Input | Permission | Context | Source versions | Transaction | State transition | Audit | Failure behavior | Output |
|---|---|---|---|---|---|---|---|---|---|---|
| High-risk mutation and audit | authorized user | mutation request | domain permission | org/clinic/record | current and new version | domain + version + audit | domain-specific | specific event | fail closed | committed change |
| Historical version retrieval | clinician/reviewer/auditor | target record | read/audit permission | scoped record | immutable version IDs | read only | none | optional `view` | denied/empty | version timeline |
| Audit export | auditor/compliance | filtered audit set | planned export | org/clinic/case | audit rows | export + audit | none | `export` | blocked export | redacted export |
