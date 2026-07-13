"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { defaultDoctorDashboardFilters } from "../data/doctor-dashboard.mock";
import type { DoctorDashboardFilters } from "../types/doctor-dashboard.types";
import { filterWorklist } from "../utils/doctor-dashboard.utils";
import type { DoctorWorklistVisit } from "../types/doctor-dashboard.types";

export function useDoctorDashboardFilters(visits: DoctorWorklistVisit[]) {
  const [filters, setFilters] = useState<DoctorDashboardFilters>({
    ...defaultDoctorDashboardFilters,
  });
  const deferredSearch = useDeferredValue(filters.search);
  const effectiveFilters = useMemo(
    () => ({ ...filters, search: deferredSearch }),
    [filters, deferredSearch],
  );
  const filteredVisits = useMemo(
    () => filterWorklist(visits, effectiveFilters),
    [visits, effectiveFilters],
  );

  function updateFilters(patch: Partial<DoctorDashboardFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function clearFilters() {
    setFilters({ ...defaultDoctorDashboardFilters });
  }

  function clearFilter(key: keyof DoctorDashboardFilters) {
    setFilters((current) => ({
      ...current,
      [key]: key === "dateRange" ? "today" : "",
    }));
  }

  return {
    filters,
    effectiveFilters,
    filteredVisits,
    updateFilters,
    clearFilters,
    clearFilter,
  };
}
