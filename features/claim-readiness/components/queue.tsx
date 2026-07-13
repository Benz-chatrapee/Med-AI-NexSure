import Link from "next/link";
import type { ReactNode } from "react";
import type {
  ExecutiveDashboardSummary,
  ListQuery,
  PaginatedEncounters,
} from "../domain/types";
import {
  categoryLabels,
  formatDate,
  payerRuleStatusLabels,
  payerRuleStatusStyles,
  riskLabels,
  riskStyles,
} from "./format";

export function EncounterQueue({
  data,
  dashboard,
  query,
}: {
  data: PaginatedEncounters;
  dashboard: ExecutiveDashboardSummary;
  query: ListQuery;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Kpi label="Average Readiness" value={`${data.kpis.averageReadiness}%`} />
        <Kpi label="Blocked Encounters" value={data.kpis.blockedEncounters} />
        <Kpi label="Missing Evidence" value={data.kpis.missingEvidence} />
        <Kpi label="Tasks Open" value={data.kpis.tasksOpen} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Executive Dashboard MVP 1
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Claim readiness, evidence package, and payer rule setting
              </h2>
            </div>
            <span className="w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
              Orchestrator confidence {Math.round(dashboard.orchestrator.confidence * 100)}%
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {dashboard.orchestrator.summary}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <MiniMetric
              label="Evidence Completeness"
              value={`${dashboard.kpis.evidencePackageCompleteness}%`}
            />
            <MiniMetric label="Active Rules" value={dashboard.kpis.payerRulesActive} />
            <MiniMetric
              label="Rules Need Review"
              value={dashboard.kpis.payerRulesNeedReview}
            />
            <MiniMetric
              label="Human Review Rules"
              value={dashboard.kpis.humanReviewRequiredRules}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold">Specialist Coordination</h3>
          <div className="mt-4 space-y-3">
            {dashboard.orchestrator.specialists.slice(0, 4).map((item) => (
              <article key={item.agent} className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{item.agent}</p>
                  <span className="text-xs tabular-nums text-slate-500">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Payer Rule Setting</h3>
          <p className="mt-1 text-sm text-slate-600">
            Configured rules guide review only. They do not approve or reject claims.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Rule</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Required Evidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.payerRules.map((rule) => (
                <tr key={rule.id} className="align-top">
                  <td className="px-4 py-4 font-semibold">{rule.payerName}</td>
                  <td className="px-4 py-4">
                    <div>{rule.ruleName}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {rule.strictness} · effective {formatDate(rule.effectiveFrom)}
                    </div>
                  </td>
                  <td className="px-4 py-4">{categoryLabels[rule.category]}</td>
                  <td className="max-w-sm px-4 py-4 text-slate-600">
                    {rule.requiredEvidence}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${payerRuleStatusStyles[rule.status]}`}
                    >
                      {payerRuleStatusLabels[rule.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {rule.humanReviewRequired ? "Human required" : "Standard"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
        <label className="md:col-span-2">
          <span className="text-xs font-medium uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={query.q}
            placeholder="Patient label or encounter"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <Select name="risk" label="Risk" defaultValue={query.risk}>
          <option value="all">All risks</option>
          <option value="blocked">Blocked</option>
          <option value="at_risk">At Risk</option>
          <option value="needs_review">Needs Review</option>
          <option value="ready">Ready</option>
        </Select>
        <Select name="payer" label="Payer" defaultValue={query.payer}>
          <option value="all">All payers</option>
          {data.filters.payers.map((payer) => (
            <option key={payer} value={payer}>
              {payer}
            </option>
          ))}
        </Select>
        <Select name="department" label="Department" defaultValue={query.department}>
          <option value="all">All departments</option>
          {data.filters.departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </Select>
        <button className="mt-5 h-10 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800">
          Apply
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-semibold">No encounters found</h2>
            <p className="mt-2 text-sm text-slate-600">
              ไม่พบรายการตามตัวกรองปัจจุบัน ลองปรับคำค้นหาหรือสถานะความเสี่ยง
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Encounter</th>
                  <th className="px-4 py-3">Doctor / Dept</th>
                  <th className="px-4 py-3">Payer</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Evidence</th>
                  <th className="px-4 py-3">Top Gap</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((encounter) => (
                  <tr key={encounter.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{encounter.encounterCode}</div>
                      <div className="text-slate-600">{encounter.patientLabel}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(encounter.encounterDate)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>{encounter.primaryDoctorName}</div>
                      <div className="text-slate-600">{encounter.department}</div>
                    </td>
                    <td className="px-4 py-4">{encounter.payerName}</td>
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold tabular-nums">
                        {encounter.readinessScore.total}
                      </span>
                      <span className="text-slate-500">/100</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[encounter.riskLevel]}`}
                      >
                        {riskLabels[encounter.riskLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {encounter.missingEvidenceCount} missing
                    </td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">
                      {encounter.topGapSummary}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/claim-readiness/${encounter.id}`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-sky-400 hover:text-sky-700"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-l border-slate-200 pl-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="text-xs font-medium uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      >
        {children}
      </select>
    </label>
  );
}
