import { z } from "zod";

const createUserRoleSchema = z.enum([
  "organization_admin",
  "clinic_admin",
  "doctor",
  "nurse",
  "pharmacist",
  "clinic_staff",
  "claim_reviewer",
  "auditor_compliance",
  "executive",
]);

export const createUserSchema = z
  .object({
    firstName: z.string().min(2, "First name is required").max(100),
    lastName: z.string().min(2, "Last name is required").max(100),
    displayName: z.string().max(150),
    email: z.string().email("Enter a valid email address"),
    mobile: z.string(),
    employeeId: z.string(),
    jobTitle: z.string(),
    licenseNumber: z.string(),
    organizationId: z.string().min(1, "Select an organization"),
    clinicId: z.string().min(1, "Select a primary clinic"),
    departmentId: z.string(),
    locationId: z.string(),
    additionalClinics: z.array(z.string()),
    accessScope: z.enum(["own_clinic", "assigned_clinics", "organization_wide"]),
    primaryRole: z.union([z.literal(""), createUserRoleSchema]),
    additionalRoles: z.array(createUserRoleSchema),
    accountStatus: z.enum(["draft", "invited"]),
    sessionTimeout: z.string(),
    language: z.enum(["en", "th"]),
    timezone: z.string(),
    effectiveDate: z.string().min(1, "Effective date is required"),
    expirationDate: z.string(),
    requirePasswordChange: z.boolean(),
    requireMfa: z.boolean(),
    sendInvitation: z.boolean(),
    inviteLanguage: z.enum(["en", "th"]),
    inviteExpiry: z.string(),
    welcomeMessage: z.string().max(500, "Welcome message must be 500 characters or less"),
  })
  .superRefine((values, context) => {
    if (!values.primaryRole) {
      context.addIssue({ code: "custom", path: ["primaryRole"], message: "Select a primary role" });
    }
    if ((values.primaryRole === "doctor" || values.primaryRole === "pharmacist") && !values.licenseNumber.trim()) {
      context.addIssue({ code: "custom", path: ["licenseNumber"], message: "Professional license is required" });
    }
    if (values.expirationDate && values.expirationDate <= values.effectiveDate) {
      context.addIssue({ code: "custom", path: ["expirationDate"], message: "Expiration date must be after effective date" });
    }
  });
