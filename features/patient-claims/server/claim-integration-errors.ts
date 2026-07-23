import "server-only";

export type ClaimIntegrationErrorCode =
  | "configuration_error"
  | "invalid_claim_state"
  | "patient_not_found"
  | "query_failed"
  | "tenant_scope_mismatch";

export class ClaimIntegrationError extends Error {
  constructor(
    public readonly code: ClaimIntegrationErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ClaimIntegrationError";
  }
}

export function toClaimIntegrationError(error: unknown): ClaimIntegrationError {
  if (error instanceof ClaimIntegrationError) return error;
  return new ClaimIntegrationError("query_failed", "Claim information could not be loaded.", error);
}
