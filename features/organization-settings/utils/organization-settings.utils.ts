import { SECTION_FIELD_PREFIXES, SETTINGS_SECTIONS, type SettingsSectionId } from "../constants/organization-settings.constants";
import type { OrganizationSettings, PlatformCapability } from "../types/organization-settings.types";

export function formatConfigurationTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export function getChangedSections(dirtyFields: object | boolean | undefined): SettingsSectionId[] {
  if (!dirtyFields || typeof dirtyFields !== "object") return [];
  return SETTINGS_SECTIONS.filter((section) => SECTION_FIELD_PREFIXES[section.id].some((prefix) => Object.prototype.hasOwnProperty.call(dirtyFields, prefix))).map((section) => section.id);
}

export function getFirstInvalidSection(errors: object): SettingsSectionId {
  const keys = Object.keys(errors);
  return SETTINGS_SECTIONS.find((section) => SECTION_FIELD_PREFIXES[section.id].some((prefix) => keys.includes(prefix)))?.id ?? "profile";
}

export function getClaimWeightTotal(settings: OrganizationSettings) {
  return settings.claimReadiness.scoringModel.reduce((sum, item) => sum + Number(item.weight), 0);
}

export function getCapabilityImpact(capability: PlatformCapability, allCapabilities: PlatformCapability[]) {
  const activeDependents = capability.usedBy
    .map((key) => allCapabilities.find((item) => item.key === key))
    .filter((item): item is PlatformCapability => Boolean(item?.enabled));
  return activeDependents;
}
