import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมลของหน่วยงาน")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
