import type { Metadata } from "next";
import { VisitTimelinePage } from "@/features/visit-timeline/components/visit-timeline-page";

export const metadata: Metadata = {
  title: "Visit Detail | Med AI NexSure",
  description: "Visit detail timeline for clinical and claim workflow review.",
};

export default async function VisitDetailPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <VisitTimelinePage visitId={visitId} />;
}
