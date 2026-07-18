"use client";

import { Button } from "@/components/ui/button";

export default function VisitSoapError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 text-[#0F172A]">
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-[#DC2626]">SOAP Workspace Error</p>
        <h1 className="mt-2 text-2xl font-black">Unable to load clinical workspace</h1>
        <p className="mt-2 text-sm text-[#64748B]">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
        <Button className="mt-5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white" onClick={reset}>Try Again</Button>
      </section>
    </main>
  );
}
