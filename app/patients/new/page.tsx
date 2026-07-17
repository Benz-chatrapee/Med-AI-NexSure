import type { Metadata } from "next";
import { AddPatientPage } from "@/features/add-patient/components/add-patient-page";

export const metadata: Metadata = {
  title: "Add Patient | Med AI NexSure",
  description: "Register a new patient with clinical safety, insurance, and PDPA consent checks.",
};

export default function NewPatientPage() {
  return <AddPatientPage />;
}
