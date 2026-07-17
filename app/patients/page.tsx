import type { Metadata } from "next";
import { PatientListPage } from "@/features/patient-list/components/patient-list-page";

export const metadata: Metadata = {
  title: "Patient Management | Med AI NexSure",
  description: "Enterprise patient registry with clinical activity and claim readiness overview.",
};

export default function PatientsPage() {
  return <PatientListPage />;
}
