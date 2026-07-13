"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrescriptionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-sm" role="alert">
        <p className="text-xs font-black uppercase tracking-[.12em] text-red-700">Prescription Workspace Error</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Unable to load prescription data</h1>
        <p className="mt-2 text-sm text-slate-600">ไม่สามารถโหลดข้อมูลใบสั่งยาได้ กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาให้ติดต่อผู้ดูแลระบบ</p>
        <Button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-900 bg-blue-900 px-4 py-2 text-sm font-bold text-white" onClick={onRetry}>
          <RotateCcw size={16} /> Retry
        </Button>
      </section>
    </main>
  );
}
