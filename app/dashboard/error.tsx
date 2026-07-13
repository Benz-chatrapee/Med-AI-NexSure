"use client";

import { RotateCcw } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <section className="max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_28px_rgba(15,42,95,.08)]">
        <p className="text-sm font-semibold text-[#DC2626]">Dashboard Error</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0F172A]">Unable to load Executive Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          ไม่สามารถโหลดข้อมูล Dashboard ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
          หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
