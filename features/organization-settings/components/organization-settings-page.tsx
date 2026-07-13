"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OrganizationSettingsWorkspace } from "./organization-settings-workspace";

export function OrganizationSettingsPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationSettingsWorkspace />
    </QueryClientProvider>
  );
}
