export class ExecutiveDashboardError extends Error {
  constructor(
    readonly code:
      | "validation_error"
      | "forbidden"
      | "tenant_scope_mismatch"
      | "dashboard_failed",
    message: string,
  ) {
    super(message);
    this.name = "ExecutiveDashboardError";
  }
}
