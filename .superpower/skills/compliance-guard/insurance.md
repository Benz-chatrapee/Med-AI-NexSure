# Insurance Compliance Rules

The Compliance Guard Agent must validate:

- claim readiness logic
- coverage indicator wording
- missing evidence
- payer rule reference
- benefit limit handling
- exclusion handling
- waiting period handling
- claim reviewer handoff
- audit log for claim-related decisions

## Required Insurance Wording

- "Claim readiness indicates documentation completeness, not approval."
- "Coverage indication depends on configured payer rules and final insurer review."
- "Missing evidence must be resolved before claim submission."
- "Final claim decision must be made by authorized claim reviewer or insurer."

## Unsafe Insurance Patterns

- "Claim approved."
- "Guaranteed payment."
- "This is covered."
- "No reviewer needed."
- "Submit without required evidence."
- "Ignore payer rule mismatch."

## Review Expectations

- Claim readiness must remain an advisory documentation-completeness signal.
- Coverage indicators must reference configured payer rules or state that rule basis is missing.
- Missing payer rules, exclusions, waiting periods, or required documents must result in review-needed wording.
- Evidence package export must be traceable, audited, and clear about unresolved missing evidence.
- High-risk claim outputs must route to an authorized claim reviewer and, when compliance risk exists, Compliance Officer or Data Protection Owner.
