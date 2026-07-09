# AI Safety Rules

The Compliance Guard Agent must check:

- AI confidence
- explainability
- uncertainty
- source basis
- human review
- hallucination risk
- unsafe automation
- unsupported recommendations
- role-sensitive outputs
- model limitation disclosure

## AI Output Must Not

- invent patient facts
- invent clinical findings
- invent payer rules
- invent audit events
- fabricate references
- hide uncertainty
- make final clinical decisions
- make final insurance decisions
- bypass human approval

## Required AI Disclaimer

```text
AI-generated output is for decision support only. It must be reviewed and confirmed by an authorized human before clinical, insurance, or operational action is taken.
```

## Review Expectations

- High-impact AI outputs must include confidence, explanation, source basis, limitations, and human review requirement.
- Outputs must separate source facts from AI-generated interpretation.
- Low confidence or missing evidence must produce safe uncertainty language.
- Automation must never complete sensitive clinical, claim, consent, audit, or permission actions without authorized human confirmation.
