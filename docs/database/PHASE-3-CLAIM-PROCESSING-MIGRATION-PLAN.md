# CLAIM PROCESSING MIGRATION PLAN

## Med AI NexSure — Enterprise Healthcare & Insurance Intelligence Platform

**Document:** `CLAIM-PROCESS-MIGRATION-PLAN.md`  
**Module:** Claim Processing & AI-Assisted Claim Adjudication  
**Database:** PostgreSQL / Supabase  
**Status:** Ready for Technical Review  
**Language Policy:** English-first 70% / Thai support 30%

---

## 1. Purpose

เอกสารนี้กำหนดแผน Migration สำหรับระบบ Claim Processing ของ Med AI NexSure ตั้งแต่การสร้าง Claim, ตรวจความครบถ้วนของหลักฐาน, ตรวจสิทธิ์และความคุ้มครอง, ตรวจ Medical Necessity, Medical Coding, Cost Validation, Fraud/Waste/Abuse Screening, Human Review, Final Decision จนถึง Payment และ Audit Trail

ระบบต้องแยกผลลัพธ์ต่อไปนี้ออกจากกันอย่างชัดเจน:

1. Source Clinical Data
2. Deterministic Rule Engine Result
3. AI Recommendation
4. Human Review
5. Final Claim Decision
6. Payment Result

AI มีหน้าที่เป็น **Decision Support** เท่านั้น และต้องไม่เขียน Final Claim Decision โดยตรง

---

## 2. Objectives

Migration นี้ต้องรองรับ:

- End-to-end Claim Lifecycle
- OPD/IPD and configurable claim types
- Patient, Visit, SOAP, Diagnosis, Prescription และ Clinical Document linkage
- Policy eligibility and benefit validation
- Evidence completeness and Claim Readiness
- ICD-10, procedure and DRG plausibility validation
- Claim-line cost calculation
- Duplicate claim and anomaly screening
- AI-assisted risk assessment
- Human-in-the-Loop review
- Explainable findings with source references
- Payer-specific rules
- Tenant Isolation
- RBAC and RLS
- Immutable decision and audit history
- Local Supabase testing
- Future integration with iClaim, insurer APIs and DRG Grouper

---

## 3. Confirmed Existing Dependencies

จากโครงสร้าง Repository ปัจจุบัน มีตารางหลักที่ Phase นี้สามารถอ้างอิงได้:

- `organizations`
- `clinics`
- `user_profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `patients`
- `patient_clinic_registrations`
- `visits`
- `visit_status_history`
- `soap_notes`
- `soap_note_versions`
- `visit_diagnoses`
- `prescriptions`
- `prescription_items`
- `prescription_safety_alerts`
- `claim_readiness_assessments`
- `claim_readiness_items`
- `clinical_documents`
- `audit_logs`

ก่อน Implementation ต้องยืนยัน:

- Existing payer-related tables
- Existing policy and coverage tables
- Existing organization and clinic membership helpers
- Existing permission helper
- Existing audit event function
- Existing lifecycle-control pattern
- Existing tenant-safe composite foreign key convention

---

## 4. Scope

### 4.1 In Scope

#### Core Claim

- `claims`
- `claim_status_history`
- `claim_parties`
- `claim_items`
- `claim_diagnoses`
- `claim_procedures`
- `claim_documents`

#### Policy and Coverage

- `claim_policy_snapshots`
- `claim_coverage_results`
- `claim_benefit_calculations`

#### Evidence and Readiness

- `claim_evidence_requirements`
- `claim_evidence_results`

#### Rule Engine and Validation

- `claim_rule_executions`
- `claim_validations`
- `claim_duplicate_candidates`

#### AI Decision Support

- `claim_ai_assessments`
- `claim_ai_findings`
- `claim_risk_flags`
- `claim_source_references`

#### Workflow and Adjudication

- `claim_submissions`
- `claim_reviews`
- `claim_review_actions`
- `claim_decisions`
- `claim_decision_items`
- `claim_overrides`

#### Payment

- `claim_payments`
- `claim_payment_allocations`

### 4.2 Out of Scope

- Production insurer API integration
- Live iClaim transmission
- Certified DRG calculation engine
- Payment gateway execution
- General ledger posting
- Reinsurance
- Production historical data migration
- AI model training pipeline
- OCR engine implementation

---

## 5. Claim Processing Architecture

```text
Clinical Source Data
Patient / Visit / SOAP / Diagnosis / Prescription / Documents
                         ↓
                  Claim Creation
                         ↓
             Data Sufficiency Validation
                         ↓
          Eligibility and Policy Rule Engine
                         ↓
            Evidence Completeness Check
                         ↓
       Clinical, Coding and Cost Validation
                         ↓
         Fraud/Waste/Abuse Risk Screening
                         ↓
              AI Recommendation Layer
                         ↓
       STP Eligibility or Human Review Queue
                         ↓
             Final Claim Decision
                         ↓
                    Payment
                         ↓
            Audit / Monitoring / Reporting
```

---

## 6. Claim Lifecycle

Recommended claim statuses:

```text
draft
collecting_evidence
pending_validation
validation_failed
needs_information
ready_for_submission
submitted
submission_failed
under_review
pending_medical_review
pending_claim_assessor
approved
partially_approved
rejected
payment_pending
partially_paid
paid
cancelled
closed
```

### 6.1 Controlled Transitions

ตัวอย่าง Allowed Transitions:

```text
draft → collecting_evidence
collecting_evidence → pending_validation
pending_validation → validation_failed
pending_validation → needs_information
pending_validation → ready_for_submission
validation_failed → collecting_evidence
needs_information → collecting_evidence
ready_for_submission → submitted
submitted → submission_failed
submitted → under_review
under_review → pending_medical_review
under_review → pending_claim_assessor
under_review → approved
under_review → partially_approved
under_review → rejected
approved → payment_pending
partially_approved → payment_pending
payment_pending → partially_paid
payment_pending → paid
partially_paid → paid
draft → cancelled
collecting_evidence → cancelled
needs_information → cancelled
paid → closed
rejected → closed
```

ห้าม Update `claims.status` โดยตรงจาก Application ต้องผ่าน controlled database function หรือ trusted service transaction

---

## 7. Migration Strategy

แนะนำแบ่ง Migration เป็นกลุ่มเล็กเพื่อให้ตรวจสอบและ rollback ด้วย forward correction ได้ง่าย

---

## 8. Migration Group 1 — Claim Reference Types

**Suggested migration name**

```text
phase3_claim_reference_types
```

สร้าง status checks หรือ lookup tables สำหรับ:

- Claim type
- Claim status
- Claim item type
- Evidence status
- Validation category
- Validation severity
- Submission status
- Review status
- Decision type
- Payment status
- Risk level
- AI recommendation type

### Recommendation

ใช้ `text + check constraint` สำหรับค่าที่เสถียรแต่ยังอาจเปลี่ยนได้ในช่วง MVP  
ใช้ lookup tables สำหรับค่าที่ payer หรือ organization ต้อง configure ได้  
หลีกเลี่ยง PostgreSQL Enum จนกว่า lifecycle จะได้รับการอนุมัติขั้นสุดท้าย

---

## 9. Migration Group 2 — Core Claim Tables

### 9.1 `claims`

Purpose: Claim aggregate root

Key columns:

```text
id uuid primary key
organization_id uuid not null
clinic_id uuid not null
claim_number text not null
claim_type text not null
patient_id uuid not null
visit_id uuid
payer_id uuid
policy_reference text
status text not null
service_start_date date not null
service_end_date date
currency_code char(3) not null default 'THB'
total_claimed_amount numeric(14,2) not null default 0
total_eligible_amount numeric(14,2)
total_approved_amount numeric(14,2)
total_paid_amount numeric(14,2) not null default 0
risk_level text
current_ai_assessment_id uuid
current_decision_id uuid
version integer not null default 1
submitted_at timestamptz
closed_at timestamptz
created_at timestamptz
created_by uuid
updated_at timestamptz
updated_by uuid
deleted_at timestamptz
deleted_by uuid
```

Constraints:

- `claim_number` unique within organization
- Amounts must be non-negative
- Approved amount cannot exceed eligible amount unless authorized override exists
- Paid amount cannot exceed approved amount unless authorized adjustment exists
- Service end date cannot precede start date
- Submitted claim cannot be soft-deleted without privileged workflow
- Patient, Visit and Clinic must belong to the same organization
- Visit must belong to the claim patient

### 9.2 `claim_status_history`

Store immutable lifecycle history:

```text
claim_id
from_status
to_status
reason_code
reason_text
changed_by
changed_at
correlation_id
metadata jsonb
```

Do not update or delete status history through normal application roles

### 9.3 `claim_parties`

Optional normalized parties:

- Insured person
- Patient
- Policyholder
- Provider
- Payer
- Employer
- Claim submitter

---

## 10. Migration Group 3 — Claim Clinical and Financial Details

### 10.1 `claim_items`

Each billed service, medication, procedure or product

Important columns:

```text
claim_id
line_number
item_type
service_code
description
service_date
quantity
unit_price
gross_amount
discount_amount
tax_amount
claimed_amount
eligible_amount
approved_amount
patient_responsibility
payer_responsibility
prescription_item_id
procedure_reference
supporting_document_id
status
```

Constraints:

- Quantity > 0
- Monetary values >= 0
- `claimed_amount = gross_amount - discount_amount + tax_amount` within rounding tolerance
- Unique `(claim_id, line_number)`
- Same organization and clinic as parent claim

### 10.2 `claim_diagnoses`

- Principal diagnosis
- Secondary diagnoses
- Coding system
- Coding version
- Code
- Description snapshot
- Diagnosis rank
- Source visit diagnosis
- Present-on-admission if applicable
- AI coding status
- Reviewer coding status

Constraints:

- One principal diagnosis per claim
- No duplicate active diagnosis row for same claim and code
- Coding version required

### 10.3 `claim_procedures`

- Procedure code
- Coding system
- Procedure date
- Quantity
- Practitioner
- Source reference
- DRG relevance
- Authorization reference

### 10.4 `claim_documents`

Links Claim to existing `clinical_documents`

Document roles:

- Medical certificate
- Invoice
- Receipt
- Itemized bill
- Lab report
- Imaging report
- Referral
- Preauthorization
- Discharge summary
- Operative note
- Claim form

---

## 11. Migration Group 4 — Policy and Coverage Snapshot

Claim decisions must remain reproducible even when policy rules later change.

### 11.1 `claim_policy_snapshots`

Store immutable policy context used during adjudication:

```text
claim_id
payer_id
policy_reference
policy_status
effective_date
expiry_date
coverage_type
network_status
waiting_period_rule
exclusion_snapshot jsonb
benefit_snapshot jsonb
deductible_snapshot jsonb
copayment_snapshot jsonb
coinsurance_snapshot jsonb
rule_set_version
captured_at
```

Do not store unnecessary full policy documents when structured rule references are sufficient

### 11.2 `claim_coverage_results`

Results from deterministic policy rules:

- Policy active
- Waiting period
- Exclusions
- Preauthorization
- Network eligibility
- Referral requirement
- Coverage status
- Blocking result
- Rule version
- Evidence

### 11.3 `claim_benefit_calculations`

- Benefit limit
- Remaining benefit
- Deductible
- Copayment
- Coinsurance
- Eligible amount
- Patient responsibility
- Payer responsibility
- Calculation version

---

## 12. Migration Group 5 — Evidence and Claim Readiness

### 12.1 `claim_evidence_requirements`

Payer-specific required evidence:

```text
claim_id
requirement_code
document_type
mandatory
source_rule_id
due_at
```

### 12.2 `claim_evidence_results`

```text
claim_id
requirement_id
document_id
status
validation_message
validated_by_type
validated_by
validated_at
```

Statuses:

```text
missing
received
invalid
expired
needs_review
accepted
waived
```

Claim cannot become `ready_for_submission` while mandatory blocking evidence remains unresolved

---

## 13. Migration Group 6 — Rule Engine and Validation

### 13.1 `claim_rule_executions`

Store every deterministic execution:

```text
claim_id
rule_set_id
rule_set_version
execution_type
input_hash
result_status
blocking
result_payload jsonb
executed_at
correlation_id
```

### 13.2 `claim_validations`

Validation categories:

- Data sufficiency
- Clinical consistency
- Coding
- Coverage
- Benefit
- Evidence
- Cost
- Duplicate
- Temporal
- Prescription
- Fraud risk indicator

Each validation must store:

- Status
- Severity
- Blocking flag
- Finding code
- Explanation
- Source reference
- Rule or model version

### 13.3 `claim_duplicate_candidates`

Store possible duplicate claims without automatically declaring fraud

Fields:

- Claim
- Candidate claim
- Similarity score
- Matching attributes
- Detection method
- Review status
- Resolution

---

## 14. Migration Group 7 — AI Decision Support

### 14.1 `claim_ai_assessments`

Store one immutable AI run per claim version

Important columns:

```text
id
organization_id
clinic_id
claim_id
claim_version
assessment_type
recommended_action
overall_confidence
data_sufficiency_confidence
clinical_confidence
coding_confidence
coverage_confidence
financial_confidence
risk_confidence
risk_level
model_provider
model_name
model_version
prompt_version
rule_set_version
input_hash
output_payload jsonb
status
started_at
completed_at
created_at
```

Allowed recommended actions:

```text
pass_for_auto_adjudication
refer_to_assessor
request_information
recommend_denial_review
unable_to_assess
```

AI must not set final `claims.status` to approved or rejected

### 14.2 `claim_ai_findings`

Each finding must be explainable:

```text
assessment_id
finding_code
category
severity
description
recommended_action
claim_item_id
blocking
```

### 14.3 `claim_source_references`

Evidence traceability:

```text
finding_id
source_type
source_id
source_field
source_version
excerpt_hash
```

Avoid storing unnecessary raw PHI excerpts

### 14.4 `claim_risk_flags`

Risk indicators such as:

- Upcoding
- Duplicate claim
- Duplicate invoice
- Polypharmacy
- Over-servicing
- Unbundling
- Excessive units
- Impossible chronology
- Altered-document indicator
- Provider outlier
- Abnormal claim velocity
- Pre-existing condition indicator

Use terms `indicator`, `anomaly` and `requires investigation`; do not mark confirmed fraud without formal investigation outcome

---

## 15. Migration Group 8 — Submission, Review and Decision

### 15.1 `claim_submissions`

Store all submission attempts:

- Submission sequence
- Channel
- Payload reference
- External claim reference
- Response code
- Response status
- Submitted by
- Submitted at
- Error details
- Correlation ID

### 15.2 `claim_reviews`

Review case assigned to:

- Claim assessor
- Medical reviewer
- Coding reviewer
- Fraud investigator
- Compliance reviewer

Columns:

```text
claim_id
review_type
status
priority
assigned_to
assigned_at
due_at
started_at
completed_at
outcome
```

### 15.3 `claim_review_actions`

Immutable review activity:

- Requested information
- Added note
- Accepted finding
- Dismissed finding
- Escalated
- Returned to provider
- Recommended decision

### 15.4 `claim_decisions`

Final decision must be human or deterministic-authorized STP outcome

```text
claim_id
decision_version
decision_type
decision_source
decision_status
approved_amount
rejected_amount
reason_code
reason_text
decided_by
decided_at
supersedes_decision_id
rule_execution_id
ai_assessment_id
```

Decision source:

```text
human
stp_rule_engine
external_payer
```

AI alone is not a valid final decision source

### 15.5 `claim_decision_items`

Line-level adjudication:

- Claimed
- Eligible
- Approved
- Rejected
- Patient responsibility
- Reason codes

### 15.6 `claim_overrides`

Record every override:

- Original result
- New result
- Reason
- Actor
- Permission
- Timestamp
- Supporting evidence
- AI or rule result overridden

---

## 16. Migration Group 9 — Payment

### 16.1 `claim_payments`

```text
claim_id
payment_reference
payment_status
payment_date
gross_payment_amount
withholding_amount
adjustment_amount
net_payment_amount
currency_code
reconciliation_status
recorded_by
recorded_at
```

### 16.2 `claim_payment_allocations`

Allocate payment to decision lines

Constraints:

- Claim must have active approved or partially approved decision
- Total allocation cannot exceed payment
- Total paid cannot exceed approved amount except authorized adjustment
- Payment reference unique within payer or organization scope

---

## 17. Migration Group 10 — Functions and Transaction Controls

Recommended functions:

- `generate_claim_number()`
- `transition_claim_status()`
- `recalculate_claim_totals()`
- `evaluate_claim_readiness()`
- `validate_claim_submission()`
- `submit_claim()`
- `create_claim_ai_assessment()`
- `assign_claim_review()`
- `record_claim_decision()`
- `record_claim_override()`
- `record_claim_payment()`

Requirements:

- Use transaction boundaries
- Validate tenant ownership
- Validate clinic scope
- Validate permissions
- Lock claim row for critical transitions
- Prevent stale updates using version number
- Set safe `search_path` for `security definer`
- Revoke function access from `public`
- Grant least privilege

---

## 18. Migration Group 11 — Index Strategy

### Core claim indexes

```text
claims (organization_id, claim_number)
claims (organization_id, clinic_id, status)
claims (organization_id, patient_id, service_start_date desc)
claims (organization_id, visit_id)
claims (organization_id, payer_id, status)
claims (organization_id, submitted_at desc)
```

Use partial indexes with:

```sql
where deleted_at is null
```

### Detail indexes

```text
claim_items (claim_id, line_number)
claim_diagnoses (claim_id, diagnosis_rank)
claim_procedures (claim_id, procedure_date)
claim_documents (claim_id, document_type)
```

### Workflow indexes

```text
claim_reviews (organization_id, status, priority, due_at)
claim_submissions (claim_id, submitted_at desc)
claim_decisions (claim_id, decision_version desc)
claim_payments (claim_id, payment_date desc)
```

### AI and rule indexes

```text
claim_ai_assessments (claim_id, claim_version, completed_at desc)
claim_ai_findings (assessment_id, severity)
claim_risk_flags (claim_id, status, risk_level)
claim_rule_executions (claim_id, executed_at desc)
claim_validations (claim_id, blocking, severity)
```

Do not create indexes without confirmed query use cases

---

## 19. Migration Group 12 — RBAC

Recommended permissions:

```text
claim.read
claim.create
claim.update
claim.cancel
claim.validate
claim.submit
claim.review
claim.medical_review
claim.coding_review
claim.fraud_review
claim.decide
claim.override
claim.payment.read
claim.payment.record
claim.audit.read
claim.ai.read
claim.ai.execute
claim.rule.read
claim.rule.execute
```

Suggested role access:

- Clinic Staff: create/update draft, upload evidence
- Doctor: clinical source access, respond to documentation queries
- Clinic Admin: organization/clinic claim operations
- Claim Assessor: review and recommendation
- Medical Reviewer: medical necessity review
- Coding Reviewer: coding review
- Fraud/Compliance: risk investigation
- Finance: payment recording and reconciliation
- Auditor: read-only audit access
- Executive: aggregated insights only
- System Service: controlled workflow execution

---

## 20. Migration Group 13 — RLS Strategy

Enable RLS on every new table

### Core Principles

- Organization isolation is mandatory
- Clinic isolation applies where relevant
- Child table access derives from parent claim
- Permission checks supplement membership checks
- Service role bypass is restricted to trusted backend workflows
- Soft-deleted claims are hidden by default
- Audit records are not broadly mutable

### SELECT

User must:

- Be active member of claim organization
- Have access to claim clinic
- Have required permission
- Be allowed to view the record type

### INSERT

Must validate:

- Organization matches current tenant
- Clinic is in user scope
- Patient and Visit belong to same tenant
- User has create permission
- Immutable system fields cannot be supplied by unauthorized caller

### UPDATE

Must prevent:

- Changing organization
- Changing clinic outside approved transfer workflow
- Direct status transition
- Editing immutable decision, AI assessment, rule execution or audit records
- Updating closed claim without override permission

### DELETE

Physical delete should be denied for application users

Use soft delete only for eligible draft records and record audit event

---

## 21. Migration Group 14 — Audit Strategy

Audit events:

```text
claim.created
claim.updated
claim.status_changed
claim.evidence_added
claim.evidence_validated
claim.validation_executed
claim.validation_failed
claim.rule_executed
claim.ai_assessed
claim.ai_flag_created
claim.submitted
claim.submission_failed
claim.review_assigned
claim.review_completed
claim.information_requested
claim.decision_recorded
claim.decision_superseded
claim.override_recorded
claim.payment_recorded
claim.payment_reconciled
claim.cancelled
claim.closed
```

Audit metadata:

- Organization
- Clinic
- Actor
- Action
- Entity type
- Entity ID
- Claim ID
- Old values
- New values
- Reason
- Correlation ID
- Model version
- Rule version
- Timestamp

Do not log unnecessary full PHI or raw prompts when hashes and references are sufficient

---

## 22. STP Guardrails

Straight-Through Processing is permitted only when all deterministic conditions pass:

- Policy active
- Waiting period passed
- Coverage confirmed
- No exclusion
- Preauthorization satisfied
- Mandatory evidence complete
- No blocking validation
- No high or critical risk flag
- No duplicate unresolved
- Amount below payer STP threshold
- Claim type is on STP whitelist
- No manual-review-required diagnosis or procedure
- No unauthorized override
- Approved rule-set version
- AI recommendation, if used, is only supporting evidence

Required operational controls:

- STP kill switch
- Daily amount threshold
- Per-claim threshold
- Random post-payment audit sampling
- Payer-specific configuration
- Model drift monitoring
- Override monitoring
- Full audit trail

---

## 23. Seed and Fixture Plan

Create:

```text
supabase/tests/phase3_claim_fixtures.sql
```

Fixture coverage:

- Two organizations
- Multiple clinics
- Multiple roles
- OPD and IPD claims
- Draft claim
- Missing-evidence claim
- Validation-failed claim
- Submitted claim
- Under-review claim
- Approved claim
- Partially-approved claim
- Rejected claim
- Paid claim
- Duplicate candidate
- High-risk claim
- AI assessment with findings
- Human override
- Cross-tenant records

Use synthetic data only

---

## 24. Test Plan

Create:

```text
supabase/tests/phase3_claim_processing_test.sql
supabase/tests/phase3_claim_rls_test.sql
supabase/tests/phase3_claim_ai_governance_test.sql
supabase/tests/phase3_claim_financial_test.sql
```

### Functional

- Create claim
- Add items
- Add diagnoses
- Link documents
- Capture policy snapshot
- Execute rule result
- Validate readiness
- Create AI assessment
- Assign review
- Record decision
- Record payment
- Verify lifecycle history
- Verify audit events

### RLS

- Cross-organization denied
- Cross-clinic denied
- Unauthorized AI assessment access denied
- Unauthorized decision denied
- Unauthorized payment denied
- Tenant keys immutable
- Audit mutation denied
- Child records inaccessible without parent access

### Financial

- Negative amount rejected
- Duplicate line rejected
- Approved above eligible rejected
- Paid above approved rejected
- Allocation mismatch rejected
- Invalid currency rejected

### Governance

- AI cannot create final decision
- High-risk claim cannot use STP
- Missing policy result blocks STP
- Missing mandatory evidence blocks STP
- Override requires permission and reason
- Decision supersession preserves history
- Model and rule versions are retained

---

## 25. Migration File Sequence

Suggested order:

```text
phase3_claim_reference_types
phase3_claim_core_tables
phase3_claim_detail_tables
phase3_claim_policy_coverage
phase3_claim_evidence
phase3_claim_rule_validation
phase3_claim_ai_assessment
phase3_claim_review_decision
phase3_claim_payment
phase3_claim_functions
phase3_claim_indexes
phase3_claim_permissions
phase3_claim_rls
phase3_claim_audit
```

Create each file with:

```powershell
npx supabase migration new <migration_name>
```

---

## Migration Execution Rule

Migration files are forward-only deployment units. Each file must be independently reviewable and contain one logical responsibility only.

Each migration must contain one logical responsibility only.

Do not combine core tables, AI tables, RLS, permissions, indexes, and audit logic into one migration file.

After each migration group:

1. Run `npx supabase db reset`
2. Run `npx supabase db lint`
3. Validate created objects
4. Record issues before continuing
5. Do not proceed when dependency or RLS validation fails

---

## 26. Validation Commands

```powershell
cd D:\med-ai-nexsure-platform

npx supabase db reset
npx supabase db lint
npx supabase migration list
npx supabase gen types typescript --local > lib/database.types.ts
npx tsc --noEmit
npm run lint
npm run build
git status --short
git diff --stat
```

---

## 27. Rollback and Forward-Fix Strategy

### Local

Use:

```powershell
npx supabase db reset
```

### Shared and Production

- Do not edit applied migrations
- Create corrective migrations
- Use expand-and-contract
- Backfill before enforcing new NOT NULL constraints
- Validate data before adding unique constraints
- Preserve decision and audit history
- Backup before destructive operations

---

## 28. Deliverables

```text
docs/database/CLAIM-PROCESS-MIGRATION-PLAN.md
supabase/migrations/*_phase3_claim_*.sql
supabase/tests/phase3_claim_fixtures.sql
supabase/tests/phase3_claim_processing_test.sql
supabase/tests/phase3_claim_rls_test.sql
supabase/tests/phase3_claim_ai_governance_test.sql
supabase/tests/phase3_claim_financial_test.sql
docs/database/PHASE-3-CLAIM-PROCESSING-VALIDATION-REPORT.md
lib/database.types.ts
```

---

## 29. Definition of Done

Phase 3 is complete when:

- All migrations run from clean database
- `supabase db reset` passes
- `supabase db lint` passes
- Tenant-safe foreign keys pass
- RLS tests pass
- RBAC tests pass
- Lifecycle tests pass
- Financial tests pass
- AI governance tests pass
- Audit events are complete
- Generated TypeScript types succeed
- TypeScript validation passes
- Application build passes
- No cross-tenant PHI exposure
- Final decisions are separated from AI recommendations
- Validation report contains actual test results
- Git diff contains only approved scope

---

## 30. Pre-Implementation Checklist

- [ ] Confirm payer tables
- [ ] Confirm policy tables
- [ ] Confirm claim readiness reuse strategy
- [ ] Confirm audit helper
- [ ] Confirm RLS helper functions
- [ ] Confirm permission naming convention
- [ ] Confirm tenant-safe FK pattern
- [ ] Confirm claim number format
- [ ] Confirm final lifecycle
- [ ] Confirm monetary precision
- [ ] Confirm coding systems and versions
- [ ] Confirm DRG grouper integration boundary
- [ ] Confirm STP threshold ownership
- [ ] Confirm retention policy
- [ ] Confirm AI model metadata requirements
- [ ] Confirm PHI minimization rules

---

## 31. Recommended Next Step

เริ่มจากตรวจสอบ schema จริงของ payer, policy, claim readiness, RLS helper และ audit helper ก่อนสร้าง SQL จากนั้นสร้าง migration แรก:

```powershell
npx supabase migration new phase3_claim_reference_types
```

ไม่อนุญาตให้สร้างตาราง Claim Processing ทั้งหมด รวมถึง Functions, Indexes, Permissions, RLS และ Audit Logic ไว้ใน migration file เดียว

ต้องแบ่ง migration ตาม logical responsibility และ dependency order เพื่อให้สามารถ:

- ตรวจสอบ Foreign Key และ dependency ของแต่ละกลุ่มได้อย่างชัดเจน
- แยกทดสอบ schema, constraints, functions, permissions และ RLS ได้
- ระบุสาเหตุของ migration failure ได้รวดเร็ว
- ลดผลกระทบเมื่อแก้ไขเฉพาะบาง module
- ใช้ forward-fix migration ได้อย่างปลอดภัยใน Shared และ Production environments
- ตรวจสอบ security boundary ก่อนดำเนินการ migration กลุ่มถัดไป

ห้ามรวมรายการต่อไปนี้ไว้ในไฟล์เดียว:

- Core Claim Tables
- Clinical and Financial Detail Tables
- Policy and Coverage Tables
- Evidence Tables
- Rule Engine and Validation Tables
- AI Assessment Tables
- Review and Decision Tables
- Payment Tables
- Database Functions and Triggers
- Indexes
- Permission Seeds and Grants
- RLS Policies
- Audit Integration

แต่ละ migration ต้องมี logical responsibility เดียว และต้องผ่าน `supabase db reset`, `supabase db lint` และ object validation ก่อนเริ่ม migration กลุ่มถัดไป
