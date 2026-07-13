import { ClinicDashboardPage } from "@/features/clinic-dashboard/components/clinic-dashboard-page";
import { getClinicDashboard } from "@/features/clinic-dashboard/services/clinic-dashboard-service";

export default async function Page() {
  const dashboard = await getClinicDashboard();

  return <ClinicDashboardPage initialData={dashboard} />;
}
