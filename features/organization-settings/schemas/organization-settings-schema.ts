import { z } from "zod";
import { MAX_LOGO_BYTES } from "../constants/organization-settings.constants";
import type { OrganizationSettings } from "../types/organization-settings.types";

const statusSchema = z.enum(["active", "implementation", "suspended"]);
const severitySchema = z.enum(["blocking", "warning", "info"]);
const capabilityKeySchema = z.enum(["ai_clinical_engine", "claim_readiness", "economic_intelligence", "evidence_package", "prescription_safety", "global_search", "audit_compliance_core", "ai_copilot", "icd_suggestion", "payer_rules"]);

const profileSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationCode: z.string().min(1, "Organization code is required"),
  transactionsExist: z.boolean(),
  organizationType: z.enum(["clinic_group", "hospital", "insurer", "enterprise_network"]),
  status: statusSchema,
  registrationNumber: z.string().min(1, "Registration number is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  primaryContact: z.string().min(1, "Primary contact is required"),
  contactEmail: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  logoFileName: z.string(),
  logoMimeType: z.string().refine((value) => !value || ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(value), "Logo must be PNG, JPG, WEBP, or SVG"),
  logoSizeBytes: z.coerce.number().min(0).max(MAX_LOGO_BYTES, "Logo must be 2 MB or smaller"),
  registeredOfficeAddress: z.string().min(1, "Registered office address is required"),
  defaultTimezone: z.string().min(1, "Timezone is required"),
  defaultLanguage: z.enum(["en", "th", "bilingual"]),
  currency: z.enum(["THB", "USD"]),
  dateFormat: z.enum(["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]),
});

export const organizationSettingsSchema = z
  .object({
    metadata: z.object({
      organizationId: z.string(),
      status: statusSchema,
      version: z.coerce.number().int().positive(),
      lastUpdatedAt: z.string().min(1),
      updatedBy: z.string().min(1),
    }),
    organizationProfile: profileSchema,
    dashboard: z.object({
      executiveKpis: z.array(z.object({ key: z.enum(["today_visits", "claim_ready", "ai_assisted_cases", "average_readiness"]), label: z.string(), visible: z.boolean(), comparison: z.enum(["previous_day", "previous_week", "target", "none"]), displayOrder: z.coerce.number().int().min(1) })),
      queueSnapshots: z.array(z.object({ key: z.enum(["waiting", "in_consultation", "pending_evidence", "completed"]), label: z.string(), visible: z.boolean(), attentionThreshold: z.coerce.number().min(0), criticalThreshold: z.coerce.number().min(0) })),
    }),
    aiGovernance: z.object({
      enabled: z.boolean(),
      clinicalSummary: z.boolean(),
      icdRecommendation: z.boolean(),
      differentialDiagnosisInsight: z.boolean(),
      explainabilitySourceContext: z.boolean(),
      mandatoryHumanReview: z.boolean(),
      minimumConfidenceThreshold: z.coerce.number().min(0).max(100),
      approvedModelVersion: z.string().min(1, "Approved model version is required"),
      effectiveDate: z.string().min(1, "Effective date is required"),
      clinicOverridePolicy: z.enum(["not_allowed", "requires_approval", "allowed_with_audit"]),
    }),
    claimReadiness: z.object({
      scoringModel: z.array(z.object({ key: z.enum(["soap_completeness", "diagnosis_icd", "prescription_procedure", "evidence_completeness", "insurance_rule", "economic_review"]), label: z.string(), weight: z.coerce.number().min(0).max(100) })),
      thresholds: z.array(z.object({ key: z.enum(["ready", "needs_review", "not_ready"]), label: z.string(), minimum: z.coerce.number().min(0).max(100), maximum: z.coerce.number().min(0).max(100) })),
      recalculateActiveCases: z.boolean(),
      validationRules: z.array(z.object({ id: z.string(), name: z.string(), severity: severitySchema, scope: z.string() })),
    }),
    economicIntelligence: z.object({
      enabled: z.boolean(),
      expectedCostMinimum: z.coerce.number().min(0),
      expectedCostMaximum: z.coerce.number().min(0),
      benchmarkScope: z.enum(["clinic", "hospital", "payer", "national"]),
      deviationAlertPercent: z.coerce.number().min(0),
      requireJustificationAboveThreshold: z.boolean(),
    }),
    clinicalWorkflow: z.object({ statuses: z.array(z.string()), allowClinicOverride: z.boolean(), requireReasonForBackwardTransition: z.boolean(), allowApprovedAutoTransitionRules: z.boolean() }),
    security: z.object({
      sessionTimeoutMinutes: z.coerce.number().min(5),
      maximumLoginAttempts: z.coerce.number().min(1),
      accountLockoutDurationMinutes: z.coerce.number().min(1),
      passwordMinimumLength: z.coerce.number().min(8),
      requireMfaForPrivilegedRoles: z.boolean(),
      forceLogoutAfterPolicyChange: z.boolean(),
      changeReason: z.string(),
      roleMatrix: z.array(z.object({ role: z.enum(["Organization Admin", "Security Admin", "Compliance Admin", "Auditor"]), settings: z.enum(["none", "view", "edit", "approve", "audit"]), ai: z.enum(["none", "view", "edit", "approve", "audit"]), claim: z.enum(["none", "view", "edit", "approve", "audit"]), security: z.enum(["none", "view", "edit", "approve", "audit"]), audit: z.enum(["none", "view", "edit", "approve", "audit"]) })),
    }),
    notifications: z.object({
      alerts: z.array(z.object({ key: z.enum(["queue_critical", "pending_evidence_sla", "low_confidence_ai", "security_configuration_change"]), label: z.string(), enabled: z.boolean() })),
      defaultChannel: z.enum(["email", "in_app", "sms", "webhook"]),
      digestSchedule: z.enum(["realtime", "hourly", "daily"]),
    }),
    compliance: z.object({
      auditLogRetentionDays: z.coerce.number().min(1),
      clinicalRecordRetentionYears: z.coerce.number().min(1),
      configurationVersionRetention: z.coerce.number().min(1),
      pdpaDataSubjectRequestSlaDays: z.coerce.number().min(1),
      versionHistory: z.array(z.object({ version: z.number(), activatedAt: z.string(), actorName: z.string(), actorRole: z.string(), changeSummary: z.string(), restoreInformation: z.string() })),
    }),
    capabilities: z.object({ items: z.array(z.object({ key: capabilityKeySchema, label: z.string(), enabled: z.boolean(), locked: z.boolean().optional(), dependencies: z.array(z.string()), usedBy: z.array(z.string()) })) }),
  })
  .superRefine((values, ctx) => {
    values.dashboard.queueSnapshots.forEach((queue, index) => {
      if (queue.criticalThreshold < queue.attentionThreshold) ctx.addIssue({ code: "custom", path: ["dashboard", "queueSnapshots", index, "criticalThreshold"], message: "Critical threshold must be greater than or equal to attention threshold." });
    });
    if (!values.aiGovernance.mandatoryHumanReview) ctx.addIssue({ code: "custom", path: ["aiGovernance", "mandatoryHumanReview"], message: "Human review cannot be disabled." });
    const weightTotal = values.claimReadiness.scoringModel.reduce((sum, item) => sum + item.weight, 0);
    if (weightTotal !== 100) ctx.addIssue({ code: "custom", path: ["claimReadiness", "scoringModel"], message: "Claim readiness weights must total exactly 100." });
    const sortedRanges = [...values.claimReadiness.thresholds].sort((a, b) => a.minimum - b.minimum);
    sortedRanges.forEach((range, index) => {
      if (range.minimum > range.maximum) ctx.addIssue({ code: "custom", path: ["claimReadiness", "thresholds", index, "minimum"], message: "Minimum cannot exceed maximum." });
    });
    const continuous = sortedRanges[0]?.minimum === 0 && sortedRanges[sortedRanges.length - 1]?.maximum === 100 && sortedRanges.every((range, index) => index === 0 || range.minimum === sortedRanges[index - 1].maximum + 1);
    if (!continuous) ctx.addIssue({ code: "custom", path: ["claimReadiness", "thresholds"], message: "Readiness ranges must cover 0-100 without gaps or overlaps." });
    if (values.economicIntelligence.expectedCostMinimum >= values.economicIntelligence.expectedCostMaximum) ctx.addIssue({ code: "custom", path: ["economicIntelligence", "expectedCostMaximum"], message: "Expected cost maximum must be greater than minimum." });
    const capabilityMap = new Map(values.capabilities.items.map((item) => [item.key, item]));
    values.capabilities.items.forEach((item, index) => {
      if (!item.enabled && item.locked) ctx.addIssue({ code: "custom", path: ["capabilities", "items", index, "enabled"], message: `${item.label} cannot be disabled.` });
      if (!item.enabled) {
        const activeDependents = item.usedBy.filter((key) => capabilityMap.get(key as never)?.enabled);
        if (activeDependents.length > 0) ctx.addIssue({ code: "custom", path: ["capabilities", "items", index, "enabled"], message: `${item.label} has active dependencies and requires confirmation workflow.` });
      }
    });
  });

export function createOrganizationSettingsDefaults(): OrganizationSettings {
  return {
    metadata: { organizationId: "org-med-ai-nexsure", status: "active", version: 12, lastUpdatedAt: "2026-07-10T15:42:00+07:00", updatedBy: "Dr. Anan Clinical Ops" },
    organizationProfile: { organizationName: "Med AI NexSure Network", organizationCode: "NEXSURE-TH", transactionsExist: true, organizationType: "enterprise_network", status: "active", registrationNumber: "0105566000123", taxId: "0105566000123", primaryContact: "Sirin P.", contactEmail: "ops@med-ai-nexsure.example", phoneNumber: "+66 2 555 0142", logoFileName: "nexsure-logo.svg", logoMimeType: "image/svg+xml", logoSizeBytes: 184000, registeredOfficeAddress: "88 Healthcare Tower, Bangkok, Thailand", defaultTimezone: "Asia/Bangkok", defaultLanguage: "bilingual", currency: "THB", dateFormat: "DD/MM/YYYY" },
    dashboard: { executiveKpis: [{ key: "today_visits", label: "Today Visits", visible: true, comparison: "previous_day", displayOrder: 1 }, { key: "claim_ready", label: "Claim Ready %", visible: true, comparison: "target", displayOrder: 2 }, { key: "ai_assisted_cases", label: "AI Assisted Cases", visible: true, comparison: "previous_week", displayOrder: 3 }, { key: "average_readiness", label: "Average Readiness Score", visible: true, comparison: "target", displayOrder: 4 }], queueSnapshots: [{ key: "waiting", label: "Waiting", visible: true, attentionThreshold: 12, criticalThreshold: 20 }, { key: "in_consultation", label: "In Consultation", visible: true, attentionThreshold: 8, criticalThreshold: 14 }, { key: "pending_evidence", label: "Pending Evidence", visible: true, attentionThreshold: 10, criticalThreshold: 18 }, { key: "completed", label: "Completed", visible: true, attentionThreshold: 30, criticalThreshold: 50 }] },
    aiGovernance: { enabled: true, clinicalSummary: true, icdRecommendation: true, differentialDiagnosisInsight: true, explainabilitySourceContext: true, mandatoryHumanReview: true, minimumConfidenceThreshold: 82, approvedModelVersion: "clinical-governance-v3.4", effectiveDate: "2026-07-10", clinicOverridePolicy: "requires_approval" },
    claimReadiness: { scoringModel: [{ key: "soap_completeness", label: "SOAP Completeness", weight: 25 }, { key: "diagnosis_icd", label: "Diagnosis & ICD", weight: 20 }, { key: "prescription_procedure", label: "Prescription / Procedure", weight: 15 }, { key: "evidence_completeness", label: "Evidence Completeness", weight: 20 }, { key: "insurance_rule", label: "Insurance Rule", weight: 10 }, { key: "economic_review", label: "Economic Review", weight: 10 }], thresholds: [{ key: "not_ready", label: "Not Ready", minimum: 0, maximum: 59 }, { key: "needs_review", label: "Needs Review", minimum: 60, maximum: 84 }, { key: "ready", label: "Ready", minimum: 85, maximum: 100 }], recalculateActiveCases: false, validationRules: [{ id: "missing-soap", name: "Missing SOAP", severity: "blocking", scope: "All Payers" }, { id: "missing-icd", name: "Missing ICD", severity: "blocking", scope: "Insurance Claims" }, { id: "cost-variance", name: "Cost Variance", severity: "warning", scope: "Selected Payers" }] },
    economicIntelligence: { enabled: true, expectedCostMinimum: 500, expectedCostMaximum: 15000, benchmarkScope: "payer", deviationAlertPercent: 18, requireJustificationAboveThreshold: true },
    clinicalWorkflow: { statuses: ["Create Visit", "Waiting", "In Consultation", "Pharmacy", "Completed", "Claim Readiness", "Evidence Package", "Audit Log"], allowClinicOverride: true, requireReasonForBackwardTransition: true, allowApprovedAutoTransitionRules: false },
    security: { sessionTimeoutMinutes: 30, maximumLoginAttempts: 5, accountLockoutDurationMinutes: 15, passwordMinimumLength: 12, requireMfaForPrivilegedRoles: true, forceLogoutAfterPolicyChange: true, changeReason: "", roleMatrix: [{ role: "Organization Admin", settings: "approve", ai: "approve", claim: "approve", security: "view", audit: "audit" }, { role: "Security Admin", settings: "view", ai: "view", claim: "view", security: "approve", audit: "audit" }, { role: "Compliance Admin", settings: "view", ai: "approve", claim: "approve", security: "view", audit: "audit" }, { role: "Auditor", settings: "view", ai: "view", claim: "view", security: "view", audit: "audit" }] },
    notifications: { alerts: [{ key: "queue_critical", label: "Queue Critical Threshold", enabled: true }, { key: "pending_evidence_sla", label: "Pending Evidence SLA", enabled: true }, { key: "low_confidence_ai", label: "Low-confidence AI Output", enabled: true }, { key: "security_configuration_change", label: "Security Configuration Change", enabled: true }], defaultChannel: "in_app", digestSchedule: "daily" },
    compliance: { auditLogRetentionDays: 3650, clinicalRecordRetentionYears: 10, configurationVersionRetention: 24, pdpaDataSubjectRequestSlaDays: 30, versionHistory: [{ version: 12, activatedAt: "2026-07-10T15:42:00+07:00", actorName: "Dr. Anan Clinical Ops", actorRole: "Organization Admin", changeSummary: "Updated AI confidence threshold and queue policy.", restoreInformation: "Current active configuration" }, { version: 11, activatedAt: "2026-06-28T11:20:00+07:00", actorName: "Naree Compliance", actorRole: "Compliance Admin", changeSummary: "Added PDPA SLA and audit retention controls.", restoreInformation: "Can be restored as a new version" }, { version: 10, activatedAt: "2026-06-12T09:10:00+07:00", actorName: "Krit Security", actorRole: "Security Admin", changeSummary: "Enabled MFA for privileged roles.", restoreInformation: "Can be restored as a new version" }] },
    capabilities: { items: [{ key: "ai_clinical_engine", label: "AI Clinical Engine", enabled: true, dependencies: ["ai_copilot", "icd_suggestion"], usedBy: ["ai_copilot", "icd_suggestion"] }, { key: "claim_readiness", label: "Claim Readiness Intelligence", enabled: true, dependencies: ["evidence_package", "payer_rules"], usedBy: [] }, { key: "economic_intelligence", label: "Economic Intelligence", enabled: true, dependencies: [], usedBy: ["claim_readiness"] }, { key: "evidence_package", label: "Evidence Package", enabled: true, dependencies: [], usedBy: ["claim_readiness"] }, { key: "prescription_safety", label: "Prescription Safety", enabled: true, dependencies: [], usedBy: [] }, { key: "global_search", label: "Global Search", enabled: true, dependencies: [], usedBy: [] }, { key: "audit_compliance_core", label: "Audit & Compliance Core", enabled: true, locked: true, dependencies: [], usedBy: ["claim_readiness", "evidence_package", "ai_clinical_engine"] }, { key: "ai_copilot", label: "AI Copilot", enabled: true, dependencies: ["ai_clinical_engine"], usedBy: [] }, { key: "icd_suggestion", label: "ICD Suggestion", enabled: true, dependencies: ["ai_clinical_engine"], usedBy: [] }, { key: "payer_rules", label: "Payer Rules", enabled: true, dependencies: [], usedBy: ["claim_readiness"] }] },
  };
}
