# Backend Templates

## API Endpoint Template

- Endpoint:
- Method:
- Purpose:
- User Roles:
- Request Schema:
- Response Envelope:
- Permission Guard:
- Service Function:
- Audit Events:
- Error Codes:
- Tests:

## Server Action Template

- Action Name:
- Caller:
- Input Schema:
- Auth Requirement:
- Permission Guard:
- Domain Service:
- Transaction Required:
- Audit Event:
- Revalidation/Cache Behavior:
- Success Result:
- Failure Result:

## Service Function Template

- Function Name:
- Domain:
- Responsibility:
- Inputs:
- Outputs:
- Validation:
- Dependencies:
- Side Effects:
- Audit:
- Errors:
- Tests:

## Repository/Data Access Template

- Repository Name:
- Entity:
- Methods:
- Query Scope:
- Tenant Filter:
- RLS Assumption:
- Transaction Support:
- Error Mapping:
- Sensitive Data Handling:

## Validation Schema Template

- Schema Name:
- Input Source:
- Required Fields:
- Optional Fields:
- Enum Rules:
- Date Rules:
- Cross-Field Rules:
- Sanitization:
- Error Messages:

## Error Response Template

```json
{
  "success": false,
  "data": null,
  "meta": {
    "correlationId": ""
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Audit Log Event Template

- Event Type:
- Actor:
- Timestamp:
- Entity Type:
- Entity ID:
- Reason:
- Before:
- After:
- Source:
- Correlation ID:
- Outcome:

## Permission Check Template

- Actor:
- Organization:
- Clinic:
- Role:
- Permission:
- Entity Scope:
- Consent Scope:
- Decision:
- Failure Code:

## Transaction Template

- Transaction Name:
- Steps:
- Preconditions:
- Locks/Version Checks:
- Rollback Behavior:
- Idempotency Key:
- Audit Event Timing:
- Failure Handling:

## AI Service Adapter Template

- Adapter Name:
- AI Task:
- Input References:
- Output Schema:
- Confidence:
- Explanation:
- Disclaimer:
- Human Review Rule:
- Storage Rule:
- Audit Event:

## Claim Readiness Service Template

- Service Name:
- Claim Inputs:
- Documentation Checks:
- Evidence Checks:
- ICD Consistency Checks:
- Payer Rule Checks:
- Risk Calculation:
- Readiness Score:
- Reviewer Handoff:
- Audit Events:

## Evidence Package Service Template

- Package Type:
- Source Records:
- Required Evidence:
- Included Evidence:
- Missing Evidence:
- Conflicting Evidence:
- Version:
- Export Rules:
- Reviewer Handoff:
- Audit Events:
