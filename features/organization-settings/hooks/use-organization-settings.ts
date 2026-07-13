"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { EDITOR_ROLES, ORGANIZATION_ID } from "../constants/organization-settings.constants";
import { createOrganizationSettingsDefaults, organizationSettingsSchema } from "../schemas/organization-settings-schema";
import { getOrganizationSettings, restoreOrganizationConfiguration, updateOrganizationSettings } from "../services/organization-settings-service";
import type { OrganizationRole, OrganizationSettings } from "../types/organization-settings.types";

export function useOrganizationSettings() {
  const [role, setRole] = useState<OrganizationRole>("organization_admin");
  const [activeSection, setActiveSection] = useState("profile");
  const [message, setMessage] = useState<string | null>(null);
  const canEdit = EDITOR_ROLES.includes(role);

  const settingsQuery = useQuery({ queryKey: ["organization-settings", ORGANIZATION_ID], queryFn: () => getOrganizationSettings(ORGANIZATION_ID) });
  const form = useForm<OrganizationSettings, unknown, OrganizationSettings>({
    resolver: zodResolver(organizationSettingsSchema) as unknown as Resolver<OrganizationSettings, unknown, OrganizationSettings>,
    defaultValues: createOrganizationSettingsDefaults(),
    values: settingsQuery.data,
    mode: "onChange",
  });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!form.formState.isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [form.formState.isDirty]);

  const updateMutation = useMutation({
    mutationFn: ({ settings, changeReason }: { settings: OrganizationSettings; changeReason: string }) =>
      updateOrganizationSettings(ORGANIZATION_ID, { settings, changeReason, expectedVersion: settingsQuery.data?.metadata.version ?? settings.metadata.version }),
    onSuccess: (result) => {
      form.reset(result);
      setMessage("Configuration saved. A new audited version was created.");
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to save configuration."),
  });

  const restoreMutation = useMutation({
    mutationFn: ({ sourceVersion, changeReason }: { sourceVersion: number; changeReason: string }) =>
      restoreOrganizationConfiguration(ORGANIZATION_ID, { sourceVersion, changeReason, expectedVersion: settingsQuery.data?.metadata.version ?? 0 }),
    onSuccess: (result) => {
      form.reset(result);
      setMessage("Prior configuration restored as a new version.");
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to restore configuration."),
  });

  const permissions = useMemo(
    () => ({
      role,
      canEdit,
      readOnlyReason: canEdit ? null : "This role has read-only access. Server-side authorization must enforce the same boundary.",
    }),
    [canEdit, role],
  );

  return {
    activeSection,
    canEdit,
    form,
    message,
    permissions,
    restoreMutation,
    role,
    setActiveSection,
    setMessage,
    setRole,
    settingsQuery,
    updateMutation,
    values: values as OrganizationSettings,
  };
}
