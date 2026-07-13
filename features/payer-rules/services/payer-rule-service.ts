import { affectedCases, aiRecommendation, auditEvents, impactMetrics, payers, ruleDetails, ruleSets, versionHistory } from "../mock/payer-rule-mock-data";
import type { AffectedCase, ImpactMetric, PayerRuleFormValues, SimulationResult } from "../types/payer-rule-types";

const pause = () => new Promise((resolve) => setTimeout(resolve, 180));

export async function getPayers() {
  await pause();
  return payers;
}

export async function getRuleSets(payerId: string) {
  await pause();
  return ruleSets.filter((ruleSet) => ruleSet.payerId === payerId);
}

export async function getRuleSet(ruleSetId: string) {
  await pause();
  return ruleDetails.find((ruleSet) => ruleSet.id === ruleSetId) ?? ruleDetails[0];
}

export async function updateRuleSet(values: PayerRuleFormValues) {
  await pause();
  return { ok: true, savedAt: new Date().toISOString(), values };
}

export async function cloneRuleSet(ruleSetId: string) {
  await pause();
  return { ok: true, clonedRuleSetId: `${ruleSetId}-clone` };
}

export async function getImpactPreview(values: PayerRuleFormValues): Promise<ImpactMetric[]> {
  await pause();
  const activeEvidence = values.evidenceRules.filter((rule) => rule.enabled).length;
  const readinessLift = Math.max(0, activeEvidence - 6);
  return impactMetrics.map((metric) => ({ ...metric, after: metric.key === "average_readiness" ? metric.after + readinessLift : metric.after }));
}

export async function getAiRecommendation() {
  await pause();
  return aiRecommendation;
}

export async function getAffectedCases(filter: string): Promise<AffectedCase[]> {
  await pause();
  if (filter === "pending_evidence") return affectedCases.filter((item) => item.missingEvidence.length > 0);
  if (filter === "high_risk") return affectedCases.filter((item) => item.risk === "high" || item.risk === "critical");
  if (filter === "cost_alert") return affectedCases.filter((item) => item.costStatus !== "normal");
  return affectedCases;
}

export async function getVersionHistory() {
  await pause();
  return versionHistory;
}

export async function getAuditEvents() {
  await pause();
  return auditEvents;
}

export async function runSimulation(caseId: string, visitId: string): Promise<SimulationResult> {
  await pause();
  const selectedCase = affectedCases.find((item) => item.id === caseId) ?? affectedCases[1];
  return {
    status: "completed",
    caseId,
    visitId,
    passedRules: ["SOAP Note", "Diagnosis", "Coverage Evidence"],
    failedRules: selectedCase.ruleFailures,
    readinessScore: selectedCase.readinessScore,
    coverage: selectedCase.coverage,
    risk: selectedCase.risk,
    missingEvidence: selectedCase.missingEvidence,
    costImpact: selectedCase.costStatus === "normal" ? "Within configured threshold" : "Cost governance review required",
    humanReviewRequired: selectedCase.risk !== "low" || selectedCase.status !== "ready",
  };
}

export async function importRule() { await pause(); return { ok: true }; }
export async function exportRule() { await pause(); return { ok: true, phiStatus: "masked" as const }; }
export async function requestApproval() { await pause(); return { ok: true, status: "pending_approval" as const }; }
export async function activateRule() { await pause(); return { ok: true, status: "active" as const }; }
