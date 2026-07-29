import { describe, expect, it, vi } from "vitest";
import { getDoctorDashboard, prepareDoctorDashboardMutationPrerequisite } from "./service";
import { buildDoctorDashboardProjection } from "./repository";

vi.mock("server-only", () => ({}));

describe("getDoctorDashboard", () => {
  it("fails closed for cross-clinic requests before repository reads", async () => {
    const result = await getDoctorDashboard(
      { clinic: "clinic-outside" },
      {
        resolveActor: async () => ({
          ok: true,
          value: {
            profileId: "doctor-1",
            activeOrganizationId: "org-1",
            authorizedOrganizationIds: ["org-1"],
            activeClinicId: "clinic-1",
            authorizedClinicIds: ["clinic-1"],
            roles: ["doctor"],
            permissions: [
              "patient.view",
              "visit.view",
              "claim.read",
              "claim.clinical.read",
              "claim.evidence.read",
              "claim.medical_coding.read",
            ],
          },
          client: {},
        }),
        readDashboard: async () => {
          throw new Error("repository should not be called");
        },
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "TENANT_SCOPE_MISMATCH",
      message: "Clinic is outside the authorized Doctor Dashboard scope.",
    });
  });

  it("keeps deferred mutation actions disabled in the read response", async () => {
    const result = await getDoctorDashboard(
      {},
      {
        resolveActor: async () => ({
          ok: true,
          value: {
            profileId: "doctor-1",
            activeOrganizationId: "org-1",
            authorizedOrganizationIds: ["org-1"],
            activeClinicId: "clinic-1",
            authorizedClinicIds: ["clinic-1"],
            roles: ["doctor"],
            permissions: [
              "patient.view",
              "visit.view",
              "claim.read",
              "claim.clinical.read",
              "claim.evidence.read",
              "claim.medical_coding.read",
            ],
          },
          client: {},
        }),
        readDashboard: async () => buildDoctorDashboardProjection({
          generatedAt: new Date("2026-07-27T08:15:00.000Z"),
          actor: {
            displayName: "Dr. Canon",
            organizationName: "Canonical Health",
            clinicName: "Trusted Clinic",
          },
          visits: [],
        }),
      },
    );

    expect(result.success).toBe(true);
    expect(result.data?.mutationAvailability).toEqual({
      reevaluate: false,
      assignReviewer: false,
      manualOverride: false,
      claimReviewHandoff: false,
    });
  });
});

describe("prepareDoctorDashboardMutationPrerequisite", () => {
  const actor = {
    profileId: "doctor-1",
    activeOrganizationId: "org-1",
    authorizedOrganizationIds: ["org-1"],
    activeClinicId: "clinic-1",
    authorizedClinicIds: ["clinic-1"],
    roles: ["doctor"],
    permissions: ["visit.view", "claim.read", "claim.review"],
  };
  const input = {
    visitId: "visit-1",
    action: "markReadyForHumanReview",
    reasonCode: "READY_FOR_REVIEW",
    idempotencyKey: "doctor-dashboard:visit-1:READY_FOR_REVIEW:1",
    externalEventId: "external-event:visit-1:1",
  };

  it("rejects unauthenticated users before resolving claim context", async () => {
    const resolveClaimContext = vi.fn();
    const result = await prepareDoctorDashboardMutationPrerequisite(input, {
      resolveActor: async () => ({
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Doctor dashboard requires an authenticated session.",
      }),
      resolveClaimContext,
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHENTICATED");
    expect(resolveClaimContext).not.toHaveBeenCalled();
  });

  it("rejects actors without claim review or submit permission", async () => {
    const result = await prepareDoctorDashboardMutationPrerequisite(input, {
      resolveActor: async () => ({
        ok: true,
        value: { ...actor, permissions: ["visit.view", "claim.read"] },
        client: {},
      }),
    });

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "FORBIDDEN",
      message: "The current actor is not authorized for Doctor Dashboard mutation prerequisites.",
    });
  });

  it("projects canonical claim workflow status and expected version without executing mutation", async () => {
    const executeMutation = vi.fn();
    const appendAudit = vi.fn();
    const result = await prepareDoctorDashboardMutationPrerequisite(input, {
      resolveActor: async () => ({ ok: true, value: actor, client: {} }),
      resolveClaimContext: async () => ({
        claimId: "claim-1",
        claimOrganizationId: "org-1",
        claimClinicId: "clinic-1",
        claimVisitId: "visit-1",
        workflowStatus: "draft",
        expectedVersion: 7,
      }),
      appendMutationPrerequisiteAuditEvent: appendAudit,
      executeMutation: executeMutation as never,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      available: false,
      mutationExecuted: false,
      claimContext: {
        claimId: "claim-1",
        workflowStatus: "draft",
        expectedVersion: 7,
      },
      idempotencyKey: input.idempotencyKey,
      externalEventId: input.externalEventId,
      reasonCode: input.reasonCode,
    });
    expect(executeMutation).not.toHaveBeenCalled();
    expect(appendAudit).toHaveBeenCalledWith(expect.objectContaining({
      claimId: "claim-1",
      result: "prerequisite_passed_no_mutation",
    }));
  });

  it("maps claim resolution failures to safe unavailable errors", async () => {
    const result = await prepareDoctorDashboardMutationPrerequisite(input, {
      resolveActor: async () => ({ ok: true, value: actor, client: {} }),
      resolveClaimContext: async () => {
        throw new Error("claim_context_unavailable");
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "CLAIM_CONTEXT_UNAVAILABLE",
      message: "Canonical claim context is unavailable for this Doctor Dashboard action.",
    });
  });
});
