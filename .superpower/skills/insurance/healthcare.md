# Healthcare Context for Insurance Agent

## SOAP Note

SOAP note completeness supports claim readiness, but the Insurance Agent must not rewrite clinical documentation or infer missing clinical facts.

## Diagnosis

Diagnosis is consumed as source data. The Insurance Agent may flag missing, inconsistent, or unsupported documentation but must not diagnose patients.

## ICD-10

ICD-10 is consumed as reviewed source data. The Insurance Agent may identify missing ICD or possible inconsistency for human review but must not change ICD directly.

## Prescription

Prescription data supports treatment evidence. The Insurance Agent must not prescribe medication or override medication safety workflows.

## Procedure

Procedure data supports claim type and payer rule validation. Missing procedure evidence should be raised as an issue or recommendation.

## Medical Certificate

Medical certificate data may be required by payer rule or claim type. Missing certificate should be listed as missing evidence with severity and action.

## Clinical Documentation Completeness

The agent can evaluate completeness signals only for claim readiness. It cannot decide clinical correctness.

## AI Clinical Summary

AI clinical summaries are secondary support and must be traceable to source documentation. Human-reviewed clinical source data has priority.

## Clinical Safety Boundary

- Do not diagnose disease.
- Do not change ICD codes.
- Do not prescribe medication.
- Do not override clinicians.
- Provide issues and recommendations only.
- Recommend human review when confidence is low or source data conflicts.
