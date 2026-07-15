# Med AI NexSure — Prototype Implementation Rules

## Purpose

ใช้ไฟล์นี้เป็นกฎกลางสำหรับสร้างหรือแก้ไข Frontend จาก HTML Prototype, Screenshot, Mockup หรือ Design Reference ของ Med AI NexSure

เป้าหมายคือทำให้หน้าจอใกล้เคียง Prototype มากที่สุด โดยรักษา Business Meaning, Clinical Safety, Privacy, Compliance และโครงสร้างระบบเดิม

---

## Project Priorities

Med AI NexSure คือ Enterprise Healthcare and Insurance Intelligence Platform

ให้ความสำคัญตามลำดับ:

1. Patient safety
2. Data privacy and security
3. Correct healthcare and insurance meaning
4. Auditability and compliance
5. Prototype fidelity
6. Existing architecture
7. Minimal safe changes
8. Accessibility and maintainability

AI ต้องเป็น Decision Support เท่านั้น และต้องมี Human Review สำหรับการตัดสินใจทาง Clinical และ Claim

---

## Source of Truth

เมื่อต้องตัดสินใจ ให้ใช้ลำดับดังนี้:

1. คำสั่งล่าสุดของผู้ใช้
2. Prototype หรือ Design Reference
3. Requirement และ Acceptance Criteria
4. `AGENTS.md`
5. Specialist Agent Instructions
6. Existing Repository Architecture
7. Existing Design System

Prototype เป็น Source of Truth สำหรับ:

* Layout
* Section order
* Information hierarchy
* Labels
* Component states
* Visual style
* Interaction patterns

Prototype ไม่ใช่ Source of Truth สำหรับ:

* Backend contract
* Database schema
* Authentication
* Authorization
* RLS
* API behavior
* Security rules
* Production business logic

ห้ามเปลี่ยนระบบ Backend หรือ Security เพียงเพื่อให้เหมือน Prototype

---

## Core Fidelity Rules

ห้าม redesign, simplify, modernize หรือ reinterpret Prototype โดยไม่ได้รับคำสั่ง

ต้องรักษา:

* Page layout
* Sidebar and top navigation
* Header and breadcrumb
* Section order
* Grid and column ratio
* Card and panel structure
* Tables, forms and tabs
* Labels and content hierarchy
* Primary and secondary actions
* Status badges
* Sticky actions
* Modal and drawer behavior
* Loading, empty, error and warning states

ห้าม:

* เพิ่ม Feature ที่ไม่มีใน Prototype
* ลบ Feature ที่ Prototype แสดง
* เปลี่ยน Button hierarchy
* เปลี่ยนตำแหน่งข้อมูลสำคัญ
* เปลี่ยน Clinical, Insurance หรือ Claim meaning
* ปรับ UI ตามความชอบส่วนตัว

หากทำให้เหมือนทั้งหมดไม่ได้ ให้จัดลำดับ:

1. Layout
2. Information hierarchy
3. Spacing
4. Typography
5. Color
6. Border and shadow
7. Icons
8. Micro-interactions

---

## Repository Inspection

ก่อนสร้าง Route หรือ Component ใหม่ ต้องตรวจสอบ:

* `app/`
* `features/`
* `components/`
* `components/ui/`
* `hooks/`
* `lib/`
* `services/`
* `schemas/`
* `types/`
* `constants/`
* Existing layouts and routes

ต้องค้นหาและ Reuse สิ่งที่มีอยู่ก่อน เช่น:

* Page header
* Sidebar
* KPI card
* Status badge
* Data table
* Filter bar
* Empty state
* Alert banner
* Claim readiness card
* Evidence checklist
* Audit timeline
* Sticky action bar

ห้ามสร้าง Route, Component, Type, Service หรือ Utility ซ้ำโดยไม่จำเป็น

---

## Minimal Safe Changes

ให้แก้เฉพาะสิ่งที่ต่างจาก Prototype และเกี่ยวข้องกับงาน

ต้อง:

* แก้เฉพาะไฟล์ที่จำเป็น
* ใช้ Existing Component และ Design Token
* รักษา Public API เดิมเมื่อทำได้
* แยก UI, Business Logic และ Mock Data
* ตรวจสอบผลกระทบก่อนแก้ Shared Component

ห้ามเปลี่ยนโดยไม่ได้รับอนุญาต:

* Backend contract
* Database schema
* Authentication
* Authorization
* RLS policy
* Shared application behavior
* Unrelated routes or files

---

## Technology Stack

ใช้ Stack ที่มีอยู่ใน Repository เท่านั้น:

* Next.js App Router
* React
* TypeScript Strict Mode
* Tailwind CSS
* Shadcn/UI
* React Hook Form
* Zod
* TanStack Query
* Zustand
* Supabase
* PostgreSQL
* Existing toast and icon libraries

ห้ามเพิ่ม Framework หรือ Library ใหม่ เว้นแต่:

* Repository ใช้อยู่แล้ว
* Requirement จำเป็นจริง
* ไม่มีทางเลือกเดิมที่เหมาะสม
* ผู้ใช้อนุญาตชัดเจน

---

## Next.js Rules

* ตรวจสอบ Route ก่อนสร้างใหม่
* ใช้ Server Component เป็นค่าเริ่มต้น
* ใช้ `"use client"` เฉพาะส่วนที่ต้องมี State, Event, Form, Browser API หรือ Client Query
* อย่าใส่ UI ขนาดใหญ่ทั้งหมดใน `page.tsx`
* แยก Feature Component ตาม Domain
* ใช้ `loading.tsx`, `error.tsx` และ `not-found.tsx` เมื่อเหมาะสม
* Loading state ควรใช้ Skeleton ที่สะท้อน Layout จริง

ตัวอย่าง:

```tsx
import { UserDetailPage } from "@/features/user-management/components/user-detail-page";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { userId } = await params;

  return <UserDetailPage userId={userId} />;
}
```

---

## Component Architecture

จัดไฟล์ตาม Feature หรือ Domain

```text
features/
└── claim-readiness/
    ├── components/
    ├── services/
    ├── schemas/
    ├── types/
    ├── constants/
    └── utils/
```

แนวทาง:

* แยก Component ตาม Responsibility
* แยก Interactive Component
* แยก Schema, Type, Service และ Data Transformation
* เก็บ Mock Data ในไฟล์แยก
* หลีกเลี่ยง Component ขนาดใหญ่
* หลีกเลี่ยง Business Logic ใน JSX
* หลีกเลี่ยง Inline Data จำนวนมาก

---

## Med AI NexSure Design Language

รูปแบบหลัก:

* Enterprise SaaS
* Healthcare intelligence
* Insurance operations
* Clinical safety
* Compliance-first
* AI-native
* Executive-ready
* High information density
* Clean and trustworthy

ใช้ Design Token ของระบบก่อนเสมอ

Fallback palette:

```text
Primary:        #1E3A8A
Primary Deep:   #0F2A5F
AI Blue:        #2563EB
Soft Blue:      #EFF6FF
Accent:         #38BDF8
Background:     #F8FAFC
Surface:        #FFFFFF
Border:         #E2E8F0
Text Primary:   #0F172A
Text Secondary: #64748B
Success:        #059669
Warning:        #D97706
Danger:         #DC2626
```

Status meaning:

* Green: Safe, Ready, Complete, Approved
* Amber: Warning, Pending, Needs Review
* Red: Critical, Rejected, Not Ready
* Blue: Active, AI-assisted, Informational
* Gray: Draft, Disabled, Neutral

ห้ามใช้สีอย่างเดียว ต้องมี Label หรือ Icon ประกอบ

---

## Typography and Layout

* รักษาขนาดและลำดับ Typography ตาม Prototype
* Page title และ Primary KPI ต้องเด่น
* Clinical Warning และ Compliance Alert ต้องเด่นกว่าข้อมูลทั่วไป
* หลีกเลี่ยง Font เล็กหรือสีจางเกินไป
* รักษา Full-screen Layout หาก Prototype ใช้เต็มหน้าจอ
* ใช้พื้นที่อย่างมีประสิทธิภาพ
* หลีกเลี่ยง Padding และ Card height ที่มากเกินไป
* ใช้ Border และ Shadow แบบ Subtle
* หลีกเลี่ยง Decorative UI ที่ไม่จำเป็น

---

## Bilingual Policy

ใช้แนวทาง:

**English First, Thai Support**

สัดส่วนประมาณ:

* English 70%
* Thai 30%

ใช้ English สำหรับ:

* Navigation
* Page title
* Section title
* KPI
* Dashboard labels
* Module names
* Table headers
* Clinical, AI, Insurance และ Compliance terms

ใช้ Thai สำหรับ:

* Helper text
* Warning
* Validation
* Empty state
* Confirmation
* User guidance

ตัวอย่าง:

```text
Claim Readiness
ประเมินความพร้อมของข้อมูลและเอกสารก่อนส่งเคลม
```

ห้ามแปลศัพท์เทคนิคจนความหมาย Clinical หรือ Insurance เปลี่ยน

---

## Clinical Safety

หน้าที่เกี่ยวข้องกับ Clinical Data ต้อง:

* แสดง AI เป็น Suggestion เท่านั้น
* ต้องมี Human Review
* แสดง Confidence และ Explainability เมื่อเหมาะสม
* รักษา Allergy, Drug Interaction และ Critical Alert
* มี Audit Trail
* ไม่ Auto-approve Clinical Decision
* ไม่แสดง AI Output เป็น Final Diagnosis

ข้อความแนะนำ:

```text
AI-generated suggestion. Clinical review is required.
คำแนะนำนี้สร้างโดย AI และต้องได้รับการตรวจสอบโดยบุคลากรทางการแพทย์
```

---

## Claim Readiness

หากหน้าเกี่ยวข้องกับ Claim Readiness ต้องแสดง:

* Score 0–100
* Status
* Missing evidence
* Score breakdown
* Insurance rule result
* Risk level
* Reasons
* Reviewer action
* Audit history

Status:

```text
Ready         = พร้อมส่งเคลม
Needs Review  = ต้องตรวจสอบ
Not Ready     = ยังไม่พร้อม
```

Default thresholds:

```text
Ready:         85–100
Needs Review:  60–84
Not Ready:      0–59
```

Default score breakdown:

```text
SOAP Documentation:      25%
Diagnosis and ICD:       20%
Prescription/Procedure:  15%
Evidence Completeness:   20%
Insurance Rule:          10%
Economic Review:         10%
```

ต้องระบุว่า Score ไม่รับประกันการอนุมัติเคลม

```text
Readiness score indicates documentation preparedness and does not guarantee payer approval.
คะแนนสะท้อนความพร้อมของข้อมูลและเอกสาร ไม่ใช่การรับประกันผลอนุมัติเคลม
```

---

## Insurance Intelligence

แยกข้อมูลให้ชัดเจน:

* Coverage indication
* Payer rule
* Exclusion
* Waiting period
* Benefit limit
* Required evidence
* Claim risk
* Review reason
* Human decision

AI หรือ Rule Engine สามารถ:

* Suggest
* Flag
* Explain
* Prioritize
* Detect inconsistency
* Identify missing evidence

ห้าม:

* Final approve claim
* Final reject claim
* Override reviewer
* เปลี่ยน Policy term
* ซ่อน Rule exception

---

## Economic Intelligence

หน้าที่เกี่ยวข้องกับ Cost ต้องแสดงเมื่อมีข้อมูล:

* Average visit cost
* Expected range
* Benchmark
* Outlier status
* Cost alert
* Justification
* Comparison period
* Review status

Cost Alert เป็น Analytical Signal เท่านั้น ไม่ใช่หลักฐานการทุจริตหรือเหตุผล Reject อัตโนมัติ

---

## Audit, Compliance and PDPA

ต้องรักษา:

* Actor
* Role
* Action
* Timestamp
* Before and after value
* Reason
* Source
* Related patient, visit or claim
* Review status

ปฏิบัติตาม:

* Least privilege
* Data minimization
* Purpose limitation
* Consent awareness
* Auditability
* Sensitive data masking

ห้ามแสดงข้อมูลเกินความจำเป็น เช่น:

* National ID เต็ม
* Member ID เต็ม
* Phone เต็ม
* Address เต็ม
* Sensitive clinical details ในหน้าที่ไม่เกี่ยวข้อง

ตัวอย่าง:

```text
National ID: 1-2345-*****-12-3
Member ID: NX-****-4821
Phone: 08*-***-4721
```

---

## Accessibility

ต้องรองรับ:

* Semantic HTML
* Keyboard navigation
* Visible focus
* Correct heading hierarchy
* Form labels
* Accessible errors
* Dialog focus management
* Sufficient contrast
* Screen-reader friendly status
* Non-color indicators

ใช้:

* `<button>` สำหรับ Action
* `<a>` หรือ Link สำหรับ Navigation
* `aria-label` สำหรับ Icon-only button

---

## Responsive Rules

Desktop เป็นหลักตาม Prototype

### Desktop

* รักษา Sidebar และ Multi-column Layout
* รักษา Data Density
* รักษา Sticky Actions
* ใช้พื้นที่เต็มตาม Prototype

### Tablet

* ลดจำนวน Column เมื่อจำเป็น
* ใช้ Horizontal Scroll สำหรับ Table
* ย้าย Secondary Panel ลงล่างได้

### Mobile

* Stack content
* Sidebar เป็น Drawer เมื่อระบบรองรับ
* ห้ามซ่อน Clinical Warning หรือ Primary Action
* หลีกเลี่ยงการบีบ Table

ห้ามเปลี่ยน Desktop Layout หลักเพียงเพื่อรองรับ Mobile

---

## Forms, Tables and States

Forms ต้องมี:

* Required indication
* Inline validation
* Loading and disabled state
* Success feedback
* Confirmation สำหรับ Critical Action
* Unsaved change protection เมื่อเหมาะสม

Tables ต้องรักษา:

* Column order
* Search and filter
* Sort
* Pagination
* Row action
* Numeric alignment
* Status format
* Loading, empty and error states

Data-driven page ต้องพิจารณา:

* Default
* Loading
* Empty
* Error
* Permission denied
* Partial data
* Read-only
* Disabled
* Success
* Warning
* Critical
* Archived or inactive

---

## Mock Data

หาก Backend ยังไม่พร้อม:

* เก็บ Mock Data ในไฟล์แยก
* ใช้ Type ชัดเจน
* ไม่ใช้ข้อมูลจริง
* ทำให้เปลี่ยนเป็น API ได้ง่าย
* ไม่ฝัง Data จำนวนมากใน JSX
* แสดง Demo หรือ Mock state เมื่อจำเป็น

---

## Prototype Comparison

ก่อนแก้ไข ให้เปรียบเทียบ Prototype กับ UI ปัจจุบันในหัวข้อ:

* Layout
* Section order
* Typography
* Spacing
* Color
* Cards and panels
* Tables and forms
* Labels
* Status
* Actions
* Interaction
* Responsive behavior
* Accessibility

สร้างรายการ Delta ก่อนลงมือ เช่น:

```text
1. Header height differs from prototype
2. Right-side panel is missing
3. KPI grid ratio is incorrect
4. Primary action is in the wrong position
5. Status badge uses the wrong semantic color
```

แก้เฉพาะ Delta ที่เกี่ยวข้อง

---

## Required Workflow

1. อ่านคำสั่งและระบุ Target Route
2. ตรวจสอบ Repository
3. วิเคราะห์ Prototype
4. เปรียบเทียบ Existing UI
5. ระบุ Delta
6. วางแผน Minimal Changes
7. Implement ด้วย Existing Architecture
8. ตรวจสอบ Responsive และ Accessibility
9. รัน Validation
10. สรุป Files และผลการทดสอบ

Validation ตาม Script ที่มีใน Repository:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

ตรวจสอบ `package.json` ก่อนรัน และห้ามอ้างว่าผ่านหากไม่ได้รันจริง

---

## Coding Standards

ต้อง:

* ใช้ TypeScript Strict
* หลีกเลี่ยง `any`
* ใช้ Existing aliases, utilities and tokens
* ใช้ Semantic HTML
* Handle loading, empty and error states
* แยก Type, Schema, Service และ Business Logic
* ใช้ Naming Convention เดิม

ห้าม:

* ใช้ `@ts-ignore` โดยไม่มีเหตุผล
* Disable TypeScript
* Hardcode color เมื่อมี Token
* Duplicate Component หรือ Type
* ใส่ Placeholder handler
* ทิ้ง `console.log`
* แก้ Unrelated Code
* Commit Secret หรือ Credential

---

## Definition of Done

งานถือว่าเสร็จเมื่อ:

* [ ] Route ถูกต้องและเปิดได้
* [ ] Layout และ Section order ตรง Prototype
* [ ] Content hierarchy ถูกต้อง
* [ ] Main interactions ทำงาน
* [ ] Loading, empty, error และ permission states ครบ
* [ ] Existing components ถูก Reuse
* [ ] ไม่มี Duplicate Route หรือ Shared Component
* [ ] Clinical และ Claim meaning ถูกต้อง
* [ ] Sensitive data ได้รับการปกป้อง
* [ ] Responsive ไม่เสีย
* [ ] Keyboard ใช้งานได้
* [ ] TypeScript, lint และ build ผ่านเมื่อมี Script
* [ ] ไม่มี Unrelated Changes
* [ ] ไม่มี Backend หรือ Security Change โดยไม่ได้รับอนุญาต

---

## Output Format

```markdown
## Implementation Summary

### Target
- Route:
- Page:
- Prototype:

### Files Created
- ...

### Files Modified
- ...

### Main Changes
- ...

### Prototype Fidelity
- Layout:
- Components:
- Interactions:
- Responsive:

### Validation
- `npm run lint`:
- `npm run typecheck`:
- `npm run test`:
- `npm run build`:

### Limitations
- ...

### Unrelated Changes
- None.
```

---

## Execution Template

```markdown
## Task

Modify the specified Med AI NexSure frontend page to match the attached prototype.

## Target

- Route: [TARGET_ROUTE]
- Existing page: [EXISTING_PAGE]
- Feature: [FEATURE_MODULE]
- Prototype: [PROTOTYPE_FILE]

## Objective

Match the prototype as closely as possible without redesigning, simplifying, modernizing or changing business meaning.

## Required Process

1. Inspect the repository before editing.
2. Locate existing routes, components, services, types and tokens.
3. Compare the current UI with the prototype.
4. Identify exact differences.
5. Reuse existing components.
6. Apply the smallest safe changes.
7. Preserve backend contracts, authorization and business logic.
8. Validate lint, typecheck, tests and build.
9. Report all created and modified files.

## Preserve

- Layout
- Section order
- Information hierarchy
- Labels
- Component states
- Cards
- Tables
- Forms
- Status badges
- Button hierarchy
- Spacing
- Typography
- Colors
- Responsive behavior
- Interactions

## Safety

- AI is decision support only.
- Clinical decisions require human review.
- Claim readiness does not guarantee payer approval.
- Preserve auditability and PDPA compliance.
- Protect sensitive data.
- Do not modify unrelated files.

## Definition of Done

The page matches the prototype, follows the existing architecture, reuses existing components, supports required states, remains accessible and responsive, and passes available validation.
```

---

## Final Rule

สร้าง Frontend ให้ตรง Prototype มากที่สุด แต่ห้ามลดทอน Patient Safety, Clinical Accuracy, Data Privacy, Authorization, Compliance หรือ Auditability เพื่อแลกกับความเหมือนทาง Visual
