import { describe, expect, it, vi } from "vitest";
import { getDoctorDashboard } from "./service";
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
