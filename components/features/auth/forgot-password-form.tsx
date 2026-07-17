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
    <section className="flex w-full items-center justify-center bg-[#faf8ff] p-4 lg:w-[55%]">
      <div className="flex w-full max-w-[460px] flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
            <span className="text-3xl text-[#00236f]" aria-hidden="true">
              ✉
            </span>
          </div>
          <h1 className="mb-1 text-[32px] font-bold leading-10 tracking-[-0.02em] text-[#131b2e]">
            Forgot your password?
          </h1>
          <p className="text-base leading-6 text-[#64748B]">
            Enter your work email to receive a recovery link.
            <br />
            <span className="text-[13px] leading-[18px] text-[#94A3B8]">
              กรุณากรอกอีเมลของหน่วยงานเพื่อรับลิงก์กู้คืนรหัสผ่าน
            </span>
          </p>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#444651]"
              htmlFor="work-email"
            >
              Work Email / อีเมลสำหรับงาน
            </label>
            <div className="relative transition-transform focus-within:scale-[1.01]">
              <Input
                id="work-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                disabled={isSubmitting}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "work-email-error" : undefined}
                className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-base leading-6 text-[#131b2e] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-[13px] leading-[18px] text-[#ba1a1a]" id="work-email-error">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`flex h-14 w-full items-center justify-center rounded-lg px-4 py-4 text-xl font-semibold leading-7 text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${
              isSuccess ? "bg-[#059669]" : "bg-[#00236f] hover:bg-[#1e3a8a]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-4">
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
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
            className="rounded-xl border border-[#BFDBFE] bg-white px-4 py-3 text-sm leading-6 text-[#131b2e]"
            role="status"
          >
            If an account exists for that email, a recovery link has been sent.
            <span className="block text-[13px] leading-[18px] text-[#64748B]">
              ระบบจะแจ้งผลแบบทั่วไปเพื่อป้องกันการเปิดเผยข้อมูลบัญชี
            </span>
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-3">
          <Link
            className="flex items-center gap-1 rounded text-sm font-semibold leading-5 text-[#00236f] hover:underline focus:outline-none focus:ring-2 focus:ring-[#00236f]/30"
            href="/"
          >
            <span aria-hidden="true">←</span>
            Back to Sign In
          </Link>
          <button
            className="border-none bg-transparent text-sm leading-5 text-[#94A3B8] transition-colors hover:text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00236f]/30"
            type="button"
          >
            Contact System Administrator
          </button>
        </div>

        <div className="flex gap-4 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-6">
          <span className="shrink-0 text-[#00236f]" aria-hidden="true">
            ⛨
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-tight text-[#131b2e]">
              Reset links expire automatically after 30 minutes for your protection.
            </p>
            <p className="text-[13px] leading-[18px] text-[#64748B]">
              เพื่อความปลอดภัย ระบบจะไม่เปิดเผยว่ามีบัญชีนี้อยู่หรือไม่ในขั้นตอนการส่งลิงก์
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase leading-4 tracking-normal text-[#94A3B8]">
            © 2024 NexSure AI Systems • Support ID: 882-MED-SYS
          </p>
        </div>
      </div>
    </section>
  );
}
