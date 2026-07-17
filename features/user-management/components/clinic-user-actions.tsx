import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ClinicUser } from "../types/user-management.types";

export type UserAction = "view" | "edit" | "roles" | "clinic_access" | "ai_access" | "reset_password" | "disable" | "enable" | "lock" | "suspend" | "audit" | "resend" | "cancel_invite" | "unlock" | "revoke_sessions" | "reactivate";

export function ClinicUserActions({
  user,
  onAction,
}: {
  user: ClinicUser;
  onAction: (user: ClinicUser, action: UserAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const actions = getActions(user);
  return (
    <div className="relative inline-block text-left">
      <Button
        aria-label={`Open actions for ${user.fullName}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </Button>
      {open ? (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.value}
              type="button"
              role="menuitem"
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${action.danger ? "text-red-700" : "text-slate-700"}`}
              onClick={() => {
                setOpen(false);
                onAction(user, action.value);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getActions(user: ClinicUser): { value: UserAction; label: string; danger?: boolean }[] {
  const base = [{ value: "view" as const, label: "View Details" }];
  if (user.status === "active") {
    return [
      ...base,
      { value: "edit", label: "Edit User" },
      { value: "roles", label: "Manage Roles" },
      { value: "clinic_access", label: "Manage Clinic Access" },
      { value: "ai_access", label: "Manage AI Access" },
      { value: "reset_password", label: "Reset Password" },
      { value: "lock", label: "Lock Account", danger: true },
      { value: "disable", label: "Disable User", danger: true },
      { value: "suspend", label: "Suspend User", danger: true },
      { value: "audit", label: "View Audit Log" },
    ];
  }
  if (user.status === "invited") {
    return [
      ...base,
      { value: "edit", label: "Edit User" },
      { value: "resend", label: "Resend Invitation" },
      { value: "cancel_invite", label: "Cancel Invitation", danger: true },
      { value: "audit", label: "View Audit Log" },
    ];
  }
  if (user.status === "locked") {
    return [
      ...base,
      { value: "unlock", label: "Unlock Account" },
      { value: "reset_password", label: "Reset Password" },
      { value: "revoke_sessions", label: "Revoke Sessions", danger: true },
      { value: "audit", label: "View Audit Log" },
    ];
  }
  return [
    ...base,
    { value: "enable", label: "Enable User" },
    { value: "reactivate", label: "Reactivate User" },
    { value: "audit", label: "View Audit Log" },
  ];
}
