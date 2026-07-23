import "server-only";

export type ClaimIntegrationErrorCode =
  | "configuration_error"
  | "idempotency_conflict"
  | "invalid_claim_state"
  | "invalid_input"
  | "patient_not_found"
  | "permission_denied"
  | "query_failed"
  | "resource_not_found"
  | "tenant_scope_mismatch"
  | "transport_error"
  | "version_conflict";

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

type DatabaseErrorLike = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  status?: unknown;
};

export function toClaimIntegrationError(error: unknown): ClaimIntegrationError {
  if (error instanceof ClaimIntegrationError) return error;
  return new ClaimIntegrationError(
    "query_failed",
    "Claim information could not be loaded.",
    error,
  );
}

export function toClaimWorkflowMutationError(
  error: unknown,
): ClaimIntegrationError {
  if (error instanceof ClaimIntegrationError) return error;

  const databaseError = asDatabaseError(error);
  const code = databaseError.code;
  const status = databaseError.status;
  const message = databaseError.message.toLowerCase();

  if (
    code === "42501" ||
    status === "401" ||
    status === "403" ||
    message.includes("permission") ||
    message.includes("row-level security") ||
    message.includes("rls") ||
    message.includes("not authorized")
  ) {
    return new ClaimIntegrationError(
      "permission_denied",
      "You do not have permission to transition this Claim in the current organization or clinic scope.",
      error,
    );
  }

  if (code === "40001") {
    return new ClaimIntegrationError(
      "version_conflict",
      "The Claim changed after it was loaded. Refresh the canonical Claim before retrying.",
      error,
    );
  }

  if (code === "23505") {
    return new ClaimIntegrationError(
      "idempotency_conflict",
      "The workflow event identity conflicts with an existing transition.",
      error,
    );
  }

  if (code === "23514") {
    return new ClaimIntegrationError(
      "invalid_claim_state",
      "The requested Claim workflow transition is not valid for the current state.",
      error,
    );
  }

  if (code === "22023") {
    return new ClaimIntegrationError(
      "invalid_input",
      "The Claim workflow transition request is invalid.",
      error,
    );
  }

  if (status === "404" || code === "PGRST116") {
    return new ClaimIntegrationError(
      "resource_not_found",
      "The Claim was not found or is not visible in the authorized scope.",
      error,
    );
  }

  if (error instanceof TypeError) {
    return new ClaimIntegrationError(
      "transport_error",
      "Claim workflow service could not be reached.",
      error,
    );
  }

  return new ClaimIntegrationError(
    "query_failed",
    "Claim workflow transition could not be completed.",
    error,
  );
}

function asDatabaseError(error: unknown): {
  code: string;
  message: string;
  status: string;
} {
  if (!error || typeof error !== "object") {
    return { code: "", message: "", status: "" };
  }

  const value = error as DatabaseErrorLike;
  return {
    code: typeof value.code === "string" ? value.code : "",
    message: typeof value.message === "string" ? value.message : "",
    status:
      typeof value.status === "number" || typeof value.status === "string"
        ? String(value.status)
        : "",
  };
}
