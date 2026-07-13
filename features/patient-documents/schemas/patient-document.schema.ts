import { z } from "zod";

const categories = ["identity", "insurance", "clinical", "laboratory", "radiology", "prescription", "medical_certificate", "consent", "claim_evidence", "referral"] as const;
const confidentiality = ["standard", "sensitive", "confidential", "restricted"] as const;
export const uploadPatientDocumentSchema = z.object({
  documentName: z.string().min(1, "Document name is required"),
  category: z.enum(categories),
  documentType: z.string().min(1, "Document type is required"),
  relatedVisit: z.string().optional(),
  relatedClaim: z.string().optional(),
  documentDate: z.string().min(1, "Document date is required"),
  expiryDate: z.string().optional(),
  confidentiality: z.enum(confidentiality),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  notes: z.string().max(500, "Notes must be 500 characters or fewer").optional(),
}).refine((value) => !value.expiryDate || new Date(value.expiryDate) >= new Date(value.documentDate), { path: ["expiryDate"], message: "Expiry date cannot be before document date" });
export type UploadPatientDocumentFormValues = z.infer<typeof uploadPatientDocumentSchema>;
export const acceptedFileTypes = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export const maxUploadBytes = 20 * 1024 * 1024;
