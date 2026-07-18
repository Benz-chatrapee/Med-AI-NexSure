export type SoapDocumentStatus = "Draft" | "Needs Review" | "Signed";

export type AiSuggestionStatus = "Pending Review" | "Accepted" | "Modified" | "Rejected";

export type AlertSeverity = "Critical" | "High" | "Warning" | "Info";

export type ReadinessStatus = "Ready" | "Needs Review" | "Not Ready";

export type SoapSectionKey = "subjective" | "objective" | "assessment" | "plan";

export type SoapSection = {
  key: SoapSectionKey;
  label: string;
  marker: "S" | "O" | "A" | "P";
  helper: string;
  content: string;
  source: "Doctor Confirmed" | "Draft";
};

export type PatientContext = {
  name: string;
  initials: string;
  hn: string;
  sex: string;
  age: number;
  dateOfBirth: string;
  allergies: string[];
  chronicConditions: Array<{ name: string; detail: string; severity: AlertSeverity }>;
  medications: string[];
  insurance: string;
  pdpaConsent: string;
};

export type VisitContext = {
  visitId: string;
  visitNumber: string;
  clinic: string;
  attendingClinician: string;
  visitDateTime: string;
  status: "In Consultation" | "Waiting" | "Completed";
  chiefComplaint: string;
};

export type ClinicalSafetyAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  acknowledged: boolean;
};

export type AiClinicalSuggestion = {
  id: string;
  category: "Summary" | "Differential Diagnosis" | "ICD" | "Clinical Safety" | "Claim Impact" | "Explainability";
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  status: AiSuggestionStatus;
};

export type DiagnosisSuggestion = {
  id: string;
  diagnosis: string;
  icd10: string;
  confidence: number;
  rationale: string;
  status: AiSuggestionStatus;
};

export type ClaimReadinessImpact = {
  score: number;
  status: ReadinessStatus;
  blockers: string[];
  explanation: string;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
};

export type VersionHistoryItem = {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  summary: string;
};

export type SoapClinicalWorkspaceData = {
  patient: PatientContext;
  visit: VisitContext;
  documentStatus: SoapDocumentStatus;
  completeness: number;
  aiConfidence: number;
  clinicalRisk: "Low" | "Moderate" | "High";
  sections: SoapSection[];
  safetyAlerts: ClinicalSafetyAlert[];
  aiSuggestions: AiClinicalSuggestion[];
  differentialDiagnoses: DiagnosisSuggestion[];
  claimReadiness: ClaimReadinessImpact;
  recentActivity: ActivityItem[];
  versionHistory: VersionHistoryItem[];
};

export type SoapFormValues = Record<SoapSectionKey, string>;
