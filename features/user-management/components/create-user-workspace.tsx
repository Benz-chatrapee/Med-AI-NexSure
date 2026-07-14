"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
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
  accessScope: "own_clinic",
  primaryRole: "",
  additionalRoles: [],
  accountStatus: "invited",
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
  const values = useMemo(() => ({ ...defaultValues, ...watchedValues }), [watchedValues]);

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
      setToast({ title: mode === "draft" ? "Draft saved successfully" : "User created successfully", tone: "success" });
      form.reset(form.getValues());
    } catch {
      setToast({ title: "Unable to save user. Please review required fields and try again.", tone: "error" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto max-w-[1760px] px-4 pb-32 pt-6 lg:px-7">
        <div className="mb-3 text-sm text-slate-500">
          User Management <span className="px-2">&gt;</span><strong className="text-blue-800">New User</strong>
        </div>
        <header className="mb-6 flex flex-col justify-between gap-4 xl:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create New User</h1>
            <p className="mt-2 text-slate-500">สร้างบัญชีผู้ใช้ใหม่ พร้อมกำหนด Role, Access Scope และ AI Permission ตามนโยบายองค์กร</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">Role-based Access</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">Enterprise Intelligence</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">Audit Ready</span>
          </div>
        </header>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <CreateUserForm form={form} />
          <UserSummary values={values} />
        </div>
      </div>
      <StickyActions dirty={form.formState.isDirty} saving={saving} sendInvitation={values.sendInvitation} onDraft={() => void submit("draft")} onCreate={() => void submit("create")} />
      {toast ? <Toast title={toast.title} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </main>
  );
}

function Toast({ title, tone, onClose }: ToastState & { onClose: () => void }) {
  const classes = tone === "error" ? "border-red-200 bg-red-50 text-red-800" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800";
  return (
    <div className={`fixed bottom-24 right-5 z-[80] max-w-md rounded-2xl border p-4 text-sm font-bold shadow-xl ${classes}`} role="status">
      <div className="flex items-start justify-between gap-4">
        <span>{title}</span>
        <button type="button" onClick={onClose} className="font-black focus:outline-none focus:ring-2 focus:ring-blue-500">Close</button>
      </div>
    </div>
  );
}
