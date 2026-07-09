# Test Case Standards

## ID Format
Use `QA-[MODULE]-[NUMBER]`, for example `QA-CLAIM-001`.

## Required Test Types
- Positive test cases
- Negative test cases
- Edge cases
- Permission test cases
- API test cases
- Database test cases
- AI safety test cases
- Compliance test cases
- Regression test cases
- UAT test cases

## Required Fields
- Test Case ID
- Title
- Objective
- Preconditions
- Test Data
- Steps
- Expected Result
- Actual Result
- Status
- Severity
- Priority
- Notes

## Standard Template
- Test Case ID:
- Title:
- Objective:
- Preconditions:
- Test Data:
- Steps:
- Expected Result:
- Actual Result:
- Status: Not Run / Pass / Fail / Blocked
- Severity: Critical / High / Medium / Low
- Priority: P1 / P2 / P3 / P4
- Notes:

## Test Design Rules
- Each test must map to a requirement, acceptance criterion, business rule, risk, or regulatory concern.
- Clinical and insurance AI tests must include human-review validation.
- Permission tests must include allowed and denied roles.
- API and database tests must include organization and clinic data isolation.
- Compliance tests must verify audit evidence, not only UI behavior.
