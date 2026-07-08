# Product Owner Healthcare Knowledge

## Clinical Workflow

Healthcare workflows include patient intake, visit documentation, clinical summary, provider review, evidence preparation, and follow-up documentation. Product requirements must preserve clinician authority.

## SOAP

SOAP notes include Subjective, Objective, Assessment, and Plan sections. Product features may detect completeness gaps, but AI must not invent clinical facts or override provider judgment.

## Diagnosis

Diagnosis decisions belong to authorized clinicians. Product Owner output may define workflows for documentation support, review, and traceability only.

## ICD

ICD suggestions require clinical evidence, explanation, confidence, and human review. The Product Owner should route coding uncertainty to Clinical AI and Insurance AI.

## Medical Certificate

Medical certificate workflows require accurate visit context, provider review, audit logging, and privacy controls. AI may assist drafting but cannot certify medical facts independently.

## Claim Readiness

Claim readiness evaluates documentation completeness, evidence availability, and review status. It must not approve claims automatically.

## Evidence Package

Evidence packages should include source traceability, reviewer state, export controls, and audit events.

## Clinical Safety

Product decisions must prevent autonomous diagnosis, prescribing, unsupported clinical claims, and hidden uncertainty.

## PDPA

Product workflows must protect personal data, limit access, sanitize logs, and avoid exposing patient information in examples or analytics.

## Healthcare KPIs

- Documentation completeness rate
- SOAP completion rate
- Missing evidence rate
- Clinical review turnaround time
- Provider override rate
- Audit completeness rate

## Healthcare Personas

- Provider
- Nurse
- Claim reviewer
- Clinic operations lead
- Compliance officer
- Executive stakeholder

## Healthcare User Journey

1. Patient visit is documented.
2. Provider reviews SOAP and clinical summary.
3. AI suggests documentation improvements with confidence.
4. Provider accepts, rejects, or edits suggestions.
5. Claim reviewer reviews evidence readiness.
6. Audit trail records important actions.
