import Link from "next/link";
import { ReadinessShell } from "@/features/claim-readiness/components/readiness-shell";

export default function NotFound() {
  return (
    <ReadinessShell>
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold">Encounter not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The readiness record was not found or is outside your authorized
          scope.
        </p>
        <Link
          href="/claim-readiness"
          className="mt-5 inline-flex rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to queue
        </Link>
      </section>
    </ReadinessShell>
  );
}
