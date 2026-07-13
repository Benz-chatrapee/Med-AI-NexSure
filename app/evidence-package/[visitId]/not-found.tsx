import Link from "next/link";

export default function EvidencePackageNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-blue-950">Evidence package not found</h1>
        <p className="mt-2 text-sm text-slate-600">ไม่พบชุดหลักฐานสำหรับ visit นี้ กรุณาตรวจสอบ Visit ID หรือกลับไปที่ worklist.</p>
        <Link className="mt-4 inline-flex rounded-md bg-blue-900 px-4 py-2 text-sm font-bold text-white" href="/evidence-package">
          Back to Evidence Package
        </Link>
      </section>
    </main>
  );
}
