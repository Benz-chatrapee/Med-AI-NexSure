import { ChangePasswordWorkspace } from "@/features/user-management/components/change-password-workspace";

interface ChangePasswordPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ChangePasswordPage({ params }: ChangePasswordPageProps) {
  const { userId } = await params;
  return <ChangePasswordWorkspace userId={userId} />;
}
