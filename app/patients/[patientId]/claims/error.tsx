"use client";

export default function PatientClaimsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6">
      <section className="max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-950">Claim data could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">ไม่สามารถโหลดข้อมูลเคลมได้ กรุณาลองใหม่อีกครั้งโดยไม่เปิดเผยรายละเอียดทางเทคนิค</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white" onClick={reset}>Retry</button>
          <a className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold" href="/dashboard">Back</a>
        </div>
      </section>
    </main>
  );
}
