import { clinicUsersMock } from "../data/clinic-users.mock";
import type {
  AuditMutationResult,
  ClinicUser,
  ClinicUserAuditEvent,
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
import { getAiAccessStatus } from "../constants/clinic-user-options";
import { getUserListIntelligence } from "../utils/user-list-intelligence";

let clinicUsers = [...clinicUsersMock];

export const userManagementService = {
  async getClinicUsers(query: ClinicUsersQuery): Promise<ClinicUsersResponse> {
    await wait();
    const search = query.search?.trim().toLowerCase() ?? "";
    const filtered = clinicUsers
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
      .filter((user) => !query.accessScope || user.clinicScopes.some((scope) => scope.dataAccessLevel === query.accessScope))
      .sort((left, right) => compareUsers(left, right, query.sort));

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
      summary: getSummary(clinicUsers),
    };
  },

  async getClinicUserById(userId: string): Promise<ClinicUser | undefined> {
    await wait();
    return clinicUsers.find((user) => user.id === userId);
  },

  async inviteClinicUser(payload: InviteClinicUserInput): Promise<AuditMutationResult> {
    await wait();
    const now = new Date().toISOString();
    const initials = payload.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    const user: ClinicUser = {
      id: `usr-${Date.now()}`,
      fullName: payload.fullName,
      initials: initials || "CU",
      employeeId: payload.employeeId || `EMP-${String(clinicUsers.length + 1200)}`,
      email: payload.email,
      phone: payload.phone,
      jobTitle: payload.jobTitle,
      professionalLicense: payload.professionalLicense,
      primaryRole: payload.primaryRole,
      additionalRoles: payload.additionalRole && payload.additionalRole !== "none" ? [payload.additionalRole] : [],
      departmentId: payload.departmentId,
      departmentName: departmentNameFor(payload.departmentId),
      clinicScopes: [
        {
          clinicId: payload.clinicId,
          clinicName: clinicNameFor(payload.clinicId),
          departmentIds: payload.departmentId ? [payload.departmentId] : [],
          dataAccessLevel: payload.dataAccessLevel,
        },
      ],
      aiAccessStatus: getAiAccessStatus(payload.aiAccessLevel),
      aiAccessLevel: payload.aiAccessLevel,
      aiPermissions: {
        viewAiSummary: payload.aiAccessLevel !== "disabled",
        generateSoapDraft: payload.aiAccessLevel === "clinical_assist" || payload.aiAccessLevel === "clinical_review" || payload.aiAccessLevel === "ai_administrator",
        viewIcdSuggestions: payload.aiAccessLevel !== "disabled",
        acceptAiRecommendation: payload.aiAccessLevel === "clinical_review" || payload.aiAccessLevel === "ai_administrator",
        overrideAiWarning: false,
      },
      status: "invited",
      mfaEnabled: false,
      createdAt: now,
      updatedAt: now,
      security: {
        failedAttempts: 0,
        activeSessions: 0,
        currentSession: "No active session",
        browserDevice: "Pending invitation",
        location: "Pending",
        maskedIpAddress: "Masked",
        mfaVerified: false,
      },
      auditTrail: [createAuditEvent("User invitation sent", "Clinic Admin", payload.auditReason, "Invite Dialog")],
    };
    clinicUsers = [user, ...clinicUsers];
    return { auditId: user.auditTrail[0].id, message: `Invitation sent to ${payload.fullName}` };
  },

  async createUser(payload: CreateUserFormValues): Promise<AuditMutationResult> {
    await wait();
    const now = new Date().toISOString();
    const fullName = payload.displayName.trim() || `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
    const user: ClinicUser = {
      id: `usr-${Date.now()}`,
      fullName,
      initials: getInitials(payload.firstName, payload.lastName),
      employeeId: payload.employeeId || `EMP-${String(clinicUsers.length + 1200)}`,
      email: payload.email,
      phone: payload.mobile || undefined,
      jobTitle: payload.jobTitle || undefined,
      professionalLicense: payload.licenseNumber || undefined,
      primaryRole: payload.primaryRole || "clinic_staff",
      additionalRoles: payload.additionalRoles,
      departmentId: payload.departmentId || undefined,
      departmentName: payload.departmentId || "Unassigned",
      clinicScopes: [
        {
          clinicId: payload.clinicId,
          clinicName: clinicNameFor(payload.clinicId),
          departmentIds: payload.departmentId ? [payload.departmentId] : [],
          dataAccessLevel: accessScopeToDataAccess(payload.accessScope),
        },
      ],
      aiAccessStatus: payload.aiEnabled ? "enabled" : "disabled",
      aiAccessLevel: payload.aiEnabled ? "clinical_assist" : "disabled",
      aiPermissions: {
        viewAiSummary: true,
        generateSoapDraft: false,
        viewIcdSuggestions: true,
        acceptAiRecommendation: false,
        overrideAiWarning: false,
      },
      status: payload.sendInvitation ? "invited" : "inactive",
      mfaEnabled: payload.requireMfa,
      createdAt: now,
      updatedAt: now,
      security: {
        failedAttempts: 0,
        activeSessions: 0,
        currentSession: "Pending first sign in",
        browserDevice: "Pending activation",
        location: "Pending",
        maskedIpAddress: "Masked",
        mfaVerified: false,
      },
      auditTrail: [
        createAuditEvent(
          payload.sendInvitation ? "User created and invitation sent" : "User created without invitation",
          "Clinic Admin",
          "New user management frontend",
          "Create User Page",
        ),
      ],
    };
    clinicUsers = [user, ...clinicUsers];
    return { auditId: user.auditTrail[0].id, message: `User created for ${fullName}` };
  },

  async saveDraft(payload: CreateUserFormValues): Promise<AuditMutationResult> {
    await wait();
    return {
      auditId: `audit-user-draft-${Date.now()}`,
      message: `Draft saved for ${payload.email || "new user"}`,
    };
  },

  async updateClinicUser(userId: string, payload: UpdateClinicUserInput): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, ...payload, updatedAt: new Date().toISOString(), auditTrail: [createAuditEvent("User profile updated", "Clinic Admin", payload.auditReason, "User Detail"), ...user.auditTrail] }));
    return createResult("profile-updated");
  },

  async updateUserRoles(userId: string, payload: UpdateUserRolesInput): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, primaryRole: payload.primaryRole, additionalRoles: payload.additionalRoles, auditTrail: [createAuditEvent("Role assigned", "Clinic Admin", payload.reason, "Role Manager"), ...user.auditTrail] }));
    return createResult("roles-updated");
  },

  async updateUserClinicAccess(userId: string, payload: UpdateClinicAccessInput): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, clinicScopes: payload.clinicScopes, auditTrail: [createAuditEvent("Clinic access changed", "Clinic Admin", payload.reason, "Access Scope"), ...user.auditTrail] }));
    return createResult("clinic-access-updated");
  },

  async updateUserAiAccess(userId: string, payload: UpdateAiAccessInput): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({
      ...user,
      aiAccessLevel: payload.aiAccessLevel,
      aiAccessStatus: getAiAccessStatus(payload.aiAccessLevel),
      aiPermissions: payload.permissions,
      auditTrail: [createAuditEvent("AI permission changed", "Clinic Admin", payload.reason, "AI Permissions"), ...user.auditTrail],
    }));
    return createResult("ai-access-updated");
  },

  async suspendClinicUser(userId: string, payload: SuspendUserInput): Promise<AuditMutationResult> {
    await wait();
    if (!payload.reason.trim()) throw new Error("Suspend reason is required.");
    updateUser(userId, (user) => ({ ...user, status: "suspended", auditTrail: [createAuditEvent("Account suspended", "Clinic Admin", payload.reason, "Bulk User Management"), ...user.auditTrail] }));
    return createResult("user-suspended");
  },

  async reactivateClinicUser(userId: string): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, status: "active", auditTrail: [createAuditEvent("Account reactivated", "Clinic Admin", "Authorized reactivation", "User Action Menu"), ...user.auditTrail] }));
    return createResult("user-reactivated");
  },

  async unlockClinicUser(userId: string): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, status: "active", security: { ...user.security, failedAttempts: 0 }, auditTrail: [createAuditEvent("Account unlocked", "Clinic Admin", "Security review completed", "Security Tab"), ...user.auditTrail] }));
    return createResult("user-unlocked");
  },

  async resendUserInvitation(userId: string): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, auditTrail: [createAuditEvent("Invitation resent", "Clinic Admin", "User did not receive first invitation", "User Action Menu"), ...user.auditTrail] }));
    return createResult("invitation-resent");
  },

  async revokeUserSessions(userId: string): Promise<AuditMutationResult> {
    await wait();
    updateUser(userId, (user) => ({ ...user, security: { ...user.security, activeSessions: 0 }, auditTrail: [createAuditEvent("Session revoked", "Clinic Admin", "Security action confirmed", "Security Tab"), ...user.auditTrail] }));
    return createResult("sessions-revoked");
  },

  async exportClinicUsers(query: ClinicUsersQuery): Promise<AuditMutationResult> {
    await wait();
    return { auditId: `audit-export-${Date.now()}`, message: `Export generated for page ${query.page}` };
  },
};

function updateUser(userId: string, updater: (user: ClinicUser) => ClinicUser) {
  clinicUsers = clinicUsers.map((user) => (user.id === userId ? updater(user) : user));
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

function createAuditEvent(event: string, actor: string, reason: string, source: string): ClinicUserAuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    event,
    actor,
    occurredAt: new Date().toISOString(),
    reason,
    source,
    result: "success",
  };
}

function createResult(action: string): AuditMutationResult {
  return { auditId: `audit-${action}-${Date.now()}`, message: "Action completed successfully" };
}

function departmentNameFor(departmentId?: string) {
  const names: Record<string, string> = {
    "general-medicine": "General Medicine",
    nursing: "Nursing",
    pharmacy: "Pharmacy",
    claims: "Claims",
    compliance: "Compliance",
    administration: "Administration",
    executive: "Executive",
  };
  return departmentId ? names[departmentId] ?? "Unassigned" : "Unassigned";
}

function clinicNameFor(clinicId: string) {
  const names: Record<string, string> = {
    "clinic-bangkok": "NexSure Medical Center - Bangkok",
    "clinic-sukhumvit": "Sukhumvit Clinic",
    "clinic-rama9": "Rama 9 Clinic",
    central: "NexSure Central Clinic",
    sathorn: "NexSure Sathorn Clinic",
    rama9: "NexSure Rama 9 Clinic",
    main: "Sukhumvit Main Hospital",
    wellness: "Sukhumvit Wellness Center",
  };
  return names[clinicId] ?? "Assigned Clinic";
}

function accessScopeToDataAccess(scope: CreateUserFormValues["accessScope"]) {
  if (scope === "organization_wide") return "cross_clinic_view_only";
  if (scope === "selected_clinics" || scope === "primary_clinic") return "assigned_clinic";
  return "assigned_clinic";
}

function getInitials(firstName: string, lastName: string) {
  const initials = `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase();
  return initials || "NU";
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 180));
}
