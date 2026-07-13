import { z } from "zod";

export const inviteUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  staffId: z.string().optional(),
  organization: z.string().min(1, "Organization is required"),
  clinicScope: z.string().min(1, "Select at least one clinic scope"),
  department: z.string().min(1, "Department is required"),
  primaryRole: z.string().min(1, "Select a primary role"),
  additionalRoles: z.string().optional(),
  aiPermissionProfile: z.enum(["enabled", "restricted", "not_allowed"]),
  consentRequired: z.boolean(),
  invitationExpiry: z.string().min(1, "Invitation expiry is required"),
  message: z.string().max(300, "Message must be 300 characters or fewer").optional(),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
