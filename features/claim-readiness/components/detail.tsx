import { createDocumentationTaskAction } from "@/app/claim-readiness/actions";
import type { ClaimReadinessDetail } from "../domain/types";
import {
  categoryLabels,
  evidenceItemLabels,
  evidencePackageLabels,
  evidenceStatusStyles,
  formatDate,
  priorityLabels,
  riskLabels,
  riskStyles,
  severityStyles,
} from "./format";
import { ScoreBreakdown } from "./score-breakdown";

export function ReadinessDetail({ detail }: { detail: ClaimReadinessDetail }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              {detail.encounterCode}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{detail.patientLabel}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {detail.primaryDoctorName} · {detail.department} · {detail.payerName}
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${riskStyles[detail.riskLevel]}`}
          >
            {riskLabels[detail.riskLevel]}
          </span>
        </div>
        <p className="mt-5 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
          Readiness signals support review only and do not approve, reject,
          diagnose, code, prescribe, or submit claims. งานนี้เป็นคำแนะนำเพื่อให้ทีมตรวจทานเอกสาร
          ไม่ใช่การแก้ไขเวชระเบียนอัตโนมัติ
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Evidence Package
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {detail.evidencePackage.linkedItems} of{" "}
              {detail.evidencePackage.requiredItems} required items linked
            </h3>
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${evidenceStatusStyles[detail.evidencePackage.status]}`}
          >
            {evidencePackageLabels[detail.evidencePackage.status]} ·{" "}
            {detail.evidencePackage.completeness}%
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {detail.evidencePackage.reviewerNote}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {detail.evidencePackage.items.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.source}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${evidenceStatusStyles[item.status]}`}
                >
                  {evidenceItemLabels[item.status]}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {item.required ? "Required" : "Optional"} · checked{" "}
                {formatDate(item.lastCheckedAt)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Readiness Score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-semibold tabular-nums">
              {detail.readinessScore.total}
            </span>
            <span className="pb-2 text-slate-500">/100</span>
          </div>
          <div className="mt-6">
            <ScoreBreakdown score={detail.readinessScore} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Readiness Gaps</h3>
            <span className="text-sm text-slate-500">{detail.gaps.length} signals</span>
          </div>
          <div className="mt-4 space-y-4">
            {detail.gaps.map((gap) => (
              <article
                key={gap.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[gap.severity]}`}
                      >
                        {gap.severity}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {categoryLabels[gap.category]}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                        {gap.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-semibold">{gap.title}</h4>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {gap.explanation}
                </p>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-700">Suggested Action</dt>
                    <dd className="mt-1 text-slate-600">{gap.suggestedAction}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-700">Source</dt>
                    <dd className="mt-1 text-slate-600">
                      {gap.source} · {gap.relatedEvidence}
                    </dd>
                  </div>
                </dl>
                {gap.status === "open" ? (
                  <form
                    action={createDocumentationTaskAction}
                    className="mt-4 grid gap-3 rounded-md bg-slate-50 p-3 md:grid-cols-6"
                  >
                    <input type="hidden" name="encounterId" value={detail.id} />
                    <input type="hidden" name="gapId" value={gap.id} />
                    <input type="hidden" name="category" value={gap.category} />
                    <label className="md:col-span-2">
                      <span className="text-xs font-medium uppercase text-slate-500">
                        Task title
                      </span>
                      <input
                        name="title"
                        defaultValue={gap.title}
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                    <label>
                      <span className="text-xs font-medium uppercase text-slate-500">
                        Priority
                      </span>
                      <select
                        name="priority"
                        defaultValue={gap.severity === "critical" ? "urgent" : "high"}
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      >
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="text-xs font-medium uppercase text-slate-500">
                        Assigned role
                      </span>
                      <select
                        name="assignedRole"
                        defaultValue="clinical_team"
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      >
                        <option value="doctor">Doctor</option>
                        <option value="clinical_team">Clinical Team</option>
                        <option value="coding_reviewer">Coding Reviewer</option>
                        <option value="claim_reviewer">Claim Reviewer</option>
                      </select>
                    </label>
                    <label className="md:col-span-2">
                      <span className="text-xs font-medium uppercase text-slate-500">
                        Reason
                      </span>
                      <input
                        name="reason"
                        defaultValue={gap.suggestedAction}
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                    <button className="h-10 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800 md:col-start-6">
                      Create Task
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Documentation Tasks</h3>
          <span className="text-sm text-slate-500">
            Last reviewed {formatDate(detail.lastReviewedAt)}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {detail.tasks.length === 0 ? (
            <p className="text-sm text-slate-600">
              No documentation tasks have been created for this encounter.
            </p>
          ) : (
            detail.tasks.map((task) => (
              <article
                key={task.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="mt-2 text-xs uppercase text-slate-500">
                  {task.status.replaceAll("_", " ")} · {priorityLabels[task.priority]}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{task.reason}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
