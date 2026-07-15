import { PayerDetailPage } from "@/features/payer-rules/components/payer-detail-page";

export default async function Page({ params }: { params: Promise<{ payerId: string }> }) {
  const { payerId } = await params;

  return <PayerDetailPage payerId={payerId} />;
}
