import { notFound } from "next/navigation";
import { getEvidencePackage } from "@/features/evidence-package/server/service";

export default async function EvidencePackageAudit({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const pkg = await getEvidencePackage(visitId);

  if (!pkg) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <h1 className="text-3xl font-bold text-blue-950">Evidence Package Audit</h1>
      <ol className="mt-6 grid gap-3">
        {pkg.timeline.map((item) => (
          <li className="rounded-lg border border-slate-200 bg-white p-4" key={item.id}>
            <strong>{item.action}</strong>
            <p className="text-sm text-slate-600">{item.actor} · {item.actorRole} · {new Date(item.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
