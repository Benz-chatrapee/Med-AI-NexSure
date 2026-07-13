import { z } from "zod";

export const clinicDashboardFilterSchema = z.object({
  dateRange: z.enum(["Today", "Last 7 Days", "Last 30 Days"]),
  clinic: z.string().min(1),
  department: z.string().min(1),
  doctor: z.string().min(1),
  payer: z.string().min(1),
  visitStatus: z.string().min(1),
  riskLevel: z.string().min(1),
});
