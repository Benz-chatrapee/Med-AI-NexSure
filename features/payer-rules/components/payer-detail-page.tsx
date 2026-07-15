"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { affectedCases, auditEvents, payers, ruleDetails, ruleSets, versionHistory } from "../mock/payer-rule-mock-data";
import type { AffectedCase, ApprovalStatus, CoverageStatus, Payer, PayerRuleFormValues, PayerStatus, ReadinessStatus, RiskLevel } from "../types/payer-rule-types";

type Tone = "success" | "warning" | "danger" | "blue" | "neutral" | "purple";
type PayerDetailTab = "overview" | "rules" | "cases" | "economics" | "contract" | "integration" | "documents" | "audit";
type CaseFilter = "all" | "ready" | "review" | "notReady" | "pending" | "cost" | "sla";

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

const detailCases: DetailCase[] = affectedCases.map((item, index) => {
  const clinics = ["Bangkok Medical Center", "Sukhumvit Clinic", "Rama 9 Clinic", "Bangkok Medical Center"];
  const departments = ["Internal Medicine", "Orthopedics", "Cardiology", "General Surgery"];
  const statuses: DetailCase["claimStatus"][] = ["Submitted", "Pending Evidence", "Under Review", "Draft"];
  const amounts = [8450, 12680, 64200, 6980];
  const sla: DetailCase["slaStatus"][] = ["Within SLA", "At Risk", "Within SLA", "Breached"];

  return {
    ...item,
    caseId: `CLM-26071${index}-0${148 - index}`,
    clinic: clinics[index] ?? clinics[0],
    department: departments[index] ?? departments[0],
    visitDate: `${10 - index} Jul 2026`,
    claimType: index === 2 ? "IPD" : "OPD",
    claimStatus: statuses[index] ?? "Submitted",
    claimAmount: amounts[index] ?? 8400,
    slaStatus: sla[index] ?? "Within SLA",
  };
});

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
  const [toast, setToast] = useState<string | null>(null);

  const payer = payers.find((item) => item.id === payerId) ?? payers[0];
  const ruleSet = ruleSets.find((item) => item.payerId === payer.id) ?? ruleSets[0];
  const ruleDetail = ruleDetails.find((item) => item.id === ruleSet.id) ?? ruleDetails[0];
  const form = ruleDetail.form;

  const filteredCases = useMemo(() => {
    const search = caseSearch.trim().toLowerCase();
    return detailCases.filter((item) => {
      const matchesSearch = !search || [item.caseId, item.visitId, item.hn, item.patientNameMasked, item.clinic, item.department].some((value) => value.toLowerCase().includes(search));
      const matchesFilter =
        caseFilter === "all" ||
        (caseFilter === "ready" && item.status === "ready") ||
        (caseFilter === "review" && item.status === "needs_review") ||
        (caseFilter === "notReady" && item.status === "not_ready") ||
        (caseFilter === "pending" && item.status === "pending_evidence") ||
        (caseFilter === "cost" && item.costStatus !== "normal") ||
        (caseFilter === "sla" && item.slaStatus === "Breached");
      return matchesSearch && matchesFilter;
    });
  }, [caseFilter, caseSearch]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function openTab(tab: PayerDetailTab) {
    setActiveTab(tab);
  }

  function applyCaseFilter(filter: CaseFilter) {
    setCaseFilter(filter);
    setActiveTab("cases");
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-7 sm:py-7">
        <TopBar onNotify={notify} />
        <nav className="mb-4 flex gap-2 text-xs font-bold text-slate-500" aria-label="Breadcrumb">
          <Link href="/payer-rules">Payer Management</Link>
          <span>/</span>
          <span className="text-slate-900">Payer Detail</span>
        </nav>
        <PayerHeader payer={payer} form={form} ruleVersion={ruleSet.version} ruleStatus={ruleSet.status} onManageRules={() => openTab("rules")} onNotify={notify} />
        <AlertBanner onReview={() => openTab("contract")} />
        <FilterBar onNotify={notify} />
        <KpiGrid onFilter={applyCaseFilter} />
        <Tabs activeTab={activeTab} onChange={openTab} />

        {activeTab === "overview" ? <OverviewTab onFilter={applyCaseFilter} /> : null}
        {activeTab === "rules" ? <RulesTab form={form} /> : null}
        {activeTab === "cases" ? <CasesTab rows={filteredCases} filter={caseFilter} search={caseSearch} onFilter={setCaseFilter} onSearch={setCaseSearch} onNotify={notify} /> : null}
        {activeTab === "economics" ? <EconomicsTab form={form} /> : null}
        {activeTab === "contract" ? <ContractTab /> : null}
        {activeTab === "integration" ? <IntegrationTab /> : null}
        {activeTab === "documents" ? <DocumentsTab onNotify={notify} /> : null}
        {activeTab === "audit" ? <AuditTab onNotify={notify} /> : null}
      </div>
      {toast ? <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0F2A5F] px-4 py-3 text-xs font-bold text-white shadow-xl" role="status">{toast}</div> : null}
    </main>
  );
}

function TopBar({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <header className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Search patient, visit, claim, payer, or document..." aria-label="Global search" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500">Ctrl K</span>
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

function FilterBar({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <section className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Dashboard filters">
      {["Last 30 Days", "All Clinics", "All Departments", "All Claim Types"].map((label) => <SelectBox key={label} label={label} />)}
      <div className="flex-1" />
      <span className="text-xs font-semibold text-slate-500">Updated 2 minutes ago</span>
      <Button variant="ghost" onClick={() => onNotify("Payer intelligence data refreshed")}><RefreshCw size={14} />Refresh</Button>
    </section>
  );
}

function KpiGrid({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  const kpis: Array<{ label: string; value: string; helper: string; filter: CaseFilter; tone: Tone }> = [
    { label: "Linked Cases", value: "1,248", helper: "+6.2% from previous period", filter: "all", tone: "blue" },
    { label: "Claim Ready", value: "87.4%", helper: "Target 90%", filter: "ready", tone: "success" },
    { label: "Pending Evidence", value: "72", helper: "ต้องตรวจสอบเอกสารเพิ่มเติม", filter: "pending", tone: "warning" },
    { label: "Not Ready", value: "48", helper: "Blocking rules detected", filter: "notReady", tone: "danger" },
    { label: "Cost Alerts", value: "18", helper: "Above configured threshold", filter: "cost", tone: "warning" },
    { label: "SLA Breach", value: "14", helper: "ต้องเร่งดำเนินการ", filter: "sla", tone: "danger" },
  ];

  return (
    <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="Payer KPIs">
      {kpis.map((item) => (
        <button key={item.label} type="button" onClick={() => onFilter(item.filter)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-slate-500">{item.label}</span><KpiIcon tone={item.tone} /></div>
          <strong className="mt-4 block text-3xl font-black tracking-tight text-[#0F2A5F]">{item.value}</strong>
          <span className="mt-2 block text-xs font-bold text-slate-500">{item.helper}</span>
        </button>
      ))}
    </section>
  );
}

function Tabs({ activeTab, onChange }: { activeTab: PayerDetailTab; onChange: (tab: PayerDetailTab) => void }) {
  return (
    <div className="sticky top-0 z-20 mb-4 bg-[#F8FAFC]/95 py-2 backdrop-blur">
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Payer detail sections">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === tab.id ? "bg-blue-50 text-[#0F2A5F] ring-1 ring-blue-200" : "text-slate-500 hover:bg-slate-100 hover:text-[#1E3A8A]"}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card title="Claim Readiness Trend" helper="แนวโน้มความพร้อมของเคสเทียบ Target และช่วงเวลาก่อนหน้า" action={<LinkButton onClick={() => onFilter("all")}>View Cases</LinkButton>}>
          <TrendBars />
          <Callout>08 Jul - Rule Version v3.4 Published · Readiness improved after the latest rule update.</Callout>
        </Card>
        <Card title="Claim Readiness Distribution" helper="Current readiness mix under published payer rules">
          <ReadinessDistribution onFilter={onFilter} />
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[7fr_5fr]">
        <Card title="Claim Status Distribution" helper="Operational case status linked to this payer">
          <HorizontalBars rows={[["Draft", 84, "blue"], ["Pending Evidence", 72, "warning"], ["Ready", 188, "blue"], ["Submitted", 241, "blue"], ["Under Review", 137, "warning"], ["Approved", 326, "success"], ["Paid", 171, "success"]]} />
        </Card>
        <Card title="Missing Evidence Pareto" helper="Prioritized evidence gaps that affect readiness">
          <HorizontalBars rows={[["SOAP Incomplete", 41, "blue"], ["ICD-10 Missing", 33, "blue"], ["Medical Certificate", 24, "warning"], ["Pre-authorization", 17, "warning"], ["Cost Justification", 13, "danger"]]} />
        </Card>
      </div>
    </div>
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

function CasesTab({ rows, filter, search, onFilter, onSearch, onNotify }: { rows: DetailCase[]; filter: CaseFilter; search: string; onFilter: (filter: CaseFilter) => void; onSearch: (value: string) => void; onNotify: (message: string) => void }) {
  return (
    <Card title="Payer-Linked Cases" helper="รายการเคสที่ถูกประเมินด้วย Active Payer Rule" action={<Button variant="secondary" onClick={() => onNotify("Filtered case export generated")}><Download size={14} />Export</Button>}>
      <QuickFilters active={filter} onChange={onFilter} />
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <div className="min-w-[250px] flex-1"><input className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search Case ID, Visit ID, HN, patient, clinic..." aria-label="Search cases" /></div>
        {["All Claim Statuses", "All Readiness Statuses", "All Cost Statuses", "All SLA Statuses"].map((label) => <SelectBox key={label} label={label} />)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse text-left text-xs">
          <thead><tr className="bg-slate-100 text-slate-600">{["Case ID", "Visit ID", "Patient", "Clinic", "Department", "Visit Date", "Claim Type", "Score", "Readiness", "Claim Status", "Missing", "Claim Amount", "Cost Status", "SLA Status", "Action"].map((head) => <th key={head} className="border-b p-3 font-black uppercase">{head}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={15} className="p-8 text-center font-semibold text-slate-500">ไม่พบเคสที่ตรงกับตัวกรอง กรุณาปรับเงื่อนไขการค้นหา</td></tr> : null}
            {rows.map((item) => <CaseRow key={item.id} item={item} onNotify={onNotify} />)}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col justify-between gap-2 p-3 text-xs font-semibold text-slate-500 sm:flex-row"><span>Showing {rows.length} of 1,248 cases</span><span>Page 1 of 3</span></div>
    </Card>
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
      <td className="border-b p-3"><StatusBadge tone={item.costStatus === "normal" ? "success" : item.costStatus === "alert" ? "warning" : "danger"}>{labelize(item.costStatus)}</StatusBadge></td>
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
        <Card title="Cost Trend vs Benchmark" helper="Average claim cost compared with configured payer benchmark"><TrendBars /></Card>
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
          <InfoGrid items={[["Integration Type", "REST API"], ["API Status", "Connected"], ["Endpoint Name", "AIA Claim Gateway"], ["Authentication", "OAuth 2.0 Client Credentials"], ["Submission Channel", "API"], ["Response Channel", "Webhook + API Polling"], ["Client Secret", "Masked credential ending 9F2A"], ["Webhook Status", "Verified"], ["Retry Policy", "5 retries · Exponential backoff"]]} />
        </Card>
        <Card title="Integration Health" helper="Current health and synchronization events">
          <InfoStack rows={[["Last Successful Sync", "10 Jul 2026, 14:28", "success"], ["Last Failed Sync", "08 Jul 2026, 09:14", "warning"], ["24h Success Rate", "1,842 / 1,847 requests", "success"]]} />
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="API Success Rate Trend" helper="Last seven days compared with 99.5% service target"><TrendBars /></Card>
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

function AuditTab({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <Card title="Audit & Compliance" helper="Trace payer configuration, rule publication, export, and integration events" action={<Button variant="secondary" onClick={() => onNotify("Audit report export initiated")}>Export Audit Report</Button>}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        {["All Events", "Rule Changes", "Publications", "Exports", "Integration Failures", "Contract Updates"].map((item, index) => <button key={item} type="button" className={`rounded-full border px-3 py-2 text-xs font-black ${index === 0 ? "border-[#1E3A8A] bg-[#1E3A8A] text-white" : "border-slate-200 bg-white text-slate-500"}`}>{item}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">{["Last 30 Days", "All Actors", "All Actions", "All Sources", "All Severities"].map((label) => <SelectBox key={label} label={label} />)}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead><tr className="bg-slate-100 text-slate-600">{["Timestamp", "Actor", "Action", "Entity", "Previous Value", "New Value", "Source", "Correlation ID"].map((head) => <th key={head} className="border-b p-3 font-black uppercase">{head}</th>)}</tr></thead>
          <tbody>{auditEvents.map((item, index) => <tr key={item.id}><td className="border-b p-3">{item.timestamp}</td><td className="border-b p-3">{item.actor}</td><td className="border-b p-3"><StatusBadge tone={auditTone(item.outcome)}>{item.event}</StatusBadge></td><td className="border-b p-3">{item.version}</td><td className="border-b p-3">{index === 0 ? "Draft rule" : "-"}</td><td className="border-b p-3">{item.phiStatus === "masked" ? "Masked records" : "No PHI"}</td><td className="border-b p-3">Web Admin</td><td className="border-b p-3">COR-{index + 1}FA937</td></tr>)}</tbody>
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

function SelectBox({ label }: { label: string }) {
  return <select className="h-10 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" aria-label={label}><option>{label}</option></select>;
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

function KpiIcon({ tone }: { tone: Tone }) {
  const icon = tone === "success" ? <CheckCircle2 size={16} /> : tone === "warning" ? <AlertTriangle size={16} /> : tone === "danger" ? <AlertTriangle size={16} /> : <ClipboardCheck size={16} />;
  return <span className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">{icon}</span>;
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><span className="block text-xs font-bold text-slate-500">{label}</span><strong className="mt-2 block text-xl font-black text-[#0F2A5F]">{value}</strong></div>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold leading-5 text-[#0F2A5F]">{children}</div>;
}

function ReadinessDistribution({ onFilter }: { onFilter: (filter: CaseFilter) => void }) {
  const items: Array<{ label: string; helper: string; value: string; filter: CaseFilter; tone: Tone }> = [
    { label: "Ready", helper: "Score 85-100", value: "1,091 / 87.4%", filter: "ready", tone: "success" },
    { label: "Needs Review", helper: "Score 60-84", value: "109 / 8.7%", filter: "review", tone: "warning" },
    { label: "Not Ready", helper: "Score 0-59", value: "48 / 3.9%", filter: "notReady", tone: "danger" },
  ];
  return (
    <div>
      <div className="mx-auto grid h-48 w-48 place-items-center rounded-full border-[26px] border-emerald-500 bg-white text-center shadow-inner"><div><strong className="block text-3xl font-black">87.4%</strong><span className="text-xs text-slate-500">Claim Ready</span></div></div>
      <div className="mt-4 space-y-2">{items.map((item) => <button key={item.label} type="button" onClick={() => onFilter(item.filter)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-blue-50"><div><strong className="text-sm">{item.label}</strong><span className="block text-xs text-slate-500">{item.helper}</span></div><StatusBadge tone={item.tone}>{item.value}</StatusBadge></button>)}</div>
    </div>
  );
}

function TrendBars() {
  const values = [82, 84, 85, 86, 86, 87, 87];
  return <div className="flex h-72 items-end gap-3 rounded-xl bg-slate-50 p-4">{values.map((value, index) => <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-blue-600" style={{ height: `${value * 2.4}px` }} /><span className="text-[11px] font-bold text-slate-500">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][index]}</span></div>)}</div>;
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
