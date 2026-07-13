import type { Metadata } from "next";
import { PatientDocumentsWorkspace } from "@/features/patient-documents/components/patient-documents-workspace";
import { getPatientDocumentDashboard } from "@/features/patient-documents/services/patient-document-service";

export const metadata: Metadata = {
  title: "Patient Documents | Med AI NexSure",
  description: "Patient document intelligence dashboard for clinical, insurance and claim evidence workflows.",
};

export default async function PatientDocumentsRoute() {
  const data = await getPatientDocumentDashboard();
  return <PatientDocumentsWorkspace initialData={data} />;
}
