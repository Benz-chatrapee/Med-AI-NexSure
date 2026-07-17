import { AlertTriangle, RotateCcw, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisitDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background p-6 lg:pl-[280px]">
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <div className="h-[620px] animate-pulse rounded-2xl bg-white" />
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-red-50" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
            <div className="h-56 animate-pulse rounded-2xl bg-blue-50" />
          </div>
          <div className="h-[620px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}

export function VisitDetailErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <section className="max-w-lg rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-950">Visit detail unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ไม่สามารถโหลดข้อมูล Visit ได้ ข้อมูลเดิมยังไม่ถูกเปลี่ยนแปลง กรุณาลองใหม่อีกครั้ง
        </p>
        <Button
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-deep-blue focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={onRetry}
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      </section>
    </main>
  );
}

export function VisitDetailEmptyState() {
  return (
    <section className="grid min-h-[360px] place-items-center rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-soft-background text-primary">
          <Stethoscope className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-slate-950">No visit detail available</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          ยังไม่มีข้อมูล Clinical, Claim หรือ Evidence สำหรับ Visit นี้
        </p>
      </div>
    </section>
  );
}
