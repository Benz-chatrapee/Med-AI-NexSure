"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { departmentService } from "../services/department-service";
import type { ClaimReadinessStatus, CostStatus, Department, DepartmentCaseWorklistParams, DepartmentDashboardFilters, DepartmentListParams, DepartmentStatus, DepartmentType, QueueStatus, SlaStatus } from "../types/department.types";

export const departmentKeys = {
  all: ["departments"] as const,
  dashboard: (filters: DepartmentDashboardFilters) => [...departmentKeys.all, "dashboard", filters] as const,
  list: (params: DepartmentListParams) => [...departmentKeys.all, "list", params] as const,
  worklist: (params: DepartmentCaseWorklistParams) => [...departmentKeys.all, "worklist", params] as const,
};

export interface DirectoryQuery {
  search: string; status: DepartmentStatus | "all"; type: DepartmentType | "all"; view: "table" | "cards"; page: number; pageSize: number; sortBy: keyof Department; sortDirection: "asc" | "desc";
}
export interface WorklistQuery {
  search: string; readiness: ClaimReadinessStatus | "all"; queue: QueueStatus | "all"; costStatus: CostStatus | "all"; evidenceIssue: string | "all"; slaStatus: SlaStatus | "all"; aiAssisted: boolean | "all"; costBucket: string | "all"; page: number; pageSize: number;
}

const defaultDirectory: DirectoryQuery = { search: "", status: "all", type: "all", view: "table", page: 1, pageSize: 8, sortBy: "name", sortDirection: "asc" };
const defaultWorklist: WorklistQuery = { search: "", readiness: "all", queue: "all", costStatus: "all", evidenceIssue: "all", slaStatus: "all", aiAssisted: "all", costBucket: "all", page: 1, pageSize: 8 };

export function useDepartmentDashboard(filters: DepartmentDashboardFilters) {
  const queryClient = useQueryClient();
  const [directory, setDirectory] = useState<DirectoryQuery>(defaultDirectory);
  const [worklist, setWorklist] = useState<WorklistQuery>(defaultWorklist);
  const [rankingMetric, setRankingMetric] = useState<keyof Department>("claimReadyPercentage");
  const [rankingDirection, setRankingDirection] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

  const dashboardQuery = useQuery({ queryKey: departmentKeys.dashboard(filters), queryFn: () => departmentService.getDashboard(filters) });
  const listParams: DepartmentListParams = { filters, search: directory.search, status: directory.status, type: directory.type, sortBy: directory.sortBy, sortDirection: directory.sortDirection, page: directory.page, pageSize: directory.pageSize };
  const worklistParams: DepartmentCaseWorklistParams = { filters, ...worklist };
  const departmentsQuery = useQuery({ queryKey: departmentKeys.list(listParams), queryFn: () => departmentService.getDepartments(listParams) });
  const worklistQuery = useQuery({ queryKey: departmentKeys.worklist(worklistParams), queryFn: () => departmentService.getCaseWorklist(worklistParams) });

  const createMutation = useMutation({
    mutationFn: departmentService.createDepartment,
    onSuccess: () => {
      setToast({ message: "Department created. Backend must persist audit log before production use.", tone: "success" });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });
  const lifecycleMutation = useMutation({
    mutationFn: departmentService.transitionClinicLifecycle,
    onSuccess: (result) => {
      setToast({ message: result.message, tone: "success" });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });
  const exportMutation = useMutation({
    mutationFn: () => departmentService.exportDepartments(filters),
    onSuccess: (blob) => {
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `department-operational-intelligence-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(href);
      setToast({ message: "Export generated for authorized data scope.", tone: "success" });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  return {
    dashboardQuery, departmentsQuery, worklistQuery, directory, setDirectory, worklist, setWorklist,
    rankingMetric, setRankingMetric, rankingDirection, setRankingDirection,
    createMutation, lifecycleMutation, exportMutation, toast, setToast,
    resetLocalState: () => { setDirectory(defaultDirectory); setWorklist(defaultWorklist); setRankingMetric("claimReadyPercentage"); setRankingDirection("desc"); },
  };
}
