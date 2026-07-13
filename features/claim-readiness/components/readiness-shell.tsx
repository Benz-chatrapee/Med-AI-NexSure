import Link from "next/link";
import type { ReactNode } from "react";

export function ReadinessShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-sky-700">
              Med AI NexSure
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Executive Dashboard
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Claim readiness, evidence packages, and payer rules support
            clinical and insurance review only. They do not approve, reject,
            diagnose, code, or submit claims.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
