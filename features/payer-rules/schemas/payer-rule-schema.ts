import { z } from "zod";

export const payerRuleSchema = z
  .object({
    payerName: z.string().min(1, "Payer name is required"),
    payerCode: z.string().min(1, "Payer code is required").regex(/^[A-Z0-9_]+$/, "ใช้ตัวพิมพ์ใหญ่ ตัวเลข และ underscore เท่านั้น"),
    status: z.enum(["active", "needs_review", "draft", "simulation", "inactive"]),
    ruleSetName: z.string().min(1, "Rule set is required"),
    effectiveDate: z.string().min(1, "Effective date is required"),
    governanceOwner: z.string().min(1, "Governance owner is required"),
    description: z.string(),
    evidenceRules: z.array(z.object({ key: z.enum(["soap_note", "diagnosis", "icd10", "icd9_procedure", "prescription", "medical_certificate", "attachments", "claim_summary", "cost_justification"]), label: z.string(), enabled: z.boolean(), requirement: z.enum(["required", "required_if", "recommended", "optional"]), condition: z.string(), readinessImpact: z.coerce.number().min(0).max(30) })),
    icdRules: z.object({ requireIcd10: z.boolean(), requireIcd9ForProcedures: z.boolean(), missingIcdAction: z.enum(["block", "warn"]), diagnosisIcdConsistency: z.boolean(), highRiskGroups: z.array(z.string()), excludedGroups: z.array(z.string()), humanReview: z.boolean() }),
    coverageRules: z.object({ defaultStatus: z.enum(["likely_covered", "need_review", "not_covered"]), waitingPeriodSimulation: z.boolean(), benefitLimit: z.coerce.number().min(0), exclusions: z.array(z.string()), requiredEvidence: z.array(z.string()), humanReview: z.boolean() }),
    costRules: z.object({ expectedMinimum: z.coerce.number().min(0, "Minimum must be >= 0"), expectedMaximum: z.coerce.number(), alertThreshold: z.coerce.number(), blockThreshold: z.coerce.number(), justificationThreshold: z.coerce.number(), currency: z.enum(["THB", "USD"]) }),
    riskRules: z.array(z.object({ key: z.string(), label: z.string(), enabled: z.boolean(), riskLevel: z.enum(["low", "medium", "high", "critical"]), resultingStatus: z.enum(["ready", "needs_review", "not_ready", "pending_evidence"]), humanReview: z.boolean() })),
    advancedNotes: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.evidenceRules.filter((rule) => ["soap_note", "diagnosis", "icd10"].includes(rule.key)).every((rule) => !rule.enabled)) ctx.addIssue({ code: "custom", path: ["evidenceRules"], message: "SOAP, Diagnosis, and ICD-10 cannot all be disabled." });
    const highRisk = new Set(values.icdRules.highRiskGroups.map((group) => group.toUpperCase()));
    const overlap = values.icdRules.excludedGroups.find((group) => highRisk.has(group.toUpperCase()));
    if (overlap) ctx.addIssue({ code: "custom", path: ["icdRules", "excludedGroups"], message: "High-risk and excluded ICD groups must not overlap." });
    if (values.icdRules.missingIcdAction === "block" && !values.icdRules.requireIcd10) ctx.addIssue({ code: "custom", path: ["icdRules", "requireIcd10"], message: "Require ICD-10 must be enabled when missing ICD is blocked." });
    const cost = values.costRules;
    if (cost.expectedMaximum <= cost.expectedMinimum) ctx.addIssue({ code: "custom", path: ["costRules", "expectedMaximum"], message: "Maximum must be greater than minimum." });
    if (cost.alertThreshold < cost.expectedMinimum) ctx.addIssue({ code: "custom", path: ["costRules", "alertThreshold"], message: "Alert must be >= minimum." });
    if (cost.blockThreshold <= cost.alertThreshold) ctx.addIssue({ code: "custom", path: ["costRules", "blockThreshold"], message: "Block must be greater than alert." });
    if (cost.justificationThreshold > cost.blockThreshold) ctx.addIssue({ code: "custom", path: ["costRules", "justificationThreshold"], message: "Justification must be <= block." });
    values.riskRules.forEach((rule, index) => {
      if (rule.enabled && rule.riskLevel === "critical" && !rule.humanReview) ctx.addIssue({ code: "custom", path: ["riskRules", index, "humanReview"], message: "Critical rules must require human review." });
    });
  });
