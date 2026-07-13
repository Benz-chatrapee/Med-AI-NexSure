"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileClock,
  Lock,
  LockKeyhole,
  MoreHorizontal,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteUserSchema, type InviteUserFormValues } from "../schemas/user-schema";
import { useUserManagement } from "../hooks/use-user-management";
import type {
  AccessActivity,
  AccessRiskSignal,
  GovernanceSeverity,
  PermissionLevel,
  UserAccount,
  UserAccountStatus,
  UserFilters,
  UserSummary,
} from "../types/user-management.types";

type Workspace = ReturnType<typeof useUserManagement>;
type Tone = "blue" | "green" | "amber" | "red" | "slate";

const navItems = ["Main Dashboard", "Patient List", "Visit Detail", "Enterprise SOAP Note", "Claim Readiness", "Evidence Package", "Economic Intelligence", "Audit & Compliance", "User Management / RBAC"];
const roleOptions = ["all", "organization_admin", "clinic_admin", "doctor", "nurse", "pharmacist", "claim_reviewer", "compliance_officer", "executive", "auditor"];
const statusOptions = ["all", "active", "pending", "locked", "suspended", "disabled"];
const departmentOptions = ["all", "clinical", "clinical-operations", "pharmacy", "claim-review", "compliance", "administration", "executive"];
const clinicOptions = ["all", "bkk-clinic", "hospital-a", "insurer-hq"];

const statusConfig: Record<UserAccountStatus, { label: string; tone: Tone; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", tone: "green", icon: CheckCircle2 },
  pending: { label: "Pending", tone: "amber", icon: Clock3 },
  locked: { label: "Locked", tone: "red", icon: LockKeyhole },
  suspended: { label: "Suspended", tone: "slate", icon: ShieldAlert },
  disabled: { label: "Disabled", tone: "slate", icon: UserX },
};

const riskConfig: Record<AccessRiskSignal, { label: string; tone: Tone; icon: typeof ShieldCheck }> = {
  normal_access: { label: "Normal Access", tone: "blue", icon: ShieldCheck },
  invite_sent: { label: "Invite Sent", tone: "blue", icon: Clock3 },
  phi_masked: { label: "PHI Masked", tone: "amber", icon: ShieldAlert },
  failed_login: { label: "Failed Login", tone: "red", icon: LockKeyhole },
  privileged_access: { label: "Privileged Access", tone: "amber", icon: ShieldCheck },
  unusual_login: { label: "Unusual Login", tone: "red", icon: AlertTriangle },
  review_required: { label: "Review Required", tone: "amber", icon: FileClock },
};

const permissionConfig: Record<PermissionLevel, { label: string; tone: Tone; icon: typeof CheckCircle2 }> = {
  none: { label: "None", tone: "slate", icon: X },
  view: { label: "View", tone: "blue", icon: Eye },
  edit: { label: "Edit", tone: "green", icon: CheckCircle2 },
  create: { label: "Create", tone: "green", icon: CheckCircle2 },
  verify: { label: "Verify", tone: "green", icon: CheckCircle2 },
  review: { label: "Review", tone: "blue", icon: Eye },
  masked: { label: "Masked", tone: "amber", icon: ShieldAlert },
  history: { label: "History", tone: "blue", icon: FileClock },
  audit: { label: "Audit", tone: "amber", icon: ShieldCheck },
  full: { label: "Full", tone: "green", icon: CheckCircle2 },
  export_log: { label: "Export Log", tone: "amber", icon: Download },
  evidence: { label: "Evidence", tone: "blue", icon: FileClock },
  view_edit: { label: "View/Edit", tone: "green", icon: CheckCircle2 },
  version: { label: "Version", tone: "blue", icon: FileClock },
};

const permissionRows: { role: string; permissions: PermissionLevel[] }[] = [
  { role: "Doctor", permissions: ["view_edit", "create", "edit", "create", "view", "none"] },
  { role: "Nurse", permissions: ["view_edit", "create", "view", "none", "evidence", "none"] },
  { role: "Pharmacist", permissions: ["view", "view", "none", "verify", "none", "none"] },
  { role: "Claim Reviewer", permissions: ["masked", "view", "view", "view", "review", "none"] },
  { role: "Compliance Officer", permissions: ["masked", "history", "version", "audit", "export_log", "full"] },
];

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
  const [confirmAction, setConfirmAction] = useState<{ user: UserAccount; action: string; impact: string } | null>(null);

  if (workspace.permissionsQuery.isLoading) return <PageSkeleton />;
  if (!permissions?.canView) return <AccessDenied reason={permissions?.readOnlyReason ?? "Your role does not include User Management / RBAC access."} />;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 min-[1040px]:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-7">
          <Header workspace={workspace} />
          {workspace.actionMessage ? <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900" role="status">{workspace.actionMessage}</div> : null}
          <KpiGrid workspace={workspace} />
          <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <UserDirectory workspace={workspace} onConfirm={setConfirmAction} />
              <RolePermissionMatrix />
            </div>
            <aside className="space-y-6">
              <AIClinicalAccessPanel />
              <ClinicalSafetyPanel workspace={workspace} />
              <EconomicIntelligencePanel />
              <AuditCompliancePanel />
              <RecentActivity workspace={workspace} />
            </aside>
          </section>
        </div>
      </div>
      <UserDetailSheet workspace={workspace} />
      <InviteUserDialog workspace={workspace} />
      <ConfirmationDialog workspace={workspace} confirmation={confirmAction} onClose={() => setConfirmAction(null)} />
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden bg-gradient-to-b from-[#0F2A5F] to-[#071A3D] px-6 py-7 text-white min-[1040px]:block" aria-label="Main navigation">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-base font-black shadow-lg shadow-blue-950/25">AI</div>
        <div>
          <div className="font-black">Med AI NexSure</div>
          <p className="text-xs text-blue-100">Enterprise Healthcare Intelligence</p>
        </div>
      </div>
      <nav className="mt-8" aria-label="Platform sections">
        {navItems.map((item) => (
          <a key={item} href={item === "User Management / RBAC" ? "/admin/users" : "#"} className={`mb-1.5 flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold ${item === "User Management / RBAC" ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10"}`}>
            <span>{item}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

function Header({ workspace }: { workspace: Workspace }) {
  const permissions = workspace.permissionsQuery.data;
  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Enterprise Access Governance</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0F2A5F]">Role-Based Access Control</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">Manage users, roles, access scopes, AI permissions and compliance controls across clinics, hospitals and insurance operations.</p>
          <p className="mt-1 text-sm text-slate-500">จัดการผู้ใช้งาน บทบาท ขอบเขตการเข้าถึง และการควบคุมสิทธิ์ตามหลัก Least Privilege</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<Download size={16} />} label="Export Access Report" onClick={() => workspace.sensitiveActionMutation.mutate({ action: "export-access-report", reason: "Administrator requested access governance report export" })} disabled={!permissions?.canExportAccessReport} title={!permissions?.canExportAccessReport ? "Export permission is required" : undefined} />
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
    <section className="mb-6 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" aria-label="Access governance KPIs">
      {cards.map((card) => <AccessKpiCard key={card.title} {...card} loading={workspace.summaryQuery.isLoading} />)}
    </section>
  );
}

function AccessKpiCard({ title, value, description, tone, icon: Icon, loading }: { title: string; value: string | number; description: string; tone: Tone; icon: typeof Users; loading: boolean }) {
  return (
    <section className="min-h-[142px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
        <span className={`rounded-xl border p-2 ${toneClasses[tone]}`}><Icon size={17} aria-hidden="true" /></span>
      </div>
      {loading ? <div className="mt-4 h-8 animate-pulse rounded bg-slate-100" /> : <strong className="mt-3 block text-3xl font-black text-[#0F2A5F]">{value}</strong>}
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{description}</p>
    </section>
  );
}

function UserDirectory({ workspace, onConfirm }: { workspace: Workspace; onConfirm: (value: { user: UserAccount; action: string; impact: string }) => void }) {
  const data = workspace.usersQuery.data;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / workspace.filters.pageSize));
  const start = data?.total ? (workspace.filters.page - 1) * workspace.filters.pageSize + 1 : 0;
  const end = Math.min(workspace.filters.page * workspace.filters.pageSize, data?.total ?? 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="directory-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 id="directory-title" className="text-lg font-black text-[#0F2A5F]">User Directory</h2>
          <p className="text-sm text-slate-500">ค้นหา กรอง และจัดการสิทธิ์ผู้ใช้งานตาม Role, Clinic, Department และ Organization</p>
        </div>
        <ActionButton label="Bulk Actions" icon={<MoreHorizontal size={16} />} onClick={() => workspace.sensitiveActionMutation.mutate({ action: "bulk-actions-opened", reason: "Administrator opened bulk action menu placeholder" })} />
      </div>
      <DirectoryToolbar workspace={workspace} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              {["User", "Role", "Department", "Scope", "Status", "Risk Signal", "Actions"].map((head) => <th key={head} scope="col" className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {workspace.usersQuery.isLoading ? <TableSkeleton /> : null}
            {workspace.usersQuery.isError ? <ErrorRow onRetry={() => void workspace.usersQuery.refetch()} /> : null}
            {!workspace.usersQuery.isLoading && !workspace.usersQuery.isError && data?.users.length === 0 ? <EmptyRow clearFilters={workspace.clearFilters} /> : null}
            {data?.users.map((user) => <UserRow key={user.id} user={user} workspace={workspace} onConfirm={onConfirm} />)}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-600">Showing {start}-{end} of {data?.total ?? 0} users</p>
        <div className="flex items-center gap-2">
          <ActionButton icon={<ChevronLeft size={16} />} label="Previous" disabled={workspace.filters.page <= 1} onClick={() => workspace.updateFilters({ page: workspace.filters.page - 1 })} />
          <span className="text-sm font-bold text-slate-600">Page {workspace.filters.page} of {totalPages}</span>
          <ActionButton icon={<ChevronRight size={16} />} label="Next" disabled={workspace.filters.page >= totalPages} onClick={() => workspace.updateFilters({ page: workspace.filters.page + 1 })} />
        </div>
      </div>
    </section>
  );
}

function DirectoryToolbar({ workspace }: { workspace: Workspace }) {
  const hasFilters = useMemo(() => workspace.filters.search || workspace.filters.role !== "all" || workspace.filters.status !== "all" || workspace.filters.departmentId !== "all" || workspace.filters.clinicId !== "all", [workspace.filters]);
  return (
    <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_repeat(4,minmax(130px,1fr))_auto]">
      <label className="relative block">
        <span className="sr-only">Search name, email, role or department</span>
        <Search className="absolute left-3 top-3 text-slate-400" size={16} aria-hidden="true" />
        <Input value={workspace.filters.search} onChange={(event) => workspace.updateFilters({ search: event.target.value, page: 1 })} placeholder="Search name, email, role or department" className={`${inputClass} pl-9`} />
      </label>
      <FilterSelect label="Role" value={workspace.filters.role} onChange={(role) => workspace.updateFilters({ role, page: 1 })} options={roleOptions} />
      <FilterSelect label="Status" value={workspace.filters.status} onChange={(status) => workspace.updateFilters({ status: status as UserFilters["status"], page: 1 })} options={statusOptions} />
      <FilterSelect label="Department" value={workspace.filters.departmentId} onChange={(departmentId) => workspace.updateFilters({ departmentId, page: 1 })} options={departmentOptions} />
      <FilterSelect label="Clinic or organization" value={workspace.filters.clinicId} onChange={(clinicId) => workspace.updateFilters({ clinicId, page: 1 })} options={clinicOptions} />
      {hasFilters ? <ActionButton label="Clear Filters" onClick={workspace.clearFilters} /> : null}
    </div>
  );
}

function UserRow({ user, workspace, onConfirm }: { user: UserAccount; workspace: Workspace; onConfirm: (value: { user: UserAccount; action: string; impact: string }) => void }) {
  const status = statusConfig[user.status];
  const risk = riskConfig[user.riskSignal];
  return (
    <tr className="align-top hover:bg-slate-50">
      <td className="border-b border-slate-100 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-800">{user.initials}</div>
          <div><div className="font-black text-slate-900">{user.displayName}</div><div className="text-xs font-semibold text-slate-500">{user.email}</div></div>
        </div>
      </td>
      <td className="border-b border-slate-100 px-3 py-4"><Badge tone={user.roles[0]?.isHighPrivilege ? "amber" : "blue"}>{user.roles[0]?.name}</Badge></td>
      <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-600">{user.department?.name}</td>
      <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{user.scope}<br /><span className="text-xs text-slate-500">{user.accessScope[0]?.organizationName}</span></td>
      <td className="border-b border-slate-100 px-3 py-4"><IconBadge icon={status.icon} tone={status.tone}>{status.label}</IconBadge></td>
      <td className="border-b border-slate-100 px-3 py-4"><IconBadge icon={risk.icon} tone={risk.tone}>{risk.label}</IconBadge></td>
      <td className="border-b border-slate-100 px-3 py-4"><UserActionMenu user={user} workspace={workspace} onConfirm={onConfirm} /></td>
    </tr>
  );
}

function UserActionMenu({ user, workspace, onConfirm }: { user: UserAccount; workspace: Workspace; onConfirm: (value: { user: UserAccount; action: string; impact: string }) => void }) {
  const [open, setOpen] = useState(false);
  const actions = getUserActions(user);
  return (
    <div className="relative inline-block text-left">
      <Button aria-label={`Open actions for ${user.displayName}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <MoreHorizontal size={17} aria-hidden="true" />
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSensitiveAction(action) ? "text-red-700" : "text-slate-700"}`}
              onClick={() => {
                setOpen(false);
                if (action === "View User" || action === "Review") workspace.setSelectedUserId(user.id);
                else if (isSensitiveAction(action)) onConfirm({ user, action, impact: "การดำเนินการนี้อาจส่งผลต่อสิทธิ์เข้าถึงข้อมูลสุขภาพและข้อมูลเคลม" });
                else workspace.sensitiveActionMutation.mutate({ action: action.toLowerCase().replaceAll(" ", "-"), reason: `${action} requested for ${user.displayName}` });
              }}
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RolePermissionMatrix() {
  const columns = ["Patient", "Visit", "SOAP", "Prescription", "Claim", "Audit"];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="matrix-title">
      <h2 id="matrix-title" className="text-lg font-black text-[#0F2A5F]">Role Permission Matrix</h2>
      <p className="text-sm text-slate-500">สิทธิ์การเข้าถึงแยกตามบทบาทตามหลัก Least Privilege</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead><tr><th scope="col" className="sticky left-0 bg-slate-50 px-3 py-3 text-left font-black text-[#0F2A5F]">Role / Permission</th>{columns.map((column) => <th key={column} scope="col" className="bg-slate-50 px-3 py-3 text-left font-black text-[#0F2A5F]">{column}</th>)}</tr></thead>
          <tbody>{permissionRows.map((row) => <tr key={row.role} className="border-t border-slate-100"><th scope="row" className="sticky left-0 bg-white px-3 py-3 text-left font-black text-slate-800">{row.role}</th>{row.permissions.map((permission, index) => <td key={`${row.role}-${columns[index]}`} className="px-3 py-3"><PermissionBadge level={permission} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function AIClinicalAccessPanel() {
  return (
    <Panel title="AI Clinical Access Control" helper="ควบคุมสิทธิ์การเข้าถึง AI Result, SOAP Summary, ICD Suggestion และ AI Override">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <StatusCard tone="green" title="AI Result Access" badge="Ready" description="Doctors, claim reviewers and authorized administrators can view AI-assisted clinical insights." />
        <StatusCard tone="amber" title="Override AI" badge="Needs Review" description="AI override requires clinical justification, authorized role and audit trail." />
        <div className="mt-3 rounded-xl border border-blue-200 bg-white/80 p-3 text-sm font-bold text-[#0F2A5F]">AI access follows role, organization scope and clinical safety policy.</div>
      </div>
    </Panel>
  );
}

function ClinicalSafetyPanel({ workspace }: { workspace: Workspace }) {
  const alerts = workspace.alertsQuery.data ?? [];
  return (
    <Panel title="Clinical Safety Priority" helper="การแจ้งเตือนด้านความปลอดภัยทางคลินิกต้องแสดงก่อน Claim หรือ Financial Alert">
      <div className="space-y-3">
        {workspace.alertsQuery.isError ? <InlineError message="Unable to load clinical safety priority." onRetry={() => void workspace.alertsQuery.refetch()} /> : null}
        {alerts.map((alert) => <StatusCard key={alert.id} tone={severityTone(alert.severity)} title={alert.title} badge={severityLabel(alert.severity)} description={`${alert.description} ${alert.recommendedAction}.`} />)}
      </div>
    </Panel>
  );
}

function EconomicIntelligencePanel() {
  return (
    <Panel title="Economic Intelligence">
      <InfoLine label="Average Visit Cost" value="฿1,420" />
      <InfoLine label="Cost Alert Cases" value="12" />
      <InfoLine label="AI Assisted Productivity" value="68%" />
    </Panel>
  );
}

function AuditCompliancePanel() {
  return (
    <Panel title="Audit & Compliance" helper="PDPA-ready access monitoring and export governance">
      <InfoLine label="Role Change Log" value="Enabled" />
      <InfoLine label="Export Log" value="Required" />
      <InfoLine label="Route Protection" value="Active" />
      <a href="/audit-compliance" className="mt-3 inline-block text-sm font-black text-blue-700 hover:text-blue-900">View Audit Center</a>
    </Panel>
  );
}

function RecentActivity({ workspace }: { workspace: Workspace }) {
  return (
    <Panel title="Recent Activity" helper="บันทึกเหตุการณ์สำคัญสำหรับ audit-ready operation">
      {workspace.activityQuery.isError ? <InlineError message="Unable to load recent activity." onRetry={() => void workspace.activityQuery.refetch()} /> : null}
      <ol className="space-y-4 border-l-2 border-blue-200 pl-4">
        {(workspace.activityQuery.data ?? []).map((event) => <ActivityItem key={event.id} event={event} />)}
      </ol>
    </Panel>
  );
}

function ActivityItem({ event }: { event: AccessActivity }) {
  const tone = severityTone(event.severity);
  return (
    <li>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0F2A5F]">{event.title}</p>
          <p className="text-xs font-semibold text-slate-500">{event.actor}</p>
          <p className="text-xs text-slate-500">{event.detail}</p>
        </div>
        <Badge tone={tone}>{event.timestamp}</Badge>
      </div>
    </li>
  );
}

function UserDetailSheet({ workspace }: { workspace: Workspace }) {
  const user = workspace.selectedUserQuery.data;
  if (!workspace.selectedUserId) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45" role="presentation">
      <aside role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="ml-auto h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="user-detail-title" className="text-2xl font-black text-[#0F2A5F]">{user?.displayName ?? "Loading user"}</h2><p className="text-sm text-slate-500">User profile, security posture, access scope and recent account activity.</p></div>
          <ActionButton label="Close" onClick={() => workspace.setSelectedUserId(null)} />
        </div>
        {user ? <div className="mt-5 grid gap-4 md:grid-cols-2">
          <DetailCard title="Profile" lines={[user.email, user.department?.name ?? "No department", user.accessScope[0]?.organizationName ?? "No organization"]} />
          <DetailCard title="Role & Scope" lines={[user.roles[0]?.name ?? "No role", user.scope, `Status: ${statusConfig[user.status].label}`]} />
          <DetailCard title="Security" lines={[`Last login: ${formatDate(user.lastLoginAt)}`, `MFA: ${user.mfaEnabled ? "Enabled" : "Pending"}`, `Failed login attempts: ${user.failedLoginAttempts}`]} />
          <DetailCard title="Access" lines={[`AI permission: ${labelize(user.aiAccessLevel)}`, `Clinical access: ${user.clinicalAccess}`, `Claim access: ${user.claimAccess}`, `Audit level: ${user.auditAccessLevel}`]} />
        </div> : <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-100" />}
      </aside>
    </div>
  );
}

function InviteUserDialog({ workspace }: { workspace: Workspace }) {
  const form = useForm<InviteUserFormValues>({ resolver: zodResolver(inviteUserSchema), defaultValues: { name: "", email: "", role: "", department: "", organizationId: "", scope: "", aiAccess: true, message: "" } });
  if (!workspace.inviteOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation">
      <form role="dialog" aria-modal="true" aria-labelledby="invite-title" onSubmit={form.handleSubmit(() => {
        workspace.sensitiveActionMutation.mutate({ action: "invite-user", reason: "New user invitation with role, scope and AI permission governance" }, { onSuccess: () => workspace.setInviteOpen(false) });
      })} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 id="invite-title" className="text-2xl font-black text-[#0F2A5F]">Invite User</h2><p className="text-sm text-slate-500">ส่งคำเชิญพร้อม Role, Access Scope และ AI Permission ตามหลัก Least Privilege</p></div><ActionButton label="Close" onClick={() => workspace.setInviteOpen(false)} /></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormField label="Full Name" error={form.formState.errors.name?.message}><Input className={inputClass} {...form.register("name")} /></FormField>
          <FormField label="Email" error={form.formState.errors.email?.message}><Input className={inputClass} {...form.register("email")} /></FormField>
          <FormField label="Role" error={form.formState.errors.role?.message}><select className={selectClass} {...form.register("role")}><option value="">Select role</option>{roleOptions.filter((role) => role !== "all").map((role) => <option key={role} value={role}>{labelize(role)}</option>)}</select></FormField>
          <FormField label="Department" error={form.formState.errors.department?.message}><select className={selectClass} {...form.register("department")}><option value="">Select department</option>{departmentOptions.filter((department) => department !== "all").map((department) => <option key={department} value={department}>{labelize(department)}</option>)}</select></FormField>
          <FormField label="Clinic / Organization" error={form.formState.errors.organizationId?.message}><select className={selectClass} {...form.register("organizationId")}><option value="">Select scope</option>{clinicOptions.filter((clinic) => clinic !== "all").map((clinic) => <option key={clinic} value={clinic}>{labelize(clinic)}</option>)}</select></FormField>
          <FormField label="Access Scope" error={form.formState.errors.scope?.message}><select className={selectClass} {...form.register("scope")}><option value="">Select access scope</option><option value="own-clinic">Own Clinic</option><option value="department">Department</option><option value="assigned-cases">Assigned Cases</option><option value="organization">Organization</option></select></FormField>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" {...form.register("aiAccess")} />AI Permission</label>
        <FormField label="Optional invitation message" error={form.formState.errors.message?.message}><textarea className={`${inputClass} min-h-24 resize-y`} {...form.register("message")} /></FormField>
        <div className="mt-5 flex justify-end gap-2"><ActionButton label="Cancel" onClick={() => workspace.setInviteOpen(false)} /><Button type="submit" disabled={workspace.sensitiveActionMutation.isPending} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-700 bg-blue-700 px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">{workspace.sensitiveActionMutation.isPending ? "Sending..." : "Send Invite"}</Button></div>
      </form>
    </div>
  );
}

function ConfirmationDialog({ workspace, confirmation, onClose }: { workspace: Workspace; confirmation: { user: UserAccount; action: string; impact: string } | null; onClose: () => void }) {
  if (!confirmation) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="confirm-title" className="text-xl font-black text-[#0F2A5F]">Confirm {confirmation.action}</h2>
        <p className="mt-2 text-sm text-slate-600">Changing this access state may modify protected clinical and claim information.</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>{confirmation.user.displayName}</strong><br />
          Current role: {confirmation.user.roles[0]?.name}<br />
          Requested action: {confirmation.action}<br />
          {confirmation.impact}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <ActionButton label="Cancel" onClick={onClose} />
          <ActionButton label="Confirm action" variant="primary" onClick={() => { workspace.sensitiveActionMutation.mutate({ action: confirmation.action.toLowerCase().replaceAll(" ", "-"), reason: `${confirmation.action} confirmed for ${confirmation.user.displayName}` }); onClose(); }} />
        </div>
      </section>
    </div>
  );
}

function Panel({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-lg font-black text-[#0F2A5F]">{title}</h2>{helper ? <p className="mb-4 text-sm text-slate-500">{helper}</p> : null}<div className="mt-3">{children}</div></section>;
}

function StatusCard({ tone, title, badge, description }: { tone: Tone; title: string; badge: string; description: string }) {
  return <section className={`mt-3 rounded-xl border border-l-4 bg-white p-3 ${leftBorderClasses[tone]}`}><div className="flex items-start justify-between gap-3"><strong className="text-sm text-slate-900">{title}</strong><Badge tone={tone}>{badge}</Badge></div><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></section>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0"><span className="font-semibold text-slate-600">{label}</span><strong className="text-[#0F2A5F]">{value}</strong></div>;
}

function DetailCard({ title, lines }: { title: string; lines: string[] }) {
  return <section className="rounded-xl border border-slate-200 p-4"><h3 className="font-black text-slate-900">{title}</h3>{lines.map((line) => <p key={line} className="mt-2 text-sm font-semibold text-slate-600">{line}</p>)}</section>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-black text-slate-700">{label}<span className="mt-1 block">{children}</span>{error ? <span className="mt-1 block text-xs font-bold text-red-700">{error}</span> : null}</label>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="text-xs font-black text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>{options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label === "Clinic or organization" ? "Clinics" : `${label}s`}` : labelize(option)}</option>)}</select></label>;
}

function ActionButton({ label, icon, variant = "default", disabled, title, onClick }: { label: string; icon?: React.ReactNode; variant?: "default" | "primary"; disabled?: boolean; title?: string; onClick?: () => void }) {
  return <Button type="button" disabled={disabled} title={title} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-55 ${variant === "primary" ? "border-blue-700 bg-blue-700 text-white hover:bg-[#0F2A5F]" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"}`}>{icon}{label}</Button>;
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-black ${toneClasses[tone]}`}>{children}</span>;
}

function IconBadge({ icon: Icon, tone, children }: { icon: typeof CheckCircle2; tone: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${toneClasses[tone]}`}><Icon size={13} aria-hidden="true" />{children}</span>;
}

function PermissionBadge({ level }: { level: PermissionLevel }) {
  const config = permissionConfig[level];
  return <IconBadge icon={config.icon} tone={config.tone}>{config.label}</IconBadge>;
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><strong>{message}</strong><p>ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p><ActionButton label="Retry" onClick={onRetry} /></div>;
}

function PageSkeleton() {
  return <main className="min-h-screen bg-slate-50 p-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white" />)}</div><div className="mt-6 h-96 animate-pulse rounded-2xl bg-white" /></main>;
}

function AccessDenied({ reason }: { reason: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="rounded-2xl border border-amber-200 bg-white p-6"><Lock className="text-amber-700" /><h1 className="mt-3 text-xl font-black">Access restricted</h1><p className="mt-2 text-sm text-slate-600">{reason}</p></section></main>;
}

function TableSkeleton() {
  return <>{Array.from({ length: 5 }, (_, index) => <tr key={index}><td colSpan={7} className="border-b border-slate-100 px-3 py-3"><div className="h-10 animate-pulse rounded bg-slate-100" /></td></tr>)}</>;
}

function ErrorRow({ onRetry }: { onRetry: () => void }) {
  return <tr><td colSpan={7} className="px-3 py-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-2 font-bold text-slate-700">Unable to load access-control data</p><p className="text-sm text-slate-500">ไม่สามารถโหลดข้อมูลผู้ใช้งานและสิทธิ์ได้ กรุณาลองใหม่อีกครั้ง</p><ActionButton label="Retry" onClick={onRetry} /></td></tr>;
}

function EmptyRow({ clearFilters }: { clearFilters: () => void }) {
  return <tr><td colSpan={7} className="px-3 py-10 text-center"><Users className="mx-auto text-slate-400" /><p className="mt-2 font-black text-slate-800">No users found</p><p className="text-sm text-slate-500">ไม่พบผู้ใช้งานตามเงื่อนไขที่เลือก</p><ActionButton label="Clear Filters" onClick={clearFilters} /></td></tr>;
}

function getKpiCards(summary?: UserSummary) {
  return [
    { title: "Total Users", value: summary?.totalUsers ?? 248, description: "All organization accounts", tone: "blue" as Tone, icon: Users },
    { title: "Active Users", value: summary?.activeUsers ?? 219, description: "ผู้ใช้ที่สามารถเข้าใช้งานระบบได้", tone: "green" as Tone, icon: CheckCircle2 },
    { title: "Pending Invites", value: summary?.pendingInvites ?? 14, description: "รอผู้ใช้งานตอบรับคำเชิญ", tone: "amber" as Tone, icon: Clock3 },
    { title: "Locked Accounts", value: summary?.lockedAccounts ?? 5, description: "บัญชีที่ต้องตรวจสอบด้านความปลอดภัย", tone: "red" as Tone, icon: LockKeyhole },
    { title: "Admin Users", value: summary?.adminUsers ?? 11, description: "Privileged access monitored", tone: "blue" as Tone, icon: ShieldCheck },
    { title: "Last 24h Login", value: summary?.last24hLogin ?? 137, description: "Recent authenticated access", tone: "slate" as Tone, icon: FileClock },
  ];
}

function getUserActions(user: UserAccount) {
  if (user.status === "pending") return ["View User", "Resend Invite", "Cancel Invite"];
  if (user.status === "locked") return ["Review", "Unlock Account", "View Audit Log"];
  if (user.roles[0]?.code === "claim_reviewer") return ["View User", "Edit Role", "Suspend"];
  if (user.status === "disabled") return ["View User", "View Audit Log"];
  return ["View User", "Edit User", "Reset Password", "Suspend"];
}

function isSensitiveAction(action: string) {
  return ["Suspend", "Disable", "Unlock Account", "Cancel Invite", "Edit Role"].includes(action);
}

const toneClasses: Record<Tone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

const leftBorderClasses: Record<Tone, string> = {
  blue: "border-l-blue-600",
  green: "border-l-emerald-600",
  amber: "border-l-amber-600",
  red: "border-l-red-600",
  slate: "border-l-slate-400",
};

const inputClass = "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500";
const selectClass = "mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500";
const labelize = (value: string) => value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
const severityTone = (severity: GovernanceSeverity): Tone => severity === "critical" ? "red" : severity === "warning" ? "amber" : severity === "success" ? "green" : "blue";
const severityLabel = (severity: GovernanceSeverity) => severity === "critical" ? "Critical" : severity === "warning" ? "Needs Review" : severity === "success" ? "Completed" : "Info";
