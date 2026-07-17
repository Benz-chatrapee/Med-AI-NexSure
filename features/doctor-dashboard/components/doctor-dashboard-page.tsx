"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  CheckCircle2,
  Download,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDoctorDashboardFilters } from "../hooks/use-doctor-dashboard-filters";
import { manualOverrideSchema, type ManualOverrideFormValues } from "../schemas/manual-override.schema";
import { doctorDashboardService } from "../services/doctor-dashboard-service";
import type {
  DoctorDashboardData,
  DoctorDashboardFilters,
  DoctorKpi,
  DoctorWorklistVisit,
  ReadinessStatus,
  RiskLevel,
  StatusTone,
  VisitReadinessDetail,
  VisitStatus,
} from "../types/doctor-dashboard.types";
import {
  canSendToClaimReview,
  clampScore,
  formatDuration,
  getKpiFilter,
  getPointsToReady,
  getReadinessTone,
  riskTone,
  toPercent,
} from "../utils/doctor-dashboard.utils";

const statusColors: Record<StatusTone, string> = {
  success: "border-[color:color-mix(in_srgb,var(--doctor-success)_24%,white)] bg-[color:color-mix(in_srgb,var(--doctor-success)_10%,white)] text-[var(--doctor-success)]",
  warning: "border-[color:color-mix(in_srgb,var(--doctor-warning)_28%,white)] bg-[color:color-mix(in_srgb,var(--doctor-warning)_10%,white)] text-[var(--doctor-warning)]",
  danger: "border-[color:color-mix(in_srgb,var(--doctor-danger)_24%,white)] bg-[color:color-mix(in_srgb,var(--doctor-danger)_9%,white)] text-[var(--doctor-danger)]",
  info: "border-[var(--doctor-blue-border)] bg-[var(--doctor-soft-blue)] text-[var(--doctor-info)]",
};

const chartColors = {
  blue: "var(--doctor-ai-blue)",
  navy: "var(--doctor-primary)",
  sky: "var(--doctor-accent-sky)",
  success: "var(--doctor-success)",
  warning: "var(--doctor-warning)",
  danger: "var(--doctor-danger)",
  muted: "var(--doctor-muted)",
  border: "var(--doctor-border)",
};

const visitStatuses: VisitStatus[] = [
  "Waiting",
  "In Consultation",
  "Pharmacy",
  "Pending Evidence",
  "Ready for Human Review",
  "Completed",
];
const readinessStatuses: ReadinessStatus[] = ["Ready for Human Review", "Needs Review", "Not Ready"];
const riskLevels: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const priorityLevels = ["Low", "Medium", "High", "Critical"] as const;

function chartPayload<T>(item: unknown): T | null {
  if (typeof item !== "object" || item === null || !("payload" in item)) return null;
  return (item as { payload?: T }).payload ?? null;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const hourLabels = ["08", "10", "12", "14", "16", "18"] as const;
const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"] as const;
const impactLabels = ["Minimal", "Minor", "Moderate", "Major", "Severe"] as const;

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatBaht(value: number) {
  return `฿${value.toLocaleString("en-US")}`;
}

function riskScoreTone(score: number): StatusTone {
  if (score >= 18) return "danger";
  if (score >= 10) return "warning";
  return score >= 5 ? "info" : "success";
}

export function DoctorDashboardPage({ initialData }: { initialData: DoctorDashboardData }) {
  const [data, setData] = useState(initialData);
  const [selectedDetail, setSelectedDetail] = useState<VisitReadinessDetail>(initialData.selectedVisit);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isOverridePending, setIsOverridePending] = useState(false);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("gaps");
  const [trendRange, setTrendRange] = useState<7 | 14>(7);
  const [visibleCount, setVisibleCount] = useState(6);

  const { filters, filteredVisits, updateFilters, clearFilters, clearFilter } =
    useDoctorDashboardFilters(data.visits);

  const visibleVisits = filteredVisits.slice(0, visibleCount);
  const selectedVisit = selectedDetail.visit;
  const handoffAllowed = canSendToClaimReview(selectedVisit);
  const remainingActions = selectedVisit.blockingGapCount;

  const trendData = useMemo(() => {
    if (trendRange === 7) return data.readinessTrend;
    const prefix = data.readinessTrend.map((item, index) => ({
      ...item,
      date: `${index + 1} Jul`,
      actual: Math.max(55, item.actual - 4),
      previous: Math.max(52, item.previous - 3),
    }));
    return [...prefix, ...data.readinessTrend];
  }, [data.readinessTrend, trendRange]);

  const visitVolumeHeatmap = useMemo(() => {
    const base = data.workflow.reduce((total, item) => total + item.count, 0);
    return dayLabels.flatMap((day, dayIndex) =>
      hourLabels.map((hour, hourIndex) => {
        const dayWeight = [0.9, 1.05, 1.18, 1.1, 0.96, 0.62, 0.48][dayIndex] ?? 1;
        const hourWeight = [0.72, 1.18, 1.05, 0.88, 0.98, 0.56][hourIndex] ?? 1;
        return {
          day,
          hour,
          count: Math.max(1, Math.round((base / 16) * dayWeight * hourWeight)),
        };
      }),
    );
  }, [data.workflow]);

  const visitCostTrend = useMemo(() => data.timeToReadiness.map((item, index) => ({
    date: item.date,
    actual: 2840 + Math.round((item.minutes - item.targetMinutes) * 5.5) + index * 18,
    benchmark: 2820 + index * 10,
  })), [data.timeToReadiness]);

  const costVarianceBridge = useMemo(() => [
    { label: "Benchmark", value: 2820, start: 0, end: 2820, tone: "base" },
    { label: "Labs", value: 280, start: 2820, end: 3100, tone: "increase" },
    { label: "Medication", value: 180, start: 3100, end: 3280, tone: "increase" },
    { label: "Imaging", value: 120, start: 3280, end: 3400, tone: "increase" },
    { label: "Discount", value: -90, start: 3310, end: 3400, tone: "decrease" },
    { label: "Actual", value: 3310, start: 0, end: 3310, tone: "base" },
  ], []);

  const economicAlerts = useMemo(() => [
    { label: "Cost justification missing", count: data.visits.filter((visit) => visit.primaryGap === "Cost Justification").length + 3, impact: 182000 },
    { label: "High-cost imaging review", count: data.visits.filter((visit) => visit.primaryGap === "Imaging Report").length + 2, impact: 146000 },
    { label: "Medication above benchmark", count: 4, impact: 121000 },
    { label: "Payer exception exposure", count: data.visits.filter((visit) => visit.riskLevel === "High").length + 1, impact: 88000 },
  ], [data.visits]);

  const riskMatrix = useMemo(() => impactLabels.flatMap((impact, impactIndex) =>
    likelihoodLabels.map((likelihood, likelihoodIndex) => {
      const score = (impactIndex + 1) * (likelihoodIndex + 1);
      const cases = data.visits.filter((visit, visitIndex) => {
        const riskWeight = visit.riskLevel === "Critical" ? 5 : visit.riskLevel === "High" ? 4 : visit.riskLevel === "Medium" ? 3 : 2;
        return Math.abs(riskWeight - (impactIndex + 1)) <= 1 && (visitIndex + likelihoodIndex + impactIndex) % 3 === 0;
      }).length;
      return { impact, likelihood, score, cases, tone: riskScoreTone(score) };
    }),
  ), [data.visits]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function refreshDashboard() {
    setIsRefreshing(true);
    try {
      const refreshed = await doctorDashboardService.getDashboard(filters);
      setData((current) => ({ ...current, lastUpdated: refreshed.lastUpdated }));
      showToast("Dashboard refreshed using approved source projections.");
    } catch {
      showToast("Refresh failed. กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function selectVisit(visit: DoctorWorklistVisit) {
    const detail = await doctorDashboardService.getVisitReadiness(visit.id);
    setSelectedDetail(detail);
    setActiveTab("gaps");
    document.getElementById("selected-visit-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function reevaluateVisit() {
    setIsReevaluating(true);
    try {
      const detail = await doctorDashboardService.reevaluateVisit(selectedVisit.id);
      setSelectedDetail(detail);
      showToast("Readiness re-evaluated and audit activity recorded.");
    } catch {
      showToast("Re-evaluation failed. กรุณาตรวจสอบอีกครั้ง");
    } finally {
      setIsReevaluating(false);
    }
  }

  async function exportSummary() {
    const result = await doctorDashboardService.exportDashboard(filters);
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("CSV summary exported from currently visible mock data.");
  }

  async function sendToClaimReview() {
    if (!handoffAllowed) return;
    await doctorDashboardService.sendToClaimReview(selectedVisit.id);
    showToast("Visit sent to Claim Review Queue for authorized human verification.");
  }

  return (
    <main className="doctor-dashboard-theme min-w-0 flex-1 overflow-x-hidden bg-[var(--doctor-bg)] text-[var(--doctor-text)]">
      <div className="w-full max-w-none space-y-5 px-4 pb-28 pt-4 lg:px-6 xl:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b border-[var(--doctor-border)] bg-[color-mix(in_srgb,var(--doctor-card)_96%,transparent)] px-4 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--doctor-ai-blue)]">Doctor Workspace / Operational Intelligence</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--doctor-text)] md:text-4xl">Doctor Operational & Claim Readiness Dashboard</h1>
              <p className="mt-2 w-full text-sm leading-6 text-[var(--doctor-muted)]">
                Monitor today&apos;s clinical workload, resolve documentation gaps, and prepare visits for authorized human claim review.
                <span className="block">ติดตามงานประจำวัน แก้ไขข้อมูลที่ไม่ครบถ้วน และเตรียมเคสสำหรับการตรวจสอบโดยผู้มีอำนาจ</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[var(--doctor-muted)]">Last updated: {data.lastUpdated}</span>
              <Button onClick={refreshDashboard} disabled={isRefreshing} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-card)] px-3 text-sm font-black text-[var(--doctor-primary)]">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button onClick={exportSummary} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--doctor-primary)] px-3 text-sm font-black text-white">
                <Download className="h-4 w-4" /> Export Summary
              </Button>
            </div>
          </div>
        </header>

        <section role="status" className="flex gap-3 rounded-lg border border-[var(--doctor-blue-border)] border-l-4 border-l-[var(--doctor-ai-blue)] bg-[var(--doctor-soft-blue)] p-4 text-[var(--doctor-primary)]">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          <div className="text-sm leading-6">
            <strong>Human decision required.</strong> AI provides decision support only. The system does not approve, reject, or submit claims automatically.
            <span className="block">AI ช่วยวิเคราะห์และแนะนำเท่านั้น ผู้มีอำนาจต้องเป็นผู้ตรวจสอบและตัดสินใจทุกครั้ง</span>
          </div>
        </section>

        <FilterBar filters={filters} updateFilters={updateFilters} />

        <section aria-label="Doctor dashboard KPIs" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-6">
          {data.kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              onClick={() => {
                if (kpi.id === "today-visits") clearFilters();
                else if (kpi.id === "avg-readiness-time") document.getElementById("time-to-readiness")?.scrollIntoView({ behavior: "smooth" });
                else updateFilters(getKpiFilter(kpi));
              }}
            />
          ))}
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-12">
          <VisitVolumeHeatmap data={visitVolumeHeatmap} onReset={() => clearFilter("visitStatus")} />
          <ClaimReadinessDonut data={data.readinessMix} onSelect={(status) => updateFilters({ readinessStatus: status })} />
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-12">
          <ReadinessTrendChart trendData={trendData} trendRange={trendRange} setTrendRange={setTrendRange} />
          <MissingEvidencePareto data={data.missingEvidence} onSelect={(gapType) => updateFilters({ gapType })} />
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-12">
          <RiskMatrixHeatmap matrix={riskMatrix} />
          <VisitCostTrend data={visitCostTrend} />
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-12">
          <CostVarianceWaterfall data={costVarianceBridge} />
          <EconomicAlertsBar data={economicAlerts} />
        </section>

        <CaseQueueCompact
          visits={visibleVisits}
          selectedVisitId={selectedVisit.id}
          total={filteredVisits.length}
          onSelectVisit={(visit) => void selectVisit(visit)}
        />

        <Worklist
          filters={filters}
          visits={visibleVisits}
          total={filteredVisits.length}
          selectedVisitId={selectedVisit.id}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          clearFilter={clearFilter}
          onSelectVisit={(visit) => void selectVisit(visit)}
          onShowMore={() => setVisibleCount((current) => current + 6)}
          canShowMore={filteredVisits.length > visibleCount}
        />

        <section id="selected-visit-review" className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] shadow-[var(--doctor-shadow)]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--doctor-border)] bg-[var(--doctor-bg)] p-4">
            <div className="min-w-64 flex-1">
              <h2 className="text-xl font-black text-[var(--doctor-text)]">{selectedVisit.patientName}</h2>
              <p className="text-sm text-[var(--doctor-muted)]">
                HN {selectedVisit.hn} · {selectedVisit.gender} · {selectedVisit.age} years · {selectedVisit.encounterType} · Visit {selectedVisit.id} · {selectedVisit.doctor} · {selectedVisit.department}
              </p>
            </div>
            <Badge tone="info">Payer: {selectedVisit.payerName}</Badge>
            <Badge tone="info">Diagnosis: {selectedVisit.diagnosisCode}</Badge>
            <Badge tone="success">Confidence: {selectedVisit.confidencePercent}%</Badge>
          </div>

          <div className="grid min-w-0 gap-4 p-4 xl:grid-cols-12">
            <div className="min-w-0 space-y-4 xl:col-span-8">
              <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <ReadinessScorePanel detail={selectedDetail} onReevaluate={reevaluateVisit} isPending={isReevaluating} />
                <ReadinessBreakdown detail={selectedDetail} />
              </section>
              <ScoreChange detail={selectedDetail} />
              <ReviewTabs detail={selectedDetail} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <aside className="space-y-4 xl:col-span-4">
              <HumanReviewGate
                visit={selectedVisit}
                onOverride={() => setIsOverrideOpen(true)}
                onAssignReviewer={async () => {
                  await doctorDashboardService.assignReviewer(selectedVisit.id, "reviewer-001");
                  showToast("Reviewer assignment workflow recorded.");
                }}
                onSend={sendToClaimReview}
              />
              <Recommendation detail={selectedDetail} />
              <AuditActivity events={selectedDetail.auditTrail} onExport={exportSummary} />
            </aside>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-card)] p-3 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <strong>{remainingActions} readiness actions remain</strong>
              <p className="text-sm text-[var(--doctor-muted)]">แก้ไขข้อมูลจากแหล่งจริงเท่านั้น ระบบจะบันทึกทุกการเปลี่ยนแปลง</p>
              {!handoffAllowed && <p className="text-xs font-bold text-[var(--doctor-danger)]">Handoff blocked: required gaps remain or readiness status is not ready for human review.</p>}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button onClick={() => showToast("Draft saved with audit context.")} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-4 py-2 font-black text-[var(--doctor-primary)]">Save Draft</Button>
              <a href={`/visits/${selectedVisit.id}/prescription`} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-4 py-2 text-center font-black text-[var(--doctor-primary)]">Open Visit Detail</a>
              <Button disabled={!handoffAllowed} onClick={sendToClaimReview} className="rounded-lg bg-[var(--doctor-primary)] px-4 py-2 font-black text-white disabled:opacity-50">Send to Claim Review Queue</Button>
            </div>
          </div>
        </div>
      </div>

      {isOverrideOpen && (
        <ManualOverrideDialog
          isPending={isOverridePending}
          onClose={() => setIsOverrideOpen(false)}
          onSubmit={async (input) => {
            setIsOverridePending(true);
            try {
              await doctorDashboardService.submitManualOverride(selectedVisit.id, input);
              showToast("Override request submitted and added to audit log.");
              setIsOverrideOpen(false);
            } finally {
              setIsOverridePending(false);
            }
          }}
        />
      )}
      <div aria-live="polite" className={`fixed right-5 top-5 z-50 rounded-lg bg-[var(--doctor-primary)] px-4 py-3 text-sm font-bold text-white shadow-lg transition ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}>{toast}</div>
    </main>
  );
}

function FilterBar({ filters, updateFilters }: { filters: DoctorDashboardFilters; updateFilters: (patch: Partial<DoctorDashboardFilters>) => void }) {
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4 shadow-[var(--doctor-shadow)] md:grid-cols-2 xl:grid-cols-5">
      <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-[var(--doctor-muted)]">Date range
        <select value={filters.dateRange} onChange={(event) => updateFilters({ dateRange: event.target.value as DoctorDashboardFilters["dateRange"] })} className="min-h-10 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-3 text-sm normal-case text-[var(--doctor-text)]">
          <option value="today">Today</option><option value="7d">Last 7 days</option><option value="14d">Last 14 days</option>
        </select>
      </label>
      {(["clinic", "department", "doctor"] as const).map((key) => (
        <label key={key} className="grid gap-1 text-xs font-black uppercase tracking-wide text-[var(--doctor-muted)]">{key}
          <select value={filters[key]} onChange={(event) => updateFilters({ [key]: event.target.value })} className="min-h-10 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-3 text-sm normal-case text-[var(--doctor-text)]">
            <option>{filters[key]}</option>
            <option>All {key}s</option>
          </select>
        </label>
      ))}
      <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-[var(--doctor-muted)]">Global search
        <Input value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Patient, HN, Visit ID, payer, diagnosis" className="min-h-10 rounded-lg border border-[var(--doctor-border)] px-3 text-sm normal-case" />
      </label>
    </section>
  );
}

function ChartMeta({ insight, units, lastUpdated }: { insight: string; units: string; lastUpdated: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--doctor-border)] pt-3 text-xs text-[var(--doctor-muted)]">
      <span><strong className="text-[var(--doctor-text)]">Insight:</strong> {insight}</span>
      <span>{units} · Last updated {lastUpdated}</span>
    </div>
  );
}

function VisitVolumeHeatmap({ data, onReset }: { data: Array<{ day: string; hour: string; count: number }>; onReset: () => void }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <ChartCard title="Visit Volume" subtitle="Day x hour demand heatmap based on current workflow volume." className="xl:col-span-7">
      <div className="overflow-x-auto">
        <div className="grid min-w-[620px] grid-cols-[70px_repeat(6,minmax(72px,1fr))] gap-2 text-center text-xs">
          <div />
          {hourLabels.map((hour) => <div key={hour} className="font-black text-[var(--doctor-muted)]">{hour}:00</div>)}
          {dayLabels.map((day) => (
            <div key={day} className="contents">
              <div className="grid place-items-center rounded-lg bg-[var(--doctor-bg)] px-2 font-black text-[var(--doctor-muted)]">{day}</div>
              {hourLabels.map((hour) => {
                const cell = data.find((item) => item.day === day && item.hour === hour);
                const count = cell?.count ?? 0;
                const intensity = Math.max(0.16, count / max);
                return (
                  <button key={`${day}-${hour}`} type="button" onClick={onReset} aria-label={`${day} ${hour}:00 visit volume ${count} visits`} className="min-h-14 rounded-lg border border-white/80 px-2 py-2 font-black text-[var(--doctor-primary)] transition hover:ring-2 hover:ring-[var(--doctor-ai-blue)]" style={{ background: `color-mix(in srgb, var(--doctor-ai-blue) ${Math.round(intensity * 72)}%, white)` }}>
                    {count}<span className="block text-[10px] font-bold opacity-75">visits</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--doctor-muted)]"><span>Low</span><span className="h-2 w-16 rounded-full bg-[color-mix(in_srgb,var(--doctor-ai-blue)_22%,white)]" /><span className="h-2 w-16 rounded-full bg-[color-mix(in_srgb,var(--doctor-ai-blue)_52%,white)]" /><span>Peak</span></div>
      <ChartMeta insight="Late morning demand is the likely staffing pressure window. ควรติดตามช่วง 10:00-12:00 เป็นพิเศษ" units="Visits" lastUpdated="10:24" />
    </ChartCard>
  );
}

function ClaimReadinessDonut({ data, onSelect }: { data: Array<{ status: ReadinessStatus; count: number }>; onSelect: (status: ReadinessStatus) => void }) {
  const total = sumValues(data.map((item) => item.count));
  const ready = data.find((item) => item.status === "Ready for Human Review")?.count ?? 0;
  return (
    <ChartCard title="Claim Readiness" subtitle="Ready / Needs Review / Not Ready distribution with human review status." className="xl:col-span-5">
      <div className="grid gap-3 md:grid-cols-[1fr_220px] xl:grid-cols-1 2xl:grid-cols-[1fr_220px]">
        <div className="relative h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" innerRadius={72} outerRadius={108} paddingAngle={2} onClick={(item) => {
                const payload = chartPayload<{ status: ReadinessStatus }>(item);
                if (payload) onSelect(payload.status);
              }}>
                {data.map((item) => (
                  <Cell key={item.status} fill={item.status === "Ready for Human Review" ? chartColors.success : item.status === "Needs Review" ? chartColors.warning : chartColors.danger} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} visits`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div><strong className="block text-3xl text-[var(--doctor-primary)]">{Math.round((ready / total) * 100)}%</strong><span className="text-xs font-bold text-[var(--doctor-muted)]">Ready</span></div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <button key={item.status} onClick={() => onSelect(item.status)} className="flex w-full justify-between rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-2 text-left text-sm hover:bg-[var(--doctor-bg)]">
              <span>{item.status}</span><strong>{item.count} · {Math.round((item.count / total) * 100)}%</strong>
            </button>
          ))}
        </div>
      </div>
      <ChartMeta insight="Needs Review and Not Ready cases remain blocked from autonomous claim submission." units="Visits / %" lastUpdated="10:24" />
    </ChartCard>
  );
}

function ReadinessTrendChart({ trendData, trendRange, setTrendRange }: { trendData: DoctorDashboardData["readinessTrend"]; trendRange: 7 | 14; setTrendRange: (range: 7 | 14) => void }) {
  return (
    <ChartCard title="Readiness Trend" subtitle="Actual readiness vs target line chart with previous-period context." className="xl:col-span-7">
      <div className="mb-3 flex gap-2">
        {[7, 14].map((range) => (
          <button key={range} type="button" aria-pressed={trendRange === range} onClick={() => setTrendRange(range as 7 | 14)} className={`rounded-lg border px-3 py-2 text-sm font-black ${trendRange === range ? "border-[var(--doctor-blue-border)] bg-[var(--doctor-soft-blue)] text-[var(--doctor-primary)]" : "border-[var(--doctor-border)] bg-[var(--doctor-card)] text-[var(--doctor-muted)]"}`}>
            {range} Days
          </button>
        ))}
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid stroke={chartColors.border} />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <ReferenceLine y={85} stroke={chartColors.warning} strokeDasharray="5 5" label="Target" />
            <Line dataKey="actual" name="Actual" stroke={chartColors.blue} strokeWidth={3} dot={{ r: 3 }} />
            <Line dataKey="target" name="Target" stroke={chartColors.success} strokeDasharray="6 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartMeta insight="Actual readiness is improving but still below the 85% target threshold." units="%" lastUpdated="10:24" />
    </ChartCard>
  );
}

function MissingEvidencePareto({ data, onSelect }: { data: DoctorDashboardData["missingEvidence"]; onSelect: (gapType: string) => void }) {
  return (
    <ChartCard title="Missing Evidence" subtitle="Pareto chart ranking evidence gaps by case count and cumulative contribution." className="xl:col-span-5">
      <p className="mb-3 rounded-lg border border-[color:color-mix(in_srgb,var(--doctor-warning)_28%,white)] bg-[color:color-mix(in_srgb,var(--doctor-warning)_10%,white)] p-3 text-sm text-[var(--doctor-warning)]">Top two gaps drive 54% of current readiness blockers. ควรเร่ง SOAP และ Imaging ก่อน</p>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <ComposedChart data={data} layout="vertical" margin={{ left: 62, right: 24 }}>
            <CartesianGrid stroke={chartColors.border} horizontal={false} />
            <XAxis type="number" xAxisId="count" />
            <XAxis type="number" xAxisId="percent" orientation="top" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis dataKey="gapType" type="category" width={126} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, name) => [name === "Cumulative %" ? `${value}%` : `${value} cases`, name]} />
            <Legend />
            <Bar xAxisId="count" dataKey="count" name="Cases" fill={chartColors.blue} radius={[0, 7, 7, 0]} onClick={(item) => {
              const payload = chartPayload<{ gapType: string }>(item);
              if (payload) onSelect(payload.gapType);
            }} />
            <Line xAxisId="percent" dataKey="cumulativePercent" name="Cumulative %" stroke={chartColors.warning} strokeWidth={2.5} />
            <ReferenceLine xAxisId="percent" x={80} stroke={chartColors.danger} strokeDasharray="4 4" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartMeta insight="80/20 reference clarifies which gaps should enter the next review sprint." units="Cases / cumulative %" lastUpdated="10:24" />
    </ChartCard>
  );
}

function RiskMatrixHeatmap({ matrix }: { matrix: Array<{ impact: string; likelihood: string; score: number; cases: number; tone: StatusTone }> }) {
  return (
    <ChartCard title="Claim Risk" subtitle="5x5 likelihood x impact heatmap for review prioritization." className="xl:col-span-5">
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-[100px_repeat(5,minmax(86px,1fr))] gap-2 text-center text-xs">
          <div />
          {likelihoodLabels.map((label) => <div key={label} className="font-black text-[var(--doctor-muted)]">{label}</div>)}
          {[...impactLabels].reverse().map((impact) => (
            <div key={impact} className="contents">
              <div className="grid place-items-center rounded-lg bg-[var(--doctor-bg)] px-2 font-black text-[var(--doctor-muted)]">{impact}</div>
              {likelihoodLabels.map((likelihood) => {
                const cell = matrix.find((item) => item.impact === impact && item.likelihood === likelihood);
                const score = cell?.score ?? 0;
                const cases = cell?.cases ?? 0;
                return <button key={`${impact}-${likelihood}`} className={`min-h-14 rounded-lg border px-2 py-2 font-black ${statusColors[cell?.tone ?? "info"]}`} aria-label={`${likelihood} likelihood and ${impact} impact: risk score ${score}, ${cases} cases`} type="button">{score}<span className="block text-[10px] font-bold">{cases} cases</span></button>;
              })}
            </div>
          ))}
        </div>
      </div>
      <ChartMeta insight="Major and Severe impact cells are visually separated for mandatory human review." units="Risk score / cases" lastUpdated="10:24" />
    </ChartCard>
  );
}

function VisitCostTrend({ data }: { data: Array<{ date: string; actual: number; benchmark: number }> }) {
  return (
    <ChartCard title="Visit Cost" subtitle="Actual average visit cost compared with benchmark." className="xl:col-span-7">
      <div className="h-[320px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke={chartColors.border} />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `฿${value}`} />
            <Tooltip formatter={(value) => formatBaht(Number(value))} />
            <Legend />
            <Line dataKey="actual" name="Actual Cost" stroke={chartColors.blue} strokeWidth={3} />
            <Line dataKey="benchmark" name="Benchmark" stroke={chartColors.success} strokeDasharray="6 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartMeta insight="Actual cost remains above benchmark on higher-readiness delay days." units="THB / visit" lastUpdated="10:24" />
    </ChartCard>
  );
}

function CostVarianceWaterfall({ data }: { data: Array<{ label: string; value: number; start: number; end: number; tone: string }> }) {
  return (
    <ChartCard title="Cost Variance" subtitle="Waterfall bridge from benchmark to actual average visit cost." className="xl:col-span-7">
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke={chartColors.border} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => `฿${value}`} />
            <Tooltip formatter={(value) => Array.isArray(value) ? `${formatBaht(Number(value[0]))} to ${formatBaht(Number(value[1]))}` : formatBaht(Number(value))} />
            <Bar dataKey={(item: { start: number; end: number }) => [item.start, item.end]} name="Variance bridge" radius={[7, 7, 0, 0]}>
              {data.map((item) => <Cell key={item.label} fill={item.tone === "increase" ? chartColors.warning : item.tone === "decrease" ? chartColors.success : chartColors.navy} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartMeta insight="Labs and medication explain the largest positive variance; discounts partially offset cost." units="THB / visit" lastUpdated="10:24" />
    </ChartCard>
  );
}

function EconomicAlertsBar({ data }: { data: Array<{ label: string; count: number; impact: number }> }) {
  return (
    <ChartCard title="Economic Alerts" subtitle="Ranked alerts by case volume and estimated financial exposure." className="xl:col-span-5">
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 96, right: 20 }}>
            <CartesianGrid stroke={chartColors.border} horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, name) => [name === "Exposure" ? formatBaht(Number(value)) : `${value} cases`, name]} />
            <Legend />
            <Bar dataKey="count" name="Cases" fill={chartColors.blue} radius={[0, 7, 7, 0]} />
            <Bar dataKey="impact" name="Exposure" fill={chartColors.warning} radius={[0, 7, 7, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartMeta insight="Cost justification and imaging reviews should be handled first due to exposure." units="Cases / THB" lastUpdated="10:24" />
    </ChartCard>
  );
}

function CaseQueueCompact({ visits, selectedVisitId, total, onSelectVisit }: { visits: DoctorWorklistVisit[]; selectedVisitId: string; total: number; onSelectVisit: (visit: DoctorWorklistVisit) => void }) {
  return (
    <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] shadow-[var(--doctor-shadow)]">
      <div className="flex flex-col gap-1 border-b border-[var(--doctor-border)] p-4 md:flex-row md:items-end md:justify-between">
        <div><h2 className="text-lg font-black text-[var(--doctor-text)]">Case Queue</h2><p className="text-sm text-[var(--doctor-muted)]">Compact operational table for review-required cases. แสดงเคสที่ต้องติดตามก่อน</p></div>
        <span className="text-xs font-bold text-[var(--doctor-muted)]">Showing {visits.length} of {total} · Last updated 10:24</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <caption className="sr-only">Compact case queue with priority, readiness, risk, SLA and next action</caption>
          <thead className="bg-[var(--doctor-bg)] text-xs uppercase tracking-wide text-[var(--doctor-muted)]">
            <tr>{["Priority", "Visit", "Patient", "Readiness", "Risk", "Pending", "Gap", "Next Action", "Action"].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
          </thead>
          <tbody>
            {visits.slice(0, 6).map((visit) => (
              <tr key={visit.id} className={visit.id === selectedVisitId ? "bg-[var(--doctor-soft-blue)]" : "hover:bg-[var(--doctor-bg)]"}>
                <td className="px-3 py-2"><Badge tone={visit.priority === "Critical" ? "danger" : visit.priority === "High" ? "warning" : "info"}>{visit.priority}</Badge></td>
                <td className="px-3 py-2 font-black text-[var(--doctor-primary)]">{visit.id}</td>
                <td className="px-3 py-2">{visit.patientName}<div className="text-xs text-[var(--doctor-muted)]">{visit.hn}</div></td>
                <td className="px-3 py-2"><Badge tone={getReadinessTone(visit.readinessStatus)}>{visit.readinessScore} · {visit.readinessStatus}</Badge></td>
                <td className="px-3 py-2"><Badge tone={riskTone(visit.riskLevel)}>{visit.riskLevel}</Badge></td>
                <td className="px-3 py-2">{formatDuration(visit.pendingMinutes)}</td>
                <td className="px-3 py-2">{visit.primaryGap ?? "None"}</td>
                <td className="px-3 py-2">{visit.nextAction}</td>
                <td className="px-3 py-2"><Button onClick={() => onSelectVisit(visit)} className="rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-card)] px-3 py-2 font-black text-[var(--doctor-primary)]">Review</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function KpiCard({ kpi, onClick }: { kpi: DoctorKpi; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-72 flex-col rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4 text-left shadow-[var(--doctor-shadow)] outline-none transition hover:-translate-y-0.5 hover:shadow-md focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--doctor-ai-blue)_20%,white)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-black text-[var(--doctor-muted)]">{kpi.label}</span>
        <Activity className="h-5 w-5 text-[var(--doctor-ai-blue)]" />
      </div>
      <div className="my-5 text-center text-4xl font-black tracking-tight text-[var(--doctor-primary)]">{kpi.value}</div>
      <div className={`text-sm font-black ${kpi.trendTone === "negative" ? "text-[var(--doctor-danger)]" : kpi.trendTone === "positive" ? "text-[var(--doctor-success)]" : "text-[var(--doctor-muted)]"}`}>{kpi.comparisonLabel}</div>
      <div className="mt-4">
        <div className="flex justify-between text-xs font-bold text-[var(--doctor-muted)]"><span>{kpi.progressLabel}</span><span>{kpi.progressDisplay}</span></div>
        <div role="progressbar" aria-valuenow={kpi.progressValue} aria-valuemin={0} aria-valuemax={kpi.progressMax} className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--doctor-border)]">
          <span className="block h-full rounded-full bg-[var(--doctor-ai-blue)]" style={{ width: `${toPercent(kpi.progressValue, kpi.progressMax)}%` }} />
        </div>
      </div>
      <span className={`mt-auto inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black ${statusColors[kpi.statusTone]}`}>{kpi.statusLabel}</span>
    </button>
  );
}

function ChartCard({ id, title, subtitle, children, className = "" }: { id?: string; title: string; subtitle: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`min-w-0 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4 shadow-[var(--doctor-shadow)] ${className}`}><h2 className="text-lg font-black text-[var(--doctor-text)]">{title}</h2><p className="mb-3 text-sm text-[var(--doctor-muted)]">{subtitle}</p>{children}</section>;
}

function Badge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${statusColors[tone]}`}>{children}</span>;
}

function Worklist(props: {
  filters: DoctorDashboardFilters;
  visits: DoctorWorklistVisit[];
  total: number;
  selectedVisitId: string;
  updateFilters: (patch: Partial<DoctorDashboardFilters>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof DoctorDashboardFilters) => void;
  onSelectVisit: (visit: DoctorWorklistVisit) => void;
  onShowMore: () => void;
  canShowMore: boolean;
}) {
  const activeFilters = Object.entries(props.filters).filter(([key, value]) => Boolean(value) && !["dateRange", "clinic", "department", "doctor"].includes(key));
  return (
    <section id="worklistSection" className="min-w-0 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] shadow-[var(--doctor-shadow)]">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 className="text-xl font-black text-[var(--doctor-text)]">Doctor Action Worklist</h2><p className="text-sm text-[var(--doctor-muted)]">Showing {props.visits.length} of {props.total} visits.</p></div>
        <div className="grid gap-2 md:grid-cols-4">
          <Select label="Readiness" value={props.filters.readinessStatus} options={readinessStatuses} onChange={(value) => props.updateFilters({ readinessStatus: value as DoctorDashboardFilters["readinessStatus"] })} />
          <Select label="Risk" value={props.filters.riskLevel} options={riskLevels} onChange={(value) => props.updateFilters({ riskLevel: value as DoctorDashboardFilters["riskLevel"] })} />
          <Select label="Visit Status" value={props.filters.visitStatus} options={visitStatuses} onChange={(value) => props.updateFilters({ visitStatus: value as DoctorDashboardFilters["visitStatus"] })} />
          <Select label="Priority" value={props.filters.priority} options={priorityLevels} onChange={(value) => props.updateFilters({ priority: value as DoctorDashboardFilters["priority"] })} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {activeFilters.map(([key, value]) => (
          <span key={key} className="inline-flex items-center gap-2 rounded-full border border-[var(--doctor-blue-border)] bg-[var(--doctor-soft-blue)] px-3 py-1 text-xs font-black text-[var(--doctor-primary)]">{key}: {value}<button onClick={() => props.clearFilter(key as keyof DoctorDashboardFilters)} aria-label={`Remove ${key} filter`}><X className="h-3 w-3" /></button></span>
        ))}
        {activeFilters.length > 0 && <button onClick={props.clearFilters} className="text-xs font-black text-[var(--doctor-ai-blue)]">Clear All Filters</button>}
      </div>
      <div className="overflow-x-auto border-t border-[var(--doctor-border)]">
        <table className="min-w-[1500px] w-full border-collapse text-sm">
          <caption className="sr-only">Doctor action worklist with claim readiness and evidence gaps</caption>
          <thead className="bg-[var(--doctor-bg)] text-xs uppercase tracking-wide text-[var(--doctor-muted)]">
            <tr>{["Priority","Patient","HN","Visit ID","Visit Status","Score","Readiness Status","Blocking Gaps","Risk","Time Pending","Payer","Next Action","Action"].map((header) => <th key={header} className="p-3 text-left">{header}</th>)}</tr>
          </thead>
          <tbody>
            {props.visits.map((visit) => (
              <tr key={visit.id} className={visit.id === props.selectedVisitId ? "bg-[var(--doctor-soft-blue)]" : "hover:bg-[var(--doctor-bg)]"}>
                <td className="p-3"><Badge tone={visit.priority === "Critical" ? "danger" : visit.priority === "High" ? "warning" : "info"}>{visit.priority}</Badge></td>
                <td className="p-3 font-black">{visit.patientName}<div className="text-xs font-normal text-[var(--doctor-muted)]">{visit.diagnosisLabel}</div></td>
                <td className="p-3">{visit.hn}</td><td className="p-3 font-bold text-[var(--doctor-primary)]">{visit.id}</td><td className="p-3">{visit.visitStatus}</td>
                <td className="p-3 font-black">{visit.readinessScore}</td><td className="p-3"><Badge tone={getReadinessTone(visit.readinessStatus)}>{visit.readinessStatus}</Badge></td>
                <td className="p-3">{visit.blockingGapCount} · {visit.primaryGap ?? "None"}</td><td className="p-3"><Badge tone={riskTone(visit.riskLevel)}>{visit.riskLevel}</Badge></td>
                <td className="p-3">{formatDuration(visit.pendingMinutes)}</td><td className="p-3">{visit.payerName}</td><td className="p-3">{visit.nextAction}</td>
                <td className="p-3"><Button onClick={() => props.onSelectVisit(visit)} className="rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-card)] px-3 py-2 font-black text-[var(--doctor-primary)]">Review</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {props.total === 0 && <div className="p-10 text-center"><strong>No visits match the current filters.</strong><p className="text-sm text-[var(--doctor-muted)]">ไม่พบ Visit ตามตัวกรองที่เลือก กรุณาปรับตัวกรองหรือกด Clear All Filters</p><button onClick={props.clearFilters} className="mt-3 font-black text-[var(--doctor-ai-blue)]">Clear All Filters</button></div>}
      </div>
      {props.canShowMore && <div className="p-4"><Button onClick={props.onShowMore} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-4 py-2 font-black text-[var(--doctor-primary)]">Show More</Button></div>}
    </section>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-xs font-black uppercase text-[var(--doctor-muted)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-3 text-sm normal-case text-[var(--doctor-text)]"><option value="">All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ReadinessScorePanel({ detail, onReevaluate, isPending }: { detail: VisitReadinessDetail; onReevaluate: () => void; isPending: boolean }) {
  const score = clampScore(detail.visit.readinessScore);
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4 text-center"><div className="mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(${chartColors.blue} ${score}%, var(--doctor-blue-border) 0)` }}><div className="grid h-32 w-32 place-items-center rounded-full bg-[var(--doctor-card)]"><div><strong className="block text-4xl text-[var(--doctor-text)]">{score}</strong><span className="text-xs text-[var(--doctor-muted)]">Readiness Score</span></div></div></div><h3 className="mt-3 text-lg font-black text-[var(--doctor-text)]">{detail.visit.readinessStatus}</h3><Badge tone="info">Human Review Required</Badge><div className="mt-3 h-2 rounded-full bg-[linear-gradient(90deg,var(--doctor-danger),var(--doctor-warning),var(--doctor-success))]" /><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><span>Points to Ready <b>{getPointsToReady(score)}</b></span><span>Blocking Gaps <b>{detail.visit.blockingGapCount}</b></span><span>Change <b>{detail.visit.scoreChange >= 0 ? "+" : ""}{detail.visit.scoreChange}</b></span></div><p className="mt-3 text-xs text-[var(--doctor-muted)]">Version {detail.version} · Evaluated {detail.evaluatedAt} · Source-linked: {detail.sourceLinked ? "Yes" : "No"}</p><Button onClick={onReevaluate} disabled={isPending} className="mt-3 rounded-lg bg-[var(--doctor-primary)] px-3 py-2 font-black text-white disabled:opacity-50">{isPending ? "Re-evaluating..." : "Re-evaluate"}</Button></section>;
}

function ReadinessBreakdown({ detail }: { detail: VisitReadinessDetail }) {
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4"><h3 className="text-lg font-black text-[var(--doctor-text)]">Readiness Breakdown</h3><div className="mt-3 grid gap-3">{detail.breakdown.map((metric) => <div key={metric.id} className={`rounded-lg border p-3 ${metric.blocking ? "border-[color:color-mix(in_srgb,var(--doctor-warning)_28%,white)] bg-[color:color-mix(in_srgb,var(--doctor-warning)_10%,white)]" : "border-[var(--doctor-border)]"}`}><div className="flex justify-between gap-3 text-sm font-black"><span>{metric.category}</span><span>{metric.achieved}/{metric.maximum}</span></div><div className="mt-2 h-2 rounded-full bg-[var(--doctor-border)]"><span className="block h-full rounded-full bg-[var(--doctor-ai-blue)]" style={{ width: `${toPercent(metric.achieved, metric.maximum)}%` }} /></div><p className="mt-2 text-xs text-[var(--doctor-muted)]">{Math.round((metric.achieved / metric.maximum) * 100)}% · Target {metric.target}. {metric.explanation}</p></div>)}</div></section>;
}

function ScoreChange({ detail }: { detail: VisitReadinessDetail }) {
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4"><h3 className="text-lg font-black text-[var(--doctor-text)]">Score Change Explanation</h3><div className="mt-3 space-y-3">{detail.scoreChanges.map((item) => <div key={item.id} className="grid gap-2 md:grid-cols-[220px_1fr_70px] md:items-center"><span className="font-bold">{item.factor}</span><div className="h-3 rounded-full bg-[var(--doctor-border)]"><span className={`block h-full rounded-full ${item.contribution < 0 ? "bg-[var(--doctor-danger)]" : "bg-[var(--doctor-success)]"}`} style={{ width: `${Math.min(100, Math.abs(item.contribution))}%` }} /></div><span className="font-black">{item.contribution > 0 ? "+" : ""}{item.contribution}</span><p className="text-xs text-[var(--doctor-muted)] md:col-span-3">{item.explanation}</p></div>)}</div></section>;
}

function ReviewTabs({ detail, activeTab, setActiveTab }: { detail: VisitReadinessDetail; activeTab: string; setActiveTab: (tab: string) => void }) {
  const tabs = ["gaps", "soap", "coding", "sources", "audit"] as const;
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4"><div role="tablist" className="flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-lg border px-3 py-2 text-sm font-black ${activeTab === tab ? "border-[var(--doctor-blue-border)] bg-[var(--doctor-soft-blue)] text-[var(--doctor-primary)]" : "border-[var(--doctor-border)] bg-[var(--doctor-card)] text-[var(--doctor-muted)]"}`}>{tab === "gaps" ? "Priority Gaps" : tab === "soap" ? "SOAP Check" : tab === "coding" ? "Coding & Payer" : tab === "sources" ? "Sources" : "Audit Trail"}</button>)}</div><div className="mt-4">{activeTab === "gaps" && <div className="space-y-3">{detail.priorityGaps.map((gap) => <div key={gap.id} className="rounded-lg border border-[var(--doctor-border)] p-3"><Badge tone={gap.severity === "Blocking" ? "danger" : gap.severity === "Warning" ? "warning" : "info"}>{gap.severity}</Badge><h4 className="mt-2 font-black">{gap.title}</h4><p className="text-sm text-[var(--doctor-muted)]">{gap.explanation}</p><p className="mt-2 text-xs text-[var(--doctor-muted)]">Owner: {gap.owner} · Due: {gap.dueTime} · Source: {gap.source}</p><Button className="mt-2 rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-card)] px-3 py-2 font-black text-[var(--doctor-primary)]">{gap.recommendedAction}</Button></div>)}</div>}{activeTab === "soap" && <Checklist items={["Subjective completeness", "Objective completeness", "Assessment consistency", "Plan rationale", "Diagnosis-treatment alignment"]} />}{activeTab === "coding" && <Checklist items={[`ICD code ${detail.visit.diagnosisCode}`, "Specificity requires authorized verification", "Coding consistency checked", "Payer rule alignment configured", "Coverage review not confirmed", "Required evidence reviewed", "Rule reference 2026.06"]} />}{activeTab === "sources" && <table className="w-full text-sm"><tbody>{detail.sources.map((source) => <tr key={source.id} className="border-b border-[var(--doctor-border)]"><td className="py-2 font-black">{source.source}</td><td>{source.version}</td><td>{source.usedFor}</td><td>{source.status}</td></tr>)}</tbody></table>}{activeTab === "audit" && <AuditActivity events={detail.auditTrail} />}</div></section>;
}

function Checklist({ items }: { items: string[] }) {
  return <div className="grid gap-2">{items.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-[var(--doctor-border)] p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-[var(--doctor-success)]" />{item}</div>)}</div>;
}

function HumanReviewGate({ visit, onOverride, onAssignReviewer, onSend }: { visit: DoctorWorklistVisit; onOverride: () => void; onAssignReviewer: () => void; onSend: () => void }) {
  const allowed = canSendToClaimReview(visit);
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4"><h3 className="text-lg font-black">Human Review Gate</h3><div className="mt-3 space-y-2 text-sm"><p>1. Doctor resolves clinical gaps</p><p>2. Claim reviewer validates evidence</p><p>3. Authorized user decides next step</p></div><div className="mt-3 grid gap-2 text-sm"><Badge tone={allowed ? "success" : "warning"}>{allowed ? "Prepared" : "Pending"}</Badge><p>Owner: Doctor / Claim Reviewer · SLA: Today 16:00</p><p className={allowed ? "text-[var(--doctor-success)]" : "text-[var(--doctor-danger)]"}>{allowed ? "Clinical gaps resolved. Human review remains mandatory." : `${visit.blockingGapCount} blocking actions remain. AI cannot approve or submit a claim.`}</p></div><div className="mt-4 grid gap-2"><Button disabled={!allowed} onClick={onSend} className="rounded-lg bg-[var(--doctor-primary)] px-3 py-2 font-black text-white disabled:opacity-50">Mark Ready for Human Review</Button><Button onClick={onAssignReviewer} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-3 py-2 font-black text-[var(--doctor-primary)]"><UserCheck className="mr-2 inline h-4 w-4" />Assign Reviewer</Button><Button onClick={onOverride} className="rounded-lg border border-[color:color-mix(in_srgb,var(--doctor-warning)_28%,white)] bg-[color:color-mix(in_srgb,var(--doctor-warning)_10%,white)] px-3 py-2 font-black text-[var(--doctor-warning)]">Request Manual Override</Button><Button onClick={() => document.getElementById("selected-visit-review")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-3 py-2 font-black text-[var(--doctor-primary)]">View Audit Trail</Button></div></section>;
}

function Recommendation({ detail }: { detail: VisitReadinessDetail }) {
  return <section className="rounded-lg border border-[var(--doctor-blue-border)] bg-[var(--doctor-soft-blue)] p-4 text-sm text-[var(--doctor-primary)]"><h3 className="font-black">Explainable Recommendation</h3><Badge tone="info">AI Assisted - Human Verification Required</Badge><p className="mt-3">Current recommendation: {detail.visit.blockingGapCount > 0 ? "Resolve source-linked gaps before human claim review." : "Prepared for authorized human review."}</p><p className="mt-2">Facts from source records: SOAP and diagnosis records are versioned. Rule-based findings: readiness threshold is {detail.readyThreshold}. AI-generated recommendation: prioritize {detail.visit.primaryGap ?? "reviewer validation"}.</p><p className="mt-2">Uncertainty: Confidence is {detail.visit.confidencePercent}%. Payer-rule coverage is limited to configured MVP rules and must be verified by an authorized reviewer.</p></section>;
}

function AuditActivity({ events, onExport }: { events: VisitReadinessDetail["auditTrail"]; onExport?: () => void }) {
  return <section className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">Recent Audit Activity</h3>{onExport && <button onClick={onExport} className="text-sm font-black text-[var(--doctor-ai-blue)]">Export</button>}</div><div className="mt-3 space-y-3">{events.map((event) => <div key={event.id} className="border-l-2 border-[var(--doctor-ai-blue)] pl-3 text-sm"><strong>{event.action}</strong><p className="text-[var(--doctor-muted)]">{event.timestamp} · {event.actor} · {event.role}</p><p className="text-xs text-[var(--doctor-muted)]">{event.previousValue} → {event.newValue} · {event.result}</p></div>)}</div></section>;
}

function ManualOverrideDialog({ isPending, onClose, onSubmit }: { isPending: boolean; onClose: () => void; onSubmit: (input: ManualOverrideFormValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ManualOverrideFormValues>({ resolver: zodResolver(manualOverrideSchema) });
  return <div role="dialog" aria-modal="true" aria-labelledby="override-title" className="fixed inset-0 z-50 grid place-items-center bg-[color:color-mix(in_srgb,var(--doctor-text)_60%,transparent)] p-4"><form onSubmit={handleSubmit(async (values) => { await onSubmit(values); reset(); })} className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-lg bg-[var(--doctor-card)] p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><h2 id="override-title" className="text-xl font-black text-[var(--doctor-text)]">Request Manual Override</h2><p className="text-sm text-[var(--doctor-muted)]">Override requests are auditable and do not approve or submit claims.</p></div><button type="button" onClick={onClose} aria-label="Close manual override dialog"><X className="h-5 w-5" /></button></div><label className="mt-4 grid gap-1 text-sm font-bold">Authorized role<select {...register("authorizedRole")} className="min-h-10 rounded-lg border border-[var(--doctor-border)] px-3"><option value="">Select role</option><option>Doctor</option><option>Claim Reviewer</option><option>Compliance Officer</option></select>{errors.authorizedRole && <span className="text-xs text-[var(--doctor-danger)]">{errors.authorizedRole.message}</span>}</label><label className="mt-3 grid gap-1 text-sm font-bold">Override outcome<select {...register("overrideOutcome")} className="min-h-10 rounded-lg border border-[var(--doctor-border)] px-3"><option value="">Select outcome</option><option>Keep Needs Review and record exception</option><option>Request secondary clinical review</option><option>Request payer-rule exception review</option></select>{errors.overrideOutcome && <span className="text-xs text-[var(--doctor-danger)]">{errors.overrideOutcome.message}</span>}</label><label className="mt-3 grid gap-1 text-sm font-bold">Factual reason<textarea {...register("reason")} rows={4} className="rounded-lg border border-[var(--doctor-border)] p-3" placeholder="Describe source-based reason. ห้ามระบุว่า AI อนุมัติเคลมอัตโนมัติ" />{errors.reason && <span className="text-xs text-[var(--doctor-danger)]">{errors.reason.message}</span>}</label><div className="mt-5 flex justify-end gap-2"><Button onClick={onClose} className="rounded-lg border border-[var(--doctor-border)] bg-[var(--doctor-card)] px-4 py-2 font-black text-[var(--doctor-muted)]">Cancel</Button><Button type="submit" disabled={isPending} className="rounded-lg bg-[var(--doctor-primary)] px-4 py-2 font-black text-white disabled:opacity-50">{isPending ? "Submitting..." : "Submit Override Request"}</Button></div></form></div>;
}
