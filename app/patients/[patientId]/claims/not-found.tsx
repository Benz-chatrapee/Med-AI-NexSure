import Link from "next/link";

export default function PatientClaimsNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6">
      <section className="max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-950">Patient claims not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">ยังไม่พบข้อมูลเคลมของผู้ป่วยรายนี้ หรือคุณอาจไม่มีสิทธิ์เข้าถึงข้อมูล</p>
        <Link className="mt-4 inline-flex rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white" href="/dashboard">Back to Dashboard</Link>
      </section>
    </main>
  );
}
