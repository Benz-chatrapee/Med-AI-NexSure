# Product Owner Examples

## Epic Example

```markdown
## Epic: SOAP Completeness Review
Objective: Improve clinical documentation completeness before visit finalization.
Business Value: Reduce documentation gaps that create claim and compliance risk.
Success Metrics: SOAP completeness rate, provider override rate, audit completeness.
Dependencies: Clinical AI, audit logging, provider review workflow.
```

## Feature Example

```markdown
## Feature: Provider Suggestion Review
Business Goal: Let providers review AI documentation suggestions before saving.
User Value: Providers keep control while improving note quality.
Functional Scope: Accept, reject, edit, confidence, explanation, audit event.
Constraints: AI must not diagnose or prescribe.
Priority: Must Have
```

## PRD Example

```markdown
# PRD: SOAP Completeness MVP

## Executive Summary
Deliver AI-assisted SOAP completeness feedback with clinician review and audit logging.

## Goals
- Improve documentation quality.
- Preserve provider authority.
- Create traceable review actions.

## Scope
- Missing SOAP section detection
- Explanation and confidence
- Accept/reject/edit actions
- Audit logging

## Out of Scope
- Diagnosis generation
- Prescription recommendations
- Autonomous note finalization
```

## Roadmap Example

```markdown
Release 1: SOAP completeness feedback and audit logging.
Release 2: Claim readiness integration.
Release 3: Executive dashboard for documentation quality trends.
```

## Sprint Example

```markdown
Sprint Goal: Deliver provider review state for SOAP suggestions.
Stories:
- Provider views completeness feedback.
- Provider accepts or rejects suggestion.
- Audit log records review action.
Risk: Clinical wording requires Clinical AI validation.
```

## Prioritization Example

```markdown
Framework: MoSCoW
Must Have: Suggestion review, confidence, explanation, audit logging.
Should Have: Historical trend by provider.
Could Have: Specialty-specific templates.
Won't Have: Autonomous diagnosis.
```

## Healthcare Example

```markdown
As a provider,
I want SOAP completeness feedback before finalizing a note,
so that I can address documentation gaps while retaining clinical authority.
```

## Insurance Example

```markdown
As a claim reviewer,
I want claim readiness findings with missing evidence and policy uncertainty,
so that I can prepare a claim package for human review without relying on automatic approval.
```
