import { ArrowUpDown, CircleCheckBig, ClipboardList, Clock3, LoaderCircle, MoreHorizontal, Search, Timer } from "lucide-react";
import type { ActiveTab, TaskItem, TaskPriority, TaskWorkflow } from "../types";
import { dueClasses, focusRing, priorityClasses, statusClasses, workflowClasses } from "./task-center-styles";

const tabs: { id: ActiveTab; label: string; count?: string; tone?: string }[] = [
  { id: "all", label: "All Tasks", count: "24" },
  { id: "mine", label: "My Tasks", count: "11" },
  { id: "unassigned", label: "Unassigned", count: "4" },
  { id: "overdue", label: "Overdue", count: "3", tone: "text-rose-500" },
  { id: "completed", label: "Completed" },
];

type TaskWorklistProps = {
  tasks: TaskItem[];
  activeTab: ActiveTab;
  selectedTaskId: string;
  query: string;
  priority: "" | TaskPriority;
  workflow: "" | TaskWorkflow;
  status: string;
  assignee: string;
  onTabChange: (tab: ActiveTab) => void;
  onQueryChange: (value: string) => void;
  onPriorityChange: (value: "" | TaskPriority) => void;
  onWorkflowChange: (value: "" | TaskWorkflow) => void;
  onStatusChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onSelectTask: (id: string) => void;
  onToast: (message: string) => void;
};

export function TaskWorklist(props: TaskWorklistProps) {
  const { tasks, activeTab, selectedTaskId, query, priority, workflow, status, assignee, onTabChange, onQueryChange, onPriorityChange, onWorkflowChange, onStatusChange, onAssigneeChange, onSelectTask, onToast } = props;
  void status;
  void onStatusChange;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button key={tab.id} data-tab={tab.id} className={`h-11 whitespace-nowrap rounded-xl px-4 text-sm font-medium ${activeTab === tab.id ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0F172A]"}`} onClick={() => onTabChange(tab.id)} type="button">
                {tab.label}{tab.count ? <span className={`ml-2 ${activeTab === tab.id ? "opacity-90" : tab.tone ?? "text-[#64748B]"}`}>{tab.count}</span> : null}
              </button>
            ))}
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(150px,1fr))_auto]">
            <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} className={`${focusRing} h-[42px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-11 pr-4 text-sm font-medium text-[#0F172A] placeholder:text-[#64748B]`} placeholder="Search task ID, title, patient..." /></div>
            <select value={priority} onChange={(event) => onPriorityChange(event.target.value as "" | TaskPriority)} className={`${focusRing} h-[42px] rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A]`}><option value="">All Priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
            <select value={workflow} onChange={(event) => onWorkflowChange(event.target.value as "" | TaskWorkflow)} className={`${focusRing} h-[42px] rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A]`}><option value="">All Workflows</option><option>Claim Readiness</option><option>Missing Evidence</option><option>Prescription Safety</option><option>Compliance</option><option>Clinical Review</option></select>
            <select value={assignee} onChange={(event) => onAssigneeChange(event.target.value)} className={`${focusRing} h-[42px] rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A]`}><option value="">All Assignees</option><option>Chatrapee Jam-Oum</option><option>Dr. Narin</option><option>Pharmacist Team</option><option>Unassigned</option></select>
            <button className={`${focusRing} inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172A] hover:bg-[#EFF6FF]`} onClick={() => onToast("เปิดตัวเลือกการเรียงลำดับแล้ว")} type="button"><ArrowUpDown className="h-4 w-4 text-[#2563EB]" />Sort</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[#64748B]">Quick filters:</span>
            <button className="rounded-full bg-[#FEE2E2] px-3 py-1.5 font-medium text-[#DC2626]" onClick={() => onPriorityChange("Critical")} type="button">Critical</button>
            <button className="rounded-full bg-[#FEF3C7] px-3 py-1.5 font-medium text-[#D97706]" onClick={() => onPriorityChange("High")} type="button">High Priority</button>
            <button className="rounded-full bg-[#EFF6FF] px-3 py-1.5 font-medium text-[#2563EB]" onClick={() => onWorkflowChange("Missing Evidence")} type="button">Missing Evidence</button>
            <button className="rounded-full bg-[#F8FAFC] px-3 py-1.5 font-medium text-[#0F2A5F]" onClick={() => onWorkflowChange("Compliance")} type="button">Compliance</button>
          </div>
        </div>
      </div>
      <div className="hidden max-w-full overflow-x-auto md:block">
        <table className="min-w-full">
          <thead className="sticky top-0 z-10"><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-sm font-semibold text-[#64748B]"><th className="w-12 px-5 py-4"><input type="checkbox" aria-label="Select all" /></th><th className="min-w-[320px] px-5 py-4">Task</th><th className="px-5 py-4">Workflow</th><th className="px-5 py-4">Priority</th><th className="px-5 py-4">Assignee</th><th className="px-5 py-4">Due</th><th className="px-5 py-4">Status</th><th className="w-14 px-5 py-4" aria-label="Actions" /></tr></thead>
          <tbody>{tasks.map((task, index) => <TaskRow key={task.id} task={task} index={index} selected={task.id === selectedTaskId} onSelectTask={onSelectTask} />)}</tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">{tasks.map((task) => <TaskCard key={task.id} task={task} selected={task.id === selectedTaskId} onSelectTask={onSelectTask} />)}</div>
      <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">{tasks.length ? `แสดง 1-${tasks.length} จาก ${tasks.length} งานที่ตรงกับตัวกรอง` : "ไม่พบงานที่ตรงกับตัวกรองที่เลือก"}</p>
        <div className="flex items-center gap-2"><button className={`${focusRing} rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#64748B]`} type="button">Previous</button><button className="rounded-lg bg-[#0F2A5F] px-3 py-2 text-sm font-medium text-white" type="button">1</button><button className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0F172A]" type="button">2</button><button className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0F172A]" type="button">3</button><button className={`${focusRing} rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0F172A]`} type="button">Next</button></div>
      </div>
    </section>
  );
}

function TaskRow({ task, index, selected, onSelectTask }: { task: TaskItem; index: number; selected: boolean; onSelectTask: (id: string) => void }) {
  return (
    <tr className={`cursor-pointer border-b border-[#E2E8F0] text-base transition hover:bg-[#EFF6FF] ${index % 2 === 1 ? "bg-[#F8FAFC]/45" : "bg-white"} ${selected ? "!bg-[#EFF6FF] shadow-[inset_3px_0_0_#2563EB]" : ""}`} onClick={() => onSelectTask(task.id)}>
      <td className="px-5 py-5" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${task.id}`} /></td>
      <td className="px-5 py-5"><div><p className="text-base font-semibold text-[#0F172A]">{task.title}</p><p className="mt-2 text-sm text-[#64748B]">{task.id} · {task.subtitle}</p></div></td>
      <td className="px-5 py-5"><span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${workflowClasses(task.workflow)}`}>{task.workflow}</span></td>
      <td className="px-5 py-5"><span className={`rounded-full px-3 py-1.5 text-sm font-medium ${priorityClasses(task.priority)}`}>{task.priority}</span></td>
      <td className="px-5 py-5"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${task.assignee === "Unassigned" ? "bg-[#F8FAFC] text-[#64748B]" : "bg-[#EFF6FF] text-[#2563EB]"} text-sm font-bold`}>{task.assigneeInitials}</div><span className="max-w-[150px] truncate text-base font-medium text-[#0F172A]">{task.assignee}</span></div></td>
      <td className="px-5 py-5"><span className={`whitespace-nowrap text-base font-semibold ${dueClasses(task.dueTone)}`}>{task.due}</span></td>
      <td className="px-5 py-5"><StatusBadge status={task.status} /></td>
      <td className="px-5 py-5 text-right"><button className="rounded-lg p-2 text-[#64748B] hover:bg-white hover:text-[#0F172A]" onClick={(event) => { event.stopPropagation(); onSelectTask(task.id); }} type="button" aria-label={`Open actions for ${task.id}`}><MoreHorizontal className="h-5 w-5" /></button></td>
    </tr>
  );
}

function TaskCard({ task, selected, onSelectTask }: { task: TaskItem; selected: boolean; onSelectTask: (id: string) => void }) {
  return (
    <article className={`min-w-0 rounded-2xl border ${selected ? "border-[#BFDBFE] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white"} p-5 shadow-sm`} onClick={() => onSelectTask(task.id)}>
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-base font-semibold text-[#0F172A]">{task.title}</p><p className="mt-2 text-sm text-[#64748B]">{task.id} · {task.subtitle}</p></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${priorityClasses(task.priority)}`}>{task.priority}</span></div>
      <div className="mt-4 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1.5 text-sm font-medium ${workflowClasses(task.workflow)}`}>{task.workflow}</span><StatusBadge status={task.status} /></div>
      <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">{task.assigneeInitials}</div><span className="text-sm font-medium text-[#64748B]">{task.assignee}</span></div><span className={`text-sm font-semibold ${dueClasses(task.dueTone)}`}>{task.due}</span></div>
    </article>
  );
}

function StatusBadge({ status }: { status: TaskItem["status"] }) {
  const details = statusDetails(status);
  const Icon = details.icon;

  return (
    <span className={`inline-flex max-w-[170px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${statusClasses(status)}`} title={`${status}: ${details.description}`} aria-label={`${status}: ${details.description}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block truncate leading-4">{status}</span>
        <span className="block truncate text-xs font-medium opacity-80">{details.description}</span>
      </span>
    </span>
  );
}

function statusDetails(status: TaskItem["status"]) {
  if (status === "Completed") return { description: "ปิดงานแล้ว", icon: CircleCheckBig };
  if (status === "In Progress") return { description: "กำลังดำเนินการ", icon: LoaderCircle };
  if (status === "In Review") return { description: "รอการตรวจทาน", icon: ClipboardList };
  if (status === "Overdue") return { description: "เกินกำหนด SLA", icon: Timer };
  return { description: "รอดำเนินการ", icon: Clock3 };
}
