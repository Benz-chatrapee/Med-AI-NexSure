import { describe, expect, it } from "vitest";
import { createUserSchema } from "./create-user-schema";
import type { CreateUserFormValues } from "../types/user-management.types";

const validUser: CreateUserFormValues = {
  firstName: "Narin",
  lastName: "Wongchai",
  displayName: "Dr. Narin Wongchai",
  email: "narin.w@nexsure.health",
  mobile: "+66 81 234 5678",
  employeeId: "EMP-1201",
  jobTitle: "Physician",
  licenseNumber: "MD-TH-4287",
  organizationId: "nexsure-healthcare",
  clinicId: "sukhumvit",
  departmentId: "general-medicine",
  locationId: "",
  additionalClinics: [],
  accessScope: "primary_clinic",
  primaryRole: "doctor",
  additionalRoles: [],
  permissionTemplate: "role_recommended",
  customPermissions: [],
  privilegedReason: "",
  aiEnabled: true,
  aiPermissionLevels: {
    clinical_summary: "generate",
    icd_suggestion: "review",
    differential_support: "review",
    prescription_safety: "review",
    claim_readiness: "view",
    missing_evidence: "view",
    insurance_rule_validation: "no_access",
    economic_intelligence: "no_access",
    evidence_package_generation: "no_access",
  },
  patientDataAccess: "clinic_scope",
  clinicalRecordAccess: ["view", "create", "update", "review"],
  claimDataAccess: ["view"],
  auditLogAccess: "own_activity",
  exportPermissions: ["no_export"],
  accountStatus: "invited",
  authenticationMethod: "email_password",
  sessionTimeout: "30",
  language: "en",
  timezone: "Asia/Bangkok",
  effectiveDate: "2026-07-16",
  expirationDate: "",
  requirePasswordChange: true,
  requireMfa: true,
  sendInvitation: true,
  inviteLanguage: "en",
  inviteExpiry: "168",
  welcomeMessage: "",
  loginRestriction: "standard",
  ipRestriction: "",
  temporaryAccess: false,
  securityNotification: true,
  lockOnRiskDetection: true,
  scheduleActivation: false,
  setTemporaryPassword: false,
  notifyAdministrator: true,
  acknowledgedAiSuggestion: false,
  permissionMatrix: {
    dashboard: ["view"],
    patient: [],
    visit: [],
    soap: [],
    ai_clinical: [],
    diagnosis: [],
    prescription: [],
    certificate: [],
    claim: [],
    evidence: [],
    insurance: [],
    economic: [],
    audit: [],
    users: [],
    settings: [],
  },
};

describe("createUserSchema", () => {
  it("requires MFA for high-risk roles", () => {
    const result = createUserSchema.safeParse({ ...validUser, primaryRole: "organization_admin", requireMfa: false });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Multi-Factor Authentication");
  });

  it("blocks draft users from sending invitations", () => {
    const result = createUserSchema.safeParse({ ...validUser, accountStatus: "draft", sendInvitation: true });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Draft");
  });

  it("requires privileged access reason for export permission", () => {
    const result = createUserSchema.safeParse({ ...validUser, exportPermissions: ["csv"], privilegedReason: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("เหตุผล");
  });

  it("rejects AI confirmation for non-clinical roles", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      primaryRole: "claim_reviewer",
      licenseNumber: "",
      aiPermissionLevels: { ...validUser.aiPermissionLevels, icd_suggestion: "confirm" },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Confirm AI Output");
  });
});
