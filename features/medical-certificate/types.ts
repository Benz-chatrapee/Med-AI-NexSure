import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type CertificateStatus = "Draft" | "Needs Review" | "Ready to Sign";

export type CertificatePurpose = {
  label: string;
  thai: string;
  icon: ComponentType<LucideProps>;
  selected?: boolean;
};

export type ClinicalReference = {
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "muted";
};

export type ReadinessCheck = {
  label: string;
  thai: string;
  status: "Verified" | "Pending" | "Review";
};

export type CertificateAttachment = {
  name: string;
  detail: string;
};

export type MedicalCertificateWorkspace = {
  visitId: string;
  patient: {
    name: string;
    hn: string;
    vn: string;
    age: string;
    allergy: string;
  };
  clinician: {
    name: string;
    license: string;
    department: string;
  };
  status: CertificateStatus;
  stats: Array<{ label: string; value: string; helper: string }>;
  clinicalReferences: ClinicalReference[];
  soapSnapshot: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  findingsText: string;
  restPeriod: {
    startDate: string;
    endDate: string;
    days: number;
    aiSuggestion: string;
  };
  attachments: CertificateAttachment[];
  readinessScore: number;
  readinessChecks: ReadinessCheck[];
};
