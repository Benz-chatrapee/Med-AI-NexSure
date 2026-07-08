# Solution Architect Workflows

## Requirement to Architecture Workflow

1. Receive requirement from Business Analyst or Product Owner.
2. Identify business goal and system scope.
3. Define actors and roles.
4. Define workflow and data flow.
5. Identify modules and service boundaries.
6. Define API responsibilities.
7. Define data ownership.
8. Define security and audit requirements.
9. Define AI and human review boundaries.
10. Produce architecture handoff.

## Claim Readiness Architecture Workflow

1. Receive visit, SOAP, diagnosis, ICD, prescription, evidence, payer rule, and economic signal requirements.
2. Define claim readiness trigger and eligibility.
3. Validate SOAP completeness and clinical documentation status.
4. Validate diagnosis and ICD consistency without inventing ICD codes.
5. Validate prescription documentation and safety warning status.
6. Identify required evidence and missing evidence.
7. Apply payer rule indicators using sourced rule configuration only.
8. Calculate readiness score, risk level, explanation, and review status.
9. Route low-confidence, high-risk, or exception cases to claim reviewer.
10. Record audit events for score generation, rule result, missing evidence, reviewer action, and override.

## Evidence Package Architecture Workflow

1. Identify visit and claim context.
2. Collect required clinical, insurance, and administrative evidence.
3. Check completeness against configured evidence rules.
4. Flag missing, stale, conflicting, or low-confidence evidence.
5. Generate package metadata and export-ready structure.
6. Prepare PDF/export responsibility and access control.
7. Record audit events for package creation, regeneration, export, and reviewer handoff.
8. Handoff package and gaps to reviewer.

## AI Clinical Architecture Workflow

1. Prepare AI input from allowed clinical documentation only.
2. Validate consent, access, and minimum necessary data.
3. Execute prompt/model through the AI clinical boundary.
4. Capture prompt version, model version, input hash, output, confidence, and explanation.
5. Apply low-confidence behavior and safety disclaimer.
6. Route high-risk or low-confidence output to clinician review.
7. Store review status and audit trail.
8. Prevent AI output from becoming final clinical judgment without authorized human action.

## Insurance Intelligence Architecture Workflow

1. Load payer rules and coverage indicators from governed sources.
2. Evaluate documentation quality, missing evidence, risk level, and claim alerts.
3. Explain each rule result and uncertainty.
4. Route exceptions and low-confidence signals to claim reviewer.
5. Capture reviewer actions, notes, and overrides.
6. Audit rule execution, readiness score, alert generation, and human review.

## Audit & Compliance Architecture Workflow

1. Identify important actions, sensitive access, and regulated workflow events.
2. Capture actor, timestamp, reason, before, after, entity, source module, and correlation ID.
3. Log sensitive data access without exposing secrets, PHI, PII, or PDPA protected information in unsafe logs.
4. Maintain version history for AI outputs, rule results, evidence packages, and reviewer decisions.
5. Support traceability from requirement to implementation, workflow event, and compliance report.
6. Provide compliance reporting for audit, PDPA, OIC, access history, and exception review.
