"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-black text-slate-950">Unable to load clinic users</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">ไม่สามารถโหลดหน้า Clinic Users ได้ กรุณาลองใหม่อีกครั้ง ระบบจะไม่เปลี่ยนแปลงข้อมูลโดยไม่มี audit log</p>
        <button type="button" onClick={reset} className="mt-5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          Retry
        </button>
      </section>
    </main>
  );
}
