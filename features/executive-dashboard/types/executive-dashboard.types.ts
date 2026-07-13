export type ClaimReadinessStatus = "ready" | "needs_review" | "not_ready";
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type CasePriority = "critical" | "high" | "normal";
export type DataHealthStatus = "healthy" | "delayed" | "degraded";
export type SlaStatus = "within_sla" | "due_soon" | "breached";
export type SortKey = "visitId" | "claimValue" | "readinessScore" | "priority" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface DashboardFilters {
  dateRange: string;
  clinicId: string | null;
  departmentId: string | null;
  payerId: string | null;
  claimStatus: ClaimReadinessStatus | null;
  riskLevel: RiskLevel | null;
  missingEvidenceCategory: string | null;
}

export interface ExecutiveKpi {
  id: string;
  label: string;
  value: string;
  helperText?: string;
  comparison?: {
    value: number;
    unit: "percent" | "percentage_point" | "currency" | "count";
    direction: "up" | "down" | "neutral";
    sentiment: "positive" | "negative" | "neutral";
    label: string;
  };
  status?: "success" | "warning" | "danger" | "neutral";
}

export interface CaseWorklistItem {
  id: string;
  visitId: string;
  priority: CasePriority;
  clinicId: string;
  clinicName: string;
  departmentId: string;
  departmentName: string;
  payerId: string;
  payerName: string;
  claimValue: number;
  readinessScore: number;
  readinessStatus: ClaimReadinessStatus;
  readinessTrend: number;
  missingEvidence: string[];
  riskLevel: RiskLevel;
  riskReason: string;
  slaStatus: SlaStatus;
  slaLabel: string;
  ownerName: string;
  updatedAt: string;
  recommendedAction: string;
}

export interface QueueMetric {
  id: string;
  label: string;
  count: number;
  percentage: number;
  overdue: number;
  oldestCase: string;
  supportedFilter?: Partial<DashboardFilters>;
}

export interface ReadinessComposition {
  status: ClaimReadinessStatus;
  label: string;
  value: number;
}

export interface TrendPoint {
  label: string;
  actual: number;
  target?: number;
  previous: number;
  capacity?: number;
}

export interface EvidenceParetoItem {
  category: string;
  affectedCases: number;
  share: number;
  cumulative: number;
  averageDelayHours: number;
  affectedValue: number;
}

export interface RiskHeatmapCell {
  clinicalSeverity: RiskLevel;
  financialImpact: RiskLevel;
  cases: number;
}

export interface EconomicIntelligence {
  averageVisitCost: number;
  expectedLower: number;
  expectedUpper: number;
  benchmark: number;
  variance: number;
  variancePercent: number;
  costTrend: TrendPoint[];
  waterfall: { label: string; start: number; delta: number; end: number }[];
  drivers: { label: string; value: number }[];
}

export interface ClinicPerformance {
  clinicId: string;
  clinicName: string;
  readiness: number;
  averageCost: number;
  visitVolume: number;
}

export interface AiImpactMetric {
  metric: string;
  aiAssisted: number;
  nonAiAssisted: number | null;
}

export type RecommendationStatus = "pending_human_validation" | "accepted" | "dismissed" | "converted_to_task";

export interface Recommendation {
  id: string;
  priority: "P1" | "P2";
  title: string;
  reason: string;
  affectedCases: number;
  expectedImpact: string;
  owner: string;
  dueDate: string;
  confidence: number;
  status: RecommendationStatus;
}

export interface ComplianceAlert {
  id: string;
  severity: RiskLevel;
  title: string;
  affectedCount: number;
  owner: string;
  timestamp: string;
  status: "open" | "investigating" | "assigned" | "acknowledged";
}

export interface ActivityEvent {
  id: string;
  eventType: string;
  actorRole: string;
  entityId: string;
  severity: RiskLevel | "info" | "resolved";
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ExecutiveCaseRequest {
  filters: DashboardFilters;
  search: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

export interface CreateReviewTaskInput {
  title: string;
  owner: string;
  dueDate: string;
  notes?: string;
  caseIds: string[];
}

export interface CreateReviewTaskResponse {
  taskId: string;
  auditEventId: string;
  createdAt: string;
}

export interface ExecutiveDashboardResponse {
  generatedAt: string;
  dataHealth: DataHealthStatus;
  filters: {
    clinics: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    payers: { id: string; name: string }[];
  };
  kpis: ExecutiveKpi[];
  secondaryMetrics: ExecutiveKpi[];
  readinessComposition: ReadinessComposition[];
  readinessTrend: TrendPoint[];
  visitTrend: TrendPoint[];
  operationalQueue: QueueMetric[];
  claimQueue: QueueMetric[];
  evidencePareto: EvidenceParetoItem[];
  riskHeatmap: RiskHeatmapCell[];
  economic: EconomicIntelligence;
  clinicPerformance: ClinicPerformance[];
  aiImpact: AiImpactMetric[];
  recommendations: Recommendation[];
  alerts: ComplianceAlert[];
  activity: ActivityEvent[];
}

export type ApiSuccessResponse<T> = { success: true; data: T };
export type ApiErrorResponse = { success: false; error: { code: string; message: string } };
