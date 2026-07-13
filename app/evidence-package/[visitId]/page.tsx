import { notFound } from "next/navigation";
import { EvidencePackagePage } from "@/components/features/evidence-package/evidence-package-page";
import { getEvidencePackage } from "@/features/evidence-package/server/service";

export default async function EvidencePackageDetail({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const pkg = await getEvidencePackage(visitId);

  if (!pkg) {
    notFound();
  }

  return <EvidencePackagePage pkg={pkg} />;
}
