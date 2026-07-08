# Solution Architect Templates

## Architecture Decision Record Template

- ADR ID:
- Title:
- Status: Proposed / Accepted / Superseded / Rejected
- Date:
- Context:
- Decision:
- Options Considered:
- Rationale:
- Consequences:
- Clinical Safety Impact:
- Insurance Impact:
- Compliance Impact:
- Audit Impact:
- Security Impact:
- MVP Impact:
- Future Scaling Impact:
- Owner:

## System Context Template

- Business Objective:
- Users:
- Internal Modules:
- External Systems:
- Data Sources:
- Sensitive Data:
- Decision-Support Boundary:
- Human Review Points:
- Audit Events:
- Compliance Constraints:
- Assumptions:
- Open Questions:

## Module Design Template

| Module | Responsibility | Inputs | Outputs | Owner Agent | Dependencies | Audit Events |
| ------ | -------------- | ------ | ------- | ----------- | ------------ | ------------ |

- Module Boundary:
- Business Rules:
- Validation:
- Failure Modes:
- Security Boundary:
- MVP Scope:
- Future Extension:

## API Responsibility Template

| Service/API | Responsibility | Input | Output | Validation | Error Handling |
| ----------- | -------------- | ----- | ------ | ---------- | -------------- |

- Authentication:
- Authorization:
- RLS Consideration:
- Audit Events:
- Idempotency:
- Rate/Performance Concerns:
- Sensitive Data Handling:

## Data Flow Template

| Step | Source | Data | Destination | Validation | Audit Required |
| ---- | ------ | ---- | ----------- | ---------- | -------------- |

- Data Owner:
- Data Classification:
- Consent Requirement:
- Retention Requirement:
- Traceability:
- Failure Handling:

## Integration Design Template

- Integration Name:
- Business Purpose:
- Source System:
- Target System:
- Data Exchanged:
- Trigger:
- Protocol/Pattern:
- Authentication:
- Authorization:
- Error Handling:
- Retry Strategy:
- Audit Events:
- Monitoring:
- Compliance Constraints:

## Security Boundary Template

- Roles:
- Permissions:
- Data Boundary:
- RLS Consideration:
- Sensitive Data Handling:
- Consent Requirement:
- Access Logging:
- Privileged Actions:
- Least-Privilege Notes:
- Security Risks:
- Mitigations:

## AI Safety Architecture Template

- AI Function:
- Input Data:
- Input Validation:
- Prompt/Model Version:
- Output:
- Confidence Handling:
- Low-Confidence Behavior:
- Explainability:
- Human-in-the-loop Rule:
- Safety Disclaimer:
- Prohibited AI Actions:
- Audit Events:
- Review Queue:

## Claim Readiness Architecture Template

- Business Objective:
- Trigger:
- Required Inputs:
- SOAP Dependencies:
- Diagnosis/ICD Dependencies:
- Prescription Dependencies:
- Evidence Dependencies:
- Payer Rule Dependencies:
- Economic Signals:
- Scoring Responsibility:
- Explanation Responsibility:
- Reviewer Status:
- Human Review Point:
- Audit Events:
- Exception Flow:
- MVP Scope:

## Evidence Package Architecture Template

- Package Purpose:
- Visit Scope:
- Required Evidence:
- Optional Evidence:
- Completeness Rules:
- Source Modules:
- Generation Service:
- Export Format:
- Reviewer Handoff:
- Audit Events:
- Missing Evidence Behavior:
- Sensitive Data Handling:

## Audit Trail Design Template

- Event Name:
- Trigger:
- Actor:
- Timestamp:
- Entity:
- Reason:
- Before:
- After:
- Source Module:
- Correlation ID:
- Sensitive Data Policy:
- Retention:
- Reporting Use:
- Compliance Owner:

## MVP Architecture Review Template

- MVP Goal:
- Must Have:
- Should Have:
- Could Have:
- Future Phase:
- Excluded Scope:
- Architecture Risks:
- Clinical Safety Risks:
- Insurance Risks:
- Compliance Risks:
- Security Risks:
- Operational Risks:
- Handoff Readiness:
- Recommended Next Action:
