"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AppWindow, Bell, Brain, Gavel, LayoutDashboard, Settings, Users, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CreateUserForm } from "./create-user-form";
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
type CreateUserStage = "form" | "review" | "success";

export function CreateUserWorkspace() {
  const [saving, setSaving] = useState<"draft" | "create" | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [stage, setStage] = useState<CreateUserStage>("form");
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
      if (mode === "create") setStage("success");
      form.reset(form.getValues());
    } catch {
      setToast({ title: "Unable to create user\nไม่สามารถสร้างผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง", tone: "error" });
    } finally {
      setSaving(null);
    }
  }

  async function requestReview() {
    const ready = await form.trigger();
    if (!ready) {
      setToast({ title: "Review required\nกรุณาตรวจสอบข้อมูลที่จำเป็นและเหตุผลของสิทธิ์ระดับสูง", tone: "error" });
      return;
    }
    setStage("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main
      className="min-h-screen bg-[var(--nx-bg)] text-[var(--nx-text)] lg:pl-[280px]"
    >
      <PrototypeSidebar />
      <PrototypeTopbar />
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-24 md:px-8">
        {stage === "review" ? (
          <ReviewState values={values} saving={saving} onBack={() => setStage("form")} onConfirm={() => void submit("create")} />
        ) : null}
        {stage === "success" ? <SuccessState values={values} onReset={() => setStage("form")} /> : null}
        <div className="flex flex-col gap-6 md:flex-row">
          <CreateUserForm form={form} />
          <UserSummary values={values} saving={saving} createDisabled={!valid || Boolean(saving)} onDraft={() => void submit("draft")} onCreate={() => void requestReview()} />
        </div>
      </div>
      {toast ? <Toast title={toast.title} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </main>
  );
}

function PrototypeSidebar() {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: false },
    { label: "User Management", icon: UserCog, active: true },
    { label: "Patients", icon: Users, active: false },
    { label: "AI Clinical Engine", icon: Brain, active: false },
    { label: "Insurance Intelligence", icon: AppWindow, active: false },
    { label: "Audit & Compliance", icon: Gavel, active: false },
    { label: "Organization Settings", icon: Settings, active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-[280px] flex-col bg-[var(--nx-primary)] px-4 py-6 shadow-lg lg:flex">
      <div className="mb-10 px-4">
        <h1 className="font-['Inter'] text-[28px] font-bold leading-8 text-white">Med AI<br />NexSure</h1>
        <p className="mt-1 font-['Inter'] text-[11px] uppercase tracking-[0.18em] text-white/60">Enterprise Intelligence</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href="#" className={`flex items-center gap-3 rounded-lg px-4 py-3 font-['Inter'] text-[14px] text-white transition-all ${item.active ? "bg-[color:color-mix(in_srgb,var(--nx-focus)_30%,var(--nx-primary))] opacity-100" : "opacity-70 hover:bg-white/10 hover:opacity-100"}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl bg-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--nx-focus)_35%,var(--nx-primary))] font-['Inter'] font-bold text-white">A</div>
          <div>
            <p className="font-['Inter'] text-[14px] font-semibold leading-5 text-white">Administrator</p>
            <p className="font-['Inter'] text-[12px] leading-4 text-white/50">Global Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PrototypeTopbar() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--nx-border)] bg-[var(--nx-surface)] px-4 shadow-sm lg:w-[calc(100%-280px)] lg:px-6">
      <nav className="flex items-center gap-2 font-['Inter'] text-[13px] font-semibold leading-5 text-[var(--nx-secondary)]">
        <span>User Management</span>
        <span aria-hidden="true">&gt;</span>
        <strong className="text-[var(--nx-primary)]">Add New User</strong>
      </nav>
      <div className="hidden items-center gap-6 md:flex">
        <div className="flex items-center gap-4 border-r border-[var(--nx-border)] pr-6 font-['Inter'] text-[14px] font-medium text-[var(--nx-secondary)]">
          <span>AI Copilot</span>
          <span>Help</span>
        </div>
        <div className="flex items-center gap-4 text-[var(--nx-secondary)]">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <AppWindow className="h-5 w-5" aria-hidden="true" />
          <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[color:color-mix(in_srgb,var(--nx-primary)_20%,white)] bg-[var(--nx-info-bg)] font-['Inter'] text-[12px] font-bold text-[var(--nx-primary)]">A</div>
        </div>
      </div>
    </header>
  );
}

function ReviewState({
  values,
  saving,
  onBack,
  onConfirm,
}: {
  values: CreateUserFormValues;
  saving: "draft" | "create" | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="mb-5 rounded-xl border border-[var(--nx-focus)] bg-[var(--nx-info-bg)] p-5 shadow-sm" aria-labelledby="access-review-title">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="font-['Inter'] text-[12px] font-semibold uppercase tracking-wide text-[var(--nx-ai)]">Review State</p>
          <h2 id="access-review-title" className="mt-1 font-['Inter'] text-[22px] font-bold leading-7 text-[var(--nx-text)]">Final Access Review</h2>
          <p className="mt-1 max-w-3xl font-['Inter'] text-[14px] leading-6 text-[var(--nx-secondary)]">
            Confirm least privilege, MFA, AI Human-in-the-Loop, and audit justification before creating this account. กรุณาตรวจสอบสิทธิ์และเหตุผลก่อนส่งคำเชิญ
          </p>
          <dl className="mt-4 grid gap-3 font-['Inter'] text-[13px] leading-5 sm:grid-cols-2 lg:grid-cols-4">
            <ReviewItem label="User" value={values.displayName || "Not entered"} />
            <ReviewItem label="Role" value={values.primaryRole ? values.primaryRole.replaceAll("_", " ") : "Not selected"} />
            <ReviewItem label="MFA" value={values.requireMfa ? "Enabled" : "Disabled"} />
            <ReviewItem label="Invitation" value={values.sendInvitation ? `Expires in ${values.inviteExpiry} hours` : "Not sent"} />
          </dl>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onBack} className="min-h-10 rounded-lg border border-[var(--nx-focus)] bg-white px-4 font-['Inter'] text-[14px] font-semibold text-[var(--nx-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Back to Edit</button>
          <button type="button" disabled={Boolean(saving)} onClick={onConfirm} className="min-h-10 rounded-lg bg-[var(--nx-primary)] px-4 font-['Inter'] text-[14px] font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)] disabled:opacity-50">{saving === "create" ? "Creating..." : "Confirm Create"}</button>
        </div>
      </div>
    </section>
  );
}

function SuccessState({ values, onReset }: { values: CreateUserFormValues; onReset: () => void }) {
  return (
    <section className="mb-5 rounded-xl border border-emerald-200 bg-[var(--nx-success-bg)] p-5 shadow-sm" role="status" aria-labelledby="create-user-success-title">
      <h2 id="create-user-success-title" className="font-['Inter'] text-[22px] font-bold leading-7 text-emerald-800">User Created Successfully</h2>
      <p className="mt-1 font-['Inter'] text-[14px] leading-6 text-emerald-900">
        {values.sendInvitation ? "Invitation has been prepared for the verified work email." : "Account was created without sending an invitation."} บันทึก audit metadata สำหรับการสร้างผู้ใช้งานแล้ว
      </p>
      <button type="button" onClick={onReset} className="mt-4 min-h-10 rounded-lg border border-emerald-300 bg-white px-4 font-['Inter'] text-[14px] font-semibold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">Continue Editing</button>
    </section>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--nx-border)] bg-white p-3">
      <dt className="text-[var(--nx-secondary)]">{label}</dt>
      <dd className="mt-1 font-semibold capitalize text-[var(--nx-text)]">{value}</dd>
    </div>
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
