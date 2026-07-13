export type ReadinessStatus =
  | "Ready for Human Review"
  | "Needs Review"
  | "Not Ready";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export type VisitStatus =
  | "Waiting"
  | "In Consultation"
  | "Pharmacy"
  | "Pending Evidence"
  | "Ready for Human Review"
  | "Completed";

export type TrendDirection = "up" | "down" | "neutral";
export type TrendTone = "positive" | "negative" | "neutral";
export type StatusTone = "success" | "warning" | "danger" | "info";

export interface DoctorDashboardFilters {
  dateRange: "today" | "7d" | "14d";
  clinic: string;
  department: string;
  doctor: string;
  search: string;
  readinessStatus: "" | ReadinessStatus;
  riskLevel: "" | RiskLevel;
  visitStatus: "" | VisitStatus;
  priority: "" | PriorityLevel;
  gapType: string;
}

export interface DoctorKpi {
  id: string;
  label: string;
  value: string | number;
  comparisonLabel: string;
  trendDirection: TrendDirection;
  trendTone: TrendTone;
  progressLabel: string;
  progressValue: number;
  progressMax: number;
  progressDisplay: string;
  statusLabel: string;
  statusTone: StatusTone;
  targetFilter?: Partial<DoctorDashboardFilters>;
}

export interface DoctorWorklistVisit {
  id: string;
  patientName: string;
  hn: string;
  gender: string;
  age: number;
  encounterType: string;
  visitStatus: VisitStatus;
  readinessScore: number;
  readinessStatus: ReadinessStatus;
  blockingGapCount: number;
  riskLevel: RiskLevel;
  priority: PriorityLevel;
  pendingMinutes: number;
  payerName: string;
  diagnosisCode: string;
  diagnosisLabel: string;
  nextAction: string;
  primaryGap?: string;
  confidencePercent: number;
  scoreChange: number;
  doctor: string;
  department: string;
}

export interface ReadinessBreakdownMetric {
  id: string;
  category: string;
  achieved: number;
  maximum: number;
  target: number;
  blocking: boolean;
  explanation: string;
}

export interface ScoreChangeFactor {
  id: string;
  factor: string;
  contribution: number;
  explanation: string;
}

export interface PriorityGap {
  id: string;
  severity: "Information" | "Warning" | "Blocking";
  title: string;
  explanation: string;
  owner: string;
  dueTime: string;
  source: string;
  recommendedAction: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  previousValue: string;
  newValue: string;
  sourceOrReason: string;
  result: string;
}

export interface VisitReadinessDetail {
  visit: DoctorWorklistVisit;
  version: string;
  evaluatedAt: string;
  sourceLinked: boolean;
  readyThreshold: number;
  breakdown: ReadinessBreakdownMetric[];
  scoreChanges: ScoreChangeFactor[];
  priorityGaps: PriorityGap[];
  auditTrail: AuditEvent[];
  sources: Array<{
    id: string;
    source: string;
    version: string;
    usedFor: string;
    status: string;
  }>;
}

export interface DoctorDashboardData {
  lastUpdated: string;
  kpis: DoctorKpi[];
  visits: DoctorWorklistVisit[];
  selectedVisit: VisitReadinessDetail;
  workflow: Array<{ status: VisitStatus; count: number }>;
  readinessMix: Array<{ status: ReadinessStatus; count: number }>;
  readinessTrend: Array<{
    date: string;
    actual: number;
    target: number;
    previous: number;
  }>;
  timeToReadiness: Array<{ date: string; minutes: number; targetMinutes: number }>;
  missingEvidence: Array<{ gapType: string; count: number; cumulativePercent: number }>;
  heatmap: Array<{
    visitId: string;
    patientName: string;
    risks: Record<string, RiskLevel>;
  }>;
  auditActivity: AuditEvent[];
}

export interface ManualOverrideInput {
  authorizedRole: "Doctor" | "Claim Reviewer" | "Compliance Officer";
  overrideOutcome:
    | "Keep Needs Review and record exception"
    | "Request secondary clinical review"
    | "Request payer-rule exception review";
  reason: string;
}

export interface ManualOverrideResult {
  auditId: string;
  submittedAt: string;
}

export interface ExportResult {
  filename: string;
  content: string;
  mimeType: "text/csv";
}
