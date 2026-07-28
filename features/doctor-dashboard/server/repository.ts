import "server-only";

import type {
  DoctorDashboardData,
  DoctorDashboardFilters,
  DoctorKpi,
  DoctorWorklistVisit,
  ExportResult,
  PriorityGap,
  ReadinessBreakdownMetric,
  ReadinessStatus,
  RiskLevel,
  VisitReadinessDetail,
  VisitStatus,
  WorklistReadinessStatus,
} from "../types/doctor-dashboard.types";
import { filterWorklist, formatDuration, getReadinessStatus } from "../utils/doctor-dashboard.utils";
import type { DoctorDashboardActor } from "./identity";

type CanonicalReadinessItem = {
  id: string;
  dimensionCode: string;
  itemStatus: string;
  reasonCode: string;
  reasonText: string;
  rawScore: number;
  weightedScore: number;
  weight: number;
  evidenceReference: string | null;
};

export type DoctorDashboardCanonicalVisit = {
  id: string;
  visitNumber: string;
  organizationId: string;
  clinicId: string;
  patientName: string;
  patientCode: string;
  gender: string;
  age: number;
  department: string;
  doctorName: string;
  visitStatus: string;
  claimStatus: string;
  riskLevel: string;
  startedAt: string | null;
  payerName: string | null;
  diagnosisCode: string;
  diagnosisLabel: string;
  diagnosisConfidence: number | null;
  readiness: {
    id: string;
    version: number;
    totalScore: number;
    readinessStatus: string;
    reviewStatus: string;
    calculatedAt: string;
    ruleSetVersion: string;
    items: CanonicalReadinessItem[];
  } | null;
};

export type DoctorDashboardCanonicalReadModel = {
  generatedAt: Date;
  actor: {
    displayName: string;
    organizationName: string;
    clinicName: string;
  };
  visits: DoctorDashboardCanonicalVisit[];
};

export async function readDoctorDashboard(
  client: unknown,
  actor: DoctorDashboardActor,
  filters: DoctorDashboardFilters,
): Promise<DoctorDashboardData> {
  const supabase = client as DoctorDashboardSupabaseClient;
  const clinicIds = filters.clinic
    ? [filters.clinic]
    : actor.activeClinicId
      ? [actor.activeClinicId]
      : actor.authorizedClinicIds;
  const [organizationResult, clinicsResult, profileResult, visitsResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("id", actor.activeOrganizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle<OrganizationRow>(),
    supabase
      .from("clinics")
      .select("id, name, organization_id")
      .eq("organization_id", actor.activeOrganizationId)
      .in("id", clinicIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .returns<ClinicRow[]>(),
    supabase
      .from("user_profiles")
      .select("id, display_name, department")
      .eq("id", actor.profileId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle<UserProfileRow>(),
    supabase
      .from("visits")
      .select("id, visit_number, organization_id, clinic_id, patient_id, attending_user_id, department, visit_status, claim_status, risk_level, started_at, payer_name")
      .eq("organization_id", actor.activeOrganizationId)
      .in("clinic_id", clinicIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .gte("started_at", dateRangeStart(filters.dateRange).toISOString())
      .lt("started_at", dateRangeEnd().toISOString())
      .order("started_at", { ascending: false })
      .limit(100)
      .returns<VisitRow[]>(),
  ]);

  if (organizationResult.error || clinicsResult.error || profileResult.error || visitsResult.error) {
    throw new Error("canonical_read_failed");
  }

  const visits = visitsResult.data ?? [];
  const visitIds = visits.map((visit) => visit.id);
  const patientIds = unique(visits.map((visit) => visit.patient_id));
  const doctorIds = unique(visits.map((visit) => visit.attending_user_id).filter((id): id is string => Boolean(id)));

  const [patientsResult, doctorsResult, diagnosesResult, assessmentsResult] = await Promise.all([
    patientIds.length
      ? supabase
          .from("patients")
          .select("id, display_label, patient_code, sex_at_birth, date_of_birth")
          .in("id", patientIds)
          .eq("organization_id", actor.activeOrganizationId)
          .eq("is_active", true)
          .is("deleted_at", null)
          .returns<PatientRow[]>()
      : Promise.resolve({ data: [], error: null }),
    doctorIds.length
      ? supabase
          .from("user_profiles")
          .select("id, display_name")
          .in("id", doctorIds)
          .eq("is_active", true)
          .is("deleted_at", null)
          .returns<UserProfileRow[]>()
      : Promise.resolve({ data: [], error: null }),
    visitIds.length
      ? supabase
          .from("visit_diagnoses")
          .select("id, visit_id, diagnosis_code, diagnosis_text, confidence")
          .in("visit_id", visitIds)
          .eq("organization_id", actor.activeOrganizationId)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .returns<DiagnosisRow[]>()
      : Promise.resolve({ data: [], error: null }),
    visitIds.length
      ? supabase
          .from("claim_readiness_assessments")
          .select("id, visit_id, assessment_version, total_score, readiness_status, review_status, calculated_at, rule_set_version")
          .in("visit_id", visitIds)
          .eq("organization_id", actor.activeOrganizationId)
          .eq("is_active", true)
          .eq("is_current", true)
          .is("deleted_at", null)
          .order("calculated_at", { ascending: false })
          .returns<AssessmentRow[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsResult.error || doctorsResult.error || diagnosesResult.error || assessmentsResult.error) {
    throw new Error("canonical_projection_failed");
  }

  const assessmentIds = (assessmentsResult.data ?? []).map((assessment) => assessment.id);
  const itemsResult = assessmentIds.length
    ? await supabase
        .from("claim_readiness_items")
        .select("id, assessment_id, dimension_code, item_status, reason_code, reason_text, raw_score, weighted_score, weight, evidence_reference")
        .in("assessment_id", assessmentIds)
        .eq("organization_id", actor.activeOrganizationId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .returns<ReadinessItemRow[]>()
    : { data: [], error: null };

  if (itemsResult.error) {
    throw new Error("canonical_readiness_items_failed");
  }

  return buildDoctorDashboardProjection({
    generatedAt: new Date(),
    actor: {
      displayName: profileResult.data?.display_name ?? "Authenticated Doctor",
      organizationName: organizationResult.data?.name ?? actor.activeOrganizationId,
      clinicName: (clinicsResult.data ?? []).map((clinic) => clinic.name).join(", ") || "Authorized Clinics",
    },
    visits: visits.map((visit) =>
      toCanonicalVisit(
        visit,
        patientsResult.data ?? [],
        doctorsResult.data ?? [],
        diagnosesResult.data ?? [],
        assessmentsResult.data ?? [],
        itemsResult.data ?? [],
      ),
    ),
  });
}

type QueryResult<T> = { data: T | null; error: { message?: string } | null };
type ListQueryResult<T> = { data: T | null; error: { message?: string } | null };
type QueryBuilder = {
  select(columns?: string): QueryBuilder;
  eq(column: string, value: string | boolean): QueryBuilder;
  is(column: string, value: null): QueryBuilder;
  in(column: string, values: string[]): QueryBuilder;
  gte(column: string, value: string): QueryBuilder;
  lt(column: string, value: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  maybeSingle<T>(): Promise<QueryResult<T>>;
  returns<T>(): Promise<ListQueryResult<T>>;
};
type DoctorDashboardSupabaseClient = { from(table: string): QueryBuilder };
type OrganizationRow = { id: string; name: string };
type ClinicRow = { id: string; name: string; organization_id: string };
type UserProfileRow = { id: string; display_name: string; department?: string | null };
type VisitRow = {
  id: string;
  visit_number: string;
  organization_id: string;
  clinic_id: string;
  patient_id: string;
  attending_user_id: string | null;
  department: string;
  visit_status: string;
  claim_status: string;
  risk_level: string;
  started_at: string | null;
  payer_name: string | null;
};
type PatientRow = {
  id: string;
  display_label: string;
  patient_code: string;
  sex_at_birth: string | null;
  date_of_birth: string | null;
};
type DiagnosisRow = {
  id: string;
  visit_id: string;
  diagnosis_code: string;
  diagnosis_text: string;
  confidence: number | null;
};
type AssessmentRow = {
  id: string;
  visit_id: string;
  assessment_version: number;
  total_score: number;
  readiness_status: string;
  review_status: string;
  calculated_at: string;
  rule_set_version: string;
};
type ReadinessItemRow = {
  id: string;
  assessment_id: string;
  dimension_code: string;
  item_status: string;
  reason_code: string;
  reason_text: string;
  raw_score: number;
  weighted_score: number;
  weight: number;
  evidence_reference: string | null;
};

function toCanonicalVisit(
  visit: VisitRow,
  patients: PatientRow[],
  doctors: UserProfileRow[],
  diagnoses: DiagnosisRow[],
  assessments: AssessmentRow[],
  items: ReadinessItemRow[],
): DoctorDashboardCanonicalVisit {
  const patient = patients.find((row) => row.id === visit.patient_id);
  const doctor = doctors.find((row) => row.id === visit.attending_user_id);
  const diagnosis = diagnoses.find((row) => row.visit_id === visit.id);
  const assessment = assessments.find((row) => row.visit_id === visit.id);

  return {
    id: visit.id,
    visitNumber: visit.visit_number,
    organizationId: visit.organization_id,
    clinicId: visit.clinic_id,
    patientName: patient?.display_label ?? "Patient unavailable",
    patientCode: patient?.patient_code ?? "Unavailable",
    gender: patient?.sex_at_birth ?? "Unspecified",
    age: calculateAge(patient?.date_of_birth),
    department: visit.department,
    doctorName: doctor?.display_name ?? "Authenticated Doctor",
    visitStatus: visit.visit_status,
    claimStatus: visit.claim_status,
    riskLevel: visit.risk_level,
    startedAt: visit.started_at,
    payerName: visit.payer_name,
    diagnosisCode: diagnosis?.diagnosis_code ?? "Unverified",
    diagnosisLabel: diagnosis?.diagnosis_text ?? "Diagnosis requires clinician verification",
    diagnosisConfidence: diagnosis?.confidence ?? null,
    readiness: assessment
      ? {
          id: assessment.id,
          version: assessment.assessment_version,
          totalScore: assessment.total_score,
          readinessStatus: assessment.readiness_status,
          reviewStatus: assessment.review_status,
          calculatedAt: assessment.calculated_at,
          ruleSetVersion: assessment.rule_set_version,
          items: items
            .filter((item) => item.assessment_id === assessment.id)
            .map((item) => ({
              id: item.id,
              dimensionCode: item.dimension_code,
              itemStatus: item.item_status,
              reasonCode: item.reason_code,
              reasonText: item.reason_text,
              rawScore: item.raw_score,
              weightedScore: item.weighted_score,
              weight: item.weight,
              evidenceReference: item.evidence_reference,
            })),
        }
      : null,
  };
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function dateRangeStart(range: DoctorDashboardFilters["dateRange"]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "14d") start.setDate(start.getDate() - 13);
  return start;
}

function dateRangeEnd() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function calculateAge(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function buildDoctorDashboardProjection(model: DoctorDashboardCanonicalReadModel): DoctorDashboardData {
  const visits = model.visits.map(toWorklistVisit);
  const selectedVisit = visits[0] && model.visits[0]?.readiness
    ? buildReadinessDetail(visits[0], model.visits[0])
    : null;

  return {
    lastUpdated: formatBangkokDateTime(model.generatedAt),
    kpis: buildKpis(visits, model.generatedAt),
    visits,
    selectedVisit,
    workflow: buildWorkflow(visits),
    readinessMix: buildReadinessMix(visits),
    readinessTrend: buildReadinessTrend(model.visits, model.generatedAt),
    timeToReadiness: buildTimeToReadiness(model.visits, model.generatedAt),
    missingEvidence: buildMissingEvidence(visits),
    heatmap: visits.slice(0, 5).map((visit) => ({
      visitId: visit.id,
      patientName: visit.patientName,
      risks: {
        Documentation: visit.primaryGap?.toLowerCase().includes("soap") ? "High" : visit.riskLevel,
        Coding: visit.diagnosisCode === "Unverified" ? "High" : "Medium",
        "Payer Rule": "Medium",
        Evidence: visit.blockingGapCount > 0 ? visit.riskLevel : "Low",
        Cost: visit.primaryGap?.toLowerCase().includes("cost") ? "High" : "Low",
        "Clinical Safety": visit.riskLevel === "Critical" ? "Critical" : "Medium",
      },
    })),
    auditActivity: [],
  };
}

export function buildVisitReadinessDetail(
  dashboard: DoctorDashboardData,
  visitId: string,
): VisitReadinessDetail | null {
  const visit = dashboard.visits.find((item) => item.id === visitId);
  if (!visit) return null;
  if (dashboard.selectedVisit?.visit.id === visit.id) return dashboard.selectedVisit;
  return null;
}

export function exportDoctorDashboardCsv(
  dashboard: DoctorDashboardData,
  filters: Partial<DoctorDashboardFilters>,
): ExportResult {
  const rows = filterWorklist(dashboard.visits, {
    dateRange: "today",
    clinic: "",
    department: "",
    doctor: "",
    search: "",
    readinessStatus: "",
    riskLevel: "",
    visitStatus: "",
    priority: "",
    gapType: "",
    ...filters,
  });
  const header = ["Visit ID", "Patient", "HN", "Status", "Score", "Readiness", "Risk", "Payer", "Next Action"];
  const body = rows.map((visit) =>
    [
      visit.id,
      visit.patientName,
      visit.hn,
      visit.visitStatus,
      visit.readinessScore,
      visit.readinessStatus,
      visit.riskLevel,
      visit.payerName,
      visit.nextAction,
    ].map(csvEscape).join(","),
  );

  return {
    filename: "doctor-dashboard-summary.csv",
    content: [header.join(","), ...body].join("\n"),
    mimeType: "text/csv",
  };
}

function toWorklistVisit(row: DoctorDashboardCanonicalVisit): DoctorWorklistVisit {
  const score = row.readiness?.totalScore ?? null;
  const readinessStatus = row.readiness
    ? mapReadinessStatus(row.readiness.readinessStatus, row.readiness.totalScore)
    : "Assessment Unavailable";
  const blockingItems = row.readiness?.items.filter((item) => isBlockingItem(item)) ?? [];
  const pendingMinutes = row.startedAt
    ? Math.max(0, Math.round((Date.now() - new Date(row.startedAt).getTime()) / 60000))
    : 0;

  return {
    id: row.visitNumber || row.id,
    patientName: row.patientName,
    hn: row.patientCode,
    gender: row.gender || "Unspecified",
    age: row.age,
    encounterType: "Visit",
    visitStatus: mapVisitStatus(row.visitStatus),
    readinessScore: score,
    readinessStatus,
    blockingGapCount: blockingItems.length,
    riskLevel: mapRiskLevel(row.riskLevel),
    priority: mapPriority(row.riskLevel, blockingItems.length, readinessStatus),
    pendingMinutes,
    payerName: row.payerName ?? "Unable to verify",
    diagnosisCode: row.diagnosisCode || "Unverified",
    diagnosisLabel: row.diagnosisLabel || "Diagnosis requires clinician verification",
    nextAction: blockingItems[0]?.reasonText ?? "Reviewer validation",
    primaryGap: blockingItems[0]?.reasonText,
    confidencePercent: Math.round((row.diagnosisConfidence ?? 0) * 100),
    scoreChange: 0,
    doctor: row.doctorName,
    department: row.department,
  };
}

function buildKpis(visits: DoctorWorklistVisit[], generatedAt: Date): DoctorKpi[] {
  const ready = visits.filter((visit) => visit.readinessStatus === "Ready for Human Review").length;
  const highRisk = visits.filter((visit) => visit.riskLevel === "High" || visit.riskLevel === "Critical").length;
  const pendingNotes = visits.filter((visit) => visit.primaryGap?.toLowerCase().includes("soap")).length;
  const averagePending = visits.length
    ? Math.round(visits.reduce((total, visit) => total + visit.pendingMinutes, 0) / visits.length)
    : 0;
  void generatedAt;

  return [
    kpi("today-visits", "Today's Visits", visits.length, visits.length, visits.length, "Authorized canonical visits", "Loaded", "success", {}),
    kpi("clinical-notes-pending", "Clinical Notes Pending", pendingNotes, pendingNotes, visits.length, "Source-linked SOAP gaps", pendingNotes ? "Attention Required" : "Unavailable / Clear", pendingNotes ? "warning" : "info", { gapType: "SOAP Plan Rationale" }),
    kpi("ready-human-review", "Ready for Human Review", ready, ready, visits.length, "Advisory readiness only", "Human Review Required", "success", { readinessStatus: "Ready for Human Review" }),
    kpi("high-risk-gaps", "High-Risk Gaps", highRisk, highRisk, visits.length, "Risk and evidence gaps", highRisk ? "Needs Attention" : "Clear", highRisk ? "danger" : "success", { riskLevel: "High" }),
    kpi("overdue-actions", "Overdue Actions", 0, 0, visits.length, "Linked review due dates only", "Unavailable", "info", { priority: "Critical" }),
    kpi("avg-readiness-time", "Average Time to Readiness", formatDuration(averagePending), averagePending, 180, "Target less than 3 hours", "Source-derived", averagePending > 180 ? "warning" : "success"),
  ];
}

function kpi(
  id: string,
  label: string,
  value: string | number,
  progressValue: number,
  progressMax: number,
  progressLabel: string,
  statusLabel: string,
  statusTone: DoctorKpi["statusTone"],
  targetFilter?: DoctorKpi["targetFilter"],
): DoctorKpi {
  return {
    id,
    label,
    value,
    comparisonLabel: "Canonical read",
    trendDirection: "neutral",
    trendTone: "neutral",
    progressLabel,
    progressValue,
    progressMax,
    progressDisplay: `${progressValue} / ${progressMax}`,
    statusLabel,
    statusTone,
    targetFilter,
  };
}

function buildWorkflow(visits: DoctorWorklistVisit[]) {
  const statuses: VisitStatus[] = ["Waiting", "In Consultation", "Pharmacy", "Pending Evidence", "Ready for Human Review", "Completed"];
  return statuses.map((status) => ({ status, count: visits.filter((visit) => visit.visitStatus === status).length }));
}

function buildReadinessMix(visits: DoctorWorklistVisit[]) {
  const statuses: ReadinessStatus[] = ["Ready for Human Review", "Needs Review", "Not Ready"];
  return statuses.map((status) => ({ status, count: visits.filter((visit) => visit.readinessStatus === status).length }));
}

function buildReadinessTrend(rows: DoctorDashboardCanonicalVisit[], generatedAt: Date) {
  const scoredRows = rows.filter((row) => row.readiness);
  if (scoredRows.length === 0) return [];
  const average = Math.round(scoredRows.reduce((total, row) => total + (row.readiness?.totalScore ?? 0), 0) / scoredRows.length);
  return [{
    date: formatShortDate(generatedAt),
    actual: average,
    target: 85,
    previous: average,
  }];
}

function buildTimeToReadiness(rows: DoctorDashboardCanonicalVisit[], generatedAt: Date) {
  const durations = rows.flatMap((row) => {
    if (!row.startedAt || !row.readiness?.calculatedAt) return [];
    return [Math.max(0, Math.round((new Date(row.readiness.calculatedAt).getTime() - new Date(row.startedAt).getTime()) / 60000))];
  });
  const minutes = durations.length
    ? Math.round(
        durations.reduce((total, duration) => total + duration, 0) / durations.length,
      )
    : 0;
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(generatedAt);
    date.setDate(date.getDate() - (6 - index));
    return { date: formatShortDate(date), minutes, targetMinutes: 180 };
  });
}

function buildMissingEvidence(visits: DoctorWorklistVisit[]) {
  const counts = new Map<string, number>();
  visits.forEach((visit) => {
    if (visit.primaryGap) counts.set(visit.primaryGap, (counts.get(visit.primaryGap) ?? 0) + 1);
  });
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  let running = 0;
  return [...counts.entries()].map(([gapType, count]) => {
    running += count;
    return { gapType, count, cumulativePercent: total ? Math.round((running / total) * 100) : 0 };
  });
}

function buildReadinessDetail(
  visit: DoctorWorklistVisit,
  row: DoctorDashboardCanonicalVisit,
): VisitReadinessDetail {
  const readiness = row.readiness;
  const items = readiness?.items ?? [];
  return {
    visit,
    version: readiness ? `v${readiness.version}` : "unavailable",
    evaluatedAt: readiness ? formatBangkokDateTime(new Date(readiness.calculatedAt)) : "Unavailable",
    sourceLinked: Boolean(readiness),
    readyThreshold: 85,
    breakdown: buildBreakdown(items),
    scoreChanges: [
      {
        id: "current",
        factor: "Current canonical readiness score",
        contribution: visit.readinessScore ?? 0,
        explanation: "Derived from the current authorized readiness assessment.",
      },
    ],
    priorityGaps: buildPriorityGaps(visit, items),
    auditTrail: [],
    sources: items.map((item) => ({
      id: item.id,
      source: item.evidenceReference ?? item.reasonCode,
      version: readiness?.ruleSetVersion ?? "unavailable",
      usedFor: item.dimensionCode,
      status: item.itemStatus,
    })),
  };
}

function buildBreakdown(items: CanonicalReadinessItem[]): ReadinessBreakdownMetric[] {
  const grouped = new Map<string, CanonicalReadinessItem[]>();
  items.forEach((item) => grouped.set(item.dimensionCode, [...(grouped.get(item.dimensionCode) ?? []), item]));
  return [...grouped.entries()].map(([dimension, dimensionItems]) => {
    const maximum = dimensionItems.reduce((total, item) => total + item.weight, 0);
    const achieved = dimensionItems.reduce((total, item) => total + item.weightedScore, 0);
    return {
      id: dimension,
      category: dimension,
      achieved,
      maximum,
      target: maximum,
      blocking: dimensionItems.some(isBlockingItem),
      explanation: dimensionItems.map((item) => item.reasonText).join("; "),
    };
  });
}

function buildPriorityGaps(visit: DoctorWorklistVisit, items: CanonicalReadinessItem[]): PriorityGap[] {
  const gaps = items.filter(isBlockingItem);
  if (gaps.length === 0) {
    return [{
      id: `${visit.id}-ready`,
      severity: "Information",
      title: "No blocking gaps detected",
      explanation: "Human verification remains mandatory before any claim decision.",
      owner: "Claim Reviewer",
      dueTime: "Unavailable",
      source: "Canonical readiness assessment",
      recommendedAction: "Reviewer validation",
    }];
  }
  return gaps.map((item) => ({
    id: item.id,
    severity: visit.riskLevel === "Critical" ? "Blocking" : "Warning",
    title: item.reasonText,
    explanation: "Resolve the source-linked readiness gap before human claim review.",
    owner: "Doctor",
    dueTime: "Unavailable",
    source: item.evidenceReference ?? item.reasonCode,
    recommendedAction: item.reasonText,
  }));
}

function mapReadinessStatus(value: string | undefined, score: number): ReadinessStatus {
  if (value === "ready" || value === "ready_for_human_review") return "Ready for Human Review";
  if (value === "needs_review" || value === "review_required") return "Needs Review";
  if (value === "not_ready") return "Not Ready";
  return getReadinessStatus(score);
}

function mapVisitStatus(value: string): VisitStatus {
  const normalized = value.toLowerCase();
  if (normalized.includes("consult")) return "In Consultation";
  if (normalized.includes("pharmacy")) return "Pharmacy";
  if (normalized.includes("evidence")) return "Pending Evidence";
  if (normalized.includes("ready")) return "Ready for Human Review";
  if (normalized.includes("complete")) return "Completed";
  return "Waiting";
}

function mapRiskLevel(value: string): RiskLevel {
  const normalized = value.toLowerCase();
  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
}

function mapPriority(risk: string, blockingGapCount: number, status: WorklistReadinessStatus) {
  const riskLevel = mapRiskLevel(risk);
  if (riskLevel === "Critical" || (riskLevel === "High" && blockingGapCount > 0)) return "Critical";
  if (riskLevel === "High" || blockingGapCount > 1) return "High";
  if (status === "Needs Review" || blockingGapCount === 1) return "Medium";
  return "Low";
}

function isBlockingItem(item: CanonicalReadinessItem) {
  return ["blocking", "missing", "failed", "required"].some((token) => item.itemStatus.toLowerCase().includes(token));
}

function csvEscape(value: string | number | null) {
  return `"${String(value ?? "Unavailable").replaceAll('"', '""')}"`;
}

function formatBangkokDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}
