import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessDeniedState, PatientDetailPage } from "@/features/patient-detail/components/patient-detail-page";
import { getPatientDetail } from "@/features/patient-detail/data/patient-detail.mock";
import { patientIdSchema } from "@/features/patient-detail/schemas/patient-detail.schema";

export const metadata: Metadata = {
  title: "Patient Detail | Med AI NexSure",
  description: "Patient 360 intelligence workspace with clinical safety, claim readiness, insurance, documents, consent, and audit context.",
};

export default async function PatientDetailRoute({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const parsedPatientId = patientIdSchema.safeParse(patientId);

  if (!parsedPatientId.success) {
    notFound();
  }

  const data = getPatientDetail(parsedPatientId.data);

  if (!data) {
    notFound();
  }

  if (data.access === "forbidden") {
    return <AccessDeniedState />;
  }

  return <PatientDetailPage data={data} />;
}
