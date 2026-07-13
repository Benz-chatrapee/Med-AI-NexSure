import { BrainCircuit, CheckCircle2, Clock3, LockKeyhole, ShieldAlert, UserX } from "lucide-react";
import { aiAccessLevelLabels, aiAccessStatusLabels, statusLabels } from "../constants/clinic-user-options";
import type { AiAccessLevel, AiAccessStatus, ClinicUserStatus } from "../types/user-management.types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

export function StatusBadge({ status }: { status: ClinicUserStatus }) {
  const config: Record<ClinicUserStatus, { tone: Tone; icon: typeof CheckCircle2 }> = {
    active: { tone: "success", icon: CheckCircle2 },
    invited: { tone: "warning", icon: Clock3 },
    locked: { tone: "danger", icon: LockKeyhole },
    suspended: { tone: "danger", icon: ShieldAlert },
    inactive: { tone: "neutral", icon: UserX },
  };
  const Icon = config[status].icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${toneClasses[config[status].tone]}`}>
      <Icon size={13} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

export function AiAccessBadge({ status, level }: { status: AiAccessStatus; level: AiAccessLevel }) {
  const tone: Tone = status === "enabled" ? "info" : status === "restricted" ? "warning" : "neutral";
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${toneClasses[tone]}`}>
        <BrainCircuit size={13} aria-hidden="true" />
        {aiAccessStatusLabels[status]}
      </span>
      <span className="text-xs font-semibold text-slate-500">{aiAccessLevelLabels[level]}</span>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${toneClasses[tone]}`}>{children}</span>;
}
