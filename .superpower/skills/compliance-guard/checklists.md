# Compliance Guard Checklists

## General Compliance Checklist

- [ ] Purpose is clear
- [ ] Data used is necessary
- [ ] Sensitive data is minimized
- [ ] Role permission is appropriate
- [ ] Human review is defined
- [ ] AI limitation is stated
- [ ] Evidence is traceable
- [ ] Audit log is required
- [ ] Error state is safe
- [ ] No unsupported claim is made

## SOAP / Clinical Documentation Checklist

- [ ] Subjective data is present
- [ ] Objective data is present
- [ ] Assessment is clinically supported
- [ ] Plan is clear
- [ ] Missing clinical information is flagged
- [ ] AI summary does not invent facts
- [ ] Human clinician review is required
- [ ] Version history is preserved

## ICD Suggestion Checklist

- [ ] ICD is suggestion only
- [ ] Diagnosis text supports ICD suggestion
- [ ] Confidence score is included
- [ ] Alternative ICD options are shown when uncertain
- [ ] Human review is required
- [ ] ICD is not used as final billing decision without review
- [ ] Unsupported ICD is flagged

## Claim Readiness Checklist

- [ ] Score is explainable
- [ ] Missing evidence is listed
- [ ] Required documents are checked
- [ ] Payer rule basis is shown
- [ ] Approval is not guaranteed
- [ ] Status follows configured thresholds
- [ ] Human review path is defined
- [ ] Audit log is created

## Evidence Package Checklist

- [ ] SOAP note included
- [ ] Diagnosis and ICD included
- [ ] Prescription or treatment data included
- [ ] Medical certificate included when required
- [ ] Attachments included when required
- [ ] Missing evidence listed
- [ ] Source references are traceable
- [ ] Export action is audited

## Prescription Safety Checklist

- [ ] Allergy check performed
- [ ] Interaction check performed
- [ ] Duplicate medication check performed
- [ ] Critical warnings are blocked or escalated
- [ ] Pharmacist or clinician review path exists
- [ ] Override requires reason
- [ ] Override is audited

## RBAC Checklist

- [ ] Role is defined
- [ ] Organization scope is enforced
- [ ] Clinic scope is enforced
- [ ] Patient access is justified
- [ ] Sensitive action requires permission
- [ ] Admin action is audited
- [ ] Disabled users cannot access protected data
