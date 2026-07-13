import { DoctorDashboardPage } from "@/features/doctor-dashboard/components/doctor-dashboard-page";
import { doctorDashboardMock } from "@/features/doctor-dashboard/data/doctor-dashboard.mock";

export default function Dashboard() {
  return <DoctorDashboardPage initialData={doctorDashboardMock} />;
}
