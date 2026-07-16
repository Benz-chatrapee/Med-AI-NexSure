import { notFound } from "next/navigation";
import { getTaskDetail } from "@/features/task-center/detail-data";
import { TaskDetailPage } from "@/features/task-center/components/detail/task-detail-page";

type PageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { taskId } = await params;
  const detail = getTaskDetail(taskId);

  if (!detail) {
    notFound();
  }

  return <TaskDetailPage detail={detail} />;
}
