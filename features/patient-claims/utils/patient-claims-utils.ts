import type { ClaimStatus, PatientClaim, PatientClaimsFilters, PatientClaimsPage, PatientClaimsPagination } from "../types/patient-claims.types";
import { readinessThresholds } from "../constants/patient-claims.constants";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function filterPatientClaims(claims: PatientClaim[], filters: PatientClaimsFilters): PatientClaim[] {
  const query = filters.query.trim().toLowerCase();

  return claims.filter((claim) => {
    const queryText = [
      claim.claimNumber,
      claim.visitNumber,
      claim.diagnosisName,
      claim.icdCode,
      claim.payerName,
      claim.planName,
      claim.department,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query.length === 0 || queryText.includes(query);
    const matchesStatus = filters.status === "all" || claim.claimStatus === filters.status;
    const matchesRisk = filters.risk === "all" || claim.riskLevel === filters.risk;
    const matchesPayer = filters.payer === "all" || claim.payerName === filters.payer;
    const matchesDateFrom = !filters.dateFrom || claim.serviceDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || claim.serviceDate <= filters.dateTo;

    return matchesQuery && matchesStatus && matchesRisk && matchesPayer && matchesDateFrom && matchesDateTo;
  });
}

export function paginatePatientClaims<T>(items: T[], pagination: PatientClaimsPagination): PatientClaimsPage<T> {
  const pageSize = Math.max(1, pagination.pageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, pagination.page), pageCount);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const rangeStart = items.length === 0 ? 0 : start + 1;
  const rangeEnd = start + pageItems.length;

  return {
    items: pageItems,
    total: items.length,
    page,
    pageSize,
    pageCount,
    rangeLabel: items.length === 0 ? "Showing 0 claims" : `Showing ${rangeStart}-${rangeEnd} of ${items.length} claims`,
  };
}

export function formatClaimCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactClaimCurrency(value: number): string {
  if (value >= 1000) {
    return `฿${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }

  return formatClaimCurrency(value);
}

export function formatClaimDate(value?: string): string {
  if (!value) return "-";
  return dateFormatter.format(new Date(`${value}T00:00:00+07:00`));
}

export function getReadinessStatus(score: number): "ready" | "needs_review" | "not_ready" {
  if (score >= readinessThresholds.ready) return "ready";
  if (score >= readinessThresholds.needsReview) return "needs_review";
  return "not_ready";
}

export function maskPolicyNumber(policyNumber: string): string {
  if (policyNumber.length <= 4) return policyNumber;
  return `•••• ${policyNumber.slice(-4)}`;
}

export function claimStatusForKpi(id: string): ClaimStatus | "all" {
  if (id === "approved") return "approved";
  if (id === "pending") return "pending";
  if (id === "not_ready") return "not_ready";
  if (id === "submitted") return "submitted";
  return "all";
}
