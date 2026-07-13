"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PrescriptionErrorState } from "./components/prescription-error-state";
import { PrescriptionPageSkeleton } from "./components/prescription-page-skeleton";
import { PrescriptionWorkspace } from "./components/prescription-workspace";
import { usePrescription } from "./hooks/use-prescription";

export function PrescriptionPage({ visitId }: { visitId: string }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PrescriptionPageContent visitId={visitId} />
    </QueryClientProvider>
  );
}

function PrescriptionPageContent({ visitId }: { visitId: string }) {
  const prescription = usePrescription(visitId);

  if (prescription.isLoading) return <PrescriptionPageSkeleton />;
  if (prescription.isError || !prescription.data) return <PrescriptionErrorState onRetry={() => void prescription.refetch()} />;

  return <PrescriptionWorkspace prescription={prescription.data} />;
}
