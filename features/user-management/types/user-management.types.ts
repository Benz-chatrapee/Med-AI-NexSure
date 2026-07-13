export type UserAccountStatus = "active" | "pending" | "locked" | "suspended" | "disabled";
export type AIAccessLevel = "enabled" | "restricted" | "not_allowed";
export type GovernanceSeverity = "critical" | "warning" | "success" | "info";
export type SortOrder = "asc" | "desc";
export type AccessRiskSignal =
  | "normal_access"
  | "invite_sent"
  | "phi_masked"
  | "failed_login"
  | "privileged_access"
  | "unusual_login"
  | "review_required";
export type PermissionLevel =
  | "none"
  | "view"
  | "edit"
  | "create"
  | "verify"
  | "review"
  | "masked"
  | "history"
  | "audit"
  | "full"
  | "export_log"
  | "evidence"
  | "view_edit"
  | "version";

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
  initials: string;
  staffId?: string;
  roles: UserRole[];
  department?: { id: string; name: string };
  scope: string;
  accessScope: OrganizationScope[];
  aiAccessLevel: AIAccessLevel;
  status: UserAccountStatus;
  riskSignal: AccessRiskSignal;
  claimAccess: string;
  clinicalAccess: string;
  auditAccessLevel: string;
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
  totalUsers: number;
  activeUsers: number;
  pendingInvites: number;
  lockedAccounts: number;
  adminUsers: number;
  last24hLogin: number;
}

export interface UserFilters {
  search: string;
  status: "all" | UserAccountStatus;
  role: string;
  departmentId: string;
  clinicId: string;
  aiAccess: "all" | AIAccessLevel;
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
  eventType: "role_change" | "export" | "access_blocked" | "permission_update" | "account_lock" | "invite";
  actor: string;
  title: string;
  timestamp: string;
  severity: GovernanceSeverity;
  detail: string;
  reason?: string;
  auditHref: string;
}

export interface CurrentUserPermissions {
  canView: boolean;
  canInvite: boolean;
  canEdit: boolean;
  canExportAudit: boolean;
  canExportAccessReport: boolean;
  canReviewSecurity: boolean;
  canManageAi: boolean;
  canSuspendUsers: boolean;
  canUnlockUsers: boolean;
  canViewAuditLog: boolean;
  canPerformDestructiveActions: boolean;
  readOnlyReason?: string;
}
