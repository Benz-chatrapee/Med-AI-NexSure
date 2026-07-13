"use client";

import { PrescriptionErrorState } from "@/features/prescription/components/prescription-error-state";

export default function Error({ reset }: { reset: () => void }) {
  return <PrescriptionErrorState onRetry={reset} />;
}
