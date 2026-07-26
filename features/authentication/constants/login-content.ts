import type {
  LoginMetric,
  MedicalCodingSummary,
} from "../types/authentication.types";

export const loginMetrics: readonly LoginMetric[] = [
  {
    label: "Claim Readiness",
    value: "92",
    suffix: "%",
    helperText: "Ready for submission",
    progress: 92,
    icon: "claim-readiness",
  },
  {
    label: "Evidence Package",
    value: "8",
    suffix: " / 9",
    helperText: "Documents verified",
    progress: 88.9,
    icon: "evidence",
  },
  {
    label: "Coverage Status",
    value: "Active",
    helperText: "Policy validation passed",
    tone: "success",
    icon: "coverage",
  },
  {
    label: "Payer Network",
    value: "450",
    suffix: "+",
    helperText: "Insurance connections",
    progress: 70,
    icon: "payer-network",
  },
] as const;

export const medicalCodingSummary: MedicalCodingSummary = {
  icd10: "J18.9",
  procedure: "Chest X-Ray",
  drgGroup: "Valid",
  confidence: 96,
};

export const governanceLabels = [
  "Explainable by Design",
  "Human-Governed",
  "PDPA-Aligned",
] as const;
