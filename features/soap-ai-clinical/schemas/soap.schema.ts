import { z } from "zod";

import type { ReadinessStatus, SoapFormValues } from "../types/soap.types";

export const soapFormSchema = z.object({
  subjective: z.string().trim().min(10, "Subjective requires clinical context. กรุณาระบุอาการสำคัญ"),
  objective: z.string().trim().min(10, "Objective requires examination or vital details. กรุณาระบุผลตรวจ"),
  assessment: z.string().trim().min(5, "Assessment requires a working diagnosis. กรุณาระบุการประเมิน"),
  plan: z.string().trim().min(10, "Plan requires treatment or follow-up details. กรุณาระบุแผนการรักษา"),
});

export type SoapSchemaValues = z.infer<typeof soapFormSchema>;

export function calculateSoapCompleteness(values: SoapFormValues): number {
  const weights: Record<keyof SoapFormValues, number> = {
    subjective: 25,
    objective: 25,
    assessment: 25,
    plan: 25,
  };

  return Object.entries(weights).reduce((score, [key, weight]) => {
    const value = values[key as keyof SoapFormValues]?.trim() ?? "";
    return value.length >= 10 ? score + weight : score;
  }, 0);
}

export function getReadinessStatus(score: number): ReadinessStatus {
  if (score >= 85) return "Ready";
  if (score >= 60) return "Needs Review";
  return "Not Ready";
}
