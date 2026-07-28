import type {
  DoctorDashboardData,
  DoctorDashboardFilters,
  ExportResult,
  ManualOverrideInput,
  ManualOverrideResult,
  VisitReadinessDetail,
} from "../types/doctor-dashboard.types";

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

function canonicalReadBoundaryError(): Error {
  return new Error("Doctor Dashboard reads must use the authenticated server action boundary.");
}

function deferredMutationError(): Error {
  return new Error("Doctor Dashboard mutations are deferred pending an approved mutation contract.");
}

export const doctorDashboardService: DoctorDashboardService = {
  async getDashboard() {
    throw canonicalReadBoundaryError();
  },

  async getVisitReadiness() {
    throw canonicalReadBoundaryError();
  },

  async reevaluateVisit() {
    throw deferredMutationError();
  },

  async assignReviewer() {
    throw deferredMutationError();
  },

  async submitManualOverride() {
    throw deferredMutationError();
  },

  async sendToClaimReview() {
    throw deferredMutationError();
  },

  async exportDashboard() {
    throw canonicalReadBoundaryError();
  },
};
