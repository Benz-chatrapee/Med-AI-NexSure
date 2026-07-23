"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FilePlus2,
  Files,
  History,
  Info,
  Landmark,
  List,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CLAIM_DECISION_STATUS_CONFIG, CLAIM_PAYMENT_STATUS_CONFIG, CLAIM_RISK_CONFIG, CLAIM_STATUS_CONFIG, CLAIM_WORKFLOW_STATUS_CONFIG, EVIDENCE_SEVERITY_CONFIG, initialPatientClaimsFilters } from "../constants/patient-claims.constants";
import { recalculateClaimReadiness } from "../services/patient-claims-service";
import { isCanonicalPatientClaim, type CanonicalPatientClaimsDashboardData, type ClaimDetail, type ClaimRiskLevel, type ClaimStatus, type MissingEvidenceActionType, type PatientClaim, type PatientClaimsDashboardData, type PatientClaimsFilters } from "../types/patient-claims.types";
import { claimStatusForKpi, filterPatientClaims, formatClaimCurrency, formatClaimDate, formatCompactClaimCurrency, getReadinessStatus, maskPolicyNumber, paginatePatientClaims } from "../utils/patient-claims-utils";

type Props = {
  initialData: CanonicalPatientClaimsDashboardData;
};

type KpiCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: typeof Files;
  status: ClaimStatus | "all";
};

const toneClass = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

export function PatientClaimsWorkspace({ initialData }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState<PatientClaimsFilters>(initialPatientClaimsFilters);
  const [toast, setToast] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [recalculating, setRecalculating] = useState(false);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);

  const filteredClaims = useMemo(() => filterPatientClaims(initialData.claims, filters), [initialData.claims, filters]);
  const pagedClaims = useMemo(() => paginatePatientClaims(filteredClaims, filters), [filteredClaims, filters]);
  const payers = useMemo(() => Array.from(new Set(initialData.claims.map((claim) => claim.payerName))).sort(), [initialData.claims]);
  const chips = buildChips(filters);
  const readinessStatus = getReadinessStatus(initialData.readiness.score);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function applyFilters(next: Partial<PatientClaimsFilters>) {
    setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }

  function clearFilters() {
    setFilters(initialPatientClaimsFilters);
  }

  function removeChip(key: keyof PatientClaimsFilters) {
    setFilters((current) => ({
      ...current,
      [key]: key === "query" ? "" : key === "page" ? 1 : "all",
      page: 1,
    }));
  }

  function openClaimDetail(claim: PatientClaim, trigger: HTMLButtonElement) {
    detailTriggerRef.current = trigger;
    setDetailError("");
    setDetailLoading(false);
    const detail = initialData.claimDetails.find((item) => item.id === claim.id) ?? null;
    if (!detail) {
      setDetailError("Claim detail was not found.");
    }
    setSelectedClaim(detail);
  }

  function closeClaimDetail() {
    setSelectedClaim(null);
    setDetailError("");
    setDetailLoading(false);
    window.setTimeout(() => detailTriggerRef.current?.focus(), 0);
  }

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      await recalculateClaimReadiness(initialData.patient.id);
      showToast("Readiness recalculated. Human review is still required.");
    } catch {
      showToast("Readiness recalculation failed. กรุณาลองใหม่อีกครั้ง");
    } finally {
      setRecalculating(false);
    }
  }

  const kpis: KpiCard[] = [
    { id: "total", label: "Total Claims", value: String(initialData.summary.totalClaims), helper: "Across 9 visits", icon: Files, status: "all" },
    { id: "approved", label: "Approved", value: String(initialData.summary.approvedClaims), helper: `${formatClaimCurrency(initialData.summary.totalApprovedAmount)} reimbursed`, icon: CheckCircle2, status: "approved" },
    { id: "pending", label: "Pending Review", value: String(initialData.summary.pendingClaims), helper: "1 exceeds target TAT", icon: History, status: "pending" },
    { id: "not_ready", label: "Not Ready", value: String(initialData.summary.notReadyClaims), helper: "3 missing evidence items", icon: AlertTriangle, status: "not_ready" },
    { id: "submitted", label: "Submitted", value: String(initialData.summary.submittedClaims), helper: "Waiting payer decision", icon: PackageCheck, status: "submitted" },
    { id: "claimed", label: "Total Claimed", value: formatCompactClaimCurrency(initialData.summary.totalClaimedAmount), helper: "67.2% approved value", icon: Landmark, status: "all" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[276px_minmax(0,1fr)]">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0">
          <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white xl:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <nav className="min-w-0 flex-1 text-sm font-bold text-slate-500" aria-label="Breadcrumb">
              <Link href="/dashboard" className="text-blue-700 hover:underline">Patients</Link>
              <span aria-hidden="true"> / </span>
              <span>{initialData.patient.patientId}</span>
              <span aria-hidden="true"> / </span>
              <span className="text-slate-900" aria-current="page">Claims</span>
            </nav>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white" aria-label="Open notifications"><Bell size={18} /></button>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-xs font-black text-blue-800">DR</div>
          </header>

          <div className="w-full max-w-none space-y-4 p-4 md:p-6 xl:px-8">
            <PageHeader onToast={showToast} />
            <PatientContextCard patient={initialData.patient} />
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[1500px]:grid-cols-6" aria-label="Claim KPI filters">
              {kpis.map((card) => (
                <button
                  key={card.id}
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 focus:ring-4 focus:ring-blue-100 ${filters.status === card.status ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}
                  onClick={() => applyFilters({ status: claimStatusForKpi(card.id) })}
                  aria-pressed={filters.status === card.status}
                >
                  <card.icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
                  <div className="mt-3 text-2xl font-black text-blue-950">{card.value}</div>
                  <div className="text-sm font-bold">{card.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{card.helper}</p>
                </button>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
              <Card title="Claim Readiness Overview" subtitle="ภาพรวมความพร้อมจากหลักฐานทางคลินิก เอกสาร และกฎของผู้ชำระเงิน" action={<button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-50" onClick={handleRecalculate} disabled={recalculating}><RefreshCw className={`mr-1 inline h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />Recalculate</button>}>
                <div className="grid gap-5 md:grid-cols-[170px_minmax(0,1fr)] md:items-center">
                  <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border-[12px] border-blue-100 bg-white text-center shadow-inner" role="img" aria-label={`Readiness score ${initialData.readiness.score} of 100, ${readinessStatus.replace("_", " ")}`}>
                    <b className="block text-4xl font-black text-blue-950">{initialData.readiness.score}</b>
                    <span className="text-xs font-bold text-amber-700">Needs Review</span>
                  </div>
                  <div className="space-y-3">
                    {initialData.readiness.breakdown.map((item) => {
                      const percent = Math.round((item.score / item.maximumScore) * 100);
                      return <ProgressBar key={item.category} label={item.label} value={percent} suffix={`${item.score}/${item.maximumScore}`} />;
                    })}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-950">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p><b>Decision Support Only.</b> AI-generated readiness does not approve or reject a claim. กรุณาตรวจสอบหลักฐานและกฎของผู้ชำระเงินก่อนส่งเคลม</p>
                </div>
              </Card>
              <Card title="Missing Evidence" subtitle="เรียงลำดับตามผลกระทบต่อ Claim Readiness">
                {initialData.missingEvidence.length === 0 ? <EmptyState title="All required evidence is complete" text="เอกสารที่จำเป็นครบถ้วนแล้ว" /> : (
                  <div className="space-y-3">
                    {initialData.missingEvidence.map((item) => {
                      const config = EVIDENCE_SEVERITY_CONFIG[item.severity];
                      return (
                        <article key={item.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-slate-200 p-3">
                          <div>
                            <Badge tone={config.tone} icon={config.icon}>{config.label} Severity</Badge>
                            <h3 className="mt-2 font-black">{item.name}</h3>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                          </div>
                          <button className="self-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-blue-800" onClick={() => showToast(evidenceActionMessage(item.actionType))}>{actionLabel(item.actionType)}</button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </Card>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="claim-history-title">
              <div className="border-b border-slate-200 p-4">
                <h2 id="claim-history-title" className="text-base font-black">Claim History</h2>
                <p className="mt-1 text-xs text-slate-500">All claims associated with this patient · Last refreshed 10 Jul 2026, 16:42</p>
              </div>
              <ClaimToolbar filters={filters} payers={payers} onChange={applyFilters} onClear={clearFilters} />
              {chips.length ? <div className="flex flex-wrap gap-2 px-4 pb-3">{chips.map((chip) => <button key={chip.key} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800" onClick={() => removeChip(chip.key)}>{chip.label} <X size={12} className="inline" /></button>)}<button className="text-xs font-black text-blue-800" onClick={clearFilters}>Clear all</button></div> : null}
              {pagedClaims.total === 0 ? <EmptyState title="No claims match the selected filters" text="ไม่พบรายการที่ตรงกับตัวกรอง" action={<button className="mt-3 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white" onClick={clearFilters}>Clear Filters</button>} /> : <ClaimTable claims={pagedClaims.items} onOpen={openClaimDetail} />}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs text-slate-500">
                <span>{pagedClaims.rangeLabel}</span>
                <div className="flex gap-1">
                  <button className="rounded-lg border border-slate-200 p-2 disabled:opacity-40" aria-label="Previous page" disabled={pagedClaims.page <= 1} onClick={() => applyFilters({ page: pagedClaims.page - 1 })}><ChevronLeft size={16} /></button>
                  <span className="rounded-lg bg-blue-900 px-3 py-2 font-black text-white">{pagedClaims.page}</span>
                  <button className="rounded-lg border border-slate-200 p-2 disabled:opacity-40" aria-label="Next page" disabled={pagedClaims.page >= pagedClaims.pageCount} onClick={() => applyFilters({ page: pagedClaims.page + 1 })}><ChevronRight size={16} /></button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
              <ActivityTimeline activities={initialData.activities} />
              <PayerRulesCard data={initialData} />
            </section>
          </div>
        </main>
      </div>
      {(selectedClaim || detailLoading || detailError) ? <ClaimDetailSheet claim={selectedClaim} loading={detailLoading} error={detailError} onClose={closeClaimDetail} onToast={showToast} /> : null}
      <div aria-live="polite" className="fixed bottom-5 right-5 z-50">{toast ? <div className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">{toast}</div> : null}</div>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [["/dashboard", "Dashboard"], ["/patients/patient-kanokwan/documents", "Patient Documents"], ["/patients/patient-kanokwan/claims", "Patient Claims"], ["/claim-readiness", "Claim Readiness"], ["/evidence-package", "Evidence Package"], ["/payer-rules", "Payer Rules"], ["/audit-compliance", "Audit & Compliance"]];
  return <><aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[276px] overflow-y-auto bg-gradient-to-b from-[#0F2A5F] to-[#1E3A8A] p-4 text-blue-100 transition xl:sticky xl:top-0 xl:h-screen xl:translate-x-0`}><div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600"><PackageCheck /></div><div><b className="text-white">Med AI NexSure</b><p className="text-xs text-sky-300">Enterprise Intelligence</p></div></div><button className="xl:hidden" onClick={onClose} aria-label="Close navigation"><X /></button></div>{links.map(([href, label]) => <Link key={href} href={href} className={`mb-1 flex rounded-lg px-3 py-2.5 text-sm font-bold ${label === "Patient Claims" ? "border border-white/15 bg-white/10 text-white" : "hover:bg-white/10"}`}>{label}</Link>)}</aside>{open ? <button className="fixed inset-0 z-30 bg-slate-950/40 xl:hidden" aria-label="Close navigation overlay" onClick={onClose} /> : null}</>;
}

function PageHeader({ onToast }: { onToast: (message: string) => void }) {
  return <section className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><h1 className="text-2xl font-black text-blue-950 md:text-3xl">Patient Claims</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">ประวัติเคลม สถานะความพร้อม เอกสารประกอบ และการติดตามผลของผู้ป่วย</p></div><div className="flex flex-wrap gap-2"><button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black" onClick={() => onToast("Export summary will use the reporting API when available.")}><Download size={16} className="mr-1 inline" />Export Summary</button><button className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-black text-blue-900" onClick={() => onToast("Evidence package workflow prepared for this patient.")}><FilePlus2 size={16} className="mr-1 inline" />Create Evidence Package</button><button className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-black text-white" onClick={() => onToast("New Claim form opened for PT-000124.")}><Plus size={16} className="mr-1 inline" />New Claim</button><button className="rounded-lg border border-slate-200 bg-white p-2" aria-label="More claim actions" onClick={() => onToast("More claim actions will be available after workflow integration.")}><MoreHorizontal size={18} /></button></div></section>;
}

function PatientContextCard({ patient }: Pick<PatientClaimsDashboardData, "patient">) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="patient-context-title"><div className="flex flex-wrap items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-lg font-black text-blue-900">{patient.initials}</div><div className="min-w-52"><h2 id="patient-context-title" className="text-lg font-black">{patient.fullName}</h2><p className="text-xs text-slate-500">{patient.hn} · {patient.patientId} · {patient.active ? "Active Patient" : "Inactive Patient"}</p></div><div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Date of Birth", `${formatClaimDate(patient.dateOfBirth)} · ${patient.age} years`], ["Gender", patient.gender], ["Primary Payer", patient.primaryPayer], ["Policy Number", maskPolicyNumber(patient.policyNumber)], ["PDPA Consent", patient.pdpaConsentStatus === "active" ? "Active · Verified" : "Review Required"]].map(([label, value]) => <div key={label}><div className="text-[10px] font-black uppercase text-slate-500">{label}</div><div className={label === "PDPA Consent" ? "font-bold text-emerald-700" : "font-bold"}>{value}</div></div>)}</div>{patient.clinicalAlerts.map((alert) => <span key={alert} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-800"><AlertTriangle size={14} />{alert}</span>)}</div></section>;
}

function Card({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="text-base font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div>{action}</div>{children}</section>;
}

function ProgressBar({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return <div><div className="mb-1 flex justify-between gap-3 text-xs font-bold"><span>{label}</span><span>{suffix}</span></div><div className="h-2 rounded-full bg-slate-100" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full bg-blue-700" style={{ width: `${value}%` }} /></div></div>;
}

function ClaimToolbar({ filters, payers, onChange, onClear }: { filters: PatientClaimsFilters; payers: string[]; onChange: (next: Partial<PatientClaimsFilters>) => void; onClear: () => void }) {
  return <div className="flex flex-wrap items-end gap-2 p-4"><label className="grid min-w-64 flex-1 gap-1 text-xs font-black text-slate-600">Search claims<div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400" value={filters.query} onChange={(event) => onChange({ query: event.target.value })} placeholder="Claim, visit, diagnosis, ICD, payer..." /></div></label><FilterSelect label="Status" icon={SlidersHorizontal} value={filters.status} onChange={(value) => onChange({ status: value as PatientClaimsFilters["status"] })} options={[["all", "All Status"], ...Object.entries(CLAIM_STATUS_CONFIG).map(([key, config]) => [key, config.label] satisfies [string, string])]} /><FilterSelect label="Payer" icon={Landmark} value={filters.payer} onChange={(value) => onChange({ payer: value })} options={[["all", "All Payers"], ...payers.map((payer) => [payer, payer] satisfies [string, string])]} /><FilterSelect label="Risk" icon={ShieldAlert} value={filters.risk} onChange={(value) => onChange({ risk: value as ClaimRiskLevel | "all" })} options={[["all", "All Risk"], ...Object.entries(CLAIM_RISK_CONFIG).map(([key, config]) => [key, config.label] satisfies [string, string])]} /><label className="grid gap-1 text-xs font-black text-slate-600">From<input type="date" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={filters.dateFrom ?? ""} onChange={(event) => onChange({ dateFrom: event.target.value || undefined })} /></label><label className="grid gap-1 text-xs font-black text-slate-600">To<input type="date" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={filters.dateTo ?? ""} onChange={(event) => onChange({ dateTo: event.target.value || undefined })} /></label><button className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black" onClick={onClear}>Clear</button><button className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black" onClick={() => undefined} aria-label="Table view"><List size={16} /></button></div>;
}

function FilterSelect({ label, icon: Icon, value, options, onChange }: { label: string; icon: typeof Search; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-xs font-black text-slate-600">{label}<span className="relative"><Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><select className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([key, optionLabel]) => <option key={key} value={key}>{optionLabel}</option>)}</select></span></label>;
}

function ClaimTable({ claims, onOpen }: { claims: PatientClaim[]; onOpen: (claim: PatientClaim, trigger: HTMLButtonElement) => void }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="p-3">Claim / Visit</th><th>Service Date</th><th>Payer / Plan</th><th>Diagnosis</th><th>Claim Amount</th><th>Readiness</th><th>Status</th><th>Risk</th><th>TAT</th><th>Actions</th></tr></thead><tbody>{claims.map((claim) => <tr key={claim.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-3"><b className="text-blue-900">{claim.claimNumber}</b><p className="text-xs text-slate-500">{claim.visitNumber} · OPD</p></td><td>{formatClaimDate(claim.serviceDate)}<p className="text-xs text-slate-500">{claim.department}</p></td><td><b>{claim.payerName}</b><p className="text-xs text-slate-500">{claim.planName}</p></td><td>{claim.diagnosisName}<p className="text-xs text-slate-500">{claim.icdCode}</p></td><td><b>{formatClaimCurrency(claim.claimedAmount)}</b><p className="text-xs text-slate-500">{claim.approvedAmount ? `Approved ${formatClaimCurrency(claim.approvedAmount)}` : claim.expectedAmountMin ? `Expected ${formatClaimCurrency(claim.expectedAmountMin)}-${formatClaimCurrency(claim.expectedAmountMax ?? claim.expectedAmountMin)}` : "Within benchmark"}</p></td><td><ProgressBar label={`${claim.claimNumber} readiness`} value={claim.readinessScore} suffix={String(claim.readinessScore)} /></td><td><ClaimStateBadges claim={claim} /></td><td><RiskBadge risk={claim.riskLevel} /></td><td>{claim.tatDays ? `${claim.tatDays} days` : "-"}<p className={`text-xs ${claim.tatDays && claim.tatTargetDays && claim.tatDays > claim.tatTargetDays ? "text-red-700" : "text-slate-500"}`}>{claim.tatTargetDays ? `Target ${claim.tatTargetDays} days` : "Not submitted"}</p></td><td><button className="rounded-lg border border-slate-200 p-2 text-blue-800" aria-label={`View claim detail ${claim.claimNumber}`} onClick={(event) => onOpen(claim, event.currentTarget)}><Eye size={16} /></button></td></tr>)}</tbody></table></div>;
}

function ClaimStateBadges({ claim }: { claim: PatientClaim }) {
  if (!isCanonicalPatientClaim(claim)) {
    return <StatusBadge status={claim.claimStatus} />;
  }

  if (!claim.canonicalStateSupported) {
    return <Badge tone="danger" icon={AlertTriangle}>Unsupported state · Refresh required</Badge>;
  }

  const unknownStatusConfig = {
    label: "Unknown",
    tone: "neutral",
  } as const;

  const workflow =
    claim.workflowStatus === "unknown"
      ? unknownStatusConfig
      : CLAIM_WORKFLOW_STATUS_CONFIG[claim.workflowStatus];

  const decision =
    claim.decisionStatus === "unknown"
      ? unknownStatusConfig
      : CLAIM_DECISION_STATUS_CONFIG[claim.decisionStatus];

  const payment =
    claim.paymentStatus === "unknown"
      ? unknownStatusConfig
      : CLAIM_PAYMENT_STATUS_CONFIG[claim.paymentStatus];

  return (
    <div className="flex min-w-44 flex-col items-start gap-1">
      <Badge tone={workflow.tone} icon={History}>Workflow · {workflow.label}</Badge>
      <Badge tone={decision.tone} icon={ShieldCheck}>Decision · {decision.label}</Badge>
      <Badge tone={payment.tone} icon={Landmark}>Payment · {payment.label}</Badge>
    </div>
  );
}

function StatusBadge({ status }: { status: ClaimStatus }) {
  const config = CLAIM_STATUS_CONFIG[status];
  return <Badge tone={config.tone} icon={config.icon}>{config.label}</Badge>;
}

function RiskBadge({ risk }: { risk: ClaimRiskLevel }) {
  const config = CLAIM_RISK_CONFIG[risk];
  return <Badge tone={config.tone} icon={config.icon}>{config.label}</Badge>;
}

function Badge({ tone, icon: Icon, children }: { tone: string; icon: typeof Search; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black ${toneClass[tone as keyof typeof toneClass] ?? toneClass.neutral}`}><Icon size={12} aria-hidden="true" />{children}</span>;
}

function ActivityTimeline({ activities }: Pick<PatientClaimsDashboardData, "activities">) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex justify-between gap-3"><div><h2 className="text-base font-black">Recent Claim Activity</h2><p className="mt-1 text-xs text-slate-500">Audit-ready timeline of claim-related actions</p></div><Link className="text-xs font-black text-blue-800" href="/audit-compliance">View Audit Log</Link></div><div className="space-y-3">{activities.map((item) => <article key={item.id} className="grid grid-cols-[32px_1fr_auto] gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-800"><History size={15} /></span><div><h3 className="text-sm font-black">{item.title}</h3><p className="text-xs leading-5 text-slate-500">{item.actor} · {item.relatedClaim ?? "No claim"} {item.relatedDocument ? `· ${item.relatedDocument}` : ""} {item.aiConfidence ? `· Confidence ${item.aiConfidence}%` : ""}</p></div><time className="text-xs text-slate-400">{formatClaimDate(item.timestamp.slice(0, 10))}</time></article>)}</div></section>;
}

function PayerRulesCard({ data }: { data: PatientClaimsDashboardData }) {
  const rules = data.payerRules;
  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-base font-black">Primary Payer Rules</h2><p className="mt-1 text-xs text-slate-500">Active rule set for this patient&apos;s policy</p>{!rules ? <EmptyState title="Payer rules unavailable" text="ยังไม่พบกฎผู้ชำระเงินสำหรับกรมธรรม์นี้" /> : <div className="mt-3 rounded-lg border border-slate-200 p-3"><div className="grid h-9 w-12 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-xs font-black text-blue-900">AIA</div><h3 className="mt-3 font-black">{rules.payerName} · {rules.planName}</h3><p className="text-xs text-slate-500">Policy {maskPolicyNumber(rules.policyNumber)} · Active from {formatClaimDate(rules.policyActiveDate)}</p>{[["Required evidence", `${rules.requiredEvidenceCount} items`], ["OPD benefit limit", formatClaimCurrency(rules.opdBenefitLimit)], ["Referral requirement", rules.referralRequirement], ["Auto-submit threshold", `Readiness >= ${rules.autoSubmitThreshold}`], ["Last updated", formatClaimDate(rules.lastUpdatedAt.slice(0, 10))]].map(([key, value]) => <div key={key} className="flex justify-between gap-3 border-t border-dashed border-slate-200 py-2 text-sm"><span className="text-slate-500">{key}</span><b className="text-right">{value}</b></div>)}<div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-950"><ShieldCheck className="mr-1 inline h-4 w-4" />Coverage indicators are advisory and must be verified against the latest policy terms.</div></div>}</section>;
}

function ClaimDetailSheet({ claim, loading, error, onClose, onToast }: { claim: ClaimDetail | null; loading: boolean; error: string; onClose: () => void; onToast: (message: string) => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" role="dialog" aria-modal="true" aria-labelledby="claim-detail-title" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}><button className="absolute inset-0 cursor-default" aria-label="Close claim detail overlay" onClick={onClose} /><aside className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl"><div className="flex items-start gap-3 border-b border-slate-200 p-4"><FilePlus2 className="text-blue-700" /><div className="min-w-0 flex-1"><h2 id="claim-detail-title" className="text-lg font-black">{claim?.claimNumber ?? "Claim Detail"}</h2><p className="text-xs text-slate-500">Patient claim review and evidence summary</p></div><button className="rounded-lg border border-slate-200 p-2" aria-label="Close claim detail" onClick={onClose}><X size={18} /></button></div><div className="min-h-0 flex-1 overflow-auto p-4">{loading ? <EmptyState title="Loading claim detail" text="กำลังโหลดรายละเอียดเคลม" /> : error ? <EmptyState title="Claim detail unavailable" text={error} /> : claim ? <><div className="rounded-lg bg-blue-950 p-5 text-white"><span className="text-xs text-blue-200">Claimed Amount</span><div className="mt-1 text-3xl font-black">{formatClaimCurrency(claim.claimedAmount)}</div><div className="mt-3"><ClaimStateBadges claim={claim} /></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{[["Related Visit", claim.visitNumber], ["Service Date", formatClaimDate(claim.serviceDate)], ["Payer", claim.payerName], ["Claim Type", claim.claimType ?? "OPD Reimbursement"], ["Diagnosis", `${claim.icdCode} · ${claim.diagnosisName}`], ["Economic Status", claim.economicStatus ?? "Review Needed"]].map(([key, value]) => <div key={key} className="rounded-lg border border-slate-200 p-3"><div className="text-xs font-black text-slate-500">{key}</div><b>{value}</b></div>)}</div><h3 className="mt-5 font-black">Evidence Checklist</h3><div className="mt-2 space-y-2">{claim.evidenceChecklist.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"><span className={item.status === "complete" ? "text-emerald-700" : item.status === "missing" ? "text-red-700" : "text-amber-700"}>{item.status === "complete" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</span><span>{item.label}</span><span className="ml-auto text-xs font-bold text-slate-500">{item.status.replace("_", " ")}</span></div>)}</div><div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-950"><Sparkles className="mr-1 inline h-4 w-4" /><b>AI Recommendation:</b> {claim.aiRecommendation}</div></> : <EmptyState title="Claim detail unavailable" text="ไม่พบรายละเอียดเคลม" />}</div><div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4"><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-black" onClick={() => onToast("Evidence package opened for human review.")}>Open Evidence Package</button><button className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-black text-white" onClick={() => onToast("Claim review workflow started. No decision has been made automatically.")}>Review Claim</button></div></aside></div>;
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <div className="m-4 rounded-lg border border-dashed border-slate-300 p-8 text-center"><UserRound className="mx-auto h-8 w-8 text-blue-700" /><b className="mt-2 block">{title}</b><p className="mt-1 text-sm text-slate-500">{text}</p>{action}</div>;
}

function buildChips(filters: PatientClaimsFilters): { key: keyof PatientClaimsFilters; label: string }[] {
  const chips: { key: keyof PatientClaimsFilters; label: string }[] = [];
  if (filters.query) chips.push({ key: "query", label: `Search: ${filters.query}` });
  if (filters.status !== "all") chips.push({ key: "status", label: CLAIM_STATUS_CONFIG[filters.status].label });
  if (filters.payer !== "all") chips.push({ key: "payer", label: `Payer: ${filters.payer}` });
  if (filters.risk !== "all") chips.push({ key: "risk", label: CLAIM_RISK_CONFIG[filters.risk].label });
  if (filters.dateFrom) chips.push({ key: "dateFrom", label: `From: ${filters.dateFrom}` });
  if (filters.dateTo) chips.push({ key: "dateTo", label: `To: ${filters.dateTo}` });
  return chips;
}

function actionLabel(action: MissingEvidenceActionType) {
  if (action === "upload") return "Upload";
  if (action === "assign") return "Assign";
  return "Review";
}

function evidenceActionMessage(action: MissingEvidenceActionType) {
  if (action === "upload") return "Upload workflow opened. Audit payload prepared.";
  if (action === "assign") return "Reviewer assignment prepared.";
  return "Evidence review opened for human validation.";
}
