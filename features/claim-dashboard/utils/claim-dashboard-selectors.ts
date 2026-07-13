import type { ClaimDashboardState, ClaimWorklistItem } from "../types/claim-dashboard.types";

export function filterClaimWorklist(items: ClaimWorklistItem[], state: ClaimDashboardState) {
  const query = state.search.trim().toLowerCase();

  return items.filter((item) => {
    const searchable = [
      item.id,
      item.visitId,
      item.patientName,
      item.maskedHn,
      item.payer,
      item.icd10 ?? "",
      ...item.missingEvidence,
    ]
      .join(" ")
      .toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.filters.clinic && item.clinic !== state.filters.clinic) return false;
    if (state.filters.payer && item.payer !== state.filters.payer) return false;
    if (state.filters.claimType && item.claimType !== state.filters.claimType) return false;
    if (state.filters.reviewer && (item.assignee ?? "Unassigned") !== state.filters.reviewer) return false;
    if (state.filters.readiness && item.readiness !== state.filters.readiness) return false;
    if (state.filters.risk && item.risk !== state.filters.risk) return false;
    if (state.filters.sla && item.slaStatus !== state.filters.sla) return false;
    if (state.selectedPayer && item.payer !== state.selectedPayer) return false;
    if (state.selectedEvidenceCategory && !item.missingEvidence.some((evidence) => evidence.toLowerCase().includes(state.selectedEvidenceCategory.toLowerCase()))) return false;
    if (state.selectedHeatmapCell && (item.risk !== state.selectedHeatmapCell.severity || item.riskCategory !== state.selectedHeatmapCell.category)) return false;
    if (state.selectedKpi === "ready" && item.readiness !== "READY") return false;
    if (state.selectedKpi === "evidence" && item.missingEvidenceCount <= 0) return false;
    if ((state.selectedKpi === "value" || state.selectedKpi === "risk") && !["HIGH", "CRITICAL"].includes(item.risk)) return false;

    return true;
  });
}
