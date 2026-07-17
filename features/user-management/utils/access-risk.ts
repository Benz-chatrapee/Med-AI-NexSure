import type { CreateUserFormValues } from "../types/user-management.types";

export type AccessRiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface AccessRiskResult {
  level: AccessRiskLevel;
  alerts: string[];
  inheritedCount: number;
  customCount: number;
  highRiskCount: number;
  conflictCount: number;
  score: number;
  factors: string[];
}

export function calculateAccessRisk(values: CreateUserFormValues): AccessRiskResult {
  const alerts = [
    values.primaryRole === "system_admin" || values.primaryRole === "organization_admin" ? "Privileged administrator role" : "",
    values.accessScope === "organization_wide" || values.patientDataAccess === "organization_scope" ? "Organization-wide patient access" : "",
    values.customPermissions.includes("user_management") ? "User management permission" : "",
    values.exportPermissions.some((item) => item !== "no_export") || values.customPermissions.includes("data_export") ? "Data export permission" : "",
    values.auditLogAccess === "organization_scope" || values.customPermissions.includes("audit_access") ? "Organization audit access" : "",
    values.claimDataAccess.includes("approve") || values.customPermissions.includes("claim_approval") ? "Claim approval requires human review" : "",
    Object.values(values.aiPermissionLevels).includes("confirm") ? "Clinical output confirmation" : "",
  ].filter(Boolean);
  const permissionAdminCount = Object.values(values.permissionMatrix).filter((actions) => actions.includes("admin")).length;
  const permissionExportCount = Object.values(values.permissionMatrix).filter((actions) => actions.includes("export")).length;
  const conflictCount = getRoleConflictCount(values);
  const highRiskCount = alerts.length;
  const score = Math.min(100, highRiskCount * 14 + conflictCount * 20 + permissionAdminCount * 10 + permissionExportCount * 6);
  const level: AccessRiskLevel = score >= 80 ? "Critical" : score >= 55 ? "High" : score >= 25 ? "Medium" : "Low";

  return {
    level,
    alerts,
    inheritedCount: getInheritedPermissionCount(values),
    customCount: values.customPermissions.length,
    highRiskCount,
    conflictCount,
    score,
    factors: [
      values.accessScope === "organization_wide" ? "Global Access" : "",
      values.customPermissions.includes("user_management") || permissionAdminCount > 0 ? "User Administration" : "",
      values.exportPermissions.some((item) => item !== "no_export") || permissionExportCount > 0 ? "Export Permission" : "",
      Object.values(values.aiPermissionLevels).includes("confirm") ? "AI Override" : "",
      values.auditLogAccess === "organization_scope" ? "Audit Access" : "",
      values.additionalClinics.length > 0 || values.accessScope === "selected_clinics" ? "Cross-clinic Access" : "",
    ].filter(Boolean),
  };
}

export function getRoleConflictCount(values: CreateUserFormValues) {
  const roles = [values.primaryRole, ...values.additionalRoles].filter(Boolean);
  const hasExecutive = roles.includes("executive");
  const hasClinical = roles.some((role) => role === "doctor" || role === "nurse" || role === "pharmacist");
  const hasAdmin = roles.some((role) => role === "system_admin" || role === "organization_admin" || role === "clinic_admin");
  return Number(hasExecutive && hasClinical) + Number(hasAdmin && values.additionalRoles.includes("auditor_compliance"));
}

function getInheritedPermissionCount(values: CreateUserFormValues) {
  const baseByRole: Record<string, number> = {
    system_admin: 40,
    organization_admin: 34,
    clinic_admin: 28,
    doctor: 22,
    nurse: 16,
    pharmacist: 18,
    clinic_staff: 12,
    claim_reviewer: 20,
    auditor_compliance: 18,
    executive: 10,
  };
  return values.primaryRole ? baseByRole[values.primaryRole] ?? 0 : 0;
}
