import Link from "next/link";
import { getEvidencePackageWorklist } from "@/features/evidence-package/server/service";

export default async function EvidencePackage() {
  const worklist = await getEvidencePackageWorklist();

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Insurance Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">Evidence Package Worklist</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          รายการ visit สำหรับตรวจสอบความครบถ้วนของหลักฐานก่อน preview และ export evidence package.
        </p>
      </section>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="px-4 py-3 text-left font-semibold text-blue-950">Evidence package queue</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">HN / Patient</th>
              <th className="px-4 py-3">Visit</th>
              <th className="px-4 py-3">Claim</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3">Missing Evidence</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {worklist.map((item) => (
              <tr className="border-t border-slate-200" key={item.visitId}>
                <td className="px-4 py-3">{item.hn}<br /><span className="text-slate-500">{item.patientLabel}</span></td>
                <td className="px-4 py-3">{item.visitId}<br /><span className="text-slate-500">{item.visitDate}</span></td>
                <td className="px-4 py-3">{item.claimReadinessScore}%</td>
                <td className="px-4 py-3">{item.evidenceQualityScore}</td>
                <td className="px-4 py-3">{item.missingEvidence.length ? item.missingEvidence.join(", ") : "None"}</td>
                <td className="px-4 py-3">
                  <Link className="rounded-md bg-blue-900 px-3 py-2 text-xs font-bold text-white" href={`/evidence-package/${item.visitId}`}>
                    View Package
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
