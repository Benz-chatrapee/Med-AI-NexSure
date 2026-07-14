"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-red-700">Visit Timeline Error</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Timeline could not be loaded</h1>
        <p className="mt-2 text-sm text-slate-600">
          No visit data was changed. Retry loading the clinical and claim timeline before making decisions.
        </p>
        <button
          className="mt-5 rounded-lg border border-slate-200 bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white"
          onClick={reset}
          type="button"
        >
          Retry Timeline
        </button>
      </section>
    </main>
  );
}
