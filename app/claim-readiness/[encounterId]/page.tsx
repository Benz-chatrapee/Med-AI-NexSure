import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadinessDetail } from "@/features/claim-readiness/components/detail";
import { ReadinessShell } from "@/features/claim-readiness/components/readiness-shell";
import { ClaimReadinessError } from "@/features/claim-readiness/server/errors";
import { claimReadinessService } from "@/features/claim-readiness/server/service";

export default async function EncounterReadinessPage({
  params,
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const { encounterId } = await params;
  const detail = await loadDetail(encounterId);

  return (
    <ReadinessShell>
      <div className="mb-5">
        <Link
          href="/claim-readiness"
          className="text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          Back to encounter queue
        </Link>
      </div>
      <ReadinessDetail detail={detail} />
    </ReadinessShell>
  );
}

async function loadDetail(encounterId: string) {
  try {
    return await claimReadinessService.getEncounterReadiness(encounterId);
  } catch (error) {
    if (error instanceof ClaimReadinessError && error.code === "not_found") {
      notFound();
    }
    throw error;
  }
}
