"use client";

import { VisitDetailErrorState } from "@/features/visit-detail/components/visit-detail-states";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <VisitDetailErrorState onRetry={reset} />;
}
