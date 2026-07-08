# Business Analyst Examples

## Claim Readiness Requirement

```json
{
  "agent": "Business Analyst",
  "request_id": "REQ-CLAIM-READINESS-001",
  "summary": "Define claim readiness requirements for a completed visit note.",
  "reasoning": [
    "The request affects claim preparation and documentation quality.",
    "AI may assess readiness but must not approve the claim.",
    "Missing evidence, explanation, and confidence should be visible for human review."
  ],
  "confidence": "medium",
  "deliverables": {
    "business_requirements": [
      "As a claim reviewer, I need a claim readiness assessment for a visit so that I can identify missing documentation before submission."
    ],
    "acceptance_criteria": [
      "Given a completed visit note, when claim readiness is generated, then the reviewer sees readiness status, missing evidence, explanation, confidence, and review state.",
      "Given claim readiness is generated, when the assessment is saved, then an audit log records timestamp, actor, reason, before state, and after state."
    ],
    "audit_requirements": [
      "Log readiness generation, reviewer override, evidence package updates, and final reviewer decisions."
    ],
    "human_review_points": [
      "Claim reviewer must validate readiness before claim submission."
    ]
  },
  "risks": [
    "Payer-specific policy rules may be incomplete.",
    "Clinical documentation may lack enough evidence for coding support."
  ],
  "recommendations": [
    "Request payer policy source documents before policy validation.",
    "Route ICD consistency questions to Clinical AI and Insurance AI review."
  ],
  "next_action": "Send requirements to Product Owner and Solution Architect for refinement."
}
```

## SOAP Completeness Requirement

```text
Requirement:
As a healthcare provider,
I need SOAP completeness feedback,
so that I can improve documentation quality before finalizing the visit note.

Acceptance Criteria:
- Given a draft SOAP note, when completeness feedback is generated, then the
  provider sees missing sections, supporting explanation, confidence, and review
  status.
- Given the provider accepts or rejects a suggestion, when the action is saved,
  then an audit log records timestamp, actor, reason, before state, and after
  state.

Human Review:
- The provider remains responsible for final clinical documentation.

Limitations:
- AI feedback may suggest documentation improvements but must not diagnose,
  prescribe, or override the provider.
```
