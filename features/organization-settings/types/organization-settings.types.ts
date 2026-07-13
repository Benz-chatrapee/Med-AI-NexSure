export type OrganizationRole = "organization_admin" | "security_admin" | "compliance_admin" | "auditor" | "executive";
export type OrganizationStatus = "active" | "implementation" | "suspended";
export type OrganizationType = "clinic_group" | "hospital" | "insurer" | "enterprise_network";
export type Severity = "blocking" | "warning" | "info";
export type PermissionLevel = "none" | "view" | "edit" | "approve" | "audit";
export type NotificationChannel = "email" | "in_app" | "sms" | "webhook";
export type DigestSchedule = "realtime" | "hourly" | "daily";

export type ConfigurationMetadata = {
  organizationId: string;
  status: OrganizationStatus;
  version: number;
  lastUpdatedAt: string;
  updatedBy: string;
};

export type OrganizationProfileSettings = {
  organizationName: string;
  organizationCode: string;
  transactionsExist: boolean;
  organizationType: OrganizationType;
  status: OrganizationStatus;
  registrationNumber: string;
  taxId: string;
  primaryContact: string;
  contactEmail: string;
  phoneNumber: string;
  logoFileName: string;
  logoMimeType: string;
  logoSizeBytes: number;
  registeredOfficeAddress: string;
  defaultTimezone: string;
  defaultLanguage: "en" | "th" | "bilingual";
  currency: "THB" | "USD";
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY";
};

export type KpiSetting = {
  key: "today_visits" | "claim_ready" | "ai_assisted_cases" | "average_readiness";
  label: string;
  visible: boolean;
  comparison: "previous_day" | "previous_week" | "target" | "none";
  displayOrder: number;
};

export type QueueSnapshotSetting = {
  key: "waiting" | "in_consultation" | "pending_evidence" | "completed";
  label: string;
  visible: boolean;
  attentionThreshold: number;
  criticalThreshold: number;
};

export type DashboardSettings = {
  executiveKpis: KpiSetting[];
  queueSnapshots: QueueSnapshotSetting[];
};

export type AiGovernanceSettings = {
  enabled: boolean;
  clinicalSummary: boolean;
  icdRecommendation: boolean;
  differentialDiagnosisInsight: boolean;
  explainabilitySourceContext: boolean;
  mandatoryHumanReview: boolean;
  minimumConfidenceThreshold: number;
  approvedModelVersion: string;
  effectiveDate: string;
  clinicOverridePolicy: "not_allowed" | "requires_approval" | "allowed_with_audit";
};

export type ClaimWeight = {
  key: "soap_completeness" | "diagnosis_icd" | "prescription_procedure" | "evidence_completeness" | "insurance_rule" | "economic_review";
  label: string;
  weight: number;
};

export type ReadinessThreshold = {
  key: "ready" | "needs_review" | "not_ready";
  label: string;
  minimum: number;
  maximum: number;
};

export type ClaimValidationRule = {
  id: string;
  name: string;
  severity: Severity;
  scope: string;
};

export type ClaimReadinessSettings = {
  scoringModel: ClaimWeight[];
  thresholds: ReadinessThreshold[];
  recalculateActiveCases: boolean;
  validationRules: ClaimValidationRule[];
};

export type EconomicIntelligenceSettings = {
  enabled: boolean;
  expectedCostMinimum: number;
  expectedCostMaximum: number;
  benchmarkScope: "clinic" | "hospital" | "payer" | "national";
  deviationAlertPercent: number;
  requireJustificationAboveThreshold: boolean;
};

export type ClinicalWorkflowSettings = {
  statuses: string[];
  allowClinicOverride: boolean;
  requireReasonForBackwardTransition: boolean;
  allowApprovedAutoTransitionRules: boolean;
};

export type RolePermissionRow = {
  role: "Organization Admin" | "Security Admin" | "Compliance Admin" | "Auditor";
  settings: PermissionLevel;
  ai: PermissionLevel;
  claim: PermissionLevel;
  security: PermissionLevel;
  audit: PermissionLevel;
};

export type SecuritySettings = {
  sessionTimeoutMinutes: number;
  maximumLoginAttempts: number;
  accountLockoutDurationMinutes: number;
  passwordMinimumLength: number;
  requireMfaForPrivilegedRoles: boolean;
  forceLogoutAfterPolicyChange: boolean;
  changeReason: string;
  roleMatrix: RolePermissionRow[];
};

export type NotificationAlert = {
  key: "queue_critical" | "pending_evidence_sla" | "low_confidence_ai" | "security_configuration_change";
  label: string;
  enabled: boolean;
};

export type NotificationSettings = {
  alerts: NotificationAlert[];
  defaultChannel: NotificationChannel;
  digestSchedule: DigestSchedule;
};

export type ConfigurationVersion = {
  version: number;
  activatedAt: string;
  actorName: string;
  actorRole: string;
  changeSummary: string;
  restoreInformation: string;
};

export type ComplianceSettings = {
  auditLogRetentionDays: number;
  clinicalRecordRetentionYears: number;
  configurationVersionRetention: number;
  pdpaDataSubjectRequestSlaDays: number;
  versionHistory: ConfigurationVersion[];
};

export type PlatformCapability = {
  key: "ai_clinical_engine" | "claim_readiness" | "economic_intelligence" | "evidence_package" | "prescription_safety" | "global_search" | "audit_compliance_core" | "ai_copilot" | "icd_suggestion" | "payer_rules";
  label: string;
  enabled: boolean;
  locked?: boolean;
  dependencies: string[];
  usedBy: string[];
};

export type PlatformCapabilitySettings = {
  items: PlatformCapability[];
};

export type OrganizationSettings = {
  metadata: ConfigurationMetadata;
  organizationProfile: OrganizationProfileSettings;
  dashboard: DashboardSettings;
  aiGovernance: AiGovernanceSettings;
  claimReadiness: ClaimReadinessSettings;
  economicIntelligence: EconomicIntelligenceSettings;
  clinicalWorkflow: ClinicalWorkflowSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  compliance: ComplianceSettings;
  capabilities: PlatformCapabilitySettings;
};

export type UpdateOrganizationSettingsPayload = {
  settings: OrganizationSettings;
  changeReason: string;
  expectedVersion: number;
};

export type RestoreOrganizationSettingsPayload = {
  sourceVersion: number;
  changeReason: string;
  expectedVersion: number;
};
