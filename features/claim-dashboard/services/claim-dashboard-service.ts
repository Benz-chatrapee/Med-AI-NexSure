import { claimWorklistMock } from "../data/claim-dashboard.mock";
import type { ClaimDashboardFilters, ClaimWorklistItem } from "../types/claim-dashboard.types";

export interface AssignClaimReviewerPayload {
  claimIds: string[];
  reviewer: "Arisa K." | "Narin P." | "Chalida S.";
  reason: string;
}

export function getClaimWorklist(filters: ClaimDashboardFilters): ClaimWorklistItem[] {
  void filters;
  return claimWorklistMock;
}

export function assignClaimReviewer(payload: AssignClaimReviewerPayload) {
  return {
    updatedClaimIds: payload.claimIds,
    reviewer: payload.reviewer,
  };
}

export function createEvidenceTasks(claimIds: string[]) {
  return { claimIds };
}

export function recalculateClaims(claimIds: string[]) {
  return { claimIds };
}

export function exportClaims(claimIds: string[]) {
  return { claimIds };
}
