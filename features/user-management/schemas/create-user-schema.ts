import { z } from "zod";
import { ADD_USER_DUPLICATE_EMAILS, ADD_USER_DUPLICATE_EMPLOYEE_IDS, CLINICS } from "../constants/create-user-options";

const createUserRoleSchema = z.enum(["system_admin", "organization_admin", "clinic_admin", "doctor", "nurse", "pharmacist", "clinic_staff", "claim_reviewer", "auditor_compliance", "executive"]);
const aiPermissionIdSchema = z.enum(["clinical_summary", "icd_suggestion", "differential_support", "prescription_safety", "claim_readiness", "missing_evidence", "insurance_rule_validation", "economic_intelligence", "evidence_package_generation"]);
const aiPermissionLevelSchema = z.enum(["no_access", "view", "generate", "review", "confirm"]);

export const createUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100),
    lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล").max(100),
    displayName: z.string().trim().min(1, "กรุณากรอก Display Name").max(150),
    email: z.string().trim().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
    mobile: z.string(),
    employeeId: z.string(),
    jobTitle: z.string(),
    licenseNumber: z.string(),
    organizationId: z.string().min(1, "กรุณาเลือก Organization"),
    clinicId: z.string(),
    departmentId: z.string(),
    locationId: z.string(),
    additionalClinics: z.array(z.string()),
    accessScope: z.enum(["assigned_cases", "primary_clinic", "selected_clinics", "organization_wide"]),
    primaryRole: z.union([z.literal(""), createUserRoleSchema]),
    additionalRoles: z.array(createUserRoleSchema),
    permissionTemplate: z.enum(["role_recommended", "least_privilege", "claim_review", "audit_review", "custom_permissions"]),
    customPermissions: z.array(z.enum(["patient_management", "claim_approval", "audit_access", "user_management", "data_export", "evidence_package"])),
    privilegedReason: z.string(),
    aiEnabled: z.boolean(),
    aiPermissionLevels: z.record(aiPermissionIdSchema, aiPermissionLevelSchema),
    patientDataAccess: z.enum(["no_access", "assigned_cases", "clinic_scope", "selected_clinics", "organization_scope"]),
    clinicalRecordAccess: z.array(z.enum(["view", "create", "update", "review", "approve"])),
    claimDataAccess: z.array(z.enum(["view", "review", "approve", "export"])),
    auditLogAccess: z.enum(["no_access", "own_activity", "clinic_scope", "organization_scope"]),
    exportPermissions: z.array(z.enum(["no_export", "pdf", "csv", "evidence_package", "audit_report"])),
    accountStatus: z.enum(["draft", "invited", "active", "suspended"]),
    authenticationMethod: z.enum(["email_password", "passwordless", "sso"]),
    sessionTimeout: z.string(),
    language: z.enum(["en", "th"]),
    timezone: z.string(),
    effectiveDate: z.string().min(1, "กรุณาเลือก Effective Date"),
    expirationDate: z.string(),
    requirePasswordChange: z.boolean(),
    requireMfa: z.boolean(),
    sendInvitation: z.boolean(),
    inviteLanguage: z.enum(["en", "th"]),
    inviteExpiry: z.string(),
    welcomeMessage: z.string().max(500, "ข้อความต้อนรับต้องไม่เกิน 500 ตัวอักษร"),
    loginRestriction: z.string(),
    ipRestriction: z.string(),
    temporaryAccess: z.boolean(),
    securityNotification: z.boolean(),
    lockOnRiskDetection: z.boolean(),
    scheduleActivation: z.boolean(),
    setTemporaryPassword: z.boolean(),
    notifyAdministrator: z.boolean(),
    acknowledgedAiSuggestion: z.boolean(),
    permissionMatrix: z.record(z.string(), z.array(z.enum(["view", "create", "edit", "approve", "export", "admin"]))),
  })
  .superRefine((values, context) => {
    const clinicLevelRoles = ["clinic_admin", "doctor", "nurse", "pharmacist", "clinic_staff", "claim_reviewer"] as const;
    const privilegedRoles = ["system_admin", "organization_admin", "clinic_admin"] as const;
    const clinicIds = (CLINICS[values.organizationId] ?? []).map((clinic) => clinic.id);
    const hasPrivilegedPermission =
      values.customPermissions.some((permission) => permission !== "patient_management") ||
      values.exportPermissions.some((permission) => permission !== "no_export") ||
      values.auditLogAccess === "organization_scope" ||
      values.claimDataAccess.includes("approve") ||
      values.accessScope === "organization_wide";

    if (!values.primaryRole) context.addIssue({ code: "custom", path: ["primaryRole"], message: "กรุณาเลือก Primary Role" });
    if (ADD_USER_DUPLICATE_EMAILS.includes(values.email.toLowerCase() as (typeof ADD_USER_DUPLICATE_EMAILS)[number])) context.addIssue({ code: "custom", path: ["email"], message: "อีเมลนี้ถูกใช้งานในระบบแล้ว" });
    if (values.employeeId && ADD_USER_DUPLICATE_EMPLOYEE_IDS.includes(values.employeeId.toUpperCase() as (typeof ADD_USER_DUPLICATE_EMPLOYEE_IDS)[number])) context.addIssue({ code: "custom", path: ["employeeId"], message: "Employee ID นี้ถูกใช้งานในระบบแล้ว" });
    if (values.primaryRole && clinicLevelRoles.includes(values.primaryRole as (typeof clinicLevelRoles)[number]) && !values.clinicId) context.addIssue({ code: "custom", path: ["clinicId"], message: "กรุณาเลือก Primary Clinic สำหรับ Role นี้" });
    if (values.clinicId && !clinicIds.includes(values.clinicId)) context.addIssue({ code: "custom", path: ["clinicId"], message: "Primary Clinic ต้องอยู่ใน Organization ที่เลือก" });
    if (values.additionalClinics.some((clinicId) => !clinicIds.includes(clinicId))) context.addIssue({ code: "custom", path: ["additionalClinics"], message: "Additional Clinics ต้องอยู่ใน Organization ที่เลือก" });
    if ((values.primaryRole === "doctor" || values.primaryRole === "pharmacist") && !values.licenseNumber.trim()) context.addIssue({ code: "custom", path: ["licenseNumber"], message: "กรุณากรอก Professional License สำหรับ Clinical Role" });
    if (hasPrivilegedPermission && values.privilegedReason.trim().length < 10) context.addIssue({ code: "custom", path: ["privilegedReason"], message: "สิทธิ์ระดับสูงต้องระบุเหตุผลอย่างน้อย 10 ตัวอักษร" });
    if (values.primaryRole && privilegedRoles.includes(values.primaryRole as (typeof privilegedRoles)[number]) && !values.requireMfa) context.addIssue({ code: "custom", path: ["requireMfa"], message: "Role นี้ต้องเปิดใช้งาน Multi-Factor Authentication" });
    if (values.accountStatus === "draft" && values.sendInvitation) context.addIssue({ code: "custom", path: ["sendInvitation"], message: "Draft users must not receive an invitation" });
    if (Object.values(values.aiPermissionLevels).includes("confirm") && !["doctor", "pharmacist"].includes(values.primaryRole)) context.addIssue({ code: "custom", path: ["aiPermissionLevels"], message: "เฉพาะผู้มีอำนาจทางคลินิกเท่านั้นที่สามารถ Confirm AI Output" });
    if (values.aiPermissionLevels.economic_intelligence === "confirm" || values.aiPermissionLevels.evidence_package_generation === "confirm") context.addIssue({ code: "custom", path: ["aiPermissionLevels"], message: "Critical AI Decisions ต้องมี Human-in-the-Loop และไม่สามารถ Confirm อัตโนมัติ" });
    if (values.accessScope === "organization_wide" && !["system_admin", "organization_admin"].includes(values.primaryRole)) context.addIssue({ code: "custom", path: ["accessScope"], message: "Organization-wide access requires sufficient administrator scope" });
    if (Object.values(values.permissionMatrix).some((actions) => actions.includes("admin")) && !values.requireMfa) context.addIssue({ code: "custom", path: ["requireMfa"], message: "Admin Permission ต้องเปิด MFA" });
    if (values.expirationDate && values.expirationDate <= values.effectiveDate) context.addIssue({ code: "custom", path: ["expirationDate"], message: "Expiration date must be after effective date" });
  });
