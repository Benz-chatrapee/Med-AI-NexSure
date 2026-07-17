import type { Metadata } from "next";
import { VisitListPage } from "@/features/visit-list/visit-list-page";

export const metadata: Metadata = {
  title: "Visit Management | Med AI NexSure",
  description: "Visit worklist with clinical progress, AI assistance, claim readiness, and risk prioritization.",
};

export default function VisitsPage() {
  return <VisitListPage />;
}
