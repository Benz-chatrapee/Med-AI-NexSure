import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { aiAccessLevelLabels, dataAccessLevelLabels, roleLabels } from "../constants/clinic-user-options";
import type { ClinicUser, ClinicUsersQuery, ClinicUsersResponse } from "../types/user-management.types";
import { ClinicUserActions, type UserAction } from "./clinic-user-actions";
import { ClinicUserMobileCard } from "./clinic-user-mobile-card";
import { ClinicUsersEmptyState } from "./clinic-users-empty-state";
import { AiAccessBadge, Badge, StatusBadge } from "./status-badges";

export function ClinicUsersTable({
  response,
  query,
  loading,
  selectedIds,
  onToggleUser,
  onTogglePage,
  onOpenUser,
  onAction,
  onPage,
  onClearFilters,
  onInvite,
}: {
  response?: ClinicUsersResponse;
  query: ClinicUsersQuery;
  loading: boolean;
  selectedIds: Set<string>;
  onToggleUser: (userId: string, checked: boolean) => void;
  onTogglePage: (checked: boolean, userIds: string[]) => void;
  onOpenUser: (userId: string) => void;
  onAction: (user: ClinicUser, action: UserAction) => void;
  onPage: (page: number) => void;
  onClearFilters: () => void;
  onInvite: () => void;
}) {
  const users = response?.data ?? [];
  const pageUserIds = users.map((user) => user.id);
  const allSelected = pageUserIds.length > 0 && pageUserIds.every((id) => selectedIds.has(id));
  const filtered = Boolean(query.search || query.role || query.status || query.departmentId || query.aiAccessStatus);

  if (loading) return <TableSkeleton />;

  if (!response || users.length === 0) {
    return <ClinicUsersEmptyState filtered={filtered} onClear={onClearFilters} onInvite={onInvite} />;
  }

  const start = response.total ? (response.page - 1) * response.pageSize + 1 : 0;
  const end = Math.min(response.page * response.pageSize, response.total);

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-sm" aria-label="Clinic users directory">
          <caption className="sr-only">Clinic users with role, clinic access, AI access, account status and actions</caption>
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">
                <Checkbox checked={allSelected} onChange={(event) => onTogglePage(event.currentTarget.checked, pageUserIds)} aria-label="Select all users on current page" className="h-4 w-4 accent-blue-800" />
              </th>
              {["User", "Email", "Role", "Department", "Clinic Access", "AI Access", "Status", "Last Active", "Actions"].map((head) => (
                <th key={head} scope="col" className="border-b border-slate-200 px-4 py-3 font-black">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="align-middle hover:bg-blue-50/50">
                <td className="border-b border-slate-100 px-4 py-4">
                  <Checkbox checked={selectedIds.has(user.id)} onChange={(event) => onToggleUser(user.id, event.currentTarget.checked)} aria-label={`Select ${user.fullName}`} className="h-4 w-4 accent-blue-800" />
                </td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => onOpenUser(user.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">{user.initials}</button>
                    <div>
                      <button type="button" onClick={() => onOpenUser(user.id)} className="font-black text-[#0F2A5F] underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">{user.fullName}</button>
                      <div className="text-xs font-semibold text-slate-500">{user.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-slate-700">{user.email}</td>
                <td className="border-b border-slate-100 px-4 py-4"><Badge tone="neutral">{roleLabels[user.primaryRole]}</Badge></td>
                <td className="border-b border-slate-100 px-4 py-4 font-semibold text-slate-700">{user.departmentName ?? "Unassigned"}</td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <div className="max-w-48">
                    <strong className="text-xs text-slate-800">{user.clinicScopes[0]?.clinicName}</strong>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {user.clinicScopes.length > 1 ? `+${user.clinicScopes.length - 1} additional clinic${user.clinicScopes.length > 2 ? "s" : ""}` : "Assigned clinic only"}
                    </div>
                    <div className="text-xs text-slate-500">{dataAccessLevelLabels[user.clinicScopes[0]?.dataAccessLevel ?? "assigned_clinic"]}</div>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-4"><AiAccessBadge status={user.aiAccessStatus} level={user.aiAccessLevel} /></td>
                <td className="border-b border-slate-100 px-4 py-4"><StatusBadge status={user.status} /></td>
                <td className="border-b border-slate-100 px-4 py-4">
                  <strong className="text-xs text-slate-800">{formatRelative(user.lastActiveAt)}</strong>
                  <div className="text-xs text-slate-500">{formatDate(user.lastActiveAt)}</div>
                  <span className="sr-only">AI access level {aiAccessLevelLabels[user.aiAccessLevel]}</span>
                </td>
                <td className="border-b border-slate-100 px-4 py-4"><ClinicUserActions user={user} onAction={onAction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {users.map((user) => (
          <ClinicUserMobileCard key={user.id} user={user} selected={selectedIds.has(user.id)} onSelect={(checked) => onToggleUser(user.id, checked)} onOpen={() => onOpenUser(user.id)} onAction={onAction} />
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {start}-{end} of {response.total} matching users</span>
        <div className="flex items-center gap-2">
          <Button onClick={() => onPage(response.page - 1)} disabled={response.page <= 1} className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            <ChevronLeft size={15} aria-hidden="true" /> Previous
          </Button>
          <span>Page {response.page} of {response.totalPages}</span>
          <Button onClick={() => onPage(response.page + 1)} disabled={response.page >= response.totalPages} className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            Next <ChevronRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="mb-3 h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Never";
}

function formatRelative(value?: string) {
  if (!value) return "Never";
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}
