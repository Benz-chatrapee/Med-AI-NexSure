import type {
  AccessActivity,
  CurrentUserPermissions,
  GovernanceAlert,
  PaginatedUsers,
  UserAccount,
  UserFilters,
  UserRole,
  UserSummary,
} from "../types/user-management.types";

const roles: Record<string, UserRole> = {
  organization_admin: { id: "role-org-admin", code: "organization_admin", name: "Organization Admin", isPrimary: true, isHighPrivilege: true },
  clinic_admin: { id: "role-clinic-admin", code: "clinic_admin", name: "Clinic Admin", isPrimary: true, isHighPrivilege: true },
  doctor: { id: "role-doctor", code: "doctor", name: "Doctor", isPrimary: true, isHighPrivilege: false },
  nurse: { id: "role-nurse", code: "nurse", name: "Nurse", isPrimary: true, isHighPrivilege: false },
  pharmacist: { id: "role-pharmacist", code: "pharmacist", name: "Pharmacist", isPrimary: true, isHighPrivilege: false },
  claim_reviewer: { id: "role-claim-reviewer", code: "claim_reviewer", name: "Claim Reviewer", isPrimary: true, isHighPrivilege: false },
  compliance_officer: { id: "role-compliance", code: "compliance_officer", name: "Compliance Officer", isPrimary: true, isHighPrivilege: true },
  executive: { id: "role-executive", code: "executive", name: "Executive", isPrimary: true, isHighPrivilege: true },
  auditor: { id: "role-auditor", code: "auditor", name: "Auditor", isPrimary: true, isHighPrivilege: true },
};

const users: UserAccount[] = [
  createUser("usr-001", "Dr. Arisa Clinical", "arisa@medai.co", "DR", roles.doctor, "Clinical", "clinical", "Own Clinic", "active", "normal_access", "enabled", "Bangkok Clinic", ["bkk-clinic"], 0, true),
  createUser("usr-002", "Mali Nurse", "mali@clinic.co", "NS", roles.nurse, "Clinical Operations", "clinical-operations", "Department", "pending", "invite_sent", "restricted", "Bangkok Clinic", ["bkk-clinic"], 0, false),
  createUser("usr-003", "Narin ClaimOps", "narin@insurer.co", "CR", roles.claim_reviewer, "Claim Review", "claim-review", "Assigned Cases", "active", "phi_masked", "restricted", "Insurer HQ", ["insurer-hq"], 0, true),
  createUser("usr-004", "Suda Compliance", "suda@hospital.co", "CO", roles.compliance_officer, "Compliance", "compliance", "Organization", "locked", "failed_login", "not_allowed", "Hospital Branch A", ["hospital-a"], 7, true),
  createUser("usr-005", "Prasert Admin", "prasert@medai.co", "OA", roles.organization_admin, "Administration", "administration", "Organization", "active", "privileged_access", "enabled", "Bangkok Clinic", ["bkk-clinic", "hospital-a"], 0, true),
  createUser("usr-006", "Kanda Pharmacy", "kanda@hospital.co", "PH", roles.pharmacist, "Pharmacy", "pharmacy", "Department", "suspended", "review_required", "not_allowed", "Hospital Branch A", ["hospital-a"], 1, true),
  createUser("usr-007", "Viroj Executive", "viroj@insurer.co", "EX", roles.executive, "Executive", "executive", "Organization", "disabled", "unusual_login", "restricted", "Insurer HQ", ["insurer-hq"], 2, true),
];

export const userManagementService = {
  async getCurrentUserPermissions(): Promise<CurrentUserPermissions> {
    await wait();
    return {
      canView: true,
      canInvite: true,
      canEdit: true,
      canExportAudit: true,
      canExportAccessReport: true,
      canReviewSecurity: true,
      canManageAi: true,
      canSuspendUsers: true,
      canUnlockUsers: true,
      canViewAuditLog: true,
      canPerformDestructiveActions: true,
    };
  },
  async getUserSummary(): Promise<UserSummary> {
    await wait();
    return { totalUsers: 248, activeUsers: 219, pendingInvites: 14, lockedAccounts: 5, adminUsers: 11, last24hLogin: 137 };
  },
  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    await wait();
    const search = filters.search.trim().toLowerCase();
    const filtered = users
      .filter((user) => !search || `${user.displayName} ${user.email} ${user.roles[0]?.name ?? ""} ${user.department?.name ?? ""}`.toLowerCase().includes(search))
      .filter((user) => filters.status === "all" || user.status === filters.status)
      .filter((user) => filters.role === "all" || user.roles.some((role) => role.code === filters.role))
      .filter((user) => filters.departmentId === "all" || user.department?.id === filters.departmentId)
      .filter((user) => filters.clinicId === "all" || user.accessScope.some((scope) => scope.clinicIds.includes(filters.clinicId)))
      .filter((user) => filters.aiAccess === "all" || user.aiAccessLevel === filters.aiAccess);
    const sorted = filtered.toSorted((a, b) => getSortValue(a, filters.sortBy).localeCompare(getSortValue(b, filters.sortBy)) * (filters.sortOrder === "asc" ? 1 : -1));
    const start = (filters.page - 1) * filters.pageSize;
    return { users: sorted.slice(start, start + filters.pageSize), total: filtered.length === users.length ? 248 : sorted.length };
  },
  async getUserById(userId: string): Promise<UserAccount | undefined> {
    await wait();
    return users.find((user) => user.id === userId);
  },
  async getGovernanceAlerts(): Promise<GovernanceAlert[]> {
    await wait();
    return [
      { id: "safety-1", severity: "critical", title: "Critical Risk - Allergy Conflict", description: "Prescription action must be blocked until doctor or pharmacist review is completed.", affectedUserCount: 1, createdAt: "2026-07-13T03:30:00Z", recommendedAction: "Block prescription action" },
      { id: "safety-2", severity: "warning", title: "Missing Evidence - Needs Review", description: "SOAP incomplete and ICD code missing for claim readiness.", affectedUserCount: 8, createdAt: "2026-07-13T02:15:00Z", recommendedAction: "Complete SOAP and coding evidence" },
      { id: "safety-3", severity: "success", title: "Claim Ready - Completed", description: "Evidence package complete and ready for PDF export.", affectedUserCount: 31, createdAt: "2026-07-13T01:00:00Z", recommendedAction: "Proceed with controlled export" },
    ];
  },
  async getRecentActivity(): Promise<AccessActivity[]> {
    await wait();
    return [
      { id: "evt-1", eventType: "role_change", title: "Role changed: Nurse -> Clinic Admin", actor: "By Organization Admin", timestamp: "10:42", severity: "info", detail: "Privileged change logged with reason and before/after role metadata.", auditHref: "/audit-compliance?event=evt-1" },
      { id: "evt-2", eventType: "export", title: "Evidence Package exported", actor: "Claim Reviewer", timestamp: "09:20", severity: "success", detail: "PDF export logged", auditHref: "/audit-compliance?event=evt-2" },
      { id: "evt-3", eventType: "access_blocked", title: "Unauthorized access blocked", actor: "Reception attempted User Management route", timestamp: "08:55", severity: "warning", detail: "Route protection denied access outside approved role scope.", auditHref: "/audit-compliance?event=evt-3" },
    ];
  },
  async recordSensitiveAction(action: string, reason: string): Promise<{ auditId: string }> {
    await wait();
    if (!reason.trim()) throw new Error("Audit reason is required for sensitive actions.");
    return { auditId: `audit-${action}-${Date.now()}` };
  },
};

function createUser(
  id: string,
  displayName: string,
  email: string,
  initials: string,
  role: UserRole,
  departmentName: string,
  departmentId: string,
  scope: string,
  status: UserAccount["status"],
  riskSignal: UserAccount["riskSignal"],
  aiAccessLevel: UserAccount["aiAccessLevel"],
  organizationName: string,
  clinicIds: string[],
  failedLoginAttempts: number,
  mfaEnabled: boolean,
): UserAccount {
  const [firstName = "", ...rest] = displayName.replace("Dr. ", "").split(" ");
  return {
    id,
    firstName,
    lastName: rest.join(" "),
    displayName,
    email,
    initials,
    staffId: id.replace("usr", "STAFF"),
    roles: [role],
    department: { id: departmentId, name: departmentName },
    scope,
    accessScope: [{ organizationId: organizationName.toLowerCase().replaceAll(" ", "-"), organizationName, clinicIds, clinicNames: [organizationName], departmentIds: [departmentId] }],
    aiAccessLevel,
    status,
    riskSignal,
    claimAccess: role.code === "claim_reviewer" ? "Assigned cases" : role.isHighPrivilege ? "Organization oversight" : "View only",
    clinicalAccess: riskSignal === "phi_masked" ? "PHI masked" : role.code === "doctor" || role.code === "nurse" ? "Clinical workflow" : "Limited",
    auditAccessLevel: role.code === "compliance_officer" || role.code === "auditor" ? "Full" : role.isHighPrivilege ? "Summary" : "None",
    consentRequired: aiAccessLevel !== "not_allowed",
    mfaEnabled,
    lastLoginAt: status === "pending" ? undefined : "2026-07-13T03:20:00Z",
    createdAt: "2026-01-18T08:00:00Z",
    updatedAt: "2026-07-13T03:30:00Z",
    updatedBy: "Security Admin",
    failedLoginAttempts,
    activeSessions: status === "active" ? 1 : 0,
    securityReviewDue: status === "locked" || riskSignal === "review_required" || riskSignal === "unusual_login",
  };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 120));
}

function getSortValue(user: UserAccount, sortBy: UserFilters["sortBy"]) {
  if (sortBy === "role") return user.roles[0]?.name ?? "";
  if (sortBy === "department") return user.department?.name ?? "";
  if (sortBy === "status") return user.status;
  if (sortBy === "lastLoginAt") return user.lastLoginAt ?? "";
  return user.displayName;
}
