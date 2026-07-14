import { VisitTimelinePage } from "@/features/visit-timeline/components/visit-timeline-page";

export default async function Page({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <VisitTimelinePage visitId={visitId} />;
}
