import { z } from "zod";

export const manualOverrideSchema = z.object({
  authorizedRole: z.enum(["Doctor", "Claim Reviewer", "Compliance Officer"], {
    error: "Authorized role is required.",
  }),
  overrideOutcome: z.enum(
    [
      "Keep Needs Review and record exception",
      "Request secondary clinical review",
      "Request payer-rule exception review",
    ],
    { error: "Override outcome is required." },
  ),
  reason: z
    .string()
    .trim()
    .min(20, "Reason must be factual and at least 20 characters.")
    .refine((value) => !/\b(approve|approved|guaranteed coverage)\b/i.test(value), {
      message: "Reason must not imply automatic approval or confirmed coverage.",
    }),
});

export type ManualOverrideFormValues = z.infer<typeof manualOverrideSchema>;
