export type LoginMetricIcon =
  | "claim-readiness"
  | "evidence"
  | "coverage"
  | "payer-network";

export interface LoginMetric {
  label: string;
  value: string;
  suffix?: string;
  helperText: string;
  progress?: number;
  tone?: "default" | "success";
  icon: LoginMetricIcon;
}

export interface MedicalCodingSummary {
  icd10: string;
  procedure: string;
  drgGroup: string;
  confidence: number;
}
