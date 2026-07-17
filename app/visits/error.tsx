"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="max-w-md rounded-lg border border-border bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-950">Visit workspace unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">ไม่สามารถเปิดหน้า Visit ได้ กรุณาลองใหม่อีกครั้ง ข้อมูลภายในระบบไม่ถูกเปิดเผย</p>
        <Button className="mt-5 rounded bg-primary px-4 py-2 text-sm font-bold text-white" onClick={reset}>Retry</Button>
      </section>
    </main>
  );
}
