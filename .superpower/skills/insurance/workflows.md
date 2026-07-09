# Insurance Workflows

## Claim Readiness Workflow

1. Receive visit context
2. Validate required clinical data
3. Validate diagnosis and ICD data
4. Validate prescription and procedure data
5. Validate required evidence
6. Apply payer rule
7. Check coverage indicator
8. Check cost threshold
9. Calculate readiness score
10. Assign status
11. Assign risk level
12. Identify missing evidence
13. Generate recommended action
14. Determine human review requirement
15. Produce audit-ready output
16. Handoff to QA / Claim Reviewer / Auditor if required

## Policy Rule Validation Workflow

1. Identify payer, plan, claim type, visit type, and rule version
2. Evaluate required evidence rules
3. Evaluate ICD and diagnosis consistency rules
4. Evaluate procedure, waiting period, exclusion, benefit limit, and cost threshold rules
5. Return pass, review, fail, or unknown for each rule
6. Assign severity and required action
7. Escalate unknown or conflicting high-impact rules to human review

## Evidence Package Workflow

1. Read expected evidence from claim type and payer rule
2. Compare expected evidence with available artifacts
3. Mark each item Available, Missing, Incomplete, Expired, Needs Review, or Not Required
4. Assign severity
5. Generate missing evidence action list
6. Handoff to Evidence Package Agent when compilation is needed

## Claim Exception Workflow

1. Detect exception trigger
2. Classify exception severity
3. Identify affected claim data and source
4. Assign reason code
5. Recommend mitigation
6. Require human review for High or Critical exceptions
7. Create audit note

## High Risk Escalation Workflow

1. Detect High or Critical risk
2. Freeze AI recommendation at decision-support status
3. Identify reviewer role
4. Package score, reason, missing evidence, rule result, and source data
5. Handoff to Claim Reviewer, Auditor, or Compliance Guard
6. Record audit note

## Manual Review Workflow

1. Identify review trigger
2. State review reason and affected rule/evidence
3. Identify reviewer role
4. Provide recommended action without final decision
5. Require reviewer annotation and audit entry

## Audit Trail Workflow

1. Capture timestamp, actor, source, rule version, reason, and output
2. Capture before/after only when a record is modified by an authorized user
3. Sanitize protected data
4. Link assessment to visit/claim context
5. Preserve output for traceability

## Handoff Workflow

1. Receive orchestration context
2. Produce structured insurance output
3. Select target agent/role based on risk and missing data
4. Include reason, evidence, rule version, and recommended next action
5. Return to Orchestrator for merge and quality review
