import type { ClinicUser } from "../types/user-management.types";

const privilegedRoles: Array<ClinicUser["primaryRole"]> = ["system_admin", "organization_admin", "clinic_admin", "compliance_officer", "auditor_compliance"];

export interface UserListIntelligence {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  pendingInvitations: number;
  lockedAccounts: number;
  recentlyActiveUsers: number;
  aiEnabledUsers: number;
  privilegedAccounts: number;
  newUsersThisMonth: number;
  inactiveOver30Days: number;
  failedLoginAlerts: number;
  passwordResetRequests: number;
  suspiciousActivity: number;
  mfaEnabledUsers: number;
  dormantAccounts: number;
  criticalSecurityAlerts: number;
  neverLoggedIn: number;
}

export function isPrivilegedUser(user: ClinicUser) {
  return (
    privilegedRoles.includes(user.primaryRole) ||
    user.additionalRoles.some((role) => privilegedRoles.includes(role)) ||
    user.aiAccessLevel === "ai_administrator" ||
    user.clinicScopes.some((scope) => scope.dataAccessLevel === "cross_clinic_view_only")
  );
}

export function getSecurityStatus(user: ClinicUser): "Critical" | "Review" | "MFA Ready" | "Standard" {
  if (user.status === "locked" || user.security.failedAttempts >= 5) return "Critical";
  if (!user.mfaEnabled || user.status === "invited" || !user.lastLoginAt) return "Review";
  if (user.security.mfaVerified) return "MFA Ready";
  return "Standard";
}

export function getAuditStatus(user: ClinicUser): "Current" | "Review Due" | "Missing" {
  if (!user.auditTrail.length) return "Missing";
  const latest = Math.max(...user.auditTrail.map((event) => new Date(event.occurredAt).getTime()));
  const days = (Date.now() - latest) / 86400000;
  return days > 30 ? "Review Due" : "Current";
}

export function getUserListIntelligence(users: ClinicUser[], now = new Date("2026-07-16T00:00:00+07:00")): UserListIntelligence {
  const thirtyDaysAgo = now.getTime() - 30 * 86400000;
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === "active").length,
    disabledUsers: users.filter((user) => user.status === "inactive" || user.status === "suspended").length,
    pendingInvitations: users.filter((user) => user.status === "invited").length,
    lockedAccounts: users.filter((user) => user.status === "locked").length,
    recentlyActiveUsers: users.filter((user) => dateValue(user.lastActiveAt ?? user.lastLoginAt) >= now.getTime() - 7 * 86400000).length,
    aiEnabledUsers: users.filter((user) => user.aiAccessStatus === "enabled").length,
    privilegedAccounts: users.filter(isPrivilegedUser).length,
    newUsersThisMonth: users.filter((user) => dateValue(user.createdAt) >= monthStart.getTime()).length,
    inactiveOver30Days: users.filter((user) => dateValue(user.lastLoginAt ?? user.lastActiveAt) < thirtyDaysAgo).length,
    failedLoginAlerts: users.filter((user) => user.security.failedAttempts >= 3).length,
    passwordResetRequests: users.filter((user) => user.status === "invited" || !user.mfaEnabled).length,
    suspiciousActivity: users.filter((user) => user.security.failedAttempts >= 5 || (isPrivilegedUser(user) && !user.mfaEnabled)).length,
    mfaEnabledUsers: users.filter((user) => user.mfaEnabled).length,
    dormantAccounts: users.filter((user) => !user.lastLoginAt || dateValue(user.lastLoginAt) < thirtyDaysAgo).length,
    criticalSecurityAlerts: users.filter((user) => getSecurityStatus(user) === "Critical").length,
    neverLoggedIn: users.filter((user) => !user.lastLoginAt).length,
  };
}

function dateValue(value?: string) {
  return value ? new Date(value).getTime() : 0;
}
