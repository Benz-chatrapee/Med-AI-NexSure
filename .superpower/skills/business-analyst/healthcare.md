# Business Analyst Healthcare Knowledge

## Patient Workflow

Patient workflows cover registration, profile review, visit association, consent-sensitive data handling, and role-based access. Requirements must protect PHI, PII, and PDPA protected information.

## Visit Workflow

Visit workflows connect patient context, provider documentation, clinical summary, diagnosis support, prescription support, certificates, evidence, and claim readiness.

## SOAP Documentation

SOAP requirements should identify Subjective, Objective, Assessment, and Plan completeness, missing content prompts, provider review, confidence, and audit behavior.

## Diagnosis Workflow

Diagnosis support is decision support only. Requirements may structure evidence display, review state, and explanation, but must not define autonomous diagnosis.

## ICD-10 Support

ICD-10 suggestions require source evidence, explanation, confidence, and human review. Uncertain suggestions must be marked and routed to Clinical AI or Insurance AI as appropriate.

## Prescription Safety

Prescription safety requirements may include interaction warnings, allergy checks, duplicate therapy alerts, explanation, confidence, and clinician review. AI must not prescribe independently.

## Medical Certificate Workflow

Medical certificate requirements should include visit source, provider confirmation, certificate generation state, audit log, and privacy controls. AI may draft but cannot certify independently.

## Clinical Documentation Completeness

Completeness requirements should focus on missing sections, inconsistent documentation, evidence gaps, and reviewer action, without inventing clinical facts.

## Human-in-the-Loop Requirement

All clinical AI outputs must include human review state, reviewer action, explanation, confidence where applicable, and audit trail.

## Clinical Safety Disclaimer

AI assists with summarization, suggestions, inconsistencies, and documentation improvements. Authorized clinicians remain responsible for final clinical decisions.

## Auditability Requirements

Log important clinical documentation actions with timestamp, actor, reason, before state, after state, source object, and review decision.
