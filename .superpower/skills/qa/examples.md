# QA Examples

## 1. QA Review for SOAP Note Feature
| Field | Example |
|---|---|
| Feature | SOAP Note Save/Edit/Autosave |
| Requirement Quality | Needs Review |
| Gap | Autosave interval, conflict handling, and version history audit event are not specified. |
| Risks | Lost clinical documentation, incomplete audit trail, stale AI summary. |
| Recommendation | Define autosave behavior, edit permissions, version compare fields, and audit event names before test execution. |

## 2. Test Cases for Claim Readiness
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| QA-CLAIM-001 | Complete SOAP, ICD, prescription, evidence, and payer checks | Score is Ready and evidence is traceable. |
| QA-CLAIM-002 | Missing medical certificate | Score decreases, status is Needs Review or Not Ready, missing evidence is listed. |
| QA-CLAIM-003 | Unauthorized user recalculates score | Action is blocked and no score changes. |

## 3. Gherkin Scenarios for Prescription Safety
```gherkin
Feature: Prescription safety warnings
  Scenario: Allergy warning is shown before medication confirmation
    Given a patient has a recorded penicillin allergy
    And a doctor adds a penicillin medication
    When the doctor attempts to save the prescription
    Then a critical allergy warning is displayed
    And the action requires authorized review or documented override
    And an audit event is created
```

## 4. API Test Matrix for Patient Management
| Endpoint | Method | Role | Scenario | Expected Status | Audit Event |
|---|---|---|---|---|---|
| `/api/patients` | POST | Clinic Admin | Create valid patient | 201 | patient.created |
| `/api/patients` | POST | Nurse | Duplicate HN | 409 | patient.create_rejected |
| `/api/patients/{id}` | GET | External Clinic User | Cross-clinic access | 403 | access.denied |

## 5. Database Validation for Prompt Library
| Rule | Scenario | Expected Result |
|---|---|---|
| Version increment | Edit active prompt | New version is created or version number increments. |
| Archive behavior | Archive prompt | Prompt is hidden from active use and audit logged. |
| Search fields | Search by title/category | Matching prompts return within tenant scope. |

## 6. RLS Validation for User Management
| Role | Scenario | Expected Result |
|---|---|---|
| Admin | View users in own organization | Allowed |
| Clinic Admin | Disable user in own clinic | Allowed if permission exists |
| Clinic Admin | Disable user in another clinic | Denied |
| Disabled User | Access user list | Denied |

## 7. AI Evaluation for ICD Suggestion
| Dimension | Result |
|---|---|
| Groundedness | Pass: suggestion references SOAP assessment. |
| Safety | Pass: marked as suggestion requiring doctor review. |
| Fail Condition | Any invented diagnosis, unsupported ICD code, or final diagnosis wording. |
| Decision | Needs Review until clinician confirms. |

## 8. Defect Report for Evidence Package
| Field | Example |
|---|---|
| Defect ID | BUG-EVIDENCE-001 |
| Title | Evidence package export omits audit summary |
| Severity | High |
| Impact | Claim reviewer receives incomplete traceability evidence. |
| Expected | PDF includes SOAP, diagnosis, ICD, prescription, certificate, attachments, claim summary, and audit summary. |
| Actual | Audit summary section is missing. |
| Recommendation | Add audit summary section and regression test export contents. |

## 9. Release Sign-off Summary for MVP 1
| Field | Example |
|---|---|
| Release | MVP 1 |
| Decision | Pass With Conditions |
| Passed Gates | Login, patient, visit, SOAP, claim readiness, audit, RLS smoke. |
| Conditions | One Medium prompt library usability defect deferred with Product Owner approval. |
| Blockers | None |
| Recommendation | Release after documented deferral and regression evidence are attached. |
