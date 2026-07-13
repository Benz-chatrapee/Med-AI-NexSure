import { findEvidencePackageByVisitId, listEvidencePackageWorklist } from "./mock-repository";

export async function getEvidencePackage(visitId: string) {
  return findEvidencePackageByVisitId(visitId);
}

export async function getEvidencePackageWorklist() {
  return listEvidencePackageWorklist();
}

export async function generateClaimSummary(visitId: string) {
  return { visitId, status: "queued" as const, message: "AI summary generation queued for human review." };
}

export async function previewEvidencePackage(visitId: string) {
  return { visitId, previewPath: `/evidence-package/${visitId}/preview` };
}

export async function exportEvidencePackage(visitId: string) {
  return { visitId, status: "exporting" as const, auditAction: "export_requested" };
}
