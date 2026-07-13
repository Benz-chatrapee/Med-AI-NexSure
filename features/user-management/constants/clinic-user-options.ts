import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import type {
  AiAccessLevel,
  AiAccessStatus,
  ClinicUserRole,
  ClinicUserStatus,
  DataAccessLevel,
  KpiCardDefinition,
  PermissionTemplate,
  SelectOption,
} from "../types/user-management.types";

export const clinicOptions: SelectOption[] = [
  { value: "clinic-bangkok", label: "NexSure Medical Center - Bangkok" },
  { value: "clinic-sukhumvit", label: "Sukhumvit Clinic" },
  { value: "clinic-rama9", label: "Rama 9 Clinic" },
];

export const departmentOptions: SelectOption[] = [
  { value: "general-medicine", label: "General Medicine" },
  { value: "nursing", label: "Nursing" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "claims", label: "Claims" },
  { value: "compliance", label: "Compliance" },
  { value: "administration", label: "Administration" },
  { value: "executive", label: "Executive" },
];

export const roleOptions: SelectOption<ClinicUserRole>[] = [
  { value: "clinic_admin", label: "Clinic Admin" },
  { value: "clinic_manager", label: "Clinic Manager" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "clinic_staff", label: "Clinic Staff" },
  { value: "claim_reviewer", label: "Claim Reviewer" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "executive", label: "Executive" },
];

export const statusOptions: SelectOption<ClinicUserStatus>[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "locked", label: "Locked" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

export const aiAccessStatusOptions: SelectOption<AiAccessStatus>[] = [
  { value: "enabled", label: "Enabled" },
  { value: "restricted", label: "Restricted" },
  { value: "disabled", label: "Disabled" },
];

export const aiAccessLevelOptions: SelectOption<AiAccessLevel>[] = [
  { value: "disabled", label: "Disabled" },
  { value: "view_only", label: "View Only" },
  { value: "clinical_assist", label: "Clinical Assist" },
  { value: "clinical_review", label: "Clinical Review" },
  { value: "ai_administrator", label: "AI Administrator" },
];

export const dataAccessLevelOptions: SelectOption<DataAccessLevel>[] = [
  { value: "assigned_department", label: "Assigned Department" },
  { value: "assigned_clinic", label: "Assigned Clinic" },
  { value: "cross_clinic_view_only", label: "Cross-Clinic View Only" },
];

export const permissionTemplateOptions: SelectOption<PermissionTemplate>[] = [
  { value: "role_recommended", label: "Role Recommended" },
  { value: "custom_permissions", label: "Custom Permissions" },
  { value: "claim_review", label: "Claim Review Template" },
];

export const roleLabels = Object.fromEntries(roleOptions.map((option) => [option.value, option.label])) as Record<ClinicUserRole, string>;
export const statusLabels = Object.fromEntries(statusOptions.map((option) => [option.value, option.label])) as Record<ClinicUserStatus, string>;
export const aiAccessStatusLabels = Object.fromEntries(aiAccessStatusOptions.map((option) => [option.value, option.label])) as Record<AiAccessStatus, string>;
export const aiAccessLevelLabels = Object.fromEntries(aiAccessLevelOptions.map((option) => [option.value, option.label])) as Record<AiAccessLevel, string>;
export const dataAccessLevelLabels = Object.fromEntries(dataAccessLevelOptions.map((option) => [option.value, option.label])) as Record<DataAccessLevel, string>;

export function getKpiDefinitions(summary: {
  totalUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  suspendedUsers: number;
  aiEnabledUsers: number;
}): KpiCardDefinition[] {
  return [
    { label: "Total Users", value: summary.totalUsers, helper: "All clinic and organization accounts", semantic: "info", icon: Users },
    { label: "Active Users", value: summary.activeUsers, helper: "พร้อมใช้งานภายในสิทธิ์ที่กำหนด", semantic: "success", icon: CheckCircle2 },
    { label: "Pending Invitations", value: summary.pendingInvitations, helper: "รอผู้ใช้งานตอบรับคำเชิญ", semantic: "warning", icon: UserPlus },
    { label: "Suspended Users", value: summary.suspendedUsers, helper: "ต้องมีเหตุผลและ audit trail", semantic: "danger", icon: UserX },
    { label: "AI-Enabled Users", value: summary.aiEnabledUsers, helper: "Decision support access only", semantic: "info", icon: BrainCircuit },
  ];
}

export const governanceHighlights = ["Least Privilege", "Clinic Scope", "Audit by Default", "Human Review"] as const;

export const defaultPermissions = {
  viewAiSummary: true,
  generateSoapDraft: false,
  viewIcdSuggestions: true,
  acceptAiRecommendation: false,
  overrideAiWarning: false,
};

export const permissionLabels = {
  viewAiSummary: "View AI Summary",
  generateSoapDraft: "Generate SOAP Draft",
  viewIcdSuggestions: "View ICD Suggestions",
  acceptAiRecommendation: "Accept AI Recommendation",
  overrideAiWarning: "Override AI Warning",
} as const;

export const permissionDescriptions = {
  viewAiSummary: "ดู AI-generated clinical summary",
  generateSoapDraft: "สร้างร่าง SOAP Note สำหรับ human review",
  viewIcdSuggestions: "ดูคำแนะนำ ICD พร้อม confidence",
  acceptAiRecommendation: "ยืนยันคำแนะนำโดย authorized professional",
  overrideAiWarning: "High-risk permission - requires reason",
} as const;

export const highRiskPermissions = ["overrideAiWarning"] as const;

export function isRoleAiCompatible(role: ClinicUserRole, aiAccessLevel: AiAccessLevel) {
  if (aiAccessLevel === "disabled" || aiAccessLevel === "view_only") return true;
  if (role === "clinic_staff" && (aiAccessLevel === "clinical_review" || aiAccessLevel === "ai_administrator")) return false;
  if (role === "executive" && (aiAccessLevel === "clinical_review" || aiAccessLevel === "ai_administrator")) return false;
  if (role === "claim_reviewer" && (aiAccessLevel === "clinical_review" || aiAccessLevel === "ai_administrator")) return false;
  return true;
}

export function getRoleAiCompatibilityMessage(role: ClinicUserRole, aiAccessLevel: AiAccessLevel) {
  if (isRoleAiCompatible(role, aiAccessLevel)) return "AI permissions match the selected role. การเปลี่ยนแปลงจะถูกบันทึกใน Audit Log";
  if (role === "executive") return "Executive cannot use Clinical Review or AI Administrator access.";
  if (role === "clinic_staff") return "Clinic Staff cannot use Clinical Review or AI Administrator access.";
  if (role === "claim_reviewer") return "Claim Reviewer should be limited to View Only or claim-related AI permission.";
  return "ไม่สามารถกำหนด AI Access ระดับนี้ได้ กรุณาตรวจสอบ Role และ Permission ที่เลือก";
}

export function getAiAccessStatus(aiAccessLevel: AiAccessLevel): AiAccessStatus {
  if (aiAccessLevel === "disabled") return "disabled";
  if (aiAccessLevel === "view_only") return "restricted";
  return "enabled";
}

export function maskProfessionalLicense(value?: string) {
  if (!value) return "Not provided";
  const suffix = value.slice(-4);
  const prefix = value.split("-")[0] || "LIC";
  return `${prefix}-****-${suffix}`;
}

export function maskIpAddress(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) return "Masked";
  return `${parts[0]}.${parts[1]}.**.${parts[3]}`;
}

export const kpiSkeletonIcons = [Users, CheckCircle2, Clock3, UserX, ShieldCheck] as const;
