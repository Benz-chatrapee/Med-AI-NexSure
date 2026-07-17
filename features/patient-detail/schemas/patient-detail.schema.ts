import { z } from "zod";

export const patientIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-zA-Z0-9-]+$/);
