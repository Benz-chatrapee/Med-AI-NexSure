"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "./forgot-password-schema";

type SubmitState = "idle" | "submitting" | "success";

export function ForgotPasswordForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit() {
    setSubmitState("submitting");
    window.setTimeout(() => {
      setSubmitState("success");
    }, 1500);
  }

  const isSubmitting = submitState === "submitting";
  const isSuccess = submitState === "success";

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(145deg,#F8FAFC_0%,#FFFFFF_48%,#EFF6FF_100%)] px-5 py-10 sm:px-7 lg:px-8 xl:px-10">
      <div className="absolute right-[-180px] top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-180px] left-[-160px] h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto mb-8 flex items-center gap-3 lg:hidden">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0F2A5F] font-bold text-white shadow-lg shadow-blue-950/20">
          NX
        </div>
        <div>
          <div className="font-bold text-[#0F172A]">Med AI NexSure</div>
          <div className="text-xs text-[#64748B]">Enterprise Workspace</div>
        </div>
      </div>

      <div className="card-up relative mx-auto w-full max-w-[410px]">
        <div className="mb-5 rounded-[24px] border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#2563EB]">
                Account Recovery
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                Secure Password Reset
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              Protected
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-7 shadow-[0_30px_90px_rgba(15,42,95,.18)] sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0F2A5F] text-sm font-bold text-white shadow-lg shadow-blue-950/20">
              Mail
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Forgot your password?</h1>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Enter your work email to receive a recovery link.
                <span className="block text-[13px] leading-[18px] text-[#64748B]">
                  กรุณากรอกอีเมลของหน่วยงานเพื่อรับลิงก์กู้คืนรหัสผ่าน
                </span>
              </p>
            </div>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            noValidate
          >
            <label className="block" htmlFor="work-email">
              <span className="mb-2 block text-xs font-bold text-slate-700">
                Work Email / อีเมลสำหรับงาน
              </span>
              <Input
                id="work-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                disabled={isSubmitting}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "work-email-error" : undefined}
                className="form-input"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-2 text-[13px] leading-[18px] text-[#ba1a1a]" id="work-email-error">
                  {errors.email.message}
                </p>
              ) : null}
            </label>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-13 flex w-full items-center justify-center rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                isSuccess
                  ? "bg-[#059669] hover:bg-[#059669]"
                  : "bg-[#1E3A8A] hover:bg-[#2563EB] hover:shadow-[0_22px_60px_rgba(37,99,235,.20)]"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  Sending Link...
                </span>
              ) : null}
              {isSuccess ? "Link Sent Successfully" : null}
              {submitState === "idle" ? "Send reset link" : null}
            </Button>
          </form>

          {isSuccess ? (
            <div
              className="mt-5 rounded-2xl border border-blue-100 bg-[#EFF6FF] p-4 text-sm leading-6 text-[#0F172A]"
              role="status"
            >
              If an account exists for that email, a recovery link has been sent.
              <span className="block text-[13px] leading-[18px] text-[#64748B]">
                ระบบจะแจ้งผลแบบทั่วไปเพื่อป้องกันการเปิดเผยข้อมูลบัญชี
              </span>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <strong className="text-slate-800">Security Notice.</strong>
            <br />
            Reset links expire automatically after 30 minutes. The response is generic and does not reveal whether the email exists.
            <span className="block text-[#64748B]">
              เพื่อความปลอดภัย ระบบจะไม่เปิดเผยว่ามีบัญชีนี้อยู่หรือไม่ในขั้นตอนการส่งลิงก์
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            <Link
              className="rounded text-sm font-bold text-[#1E3A8A] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              href="/"
            >
              Back to Sign In
            </Link>
            <button
              className="border-none bg-transparent text-xs font-bold text-[#64748B] transition hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              type="button"
            >
              Contact System Administrator
            </button>
          </div>
        </div>

        <footer className="mt-6 text-center text-[11px] leading-5 text-slate-500">
          <div>Version 1.0.0 - Production Environment</div>
          <div>© 2026 Med AI NexSure - Secure - Compliant - Explainable AI</div>
          <div>Support ID: 882-MED-SYS</div>
        </footer>
      </div>
    </section>
  );
}
