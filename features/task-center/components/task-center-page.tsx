"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { initialTasks } from "../task-center-data";
import type { ActiveTab, TaskPriority, TaskWorkflow } from "../types";
import { TaskAnalyticsPanel } from "./task-analytics-panel";
import { TaskHeader } from "./task-header";
import { TaskShell } from "./task-shell";
import { TaskToast } from "./task-toast";
import { TaskWorklist } from "./task-worklist";

export function TaskCenterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [selectedTaskId, setSelectedTaskId] = useState("TASK-1038");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<"" | TaskPriority>("");
  const [workflow, setWorkflow] = useState<"" | TaskWorkflow>("");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return initialTasks.filter((task) => {
      const tabMatch = activeTab === "all" || task.tab === activeTab || (activeTab === "mine" && task.assignee === "Chatrapee Jam-Oum") || (activeTab === "unassigned" && task.assignee === "Unassigned") || (activeTab === "overdue" && task.status === "Overdue") || (activeTab === "completed" && task.status === "Completed");
      const queryMatch = !normalizedQuery || [task.id, task.title, task.subtitle, task.workflow, task.assignee].join(" ").toLowerCase().includes(normalizedQuery);
      const priorityMatch = !priority || task.priority === priority;
      const workflowMatch = !workflow || task.workflow === workflow;
      const statusMatch = !status || task.status === status;
      const assigneeMatch = !assignee || task.assignee === assignee;
      return tabMatch && queryMatch && priorityMatch && workflowMatch && statusMatch && assigneeMatch;
    });
  }, [activeTab, assignee, priority, query, status, workflow]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function selectTask(id: string) {
    setSelectedTaskId(id);
    router.push(`/task-center/${id}`);
  }

  function resetFilters() {
    setQuery("");
    setPriority("");
    setWorkflow("");
    setStatus("");
    setAssignee("");
    setActiveTab("all");
    showToast("รีเซ็ตตัวกรองแล้ว");
  }

  return (
    <TaskShell
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen((open) => !open)}
      onClosePanels={() => { setSidebarOpen(false); }}
    >
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 xl:px-8 xl:py-7">
        <TaskHeader onReset={resetFilters} onToast={showToast} />
        <TaskAnalyticsPanel tasks={initialTasks} />
        <div className="mt-6 min-w-0">
          <TaskWorklist tasks={filteredTasks} activeTab={activeTab} selectedTaskId={selectedTaskId} query={query} priority={priority} workflow={workflow} status={status} assignee={assignee} onTabChange={setActiveTab} onQueryChange={setQuery} onPriorityChange={setPriority} onWorkflowChange={setWorkflow} onStatusChange={setStatus} onAssigneeChange={setAssignee} onSelectTask={selectTask} onToast={showToast} />
        </div>
      </div>
      <TaskToast message={toast} />
    </TaskShell>
  );
}
