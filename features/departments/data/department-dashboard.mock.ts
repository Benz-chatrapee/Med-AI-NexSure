import { Activity, Bot, Building2, ClipboardCheck, Stethoscope, Users } from "lucide-react";
import type { Department, DepartmentCase, DepartmentDashboardFilters, DepartmentDashboardResponse, EvidenceCategory } from "../types/department.types";
import { readinessStatusFromScore } from "../utils/department-formatters";

export const initialDepartmentFilters: DepartmentDashboardFilters = {
  organizationId: "org-nexsure",
  clinicId: "clinic-bangkok",
  dateRange: "today",
  departmentType: "all",
  departmentId: "all",
  comparisonPeriod: "previous_day",
};

export const departmentsMock: Department[] = [
  { id: "dept-emergency", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Emergency Department", code: "ER-01", type: "clinical", manager: { id: "mgr-1", name: "Dr. Anan S.", role: "Clinical Manager" }, userCount: 42, visitCount: 86, claimReadyPercentage: 72, averageReadinessScore: 74, pendingEvidenceCount: 28, overSlaCount: 11, averageWaitMinutes: 31, costAlertCount: 9, status: "active", averageVisitCost: 5200, costBenchmark: 4400 },
  { id: "dept-internal", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Internal Medicine", code: "IM-02", type: "clinical", manager: { id: "mgr-2", name: "Dr. Benjawan R.", role: "Department Head" }, userCount: 36, visitCount: 74, claimReadyPercentage: 83, averageReadinessScore: 82, pendingEvidenceCount: 17, overSlaCount: 6, averageWaitMinutes: 24, costAlertCount: 4, status: "active", averageVisitCost: 3900, costBenchmark: 4100 },
  { id: "dept-pediatrics", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Pediatrics", code: "PED-03", type: "clinical", manager: null, userCount: 21, visitCount: 43, claimReadyPercentage: 86, averageReadinessScore: 87, pendingEvidenceCount: 8, overSlaCount: 2, averageWaitMinutes: 17, costAlertCount: 1, status: "active", averageVisitCost: 2700, costBenchmark: 2900 },
  { id: "dept-radiology", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Radiology", code: "RAD-04", type: "diagnostic", manager: { id: "mgr-4", name: "Krit P.", role: "Diagnostic Lead" }, userCount: 18, visitCount: 39, claimReadyPercentage: 69, averageReadinessScore: 71, pendingEvidenceCount: 22, overSlaCount: 7, averageWaitMinutes: 46, costAlertCount: 12, status: "active", averageVisitCost: 7600, costBenchmark: 5900 },
  { id: "dept-pharmacy", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Pharmacy", code: "PHR-05", type: "operational", manager: { id: "mgr-5", name: "Mayuree L.", role: "Pharmacy Manager" }, userCount: 15, visitCount: 52, claimReadyPercentage: 91, averageReadinessScore: 90, pendingEvidenceCount: 5, overSlaCount: 1, averageWaitMinutes: 13, costAlertCount: 2, status: "active", averageVisitCost: 1800, costBenchmark: 2100 },
  { id: "dept-claims", organizationId: "org-nexsure", clinicId: "clinic-bangkok", name: "Claim Review Unit", code: "CLM-06", type: "operational", manager: null, userCount: 12, visitCount: 0, claimReadyPercentage: null, averageReadinessScore: null, pendingEvidenceCount: 14, overSlaCount: 4, averageWaitMinutes: null, costAlertCount: 0, status: "inactive", averageVisitCost: 0, costBenchmark: 0 },
];

const evidenceInputs = [
  ["SOAP Note Incomplete", "Clinical Owner", 34],
  ["ICD-10 Missing", "Coding Owner", 27],
  ["Clinical Justification Missing", "Provider", 23],
  ["Required Attachment Missing", "Claim Reviewer", 19],
  ["Cost Justification Missing", "Department Manager", 15],
] as const;

export const evidenceParetoMock: EvidenceCategory[] = makePareto(evidenceInputs);

export const casesMock: DepartmentCase[] = departmentsMock.flatMap((department, departmentIndex) =>
  Array.from({ length: department.visitCount ? 5 : 2 }, (_, index) => {
    const score = Math.max(42, Math.min(96, (department.averageReadinessScore ?? 68) + (index - 2) * 5));
    const evidence = evidenceInputs[(departmentIndex + index) % evidenceInputs.length][0];
    const costStatus = department.costAlertCount > index ? "cost_alert" : "normal";
    return {
      id: `case-${departmentIndex + 1}-${index + 1}`,
      visitId: `VIS-2026-${String(departmentIndex + 1).padStart(2, "0")}${String(index + 21).padStart(3, "0")}`,
      patientMasked: `HN-****-${departmentIndex}${index}`,
      departmentId: department.id,
      departmentName: department.name,
      visitDate: `2026-07-${String(13 - index).padStart(2, "0")}`,
      provider: index % 2 === 0 ? "Dr. Narin P." : "Dr. Chalida S.",
      queueStatus: index % 5 === 0 ? "pending_evidence" : index % 5 === 1 ? "waiting" : index % 5 === 2 ? "in_consultation" : index % 5 === 3 ? "pharmacy" : "completed",
      aiAssisted: index % 2 === 0,
      readinessScore: score,
      readinessStatus: readinessStatusFromScore(score),
      claimStatus: score >= 85 ? "ready_for_submission" : score >= 60 ? "needs_review" : "draft",
      missingEvidence: score >= 88 ? [] : [evidence],
      evidenceAgingHours: 8 + index * 22 + departmentIndex * 4,
      costStatus,
      costBucket: department.averageVisitCost > 10000 ? "Over ฿10K" : department.averageVisitCost > 5000 ? "฿5-10K" : department.averageVisitCost > 3000 ? "฿3-5K" : department.averageVisitCost > 2000 ? "฿2-3K" : "฿1-2K",
      slaStatus: department.overSlaCount > index ? "breached" : index % 3 === 0 ? "approaching" : "within_sla",
      lastUpdated: `${8 + index}:4${index}`,
    };
  }),
);

export function buildDepartmentDashboard(filters: DepartmentDashboardFilters): DepartmentDashboardResponse {
  const scopedDepartments = departmentsMock.filter((department) =>
    department.organizationId === filters.organizationId &&
    department.clinicId === filters.clinicId &&
    (filters.departmentType === "all" || department.type === filters.departmentType) &&
    (filters.departmentId === "all" || department.id === filters.departmentId),
  );
  const scopedCases = casesMock.filter((item) => scopedDepartments.some((department) => department.id === item.departmentId));
  const ready = scopedCases.filter((item) => item.readinessStatus === "ready").length;
  const needsReview = scopedCases.filter((item) => item.readinessStatus === "needs_review").length;
  const notReady = scopedCases.filter((item) => item.readinessStatus === "not_ready").length;
  const total = Math.max(1, scopedCases.length);
  const activeDepartments = scopedDepartments.filter((department) => department.status === "active").length;
  const avgReadiness = scopedCases.reduce((sum, item) => sum + item.readinessScore, 0) / total;
  return {
    context: { organizationName: "NexSure Health Group", clinicName: "Bangkok Clinical Intelligence Center", lastUpdated: new Date().toISOString(), canCreateDepartment: true, canExport: true, dataScopeLabel: "Authorized organization and clinic scope only" },
    filters,
    departments: scopedDepartments,
    cases: scopedCases,
    kpis: [
      { id: "active_departments", label: "Active Departments", value: String(activeDepartments), trend: "+2 vs previous period", progress: (activeDepartments / Math.max(1, scopedDepartments.length)) * 100, helper: "Governed departments in scope", status: "success", icon: Building2 },
      { id: "department_users", label: "Department Users", value: String(scopedDepartments.reduce((sum, item) => sum + item.userCount, 0)), trend: "2 staffing exceptions", progress: 76, helper: "Manager assignment and staffing health", status: "warning", icon: Users },
      { id: "today_visits", label: "Today Visits", value: String(scopedDepartments.reduce((sum, item) => sum + item.visitCount, 0)), trend: "+8.4% visit volume", progress: 68, helper: "Operational workload today", status: "info", icon: Stethoscope },
      { id: "claim_ready", label: "Claim Ready %", value: `${Math.round((ready / total) * 100)}%`, trend: "Target 85%", progress: (ready / total) * 100, helper: "Ready threshold 85-100", status: ready / total >= 0.85 ? "success" : "warning", icon: ClipboardCheck },
      { id: "ai_assisted", label: "AI Assisted Cases", value: String(scopedCases.filter((item) => item.aiAssisted).length), trend: "Human review retained", progress: 64, helper: "AI assists; humans decide", status: "info", icon: Bot },
      { id: "average_readiness", label: "Average Readiness Score", value: avgReadiness.toFixed(1), trend: `${(85 - avgReadiness).toFixed(1)} gap to target`, progress: avgReadiness, helper: "Average case score", status: avgReadiness >= 85 ? "success" : "warning", icon: Activity },
    ],
    readiness: {
      distribution: [
        { status: "ready", label: "Ready", count: ready, percentage: Math.round((ready / total) * 100) },
        { status: "needs_review", label: "Needs Review", count: needsReview, percentage: Math.round((needsReview / total) * 100) },
        { status: "not_ready", label: "Not Ready", count: notReady, percentage: Math.round((notReady / total) * 100) },
      ],
      averageScore: Number(avgReadiness.toFixed(1)),
      targetScore: 85,
      lowerScoreCases: scopedCases.filter((item) => item.readinessScore < 85).length,
      trend: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({ label, actual: 71 + index * 1.2, target: 85, previousPeriod: 69 + index })),
    },
    queue: [
      { status: "completed", label: "Completed", thaiLabel: "เสร็จสิ้น", count: 96, percentage: 31, overSla: 0, medianWaitMinutes: null },
      { status: "in_consultation", label: "In Consultation", thaiLabel: "พบแพทย์", count: 58, percentage: 19, overSla: 3, medianWaitMinutes: 18 },
      { status: "pending_evidence", label: "Pending Evidence", thaiLabel: "รอหลักฐาน", count: 49, percentage: 16, overSla: 14, medianWaitMinutes: 44 },
      { status: "waiting", label: "Waiting", thaiLabel: "รอรับบริการ", count: 72, percentage: 23, overSla: 8, medianWaitMinutes: 27 },
      { status: "pharmacy", label: "Pharmacy", thaiLabel: "ห้องยา", count: 33, percentage: 11, overSla: 2, medianWaitMinutes: 16 },
    ],
    heatmap: scopedDepartments.flatMap((department, departmentIndex) => ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time, timeIndex) => {
      const value = ((departmentIndex + 1) * (timeIndex + 2)) % 17 + department.overSlaCount;
      return { departmentId: department.id, departmentName: department.name, time, value, severity: value > 20 ? "critical" : value > 14 ? "high" : value > 8 ? "moderate" : "low" };
    })),
    evidence: { pareto: evidenceParetoMock, aging: evidenceInputs.map(([category, owner], index) => ({ category, primaryOwner: owner, under24: 8 + index, oneToThreeDays: 6 + index * 2, overThreeDays: 3 + index })) },
    economic: {
      averageVisitCost: Math.round(scopedDepartments.reduce((sum, item) => sum + item.averageVisitCost, 0) / Math.max(1, scopedDepartments.filter((item) => item.averageVisitCost > 0).length)),
      expectedCostRange: [2800, 6200],
      costAlertCases: scopedDepartments.reduce((sum, item) => sum + item.costAlertCount, 0),
      estimatedClaimValue: 2840000,
      distribution: [{ bucket: "฿0-1K", cases: 18 }, { bucket: "฿1-2K", cases: 64 }, { bucket: "฿2-3K", cases: 112 }, { bucket: "฿3-5K", cases: 83 }, { bucket: "฿5-10K", cases: 38 }, { bucket: "Over ฿10K", cases: 11 }],
    },
    activities: [
      { id: "act-1", type: "critical", title: "Radiology cost variance flagged", actor: "AI Policy Validator", role: "System", source: "Economic Intelligence", correlationId: "CORR-RAD-2201", severity: "warning", time: "8 min" },
      { id: "act-2", type: "access", title: "Manager permission changed", actor: "Clinic Admin", role: "Organization Admin", source: "RBAC", correlationId: "CORR-RBAC-9981", severity: "info", time: "18 min" },
      { id: "act-3", type: "export", title: "Department export requested", actor: "Claim Manager", role: "Claim Reviewer", source: "Department Dashboard", correlationId: "CORR-EXP-1180", severity: "info", time: "34 min" },
    ],
    priorities: [
      { id: "pri-1", title: "Resolve Emergency evidence backlog", supportingMetric: "28 pending evidence · 11 over SLA", severity: "critical" },
      { id: "pri-2", title: "Review Radiology cost variance", supportingMetric: "12 cost alert cases · +฿1,700 variance", severity: "warning" },
      { id: "pri-3", title: "Assign manager to unmanaged departments", supportingMetric: "2 departments missing manager", severity: "warning" },
      { id: "pri-4", title: "Improve ICD-10 completeness", supportingMetric: "27 missing ICD-10 issues", severity: "info" },
    ],
  };
}

function makePareto(rows: readonly (readonly [string, string, number])[]): EvidenceCategory[] {
  const total = rows.reduce((sum, [, , count]) => sum + count, 0);
  let running = 0;
  return rows.map(([category, owner, count]) => {
    running += count;
    return { category, owner, count, percentage: Math.round((count / total) * 100), cumulativePercentage: Math.round((running / total) * 100) };
  });
}
