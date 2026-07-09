# Defect Management

## Defect ID Format
Use `BUG-[MODULE]-[NUMBER]`, for example `BUG-CLAIM-001`.

## Severity Levels
- Critical: Causes patient data leakage, unauthorized access, unsafe clinical recommendation, incorrect claim readiness score with business impact, missing audit log for sensitive action, critical prescription safety alert failure, cross-organization or cross-clinic exposure, or release-blocking compliance failure.
- High: Major feature failure, serious workflow blockage, incorrect high-risk business rule, significant security weakness, or high-risk AI explainability gap.
- Medium: Partial feature failure, confusing workflow, non-critical validation issue, limited audit metadata gap, or moderate regression risk.
- Low: Cosmetic issue, minor wording issue, low-risk usability issue, or documentation mismatch.

## Priority Levels
- P1: Must fix before release unless approved workaround exists.
- P2: Should fix before release or document business-approved deferral.
- P3: Fix in planned backlog.
- P4: Low urgency improvement.

## Defect Report Format
- Defect ID:
- Title:
- Module:
- Environment:
- Role/User:
- Preconditions:
- Steps to Reproduce:
- Expected Result:
- Actual Result:
- Severity:
- Priority:
- Business Impact:
- Evidence:
- Suggested Fix:
- Regression Risk:

## Critical Defects Include
- Patient data leakage.
- Unauthorized access.
- Incorrect claim readiness score.
- Unsafe AI clinical recommendation.
- Missing audit log for sensitive action.
- Critical prescription safety alert not detected.
- Cross-organization or cross-clinic data exposure.
