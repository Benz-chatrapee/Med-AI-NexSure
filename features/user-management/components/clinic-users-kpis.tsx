import { getKpiDefinitions, kpiSkeletonIcons } from "../constants/clinic-user-options";
import type { ClinicUsersSummary } from "../types/user-management.types";

const toneClasses = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
} as const;

export function ClinicUsersKpis({ summary, loading }: { summary?: ClinicUsersSummary; loading: boolean }) {
  const cards = summary ? getKpiDefinitions(summary) : [];
  return (
    <section className="mb-4 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10" aria-label="Enterprise identity KPIs">
      {loading
        ? kpiSkeletonIcons.map((Icon, index) => (
            <div key={String(index)} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                <span className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-700"><Icon size={18} /></span>
              </div>
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          ))
        : cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">{card.label}</p>
                  <span className={`rounded-lg border p-1.5 ${toneClasses[card.semantic]}`}><Icon size={16} aria-hidden="true" /></span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <strong className="block text-2xl font-black text-[#0F2A5F]">{card.value}</strong>
                  <Sparkline tone={card.semantic} />
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{card.helper}</p>
                <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${toneClasses[card.semantic]}`}>+{Math.max(1, Math.round(card.value * 0.08))}% trend</span>
              </article>
            );
          })}
    </section>
  );
}

function Sparkline({ tone }: { tone: "info" | "success" | "warning" | "danger" }) {
  const color = tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : tone === "danger" ? "bg-red-500" : "bg-blue-500";
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden="true">
      {[35, 52, 44, 70, 58, 82].map((height, index) => <span key={index} className={`w-1.5 rounded-t ${color}/70`} style={{ height: `${height}%` }} />)}
    </div>
  );
}
