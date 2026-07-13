import { ReadinessShell } from "@/features/claim-readiness/components/readiness-shell";

export default function Loading() {
  return (
    <ReadinessShell>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    </ReadinessShell>
  );
}
