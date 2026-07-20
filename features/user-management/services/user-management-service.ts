import { coreFoundationService, type CoreRoleAssignment } from "../../core-foundation/services/core-foundation-service";
import type {
  AuditMutationResult,
  ClinicUser,
  ClinicUserRole,
  ClinicUsersQuery,
  ClinicUsersResponse,
  ClinicUsersSummary,
  CreateUserFormValues,
  InviteClinicUserInput,
  SuspendUserInput,
  UpdateAiAccessInput,
  UpdateClinicAccessInput,
  UpdateClinicUserInput,
  UpdateUserRolesInput,
} from "../types/user-management.types";
import { getUserListIntelligence } from "../utils/user-list-intelligence";

const BLOCKED_PROVISIONING_MESSAGE =
  "User provisioning requires an approved Supabase Auth workflow and is not enabled in Phase 1. ไม่สามารถสร้างบัญชีผู้ใช้โดยใช้ service role จากหน้าเว็บได้";
const BLOCKED_PROFILE_MESSAGE =
  "This profile/session action is not backed by an approved Phase 1 Core Foundation workflow. กรุณาใช้ workflow ที่มีการควบคุมและ audit เท่านั้น";

export const userManagementService = {
  async getClinicUsers(query: ClinicUsersQuery): Promise<ClinicUsersResponse> {
    const users = await coreFoundationService.listClinicUsers();
    const filtered = filterUsers(users, query).sort((left, right) => compareUsers(left, right, query.sort));
    const pageSize = query.pageSize;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(Math.max(query.page, 1), totalPages);
    const start = (page - 1) * pageSize;

    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages,
      summary: getSummary(users),
    };
  },

  async getClinicUserById(userId: string): Promise<ClinicUser | undefined> {
    return (await coreFoundationService.getClinicUserById(userId)) ?? undefined;
  },

  async inviteClinicUser(_payload: InviteClinicUserInput): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROVISIONING_MESSAGE);
  },

  async createUser(_payload: CreateUserFormValues): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROVISIONING_MESSAGE);
  },

  async saveDraft(payload: CreateUserFormValues): Promise<AuditMutationResult> {
    return {
      auditId: "not-persisted",
      message: `Draft for ${payload.email || "new user"} was not persisted because Phase 1 has no controlled draft workflow.`,
    };
  },

  async updateClinicUser(_userId: string, _payload: UpdateClinicUserInput): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async updateUserRoles(userId: string, payload: UpdateUserRolesInput): Promise<AuditMutationResult> {
    if (!payload.reason.trim()) throw new Error("Change reason is required.");
    const [user, roles, assignments] = await Promise.all([
      coreFoundationService.getClinicUserById(userId),
      coreFoundationService.listRoles(),
      coreFoundationService.listRoleAssignments(),
    ]);
    if (!user) throw new Error("User not found or not visible in your organization scope.");

    const desiredRoles = uniqueRoles([payload.primaryRole, ...payload.additionalRoles]);
    const activeAssignments = assignments.filter((assignment) => assignment.userProfileId === userId && assignment.status === "active" && !assignment.revokedAt);
    const activeRoleNames = activeAssignments.map((assignment) => roleNameForAssignment(assignment, roles)).filter((role): role is ClinicUserRole => Boolean(role));
    const primaryClinicId = user.clinicScopes[0]?.clinicId;
    if (!primaryClinicId) throw new Error("User has no visible clinic scope for role assignment.");

    const organizationId = activeAssignments[0]?.organizationId ?? roles.find((role) => desiredRoles.includes(normalizeRoleName(role.name) ?? "clinic_staff"))?.organizationId;
    if (!organizationId) throw new Error("Organization scope is not visible for role assignment.");

    for (const role of desiredRoles.filter((role) => !activeRoleNames.includes(role))) {
      const roleId = roles.find((item) => normalizeRoleName(item.name) === role)?.id;
      if (!roleId) throw new Error(`Role ${role} is not visible in your organization scope.`);
      await coreFoundationService.assignRole({ organizationId, clinicId: primaryClinicId, targetProfileId: userId, roleId, reason: payload.reason });
    }

    for (const assignment of activeAssignments.filter((assignment) => {
      const role = roleNameForAssignment(assignment, roles);
      return role ? !desiredRoles.includes(role) : false;
    })) {
      await coreFoundationService.revokeRoleAssignment({ assignmentId: assignment.id, reason: payload.reason });
    }

    return { auditId: "role-workflow-complete", message: "Role workflow completed through controlled Core Foundation RPCs." };
  },

  async updateUserClinicAccess(_userId: string, _payload: UpdateClinicAccessInput): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async updateUserAiAccess(_userId: string, _payload: UpdateAiAccessInput): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async suspendClinicUser(_userId: string, _payload: SuspendUserInput): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async reactivateClinicUser(_userId: string): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async unlockClinicUser(_userId: string): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async resendUserInvitation(_userId: string): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROVISIONING_MESSAGE);
  },

  async revokeUserSessions(_userId: string): Promise<AuditMutationResult> {
    throw new Error(BLOCKED_PROFILE_MESSAGE);
  },

  async exportClinicUsers(query: ClinicUsersQuery): Promise<AuditMutationResult> {
    const response = await this.getClinicUsers(query);
    return { auditId: "read-only-export", message: `Prepared read-only user export for ${response.total} visible users.` };
  },
};

function filterUsers(users: ClinicUser[], query: ClinicUsersQuery) {
  const search = query.search?.trim().toLowerCase() ?? "";
  return users
    .filter((user) => {
      const clinics = user.clinicScopes.map((scope) => scope.clinicName).join(" ");
      const searchable = `${user.fullName} ${user.email} ${user.employeeId} ${user.professionalLicense ?? ""} ${user.departmentName ?? ""} ${clinics}`.toLowerCase();
      return !search || searchable.includes(search);
    })
    .filter((user) => !query.role || user.primaryRole === query.role || user.additionalRoles.includes(query.role))
    .filter((user) => !query.status || user.status === query.status)
    .filter((user) => !query.invitationStatus || user.status === "invited")
    .filter((user) => !query.departmentId || user.departmentId === query.departmentId)
    .filter((user) => !query.aiAccessStatus || user.aiAccessStatus === query.aiAccessStatus)
    .filter((user) => !query.clinicId || user.clinicScopes.some((scope) => scope.clinicId === query.clinicId))
    .filter((user) => !query.accessScope || user.clinicScopes.some((scope) => scope.dataAccessLevel === query.accessScope));
}

function getSummary(users: ClinicUser[]): ClinicUsersSummary {
  const intelligence = getUserListIntelligence(users);
  return {
    ...intelligence,
    suspendedUsers: users.filter((user) => user.status === "suspended" || user.status === "locked" || user.status === "inactive").length,
  };
}

function compareUsers(left: ClinicUser, right: ClinicUser, sort: ClinicUsersQuery["sort"] = "recently_updated") {
  if (sort === "name") return left.fullName.localeCompare(right.fullName);
  if (sort === "last_login") return dateValue(right.lastLoginAt) - dateValue(left.lastLoginAt);
  if (sort === "status") return left.status.localeCompare(right.status) || left.fullName.localeCompare(right.fullName);
  return dateValue(right.updatedAt) - dateValue(left.updatedAt);
}

function dateValue(value?: string) {
  return value ? new Date(value).getTime() : 0;
}

function uniqueRoles(roles: ClinicUserRole[]) {
  return Array.from(new Set(roles));
}

function roleNameForAssignment(assignment: CoreRoleAssignment, roles: Awaited<ReturnType<typeof coreFoundationService.listRoles>>) {
  return normalizeRoleName(roles.find((role) => role.id === assignment.roleId)?.name);
}

function normalizeRoleName(roleName?: string | null): ClinicUserRole | null {
  if (!roleName) return null;
  const normalized = roleName.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
  const supported: ClinicUserRole[] = [
    "system_admin",
    "organization_admin",
    "clinic_admin",
    "clinic_manager",
    "doctor",
    "nurse",
    "pharmacist",
    "clinic_staff",
    "claim_reviewer",
    "auditor_compliance",
    "compliance_officer",
    "executive",
  ];
  return supported.includes(normalized as ClinicUserRole) ? (normalized as ClinicUserRole) : null;
}
