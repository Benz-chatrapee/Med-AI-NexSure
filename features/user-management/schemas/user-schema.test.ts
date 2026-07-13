import { describe, expect, it } from "vitest";
import { inviteClinicUserSchema } from "./user-schema";

const validInvite = {
  fullName: "Dr. Narin Wongchai",
  email: "narin.w@nexsure.health",
  employeeId: "EMP-1201",
  phone: "+66 81 000 0000",
  jobTitle: "Senior Physician",
  professionalLicense: "MD-TH-4287",
  primaryRole: "doctor",
  departmentId: "general-medicine",
  clinicId: "clinic-bangkok",
  dataAccessLevel: "assigned_clinic",
  accessExpiresAt: "",
  additionalRole: "none",
  aiAccessLevel: "clinical_assist",
  permissionTemplate: "role_recommended",
};

describe("inviteClinicUserSchema", () => {
  it("requires a professional license for doctor invitations", () => {
    const result = inviteClinicUserSchema.safeParse({
      ...validInvite,
      professionalLicense: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Professional License");
  });

  it("rejects duplicate primary and additional roles", () => {
    const result = inviteClinicUserSchema.safeParse({
      ...validInvite,
      additionalRole: "doctor",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Additional role");
  });

  it("blocks executive users from clinical review AI access", () => {
    const result = inviteClinicUserSchema.safeParse({
      ...validInvite,
      primaryRole: "executive",
      professionalLicense: "",
      aiAccessLevel: "clinical_review",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Executive");
  });
});
