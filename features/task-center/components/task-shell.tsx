"use client";

import { Bell, Building2, ClipboardList, FileStack, LayoutDashboard, Menu, Search, ShieldCheck, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { focusRing } from "./task-center-styles";

type TaskShellProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onClosePanels: () => void;
  children: ReactNode;
};

export function TaskShell({ sidebarOpen, onToggleSidebar, onClosePanels, children }: TaskShellProps) {
  return (
    <div className={`${sidebarOpen ? "sidebar-open" : ""} min-h-screen overflow-x-hidden bg-[#F8FAFC] font-sans text-slate-900`}>
      <button
        type="button"
        aria-label="Close panels"
        onClick={onClosePanels}
        className={`${sidebarOpen ? "block" : "hidden"} fixed inset-0 z-50 bg-slate-950/40`}
      />
      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[#0B1F47] bg-[#0F2A5F] text-[#DBEAFE] shadow-xl transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:z-40`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#38BDF8] shadow-sm ring-1 ring-white/10">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-white">Med AI NexSure</p>
            <p className="truncate text-sm font-medium text-[#BFDBFE]">Healthcare Intelligence</p>
          </div>
        </div>
        <nav className="flex-1 space-y-6 px-3 py-5">
          <NavGroup title="Workspace" items={[["Dashboard", "dashboard"], ["Task Center", "tasks", "24"], ["Global Search", "search"], ["Notifications", "bell", "dot"]]} />
          <NavGroup title="Clinical Operations" items={[["Patients", "patients"], ["Visits", "building"], ["AI Clinical", "sparkles"], ["Prescription Safety", "clinical"]]} />
          <NavGroup title="Insurance Intelligence" items={[["Claim Readiness", "shield"], ["Evidence Package", "files"], ["Economic Intelligence", "dashboard"]]} />
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0F2A5F]">CJ</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Chatrapee Jam-Oum</p>
                <p className="truncate text-sm text-[#BFDBFE]">Product Owner</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="w-full min-w-0 lg:ml-[220px] lg:w-[calc(100%-220px)]">
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white">
          <div className="flex h-20 items-center gap-4 px-4 sm:px-6 xl:px-8">
            <button className={`${focusRing} rounded-xl border border-[#E2E8F0] p-2.5 text-[#64748B] lg:hidden`} onClick={onToggleSidebar} aria-label="Open sidebar" type="button"><Menu className="h-5 w-5" /></button>
            <div className="hidden flex-1 md:block">
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input className={`${focusRing} h-[42px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-11 pr-4 text-sm font-medium text-[#0F172A] placeholder:text-[#64748B]`} placeholder="Search task, patient, visit, claim..." />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className={`${focusRing} hidden h-11 items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 text-sm font-medium text-[#1E3A8A] sm:flex`} type="button"><Sparkles className="h-4 w-4 text-[#2563EB]" /><span>AI Copilot</span></button>
              <button className={`${focusRing} relative grid h-11 w-11 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B]`} type="button"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" /></button>
              <button className={`${focusRing} flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2.5 sm:px-3`} type="button"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2A5F] text-sm font-bold text-white">CJ</div><span className="hidden text-sm font-medium text-[#0F172A] sm:block">Clinic A</span></button>
            </div>
          </div>
        </header>
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavGroup({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <p className="mb-2 px-3 text-sm font-semibold uppercase tracking-[.12em] text-[#93C5FD]">{title}</p>
      {items.map(([label, icon, badge]) => (
        <a key={label} href="#" className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${label === "Task Center" ? "bg-white font-semibold text-[#0F2A5F] shadow-sm" : "font-medium text-[#DBEAFE] hover:bg-white/10 hover:text-white"}`}>
          <span className={label === "Task Center" ? "text-[#1E3A8A]" : "text-[#93C5FD]"}>{navIcon(icon)}</span><span>{label}</span>
          {badge === "24" ? <span className={`ml-auto rounded-full px-2 py-0.5 text-sm ${label === "Task Center" ? "bg-[#1E3A8A] text-white" : "bg-white/10 text-[#DBEAFE]"}`}>24</span> : null}
          {badge === "dot" ? <span className="ml-auto h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white/70" /> : null}
        </a>
      ))}
    </div>
  );
}

function navIcon(icon: string) {
  const className = "h-4 w-4";
  if (icon === "tasks") return <ClipboardList className={className} />;
  if (icon === "search") return <Search className={className} />;
  if (icon === "bell") return <Bell className={className} />;
  if (icon === "patients") return <UsersRound className={className} />;
  if (icon === "building") return <Building2 className={className} />;
  if (icon === "sparkles") return <Sparkles className={className} />;
  if (icon === "clinical") return <Stethoscope className={className} />;
  if (icon === "shield") return <ShieldCheck className={className} />;
  if (icon === "files") return <FileStack className={className} />;
  return <LayoutDashboard className={className} />;
}
