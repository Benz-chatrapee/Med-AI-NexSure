import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PatientClaimsWorkspace } from "@/features/patient-claims/components/patient-claims-workspace";
import { ClaimIntegrationError } from "@/features/patient-claims/server/claim-integration-errors";
import { claimQueryService } from "@/features/patient-claims/server/claim-query-service";

export const metadata: Metadata = {
  title: "Patient Claims | Med AI NexSure",
  description:
    "Patient claim readiness, missing evidence, payer rules, and audit-ready activity workspace.",
};

type PatientClaimsDashboardData = Awaited<
  ReturnType<typeof claimQueryService.getPatientClaimsDashboard>
>;

export default async function PatientClaimsRoute({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  let data: PatientClaimsDashboardData;

  try {
    data = await claimQueryService.getPatientClaimsDashboard(patientId);
  } catch (error) {
    if (
      error instanceof ClaimIntegrationError &&
      error.code === "patient_not_found"
    ) {
      notFound();
    }

    throw error;
  }

  return <PatientClaimsWorkspace initialData={data} />;
}