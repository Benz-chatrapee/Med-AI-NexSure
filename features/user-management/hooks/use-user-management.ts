"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { userManagementService } from "../services/user-management-service";
import type { UserFilters } from "../types/user-management.types";

const defaultFilters: UserFilters = {
  search: "",
  status: "all",
  role: "all",
  departmentId: "all",
  clinicId: "all",
  aiAccess: "all",
  highPrivilege: "all",
  consentRequired: "all",
  sortBy: "displayName",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
};

export function useUserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const permissionsQuery = useQuery({ queryKey: ["user-management", "permissions"], queryFn: userManagementService.getCurrentUserPermissions });
  const summaryQuery = useQuery({ queryKey: ["user-management", "summary"], queryFn: userManagementService.getUserSummary });
  const usersQuery = useQuery({ queryKey: ["user-management", "users", filters], queryFn: () => userManagementService.getUsers(filters) });
  const alertsQuery = useQuery({ queryKey: ["user-management", "alerts"], queryFn: userManagementService.getGovernanceAlerts });
  const activityQuery = useQuery({ queryKey: ["user-management", "activity"], queryFn: userManagementService.getRecentActivity });
  const selectedUserQuery = useQuery({ queryKey: ["user-management", "detail", selectedUserId], queryFn: () => (selectedUserId ? userManagementService.getUserById(selectedUserId) : undefined), enabled: Boolean(selectedUserId) });
  const sensitiveActionMutation = useMutation({
    mutationFn: ({ action, reason }: { action: string; reason: string }) => userManagementService.recordSensitiveAction(action, reason),
    onSuccess: (result) => {
      setActionMessage(`Audit recorded: ${result.auditId}`);
      void queryClient.invalidateQueries({ queryKey: ["user-management", "activity"] });
    },
    onError: (error) => setActionMessage(error instanceof Error ? error.message : "Action failed"),
  });

  function updateFilters(patch: Partial<UserFilters>) {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof UserFilters)[]).forEach((key) => {
      if (String(next[key]) !== String(defaultFilters[key])) params.set(key, String(next[key]));
    });
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return {
    filters,
    updateFilters,
    clearFilters: () => router.replace(pathname, { scroll: false }),
    selectedUserId,
    setSelectedUserId,
    selectedUserQuery,
    inviteOpen,
    setInviteOpen,
    actionMessage,
    permissionsQuery,
    summaryQuery,
    usersQuery,
    alertsQuery,
    activityQuery,
    sensitiveActionMutation,
  };
}

function parseFilters(params: URLSearchParams): UserFilters {
  return {
    ...defaultFilters,
    search: params.get("search") ?? "",
    status: parseOption(params.get("status"), ["all", "active", "pending", "locked", "disabled", "expired"], "all"),
    role: params.get("role") ?? "all",
    departmentId: params.get("departmentId") ?? "all",
    clinicId: params.get("clinicId") ?? "all",
    aiAccess: parseOption(params.get("aiAccess"), ["all", "enabled", "restricted", "not_allowed"], "all"),
    highPrivilege: parseOption(params.get("highPrivilege"), ["all", "true"], "all"),
    consentRequired: parseOption(params.get("consentRequired"), ["all", "true"], "all"),
    sortBy: parseOption(params.get("sortBy"), ["displayName", "role", "department", "status", "lastLoginAt"], "displayName"),
    sortOrder: parseOption(params.get("sortOrder"), ["asc", "desc"], "asc"),
    page: Number(params.get("page") ?? 1),
    pageSize: Number(params.get("pageSize") ?? 10),
  };
}

function parseOption<const T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}
