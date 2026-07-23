import "server-only";

import { getSupabaseDatabaseConfig } from "../../../lib/database/env";
import {
  ClaimIntegrationError,
  toClaimWorkflowMutationError,
} from "./claim-integration-errors";

export type ClaimWorkflowStatus = string;

export type ClaimWorkflowCommandContext = {
  actorId: string;
  organizationId: string;
  clinicId: string;
  accessToken?: string;
};

export type TransitionClaimWorkflowInput = {
  claimId: string;
  targetStatus: ClaimWorkflowStatus;
  expectedVersion: number;
  reasonCode: string;
  reasonText?: string;
  correlationId?: string;
  occurredAt?: string;
};

export type ClaimWorkflowTransitionResult = {
  claimId: string;
  previousWorkflowStatus: ClaimWorkflowStatus;
  workflowStatus: ClaimWorkflowStatus;
  version: number;
  workflowEventId: string;
  stateUpdatedAt: string;
  idempotentReplay: boolean;
};

export type ClaimWorkflowRpcArgs = {
  p_claim_id: string;
  p_target_status: ClaimWorkflowStatus;
  p_expected_version: number;
  p_reason_code: string;
  p_reason_text?: string;
  p_source_system: "internal";
  p_correlation_id?: string;
  p_occurred_at?: string;
};

export type ClaimWorkflowRpcRow = {
  claim_id: string;
  previous_workflow_status: unknown;
  workflow_status: unknown;
  version: number;
  workflow_event_id: string;
  state_updated_at: string;
  idempotent_replay: boolean;
};

export interface ClaimWorkflowCommandGateway {
  transition(
    args: ClaimWorkflowRpcArgs,
    accessToken: string,
  ): Promise<ClaimWorkflowRpcRow[]>;
}

type CreateClaimWorkflowCommandServiceOptions = {
  gateway?: ClaimWorkflowCommandGateway;
  getContext?: () => Promise<ClaimWorkflowCommandContext>;
};

export function createClaimWorkflowCommandService(
  options: CreateClaimWorkflowCommandServiceOptions = {},
) {
  const getContext = options.getContext ?? getDemoClaimWorkflowContext;

  return {
    async transitionClaimWorkflow(
      input: TransitionClaimWorkflowInput,
    ): Promise<ClaimWorkflowTransitionResult> {
      validateTransitionInput(input);

      try {
        const context = await getContext();
        if (!context.accessToken) {
          throw new ClaimIntegrationError(
            "configuration_error",
            "Authenticated server-side Claim workflow context is not configured.",
          );
        }

        const gateway =
          options.gateway ?? createSupabaseRestClaimWorkflowGateway();
        const rows = await gateway.transition(
          toRpcArgs(input),
          context.accessToken,
        );
        const row = rows[0];

        if (!row) {
          throw new ClaimIntegrationError(
            "query_failed",
            "Claim workflow transition returned no canonical result.",
          );
        }

        return mapTransitionResult(row);
      } catch (error) {
        throw toClaimWorkflowMutationError(error);
      }
    },
  };
}

export const claimWorkflowCommandService =
  createClaimWorkflowCommandService();

function validateTransitionInput(input: TransitionClaimWorkflowInput): void {
  if (!input.claimId.trim()) {
    throw new ClaimIntegrationError(
      "invalid_input",
      "Claim identifier is required.",
    );
  }

  if (!input.targetStatus.trim()) {
    throw new ClaimIntegrationError(
      "invalid_input",
      "Target workflow status is required.",
    );
  }

  if (
    !Number.isInteger(input.expectedVersion) ||
    input.expectedVersion < 0
  ) {
    throw new ClaimIntegrationError(
      "invalid_input",
      "Expected version must be a non-negative integer.",
    );
  }

  if (!input.reasonCode.trim()) {
    throw new ClaimIntegrationError(
      "invalid_input",
      "Workflow transition reason code is required.",
    );
  }
}

function toRpcArgs(
  input: TransitionClaimWorkflowInput,
): ClaimWorkflowRpcArgs {
  const args: ClaimWorkflowRpcArgs = {
    p_claim_id: input.claimId.trim(),
    p_target_status: input.targetStatus.trim(),
    p_expected_version: input.expectedVersion,
    p_reason_code: input.reasonCode.trim(),
    p_source_system: "internal",
  };

  const reasonText = input.reasonText?.trim();
  if (reasonText) args.p_reason_text = reasonText;
  if (input.correlationId) args.p_correlation_id = input.correlationId;
  if (input.occurredAt) args.p_occurred_at = input.occurredAt;

  return args;
}

function mapTransitionResult(
  row: ClaimWorkflowRpcRow,
): ClaimWorkflowTransitionResult {
  if (
    typeof row.claim_id !== "string" ||
    typeof row.previous_workflow_status !== "string" ||
    typeof row.workflow_status !== "string" ||
    !Number.isInteger(row.version) ||
    typeof row.workflow_event_id !== "string" ||
    typeof row.state_updated_at !== "string" ||
    typeof row.idempotent_replay !== "boolean"
  ) {
    throw new ClaimIntegrationError(
      "query_failed",
      "Claim workflow transition returned an invalid canonical result.",
    );
  }

  return {
    claimId: row.claim_id,
    previousWorkflowStatus: row.previous_workflow_status,
    workflowStatus: row.workflow_status,
    version: row.version,
    workflowEventId: row.workflow_event_id,
    stateUpdatedAt: row.state_updated_at,
    idempotentReplay: row.idempotent_replay,
  };
}

async function getDemoClaimWorkflowContext(): Promise<ClaimWorkflowCommandContext> {
  const organizationId = process.env.MED_AI_DEMO_ORGANIZATION_ID;
  const clinicId = process.env.MED_AI_DEMO_CLINIC_ID;
  const actorId = process.env.MED_AI_DEMO_ACTOR_ID;
  const accessToken = process.env.MED_AI_DEMO_ACCESS_TOKEN;

  if (!organizationId || !clinicId || !actorId || !accessToken) {
    throw new ClaimIntegrationError(
      "configuration_error",
      "Authenticated server-side Claim workflow context is not configured.",
    );
  }

  return {
    organizationId,
    clinicId,
    actorId,
    accessToken,
  };
}

function createSupabaseRestClaimWorkflowGateway(): ClaimWorkflowCommandGateway {
  const config = getSupabaseDatabaseConfig();
  if (!config) return createConfigurationErrorGateway();

  return {
    async transition(args, accessToken) {
      let response: Response;

      try {
        response = await fetch(
          `${config.url}/rest/v1/rpc/transition_claim_workflow`,
          {
            method: "POST",
            headers: {
              apikey: config.anonKey,
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(args),
            cache: "no-store",
          },
        );
      } catch (error) {
        throw new ClaimIntegrationError(
          "transport_error",
          "Claim workflow service could not be reached.",
          error,
        );
      }

      const payload = await readJson(response);
      if (!response.ok) {
        throw payload ?? {
          code: String(response.status),
          message: "Claim workflow transition was rejected.",
        };
      }

      return normalizeRpcRows(payload);
    },
  };
}

function createConfigurationErrorGateway(): ClaimWorkflowCommandGateway {
  return {
    async transition() {
      throw new ClaimIntegrationError(
        "configuration_error",
        "Supabase authenticated server configuration is missing.",
      );
    },
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeRpcRows(payload: unknown): ClaimWorkflowRpcRow[] {
  if (Array.isArray(payload)) {
    return payload as ClaimWorkflowRpcRow[];
  }

  if (payload && typeof payload === "object") {
    return [payload as ClaimWorkflowRpcRow];
  }

  return [];
}
