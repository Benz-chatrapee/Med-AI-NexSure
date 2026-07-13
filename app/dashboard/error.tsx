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
      <section className="max-w-xl rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#DC2626]">Doctor Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-[#0F172A]">Unable to load Doctor Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-[#64748B]">
          ไม่สามารถโหลดข้อมูล Dashboard ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
          หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
