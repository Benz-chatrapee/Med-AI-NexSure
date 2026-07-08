# Business Analyst Examples

## Epic

```markdown
Epic: Claim Readiness Score
Objective: Help claim reviewers understand documentation readiness before submission.
Business Value: Reduce missing evidence, rework, and review cycle time.
Safety Boundary: AI must not approve claims.
```

## Feature

```markdown
Feature: SOAP Completeness Review
Business Goal: Improve clinical documentation completeness.
User Value: Providers can resolve missing SOAP sections before finalizing notes.
Scope: Missing sections, explanation, confidence, provider review, audit logging.
```

## User Story

```markdown
As a claim reviewer,
I want to see missing evidence for a claim,
so that I can request required documentation before submission.
```

## Acceptance Criteria

```markdown
- Given a visit has a completed SOAP note, when claim readiness is generated, then the reviewer sees readiness score, missing evidence, explanation, confidence, and review state.
- Given the reviewer overrides readiness, when saved, then the audit log records timestamp, actor, reason, before state, and after state.
```

## Business Rule

```markdown
Rule: Prescription safety alerts must be reviewed by a clinician before medication documentation is finalized.
Rationale: AI may detect risk but must not prescribe or override clinician judgment.
```

## BRD Section

```markdown
Business Objective: Improve evidence package completeness for claim review.
Requirement: The system shall list required evidence, available evidence, missing evidence, source references, and reviewer action state.
Success Measure: Reduced missing evidence findings during claim review.
```

## Gap Analysis

```markdown
Current State: Reviewers manually search visit documentation for claim evidence.
Future State: Evidence Package view groups required, available, and missing evidence with traceability.
Gap: No structured evidence checklist or audit trail.
Impact: Higher review time and inconsistent claim readiness.
```

## Workflow Analysis

```markdown
Workflow: ICD Suggestion Review
Trigger: Provider completes SOAP note.
AI Action: Suggest ICD candidates with evidence and confidence.
Human Action: Provider reviews, accepts, edits, or rejects.
Audit: Log suggestion generation and provider decision.
Boundary: AI does not assign final diagnosis.
```

## Handoff to Product Owner

```markdown
Please prioritize Claim Readiness Score for MVP. Business value is reduced rework; risk is policy source uncertainty. Final priority decision required.
```

## Handoff to Solution Architect

```markdown
Please define workflow boundaries for readiness generation, reviewer override, evidence package state, and audit event model.
```

## Handoff to Frontend

```markdown
Please design states for readiness score, missing evidence, low confidence, reviewer override, and audit-visible history.
```

## Handoff to Backend

```markdown
Please implement business rules for readiness status, missing evidence calculation inputs, reviewer state transitions, and validation errors.
```

## Handoff to Database

```markdown
Please model claim readiness result, evidence item, source reference, reviewer action, and audit log relationship.
```

## Handoff to QA

```markdown
Please test complete evidence, missing evidence, low confidence, policy unavailable, reviewer override, and audit event scenarios.
```

## Handoff to Compliance

```markdown
Please review PDPA, OIC, audit retention, access control, and claim decision boundary requirements.
```

## Handoff to AI Clinical Agent

```markdown
Please validate SOAP completeness and ICD suggestion safety boundaries, including explanation and confidence requirements.
```

## Scenario Coverage

Examples apply to Claim Readiness Score, SOAP Completeness, Evidence Package, ICD Suggestion, Prescription Safety, Audit Log, and User Role Management.
