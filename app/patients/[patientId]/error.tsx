"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6">
      <section className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-[#DC2626]" />
        <h1 className="mt-4 text-2xl font-bold text-[#1E3A8A]">Patient Detail Error</h1>
        <p className="mt-3 text-sm text-[#64748B]">ไม่สามารถโหลดข้อมูลผู้ป่วยได้ในขณะนี้ ข้อมูลละเอียดไม่ถูกแสดงในข้อความผิดพลาดเพื่อความปลอดภัย</p>
        <Button className="mt-5 rounded bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white" onClick={reset}>Retry</Button>
      </section>
    </main>
  );
}
