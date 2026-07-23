import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ClaimIntegrationError } from "./claim-integration-errors";
import {
  createClaimWorkflowCommandService,
  type ClaimWorkflowCommandContext,
  type ClaimWorkflowCommandGateway,
  type ClaimWorkflowRpcArgs,
  type ClaimWorkflowRpcRow,
} from "./claim-workflow-command-service";

const context: ClaimWorkflowCommandContext = {
  actorId: "actor-1",
  organizationId: "org-1",
  clinicId: "clinic-1",
  accessToken: "access-token-1",
};

const canonicalRow: ClaimWorkflowRpcRow = {
  claim_id: "claim-1",
  previous_workflow_status: "draft",
  workflow_status: "collecting_data",
  version: 3,
  workflow_event_id: "event-1",
  state_updated_at: "2026-07-23T13:30:00.000Z",
  idempotent_replay: false,
};

function createGateway(
  implementation?: (
    args: ClaimWorkflowRpcArgs,
    accessToken: string,
  ) => Promise<ClaimWorkflowRpcRow[]>,
) {
  const calls: Array<{ args: ClaimWorkflowRpcArgs; accessToken: string }> = [];
  const gateway: ClaimWorkflowCommandGateway = {
    async transition(args, accessToken) {
      calls.push({ args, accessToken });
      return implementation
        ? implementation(args, accessToken)
        : [canonicalRow];
    },
  };

  return { gateway, calls };
}

describe("claim workflow command service", () => {
  it("sends the exact internal workflow RPC payload", async () => {
    const { gateway, calls } = createGateway();
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    const result = await service.transitionClaimWorkflow({
      claimId: "claim-1",
      targetStatus: "collecting_data",
      expectedVersion: 2,
      reasonCode: "START_REVIEW",
      reasonText: "Claim documents received.",
      correlationId: "00000000-0000-4000-8000-000000000001",
      occurredAt: "2026-07-23T13:29:00.000Z",
    });

    expect(calls).toEqual([
      {
        accessToken: "access-token-1",
        args: {
          p_claim_id: "claim-1",
          p_target_status: "collecting_data",
          p_expected_version: 2,
          p_reason_code: "START_REVIEW",
          p_reason_text: "Claim documents received.",
          p_source_system: "internal",
          p_correlation_id: "00000000-0000-4000-8000-000000000001",
          p_occurred_at: "2026-07-23T13:29:00.000Z",
        },
      },
    ]);
    expect(result).toEqual({
      claimId: "claim-1",
      previousWorkflowStatus: "draft",
      workflowStatus: "collecting_data",
      version: 3,
      workflowEventId: "event-1",
      stateUpdatedAt: "2026-07-23T13:30:00.000Z",
      idempotentReplay: false,
    });
  });

  it("preserves the caller supplied expected version", async () => {
    const { gateway, calls } = createGateway();
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    await service.transitionClaimWorkflow({
      claimId: "claim-1",
      targetStatus: "collecting_data",
      expectedVersion: 17,
      reasonCode: "START_REVIEW",
    });

    expect(calls[0]?.args.p_expected_version).toBe(17);
  });

  it("returns a canonical idempotent replay result", async () => {
    const { gateway } = createGateway(async () => [
      { ...canonicalRow, idempotent_replay: true },
    ]);
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    const result = await service.transitionClaimWorkflow({
      claimId: "claim-1",
      targetStatus: "collecting_data",
      expectedVersion: 2,
      reasonCode: "START_REVIEW",
    });

    expect(result.idempotentReplay).toBe(true);
    expect(result.workflowEventId).toBe("event-1");
  });

  it.each([
    [{ claimId: "", targetStatus: "draft", expectedVersion: 1, reasonCode: "R" }, "Claim identifier is required."],
    [{ claimId: "claim-1", targetStatus: "", expectedVersion: 1, reasonCode: "R" }, "Target workflow status is required."],
    [{ claimId: "claim-1", targetStatus: "draft", expectedVersion: -1, reasonCode: "R" }, "Expected version must be a non-negative integer."],
    [{ claimId: "claim-1", targetStatus: "draft", expectedVersion: 1, reasonCode: "" }, "Workflow transition reason code is required."],
  ])("rejects invalid command input", async (input, message) => {
    const service = createClaimWorkflowCommandService({
      gateway: createGateway().gateway,
      getContext: async () => context,
    });

    await expect(
      service.transitionClaimWorkflow(input),
    ).rejects.toMatchObject({ code: "invalid_input", message });
  });

  it.each([
    ["42501", "permission_denied"],
    ["23514", "invalid_claim_state"],
    ["40001", "version_conflict"],
    ["23505", "idempotency_conflict"],
    ["22023", "invalid_input"],
  ])("maps database code %s to %s", async (databaseCode, expectedCode) => {
    const gateway: ClaimWorkflowCommandGateway = {
      async transition() {
        throw { code: databaseCode, message: "Database rejected request" };
      },
    };
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    await expect(
      service.transitionClaimWorkflow({
        claimId: "claim-1",
        targetStatus: "collecting_data",
        expectedVersion: 2,
        reasonCode: "START_REVIEW",
      }),
    ).rejects.toMatchObject({ code: expectedCode });
  });

  it("rejects an empty RPC result instead of reporting success", async () => {
    const { gateway } = createGateway(async () => []);
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    await expect(
      service.transitionClaimWorkflow({
        claimId: "claim-1",
        targetStatus: "collecting_data",
        expectedVersion: 2,
        reasonCode: "START_REVIEW",
      }),
    ).rejects.toMatchObject({ code: "query_failed" });
  });

  it("rejects a missing authenticated access token", async () => {
    const service = createClaimWorkflowCommandService({
      gateway: createGateway().gateway,
      getContext: async () => ({ ...context, accessToken: undefined }),
    });

    await expect(
      service.transitionClaimWorkflow({
        claimId: "claim-1",
        targetStatus: "collecting_data",
        expectedVersion: 2,
        reasonCode: "START_REVIEW",
      }),
    ).rejects.toMatchObject({ code: "configuration_error" });
  });

  it("preserves an existing ClaimIntegrationError", async () => {
    const gateway: ClaimWorkflowCommandGateway = {
      async transition() {
        throw new ClaimIntegrationError(
          "transport_error",
          "Claim workflow service is temporarily unavailable.",
        );
      },
    };
    const service = createClaimWorkflowCommandService({
      gateway,
      getContext: async () => context,
    });

    await expect(
      service.transitionClaimWorkflow({
        claimId: "claim-1",
        targetStatus: "collecting_data",
        expectedVersion: 2,
        reasonCode: "START_REVIEW",
      }),
    ).rejects.toMatchObject({ code: "transport_error" });
  });
});
