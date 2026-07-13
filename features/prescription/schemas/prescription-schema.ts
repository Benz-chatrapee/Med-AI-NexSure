import { z } from "zod";

export const prescriptionItemSchema = z.object({
  id: z.string().min(1),
  medicationId: z.string().min(1, "Medication is required."),
  medicationDisplayName: z.string().min(1, "Medication is required."),
  dosage: z.string().trim().min(1, "Dosage is required."),
  frequency: z.string().trim().min(1, "Frequency is required."),
  duration: z.string().trim().min(1, "Duration is required."),
  quantity: z.coerce.number().min(1, "Quantity must be greater than zero."),
  unit: z.string().trim().min(1, "Unit is required."),
  instructions: z.string().trim(),
});

export const prescriptionFormSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1, "At least one medication item is required."),
  clinicalJustification: z.string().trim().max(2000, "Clinical justification must be 2000 characters or fewer."),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
