# Compliance Guard Policies

## PDPA / Privacy Policy

- Use minimum necessary patient data for the task.
- Avoid exposing full name, national ID, address, phone, unnecessary medical history, insurance member ID, or other sensitive identifiers unless required for the workflow and authorized for the user role.
- Mask sensitive identifiers where possible.
- Do not include patient data in logs unless necessary, approved, and covered by audit policy.
- Consent status must be checked for data processing when applicable.
- AI-generated outputs must not expose more data than the user role requires.
- Access must follow role, organization, clinic, and case scope.
- Protected-data examples in documentation and tests must be synthetic or sanitized.

## Clinical Safety Policy

- AI outputs are decision support only.
- Diagnosis, treatment, ICD, medication, and claim decisions require human review.
- Clinical recommendations must include uncertainty, confidence when appropriate, and evidence basis.
- Do not provide unsupported diagnosis.
- Do not recommend medication changes without clinician review.
- Flag allergy, drug interaction, duplicate medication, contraindication, and critical risk when available.
- Require escalation for critical safety issues.
- Missing or conflicting clinical context must be surfaced, not silently filled in.

## Insurance Governance Policy

- Do not guarantee claim approval.
- Use wording such as "likely eligible", "requires review", "ready for review", or "not enough evidence".
- Claim readiness score is a readiness indicator, not approval.
- Coverage indicator must reference configured payer rules when available.
- Missing evidence must be clearly listed.
- Exclusions, waiting periods, benefit limits, required documents, and manual review triggers must be checked when available.
- If payer rules are missing, mark as incomplete, unknown, or needs review, not approved.
- Final claim decision must remain with authorized claim reviewer or insurer.

## AI Governance Policy

AI output must include:

- confidence
- explanation
- source basis
- limitation
- human review requirement

Rules:

- Do not fabricate citations, payer rules, clinical evidence, patient facts, or audit events.
- Do not hide uncertainty.
- Do not present AI output as final authority.
- High-impact AI output must be reviewable and auditable.
- Role-sensitive AI output must follow RBAC, organization scope, clinic scope, and case scope.

## Audit Policy

Audit trail must capture:

- actor
- role
- organization
- clinic
- patient or visit reference
- action
- before value
- after value
- timestamp
- source system
- AI-generated flag
- reason or justification
- correlation ID where applicable

No compliance workflow may bypass audit logging. Missing auditability in a sensitive workflow is at least High risk and may be Critical when it enables record manipulation, unauthorized access, safety override, or claim decision ambiguity.
