import { describe, expect, it } from "vitest";
import { departmentSchema } from "./department.schema";

const validPayload = {
  organizationId: "org-nexsure",
  clinicId: "clinic-bangkok",
  name: "Dermatology",
  code: "DERM-07",
  type: "clinical",
  managerId: null,
  description: "",
  phoneExtension: "1701",
  email: "",
  operatingHours: "08:00-17:00",
  costCenterCode: "CC-DERM",
  aiClinicalAccess: true,
  status: "active",
} as const;

describe("departmentSchema", () => {
  it("accepts a valid department payload", () => {
    expect(departmentSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects lowercase or spaced department codes", () => {
    expect(departmentSchema.safeParse({ ...validPayload, code: "derm 07" }).success).toBe(false);
  });
});
