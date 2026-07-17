import { z } from "zod";

export const userDetailEditSchema = z.object({
  firstName: z.string().trim().min(1, "กรุณาระบุชื่อ"),
  lastName: z.string().trim().min(1, "กรุณาระบุนามสกุล"),
  displayName: z.string().trim().min(2, "กรุณาระบุชื่อที่แสดงอย่างน้อย 2 ตัวอักษร"),
  employeeId: z.string().trim().min(1, "กรุณาระบุ Employee ID"),
  department: z.string().trim().min(1, "กรุณาเลือกแผนก"),
  email: z.string().trim().email("กรุณาระบุอีเมลให้ถูกต้อง"),
  phone: z.string().trim().regex(/^\+66\s\d{2}\s\d{3}\s\d{4}$/, "รูปแบบเบอร์โทรต้องเป็น +66 XX XXX XXXX"),
  preferredLanguage: z.enum(["English (US)", "Thai (TH)", "Mandarin", "Japanese"]),
  defaultClinic: z.enum(["Bangkok Central Medical", "Sukhumvit Specialist Center", "Thonburi Health Hub"]),
  accountStatus: z.boolean(),
  assignedClinics: z.array(z.string()).min(1, "กรุณาเลือกคลินิกอย่างน้อย 1 แห่ง"),
  assignedRoles: z.array(z.string()).min(1, "กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท"),
});

export type UserDetailEditFormValues = z.infer<typeof userDetailEditSchema>;
