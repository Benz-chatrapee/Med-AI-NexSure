export type VisitStatus = "In Consultation" | "Completed" | "Locked";
export type ReadinessStatus = "Ready" | "Needs Review" | "Not Ready";
export type SafetySeverity = "safe" | "warning" | "critical";
export type EvidenceStatus = "Verified" | "Missing" | "Pending";
export type ActivityIconKey = "activity" | "ai" | "alert" | "claim" | "document";

export type PatientContext = {
  name: string;
  initials: string;
  age: number;
  sex: string;
  hn: string;
  visitId: string;
  visitDate: string;
  clinic: string;
  physician: string;
  allergy: string;
  insurancePolicy: string;
  coverageStatus: string;
  pdpaConsent: string;
};

export type VitalSign = {
  label: string;
  value: string;
  unit: string;
  status: string;
  severity: Exclude<SafetySeverity, "critical">;
};

export type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type Diagnosis = {
  code: string;
  label: string;
  confidence: number;
  status: "AI Suggested" | "Human Confirmed";
};

export type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  safetyStatus: "Safe" | "Critical Warning";
  explanation: string;
};

export type ProcedureItem = {
  label: string;
  status: string;
  note: string;
};

export type EvidenceDocument = {
  id: string;
  title: string;
  status: EvidenceStatus;
  meta: string;
};

export type ReadinessBreakdown = {
  label: string;
  weight: number;
  score: number;
  explanation: string;
};

export type MissingEvidenceItem = {
  id: string;
  title: string;
  explanation: string;
  priority: "Critical" | "Required";
};

export type Insight = {
  title: string;
  text: string;
  tone: "ai" | "warning" | "success";
};

export type ActivityItem = {
  id: string;
  title: string;
  actor: string;
  time: string;
  detail: string;
  icon: ActivityIconKey;
};

export type VisitDetail = {
  patient: PatientContext;
  status: VisitStatus;
  claimScore: number;
  clinicalRisk: "Low" | "Moderate" | "High";
  vitals: VitalSign[];
  soap: SoapNote;
  diagnoses: Diagnosis[];
  medications: Medication[];
  procedures: ProcedureItem[];
  documents: EvidenceDocument[];
  readinessBreakdown: ReadinessBreakdown[];
  missingEvidence: MissingEvidenceItem[];
  insuranceRules: string[];
  economicSignals: ProcedureItem[];
  insights: Insight[];
  activity: ActivityItem[];
  lockedReason?: string;
  permissionDenied?: boolean;
};
