export class ClaimReadinessError extends Error {
  constructor(
    public code:
      | "validation_error"
      | "not_found"
      | "forbidden"
      | "tenant_scope_mismatch"
      | "task_already_exists"
      | "gap_resolved"
      | "transient_failure",
    message: string,
  ) {
    super(message);
  }
}
