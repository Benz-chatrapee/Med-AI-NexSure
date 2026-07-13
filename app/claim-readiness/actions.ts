"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CreateDocumentationTaskInput } from "@/features/claim-readiness/domain/types";
import { claimReadinessService } from "@/features/claim-readiness/server/service";

export async function createDocumentationTaskAction(formData: FormData) {
  const encounterId = String(formData.get("encounterId") ?? "");

  await claimReadinessService.createDocumentationTask({
    encounterId,
    gapId: String(formData.get("gapId") ?? ""),
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    priority: String(formData.get("priority") ?? ""),
    assignedRole: String(formData.get("assignedRole") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  } as Partial<CreateDocumentationTaskInput>);

  revalidatePath("/claim-readiness");
  revalidatePath(`/claim-readiness/${encounterId}`);
  redirect(`/claim-readiness/${encounterId}`);
}
