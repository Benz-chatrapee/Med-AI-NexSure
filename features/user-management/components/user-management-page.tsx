"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, ClipboardCheck, FileClock, LayoutDashboard, Settings, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BulkUserActions } from "./bulk-user-actions";
import { ClinicUserDetailSheet } from "./clinic-user-detail-sheet";
import { ClinicUsersHeader } from "./clinic-users-header";
import { ClinicUsersKpis } from "./clinic-users-kpis";
import { ClinicUsersTable } from "./clinic-users-table";
import { ClinicUsersToolbar } from "./clinic-users-toolbar";
import { InviteUserDialog } from "./invite-user-dialog";
import type { UserAction } from "./clinic-user-actions";
import { useUserManagement } from "../hooks/use-user-management";
import type { ClinicUser, ClinicUserAiPermissions } from "../types/user-management.types";

const navItems = [
  { label: "Main Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patient Management", href: "#", icon: Users },
  { label: "Visit Management", href: "/visit-management", icon: Stethoscope },
  { label: "AI Clinical Insight", href: "/ai-clinical-engine", icon: ShieldCheck },
  { label: "Claim Readiness", href: "/claim-readiness", icon: ClipboardCheck },
  { label: "Economic Intelligence", href: "/economic-intelligence", icon: BarChart3 },
  { label: "Clinic Users", href: "/admin/users", icon: Users },
  { label: "Audit & Compliance", href: "/audit-compliance", icon: FileClock },
  { label: "Admin Settings", href: "#", icon: Settings },
];

export function UserManagementPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ClinicUsersWorkspace />
    </QueryClientProvider>
  );
}

function ClinicUsersWorkspace() {
  const workspace = useUserManagement();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ user: ClinicUser; action: UserAction } | null>(null);
  const data = workspace.usersQuery.data;

  function handleAction(user: ClinicUser, action: UserAction) {
    if (action === "view" || action === "audit" || action === "edit" || action === "roles" || action === "clinic_access" || action === "ai_access") {
      workspace.setSelectedUserId(user.id);
      return;
    }
    if (action === "resend") {
      workspace.actionMutation.mutate({ userId: user.id, action: "resend" });
      return;
    }
    if (action === "unlock") {
      setConfirm({ user, action });
      return;
    }
    if (action === "revoke_sessions") {
      setConfirm({ user, action });
      return;
    }
    if (action === "reactivate") {
      workspace.actionMutation.mutate({ userId: user.id, action: "reactivate" });
      return;
    }
    setConfirm({ user, action });
  }

  function toggleUser(userId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  function togglePage(checked: boolean, userIds: string[]) {
    setSelectedIds((current) => {
      const next = new Set(current);
      userIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  function suspendSelected(reason: string) {
    const [firstId] = Array.from(selectedIds);
    if (!firstId) return;
    workspace.suspendMutation.mutate({ userId: firstId, payload: { reason } }, { onSuccess: () => setSelectedIds(new Set()) });
  }

  const selectedUser = workspace.selectedUserQuery.data;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 min-[1040px]:grid-cols-[248px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <ClinicUsersHeader onExport={() => workspace.exportMutation.mutate()} exportPending={workspace.exportMutation.isPending} />
          <div className="px-4 py-6 sm:px-7">
            <ClinicUsersKpis summary={data?.summary} loading={workspace.usersQuery.isLoading} />
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="clinic-users-directory-title">
              <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id="clinic-users-directory-title" className="text-lg font-black text-[#0F2A5F]">User Directory</h2>
                  <p className="text-sm leading-6 text-slate-500">Search, filter and manage clinic users by Role, Status, Department and AI Access.</p>
                </div>
                {workspace.usersQuery.isFetching && !workspace.usersQuery.isLoading ? <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">Refreshing...</span> : null}
              </div>
              <ClinicUsersToolbar query={workspace.query} onChange={workspace.updateQuery} onClear={workspace.clearFilters} />
              {workspace.usersQuery.isError ? (
                <ErrorState onRetry={() => void workspace.usersQuery.refetch()} />
              ) : (
                <ClinicUsersTable
                  response={data}
                  query={workspace.query}
                  loading={workspace.usersQuery.isLoading}
                  selectedIds={selectedIds}
                  onToggleUser={toggleUser}
                  onTogglePage={togglePage}
                  onOpenUser={workspace.setSelectedUserId}
                  onAction={handleAction}
                  onPage={(page) => workspace.updateQuery({ page })}
                  onClearFilters={workspace.clearFilters}
                  onInvite={() => workspace.setInviteOpen(true)}
                />
              )}
            </section>
          </div>
        </div>
      </div>

      <ClinicUserDetailSheet
        user={selectedUser}
        loading={workspace.selectedUserQuery.isLoading}
        open={Boolean(workspace.selectedUserId)}
        onClose={() => workspace.setSelectedUserId(null)}
        onRevokeSessions={(userId) => setConfirm({ user: selectedUser ?? placeholderUser(userId), action: "revoke_sessions" })}
        onUnlock={(userId) => setConfirm({ user: selectedUser ?? placeholderUser(userId), action: "unlock" })}
        onUpdateAi={(userId, permissions, reason) => updateAi(workspace, userId, permissions, reason)}
        aiPending={workspace.aiAccessMutation.isPending}
      />

      <InviteUserDialog
        open={workspace.inviteOpen}
        pending={workspace.inviteMutation.isPending}
        onClose={() => workspace.setInviteOpen(false)}
        onSubmit={(payload) => workspace.inviteMutation.mutate(payload, { onSuccess: () => workspace.setInviteOpen(false) })}
        onDraft={() => workspace.setToast({ title: "Invitation saved as draft - บันทึกร่างคำเชิญแล้ว", tone: "info" })}
      />

      <BulkUserActions
        count={selectedIds.size}
        pending={workspace.suspendMutation.isPending}
        onClear={() => setSelectedIds(new Set())}
        onMockAction={(message) => workspace.setToast({ title: message, tone: "info" })}
        onSuspend={suspendSelected}
      />

      <ConfirmationDialog
        confirmation={confirm}
        pending={workspace.actionMutation.isPending || workspace.suspendMutation.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={(reason) => {
          if (!confirm) return;
          if (confirm.action === "suspend" || confirm.action === "cancel_invite") {
            workspace.suspendMutation.mutate({ userId: confirm.user.id, payload: { reason } });
          } else if (confirm.action === "unlock") {
            workspace.actionMutation.mutate({ userId: confirm.user.id, action: "unlock" });
          } else if (confirm.action === "revoke_sessions") {
            workspace.actionMutation.mutate({ userId: confirm.user.id, action: "revoke_sessions" });
          }
          setConfirm(null);
        }}
      />

      {workspace.toast ? <Toast title={workspace.toast.title} tone={workspace.toast.tone} onClose={() => workspace.setToast(null)} /> : null}
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden h-screen sticky top-0 overflow-y-auto bg-[#0F2A5F] px-4 py-6 text-white min-[1040px]:block" aria-label="Main navigation">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black shadow-lg">N</div>
        <div>
          <div className="font-black">Med AI NexSure</div>
          <p className="text-xs text-blue-100">Healthcare & Insurance Intelligence</p>
        </div>
      </div>
      <nav className="mt-6 space-y-1" aria-label="Platform sections">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === "Clinic Users";
          return (
            <a key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 ${active ? "bg-blue-600/35 text-white shadow-[inset_3px_0_0_#38BDF8]" : "text-blue-100 hover:bg-white/10"}`}>
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <AlertTriangle className="text-red-700" size={32} aria-hidden="true" />
      <h2 className="mt-3 text-lg font-black text-slate-900">Unable to load clinic users</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">ไม่สามารถโหลดข้อมูลผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ</p>
      <Button onClick={onRetry} className="mt-4 rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500">Retry</Button>
    </div>
  );
}

function ConfirmationDialog({
  confirmation,
  pending,
  onCancel,
  onConfirm,
}: {
  confirmation: { user: ClinicUser; action: UserAction } | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  if (!confirmation) return null;
  const needsReason = confirmation.action === "suspend" || confirmation.action === "cancel_invite";
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-action-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="confirm-action-title" className="text-xl font-black text-[#0F2A5F]">Confirm action</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">This action affects access to clinical, insurance or audit data. กรุณายืนยันก่อนดำเนินการ</p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
          User: {confirmation.user.fullName}<br />
          Action: {confirmation.action.replaceAll("_", " ")}
        </div>
        {needsReason ? (
          <label className="mt-4 block text-sm font-black text-slate-700">
            Reason <span className="text-red-700">*</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</Button>
          <Button disabled={pending || (needsReason && reason.trim().length < 8)} onClick={() => { onConfirm(reason || "Security action confirmed by Clinic Admin"); setReason(""); }} className="rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            {pending ? "Working..." : "Confirm"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Toast({ title, tone, onClose }: { title: string; tone: "success" | "error" | "info"; onClose: () => void }) {
  const classes = tone === "error" ? "border-red-200 bg-red-50 text-red-800" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800";
  return (
    <div className={`fixed bottom-5 right-5 z-[80] max-w-md rounded-2xl border p-4 text-sm font-bold shadow-xl ${classes}`} role="status">
      <div className="flex items-start justify-between gap-4">
        <span>{title}</span>
        <button type="button" onClick={onClose} className="font-black focus:outline-none focus:ring-2 focus:ring-blue-500">Close</button>
      </div>
    </div>
  );
}

function updateAi(workspace: ReturnType<typeof useUserManagement>, userId: string, permissions: ClinicUserAiPermissions, reason: string) {
  const user = workspace.selectedUserQuery.data;
  if (!user) return;
  workspace.aiAccessMutation.mutate({
    userId,
    payload: {
      aiAccessLevel: user.aiAccessLevel,
      permissions,
      reason,
    },
  });
}

function placeholderUser(userId: string): ClinicUser {
  return {
    id: userId,
    fullName: "Selected user",
    initials: "SU",
    employeeId: "UNKNOWN",
    email: "unknown@nexsure.health",
    primaryRole: "clinic_staff",
    additionalRoles: [],
    clinicScopes: [],
    aiAccessStatus: "disabled",
    aiAccessLevel: "disabled",
    aiPermissions: {
      viewAiSummary: false,
      generateSoapDraft: false,
      viewIcdSuggestions: false,
      acceptAiRecommendation: false,
      overrideAiWarning: false,
    },
    status: "inactive",
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    security: {
      failedAttempts: 0,
      activeSessions: 0,
      currentSession: "Unknown",
      browserDevice: "Unknown",
      location: "Unknown",
      maskedIpAddress: "Masked",
      mfaVerified: false,
    },
    auditTrail: [],
  };
}
