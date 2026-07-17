import { z } from "zod";

const PASSWORD_POLICY_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const passwordRequirements = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  {
    label: "Uppercase & lowercase letters",
    test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  {
    label: "At least one special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "กรุณากรอกรหัสผ่านใหม่")
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(
        PASSWORD_POLICY_PATTERN,
        "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ",
      ),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "รหัสผ่านยืนยันไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
