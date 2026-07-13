import { z } from "zod";

export const createReviewTaskSchema = z.object({
  title: z.string().trim().min(1, "กรุณาระบุชื่องาน"),
  owner: z.string().trim().min(1, "กรุณาระบุผู้รับผิดชอบ"),
  dueDate: z.string().trim().min(1, "กรุณาระบุวันครบกำหนด"),
  notes: z.string().max(500, "บันทึกต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export type CreateReviewTaskFormValues = z.infer<typeof createReviewTaskSchema>;
