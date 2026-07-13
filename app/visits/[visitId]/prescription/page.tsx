import { PrescriptionPage } from "@/features/prescription/prescription-page";

export default async function Page({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <PrescriptionPage visitId={visitId} />;
}
