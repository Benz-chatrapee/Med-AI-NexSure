import { z } from "zod";
import { getRoleAiCompatibilityMessage, isRoleAiCompatible } from "../constants/clinic-user-options";

const clinicUserRoleSchema = z.enum([
  "clinic_admin",
  "clinic_manager",
  "doctor",
  "nurse",
  "pharmacist",
  "clinic_staff",
  "claim_reviewer",
  "compliance_officer",
  "executive",
]);

const aiAccessLevelSchema = z.enum(["disabled", "view_only", "clinical_assist", "clinical_review", "ai_administrator"]);

export const inviteClinicUserSchema = z
  .object({
    fullName: z.string().trim().min(2, "กรุณาระบุ Full Name อย่างน้อย 2 ตัวอักษร"),
    email: z.email("กรุณาระบุ Email Address ให้ถูกต้อง"),
    employeeId: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    jobTitle: z.string().trim().optional(),
    professionalLicense: z.string().trim().optional(),
    primaryRole: clinicUserRoleSchema,
    departmentId: z.string().trim().optional(),
    clinicId: z.string().trim().min(1, "กรุณาเลือก Clinic Access"),
    dataAccessLevel: z.enum(["assigned_department", "assigned_clinic", "cross_clinic_view_only"]),
    accessExpiresAt: z.string().optional(),
    additionalRole: z.union([clinicUserRoleSchema, z.literal("none")]).optional(),
    aiAccessLevel: aiAccessLevelSchema,
    permissionTemplate: z.enum(["role_recommended", "custom_permissions", "claim_review"]),
  })
  .superRefine((value, context) => {
    if ((value.primaryRole === "doctor" || value.primaryRole === "pharmacist") && !value.professionalLicense?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["professionalLicense"],
        message: "Professional License Number is required for Doctor or Pharmacist.",
      });
    }

    if (value.additionalRole && value.additionalRole !== "none" && value.additionalRole === value.primaryRole) {
      context.addIssue({
        code: "custom",
        path: ["additionalRole"],
        message: "Additional role must not duplicate the Primary Role.",
      });
    }

    if (!isRoleAiCompatible(value.primaryRole, value.aiAccessLevel)) {
      context.addIssue({
        code: "custom",
        path: ["aiAccessLevel"],
        message: getRoleAiCompatibilityMessage(value.primaryRole, value.aiAccessLevel),
      });
    }
  });

export type InviteClinicUserFormValues = z.infer<typeof inviteClinicUserSchema>;

export const suspendClinicUserSchema = z.object({
  reason: z.string().trim().min(8, "กรุณาระบุเหตุผลอย่างน้อย 8 ตัวอักษรสำหรับ audit trail"),
  effectiveAt: z.string().optional(),
});

export type SuspendClinicUserFormValues = z.infer<typeof suspendClinicUserSchema>;
