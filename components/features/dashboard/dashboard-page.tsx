"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  activities,
  domainMix,
  executiveControls,
  kpiCards,
  navigationGroups,
  portfolioRows,
  readinessTrend,
  rightSidebarItems,
} from "./dashboard-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "On Track"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "Needs Review"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${tone}`}>
      {status}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
    </div>
  );
}

export function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[276px_minmax(0,1fr)]">
        <aside className="hidden bg-gradient-to-b from-[#0F2A5F] to-[#081B42] text-white lg:block">
          <div className="flex h-full flex-col px-5 py-6">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xl font-black">Med AI NexSure</div>
                <div className="mt-1 max-w-[220px] text-xs leading-5 text-blue-200">
                  Enterprise Healthcare & Insurance Intelligence Platform
                </div>
              </div>
            </div>

            <nav className="mt-8 flex-1 space-y-7" aria-label="Main navigation">
              {navigationGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-blue-200/80">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <a
                        className={`block rounded-[14px] px-3.5 py-3 text-sm font-bold transition ${
                          item === "Executive Dashboard"
                            ? "bg-white/12 text-white"
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

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-xs font-bold text-blue-100">AI assists. Humans decide.</div>
              <p className="mt-2 text-xs leading-5 text-blue-100/75">
                รองรับ PDPA, RBAC, audit trail และ human approval workflow.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <section className="mb-5 grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,42,95,.05)] xl:grid-cols-[minmax(260px,1.5fr)_minmax(220px,1fr)_auto_auto] xl:items-center">
            <Input
              aria-label="Global dashboard search"
              className="h-[46px] rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              placeholder="Global search: KPI, payer, facility, governance item..."
            />
            <select
              aria-label="Organization"
              className="h-[46px] rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
            >
              <option>Med AI NexSure Clinic Group</option>
              <option>Bangkok Executive Cluster</option>
            </select>
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-[#1E3A8A]">
              Role: Executive
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              4 Board Alerts
            </span>
          </section>

          <div className="px-0 py-0">
            <header className="mb-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950">
                    Executive Dashboard
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Strategic overview for claim readiness, revenue assurance, AI governance, and compliance.
                    ภาพรวมผู้บริหารสำหรับติดตามความพร้อมเคลม ความเสี่ยง และการกำกับดูแล AI
                  </p>
                </div>
                <Button className="min-h-11 rounded-[14px] bg-[#1E3A8A] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(30,58,138,.18)] hover:bg-[#0F2A5F] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                  Run Executive Review
                </Button>
              </div>
            </header>

            <div className="mb-5 grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              <Input
                aria-label="Search executive dashboard"
                className="h-[46px] rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                placeholder="Search by domain, payer, facility, risk owner..."
              />
              {executiveControls.slice(0, 3).map((control) => (
                <select
                  aria-label={control.label}
                  className="h-[46px] rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  key={control.label}
                >
                  <option>{control.value}</option>
                </select>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {kpiCards.map((card) => (
                <article className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)] before:absolute before:left-5 before:right-5 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-[#1E3A8A] before:to-sky-400" key={card.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{card.label}</p>
                      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{card.value}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${card.tone}`}>
                      {card.trend}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-blue-700">{card.thai}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]" aria-label="Enterprise readiness trend chart">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionHeader
                      title="Enterprise Readiness Trend"
                      subtitle="Claim value, readiness, and audit coverage for executive monitoring"
                    />
                    <div className="text-xs font-bold text-slate-500">อัปเดตล่าสุด 10 Jul 2026</div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={readinessTrend} margin={{ left: -18, right: 12, top: 8, bottom: 0 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} tickLine={false} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 12 }} tickLine={false} />
                        <Tooltip />
                        <Area dataKey="audit" name="Audit coverage" stroke="#0F766E" fill="#CCFBF1" strokeWidth={2} />
                        <Area dataKey="readiness" name="Readiness %" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
                  <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]" aria-label="Readiness mix chart">
                    <SectionHeader title="Readiness Mix" subtitle="สัดส่วนสถานะงานระดับองค์กร" />
                    <div className="mt-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={domainMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88}>
                            {domainMix.map((entry) => (
                              <Cell fill={entry.fill} key={entry.name} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {domainMix.map((item) => (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600" key={item.name}>
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          {item.name}: {item.value}%
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]" aria-label="Claim value pipeline chart">
                    <SectionHeader title="Claim Value Pipeline" subtitle="Monthly executive view in THB millions" />
                    <div className="mt-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={readinessTrend} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} tickLine={false} />
                          <YAxis tick={{ fill: "#64748B", fontSize: 12 }} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="claims" name="Claim value" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>

                <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionHeader title="Executive Portfolio Table" subtitle="No patient identifiers. Aggregated governance and performance domains." />
                    <Button className="min-h-10 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-bold text-[#1E3A8A] hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                      Export Brief
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-[.12em] text-slate-500">
                          <th className="py-3 pr-4">Domain</th>
                          <th className="py-3 pr-4">Owner</th>
                          <th className="py-3 pr-4">Readiness</th>
                          <th className="py-3 pr-4">Value</th>
                          <th className="py-3 pr-4">Risk</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioRows.map((item) => (
                          <tr className="border-b border-slate-100 last:border-0" key={item.domain}>
                            <td className="py-4 pr-4 font-bold text-slate-950">{item.domain}</td>
                            <td className="py-4 pr-4 text-slate-600">{item.owner}</td>
                            <td className="py-4 pr-4 font-bold text-slate-950">{item.readiness}</td>
                            <td className="py-4 pr-4 text-slate-600">{item.value}</td>
                            <td className="py-4 pr-4 text-slate-600">{item.risk}</td>
                            <td className="py-4"><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="space-y-5 2xl:sticky 2xl:top-6 2xl:max-h-[calc(100vh-48px)] 2xl:self-start 2xl:overflow-y-auto" aria-label="Executive priority sidebar">
                <section className="rounded-[18px] border border-blue-200 bg-gradient-to-b from-white to-blue-50 p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]">
                  <SectionHeader title="Executive Actions" subtitle="คำแนะนำสำหรับผู้บริหาร" />
                  <div className="mt-4 space-y-3">
                    {rightSidebarItems.map((item) => (
                      <article className="rounded-xl border border-blue-100 bg-blue-50/70 p-4" key={item.title}>
                        <div className="text-xs font-bold uppercase tracking-[.12em] text-blue-700">{item.title}</div>
                        <div className="mt-2 text-sm font-bold text-slate-950">{item.value}</div>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,42,95,.06)]">
                  <SectionHeader title="Recent Governance Activity" subtitle="Audit-safe operational record" />
                  <div className="mt-4 space-y-3">
                    {activities.map((activity) => (
                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600" key={activity}>
                        {activity}
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
