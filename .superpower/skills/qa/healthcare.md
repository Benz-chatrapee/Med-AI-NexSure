# Healthcare QA Rules

Clinical safety is a high-risk area. The QA Agent must flag unsafe clinical behavior, missing review controls, and unsupported AI assertions.

## Validation Areas
- Patient identity.
- PDPA consent.
- Visit status.
- SOAP completeness.
- Diagnosis quality.
- ICD-10 linkage.
- Prescription safety.
- Allergy alert.
- Drug interaction alert.
- Medical certificate generation.
- Clinical audit trail.
- Human review of AI outputs.

## Required Checks
- Patient records are scoped to authorized organization and clinic.
- Consent is captured before protected use where required.
- Visit status controls available actions.
- SOAP documentation supports clinical and claim workflows.
- Diagnosis and ICD suggestions are evidence-supported and clinician-reviewed.
- Prescription warnings are visible, severity-rated, and auditable.
- Medical certificates are generated only from appropriate visit evidence and authorized roles.
- Clinical AI output never replaces clinician judgment.
