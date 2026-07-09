# QA Templates

## QA Review Summary Template
| Field | Value |
|---|---|
| Review ID | |
| Feature / Story | |
| Reviewer | QA Agent |
| Date | |
| Requirement Quality | Pass / Needs Review / Blocked |
| Testability | Pass / Needs Review / Blocked |
| Roles Covered | |
| Audit Events Covered | |
| Clinical Risk | Low / Medium / High / Critical |
| Insurance Risk | Low / Medium / High / Critical |
| Compliance Risk | Low / Medium / High / Critical |
| Decision | Pass / Pass With Conditions / Needs Review / Block Release |
| Summary | |
| Risks | |
| Recommendations | |

## Test Plan Template
| Field | Value |
|---|---|
| Test Plan ID | |
| Feature | |
| Scope | |
| Out of Scope | |
| Roles | |
| Test Levels | Unit / Integration / API / UI / E2E / Regression / UAT |
| Test Types | Functional / Negative / Boundary / Role-Based / Audit / AI Safety |
| Test Data | |
| Environments | |
| Entry Criteria | |
| Exit Criteria | |
| Risks | |
| Dependencies | |

## Test Scenario Template
| Field | Value |
|---|---|
| Scenario ID | |
| Feature | |
| User Role | |
| Business Goal | |
| Preconditions | |
| Scenario | |
| Expected Outcome | |
| Risks Covered | |
| Audit Evidence | |

## Test Case Template
| Field | Value |
|---|---|
| Test Case ID | |
| Feature | |
| User Story | |
| Role | |
| Preconditions | |
| Test Data | |
| Steps | |
| Expected Result | |
| Actual Result | |
| Status | Not Run / Pass / Fail / Blocked |
| Severity | Low / Medium / High / Critical |
| Evidence | |
| Notes | |

## Gherkin Scenario Template
```gherkin
Feature:
  Scenario:
    Given
    And
    When
    Then
    And
```

## Defect Report Template
| Field | Value |
|---|---|
| Defect ID | BUG-[MODULE]-[NUMBER] |
| Title | |
| Module | |
| Environment | |
| Role / User | |
| Preconditions | |
| Steps to Reproduce | |
| Expected Result | |
| Actual Result | |
| Severity | Critical / High / Medium / Low |
| Priority | P1 / P2 / P3 / P4 |
| Business Impact | |
| Clinical / Insurance / Compliance Impact | |
| Evidence | |
| Suggested Fix | |
| Regression Risk | |
| Owner | |
| Status | New / Triaged / In Progress / Fixed / Verified / Closed |

## Regression Test Suite Template
| Suite ID | Area | Scenario | Priority | Automated | Owner | Status | Evidence |
|---|---|---|---|---|---|---|---|
| REG-001 | | | P1 | Yes / No | | Not Run | |

## UAT Checklist Template
| Role | Workflow | Business Scenario | Acceptance Criteria | Test Data | Status | Sign-off |
|---|---|---|---|---|---|---|
| | | | | | Not Run / Pass / Fail / Blocked | |

## API Test Matrix Template
| Endpoint | Method | Role | Scenario | Request Validation | Expected Status | Audit Event | Security Check | Status |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Database Test Matrix Template
| Table | Rule / Constraint | Scenario | Test Data | Expected Result | RLS Check | Audit Check | Status |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## AI Evaluation Result Template
| Field | Value |
|---|---|
| Evaluation ID | |
| AI Feature | |
| Prompt / Model Version | |
| Input Evidence | |
| Output Summary | |
| Groundedness | Pass / Fail |
| Safety | Pass / Fail |
| Explainability | Pass / Fail |
| Confidence Calibration | Pass / Fail |
| Human Review Required | Yes / No |
| Hallucination Detected | Yes / No |
| Audit Log Present | Yes / No |
| Decision | Pass / Needs Review / Fail |
| Notes | |

## QA Sign-off Report Template
| Field | Value |
|---|---|
| Release / Feature | |
| QA Decision | Pass / Pass With Conditions / Needs Review / Block Release |
| Coverage Summary | |
| Open Critical Defects | |
| Open High Defects | |
| Workarounds Approved | |
| Security Result | |
| Compliance Result | |
| Audit Result | |
| AI Safety Result | |
| Clinical Safety Result | |
| Insurance Workflow Result | |
| Regression Result | |
| UAT Result | |
| Recommendation | |
# QA Templates

## QA Review Template

### Review Context
- Feature:
- Module:
- Requirement Source:
- User Role:
- Workflow:
- Priority:

### Requirement Quality Review
| Criteria | Result | Issue | Recommendation |
|---|---|---|---|
| Clear | Pass/Fail | | |
| Complete | Pass/Fail | | |
| Testable | Pass/Fail | | |
| Traceable | Pass/Fail | | |
| Prioritized | Pass/Fail | | |
| Safe | Pass/Fail | | |
| Feasible | Pass/Fail | | |

### Test Scope
- In Scope:
- Out of Scope:
- Assumptions:
- Dependencies:

### Test Scenarios
| ID | Scenario | Type | Priority | Expected Result |
|---|---|---|---|---|

### Acceptance Criteria Review
| AC | Testable | Gap | Suggested Fix |
|---|---|---|---|

### Defect Risk
- Severity:
- Impact:
- Likelihood:
- Recommended Action:

### QA Decision
- Ready for Development:
- Ready for SIT:
- Ready for UAT:
- Blocker:

## Test Case Template

| Test Case ID | Requirement | Precondition | Steps | Expected Result | Priority | Traceability |
|---|---|---|---|---|---|---|

## Gherkin Scenario Template

```gherkin
Scenario: Descriptive behavior under test
Given a known precondition
When the user or system performs an action
Then the expected result should occur
And the required audit or safety outcome should be recorded
```

## API Test Template

| API | Method | Role | Request | Expected Status | Expected Body | Audit Event | Negative Case |
|---|---|---|---|---:|---|---|---|

## UI Test Template

| Screen | Role | State | Action | Expected UI | Validation | Audit/Telemetry |
|---|---|---|---|---|---|---|

## Regression Test Template

| Suite | Scenario | Risk Covered | Priority | Frequency | Owner |
|---|---|---|---|---|---|

## Insurance QA Template

| Area | Scenario | Expected Result | Risk | Evidence |
|---|---|---|---|---|

## Claim Readiness QA Template

| Case | Input Condition | Expected Score | Expected Status | Expected Risk | Audit Expected |
|---|---|---:|---|---|---|

## Evidence Package QA Template

| Evidence | Required | Test Data | Expected Status | Missing/Incomplete Behavior |
|---|---|---|---|---|

## Audit Log QA Template

| Action | Actor | Reason | Before | After | Expected Audit Fields |
|---|---|---|---|---|---|

## RBAC QA Template

| Role | Resource | Allowed Action | Denied Action | Expected Result | Audit Expected |
|---|---|---|---|---|---|

---
