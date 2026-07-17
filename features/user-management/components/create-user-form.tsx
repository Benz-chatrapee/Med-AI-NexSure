"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { AI_PERMISSION_OPTIONS, CLINICS, CREATE_USER_ROLES, DEPARTMENTS, ORGANIZATIONS, PERMISSION_MATRIX_MODULES } from "../constants/create-user-options";
import type { AiPermissionLevel, CreateUserAccessScope, CreateUserFormValues, CreateUserRole, PermissionAction } from "../types/user-management.types";
import { cx } from "../utils/create-user-utils";

const inputClass = "min-h-11 w-full rounded-lg border border-[var(--nx-control)] bg-[var(--nx-surface)] px-3 font-['Inter'] text-[14px] leading-5 text-[var(--nx-text)] outline-none placeholder:text-[var(--nx-muted)] focus:border-[var(--nx-ai)] focus:ring-2 focus:ring-ring-strong disabled:bg-[var(--nx-surface-low)] disabled:text-[var(--nx-secondary)] aria-[invalid=true]:border-[var(--nx-danger)]";
const sectionClass = "rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] shadow-sm";
const labelClass = "font-['Inter'] text-[13px] font-semibold leading-5 text-nav-foreground";
const helperClass = "font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]";
const actions: PermissionAction[] = ["view", "create", "edit", "approve", "export", "admin"];

function Section({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  const isAi = title.includes("AI");
  return (
    <section className={cx(sectionClass, isAi && "border-[var(--nx-focus)] bg-[var(--nx-info-bg)] border-l-4 border-l-[var(--nx-ai)]")}>
      <div className="border-b border-[var(--nx-border)] px-5 py-4">
        <h2 className="font-['Inter'] text-[20px] font-semibold leading-7 text-[var(--nx-text)]">{title}</h2>
        <p className={cx("mt-1", helperClass)}>{helper}</p>
      </div>
      <div className="p-5">{children}</div>
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
    <form className="space-y-5 xl:col-span-8" onSubmit={(event) => event.preventDefault()}>
      <Section title="User Identity" helper="ข้อมูลบัญชีและขอบเขตองค์กรที่จำเป็นสำหรับการสร้างผู้ใช้งาน">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="firstName" label="First Name" required error={errors.firstName?.message}><input id="firstName" className={inputClass} aria-invalid={Boolean(errors.firstName)} aria-describedby={describe("firstName", errors)} {...register("firstName")} /></Field>
          <Field id="lastName" label="Last Name" required error={errors.lastName?.message}><input id="lastName" className={inputClass} aria-invalid={Boolean(errors.lastName)} aria-describedby={describe("lastName", errors)} {...register("lastName")} /></Field>
          <Field id="displayName" label="Display Name" required error={errors.displayName?.message} helper="Auto-generated from name and editable."><input id="displayName" className={inputClass} aria-invalid={Boolean(errors.displayName)} aria-describedby={describe("displayName", errors, true)} {...register("displayName")} /></Field>
          <Field id="email" label="Email Address" required error={errors.email?.message} helper="Duplicate email validation uses the existing mock identity registry."><input id="email" type="email" className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={describe("email", errors, true)} {...register("email")} /></Field>
          <Field id="employeeId" label="Employee ID" error={errors.employeeId?.message}><input id="employeeId" className={inputClass} aria-invalid={Boolean(errors.employeeId)} {...register("employeeId")} /></Field>
          <Field id="mobile" label="Phone Number" helper="รองรับหมายเลขโทรศัพท์ไทยและ international format"><input id="mobile" className={inputClass} {...register("mobile")} /></Field>
          <Field id="jobTitle" label="Job Title"><input id="jobTitle" className={inputClass} {...register("jobTitle")} /></Field>
          <Field id="departmentId" label="Department"><select id="departmentId" className={inputClass} {...register("departmentId")}><option value="">Select department</option>{departments.map((department) => <option value={department} key={department}>{department}</option>)}</select></Field>
          <Field id="organizationId" label="Organization" required error={errors.organizationId?.message}><select id="organizationId" className={inputClass} aria-invalid={Boolean(errors.organizationId)} {...register("organizationId")} onChange={(event) => { setValue("organizationId", event.target.value, { shouldDirty: true, shouldValidate: true }); setValue("clinicId", ""); setValue("additionalClinics", []); }}><option value="">Select organization</option>{ORGANIZATIONS.map((organization) => <option value={organization.id} key={organization.id}>{organization.name}</option>)}</select></Field>
          <Field id="clinicId" label="Clinic / Facility" error={errors.clinicId?.message}><select id="clinicId" disabled={!values.organizationId} className={inputClass} aria-invalid={Boolean(errors.clinicId)} {...register("clinicId")}><option value="">Select clinic</option>{clinics.map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}</select></Field>
          <Field id="language" label="Preferred Language"><select id="language" className={inputClass} {...register("language")}><option value="en">English</option><option value="th">Thai</option></select></Field>
          <Field id="accountStatus" label="User Status"><select id="accountStatus" className={inputClass} {...register("accountStatus")}><option value="draft">Draft</option><option value="invited">Invited</option><option value="active">Active</option><option value="suspended">Suspended</option></select></Field>
        </div>
      </Section>

      <Section title="Role Assignment" helper="AI suggestions are decision support and require administrator confirmation before applying.">
        {!suggestionDismissed ? (
          <div className="mb-4 rounded-xl border border-[var(--nx-focus)] bg-[var(--nx-info-bg)] p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 text-[var(--nx-ai)]" size={18} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-['Inter'] text-[12px] font-semibold leading-4 text-[var(--nx-ai)]">AI-generated suggestion / Decision Support Only</p>
                <h3 className="mt-1 font-['IBM_Plex_Sans'] text-[18px] font-semibold leading-6 text-[var(--nx-text)]">{suggestedRoleName}</h3>
                <p className={helperClass}>Suggested from department, license, and current access context. Confidence: 82%. ต้องให้ผู้ดูแลระบบยืนยันก่อนใช้จริง</p>
              </div>
              <button type="button" onClick={() => setRole(suggestedRole)} className="rounded-lg bg-[var(--nx-primary)] px-3 py-2 font-['Inter'] text-[13px] font-semibold leading-5 text-white hover:bg-[var(--nx-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Apply Suggestion</button>
              <button type="button" onClick={() => setSuggestionDismissed(true)} className="rounded-lg border border-[var(--nx-focus)] bg-white px-3 py-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-primary)] hover:bg-[var(--nx-info-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Dismiss</button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 md:grid-cols-2">
            {CREATE_USER_ROLES.map((role) => (
              <button type="button" key={role.id} onClick={() => setRole(role.id)} className={cx("rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-4 text-left hover:border-[var(--nx-focus)] hover:bg-[var(--nx-info-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]", values.primaryRole === role.id && "border-[var(--nx-primary)] bg-[var(--nx-info-bg)] ring-2 ring-[var(--nx-focus)]")}>
                <span className="font-['IBM_Plex_Mono'] text-[12px] leading-4 text-[var(--nx-ai)]">{role.icon}</span>
                <strong className="mt-1 block font-['Inter'] text-[14px] font-semibold leading-5">{role.name}</strong>
                <span className={helperClass}>{role.description}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-info-bg)] p-4">
            <h3 className="font-['Inter'] text-[12px] font-semibold leading-4">Additional Roles</h3>
            <div className="mt-3 grid gap-2">
              {CREATE_USER_ROLES.filter((role) => role.id !== values.primaryRole).slice(0, 7).map((role) => (
                <label key={role.id} className="flex items-center justify-between gap-3 font-['Inter'] text-[12px] leading-4">
                  <span>{role.name}</span>
                  <input type="checkbox" className="h-4 w-4 accent-[var(--nx-primary)]" checked={values.additionalRoles.includes(role.id)} onChange={() => toggleRole(role.id)} />
                </label>
              ))}
            </div>
            <div className={cx("mt-4 rounded-full px-3 py-1 font-['Inter'] text-[12px] font-semibold leading-4", values.primaryRole.includes("admin") ? "bg-[var(--nx-warning-bg)] text-warning" : "bg-background text-nav-foreground")}>Administrative Privilege: {values.primaryRole.includes("admin") ? "Elevated" : "Standard"}</div>
          </div>
        </div>
        {errors.primaryRole ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.primaryRole.message}</p> : null}
      </Section>

      <Section title="Access Scope" helper="กำหนดระดับการเข้าถึงข้อมูลตาม Organization, Clinic, Department และ Global scope">
        <div className="grid gap-3 md:grid-cols-4">{(["assigned_cases", "primary_clinic", "selected_clinics", "organization_wide"] as CreateUserAccessScope[]).map((scope) => <button type="button" key={scope} onClick={() => setValue("accessScope", scope, { shouldDirty: true, shouldValidate: true })} className={cx("rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-4 text-left font-['Inter'] text-[13px] font-semibold leading-5 hover:border-[var(--nx-focus)] hover:bg-[var(--nx-info-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]", values.accessScope === scope && "border-[var(--nx-primary)] bg-[var(--nx-info-bg)] ring-2 ring-[var(--nx-focus)]")}>{scope.replaceAll("_", " ")}<span className="mt-1 block font-normal text-[var(--nx-secondary)]">{scope === "organization_wide" ? "Global-level" : scope === "selected_clinics" ? "Clinic-level" : "Department-level"}</span></button>)}</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field id="patientDataAccess" label="Patient Data Access"><select id="patientDataAccess" className={inputClass} {...register("patientDataAccess")}><option value="no_access">No Access</option><option value="assigned_cases">Assigned Cases</option><option value="clinic_scope">Clinic Scope</option><option value="selected_clinics">Selected Clinics</option><option value="organization_scope">Organization Scope</option></select></Field>
          <Field id="auditLogAccess" label="Audit Data Access"><select id="auditLogAccess" className={inputClass} {...register("auditLogAccess")}><option value="no_access">No Access</option><option value="own_activity">Own Activity</option><option value="clinic_scope">Clinic Scope</option><option value="organization_scope">Organization Scope</option></select></Field>
        </div>
        {values.accessScope === "organization_wide" || values.patientDataAccess === "organization_scope" ? <RiskNotice title="Global Access Risk" text="Global-level access requires explicit authorization, MFA, reason capture, and server-side authorization review." /> : null}
      </Section>

      <PermissionMatrix values={values} errors={errors} onToggle={togglePermission} />
      <AIGovernanceSection values={values} errors={errors} setValue={setValue} />
      <SecuritySettings values={values} register={register} errors={errors} />
      <InvitationSettings register={register} values={values} errors={errors} />
    </form>
  );
}

function PermissionMatrix({ values, errors, onToggle }: { values: CreateUserFormValues; errors: FieldErrors<CreateUserFormValues>; onToggle: (moduleId: string, action: PermissionAction, locked: boolean) => void }) {
  return (
    <Section title="Permission Matrix" helper="High-density enterprise grid. Locked permissions are enforced by system policy.">
      <div className="overflow-auto rounded-[8px] border border-[var(--nx-border)]">
        <table className="w-full min-w-[920px] border-collapse text-left font-['Inter'] text-[13px] leading-5">
          <thead className="bg-[var(--nx-info-bg)] text-[var(--nx-text)]">
            <tr>{["Module", ...actions, "Scope", "Risk Level"].map((head) => <th key={head} className="border-b border-[var(--nx-border)] px-3 py-2 font-semibold capitalize">{head}</th>)}</tr>
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
    <Section title="AI Access and Governance" helper="AI is decision support only. Critical actions require Human-in-the-Loop and audit traceability.">
      <div className="mb-4 rounded-xl border border-[var(--nx-focus)] bg-white p-4">
        <strong className="font-['Inter'] text-[12px] font-semibold leading-4 text-[var(--nx-ai)]">Human Review Required</strong>
        <p className={helperClass}>ผู้ใช้ต้องตรวจสอบผลลัพธ์ AI ก่อนนำไปใช้ทางคลินิก เคลม หรือ Audit ทุก Action ต้องตรวจสอบย้อนหลังได้</p>
      </div>
      <div className="grid gap-3">
        {AI_PERMISSION_OPTIONS.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-xl border border-[var(--nx-focus)] bg-white p-4 md:grid-cols-[1fr_180px] md:items-center">
            <div><strong className="font-['Inter'] text-[14px] font-semibold leading-5">{item.name}</strong><p className={helperClass}>{item.helper}</p></div>
            <select className={inputClass} value={values.aiPermissionLevels[item.id]} onChange={(event) => setValue(`aiPermissionLevels.${item.id}`, event.target.value as AiPermissionLevel, { shouldDirty: true, shouldValidate: true })}><option value="no_access">No Access</option><option value="view">View</option><option value="generate">Generate</option><option value="review">Review</option><option value="confirm">Confirm</option></select>
          </div>
        ))}
      </div>
      {values.aiPermissionLevels.evidence_package_generation === "confirm" || values.aiPermissionLevels.economic_intelligence === "confirm" ? <RiskNotice title="AI Override Permission" text="AI Override and critical confirmation require governance warning, review reason, and audit metadata." /> : null}
      {errors.aiPermissionLevels ? <p className="mt-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-danger)]">{errors.aiPermissionLevels.message}</p> : null}
    </Section>
  );
}

function SecuritySettings({ register, errors }: { values: CreateUserFormValues; register: UseFormReturn<CreateUserFormValues>["register"]; errors: FieldErrors<CreateUserFormValues> }) {
  return (
    <Section title="Security Settings" helper="Secure-by-default controls for authentication, session policy, temporary access, and risk detection.">
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
