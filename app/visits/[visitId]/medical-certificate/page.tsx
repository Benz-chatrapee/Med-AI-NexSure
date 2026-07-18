import { getMedicalCertificateWorkspace } from "@/features/medical-certificate/data";
import { MedicalCertificatePage } from "@/features/medical-certificate/medical-certificate-page";

export default async function VisitMedicalCertificatePage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const workspace = getMedicalCertificateWorkspace(visitId);

  return <MedicalCertificatePage workspace={workspace} />;
}
