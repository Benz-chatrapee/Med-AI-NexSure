"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { CLINICS, CREATE_USER_ROLES, DEPARTMENTS, ORGANIZATIONS } from "../constants/create-user-options";
import type { CreateUserAccessScope, CreateUserFormValues, CreateUserRole } from "../types/user-management.types";
import { cx } from "../utils/create-user-utils";

function Field({ label, error, children, helper }: { label: string; error?: string; children: ReactNode; helper?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {children}
      {helper ? <small className="text-xs text-slate-500">{helper}</small> : null}
      {error ? <small className="text-xs font-bold text-red-600">{error}</small> : null}
    </label>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

const inputClass = "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100";

export function CreateUserForm({ form }: { form: UseFormReturn<CreateUserFormValues> }) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const organizationId = watch("organizationId");
  const clinicId = watch("clinicId");
  const role = watch("primaryRole");
  const scope = watch("accessScope");
  const sendInvitation = watch("sendInvitation");
  const requireMfa = watch("requireMfa");
  const welcomeMessage = watch("welcomeMessage");
  const clinics = CLINICS[organizationId] || [];
  const departments = DEPARTMENTS[clinicId] || [];

  function selectRole(id: CreateUserRole) {
    setValue("primaryRole", id, { shouldDirty: true, shouldValidate: true });
    if (id === "organization_admin" || id === "clinic_admin") setValue("requireMfa", true, { shouldDirty: true });
  }

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <Card title="User Identity" subtitle="บันทึกข้อมูลส่วนบุคคล ข้อมูลติดต่อ และข้อมูลวิชาชีพที่จำเป็น">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First Name *" error={errors.firstName?.message}><input className={inputClass} {...register("firstName")} /></Field>
          <Field label="Last Name *" error={errors.lastName?.message}><input className={inputClass} {...register("lastName")} /></Field>
          <Field label="Display Name"><input className={inputClass} {...register("displayName")} /></Field>
          <Field label="Email Address *" error={errors.email?.message}><input className={inputClass} type="email" {...register("email")} /></Field>
          <Field label="Mobile Number"><input className={inputClass} {...register("mobile")} /></Field>
          <Field label="Employee ID"><input className={inputClass} {...register("employeeId")} /></Field>
          <Field label="Job Title"><input className={inputClass} {...register("jobTitle")} /></Field>
          <Field label="Professional License No." error={errors.licenseNumber?.message}><input className={inputClass} {...register("licenseNumber")} /></Field>
        </div>
      </Card>

      <Card title="Organization Assignment" subtitle="กำหนด Organization, Clinic, Department และขอบเขตข้อมูลที่อนุญาต">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Organization *" error={errors.organizationId?.message}>
            <select className={inputClass} {...register("organizationId")} onChange={(event) => { setValue("organizationId", event.target.value, { shouldDirty: true, shouldValidate: true }); setValue("clinicId", ""); setValue("departmentId", ""); }}>
              <option value="">Select organization</option>
              {ORGANIZATIONS.map((organization) => <option value={organization.id} key={organization.id}>{organization.name}</option>)}
            </select>
          </Field>
          <Field label="Primary Clinic *" error={errors.clinicId?.message}>
            <select disabled={!organizationId} className={inputClass} {...register("clinicId")} onChange={(event) => { setValue("clinicId", event.target.value, { shouldDirty: true, shouldValidate: true }); setValue("departmentId", ""); }}>
              <option value="">Select primary clinic</option>
              {clinics.map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}
            </select>
          </Field>
          <Field label="Department">
            <select disabled={!clinicId} className={inputClass} {...register("departmentId")}>
              <option value="">Select department</option>
              {departments.map((department) => <option value={department} key={department}>{department}</option>)}
            </select>
          </Field>
          <Field label="Primary Location">
            <select className={inputClass} {...register("locationId")}>
              <option value="">Select location</option>
              <option>Main Building - Floor 2</option>
              <option>Outpatient Center</option>
              <option>Claim Review Office</option>
            </select>
          </Field>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-slate-800">Access Scope *</legend>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {[
              ["own_clinic", "Own Clinic Only", "เข้าถึงเฉพาะ Primary Clinic"],
              ["assigned_clinics", "Assigned Clinics", "เข้าถึง Clinic ที่ได้รับมอบหมาย"],
              ["organization_wide", "Organization-wide", "ต้องผ่าน Elevated Access Review"],
            ].map(([id, name, description]) => (
              <button type="button" key={id} onClick={() => setValue("accessScope", id as CreateUserAccessScope, { shouldDirty: true })} className={cx("flex min-h-28 flex-col rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300", scope === id && "border-blue-600 bg-blue-50 ring-2 ring-blue-100")}>
                <strong className="text-sm">{name}</strong>
                <span className="mt-2 text-xs text-slate-500">{description}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card title="Role Assignment" subtitle="เลือก Primary Role ให้สอดคล้องกับหน้าที่และระดับความรับผิดชอบ">
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {CREATE_USER_ROLES.map((item) => (
            <button type="button" key={item.id} onClick={() => selectRole(item.id)} className={cx("flex min-h-32 flex-col items-start gap-2 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300", role === item.id && "border-blue-600 bg-blue-50 ring-2 ring-blue-100")}>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{item.icon}</span>
              <strong className="text-sm">{item.name}</strong>
              <small className="text-xs text-slate-500">{item.description}</small>
            </button>
          ))}
        </div>
        {errors.primaryRole ? <p className="mt-2 text-sm text-red-600">{errors.primaryRole.message}</p> : null}
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Least Privilege Principle</strong>
          <p>ระบบโหลด Default Permission ตาม Role และอนุญาต Override เฉพาะผู้ดูแลที่ได้รับสิทธิ์</p>
        </div>
      </Card>

      <Card title="AI Clinical Engine Access" subtitle="กำหนด AI Access Level ตาม Role, Accountability และ Human-in-the-Loop Control">
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <strong>Clinical Safety Priority</strong>
          <p>Clinical Recommendation และ Prescription Safety ต้องได้รับการตรวจสอบโดยบุคลากรที่ได้รับอนุญาต</p>
        </div>
        <div className="space-y-3">
          {["AI SOAP Summary", "AI ICD Suggestion", "AI Differential Diagnosis", "AI Prescription Safety", "AI Claim Readiness", "AI Copilot"].map((item) => (
            <div key={item} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_220px] md:items-center">
              <div>
                <strong>{item}</strong>
                <p className="text-sm text-slate-500">Decision Support Only - ต้องมี Human Review</p>
              </div>
              <select className={inputClass}>
                <option>No Access</option>
                <option>View Results</option>
                <option>Generate Results</option>
                <option>Generate & Accept</option>
              </select>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Account Settings" subtitle="กำหนด Account Status, Security Policy, Language และ Access Period">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Account Status"><select className={inputClass} {...register("accountStatus")}><option value="draft">Draft</option><option value="invited">Invited</option></select></Field>
          <Field label="Session Timeout"><select className={inputClass} {...register("sessionTimeout")}><option value="30">Organization Default (30 minutes)</option><option value="15">15 minutes</option><option value="60">60 minutes</option></select></Field>
          <Field label="Preferred Language"><select className={inputClass} {...register("language")}><option value="en">English</option><option value="th">ไทย</option></select></Field>
          <Field label="Time Zone"><select className={inputClass} {...register("timezone")}><option>Asia/Bangkok</option><option>Asia/Singapore</option></select></Field>
          <Field label="Effective Date" error={errors.effectiveDate?.message}><input type="date" className={inputClass} {...register("effectiveDate")} /></Field>
          <Field label="Expiration Date" error={errors.expirationDate?.message}><input type="date" className={inputClass} {...register("expirationDate")} /></Field>
        </div>
        <div className="mt-5 space-y-3">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
            <span className="flex flex-col"><strong>Require Password Change</strong><small className="mt-1 text-xs text-slate-500">บังคับเปลี่ยน Password เมื่อ Sign in ครั้งแรก</small></span>
            <input type="checkbox" className="h-5 w-5 accent-blue-600" {...register("requirePasswordChange")} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
            <span className="flex flex-col"><strong>Require MFA</strong><small className="mt-1 text-xs text-slate-500">บังคับใช้ MFA สำหรับ Privileged Role</small></span>
            <input type="checkbox" className="h-5 w-5 accent-blue-600" checked={requireMfa} onChange={(event) => { if (role === "organization_admin" || role === "clinic_admin") return; setValue("requireMfa", event.target.checked, { shouldDirty: true }); }} />
          </label>
        </div>
      </Card>

      <Card title="Invitation Settings" subtitle="กำหนด Invitation Policy, Expiry และ Welcome Message">
        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
          <span className="flex flex-col"><strong>Send Invitation Email</strong><small className="mt-1 text-xs text-slate-500">ส่ง Invitation Email หลังสร้างบัญชีสำเร็จ</small></span>
          <input type="checkbox" className="h-5 w-5 accent-blue-600" {...register("sendInvitation")} />
        </label>
        {sendInvitation ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Invitation Language"><select className={inputClass} {...register("inviteLanguage")}><option value="en">English</option><option value="th">ไทย</option></select></Field>
            <Field label="Invitation Expiry"><select className={inputClass} {...register("inviteExpiry")}><option value="24">24 Hours</option><option value="72">3 Days</option><option value="168">7 Days</option><option value="336">14 Days</option></select></Field>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-bold text-slate-800">Custom Welcome Message</span>
              <textarea maxLength={500} className="min-h-28 rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" {...register("welcomeMessage")} />
              <small className="text-xs text-slate-500">{welcomeMessage.length}/500 characters</small>
            </label>
          </div>
        ) : null}
      </Card>
    </form>
  );
}
