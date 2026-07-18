"use client";

import {
  Activity,
  BadgeCheck,
  Bot,
  BriefcaseMedical,
  Building2,
  ClipboardCheck,
  FileCheck2,
  Gavel,
  MailCheck,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { AI_PERMISSION_OPTIONS, CLINICS, CREATE_USER_ROLES, DEPARTMENTS, ORGANIZATIONS, PERMISSION_MATRIX_MODULES } from "../constants/create-user-options";
import type { AiPermissionLevel, CreateUserAccessScope, CreateUserFormValues, CreateUserRole, PermissionAction } from "../types/user-management.types";
import { cx } from "../utils/create-user-utils";

const inputClass = "min-h-11 w-full rounded-lg border border-[var(--nx-control)] bg-[var(--nx-surface)] px-3 py-2.5 font-['Inter'] text-[14px] leading-5 text-[var(--nx-text)] outline-none placeholder:text-[var(--nx-muted)] focus:border-[var(--nx-primary)] focus:ring-2 focus:ring-[var(--nx-focus)] disabled:bg-[var(--nx-surface-low)] disabled:text-[var(--nx-secondary)] aria-[invalid=true]:border-[var(--nx-danger)]";
const sectionClass = "rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-6 shadow-sm";
const labelClass = "font-['Inter'] text-[12px] font-semibold uppercase leading-5 tracking-wide text-[var(--nx-secondary)]";
const helperClass = "font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]";
const actions: PermissionAction[] = ["view", "create", "edit", "approve", "export", "admin"];

function Section({ title, helper, icon, children }: { title: string; helper: string; icon?: ReactNode; children: ReactNode }) {
  const isAi = title.includes("AI");
  return (
    <section className={cx(sectionClass, isAi && "relative overflow-hidden border-[color:color-mix(in_srgb,var(--nx-focus)_55%,white)] bg-[color:color-mix(in_srgb,var(--nx-info-bg)_75%,white)]")}>
      {isAi ? <Bot className="pointer-events-none absolute right-4 top-3 h-24 w-24 text-[var(--nx-primary)] opacity-10" aria-hidden="true" /> : null}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-['Inter'] text-[20px] font-semibold leading-7 text-[var(--nx-primary)]">
          {icon ? <span className="text-[var(--nx-primary)]">{icon}</span> : null}
          {title}
        </h2>
        <p className={cx("mt-1", helperClass)}>{helper}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, required, error, helper, children }: { id: string; label: string; required?: boolean; error?: string; helper?: string; children: ReactNode }) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className={labelClass}>{label}{required ? <span className="text-[var(--nx-danger)]"> *</span> : null}</span>
      {children}
      {helper ? <span id={helperId} className={helperClass}>{helper}</span> : null}
      {error ? <span id={errorId} className="font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{error}</span> : null}
    </label>
  );
}

export function CreateUserForm({ form }: { form: UseFormReturn<CreateUserFormValues> }) {
  const { register, setValue, watch, formState: { errors } } = form;
  const values = watch();
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const clinics = CLINICS[values.organizationId] || [];
  const departments = DEPARTMENTS[values.clinicId] || [];
  const suggestedRole: CreateUserRole = values.departmentId.toLowerCase().includes("claim") ? "claim_reviewer" : values.licenseNumber ? "doctor" : "clinic_staff";
  const suggestedRoleName = CREATE_USER_ROLES.find((role) => role.id === suggestedRole)?.name ?? "Clinic Staff";

  useEffect(() => {
    const generated = [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
    if (generated && !form.formState.dirtyFields.displayName) setValue("displayName", generated, { shouldDirty: true, shouldValidate: true });
  }, [form.formState.dirtyFields.displayName, setValue, values.firstName, values.lastName]);

  function setRole(id: CreateUserRole) {
    setValue("primaryRole", id, { shouldDirty: true, shouldValidate: true });
    setValue("acknowledgedAiSuggestion", true, { shouldDirty: true, shouldValidate: true });
    if (id === "system_admin" || id === "organization_admin" || id === "clinic_admin") setValue("requireMfa", true, { shouldDirty: true, shouldValidate: true });
  }

  function toggleRole(id: CreateUserRole) {
    const next = values.additionalRoles.includes(id) ? values.additionalRoles.filter((role) => role !== id) : [...values.additionalRoles, id];
    setValue("additionalRoles", next, { shouldDirty: true, shouldValidate: true });
  }

  function togglePermission(moduleId: string, action: PermissionAction, locked: boolean) {
    if (locked) return;
    const current = values.permissionMatrix[moduleId] ?? [];
    const next = current.includes(action) ? current.filter((item) => item !== action) : [...current, action];
    setValue(`permissionMatrix.${moduleId}`, next, { shouldDirty: true, shouldValidate: true });
    if (action === "admin") setValue("customPermissions", Array.from(new Set([...values.customPermissions, "user_management"])), { shouldDirty: true, shouldValidate: true });
    if (action === "export") setValue("exportPermissions", Array.from(new Set([...values.exportPermissions.filter((item) => item !== "no_export"), "pdf"])), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <form className="min-w-0 flex-1 space-y-6" onSubmit={(event) => event.preventDefault()}>
      <Section title="Personal Information" helper="ข้อมูลบัญชีและข้อมูลวิชาชีพที่จำเป็นสำหรับการสร้างผู้ใช้งาน" icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-6 rounded-lg border border-dashed border-[var(--nx-control)] bg-[var(--nx-surface-low)] p-4 md:col-span-2">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-white bg-[var(--nx-border)] text-center text-[var(--nx-secondary)] shadow-inner">
              <div>
                <UserPlus className="mx-auto h-7 w-7" aria-hidden="true" />
                <span className="mt-1 block font-['Inter'] text-[10px] font-semibold uppercase">Upload</span>
              </div>
            </div>
            <div>
              <h3 className="font-['Inter'] text-[14px] font-semibold leading-5 text-[var(--nx-text)]">Profile Picture</h3>
              <p className="mt-1 font-['Inter'] text-[12px] leading-5 text-[var(--nx-secondary)]">Recommended: 400x400px. JPG or PNG.</p>
              <p className="mt-1 font-['Inter'] text-[12px] leading-5 text-[var(--nx-ai)]">รูปถ่ายหน้าตรงเพื่อใช้ในการระบุตัวตนในระบบ</p>
            </div>
          </div>
          <Field id="firstName" label="First Name" required error={errors.firstName?.message}><input id="firstName" className={inputClass} aria-invalid={Boolean(errors.firstName)} aria-describedby={describe("firstName", errors)} {...register("firstName")} /></Field>
          <Field id="lastName" label="Last Name" required error={errors.lastName?.message}><input id="lastName" className={inputClass} aria-invalid={Boolean(errors.lastName)} aria-describedby={describe("lastName", errors)} {...register("lastName")} /></Field>
          <Field id="displayName" label="Display Name" required error={errors.displayName?.message} helper="Auto-generated from name and editable."><input id="displayName" className={inputClass} aria-invalid={Boolean(errors.displayName)} aria-describedby={describe("displayName", errors, true)} {...register("displayName")} /></Field>
          <Field id="email" label="Email Address" required error={errors.email?.message} helper="Duplicate email validation uses the existing mock identity registry."><input id="email" type="email" className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={describe("email", errors, true)} {...register("email")} /></Field>
          <Field id="employeeId" label="Employee ID" error={errors.employeeId?.message}><input id="employeeId" className={inputClass} aria-invalid={Boolean(errors.employeeId)} {...register("employeeId")} /></Field>
          <Field id="mobile" label="Phone Number" helper="รองรับหมายเลขโทรศัพท์ไทยและ international format"><input id="mobile" className={inputClass} {...register("mobile")} /></Field>
          <Field id="jobTitle" label="Job Title"><input id="jobTitle" className={inputClass} {...register("jobTitle")} /></Field>
          <Field id="licenseNumber" label="Professional License" error={errors.licenseNumber?.message} helper="Required for Doctor and Pharmacist roles."><input id="licenseNumber" className={inputClass} aria-invalid={Boolean(errors.licenseNumber)} aria-describedby={describe("licenseNumber", errors, true)} {...register("licenseNumber")} /></Field>
          <Field id="departmentId" label="Department"><select id="departmentId" className={inputClass} {...register("departmentId")}><option value="">Select department</option>{departments.map((department) => <option value={department} key={department}>{department}</option>)}</select></Field>
        </div>
      </Section>

      <Section title="Organization Assignment" helper="กำหนด Organization, Clinic, Role และสถานะบัญชีตาม least privilege" icon={<Building2 className="h-5 w-5" aria-hidden="true" />}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field id="organizationId" label="Organization" required error={errors.organizationId?.message}><select id="organizationId" className={inputClass} aria-invalid={Boolean(errors.organizationId)} {...register("organizationId")} onChange={(event) => { setValue("organizationId", event.target.value, { shouldDirty: true, shouldValidate: true }); setValue("clinicId", ""); setValue("additionalClinics", []); }}><option value="">Select organization</option>{ORGANIZATIONS.map((organization) => <option value={organization.id} key={organization.id}>{organization.name}</option>)}</select></Field>
          <Field id="clinicId" label="Clinic / Facility" error={errors.clinicId?.message}><select id="clinicId" disabled={!values.organizationId} className={inputClass} aria-invalid={Boolean(errors.clinicId)} {...register("clinicId")}><option value="">Select clinic</option>{clinics.map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}</select></Field>
          <Field id="language" label="Preferred Language"><select id="language" className={inputClass} {...register("language")}><option value="en">English</option><option value="th">Thai</option></select></Field>
          <Field id="accountStatus" label="User Status"><select id="accountStatus" className={inputClass} {...register("accountStatus")}><option value="draft">Draft</option><option value="invited">Invited</option><option value="active">Active</option><option value="suspended">Suspended</option></select></Field>
        </div>
      </Section>

      <Section title="Role & Privileges" helper="AI suggestions are decision support and require administrator confirmation before applying." icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}>
        <div className="mb-6 flex justify-end">
          <span className="rounded-full bg-[color:color-mix(in_srgb,var(--nx-focus)_55%,white)] px-3 py-1 font-['Inter'] text-[10px] font-bold uppercase tracking-wider text-[var(--nx-primary)]">RBAC Level 2</span>
        </div>
        {!suggestionDismissed ? (
          <div className="mb-6 rounded-lg border border-[color:color-mix(in_srgb,var(--nx-danger)_20%,white)] bg-[var(--nx-danger-bg)] p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 text-[var(--nx-danger)]" size={18} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-['Inter'] text-[12px] leading-5 text-[var(--nx-danger)]">
                  <strong>คำเตือนด้านความปลอดภัย:</strong> Suggested role: {suggestedRoleName}. สิทธิ์ทางคลินิกหรือสิทธิ์ระดับสูงอาจเข้าถึงข้อมูลสุขภาพที่ละเอียดอ่อน โปรดตรวจสอบตามนโยบาย PDPA
                </p>
              </div>
              <button type="button" onClick={() => setRole(suggestedRole)} className="rounded-lg bg-[var(--nx-primary)] px-3 py-2 font-['Inter'] text-[13px] font-semibold leading-5 text-white hover:bg-[var(--nx-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Apply</button>
              <button type="button" onClick={() => setSuggestionDismissed(true)} className="rounded-lg border border-[color:color-mix(in_srgb,var(--nx-danger)_25%,white)] bg-white px-3 py-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)] hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Dismiss</button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CREATE_USER_ROLES.map((role) => (
              <button type="button" key={role.id} onClick={() => setRole(role.id)} className={cx("flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--nx-border)] bg-white p-4 text-center transition-all hover:border-[var(--nx-primary)] hover:bg-[var(--nx-info-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]", values.primaryRole === role.id && "border-2 border-[var(--nx-primary)] bg-[color:color-mix(in_srgb,var(--nx-focus)_28%,white)]")}>
                <RoleIcon role={role.id} active={values.primaryRole === role.id} />
                <strong className="block font-['Inter'] text-[14px] font-semibold leading-5">{role.name}</strong>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-6 shadow-[0_12px_28px_color-mix(in_srgb,var(--nx-text)_7%,transparent)]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-['Inter'] text-[30px] font-bold leading-9 text-[var(--nx-text)]">Additional Roles</h3>
                <p className="mt-1 max-w-2xl font-['Inter'] text-[14px] leading-6 text-[var(--nx-secondary)]">Assign secondary access only when operationally necessary. เลือกบทบาทเสริมเท่าที่จำเป็นตามหลัก least privilege</p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--nx-success)_22%,white)] bg-[var(--nx-success-bg)] px-3 py-1 font-['Inter'] text-[12px] font-bold leading-4 text-emerald-700">Least Privilege by Default</span>
            </div>
            <div className="mt-5 grid gap-3">
              {CREATE_USER_ROLES.filter((role) => role.id !== values.primaryRole).slice(0, 7).map((role) => (
                <label key={role.id} className={cx("grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--nx-primary)_35%,white)] hover:shadow-[0_14px_30px_color-mix(in_srgb,var(--nx-text)_9%,transparent)] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]", values.additionalRoles.includes(role.id) && "border-[color:color-mix(in_srgb,var(--nx-primary)_50%,white)] bg-[color:color-mix(in_srgb,var(--nx-primary)_4%,white)]")}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--nx-info-bg)] text-[var(--nx-primary)]">
                    <RoleIcon role={role.id} active={values.additionalRoles.includes(role.id)} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-['Inter'] text-[18px] font-semibold leading-6 text-[var(--nx-text)]">{role.name}</span>
                    <span className="mt-1 block font-['Inter'] text-[14px] leading-5 text-[var(--nx-secondary)]">{role.description}</span>
                  </span>
                  <RolePrivilegeBadge role={role.id} />
                  <input type="checkbox" className="h-5 w-5 justify-self-end rounded border-[var(--nx-border)] accent-[var(--nx-primary)] focus:ring-2 focus:ring-[var(--nx-focus)] disabled:opacity-50" checked={values.additionalRoles.includes(role.id)} onChange={() => toggleRole(role.id)} />
                </label>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[color:color-mix(in_srgb,var(--nx-primary)_18%,white)] bg-[color:color-mix(in_srgb,var(--nx-primary)_5%,white)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-['Inter'] text-[14px] font-bold leading-5 text-[var(--nx-primary)]">Administrative Privilege Standard</p>
                  <p className="mt-1 font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]">บทบาทเสริมจะไม่ยกระดับเป็น Admin โดยอัตโนมัติ ต้องมีเหตุผลและการตรวจสอบก่อนเสมอ</p>
                </div>
                <span className={cx("inline-flex w-fit rounded-full px-3 py-1 font-['Inter'] text-[12px] font-bold leading-4", values.primaryRole.includes("admin") ? "bg-[var(--nx-warning-bg)] text-amber-700" : "bg-white text-[var(--nx-primary)]")}>{values.primaryRole.includes("admin") ? "Elevated Review" : "Standard"}</span>
              </div>
            </div>
          </div>
        </div>
        {errors.primaryRole ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.primaryRole.message}</p> : null}
      </Section>

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-['Inter'] text-[14px] font-bold leading-5 text-[var(--nx-text)]">
            Access Scope
            <span className="rounded-full bg-[var(--nx-success)] px-2 py-0.5 font-['Inter'] text-[10px] font-bold leading-4 text-white">LEAST PRIVILEGE RECOMMENDED</span>
          </h3>
          <div className="space-y-2">
            {(["assigned_cases", "primary_clinic"] as CreateUserAccessScope[]).map((scope) => (
              <label key={scope} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--nx-border)] p-3 transition-colors hover:bg-[var(--nx-surface-low)]">
                <input
                  checked={values.accessScope === scope}
                  className="text-[var(--nx-primary)] accent-[var(--nx-primary)] focus:ring-[var(--nx-primary)]"
                  name="scope"
                  onChange={() => setValue("accessScope", scope, { shouldDirty: true, shouldValidate: true })}
                  type="radio"
                />
                <div>
                  <p className="font-['Inter'] text-[14px] font-semibold leading-5 text-[var(--nx-text)]">{scope === "assigned_cases" ? "Assigned Records Only" : "Clinic-Wide Scope"}</p>
                  <p className="font-['Inter'] text-[12px] leading-4 text-[var(--nx-secondary)]">{scope === "assigned_cases" ? "Can only view patients explicitly assigned to them." : "Access to all patient records within the assigned clinic."}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <PermissionMatrix values={values} errors={errors} onToggle={togglePermission} />
      <AIGovernanceSection values={values} errors={errors} setValue={setValue} />
      <SecuritySettings values={values} register={register} errors={errors} />
      <InvitationSettings register={register} values={values} errors={errors} />
    </form>
  );
}

function PermissionMatrix({ values, errors, onToggle }: { values: CreateUserFormValues; errors: FieldErrors<CreateUserFormValues>; onToggle: (moduleId: string, action: PermissionAction, locked: boolean) => void }) {
  return (
    <Section title="Module and AI Permissions" helper="High-density enterprise grid. Locked permissions are enforced by system policy." icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}>
      <div className="overflow-auto rounded-[8px] border border-[var(--nx-border)]">
        <table className="w-full min-w-[920px] border-collapse text-left font-['Inter'] text-[13px] leading-5">
          <thead className="bg-[var(--nx-surface-low)] text-[var(--nx-text)]">
            <tr>{["Module", ...actions, "Scope", "Risk Level"].map((head) => <th key={head} className="border-b border-[var(--nx-border)] px-3 py-3 font-bold uppercase tracking-wide">{head}</th>)}</tr>
          </thead>
          <tbody>
            {PERMISSION_MATRIX_MODULES.map((row) => (
              <tr key={row.id} className="bg-[var(--nx-surface)] hover:bg-[var(--nx-info-bg)]">
                <td className="border-b border-[var(--nx-border)] px-3 py-2"><strong>{row.module}</strong><span className="block text-[var(--nx-secondary)]">{row.helper}</span></td>
                {actions.map((action) => {
                  const locked = row.locked?.includes(action) ?? false;
                  return <td key={action} className="border-b border-[var(--nx-border)] px-3 py-2 text-center"><input aria-label={`${row.module} ${action}`} title={row.helper} disabled={locked} type="checkbox" checked={(values.permissionMatrix[row.id] ?? []).includes(action)} onChange={() => onToggle(row.id, action, locked)} className="h-4 w-4 accent-[var(--nx-primary)] disabled:opacity-45" /></td>;
                })}
                <td className="border-b border-[var(--nx-border)] px-3 py-2">{row.scope}</td>
                <td className="border-b border-[var(--nx-border)] px-3 py-2"><RiskBadge level={row.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.requireMfa ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.requireMfa.message}</p> : null}
    </Section>
  );
}

function AIGovernanceSection({ values, errors, setValue }: { values: CreateUserFormValues; errors: FieldErrors<CreateUserFormValues>; setValue: UseFormReturn<CreateUserFormValues>["setValue"] }) {
  return (
    <Section title="AI & Cognitive Permissions" helper="AI is decision support only. Critical actions require Human-in-the-Loop and audit traceability." icon={<Bot className="h-5 w-5" aria-hidden="true" />}>
      <div className="grid gap-4 md:grid-cols-2">
        {AI_PERMISSION_OPTIONS.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-[var(--nx-border)] bg-white/70 p-4 md:grid-cols-[1fr_150px] md:items-center">
            <div><strong className="font-['Inter'] text-[14px] font-semibold leading-5">{item.name}</strong><p className={helperClass}>{item.helper}</p></div>
            <select className={inputClass} value={values.aiPermissionLevels[item.id]} onChange={(event) => setValue(`aiPermissionLevels.${item.id}`, event.target.value as AiPermissionLevel, { shouldDirty: true, shouldValidate: true })}><option value="no_access">No Access</option><option value="view">View</option><option value="generate">Generate</option><option value="review">Review</option><option value="confirm">Confirm</option></select>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-4 rounded-lg border border-[color:color-mix(in_srgb,var(--nx-primary)_20%,white)] bg-[color:color-mix(in_srgb,var(--nx-primary)_5%,white)] p-4">
        <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-[var(--nx-primary)]" aria-hidden="true" />
        <p className="font-['Inter'] text-[12px] italic leading-5 text-[var(--nx-primary)]"><strong>AI Governance Notice:</strong> ผลลัพธ์จากระบบ AI เป็นเพียงข้อมูลสนับสนุนการตัดสินใจ ผู้ใช้งานต้องตรวจสอบและรับรองก่อนนำไปใช้งานจริง</p>
      </div>
      {values.aiPermissionLevels.evidence_package_generation === "confirm" || values.aiPermissionLevels.economic_intelligence === "confirm" ? <RiskNotice title="AI Override Permission" text="AI Override and critical confirmation require governance warning, review reason, and audit metadata." /> : null}
      {errors.aiPermissionLevels ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.aiPermissionLevels.message}</p> : null}
    </Section>
  );
}

function SecuritySettings({ register, errors }: { values: CreateUserFormValues; register: UseFormReturn<CreateUserFormValues>["register"]; errors: FieldErrors<CreateUserFormValues> }) {
  return (
    <Section title="Security and Invitation Settings" helper="Secure-by-default controls for authentication, invitation policy, and activation." icon={<MailCheck className="h-5 w-5" aria-hidden="true" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="authenticationMethod" label="Authentication Method"><select id="authenticationMethod" className={inputClass} {...register("authenticationMethod")}><option value="email_password">Email & Password</option><option value="passwordless">Passwordless</option><option value="sso">Single Sign-On</option></select></Field>
        <Field id="sessionTimeout" label="Session Policy"><select id="sessionTimeout" className={inputClass} {...register("sessionTimeout")}><option value="15">High Security - 15 minutes</option><option value="30">Standard - 30 minutes</option><option value="60">Extended - 60 minutes</option></select></Field>
        <Field id="loginRestriction" label="Login Restriction"><select id="loginRestriction" className={inputClass} {...register("loginRestriction")}><option value="standard">Standard Business Access</option><option value="clinic_network">Clinic Network Only</option><option value="restricted_admin">Restricted Admin Network</option></select></Field>
        <Field id="ipRestriction" label="IP Restriction" helper="อย่าบันทึก secret หรือ temporary password ลง client log"><input id="ipRestriction" className={inputClass} {...register("ipRestriction")} /></Field>
        <Field id="expirationDate" label="Account Expiration" error={errors.expirationDate?.message}><input id="expirationDate" type="date" className={inputClass} aria-invalid={Boolean(errors.expirationDate)} {...register("expirationDate")} /></Field>
      </div>
      <SwitchGrid register={register} items={[["requireMfa", "MFA Required"], ["requirePasswordChange", "Force Password Reset"], ["temporaryAccess", "Temporary Access"], ["securityNotification", "Security Notification"], ["lockOnRiskDetection", "Lock Account on Risk Detection"]]} />
      {errors.requireMfa ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.requireMfa.message}</p> : null}
    </Section>
  );
}

function InvitationSettings({ register, values, errors }: { register: UseFormReturn<CreateUserFormValues>["register"]; values: CreateUserFormValues; errors: FieldErrors<CreateUserFormValues> }) {
  return (
    <Section title="Invitation and Activation" helper="เลือกวิธีส่งคำเชิญและนโยบาย activation โดยไม่จัดเก็บรหัสผ่านจริงใน client">
      <SwitchGrid register={register} items={[["sendInvitation", "Send Invitation Immediately"], ["scheduleActivation", "Schedule Activation"], ["setTemporaryPassword", "Set Temporary Password"], ["notifyAdministrator", "Notify Administrator"]]} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field id="inviteLanguage" label="Invitation Language"><select id="inviteLanguage" className={inputClass} {...register("inviteLanguage")}><option value="en">English</option><option value="th">Thai</option></select></Field>
        <Field id="inviteExpiry" label="Invitation Expiry"><select id="inviteExpiry" className={inputClass} {...register("inviteExpiry")}><option value="24">24 Hours</option><option value="72">3 Days</option><option value="168">7 Days</option><option value="336">14 Days</option></select></Field>
      </div>
      {!values.sendInvitation ? <p className={cx("mt-3 rounded-xl border border-[var(--nx-focus)] bg-[var(--nx-info-bg)] p-3", helperClass)}>Save Without Sending: บัญชีจะถูกบันทึกโดยยังไม่ส่งอีเมลเชิญผู้ใช้งาน</p> : null}
      {errors.sendInvitation ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.sendInvitation.message}</p> : null}
    </Section>
  );
}

function SwitchGrid({ register, items }: { register: UseFormReturn<CreateUserFormValues>["register"]; items: Array<[keyof CreateUserFormValues, string]> }) {
  return <div className="mt-4 grid gap-3 md:grid-cols-2">{items.map(([name, label]) => <label key={String(name)} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-4 font-['Inter'] text-[13px] font-semibold leading-5"><span>{label}<span className="ml-2 text-[12px] font-medium text-[var(--nx-secondary)]">Optional</span></span><input type="checkbox" className="h-4 w-4 accent-[var(--nx-ai)] focus:ring-2 focus:ring-[var(--nx-focus)]" {...register(name as never)} /></label>)}</div>;
}

function RoleIcon({ role, active }: { role: CreateUserRole; active: boolean }) {
  const className = cx("h-8 w-8", active ? "text-[var(--nx-primary)]" : "text-[var(--nx-secondary)]");
  const icons: Record<CreateUserRole, ReactNode> = {
    system_admin: <ShieldCheck className={className} aria-hidden="true" />,
    organization_admin: <Building2 className={className} aria-hidden="true" />,
    clinic_admin: <UsersRound className={className} aria-hidden="true" />,
    doctor: <Stethoscope className={className} aria-hidden="true" />,
    nurse: <BriefcaseMedical className={className} aria-hidden="true" />,
    pharmacist: <Pill className={className} aria-hidden="true" />,
    clinic_staff: <Activity className={className} aria-hidden="true" />,
    claim_reviewer: <FileCheck2 className={className} aria-hidden="true" />,
    auditor_compliance: <Gavel className={className} aria-hidden="true" />,
    executive: <BadgeCheck className={className} aria-hidden="true" />,
  };
  return icons[role];
}

function RolePrivilegeBadge({ role }: { role: CreateUserRole }) {
  const roleConfig = CREATE_USER_ROLES.find((item) => item.id === role);
  const label = roleConfig?.privileged ? "Privileged" : roleConfig?.licensed ? "Licensed" : "Standard";
  const classes = roleConfig?.privileged
    ? "border-[color:color-mix(in_srgb,var(--nx-warning)_28%,white)] bg-[var(--nx-warning-bg)] text-amber-700"
    : roleConfig?.licensed
      ? "border-[color:color-mix(in_srgb,var(--nx-ai)_22%,white)] bg-[var(--nx-info-bg)] text-[var(--nx-ai)]"
      : "border-[var(--nx-border)] bg-[var(--nx-surface-low)] text-[var(--nx-secondary)]";
  return <span className={`inline-flex w-fit justify-self-start rounded-full border px-3 py-1 font-['Inter'] text-[12px] font-bold leading-4 sm:justify-self-end ${classes}`}>{label}</span>;
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" }) {
  const tone = level === "Critical" || level === "High" ? "bg-[var(--nx-danger-bg)] text-red-700" : level === "Medium" ? "bg-[var(--nx-warning-bg)] text-amber-700" : "bg-[var(--nx-success-bg)] text-emerald-700";
  return <span className={cx("inline-flex rounded-full px-2 py-1 font-['Inter'] text-[12px] font-semibold leading-4", tone)}>{level}</span>;
}

function RiskNotice({ title, text }: { title: string; text: string }) {
  return <div className="mt-4 rounded-xl border border-amber-200 bg-[var(--nx-warning-bg)] p-4"><strong className="font-['Inter'] text-[13px] font-semibold leading-5 text-amber-800">{title}</strong><p className="mt-1 font-['Inter'] text-[13px] leading-5 text-amber-900">{text}</p></div>;
}

function describe(id: string, errors: FieldErrors<CreateUserFormValues>, helper?: boolean) {
  const values = [`${id}${helper ? "-helper" : ""}`];
  if (errors[id as keyof CreateUserFormValues]) values.push(`${id}-error`);
  return values.filter(Boolean).join(" ");
}
