"use client";

import { CLINICS, CREATE_USER_ROLES, ORGANIZATIONS } from "../constants/create-user-options";
import type { CreateUserFormValues } from "../types/user-management.types";
import { calculateCompletion, getInitials } from "../utils/create-user-utils";

export function UserSummary({ values }: { values: CreateUserFormValues }) {
  const percent = calculateCompletion(values);
  const name = values.displayName || [values.firstName, values.lastName].filter(Boolean).join(" ") || "New User";
  const organization = ORGANIZATIONS.find((item) => item.id === values.organizationId)?.name || "-";
  const clinic = (CLINICS[values.organizationId] || []).find((item) => item.id === values.clinicId)?.name || "-";
  const role = CREATE_USER_ROLES.find((item) => item.id === values.primaryRole)?.name || "Not selected";
  const risks = [
    !values.primaryRole && "ยังไม่ได้เลือก Primary Role",
    (values.primaryRole === "doctor" || values.primaryRole === "pharmacist") && !values.licenseNumber && "Professional License is required",
    values.accessScope === "organization_wide" && "Organization-wide Access ต้องผ่าน Elevated Access Review",
  ].filter((risk): risk is string => Boolean(risk));

  return (
    <aside className="space-y-4 xl:sticky xl:top-[90px] xl:self-start">
      <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-xl font-black text-blue-900">{getInitials(values.firstName, values.lastName)}</div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-slate-500">{values.email || "Email not entered"}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs font-bold"><span>Configuration Completion</span><span>{percent}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} /></div>
        </div>
        <dl className="mt-5 divide-y text-sm">
          {[
            ["Organization", organization],
            ["Primary Clinic", clinic],
            ["Department", values.departmentId || "-"],
            ["Primary Role", role],
            ["Access Scope", values.accessScope],
            ["MFA", values.requireMfa ? "Enabled" : "Disabled"],
            ["Invitation", values.sendInvitation ? "Enabled" : "Disabled"],
          ].map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3 py-3">
              <dt className="text-slate-500">{key}</dt>
              <dd className="max-w-[58%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold">Security & Access Review</h3>
        <div className="mt-3 space-y-2">
          {risks.length ? (
            risks.map((risk) => <div key={risk} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Warning: {risk}</div>)
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">ไม่พบความเสี่ยงสำคัญ</div>
          )}
        </div>
      </section>
    </aside>
  );
}
