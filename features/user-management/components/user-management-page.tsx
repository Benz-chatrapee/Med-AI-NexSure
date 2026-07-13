"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, Bot, Download, Eye, Lock, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteUserSchema, type InviteUserFormValues } from "../schemas/user-schema";
import { useUserManagement } from "../hooks/use-user-management";
import type { AIAccessLevel, GovernanceSeverity, UserAccount, UserAccountStatus, UserFilters, UserSummary } from "../types/user-management.types";

type Workspace = ReturnType<typeof useUserManagement>;
type Tone = "blue" | "green" | "amber" | "red" | "slate";

const navItems = ["Dashboard", "Patients", "Visits", "SOAP", "Claim Readiness", "Evidence Package", "Insurance Rules", "Audit & Compliance", "Admin Settings"];

export function UserManagementPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <UserManagementWorkspace />
    </QueryClientProvider>
  );
}

function UserManagementWorkspace() {
  const workspace = useUserManagement();
  const permissions = workspace.permissionsQuery.data;

  if (workspace.permissionsQuery.isLoading) return <PageSkeleton />;
  if (!permissions?.canView) return <AccessDenied reason={permissions?.readOnlyReason ?? "Your role does not include User Administration access."} />;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 min-[1040px]:grid-cols-[286px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-7">
          <Header workspace={workspace} />
          {workspace.actionMessage ? <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900" role="status">{workspace.actionMessage}</div> : null}
          <KpiGrid workspace={workspace} />
          <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-5">
              <UserDirectory workspace={workspace} />
              <RolePermissionMatrix workspace={workspace} />
              <AIPermissionPanel workspace={workspace} />
            </div>
            <aside className="space-y-5">
              <GovernanceAlerts workspace={workspace} />
              <GovernanceQueue workspace={workspace} />
              <RecentActivity workspace={workspace} />
            </aside>
          </section>
        </div>
      </div>
      <UserDetailSheet workspace={workspace} />
      <InviteUserDialog workspace={workspace} />
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden bg-gradient-to-b from-[#0F2A5F] to-[#071936] px-5 py-7 text-white min-[1040px]:block" aria-label="Main navigation">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 text-base font-black shadow-lg">AI</div>
        <div>
          <div className="font-black">Med AI NexSure</div>
          <p className="text-xs text-blue-100">Enterprise Healthcare & Insurance</p>
        </div>
      </div>
      <nav className="mt-8" aria-label="Platform sections">
        {navItems.map((item) => (
          <a key={item} href={item === "Admin Settings" ? "/admin/users" : "#"} className={`mb-1.5 block rounded-xl px-3.5 py-3 text-sm font-bold ${item === "Admin Settings" ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10"}`}>
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function Header({ workspace }: { workspace: Workspace }) {
  const permissions = workspace.permissionsQuery.data;
  return (
    <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav className="text-xs font-black uppercase tracking-wide text-blue-700" aria-label="Breadcrumb">Admin Settings / Access Governance</nav>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F2A5F]">User Role Management</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">Centralized identity, role, clinic access, AI permission, PDPA validation, and audit governance.</p>
          <p className="mt-1 text-sm text-slate-500">บริหารผู้ใช้งาน บทบาท ขอบเขตการเข้าถึง และสิทธิ์ AI อย่างปลอดภัยและตรวจสอบย้อนหลังได้</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<ShieldCheck size={16} />} label="Review Security" onClick={() => document.getElementById("governance-alerts")?.focus()} disabled={!permissions?.canReviewSecurity} />
          <ActionButton icon={<Download size={16} />} label="Export Audit" disabled={!permissions?.canExportAudit} title={!permissions?.canExportAudit ? "Export audit permission is required" : undefined} />
          <ActionButton icon={<UserPlus size={16} />} label="Invite User" onClick={() => workspace.setInviteOpen(true)} disabled={!permissions?.canInvite} variant="primary" />
        </div>
      </div>
    </header>
  );
}

function KpiGrid({ workspace }: { workspace: Workspace }) {
  const summary = workspace.summaryQuery.data;
  const cards = getKpiCards(summary);
  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" aria-label="User management KPI filters">
      {cards.map((card) => (
        <button key={card.label} type="button" onClick={() => workspace.updateFilters({ ...card.filter, page: 1 })} className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${card.active(workspace.filters) ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200"}`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">{card.label}</span>
            <Badge tone={card.tone}>{card.badge}</Badge>
          </div>
          <strong className="mt-3 block text-3xl font-black text-[#0F2A5F]">{workspace.summaryQuery.isLoading ? "..." : card.value}</strong>
          <span className="mt-2 block text-xs font-semibold text-slate-500">{card.helper}</span>
        </button>
      ))}
    </section>
  );
}

function UserDirectory({ workspace }: { workspace: Workspace }) {
  const data = workspace.usersQuery.data;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / workspace.filters.pageSize));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="directory-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="directory-title" className="text-lg font-black text-[#0F2A5F]">User Directory</h2>
          <p className="text-sm text-slate-500">ค้นหาและตรวจสอบขอบเขตสิทธิ์ผู้ใช้งานตามบทบาท คลินิก และ AI access</p>
        </div>
        <span className="text-sm font-bold text-slate-600">{data?.total ?? 0} results</span>
      </div>
      <DirectoryToolbar workspace={workspace} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              {["User", "Role", "Department", "Organization / Clinic Scope", "AI Access", "Account Status", "Last Login", "Actions"].map((head) => (
                <th key={head} scope="col" className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspace.usersQuery.isLoading ? <TableSkeleton /> : null}
            {workspace.usersQuery.isError ? <ErrorRow onRetry={() => void workspace.usersQuery.refetch()} /> : null}
            {!workspace.usersQuery.isLoading && !workspace.usersQuery.isError && data?.users.length === 0 ? <EmptyRow clearFilters={workspace.clearFilters} /> : null}
            {data?.users.map((user) => <UserRow key={user.id} user={user} workspace={workspace} />)}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-bold text-slate-600">Page size <select value={workspace.filters.pageSize} onChange={(event) => workspace.updateFilters({ pageSize: Number(event.target.value), page: 1 })} className={selectClass}><option value={5}>5</option><option value={10}>10</option><option value={25}>25</option></select></label>
        <div className="flex items-center gap-2">
          <ActionButton label="Previous" disabled={workspace.filters.page <= 1} onClick={() => workspace.updateFilters({ page: workspace.filters.page - 1 })} />
          <span className="text-sm font-bold text-slate-600">Page {workspace.filters.page} of {totalPages}</span>
          <ActionButton label="Next" disabled={workspace.filters.page >= totalPages} onClick={() => workspace.updateFilters({ page: workspace.filters.page + 1 })} />
        </div>
      </div>
    </section>
  );
}

function DirectoryToolbar({ workspace }: { workspace: Workspace }) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(130px,1fr))_auto]">
      <label className="relative block">
        <span className="sr-only">Search users</span>
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input value={workspace.filters.search} onChange={(event) => workspace.updateFilters({ search: event.target.value, page: 1 })} placeholder="Search user, email, staff ID" className={`${inputClass} pl-9`} />
      </label>
      <FilterSelect label="Status" value={workspace.filters.status} onChange={(value) => workspace.updateFilters({ status: value as UserFilters["status"], page: 1 })} options={["all", "active", "pending", "locked", "disabled", "expired"]} />
      <FilterSelect label="Role" value={workspace.filters.role} onChange={(role) => workspace.updateFilters({ role, page: 1 })} options={["all", "admin", "clinic_admin", "auditor", "claim_reviewer", "clinician"]} />
      <FilterSelect label="Department" value={workspace.filters.departmentId} onChange={(departmentId) => workspace.updateFilters({ departmentId, page: 1 })} options={["all", "clinical", "claims", "compliance", "ops"]} />
      <FilterSelect label="AI Access" value={workspace.filters.aiAccess} onChange={(aiAccess) => workspace.updateFilters({ aiAccess: aiAccess as UserFilters["aiAccess"], page: 1 })} options={["all", "enabled", "restricted", "not_allowed"]} />
      <FilterSelect label="Sort" value={workspace.filters.sortBy} onChange={(sortBy) => workspace.updateFilters({ sortBy: sortBy as UserFilters["sortBy"] })} options={["displayName", "role", "department", "status", "lastLoginAt"]} />
      <ActionButton label="Clear" onClick={workspace.clearFilters} />
    </div>
  );
}

function UserRow({ user, workspace }: { user: UserAccount; workspace: Workspace }) {
  return (
    <tr className="align-top">
      <td className="border-b border-slate-100 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">{initials(user.displayName)}</div>
          <div><div className="font-black text-slate-900">{user.displayName}</div><div className="text-xs font-semibold text-slate-500">{user.email}</div><div className="text-xs text-slate-400">{user.staffId}</div></div>
        </div>
      </td>
      <td className="border-b border-slate-100 px-3 py-4">{user.roles.map((role) => <Badge key={role.id} tone={role.isHighPrivilege ? "amber" : "blue"}>{role.name}</Badge>)}</td>
      <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-600">{user.department?.name}</td>
      <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{user.accessScope[0]?.organizationName}<br /><span className="text-xs text-slate-500">{user.accessScope[0]?.clinicNames.join(", ")}</span></td>
      <td className="border-b border-slate-100 px-3 py-4"><Badge tone={aiTone(user.aiAccessLevel)}>{labelize(user.aiAccessLevel)}</Badge>{user.consentRequired ? <Badge tone="amber">Consent required</Badge> : null}</td>
      <td className="border-b border-slate-100 px-3 py-4"><Badge tone={statusTone(user.status)}>{labelize(user.status)}</Badge>{user.mfaEnabled ? <div className="mt-1 text-xs font-bold text-green-700">MFA enabled</div> : <div className="mt-1 text-xs font-bold text-amber-700">MFA pending</div>}</td>
      <td className="border-b border-slate-100 px-3 py-4 text-xs font-semibold text-slate-500">{formatDate(user.lastLoginAt)}</td>
      <td className="border-b border-slate-100 px-3 py-4"><ActionButton icon={<Eye size={15} />} label="Details" onClick={() => workspace.setSelectedUserId(user.id)} /></td>
    </tr>
  );
}

function RolePermissionMatrix({ workspace }: { workspace: Workspace }) {
  const [dirty, setDirty] = useState(false);
  const domains = ["Patient Data", "SOAP Note", "Claim Case", "Evidence Export", "Audit Log", "User Administration", "Payer Rule Administration"];
  const actions = ["View", "Create", "Edit", "Export", "Administer"];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="matrix-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 id="matrix-title" className="text-lg font-black text-[#0F2A5F]">Role & Permission Matrix</h2><p className="text-sm text-slate-500">Inherited permissions are locked. การแก้สิทธิ์ระดับสูงต้องระบุเหตุผลเพื่อ audit</p></div>
        <div className="flex gap-2"><ActionButton label="Discard" disabled={!dirty} onClick={() => setDirty(false)} /><ActionButton label="Save" variant="primary" disabled={!dirty || !workspace.permissionsQuery.data?.canEdit} onClick={() => workspace.sensitiveActionMutation.mutate({ action: "permission-update", reason: "High-risk permission matrix review" })} /></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Domain</th>{actions.map((action) => <th key={action} className="px-3 py-2 text-left">{action}</th>)}</tr></thead>
          <tbody>{domains.map((domain) => <tr key={domain} className="border-t border-slate-100"><th className="px-3 py-3 text-left font-black text-slate-700">{domain}</th>{actions.map((action, index) => <td key={action} className="px-3 py-3"><label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" defaultChecked={index < 2} disabled={index === 0} onChange={() => setDirty(true)} className="h-4 w-4 rounded border-slate-300" />{index === 0 ? "Inherited" : action}</label></td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">Impacted users: 3 high-privilege accounts. Sensitive changes request audit metadata before applying.</p>
    </section>
  );
}

function AIPermissionPanel({ workspace }: { workspace: Workspace }) {
  const capabilities = ["AI SOAP Summary", "AI ICD Suggestion", "AI Claim Readiness", "AI Evidence Validation", "AI Economic Intelligence", "AI Recommendation Override"];
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm" aria-labelledby="ai-title">
      <div className="flex items-start gap-3"><Bot className="mt-1 text-blue-700" size={20} /><div><h2 id="ai-title" className="text-lg font-black text-[#0F2A5F]">AI Clinical Engine Access</h2><p className="text-sm font-semibold text-blue-900">AI assists clinical, coding, claim, and economic review. Final decisions remain with authorized users.</p><p className="text-sm text-blue-800">AI ใช้เพื่อสนับสนุนการตัดสินใจเท่านั้น ผู้มีอำนาจต้องตรวจสอบและยืนยันผลลัพธ์ทุกครั้ง</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {capabilities.map((capability) => {
          const override = capability.includes("Override");
          return (
            <label key={capability} className="flex items-start justify-between gap-4 rounded-xl border border-blue-100 bg-white p-3">
              <span><span className="block text-sm font-black text-slate-900">{capability}</span><span className="text-xs font-semibold text-slate-500">{override ? "Requires explicit justification and security administrator approval." : "View, generate, accept, and export levels are governed separately."}</span></span>
              <input type="checkbox" disabled={override || !workspace.permissionsQuery.data?.canManageAi} className="mt-1 h-5 w-5 rounded border-slate-300" aria-label={`${capability} permission`} />
            </label>
          );
        })}
      </div>
    </section>
  );
}

function GovernanceAlerts({ workspace }: { workspace: Workspace }) {
  const alerts = workspace.alertsQuery.data ?? [];
  return (
    <section id="governance-alerts" tabIndex={-1} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" aria-labelledby="alerts-title">
      <h2 id="alerts-title" className="text-lg font-black text-[#0F2A5F]">Security & Access Governance Alerts</h2>
      <div className="mt-4 space-y-3">{alerts.map((alert) => <div key={alert.id} className="rounded-xl border border-slate-200 p-3"><Badge tone={severityTone(alert.severity)}>{labelize(alert.severity)} severity</Badge><h3 className="mt-2 font-black text-slate-900">{alert.title}</h3><p className="text-sm text-slate-600">{alert.description}</p><p className="mt-2 text-xs font-bold text-slate-500">{alert.affectedUserCount} affected users / {alert.recommendedAction}</p><ActionButton label="Review" onClick={() => workspace.updateFilters({ highPrivilege: alert.severity === "high" ? "true" : workspace.filters.highPrivilege })} /></div>)}</div>
    </section>
  );
}

function GovernanceQueue({ workspace }: { workspace: Workspace }) {
  const summary = workspace.summaryQuery.data;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="queue-title">
      <h2 id="queue-title" className="text-lg font-black text-[#0F2A5F]">Governance Queue Snapshot</h2>
      <div className="mt-3 grid gap-3">
        <QueueButton label="Ready" count={summary?.activeUsers ?? 0} tone="green" helper="Verified accounts with no open issue" onClick={() => workspace.updateFilters({ status: "active" })} />
        <QueueButton label="Needs Review" count={(summary?.pendingInvites ?? 0) + (summary?.consentRequiredUsers ?? 0)} tone="amber" helper="Pending permission, consent, or security review" onClick={() => workspace.updateFilters({ consentRequired: "true" })} />
        <QueueButton label="Critical Risk" count={summary?.lockedAccounts ?? 0} tone="red" helper="Locked or policy-conflicting accounts" onClick={() => workspace.updateFilters({ status: "locked" })} />
      </div>
    </section>
  );
}

function RecentActivity({ workspace }: { workspace: Workspace }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="activity-title">
      <h2 id="activity-title" className="text-lg font-black text-[#0F2A5F]">Recent Access Activity</h2>
      <ol className="mt-4 space-y-3">{(workspace.activityQuery.data ?? []).map((event) => <li key={event.id} className="border-l-2 border-blue-200 pl-3"><div className="text-sm font-black text-slate-900">{event.eventType}</div><p className="text-xs text-slate-600">{event.actor} → {event.targetUser}</p><p className="text-xs text-slate-500">{formatDate(event.occurredAt)} / {event.scope}</p><a href={event.auditHref} className="text-xs font-black text-blue-700">View audit detail</a></li>)}</ol>
    </section>
  );
}

function UserDetailSheet({ workspace }: { workspace: Workspace }) {
  const user = workspace.selectedUserQuery.data;
  if (!workspace.selectedUserId) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45" role="presentation">
      <aside role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="ml-auto h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="user-detail-title" className="text-2xl font-black text-[#0F2A5F]">{user?.displayName ?? "Loading user"}</h2><p className="text-sm text-slate-500">Overview, roles, access scope, AI permissions, security, and audit activity.</p></div>
          <ActionButton label="Close" onClick={() => workspace.setSelectedUserId(null)} />
        </div>
        {user ? <div className="mt-5 grid gap-4 md:grid-cols-2"><DetailCard title="Overview" lines={[user.id, user.email, user.staffId ?? "No staff ID", user.department?.name ?? "No department"]} /><DetailCard title="Roles & Scope" lines={[user.roles.map((role) => role.name).join(", "), user.accessScope[0]?.organizationName ?? "", user.accessScope[0]?.clinicNames.join(", ") ?? ""]} /><DetailCard title="Security" lines={[`MFA: ${user.mfaEnabled ? "Enabled" : "Pending"}`, `Failed login attempts: ${user.failedLoginAttempts}`, `Active sessions: ${user.activeSessions}`, `Security review: ${user.securityReviewDue ? "Due" : "Current"}`]} /><DetailCard title="Audit" lines={[`Created: ${formatDate(user.createdAt)}`, `Updated: ${formatDate(user.updatedAt)}`, `Updated by: ${user.updatedBy}`]} /></div> : <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-100" />}
      </aside>
    </div>
  );
}

function InviteUserDialog({ workspace }: { workspace: Workspace }) {
  const form = useForm<InviteUserFormValues>({ resolver: zodResolver(inviteUserSchema), defaultValues: { aiPermissionProfile: "restricted", consentRequired: true } });
  if (!workspace.inviteOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation">
      <form role="dialog" aria-modal="true" aria-labelledby="invite-title" onSubmit={form.handleSubmit(() => workspace.sensitiveActionMutation.mutate({ action: "invite-user", reason: "New user invitation with role and scope governance" }))} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 id="invite-title" className="text-2xl font-black text-[#0F2A5F]">Invite User</h2><p className="text-sm text-slate-500">ข้อมูลคำเชิญต้องครบถ้วนเพื่อรองรับ PDPA และ audit trail</p></div><ActionButton label="Close" onClick={() => workspace.setInviteOpen(false)} /></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormField label="First name" error={form.formState.errors.firstName?.message}><input className={inputClass} {...form.register("firstName")} /></FormField>
          <FormField label="Last name" error={form.formState.errors.lastName?.message}><input className={inputClass} {...form.register("lastName")} /></FormField>
          <FormField label="Email" error={form.formState.errors.email?.message}><input className={inputClass} {...form.register("email")} /></FormField>
          <FormField label="Staff ID" error={form.formState.errors.staffId?.message}><input className={inputClass} {...form.register("staffId")} /></FormField>
          <FormField label="Organization" error={form.formState.errors.organization?.message}><input className={inputClass} {...form.register("organization")} /></FormField>
          <FormField label="Clinic scope" error={form.formState.errors.clinicScope?.message}><input className={inputClass} {...form.register("clinicScope")} /></FormField>
          <FormField label="Department" error={form.formState.errors.department?.message}><input className={inputClass} {...form.register("department")} /></FormField>
          <FormField label="Primary role" error={form.formState.errors.primaryRole?.message}><input className={inputClass} {...form.register("primaryRole")} /></FormField>
          <FormField label="AI permission profile" error={form.formState.errors.aiPermissionProfile?.message}><select className={selectClass} {...form.register("aiPermissionProfile")}><option value="enabled">Enabled</option><option value="restricted">Restricted</option><option value="not_allowed">Not allowed</option></select></FormField>
          <FormField label="Invitation expiry" error={form.formState.errors.invitationExpiry?.message}><input type="date" className={inputClass} {...form.register("invitationExpiry")} /></FormField>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" {...form.register("consentRequired")} />Consent validation required</label>
        <div className="mt-5 flex justify-end gap-2"><ActionButton label="Cancel" onClick={() => workspace.setInviteOpen(false)} /><ActionButton label="Send Invite" variant="primary" /></div>
      </form>
    </div>
  );
}

function ActionButton({ label, icon, variant = "default", disabled, title, onClick }: { label: string; icon?: React.ReactNode; variant?: "default" | "primary"; disabled?: boolean; title?: string; onClick?: () => void }) {
  return <button type="button" disabled={disabled} title={title} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-55 ${variant === "primary" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}>{icon}{label}</button>;
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const classes: Record<Tone, string> = { blue: "bg-blue-50 text-blue-800 border-blue-200", green: "bg-green-50 text-green-800 border-green-200", amber: "bg-amber-50 text-amber-800 border-amber-200", red: "bg-red-50 text-red-800 border-red-200", slate: "bg-slate-50 text-slate-700 border-slate-200" };
  return <span className={`mr-1 mt-1 inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${classes[tone]}`}>{children}</span>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="text-xs font-black text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select></label>;
}

function QueueButton({ label, count, helper, tone, onClick }: { label: string; count: number; helper: string; tone: Tone; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-slate-200 p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"><Badge tone={tone}>{label}</Badge><div className="mt-2 text-2xl font-black text-[#0F2A5F]">{count}</div><p className="text-xs font-semibold text-slate-500">{helper}</p></button>;
}

function DetailCard({ title, lines }: { title: string; lines: string[] }) {
  return <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-black text-slate-900">{title}</h3>{lines.map((line) => <p key={line} className="mt-2 text-sm font-semibold text-slate-600">{line}</p>)}</section>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-black text-slate-700">{label}<span className="mt-1 block">{children}</span>{error ? <span className="mt-1 block text-xs font-bold text-red-700">{error}</span> : null}</label>;
}

function PageSkeleton() {
  return <main className="min-h-screen bg-slate-50 p-6"><div className="h-96 animate-pulse rounded-2xl bg-white" /></main>;
}

function AccessDenied({ reason }: { reason: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="rounded-2xl border border-amber-200 bg-white p-6"><Lock className="text-amber-700" /><h1 className="mt-3 text-xl font-black">Access restricted</h1><p className="mt-2 text-sm text-slate-600">{reason}</p></section></main>;
}

function TableSkeleton() {
  return <>{Array.from({ length: 5 }, (_, index) => <tr key={index}><td colSpan={8} className="border-b border-slate-100 px-3 py-3"><div className="h-10 animate-pulse rounded bg-slate-100" /></td></tr>)}</>;
}

function ErrorRow({ onRetry }: { onRetry: () => void }) {
  return <tr><td colSpan={8} className="px-3 py-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-2 font-bold text-slate-700">Unable to load users.</p><ActionButton label="Retry" onClick={onRetry} /></td></tr>;
}

function EmptyRow({ clearFilters }: { clearFilters: () => void }) {
  return <tr><td colSpan={8} className="px-3 py-10 text-center"><Users className="mx-auto text-slate-400" /><p className="mt-2 font-black text-slate-800">No account matches current filters</p><p className="text-sm text-slate-500">ไม่มีผู้ใช้งานที่ตรงกับเงื่อนไขที่เลือก</p><ActionButton label="Clear Filters" onClick={clearFilters} /></td></tr>;
}

function getKpiCards(summary?: UserSummary) {
  return [
    { label: "Active Users", value: summary?.activeUsers ?? "Unavailable", badge: "Verified", helper: "Operational accounts", tone: "green" as Tone, filter: { status: "active" as UserAccountStatus }, active: (filters: UserFilters) => filters.status === "active" },
    { label: "Pending Invites", value: summary?.pendingInvites ?? "Unavailable", badge: "Review", helper: "Invitation follow-up", tone: "amber" as Tone, filter: { status: "pending" as UserAccountStatus }, active: (filters: UserFilters) => filters.status === "pending" },
    { label: "Locked Accounts", value: summary?.lockedAccounts ?? "Unavailable", badge: "Risk", helper: "Security intervention", tone: "red" as Tone, filter: { status: "locked" as UserAccountStatus }, active: (filters: UserFilters) => filters.status === "locked" },
    { label: "High Privilege Users", value: summary?.highPrivilegeUsers ?? "Unavailable", badge: "Privileged", helper: "Admin/auditor roles", tone: "amber" as Tone, filter: { highPrivilege: "true" as const }, active: (filters: UserFilters) => filters.highPrivilege === "true" },
    { label: "AI Enabled Users", value: summary?.aiEnabledUsers ?? "Unavailable", badge: "AI", helper: "Clinical engine access", tone: "blue" as Tone, filter: { aiAccess: "enabled" as AIAccessLevel }, active: (filters: UserFilters) => filters.aiAccess === "enabled" },
    { label: "Consent Required Access", value: summary?.consentRequiredUsers ?? "Unavailable", badge: "PDPA", helper: "Consent gate required", tone: "slate" as Tone, filter: { consentRequired: "true" as const }, active: (filters: UserFilters) => filters.consentRequired === "true" },
  ];
}

const inputClass = "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500";
const selectClass = "mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500";
const labelize = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
const statusTone = (status: UserAccountStatus): Tone => status === "active" ? "green" : status === "locked" || status === "disabled" ? "red" : status === "pending" ? "amber" : "slate";
const aiTone = (level: AIAccessLevel): Tone => level === "enabled" ? "blue" : level === "restricted" ? "amber" : "slate";
const severityTone = (severity: GovernanceSeverity): Tone => severity === "critical" ? "red" : severity === "high" || severity === "medium" ? "amber" : "blue";
