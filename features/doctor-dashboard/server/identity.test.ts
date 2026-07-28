import { describe, expect, it, vi } from "vitest";
import { resolveDoctorDashboardActor } from "./identity";
import type { ServerSessionContextClient } from "../../../lib/auth/server-session-context";

vi.mock("server-only", () => ({}));

describe("resolveDoctorDashboardActor", () => {
  it("rejects unauthenticated users without returning dashboard context", async () => {
    const actor = await resolveDoctorDashboardActor({
      resolveSession: async () => ({
        status: "unauthenticated",
        reason: "missing_or_invalid_session",
      }),
    });

    expect(actor).toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Doctor dashboard requires an authenticated session.",
    });
  });

  it("derives tenant, clinic, role, and permission context from the server session", async () => {
    const actor = await resolveDoctorDashboardActor({
      resolveSession: async () => ({
        status: "authenticated",
        client: {} as ServerSessionContextClient,
        context: {
          authUserId: "user-1",
          profileId: "profile-1",
          activeOrganizationId: "org-1",
          authorizedOrganizationIds: ["org-1"],
          activeClinicId: "clinic-1",
          authorizedClinicIds: ["clinic-1", "clinic-2"],
          roles: ["doctor"],
          permissions: [
            "patient.view",
            "visit.view",
            "claim.read",
            "claim.clinical.read",
            "claim.evidence.read",
            "claim.medical_coding.read",
          ],
          sessionState: "authenticated",
          sessionExpiresAt: null,
        },
      }),
    });

    expect(actor.ok).toBe(true);
    if (!actor.ok) return;
    expect(actor.value).toMatchObject({
      profileId: "profile-1",
      activeOrganizationId: "org-1",
      activeClinicId: "clinic-1",
      authorizedClinicIds: ["clinic-1", "clinic-2"],
      roles: ["doctor"],
      permissions: [
        "patient.view",
        "visit.view",
        "claim.read",
        "claim.clinical.read",
        "claim.evidence.read",
        "claim.medical_coding.read",
      ],
    });
  });
});
