import { describe, expect, it } from "vitest";
import { calculateAccessRisk } from "./access-risk";
import type { CreateUserFormValues } from "../types/user-management.types";

const baseValues: CreateUserFormValues = {
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

describe("calculateAccessRisk", () => {
  it("returns low risk for clinic-scoped clinical access without exports", () => {
    const result = calculateAccessRisk(baseValues);

    expect(result.level).toBe("Low");
    expect(result.highRiskCount).toBe(0);
  });

  it("returns high risk for organization-wide access with export and user management permissions", () => {
    const result = calculateAccessRisk({
      ...baseValues,
      primaryRole: "organization_admin",
      accessScope: "organization_wide",
      patientDataAccess: "organization_scope",
      customPermissions: ["user_management", "data_export"],
      exportPermissions: ["csv", "evidence_package"],
      auditLogAccess: "organization_scope",
    });

    expect(result.level).toBe("High");
    expect(result.alerts).toEqual(expect.arrayContaining(["Organization-wide patient access", "Data export permission", "User management permission"]));
  });
});
