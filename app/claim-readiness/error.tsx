"use client";

import { ReadinessShell } from "@/features/claim-readiness/components/readiness-shell";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ReadinessShell>
      <section className="rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold">Claim readiness is unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          We could not complete the readiness workflow. No claim decision was
          made, and sensitive details are not shown in this error state.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </ReadinessShell>
  );
}
