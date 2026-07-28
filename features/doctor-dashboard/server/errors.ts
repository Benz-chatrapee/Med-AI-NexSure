export type DoctorDashboardErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "TENANT_SCOPE_MISMATCH"
  | "VALIDATION_ERROR"
  | "DASHBOARD_FAILED";

export class DoctorDashboardError extends Error {
  constructor(
    public readonly code: DoctorDashboardErrorCode,
    message: string,
  ) {
    super(message);
  }
}
