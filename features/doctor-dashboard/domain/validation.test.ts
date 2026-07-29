import { describe, expect, it } from "vitest";
import {
  validateDoctorDashboardFilters,
  validateDoctorDashboardMutationPrerequisiteInput,
} from "./validation";

describe("validateDoctorDashboardFilters", () => {
  it("normalizes empty input to canonical read defaults without demo values", () => {
    const result = validateDoctorDashboardFilters({});

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      dateRange: "today",
      clinic: "",
      department: "",
      doctor: "",
      search: "",
      readinessStatus: "",
      riskLevel: "",
      visitStatus: "",
      priority: "",
      gapType: "",
    });
  });

  it("rejects unsupported filter enum values before querying canonical data", () => {
    const result = validateDoctorDashboardFilters({
      dateRange: "forever",
      riskLevel: "Extreme",
    });

    expect(result).toEqual({
      ok: false,
      error: "Doctor dashboard filters are invalid.",
    });
  });
});

describe("validateDoctorDashboardMutationPrerequisiteInput", () => {
  it("accepts reason code and idempotency identity prerequisites", () => {
    const result = validateDoctorDashboardMutationPrerequisiteInput({
      visitId: "visit-1",
      action: "markReadyForHumanReview",
      reasonCode: "READY_FOR_REVIEW",
      idempotencyKey: "doctor-dashboard:visit-1:READY_FOR_REVIEW:1",
      externalEventId: "external-event:visit-1:1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      visitId: "visit-1",
      action: "markReadyForHumanReview",
      reasonCode: "READY_FOR_REVIEW",
    });
  });

  it("rejects unsafe reason codes and weak idempotency identities", () => {
    const result = validateDoctorDashboardMutationPrerequisiteInput({
      visitId: "visit-1",
      action: "claimReviewHandoff",
      reasonCode: "ready now",
      idempotencyKey: "short",
      externalEventId: "external-event:visit-1:1",
    });

    expect(result).toEqual({
      ok: false,
      error: "Doctor dashboard mutation prerequisite input is invalid.",
    });
  });
});
