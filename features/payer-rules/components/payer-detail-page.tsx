"use client";

import {
  AlertTriangle,
  Download,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { affectedCases, auditEvents, payers, ruleDetails, ruleSets, versionHistory } from "../mock/payer-rule-mock-data";
import type { AffectedCase, ApprovalStatus, CoverageStatus, Payer, PayerRuleFormValues, PayerStatus, ReadinessStatus, RiskLevel } from "../types/payer-rule-types";

type Tone = "success" | "warning" | "danger" | "blue" | "neutral" | "purple";
type PayerDetailTab = "overview" | "rules" | "cases" | "economics" | "contract" | "integration" | "documents" | "audit";
type CaseFilter = "all" | "ready" | "review" | "notReady" | "pending" | "cost" | "sla";
type DashboardFilters = { period: string; clinic: string; department: string; claimType: string };
type CaseSelectFilters = { claimStatus: string; readiness: string; cost: string; sla: string };
type AuditFilter = "All Events" | "Rule Changes" | "Publications" | "Exports" | "Integration Failures" | "Contract Updates";

type DetailCase = AffectedCase & {
  caseId: string;
  clinic: string;
  department: string;
  visitDate: string;
  claimType: "OPD" | "IPD";
  claimStatus: "Submitted" | "Pending Evidence" | "Under Review" | "Draft" | "Approved" | "Paid";
  claimAmount: number;
  slaStatus: "Within SLA" | "At Risk" | "Breached";
};

const tabs: Array<{ id: PayerDetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "rules", label: "Rules" },
  { id: "cases", label: "Cases" },
  { id: "economics", label: "Economic Intelligence" },
  { id: "contract", label: "Contract" },
  { id: "integration", label: "Integration" },
  { id: "documents", label: "Documents" },
  { id: "audit", label: "Audit & Compliance" },
];

const navGroups = [
  { label: "Clinical", items: ["Main Dashboard", "Patient Management", "Visit Management", "SOAP Note", "Prescription"] },
  { label: "Insurance", items: ["Claim Readiness", "Evidence Package", "Payer Rules", "Economic Intelligence"] },
  { label: "Governance", items: ["AI Copilot", "Audit & Compliance", "Admin Settings"] },
];

const payerAliases: Record<string, string> = {
  "payer-001": "payer-aia",
  "payer-002": "payer-mtl",
  "payer-003": "payer-generic",
  "payer-004": "payer-tpa",
};

const dashboardFilterOptions: Record<keyof DashboardFilters, string[]> = {
  period: ["Last 30 Days", "Today", "Last 7 Days", "Current Month", "Contract Period"],
  clinic: ["All Clinics", "Bangkok Medical Center", "Sukhumvit Clinic", "Rama 9 Clinic"],
  department: ["All Departments", "Internal Medicine", "Orthopedics", "Cardiology", "General Surgery"],
  claimType: ["All Claim Types", "OPD", "IPD", "Accident"],
};

const defaultDashboardFilters: DashboardFilters = {
  period: "Last 30 Days",
  clinic: "All Clinics",
  department: "All Departments",
  claimType: "All Claim Types",
};

const defaultCaseSelectFilters: CaseSelectFilters = {
  claimStatus: "All Claim Statuses",
  readiness: "All Readiness Statuses",
  cost: "All Cost Statuses",
  sla: "All SLA Statuses",
};

const detailCases: DetailCase[] = [
  {
    ...affectedCases[0],
    caseId: "CLM-260710-0148",
    visitId: "VIS-260710-0084",
    patientNameMasked: "S•••••• P••••",
    hn: "HN-••8321",
    clinic: "Bangkok Medical Center",
    department: "Internal Medicine",
    visitDate: "10 Jul 2026",
    claimType: "OPD",
    claimStatus: "Submitted",
    claimAmount: 8450,
    status: "ready",
    readinessScore: 96,
    missingEvidence: [],
    costStatus: "normal",
    slaStatus: "Within SLA",
  },
  {
    ...affectedCases[1],
    caseId: "CLM-260710-0142",
    visitId: "VIS-260710-0079",
    patientNameMasked: "N•••••• K••••",
    hn: "HN-••1194",
    clinic: "Sukhumvit Clinic",
    department: "Orthopedics",
    visitDate: "10 Jul 2026",
    claimType: "OPD",
    claimStatus: "Pending Evidence",
    claimAmount: 12680,
    status: "needs_review",
    readinessScore: 78,
    missingEvidence: ["SOAP Incomplete", "ICD-10 Missing"],
    costStatus: "alert",
    slaStatus: "At Risk",
  },
  {
    ...affectedCases[2],
    caseId: "CLM-260709-0131",
    visitId: "VIS-260709-0068",
    patientNameMasked: "P•••••• R••••",
    hn: "HN-••4021",
    clinic: "Rama 9 Clinic",
    department: "Cardiology",
    visitDate: "09 Jul 2026",
    claimType: "IPD",
    claimStatus: "Under Review",
    claimAmount: 64200,
    status: "ready",
    readinessScore: 91,
    missingEvidence: [],
    costStatus: "normal",
    slaStatus: "Within SLA",
  },
  {
    ...affectedCases[3],
    visitId: "VIS-260709-0062",
    caseId: "CLM-260709-0126",
    patientNameMasked: "T•••••• S••••",
    hn: "HN-••7840",
    clinic: "Bangkok Medical Center",
    department: "Internal Medicine",
    visitDate: "09 Jul 2026",
    claimType: "OPD",
    claimStatus: "Draft",
    claimAmount: 6980,
    status: "not_ready",
    readinessScore: 54,
    missingEvidence: ["ICD-10 Missing", "SOAP Incomplete", "Medical certificate", "Cost justification"],
    costStatus: "normal",
    slaStatus: "Breached",
  },
  {
    ...affectedCases[0],
    id: "case-payer-detail-5",
    visitId: "VIS-260708-0051",
    caseId: "CLM-260708-0119",
    patientNameMasked: "A•••••• C••••",
    hn: "HN-••5527",
    clinic: "Sukhumvit Clinic",
    department: "General Surgery",
    visitDate: "08 Jul 2026",
    claimType: "IPD",
    claimStatus: "Approved",
    claimAmount: 128450,
    status: "ready",
    readinessScore: 88,
    missingEvidence: [],
    costStatus: "blocked",
    slaStatus: "Within SLA",
  },
  {
    ...affectedCases[1],
    id: "case-payer-detail-6",
    visitId: "VIS-260708-0045",
    caseId: "CLM-260708-0111",
    patientNameMasked: "K•••••• J••••",
    hn: "HN-••1167",
    clinic: "Rama 9 Clinic",
    department: "Neurology",
    visitDate: "08 Jul 2026",
    claimType: "OPD",
    claimStatus: "Pending Evidence",
    claimAmount: 17900,
    status: "needs_review",
    readinessScore: 82,
    missingEvidence: ["Medical certificate"],
    costStatus: "alert",
    slaStatus: "At Risk",
  },
  {
    ...affectedCases[2],
    id: "case-payer-detail-7",
    visitId: "VIS-260707-0039",
    caseId: "CLM-260707-0104",
    patientNameMasked: "M•••••• T••••",
    hn: "HN-••9240",
    clinic: "Bangkok Medical Center",
    department: "ENT",
    visitDate: "07 Jul 2026",
    claimType: "OPD",
    claimStatus: "Paid",
    claimAmount: 5840,
    status: "ready",
    readinessScore: 94,
    missingEvidence: [],
    costStatus: "normal",
    slaStatus: "Within SLA",
  },
  {
    ...affectedCases[3],
    id: "case-payer-detail-8",
    visitId: "VIS-260707-0031",
    caseId: "CLM-260707-0098",
    patientNameMasked: "R•••••• L••••",
    hn: "HN-••6872",
    clinic: "Sukhumvit Clinic",
    department: "Dermatology",
    visitDate: "07 Jul 2026",
    claimType: "OPD",
    claimStatus: "Draft",
    claimAmount: 9720,
    status: "needs_review",
    readinessScore: 67,
    missingEvidence: ["Pre-authorization", "SOAP note", "ICD-10 code"],
    costStatus: "normal",
    slaStatus: "Breached",
  },
];

const ruleDomains = [
  { name: "Required Evidence Rules", active: 12, blocking: 4, warning: 7, draft: 1, updated: "10 Jul 2026" },
  { name: "ICD Validation Rules", active: 9, blocking: 3, warning: 5, draft: 1, updated: "10 Jul 2026" },
  { name: "Coverage Rules", active: 8, blocking: 2, warning: 5, draft: 1, updated: "09 Jul 2026" },
  { name: "Cost Rules", active: 11, blocking: 2, warning: 8, draft: 1, updated: "10 Jul 2026" },
  { name: "Risk Rules", active: 8, blocking: 1, warning: 2, draft: 3, updated: "08 Jul 2026" },
];

export function PayerDetailPage({ payerId }: { payerId: string }) {
  const [activeTab, setActiveTab] = useState<PayerDetailTab>("overview");
  const [caseFilter, setCaseFilter] = useState<CaseFilter>("all");
  const [caseSearch, setCaseSearch] = useState("");
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>(defaultDashboardFilters);
  const [caseSelectFilters, setCaseSelectFilters] = useState<CaseSelectFilters>(defaultCaseSelectFilters);
  const [auditFilter, setAuditFilter] = useState<AuditFilter>("All Events");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const resolvedPayerId = payerAliases[payerId] ?? payerId;
  const payer = payers.find((item) => item.id === resolvedPayerId);
  const safePayer = payer ?? payers[0];

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const ruleSet = ruleSets.find((item) => item.payerId === safePayer.id) ?? ruleSets[0];
  const ruleDetail = ruleDetails.find((item) => item.id === ruleSet.id) ?? ruleDetails[0];
  const form = ruleDetail.form;

  const filteredCases = useMemo(() => {
    const search = caseSearch.trim().toLowerCase();
    return detailCases.filter((item) => {
      const matchesSearch = !search || [item.caseId, item.visitId, item.hn, item.patientNameMasked, item.clinic, item.department].some((value) => value.toLowerCase().includes(search));
      const matchesDashboard =
        (dashboardFilters.clinic === "All Clinics" || item.clinic === dashboardFilters.clinic) &&
        (dashboardFilters.department === "All Departments" || item.department === dashboardFilters.department) &&
        (dashboardFilters.claimType === "All Claim Types" || item.claimType === dashboardFilters.claimType);
      const matchesSelects =
        (caseSelectFilters.claimStatus === "All Claim Statuses" || item.claimStatus === caseSelectFilters.claimStatus) &&
        (caseSelectFilters.readiness === "All Readiness Statuses" || readinessLabel(item.status) === caseSelectFilters.readiness) &&
        (caseSelectFilters.cost === "All Cost Statuses" || costStatusLabel(item.costStatus) === caseSelectFilters.cost) &&
        (caseSelectFilters.sla === "All SLA Statuses" || item.slaStatus === caseSelectFilters.sla);
      const matchesFilter =
        caseFilter === "all" ||
        (caseFilter === "ready" && item.status === "ready") ||
        (caseFilter === "review" && item.status === "needs_review") ||
        (caseFilter === "notReady" && item.status === "not_ready") ||
        (caseFilter === "pending" && item.status === "pending_evidence") ||
        (caseFilter === "cost" && item.costStatus !== "normal") ||
        (caseFilter === "sla" && item.slaStatus === "Breached");
      return matchesSearch && matchesDashboard && matchesSelects && matchesFilter;
    });
  }, [caseFilter, caseSearch, caseSelectFilters, dashboardFilters]);

  function notify(message: string) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }

  function openTab(tab: PayerDetailTab) {
    setActiveTab(tab);
  }

  function applyCaseFilter(filter: CaseFilter) {
    setCaseFilter(filter);
    setActiveTab("cases");
  }

  if (!payer) return <UnknownPayerState payerId={payerId} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 min-[1121px]:grid min-[1121px]:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="min-w-0">
        <TopBar onNotify={notify} onMenu={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 sm:py-6">
          <nav className="mb-[18px] flex gap-2 text-[13px] text-slate-500" aria-label="Breadcrumb">
            <Link href="/payer-rules">Payer Management</Link>
            <span>/</span>
            <span className="font-bold text-slate-900">Payer Detail</span>
          </nav>
          <PayerHeader payer={payer} form={form} ruleVersion={ruleSet.version} ruleStatus={ruleSet.status} onManageRules={() => openTab("rules")} onNotify={notify} />
          <AlertBanner onReview={() => openTab("contract")} />
          <FilterBar filters={dashboardFilters} onChange={setDashboardFilters} onNotify={notify} />
          <KpiGrid onFilter={applyCaseFilter} />
          <Tabs activeTab={activeTab} onChange={openTab} />

          <TabPanel id="overview" activeTab={activeTab}><OverviewTab onFilter={applyCaseFilter} onOpenTab={openTab} onNotify={notify} /></TabPanel>
          <TabPanel id="rules" activeTab={activeTab}><RulesTab form={form} /></TabPanel>
          <TabPanel id="cases" activeTab={activeTab}><CasesTab rows={filteredCases} filter={caseFilter} search={caseSearch} selectFilters={caseSelectFilters} onSelectFilters={setCaseSelectFilters} onFilter={setCaseFilter} onSearch={setCaseSearch} onNotify={notify} /></TabPanel>
          <TabPanel id="economics" activeTab={activeTab}><EconomicsTab form={form} /></TabPanel>
          <TabPanel id="contract" activeTab={activeTab}><ContractTab /></TabPanel>
          <TabPanel id="integration" activeTab={activeTab}><IntegrationTab /></TabPanel>
          <TabPanel id="documents" activeTab={activeTab}><DocumentsTab onNotify={notify} /></TabPanel>
          <TabPanel id="audit" activeTab={activeTab}><AuditTab filter={auditFilter} onFilter={setAuditFilter} onNotify={notify} /></TabPanel>
        </main>
      </div>
      {toast ? <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0F2A5F] px-4 py-3 text-xs font-bold text-white shadow-xl" role="status">{toast}</div> : null}
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-[270px] overflow-y-auto bg-[#0F2A5F] px-4 py-[22px] text-[#EAF2FF] shadow-[10px_0_28px_rgba(15,42,95,.08)] transition-transform min-[1121px]:sticky min-[1121px]:top-0 min-[1121px]:h-screen min-[1121px]:w-auto min-[1121px]:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`} aria-label="Primary navigation">
      <div className="mb-6 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border border-white/20 bg-[#2563EB] text-sm font-black text-white">NX</div>
          <div><strong className="block text-[15px]">Med AI NexSure</strong><small className="text-[11px] text-blue-200">Enterprise Intelligence</small></div>
        </div>
        <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 min-[1121px]:hidden" aria-label="Close navigation" onClick={onClose}><X size={16} /></button>
      </div>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="px-3 pb-2 pt-4 text-[11px] font-black uppercase tracking-[.12em] text-blue-300">{group.label}</div>
          <nav className="grid gap-1" aria-label={group.label}>
            {group.items.map((item) => (
              <Link key={item} href={item === "Payer Rules" ? "/payer-rules" : "#"} className={`flex items-center gap-3 rounded-[11px] border border-transparent px-3 py-[11px] text-sm font-semibold ${item === "Payer Rules" ? "bg-white/15 text-white shadow-[inset_3px_0_0_#38BDF8]" : "text-blue-100 hover:bg-white/10"}`}>
                <span className="w-5 text-center font-black">{item === "Payer Rules" ? "◉" : "•"}</span>
                <span>{item}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}

function UnknownPayerState({ payerId }: { payerId: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6 text-slate-950">
      <section className="w-full max-w-xl rounded-[20px] border border-red-100 bg-white p-6 text-center shadow-sm" aria-labelledby="unknown-payer-title">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle size={22} /></div>
        <h1 id="unknown-payer-title" className="mt-4 text-2xl font-black text-[#0F2A5F]">Payer Not Found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">ไม่พบข้อมูล payerId: <strong>{payerId}</strong> กรุณากลับไปเลือก Payer จากหน้ารายการ</p>
        <Link href="/payer-rules" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#1E3A8A] bg-[#1E3A8A] px-4 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          Back to Payer Rules
        </Link>
      </section>
    </main>
  );
}

function TopBar({ onNotify, onMenu }: { onNotify: (message: string) => void; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[72px] flex-col gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3 lg:flex-1">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 min-[1121px]:hidden" aria-label="Open navigation" onClick={onMenu}><Menu size={18} /></button>
        <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Search patient, visit, claim, payer, or document..." aria-label="Global search" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500">Ctrl K</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton label="Open AI Copilot" onClick={() => onNotify("AI Copilot opened")}>AI</IconButton>
        <IconButton label="View notifications" onClick={() => onNotify("Notifications opened")}>!</IconButton>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-blue-100 text-sm font-black text-blue-900">BC</div>
          <div><strong className="block text-xs">Benz Chatrapee</strong><span className="text-[11px] text-slate-500">System Admin</span></div>
        </div>
      </div>
    </header>
  );
}

function PayerHeader({ payer, form, ruleVersion, ruleStatus, onManageRules, onNotify }: { payer: Payer; form: PayerRuleFormValues; ruleVersion: string; ruleStatus: ApprovalStatus; onManageRules: () => void; onNotify: (message: string) => void }) {
  return (
    <section className="mb-4 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        <div className="flex gap-4">
          <div className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-[#1E3A8A] text-xl font-black text-white">{payer.name.slice(0, 3).toUpperCase()}</div>
          <div>
            <div className="mb-1 text-[11px] font-black uppercase tracking-[.1em] text-blue-600">Payer Intelligence</div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-[#0F172A] md:text-4xl">{payer.name.replace(" Mock", " Thailand")}</h1>
              <StatusBadge tone={payerStatusTone(payer.status)}>{labelize(payer.status)}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-slate-500">Private Insurance · {payer.code} · Centralized payer configuration, claim performance, and governance</p>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-start gap-2 lg:justify-end">
          <Button variant="secondary" onClick={() => onNotify("Payer profile edit mode opened")}>Edit Profile</Button>
          <Button variant="primary" onClick={onManageRules}><Settings size={15} />Manage Rules</Button>
          <Button variant="ghost" onClick={() => onNotify("More payer actions opened")} ariaLabel="More payer actions"><MoreHorizontal size={16} /></Button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-6">
        <Meta label="Payer Code" value={payer.code} />
        <Meta label="Payer Type" value="Private Insurance" />
        <Meta label="Effective Date" value={formatShortDate(form.effectiveDate)} />
        <Meta label="Expiry Date" value="31 Dec 2026" />
        <Meta label="Published Rule Version" value={`${ruleVersion} · ${labelize(ruleStatus)}`} />
        <Meta label="Last Updated" value="10 Jul 2026, 14:32" />
      </div>
    </section>
  );
}

function AlertBanner({ onReview }: { onReview: () => void }) {
  return (
    <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 border-l-4 border-l-amber-600 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div className="flex gap-3">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-amber-100 text-amber-700"><AlertTriangle size={18} /></div>
        <div><strong className="block text-sm text-amber-900">Contract Review Required</strong><p className="mt-1 text-xs leading-5 text-amber-800">สัญญาจะหมดอายุภายใน 174 วัน และมี SLA Document 1 รายการที่ต้องอัปเดตก่อนรอบทบทวนถัดไป</p></div>
      </div>
      <Button variant="secondary" onClick={onReview}>Review Contract</Button>
    </section>
  );
}

function FilterBar({ filters, onChange, onNotify }: { filters: DashboardFilters; onChange: (filters: DashboardFilters) => void; onNotify: (message: string) => void }) {
  return (
    <section className="mb-4 flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm" aria-label="Dashboard filters">
      {(Object.keys(dashboardFilterOptions) as Array<keyof DashboardFilters>).map((key) => (
        <SelectBox key={key} label={key} value={filters[key]} options={dashboardFilterOptions[key]} onChange={(value) => onChange({ ...filters, [key]: value })} />
      ))}
      <div className="flex-1" />
      <span className="text-xs font-semibold text-slate-500">Updated 2 minutes ago</span>
      <Button variant="ghost" onClick={() => onNotify("Payer intelligence data refreshed")}><RefreshCw size={14} />Refresh</Button>
    </section>
  );
}

function KpiGrid({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  const kpis: Array<{
    label: string;
    value: string;
    icon: string;
    trend: string;
    trendTone: "positive" | "negative";
    context: React.ReactNode[];
    filter?: CaseFilter;
    progress?: { current: string; target: string; width: string };
  }> = [
    {
      label: "Total Claim Cases",
      value: "1,248",
      icon: "#",
      trend: "▲ 8.2% vs Previous Period",
      trendTone: "positive",
      filter: "all",
      context: [<span key="new"><strong>124</strong> New Cases</span>, <span key="closed"><strong>86</strong> Closed Cases</span>],
    },
    {
      label: "Claim Ready Rate",
      value: "87.4%",
      icon: "✓",
      trend: "▲ 3.1 pts vs Previous Period",
      trendTone: "positive",
      filter: "ready",
      context: [<span key="cases">1,091 / 1,248 Cases</span>],
      progress: { current: "Current 87.4%", target: "Target 90%", width: "87.4%" },
    },
    {
      label: "Average Readiness Score",
      value: "91.2",
      icon: "AI",
      trend: "▲ 1.8 pts",
      trendTone: "positive",
      context: [<span key="scale">Scale: 0–100</span>, <span key="status"><strong>Status:</strong> Above Target</span>],
    },
    {
      label: "Pending Evidence",
      value: "72",
      icon: "!",
      trend: "▲ 6 Cases vs Previous Period",
      trendTone: "negative",
      filter: "pending",
      context: [<span key="percent">5.8% of Total Cases</span>, <span key="days"><strong>18</strong> Cases &gt; 3 Days</span>, <span key="status"><strong>Status:</strong> Attention Required</span>],
    },
    {
      label: "Cost Alert Cases",
      value: "18",
      icon: "฿",
      trend: "▼ 4 Cases vs Previous Period",
      trendTone: "positive",
      filter: "cost",
      context: [<span key="critical"><strong>3</strong> Critical Alerts</span>, <span key="exposure"><strong>฿412K</strong> Exposure</span>],
    },
    {
      label: "Average Claim Cost",
      value: "฿8,740",
      icon: "≈",
      trend: "฿460 Below Benchmark",
      trendTone: "positive",
      context: [<span key="benchmark">Benchmark ฿9,200</span>, <span key="status"><strong>Status:</strong> Within Expected Range</span>],
    },
  ];

  return (
    <section className="mb-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" aria-label="Payer KPIs">
      {kpis.map((item) => {
        const cardClass = "min-h-[214px] min-w-0 rounded-2xl border border-slate-200 border-t-[3px] border-t-transparent bg-white p-[18px] text-left shadow-[0_1px_2px_rgba(15,42,95,.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:border-t-blue-600 hover:shadow-[0_10px_28px_rgba(15,42,95,.10)]";
        const content = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold leading-5 text-slate-500">{item.label}</span>
              <KpiIcon>{item.icon}</KpiIcon>
            </div>
            <div className="my-4 mb-2 text-[clamp(28px,2vw,34px)] font-black leading-none tracking-tight text-[#0F172A]">{item.value}</div>
            <div className={`mb-2.5 text-xs font-bold ${item.trendTone === "positive" ? "text-emerald-700" : "text-red-700"}`}>{item.trend}</div>
            <div className="grid gap-[5px] text-[11px] leading-4 text-slate-500 [&_strong]:text-slate-700">
              {item.context}
            </div>
            {item.progress ? (
              <div className="mt-2.5">
                <div className="mb-[5px] flex justify-between text-[10px] text-slate-500"><span>{item.progress.current}</span><span>{item.progress.target}</span></div>
                <div className="relative h-2 overflow-hidden rounded-full bg-[#E8EEF6]">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: item.progress.width }} />
                  <div className="absolute -top-0.5 bottom-[-2px] w-0.5 bg-[#0F2A5F]" style={{ left: "90%" }} />
                </div>
              </div>
            ) : null}
          </>
        );
        const filter = item.filter;
        return filter ? (
          <button key={item.label} type="button" onClick={() => onFilter(filter)} className={`${cardClass} cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}>
            {content}
          </button>
        ) : (
          <article key={item.label} className={cardClass}>
            {content}
          </article>
        );
      })}
    </section>
  );
}

function Tabs({ activeTab, onChange }: { activeTab: PayerDetailTab; onChange: (tab: PayerDetailTab) => void }) {
  return (
    <div className="sticky top-[72px] z-20 mb-4 bg-[#F8FAFC]/95 py-2 backdrop-blur">
      <div className="flex gap-1 overflow-x-auto rounded-[14px] border border-slate-200 bg-white p-[5px] shadow-sm" role="tablist" aria-label="Payer detail sections">
        {tabs.map((tab) => (
          <button key={tab.id} id={`${tab.id}-tab`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`${tab.id}-panel`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => onChange(tab.id)} className={`whitespace-nowrap rounded-[10px] px-[14px] py-2.5 text-[13px] font-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === tab.id ? "bg-blue-50 text-[#0F2A5F] ring-1 ring-blue-200" : "text-slate-500 hover:bg-slate-100 hover:text-[#1E3A8A]"}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TabPanel({ id, activeTab, children }: { id: PayerDetailTab; activeTab: PayerDetailTab; children: React.ReactNode }) {
  if (activeTab !== id) return null;
  return <section id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab`}>{children}</section>;
}

function OverviewTab({ onFilter, onOpenTab, onNotify }: { onFilter: (filter: CaseFilter) => void; onOpenTab: (tab: PayerDetailTab) => void; onNotify: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card title="Claim Readiness Trend" helper="แนวโน้มความพร้อมของเคสเทียบ Target และช่วงเวลาก่อนหน้า" action={<LinkButton onClick={() => onFilter("all")}>View Cases →</LinkButton>}>
          <ReadinessTrendChart />
          <Callout>08 Jul — Rule Version v3.4 Published · Readiness improved after the latest rule update.</Callout>
        </Card>
        <Card title="Claim Readiness Distribution" helper="Current readiness mix under published payer rules">
          <ReadinessDistribution onFilter={onFilter} />
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[7fr_5fr]">
        <Card title="Claim Status Distribution" helper="Current case volume across the payer claim workflow">
          <div className="h-[330px]">
            <HorizontalBars rows={[["Draft", 84, "blue"], ["Pending Evidence", 72, "warning"], ["Ready", 188, "blue"], ["Submitted", 241, "blue"], ["Under Review", 137, "warning"], ["Approved", 326, "success"], ["Rejected", 29, "danger"], ["Paid", 171, "success"]]} />
          </div>
        </Card>
        <ClaimOutcomeSummary onFilter={onFilter} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Missing Evidence Pareto" helper="จัดลำดับสาเหตุหลักที่ทำให้เคสยังไม่พร้อมส่งเคลม" action={<LinkButton onClick={() => onNotify("Missing evidence CSV export initiated")}>Export CSV</LinkButton>}>
          <MissingEvidencePareto />
          <Callout>Top 2 evidence gaps account for 58% of all missing evidence cases.</Callout>
        </Card>
        <Card title="Claim Cost Trend" helper="Actual average claim cost compared with benchmark and expected range" action={<LinkButton onClick={() => onOpenTab("economics")}>View Intelligence →</LinkButton>}>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <MiniMetric label="Total Claim Amount" value="฿10.91M" />
            <MiniMetric label="Expected Cost Range" value="฿7.8K–฿9.2K" />
            <MiniMetric label="Estimated Variance" value="−฿284K" tone="success" />
          </div>
          <CostTrendChart />
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[5fr_7fr]">
        <PayerRuleComposition onManageRules={() => onOpenTab("rules")} />
        <Card title="Cost Variance by Department" helper="Difference between actual average cost and configured payer benchmark">
          <VarianceChart />
        </Card>
      </div>
      <Card title="Recent Activity" helper="Latest payer configuration, claim, integration, and compliance activities" action={<LinkButton onClick={() => onOpenTab("audit")}>Audit & Compliance →</LinkButton>}>
        <RecentActivity />
      </Card>
      <Card title="Recent Payer Cases" helper="รายการเคสล่าสุด พร้อม Claim Readiness, Missing Evidence, Cost และ SLA Status" action={<LinkButton onClick={() => onOpenTab("cases")}>View All Cases →</LinkButton>}>
        <RecentPayerCases rows={detailCases.slice(0, 5)} onFilter={onFilter} />
      </Card>
    </div>
  );
}

function ClaimOutcomeSummary({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  return (
    <Card title="Claim Outcome & SLA Summary" helper="Performance against payer outcome and service commitments">
      <div className="space-y-3">
        {[
          ["Approval Rate", "91.8%"],
          ["Rejection Rate", "2.6%"],
          ["First-pass Approval", "86.3%"],
          ["Average Review TAT", "3.8 Days"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-slate-200 pb-3 last:border-b-0">
            <span className="text-xs text-slate-500">{label}</span>
            <strong className="text-sm text-slate-950">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] text-slate-500"><span>SLA Compliance 94.7%</span><span>Target 95%</span></div>
        <div className="relative h-2 overflow-hidden rounded-full bg-[#E8EEF6]">
          <div className="h-full rounded-full bg-[#2563EB]" style={{ width: "94.7%" }} />
          <div className="absolute -top-0.5 bottom-[-2px] w-0.5 bg-[#0F2A5F]" style={{ left: "95%" }} />
        </div>
      </div>
      <button type="button" onClick={() => onFilter("sla")} className="mt-4 w-full rounded-[10px] border border-red-200 bg-red-50 px-3 py-3 text-left text-xs font-black text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
        14 Cases Exceeded SLA — Review required
      </button>
    </Card>
  );
}

function ReadinessTrendChart() {
  const actual = [82.1, 83.8, 84.9, 86.4, 85.7, 87.1, 87.4];
  const previous = [78.2, 79.5, 81.2, 82.8, 83.6, 84.2, 84.9];
  const target = [90, 90, 90, 90, 90, 90, 90];
  return (
    <LineChart
      heightClass="h-[330px]"
      min={70}
      max={100}
      labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
      series={[
        { label: "Actual Claim Ready %", values: actual, color: "#2563EB", fill: "rgba(37,99,235,.10)" },
        { label: "Target %", values: target, color: "#0F2A5F", dashed: true },
        { label: "Previous Period %", values: previous, color: "#94A3B8" },
      ]}
      ySuffix="%"
    />
  );
}

function MissingEvidencePareto() {
  const labels = ["SOAP Incomplete", "ICD-10 Missing", "Medical Certificate", "Pre-authorization", "Cost Justification"];
  const bars = [41, 33, 24, 17, 13];
  const line = [32, 58, 77, 90, 100];
  const maxBar = 45;

  return (
    <div className="h-[330px] p-1">
      <div className="relative h-[260px] border-b border-l border-slate-200">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 500 260" preserveAspectRatio="none" role="img" aria-label="Missing evidence Pareto chart with cumulative percentage line">
          {[0, 65, 130, 195].map((y) => <line key={y} x1="0" x2="500" y1={y} y2={y} stroke="#E2E8F0" strokeWidth="1" />)}
          {bars.map((value, index) => {
            const width = 48;
            const gap = 52;
            const x = 35 + index * (width + gap);
            const h = (value / maxBar) * 210;
            return <rect key={labels[index]} x={x} y={230 - h} width={width} height={h} rx="7" fill="#2563EB" />;
          })}
          <polyline points={line.map((value, index) => `${59 + index * 100},${230 - (value / 100) * 220}`).join(" ")} fill="none" stroke="#D97706" strokeWidth="3" />
          {line.map((value, index) => <circle key={value} cx={59 + index * 100} cy={230 - (value / 100) * 220} r="5" fill="#D97706" />)}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-slate-500">
        {labels.map((label) => <span key={label} className="truncate">{label}</span>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-bold text-slate-600">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#2563EB]" />Cases</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#D97706]" />Cumulative %</span>
      </div>
    </div>
  );
}

function CostTrendChart() {
  return (
    <LineChart
      heightClass="h-[290px]"
      min={7400}
      max={9600}
      labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
      series={[
        { label: "Actual Average Cost", values: [9100, 8950, 9220, 8840, 8670, 8810, 8740], color: "#2563EB" },
        { label: "Payer Benchmark", values: [9200, 9200, 9200, 9200, 9200, 9200, 9200], color: "#64748B", dashed: true },
        { label: "Expected Lower Bound", values: [7800, 7800, 7800, 7800, 7800, 7800, 7800], color: "#BFDBFE", dashed: true },
      ]}
      yPrefix="฿"
    />
  );
}

function PayerRuleComposition({ onManageRules }: { onManageRules: () => void }) {
  return (
    <Card title="Payer Rule Composition" helper="Published validation portfolio applied by the readiness engine" action={<LinkButton onClick={onManageRules}>Manage Rules →</LinkButton>}>
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Active Rules" value="48" />
        <MiniMetric label="Blocking Rules" value="12" />
        <MiniMetric label="Warning Rules" value="27" />
        <MiniMetric label="Draft Rules" value="3" />
      </div>
      <div className="mt-3 h-[205px] p-1">
        <div className="mt-16 flex h-8 overflow-hidden rounded-full bg-slate-200">
          <div className="bg-red-600" style={{ width: "25%" }} />
          <div className="bg-amber-600" style={{ width: "56.25%" }} />
          <div className="bg-blue-600" style={{ width: "12.5%" }} />
          <div className="bg-slate-400" style={{ width: "6.25%" }} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-500">
          <span>Blocking 12</span><span>Warning 27</span><span>Advisory 6</span><span>Draft 3</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
        <strong className="text-sm text-[#0F2A5F]">Version v3.4 · Published</strong>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">Effective from 10 Jul 2026 · Approved by Compliance Lead</p>
      </div>
    </Card>
  );
}

function VarianceChart() {
  const rows: Array<[string, number, Tone]> = [
    ["General Surgery", 2500, "danger"],
    ["Orthopedics", 880, "warning"],
    ["ENT", -360, "success"],
    ["Cardiology", -400, "success"],
    ["Internal Medicine", -460, "success"],
    ["Dermatology", -560, "success"],
  ];
  const max = 2600;
  return (
    <div className="h-[330px] p-1">
      <div className="space-y-4">
        {rows.map(([label, value, tone]) => (
          <div key={label} className="grid grid-cols-[140px_1fr_76px] items-center gap-3 text-xs">
            <span className="font-bold text-slate-600">{label}</span>
            <div className="relative h-5 rounded-full bg-slate-200">
              <div className="absolute left-1/2 top-0 h-full w-px bg-slate-400" />
              <div className={`absolute top-0 h-full rounded-full ${barTone(tone)}`} style={value >= 0 ? { left: "50%", width: `${Math.abs(value) / max * 50}%` } : { right: "50%", width: `${Math.abs(value) / max * 50}%` }} />
            </div>
            <strong className={value > 0 ? "text-red-700" : "text-emerald-700"}>{value > 0 ? "+" : ""}{money(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  const items = [
    ["RV", "Payer Rule Version v3.4 Published", "Narin S. updated ICD validation and cost thresholds.", "2h ago"],
    ["CT", "Cost Threshold Updated", "Maximum OPD threshold changed from ฿25,000 to ฿28,000.", "5h ago"],
    ["DOC", "Contract Document Uploaded", "Service_Agreement_2026_v2.pdf passed malware scan.", "1d ago"],
    ["API", "Integration Service Restored", "Claim submission API returned to Connected status.", "2d ago"],
  ];
  return (
    <div>
      {items.map(([icon, title, helper, time]) => (
        <div key={title} className="grid grid-cols-[38px_1fr_auto] gap-3 border-b border-slate-200 py-3 last:border-b-0">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] border border-blue-200 bg-blue-50 text-[11px] font-black text-blue-700">{icon}</div>
          <div><strong className="text-xs text-slate-950">{title}</strong><p className="mt-1 text-[11px] leading-5 text-slate-500">{helper}</p></div>
          <span className="whitespace-nowrap text-[10px] text-slate-400">{time}</span>
        </div>
      ))}
    </div>
  );
}

function RecentPayerCases({ rows, onFilter }: { rows: DetailCase[]; onFilter: (filter: CaseFilter) => void }) {
  return (
    <>
      <QuickFilters active="all" onChange={onFilter} />
      <CaseTable rows={rows} compact />
      <PaginationSummary count={rows.length} />
    </>
  );
}

function RulesTab({ form }: { form: PayerRuleFormValues }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <PayerProfileCard form={form} />
        <CoverageCard form={form} />
        <EvidenceCard form={form} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <IcdCard form={form} />
        <BenefitCostCard form={form} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[7fr_5fr]">
        <RiskMatrixCard form={form} />
        <AiPermissionCard />
      </div>
    </div>
  );
}

function PayerProfileCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="Payer Profile" helper="ข้อมูลบริษัทประกันและเจ้าของกฎสำหรับการกำกับดูแล">
      <InfoGrid items={[["Payer Name", form.payerName], ["Payer Code", form.payerCode], ["Rule Set", form.ruleSetName], ["Governance Owner", form.governanceOwner], ["Effective Date", formatShortDate(form.effectiveDate)], ["Rule Status", labelize(form.status)], ["Description", form.description]]} />
    </Card>
  );
}

function CoverageCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="Coverage Configuration" helper="Coverage, waiting period, exclusion, and human review settings">
      <InfoStack rows={[["Default Coverage Status", coverageLabel(form.coverageRules.defaultStatus), "blue"], ["Waiting Period Simulation", form.coverageRules.waitingPeriodSimulation ? "Enabled" : "Disabled", "success"], ["Human Review Required", form.coverageRules.humanReview ? "Required" : "Not Required", "warning"], ["Required Evidence", form.coverageRules.requiredEvidence.join(", "), "neutral"]]} />
    </Card>
  );
}

function EvidenceCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="Required Evidence Rules" helper="เอกสารขั้นต่ำที่ต้องครบก่อนส่งเคลม">
      <div className="space-y-2">
        {form.evidenceRules.map((rule) => (
          <InfoRow key={rule.key} title={rule.label} helper={`${rule.condition} · Readiness impact ${rule.readinessImpact}`} badge={labelize(rule.requirement)} tone={rule.enabled ? "blue" : "neutral"} />
        ))}
      </div>
    </Card>
  );
}

function IcdCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="ICD & Diagnosis Rules" helper="Controls ICD requirement, diagnosis consistency, and high-risk groups">
      <InfoGrid items={[["Require ICD-10", form.icdRules.requireIcd10 ? "Yes" : "No"], ["Require ICD-9 for Procedures", form.icdRules.requireIcd9ForProcedures ? "Yes" : "No"], ["Missing ICD Action", labelize(form.icdRules.missingIcdAction)], ["Diagnosis Consistency", form.icdRules.diagnosisIcdConsistency ? "Required" : "Advisory"], ["High-risk ICD Groups", form.icdRules.highRiskGroups.join(", ")], ["Excluded ICD Groups", form.icdRules.excludedGroups.join(", ")]]} />
    </Card>
  );
}

function BenefitCostCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="Benefit Limits & Cost Thresholds" helper="Benefit limit, expected cost range, and review threshold">
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric label="Benefit Limit" value={money(form.coverageRules.benefitLimit)} />
        <MiniMetric label="Expected Range" value={`${money(form.costRules.expectedMinimum)}-${money(form.costRules.expectedMaximum)}`} />
        <MiniMetric label="Alert Threshold" value={money(form.costRules.alertThreshold)} />
        <MiniMetric label="Block Threshold" value={money(form.costRules.blockThreshold)} />
      </div>
      <Callout>Exclusions: {form.coverageRules.exclusions.join(", ")}. กรุณาตรวจสอบข้อยกเว้นก่อนยืนยันการส่งเคลม</Callout>
    </Card>
  );
}

function RiskMatrixCard({ form }: { form: PayerRuleFormValues }) {
  return (
    <Card title="Risk Matrix & Claim Review Settings" helper="Risk rules remain decision-support outputs and require authorized human review">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead><tr className="bg-slate-50 text-slate-500">{["Risk Rule", "Enabled", "Risk Level", "Resulting Status", "Human Review"].map((head) => <th key={head} className="border-b p-3 font-black">{head}</th>)}</tr></thead>
          <tbody>{form.riskRules.map((rule) => <tr key={rule.key}><td className="border-b p-3 font-bold text-[#0F2A5F]">{rule.label}</td><td className="border-b p-3">{rule.enabled ? "Enabled" : "Disabled"}</td><td className="border-b p-3"><StatusBadge tone={riskTone(rule.riskLevel)}>{labelize(rule.riskLevel)}</StatusBadge></td><td className="border-b p-3">{labelize(rule.resultingStatus)}</td><td className="border-b p-3">{rule.humanReview ? "Required" : "Not Required"}</td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

function AiPermissionCard() {
  return (
    <Card title="AI-Assisted Rule Indicators" helper="AI supports recommendations only; it cannot approve or activate payer rules">
      <InfoStack rows={[["AI Evidence Review", "Enabled with confidence display", "purple"], ["AI Rule Optimization", "Draft suggestion only", "blue"], ["Human Confirmation", "Required before activation", "warning"], ["Audit Trail", "AI involvement recorded", "success"]]} />
      <Callout>AI recommendations are decision-support only. Human review and approval are required.</Callout>
    </Card>
  );
}

function CasesTab({
  rows,
  filter,
  search,
  selectFilters,
  onSelectFilters,
  onFilter,
  onSearch,
  onNotify,
}: {
  rows: DetailCase[];
  filter: CaseFilter;
  search: string;
  selectFilters: CaseSelectFilters;
  onSelectFilters: (filters: CaseSelectFilters) => void;
  onFilter: (filter: CaseFilter) => void;
  onSearch: (value: string) => void;
  onNotify: (message: string) => void;
}) {
  return (
    <Card title="Payer-Linked Cases" helper="รายการเคสที่ถูกประเมินด้วย Active Payer Rule" action={<Button variant="secondary" onClick={() => onNotify("Filtered case export generated")}><Download size={14} />Export</Button>}>
      <QuickFilters active={filter} onChange={onFilter} />
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <div className="min-w-[250px] flex-1"><input className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search Case ID, Visit ID, HN, patient, clinic..." aria-label="Search cases" /></div>
        <SelectBox label="Claim status" value={selectFilters.claimStatus} options={["All Claim Statuses", "Submitted", "Pending Evidence", "Under Review", "Draft", "Approved", "Paid"]} onChange={(value) => onSelectFilters({ ...selectFilters, claimStatus: value })} />
        <SelectBox label="Readiness status" value={selectFilters.readiness} options={["All Readiness Statuses", "Ready", "Needs Review", "Pending Evidence", "Not Ready"]} onChange={(value) => onSelectFilters({ ...selectFilters, readiness: value })} />
        <SelectBox label="Cost status" value={selectFilters.cost} options={["All Cost Statuses", "Normal", "Warning", "Critical"]} onChange={(value) => onSelectFilters({ ...selectFilters, cost: value })} />
        <SelectBox label="SLA status" value={selectFilters.sla} options={["All SLA Statuses", "Within SLA", "At Risk", "Breached"]} onChange={(value) => onSelectFilters({ ...selectFilters, sla: value })} />
      </div>
      <CaseTable rows={rows} onNotify={onNotify} />
      <PaginationSummary count={rows.length} />
    </Card>
  );
}

function CaseTable({ rows, compact, onNotify }: { rows: DetailCase[]; compact?: boolean; onNotify?: (message: string) => void }) {
  const displayedRows = compact ? rows.slice(0, 5) : rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1450px] border-collapse text-left text-xs">
        <thead><tr className="bg-slate-100 text-slate-600">{["Case ID", "Visit ID", "Patient", "Clinic", "Department", "Visit Date", "Claim Type", "Score", "Readiness", "Claim Status", "Missing", "Claim Amount", "Cost Status", "SLA Status", "Action"].map((head) => <th key={head} className="border-b p-3 font-black uppercase">{head}</th>)}</tr></thead>
        <tbody>
          {displayedRows.length === 0 ? <tr><td colSpan={15} className="p-8 text-center font-semibold text-slate-500">ไม่พบเคสที่ตรงกับตัวกรอง กรุณาปรับเงื่อนไขการค้นหา</td></tr> : null}
          {displayedRows.map((item) => <CaseRow key={item.id} item={item} onNotify={onNotify ?? (() => undefined)} />)}
        </tbody>
      </table>
    </div>
  );
}

function PaginationSummary({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-between gap-3 p-[13px] text-[11px] font-semibold text-slate-500 sm:flex-row sm:items-center">
      <span>Showing {count} of 1,248 cases</span>
      <div className="flex gap-1.5">
        {["‹", "1", "2", "3", "›"].map((item) => (
          <button key={item} type="button" className={`h-[34px] min-w-[34px] rounded-[9px] border px-2 font-bold ${item === "1" ? "border-[#1E3A8A] bg-[#1E3A8A] text-white" : "border-slate-200 bg-white text-slate-500"}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function CaseRow({ item, onNotify }: { item: DetailCase; onNotify: (message: string) => void }) {
  return (
    <tr className="hover:bg-blue-50">
      <td className="border-b p-3 font-black text-[#1E3A8A]">{item.caseId}</td>
      <td className="border-b p-3">{item.visitId}</td>
      <td className="border-b p-3"><strong className="block text-slate-900">{item.patientNameMasked}</strong><span className="text-slate-500">{item.hn}</span></td>
      <td className="border-b p-3">{item.clinic}</td>
      <td className="border-b p-3">{item.department}</td>
      <td className="border-b p-3">{item.visitDate}</td>
      <td className="border-b p-3"><StatusBadge tone="blue">{item.claimType}</StatusBadge></td>
      <td className="border-b p-3"><Score value={item.readinessScore} /></td>
      <td className="border-b p-3"><StatusBadge tone={readinessTone(item.status)}>{readinessLabel(item.status)}</StatusBadge></td>
      <td className="border-b p-3"><StatusBadge tone={claimStatusTone(item.claimStatus)}>{item.claimStatus}</StatusBadge></td>
      <td className="border-b p-3">{item.missingEvidence.length}</td>
      <td className="border-b p-3 font-bold">{money(item.claimAmount)}</td>
      <td className="border-b p-3"><StatusBadge tone={item.costStatus === "normal" ? "success" : item.costStatus === "alert" ? "warning" : "danger"}>{costStatusLabel(item.costStatus)}</StatusBadge></td>
      <td className="border-b p-3"><StatusBadge tone={item.slaStatus === "Within SLA" ? "success" : item.slaStatus === "At Risk" ? "warning" : "danger"}>{item.slaStatus}</StatusBadge></td>
      <td className="border-b p-3"><LinkButton onClick={() => onNotify(`Opening Visit ${item.visitId}`)}>View</LinkButton></td>
    </tr>
  );
}

function EconomicsTab({ form }: { form: PayerRuleFormValues }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniMetric label="Average Claim Cost" value="฿8,740" />
        <MiniMetric label="Expected Upper Bound" value={money(form.costRules.expectedMaximum)} />
        <MiniMetric label="Variance Alerts" value="18 cases" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Cost Trend vs Benchmark" helper="Average claim cost compared with configured payer benchmark"><CostTrendChart /></Card>
        <Card title="Department Cost Variance" helper="Departments above or below payer benchmark"><HorizontalBars rows={[["General Surgery", 2500, "danger"], ["Orthopedics", 880, "warning"], ["ENT", 360, "success"], ["Cardiology", 400, "success"], ["Internal Medicine", 460, "success"]]} /></Card>
      </div>
    </div>
  );
}

function ContractTab() {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card title="Contract Timeline" helper="Contract effective, review, and expiry milestones" action={<Button variant="secondary">Edit Contract</Button>}>
        <div className="px-4 py-8"><div className="relative h-2 rounded-full bg-slate-200"><div className="h-2 w-[53%] rounded-full bg-blue-600" /><TimelineMarker left="0%" label="01 Jan Effective" /><TimelineMarker left="53%" label="12 Jul Today" /><TimelineMarker left="75%" label="01 Oct Review" /><TimelineMarker left="100%" label="31 Dec Expiry" /></div></div>
        <InfoGrid items={[["Contract Number", "AIA-MED-2026-0042"], ["Contract Status", "Active"], ["Days Remaining", "174 Days"], ["Payment Term", "45 Days"], ["Claim Submission SLA", "7 Calendar Days"], ["Claim Review SLA", "5 Business Days"], ["Coverage Notes", "Direct billing is available for participating clinics. Pre-authorization is required for selected high-cost procedures."]]} />
      </Card>
      <Card title="Contract Alerts" helper="Configuration requiring user attention">
        <InfoStack rows={[["SLA Document Requires Update", "กรุณาอัปเดตเอกสารภายใน 30 วัน", "warning"], ["Contract Expiry Monitoring", "174 days remaining", "blue"], ["Published Rule Availability", "Version v3.4 active", "success"], ["Auto-renewal", "Renewal workflow enabled", "success"]]} />
      </Card>
    </div>
  );
}

function IntegrationTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[7fr_5fr]">
        <Card title="Integration Configuration" helper="กำหนดช่องทางส่งเคลมและการเชื่อมต่ออย่างปลอดภัย" action={<Button variant="secondary">Configure Integration</Button>}>
          <InfoGrid items={[["Integration Type", "REST API"], ["API Status", "Connected"], ["Endpoint Name", "AIA Claim Gateway"], ["Authentication", "OAuth 2.0 Client Credentials"], ["Submission Channel", "API"], ["Response Channel", "Webhook + API Polling"], ["Client Secret", "Masked credential"], ["Webhook Status", "Verified"], ["Retry Policy", "5 retries · Exponential backoff"]]} />
        </Card>
        <Card title="Integration Health" helper="Current health and synchronization events">
          <InfoStack rows={[["Last Successful Sync", "10 Jul 2026, 14:28", "success"], ["Last Failed Sync", "08 Jul 2026, 09:14", "warning"], ["24h Success Rate", "1,842 / 1,847 requests", "success"]]} />
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="API Success Rate Trend" helper="Last seven days compared with 99.5% service target"><ReadinessTrendChart /></Card>
        <Card title="Integration Error Types" helper="Root causes from failed requests"><HorizontalBars rows={[["Timeout", 8, "warning"], ["Validation Error", 6, "warning"], ["Authentication Error", 3, "danger"], ["Payer Rejection", 2, "danger"], ["Webhook Failure", 1, "warning"]]} /></Card>
      </div>
    </div>
  );
}

function DocumentsTab({ onNotify }: { onNotify: (message: string) => void }) {
  const docs = [
    ["PDF", "Service Agreement 2026", "Contract · v2.0 · 4.8 MB · Malware scan passed · Internal", "Preview"],
    ["PDF", "Coverage Guideline - OPD/IPD", "Coverage Guideline · v3.1 · 2.1 MB · Expires 31 Dec 2026", "Preview"],
    ["XLS", "Fee Schedule 2026", "Fee Schedule · v1.4 · 740 KB · Hash verified · Restricted", "Download"],
    ["PDF", "Claim API Specification", "API Specification · v2.6 · 1.2 MB · Restricted internal access", "Version History"],
  ];

  return (
    <Card title="Document Governance" helper="จัดการเอกสารสัญญา Coverage Guideline, Fee Schedule และ API Specification พร้อม Version Control" action={<Button variant="primary" onClick={() => onNotify("Document upload opened")}>Upload Document</Button>}>
      <div className="space-y-3">
        {docs.map(([type, title, helper, action]) => (
          <div key={title} className="grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[40px_1fr_auto] sm:items-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-black text-blue-700">{type}</div>
            <div><strong className="text-sm text-[#0F2A5F]">{title}</strong><p className="mt-1 text-xs text-slate-500">{helper}</p></div>
            <Button variant="ghost" onClick={() => onNotify(`${action} requested for ${title}`)}>{action}</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditTab({ filter, onFilter, onNotify }: { filter: AuditFilter; onFilter: (filter: AuditFilter) => void; onNotify: (message: string) => void }) {
  const rows = auditEvents.filter((item) => {
    if (filter === "All Events") return true;
    if (filter === "Rule Changes") return item.event.includes("Rule");
    if (filter === "Publications") return item.event.includes("Approval");
    if (filter === "Exports") return item.event.includes("Export");
    if (filter === "Integration Failures") return item.outcome === "blocked" || item.outcome === "warning";
    return item.event.includes("Contract");
  });

  return (
    <Card title="Audit & Compliance" helper="Trace payer configuration, rule publication, export, and integration events" action={<Button variant="secondary" onClick={() => onNotify("Audit report export initiated")}>Export Audit Report</Button>}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        {(["All Events", "Rule Changes", "Publications", "Exports", "Integration Failures", "Contract Updates"] as AuditFilter[]).map((item) => <button key={item} type="button" onClick={() => onFilter(item)} className={`rounded-full border px-3 py-2 text-xs font-black ${filter === item ? "border-[#1E3A8A] bg-[#1E3A8A] text-white" : "border-slate-200 bg-white text-slate-500"}`}>{item}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        {["Last 30 Days", "All Actors", "All Actions", "All Sources", "All Severities"].map((label) => <SelectBox key={label} label={label} value={label} options={[label]} onChange={() => undefined} />)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead><tr className="bg-slate-100 text-slate-600">{["Timestamp", "Actor", "Action", "Entity", "Previous Value", "New Value", "Source", "Correlation ID"].map((head) => <th key={head} className="border-b p-3 font-black uppercase">{head}</th>)}</tr></thead>
          <tbody>{rows.length === 0 ? <tr><td colSpan={8} className="p-8 text-center font-semibold text-slate-500">ไม่พบ Audit Event ที่ตรงกับตัวกรอง</td></tr> : rows.map((item, index) => <tr key={item.id}><td className="border-b p-3">{item.timestamp}</td><td className="border-b p-3">{item.actor}</td><td className="border-b p-3"><StatusBadge tone={auditTone(item.outcome)}>{item.event}</StatusBadge></td><td className="border-b p-3">{item.version}</td><td className="border-b p-3">{index === 0 ? "Draft rule" : "-"}</td><td className="border-b p-3">{item.phiStatus === "masked" ? "Masked records" : "No PHI"}</td><td className="border-b p-3">Web Admin</td><td className="border-b p-3">COR-{index + 1}FA937</td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <VersionHistory />
        <RuleMatrix />
      </div>
    </Card>
  );
}

function VersionHistory() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <h3 className="text-sm font-black text-[#0F2A5F]">Version History</h3>
      <div className="mt-3 space-y-3">{versionHistory.map((item) => <InfoRow key={item.version} title={`${item.version} - ${item.changeSummary}`} helper={`${item.changedBy} · ${item.changedAt}`} badge={labelize(item.approvalStatus)} tone={approvalTone(item.approvalStatus)} />)}</div>
    </section>
  );
}

function RuleMatrix() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-black text-[#0F2A5F]">Rule Portfolio Matrix</h3>
      <div className="mt-3 space-y-2">{ruleDomains.map((item) => <InfoRow key={item.name} title={item.name} helper={`Active ${item.active} · Blocking ${item.blocking} · Warning ${item.warning} · Draft ${item.draft}`} badge={`Updated ${item.updated}`} tone="blue" />)}</div>
    </section>
  );
}

function Card({ title, helper, action, children }: { title: string; helper: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-start">
        <div><h2 className="text-lg font-black tracking-tight text-[#0F172A]">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p></div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </article>
  );
}

function Button({ children, onClick, variant = "ghost", ariaLabel }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; ariaLabel?: string }) {
  const styles: Record<"primary" | "secondary" | "ghost", string> = {
    primary: "border-[#1E3A8A] bg-[#1E3A8A] text-white hover:bg-[#172F70]",
    secondary: "border-blue-200 bg-white text-[#1E3A8A] hover:bg-blue-50",
    ghost: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  };
  return <button type="button" aria-label={ariaLabel} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles[variant]}`}>{children}</button>;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">{children}</button>;
}

function LinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="text-xs font-black text-blue-600 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">{children}</button>;
}

function SelectBox({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select className="h-10 min-w-[150px] rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span><strong className="mt-1 block text-sm text-slate-900">{value}</strong></div>;
}

function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const tones: Record<Tone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    neutral: "border-slate-200 bg-slate-100 text-slate-600",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black ${tones[tone]}`}>{children}</span>;
}

function KpiIcon({ children }: { children: React.ReactNode }) {
  return <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-blue-200 bg-blue-50 text-[11px] font-black text-blue-700">{children}</span>;
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(([label, value]) => <div key={label} className="border-b border-dashed border-slate-200 pb-3"><span className="block text-[11px] font-bold text-slate-500">{label}</span><strong className="mt-1 block text-sm leading-6 text-slate-900">{value}</strong></div>)}</div>;
}

function InfoStack({ rows }: { rows: Array<[string, string, Tone]> }) {
  return <div className="space-y-2">{rows.map(([title, helper, tone]) => <InfoRow key={title} title={title} helper={helper} badge={tone === "success" ? "Ready" : tone === "warning" ? "Action" : "Tracked"} tone={tone} />)}</div>;
}

function InfoRow({ title, helper, badge, tone }: { title: string; helper: string; badge: string; tone: Tone }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><strong className="block text-sm text-[#0F2A5F]">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{helper}</span></div><StatusBadge tone={tone}>{badge}</StatusBadge></div>;
}

function MiniMetric({ label, value, tone = "blue" }: { label: string; value: string; tone?: Tone }) {
  const valueTone = tone === "success" ? "text-emerald-700" : tone === "danger" ? "text-red-700" : tone === "warning" ? "text-amber-700" : "text-[#0F2A5F]";
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="block text-[11px] text-slate-500">{label}</span><strong className={`mt-1.5 block text-[17px] font-black ${valueTone}`}>{value}</strong></div>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold leading-5 text-[#0F2A5F]">{children}</div>;
}

function ReadinessDistribution({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  const items: Array<{ label: string; helper: string; count: string; percent: string; filter: CaseFilter; tone: Tone; color: string }> = [
    { label: "Ready", helper: "Score 85–100", count: "1,091", percent: "87.4%", filter: "ready", tone: "success", color: "#059669" },
    { label: "Needs Review", helper: "Score 60–84", count: "109", percent: "8.7%", filter: "review", tone: "warning", color: "#D97706" },
    { label: "Not Ready", helper: "Score 0–59", count: "48", percent: "3.9%", filter: "notReady", tone: "danger", color: "#DC2626" },
  ];
  return (
    <div className="grid gap-3">
      <div className="relative h-[290px]">
        <svg className="h-full w-full" viewBox="0 0 220 220" role="img" aria-label="Claim readiness distribution doughnut chart">
          <circle cx="110" cy="110" r="74" fill="none" stroke="#E2E8F0" strokeWidth="30" />
          <circle cx="110" cy="110" r="74" fill="none" stroke="#059669" strokeWidth="30" strokeDasharray="405.9 58.9" strokeDashoffset="0" strokeLinecap="butt" transform="rotate(-90 110 110)" />
          <circle cx="110" cy="110" r="74" fill="none" stroke="#D97706" strokeWidth="30" strokeDasharray="40.4 424.4" strokeDashoffset="-405.9" strokeLinecap="butt" transform="rotate(-90 110 110)" />
          <circle cx="110" cy="110" r="74" fill="none" stroke="#DC2626" strokeWidth="30" strokeDasharray="18.1 446.7" strokeDashoffset="-446.3" strokeLinecap="butt" transform="rotate(-90 110 110)" />
          <circle cx="110" cy="110" r="54" fill="#fff" />
        </svg>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><strong className="block text-[30px] font-black tracking-tight">87.4%</strong><span className="text-[11px] text-slate-500">Claim Ready</span></div>
      </div>
      <div className="grid gap-2">{items.map((item) => <button key={item.label} type="button" onClick={() => onFilter(item.filter)} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-[9px] rounded-[11px] border border-slate-200 px-[11px] py-2.5 text-left hover:border-blue-200 hover:bg-[#FBFDFF]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} /><div><strong className="text-xs">{item.label}</strong><span className="mt-0.5 block text-[10px] text-slate-500">{item.helper}</span></div><div className="text-right text-xs font-black text-slate-700">{item.count}<br /><span className="text-[10px] text-slate-500">{item.percent}</span></div></button>)}</div>
    </div>
  );
}

type LineSeries = { label: string; values: number[]; color: string; dashed?: boolean; fill?: string };

function LineChart({ labels, series, min, max, heightClass, yPrefix = "", ySuffix = "" }: { labels: string[]; series: LineSeries[]; min: number; max: number; heightClass: string; yPrefix?: string; ySuffix?: string }) {
  const chartWidth = 680;
  const chartHeight = 260;
  const left = 42;
  const right = 18;
  const top = 20;
  const bottom = 34;
  const innerWidth = chartWidth - left - right;
  const innerHeight = chartHeight - top - bottom;
  const scaleX = (index: number) => left + (index / (labels.length - 1)) * innerWidth;
  const scaleY = (value: number) => top + (1 - (value - min) / (max - min)) * innerHeight;
  const ticks = [min, min + (max - min) / 2, max];

  return (
    <div className={`${heightClass} p-1`}>
      <svg className="h-[calc(100%-34px)] w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${series.map((item) => item.label).join(", ")} chart`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={chartWidth - right} y1={scaleY(tick)} y2={scaleY(tick)} stroke="#E2E8F0" />
            <text x="0" y={scaleY(tick) + 4} fill="#64748B" fontSize="11">{yPrefix}{Math.round(tick).toLocaleString("en-US")}{ySuffix}</text>
          </g>
        ))}
        {series.map((item) => {
          const points = item.values.map((value, index) => `${scaleX(index)},${scaleY(value)}`).join(" ");
          const fillPoints = `${left},${top + innerHeight} ${points} ${chartWidth - right},${top + innerHeight}`;
          return (
            <g key={item.label}>
              {item.fill ? <polygon points={fillPoints} fill={item.fill} /> : null}
              <polyline points={points} fill="none" stroke={item.color} strokeWidth="3" strokeDasharray={item.dashed ? "8 6" : undefined} strokeLinejoin="round" strokeLinecap="round" />
              {!item.dashed ? item.values.map((value, index) => <circle key={`${item.label}-${index}`} cx={scaleX(index)} cy={scaleY(value)} r="3.5" fill={item.color} />) : null}
            </g>
          );
        })}
        {labels.map((label, index) => <text key={label} x={scaleX(index)} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="11">{label}</text>)}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-bold text-slate-600">
        {series.map((item) => <span key={item.label}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
      </div>
    </div>
  );
}

function HorizontalBars({ rows }: { rows: Array<[string, number, Tone]> }) {
  const max = Math.max(...rows.map((row) => row[1]));
  return <div className="space-y-3">{rows.map(([label, value, tone]) => <div key={label}><div className="mb-1 flex justify-between text-xs font-bold text-slate-600"><span>{label}</span><span>{value.toLocaleString()}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${barTone(tone)}`} style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div></div>)}</div>;
}

function QuickFilters({ active, onChange }: { active: CaseFilter; onChange: (filter: CaseFilter) => void }) {
  const chips: Array<[CaseFilter, string]> = [["all", "All · 1,248"], ["ready", "Ready · 1,091"], ["review", "Needs Review · 109"], ["notReady", "Not Ready · 48"], ["pending", "Pending Evidence · 72"], ["cost", "Cost Alert · 18"], ["sla", "SLA Breach · 14"]];
  return <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">{chips.map(([key, label]) => <button key={key} type="button" onClick={() => onChange(key)} className={`rounded-full border px-3 py-2 text-xs font-black ${active === key ? "border-[#1E3A8A] bg-[#1E3A8A] text-white" : "border-slate-200 bg-white text-slate-500"}`}>{label}</button>)}</div>;
}

function Score({ value }: { value: number }) {
  return <span className={`inline-flex h-7 min-w-10 items-center justify-center rounded-lg border px-2 text-xs font-black ${value >= 85 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : value >= 60 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>{value}</span>;
}

function TimelineMarker({ left, label }: { left: string; label: string }) {
  return <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1E3A8A] shadow" style={{ left }}><span className="absolute left-1/2 top-5 w-24 -translate-x-1/2 text-center text-[10px] font-bold text-slate-500">{label}</span></span>;
}

function money(value: number) {
  return `฿${value.toLocaleString("en-US")}`;
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function costStatusLabel(status: AffectedCase["costStatus"]) {
  return status === "normal" ? "Normal" : status === "alert" ? "Warning" : "Critical";
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function coverageLabel(status: CoverageStatus) {
  return status === "likely_covered" ? "Likely Covered" : status === "need_review" ? "Need Review" : "Not Covered";
}

function readinessLabel(status: ReadinessStatus) {
  return status === "ready" ? "Ready" : status === "needs_review" ? "Needs Review" : status === "pending_evidence" ? "Pending Evidence" : "Not Ready";
}

function payerStatusTone(status: PayerStatus): Tone {
  return status === "active" ? "success" : status === "needs_review" ? "warning" : status === "draft" ? "neutral" : status === "simulation" ? "purple" : "danger";
}

function readinessTone(status: ReadinessStatus): Tone {
  return status === "ready" ? "success" : status === "needs_review" || status === "pending_evidence" ? "warning" : "danger";
}

function riskTone(risk: RiskLevel): Tone {
  return risk === "low" ? "success" : risk === "medium" ? "warning" : risk === "high" ? "danger" : "purple";
}

function claimStatusTone(status: DetailCase["claimStatus"]): Tone {
  if (status === "Approved" || status === "Paid" || status === "Submitted") return "success";
  if (status === "Pending Evidence" || status === "Under Review" || status === "Draft") return "warning";
  return "blue";
}

function auditTone(outcome: "success" | "warning" | "blocked"): Tone {
  return outcome === "success" ? "success" : outcome === "warning" ? "warning" : "danger";
}

function approvalTone(status: ApprovalStatus): Tone {
  return status === "active" || status === "approved" ? "success" : status === "pending_approval" ? "warning" : status === "draft" ? "neutral" : "danger";
}

function barTone(tone: Tone) {
  if (tone === "success") return "bg-emerald-600";
  if (tone === "warning") return "bg-amber-600";
  if (tone === "danger") return "bg-red-600";
  if (tone === "purple") return "bg-violet-600";
  return "bg-blue-600";
}
