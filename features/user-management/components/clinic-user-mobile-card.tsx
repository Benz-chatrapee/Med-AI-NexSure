import { Checkbox } from "@/components/ui/checkbox";
import { roleLabels } from "../constants/clinic-user-options";
import type { ClinicUser } from "../types/user-management.types";
import { AiAccessBadge, StatusBadge } from "./status-badges";
import { ClinicUserActions, type UserAction } from "./clinic-user-actions";

export function ClinicUserMobileCard({
  user,
  selected,
  onSelect,
  onOpen,
  onAction,
}: {
  user: ClinicUser;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onAction: (user: ClinicUser, action: UserAction) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox checked={selected} onChange={(event) => onSelect(event.currentTarget.checked)} aria-label={`Select ${user.fullName}`} className="h-5 w-5 accent-blue-800" />
          <button type="button" onClick={onOpen} className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {user.initials}
          </button>
          <div className="min-w-0">
            <button type="button" onClick={onOpen} className="truncate text-left font-black text-[#0F2A5F] underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">{user.fullName}</button>
            <div className="text-xs font-semibold text-slate-500">{roleLabels[user.primaryRole]} - {user.departmentName}</div>
          </div>
        </div>
        <ClinicUserActions user={user} onAction={onAction} />
      </div>
      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 text-sm">
        <Info label="Clinic" value={user.clinicScopes[0]?.clinicName ?? "Assigned clinic"} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Status</span>
          <StatusBadge status={user.status} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">AI Access</span>
          <AiAccessBadge status={user.aiAccessStatus} level={user.aiAccessLevel} />
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-800">{value}</strong>
    </div>
  );
}
