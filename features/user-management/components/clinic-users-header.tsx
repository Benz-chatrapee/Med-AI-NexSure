import Link from "next/link";
import { Bell, BrainCircuit, Building2, Download, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicOptions, governanceHighlights } from "../constants/clinic-user-options";

export function ClinicUsersHeader({
  onExport,
  exportPending,
}: {
  onExport: () => void;
  exportPending: boolean;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-7">
          <label className="relative hidden w-full max-w-xl sm:block">
            <span className="sr-only">Global search</span>
            <Search className="absolute left-3 top-3 text-slate-400" size={17} aria-hidden="true" />
            <input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Search patients, visits, claims, users, or evidence..." />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <Button aria-label="AI Copilot" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <BrainCircuit size={17} aria-hidden="true" />
            </Button>
            <Button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Bell size={17} aria-hidden="true" />
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">CJ</div>
              <div>
                <div className="text-sm font-black text-slate-900">Chatrapee J.</div>
                <div className="text-xs font-semibold text-slate-500">Clinic Admin - Bangkok</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500" aria-label="Breadcrumb">
          <span>Administration</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">User Management</span>
        </nav>

        <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 md:flex-row md:items-center md:justify-between" aria-label="Identity and access governance context">
          <div>
            <div className="font-black text-[#0F2A5F]">Clinical Intelligence Access Framework</div>
            <p className="text-sm text-slate-600">ควบคุม Role, Clinic Scope, Department Scope และ AI Permission พร้อม audit trail ทุกการเปลี่ยนแปลง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {governanceHighlights.map((item) => (
              <span key={item} className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-black text-blue-800">{item}</span>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F2A5F]">User Management</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Enterprise administration workspace for reviewing users, roles, clinic access, AI permissions, account security and audit readiness.</p>
            <p className="text-sm leading-7 text-slate-500">ผู้ดูแลระบบสามารถจัดการผู้ใช้งาน บทบาท สิทธิ์การเข้าถึงคลินิก และสิทธิ์ AI ภายใต้หลัก Least Privilege และ Human-in-the-Loop</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              <Building2 size={16} aria-hidden="true" />
              <span className="sr-only">Clinic selector</span>
              <select className="bg-transparent outline-none" defaultValue={clinicOptions[0].value}>
                {clinicOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <Button onClick={onExport} disabled={exportPending} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
              <Download size={16} aria-hidden="true" />
              {exportPending ? "Exporting..." : "Export"}
            </Button>
            <Link href="/admin/users/new" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 text-sm font-black text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <UserPlus size={16} aria-hidden="true" />
              Add User
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
