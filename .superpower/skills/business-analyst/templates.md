# Business Analyst Templates

## Business Requirement Document

```markdown
# BRD: SOAP Completeness

## Business Objective
Improve clinical documentation completeness before visit finalization.

## Scope
SOAP documentation quality, AI-assisted completeness feedback, provider review, and audit logging.

## Stakeholders
Provider, nurse, claim reviewer, compliance officer, Product Owner, QA.

## Business Requirements
- The system shall identify missing SOAP sections before note finalization.
- The system shall show explanation and confidence for AI-generated feedback.
- The provider shall remain responsible for final clinical documentation.

## Assumptions
- Provider has permission to view and edit visit documentation.

## Risks
- AI feedback may be overtrusted if confidence and explanation are hidden.

## Handoff
Product Owner for MVP priority, Clinical AI for safety validation, QA for test scenarios.
```

## Functional Requirement

```markdown
Requirement: The system shall display missing evidence for claim readiness review.
Actor: Claim reviewer.
Trigger: Claim readiness is generated for a visit.
Expected Behavior: Missing evidence, explanation, confidence, and review state are visible.
Audit: Generation and reviewer action must be logged.
```

## Non-Functional Requirement

```markdown
Requirement: Claim readiness results shall be traceable to source documentation and audit events.
Quality Attribute: Auditability.
Measure: Every readiness result has timestamp, actor, reason, source reference, and review state.
```

## User Story

```markdown
As a provider,
I want SOAP completeness feedback,
so that I can improve documentation before finalizing the visit note.
```

## Acceptance Criteria Using Given / When / Then

```markdown
- Given a draft SOAP note, when completeness feedback is generated, then the provider sees missing sections, explanation, confidence, and review state.
- Given a provider accepts or rejects feedback, when the action is saved, then the audit log records timestamp, actor, reason, before state, and after state.
```

## Business Rule

```markdown
Rule: AI-generated ICD suggestions must show supporting documentation, confidence, and human review state before use in claim readiness.
Owner: Clinical AI and Insurance AI.
Exception: If supporting evidence is unavailable, mark the suggestion as uncertain and route for human review.
```

## Process Flow Description

```markdown
Process: Evidence Package Preparation
1. Claim reviewer opens visit claim workspace.
2. System displays available documents and missing evidence.
3. AI suggests evidence readiness with confidence and explanation.
4. Reviewer accepts, rejects, or requests more documentation.
5. System logs reviewer action and package state change.
```

## Gap Analysis

```markdown
Current State: Reviewers manually inspect visit notes for missing evidence.
Future State: System highlights missing evidence and source references.
Gap: No structured readiness status, confidence, or audit trail.
Impact: Slower review and higher rework risk.
Recommendation: Add claim readiness review workflow with audit logging.
```

## Impact Analysis

```markdown
Change: Add prescription safety requirement checks.
Users Impacted: Provider, pharmacist reviewer, compliance officer.
Systems Impacted: Visit, prescription, clinical AI, audit.
Risks: Unsafe recommendation if AI appears authoritative.
Mitigation: Human review, explanation, confidence, and audit trail.
```

## Requirement Traceability Matrix

```markdown
| Requirement | Epic | Story | Test | API | Database | Audit Log |
| --- | --- | --- | --- | --- | --- | --- |
| SOAP completeness feedback | Documentation Quality | Provider reviews SOAP gaps | SOAP-001 | Visit note feedback API | visit_notes, audit_logs | suggestion_reviewed |
```

## Agent Handoff Template

```markdown
## Handoff Summary
Requirement:
Business Value:
Risk Level:
Confidence:
Missing Information:

## Product Owner
- MVP priority:
- Roadmap decision:

## Solution Architect
- System boundary:
- Integration concern:

## Frontend
- Page or flow:
- States:

## Backend
- Business rules:
- Validation:

## Database
- Entities:
- Relationships:
- Audit fields:

## QA
- Acceptance criteria:
- Edge cases:

## Compliance
- PDPA/OIC concern:
- Audit requirement:

## AI Agents
- Clinical AI:
- Insurance AI:
```

## Med AI NexSure Example Coverage

Use these templates for SOAP Completeness, Claim Readiness, Evidence Package, ICD Suggestion, Prescription Safety, Insurance Rule Validation, Audit Log, and User Management requirements.
