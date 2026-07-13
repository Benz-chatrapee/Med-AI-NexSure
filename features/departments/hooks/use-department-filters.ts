"use client";

import { useState } from "react";
import { initialDepartmentFilters } from "../data/department-dashboard.mock";
import type { DepartmentDashboardFilters, DepartmentType } from "../types/department.types";

export function useDepartmentFilters() {
  const [filters, setFilters] = useState<DepartmentDashboardFilters>(initialDepartmentFilters);
  function updateFilters(patch: Partial<DepartmentDashboardFilters>) {
    setFilters((current) => {
      const next = { ...current, ...patch };
      if (patch.organizationId && patch.organizationId !== current.organizationId) return { ...next, clinicId: "clinic-bangkok", departmentId: "all" };
      if (patch.clinicId && patch.clinicId !== current.clinicId) return { ...next, departmentId: "all" };
      if (patch.departmentType && patch.departmentType !== current.departmentType) return { ...next, departmentId: "all" };
      return next;
    });
  }
  return { filters, updateFilters, resetFilters: () => setFilters(initialDepartmentFilters) };
}

export const departmentTypeOptions: Array<DepartmentType | "all"> = ["all", "clinical", "diagnostic", "operational"];
