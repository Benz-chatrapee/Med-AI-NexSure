import { doctorDashboardMock, buildReadinessDetail } from "../data/doctor-dashboard.mock";
import type {
  DoctorDashboardData,
  DoctorDashboardFilters,
  ExportResult,
  ManualOverrideInput,
  ManualOverrideResult,
  VisitReadinessDetail,
} from "../types/doctor-dashboard.types";
import { filterWorklist } from "../utils/doctor-dashboard.utils";

export interface DoctorDashboardService {
  getDashboard(filters: DoctorDashboardFilters): Promise<DoctorDashboardData>;
  getVisitReadiness(visitId: string): Promise<VisitReadinessDetail>;
  reevaluateVisit(visitId: string): Promise<VisitReadinessDetail>;
  assignReviewer(visitId: string, reviewerId: string): Promise<void>;
  submitManualOverride(
    visitId: string,
    input: ManualOverrideInput,
  ): Promise<ManualOverrideResult>;
  sendToClaimReview(visitId: string): Promise<void>;
  exportDashboard(filters: DoctorDashboardFilters): Promise<ExportResult>;
}

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function nowLabel(): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date());
}

export const doctorDashboardService: DoctorDashboardService = {
  async getDashboard(filters) {
    await delay(160);
    const visits = filterWorklist(doctorDashboardMock.visits, filters);
    return {
      ...doctorDashboardMock,
      lastUpdated: nowLabel(),
      visits,
      selectedVisit: buildReadinessDetail(visits[0] ?? doctorDashboardMock.visits[0]),
    };
  },

  async getVisitReadiness(visitId) {
    await delay(120);
    const visit = doctorDashboardMock.visits.find((item) => item.id === visitId);
    if (!visit) throw new Error("Visit readiness record not found.");
    return buildReadinessDetail(visit);
  },

  async reevaluateVisit(visitId) {
    await delay(500);
    const detail = await this.getVisitReadiness(visitId);
    return {
      ...detail,
      evaluatedAt: nowLabel(),
      auditTrail: [
        {
          id: `AUD-REEVAL-${Date.now()}`,
          timestamp: nowLabel(),
          actor: "System",
          role: "AI Orchestrator",
          action: "Readiness re-evaluation requested",
          previousValue: `Score ${detail.visit.readinessScore}`,
          newValue: `Score ${detail.visit.readinessScore}`,
          sourceOrReason: "Doctor refresh request",
          result: "Recorded",
        },
        ...detail.auditTrail,
      ],
    };
  },

  async assignReviewer() {
    await delay(260);
  },

  async submitManualOverride(visitId, input) {
    void visitId;
    void input;
    await delay(420);
    return {
      auditId: `AUD-OVERRIDE-${Date.now()}`,
      submittedAt: nowLabel(),
    };
  },

  async sendToClaimReview() {
    await delay(300);
  },

  async exportDashboard(filters) {
    await delay(180);
    const rows = filterWorklist(doctorDashboardMock.visits, filters);
    const header = [
      "Visit ID",
      "Patient",
      "HN",
      "Status",
      "Score",
      "Readiness",
      "Risk",
      "Payer",
      "Next Action",
    ];
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
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    return {
      filename: "doctor-dashboard-summary.csv",
      content: [header.join(","), ...body].join("\n"),
      mimeType: "text/csv",
    };
  },
};
