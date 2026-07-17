"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { AlertTriangle, CheckCircle2, ChevronRight, Circle, Eye, EyeOff, Info, KeyRound, Loader2, LockKeyhole, MonitorSmartphone, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userManagementService } from "../services/user-management-service";
import type { ClinicUser } from "../types/user-management.types";
import { changePasswordRequirements, changePasswordSchema, type ChangePasswordFormValues } from "../schemas/change-password-schema";
import { SideNav, TopNav } from "./user-detail-workspace";

interface ChangePasswordWorkspaceProps {
  userId: string;
}

type LoadState = "loading" | "ready" | "error";
type SubmitState = "idle" | "success" | "error";

const defaults: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  signOutOtherSessions: true,
};

export function ChangePasswordWorkspace({ userId }: ChangePasswordWorkspaceProps) {
  const [user, setUser] = useState<ClinicUser | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: defaults,
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
  });
  const {
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = form;

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";
  const passedCount = changePasswordRequirements.filter((item) => item.test(newPassword)).length;
  const strength = useMemo(() => getPasswordStrength(passedCount), [passedCount]);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const found = await userManagementService.getClinicUserById(userId);
        if (!mounted) return;
        if (!found) {
          setLoadState("error");
          return;
        }
        setUser(found);
        setLoadState("ready");
      } catch {
        if (mounted) setLoadState("error");
      }
    }
    void loadUser();
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function submit(values: ChangePasswordFormValues) {
    setSubmitState("idle");
    await new Promise((resolve) => window.setTimeout(resolve, 700));

    if (values.currentPassword.toLowerCase().includes("wrong")) {
      setError("currentPassword", { message: "ไม่สามารถยืนยันรหัสผ่านปัจจุบันได้ กรุณาลองอีกครั้ง" });
      setSubmitState("error");
      setFocus("currentPassword");
      return;
    }

    reset(defaults);
    setSubmitState("success");
  }

  function cancel() {
    if (isDirty) {
      setShowCancelDialog(true);
      return;
    }
    reset(defaults);
  }

  const disableSubmit = !isDirty || !isValid || isSubmitting;
  const displayUser = user ?? {
    fullName: "Loading user",
    initials: "MX",
    employeeId: userId,
    jobTitle: "Account user",
    departmentName: "User Management",
    status: "active",
    mfaEnabled: false,
    security: { activeSessions: 0, failedAttempts: 0, currentSession: "", browserDevice: "", location: "", maskedIpAddress: "Masked", mfaVerified: false },
    auditTrail: [],
  };

  return (
    <div className="min-h-dvh w-full bg-background pb-28 font-sans text-foreground">
      <TopNav />
      <SideNav />
      <main className="min-w-0 px-4 pt-20 md:ml-64 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="font-medium text-[#00236f]" href="/admin/users">User Management</Link>
          <ChevronRight className="h-4 w-4 text-[#444651]" />
          <Link className="font-medium text-[#00236f]" href={`/admin/users/${userId}`}>User Detail</Link>
          <ChevronRight className="h-4 w-4 text-[#444651]" />
          <span className="text-[#444651]">Security</span>
          <ChevronRight className="h-4 w-4 text-[#444651]" />
          <span className="font-bold text-[#191c1e]">Reset User Password</span>
        </nav>

        <UserSecurityHeader user={displayUser as ClinicUser} />
        <Tabs userId={userId} />

        {loadState === "loading" ? <LoadingPanel /> : null}
        {loadState === "error" ? <ErrorPanel /> : null}

        {loadState === "ready" && user ? (
          <>
            <section className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[#191c1e]">Reset User Password</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ba1a1a]">
                    <LockKeyhole className="h-3.5 w-3.5" /> Security Sensitive Action
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">อัปเดตรหัสผ่านเพื่อรักษาความปลอดภัยของบัญชีและข้อมูลทางการแพทย์</p>
              </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <section className="space-y-6 lg:col-span-8">
                <form onSubmit={handleSubmit(submit)} className="overflow-hidden rounded-lg border border-[#c5c5d3] bg-white shadow-sm" noValidate>
                  <div className="border-b border-[#c5c5d3] bg-white px-6 py-4">
                    <h2 className="text-lg font-bold text-[#00236f]">Password Credentials</h2>
                  </div>
                  <div className="space-y-6 p-6 lg:p-8">
                    <div className="flex gap-4 rounded-lg border border-blue-100 bg-[#EFF6FF] p-4">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-[#0F172A]">Authentication Required</p>
                        <p className="text-[#64748B]">Recent authentication may be required before backend password update. กรุณาเตรียม MFA device ให้พร้อม</p>
                      </div>
                    </div>

                    {submitState === "success" ? <StatusBanner tone="success" text="User password reset. Password fields were cleared and other-session preference is ready for backend enforcement." /> : null}
                    {submitState === "error" ? <StatusBanner tone="error" text="Password update could not be completed. ข้อมูลที่กรอกยังคงอยู่เพื่อให้แก้ไขได้" /> : null}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <PasswordInput id="current-password" label="Current Password" autoComplete="current-password" show={showCurrent} setShow={setShowCurrent} error={errors.currentPassword?.message} registration={register("currentPassword")} />
                      <div className="hidden md:block" />
                      <div>
                        <PasswordInput id="new-password" label="New Password" autoComplete="new-password" show={showNew} setShow={setShowNew} error={errors.newPassword?.message} registration={register("newPassword")} />
                        <div className="mt-3" id="password-strength">
                          <div className="mb-2 flex items-center justify-between text-xs font-bold">
                            <span className={strength.textClass}>{strength.label}</span>
                            <span className="text-[#64748B]">{strength.score}% Security</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                            {[0, 1, 2, 3].map((index) => <span key={index} className={`h-1 rounded-full ${index < passedCount ? strength.barClass : "bg-[#E2E8F0]"}`} />)}
                          </div>
                        </div>
                      </div>
                      <PasswordInput id="confirm-password" label="Confirm New Password" autoComplete="new-password" show={showConfirm} setShow={setShowConfirm} error={errors.confirmPassword?.message} registration={register("confirmPassword")} />
                    </div>

                    <ul className="grid grid-cols-1 gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5 md:grid-cols-2" id="password-policy">
                      {changePasswordRequirements.map((item) => {
                        const met = item.test(newPassword);
                        return (
                          <li key={item.label} className={`flex items-center gap-3 text-xs font-semibold ${met ? "text-[#059669]" : "text-[#64748B]"}`}>
                            {met ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            {item.label}
                          </li>
                        );
                      })}
                    </ul>

                    <label className="flex items-center justify-between gap-4 rounded-lg border border-[#E2E8F0] bg-[#EFF6FF] p-4">
                      <span className="flex items-center gap-4">
                        <MonitorSmartphone className="h-5 w-5 text-[#1E3A8A]" />
                        <span>
                          <span className="block text-sm font-bold text-[#0F172A]">Sign out from all other devices</span>
                          <span className="block text-xs leading-5 text-[#64748B]">Ensure your account remains active only on this current session.</span>
                        </span>
                      </span>
                      <input type="checkbox" className="h-5 w-5 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#2563EB]" {...register("signOutOtherSessions")} />
                    </label>
                  </div>
                </form>
              </section>

              <aside className="space-y-6 lg:col-span-4">
                <AccountSecurityCard user={user} strength={strength.label} />
                <SecurityComplianceCard />
                <RecentActivity events={user.auditTrail} />
              </aside>
            </div>
          </>
        ) : null}
      </main>

      <div className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-between gap-4 border-t border-border bg-card px-4 py-4 md:left-64 md:flex-row ${isDirty ? "shadow-[0_-8px_24px_rgba(15,23,42,.08)]" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#EFF6FF]"><ShieldCheck className="h-4 w-4 text-[#1E3A8A]" /></div>
          <div><p className="text-sm font-bold">{isDirty ? "Unsaved password reset / ยังไม่ได้บันทึก" : "No password reset changes / ไม่มีข้อมูลที่รอบันทึก"}</p><p className="text-[11px] text-[#64748B]">Password values are never stored outside this form state.</p></div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Button type="button" onClick={cancel} className="flex-1 rounded-lg border border-[#c5c5d3] bg-white px-6 py-2 text-sm font-bold text-[#444651] hover:bg-[#EFF6FF] md:flex-none">Cancel</Button>
          <Button type="button" onClick={handleSubmit(submit)} disabled={disableSubmit} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#00236f] px-8 py-2 text-sm font-bold text-white hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-50 md:flex-none">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {isSubmitting ? "Resetting..." : "Reset User Password"}
          </Button>
        </div>
      </div>

      {showCancelDialog ? <CancelDialog onContinue={() => setShowCancelDialog(false)} onDiscard={() => { reset(defaults); setSubmitState("idle"); setShowCancelDialog(false); }} /> : null}
    </div>
  );
}

function PasswordInput({ id, label, autoComplete, show, setShow, error, registration }: { id: string; label: string; autoComplete: string; show: boolean; setShow: (value: boolean) => void; error?: string; registration: UseFormRegisterReturn; }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-xs font-bold text-[#0F172A]">{label}</span>
      <span className="relative block">
        <Input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder="••••••••••••" aria-invalid={error ? "true" : "false"} aria-describedby={error ? `${id}-error` : id === "new-password" ? "password-policy password-strength" : undefined} className={`h-12 pr-12 ${error ? "border-[#ba1a1a]" : ""}`} {...registration} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? `Hide ${label}` : `Show ${label}`} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? <span id={`${id}-error`} className="mt-2 block text-[12px] font-semibold leading-5 text-[#ba1a1a]">{error}</span> : null}
    </label>
  );
}

function UserSecurityHeader({ user }: { user: ClinicUser }) {
  return <section className="mb-8 flex flex-col justify-between gap-6 rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-sm md:flex-row md:items-center"><div className="flex items-start gap-5"><div className="grid h-16 w-16 place-items-center rounded-lg border border-[#c5c5d3] bg-[#EFF6FF] text-lg font-bold text-[#1E3A8A]">{user.initials}</div><div><div className="mb-1 flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold text-[#0F172A]">{user.fullName}</h2><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#059669]">{user.status}</span>{user.mfaEnabled ? <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-[#EFF6FF] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2563EB]"><ShieldCheck className="h-3 w-3" /> MFA Enabled</span> : null}</div><p className="text-sm text-[#64748B]">{user.jobTitle ?? "Clinical User"} • Employee ID: {user.employeeId}</p></div></div><div className="flex gap-10 md:border-l md:border-[#c5c5d3] md:pl-8"><MetaStat label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Today, 08:42 AM"} /><MetaStat label="Security Score" value="92/100" tone="success" /></div></section>;
}

function Tabs({ userId }: { userId: string }) {
  return <nav className="mb-6 flex gap-6 overflow-x-auto border-b border-[#c5c5d3]" aria-label="User detail tabs">{[["General Profile", `/admin/users/${userId}`], ["Permissions", `/admin/users/${userId}`], ["Security", `/admin/users/${userId}/security/change-password`], ["Access Logs", `/admin/users/${userId}`]].map(([label, href]) => <Link key={label} href={href} className={`whitespace-nowrap px-2 py-3 text-sm font-bold ${label === "Security" ? "border-b-2 border-[#00236f] text-[#00236f]" : "text-[#64748B] hover:text-[#00236f]"}`}>{label}</Link>)}</nav>;
}

function MetaStat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return <div className="text-center"><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</p><p className={`text-sm font-bold ${tone === "success" ? "text-[#059669]" : "text-[#0F172A]"}`}>{value}</p></div>;
}

function AccountSecurityCard({ user, strength }: { user: ClinicUser; strength: string }) {
  return <section className="rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-sm"><h2 className="mb-6 text-lg font-bold">Account Security</h2><div className="mb-6 flex items-center justify-between rounded-lg border border-blue-100 bg-[#EFF6FF] p-4"><div className="flex items-center gap-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1E3A8A] shadow-sm"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Security Score</p><p className="text-2xl font-bold text-[#1E3A8A]">92<span className="text-sm text-[#64748B]">/100</span></p></div></div><TrendingUp className="h-5 w-5 text-[#059669]" /></div><dl className="space-y-4"><Row label="Status" value={user.status} tone="success" /><Row label="Password Strength" value={strength} tone={strength === "Strong Password" ? "success" : "warning"} /><Row label="Last Changed" value="17 Jul 2026" /><Row label="MFA Status" value={user.security.mfaVerified ? "Verified" : "Pending"} tone={user.security.mfaVerified ? "info" : "warning"} /></dl></section>;
}

function SecurityComplianceCard() {
  return <section className="rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Security & Compliance</h2><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#1E3A8A]" /><div><p className="text-sm font-semibold">PDPA-aware password handling</p><p className="text-xs leading-5 text-[#64748B]">Password activities must be audited server-side without storing password values.</p></div></div><ul className="mt-4 space-y-3 pl-7 text-xs leading-5 text-[#64748B]"><li>Passwords are never stored in client storage or logs.</li><li>Access is restricted to authorized personnel only. จำกัดเฉพาะผู้มีสิทธิ์</li><li>Backend must enforce recent authentication and session revocation.</li></ul></section>;
}

function RecentActivity({ events }: { events: ClinicUser["auditTrail"] }) {
  const activity = events.slice(0, 3);
  return <section className="rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-sm"><h2 className="mb-6 text-lg font-bold">Recent Security Activity</h2><div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[#E2E8F0] before:content-['']">{activity.length ? activity.map((event) => <div key={event.id} className="relative pl-8"><span className="absolute left-0 top-1 grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-blue-200 bg-white"><span className="h-2 w-2 rounded-full bg-[#1E3A8A]" /></span><p className="text-sm font-bold leading-tight">{event.event}</p><p className="mb-1 text-[11px] text-[#64748B]">{new Date(event.occurredAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p><p className="text-xs text-[#64748B]">{event.source} • {event.result}</p></div>) : <p className="text-sm text-[#64748B]">ยังไม่พบ Security Activity ล่าสุด</p>}</div><button type="button" className="mt-6 w-full py-2 text-xs font-bold text-[#00236f] hover:underline">View All Activity History</button></section>;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "info" }) {
  const color = tone === "success" ? "text-[#059669]" : tone === "warning" ? "text-[#D97706]" : tone === "info" ? "text-[#2563EB]" : "text-[#0F172A]";
  return <div className="flex items-center justify-between"><dt className="text-sm text-[#64748B]">{label}</dt><dd className={`text-sm font-bold capitalize ${color}`}>{value}</dd></div>;
}

function StatusBanner({ tone, text }: { tone: "success" | "error"; text: string }) {
  return <div role="status" className={`flex gap-3 rounded-lg border p-4 text-sm ${tone === "success" ? "border-emerald-200 bg-emerald-50 text-[#047857]" : "border-red-200 bg-red-50 text-[#ba1a1a]"}`}>{tone === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}<span>{text}</span></div>;
}

function LoadingPanel() {
  return <section className="grid min-h-[420px] place-items-center rounded-lg border border-[#c5c5d3] bg-white"><div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-[#1E3A8A]" /><p className="mt-4 text-sm font-bold">Loading security profile</p><p className="mt-2 text-sm text-[#64748B]">กำลังโหลดข้อมูลบัญชีอย่างปลอดภัย</p></div></section>;
}

function ErrorPanel() {
  return <section className="rounded-lg border border-red-200 bg-red-50 p-6"><h1 className="text-lg font-bold text-[#ba1a1a]">Unable to load user security profile</h1><p className="mt-2 text-sm text-[#64748B]">กรุณาตรวจสอบสิทธิ์การเข้าถึงหรือกลับไปที่ User Management</p></section>;
}

function CancelDialog({ onContinue, onDiscard }: { onContinue: () => void; onDiscard: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#191c1e]/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="cancel-password-title" className="w-full max-w-md rounded-lg border border-[#c5c5d3] bg-white p-6 shadow-xl"><h2 id="cancel-password-title" className="text-lg font-bold">Discard password reset?</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">ข้อมูลรหัสผ่านที่กรอกไว้จะถูกล้างออกจากฟอร์มทันที</p><div className="mt-5 flex justify-end gap-3"><Button type="button" onClick={onContinue} className="rounded-lg border border-[#c5c5d3] bg-white px-4 py-2 text-sm font-bold text-[#444651] hover:bg-[#EFF6FF]">Continue Editing</Button><Button type="button" onClick={onDiscard} className="rounded-lg bg-[#ba1a1a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9f1717]">Discard Reset</Button></div></section></div>;
}

function getPasswordStrength(count: number) {
  if (count >= 4) return { label: "Strong Password", score: 100, textClass: "text-[#059669]", barClass: "bg-[#059669]" };
  if (count >= 3) return { label: "Good Password", score: 75, textClass: "text-[#2563EB]", barClass: "bg-[#2563EB]" };
  if (count >= 2) return { label: "Improving Password", score: 50, textClass: "text-[#D97706]", barClass: "bg-[#D97706]" };
  return { label: "Weak Password", score: 25, textClass: "text-[#ba1a1a]", barClass: "bg-[#ba1a1a]" };
}
