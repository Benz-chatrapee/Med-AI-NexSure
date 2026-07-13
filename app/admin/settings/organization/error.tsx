"use client";

import { OrganizationSettingsError } from "@/features/organization-settings/components/organization-settings-workspace";

export default function OrganizationSettingsErrorRoute({ reset }: { reset: () => void }) {
  return <OrganizationSettingsError onRetry={reset} />;
}
