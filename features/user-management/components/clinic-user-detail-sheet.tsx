import { Activity, Lock, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { aiAccessLevelLabels, dataAccessLevelLabels, maskProfessionalLicense, permissionDescriptions, permissionLabels, roleLabels } from "../constants/clinic-user-options";
import type { ClinicUser, ClinicUserAiPermissions } from "../types/user-management.types";
import { AiAccessBadge, Badge, StatusBadge } from "./status-badges";

const tabs = ["Overview", "Access Scope", "AI Permissions", "Security", "Audit Trail"] as const;
type TabName = (typeof tabs)[number];

export function ClinicUserDetailSheet({
  user,
  loading,
  open,
  onClose,
  onRevokeSessions,
  onUnlock,
  onUpdateAi,
  onEdit,
  onViewAudit,
  aiPending,
}: {
  user?: ClinicUser;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onRevokeSessions: (userId: string) => void;
  onUnlock: (userId: string) => void;
  onUpdateAi: (userId: string, permissions: ClinicUserAiPermissions, reason: string) => void;
  onEdit: (userId: string) => void;
  onViewAudit: (userId: string) => void;
  aiPending: boolean;
}) {
  const [tab, setTab] = useState<TabName>("Overview");
  const [permissions, setPermissions] = useState<ClinicUserAiPermissions | null>(null);
  const [reason, setReason] = useState("");

  if (!open) return null;
  const activePermissions = permissions ?? user?.aiPermissions;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45" role="presentation">
      <aside role="dialog" aria-modal="true" aria-labelledby="clinic-user-detail-title" className="ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          {loading || !user ? (
            <div className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-blue-50 text-sm font-black text-blue-800">{user.initials}</div>
              <div className="min-w-0">
                <h2 id="clinic-user-detail-title" className="truncate text-xl font-black text-[#0F2A5F]">{user.fullName}</h2>
                <p className="text-sm font-semibold text-slate-500">{user.email}</p>
                <div className="mt-2"><StatusBadge status={user.status} /></div>
              </div>
            </div>
          )}
          <Button aria-label="Close user detail" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X size={17} aria-hidden="true" />
          </Button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4" role="tablist" aria-label="User detail sections">
          {tabs.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-11 whitespace-nowrap border-b-2 px-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${tab === item ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading || !user ? <div className="h-64 animate-pulse rounded-2xl bg-slate-100" /> : null}
          {user && tab === "Overview" ? (
            <DetailGrid>
              <Detail label="Employee ID" value={user.employeeId} />
              <Detail label="Job Title" value={user.jobTitle ?? "Not assigned"} />
              <Detail label="Primary Role" value={roleLabels[user.primaryRole]} />
              <Detail label="Department" value={user.departmentName ?? "Unassigned"} />
              <Detail label="Professional License" value={maskProfessionalLicense(user.professionalLicense)} />
              <Detail label="MFA Status" value={user.mfaEnabled ? "Enabled" : "Pending"} />
              <Detail label="Clinic Access" value={user.clinicScopes.map((scope) => scope.clinicName).join(", ")} wide />
            </DetailGrid>
          ) : null}
          {user && tab === "Access Scope" ? (
            <div className="space-y-4">
              <Panel title="Effective Permission Scope" helper="Read and update data only within assigned clinic and department scope.">
                <InfoLine label="Data Access Level" value={dataAccessLevelLabels[user.clinicScopes[0]?.dataAccessLevel ?? "assigned_clinic"]} />
                <InfoLine label="Assigned Clinic" value={user.clinicScopes.map((scope) => scope.clinicName).join(", ")} />
                <InfoLine label="Assigned Department" value={user.departmentName ?? "Unassigned"} />
                <InfoLine label="Primary Role" value={roleLabels[user.primaryRole]} />
              </Panel>
              <Panel title="Additional Roles" helper="Role source: direct assignment from Clinic Admin.">
                {user.additionalRoles.length ? user.additionalRoles.map((role) => <Badge key={role} tone="info">{roleLabels[role]}</Badge>) : <span className="text-sm font-semibold text-slate-500">No additional roles</span>}
              </Panel>
            </div>
          ) : null}
          {user && activePermissions && tab === "AI Permissions" ? (
            <div className="space-y-4">
              <Panel title="AI Clinical Engine Access">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{aiAccessLevelLabels[user.aiAccessLevel]}</p>
                    <p className="text-sm text-slate-500">AI assists clinical decisions and must not operate as an autonomous decision maker.</p>
                  </div>
                  <AiAccessBadge status={user.aiAccessStatus} level={user.aiAccessLevel} />
                </div>
              </Panel>
              <div className="space-y-2">
                {Object.entries(permissionLabels).map(([key, label]) => {
                  const permissionKey = key as keyof ClinicUserAiPermissions;
                  const disabled = permissionKey === "overrideAiWarning" && user.primaryRole !== "clinic_admin";
                  return (
                    <label key={key} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
                      <span>
                        <span className="block text-sm font-black text-slate-800">{label}</span>
                        <span className="block text-xs leading-5 text-slate-500">{permissionDescriptions[permissionKey]}</span>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={label}
                        checked={activePermissions[permissionKey]}
                        disabled={disabled}
                        onChange={(event) => setPermissions({ ...activePermissions, [permissionKey]: event.currentTarget.checked })}
                        className="h-5 w-9 accent-blue-800 disabled:opacity-50"
                      />
                    </label>
                  );
                })}
              </div>
              {activePermissions.overrideAiWarning ? (
                <label className="block text-sm font-black text-slate-700">
                  Override reason <span className="text-red-700">*</span>
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" aria-describedby="override-reason-help" />
                  <span id="override-reason-help" className="mt-1 block text-xs font-semibold text-amber-800">ต้องระบุเหตุผลสำหรับ high-risk permission และบันทึก audit metadata</span>
                </label>
              ) : null}
              <Button
                disabled={aiPending || (activePermissions.overrideAiWarning && reason.trim().length < 8)}
                onClick={() => onUpdateAi(user.id, activePermissions, reason || "AI permission reviewed by Clinic Admin")}
                className="rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {aiPending ? "Saving..." : "Save AI Permissions"}
              </Button>
            </div>
          ) : null}
          {user && tab === "Security" ? (
            <div className="space-y-4">
              <DetailGrid>
                <Detail label="Last Login" value={formatDate(user.lastLoginAt)} />
                <Detail label="Last Active" value={formatDate(user.lastActiveAt)} />
                <Detail label="Failed Attempts" value={String(user.security.failedAttempts)} />
                <Detail label="Active Sessions" value={`${user.security.activeSessions} sessions`} />
                <Detail label="Current Session" value={user.security.currentSession} wide />
                <Detail label="Browser / Device" value={user.security.browserDevice} />
                <Detail label="Location" value={user.security.location} />
                <Detail label="Masked IP Address" value={user.security.maskedIpAddress} />
                <Detail label="MFA Verification" value={user.security.mfaVerified ? "Verified" : "Pending"} />
              </DetailGrid>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onRevokeSessions(user.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-black text-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500"><Lock size={15} />Revoke All Sessions</Button>
                <Button onClick={() => onRevokeSessions(user.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Reset MFA</Button>
                {user.status === "locked" ? <Button onClick={() => onUnlock(user.id)} className="rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500">Unlock Account</Button> : null}
              </div>
            </div>
          ) : null}
          {user && tab === "Audit Trail" ? (
            <ol className="space-y-4 border-l-2 border-blue-200 pl-4">
              {user.auditTrail.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[23px] top-1 grid h-3 w-3 place-items-center rounded-full bg-blue-700 ring-4 ring-blue-100" />
                  <p className="font-black text-[#0F2A5F]">{event.event}</p>
                  <p className="text-xs font-semibold text-slate-500">{event.actor} - {formatDate(event.occurredAt)}</p>
                  <p className="text-xs leading-5 text-slate-500">Reason: {event.reason} - Source: {event.source} - Result: {event.result}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
          <Button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Close</Button>
          {user ? <Link href={`/admin/users/${user.id}`} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Open Detail Page</Link> : null}
          {user ? <Button onClick={() => onEdit(user.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Edit User</Button> : null}
          {user ? <Button onClick={() => onViewAudit(user.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">View Audit</Button> : null}
          <Button onClick={() => user && setTab("AI Permissions")} className="inline-flex items-center gap-2 rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><ShieldCheck size={15} />Manage Access</Button>
        </div>
      </aside>
    </div>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
      <strong className="mt-1 block text-sm text-slate-900">{value}</strong>
    </div>
  );
}

function Panel({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-2">
        <Activity size={17} className="mt-0.5 text-blue-700" aria-hidden="true" />
        <div>
          <h3 className="font-black text-slate-900">{title}</h3>
          {helper ? <p className="text-sm leading-6 text-slate-500">{helper}</p> : null}
        </div>
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-0"><span className="font-semibold text-slate-500">{label}</span><strong className="text-right text-slate-800">{value}</strong></div>;
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
}
