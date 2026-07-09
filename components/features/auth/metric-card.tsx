import type { IntelligenceMetric } from "./login-content";

type MetricCardProps = {
  metric: IntelligenceMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className="metric-panel min-h-[126px] rounded-2xl px-4 py-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-[10px] font-black text-sky-200">
          {metric.icon}
        </div>
        <span className="rounded-full border border-sky-300/20 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-sky-100">
          {metric.tag}
        </span>
      </div>
      <div className="mt-4 text-[10px] font-bold uppercase tracking-[.15em] text-blue-200">
        {metric.title}
      </div>
      <div className="mt-1 text-[26px] font-bold tracking-tight text-white">
        {metric.value}
      </div>
      <div className="mt-1 text-[11px] font-medium leading-5 text-slate-300">
        {metric.description}
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/10">
        <div className={`metric-line h-1 rounded-full ${metric.barClassName}`} />
      </div>
    </div>
  );
}
