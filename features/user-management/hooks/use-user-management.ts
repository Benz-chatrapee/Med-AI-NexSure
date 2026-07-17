"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { userManagementService } from "../services/user-management-service";
import type {
  AiAccessStatus,
  AuditMutationResult,
  ClinicUserRole,
  ClinicUserStatus,
  ClinicUsersQuery,
  InviteClinicUserInput,
  SuspendUserInput,
  UpdateAiAccessInput,
} from "../types/user-management.types";

export const clinicUserKeys = {
  all: ["clinic-users"] as const,
  lists: () => [...clinicUserKeys.all, "list"] as const,
  list: (query: ClinicUsersQuery) => [...clinicUserKeys.lists(), query] as const,
  details: () => [...clinicUserKeys.all, "detail"] as const,
  detail: (userId: string) => [...clinicUserKeys.details(), userId] as const,
};

const defaultQuery: ClinicUsersQuery = {
  page: 1,
  pageSize: 12,
};

export function useUserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; tone: "success" | "error" | "info" } | null>(null);

  const usersQuery = useQuery({
    queryKey: clinicUserKeys.list(query),
    queryFn: () => userManagementService.getClinicUsers(query),
  });

  const selectedUserQuery = useQuery({
    queryKey: selectedUserId ? clinicUserKeys.detail(selectedUserId) : clinicUserKeys.details(),
    queryFn: () => (selectedUserId ? userManagementService.getClinicUserById(selectedUserId) : undefined),
    enabled: Boolean(selectedUserId),
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteClinicUserInput) => userManagementService.inviteClinicUser(payload),
    onSuccess: (result) => handleSuccess(result),
    onError: handleError,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: SuspendUserInput }) => userManagementService.suspendClinicUser(userId, payload),
    onSuccess: (result) => handleSuccess(result),
    onError: handleError,
  });

  const aiAccessMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateAiAccessInput }) => userManagementService.updateUserAiAccess(userId, payload),
    onSuccess: (result) => handleSuccess(result),
    onError: handleError,
  });

  const actionMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: "unlock" | "reactivate" | "resend" | "revoke_sessions" }) => {
      if (action === "unlock") return userManagementService.unlockClinicUser(userId);
      if (action === "reactivate") return userManagementService.reactivateClinicUser(userId);
      if (action === "resend") return userManagementService.resendUserInvitation(userId);
      return userManagementService.revokeUserSessions(userId);
    },
    onSuccess: (result) => handleSuccess(result),
    onError: handleError,
  });

  const exportMutation = useMutation({
    mutationFn: () => userManagementService.exportClinicUsers(query),
    onSuccess: (result) => handleSuccess(result),
    onError: handleError,
  });

  function updateQuery(patch: Partial<ClinicUsersQuery>) {
    const next = { ...query, ...patch };
    const params = new URLSearchParams();
    setParam(params, "search", next.search);
    setParam(params, "role", next.role);
    setParam(params, "status", next.status);
    setParam(params, "invitationStatus", next.invitationStatus);
    setParam(params, "departmentId", next.departmentId);
    setParam(params, "aiAccessStatus", next.aiAccessStatus);
    setParam(params, "clinicId", next.clinicId);
    setParam(params, "accessScope", next.accessScope);
    setParam(params, "sort", next.sort);
    if (next.page !== defaultQuery.page) params.set("page", String(next.page));
    if (next.pageSize !== defaultQuery.pageSize) params.set("pageSize", String(next.pageSize));
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  function handleSuccess(result: AuditMutationResult) {
    setToast({ title: `${result.message} - Audit ${result.auditId}`, tone: "success" });
    void queryClient.invalidateQueries({ queryKey: clinicUserKeys.all });
  }

  function handleError(error: Error) {
    setToast({ title: error.message || "Action failed", tone: "error" });
  }

  return {
    query,
    updateQuery,
    clearFilters,
    usersQuery,
    selectedUserId,
    setSelectedUserId,
    selectedUserQuery,
    inviteOpen,
    setInviteOpen,
    inviteMutation,
    suspendMutation,
    aiAccessMutation,
    actionMutation,
    exportMutation,
    toast,
    setToast,
  };
}

function parseQuery(params: URLSearchParams): ClinicUsersQuery {
  return {
    search: params.get("search") || undefined,
    role: parseOption(params.get("role"), ["system_admin", "organization_admin", "clinic_admin", "clinic_manager", "doctor", "nurse", "pharmacist", "clinic_staff", "claim_reviewer", "auditor_compliance", "compliance_officer", "executive"]),
    status: parseOption(params.get("status"), ["active", "invited", "locked", "suspended", "inactive"]),
    invitationStatus: parseOption(params.get("invitationStatus"), ["sent", "expired"]),
    departmentId: params.get("departmentId") || undefined,
    aiAccessStatus: parseOption(params.get("aiAccessStatus"), ["enabled", "restricted", "disabled"]),
    clinicId: params.get("clinicId") || undefined,
    accessScope: parseOption(params.get("accessScope"), ["assigned_department", "assigned_clinic", "cross_clinic_view_only"]),
    sort: parseOption(params.get("sort"), ["name", "recently_updated", "last_login", "status"]),
    page: parsePositiveNumber(params.get("page"), defaultQuery.page),
    pageSize: parsePositiveNumber(params.get("pageSize"), defaultQuery.pageSize),
  };
}

function parseOption<const T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value && allowed.includes(value as T) ? (value as T) : undefined;
}

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function setParam<T extends string>(params: URLSearchParams, key: string, value?: T | string) {
  if (value) params.set(key, value);
}

export type UserManagementWorkspace = ReturnType<typeof useUserManagement>;
export type UserManagementRoleFilter = ClinicUserRole | undefined;
export type UserManagementStatusFilter = ClinicUserStatus | undefined;
export type UserManagementAiFilter = AiAccessStatus | undefined;
