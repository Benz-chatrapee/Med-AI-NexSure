import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <section className="max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-soft-background text-primary">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-950">Visit not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ไม่พบข้อมูล Visit ตามรหัสที่ระบุ กรุณาตรวจสอบรายการ Visit อีกครั้ง
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-deep-blue focus:outline-none focus:ring-2 focus:ring-accent"
          href="/visits"
        >
          Back to Visits
        </Link>
      </section>
    </main>
  );
}
