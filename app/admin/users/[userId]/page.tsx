import { UserDetailPage } from "@/features/user-management/components/user-detail-page";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <UserDetailPage userId={userId} />;
}
