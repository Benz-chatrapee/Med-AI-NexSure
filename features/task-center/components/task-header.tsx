import { CircleCheckBig, ClipboardList, Clock3, Plus, RotateCcw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { focusRing } from "./task-center-styles";

export function TaskHeader({ onReset, onToast }: { onReset: () => void; onToast: (message: string) => void }) {
  return (
    <>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium text-[#2563EB]"><span>Operations</span><span className="text-[#CBD5E1]">/</span><span>Task Center</span></div>
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">Task Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748B]">Prioritize, assign, and resolve operational work across clinical, claim, evidence, safety, and compliance workflows.</p>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">ศูนย์รวมงานที่ต้องดำเนินการ พร้อมลำดับความสำคัญและบริบทของเคส</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button className={`${focusRing} inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172A] shadow-sm hover:bg-[#EFF6FF]`} onClick={onReset} type="button"><RotateCcw className="h-4 w-4 text-[#2563EB]" />Reset Filters</button>
          <button className={`${focusRing} inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F2A5F] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1D4ED8]`} onClick={() => onToast("เปิดขั้นตอนสร้างงานแล้ว")} type="button"><Plus className="h-4 w-4" />Create Task</button>
        </div>
      </div>
      <section className="mb-6 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open Tasks" value="24" icon={<ClipboardList className="h-5 w-5" />} change="↓ 12%" changeTone="good" helper="เทียบกับเมื่อวาน" trend={[18, 22, 19, 26, 24, 21, 24]} />
        <Kpi label="Due Today" value="8" icon={<Clock3 className="h-5 w-5" />} border="border-[#FCD34D]" iconClass="bg-[#FEF3C7] text-[#D97706]" change="↑ 6%" changeTone="warn" helper="มี 3 งานที่ต้องเร่งดำเนินการ" footerClass="font-medium text-[#D97706]" trend={[4, 5, 6, 5, 7, 6, 8]} />
        <Kpi label="Critical Priority" value="3" icon={<TriangleAlert className="h-5 w-5" />} border="border-[#FCA5A5]" iconClass="bg-[#FEE2E2] text-[#DC2626]" change="↑ 2" changeTone="danger" helper="เกี่ยวข้องกับความปลอดภัยและความเสี่ยงเคลม" footerClass="font-medium text-[#DC2626]" trend={[1, 2, 2, 3, 2, 4, 3]} />
        <Kpi label="Completion Rate" value="89%" icon={<CircleCheckBig className="h-5 w-5" />} progress change="↑ 4 pts" changeTone="good" helper="สัปดาห์นี้เสร็จแล้ว 38 จาก 43 งาน" trend={[74, 78, 81, 80, 84, 87, 89]} />
      </section>
    </>
  );
}

function Kpi({ label, value, icon, change, changeTone, helper, trend, border = "border-[#E2E8F0]", iconClass = "bg-[#EFF6FF] text-[#2563EB]", footerClass = "text-[#64748B]", progress = false }: { label: string; value: string; icon: ReactNode; change: string; changeTone: "good" | "warn" | "danger"; helper: string; trend: number[]; border?: string; iconClass?: string; footerClass?: string; progress?: boolean }) {
  const changeClass = {
    good: "bg-[#ECFDF5] text-[#059669]",
    warn: "bg-[#FEF3C7] text-[#D97706]",
    danger: "bg-[#FEE2E2] text-[#DC2626]",
  } satisfies Record<typeof changeTone, string>;

  return (
    <article className={`group min-w-0 rounded-2xl border ${border} bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#EFF6FF] hover:shadow-md`}>
      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-base font-semibold text-[#64748B]">{label}</p><p className="mt-3 text-5xl font-bold tracking-tight text-[#0F172A]">{value}</p></div>{progress ? <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#2563EB_0deg_248deg,#DBEAFE_248deg_360deg)]"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1E3A8A]">{icon}</div></div> : <div className={`shrink-0 rounded-xl p-3 ${iconClass}`}>{icon}</div>}</div>
      <div className="mt-5 flex items-center gap-2 text-sm"><span className={`rounded-full px-3 py-1.5 font-medium ${changeClass[changeTone]}`}>{change}</span><span className={footerClass}>{helper}</span></div>
      <Sparkline values={trend} tone={changeTone} />
    </article>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: "good" | "warn" | "danger" }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 100;
    const y = 36 - ((value - min) / range) * 28;
    return `${x},${y}`;
  }).join(" ");
  const stroke = tone === "good" ? "#059669" : tone === "warn" ? "#D97706" : "#DC2626";

  return (
    <svg className="mt-5 h-10 w-full" viewBox="0 0 100 40" role="img" aria-label="Seven day task trend" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
