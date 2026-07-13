import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, UserPlus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  aiAccessLevelOptions,
  clinicOptions,
  dataAccessLevelOptions,
  departmentOptions,
  getRoleAiCompatibilityMessage,
  isRoleAiCompatible,
  permissionTemplateOptions,
  roleOptions,
} from "../constants/clinic-user-options";
import { inviteClinicUserSchema, type InviteClinicUserFormValues } from "../schemas/user-schema";
import type { InviteClinicUserInput } from "../types/user-management.types";

const defaultValues: InviteClinicUserFormValues = {
  fullName: "",
  email: "",
  employeeId: "",
  phone: "",
  jobTitle: "",
  professionalLicense: "",
  primaryRole: "doctor",
  departmentId: "general-medicine",
  clinicId: "clinic-bangkok",
  dataAccessLevel: "assigned_clinic",
  accessExpiresAt: "",
  additionalRole: "none",
  aiAccessLevel: "clinical_assist",
  permissionTemplate: "role_recommended",
};

export function InviteUserDialog({
  open,
  pending,
  onClose,
  onSubmit,
  onDraft,
}: {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: InviteClinicUserInput) => void;
  onDraft: () => void;
}) {
  const form = useForm<InviteClinicUserFormValues>({ resolver: zodResolver(inviteClinicUserSchema), defaultValues, mode: "onChange" });
  const role = useWatch({ control: form.control, name: "primaryRole" });
  const aiAccessLevel = useWatch({ control: form.control, name: "aiAccessLevel" });
  const compatible = isRoleAiCompatible(role, aiAccessLevel);

  useEffect(() => {
    if (!open) form.reset(defaultValues);
  }, [form, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4" role="presentation">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        onSubmit={form.handleSubmit((values) => {
          onSubmit({ ...values, auditReason: "Invitation created with role, scope and AI permission metadata" });
          form.reset(defaultValues);
        })}
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 id="invite-user-title" className="text-2xl font-black text-[#0F2A5F]">Invite Clinic User</h2>
            <p className="text-sm leading-6 text-slate-500">เชิญผู้ใช้งานและกำหนดสิทธิ์ตามหลัก Least Privilege พร้อม audit metadata</p>
          </div>
          <Button aria-label="Close invite dialog" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X size={17} aria-hidden="true" />
          </Button>
        </div>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-5">
          <Section title="1. Personal Information">
            <Field label="Full Name" error={form.formState.errors.fullName?.message} required><input {...form.register("fullName")} className={inputClass} placeholder="e.g. Dr. Narin Wongchai" /></Field>
            <Field label="Email Address" error={form.formState.errors.email?.message} required><input {...form.register("email")} className={inputClass} placeholder="name@organization.com" /></Field>
            <Field label="Employee ID"><input {...form.register("employeeId")} className={inputClass} placeholder="EMP-0000" /></Field>
            <Field label="Phone Number"><input {...form.register("phone")} className={inputClass} placeholder="+66 xx xxx xxxx" /></Field>
            <Field label="Job Title"><input {...form.register("jobTitle")} className={inputClass} placeholder="Senior Physician" /></Field>
            <Field label="Professional License Number" error={form.formState.errors.professionalLicense?.message}><input {...form.register("professionalLicense")} className={inputClass} placeholder="Required for Doctor / Pharmacist" /><span className="mt-1 block text-xs font-semibold text-slate-500">License number will be masked based on viewer permissions.</span></Field>
          </Section>

          <Section title="2. Access Configuration">
            <Field label="Primary Role" error={form.formState.errors.primaryRole?.message} required><Select register={form.register("primaryRole")} options={roleOptions} /></Field>
            <Field label="Department"><Select register={form.register("departmentId")} options={departmentOptions} /></Field>
            <Field label="Clinic Access" error={form.formState.errors.clinicId?.message} required><Select register={form.register("clinicId")} options={clinicOptions} /></Field>
            <Field label="Data Access Level"><Select register={form.register("dataAccessLevel")} options={dataAccessLevelOptions} /></Field>
            <Field label="Access Expiration Date"><input type="date" {...form.register("accessExpiresAt")} className={inputClass} /></Field>
            <Field label="Additional Role" error={form.formState.errors.additionalRole?.message}>
              <select {...form.register("additionalRole")} className={inputClass}>
                <option value="none">None</option>
                {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </Section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#0F2A5F]"><ShieldAlert size={16} />3. AI Clinical Engine Access</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="AI Access Level" error={form.formState.errors.aiAccessLevel?.message}><Select register={form.register("aiAccessLevel")} options={aiAccessLevelOptions} /></Field>
              <Field label="Permission Template"><Select register={form.register("permissionTemplate")} options={permissionTemplateOptions} /></Field>
            </div>
            <div className={`mt-3 rounded-xl border p-3 text-sm font-bold ${compatible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`} role={compatible ? "status" : "alert"}>
              {getRoleAiCompatibilityMessage(role, aiAccessLevel)}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-600">AI remains Decision Support, not Decision Maker.</p>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={onDraft} className="rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Save as Draft</Button>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</Button>
            <Button type="submit" disabled={pending || !compatible || !form.formState.isValid} className="inline-flex items-center gap-2 rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              <UserPlus size={16} aria-hidden="true" />
              {pending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 text-sm font-black text-[#0F2A5F]">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  const errorId = `${label.toLowerCase().replaceAll(" ", "-")}-error`;
  return (
    <label className="block text-sm font-black text-slate-700">
      {label} {required ? <span className="text-red-700">*</span> : null}
      <span className="mt-1 block">{children}</span>
      {error ? <span id={errorId} className="mt-1 block text-xs font-bold text-red-700">{error}</span> : null}
    </label>
  );
}

function Select({ register, options }: { register: UseFormRegisterReturn; options: { value: string; label: string }[] }) {
  return (
    <select {...register} className={inputClass}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

const inputClass = "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
