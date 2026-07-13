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
    <section className="mb-5 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Clinic users KPIs">
      {loading
        ? kpiSkeletonIcons.map((Icon, index) => (
            <div key={String(index)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
              <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">{card.label}</p>
                  <span className={`rounded-xl border p-2 ${toneClasses[card.semantic]}`}><Icon size={18} aria-hidden="true" /></span>
                </div>
                <strong className="mt-3 block text-3xl font-black text-[#0F2A5F]">{card.value}</strong>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{card.helper}</p>
              </article>
            );
          })}
    </section>
  );
}
