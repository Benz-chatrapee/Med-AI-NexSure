import type { Metadata } from "next";
import { OrganizationSettingsPage } from "@/features/organization-settings/components/organization-settings-page";

export const metadata: Metadata = {
  title: "Organization Configuration | Med AI NexSure",
  description: "Enterprise organization-wide settings for Med AI NexSure governance.",
};

export default function AdminOrganizationSettingsRoute() {
  return <OrganizationSettingsPage />;
}
