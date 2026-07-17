import { describe, expect, it } from "vitest";
import { getUserListIntelligence, isPrivilegedUser } from "./user-list-intelligence";
import type { ClinicUser } from "../types/user-management.types";

const baseUser: ClinicUser = {
  id: "usr-test",
  fullName: "Test User",
  initials: "TU",
  employeeId: "EMP-1",
  email: "test@nexsure.health",
  primaryRole: "doctor",
  additionalRoles: [],
  clinicScopes: [{ clinicId: "clinic-bangkok", clinicName: "Bangkok", departmentIds: ["general-medicine"], dataAccessLevel: "assigned_clinic" }],
  aiAccessStatus: "enabled",
  aiAccessLevel: "clinical_assist",
  aiPermissions: { viewAiSummary: true, generateSoapDraft: true, viewIcdSuggestions: true, acceptAiRecommendation: false, overrideAiWarning: false },
  status: "active",
  mfaEnabled: true,
  lastLoginAt: "2026-07-15T09:00:00+07:00",
  createdAt: "2026-07-01T09:00:00+07:00",
  updatedAt: "2026-07-15T09:00:00+07:00",
  security: { failedAttempts: 0, activeSessions: 1, currentSession: "Chrome", browserDevice: "Chrome", location: "Bangkok", maskedIpAddress: "10.1.**.1", mfaVerified: true },
  auditTrail: [],
};

describe("user-list intelligence", () => {
  it("identifies privileged users from role, broad scope, or AI admin access", () => {
    expect(isPrivilegedUser({ ...baseUser, primaryRole: "clinic_admin" })).toBe(true);
    expect(isPrivilegedUser({ ...baseUser, aiAccessLevel: "ai_administrator" })).toBe(true);
    expect(isPrivilegedUser({ ...baseUser, clinicScopes: [{ ...baseUser.clinicScopes[0], dataAccessLevel: "cross_clinic_view_only" }] })).toBe(true);
    expect(isPrivilegedUser(baseUser)).toBe(false);
  });

  it("summarizes security, audit, and activity counts deterministically", () => {
    const result = getUserListIntelligence([
      baseUser,
      { ...baseUser, id: "locked", status: "locked", security: { ...baseUser.security, failedAttempts: 5 } },
      { ...baseUser, id: "invited", status: "invited", lastLoginAt: undefined, aiAccessStatus: "disabled", aiAccessLevel: "disabled" },
    ]);

    expect(result.lockedAccounts).toBe(1);
    expect(result.failedLoginAlerts).toBe(1);
    expect(result.neverLoggedIn).toBe(1);
    expect(result.aiEnabledUsers).toBe(2);
  });
});
