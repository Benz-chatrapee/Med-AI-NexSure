# Evidence Rules

## Required Evidence Types

- SOAP Note
- Diagnosis
- ICD-10
- Prescription
- Procedure
- Medical Certificate
- Lab Result
- Receipt
- Invoice
- Attachment
- Claim Summary
- Economic Summary
- Audit Summary

## Evidence Status

- Available
- Missing
- Incomplete
- Expired
- Needs Review
- Not Required

## Severity

- Low
- Medium
- High
- Critical

## Evidence Validation Rules

- Evidence must be linked to the visit or claim context.
- Evidence must be current enough for the claim workflow.
- Missing required evidence must appear in the Missing Evidence section.
- Incomplete evidence must identify the missing field or artifact.
- Evidence that contains protected data must be minimized in agent output.

## Evidence Package MVP Mapping

| Evidence | MVP Use |
|---|---|
| SOAP Note | Supports clinical documentation completeness |
| Diagnosis | Supports claim context |
| ICD-10 | Supports claim coding consistency review |
| Prescription | Supports treatment evidence |
| Medical Certificate | Supports payer-required certification |
| Attachments | Supports payer-specific evidence |
| Claim Summary | Supports claim reviewer handoff |
| Economic Summary | Supports cost threshold review |
| Audit Summary | Supports traceability |
