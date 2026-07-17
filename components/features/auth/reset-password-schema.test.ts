import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "./reset-password-schema";

describe("resetPasswordSchema", () => {
  it("accepts a password that satisfies the enterprise password policy", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NexSure#2026",
      confirmPassword: "NexSure#2026",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak passwords before submission", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password",
      confirmPassword: "password",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ",
    );
  });

  it("rejects mismatched confirmation passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NexSure#2026",
      confirmPassword: "NexSure#2027",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "รหัสผ่านยืนยันไม่ตรงกัน",
    );
  });
});
