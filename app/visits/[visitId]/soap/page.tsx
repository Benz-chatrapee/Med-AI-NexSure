import { notFound } from "next/navigation";

import { SoapClinicalWorkspace } from "@/features/soap-ai-clinical/components";
import { getSoapClinicalWorkspace } from "@/features/soap-ai-clinical/services/soap.service";

export default async function VisitSoapPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const data = await getSoapClinicalWorkspace(visitId);

  if (!data) {
    notFound();
  }

  return <SoapClinicalWorkspace data={data} />;
}
