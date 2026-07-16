import type { TaskItem, TaskPriority, TaskStatus } from "../types";

const priorityOrder: TaskPriority[] = ["Critical", "High", "Medium", "Low"];
const statusOrder: TaskStatus[] = ["Open", "In Progress", "In Review", "Completed", "Overdue"];
const severityColors = {
  low: "#059669",
  medium: "#D97706",
  high: "#DC2626",
  blue: "#2563EB",
  deep: "#0F2A5F",
  border: "#E2E8F0",
  soft: "#EFF6FF",
  muted: "#64748B",
  text: "#0F172A",
} as const;

type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export function TaskAnalyticsPanel({ tasks }: { tasks: TaskItem[] }) {
  const weeklyActivity = [
    { day: "Mon", created: 7, completed: 5 },
    { day: "Tue", created: 9, completed: 6 },
    { day: "Wed", created: 6, completed: 7 },
    { day: "Thu", created: 11, completed: 8 },
    { day: "Fri", created: 8, completed: 10 },
    { day: "Sat", created: 5, completed: 6 },
    { day: "Sun", created: 4, completed: 5 },
  ];
  const priorityData = priorityOrder.map((priority) => ({
    label: priority,
    value: countBy(tasks, "priority", priority),
    color: priority === "Critical" ? severityColors.high : priority === "High" ? severityColors.medium : priority === "Medium" ? severityColors.blue : "#CBD5E1",
  }));
  const workflowData = withWorkflowFallbacks(countValues(tasks.map((task) => task.workflow)));
  const dueTimeline = [
    { label: "Today", Critical: 2, High: 2, Medium: 3, Low: 1 },
    { label: "Tomorrow", Critical: 1, High: 2, Medium: 2, Low: 2 },
    { label: "This Week", Critical: 1, High: 3, Medium: 5, Low: 3 },
    { label: "Next Week", Critical: 0, High: 2, Medium: 4, Low: 5 },
  ];
  const statusData = statusOrder.map((status) => ({
    label: status === "In Review" ? "Review" : status,
    value: countBy(tasks, "status", status),
    color: status === "Completed" ? severityColors.low : status === "Overdue" ? severityColors.high : status === "In Review" ? severityColors.medium : status === "In Progress" ? severityColors.blue : "#94A3B8",
  }));
  const assigneeData = countValues(tasks.filter((task) => task.status !== "Completed").map((task) => task.assignee)).sort((a, b) => b.value - a.value);
  const overdueTrend = [3, 4, 3, 5, 4, 6, 5, 4, 6, 7, 5, 6, 4, 3, 4];
  const criticalTasks = tasks.filter((task) => task.priority === "Critical" || task.status === "Overdue").slice(0, 5);
  const agingData = [
    { label: "0-1 day", Critical: 1, High: 2, Medium: 4, Low: 2 },
    { label: "2-3 days", Critical: 1, High: 2, Medium: 2, Low: 1 },
    { label: "4-7 days", Critical: 1, High: 1, Medium: 1, Low: 0 },
    { label: ">7 days", Critical: 1, High: 0, Medium: 0, Low: 0 },
  ];

  return (
    <section aria-label="Task Center operational intelligence dashboard" className="grid min-w-0 gap-5 xl:grid-cols-12">
      <ChartCard title="Weekly Activity" helper="เปรียบเทียบงานที่สร้างและปิดในแต่ละวัน" className="xl:col-span-5">
        <VerticalBarChart data={weeklyActivity} />
      </ChartCard>
      <ChartCard title="Priority Distribution" helper="แสดงจำนวนงานตามระดับความสำคัญ" className="xl:col-span-3">
        <DonutChart data={priorityData} total={tasks.length} />
      </ChartCard>
      <ChartCard title="SLA Performance" helper="ติดตามการทำงานตามข้อตกลงในรอบนี้" className="xl:col-span-4">
        <SemiGauge value={86} />
      </ChartCard>
      <ChartCard title="Workflow Distribution" helper="ปริมาณงานแยกตามกระบวนการปฏิบัติงาน" className="xl:col-span-4">
        <HorizontalBars data={workflowData} />
      </ChartCard>
      <ChartCard title="Due Timeline" helper="งานที่ใกล้ครบกำหนดแยกตามความสำคัญ" className="xl:col-span-4">
        <StackedColumns data={dueTimeline} />
      </ChartCard>
      <ChartCard title="Task Status" helper="สถานะงานปัจจุบันเพื่อช่วยจัดลำดับคิว" className="xl:col-span-4">
        <StackedBar data={statusData} />
      </ChartCard>
      <ChartCard title="Assignee Workload" helper="งานที่ยังเปิดอยู่เรียงตามผู้รับผิดชอบ" className="xl:col-span-4">
        <HorizontalBars data={assigneeData} />
      </ChartCard>
      <ChartCard title="Overdue Trend" helper="แนวโน้มงานเกินกำหนดในช่วง 30 วันล่าสุด" className="xl:col-span-4">
        <LineTrend values={overdueTrend} />
      </ChartCard>
      <ChartCard title="Risk Heatmap" helper="ภาพรวมความเสี่ยงตามกลุ่มงานปฏิบัติการ" className="xl:col-span-4">
        <RiskHeatmap />
      </ChartCard>
      <ChartCard title="Critical Task List" helper="รายการงานสำคัญที่ควรตรวจสอบก่อน" className="xl:col-span-6">
        <CriticalTaskList tasks={criticalTasks} />
      </ChartCard>
      <ChartCard title="Aging Tasks" helper="งานค้างแยกตามอายุงานและความสำคัญ" className="xl:col-span-6">
        <AgingBars data={agingData} />
      </ChartCard>
    </section>
  );
}

function ChartCard({ title, helper, children, className = "" }: { title: string; helper: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#64748B]">{helper}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function VerticalBarChart({ data }: { data: { day: string; created: number; completed: number }[] }) {
  const max = Math.max(...data.flatMap((item) => [item.created, item.completed]), 1);
  return (
    <div>
      <div className="flex h-56 items-end gap-4">
        {data.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-44 w-full items-end justify-center gap-1.5">
              <span className="w-3 rounded-t bg-[#2563EB] transition-all duration-500 ease-out" style={{ height: `${(item.created / max) * 100}%` }} title={`สร้างงาน ${item.created} รายการ`} />
              <span className="w-3 rounded-t bg-[#059669] transition-all duration-500 ease-out" style={{ height: `${(item.completed / max) * 100}%` }} title={`ปิดงาน ${item.completed} รายการ`} />
            </div>
            <span className="text-sm font-medium text-[#64748B]">{item.day}</span>
          </div>
        ))}
      </div>
      <LegendRow items={[["Created", "#2563EB"], ["Completed", "#059669"]]} />
    </div>
  );
}

function DonutChart({ data, total }: { data: ChartSegment[]; total: number }) {
  const gradient = data.reduce<{ stops: string[]; cursor: number }>((state, item) => {
    const start = state.cursor;
    const size = total > 0 ? (item.value / total) * 360 : 0;
    const end = start + size;
    return { stops: [...state.stops, `${item.color} ${start}deg ${end}deg`], cursor: end };
  }, { stops: [], cursor: 0 }).stops.join(",");

  return (
    <div className="grid gap-5 sm:grid-cols-[140px_1fr] sm:items-center">
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
          <strong className="text-3xl font-bold text-[#0F172A]">{total}</strong>
          <span className="text-sm text-[#64748B]">Total</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => <LegendMetric key={item.label} item={item} />)}
      </div>
    </div>
  );
}

function HorizontalBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-[#0F172A]">{item.label}</span>
            <span className="font-semibold text-[#0F172A]">{item.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#F8FAFC]">
            <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StackedColumns({ data }: { data: ({ label: string } & Record<TaskPriority, number>)[] }) {
  const max = Math.max(...data.map((item) => priorityOrder.reduce((sum, priority) => sum + item[priority], 0)), 1);
  return (
    <div>
      <div className="flex h-56 items-end gap-4">
        {data.map((item) => {
          const total = priorityOrder.reduce((sum, priority) => sum + item[priority], 0);
          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-44 w-full items-end justify-center">
                <div className="flex w-10 flex-col-reverse overflow-hidden rounded-t-xl bg-[#F8FAFC]" style={{ height: `${(total / max) * 100}%` }}>
                  {priorityOrder.map((priority) => <span key={priority} className="transition-all duration-500 ease-out" style={{ height: `${total > 0 ? (item[priority] / total) * 100 : 0}%`, background: priorityColor(priority) }} />)}
                </div>
              </div>
              <span className="text-center text-sm font-medium text-[#64748B]">{item.label}</span>
            </div>
          );
        })}
      </div>
      <LegendRow items={priorityOrder.map((priority) => [priority, priorityColor(priority)])} />
    </div>
  );
}

function StackedBar({ data }: { data: ChartSegment[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div>
      <div className="flex h-5 overflow-hidden rounded-full bg-[#F8FAFC]">
        {data.map((item) => <span key={item.label} className="transition-all duration-500 ease-out" style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, background: item.color }} title={`${item.label}: ${item.value}`} />)}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {data.map((item) => <LegendMetric key={item.label} item={item} />)}
      </div>
    </div>
  );
}

function SemiGauge({ value }: { value: number }) {
  const color = value >= 85 ? severityColors.low : value >= 70 ? severityColors.medium : severityColors.high;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-56 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-56 rounded-full bg-[#F8FAFC]" />
        <div className="absolute inset-x-0 top-0 h-56 rounded-full" style={{ background: `conic-gradient(from 270deg, ${color} 0deg ${value * 1.8}deg, transparent ${value * 1.8}deg 180deg)` }} />
        <div className="absolute inset-x-8 top-8 h-40 rounded-full bg-white" />
        <div className="absolute inset-x-0 bottom-0 text-center">
          <strong className="text-5xl font-bold text-[#0F172A]">{value}%</strong>
          <p className="mt-1 text-sm text-[#64748B]">SLA compliant</p>
        </div>
      </div>
      <LegendRow items={[["Target", "#059669"], ["Watch", "#D97706"], ["Breach", "#DC2626"]]} />
    </div>
  );
}

function LineTrend({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 100;
    const y = 90 - ((value - min) / range) * 75;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg className="h-56 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Overdue trend line chart">
      <polyline points={points} fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <line x1="0" x2="100" y1="92" y2="92" stroke="#E2E8F0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function CriticalTaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="divide-y divide-[#E2E8F0]">
      {tasks.map((task, index) => (
        <div key={task.id} className="grid gap-3 py-4 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">{index + 1}</span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#0F172A]">{task.title}</p>
            <p className="mt-1 text-sm text-[#64748B]">{task.workflow}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Badge tone={task.priority === "Critical" ? "danger" : "warn"}>{task.priority}</Badge>
            <span className="text-sm font-semibold text-[#DC2626]">{task.due}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskHeatmap() {
  const rows = ["Claim", "Clinical", "Evidence", "Compliance", "Medication"];
  const columns: { label: string; tone: "low" | "medium" | "high" }[] = [
    { label: "Low", tone: "low" },
    { label: "Medium", tone: "medium" },
    { label: "High", tone: "high" },
  ];
  return (
    <div className="grid grid-cols-[100px_repeat(3,1fr)] gap-2">
      <span />
      {columns.map((column) => <span key={column.label} className="text-center text-sm font-medium text-[#64748B]">{column.label}</span>)}
      {rows.map((row, rowIndex) => (
        <div key={row} className="contents">
          <span className="text-sm font-medium text-[#0F172A]">{row}</span>
          {columns.map((column, columnIndex) => <span key={`${row}-${column.label}`} className="h-10 rounded-xl transition duration-200 hover:scale-[1.03]" style={{ background: heatColor(column.tone), opacity: 0.35 + ((rowIndex + columnIndex) % 3) * 0.22 }} />)}
        </div>
      ))}
    </div>
  );
}

function AgingBars({ data }: { data: ({ label: string } & Record<TaskPriority, number>)[] }) {
  return (
    <div className="space-y-4">
      {data.map((item) => {
        const total = priorityOrder.reduce((sum, priority) => sum + item[priority], 0);
        return (
          <div key={item.label} className="grid gap-3 sm:grid-cols-[90px_minmax(0,1fr)_36px] sm:items-center">
            <span className="text-sm font-medium text-[#0F172A]">{item.label}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-[#F8FAFC]">
              {priorityOrder.map((priority) => <span key={priority} className="transition-all duration-500 ease-out" style={{ width: `${total > 0 ? (item[priority] / total) * 100 : 0}%`, background: priorityColor(priority) }} />)}
            </div>
            <span className="text-right text-sm font-semibold text-[#0F172A]">{total}</span>
          </div>
        );
      })}
      <LegendRow items={priorityOrder.map((priority) => [priority, priorityColor(priority)])} />
    </div>
  );
}

function LegendMetric({ item }: { item: ChartSegment }) {
  return <div className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} /><span className="truncate font-medium text-[#64748B]">{item.label}</span></span><strong className="font-semibold text-[#0F172A]">{item.value}</strong></div>;
}

function LegendRow({ items }: { items: [string, string][] }) {
  return <div className="mt-4 flex flex-wrap gap-3">{items.map(([label, color]) => <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{label}</span>)}</div>;
}

function Badge({ tone, children }: { tone: "danger" | "warn"; children: React.ReactNode }) {
  return <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${tone === "danger" ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>{children}</span>;
}

function countBy<TKey extends keyof TaskItem>(tasks: TaskItem[], key: TKey, value: TaskItem[TKey]) {
  return tasks.filter((task) => task[key] === value).length;
}

function countValues(values: string[]) {
  return values.reduce<{ label: string; value: number }[]>((items, value) => {
    const existing = items.find((item) => item.label === value);
    if (existing) existing.value += 1;
    else items.push({ label: value, value: 1 });
    return items;
  }, []);
}

function withWorkflowFallbacks(data: { label: string; value: number }[]) {
  const preferred = ["Claim Readiness", "Missing Evidence", "Prescription Safety", "Compliance", "Medical Certificate"];
  return preferred.map((label) => data.find((item) => item.label === label) ?? { label, value: 0 });
}

function priorityColor(priority: TaskPriority) {
  return priority === "Critical" ? severityColors.high : priority === "High" ? severityColors.medium : priority === "Medium" ? severityColors.blue : "#CBD5E1";
}

function heatColor(tone: "low" | "medium" | "high") {
  return tone === "low" ? severityColors.low : tone === "medium" ? severityColors.medium : severityColors.high;
}
