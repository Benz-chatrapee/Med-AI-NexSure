import { createOrganizationSettingsDefaults, organizationSettingsSchema } from "../schemas/organization-settings-schema";
import type { OrganizationSettings, RestoreOrganizationSettingsPayload, UpdateOrganizationSettingsPayload } from "../types/organization-settings.types";

let currentSettings: OrganizationSettings = createOrganizationSettingsDefaults();

function cloneSettings(settings: OrganizationSettings): OrganizationSettings {
  return structuredClone(settings);
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

export async function getOrganizationSettings(organizationId: string): Promise<OrganizationSettings> {
  await wait();
  if (organizationId !== currentSettings.metadata.organizationId) throw new Error("Organization not found.");
  return cloneSettings(currentSettings);
}

export async function updateOrganizationSettings(organizationId: string, payload: UpdateOrganizationSettingsPayload): Promise<OrganizationSettings> {
  await wait();
  if (organizationId !== currentSettings.metadata.organizationId) throw new Error("Organization not found.");
  if (payload.expectedVersion !== currentSettings.metadata.version) throw new Error("Configuration version conflict. Reload the latest version before saving.");
  if (!payload.changeReason.trim()) throw new Error("Change reason is required.");

  const parsed = organizationSettingsSchema.safeParse(payload.settings);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Validation failed.");

  currentSettings = {
    ...parsed.data,
    metadata: {
      ...parsed.data.metadata,
      version: currentSettings.metadata.version + 1,
      lastUpdatedAt: new Date().toISOString(),
      updatedBy: "Organization Admin",
    },
    compliance: {
      ...parsed.data.compliance,
      versionHistory: [
        {
          version: currentSettings.metadata.version + 1,
          activatedAt: new Date().toISOString(),
          actorName: "Organization Admin",
          actorRole: "Organization Admin",
          changeSummary: payload.changeReason,
          restoreInformation: "Current active configuration",
        },
        ...parsed.data.compliance.versionHistory.map((version) => ({
          ...version,
          restoreInformation: version.version === parsed.data.metadata.version ? "Can be restored as a new version" : version.restoreInformation,
        })),
      ],
    },
  };
  return cloneSettings(currentSettings);
}

export async function restoreOrganizationConfiguration(organizationId: string, payload: RestoreOrganizationSettingsPayload): Promise<OrganizationSettings> {
  await wait();
  if (organizationId !== currentSettings.metadata.organizationId) throw new Error("Organization not found.");
  if (payload.expectedVersion !== currentSettings.metadata.version) throw new Error("Configuration version conflict. Reload the latest version before restoring.");
  if (!payload.changeReason.trim()) throw new Error("Change reason is required.");

  currentSettings = {
    ...currentSettings,
    metadata: {
      ...currentSettings.metadata,
      version: currentSettings.metadata.version + 1,
      lastUpdatedAt: new Date().toISOString(),
      updatedBy: "Organization Admin",
    },
    compliance: {
      ...currentSettings.compliance,
      versionHistory: [
        {
          version: currentSettings.metadata.version + 1,
          activatedAt: new Date().toISOString(),
          actorName: "Organization Admin",
          actorRole: "Organization Admin",
          changeSummary: `Restored from v${payload.sourceVersion}: ${payload.changeReason}`,
          restoreInformation: "Current active configuration",
        },
        ...currentSettings.compliance.versionHistory,
      ],
    },
  };
  return cloneSettings(currentSettings);
}

export async function getOrganizationConfigurationHistory(organizationId: string) {
  const settings = await getOrganizationSettings(organizationId);
  return settings.compliance.versionHistory;
}
