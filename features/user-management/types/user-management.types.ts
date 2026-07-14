import type { LucideIcon } from "lucide-react";

export type ClinicUserStatus = "active" | "invited" | "locked" | "suspended" | "inactive";
export type ClinicUserRole =
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
>;
export type CreateUserAccessScope = "own_clinic" | "assigned_clinics" | "organization_wide";
export type AiAccessStatus = "enabled" | "restricted" | "disabled";
export type AiAccessLevel = "disabled" | "view_only" | "clinical_assist" | "clinical_review" | "ai_administrator";
export type DataAccessLevel = "assigned_department" | "assigned_clinic" | "cross_clinic_view_only";
export type AuditResult = "success" | "warning" | "blocked";
export type PermissionTemplate = "role_recommended" | "custom_permissions" | "claim_review";

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
  departmentId?: string;
  aiAccessStatus?: AiAccessStatus;
  clinicId?: string;
  page: number;
  pageSize: number;
}

export interface ClinicUsersSummary {
  totalUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  suspendedUsers: number;
  aiEnabledUsers: number;
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
  accountStatus: "draft" | "invited";
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
