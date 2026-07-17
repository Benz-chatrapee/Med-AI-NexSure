import type { LucideIcon } from "lucide-react";

export type ClinicUserStatus = "active" | "invited" | "locked" | "suspended" | "inactive";
export type ClinicUserRole =
  | "system_admin"
  | "organization_admin"
  | "clinic_admin"
  | "clinic_manager"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "clinic_staff"
  | "claim_reviewer"
  | "auditor_compliance"
  | "compliance_officer"
  | "executive";
export type CreateUserRole = Extract<
  ClinicUserRole,
  "organization_admin" | "clinic_admin" | "doctor" | "nurse" | "pharmacist" | "clinic_staff" | "claim_reviewer" | "auditor_compliance" | "executive"
  | "system_admin"
>;
export type CreateUserAccessScope = "assigned_cases" | "primary_clinic" | "selected_clinics" | "organization_wide";
export type PermissionTemplate = "role_recommended" | "least_privilege" | "claim_review" | "audit_review" | "custom_permissions";
export type CustomPermissionId = "patient_management" | "claim_approval" | "audit_access" | "user_management" | "data_export" | "evidence_package";
export type AiPermissionId =
  | "clinical_summary"
  | "icd_suggestion"
  | "differential_support"
  | "prescription_safety"
  | "claim_readiness"
  | "missing_evidence"
  | "insurance_rule_validation"
  | "economic_intelligence"
  | "evidence_package_generation";
export type AiPermissionLevel = "no_access" | "view" | "generate" | "review" | "confirm";
export type PatientDataAccess = "no_access" | "assigned_cases" | "clinic_scope" | "selected_clinics" | "organization_scope";
export type ClinicalRecordPermission = "view" | "create" | "update" | "review" | "approve";
export type ClaimDataPermission = "view" | "review" | "approve" | "export";
export type AuditLogAccess = "no_access" | "own_activity" | "clinic_scope" | "organization_scope";
export type ExportPermission = "no_export" | "pdf" | "csv" | "evidence_package" | "audit_report";
export type AccountStatus = "draft" | "invited" | "active" | "suspended";
export type AuthenticationMethod = "email_password" | "passwordless" | "sso";
export type PermissionAction = "view" | "create" | "edit" | "approve" | "export" | "admin";
export type PermissionRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AiAccessStatus = "enabled" | "restricted" | "disabled";
export type AiAccessLevel = "disabled" | "view_only" | "clinical_assist" | "clinical_review" | "ai_administrator";
export type DataAccessLevel = "assigned_department" | "assigned_clinic" | "cross_clinic_view_only";
export type ClinicUsersSort = "name" | "recently_updated" | "last_login" | "status";
export type AuditResult = "success" | "warning" | "blocked";

export interface ClinicAccessScope {
  clinicId: string;
  clinicName: string;
  departmentIds: string[];
  dataAccessLevel: DataAccessLevel;
}

export interface ClinicUserSecurity {
  failedAttempts: number;
  activeSessions: number;
  currentSession: string;
  browserDevice: string;
  location: string;
  maskedIpAddress: string;
  mfaVerified: boolean;
}

export interface ClinicUserAuditEvent {
  id: string;
  event: string;
  actor: string;
  occurredAt: string;
  reason: string;
  source: string;
  result: AuditResult;
}

export interface ClinicUserAiPermissions {
  viewAiSummary: boolean;
  generateSoapDraft: boolean;
  viewIcdSuggestions: boolean;
  acceptAiRecommendation: boolean;
  overrideAiWarning: boolean;
}

export interface ClinicUser {
  id: string;
  fullName: string;
  initials: string;
  employeeId: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  professionalLicense?: string;
  primaryRole: ClinicUserRole;
  additionalRoles: ClinicUserRole[];
  departmentId?: string;
  departmentName?: string;
  clinicScopes: ClinicAccessScope[];
  aiAccessStatus: AiAccessStatus;
  aiAccessLevel: AiAccessLevel;
  aiPermissions: ClinicUserAiPermissions;
  status: ClinicUserStatus;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  security: ClinicUserSecurity;
  auditTrail: ClinicUserAuditEvent[];
}

export interface ClinicUsersQuery {
  search?: string;
  role?: ClinicUserRole;
  status?: ClinicUserStatus;
  invitationStatus?: "sent" | "expired";
  departmentId?: string;
  aiAccessStatus?: AiAccessStatus;
  clinicId?: string;
  accessScope?: DataAccessLevel;
  sort?: ClinicUsersSort;
  page: number;
  pageSize: number;
}

export interface ClinicUsersSummary {
  totalUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  suspendedUsers: number;
  aiEnabledUsers: number;
  disabledUsers: number;
  lockedAccounts: number;
  recentlyActiveUsers: number;
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

export interface ClinicUsersResponse {
  data: ClinicUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: ClinicUsersSummary;
}

export interface InviteClinicUserInput {
  fullName: string;
  email: string;
  employeeId?: string;
  phone?: string;
  jobTitle?: string;
  professionalLicense?: string;
  primaryRole: ClinicUserRole;
  departmentId?: string;
  clinicId: string;
  dataAccessLevel: DataAccessLevel;
  accessExpiresAt?: string;
  additionalRole?: ClinicUserRole | "none";
  aiAccessLevel: AiAccessLevel;
  permissionTemplate: PermissionTemplate;
  auditReason: string;
}

export interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  mobile: string;
  employeeId: string;
  jobTitle: string;
  licenseNumber: string;
  organizationId: string;
  clinicId: string;
  departmentId: string;
  locationId: string;
  additionalClinics: string[];
  accessScope: CreateUserAccessScope;
  primaryRole: CreateUserRole | "";
  additionalRoles: CreateUserRole[];
  permissionTemplate: PermissionTemplate;
  customPermissions: CustomPermissionId[];
  privilegedReason: string;
  aiEnabled: boolean;
  aiPermissionLevels: Record<AiPermissionId, AiPermissionLevel>;
  patientDataAccess: PatientDataAccess;
  clinicalRecordAccess: ClinicalRecordPermission[];
  claimDataAccess: ClaimDataPermission[];
  auditLogAccess: AuditLogAccess;
  exportPermissions: ExportPermission[];
  accountStatus: AccountStatus;
  authenticationMethod: AuthenticationMethod;
  sessionTimeout: string;
  language: "en" | "th";
  timezone: string;
  effectiveDate: string;
  expirationDate: string;
  requirePasswordChange: boolean;
  requireMfa: boolean;
  sendInvitation: boolean;
  inviteLanguage: "en" | "th";
  inviteExpiry: string;
  welcomeMessage: string;
  loginRestriction: string;
  ipRestriction: string;
  temporaryAccess: boolean;
  securityNotification: boolean;
  lockOnRiskDetection: boolean;
  scheduleActivation: boolean;
  setTemporaryPassword: boolean;
  notifyAdministrator: boolean;
  acknowledgedAiSuggestion: boolean;
  permissionMatrix: Record<string, PermissionAction[]>;
}

export interface UpdateClinicUserInput {
  fullName?: string;
  jobTitle?: string;
  phone?: string;
  auditReason: string;
}

export interface UpdateUserRolesInput {
  primaryRole: ClinicUserRole;
  additionalRoles: ClinicUserRole[];
  reason: string;
}

export interface UpdateClinicAccessInput {
  clinicScopes: ClinicAccessScope[];
  reason: string;
}

export interface UpdateAiAccessInput {
  aiAccessLevel: AiAccessLevel;
  permissions: ClinicUserAiPermissions;
  reason: string;
}

export interface SuspendUserInput {
  reason: string;
  effectiveAt?: string;
}

export interface AuditMutationResult {
  auditId: string;
  message: string;
}

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface KpiCardDefinition {
  label: string;
  value: number;
  helper: string;
  semantic: "info" | "success" | "warning" | "danger";
  icon: LucideIcon;
}
