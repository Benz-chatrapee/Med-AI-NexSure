import { describe, expect, it } from "vitest";
import { createOrganizationSettingsDefaults, organizationSettingsSchema } from "./organization-settings-schema";

describe("organizationSettingsSchema", () => {
  it("accepts the default enterprise configuration", () => {
    expect(organizationSettingsSchema.safeParse(createOrganizationSettingsDefaults()).success).toBe(true);
  });

  it("rejects claim weights that do not total exactly 100", () => {
    const settings = createOrganizationSettingsDefaults();
    settings.claimReadiness.scoringModel[0].weight = 30;

    const result = organizationSettingsSchema.safeParse(settings);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("total exactly 100"))).toBe(true);
  });

  it("rejects readiness ranges with gaps or overlaps", () => {
    const settings = createOrganizationSettingsDefaults();
    settings.claimReadiness.thresholds[1].maximum = 80;

    const result = organizationSettingsSchema.safeParse(settings);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("cover 0-100"))).toBe(true);
  });

  it("keeps mandatory human review enabled", () => {
    const settings = createOrganizationSettingsDefaults();
    settings.aiGovernance.mandatoryHumanReview = false;

    const result = organizationSettingsSchema.safeParse(settings);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("Human review"))).toBe(true);
  });

  it("rejects invalid queue and cost thresholds", () => {
    const settings = createOrganizationSettingsDefaults();
    settings.dashboard.queueSnapshots[0].criticalThreshold = 2;
    settings.dashboard.queueSnapshots[0].attentionThreshold = 5;
    settings.economicIntelligence.expectedCostMaximum = 1000;
    settings.economicIntelligence.expectedCostMinimum = 2000;

    const result = organizationSettingsSchema.safeParse(settings);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("Critical threshold"))).toBe(true);
    expect(result.error?.issues.some((issue) => issue.message.includes("maximum must be greater"))).toBe(true);
  });

  it("rejects disabling a capability with active dependencies", () => {
    const settings = createOrganizationSettingsDefaults();
    const engine = settings.capabilities.items.find((item) => item.key === "ai_clinical_engine");
    if (!engine) throw new Error("Missing AI Clinical Engine capability");
    engine.enabled = false;

    const result = organizationSettingsSchema.safeParse(settings);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("dependencies"))).toBe(true);
  });
});
