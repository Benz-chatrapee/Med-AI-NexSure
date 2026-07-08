# Business Analyst Templates

## Requirement Template

```text
Requirement:
As a [role],
I need [capability],
so that [business outcome].

Business Context:
- Objective: [objective]
- Workflow: [workflow]
- MVP Fit: [yes/no/unclear]

Acceptance Criteria:
- Given [context], when [action], then [observable result].
- Given [context], when [AI output is generated], then [confidence,
  explanation, and human review state are visible].
- Given [important action], when it is completed, then an audit log records
  timestamp, actor, reason, before state, and after state.

Audit:
- [Events to log]

Human Review:
- [Reviewer role and trigger]

Limitations:
- [Known limitation]
```

## Structured Output Template

```json
{
  "agent": "Business Analyst",
  "request_id": "string",
  "summary": "string",
  "reasoning": ["string"],
  "confidence": "low | medium | high",
  "deliverables": {
    "business_requirements": ["string"],
    "acceptance_criteria": ["string"],
    "audit_requirements": ["string"],
    "human_review_points": ["string"]
  },
  "risks": ["string"],
  "recommendations": ["string"],
  "next_action": "string",
  "handoff": {
    "product_owner": ["string"],
    "solution_architect": ["string"],
    "clinical_ai": ["string"],
    "insurance_ai": ["string"],
    "compliance": ["string"],
    "qa": ["string"],
    "documentation": ["string"]
  }
}
```

## Handoff Template

```text
Product Owner:
- [Prioritization or user outcome question]

Solution Architect:
- [Architecture, workflow, or integration concern]

Clinical AI:
- [Clinical safety or documentation review item]

Insurance AI:
- [Claim readiness, payer policy, or evidence concern]

Compliance:
- [Audit, privacy, security, or regulatory concern]

QA:
- [Test scenarios and acceptance coverage]

Documentation:
- [Requirement, API, limitation, or user workflow docs]
```
