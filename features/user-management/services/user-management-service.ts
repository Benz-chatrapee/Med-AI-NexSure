import type { AccessActivity, CurrentUserPermissions, GovernanceAlert, PaginatedUsers, UserAccount, UserFilters, UserSummary } from "../types/user-management.types";

const adminRole = { id: "role-admin", code: "admin", name: "Organization Admin", isPrimary: true, isHighPrivilege: true };
const clinicAdminRole = { id: "role-clinic", code: "clinic_admin", name: "Clinic Admin", isPrimary: true, isHighPrivilege: true };
const auditorRole = { id: "role-auditor", code: "auditor", name: "Auditor / Compliance", isPrimary: true, isHighPrivilege: true };
const reviewerRole = { id: "role-reviewer", code: "claim_reviewer", name: "Claim Reviewer", isPrimary: true, isHighPrivilege: false };
const clinicianRole = { id: "role-clinician", code: "clinician", name: "Clinical Reviewer", isPrimary: true, isHighPrivilege: false };

const users: UserAccount[] = [
  createUser("usr-001", "Dr. Anong Srisai", "anong.srisai@medai.example", "active", adminRole, "Clinical Governance", "clinical", "enabled", false, 0, true),
  createUser("usr-002", "Mali Kiat", "mali.kiat@medai.example", "pending", reviewerRole, "Claim Operations", "claims", "restricted", true, 0, false),
  createUser("usr-003", "Kanda Viroj", "kanda.viroj@medai.example", "locked", auditorRole, "Compliance", "compliance", "not_allowed", false, 7, true),
  createUser("usr-004", "Niran Cho", "niran.cho@medai.example", "active", clinicianRole, "Clinical Governance", "clinical", "enabled", true, 1, false),
  createUser("usr-005", "Pim Arun", "pim.arun@medai.example", "disabled", clinicAdminRole, "Clinic Operations", "ops", "restricted", false, 0, true),
];

export const userManagementService = {
  async getCurrentUserPermissions(): Promise<CurrentUserPermissions> {
    await wait();
    return { canView: true, canInvite: true, canEdit: true, canExportAudit: true, canReviewSecurity: true, canManageAi: true, canPerformDestructiveActions: true };
  },
  async getUserSummary(): Promise<UserSummary> {
    await wait();
    return {
      activeUsers: users.filter((user) => user.status === "active").length,
      pendingInvites: users.filter((user) => user.status === "pending").length,
      lockedAccounts: users.filter((user) => user.status === "locked").length,
      highPrivilegeUsers: users.filter((user) => user.roles.some((role) => role.isHighPrivilege)).length,
      aiEnabledUsers: users.filter((user) => user.aiAccessLevel === "enabled").length,
      consentRequiredUsers: users.filter((user) => user.consentRequired).length,
    };
  },
  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    await wait();
    const search = filters.search.trim().toLowerCase();
    const filtered = users
      .filter((user) => !search || `${user.displayName} ${user.email} ${user.staffId ?? ""}`.toLowerCase().includes(search))
      .filter((user) => filters.status === "all" || user.status === filters.status)
      .filter((user) => filters.role === "all" || user.roles.some((role) => role.code === filters.role))
      .filter((user) => filters.departmentId === "all" || user.department?.id === filters.departmentId)
      .filter((user) => filters.clinicId === "all" || user.accessScope.some((scope) => scope.clinicIds.includes(filters.clinicId)))
      .filter((user) => filters.aiAccess === "all" || user.aiAccessLevel === filters.aiAccess)
      .filter((user) => filters.highPrivilege === "all" || user.roles.some((role) => role.isHighPrivilege))
      .filter((user) => filters.consentRequired === "all" || user.consentRequired);
    const sorted = filtered.toSorted((a, b) => getSortValue(a, filters.sortBy).localeCompare(getSortValue(b, filters.sortBy)) * (filters.sortOrder === "asc" ? 1 : -1));
    const start = (filters.page - 1) * filters.pageSize;
    return { users: sorted.slice(start, start + filters.pageSize), total: sorted.length };
  },
  async getUserById(userId: string): Promise<UserAccount | undefined> {
    await wait();
    return users.find((user) => user.id === userId);
  },
  async getGovernanceAlerts(): Promise<GovernanceAlert[]> {
    await wait();
    return [
      { id: "alert-1", severity: "critical", title: "Critical Login Risk", description: "Locked auditor account has repeated failed login attempts.", affectedUserCount: 1, createdAt: "2026-07-12T02:05:00Z", recommendedAction: "Review identity risk and require password reset." },
      { id: "alert-2", severity: "high", title: "High Privilege Review Due", description: "Privileged administrators require quarterly access review.", affectedUserCount: 3, createdAt: "2026-07-10T09:30:00Z", recommendedAction: "Confirm least-privilege scope with organization owner." },
      { id: "alert-3", severity: "medium", title: "PDPA Consent Gate", description: "AI-enabled users require consent validation before sensitive exports.", affectedUserCount: 2, createdAt: "2026-07-11T08:00:00Z", recommendedAction: "Validate consent workflow before granting export." },
    ];
  },
  async getRecentActivity(): Promise<AccessActivity[]> {
    await wait();
    return [
      { id: "evt-1", eventType: "Role assigned", actor: "Security Admin", targetUser: "Dr. Anong Srisai", occurredAt: "2026-07-10T09:30:00Z", scope: "NexSure Health / Bangkok Central", reason: "Quarterly access alignment", auditHref: "/audit-compliance?event=evt-1" },
      { id: "evt-2", eventType: "Account locked", actor: "Security Automation", targetUser: "Kanda Viroj", occurredAt: "2026-07-12T02:05:00Z", scope: "Compliance", reason: "Excessive failed login attempts", auditHref: "/audit-compliance?event=evt-2" },
      { id: "evt-3", eventType: "AI capability enabled", actor: "Dr. Anong Srisai", targetUser: "Niran Cho", occurredAt: "2026-07-08T11:00:00Z", scope: "Clinical Governance / Chiang Mai Clinic", reason: "SOAP summary pilot access", auditHref: "/audit-compliance?event=evt-3" },
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
  status: UserAccount["status"],
  role: UserAccount["roles"][number],
  departmentName: string,
  departmentId: string,
  aiAccessLevel: UserAccount["aiAccessLevel"],
  consentRequired: boolean,
  failedLoginAttempts: number,
  securityReviewDue: boolean,
): UserAccount {
  const [firstName = "", ...rest] = displayName.replace("Dr. ", "").split(" ");
  return {
    id,
    firstName,
    lastName: rest.join(" "),
    displayName,
    email,
    staffId: id.replace("usr", "STAFF"),
    roles: [role],
    department: { id: departmentId, name: departmentName },
    accessScope: [{ organizationId: "org-1", organizationName: "NexSure Health", clinicIds: ["bkk-1"], clinicNames: ["Bangkok Central"], departmentIds: [departmentId] }],
    aiAccessLevel,
    status,
    consentRequired,
    mfaEnabled: status !== "pending",
    lastLoginAt: status === "pending" ? undefined : "2026-07-12T10:20:00Z",
    createdAt: "2026-01-18T08:00:00Z",
    updatedAt: "2026-07-10T09:30:00Z",
    updatedBy: "Security Admin",
    failedLoginAttempts,
    activeSessions: status === "active" ? 1 : 0,
    securityReviewDue,
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
