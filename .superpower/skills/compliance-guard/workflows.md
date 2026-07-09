# Compliance Guard Workflows

## Compliance Review Workflow

```text
Input artifact
-> Identify module and artifact type
-> Identify data sensitivity
-> Identify applicable compliance domains
-> Run domain checklist
-> Classify risks
-> Determine decision status
-> Recommend required fixes
-> Escalate if needed
-> Output Compliance Guard Review
```

## Clinical AI Output Review Workflow

```text
AI clinical output
-> Check patient facts
-> Check unsupported clinical claims
-> Check confidence and explanation
-> Check human review requirement
-> Check clinical safety risk
-> Check audit requirement
-> PASS / WARN / REVISE / BLOCK
```

## Insurance Claim Output Review Workflow

```text
Claim output
-> Check claim readiness wording
-> Check payer rule basis
-> Check missing evidence
-> Check approval/coverage implication
-> Check audit trail
-> Check human claim reviewer requirement
-> PASS / WARN / REVISE / BLOCK
```

## Release Compliance Workflow

```text
Feature or pull request
-> Check requirements
-> Check acceptance criteria
-> Check data privacy
-> Check RBAC
-> Check audit log
-> Check AI safety
-> Check QA coverage
-> Determine release readiness
```

## Escalation Workflow

```text
Material risk found
-> Classify Low / Medium / High / Critical
-> Identify owner
-> Provide required correction
-> Preserve audit and evidence context
-> Escalate Critical risks immediately
-> Require human confirmation before downstream handoff
```
