"use client";

import { useMemo, useState } from "react";
import { defaultClaimDashboardFilters } from "../data/claim-dashboard.mock";
import { getClaimWorklist } from "../services/claim-dashboard-service";
import type { ClaimDashboardFilters, ClaimDashboardState, ClaimKpiFilter, ClaimRiskCategory, ClaimRiskLevel } from "../types/claim-dashboard.types";
import { filterClaimWorklist } from "../utils/claim-dashboard-selectors";

export function useClaimDashboard() {
  const [filters, setFilters] = useState<ClaimDashboardFilters>(defaultClaimDashboardFilters);
  const [search, setSearch] = useState("");
  const [selectedKpi, setSelectedKpi] = useState<ClaimKpiFilter>("all");
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ category: ClaimRiskCategory; severity: ClaimRiskLevel } | null>(null);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [selectedEvidenceCategory, setSelectedEvidenceCategory] = useState("");
  const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date("2026-07-12T14:30:00+07:00"));

  const state: ClaimDashboardState = useMemo(
    () => ({ filters, search, selectedKpi, selectedHeatmapCell, selectedPayer, selectedEvidenceCategory }),
    [filters, search, selectedKpi, selectedHeatmapCell, selectedPayer, selectedEvidenceCategory],
  );
  const allRows = useMemo(() => getClaimWorklist(filters), [filters]);
  const rows = useMemo(() => filterClaimWorklist(allRows, state), [allRows, state]);

  const updateFilter = <K extends keyof ClaimDashboardFilters>(key: K, value: ClaimDashboardFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setSelectedClaimIds(new Set());
  };

  const reset = () => {
    setFilters(defaultClaimDashboardFilters);
    setSearch("");
    setSelectedKpi("all");
    setSelectedHeatmapCell(null);
    setSelectedPayer("");
    setSelectedEvidenceCategory("");
    setSelectedClaimIds(new Set());
  };

  return {
    allRows,
    rows,
    filters,
    search,
    selectedKpi,
    selectedHeatmapCell,
    selectedPayer,
    selectedEvidenceCategory,
    selectedClaimIds,
    lastUpdated,
    updateFilter,
    setSearch,
    setSelectedKpi,
    setSelectedHeatmapCell,
    setSelectedPayer,
    setSelectedEvidenceCategory,
    setSelectedClaimIds,
    setLastUpdated,
    reset,
  };
}
