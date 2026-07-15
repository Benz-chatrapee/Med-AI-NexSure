import { UserDetailWorkspace } from "./user-detail-workspace";

interface UserDetailPageProps {
  userId: string;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  return <UserDetailWorkspace userId={userId} />;
}
