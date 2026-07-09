# QA Agent Examples

## Claim Readiness QA Review
- Summary: Claim readiness calculation is testable but release is blocked until scoring evidence and audit logs are verified.
- Reasoning: The workflow must validate completed visit -> score -> missing evidence -> payer rule result -> evidence package -> claim review. Scores must use SOAP 25%, Diagnosis & ICD 20%, Prescription / Procedure 15%, Evidence 20%, Insurance Rule 10%, Economic 10%.
- Confidence: Medium, pending sample score calculations and audit records.
- Deliverables: Test cases QA-CLAIM-001 through QA-CLAIM-008, regression checklist, defect BUG-CLAIM-001 if score mismatch is reproduced.
- Risks: Incorrect readiness score, invented payer rule, missing evidence, reviewer over-reliance on AI.
- Recommendations: Add score component breakdown and human review reminder.
- Next Action: Backend and Insurance agents provide scoring contract and payer rule fixtures.

## SOAP Note QA Review
- Summary: SOAP workflow requires functional, clinical, audit, and AI summary checks.
- Reasoning: SOAP completeness affects clinical documentation and claim readiness; version history and clinician review are required.
- Confidence: Medium.
- Deliverables: SOAP completeness checklist, QA-SOAP-001 create draft, QA-SOAP-002 submit note, QA-SOAP-003 audit version history.
- Risks: Missing objective findings, unsupported AI summary, incomplete audit trail.
- Recommendations: Block finalization when required fields are missing.
- Next Action: Frontend and Backend agents confirm validation rules.

## AI ICD Suggestion QA Review
- Summary: ICD suggestions must be evidence-linked and clinician-reviewed.
- Reasoning: AI may suggest but must not invent ICD codes or make final diagnosis.
- Confidence: Medium.
- Deliverables: AI safety review, QA-ICD-001 evidence-supported suggestion, QA-ICD-002 low-confidence disclaimer.
- Risks: Incorrect ICD, unsupported diagnosis, overconfident output.
- Recommendations: Display confidence, rationale, source evidence, alternatives, and human review reminder.
- Next Action: AI Clinical agent provides prompt/output samples.

## Evidence Package QA Review
- Summary: Evidence package readiness depends on completeness score, source traceability, permissions, and export audit.
- Reasoning: Claim reviewers need complete and auditable evidence without unauthorized data exposure.
- Confidence: Medium.
- Deliverables: QA-EVID-001 package generation, QA-EVID-002 missing evidence, QA-EVID-003 export log.
- Risks: Missing documents, stale evidence, PHI leakage, missing export audit.
- Recommendations: Include package version and source list.
- Next Action: Database agent confirms evidence tables and audit schema.

## Prescription Safety QA Review
- Summary: Prescription safety is release-blocking if critical allergy or interaction alerts fail.
- Reasoning: Patient safety priority requires visible, auditable alerts and clinician acknowledgement.
- Confidence: Medium.
- Deliverables: QA-RX-001 allergy alert, QA-RX-002 interaction alert, QA-RX-003 acknowledgement audit.
- Risks: Harmful medication, missing alert, unaudited override.
- Recommendations: Treat missed critical alert as Critical/P1.
- Next Action: Clinical AI and Backend agents provide alert rule sources.

## RBAC QA Review
- Summary: Role and data-scope validation must include UI, API, direct URL, and Supabase RLS checks.
- Reasoning: Unauthorized patient access is a Critical defect.
- Confidence: Medium.
- Deliverables: RBAC matrix, QA-RBAC-001 doctor allowed access, QA-RBAC-002 cross-clinic denial.
- Risks: Cross-organization exposure, clinic leakage, admin overreach.
- Recommendations: Test denied paths as thoroughly as allowed paths.
- Next Action: Backend and Database agents provide role matrix and RLS policies.

## Defect Report Example
- Summary: BUG-CLAIM-001 blocks release because claim readiness score differs from approved weights.
- Reasoning: Incorrect score can mislead claim readiness decisions and downstream evidence packaging.
- Confidence: High if reproduced with controlled test data.
- Deliverables: Defect report with score input, expected calculation, actual score, screenshots/logs, and affected roles.
- Risks: Incorrect claim readiness status, reviewer confusion, compliance issue if audit lacks calculation trace.
- Recommendations: Fix scoring service and add regression tests for Ready, Needs Review, and Not Ready thresholds.
- Next Action: Backend and Insurance agents investigate scoring implementation.
