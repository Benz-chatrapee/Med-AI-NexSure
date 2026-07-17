"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  passwordRequirements,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "./reset-password-schema";

type RecoveryState = "validating" | "ready" | "expired" | "success" | "error";

const SAFE_EXPIRED_MESSAGE =
  "ลิงก์ตั้งรหัสผ่านหมดอายุหรือไม่สามารถใช้งานได้ กรุณาขอลิงก์ใหม่อีกครั้ง";
const SAFE_UPDATE_ERROR =
  "ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง";

function getHashValue(name: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash).get(name);
}

export function ResetPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("validating");
  const [statusMessage, setStatusMessage] = useState("Validating secure recovery link...");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const firstPasswordRef = useRef<HTMLInputElement | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setFocus,
    control,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const passwordRegistration = register("password");
  const confirmPasswordRegistration = register("confirmPassword");
  const passedRequirementCount = passwordRequirements.filter((requirement) =>
    requirement.test(passwordValue),
  ).length;

  useEffect(() => {
    let isMounted = true;

    async function validateRecoverySession() {
      if (!supabase) {
        if (isMounted) {
          setRecoveryState("error");
          setStatusMessage("Authentication configuration is unavailable. กรุณาติดต่อผู้ดูแลระบบ");
        }
        return;
      }

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const accessToken = getHashValue("access_token");
        const refreshToken = getHashValue("refresh_token");
        const linkType = getHashValue("type") ?? url.searchParams.get("type");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw new Error("RECOVERY_EXCHANGE_FAILED");
          }
        } else if (accessToken && refreshToken && linkType === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            throw new Error("RECOVERY_SESSION_FAILED");
          }
        }

        window.history.replaceState(null, document.title, "/reset-password");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          throw new Error("RECOVERY_SESSION_MISSING");
        }

        if (isMounted) {
          setRecoveryState("ready");
          setStatusMessage("Recovery session verified. ตั้งรหัสผ่านใหม่ได้อย่างปลอดภัย");
          window.setTimeout(() => firstPasswordRef.current?.focus(), 0);
        }
      } catch {
        if (isMounted) {
          setRecoveryState("expired");
          setStatusMessage(SAFE_EXPIRED_MESSAGE);
        }
      }
    }

    void validateRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!supabase || recoveryState !== "ready") {
      setRecoveryState("expired");
      setStatusMessage(SAFE_EXPIRED_MESSAGE);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setStatusMessage(SAFE_UPDATE_ERROR);
      setFocus("password");
      return;
    }

    reset({ password: "", confirmPassword: "" });
    await supabase.auth.signOut({ scope: "local" });
    setRecoveryState("success");
    setStatusMessage("ตั้งรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
  }

  const showForm = recoveryState === "ready";
  const showLoading = recoveryState === "validating";
  const showExpired = recoveryState === "expired" || recoveryState === "error";
  const strengthLabel =
    passedRequirementCount >= 4 ? "Strong" : passedRequirementCount >= 2 ? "Improving" : "Required";

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(145deg,#F8FAFC_0%,#FFFFFF_48%,#EFF6FF_100%)] px-5 py-10 sm:px-7 lg:px-8 xl:px-10">
      <div className="absolute right-[-180px] top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-180px] left-[-160px] h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />

      <div className="card-up relative mx-auto w-full max-w-[440px]">
        <div className="mb-5 rounded-[24px] border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#2563EB]">
                Secure Password Reset
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                Create New Password
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold text-[#1E3A8A]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Protected
            </span>
          </div>
        </div>

        <div className="min-h-[560px] rounded-[28px] border border-[#E2E8F0] bg-white p-7 shadow-[0_30px_90px_rgba(15,42,95,.18)] sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0F2A5F] text-white shadow-lg shadow-blue-950/20">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Reset your password</h1>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Create a secure password for your Med AI NexSure account.
                <span className="block text-[13px] leading-[18px] text-[#64748B]">
                  ตั้งรหัสผ่านใหม่เพื่อรักษาความปลอดภัยของบัญชีและข้อมูลในระบบ
                </span>
              </p>
            </div>
          </div>

          <div
            className="mb-5 rounded-2xl border border-blue-100 bg-[#EFF6FF] p-4 text-sm leading-6 text-[#0F172A]"
            aria-live="polite"
            role="status"
          >
            {statusMessage}
          </div>

          {showLoading ? (
            <div className="grid min-h-[300px] place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div>
                <span
                  className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-[#1E3A8A]"
                  aria-hidden="true"
                />
                <p className="mt-5 text-sm font-bold text-[#0F172A]">Validating recovery session</p>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  กำลังตรวจสอบลิงก์อย่างปลอดภัย กรุณารอสักครู่
                </p>
              </div>
            </div>
          ) : null}

          {showForm ? (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                void handleSubmit(onSubmit)(event);
              }}
              noValidate
            >
              <label className="block" htmlFor="new-password">
                <span className="mb-2 block text-xs font-bold text-slate-700">New Password</span>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "new-password-error" : "password-policy"}
                    className="form-input pr-12"
                    {...passwordRegistration}
                    ref={(element) => {
                      passwordRegistration.ref(element);
                      firstPasswordRef.current = element;
                    }}
                  />
                  <Button
                    type="button"
                    aria-label={showPassword ? "Hide new password" : "Show new password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-[#EFF6FF] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password ? (
                  <p className="mt-2 text-[13px] leading-[18px] text-[#ba1a1a]" id="new-password-error">
                    {errors.password.message}
                  </p>
                ) : null}
              </label>

              <label className="block" htmlFor="confirm-password">
                <span className="mb-2 block text-xs font-bold text-slate-700">Confirm New Password</span>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    disabled={isSubmitting}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword ? "confirm-password-error" : undefined
                    }
                    className="form-input pr-12"
                    {...confirmPasswordRegistration}
                  />
                  <Button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-[#EFF6FF] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword ? (
                  <p
                    className="mt-2 text-[13px] leading-[18px] text-[#ba1a1a]"
                    id="confirm-password-error"
                  >
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </label>

              <div className="space-y-2" id="password-policy">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#64748B]">Password Strength</span>
                  <span className={passedRequirementCount >= 4 ? "text-[#059669]" : "text-[#D97706]"}>
                    {strengthLabel}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                  {passwordRequirements.map((requirement, index) => (
                    <span
                      className={`h-1 rounded-full ${
                        index < passedRequirementCount ? "bg-[#059669]" : "bg-[#E2E8F0]"
                      }`}
                      key={requirement.label}
                    />
                  ))}
                </div>
              </div>

              <ul className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {passwordRequirements.map((requirement) => {
                  const isMet = requirement.test(passwordValue);
                  return (
                    <li
                      className={`flex items-center gap-3 text-[13px] font-semibold ${
                        isMet ? "text-[#059669]" : "text-[#64748B]"
                      }`}
                      key={requirement.label}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {requirement.label}
                    </li>
                  );
                })}
              </ul>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1E3A8A] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                ) : (
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          ) : null}

          {recoveryState === "success" ? (
            <div className="grid min-h-[300px] place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <div>
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#059669]" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-[#0F172A]">Password Updated</h2>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  ตั้งรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
                </p>
                <Link
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#1E3A8A] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                  href="/"
                >
                  Continue to Sign In
                </Link>
              </div>
            </div>
          ) : null}

          {showExpired ? (
            <div className="grid min-h-[300px] place-items-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <div>
                <ShieldCheck className="mx-auto h-12 w-12 text-[#D97706]" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-[#0F172A]">Reset Link Expired</h2>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">{SAFE_EXPIRED_MESSAGE}</p>
                <Link
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#1E3A8A] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                  href="/forgot-password"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              className="rounded text-sm font-bold text-[#1E3A8A] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              href="/"
            >
              Back to Sign In
            </Link>
            <p className="text-center text-xs leading-5 text-[#64748B]">
              หากไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาติดต่อผู้ดูแลระบบขององค์กร
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
