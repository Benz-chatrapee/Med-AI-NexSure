import { AlertTriangle, LockKeyhole, ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { ClinicUsersSummary } from "../types/user-management.types";

const items = [
  ["Failed Login Alerts", "failedLoginAlerts", "danger"],
  ["Locked Accounts", "lockedAccounts", "danger"],
  ["Password Reset Requests", "passwordResetRequests", "warning"],
  ["Inactive Accounts", "inactiveOver30Days", "warning"],
  ["Suspicious Activity", "suspiciousActivity", "danger"],
  ["MFA Enabled", "mfaEnabledUsers", "success"],
  ["Privileged Users", "privilegedAccounts", "warning"],
  ["Dormant Accounts", "dormantAccounts", "warning"],
] as const;

export function SecurityIntelligencePanel({ summary }: { summary?: ClinicUsersSummary }) {
  const total = Math.max(summary?.totalUsers ?? 1, 1);
  const critical = summary?.criticalSecurityAlerts ?? 0;
  return (
    <section className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.6fr)]" aria-label="Security intelligence overview">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#0F2A5F]">Security Overview</h2>
            <p className="text-sm text-slate-500">Operational signals for access risk, dormant accounts, MFA posture and audit readiness.</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-black ${critical ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {critical} Critical Security Alerts
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map(([label, key, tone]) => {
            const value = Number(summary?.[key] ?? 0);
            return <SecurityMetric key={key} label={label} value={value} total={total} tone={tone} />;
          })}
        </div>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-[#0F2A5F]"><ShieldCheck size={18} /><h2 className="font-black">Audit Ready Experience</h2></div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Every row exposes role, scope, AI access, security posture, last login, and latest audit state. ข้อมูลนี้เป็น decision support สำหรับผู้ดูแลระบบเท่านั้น</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <AuditTile icon={UserCheck} label="MFA Coverage" value={`${Math.round(((summary?.mfaEnabledUsers ?? 0) / total) * 100)}%`} />
          <AuditTile icon={LockKeyhole} label="Locked" value={String(summary?.lockedAccounts ?? 0)} />
          <AuditTile icon={AlertTriangle} label="Failed Logins" value={String(summary?.failedLoginAlerts ?? 0)} />
          <AuditTile icon={UserX} label="Never Login" value={String(summary?.neverLoggedIn ?? 0)} />
        </div>
      </div>
    </section>
  );
}

function SecurityMetric({ label, value, total, tone }: { label: string; value: number; total: number; tone: "success" | "warning" | "danger" }) {
  const percent = Math.min(100, Math.round((value / total) * 100));
  const color = tone === "success" ? "bg-emerald-600" : tone === "warning" ? "bg-amber-600" : "bg-red-600";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex justify-between gap-3 text-xs font-black text-slate-600"><span>{label}</span><span>{value}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

function AuditTile({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return <div className="rounded-lg border border-blue-200 bg-white p-3"><Icon className="text-blue-700" size={16} /><div className="mt-2 text-lg font-black text-slate-950">{value}</div><div className="text-xs font-bold text-slate-500">{label}</div></div>;
}
