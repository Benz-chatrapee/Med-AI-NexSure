import { AuditDetailPage } from "@/components/features/audit-detail/audit-detail-page";

export default async function AdminAuditDetail({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;

  return <AuditDetailPage auditId={auditId} />;
}
