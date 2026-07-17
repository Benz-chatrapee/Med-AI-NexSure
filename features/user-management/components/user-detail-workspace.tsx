"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeftRight, Bell, Camera, ChevronRight, Contact, HelpCircle, LogOut, Mail, PersonStanding, Phone, Save, Settings, Shield, Stethoscope, UserCog, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { userDetailEditSchema, type UserDetailEditFormValues } from "../schemas/user-detail-schema";

interface UserDetailWorkspaceProps {
  userId: string;
}

const departments = ["Oncology", "Cardiology", "Pediatrics", "General Medicine", "Administration"];
const languages = ["English (US)", "Thai (TH)", "Mandarin", "Japanese"] as const;
const clinics = ["Bangkok Central Medical", "Sukhumvit Specialist Center", "Thonburi Health Hub"] as const;
const roleCards = [
  ["Clinical Practitioner", "Full patient record access & diagnostics"],
  ["AI Data Reviewer", "Permission to validate AI clinical models"],
  ["System Admin", "Restricted to organization managers only"],
] as const;

const defaultValues: UserDetailEditFormValues = {
  firstName: "Ananya",
  lastName: "Srisuk",
  displayName: "Dr. Ananya Srisuk",
  employeeId: "NEX-8821",
  department: "Oncology",
  email: "ananya.s@medai-nexsure.com",
  phone: "+66 81 234 5678",
  preferredLanguage: "Thai (TH)",
  defaultClinic: "Bangkok Central Medical",
  accountStatus: true,
  assignedClinics: ["Bangkok Central Medical", "Sukhumvit Specialist Center"],
  assignedRoles: ["Clinical Practitioner", "AI Data Reviewer"],
};

export function UserDetailWorkspace({ userId }: UserDetailWorkspaceProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const form = useForm<UserDetailEditFormValues>({ resolver: zodResolver(userDetailEditSchema), defaultValues, mode: "onBlur" });
  const { register, handleSubmit, setValue, control, formState: { errors, isDirty, isSubmitting } } = form;
  const assignedClinics = useWatch({ control, name: "assignedClinics" });
  const assignedRoles = useWatch({ control, name: "assignedRoles" });
  const accountStatus = useWatch({ control, name: "accountStatus" });
  const formName = useWatch({ control, name: "displayName" }) || "Dr. Ananya Srisuk";

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  async function save(values: UserDetailEditFormValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    form.reset(values);
    setIsEditing(false);
    flash("Saved changes / บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว");
  }

  function cancelEdit() {
    if (isDirty) {
      setShowUnsavedDialog(true);
      return;
    }
    form.reset(defaultValues);
    setIsEditing(false);
  }

  function removeClinic(clinic: string) {
    setValue("assignedClinics", assignedClinics.filter((item) => item !== clinic), { shouldDirty: true, shouldValidate: true });
  }

  function toggleRole(role: string, checked: boolean) {
    setValue("assignedRoles", checked ? [...assignedRoles, role] : assignedRoles.filter((item) => item !== role), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="min-h-dvh w-full bg-background pb-24 font-sans text-foreground">
      <TopNav />
      <SideNav />
      <main className="min-w-0 px-4 pt-20 md:ml-64">
        <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="font-medium text-[#00236f]" href="/admin/users">User Management</Link>
          <ChevronRight className="h-4 w-4 text-[#444651]" />
          <span className="text-[#444651]">{formName}</span>
          <ChevronRight className="h-4 w-4 text-[#444651]" />
          <span className="font-bold text-[#191c1e]">{isEditing ? "Edit Profile" : "View Profile"}</span>
        </nav>

        <form onSubmit={handleSubmit(save)} className="flex flex-col items-start gap-8 lg:flex-row">
          <aside className="flex w-full flex-col gap-6 lg:w-1/3">
            <section className="flex flex-col items-center rounded-lg border border-[#c5c5d3] bg-white p-8 text-center">
              <div className="group relative mx-auto mb-4 w-32">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[#1e3a8a] bg-[#dce1ff]">
                  <div className="grid h-full w-full place-items-center text-4xl font-bold text-[#00236f]">AS</div>
                </div>
                <button type="button" onClick={() => flash("Avatar upload is unavailable in prototype mode")} className="absolute bottom-1 right-1 rounded-full bg-[#00236f] p-2 text-white shadow-lg transition hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" aria-label="Change profile photo">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h1 className="text-2xl font-semibold leading-8 text-[#191c1e]">{formName}</h1>
              <p className="mb-4 text-sm text-[#444651]">Senior Oncologist • ID: NEX-8821</p>
              <div className="mb-4 h-px w-full bg-[#c5c5d3]" />
              <div className="flex items-center justify-between text-left text-sm">
                <span className="text-[#444651]">Account Status</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" checked={accountStatus} onChange={(event) => setValue("accountStatus", event.target.checked, { shouldDirty: true })} disabled={!isEditing} />
                  <span className="h-6 w-11 rounded-full bg-[#e0e3e5] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#00236f] peer-checked:after:translate-x-full peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-[#2563EB]" />
                  <span className="ml-3 font-medium text-[#191c1e]">{accountStatus ? "Active" : "Inactive"}</span>
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-[#c5c5d3] bg-[#f2f4f6] p-6">
              <h2 className="text-lg font-bold">System Metadata</h2>
              <Meta label="USER ID" value={userId === "user-001" || userId === "USR-2026-00428" ? userId : "USR_ANANYA_8821_S7"} mono />
              <Meta label="CREATED DATE" value="October 14, 2022 • 09:12 AM" />
              <Meta label="LAST LOGIN" value="Today • 08:45 AM (Bangkok Time)" />
            </section>
          </aside>

          <section className="w-full space-y-6 lg:w-2/3">
            <Panel icon={<UserRound className="h-5 w-5" />} title="Personal Information">
              <Field label="First Name" error={errors.firstName?.message}><input readOnly={!isEditing} className={inputClass(errors.firstName?.message)} {...register("firstName")} /></Field>
              <Field label="Last Name" error={errors.lastName?.message}><input readOnly={!isEditing} className={inputClass(errors.lastName?.message)} {...register("lastName")} /></Field>
              <Field label="Display Name" error={errors.displayName?.message} wide><input readOnly={!isEditing} className={inputClass(errors.displayName?.message)} {...register("displayName")} /></Field>
              <Field label="Employee ID" error={errors.employeeId?.message}><input readOnly={!isEditing} className={inputClass(errors.employeeId?.message)} {...register("employeeId")} /></Field>
              <Field label="Department" error={errors.department?.message}>
                <select disabled={!isEditing} className={inputClass(errors.department?.message)} {...register("department")}>{departments.map((item) => <option key={item}>{item}</option>)}</select>
              </Field>
            </Panel>

            <Panel icon={<Contact className="h-5 w-5" />} title="Contact & Preferences">
              <Field label="Email Address" error={errors.email?.message}><IconInput icon={<Mail className="h-4 w-4" />}><input readOnly={!isEditing} className={inputClass(errors.email?.message, "pl-10")} type="email" {...register("email")} /></IconInput></Field>
              <Field label="Phone Number" error={errors.phone?.message}><IconInput icon={<Phone className="h-4 w-4" />} tone={errors.phone ? "danger" : "muted"}><input readOnly={!isEditing} className={inputClass(errors.phone?.message, "pl-10")} type="tel" {...register("phone")} /></IconInput></Field>
              <Field label="Preferred Language" error={errors.preferredLanguage?.message}>
                <select disabled={!isEditing} className={inputClass(errors.preferredLanguage?.message)} {...register("preferredLanguage")}>{languages.map((item) => <option key={item}>{item}</option>)}</select>
              </Field>
              <Field label="Default Clinic" error={errors.defaultClinic?.message}>
                <select disabled={!isEditing} className={inputClass(errors.defaultClinic?.message)} {...register("defaultClinic")}>{clinics.map((item) => <option key={item}>{item}</option>)}</select>
              </Field>
            </Panel>

            <Panel icon={<Shield className="h-5 w-5" />} title="Access Control" single>
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.05em] text-[#64748B]">Assigned Clinics (Multi-select)</label>
                <div className="flex flex-wrap gap-2">
                  {assignedClinics.map((clinic) => <span key={clinic} className="inline-flex items-center gap-2 rounded-full border border-[#00236f]/20 bg-[#1e3a8a] px-3 py-1 text-sm font-medium text-[#90a8ff]">{clinic}<button type="button" onClick={() => removeClinic(clinic)} className="rounded-full hover:text-[#00236f] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" aria-label={`Remove ${clinic}`}>x</button></span>)}
                  <button type="button" onClick={() => setValue("assignedClinics", [...assignedClinics, "Thonburi Health Hub"], { shouldDirty: true, shouldValidate: true })} className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#c5c5d3] px-3 py-1 text-sm text-[#444651] transition hover:bg-[#f2f4f6] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">+ Add Clinic</button>
                </div>
                {errors.assignedClinics?.message ? <p className="mt-1 text-[10px] font-semibold text-[#ba1a1a]">{errors.assignedClinics.message}</p> : null}
              </div>
              <div className="mt-6">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.05em] text-[#444651]">Assigned Roles</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {roleCards.map(([role, helper]) => {
                    const disabled = role === "System Admin";
                    return <label key={role} className={`flex cursor-pointer items-start gap-3 rounded-lg border border-[#c5c5d3] p-3 transition hover:bg-[#f2f4f6] ${disabled ? "opacity-50" : ""}`}>
                      <input type="checkbox" checked={assignedRoles.includes(role)} disabled={disabled || !isEditing} onChange={(event) => toggleRole(role, event.target.checked)} className="mt-1 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]" />
                      <span><span className="block text-sm font-bold">{role}</span><span className="text-[11px] text-[#444651]">{helper}</span></span>
                    </label>;
                  })}
                </div>
                {errors.assignedRoles?.message ? <p className="mt-1 text-[10px] font-semibold text-[#ba1a1a]">{errors.assignedRoles.message}</p> : null}
              </div>
            </Panel>
          </section>
        </form>
      </main>

      <div className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-between gap-4 border-t border-border bg-card px-4 py-4 md:left-64 md:flex-row ${isDirty ? "shadow-[0_-8px_24px_color-mix(in_srgb,var(--foreground)_5%,transparent)]" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-soft-background"><ArrowLeftRight className="h-4 w-4 text-primary" /></div>
          <div><p className="text-sm font-bold text-foreground">{isDirty ? "Unsaved changes / การเปลี่ยนแปลงยังไม่ได้บันทึก" : "No unsaved changes / ไม่มีข้อมูลที่รอบันทึก"}</p><p className="text-[11px] text-muted-foreground">Last autosaved 2m ago</p></div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button type="button" onClick={cancelEdit} className="flex-1 rounded-lg border border-border px-6 py-2 text-sm font-bold text-muted-foreground transition hover:bg-soft-background focus:outline-none focus:ring-2 focus:ring-ring-strong active:scale-95 md:flex-none">Cancel</button>
          <button type="button" onClick={handleSubmit(save)} disabled={!isDirty || isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2 text-sm font-bold text-primary-foreground transition hover:bg-deep-blue focus:outline-none focus:ring-2 focus:ring-ring-strong active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"><Save className="h-4 w-4" />{isSubmitting ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>

      {showUnsavedDialog ? <UnsavedDialog onCancel={() => setShowUnsavedDialog(false)} onDiscard={() => { form.reset(defaultValues); setIsEditing(false); setShowUnsavedDialog(false); }} /> : null}
      {toast ? <div role="status" className="fixed right-6 top-20 z-[60] rounded bg-[#2d3133] px-6 py-3 text-sm text-[#eff1f3] shadow-xl">{toast}</div> : null}
    </div>
  );
}

function TopNav() {
  return <header className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm"><span className="text-lg font-bold text-primary">Med AI NexSure</span><div className="flex items-center gap-2"><button aria-label="Notifications" className="rounded-full p-2 transition-colors hover:bg-soft-background focus:outline-none focus:ring-2 focus:ring-ring-strong"><Bell className="h-5 w-5 text-muted-foreground" /></button><button aria-label="Settings" className="rounded-full p-2 transition-colors hover:bg-soft-background focus:outline-none focus:ring-2 focus:ring-ring-strong"><Settings className="h-5 w-5 text-muted-foreground" /></button><div className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-soft-background text-xs font-bold text-primary">BC</div></div></header>;
}

function SideNav() {
  const items = [["dashboard", "Dashboard"], ["person_search", "Patients"], ["psychology", "AI Clinical"], ["manage_accounts", "User Management"], ["settings", "Settings"]];
  return <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-sidebar-border bg-sidebar pt-14 md:flex"><div className="border-b border-sidebar-border p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">MX</div><div><div className="text-sm font-bold text-sidebar-foreground">Med AI NexSure</div><div className="text-[10px] font-semibold uppercase tracking-wider text-nav-foreground">Enterprise Admin</div></div></div></div><nav className="flex-1 py-4">{items.map(([icon, label]) => {
    const active = label === "User Management";
    return <a key={label} href={active ? "/admin/users" : "#"} className={`flex items-center gap-3 px-6 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring-strong ${active ? "border-l-4 border-accent bg-nav-active font-bold text-nav-active-foreground" : "text-nav-foreground hover:bg-nav-hover hover:text-nav-active-foreground"}`}><span className={active ? "text-nav-active-icon" : "text-nav-foreground"}><SidebarIcon name={icon} /></span><span className="text-xs font-semibold uppercase tracking-[0.05em]">{label}</span></a>;
  })}</nav><div className="border-t border-sidebar-border p-4"><button className="flex w-full items-center justify-between rounded p-2 text-sm font-medium text-nav-foreground hover:bg-nav-hover hover:text-nav-active-foreground focus:outline-none focus:ring-2 focus:ring-ring-strong">Switch Org<ArrowLeftRight className="h-4 w-4" /></button><a className="mt-4 flex items-center gap-3 rounded px-2 py-2 text-sm text-nav-foreground hover:bg-nav-hover hover:text-nav-active-foreground" href="#"><HelpCircle className="h-4 w-4" /> Help Center</a><a className="flex items-center gap-3 rounded px-2 py-2 text-sm text-danger hover:bg-[var(--nx-danger-bg)]" href="#"><LogOut className="h-4 w-4" /> Logout</a></div></aside>;
}

function SidebarIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = { dashboard: <Settings className="h-5 w-5" />, person_search: <PersonStanding className="h-5 w-5" />, psychology: <Stethoscope className="h-5 w-5" />, manage_accounts: <UserCog className="h-5 w-5" />, settings: <Settings className="h-5 w-5" /> };
  return icons[name];
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#444651]">{label}</p><p className={`${mono ? "font-mono text-sm font-medium" : "text-sm"} text-[#191c1e]`}>{value}</p></div>;
}

function Panel({ title, icon, children, single = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; single?: boolean }) {
  return <section className="overflow-hidden rounded-lg border border-[#c5c5d3] bg-white"><div className="border-b border-[#c5c5d3] bg-white px-6 py-4"><h2 className="flex items-center gap-2 text-lg font-bold text-[#191c1e]"><span className="text-[#00236f]">{icon}</span>{title}</h2></div><div className={single ? "p-6" : "grid grid-cols-1 gap-x-6 gap-y-4 p-6 md:grid-cols-2"}>{children}</div></section>;
}

function Field({ label, error, children, wide = false }: { label: string; error?: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`flex flex-col gap-1 ${wide ? "md:col-span-2" : ""}`}><span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#444651]">{label}</span>{children}{error ? <span className="text-[10px] font-semibold text-[#ba1a1a]">{error}</span> : null}</label>;
}

function IconInput({ icon, tone = "muted", children }: { icon: React.ReactNode; tone?: "muted" | "danger"; children: React.ReactNode }) {
  return <div className="relative"><span className={`absolute left-3 top-2.5 ${tone === "danger" ? "text-[#ba1a1a]" : "text-[#444651]"}`}>{icon}</span>{children}</div>;
}

function inputClass(error?: string, extra = "") {
  return `w-full rounded border ${error ? "border-[#ba1a1a]" : "border-[#c5c5d3]"} p-2 text-base leading-6 text-[#191c1e] focus:border-transparent focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2563EB] disabled:bg-[#f2f4f6] read-only:bg-[#f2f4f6] ${extra}`;
}

function UnsavedDialog({ onCancel, onDiscard }: { onCancel: () => void; onDiscard: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#191c1e]/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="unsaved-title" className="w-full max-w-md rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-xl"><h2 id="unsaved-title" className="text-lg font-bold text-[#191c1e]">Unsaved Changes</h2><p className="mt-2 text-sm leading-6 text-[#444651]">คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกและทิ้งข้อมูลหรือไม่</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg border border-[#c5c5d3] px-4 py-2 text-sm font-bold text-[#444651] hover:bg-[#e6e8ea] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">Continue Editing</button><button type="button" onClick={onDiscard} className="rounded-lg bg-[#ba1a1a] px-4 py-2 text-sm font-bold text-white hover:bg-[#ba1a1a]/90 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a] focus:ring-offset-2">Discard Changes</button></div></section></div>;
}
