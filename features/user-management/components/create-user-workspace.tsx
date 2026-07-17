"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CreateUserForm } from "./create-user-form";
import { StickyActions } from "./sticky-actions";
import { UserSummary } from "./user-summary";
import { createUserSchema } from "../schemas/create-user-schema";
import { userManagementService } from "../services/user-management-service";
import type { CreateUserFormValues } from "../types/user-management.types";
import { getLocalIsoDate } from "../utils/create-user-utils";

const defaultValues: CreateUserFormValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  mobile: "",
  employeeId: "",
  jobTitle: "",
  licenseNumber: "",
  organizationId: "",
  clinicId: "",
  departmentId: "",
  locationId: "",
  additionalClinics: [],
  accessScope: "primary_clinic",
  primaryRole: "",
  additionalRoles: [],
  permissionTemplate: "role_recommended",
  customPermissions: [],
  privilegedReason: "",
  aiEnabled: false,
  aiPermissionLevels: {
    clinical_summary: "no_access",
    icd_suggestion: "no_access",
    differential_support: "no_access",
    prescription_safety: "no_access",
    claim_readiness: "no_access",
    missing_evidence: "no_access",
    insurance_rule_validation: "no_access",
    economic_intelligence: "no_access",
    evidence_package_generation: "no_access",
  },
  patientDataAccess: "assigned_cases",
  clinicalRecordAccess: ["view"],
  claimDataAccess: [],
  auditLogAccess: "own_activity",
  exportPermissions: ["no_export"],
  accountStatus: "invited",
  authenticationMethod: "email_password",
  sessionTimeout: "30",
  language: "en",
  timezone: "Asia/Bangkok",
  effectiveDate: getLocalIsoDate(),
  expirationDate: "",
  requirePasswordChange: true,
  requireMfa: true,
  sendInvitation: true,
  inviteLanguage: "en",
  inviteExpiry: "168",
  welcomeMessage: "",
  loginRestriction: "standard",
  ipRestriction: "",
  temporaryAccess: false,
  securityNotification: true,
  lockOnRiskDetection: true,
  scheduleActivation: false,
  setTemporaryPassword: false,
  notifyAdministrator: true,
  acknowledgedAiSuggestion: false,
  permissionMatrix: {
    dashboard: ["view"],
    patient: [],
    visit: [],
    soap: [],
    ai_clinical: [],
    diagnosis: [],
    prescription: [],
    certificate: [],
    claim: [],
    evidence: [],
    insurance: [],
    economic: [],
    audit: [],
    users: [],
    settings: [],
  },
};

type ToastState = { title: string; tone: "success" | "error" | "info" };

export function CreateUserWorkspace() {
  const [saving, setSaving] = useState<"draft" | "create" | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
    mode: "onChange",
  });
  const watchedValues = useWatch({ control: form.control });
  const values: CreateUserFormValues = useMemo(
    () => ({
      ...defaultValues,
      ...watchedValues,
      aiPermissionLevels: { ...defaultValues.aiPermissionLevels, ...watchedValues.aiPermissionLevels },
      permissionMatrix: Object.fromEntries(Object.entries(defaultValues.permissionMatrix).map(([key, value]) => [key, watchedValues.permissionMatrix?.[key] ?? value])) as CreateUserFormValues["permissionMatrix"],
    }),
    [watchedValues],
  );
  const valid = form.formState.isValid;

  useEffect(() => {
    if (!form.formState.isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [form.formState.isDirty]);

  async function submit(mode: "draft" | "create") {
    try {
      setSaving(mode);
      if (mode === "draft") {
        await userManagementService.saveDraft(form.getValues());
      } else {
        await form.handleSubmit(async (submittedValues) => {
          await userManagementService.createUser(submittedValues);
        })();
      }
      setToast({ title: mode === "draft" ? "Draft saved\nบันทึกฉบับร่างเรียบร้อยแล้ว" : values.sendInvitation ? "User created successfully\nส่งคำเชิญไปยังอีเมลผู้ใช้งานแล้ว" : "User created successfully\nสร้างบัญชีผู้ใช้งานเรียบร้อยแล้ว", tone: "success" });
      form.reset(form.getValues());
    } catch {
      setToast({ title: "Unable to create user\nไม่สามารถสร้างผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง", tone: "error" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <main
      className="min-h-screen bg-[var(--nx-bg)] text-[var(--nx-text)]"
    >
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-5 md:px-8">
        <div className="mb-3 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-secondary)]">
          User Management <span className="px-2">&gt;</span><strong className="text-[var(--nx-primary)]">Add User</strong>
        </div>
        <header className="mb-5 flex flex-col justify-between gap-4 border-b border-[var(--nx-border)] pb-4 xl:flex-row">
          <div>
            <h1 className="font-['Inter'] text-[32px] font-bold leading-[40px] text-[var(--nx-text)]">Add User</h1>
            <p className="mt-1 max-w-4xl font-['Inter'] text-[15px] leading-6 text-[var(--nx-secondary)]">Create a secure account with role, scope, AI governance, and audit-ready permissions. เพิ่มผู้ใช้งานใหม่โดยยึดหลัก Least Privilege และ Human-in-the-Loop</p>
            <p className="mt-2 rounded-full bg-[var(--nx-info-bg)] px-3 py-1 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-primary)]">Administrative scope: Organization Admin / Bangkok Medical Network / users.create</p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <button type="button" onClick={() => history.back()} className="min-h-10 rounded-lg border border-[var(--nx-focus)] bg-[var(--nx-surface)] px-4 font-['Inter'] text-[14px] font-semibold leading-5 text-[var(--nx-primary)] hover:bg-[var(--nx-info-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Cancel</button>
            <button type="button" disabled={Boolean(saving)} onClick={() => void submit("create")} className="min-h-10 rounded-lg bg-[var(--nx-primary)] px-4 font-['Inter'] text-[14px] font-semibold leading-5 text-white hover:bg-[var(--nx-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)] disabled:opacity-50">{saving === "create" ? "Creating..." : "Create User"}</button>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <CreateUserForm form={form} />
          <UserSummary values={values} />
        </div>
      </div>
      <StickyActions dirty={form.formState.isDirty} saving={saving} sendInvitation={values.sendInvitation} createDisabled={!valid || Boolean(saving)} onDraft={() => void submit("draft")} onCreate={() => void submit("create")} />
      {toast ? <Toast title={toast.title} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </main>
  );
}

function Toast({ title, tone, onClose }: ToastState & { onClose: () => void }) {
  const classes = tone === "error" ? "border-[color:color-mix(in_srgb,var(--danger)_24%,white)] bg-[var(--nx-danger-bg)] text-danger" : tone === "success" ? "border-[color:color-mix(in_srgb,var(--success)_24%,white)] bg-[var(--nx-success-bg)] text-success" : "border-[var(--nexsure-blue-border)] bg-soft-background text-primary";
  return (
    <div className={`fixed bottom-24 right-5 z-[80] max-w-md rounded-xl border p-4 text-sm font-semibold shadow-sm ${classes}`} role="status">
      <div className="flex items-start justify-between gap-4">
        <span>{title}</span>
        <button type="button" onClick={onClose} className="font-black focus:outline-none focus:ring-2 focus:ring-ring-strong">Close</button>
      </div>
    </div>
  );
}
