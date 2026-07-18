"use client";

import { BadgeCheck, Bot, FileText, LockKeyhole, MapPin, Send, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { CLINICS, CREATE_USER_ROLES, ORGANIZATIONS } from "../constants/create-user-options";
import type { CreateUserFormValues } from "../types/user-management.types";
import { calculateAccessRisk } from "../utils/access-risk";
import { calculateCompletion, getInitials } from "../utils/create-user-utils";

export function UserSummary({
  values,
  saving,
  createDisabled,
  onDraft,
  onCreate,
}: {
  values: CreateUserFormValues;
  saving: "draft" | "create" | null;
  createDisabled: boolean;
  onDraft: () => void;
  onCreate: () => void;
}) {
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
    <aside className="w-full space-y-4 md:w-[360px] md:shrink-0 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-auto">
      <section className="overflow-hidden rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] shadow-lg">
        <div className="bg-[var(--nx-primary)] p-4 text-white">
          <h2 className="font-['Inter'] text-[14px] font-bold uppercase leading-5 tracking-wider">User Access Summary</h2>
          <p className="mt-0.5 font-['Inter'] text-[12px] leading-4 text-white/70">Draft Profile Configuration</p>
        </div>
        <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-[var(--nx-surface-low)] font-['Inter'] text-[14px] font-bold leading-5 text-[var(--nx-primary)] shadow-sm">{getInitials(values.firstName, values.lastName) || <UserRound className="h-5 w-5" aria-hidden="true" />}</div>
          <div>
            <h3 className="font-['Inter'] text-[16px] font-bold leading-5">{name}</h3>
            <p className="font-['Inter'] text-[12px] leading-5 text-[var(--nx-secondary)]">{values.sendInvitation ? "Pending Invite" : values.email || "Email not entered"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SummaryPill icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />} label={role === "Not selected" ? "ROLE TBD" : role.toUpperCase()} tone="primary" />
          <SummaryPill icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />} label={values.accessScope.replaceAll("_", " ").toUpperCase()} tone="neutral" />
          <SummaryPill icon={<LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />} label={values.requireMfa ? "MFA REQ" : "MFA OFF"} tone="blue" />
          <SummaryPill icon={<Bot className="h-3.5 w-3.5" aria-hidden="true" />} label={values.aiEnabled ? "AI ASSISTED" : "AI LIMITED"} tone="blue" />
          <SummaryPill icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />} label="AUDIT ENABLED" tone="neutral" />
        </div>
        <div className="mt-5 border-t border-[var(--nx-border)] pt-4">
          <div className="mb-1 flex justify-between font-['Inter'] text-[12px] font-semibold leading-5 text-[var(--nx-secondary)]"><span>Access Risk Level</span><span className="text-[var(--nx-primary)]">{risk.level}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--nx-surface-low)]"><div className="h-full rounded-full bg-[var(--nx-primary)]" style={{ width: `${Math.min(risk.score, 100)}%` }} /></div>
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
        </div>
      </section>
      <section className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-surface)] p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-['Inter'] text-[12px] font-bold uppercase leading-5 tracking-wider text-[var(--nx-secondary)]"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Compliance & Audit</h3>
        <div className="mt-4 space-y-3">
          <ComplianceRow title="PDPA Aware" text="Data handling matches Thai law." tone="success" />
          <ComplianceRow title="Audit Ready" text="Full action logging enabled." tone="primary" />
        </div>
        <h3 className="mt-5 font-['Inter'] text-[17px] font-semibold leading-6 text-[var(--nx-text)]">Permission Summary</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <SummaryMetric label="Inherited" value={risk.inheritedCount} />
          <SummaryMetric label="Custom" value={risk.customCount} />
          <SummaryMetric label="High Risk" value={risk.highRiskCount} />
          <SummaryMetric label="Conflicts" value={risk.conflictCount} />
        </div>
      </section>
      <section className="space-y-3 pt-1">
        <button type="button" disabled={createDisabled} onClick={onCreate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nx-primary)] py-3.5 font-['Inter'] text-[14px] font-bold text-white shadow-md transition-colors hover:bg-[var(--nx-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)] disabled:opacity-60">
          <Send className="h-4 w-4" aria-hidden="true" />
          {saving === "create" ? "Creating..." : values.sendInvitation ? "Create User & Send Invitation" : "Create User"}
        </button>
        <button type="button" disabled={Boolean(saving)} onClick={onDraft} className="w-full rounded-xl border border-[color:color-mix(in_srgb,var(--nx-primary)_20%,white)] bg-white py-3.5 font-['Inter'] text-[14px] font-bold text-[var(--nx-primary)] transition-colors hover:bg-[var(--nx-surface-low)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)] disabled:opacity-60">{saving === "draft" ? "Saving..." : "Save as Draft"}</button>
        <button type="button" onClick={() => history.back()} className="w-full py-2 font-['Inter'] text-[14px] font-medium text-[var(--nx-secondary)] transition-colors hover:text-[var(--nx-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--nx-focus)]">Cancel</button>
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

function SummaryPill({ icon, label, tone }: { icon: ReactNode; label: string; tone: "primary" | "blue" | "neutral" }) {
  const classes = tone === "primary" ? "bg-[color:color-mix(in_srgb,var(--nx-focus)_34%,white)] text-[var(--nx-primary)]" : tone === "blue" ? "bg-[color:color-mix(in_srgb,var(--nx-ai)_12%,white)] text-[var(--nx-ai)]" : "bg-[var(--nx-surface-low)] text-[var(--nx-secondary)]";
  return <span className={`flex items-center gap-1 rounded px-2 py-1 font-['Inter'] text-[10px] font-bold ${classes}`}>{icon}{label}</span>;
}

function ComplianceRow({ title, text, tone }: { title: string; text: string; tone: "success" | "primary" }) {
  const classes = tone === "success" ? "border-emerald-200 bg-[var(--nx-success-bg)] text-emerald-700" : "border-[color:color-mix(in_srgb,var(--nx-primary)_20%,white)] bg-[color:color-mix(in_srgb,var(--nx-primary)_5%,white)] text-[var(--nx-primary)]";
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${classes}`}>
      <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-['Inter'] text-[12px] font-bold leading-4 text-[var(--nx-text)]">{title}</p>
        <p className="font-['Inter'] text-[10px] leading-4 text-[var(--nx-secondary)]">{text}</p>
      </div>
    </div>
  );
}
