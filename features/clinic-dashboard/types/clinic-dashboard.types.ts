export type ClinicDepartment = "General Medicine" | "Pediatrics" | "Orthopedics" | "Cardiology" | "Other";
export type VisitStatus = "Registered" | "Waiting" | "In Consultation" | "Treatment" | "At Pharmacy" | "Completed" | "Claim Review";
export type RiskLevel = "Low" | "Medium" | "High";
export type SLAStatus = "Within SLA" | "Near SLA" | "Breached" | "On Target" | "Attention";
export type QueuePriority = "Normal" | "High" | "Critical";
export type ReadinessStatus = "Ready" | "Needs Review" | "Not Ready";
export type MetricStatus = "good" | "warning" | "critical" | "neutral";

export type ClinicDashboardFilters = {
  dateRange: "Today" | "Last 7 Days" | "Last 30 Days";
  clinic: string;
  department: "all" | ClinicDepartment;
  doctor: "all" | string;
  payer: "all" | string;
  visitStatus: "all" | VisitStatus;
  riskLevel: "all" | RiskLevel;
};

export type ClinicDashboardContext = {
  clinicName: string;
  organization: string;
  currentDateLabel: string;
  currentShift: string;
  userName: string;
  userRole: string;
};

export type ClinicDashboardKpi = {
  id: string;
  label: string;
  thaiHelper: string;
  value: string;
  previous: string;
  trend: string;
  target: string;
  status: MetricStatus;
  sparkline: number[];
  detailTitle: string;
  detailSummary: string;
  detailRows: { label: string; value: string }[];
};

export type ClinicFlowStage = {
  stage: VisitStatus;
  count: number;
  percentage: number;
  averageMinutes: number;
  slaTargetMinutes: number;
  status: SLAStatus;
};

export type QueueItem = {
  id: string;
  patientName: string;
  hn: string;
  doctorName: string;
  department: ClinicDepartment;
  waitingMinutes: number;
  slaStatus: SLAStatus;
  priority: QueuePriority;
  clinicalRisk: RiskLevel;
  visitStatus: VisitStatus;
  aiRecommendation: string;
  urgencyScore: number;
};

export type SeriesPoint = Record<string, string | number>;
export type DepartmentQueue = { department: ClinicDepartment; activeQueue: number };
export type WaitDistribution = { range: string; patients: number; status: MetricStatus };
export type DepartmentReadiness = { department: Exclude<ClinicDepartment, "Other">; ready: number; needsReview: number; notReady: number };
export type MissingEvidence = { category: string; affectedCases: number; cumulativePercentage: number };
export type ScoreMetric = { label: string; score: number; target: number; cases: number; change: string };
export type FinancialMetric = { label: string; value: string; helper: string; status: MetricStatus };
export type CostComplexityPoint = { id: string; complexity: number; cost: number; expected: number; outlier: boolean };
export type DepartmentPerformance = {
  department: Exclude<ClinicDepartment, "Other">;
  metrics: { label: string; value: string; target: string; status: MetricStatus; riskScore: number }[];
};
export type DoctorPerformance = { doctor: string; specialty: string; cases: number; clinicalQuality: number; documentationQuality: number; benchmark: number };
export type DashboardAlert = {
  id: string;
  severity: "critical" | "high" | "medium";
  type: string;
  affectedCase: string;
  reason: string;
  confidence?: number;
  owner: string;
  dueTime: string;
};
export type DashboardTask = { label: string; count: number; overdue: number; priority: string };
export type DashboardNotification = { id: string; title: string; timestamp: string; source: string; unread: boolean };
export type AuditActivity = { id: string; action: string; actor: string; timestamp: string; auditState: string };

export type ClinicDashboardData = {
  context: ClinicDashboardContext;
  filters: ClinicDashboardFilters;
  filterOptions: {
    clinics: string[];
    departments: ClinicDepartment[];
    doctors: string[];
    payers: string[];
    statuses: VisitStatus[];
    risks: RiskLevel[];
  };
  kpis: ClinicDashboardKpi[];
  clinicFlow: ClinicFlowStage[];
  queueByDepartment: DepartmentQueue[];
  queue: QueueItem[];
  waitTime: { today: SeriesPoint[]; sevenDays: SeriesPoint[]; thirtyDays: SeriesPoint[]; distribution: WaitDistribution[] };
  claimReadiness: {
    overallPercentage: number;
    readyVisits: number;
    pendingEvidence: number;
    estimatedClaimValue: number;
    donut: { status: ReadinessStatus; value: number }[];
    byDepartment: DepartmentReadiness[];
    missingEvidence: MissingEvidence[];
  };
  clinicalAI: { metrics: ScoreMetric[]; trend: SeriesPoint[] };
  financial: { revenueTrend: SeriesPoint[]; metrics: FinancialMetric[]; costDistribution: WaitDistribution[]; costComplexity: CostComplexityPoint[] };
  departments: DepartmentPerformance[];
  doctors: DoctorPerformance[];
  forecast: { day: SeriesPoint[]; week: SeriesPoint[]; month: SeriesPoint[]; advisory: string };
  alerts: DashboardAlert[];
  tasks: DashboardTask[];
  notifications: DashboardNotification[];
  activities: AuditActivity[];
};
