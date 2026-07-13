"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Clinic Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Dashboard could not be loaded</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองใหม่อีกครั้ง หรือแจ้งผู้ดูแลระบบหากยังพบปัญหา
        </p>
        <button
          className="mt-5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-200"
          onClick={reset}
        >
          Retry
        </button>
      </section>
    </main>
  );
}
