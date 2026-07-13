import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvidencePackage } from "@/features/evidence-package/server/service";

export default async function EvidencePackagePreview({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const pkg = await getEvidencePackage(visitId);

  if (!pkg) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">PDF Preview</p>
        <h1 className="mt-2 text-3xl font-bold text-blue-950">Evidence Package Preview</h1>
        <p className="mt-2 text-sm text-slate-600">Placeholder preview for {pkg.visit.visitId}. Real PDF generation is pending backend integration.</p>
        <Link className="mt-4 inline-flex rounded-md bg-blue-900 px-4 py-2 text-sm font-bold text-white" href={`/evidence-package/${pkg.visit.visitId}`}>
          Back to Package
        </Link>
      </section>
    </main>
  );
}
