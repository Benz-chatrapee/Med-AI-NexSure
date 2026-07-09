# Compliance Guard Examples

## Example: AI ICD Suggestion With Missing Confidence

### Input

Suggested ICD: J20.9 Acute bronchitis, unspecified. Use for billing.

### Review

The output lacks confidence, evidence basis, alternatives, and human review language. It also implies final billing use.

### Decision

NEEDS_REVISION

### Risk Level

High

### Required Fix

Add confidence, documented diagnosis basis, uncertainty, alternatives when appropriate, and clinician or coder review requirement.

### Safer Revised Output

Suggested ICD: J20.9 Acute bronchitis, unspecified. Confidence: Medium. Basis: documented cough and clinical assessment in the visit note. This is a coding suggestion only and must be reviewed by an authorized clinician or coder before billing.

## Example: Claim Readiness Unsafe Wording

### Input

Claim status: Approved. The patient can receive reimbursement.

### Review

The wording implies final claim approval and payment guarantee without insurer decision.

### Decision

BLOCKED

### Risk Level

Critical

### Required Fix

Use readiness wording only and require claim reviewer confirmation.

### Safer Revised Output

Claim readiness status: Ready for Review. Documentation appears complete based on configured payer rules. Final approval depends on authorized insurer or claim reviewer decision.

## Example: SOAP Summary Inventing Diagnosis

### Input

AI Summary: The patient has pneumonia and should start antibiotics today.

### Review

The source note does not document pneumonia. The output invents diagnosis and treatment direction without clinician confirmation.

### Decision

BLOCKED

### Risk Level

Critical

### Required Fix

Remove unsupported diagnosis and treatment instruction. Flag missing objective evidence and require clinician review.

### Safer Revised Output

AI Clinical Summary: The visit note documents respiratory symptoms. Pneumonia is not confirmed in the provided record. Additional clinician assessment and supporting evidence are required before diagnosis or treatment decisions.

## Example: Evidence Package Missing Required Document

### Input

Evidence Package: SOAP note, ICD suggestion, invoice. Ready to submit.

### Review

The package marks itself ready while a required medical certificate is missing for the configured claim type.

### Decision

NEEDS_REVISION

### Risk Level

Medium

### Required Fix

List the missing document, remove submission-ready wording, and route to evidence completion.

### Safer Revised Output

Evidence Package Status: Needs Review. Included: SOAP note, ICD suggestion, invoice. Missing: medical certificate required by configured payer rule. Resolve missing evidence before claim submission.

## Example: Prescription Override Without Reason

### Input

Drug interaction warning overridden. Continue prescription.

### Review

The override lacks reason, actor, reviewer role, and audit trail for a medication safety exception.

### Decision

BLOCKED

### Risk Level

Critical

### Required Fix

Require clinician or pharmacist confirmation, override reason, and audit record before proceeding.

### Safer Revised Output

Prescription safety override requires authorized clinician or pharmacist review. Capture override reason, actor, timestamp, interaction warning, and audit correlation ID before the prescription workflow can continue.

## Example: User Role Change Without Audit Log

### Input

User role changed from nurse to administrator.

### Review

Role elevation is a sensitive access-control action and requires audit fields including actor, reason, before value, after value, scope, and timestamp.

### Decision

BLOCKED

### Risk Level

Critical

### Required Fix

Require permission validation and audit logging before role change completion.

### Safer Revised Output

Role change pending review. Administrator elevation requires authorized actor, reason, organization and clinic scope, before/after values, timestamp, and audit record before activation.

## Example: PDPA Issue Exposing Unnecessary Patient Identifier

### Input

Audit export includes patient full name, national ID, home address, phone number, diagnosis, and member ID for dashboard analytics.

### Review

The export exposes unnecessary direct identifiers for analytics and may violate data minimization expectations.

### Decision

NEEDS_REVISION

### Risk Level

High

### Required Fix

Minimize and mask identifiers. Use aggregated or pseudonymized data unless direct identifiers are required and authorized.

### Safer Revised Output

Dashboard analytics export uses pseudonymized patient reference, organization scope, clinic scope, diagnosis category, claim readiness metrics, and audit correlation ID. Direct identifiers are excluded unless explicitly authorized for a necessary workflow.
