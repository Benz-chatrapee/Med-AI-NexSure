import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientClaimsWorkspace } from "@/features/patient-claims/components/patient-claims-workspace";
import { getPatientClaimsDashboard } from "@/features/patient-claims/services/patient-claims-service";

export const metadata: Metadata = {
  title: "Patient Claims | Med AI NexSure",
  description: "Patient claim readiness, missing evidence, payer rules, and audit-ready activity workspace.",
};

export default async function PatientClaimsRoute({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const data = await getPatientClaimsDashboard(patientId);

  if (!data.patient.id) {
    notFound();
  }

  return <PatientClaimsWorkspace initialData={data} />;
}
