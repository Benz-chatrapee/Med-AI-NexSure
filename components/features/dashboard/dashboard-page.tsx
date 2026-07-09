import {
  activities,
  caseList,
  kpiCards,
  missingEvidence,
  navigationGroups,
  queueItems,
} from "./dashboard-content";

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Ready"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "Needs Review"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : status === "Pending Evidence"
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${tone}`}>
      {status}
    </span>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
    </div>
  );
}

export function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-[#071936] px-5 py-6 text-white lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-sm font-black ring-1 ring-white/15">
              NX
            </div>
            <div>
              <div className="text-sm font-bold">Med AI NexSure</div>
              <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-blue-200">
                Enterprise OS
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-7" aria-label="Main navigation">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-blue-200/80">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <a
                      className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        item === "Main Dashboard"
                          ? "bg-white text-[#0F2A5F]"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                      href="#"
                      key={item}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-5 py-5 sm:px-7 lg:px-8">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.18em] text-[#2563EB]">
                  Enterprise Healthcare & Insurance Intelligence Platform
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Main Dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  ภาพรวมการดำเนินงานวันนี้ ความพร้อมเคลม และคำแนะนำจาก AI
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200">
                  Export
                </button>
                <button className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#2563EB]">
                  Run AI Review
                </button>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={card.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                      {card.label}
                    </p>
                    <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                      {card.value}
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    {card.trend}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{card.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="Claim Readiness Overview"
                subtitle="ตรวจสอบความพร้อมของข้อมูลก่อนส่งเคลมประกัน"
              />
              <div className="grid gap-3 sm:grid-cols-4">
                {queueItems.map((item) => (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={item.label}>
                    <div className={`mb-3 h-1.5 rounded-full ${item.tone}`} />
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="AI Recommendation Panel"
                subtitle="ข้อเสนอแนะจาก AI เพื่อสนับสนุนการตัดสินใจ"
              />
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm font-bold text-[#1E3A8A]">
                  Prioritize 29 pending evidence cases
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  ข้อมูลยังไม่ครบถ้วน กรุณาตรวจสอบ SOAP Note, ICD-10 และ Prescription ก่อนส่งเคลม
                </p>
                <button className="mt-4 rounded-lg bg-[#1E3A8A] px-3 py-2 text-xs font-bold text-white">
                  Review
                </button>
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="Economic Intelligence"
                subtitle="วิเคราะห์ต้นทุน ค่าใช้จ่าย และความผิดปกติก่อนส่งเคลม"
              />
              <div className="text-3xl font-bold text-slate-950">฿2.84M</div>
              <p className="mt-2 text-xs text-slate-500">Estimated claim value under review</p>
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                พบค่าใช้จ่ายผิดปกติ 7 รายการ ควรตรวจสอบก่อนส่งต่อบริษัทประกัน
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="Missing Evidence"
                subtitle="รายการหลักฐานที่ยังไม่ครบถ้วน"
              />
              <div className="space-y-3">
                {missingEvidence.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-[#2563EB]"
                        style={{ width: `${Math.min(item.count * 4, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="Recent Activity"
                subtitle="ประวัติการดำเนินงานล่าสุด"
              />
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-600" key={activity}>
                    {activity}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                title="Case List"
                subtitle="รายการเคสที่ต้องติดตามและตรวจสอบความพร้อม"
              />
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
                View Detail
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-[.12em] text-slate-500">
                    <th className="py-3">Case ID</th>
                    <th className="py-3">Patient</th>
                    <th className="py-3">Module</th>
                    <th className="py-3">Payer</th>
                    <th className="py-3">Score</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {caseList.map((item) => (
                    <tr className="border-b border-slate-100 last:border-0" key={item.id}>
                      <td className="py-4 font-bold text-slate-950">{item.id}</td>
                      <td className="py-4 text-slate-600">{item.patient}</td>
                      <td className="py-4 text-slate-600">{item.module}</td>
                      <td className="py-4 text-slate-600">{item.payer}</td>
                      <td className="py-4 font-bold text-slate-950">{item.score}</td>
                      <td className="py-4"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
