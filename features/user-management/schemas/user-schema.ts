import { z } from "zod";

export const inviteUserSchema = z.object({
  name: z.string().min(2, "กรุณาระบุชื่อผู้ใช้งาน"),
  email: z.email("กรุณาระบุอีเมลให้ถูกต้อง"),
  role: z.string().min(1, "กรุณาเลือกบทบาท"),
  department: z.string().min(1, "กรุณาเลือกแผนก"),
  organizationId: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
  scope: z.string().min(1, "กรุณาเลือกขอบเขตการเข้าถึง"),
  aiAccess: z.boolean(),
  message: z.string().max(500, "ข้อความต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
