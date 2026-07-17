import type { Metadata } from "next";
import { VisitDetailPage } from "@/features/visit-detail/components/visit-detail-page";
import { getVisitDetailMock } from "@/features/visit-detail/data/visit-detail.mock";

export const metadata: Metadata = {
  title: "Visit Detail | Med AI NexSure",
  description:
    "Clinical visit detail workspace with AI decision support and claim readiness intelligence.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const visit = getVisitDetailMock(visitId);

  return <VisitDetailPage visit={visit} />;
}
