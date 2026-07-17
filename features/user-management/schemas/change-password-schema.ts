import { z } from "zod";

export const changePasswordRequirements = [
  { label: "Minimum 12 characters length", test: (value: string) => value.length >= 12 },
  { label: "Include uppercase & lowercase", test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: "Include at least one number", test: (value: string) => /\d/.test(value) },
  { label: "Include a special character (!@#$%)", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(12, "รหัสผ่านใหม่ต้องมีอย่างน้อย 12 ตัวอักษร")
      .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว")
      .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว")
      .regex(/\d/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว")
      .regex(/[^A-Za-z0-9]/, "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
    signOutOtherSessions: z.boolean(),
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
    path: ["newPassword"],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
