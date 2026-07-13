"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-black text-slate-950">User management could not load</h1>
        <p className="mt-2 text-sm text-slate-600">ไม่สามารถโหลดพื้นที่จัดการสิทธิ์ผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง</p>
        <button type="button" onClick={reset} className="mt-5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          Retry
        </button>
      </section>
    </main>
  );
}
