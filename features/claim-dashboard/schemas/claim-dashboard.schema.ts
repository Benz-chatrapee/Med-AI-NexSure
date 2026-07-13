import { z } from "zod";

export const assignReviewerSchema = z.object({
  reviewer: z.enum(["Arisa K.", "Narin P.", "Chalida S."]),
  reason: z.string().trim().min(1, "กรุณาระบุเหตุผลในการมอบหมาย"),
});

export type AssignReviewerFormValues = z.infer<typeof assignReviewerSchema>;
