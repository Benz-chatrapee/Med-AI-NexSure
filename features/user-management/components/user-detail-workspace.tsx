"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  ClipboardCheck,
  Download,
  Edit3,
  FileClock,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { roleLabels } from "../constants/clinic-user-options";
import { clinicUsersMock } from "../data/clinic-users.mock";
import type { ClinicUser } from "../types/user-management.types";
import { Badge, StatusBadge } from "./status-badges";

type DetailTab = "overview" | "access" | "cases" | "ai" | "security" | "audit";
type DateRange = "Today" | "Last 7 Days" | "Last 30 Days" | "Custom";

interface UserDetailWorkspaceProps {
  userId: string;
}

interface CaseRow {
  visitId: string;
  patient: string;
  visitDate: string;
  role: string;
  visitStatus: string;
  score: number;
  claimStatus: "Ready" | "Needs Review" | "Not Ready";
  evidenceGaps: number;
  cost: string;
}

const tabs: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "access", label: "Access & Roles" },
  { id: "cases", label: "Assigned Cases" },
  { id: "ai", label: "AI Governance & Usage" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Activity & Audit Trail" },
];

const dateRanges: DateRange[] = ["Today", "Last 7 Days", "Last 30 Days", "Custom"];

const navItems = [
  { label: "Main Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
  { label: "Patient Management", href: "#", icon: Users, active: false },
  { label: "Visit Management", href: "/visit-management", icon: Stethoscope, active: false },
  { label: "AI Copilot", href: "/ai-clinical-engine", icon: BrainCircuit, active: false },
  { label: "Claim Readiness", href: "/claim-readiness", icon: ClipboardCheck, active: false },
  { label: "Evidence Package", href: "#", icon: Download, active: false },
  { label: "User Administration", href: "/admin/users", icon: UserCog, active: true },
  { label: "Roles & Permissions", href: "#", icon: ShieldCheck, active: false },
  { label: "Audit & Compliance", href: "/audit-compliance", icon: FileClock, active: false },
  { label: "Admin Settings", href: "#", icon: Settings, active: false },
];

const caseRows: CaseRow[] = [
  { visitId: "VST-2026-07109", patient: "Araya S.", visitDate: "10 Jul 2026", role: "Doctor", visitStatus: "Completed", score: 94, claimStatus: "Ready", evidenceGaps: 0, cost: "Normal" },
  { visitId: "VST-2026-07098", patient: "Somchai K.", visitDate: "10 Jul 2026", role: "Doctor", visitStatus: "Pending Evidence", score: 72, claimStatus: "Needs Review", evidenceGaps: 2, cost: "Alert" },
  { visitId: "VST-2026-07072", patient: "Masked Patient", visitDate: "9 Jul 2026", role: "Clinical Reviewer", visitStatus: "In Consultation", score: 58, claimStatus: "Not Ready", evidenceGaps: 4, cost: "Normal" },
  { visitId: "VST-2026-07061", patient: "Narin P.", visitDate: "9 Jul 2026", role: "Doctor", visitStatus: "Completed", score: 88, claimStatus: "Ready", evidenceGaps: 1, cost: "High" },
];

export function UserDetailWorkspace({ userId }: UserDetailWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("Last 30 Days");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [caseSearch, setCaseSearch] = useState("");
  const user = useMemo(() => clinicUsersMock.find((item) => item.id === userId) ?? clinicUsersMock[0], [userId]);
  const primaryRoleLabel = roleLabels[user.primaryRole];
  const licenseLabel = user.professionalLicense ? ` - Medical License ${user.professionalLicense}` : "";

  const filteredCases = useMemo(() => {
    const query = caseSearch.trim().toLowerCase();
    if (!query) return caseRows;
    return caseRows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query));
  }, [caseSearch]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }

  function openAction(action: string) {
    setReason("");
    setModalAction(action);
    setMenuOpen(false);
  }

  function confirmAction() {
    if (reason.trim().length < 10) {
      showToast("กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร");
      return;
    }
    showToast(`${modalAction ?? "Action"} completed - ระบบบันทึก Audit Log แล้ว`);
    setModalAction(null);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 min-[1040px]:grid-cols-[248px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0 overflow-x-hidden">
          <Topbar />
          <div className="w-full min-w-0 px-4 pb-28 pt-6 sm:px-7">
            <div className="mb-4 text-sm text-slate-500">Admin Settings / User Administration / <b className="text-[#1E3A8A]">User Detail</b></div>
            <section className="relative overflow-visible rounded-3xl border border-blue-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,42,95,.08)] before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-[#1E3A8A]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[22px] border-4 border-white bg-[#1E3A8A] text-2xl font-black text-white shadow-lg">NP</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-950 sm:text-[27px]">{user.fullName}</h1>
                      <Badge tone="info">{primaryRoleLabel}</Badge>
                      <StatusBadge status={user.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{user.email} - {user.employeeId}{licenseLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip>NexSure Health Network</Chip>
                      <Chip>{user.clinicScopes[0]?.clinicName ?? "Assigned Clinic"}</Chip>
                      <Chip>{user.departmentName ?? "Unassigned Department"}</Chip>
                      <Chip>Route ID: {userId}</Chip>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <PrimaryButton onClick={() => showToast("Opening Edit User form...")}><Edit3 size={16} /> Edit User</PrimaryButton>
                  <div className="relative">
                    <SecondaryButton onClick={() => setMenuOpen((current) => !current)}>More Actions <ChevronDown size={16} /></SecondaryButton>
                    {menuOpen ? (
                      <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        {["Reset Password", "Lock Account", "Disable User"].map((action) => <button key={action} type="button" onClick={() => openAction(action)} className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-blue-50">{action}</button>)}
                        <button type="button" onClick={() => { setMenuOpen(false); showToast("Invitation email sent successfully"); }} className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-blue-50">Resend Invitation</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <div className="my-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-base font-black">User Performance Overview</h2><p className="mt-1 text-xs text-slate-500">สรุปภาระงาน คุณภาพเอกสาร และผลลัพธ์ของเคสที่ผู้ใช้งานรายนี้รับผิดชอบ</p></div>
              <div className="flex rounded-xl border border-slate-200 bg-[#E9EFF8] p-1">
                {dateRanges.map((range) => <button key={range} type="button" onClick={() => { setDateRange(range); showToast(`ปรับช่วงเวลาของ KPI เป็น ${range} เรียบร้อยแล้ว`); }} className={`rounded-lg px-3 py-1.5 text-xs font-black ${dateRange === range ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-500"}`}>{range}</button>)}
              </div>
            </div>

            <Kpis />
            <Tabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === "overview" ? <OverviewTab user={user} primaryRoleLabel={primaryRoleLabel} onTab={setActiveTab} /> : null}
            {activeTab === "access" ? <AccessTab onSave={() => showToast("บันทึก Access Changes และสร้าง Audit Log เรียบร้อยแล้ว")} /> : null}
            {activeTab === "cases" ? <CasesTab rows={filteredCases} search={caseSearch} onSearch={setCaseSearch} /> : null}
            {activeTab === "ai" ? <AiTab /> : null}
            {activeTab === "security" ? <SecurityTab onAction={openAction} /> : null}
            {activeTab === "audit" ? <AuditTab /> : null}
          </div>
        </div>
      </div>
      {modalAction ? <SecurityModal action={modalAction} reason={reason} onReason={setReason} onCancel={() => setModalAction(null)} onConfirm={confirmAction} /> : null}
      {toast ? <div className="fixed bottom-6 right-6 z-[80] rounded-xl border border-blue-200 bg-[#0F2A5F] px-4 py-3 text-sm font-bold text-white shadow-xl" role="status">{toast}</div> : null}
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden h-screen sticky top-0 overflow-y-auto bg-[#0F2A5F] px-4 py-6 text-white shadow-[10px_0_30px_rgba(15,42,95,.08)] min-[1040px]:block" aria-label="Main navigation">
      <div className="flex items-center gap-3 pb-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-black text-[#0F2A5F] shadow-lg">N</div>
        <div><div className="font-black">Med AI NexSure</div><p className="text-xs text-blue-100">Healthcare & Insurance Intelligence</p></div>
      </div>
      <NavGroup label="Workspace" items={navItems.slice(0, 6)} />
      <NavGroup label="Administration" items={navItems.slice(6)} />
    </aside>
  );
}

function NavGroup({ label, items }: { label: string; items: typeof navItems }) {
  return (
    <>
      <div className="mt-6 px-2 text-[11px] font-black uppercase tracking-[.12em] text-blue-300">{label}</div>
      <nav className="mt-2 space-y-1" aria-label={label}>
        {items.map((item) => {
          const Icon = item.icon;
          return item.href.startsWith("/") ? (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${item.active ? "bg-[#173A78] text-white shadow-[inset_3px_0_0_#38BDF8]" : "text-blue-100 hover:bg-white/10"}`}>
              <Icon size={17} aria-hidden="true" /><span>{item.label}</span>
            </Link>
          ) : (
            <a key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${item.active ? "bg-[#173A78] text-white shadow-[inset_3px_0_0_#38BDF8]" : "text-blue-100 hover:bg-white/10"}`}>
              <Icon size={17} aria-hidden="true" /><span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
      <label className="flex w-[min(520px,45vw)] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 focus-within:border-blue-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <Search size={16} aria-hidden="true" />
        <input className="w-full bg-transparent text-sm outline-none" placeholder="Search patients, visits, claims, users, or evidence..." />
      </label>
      <div className="flex items-center gap-2"><IconButton label="AI Copilot"><BrainCircuit size={17} /></IconButton><IconButton label="Notifications"><Bell size={17} /></IconButton><div className="grid h-10 w-10 place-items-center rounded-full bg-[#1E3A8A] text-sm font-black text-white shadow-md">BC</div></div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return <button type="button" aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-[#1E3A8A]">{children}</button>;
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <Button onClick={onClick} className="rounded-xl border border-[#1E3A8A] bg-[#1E3A8A] px-4 py-2 font-black text-white shadow-sm hover:bg-blue-700">{children}</Button>;
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <Button onClick={onClick} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-black text-slate-800 shadow-sm hover:bg-blue-50">{children}</Button>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700">{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function SectionHead({ title, helper, action }: { title: string; helper: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="text-[17px] font-black text-[#0F2A5F]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p></div>{action}</div>;
}

function Kpis() {
  const items = [
    ["Assigned Cases", "128", "8.4% vs previous period", ClipboardCheck],
    ["Completed Cases", "104", "81.3% completion rate", Check],
    ["Claim Ready Rate", "87.6%", "3.2 pts vs previous period", Activity],
    ["AI Assisted Cases", "76", "59.4% of eligible cases", BrainCircuit],
    ["Avg. Readiness Score", "82", "4 pts vs previous period", BarChart3],
    ["Pending Actions", "14", "ต้องดำเนินการเพิ่มเติม", AlertTriangle],
  ] as const;
  return <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 min-[1320px]:grid-cols-6">{items.map(([label, value, helper, Icon]) => <Card key={label} className="relative overflow-hidden before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-[#1E3A8A]"><div className="flex items-center justify-between text-xs text-slate-500"><span>{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700"><Icon size={16} /></span></div><strong className="mt-3 block text-[27px] font-black text-[#0F2A5F]">{value}</strong><p className={`mt-1 text-xs font-bold ${label === "Pending Actions" ? "text-amber-700" : "text-emerald-700"}`}>{helper}</p></Card>)}</section>;
}

function Tabs({ activeTab, onChange }: { activeTab: DetailTab; onChange: (tab: DetailTab) => void }) {
  return <nav className="mt-6 flex overflow-x-auto rounded-t-2xl border border-slate-200 bg-white px-2" aria-label="User detail sections">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => onChange(tab.id)} className={`whitespace-nowrap border-b-4 px-4 py-3 text-sm font-black ${activeTab === tab.id ? "border-blue-600 bg-blue-50 text-[#1E3A8A]" : "border-transparent text-slate-500 hover:bg-blue-50"}`}>{tab.label}</button>)}</nav>;
}

function OverviewTab({ user, primaryRoleLabel, onTab }: { user: ClinicUser; primaryRoleLabel: string; onTab: (tab: DetailTab) => void }) {
  return (
    <div className="pt-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoCard title="User Profile" helper="ข้อมูลประจำตัว การติดต่อ และข้อมูลวิชาชีพของผู้ใช้งาน" action={<SecondaryButton>View Profile</SecondaryButton>} rows={[["Full Name", user.fullName], ["Display Name", user.fullName], ["Email Address", user.email], ["Phone Number", user.phone ?? "Not provided"], ["Job Title", user.jobTitle ?? primaryRoleLabel], ["Preferred Language", "English / Thai"], ["Time Zone", "Asia/Bangkok"], ["Last Updated", formatDateTime(user.updatedAt)]]} />
        <AccessSummary user={user} primaryRoleLabel={primaryRoleLabel} onTab={onTab} />
        <Card><SectionHead title="Case Activity Snapshot" helper="เลือกสถานะเพื่อกรอง Assigned Case List และตรวจสอบงานค้าง" /><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[["128", "Assigned"], ["18", "In Progress"], ["9", "Pending Evidence"], ["7", "Needs Review"], ["104", "Completed"]].map(([value, label]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"><strong className="block text-2xl font-black">{value}</strong><span className="text-xs text-slate-500">{label}</span></div>)}</div></Card>
        <Card><SectionHead title="Claim Readiness Overview" helper="ประเมินจาก Readiness Assessment ล่าสุดของแต่ละเคส" action={<SecondaryButton onClick={() => onTab("cases")}>View Cases</SecondaryButton>} /><div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center"><div className="relative h-[138px] w-[138px] rounded-full bg-[conic-gradient(#059669_0_62%,#D97706_62%_86%,#DC2626_86%)] after:absolute after:inset-5 after:grid after:place-items-center after:rounded-full after:bg-white after:text-3xl after:font-black after:content-['82']" aria-label="Average readiness score 82" /><Legend /></div></Card>
        <MetricsCard title="AI Clinical Insight" helper="ภาพรวมการใช้ AI Decision Support การยอมรับ และการปรับแก้คำแนะนำ" action={<SecondaryButton onClick={() => onTab("ai")}>Review AI Usage</SecondaryButton>} metrics={[["Suggestions", "214"], ["Accepted", "148"], ["Modified", "42"], ["Overrides", "6"]]} />
        <InfoCard title="Economic Intelligence" helper="วิเคราะห์ต้นทุนและ Cost Signal ตามสิทธิ์การเข้าถึงของผู้ตรวจสอบ" action={<Chip>Cost Indicator Access</Chip>} rows={[["Average Visit Cost", "THB 2,860"], ["Expected Range", "THB 2,200-THB 3,100"], ["Cost Alert Cases", "8 cases"], ["Normal Cost Cases", "96 cases"]]} />
      </div>
      <BarsCard title="Missing Evidence Insights" helper="แสดงหลักฐานหรือข้อมูลที่ขาดบ่อย เพื่อช่วยยกระดับ Claim Readiness" action={<SecondaryButton onClick={() => onTab("cases")}>Filter Cases</SecondaryButton>} rows={[["SOAP Incomplete", 82, 18], ["ICD Missing", 63, 14], ["Attachment Missing", 48, 11], ["Claim Justification", 35, 8], ["Patient Consent", 22, 5]]} />
      <TimelineCard title="Recent Operational Activity" helper="Latest actions across clinical, claim, and security modules" action={<SecondaryButton onClick={() => onTab("audit")}>View All Activity</SecondaryButton>} events={[["Completed claim readiness review", "Visit VST-2026-07109 - Result: Ready", "14 min ago"], ["Modified AI ICD suggestion", "Changed suggested ICD-10 before acceptance - Confidence 89%", "42 min ago"], ["Updated SOAP note", "Visit VST-2026-07098 - Version 4 saved", "1 hr ago"], ["Exported evidence package", "PDF package generated with audit summary", "Yesterday"]]} />
    </div>
  );
}

function AccessSummary({ user, primaryRoleLabel, onTab }: { user: ClinicUser; primaryRoleLabel: string; onTab: (tab: DetailTab) => void }) {
  const additionalRoles = user.additionalRoles.map((role) => roleLabels[role]).join(", ") || "None";
  return <Card><SectionHead title="Access & Role Overview" helper="สรุป Role, Effective Permission และขอบเขตข้อมูลที่สามารถเข้าถึง" action={<SecondaryButton onClick={() => onTab("access")}>Manage Access</SecondaryButton>} /><PermissionList rows={[["Primary Role", primaryRoleLabel], ["Additional Roles", additionalRoles], ["Patient Data Scope", user.clinicScopes[0]?.dataAccessLevel ?? "Assigned Clinic"], ["Claim Review", user.additionalRoles.includes("claim_reviewer") ? "Allowed" : "Limited"], ["AI Copilot", user.aiPermissions.acceptAiRecommendation ? "Generate & Accept" : user.aiPermissions.generateSoapDraft ? "Generate" : "View Only"], ["Audit Log Access", "Allowed"]]} /></Card>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function InfoCard({ title, helper, rows, action }: { title: string; helper: string; rows: [string, string][]; action?: React.ReactNode }) {
  return <Card><SectionHead title={title} helper={helper} action={action} /><div className="grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><div className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div><div className="font-bold">{value}</div></div>)}</div></Card>;
}

function PermissionList({ rows }: { rows: [string, string][] }) {
  return <div className="grid gap-2">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"><span>{label}</span><b className={value === "Limited" ? "text-amber-700" : value === "Allowed" || value.includes("Accept") ? "text-emerald-700" : ""}>{value}</b></div>)}</div>;
}

function Legend() {
  return <div className="grid gap-3 text-sm">{[["bg-emerald-600", "Ready", "79 - 62%"], ["bg-amber-600", "Needs Review", "31 - 24%"], ["bg-red-600", "Not Ready", "18 - 14%"]].map(([color, label, value]) => <div key={label} className="grid grid-cols-[12px_1fr_auto] items-center gap-2"><span className={`h-3 w-3 rounded ${color}`} /><span>{label}</span><b>{value}</b></div>)}</div>;
}

function MetricsCard({ title, helper, metrics, action }: { title: string; helper: string; metrics: [string, string][]; action?: React.ReactNode }) {
  return <Card><SectionHead title={title} helper={helper} action={action} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">{label}</span><strong className="mt-2 block text-2xl font-black">{value}</strong></div>)}</div></Card>;
}

function BarsCard({ title, helper, rows, action }: { title: string; helper: string; rows: [string, number, number][]; action?: React.ReactNode }) {
  return <Card className="mt-4"><SectionHead title={title} helper={helper} action={action} /><div className="grid gap-3">{rows.map(([label, width, value]) => <div key={label} className="grid grid-cols-[140px_1fr_32px] items-center gap-3 text-xs sm:grid-cols-[170px_1fr_34px]"><span>{label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} /></div><b>{value}</b></div>)}</div></Card>;
}

function TimelineCard({ title, helper, events, action }: { title: string; helper: string; events: [string, string, string][]; action?: React.ReactNode }) {
  return <Card className="mt-4"><SectionHead title={title} helper={helper} action={action} /><div>{events.map(([titleText, detail, time]) => <div key={`${titleText}-${time}`} className="grid grid-cols-[40px_1fr_auto] gap-3 border-b border-slate-200 py-3 last:border-0"><div className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700"><Activity size={16} /></div><div><strong className="text-sm">{titleText}</strong><p className="mt-1 text-xs text-slate-500">{detail}</p></div><time className="text-xs text-slate-500">{time}</time></div>)}</div></Card>;
}

function AccessTab({ onSave }: { onSave: () => void }) {
  return <div className="pt-4"><div className="grid gap-4 xl:grid-cols-2"><Card><SectionHead title="Role Assignment" helper="การเปลี่ยน Role ต้องระบุเหตุผล ตรวจสอบ Role Conflict และบันทึก Audit Log" /><label className="block text-[11px] font-black uppercase text-slate-500">Primary Role<select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"><option>Doctor</option><option>Claim Reviewer</option><option>Clinic Admin</option></select></label><div className="mt-4"><div className="text-[11px] font-black uppercase text-slate-500">Additional Roles</div><div className="mt-2 flex flex-wrap gap-2"><Chip>Clinical Reviewer x</Chip><Chip>AI Reviewer x</Chip><SecondaryButton>Add Role</SecondaryButton></div></div><label className="mt-4 block text-[11px] font-black uppercase text-slate-500">Change Reason<textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="ระบุเหตุผลอย่างน้อย 10 ตัวอักษร" /></label><PrimaryButton onClick={onSave}>Save Access Changes</PrimaryButton></Card><Card><SectionHead title="Access Scope" helper="กำหนดขอบเขต Organization, Clinic, Department และ Patient Data ที่เข้าถึงได้" /><PermissionList rows={[["Organization", "NexSure Health Network"], ["Clinic Scope", "Sukhumvit Medical Center"], ["Department Scope", "Internal Medicine"], ["Patient Scope", "Department Patients"], ["Claim Approval Limit", "Review only"]]} /></Card></div><Card className="mt-4"><SectionHead title="Effective Permission Matrix" helper="Permission ที่ได้รับจาก Role ไม่สามารถลบโดยตรงจากหน้า User Detail" /><DataTable headers={["Permission Group", "View", "Create", "Update", "Approve", "Source"]} rows={[["Patient Management", "Allowed", "Limited", "Allowed", "-", "Inherited from Role"], ["Clinical Documentation", "Allowed", "Allowed", "Allowed", "-", "Inherited from Role"], ["Claim Readiness", "Allowed", "-", "Limited", "Not Allowed", "Direct + Role"], ["AI Clinical Engine", "Allowed", "Generate", "Accept", "Override", "Inherited from Role"], ["Audit & Compliance", "Limited", "-", "Not Allowed", "-", "Temporary"]]} /></Card></div>;
}

function CasesTab({ rows, search, onSearch }: { rows: CaseRow[]; search: string; onSearch: (value: string) => void }) {
  return <div className="pt-4"><Card><SectionHead title="Assigned Case Portfolio" helper="รายการเคสที่ผู้ใช้งานรับผิดชอบ ตรวจสอบ หรือมีส่วนร่วมตาม Access Scope" action={<SecondaryButton>Export CSV</SecondaryButton>} /><div className="mb-4 flex flex-wrap gap-2"><input value={search} onChange={(event) => onSearch(event.target.value)} className="min-w-64 rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Search by Visit ID, patient name, or HN..." /><select className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option>All Statuses</option><option>Ready</option><option>Needs Review</option><option>Not Ready</option></select><select className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option>All Clinics</option><option>Sukhumvit Medical Center</option></select><select className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option>Last 30 Days</option><option>Last 7 Days</option></select></div><div className="overflow-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[980px] border-collapse text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{["Visit ID", "Patient", "Visit Date", "Role", "Visit Status", "Score", "Claim Status", "Evidence Gaps", "Cost", "Action"].map((header) => <th key={header} className="border-b border-slate-200 px-4 py-3">{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.visitId} className="hover:bg-blue-50"><td className="border-b border-slate-200 px-4 py-3 font-black">{row.visitId}</td><td className="border-b border-slate-200 px-4 py-3">{row.patient}</td><td className="border-b border-slate-200 px-4 py-3">{row.visitDate}</td><td className="border-b border-slate-200 px-4 py-3">{row.role}</td><td className="border-b border-slate-200 px-4 py-3">{row.visitStatus}</td><td className="border-b border-slate-200 px-4 py-3 font-black">{row.score}</td><td className="border-b border-slate-200 px-4 py-3"><ClaimStatus status={row.claimStatus} /></td><td className="border-b border-slate-200 px-4 py-3">{row.evidenceGaps}</td><td className="border-b border-slate-200 px-4 py-3">{row.cost}</td><td className="border-b border-slate-200 px-4 py-3"><SecondaryButton>View Detail</SecondaryButton></td></tr>)}</tbody></table></div>{rows.length === 0 ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">ไม่พบเคสที่ตรงกับเงื่อนไขการค้นหา</p> : null}</Card></div>;
}

function ClaimStatus({ status }: { status: CaseRow["claimStatus"] }) {
  const classes: Record<CaseRow["claimStatus"], string> = { Ready: "bg-emerald-50 text-emerald-700 border-emerald-200", "Needs Review": "bg-amber-50 text-amber-700 border-amber-200", "Not Ready": "bg-red-50 text-red-700 border-red-200" };
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${classes[status]}`}>{status}</span>;
}

function AiTab() {
  return <div className="pt-4"><div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-[#0F2A5F] shadow-[inset_4px_0_0_#2563EB]"><b>AI Governance Notice:</b> AI Clinical Insight is decision support only. การตัดสินใจทางคลินิกและการอนุมัติผลลัพธ์ยังคงอยู่ภายใต้ความรับผิดชอบของบุคลากรที่ได้รับมอบหมาย</div><MetricsCard title="AI Governance & Usage" helper="Human-reviewed AI usage outcomes for this user." metrics={[["AI Assisted Cases", "76"], ["Suggestions Generated", "214"], ["Acceptance Rate", "69.2%"], ["Average Confidence", "88.4%"], ["Modified", "42"], ["Rejected", "24"], ["Overrides", "6"], ["Safety Alerts", "3"]]} /><div className="grid gap-4 pt-4 xl:grid-cols-2"><BarsCard title="AI Recommendation Outcomes" helper="AI Suggested content requires user review before confirmation." rows={[["Accepted", 69, 148], ["Modified", 20, 42], ["Rejected", 11, 24]]} /><TimelineCard title="Recent AI Governance Activity" helper="รายการล่าสุดที่มีการตรวจสอบหรือแก้ไข AI output" events={[["ICD suggestion modified", "Reason recorded - Clinical context protected", "42 min ago"], ["Safety warning acknowledged", "Potential drug interaction reviewed", "Yesterday"], ["Recommendation overridden", "Reason: patient-specific contraindication", "2 days ago"]]} /></div></div>;
}

function SecurityTab({ onAction }: { onAction: (action: string) => void }) {
  return <div className="grid gap-4 pt-4 xl:grid-cols-[1.15fr_.85fr]"><Card><SectionHead title="Account Security Posture" helper="สถานะ Authentication, MFA, Login Risk และ Active Sessions" action={<Badge tone="success">Secure</Badge>} /><div>{[["Authentication Provider", "Microsoft Entra ID"], ["MFA Status", "Enabled"], ["Last Login", "10 Jul 2026, 13:08"], ["Last Login IP", "203.0.xxx.42"], ["Failed Login Attempts", "1"], ["Password Last Changed", "28 Jun 2026"], ["Active Sessions", "2 sessions"], ["Account Lock Status", "Unlocked"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0"><span>{label}</span><b>{value}</b></div>)}</div></Card><Card><SectionHead title="Privileged Security Actions" helper="ทุก Action ต้องระบุเหตุผล ยืนยันสิทธิ์ และบันทึกใน Audit Log" /><div className="grid gap-3">{[["Force Password Reset", "บังคับเปลี่ยนรหัสผ่านในการเข้าสู่ระบบครั้งถัดไป", "Run", false], ["Revoke All Sessions", "ยกเลิก Session ที่กำลังใช้งานในทุกอุปกรณ์", "Run", false], ["Reset MFA", "ต้องยืนยันตัวตนเพิ่มเติมก่อนดำเนินการ", "Run", false], ["Lock Account", "ระงับการเข้าสู่ระบบทันทีและยกเลิก Session", "Lock", true], ["Disable User", "มีงานค้าง 14 รายการที่ต้อง Reassign ก่อนปิดบัญชี", "Disable", true]].map(([title, helper, label, danger]) => <div key={String(title)} className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${danger ? "border-red-200 bg-red-50/30" : "border-slate-200"}`}><div><b>{title}</b><p className="mt-1 text-xs text-slate-500">{helper}</p></div><Button onClick={() => onAction(String(title))} className={`rounded-xl border px-3 py-2 text-sm font-black ${danger ? "border-red-200 bg-white text-red-700" : "border-slate-300 bg-white text-slate-700"}`}>{label}</Button></div>)}</div></Card></div>;
}

function AuditTab() {
  return <div className="pt-4"><div className="grid gap-4 xl:grid-cols-2"><TimelineCard title="Recent User Activity" helper="กิจกรรมล่าสุดพร้อมข้อมูล Device และ IP ที่ผ่านการ Mask ตามสิทธิ์" events={[["Logged in successfully", "Web - Chrome - 203.0.xxx.42", "13:08"], ["Updated SOAP note", "Visit VST-2026-07098 - Success", "12:34"], ["Accepted AI ICD suggestion", "Clinical Engine - Success", "11:58"]]} /><MetricsCard title="Account Audit Summary" helper="สรุปประวัติด้าน Security และ Access แบบ Append-only" metrics={[["Role Changes", "3"], ["Scope Changes", "2"], ["Security Events", "5"], ["Failed Actions", "1"]]} /></div><Card className="mt-4"><SectionHead title="Audit & Compliance Trail" helper="เก็บ Before/After Value, Actor, Reason และ Timestamp เพื่อรองรับการตรวจสอบ" action={<SecondaryButton>Export Audit Log</SecondaryButton>} /><DataTable headers={["Event", "Actor", "Before", "After", "Reason", "Date & Time", "Result"]} rows={[["Role Assigned", "Ben C. - Security Admin", "Doctor", "Doctor + Clinical Reviewer", "Support peer review workflow", "8 Jul 2026, 16:20", "Success"], ["Department Scope Changed", "Orn T. - Org Admin", "General Medicine", "Internal Medicine", "Department transfer", "2 Jul 2026, 10:11", "Success"], ["Failed Login", "Target User", "-", "-", "Invalid SSO assertion", "28 Jun 2026, 08:41", "Failed"]]} /></Card></div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="overflow-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[760px] border-collapse text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{headers.map((header) => <th key={header} className="border-b border-slate-200 px-4 py-3">{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")} className="hover:bg-blue-50">{row.map((cell, index) => <td key={`${cell}-${index}`} className="border-b border-slate-200 px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function SecurityModal({ action, reason, onReason, onCancel, onConfirm }: { action: string; reason: string; onReason: (value: string) => void; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="security-action-title" className="w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-6 shadow-2xl"><h2 id="security-action-title" className="text-xl font-black text-[#0F2A5F]">{action}</h2><p className="mt-2 text-sm leading-6 text-slate-500">การดำเนินการ {action} อาจส่งผลต่อสิทธิ์ Session หรือ Authentication โดยระบบจะบันทึกผู้ดำเนินการ เวลา และเหตุผลใน Audit Log</p><textarea value={reason} onChange={(event) => onReason(event.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="ระบุเหตุผลและผลกระทบทางธุรกิจ (อย่างน้อย 10 ตัวอักษร)" /><div className="mt-4 flex justify-end gap-2"><SecondaryButton onClick={onCancel}>Cancel</SecondaryButton><Button onClick={onConfirm} className="rounded-xl border border-red-200 bg-white px-4 py-2 font-black text-red-700">Confirm Action</Button></div></section></div>;
}
