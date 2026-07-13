import type { DocumentCategory, DocumentExpiryBucket, PatientDocument, PatientDocumentFilters, PatientDocumentSummary } from "../types/patient-document.types";
import { categoryLabels } from "../constants/patient-document.constants";

const today = new Date("2026-07-13T00:00:00+07:00");
export function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "No expiry"; }
export function formatFileSize(bytes: number) { const mb = bytes / 1024 / 1024; return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`; }
export function getExpiryBucket(expiryDate?: string): DocumentExpiryBucket {
  if (!expiryDate) return "no_expiry";
  const diffDays = Math.ceil((new Date(expiryDate).getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "within_7_days";
  if (diffDays <= 30) return "within_30_days";
  if (diffDays <= 90) return "within_90_days";
  return "more_than_90_days";
}
export function buildPatientDocumentSummary(documents: PatientDocument[]): PatientDocumentSummary {
  const byStatus = countBy(documents, (document) => document.status);
  const byCategory = countBy(documents, (document) => document.category);
  const byExpiry = countBy(documents, (document) => getExpiryBucket(document.expiryDate));
  const byAi = countBy(documents, (document) => document.aiStatus);
  const byLinkage = countBy(documents, (document) => document.linkage);
  const missingEvidence = [
    { id: "missing-referral", label: "Referral Letter", category: "referral" as DocumentCategory, priority: "critical" as const, impact: "Claim cannot proceed without physician referral evidence.", scoreImpact: 5 },
    { id: "missing-consent", label: "Consent Signature", category: "consent" as DocumentCategory, priority: "high" as const, impact: "PDPA and payer consent review required.", scoreImpact: 4 },
    { id: "missing-card", label: "Insurance Card", category: "insurance" as DocumentCategory, priority: "medium" as const, impact: "Payer validation may be delayed.", scoreImpact: 3 },
  ];
  return {
    totalDocuments: documents.length, categories: Object.keys(byCategory).length, verified: byStatus.verified ?? 0, pendingReview: byStatus.pending_review ?? 0, correctionRequested: byStatus.correction_requested ?? 0, expiringSoon: byStatus.expiring_soon ?? 0, missingRequired: missingEvidence.length, claimLinked: (byLinkage.claim ?? 0) + (byLinkage.evidence_package ?? 0), completenessScore: 78,
    statusDistribution: ["verified", "pending_review", "correction_requested", "expiring_soon"].map((key) => ({ key, label: title(key), value: byStatus[key as keyof typeof byStatus] ?? 0 })),
    categoryDistribution: Object.entries(byCategory).map(([key, value]) => ({ key, label: categoryLabels[key as DocumentCategory], value })),
    expiryDistribution: Object.entries(byExpiry).map(([key, value]) => ({ key, label: expiryLabel(key as DocumentExpiryBucket), value })),
    aiQualityDistribution: Object.entries(byAi).map(([key, value]) => ({ key, label: title(key), value })),
    linkageDistribution: Object.entries(byLinkage).map(([key, value]) => ({ key, label: title(key), value })),
    missingEvidence,
  };
}
export function filterDocuments(documents: PatientDocument[], filters: PatientDocumentFilters) {
  const query = filters.search.trim().toLowerCase();
  return documents.filter((document) => {
    if (filters.status && document.status !== filters.status) return false;
    if (filters.category && document.category !== filters.category) return false;
    if (filters.expiryBucket && getExpiryBucket(document.expiryDate) !== filters.expiryBucket) return false;
    if (filters.linkage && document.linkage !== filters.linkage) return false;
    if (filters.aiStatus && document.aiStatus !== filters.aiStatus) return false;
    return !query || [document.name, document.type, document.documentNumber, document.issuingOrganization, document.uploadedBy].some((value) => value.toLowerCase().includes(query));
  });
}
function countBy<T extends string>(documents: PatientDocument[], getKey: (document: PatientDocument) => T) { return documents.reduce<Partial<Record<T, number>>>((acc, document) => { const key = getKey(document); acc[key] = (acc[key] ?? 0) + 1; return acc; }, {}); }
function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase()); }
function expiryLabel(bucket: DocumentExpiryBucket) { const labels: Record<DocumentExpiryBucket, string> = { expired: "Expired", within_7_days: "Within 7 days", within_30_days: "Within 30 days", within_90_days: "Within 90 days", more_than_90_days: "More than 90 days", no_expiry: "No expiry" }; return labels[bucket]; }
