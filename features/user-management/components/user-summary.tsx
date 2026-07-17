"use client";

import { CLINICS, CREATE_USER_ROLES, ORGANIZATIONS } from "../constants/create-user-options";
import type { CreateUserFormValues } from "../types/user-management.types";
import { calculateAccessRisk } from "../utils/access-risk";
import { calculateCompletion, getInitials } from "../utils/create-user-utils";

export function UserSummary({ values }: { values: CreateUserFormValues }) {
  const percent = calculateCompletion(values);
  const name = values.displayName || [values.firstName, values.lastName].filter(Boolean).join(" ") || "New User";
  const organization = ORGANIZATIONS.find((item) => item.id === values.organizationId)?.name || "-";
  const clinic = (CLINICS[values.organizationId] || []).find((item) => item.id === values.clinicId)?.name || "-";
  const additionalClinics = (CLINICS[values.organizationId] || []).filter((item) => values.additionalClinics.includes(item.id)).map((item) => item.name);
  const role = CREATE_USER_ROLES.find((item) => item.id === values.primaryRole)?.name || "Not selected";
  const risk = calculateAccessRisk(values);
  const riskClass = risk.level === "Critical" || risk.level === "High" ? "border-red-200 bg-[var(--nx-danger-bg)] text-red-700" : risk.level === "Medium" ? "border-amber-200 bg-[var(--nx-warning-bg)] text-amber-700" : "border-emerald-200 bg-[var(--nx-success-bg)] text-emerald-700";
  const missing = [
    !values.firstName.trim() ? "First Name" : "",
    !values.lastName.trim() ? "Last Name" : "",
    !values.displayName.trim() ? "Display Name" : "",
    !values.email.trim() ? "Email Address" : "",
    !values.organizationId ? "Organization" : "",
    !values.primaryRole ? "Primary Role" : "",
  ].filter(Boolean);

  return (
    <aside className="space-y-4 xl:sticky xl:top-20 xl:col-span-4 xl:self-start">
      <section className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-5 shadow-sm">
        <h2 className="mb-1 font-['Inter'] text-[18px] font-semibold leading-6 text-[var(--nx-text)]">Access Review</h2>
        <p className="mb-4 font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]">ตรวจสอบข้อมูลก่อนสร้างบัญชีและส่ง audit metadata</p>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--nx-info-bg)] font-['Inter'] text-[14px] font-bold leading-5 text-[var(--nx-primary)]">{getInitials(values.firstName, values.lastName)}</div>
          <div>
            <h3 className="font-['Inter'] text-[14px] font-semibold leading-5">{name}</h3>
            <p className="font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]">{values.email || "Email not entered"}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between font-['Inter'] text-[13px] font-semibold leading-5"><span>Profile Completeness</span><span>{percent}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-[var(--nx-primary)]" style={{ width: `${percent}%` }} /></div>
        </div>
        <div className={`mt-5 rounded-[8px] border p-3 font-['Inter'] text-[12px] font-semibold leading-4 ${riskClass}`}>
          <div className="flex items-center justify-between"><span>Security-First Status</span><span>{risk.level}</span></div>
          <div className="mt-2 font-['IBM_Plex_Sans'] text-[24px] font-semibold leading-8">Risk Score {risk.score}/100</div>
          <p className="mt-1 font-normal text-[var(--nx-text)]">Score reflects scope, admin, export, audit, AI override, and cross-clinic factors.</p>
        </div>
        <dl className="mt-5 divide-y divide-[var(--nx-border)] font-['Inter'] text-[13px] leading-5">
          {[
            ["Organization", organization],
            ["Primary Clinic", clinic],
            ["Additional Clinics", additionalClinics.join(", ") || "-"],
            ["Primary Role", role],
            ["AI Access", values.aiEnabled ? "Enabled" : "Disabled"],
            ["Patient Data Scope", values.patientDataAccess.replaceAll("_", " ")],
            ["Claim Access", values.claimDataAccess.join(", ") || "No Access"],
            ["Audit Access", values.auditLogAccess.replaceAll("_", " ")],
            ["Export Access", values.exportPermissions.join(", ")],
            ["Authentication", values.authenticationMethod.replaceAll("_", " ")],
            ["MFA", values.requireMfa ? "Enabled" : "Disabled"],
            ["Account Status", values.accountStatus],
          ].map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3 py-3">
              <dt className="text-[var(--nx-secondary)]">{key}</dt>
              <dd className="max-w-[58%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-5 shadow-sm">
        <h3 className="font-['Inter'] text-[17px] font-semibold leading-6 text-[var(--nx-text)]">Permission Summary</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <SummaryMetric label="Inherited" value={risk.inheritedCount} />
          <SummaryMetric label="Custom" value={risk.customCount} />
          <SummaryMetric label="High Risk" value={risk.highRiskCount} />
          <SummaryMetric label="Conflicts" value={risk.conflictCount} />
        </div>
      </section>
      <section className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-5 shadow-sm">
        <h3 className="font-['Inter'] text-[17px] font-semibold leading-6 text-[var(--nx-text)]">Validation Summary</h3>
        {missing.length ? <p className="mt-2 font-['Inter'] text-[13px] leading-5 text-[var(--nx-danger)]">Missing required: {missing.join(", ")}</p> : <p className="mt-2 font-['Inter'] text-[13px] leading-5 text-[var(--nx-secondary)]">Required information is complete. กรุณาตรวจสอบสิทธิ์ก่อน Create User</p>}
        <h3 className="mt-5 font-['Inter'] text-[17px] font-semibold leading-6 text-[var(--nx-text)]">Risk Factors</h3>
        <div className="mt-2 flex flex-wrap gap-2">{risk.factors.length ? risk.factors.map((factor) => <span key={factor} className="rounded-full bg-[var(--nx-danger-bg)] px-2 py-1 font-['Inter'] text-[12px] font-semibold leading-4 text-red-700">{factor}</span>) : <span className="rounded-full bg-slate-100 px-2 py-1 font-['Inter'] text-[12px] font-semibold leading-4 text-slate-700">No high-risk factors</span>}</div>
        <h3 className="mt-5 font-['Inter'] text-[17px] font-semibold leading-6 text-[var(--nx-text)]">Permission Risk Alerts</h3>
        <div className="mt-3 space-y-2">
          {risk.alerts.length ? (
            risk.alerts.map((alert) => <div key={alert} className="rounded-xl border border-red-200 bg-[var(--nx-danger-bg)] p-3 font-['Inter'] text-[13px] leading-5 text-red-700">Warning: {alert}</div>)
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-[var(--nx-success-bg)] p-3 font-['Inter'] text-[13px] leading-5 text-emerald-700">ไม่พบความเสี่ยงสำคัญ</div>
          )}
        </div>
      </section>
    </aside>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-info-bg)] p-3"><div className="font-['Inter'] text-[18px] font-bold leading-6 text-[var(--nx-text)]">{value}</div><div className="font-['Inter'] text-[12px] font-semibold leading-4 text-[var(--nx-secondary)]">{label}</div></div>;
}
