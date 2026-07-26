import { z } from "zod";

export const loginSchema = z.object({
  organization: z.string().trim().min(1, "กรุณาระบุองค์กร"),
  clinic: z.string().trim().min(1, "กรุณาระบุคลินิกหรือแผนก"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaultValues: LoginFormValues = {
  organization: "",
  clinic: "",
  email: "",
  password: "",
  rememberMe: false,
};
