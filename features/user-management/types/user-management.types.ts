export type UserAccountStatus = "active" | "pending" | "locked" | "disabled" | "expired";
export type AIAccessLevel = "enabled" | "restricted" | "not_allowed";
export type GovernanceSeverity = "critical" | "high" | "medium" | "info";
export type SortOrder = "asc" | "desc";

export interface OrganizationScope {
  organizationId: string;
  organizationName: string;
  clinicIds: string[];
  clinicNames: string[];
  departmentIds: string[];
}

export interface UserRole {
  id: string;
  code: string;
  name: string;
  isPrimary: boolean;
  isHighPrivilege: boolean;
}

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  staffId?: string;
  roles: UserRole[];
  department?: { id: string; name: string };
  accessScope: OrganizationScope[];
  aiAccessLevel: AIAccessLevel;
  status: UserAccountStatus;
  consentRequired: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  failedLoginAttempts: number;
  activeSessions: number;
  securityReviewDue: boolean;
  systemManaged?: boolean;
}

export interface UserSummary {
  activeUsers: number;
  pendingInvites: number;
  lockedAccounts: number;
  highPrivilegeUsers: number;
  aiEnabledUsers: number;
  consentRequiredUsers: number;
}

export interface UserFilters {
  search: string;
  status: "all" | UserAccountStatus;
  role: string;
  departmentId: string;
  clinicId: string;
  aiAccess: "all" | AIAccessLevel;
  highPrivilege: "all" | "true";
  consentRequired: "all" | "true";
  sortBy: "displayName" | "role" | "department" | "status" | "lastLoginAt";
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface PaginatedUsers {
  users: UserAccount[];
  total: number;
}

export interface GovernanceAlert {
  id: string;
  severity: GovernanceSeverity;
  title: string;
  description: string;
  affectedUserCount: number;
  createdAt: string;
  recommendedAction: string;
}

export interface AccessActivity {
  id: string;
  eventType: string;
  actor: string;
  targetUser: string;
  occurredAt: string;
  scope: string;
  reason?: string;
  auditHref: string;
}

export interface CurrentUserPermissions {
  canView: boolean;
  canInvite: boolean;
  canEdit: boolean;
  canExportAudit: boolean;
  canReviewSecurity: boolean;
  canManageAi: boolean;
  canPerformDestructiveActions: boolean;
  readOnlyReason?: string;
}
