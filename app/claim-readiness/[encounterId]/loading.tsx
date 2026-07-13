import { ReadinessShell } from "@/features/claim-readiness/components/readiness-shell";

export default function Loading() {
  return (
    <ReadinessShell>
      <div className="space-y-5">
        <div className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white" />
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
          <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      </div>
    </ReadinessShell>
  );
}
