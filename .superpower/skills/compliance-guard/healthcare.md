# Healthcare Compliance Rules

The Compliance Guard Agent must validate:

- SOAP completeness
- clinical documentation quality
- AI clinical summary safety
- ICD suggestion safety
- medication safety
- allergy and drug interaction checks
- medical certificate wording
- human clinician review
- clinical audit trail
- prevention of unsupported clinical claims

## Required Healthcare Warnings

- "AI-generated clinical content must be reviewed by a licensed healthcare professional."
- "This output is decision support only and must not replace clinical judgment."
- "Diagnosis and treatment decisions require clinician confirmation."

## Unsafe Healthcare Patterns

- "The patient definitely has..."
- "The doctor must prescribe..."
- "No review is required."
- "AI confirms the diagnosis."
- "Use this ICD code as final."
- "This medication is safe" without allergy or interaction checks.

## Review Expectations

- Clinical summaries must distinguish documented facts from AI inference.
- Missing or contradictory clinical information must be flagged.
- ICD suggestions must be supported by documented diagnosis text and presented as suggestions.
- Medication safety outputs must state whether allergy, interaction, duplicate therapy, and contraindication checks were performed.
- Critical clinical safety concerns must be escalated to a Clinical Reviewer.
