import { z } from "zod";

export const departmentSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  name: z.string().trim().min(2, "Department name is required").max(100),
  code: z.string().trim().min(2).max(30).regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, underscore or dash"),
  type: z.enum(["clinical", "diagnostic", "operational"]),
  managerId: z.string().nullable().optional(),
  description: z.string().max(500).optional(),
  phoneExtension: z.string().max(20).optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  operatingHours: z.string().max(100).optional(),
  costCenterCode: z.string().max(50).optional(),
  aiClinicalAccess: z.boolean(),
  status: z.enum(["active", "inactive"]),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
